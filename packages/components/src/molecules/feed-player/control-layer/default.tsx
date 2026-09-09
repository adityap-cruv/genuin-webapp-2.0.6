import { Button } from "@genuin/ui/button";
import { cn } from "@genuin/ui/lib/utils";
import { resolveControlSize, SPONSORED_TAG_SIZE } from "@genuin/ui/player-controls";
import React, { lazy, useCallback, useEffect, useRef, useState } from "react";

import { useAuthContext } from "@genuin/components/context";
import { useBaseContext } from "@genuin/components/context/base";
import { useEmbedConfigs } from "@genuin/components/hooks/embed/use-embed-config";
import { useDeviceDetection } from "@genuin/components/hooks/use-device-detection";
import { useDeviceDetectMediaQuery } from "@genuin/components/hooks/use-devide-detect-media-query";
import { useDoubleClick } from "@genuin/components/hooks/use-double-click";
import { useSheetState } from "@genuin/components/hooks/use-sheet-state";
import { SafeSuspense } from "@genuin/components/molecules/error/safe-suspense";
import { useGestureOverlayManager } from "@genuin/components/molecules/gestures";
import { shouldPromoteToPlayerExpand } from "@genuin/components/molecules/linkout-new/linkout-expand-promotion";
import { hasLinkouts } from "@genuin/components/molecules/linkout-new/linkout-utils";
import { PlaybackSpeedCapsule } from "@genuin/components/molecules/playback-speed/speed-capsule";
import { DynamicReactionIcon, ReactionButton } from "@genuin/components/molecules/reaction-button";

import { SpeedControlSideBars } from "../../playback-speed/speed-control-bars";
import { usePlayerContext } from "../context/context";

import type { ControlLayerPropsType } from "./control-layer.types";
import { Controls } from "./controls";
import { VideoEditActionButtons } from "./controls/control-buttons";
import { isSponsoredVideo } from "./controls/sponsored-tag";
import { PlayingState } from "./playing-state";
import { Scrubber } from "./scrubber";

const ExpandViewDetails = lazy(() =>
  import("./expand-view").then((m) => ({
    default: m.ExpandViewDetails,
  }))
);

const Linkouts = lazy(() =>
  import("@genuin/components/organisms/linkouts").then((m) => ({
    default: m.Linkouts,
  }))
);

export function Default({
  className,
  postDetails,
  isActive,
  showCloseButton,
  isSectioned,
  variant,
  onCommunityJoinStatusChange,
  onGroupJoinStatusChange,
  onGroupSubscriptionChange,
  onReactionStateChange,
  onCommentCountChange,
  clipVideo,
  editCover,
  enableExpand = true,
  editClipVideo,
  editCoverImage,
  expandViewDetails = true,
  containerWidth,
  containerHeight,
  ...restProps
}: ControlLayerPropsType) {
  const { brandDetails, playbackSpeed, isEmbed } = useBaseContext();
  const {
    showExpandView,
    toggleExpandView,
    togglePlay,
    toggleMuted,
    muted,
    showSeeker,
    totalVideos,
    positionIndex,
    pausedBySystem,
    resumeFromSystemPause,
  } = usePlayerContext();
  const { hideGestureOverlay } = useGestureOverlayManager();
  const { isMobile, isTablet, isIpad } = useDeviceDetection();
  // Viewport-based mobile signal (≤640px). UA-based isMobile/isTablet miss
  // DevTools responsive mode / narrow desktop windows, so the expand branch fell
  // through to the embed overlay and card titles rendered cut off. Rest of the
  // linkout pipeline already keys off this hook.
  const { isMobile: isViewportMobile } = useDeviceDetectMediaQuery();
  const embedConfig = useEmbedConfigs();
  const { user } = useAuthContext();
  const brandLayoutType = embedConfig.view.brandLayoutType;
  const { isDesignSystemV2Linkouts } = embedConfig;
  const { sheetState, sheetContentPlacements, getContentTypeState, setContentTypeState } = useSheetState();
  // Gates the in-player reflow (shrink video, hide controls + scrubber) for a
  // linkout grown to panel/full. Only when tiled OVER the video ("inside"); the
  // desktop right-rail ("outside") must keep controls. Mirrors player.tsx.
  const isLinkoutTiledInside = sheetContentPlacements["linkouts"] === "inside";
  const isSheetOpen = isLinkoutTiledInside && (sheetState === "panel-view" || sheetState === "full-view");

  // Tile view can't grow a panel/full sheet in place — promote the player into
  // expand view instead (matches web-sdk embed-tile.tsx). V2-only: panel/full
  // states only exist under V2, so V1 (incl. iHeart) is excluded without a
  // brand check.
  const linkoutsSheetState = getContentTypeState("linkouts");
  // Drag-sheet states (panel/full) are meaningless in the expand layout; both the
  // promote and exit paths reset them to expand-view. See GEN-10509.
  const capPanelFullToExpand = useCallback(() => {
    if (linkoutsSheetState === "panel-view" || linkoutsSheetState === "full-view") {
      setContentTypeState("linkouts", "expand-view");
    }
  }, [linkoutsSheetState, setContentTypeState]);
  // Previous linkout state kept in state (not a value-ref, per repo convention).
  // `shouldPromoteToPlayerExpand` needs the prior state to tell a user drag
  // (`default-active` → `expand-view`) apart from the timed auto-advance
  // (`default` → `expand-view`) — only the former promotes.
  const [prevLinkoutsSheetState, setPrevLinkoutsSheetState] = useState(linkoutsSheetState);
  useEffect(() => {
    if (prevLinkoutsSheetState === linkoutsSheetState) return; // no transition this render
    const prev = prevLinkoutsSheetState;
    setPrevLinkoutsSheetState(linkoutsSheetState); // record for the next transition
    if (!isDesignSystemV2Linkouts || !isActive || showExpandView) return;
    if (shouldPromoteToPlayerExpand(prev, linkoutsSheetState)) {
      // Cap before promoting: player.tsx's height calc reads the stale full-view
      // state and collapses the video to ~0. Matches SDK expand-view-loader.tsx.
      capPanelFullToExpand();
      toggleExpandView?.();
    }
  }, [
    linkoutsSheetState,
    prevLinkoutsSheetState,
    isActive,
    showExpandView,
    toggleExpandView,
    isDesignSystemV2Linkouts,
    capPanelFullToExpand,
  ]);

  // Exit-cap (GEN-10509): when expand view collapses, a linkout left at
  // panel/full-view stays stuck (openContentType preserves it) and keeps the
  // header/controls hidden. Cap it back to expand-view — the fresh-tile resting
  // state. V2 only.
  const [prevShowExpandView, setPrevShowExpandView] = useState(showExpandView);
  useEffect(() => {
    if (prevShowExpandView === showExpandView) return; // no expand transition
    const wasExpanded = prevShowExpandView;
    setPrevShowExpandView(showExpandView);
    if (!wasExpanded || showExpandView || !isDesignSystemV2Linkouts) return; // only expand → collapse
    capPanelFullToExpand();
  }, [showExpandView, prevShowExpandView, isDesignSystemV2Linkouts, capPanelFullToExpand]);

  // Ref to programmatically trigger reaction button click
  const reactionButtonRef = useRef<HTMLButtonElement>(null);

  // State for showing reaction icon temporarily on double-click
  const [showReactionIcon, setShowReactionIcon] = useState(false);

  // Use the useDoubleClick hook for iheart layout
  const handleIHeartClick = useDoubleClick({
    delay: 300,
    onSingleClick: () => handleVideoClick({ stopPropagation: () => {} } as React.MouseEvent),
    onDoubleClick: () => {
      // Only handle double-click on mobile or tablet
      if (!(isMobile || isTablet) || !user) return;
      // Show reaction icon
      setShowReactionIcon(true);

      // Hide reaction icon after 1 seconds with fade
      setTimeout(() => {
        setShowReactionIcon(false);
      }, 1000);

      // Programmatically trigger reaction button click only if not already sparked
      if (!postDetails.video?.isSparked && reactionButtonRef.current) {
        reactionButtonRef.current.click();
      }
    },
  });

  // Extract properties with fallbacks to prevent undefined errors
  const tapBehavior = brandDetails?.web_configs?.tap_behavior || 1; // Default to 1 if undefined
  const playback_speed_enabled = brandDetails?.web_configs?.playback_speed_enabled || false;

  // Event handlers
  const handleVideoClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();

      if (postDetails.video?.clickableUrl) {
        window.open(postDetails.video.clickableUrl ?? undefined, "_blank");
        return;
      }

      if (pausedBySystem) {
        resumeFromSystemPause();
        return;
      }

      hideGestureOverlay("PLAY_PAUSE", muted);

      const effectiveTapBehavior = brandDetails?.brand_id === 1729 ? 3 : tapBehavior;

      switch (effectiveTapBehavior) {
        case 1: // Tap to mute/unmute
          toggleMuted(true);
          // setButtonAction(muted ? "UNMUTE" : "MUTE");
          break;

        case 2: // Tap to play/pause
          togglePlay(true);
          // setButtonAction(feedPlayerShouldPlay ? "PAUSE" : "PLAY");
          break;

        case 3: // Tap to unmute and then play/pause
          if (muted) {
            toggleMuted(true);
          } else {
            togglePlay(true);
          }
          break;
      }
    },
    [
      muted,
      togglePlay,
      toggleMuted,
      brandDetails?.brand_id,
      hideGestureOverlay,
      pausedBySystem,
      postDetails.video?.clickableUrl,
      resumeFromSystemPause,
      tapBehavior,
    ]
  );

  const { video } = postDetails;
  if (!video) return null;

  const isSponsored = isSponsoredVideo(video);

  const hideControlsThreshold = embedConfig.isDesignSystemV2 ? 151 : 200;
  const hidePlayerControls =
    isEmbed && containerWidth ? ((containerWidth ?? 0) < hideControlsThreshold ? true : false) : false;
  // DS v2 sizes controls off the actual player container width (the `containerWidth`
  // prop, e.g. `swiper.width` from player.tsx) for BOTH the collapsed tile and the
  // expand view. Expand view previously sized off `window.innerWidth`, which resolved
  // to `lg` (48px) on any wide browser window even for a narrow placement — oversizing
  // the control cluster and the volume slider (GEN-10346 Issue-1 / GEN-10349).
  // NOTE: this is `Default` — the webapp (non-embed) control layer, never rendered
  // inside an `EmbedProvider` — so `embedConfig.responsive.controlSize` (which reads
  // `rootElement` off the EmbedContext) is always stuck at `resolveControlSize(0)` =
  // "xs" here. Use the local `containerWidth` prop directly instead, matching the fix
  // already applied to default-placement.tsx / ad.tsx / *-embed.tsx.
  const rawControlSize = embedConfig.isDesignSystemV2
    ? containerWidth
      ? resolveControlSize(containerWidth)
      : "lg"
    : "lg";
  // GEN-10468: Expand View's own container is taller than a feed tile, so a
  // 9:16 video routinely renders past 600px wide on desktop — pushing the
  // corner mute/volume cluster into "lg" (48px / 160px slider) even though
  // Figma's Expand View spec calls for "md" (32px / 120px slider). Cap only
  // in Expand View; the tile scale itself is already Figma-verified across
  // all 5 buckets.
  const effectiveControlSize = showExpandView && rawControlSize === "lg" ? "md" : rawControlSize;
  // GEN-10465: the center play/pause icon always reads at least `lg` — it
  // doesn't shrink to `xs`/`sm`/`md` at narrow tile widths like the corner
  // control cluster does.
  const playingStateSize = "xl";

  switch (brandLayoutType) {
    case "iheart":
      return (
        <div
          onClick={handleIHeartClick}
          className={cn(
            "group gencl:inset-0 gencl:z-10 gencl:flex gencl:justify-center",
            "gencl:appearance-none gencl:border-0 gencl:bg-transparent gencl:p-0 gencl:cursor-pointer gencl:w-full",
            className
          )}
          {...restProps}>
          {/* Top gradient overlay (10% height) */}
          <div
            className="gencl:absolute gencl:top-0 gencl:left-0 gencl:right-0 gencl:pointer-events-none"
            style={{
              height: "10%",
              background:
                "linear-gradient(to bottom, rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 0.4) 50%, rgba(0, 0, 0, 0) 100%)",
            }}
          />

          {/* Bottom gradient overlay (40% height) */}
          <div
            className="gencl:absolute gencl:bottom-0 gencl:left-0 gencl:right-0 gencl:pointer-events-none"
            style={{
              height: "40%",
              background:
                "linear-gradient(to top, rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 0.6) 25%, rgba(0, 0, 0, 0.45) 50%, rgba(0, 0, 0, 0.25) 75%, rgba(0, 0, 0, 0) 100%)",
            }}
          />

          {(showExpandView || isMobile || isTablet || isViewportMobile) && expandViewDetails && (
            <SafeSuspense fallback={null} errorFallback={null}>
              <ExpandViewDetails
                postDetails={postDetails}
                isActive={isActive}
                onCommunityJoinStatusChange={onCommunityJoinStatusChange}
                onGroupJoinStatusChange={onGroupJoinStatusChange}
                onGroupSubscriptionChange={onGroupSubscriptionChange}
                onReactionStateChange={onReactionStateChange}
                onCommentCountChange={onCommentCountChange}
                variant={variant}
                className={cn(playbackSpeed.speed !== 1 && "gencl:invisible")}
                // Webapp has no `EmbedProvider`; forward the real tile size so the
                // in-expand linkout reveal gates see real numbers, not 0.
                containerWidth={containerWidth}
                containerHeight={containerHeight}
              />
            </SafeSuspense>
          )}
          <PlayingState
            showOnlyPlayAction={true}
            size={playingStateSize}
            className={cn(
              "gencl:absolute gencl:left-1/2 gencl:top-1/2 gencl:flex gencl:items-center",
              "gencl:justify-center gencl:h-16 gencl:w-16",
              "gencl:-translate-x-1/2 gencl:-translate-y-1/2"
            )}
          />
          {/* Large reaction icon on double-click */}
          {showReactionIcon && (
            <DynamicReactionIcon
              isSparked={video.isSparked ?? false}
              sparkCount={video.sparkCount}
              type="feed_animate"
              iconHeight={185}
              iconWidth={185}
              theme="light"
              className={cn(
                "gencl:absolute gencl:left-1/2 gencl:top-1/2 gencl:-translate-x-1/2 gencl:-translate-y-1/2 gencl:z-20",
                "gencl:delay-1000 gencl:animate-fade-out gencl:transition-all gencl:duration-700 gencl:ease-out"
              )}
            />
          )}
          {/* This is invisible button for reactions */}
          <ReactionButton
            contentId={video.id}
            isReacted={video.isSparked ?? false}
            reactionCount={video.sparkCount}
            contentType="VIDEO"
            onReactionStateChange={(isReacted) => onReactionStateChange?.(video.id, video.slug, isReacted)}
            onClick={(e) => {
              e?.stopPropagation();
            }}
            asChild
            withCustomChildren
            tabIndex={-1}
            aria-hidden={true}>
            <Button ref={reactionButtonRef} className="gencl:opacity-0" aria-hidden={true} tabIndex={-1} />
          </ReactionButton>

          {/* {gestureOverlayUI} */}
        </div>
      );

    case "grubhub":
    case "ted":
    case "walmart":
    case "default":
    default:
      return (
        <>
          <div
            onClick={handleVideoClick}
            className={cn(
              "group gencl:inset-0 gencl:z-10 gencl:flex gencl:justify-center",
              // Linkout panel/full-view: Player.tsx shrinks the video, so this
              // wrapper needs `flex-1 min-h-0 flex-col` to give expand-view-details a
              // parent height to grow into (else the sheet stays at panel-view size).
              isSheetOpen && "gencl:flex-1 gencl:min-h-0 gencl:flex-col",
              // showSeeker && "gencl:-translate-y-4",
              // showScrubber ? "gencl:hidden" : "gencl:block",
              className
            )}
            {...restProps}>
            <Controls
              showCloseButton={showCloseButton}
              enableExpand={enableExpand}
              className={cn(
                isMobile || isTablet || isIpad
                  ? `${!isSectioned && showExpandView && "gencl:top-0"}`
                  : "gencl:group-hover:opacity-100 gencl:group-hover:pointer-events-auto gencl:opacity-0 gencl:pointer-events-none gencl:transition-opacity gencl:duration-300",
                isSponsored && !isMobile && !embedConfig.isDesignSystemV2 && "gencl:left-0 gencl:w-[calc(100%-134px)]",
                isSheetOpen && "gencl:hidden"
              )}
              variant={isSectioned ? "sectioned" : "default"}
              size={effectiveControlSize}
              isSponsored={isSponsored}
              hidePlayerControls={hidePlayerControls}
            />

            {/* Sponsored badge sits outside Controls so desktop hover opacity-0 doesn't hide it. */}
            {isSponsored && !isMobile && (
              <div
                className={cn(
                  "gencl:absolute gencl:top-4 gencl:z-50",
                  embedConfig.isDesignSystemV2
                    ? "gencl:left-4 gencl:bg-white gencl:rounded-3xl gencl:flex-center gencl:text-gray-900 gencl:px-2! gencl:py-1!"
                    : "gencl:right-4 gencl:bg-black/40 gencl:px-4 gencl:rounded-[50px] gencl:flex-center gencl:text-white",
                  !embedConfig.isDesignSystemV2 && (isMobile || isTablet || isIpad ? "gencl:h-9" : "gencl:h-12")
                )}
                style={
                  embedConfig.isDesignSystemV2
                    ? {
                        backdropFilter: "blur(7.5px)",
                        // fit-content, not the token's fixed px width — see sponsored-tag.tsx.
                        width: "fit-content",
                        height: SPONSORED_TAG_SIZE[effectiveControlSize].height,
                      }
                    : undefined
                }>
                <p
                  className={
                    embedConfig.isDesignSystemV2
                      ? SPONSORED_TAG_SIZE[effectiveControlSize].text
                      : "gencl:text-body-1-normal"
                  }>
                  Sponsored
                </p>
              </div>
            )}

            {/* this is wallet badge for wallet. */}
            {/* {isInModal && (
        <div
          className={cn(
            "gencl:absolute gencl:right-2 gencl:top-20 gencl:h-fit gencl:w-fit gencl:cursor-pointer gencl:md:right-6 gencl:md:top-6"
          )}
        >
          <WalletAmountBadge type="light" />
        </div>
      )} */}

            {/** These are play back speed controls. */}
            {/* <PlaybackControls /> */}

            {/**
             * This is the expand view details.
             * It will show the details of the post. If post is expanded.
             */}
            {(showExpandView || isMobile || isTablet || isViewportMobile) && expandViewDetails ? (
              <SafeSuspense fallback={null} errorFallback={null}>
                <ExpandViewDetails
                  postDetails={postDetails}
                  isActive={isActive}
                  onCommunityJoinStatusChange={onCommunityJoinStatusChange}
                  onGroupJoinStatusChange={onGroupJoinStatusChange}
                  onGroupSubscriptionChange={onGroupSubscriptionChange}
                  onReactionStateChange={onReactionStateChange}
                  onCommentCountChange={onCommentCountChange}
                  variant={variant}
                  className={cn(playbackSpeed.speed !== 1 && "gencl:hidden gencl:transition-all")}
                  // Webapp has no `EmbedProvider`; forward the real tile size so the
                  // in-expand linkout reveal gates see real numbers, not 0.
                  containerWidth={containerWidth}
                  containerHeight={containerHeight}
                />
              </SafeSuspense>
            ) : (
              <div
                className={cn(
                  "gencl:absolute gencl:bottom-0 gencl:w-full gencl:p-2 gencl:transition-all",
                  showSeeker && "gencl:bottom-4",
                  playbackSpeed.speed !== 1 && "gencl:hidden"
                )}>
                {/**
                 * This section renders the video interaction buttons:
                 * - "Trim" button if `clipVideo` is enabled
                 * - "Edit Cover" button if `editCover` is enabled
                 *
                 * Both buttons trigger the same `editClipVideo` callback with the source URL
                 */}
                <VideoEditActionButtons
                  clipVideo={clipVideo}
                  editCover={editCover}
                  onClickClip={() => editClipVideo?.(video.source)}
                  onClickEditCover={() => editCoverImage?.(video.source)}
                />

                {/* Non-empty only: `[]` is truthy, so a bare `video.linkouts &&`
                    mounts the lazy <Linkouts> chunk for no-linkout videos. */}
                {hasLinkouts(video) && (
                  <SafeSuspense fallback={null} errorFallback={null}>
                    <Linkouts
                      isActive={isActive}
                      view="embed"
                      {...(embedConfig.isDesignSystemV2Linkouts ? { variant: "dynamic" as const } : {})}
                      layout="overlay"
                      linkouts={video.linkouts}
                      linkoutId={video.linkoutId}
                      videoDetails={postDetails.video}
                      totalVideos={totalVideos}
                      positionIndex={positionIndex}
                      autoplay={embedConfig.video.videoAutoplay}
                      // Webapp never wraps in `EmbedProvider`, so `useEmbedConfigs().responsive`
                      // (effectiveVideoWidth/containerHeight) is always 0 there — override with the
                      // real player tile size (same fix as `effectiveControlSize` above) so the
                      // scenario picker and the 50% reveal gate see real numbers instead of locking
                      // into the chip-only bucket / failing open.
                      effectiveVideoWidth={containerWidth}
                      containerHeight={containerHeight}
                    />
                  </SafeSuspense>
                )}
              </div>
            )}

            {/**
             * This is the player's state whether it is playing or paused or buffering.
             */}
            <PlayingState
              size={playingStateSize}
              className={cn(
                "gencl:absolute gencl:left-1/2 gencl:top-1/2 gencl:flex gencl:items-center",
                "gencl:justify-center gencl:h-16 gencl:w-16",
                "gencl:-translate-x-1/2 gencl:-translate-y-1/2"
              )}
            />

            {/* This is the playback speed controls for the desktop. */}
            {playback_speed_enabled && (
              <>
                <PlaybackSpeedCapsule
                  className={cn(
                    "gencl:absolute gencl:z-10 gencl:transition-all gencl:bottom-12"
                    // showExpandView ? "gencl:bottom-32" : "gencl:bottom-12"
                  )}
                />
                <SpeedControlSideBars />
              </>
            )}

            {/**
             * This is basically player scrubber.
             */}
            <Scrubber
              spriteUrl={video.thumbnailSprite ?? ""}
              duration={video.duration}
              className={cn(
                "gencl:absolute gencl:bottom-0 gencl:z-20 gencl:transition-all",
                showSeeker && "gencl:mx-auto gencl:px-4 gencl:-translate-y-2 gencl:pb-3 gencl:py-1.5",
                isSheetOpen && "gencl:hidden"
              )}
            />

            {/* {gestureOverlayUI} */}
          </div>
        </>
      );
  }
}
