import { CommentIcon, PlayIcon } from "@genuin/ui/icons";
import { cn } from "@genuin/ui/lib/utils";
import { resolveControlSize } from "@genuin/ui/player-controls";
import { useMemo, lazy } from "react";

import { useEmbedConfigs } from "@genuin/components/hooks/embed/use-embed-config";
import { useDeviceDetectMediaQuery } from "@genuin/components/hooks/use-devide-detect-media-query";
import { useSheetState } from "@genuin/components/hooks/use-sheet-state";
import { SafeSuspense } from "@genuin/components/molecules/error/safe-suspense";

import { DynamicReactionIcon } from "../../../reaction-button";
import { Stats } from "../../../stats";
import type { ControlLayerPropsType } from "../control-layer.types";
import { EmbedControls } from "../controls/embed";
import { OctoExpandSheet } from "../octo/octo-expand-sheet";

import { PlacementMetadata } from "./placement-metadata";

const Linkouts = lazy(() =>
  import("@genuin/components/organisms/linkouts").then((m) => ({
    default: m.Linkouts,
  }))
);

export { processVideoDescription } from "./placement-metadata";

export function DefaultPlacement({
  postDetails,
  className,
  isActive,
  onReactionStateChange,
  containerWidth,
  ...restProps
}: ControlLayerPropsType) {
  const { contentDisplay, responsive, view, engagement, isDesignSystemV2Linkouts } = useEmbedConfigs();
  const { isXs } = responsive;
  const { isMobile } = useDeviceDetectMediaQuery();
  const isOctoEnabled = engagement.engagementTools.octo && view.isFeed;
  const { octoVisible } = useSheetState();
  // Mirrors expand-view: hide the overlay content sections while Octo is on
  // screen, and bring them back the moment Octo closes.
  const isOctoVisible = isOctoEnabled && octoVisible;

  // Section details, clips count, and video details rendering live in the shared
  // PlacementMetadata component so the iheart control layer can reuse them.
  const { sectionDetails, noOfClips, videoDetails } = PlacementMetadata({ postDetails });

  const linkoutSection = useMemo(
    () => (
      <>
        {contentDisplay.showVideoLinkouts && postDetails.video?.linkouts && (
          <SafeSuspense fallback={null} errorFallback={null}>
            <Linkouts
              view="embed"
              {...(isDesignSystemV2Linkouts ? { variant: "dynamic" as const } : {})}
              layout="overlay"
              isActive={isActive}
              showImmediately
              linkouts={postDetails.video?.linkouts}
              linkoutId={postDetails.video?.linkoutId}
              videoDetails={postDetails.video}
            />
          </SafeSuspense>
        )}
      </>
    ),
    [contentDisplay.showVideoLinkouts, isActive, postDetails.video?.linkouts, isDesignSystemV2Linkouts]
  );

  const socialInteraction = useMemo(() => {
    const stats = {
      ...(contentDisplay.showViewCount && {
        Views: {
          value: 0,
          icon: <PlayIcon theme="dark" size="sm" strokeWidth={2} />,
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
              theme="dark"
              type="social_count"
            />
          ),
        },
      }),
      ...(contentDisplay.showCommentCount && {
        Comments: {
          value: postDetails.video?.commentCount ?? 0,
          icon: <CommentIcon theme="dark" size="sm" strokeWidth={3} />,
        },
      }),
    };

    // Don't render Stats if no stats are enabled
    if (Object.keys(stats).length === 0 || isXs) {
      return null;
    }

    return (
      <Stats
        className={cn("gencl:flex gencl:gap-2 gencl:justify-between gencl:items-center gencl:w-full")}
        valueClassName="gencl:text-body-2-medium"
        pairClassName="gencl:gap-1!"
        stats={stats}
      />
    );
  }, [
    contentDisplay.showViewCount,
    contentDisplay.showReactionCount,
    contentDisplay.showCommentCount,
    postDetails.video?.sparkCount,
    postDetails.video?.commentCount,
    isXs,
  ]);

  // Define layout sections with grouped conditions for better performance
  const layoutSections = useMemo(
    () => ({
      // While Octo is on screen the overlay text sections collapse (parity with
      // expand-view's `!isOctoVisible`); they re-render once Octo closes.
      top: isOctoVisible
        ? []
        : [
            contentDisplay.videoDetailsPosition === "overlay_on_top" && videoDetails,
            contentDisplay.sectionDetailsPosition === "overlay_on_top" && sectionDetails,
            contentDisplay.sectionDetailsPosition === "overlay_on_top" && noOfClips,
          ].filter(Boolean),
      bottom: isOctoVisible
        ? []
        : [
            contentDisplay.sectionDetailsPosition === "overlay_on_bottom" && noOfClips,
            contentDisplay.sectionDetailsPosition === "overlay_on_bottom" && sectionDetails,
            contentDisplay.videoDetailsPosition === "overlay_on_bottom" && videoDetails,
            contentDisplay.videoDetailsPosition === "overlay_on_bottom" && !isOctoEnabled && linkoutSection,
            contentDisplay.socialInteractionCountsPosition === "overlay_on_bottom" && socialInteraction,
          ].filter(Boolean),
    }),
    [
      contentDisplay,
      videoDetails,
      sectionDetails,
      noOfClips,
      linkoutSection,
      socialInteraction,
      isOctoEnabled,
      isOctoVisible,
    ]
  );

  return (
    <div className={cn("gencl:h-full gencl:relative", className)} {...restProps}>
      <div
        className="gencl:absolute gencl:w-full gencl:flex gencl:justify-between gencl:items-start gencl:gap-2 gencl:text-white gencl:top-0 gencl:p-2 gencl:bg-gradient-to-b gencl:from-black/50 gencl:to-transparent"
        onClick={(e) => e.stopPropagation()}>
        {/* Top Layout */}

        <div className="gencl:flex gencl:flex-col gencl:space-y-2 gencl:flex-1 gencl:min-w-0">
          {layoutSections.top.map((element, index) => (
            <div key={index}>{element}</div>
          ))}
        </div>

        {isActive && (
          <div className="gencl:shrink-0">
            <EmbedControls
              // Same source as the nav arrows and other player controls — a single
              // tile's own width, not the old isXs/isSm ceiling that could never
              // reach md/lg regardless of tile width.
              size={containerWidth ? resolveControlSize(containerWidth) : "sm"}
              section={postDetails.section}
            />
          </div>
        )}
      </div>

      {/* Bottom Layout */}
      <div className="gencl:absolute gencl:bottom-0 gencl:p-2 gencl:text-white gencl:w-full gencl:bg-gradient-to-t gencl:from-black/50 gencl:to-transparent">
        <div
          className={cn(
            "gencl:flex",
            isOctoEnabled ? "gencl:justify-end gencl:items-end" : "gencl:flex-col gencl:space-y-2"
          )}>
          {layoutSections.bottom.map((element, index) => (
            <div key={index}>{element}</div>
          ))}
          <OctoExpandSheet
            isActive={isActive ?? false}
            videoId={postDetails.video?.id ?? ""}
            videoSlug={postDetails.video?.slug ?? ""}
            isMobile={isMobile}
          />
        </div>
      </div>
    </div>
  );
}
