import { cn } from "@genuin/ui/lib/utils";
import React, { memo, useCallback, type ComponentProps } from "react";
import { useBaseContext } from "@genuin/components/context/base";
import type { PostDetailsType } from "@genuin/components/react-query/api/feed/schema";

import { usePlayerContext } from "../context/context";
import { Controls } from "./controls";
import { PlayingState } from "./playing-state";
import { Scrubber } from "./scrubber";
import { ExpandViewDetails } from "./expand-view";
import { PlaybackSpeedCapsule } from "@genuin/components/molecules/playback-speed/speed-capsule";
import { useGestureOverlayManager } from "@genuin/components/molecules/gestures";
import { LinkOutContentRenderer } from "@genuin/components/organisms/linkouts/linkouts-details";
import { useDeviceDetectMediaQuery } from "@genuin/components/hooks/use-devide-detect-media-query";
import { useFeedContext } from "@genuin/components/templates/feed/context";
import { SpeedControlSideBars } from "../../playback-speed/speed-control-bars";

type ControlLayerPropsType = ComponentProps<"div"> & {
  postDetails: PostDetailsType;
  isInModal?: boolean;
  isActive: boolean;
  showCloseButton?: boolean;
  onReactionStateChange?: (videoId: string, isReacted: boolean) => void;
  onGroupJoinStatusChange?: ComponentProps<
    typeof ExpandViewDetails
  >["onGroupJoinStatusChange"];
  onGroupSubscriptionChange?: ComponentProps<
    typeof ExpandViewDetails
  >["onGroupSubscriptionChange"];
  onCommunityJoinStatusChange?: ComponentProps<
    typeof ExpandViewDetails
  >["onCommunityJoinStatusChange"];
};

/**
 * This control layer is only inteded to use for feed player.
 */
export const ControlLayer = memo(function ControlLayer({
  postDetails,
  className,
  isActive,
  showCloseButton,
  onCommunityJoinStatusChange,
  onGroupJoinStatusChange,
  onGroupSubscriptionChange,
  onReactionStateChange,
  ...restProps
}: ControlLayerPropsType) {
  const { showExpandView, togglePlay, toggleMuted, muted } = usePlayerContext();
  const { gestureOverlayUI, hideGestureOverlay } = useGestureOverlayManager();
  const { showSeeker } = usePlayerContext();
  const { isDesktop, isMobile } = useDeviceDetectMediaQuery();
  const { playbackSpeed } = useFeedContext();

  const {
    brandDetails: {
      web_configs: { tap_behavior: tapBehavior, playback_speed_enabled },
    },
  } = useBaseContext();

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
          break;

        case 2: // Tap to play/pause
          togglePlay(true);
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

  // const hideOnMobileByGesture = isMobile && playbackSpeed.isSpeedFromGesture;
  // const hideOnMobileBySlider = isMobile && playbackSpeed.speed !== 1;

  return (
    <>
      <div
        onClick={handleVideoClick}
        className={cn(
          "gencl:absolute group gencl:inset-0 gencl:z-10 gencl:h-full",
          "gencl:w-full gencl:overflow-clip gencl:transition-all gencl:flex gencl:justify-center",
          className
        )}
        {...restProps}
      >
        <Controls
          className={cn({ "gencl:group-hover:flex gencl:hidden": !isMobile })}
          showCloseButton={showCloseButton}
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

        {/**
         * This is the expand view details.
         * It will show the details of the post. If post is expanded.
         * iIf Playback speed is not 1 then it will not show the expand view details.
         */}
        {playbackSpeed.speed !== 1 ? undefined : showExpandView ||
          !isDesktop ? (
          <ExpandViewDetails
            postDetails={postDetails}
            isActive={isActive}
            onCommunityJoinStatusChange={onCommunityJoinStatusChange}
            onGroupJoinStatusChange={onGroupJoinStatusChange}
            onGroupSubscriptionChange={onGroupSubscriptionChange}
            onReactionStateChange={onReactionStateChange}
          />
        ) : (
          <div
            className={cn(
              "gencl:absolute gencl:bottom-0 gencl:w-full gencl:p-2 gencl:transition-all",
              showSeeker && "gencl:bottom-4"
            )}
          >
            <LinkOutContentRenderer
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
          <>
            <PlaybackSpeedCapsule
              className={cn(
                "gencl:absolute gencl:z-10 gencl:transition-all",
                showExpandView ? "gencl:bottom-32" : "gencl:bottom-12"
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
          className={cn(
            "gencl:absolute gencl:bottom-0 gencl:z-20 gencl:transition-all"
          )}
        />

        {gestureOverlayUI}
      </div>
    </>
  );
});
