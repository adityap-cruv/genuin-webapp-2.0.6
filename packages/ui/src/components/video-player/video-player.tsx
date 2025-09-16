"use client";
import OpenPlayerJS from "openplayerjs";
import type { ComponentProps } from "react";
import {
  memo,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

import { cn, encodeVideoSourceUrl } from "@genuin/ui/lib/utils";

const hlsConfigs = {
  // debug: true,
  /**
   * Let the player decide the best quality level dynamically.
   */
  startLevel: 1,
  /**
   * Use worker threads for decoding for better performance.
   */
  enableWorker: true,
  /**
   * Enable Encrypted Media Extensions (EME) if DRM is required.
   */
  emeEnabled: true,
  /**
   * Low latency mode for quicker playback start and adaptation.
   */
  lowLatencyMode: true,
  // /**
  //  * Buffer settings tuned for 1-second fragments.
  //  */
  // maxBufferLength: 6, // Buffer up to 6 seconds (can be adjusted based on use case).
  // maxBufferSize: 20 * 1000 * 1000, // Maximum buffer size in bytes (e.g., 20MB).
  // backBufferLength: 15, // Retain up to 15 seconds of back-buffer for seamless rewinding.
  /**
   * Adjust buffer settings for 2-second fragments.
   */
  maxBufferLength: 10, // Buffer up to 6 fragments (12 seconds).
  maxBufferSize: 40 * 1000 * 1000, // Maximum buffer size in bytes (e.g., 40MB).
  backBufferLength: 30, // Retain 30 seconds for seamless rewind.
  /**
   * Optimize for quicker fragment loading and adaptation.
   */
  fragLoadingTimeOut: 10000, // Timeout in milliseconds for loading fragments.
  startFragPrefetch: true, // Prefetch the next fragment to minimize stutters.
  /**
   * Ensure codec compatibility for adaptive VP9 playback.
   */
  overrideCodec: (codec: string) => codec.includes("vp09"),
  /**
   * Optimize bitrate switching by limiting to player size.
   */
  capLevelToPlayerSize: true,
  /**
   * Handle live playback smoothly for low-latency streams.
   */
  liveSyncDuration: 2.5, // Keep live playback latency low.
  liveMaxLatencyDuration: 6, // Maximum latency allowed for live streams.
  /**
   * Fallback handling for errors during playback.
   */
  // recoverDecodingError: true, // Recover from decoding errors dynamically.
  // recoverFragLoadError: true, // Attempt to reload fragments on failure.
};

export type PlayerProps = ComponentProps<"video"> & {
  volume?: number;
  playbackSpeed?: number;
  play?: boolean;
  adUrl?: string; // URL for video ads
  onOpenPlayerReady?: (player: OpenPlayerJS) => void;
  onPlayerLoad?: (player: OpenPlayerJS | null) => void; // Add custom event prop
  onVideoFirstQuartile?: (duration: number, currentTime: number) => void;
  onVideoMidpoint?: (duration: number, currentTime: number) => void;
  onVideoThirdQuartile?: (duration: number, currentTime: number) => void;
  onVideoWatched?: (duration: number, currentTime: number) => void;
  onAdStarted?: (adData: AdDataType) => void; // Callback when ad starts
  onAdCompleted?: (adData: AdDataType) => void; // Callback when ad completes
  onAdError?: (error: any) => void; // Callback when ad errors
  onAdClicked?: (adData: AdDataType) => void; // Callback when ad is clicked
  onAdSkipped?: (adData: AdDataType) => void; // Callback when ad is skipped
  onAllAdsCompleted?: () => void; // Callback when all ads are completed
  onVideoStart?: (
    duration: number,
    currentTime: number,
    latency: number
  ) => void; // Add onVideoStart prop
  onMutedChange?: (muted: boolean) => void;
};

type VideoPlayerStateRef = {
  firstQuartileFired: boolean;
  midpointFired: boolean;
  thirdQuartileFired: boolean;
  videoWatchedFired: boolean;
  videoStartFired: boolean;
  shouldPlay: boolean;
};

type AdDataType = {
  adId: string | null;
  url: string | null;
  title: string | null;
  totalAds?: number;
  currentAdIndex?: number;
};

export const VideoPlayer = memo(function VideoPlayer({
  src,
  poster,
  className,
  style,
  ref,
  playsInline = true,
  volume = 100,
  playbackSpeed = 1,
  play = true,
  loop = false, // loop prop is now destructured
  adUrl,
  onVideoFirstQuartile,
  onOpenPlayerReady,
  onPlayerLoad, // Destructure new prop
  onVideoMidpoint,
  onVideoThirdQuartile,
  onVideoWatched,
  onVideoStart, // Destructure onVideoStart prop
  onAdStarted,
  onAdCompleted,
  onAdError,
  onAdClicked,
  onAdSkipped,
  onAllAdsCompleted,
  onSeeked,
  onMutedChange,
  ...props
}: PlayerProps) {
  const internalVideoRef = useRef<HTMLVideoElement>(null);
  useImperativeHandle(ref, () => internalVideoRef.current as HTMLVideoElement, [
    internalVideoRef.current,
  ]);
  const videoRef = internalVideoRef;
  const playerRef = useRef<OpenPlayerJS | null>(null);
  const [adStarted, setAdStarted] = useState(false);

  // Using refs for ad tracking (no UI updates needed)
  const adInfoRef = useRef<{
    isPlaying: boolean;
    currentIndex: number;
    totalAds: number;
    ctaInfo: {
      url: string | null;
      title: string | null;
      adId: string | null;
    } | null;
    allCompleted: boolean;
  }>({
    isPlaying: false,
    currentIndex: 0,
    totalAds: 0,
    ctaInfo: null,
    allCompleted: false,
  });

  const playerStateRef = useRef<VideoPlayerStateRef>({
    shouldPlay: play,
    firstQuartileFired: false,
    midpointFired: false,
    thirdQuartileFired: false,
    videoWatchedFired: false,
    videoStartFired: false,
  });

  useEffect(() => {
    if (typeof volume === "undefined") return;
    if (videoRef.current) {
      videoRef.current.volume = volume / 100;
    }
  }, [volume]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  // Listen for customLoad event and call onCustomLoad
  useEffect(() => {
    if (!videoRef.current || !onPlayerLoad) return;
    const currentVideoElement = videoRef.current; // Capture current value
    const handler = () => onPlayerLoad(playerRef.current);
    currentVideoElement.addEventListener("playerLoad", handler);
    return () => {
      currentVideoElement?.removeEventListener("playerLoad", handler); // Use captured value
    };
  }, [onPlayerLoad]);

  const setupAdPlayerEventListeners = useCallback(
    (player: OpenPlayerJS) => {
      if (!player) {
        console.warn("Player not available for event listeners");
        return;
      }

      player.getElement().addEventListener("playererror", (e: any) => {
        if (e.detail?.type === "Ads") {
          const adsManager = player.getAd();
          if (adsManager) {
            adsManager.destroy();
          }

          if (playerStateRef.current.shouldPlay) {
            playThePlayer();
          } else {
            // wait for all the callback stack in event loop to clear and then pause.
            setTimeout(pauseThePlayer, 0);
          }
        }
      });

      // Wait a bit for the player element to be ready
      setTimeout(() => {
        try {
          const playerElement = player.getElement();
          if (!playerElement || !playerElement.addEventListener) {
            console.warn("Player element does not support addEventListener");
            return;
          }

          // Add an event listener for when ads are loaded
          playerElement.addEventListener("adsloaded", () => {
            const adManager = player.getAd();
            if (!adManager) {
              console.error("Ad manager is not available.");
              return;
            }

            // Use any type to avoid TypeScript errors with IMA SDK
            const adsManager = adManager.getAdsManager() as any;
            if (!adsManager) {
              console.error("AdsManager is not available.");
              return;
            }

            // Listen for the STARTED event to handle ad playback start
            adsManager.addEventListener(
              (window as any).google.ima.AdEvent.Type.STARTED,
              (e: any) => {
                try {
                  setAdStarted(true);

                  // Track ad info in ref (no UI updates)
                  adInfoRef.current.totalAds =
                    e.ad?.data?.adPodInfo?.totalAds || 0;
                  adInfoRef.current.currentIndex =
                    e.ad?.data?.adPodInfo?.adPosition || 0;

                  // Extract ad details
                  if (
                    e.ad?.data?.clickThroughUrl &&
                    e.ad?.data?.title &&
                    e.ad?.data?.adId
                  ) {
                    adInfoRef.current.ctaInfo = {
                      url: e.ad.data.clickThroughUrl || null,
                      title: e.ad.data.title || null,
                      adId: e.ad.data.adId || null,
                    };
                  }

                  // Track that ad is playing
                  adInfoRef.current.isPlaying = true;

                  // Call the onAdStarted callback if provided
                  onAdStarted?.({
                    adId: adInfoRef.current.ctaInfo?.adId || null,
                    url: adInfoRef.current.ctaInfo?.url || null,
                    title: adInfoRef.current.ctaInfo?.title || null,
                    currentAdIndex: adInfoRef.current.currentIndex,
                    totalAds: adInfoRef.current.totalAds,
                  });
                } catch (error) {
                  console.error("Error in ad started event:", error);
                }
              }
            );

            // Listen for the SKIPPED event to handle when the ad is skipped by the user
            adsManager.addEventListener(
              (window as any).google.ima.AdEvent.Type.SKIPPED,
              () => {
                onAdSkipped?.({
                  adId: adInfoRef.current.ctaInfo?.adId || null,
                  url: adInfoRef.current.ctaInfo?.url || null,
                  title: adInfoRef.current.ctaInfo?.title || null,
                  currentAdIndex: adInfoRef.current.currentIndex,
                  totalAds: adInfoRef.current.totalAds,
                });
              }
            );

            // Listen for the COMPLETE event to handle when the ad finishes playing
            adsManager.addEventListener(
              (window as any).google.ima.AdEvent.Type.COMPLETE,
              () => {
                // Call onAdCompleted with the current CTA info before resetting
                const currentCtaInfo = adInfoRef.current.ctaInfo;
                if (currentCtaInfo) {
                  onAdCompleted?.({
                    adId: currentCtaInfo.adId,
                    url: currentCtaInfo.url,
                    title: currentCtaInfo.title,
                  });
                }

                // Reset the ad playing state and CTA info
                adInfoRef.current.isPlaying = false;
                adInfoRef.current.ctaInfo = null;
              }
            );

            // Listen for ad click events
            adsManager.addEventListener(
              (window as any).google.ima.AdEvent.Type.CLICK,
              (e: any) => {
                if (e.ad?.data?.clickThroughUrl && e.ad?.data?.title) {
                  onAdClicked?.({
                    url: e.ad.data.clickThroughUrl,
                    title: e.ad.data.title,
                    adId: e.ad.data.adId,
                    currentAdIndex: adInfoRef.current.currentIndex,
                    totalAds: adInfoRef.current.totalAds,
                  });
                }
              }
            );

            // Listen for when all ads complete
            adsManager.addEventListener(
              (window as any).google.ima.AdEvent.Type.ALL_ADS_COMPLETED,
              () => {
                onAllAdsCompleted?.();
                adInfoRef.current.allCompleted = true;
              }
            );

            // Listen for ad errors
            adsManager.addEventListener(
              (window as any).google.ima.AdEvent.Type.AD_ERROR,
              (e: any) => {
                console.error("Ad error:", e.getError());
                adInfoRef.current.isPlaying = false;
                adInfoRef.current.ctaInfo = null;
                onAdError?.(e.getError());
              }
            );
          });
        } catch (error) {
          console.error("Error setting up player event listeners:", error);
        }
      }, 100); // Wait 100ms for player element to be ready
    },
    [onAdStarted, onAdCompleted, onAdClicked, onAdError]
  );

  const initializePlayer = useCallback(
    async (player: OpenPlayerJS, play?: boolean) => {
      await player.init();
      await player.load();
      playerRef.current = player;

      // Set up ad event listeners if ads are enabled
      if (adUrl) {
        setupAdPlayerEventListeners(player);
      }

      // Dispatch playerLoad event after player is ready
      videoRef.current?.dispatchEvent(new Event("playerLoad"));

      if (play) {
        await player.play().catch((error) => {
          console.log("error in player", error);
        });
      }

      onOpenPlayerReady?.(player);
    },
    [onOpenPlayerReady, adUrl, setupAdPlayerEventListeners]
  );

  const updatePlayerMutedState = useCallback(
    (muted: boolean) => {
      if (videoRef.current) {
        videoRef.current.muted = muted;
        onMutedChange?.(muted);
      }
    },
    [onMutedChange, videoRef]
  );

  const playThePlayer = useCallback(() => {
    const player = playerRef.current;
    const active = player?.activeElement();
    active
      ?.play()
      .then(() => {
        // Auto-play started
      })
      .catch((error) => {
        if (error?.name === "NotAllowedError") {
          updatePlayerMutedState(true);
          active.play().catch((err: any) => {
            console.warn("Could not autoplay video:", err);
          });
        }
      });
  }, [updatePlayerMutedState]);

  const pauseThePlayer = useCallback(() => {
    const player = playerRef.current;
    // try everything to pause the video and ad.
    if (player?.isAd()) {
      player?.getAd()?.pause(); // Pause ad if playing
    } else {
      player?.getMedia().pause();
    }

    player?.pause();
  }, []);

  useEffect(() => {
    playerStateRef.current.shouldPlay = play;
    if (play) {
      playThePlayer();
    } else {
      pauseThePlayer();
    }
  }, [play, adStarted, playThePlayer, pauseThePlayer]);

  useEffect(() => {
    if (!videoRef.current) return;

    const player = new OpenPlayerJS(videoRef.current, {
      controls: {
        alwaysVisible: false,
      },
      mode: "responsive",
      forceNative: true,
      showLoaderOnInit: true,
      hls: hlsConfigs,
      ads: adUrl
        ? {
            src: adUrl,
            sdkPath: "https://imasdk.googleapis.com/js/sdkloader/ima3.js",
          }
        : undefined,
    });

    // if (videoRef.current) {
    //   videoRef.current.load();
    // }

    // Set initial playback speed for the new video
    videoRef.current.playbackRate = playbackSpeed;
    void initializePlayer(player, play);
    // Reset videoStartFired when src changes (new video)
    playerStateRef.current.videoStartFired = false;

    return () => {
      playerStateRef.current = {
        firstQuartileFired: false,
        midpointFired: false,
        thirdQuartileFired: false,
        videoWatchedFired: false,
        videoStartFired: false,
        shouldPlay: false,
      };

      // Reset ad tracking
      adInfoRef.current = {
        isPlaying: false,
        currentIndex: 0,
        totalAds: 0,
        ctaInfo: null,
        allCompleted: false,
      };

      // Clean up ads if any
      if (playerRef.current && adUrl) {
        try {
          console.log("Cleaning up ads before component unmount");
          const ad = playerRef.current.getAd?.();
          if (ad) {
            const adsManager = ad.getAdsManager?.() as any;
            if (adsManager && typeof adsManager.stop === "function") {
              adsManager.stop();
            }
            if (typeof ad.destroy === "function") {
              ad.destroy();
            }
          }
        } catch (error) {
          console.warn("Error cleaning up ads:", error);
        }
      }
      changePlayerStateRef(true);
    };
  }, [src]);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;
    let startTime: number | null = null;
    const handlePlay = () => {
      startTime = performance.now();
    };

    const handlePlaying = () => {
      if (!playerStateRef.current.videoStartFired) {
        playerStateRef.current.videoStartFired = true;
        const endTime = performance.now();
        onVideoStart?.(
          playerRef.current?.getMedia().duration ?? 0,
          videoElement.currentTime,
          typeof startTime === "number" ? endTime - startTime : 0
        );
      }
    };

    videoElement.addEventListener("play", handlePlay);
    videoElement.addEventListener("playing", handlePlaying);
    videoElement.addEventListener("ended", handleEnded);

    return () => {
      videoElement.removeEventListener("playing", handlePlaying);
      videoElement.removeEventListener("play", handlePlay);
      videoElement.removeEventListener("ended", handleEnded);
    };
  }, [onVideoStart, src]);

  const changePlayerStateRef = useCallback(
    (isReset: boolean, duration?: number, currentTime?: number) => {
      if (isReset) {
        playerStateRef.current = {
          firstQuartileFired: false,
          midpointFired: false,
          thirdQuartileFired: false,
          videoWatchedFired: false,
          videoStartFired: playerStateRef.current.videoStartFired,
          shouldPlay: playerStateRef.current.shouldPlay,
        };
        return;
      }
      if (duration === undefined || currentTime === undefined) return;
      const firstQuartileTime = duration / 4;
      const midpointTime = duration / 2;
      const thirdQuartileTime = (duration * 3) / 4;
      if (currentTime < 3 && playerStateRef.current.videoWatchedFired) {
        playerStateRef.current.videoWatchedFired = false;
      }
      if (
        currentTime < firstQuartileTime &&
        playerStateRef.current.firstQuartileFired
      ) {
        playerStateRef.current.firstQuartileFired = false;
      }
      if (currentTime < midpointTime && playerStateRef.current.midpointFired) {
        playerStateRef.current.midpointFired = false;
      }
      if (
        currentTime < thirdQuartileTime &&
        playerStateRef.current.thirdQuartileFired
      ) {
        playerStateRef.current.thirdQuartileFired = false;
      }
    },
    [playerStateRef]
  );

  const handleEnded = useCallback(() => {
    changePlayerStateRef(true);
  }, [changePlayerStateRef]);
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const handleTimeUpdate = () => {
      const videlElement = videoRef.current;
      const duration = videoElement.duration;
      if (!videlElement || duration === 0 || !duration || duration === Infinity)
        return;
      const {
        firstQuartileFired,
        midpointFired,
        thirdQuartileFired,
        videoWatchedFired,
      } = playerStateRef.current;

      const { currentTime } = videoElement;

      if (!videoWatchedFired && currentTime >= 3) {
        onVideoWatched?.(duration, currentTime);
        playerStateRef.current.videoWatchedFired = true;
      }

      const firstQuartileTime = duration / 4;
      const midpointTime = duration / 2;
      const thirdQuartileTime = (duration * 3) / 4;

      if (!firstQuartileFired && currentTime >= firstQuartileTime) {
        onVideoFirstQuartile?.(duration, currentTime);
        playerStateRef.current.firstQuartileFired = true;
      }

      if (!midpointFired && currentTime >= midpointTime) {
        onVideoMidpoint?.(duration, currentTime);
        playerStateRef.current.midpointFired = true;
      }

      if (!thirdQuartileFired && currentTime >= thirdQuartileTime) {
        onVideoThirdQuartile?.(duration, currentTime);
        playerStateRef.current.thirdQuartileFired = true;
      }
    };

    videoElement.addEventListener("ended", handleEnded);
    videoElement.addEventListener("timeupdate", handleTimeUpdate);

    return () => {
      videoElement.removeEventListener("ended", handleEnded);
      // Clean up the timeupdate event listener
      videoElement.removeEventListener("timeupdate", handleTimeUpdate);
    };
  }, [
    src,
    onVideoFirstQuartile,
    onVideoMidpoint,
    onVideoThirdQuartile,
    onVideoWatched,
  ]);

  const onVideoSeeked = useCallback(
    (event: React.SyntheticEvent<HTMLVideoElement, Event>) => {
      onSeeked?.(event);
      changePlayerStateRef(
        false,
        videoRef.current?.duration,
        videoRef.current?.currentTime
      );
    },
    [playerStateRef, changePlayerStateRef, onSeeked]
  );

  return (
    <video
      className={cn(
        "gencl:h-auto gencl:w-auto gencl:bg-cover gencl:bg-center gencl:bg-no-repeat gencl:object-cover",
        className
      )}
      style={{ backgroundImage: `url(${poster})`, ...style }}
      poster={poster}
      ref={videoRef}
      onSeeked={onVideoSeeked}
      src={encodeVideoSourceUrl(src ?? "")}
      playsInline={playsInline}
      loop={loop}
      {...props}
    />
  );
});
