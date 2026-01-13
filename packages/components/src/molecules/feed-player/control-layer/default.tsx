import { ControlLayerPropsType } from "./control-layer.types";
import { cn } from "@genuin/ui/lib/utils";
import React, { useCallback, Suspense } from "react";
import { useBaseContext } from "@genuin/components/context/base";

import { usePlayerContext } from "../context/context";
import { Controls } from "./controls";
import { PlayingState } from "./playing-state";
import { Scrubber } from "./scrubber";
const ExpandViewDetails = React.lazy(() =>
  import("./expand-view").then((m) => ({ default: m.ExpandViewDetails }))
) as React.ComponentType<any>;

import { PlaybackSpeedCapsule } from "@genuin/components/molecules/playback-speed/speed-capsule";
import { useGestureOverlayManager } from "@genuin/components/molecules/gestures";
import { Linkouts } from "@genuin/components/organisms/linkouts";
import { SpeedControlSideBars } from "../../playback-speed/speed-control-bars";
import { VideoEditActionButtons } from "./controls/control-buttons";
import { useEmbedConfigs } from "@genuin/components/hooks/embed/use-embed-config";
import {
  DynamicReactionIcon,
  ReactionButton,
} from "@genuin/components/molecules/reaction-button";
import { Button } from "@genuin/ui/button";
import { useDoubleClick } from "@genuin/components/hooks/use-double-click";
import { useAuthContext } from "@genuin/components/context";
import { Toaster } from "@genuin/ui";
import { useDeviceDetection } from "@genuin/components/hooks/use-device-detection";

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
  onSwiperToggle,
  clipVideo,
  editCover,
  enableExpand = true,
  editClipVideo,
  editCoverImage,
  expandViewDetails = true,
  ...restProps
}: ControlLayerPropsType) {
  const { brandDetails, playbackSpeed } = useBaseContext();
  const {
    showExpandView,
    togglePlay,
    toggleMuted,
    muted,
    showSeeker,
    totalVideos,
    positionIndex,
  } = usePlayerContext();
  const { gestureOverlayUI, hideGestureOverlay } = useGestureOverlayManager();
  const { isMobile, isTablet, isIpad } = useDeviceDetection();
  const embedConfig = useEmbedConfigs();
  const { user } = useAuthContext();
  const brandLayoutType = embedConfig.view.brandLayoutType;

  // Ref to programmatically trigger reaction button click
  const reactionButtonRef = React.useRef<HTMLButtonElement>(null);

  // State for showing reaction icon temporarily on double-click
  const [showReactionIcon, setShowReactionIcon] = React.useState(false);

  // Use the useDoubleClick hook for iheart layout
  const handleIHeartClick = useDoubleClick({
    delay: 300,
    onSingleClick: () => {
      // Single click - toggle play
      togglePlay(true);
    },
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
      if (!postDetails.video.isSparked && reactionButtonRef.current) {
        reactionButtonRef.current.click();
      }
    },
  });

  // Extract properties with fallbacks to prevent undefined errors
  const tapBehavior = brandDetails?.web_configs?.tap_behavior || 1; // Default to 1 if undefined
  const playback_speed_enabled =
    brandDetails?.web_configs?.playback_speed_enabled || false;

  // Event handlers
  const handleVideoClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      hideGestureOverlay("PLAY_PAUSE", muted);

      if (postDetails.video.clickableUrl) {
        window.open(postDetails.video.clickableUrl, "_blank");
        return;
      }

      switch (tapBehavior) {
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
    [muted, togglePlay, toggleMuted]
  );

  switch (brandLayoutType) {
    case "iheart":
      return (
        <>
          <div
            // aria-label="Toggle video playback"
            onClick={handleIHeartClick}
            className={cn(
              "group gencl:inset-0 gencl:z-10 gencl:flex gencl:justify-center",
              "gencl:appearance-none gencl:border-0 gencl:bg-transparent gencl:p-0 gencl:cursor-pointer gencl:w-full",
              className
            )}
            {...restProps}
          >
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

            {(showExpandView || isMobile || isTablet) && expandViewDetails && (
              <Suspense fallback={null}>
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
                />
              </Suspense>
            )}
            <PlayingState
              showOnlyPlayAction={true}
              className={cn(
                "gencl:absolute gencl:left-1/2 gencl:top-1/2 gencl:flex gencl:items-center",
                "gencl:justify-center gencl:h-16 gencl:w-16",
                "gencl:-translate-x-1/2 gencl:-translate-y-1/2"
              )}
            />
            {/* Large reaction icon on double-click */}
            {showReactionIcon && (
              <DynamicReactionIcon
                isSparked={postDetails.video.isSparked ?? false}
                sparkCount={postDetails.video.sparkCount}
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
              contentId={postDetails.video.id}
              isReacted={postDetails.video.isSparked ?? false}
              reactionCount={postDetails.video.sparkCount}
              contentType="VIDEO"
              onReactionStateChange={(isReacted) =>
                onReactionStateChange?.(
                  postDetails.video.id,
                  postDetails.video.slug,
                  isReacted
                )
              }
              onClick={(e) => {
                e?.stopPropagation();
              }}
              asChild
              withCustomChildren
              tabIndex={-1}
              aria-hidden={true}
              children={
                <Button
                  ref={reactionButtonRef}
                  className="gencl:opacity-0"
                  aria-hidden={true}
                  tabIndex={-1}
                />
              }
            />

            {/* {gestureOverlayUI} */}
          </div>
        </>
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
              // showSeeker && "gencl:-translate-y-4",
              // showScrubber ? "gencl:hidden" : "gencl:block",
              className
            )}
            {...restProps}
          >
            <Controls
              showCloseButton={showCloseButton}
              enableExpand={enableExpand}
              className={cn(
                isMobile || isTablet || isIpad
                  ? `${!isSectioned && showExpandView && "gencl:top-0"}`
                  : "gencl:group-hover:opacity-100 gencl:group-hover:pointer-events-auto gencl:opacity-0 gencl:pointer-events-none gencl:transition-opacity gencl:duration-300"
              )}
              variant={isSectioned ? "sectioned" : "default"}
            />

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
            {(showExpandView || isMobile || isTablet) && expandViewDetails ? (
              <Suspense fallback={null}>
                <ExpandViewDetails
                  postDetails={postDetails}
                  isActive={isActive}
                  onCommunityJoinStatusChange={onCommunityJoinStatusChange}
                  onGroupJoinStatusChange={onGroupJoinStatusChange}
                  onGroupSubscriptionChange={onGroupSubscriptionChange}
                  onReactionStateChange={onReactionStateChange}
                  onCommentCountChange={onCommentCountChange}
                  variant={variant}
                  className={cn(
                    playbackSpeed.speed !== 1 &&
                      "gencl:hidden gencl:transition-all"
                  )}
                />
              </Suspense>
            ) : (
              <div
                className={cn(
                  "gencl:absolute gencl:bottom-0 gencl:w-full gencl:p-2 gencl:transition-all",
                  showSeeker && "gencl:bottom-4",
                  playbackSpeed.speed !== 1 && "gencl:hidden"
                )}
              >
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
                  onClickClip={() => editClipVideo?.(postDetails.video.source)}
                  onClickEditCover={() =>
                    editCoverImage?.(postDetails.video.source)
                  }
                />

                <Linkouts
                  isActive={isActive}
                  linkouts={postDetails.video.linkouts}
                  linkoutId={postDetails.video.linkoutId}
                  videoDetails={postDetails.video}
                  totalVideos={totalVideos}
                  positionIndex={positionIndex}
                  autoplay={embedConfig.video.videoAutoplay}
                />
              </div>
            )}

            {/**
             * This is the player's state whether it is playing or paused or buffering.
             */}
            <PlayingState
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
              spriteUrl={postDetails.video.thumbnailSprite ?? ""}
              duration={postDetails.video.duration}
              className={cn(
                "gencl:absolute gencl:bottom-0 gencl:z-20 gencl:transition-all",
                showSeeker &&
                  "gencl:mx-auto gencl:px-4 gencl:-translate-y-2 gencl:pb-3 gencl:py-1.5"
              )}
            />

            {gestureOverlayUI}
          </div>
        </>
      );
  }
}
