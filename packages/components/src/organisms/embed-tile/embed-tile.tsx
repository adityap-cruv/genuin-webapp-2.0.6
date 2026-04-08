"use client";
import { cn } from "@genuin/ui/lib/utils";
import type { EmbedTileProps } from "./embed-tile.types";
import {
  SDKEventEmitter,
  SDKEventName,
} from "@genuin/components/lib/sdk-event-emitter";
import { cva, VariantProps } from "class-variance-authority";
import { lazy, Suspense, useCallback, useMemo, useState } from "react";
import {
  PlayerProvider,
  usePlayerContext,
} from "@genuin/components/molecules/feed-player/context";
import { useBoolean } from "usehooks-ts";
import { useEmbedConfigs } from "@genuin/components/hooks/embed/use-embed-config";
import { Stats } from "@genuin/components/molecules/stats";
import { CommentIcon, PlayIcon } from "@genuin/ui/icons";
import { PostDetailsType } from "@genuin/components/react-query/api/feed/schema";
import { useEmbedContext } from "@genuin/components/context/embed";
import { DynamicReactionIcon } from "@genuin/components/molecules/reaction-button";
import { useSafeEmbedContext } from "@genuin/components/context/embed/context";
import { getBrandType } from "@genuin/components/lib/utils/brand-layout";
import { isMiddlewareOverlayEnabled } from "@genuin/components/lib/utils";
import { VideoTypes } from "@genuin/components/context/analytics";
import { useSheetState } from "@genuin/components/hooks/use-sheet-state";
import { useDeviceDetectMediaQuery } from "@genuin/components/hooks/use-devide-detect-media-query";

const WatchBoundaryOverlay = lazy(() =>
  import(
    "@genuin/components/molecules/feed-player/control-layer/watch-boundary-overlay.js"
  ).then((m) => ({
    default: m.WatchBoundaryOverlay,
  })),
);

const ControlLayer = lazy(() =>
  import("../../molecules/feed-player/control-layer/index.js").then((m) => ({
    default: m.ControlLayer,
  })),
);

const FeedPlayer = lazy(() =>
  import("../../molecules/feed-player/index.js").then((m) => ({
    default: m.FeedPlayer,
  })),
);

const Linkouts = lazy(() =>
  import("../linkouts/index.js").then((m) => ({
    default: m.Linkouts,
  })),
) as React.ComponentType<any>;

import { useEmbedManagerContext } from "../embed/context";

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

const embedTileVariants = cva(
  "gencl:h-full gencl:rounded-lg gencl:overflow-clip gencl:flex gencl:flex-col",
  {
    variants: {
      variant: {
        default: "gencl:bg-white",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

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
  onPlayerIterationEnd,
  ...restProps
}: EmbedTileProps & VariantProps<typeof embedTileVariants>) {
  const { value, toggle } = useBoolean(false);
  const { updateActiveIndex, activeIndex } = useEmbedManagerContext();
  // Use the structured config object
  const config = useEmbedConfigs();
  const shouldShowMiddlewareOverlay = isMiddlewareOverlayEnabled({
    videoLayoutId: postDetails.video.placement_video_layout_id ?? 0,
    cardLayoutId: postDetails.video.placement_card_layout_id ?? 0,
  });

  const listenLiveButtonInfo = useMemo(
    () => ({
      episode: postDetails.video.attributes?.episode_id
        ? Number(postDetails.video.attributes.episode_id)
        : undefined,
      podcast: postDetails.video.attributes?.podcast_id
        ? Number(postDetails.video.attributes.podcast_id)
        : undefined,
      station: postDetails.video.attributes?.station_id
        ? Number(postDetails.video.attributes.station_id)
        : undefined,
      type: postDetails.video.attributes?.type,
    }),
    [
      postDetails.video.attributes?.episode_id,
      postDetails.video.attributes?.podcast_id,
      postDetails.video.attributes?.station_id,
      postDetails.video.attributes?.type,
    ],
  );
  return (
    <>
      {shouldShowMiddlewareOverlay && postDetails.video.type === "overlay" ? (
        <WatchBoundaryOverlay
          info={listenLiveButtonInfo}
          videoDetails={postDetails.video}
          variant="overlay"
        />
      ) : shouldShowMiddlewareOverlay &&
        postDetails.video.type === "complete" ? (
        <Suspense fallback={null}>
          <WatchBoundaryOverlay
            info={listenLiveButtonInfo}
            videoDetails={postDetails.video}
            variant="complete"
          />
        </Suspense>
      ) : (
        <div
          className={cn(
            embedTileVariants({ variant }),
            {
              "gencl:border gencl:border-secondary-150":
                config.video.showBorderAroundVideo,
            },
            className,
          )}
          {...restProps}
        >
          {/* Take available height after showLinkOutside & showSocialInteractionData gets its height   */}
          <PlayerProvider
            index={index}
            isActive={isActive}
            videoId={postDetails.video.id}
            videoUrl={postDetails.video.source}
            showExpandView={value}
            toggleExpandView={toggle}
            onPlayerIterationEnd={onPlayerIterationEnd}
            isEmbed
            explicitAutoPlay={config.video.videoAutoplay && isActive}
            explicitLoop={config.video.videoLoop && isActive}
            updateActiveIndex={updateActiveIndex}
            videoDescription={postDetails.video.descritptionText}
            totalVideos={totalVideos}
            swiper={swiper}
            activeIndex={activeIndex}
            videoType={postDetails.video.videoType ?? VideoTypes.Content}
          >
            <EmbedPlayer
              postDetails={postDetails}
              isActive={isActive}
              index={index}
              itemSize={itemSize}
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
};

function EmbedPlayer({
  postDetails,
  isActive = false,
  index,
  itemSize,
}: EmbedPlayerProps) {
  const { isAdPlaying } = usePlayerContext();
  const config = useEmbedConfigs();
  const [isAdFilled, setIsAdFilled] = useState(false);
  const { changeActivePlayerType, embedData } = useEmbedContext();
  const videoCrop = config.video.videoCrop;
  const embedDetails = useSafeEmbedContext();
  const showLayout = config.responsive.canShowEngagement;
  const layoutType = !showLayout
    ? "responsiveness"
    : getBrandType(
        embedDetails?.embedData.card_layout_id,
        embedDetails?.embedData.video_layout_id,
      );
  const { sheetState } = useSheetState();
  const { isDesktop } = useDeviceDetectMediaQuery();
  const isNonDesktop = !isDesktop;

  const handleClickOnEmbedTile = useCallback(() => {
    // Emit SDK event for video click
    SDKEventEmitter.emit(SDKEventName.VIDEO_CLICKED, {
      videoId: postDetails.video.id,
    });

    const isBrandPeacock = embedData.brandDetails?.brand_id === 3182;
    if (isBrandPeacock) {
      const nativeVideoHandler = (window as any).webkit?.messageHandlers
        ?.openNativeVideo;
      if (nativeVideoHandler) {
        nativeVideoHandler.postMessage({
          source: "carousel",
          videoId: postDetails.video.id,
        });
      }
    }
    if (isAdPlaying) {
      return;
    }

    if (embedData.card_layout_id === 4) {
      // For card_layout_id 4, prioritize URLs in this order: CTA, first linkout, or no action
      const linkoutUrl = getLinkoutUrl(postDetails.video.linkouts);

      if (linkoutUrl) {
        window.open(linkoutUrl, "_blank");
        return;
      }

      // No expand view for card_layout_id 4(Grubhub)
      return;
    }

    // Default behavior for other card layouts
    if (postDetails.video.clickableUrl) {
      window.open(postDetails.video.clickableUrl, "_blank");
      return;
    }

    if (config.expandViewConfig.enable) {
      changeActivePlayerType("expand-view", index);
    }
  }, [
    isAdPlaying,
    changeActivePlayerType,
    index,
    postDetails,
    embedData.card_layout_id,
  ]);

  const handleAdFilled = useCallback((type: string) => {
    // if (type === "banner") {
    setIsAdFilled(true);
    // }
  }, []);

  const handleAdFilledEnd = useCallback(() => {
    setIsAdFilled(false);
  }, []);

  const isSponsored = postDetails.video.cardLayoutId === 7; // Sponsored content is determined by cardLayoutId 7

  const isSheetExpanded =
    isNonDesktop &&
    isActive &&
    (sheetState === "panel-view" || sheetState === "full-view");

  return (
    <div
      className={cn(
        "gencl:relative gencl:bg-black gencl:flex-1 gencl:min-h-0 gencl:h-full gencl:flex gencl:items-center gencl:justify-center",
        {
          "gencl:opacity-50 gencl:transition-opacity":
            !isActive && config.styling.isOpacityDown,
        },
        isSheetExpanded && "gencl:flex-col gencl:justify-start",
      )}
    >
      <div className={cn("gencl:w-full gencl:h-full gencl:relative")}>
        <div
          className={cn(
            "gencl:w-full gencl:transition-all gencl:duration-300 gencl:ease-in-out",
            isNonDesktop &&
              isActive &&
              (sheetState === "panel-view" || sheetState === "full-view")
              ? "gencl:h-[30%] gencl:flex-shrink-0"
              : "gencl:h-full",
          )}
        >
          <Suspense fallback={null}>
            <FeedPlayer
              videoDescription={postDetails.video.descritptionText}
              videoId={postDetails.video.id}
              adUrl={postDetails.video.adUrl ?? undefined}
              src={postDetails.video.source}
              poster={
                config.contentDisplay.showSectionCover &&
                postDetails.section?.cover_url
                  ? postDetails.section?.cover_url
                  : postDetails.video.thumbnail
              }
              className={cn(
                "gencl:h-full! gencl:w-full",
                videoCrop || isSheetExpanded
                  ? "gencl:object-contain gencl:bg-contain!"
                  : "gencl:object-cover gencl:bg-cover!",
              )}
              layoutType={layoutType}
              aria-hidden="true"
              tabIndex={-1}
              index={index}
              isActive={isActive}
              adTagObject={(postDetails as any).adTagObject ?? undefined}
              onAdFilled={handleAdFilled}
              onAdFilldEnd={handleAdFilledEnd}
              isSponsored={
                postDetails.video.cardLayoutId === 7 ||
                postDetails.video.videoLayoutId === 6
              }
              videoType={postDetails.video.videoType ?? VideoTypes.Content}
              playerSize={itemSize}
            />
          </Suspense>
        </div>
        {!isAdFilled && (
          <Suspense fallback={null}>
            <ControlLayer
              variant={config.view.isPlacementView ? "placement" : "embed"}
              isActive={isActive}
              index={index}
              postDetails={postDetails}
              onClick={handleClickOnEmbedTile}
              onCommentCountChange={undefined}
              layoutType={layoutType}
            />
          </Suspense>
        )}
        {isSponsored && (
          <div className="gencl:absolute gencl:top-2 gencl:left-2 gencl:bg-black/40 gencl:h-8 gencl:z-50 gencl:px-2 gencl:rounded-[50px] gencl:text-white gencl:flex-center">
            <p className="gencl:text-body-1-normal">Sponsored</p>
          </div>
        )}
      </div>
    </div>
  );
}

function OutsideComponents({ postDetails }: { postDetails: PostDetailsType }) {
  const { contentDisplay, responsive, engagement, links, view, video } =
    useEmbedConfigs();
  const { isXs } = responsive;
  const showLinkout = links.showLinkOutside;
  const showInteraction =
    engagement.showSocialInteractionData ||
    contentDisplay.socialInteractionCountsPosition === "outside_on_bottom";

  const stats = useMemo(() => {
    if (view.isPlacementView) {
      return {
        ...(contentDisplay.showViewCount && {
          Views: {
            value: postDetails.video.viewCount,
            icon: <PlayIcon theme="light" size="sm" strokeWidth={2} />,
          },
        }),
        ...(contentDisplay.showReactionCount && {
          Reactions: {
            value: postDetails.video.sparkCount,
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
            value: postDetails.video.commentCount,
            icon: <CommentIcon theme="light" size="sm" strokeWidth={3} />,
          },
        }),
      };
    }

    return {
      Views: {
        value: postDetails.video.viewCount,
        icon: <PlayIcon theme="light" size="sm" />,
      },
      Reactions: {
        value: postDetails.video.sparkCount,
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
        value: postDetails.video.commentCount,
        icon: <CommentIcon theme="light" size="sm" />,
      },
    };
  }, [
    contentDisplay,
    postDetails.video.sparkCount,
    postDetails.video.commentCount,
  ]);

  return (
    <>
      {showLinkout && postDetails.video.linkoutId && (
        <div className="gencl:h-27 gencl:w-full gencl:flex gencl:items-center">
          <Suspense fallback={null}>
            <Linkouts
              variant="embed"
              isActive={true}
              isOutside
              showImmediately
              linkouts={postDetails.video.linkouts}
              linkoutId={postDetails.video.linkoutId}
              videoDetails={postDetails.video}
              autoplay={video.videoAutoplay}
            />
          </Suspense>
        </div>
      )}

      {showLinkout && showInteraction && (
        <hr className="gencl:w-[90%] gencl:border-secondary-150 gencl:mx-auto" />
      )}

      {showInteraction && !isXs && (
        <div className="gencl:h-10">
          <Stats
            className={cn(
              "gencl:flex gencl:gap-2 gencl:justify-between gencl:p-3 gencl:w-full",
            )}
            valueClassName={cn(
              "gencl:text-black! ",
              view.isPlacementView
                ? "gencl:text-body-2-medium gencl:font-bold"
                : "gencl:text-body-2-medium",
            )}
            pairClassName="gencl:gap-1"
            stats={stats}
          />
        </div>
      )}
    </>
  );
}
