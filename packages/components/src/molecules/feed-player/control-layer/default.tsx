import { ControlLayerPropsType } from "./control-layer.types";
import { cn } from "@genuin/ui/lib/utils";
import React, { useCallback } from "react";
import { useBaseContext } from "@genuin/components/context/base";

import { usePlayerContext } from "../context/context";
import { Controls } from "./controls/controls";
import { PlayingState } from "./playing-state";
import { Scrubber } from "./scrubber";
import { ExpandViewDetails } from "./expand-view";
import { PlaybackSpeedCapsule } from "@genuin/components/molecules/playback-speed/speed-capsule";
import { useGestureOverlayManager } from "@genuin/components/molecules/gestures";
import { Linkouts } from "@genuin/components/organisms/linkouts/linkouts";

export function Default({
  className,
  postDetails,
  isActive,
  showCloseButton,
  onCommunityJoinStatusChange,
  onGroupJoinStatusChange,
  onGroupSubscriptionChange,
  onReactionStateChange,
  variant,
  ...restProps
}: ControlLayerPropsType) {
  const { showExpandView, togglePlay, toggleMuted, muted } = usePlayerContext();
  const { gestureOverlayUI } = useGestureOverlayManager();
  const { showSeeker } = usePlayerContext();
  // const { hideGestureOverlay } = useGestureOverlayManager();

  const {
    brandDetails: {
      web_configs: { tap_behavior: tapBehavior, playback_speed_enabled },
    },
  } = useBaseContext();

  // Event handlers
  const handleVideoClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      // hideGestureOverlay("PLAY_PAUSE", muted);

      // if (isExpanded) {
      //   setIsExpanded(false);
      //   return;
      // }

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
    [muted]
  );

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
          className="gencl:group-hover:opacity-100 gencl:group-hover:pointer-events-auto gencl:opacity-0 gencl:pointer-events-none gencl:transition-opacity gencl:duration-300"
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
        {showExpandView ? (
          <ExpandViewDetails
            postDetails={postDetails}
            isActive={isActive}
            onCommunityJoinStatusChange={onCommunityJoinStatusChange}
            onGroupJoinStatusChange={onGroupJoinStatusChange}
            onGroupSubscriptionChange={onGroupSubscriptionChange}
            onReactionStateChange={onReactionStateChange}
            variant={variant}
          />
        ) : (
          <div
            className={cn(
              "gencl:absolute gencl:bottom-0 gencl:w-full gencl:p-2 gencl:transition-all",
              showSeeker && "gencl:bottom-4"
            )}
          >
            <Linkouts
              isActive={isActive}
              linkouts={postDetails.video.linkouts}
              linkoutId={postDetails.video.linkoutId}
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
          <PlaybackSpeedCapsule
            className={cn(
              "gencl:absolute gencl:z-10 gencl:transition-all",
              showExpandView ? "gencl:bottom-32" : "gencl:bottom-12"
            )}
          />
        )}

        {/**
         * This is basically player scrubber.
         */}
        <Scrubber
          spriteUrl={postDetails.video.thumbnailSprite ?? ""}
          className={cn(
            "gencl:absolute gencl:bottom-0 gencl:z-10 gencl:transition-all"
          )}
        />

        {gestureOverlayUI}
      </div>
    </>
  );
}
