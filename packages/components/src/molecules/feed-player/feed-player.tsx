"use client";
import { VideoPlayer } from "@genuin/ui/components/video-player";
import {
  lazy,
  memo,
  Suspense,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ComponentProps,
} from "react";
import { useBaseContext } from "@genuin/components/context/base";
import { audioManager } from "@genuin/components/lib/audio-manager";
import { usePlayerContext } from "./context/context";
import { useAnalytics, VideoTypes } from "@genuin/components/context/analytics";
import { cn } from "@genuin/ui/lib/utils";
import { BrandType } from "@genuin/components/lib/utils/brand-layout";
import { useEmbedConfigs } from "@genuin/components/hooks/embed/use-embed-config";
import { useSafeEmbedContext } from "@genuin/components/context/embed/context";
import type { AdTagObjectType } from "@genuin/components/react-query/api/feed/schema";
import { buildGenAdConfigFromAdTagObject } from "./gen-ad-container";
import type { GenAdConfig } from "./gen-ad-container";
import { useUrlParams } from "@genuin/components/context";

const GenAdContainer = lazy(() =>
  import("./gen-ad-container/gen-ad-container.js").then((m) => ({
    default: m.GenAdContainer,
  })),
);

type FeedPlayerProps = Omit<
  ComponentProps<typeof VideoPlayer>,
  "volume" | "playbackSpeed" | "shouldPlay"
> & {
  /**
   * The id of the video to passed to analytics.
   */
  videoId: string;
  /**
   * Descritption to pass to analytics.
   */
  videoDescription?: string | null;
  /**
   * Defines the layout style for the embed, used to identify and apply the corresponding brand layout.
   */
  layoutType?: "responsiveness" | BrandType;
  /**
   * Index is needed so passing it.
   */
  index?: number;
  /**
   * Configuration for the GenAd waterfall ad system. When provided, a GenAd ad overlay will be
   * managed by this component when `isActive` becomes true.
   */
  adConfig?: GenAdConfig;
  /**
   * Ad tag configuration from the feed API response. When provided (and adConfig is not),
   * it is mapped to GenAdConfig. Its video_ad field is also used as a fallback for adUrl.
   */
  adTagObject?: AdTagObjectType | null;
  /**
   * Whether this player is the currently visible/active one. Used to gate ad initialization.
   */
  isActive?: boolean;
  /**
   * The size of the player, used for analytics and ad configuration.
   */
  playerSize?: { height: number; width: number };
  /**
   * Called when the GenAd fill state changes (true = ad is showing, false = no ad / ad failed).
   */
  onAdStateChange?: (isFilled: boolean) => void;
  onAdFilled?: (type: string) => void;
  onAdFilldEnd?: () => void;
  videoType?: VideoTypes;
  adsPlatform?: string | null;
  isSponsored?: boolean;
};

/**
 * This is feed player, However this player is used for embed as well, so don't confuse it as it is only used in feed.
 */
export const FeedPlayer = memo(function FeedPlayer({
  src,
  videoId,
  adUrl,
  poster,
  className,
  layoutType,
  videoDescription,
  index,
  adConfig,
  adTagObject,
  isActive,
  videoType,
  adsPlatform,
  isSponsored,
  playerSize,
  onAdStateChange,
  onOpenPlayerReady,
  onTimeUpdate,
  onEnded,
  onPlay,
  onPause,
  onLoadStart,
  onAdFilldEnd,
  onAdFilled,
  ...props
}: FeedPlayerProps) {
  // adUrl = undefined;
  const { muted, volume, playbackSpeed, baseContextManager } = useBaseContext();
  const embedDetails = useSafeEmbedContext();
  const {
    feedPlayerShouldPlay,
    setVideoTimeState,
    setPlayingState,
    setPlayerRef,
    pauseBySystem,
    mute,
    unmute,
    handleEnded: stateHandleEnded,
    updateAdInfo,
    totalVideos,
    positionIndex,
    setIsLoading,
    showExpandView,
    moveToNextVideo,
  } = usePlayerContext();
  const { track, EventName } = useAnalytics();
  const id = useId();
  const playerRef = useRef<HTMLVideoElement>(null);
  const [isAdFilled, setIsAdFilled] = useState(false);
  const [waterfallFailed, setWaterfallFailed] = useState(false);
  const {
    video,
    useWindowSwiperMode,
    view: { playerShouldPauseOnNotAllowed },
  } = useEmbedConfigs();

  const { appendParamsToUrl, setPlayerSize } = useUrlParams();
  // adUrl =
  //   "https://gov.aniview.com/api/adserver/vmap/srv/?AV_HEIGHT=[DEVICE_HEIGHT]&p_height=[HEIGHT]&p_width=[WIDTH]&AV_PLACEMENT=1&AV_CONNECTIONTYPE=[DEVICE_CONNECTIONTYPE]&AV_IFA_TYPE=[IFA_TYPE]&AV_CHANNELID=698caa862051b1279703d98d&AV_CONTENT_URL=https://shorts.usmagazine.com/video/bestselling-mascara?community=214f3e23b8000d42&loop=214f3ea3b5801400&postroll=1&AV_PLCMT=1&AV_LATITUDE=[LOCATION_LAT]&AV_LMT=[LIMITED_AD_TRACKING]&preroll=1&AV_URL=https://shorts.usmagazine.com/video/bestselling-mascara?community=214f3e23b8000d42&loop=214f3ea3b5801400&AV_WIDTH=[DEVICE_WIDTH]&AV_RTB_DEVICE_TYPE=[DEVICE_TYPE]&AV_REGION=[REGION]&AV_MODEL=[DEVICE_MODEL]&AV_MAKE=[DEVICE_MAKE]&AV_LANGUAGE=[DEVICE_LANGUAGE]&AV_PUBLISHERID=6970e651e6f83878f3085364&cb=1774522459934970488&AV_IP=[IP]&AV_LONGITUDE=[LOCATION_LON]&AV_GDPR=[GDPR]&AV_DOMAIN=[DOMAIN]&AV_CONTENT_ID=56901c92-8a4e-4d27-a2c0-5acb5cfda65a&AV_USERAGENT=[UA]&AV_CONSENT=[GDPRCONSENT]&AV_OS=[OS]&AV_OSVERS=[OS_VERSION]&AV_DNT=[DNT]&midroll_times=00:00:08&AV_TIMESTAMP=1774522459934970818";

  // TODO: this is temporary code for qa-testing, need to remove once qa is done.
  adUrl = useMemo(() => {
    const dataAdUrl = embedDetails?.rootElement?.getAttribute("data-ad-url");
    // This function call sets player size before appending params to url,
    // Do not add it into dep array of useMemo, otherwise it will cause changes in adUrl which will load ad again.
    if (playerSize) setPlayerSize(playerSize);

    if (dataAdUrl) {
      return appendParamsToUrl(dataAdUrl);
    }

    if (adUrl) {
      return appendParamsToUrl(adUrl);
    }
  }, [adUrl, adTagObject]);

  const resolvedAdConfig = useMemo(() => {
    // This function call sets player size before appending params to url,
    // Do not add it into dep array of useMemo, otherwise it will cause changes in adUrl which will load ad again.
    if (playerSize) setPlayerSize(playerSize);
    if (adTagObject?.video_ad?.ads_url) {
      adTagObject.video_ad.ads_url = appendParamsToUrl(
        adTagObject.video_ad.ads_url,
      );
    }
    return adTagObject
      ? buildGenAdConfigFromAdTagObject(adTagObject, videoId)
      : undefined;
  }, [adConfig, adTagObject, videoId]);

  // When adTagObject/adConfig is present, suppress adUrl from VideoPlayer unless
  // the GenAd waterfall has failed (in which case fall back to adUrl for IMA).
  const videoPlayerAdUrl = useMemo(() => {
    return resolvedAdConfig && !waterfallFailed
      ? undefined
      : adUrl
        ? appendParamsToUrl(adUrl)
        : undefined;
  }, [resolvedAdConfig, waterfallFailed]);

  useEffect(() => {
    baseContextManager.registerVideo({
      videoId,
    });

    return () => {
      baseContextManager.unregisterVideo(videoId);
    };
  }, [baseContextManager]);

  useEffect(() => {
    // this is the key line — fire unmute when this player unmutes
    if (!muted) {
      audioManager.notifyPlaying(id);
      //  unmute(false);
    }
  }, [muted]);

  // DRY: Common analytics event data (memoized)
  const analyticsEventData = useMemo(() => {
    return {
      content_category: "loop",
      content_id: videoId,
      event_record_screen: "feed",
      event_target_screen: "none",
      total_videos: totalVideos,
      position_index: positionIndex,
      autoplay: video.videoAutoplay,
      title: videoDescription,
      video_id: videoId,
      video_url: src,
      video_type: videoType ?? VideoTypes.Content,
      ...(isSponsored && { ad_type: "sponsored_post" }),
    };
  }, [videoId, totalVideos, src, isSponsored]);

  // DRY: Common ad analytics event data (memoized)
  const adAnalyticsData = useMemo(
    () => ({
      video_id: videoId,
      ad_source: adsPlatform,
      ad_type: "in_stream",
      video_type: videoType,
    }),
    [videoId, adsPlatform, videoType],
  );

  // Track when video comes into view using IntersectionObserver
  useEffect(() => {
    if (!playerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            track(EventName.VIDEO_INVIEW, analyticsEventData);
            observer.disconnect();
          }
        });
      },
      {
        threshold: 0.5,
      },
    );

    observer.observe(playerRef.current);

    return () => {
      observer.disconnect();
    };
  }, [videoId, analyticsEventData]);

  const handleMutedChange = useCallback(
    (isMuted: boolean) => {
      if (isMuted) {
        mute(false);
      } else {
        unmute(false);
        audioManager.notifyPlaying(id);
      }
    },
    [mute, unmute, id],
  );

  const handleTimeUpdate = useCallback(
    (event: any) => {
      onTimeUpdate?.(event);
      const target = event.target as HTMLVideoElement;
      if (!target) return;
      setVideoTimeState({
        duration: target.duration,
        currentTime: target.currentTime,
      });
      baseContextManager.setTimeInfo({
        duration: target.duration,
        currentTime: target.currentTime,
        videoId,
      });
    },
    [baseContextManager],
  );

  const handleEnded = useCallback(
    (e: any) => {
      onEnded?.({ target: e?.target });
      stateHandleEnded?.();
      const target = e?.target as HTMLVideoElement | undefined;
      track(EventName.VIDEO_COMPLETED, {
        ...analyticsEventData,
        video_length: target?.duration,
        video_view_length: target?.currentTime,
      });
    },
    [onEnded, stateHandleEnded, track, EventName, analyticsEventData],
  );

  const handlePlayerLoad = useCallback(
    (player: any) => {
      if (feedPlayerShouldPlay) {
        player.play();
        baseContextManager.setVideoWatched({ videoId, isWatched: false });
      }
      setPlayingState("READY");
    },
    [feedPlayerShouldPlay, id, baseContextManager, videoId],
  );

  const handleVideoFirstQuartile = useCallback(
    (duration: number, currentTime: number) => {
      track(EventName.VIDEO_FIRST_QUARTILE, {
        ...analyticsEventData,
        video_length: duration,
        video_view_length: currentTime,
      });
    },
    [track, EventName, analyticsEventData],
  );

  const handleVideoWatched = useCallback(
    (duration: number, currentTime: number) => {
      track(EventName.VIDEO_WATCHED, {
        ...analyticsEventData,
        video_length: duration,
        video_view_length: currentTime,
      });
    },
    [track, EventName, analyticsEventData],
  );

  const handleVideoMidpoint = useCallback(
    (duration: number, currentTime: number) => {
      track(EventName.VIDEO_MIDPOINT, {
        ...analyticsEventData,
        video_length: duration,
        video_view_length: currentTime,
      });
    },
    [track, EventName, analyticsEventData],
  );

  const handleVideoThirdQuartile = useCallback(
    (duration: number, currentTime: number) => {
      track(EventName.VIDEO_THIRD_QUARTILE, {
        ...analyticsEventData,
        video_length: duration,
        video_view_length: currentTime,
      });
    },
    [track, EventName, analyticsEventData],
  );

  const handleOpenPlayerReady = useCallback(
    (player: any) => {
      onOpenPlayerReady?.(player);
      setPlayerRef(player);
    },
    [onOpenPlayerReady, setPlayerRef],
  );

  const handleOnPlay = useCallback(
    (event: any) => {
      onPlay?.(event);
      setPlayingState("PLAYING");
      if (
        index !== undefined &&
        !baseContextManager.checkIfVideoPreviewActive({ index })
      ) {
        baseContextManager.setPlayPauseTracker({ isPlaying: true });
      }
      baseContextManager.setVideoWatched({ isWatched: false, videoId });
    },
    [onPlay, setPlayingState, baseContextManager, videoId],
  );

  const handleOnPause = useCallback(
    (event: any) => {
      onPause?.(event);
      setPlayingState("PAUSED");
    },
    [onPause, setPlayingState],
  );
  const handleVideoStart = useCallback(
    (duration: number, currentTime: number, latency: number) => {
      track(EventName.VIDEO_STARTED, {
        ...analyticsEventData,
        video_length: duration,
        video_view_length: currentTime,
        latency: latency,
      });
    },
    [track, EventName.VIDEO_STARTED, analyticsEventData],
  );

  const buildAdEventData = useCallback(
    (event: any) => ({
      ad_id: event?.adId,
      cta_url: event?.url,
      cta_name: event?.title,
      ad_source: adsPlatform,
      ad_format: event?.adFormat,
      advertiser_brand_id: event?.advertiserBrandId,
      campaign_id: event?.campaignId,
      line_item_id: event?.lineItemId,
      creative_id: event?.creativeId,
      media_type: event?.mediaType,
    }),
    [adsPlatform],
  );

  const handleAdStarted = useCallback(
    (event: any) => {
      track(EventName.AD_STARTED, {
        ...adAnalyticsData,
        ...buildAdEventData(event),
      });
      track(EventName.AD_MEDIA_PLAY, {
        ...buildAdEventData(event),
        video_id: videoId,
        cta_url: event?.url,
        cta_name: event?.title,
        video_type: videoType,
      });
      // Handle ad started event if needed
      updateAdInfo(true, event);
    },
    [updateAdInfo, track, adAnalyticsData, buildAdEventData, videoId],
  );

  const handleAdCompleted = useCallback(
    (event: any) => {
      track(EventName.AD_COMPLETED, {
        ...adAnalyticsData,
        ...buildAdEventData(event),
      });
      // Handle ad ended event if needed
      updateAdInfo(false, event);
    },
    [updateAdInfo, track, adAnalyticsData, buildAdEventData],
  );

  const handleAdSkipped = useCallback(
    (event: any) => {
      // Handle ad skipped event if needed
      updateAdInfo(false, event);
      track(EventName.AD_SKIPPED, {
        ...adAnalyticsData,
        ...buildAdEventData(event),
        video_id: videoId,
      });
    },
    [updateAdInfo, track, adAnalyticsData, buildAdEventData, videoId],
  );

  const handleAdError = useCallback(
    (error: any) => {
      console.error("Ad error for videoId:", videoId, "Error:", error);
      // Update ad info to reflect error state
      updateAdInfo(false, error);
    },
    [updateAdInfo],
  );

  const handleAdClicked = useCallback(
    (event: any) => {
      // Handle ad clicked event if needed
      track(EventName.AD_CTA_CLICKED, {
        ...adAnalyticsData,
        ...buildAdEventData(event),
      });
    },
    [track, adAnalyticsData, buildAdEventData],
  );

  // Handle video load start - set playing state to LOADING
  const handleVideoLoadStart = useCallback(() => {
    setIsLoading(true);
  }, [setIsLoading]);

  // Handle video load end - playing state will be updated by onPlay/onPause handlers
  const handleVideoLoadEnd = useCallback(() => {
    setIsLoading(false);
  }, [setIsLoading]);

  const handleAdPaused = useCallback(
    (event: any) => {
      track(EventName.AD_PAUSED, {
        ...adAnalyticsData,
        ...buildAdEventData(event),
      });
    },
    [track, adAnalyticsData, buildAdEventData],
  );

  const handleOnAdRequested = useCallback(() => {
    track(EventName.AD_REQUESTED, { ...adAnalyticsData });
  }, [track, adAnalyticsData]);

  const handleOnAdRenderError = useCallback(
    (_error: any) => {
      track(EventName.AD_RENDER_FAILED, { ...adAnalyticsData });
    },
    [track, adAnalyticsData],
  );

  const handleOnAdRequestFailed = useCallback(
    (error: any) => {
      console.error("Ad request failed for videoId:", videoId, "Error:", error);
      // We could track ad request failures here with a custom event when needed
      track(EventName.AD_REQUEST_FAILED, { ...adAnalyticsData });
    },
    [track, adAnalyticsData],
  );

  const handleOnAdFirstQuartile = useCallback(
    (event: any) => {
      track(EventName.AD_MEDIA_QUARTILE, {
        ...adAnalyticsData,
        ...buildAdEventData(event),
      });
    },
    [track, adAnalyticsData, buildAdEventData],
  );

  const handleAdImpression = useCallback(
    (event: any) => {
      track(EventName.AD_IMPRESSION, {
        ...adAnalyticsData,
        ...buildAdEventData(event),
      });
    },
    [track, adAnalyticsData, buildAdEventData],
  );

  const handleAdRendered = useCallback(
    (event: any) => {
      track(EventName.AD_RENDERED, {
        ...adAnalyticsData,
        ...buildAdEventData(event),
        video_id: videoId,
      });
    },
    [track, adAnalyticsData, buildAdEventData, videoId],
  );

  const handleAdResponseReceived = useCallback(() => {
    track(EventName.AD_RESPONSE_RECEIVED, { ...adAnalyticsData });
  }, [track, adAnalyticsData]);

  useEffect(() => {
    const videoElement = playerRef.current;
    if (!videoElement) return;

    const handleBrowserRestrictionPause = () => {
      pauseBySystem();
    };

    videoElement.addEventListener(
      "videoPausedByBrowserRestriction",
      handleBrowserRestrictionPause,
    );

    return () => {
      videoElement.removeEventListener(
        "videoPausedByBrowserRestriction",
        handleBrowserRestrictionPause,
      );
    };
  }, [pauseBySystem]);

  // If the videoid is registered already start it with that start tiime.
  const startTime = useMemo(
    () => baseContextManager.getTimeInfo(videoId).currentTime,
    [baseContextManager],
  );

  // This onClick handler prevents the expanded view from opening when ads are present.
  return (
    <div onClick={(e) => e.stopPropagation()}>
      {resolvedAdConfig && (
        <Suspense fallback={null}>
          <GenAdContainer
            config={resolvedAdConfig}
            isActive={isActive ?? false}
            isVisible={isAdFilled}
            moveToNextVideo={moveToNextVideo}
            videoId={videoId}
            videoType={videoType}
            onAdFilled={(provider) => {
              setIsAdFilled(true);
              onAdStateChange?.(true);
              onAdFilled?.(provider);
            }}
            onAdFillFailed={() => {
              setIsAdFilled(false);
              setWaterfallFailed(true);
              onAdStateChange?.(false);
            }}
            onAdCompleted={() => {
              onAdFilldEnd?.();
            }}
          />
        </Suspense>
      )}
      {!isAdFilled && (
        <VideoPlayer
          ref={playerRef}
          poster={poster}
          muted={muted}
          adUrl={videoPlayerAdUrl}
          adPlatform={adsPlatform}
          isInFeed={!!resolvedAdConfig}
          // adUrl="https://pubads.g.doubleclick.net/gampad/ads?iu=/21775744923/external/vmap_ad_samples&sz=640x480&cust_params=sample_ar%3Dpostonly&ciu_szs=300x250&gdfp_req=1&ad_rule=1&output=vmap&unviewed_position_start=1&env=vp&correlator="
          src={src}
          startTime={startTime}
          playsInline
          enableLazyLoading={useWindowSwiperMode}
          className={cn(
            "gencl:m-auto",
            resolvedAdConfig &&
              isAdFilled &&
              "gencl:opacity-0 gencl:pointer-events-none",
            className,
          )}
          volume={volume}
          play={feedPlayerShouldPlay}
          playbackSpeed={playbackSpeed?.speed}
          isInExpandView={showExpandView}
          playerShouldPauseOnNotAllowed={playerShouldPauseOnNotAllowed}
          onPlayerLoad={handlePlayerLoad}
          onOpenPlayerReady={handleOpenPlayerReady}
          onPlay={handleOnPlay}
          onPause={handleOnPause}
          onEnded={handleEnded}
          onTimeUpdate={handleTimeUpdate}
          onVideoFirstQuartile={handleVideoFirstQuartile}
          onVideoMidpoint={handleVideoMidpoint}
          onVideoThirdQuartile={handleVideoThirdQuartile}
          onVideoWatched={handleVideoWatched}
          onVideoStart={handleVideoStart}
          onAdStarted={handleAdStarted}
          onAdCompleted={handleAdCompleted}
          onAdSkipped={handleAdSkipped}
          onAdError={handleAdError}
          onAdClicked={handleAdClicked}
          onMutedChange={handleMutedChange}
          onVideoLoadStart={handleVideoLoadStart}
          onVideoLoadEnd={handleVideoLoadEnd}
          onAdPause={handleAdPaused}
          onAdRequested={handleOnAdRequested}
          onAdFirstQuartile={handleOnAdFirstQuartile}
          onAdImpression={handleAdImpression}
          onAdRendered={handleAdRendered}
          onAdResponseReceived={handleAdResponseReceived}
          onAdRenderError={handleOnAdRenderError}
          onAdRequestFailed={handleOnAdRequestFailed}
          {...props}
        />
      )}
    </div>
  );
});
