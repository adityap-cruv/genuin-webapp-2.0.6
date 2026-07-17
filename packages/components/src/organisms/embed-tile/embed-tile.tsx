"use client";

import { cn } from "@genuin/ui";
import { CommentIcon, PlayIcon } from "@genuin/ui/icons";
import { resolveControlSize, SPONSORED_TAG_SIZE } from "@genuin/ui/player-controls";
import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";
import { lazy, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useBoolean } from "usehooks-ts";

import { useBaseContext } from "@genuin/components/context";
import { VideoTypes } from "@genuin/components/context/analytics";
import { useEmbedContext } from "@genuin/components/context/embed";
import { useSafeEmbedContext } from "@genuin/components/context/embed/context";
import { useEmbedConfigs } from "@genuin/components/hooks/embed/use-embed-config";
import { useEmbedDimensions } from "@genuin/components/hooks/embed/use-embed-dimensions";
import { useDeviceDetectMediaQuery } from "@genuin/components/hooks/use-devide-detect-media-query";
import { useSheetState } from "@genuin/components/hooks/use-sheet-state";
import { SDKEventEmitter, SDKEventName } from "@genuin/components/lib/sdk-event-emitter";
import { isMiddlewareOverlayEnabled } from "@genuin/components/lib/utils";
import { getBrandType } from "@genuin/components/lib/utils/brand-layout";
import { SafeSuspense } from "@genuin/components/molecules/error/safe-suspense";
import { PlayerProvider, usePlayerContext } from "@genuin/components/molecules/feed-player/context";
import { EmbedMuteButton } from "@genuin/components/molecules/feed-player/control-layer/controls/embed";
import { DynamicReactionIcon } from "@genuin/components/molecules/reaction-button";
import { Stats } from "@genuin/components/molecules/stats";
import { IFRAME_HEIGHT, IHeartEmbedBar } from "@genuin/components/organisms/player-swiper/iheart/iheart-embed-bar";
import type { PostDetailsType } from "@genuin/components/react-query/api/feed/schema";

import { useEmbedManagerContext } from "../embed/context";

import type { EmbedTileProps } from "./embed-tile.types";

const WatchBoundaryOverlay = lazy(() =>
  import("@genuin/components/molecules/feed-player/control-layer/watch-boundary-overlay").then((m) => ({
    default: m.WatchBoundaryOverlay,
  }))
);

const ControlLayer = lazy(() =>
  import("@genuin/components/molecules/feed-player/control-layer").then((m) => ({
    default: m.ControlLayer,
  }))
);

const FeedPlayer = lazy(() =>
  import("@genuin/components/molecules/feed-player").then((m) => ({
    default: m.FeedPlayer,
  }))
);

const Linkouts = lazy(() =>
  import("../linkouts").then((m) => ({
    default: m.Linkouts,
  }))
) as React.ComponentType<any>;

/**
 * Helper function to extract the most appropriate URL from linkouts based on priority:
 * 1. CTA link from first linkout
 * 2. First link from links array in first linkout
 * 3. URL from first linkout (legacy format)
 * 4. null if no valid URL found
 */
function getLinkoutUrl(linkouts: any): string | null {
  if (!linkouts || typeof linkouts !== "object") {
    return null;
  }

  // Handle array of linkout objects
  if (Array.isArray(linkouts) && linkouts.length > 0) {
    const firstLinkout = linkouts[0];

    // First priority: CTA link
    if (firstLinkout.cta_link) {
      return firstLinkout.cta_link;
    }

    // Second priority: First link from links array
    if (
      firstLinkout.links &&
      Array.isArray(firstLinkout.links) &&
      firstLinkout.links.length > 0 &&
      firstLinkout.links[0].link
    ) {
      return firstLinkout.links[0].link;
    }

    // Legacy format with url property
    if (firstLinkout.url) {
      return firstLinkout.url;
    }
  }

  // Handle direct object with cta_link
  if (!Array.isArray(linkouts) && linkouts.cta_link) {
    return linkouts.cta_link;
  }

  return null;
}

const embedTileVariants = cva("gencl:h-full gencl:rounded-lg gencl:overflow-clip gencl:flex gencl:flex-col", {
  variants: {
    variant: {
      default: "gencl:bg-white",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export function EmbedTile({
  isActive,
  variant,
  embedType = 0,
  postDetails,
  className,
  index,
  swiper,
  totalVideos,
  itemSize,
  pageSession,
  onPlayerIterationEnd,
  ...restProps
}: EmbedTileProps & VariantProps<typeof embedTileVariants>) {
  const { value, toggle } = useBoolean(false);
  const { updateActiveIndex, activeIndex } = useEmbedManagerContext();
  // Use the structured config object
  const config = useEmbedConfigs();
  const shouldShowMiddlewareOverlay = isMiddlewareOverlayEnabled({
    videoLayoutId: postDetails.video?.placement_video_layout_id ?? 0,
    cardLayoutId: postDetails.video?.placement_card_layout_id ?? 0,
  });

  const listenLiveButtonInfo = useMemo(
    () => ({
      episode: postDetails.video?.attributes?.episode_id ? Number(postDetails.video?.attributes.episode_id) : undefined,
      podcast: postDetails.video?.attributes?.podcast_id ? Number(postDetails.video?.attributes.podcast_id) : undefined,
      station: postDetails.video?.attributes?.station_id ? Number(postDetails.video?.attributes.station_id) : undefined,
      type: postDetails.video?.attributes?.type,
    }),
    [
      postDetails.video?.attributes?.episode_id,
      postDetails.video?.attributes?.podcast_id,
      postDetails.video?.attributes?.station_id,
      postDetails.video?.attributes?.type,
    ]
  );
  return (
    <>
      {shouldShowMiddlewareOverlay && postDetails.video?.type === "overlay" ? (
        <WatchBoundaryOverlay info={listenLiveButtonInfo} videoDetails={postDetails.video} variant="overlay" />
      ) : shouldShowMiddlewareOverlay && postDetails.video?.type === "complete" ? (
        <SafeSuspense fallback={null} errorFallback={null}>
          <WatchBoundaryOverlay info={listenLiveButtonInfo} videoDetails={postDetails.video} variant="complete" />
        </SafeSuspense>
      ) : (
        <div
          className={cn(
            embedTileVariants({ variant }),
            {
              "gencl:border gencl:border-secondary-150": config.video.showBorderAroundVideo,
            },
            className
          )}
          {...restProps}>
          {/* Take available height after showLinkOutside & showSocialInteractionData gets its height   */}
          <PlayerProvider
            index={index}
            isActive={isActive}
            videoId={postDetails.video?.id ?? ""}
            videoUrl={postDetails.video?.source ?? ""}
            showExpandView={value}
            toggleExpandView={toggle}
            onPlayerIterationEnd={onPlayerIterationEnd}
            isEmbed
            explicitAutoPlay={config.video.videoAutoplay && isActive}
            explicitLoop={config.video.videoLoop && isActive}
            updateActiveIndex={updateActiveIndex}
            videoDescription={postDetails.video?.descritptionText}
            sectionTitle={postDetails.video?.attributes?.title ?? postDetails.section?.title}
            sectionSubtitle={postDetails.video?.attributes?.subtitle ?? postDetails.section?.sub_title}
            sectionId={postDetails.section?.id}
            podcastId={postDetails.video?.attributes?.podcast_id}
            stationId={postDetails.video?.attributes?.station_id}
            totalVideos={totalVideos}
            swiper={swiper}
            activeIndex={activeIndex}
            videoType={postDetails.video?.videoType ?? VideoTypes.Content}>
            <EmbedPlayer
              postDetails={postDetails}
              isActive={isActive}
              index={index}
              itemSize={itemSize}
              pageSession={pageSession}
            />
          </PlayerProvider>
          <OutsideComponents postDetails={postDetails} />
        </div>
      )}
    </>
  );
}

type EmbedPlayerProps = {
  postDetails: PostDetailsType;
  isActive?: boolean;
  index: number;
  itemSize: { height: number; width: number };
  /** Feed-session identifier forwarded to analytics as `page_session`. */
  pageSession?: string | null;
};

function EmbedPlayer({ postDetails, isActive = false, index, itemSize }: EmbedPlayerProps) {
  const { isAdPlaying } = usePlayerContext();
  const { isEmbed } = useBaseContext();
  const config = useEmbedConfigs();
  const [isAdFilled, setIsAdFilled] = useState(false);
  // Ad types whose creatives should suppress the control layer (banner/display/native).
  const [hideControlsForAd, setHideControlsForAd] = useState(false);
  const { changeActivePlayerType, embedData } = useEmbedContext();
  const videoCrop = config.video.videoCrop;

  const embedDetails = useSafeEmbedContext();
  const showLayout = config.responsive.canShowEngagement;
  const layoutType = !showLayout
    ? "responsiveness"
    : getBrandType(embedDetails?.embedData.card_layout_id, embedDetails?.embedData.video_layout_id);
  const { sheetState, getContentTypeState, hasContentType, openContentType } = useSheetState();
  const { isDesktop } = useDeviceDetectMediaQuery();
  const isNonDesktop = !isDesktop;

  // Carousel cap: dragging the linkout indicator beyond `expand-view` (i.e. into
  // `panel-view` / `full-view`) means the user wants to enlarge the panel past
  // the carousel's biggest in-tile state. Promote them straight into the
  // fullscreen expand-view player; the `ExpandViewLoader` snapshot logic
  // resets the linkout to `default` on entry and restores it on close.
  //
  // Also promote when the user drags from `default-active` to `expand-view`.
  // On iOS Safari the snap target for `panel-view` (70vh / 70% of parent) sits
  // too far above expand-view's auto-sized snap point for a typical upward
  // swipe to cross the midpoint, so the sheet snaps back to expand-view and
  // the user never reaches the panel-view trigger. The `default-active →
  // expand-view` transition is user-only — neither `embed-default` (auto-
  // advances default → default-active) nor `embed-active` (auto-advances
  // default → expand-view, skipping default-active) hits it via auto-advance.
  const linkoutsSheetState = getContentTypeState("linkouts");
  const prevLinkoutsSheetStateRef = useRef(linkoutsSheetState);
  useEffect(() => {
    if (!isActive) {
      prevLinkoutsSheetStateRef.current = linkoutsSheetState;
      return;
    }
    const isExpandViewPlayer = embedDetails?.embedEventBus.getContext().activePlayerType === "expand-view";
    if (isExpandViewPlayer) {
      prevLinkoutsSheetStateRef.current = linkoutsSheetState;
      return;
    }
    const prev = prevLinkoutsSheetStateRef.current;
    const userDraggedToExpand = prev === "default-active" && linkoutsSheetState === "expand-view";
    if (linkoutsSheetState === "panel-view" || linkoutsSheetState === "full-view" || userDraggedToExpand) {
      changeActivePlayerType("expand-view", index);
    }
    prevLinkoutsSheetStateRef.current = linkoutsSheetState;
  }, [linkoutsSheetState, isActive, changeActivePlayerType, index, embedDetails]);

  // Carousel re-open: when the active video changes to one that has a
  // linkout, ensure "linkouts" is in `activeSheetContentTypes`. Gated on
  // the *video id* changing (not just `isActive` flipping) so the user's
  // explicit close on the current tile stays effective — without this
  // gate the close → `closeContentType("linkouts")` would immediately be
  // undone by this same effect.
  const hasLinkoutData =
    (postDetails.video?.linkoutId !== null && postDetails.video?.linkoutId !== undefined) ||
    (Array.isArray(postDetails.video?.linkouts) && (postDetails.video?.linkouts?.length ?? 0) > 0);
  const lastOpenedForVideoIdRef = useRef<string | null>(null);
  const currentVideoId = postDetails.video?.id ?? null;
  useEffect(() => {
    if (!isActive) return;
    if (!hasLinkoutData) return;
    if (!currentVideoId) return;
    if (lastOpenedForVideoIdRef.current === currentVideoId) return;
    lastOpenedForVideoIdRef.current = currentVideoId;
    openContentType("linkouts", "inside", "default");
  }, [isActive, hasLinkoutData, currentVideoId, openContentType]);

  const handleClickOnEmbedTile = useCallback(() => {
    // Emit SDK event for video click
    SDKEventEmitter.emit(SDKEventName.VIDEO_CLICKED, {
      videoId: postDetails.video?.id ?? "",
    });

    const isBrandPeacock = embedData.brandDetails?.brand_id === 3182;
    if (isBrandPeacock) {
      const nativeVideoHandler = (window as any).webkit?.messageHandlers?.openNativeVideo;
      if (nativeVideoHandler) {
        nativeVideoHandler.postMessage({
          source: "carousel",
          videoId: postDetails.video?.id,
        });
      }
    }
    if (isAdPlaying) {
      return;
    }

    if (embedData.card_layout_id === 4) {
      // For card_layout_id 4, prioritize URLs in this order: CTA, first linkout, or no action
      const linkoutUrl = getLinkoutUrl(postDetails.video?.linkouts);

      if (linkoutUrl) {
        window.open(linkoutUrl, "_blank");
        return;
      }

      // No expand view for card_layout_id 4(Grubhub)
      return;
    }

    // Default behavior for other card layouts
    if (postDetails.video?.clickableUrl) {
      window.open(postDetails.video?.clickableUrl, "_blank");
      return;
    }

    if (config.expandViewConfig.enable) {
      changeActivePlayerType("expand-view", index);
    }
  }, [isAdPlaying, changeActivePlayerType, index, postDetails, embedData.card_layout_id]);

  // Hide the control layer while an ad is showing, and notify the parent
  // so it can lock the swiper and disable navigation buttons.
  const handleAdFilled = useCallback((_type: string) => {
    setIsAdFilled(true);
    // Banner/display/native creatives render their own UI; hide our control layer.
    const adType = _type?.toLowerCase();
    setHideControlsForAd(adType === "banner" || adType === "display" || adType === "native");
  }, []);

  // Re-show the control layer once the ad fill ends, and notify the parent
  // to re-enable swiper navigation.
  const handleAdPlaybackEnd = useCallback(() => {
    setIsAdFilled(false);
    setHideControlsForAd(false);
  }, []);

  const isSponsored = postDetails.video?.cardLayoutId === 7; // Sponsored content is determined by cardLayoutId 7

  const hidePlayerControls = isEmbed ? itemSize.width < 150 : false;

  const isSheetExpanded = isNonDesktop && isActive && (sheetState === "panel-view" || sheetState === "full-view");

  const showIheartBar = config.brand.showIheartIframe && isActive;

  return (
    <div
      className={cn(
        "gencl:relative gencl:bg-black gencl:flex-1 gencl:min-h-0 gencl:h-full gencl:flex gencl:items-center gencl:justify-center",
        {
          "gencl:opacity-50 gencl:transition-opacity": !isActive && config.styling.isOpacityDown,
        },
        isSheetExpanded && "gencl:flex-col gencl:justify-start",
        showIheartBar && !isSheetExpanded && "gencl:flex-col"
      )}
      {...(!isAdFilled && hidePlayerControls ? { onClick: handleClickOnEmbedTile } : {})}>
      <div
        className="gencl:w-full gencl:relative gencl:transition-all gencl:duration-300 gencl:ease-in-out"
        style={{
          height: showIheartBar ? `calc(100% - ${IFRAME_HEIGHT}px)` : "100%",
        }}>
        <div
          className={cn(
            "gencl:w-full gencl:transition-all gencl:duration-300 gencl:ease-in-out",
            // While an ad plays, the linkout panel is suppressed (control-layer
            // renders the Ad overlay instead of the embed), so the video frame
            // must reclaim the full slide. The sheet state is preserved so
            // playback can revert to the 30/70 split once the ad ends.
            !isAdPlaying && isActive && (sheetState === "panel-view" || sheetState === "full-view")
              ? "gencl:h-[30%] gencl:shrink-0"
              : "gencl:h-full"
          )}>
          <SafeSuspense fallback={null} errorFallback={null}>
            <FeedPlayer
              videoDescription={postDetails.video?.descritptionText}
              sectionTitle={postDetails.video?.attributes?.title ?? postDetails.section?.title}
              sectionSubtitle={postDetails.video?.attributes?.subtitle ?? postDetails.section?.sub_title}
              sectionId={postDetails.section?.id}
              podcastId={postDetails.video?.attributes?.podcast_id}
              stationId={postDetails.video?.attributes?.station_id}
              videoId={postDetails.video?.id ?? ""}
              adUrl={postDetails.video?.adUrl ?? undefined}
              src={postDetails.video?.source}
              adsPlatform={postDetails.video?.adsPlatform}
              poster={
                config.contentDisplay.showSectionCover && postDetails.section?.cover_url
                  ? postDetails.section?.cover_url
                  : postDetails.video?.thumbnail
              }
              className={
                !isAdPlaying && (sheetState === "panel-view" || sheetState === "full-view")
                  ? "gencl:bg-contain! gencl:object-contain! gencl:h-full! gencl:w-full!"
                  : videoCrop
                    ? "gencl:object-cover gencl:h-full! gencl:w-full gencl:bg-cover"
                    : "gencl:h-full! gencl:bg-contain!"
              }
              layoutType={layoutType}
              aria-hidden="true"
              index={index}
              isActive={isActive}
              adTagObject={(postDetails as any).adTagObject ?? undefined}
              onAdFilled={handleAdFilled}
              onAdPlaybackEnd={handleAdPlaybackEnd}
              isSponsored={postDetails.video?.cardLayoutId === 7 || postDetails.video?.videoLayoutId === 6}
              videoType={postDetails.video?.videoType ?? VideoTypes.Content}
              playerSize={itemSize}
              sponsorshipInfo={postDetails.sponsored}
            />
          </SafeSuspense>
        </div>
        {!hidePlayerControls && !(isAdFilled && hideControlsForAd) && (
          <SafeSuspense fallback={null} errorFallback={null}>
            <ControlLayer
              variant={config.view.isPlacementView ? "placement" : "embed"}
              isActive={isActive}
              index={index}
              postDetails={postDetails}
              onClick={handleClickOnEmbedTile}
              onCommentCountChange={undefined}
              layoutType={layoutType}
              containerWidth={itemSize.width}
              adType={postDetails.video?.adUrl ? "in-stream" : "in-feed"}
            />
          </SafeSuspense>
        )}
        {isSponsored && !isAdFilled && (
          <div
            className={cn(
              "gencl:absolute gencl:top-2 gencl:left-2 gencl:z-50 gencl:flex-center",
              config.isDesignSystemV2
                ? "gencl:bg-white gencl:rounded-3xl gencl:text-gray-900 gencl:px-2! gencl:py-1!"
                : "gencl:bg-black/40 gencl:h-8 gencl:px-2 gencl:rounded-[50px] gencl:text-white"
            )}
            style={
              config.isDesignSystemV2
                ? {
                    backdropFilter: "blur(7.5px)",
                    width: SPONSORED_TAG_SIZE[resolveControlSize(itemSize.width)].width,
                    height: SPONSORED_TAG_SIZE[resolveControlSize(itemSize.width)].height,
                  }
                : undefined
            }>
            <p
              className={
                config.isDesignSystemV2
                  ? SPONSORED_TAG_SIZE[resolveControlSize(itemSize.width)].text
                  : "gencl:text-body-1-normal"
              }>
              Sponsored
            </p>
          </div>
        )}
        {isAdFilled && hideControlsForAd && (
          <div className="gencl:absolute gencl:top-2 gencl:right-2">
            <EmbedMuteButton size="sm" />
          </div>
        )}
      </div>
      {showIheartBar && <IHeartEmbedBar attributes={postDetails.video?.attributes} />}
    </div>
  );
}

function OutsideComponents({ postDetails }: { postDetails: PostDetailsType }) {
  const { contentDisplay, responsive, engagement, links, view, video, isDesignSystemV2 } = useEmbedConfigs();
  const { linkoutHeight } = useEmbedDimensions();
  const { isXs } = responsive;
  const showLinkout = links.showLinkOutside;
  const showInteraction =
    engagement.showSocialInteractionData || contentDisplay.socialInteractionCountsPosition === "outside_on_bottom";

  const stats = useMemo(() => {
    if (view.isPlacementView) {
      return {
        ...(contentDisplay.showViewCount && {
          Views: {
            value: postDetails.video?.viewCount ?? 0,
            icon: <PlayIcon theme="light" size="sm" strokeWidth={2} />,
          },
        }),
        ...(contentDisplay.showReactionCount && {
          Reactions: {
            value: postDetails.video?.sparkCount ?? 0,
            icon: (
              <DynamicReactionIcon
                sparkCount={0}
                isSparked={false}
                iconHeight={16}
                iconWidth={16}
                theme="light"
                type="social_count"
              />
            ),
          },
        }),
        ...(contentDisplay.showCommentCount && {
          Comments: {
            value: postDetails.video?.commentCount ?? 0,
            icon: <CommentIcon theme="light" size="sm" strokeWidth={3} />,
          },
        }),
      };
    }

    return {
      Views: {
        value: postDetails.video?.viewCount ?? 0,
        icon: <PlayIcon theme="light" size="sm" />,
      },
      Reactions: {
        value: postDetails.video?.sparkCount ?? 0,
        icon: (
          <DynamicReactionIcon
            sparkCount={0}
            isSparked={false}
            iconHeight={16}
            iconWidth={16}
            theme="light"
            type="comment"
          />
        ),
      },
      Comments: {
        value: postDetails.video?.commentCount ?? 0,
        icon: <CommentIcon theme="light" size="sm" />,
      },
    };
  }, [contentDisplay, postDetails.video?.sparkCount, postDetails.video?.commentCount]);

  return (
    <>
      {showLinkout && postDetails.video?.linkouts && (
        <div
          className="gencl:w-full gencl:flex gencl:items-center"
          style={{
            height: `${linkoutHeight}px`,
          }}>
          <SafeSuspense fallback={null} errorFallback={null}>
            <Linkouts
              view="embed"
              layout="outside"
              {...(isDesignSystemV2 ? { variant: "dynamic" as const } : {})}
              isActive={true}
              showImmediately
              linkouts={postDetails.video?.linkouts}
              linkoutId={postDetails.video?.linkoutId}
              videoDetails={postDetails.video}
              autoplay={video.videoAutoplay}
            />
          </SafeSuspense>
        </div>
      )}

      {showLinkout && showInteraction && <hr className="gencl:w-[90%] gencl:border-secondary-150 gencl:mx-auto" />}

      {showInteraction && !isXs && (
        <div className="gencl:h-10">
          <Stats
            className={cn("gencl:flex gencl:gap-2 gencl:justify-between gencl:p-3 gencl:w-full")}
            valueClassName={cn(
              "gencl:text-black! ",
              view.isPlacementView ? "gencl:text-body-2-medium gencl:font-bold" : "gencl:text-body-2-medium"
            )}
            pairClassName="gencl:gap-1"
            stats={stats}
          />
        </div>
      )}
    </>
  );
}
