import { cn } from "@genuin/ui/utils";
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

type ControlLayerPropsType = ComponentProps<"div"> & {
  postDetails: PostDetailsType;
  isInModal?: boolean;
  isActive: boolean;
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
  onCommunityJoinStatusChange,
  onGroupJoinStatusChange,
  onGroupSubscriptionChange,
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

  // const hideOnMobileByGesture = isMobile && playbackSpeed.isSpeedFromGesture;
  // const hideOnMobileBySlider = isMobile && playbackSpeed.speed !== 1;

  return (
    <>
      <div
        onClick={handleVideoClick}
        className={cn(
          "gencl:absolute gencl:inset-0 gencl:z-10 gencl:h-full gencl:w-full gencl:overflow-clip gencl:transition-all gencl:flex gencl:justify-center",
          // showSeeker && "gencl:-translate-y-4",
          // showScrubber ? "gencl:hidden" : "gencl:block",
          className
        )}
        {...restProps}
      >
        <Controls />
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
          <PlaybackSpeedCapsule className="gencl:absolute gencl:bottom-7 gencl:z-10 gencl:transition-all" />
        )}

        {/**
         * This is basically player scrubber.
         */}
        <Scrubber
          spriteUrl={postDetails.video.thumbnailSprite ?? ""}
          className={cn(
            "gencl:absolute gencl:bottom-0 gencl:z-10 gencl:transition-all"
            // showSeeker && "gencl:bottom-4"
          )}
        />

        {gestureOverlayUI}
      </div>
    </>
  );
});

// type MobileComponentsProps = {
//   postDetails: VideoPlayerModalType;
//   isExpanded?: boolean;
//   setIsExpanded?: React.Dispatch<React.SetStateAction<boolean>>;
//   showSeeker?: boolean;
// };

// function MobileComponents({
//   postDetails,
//   isExpanded,
//   showSeeker,
//   setIsExpanded,
// }: MobileComponentsProps) {
//   const { renderIn, shouldShowIHeartDemo, isIHeartPlaying } =
//     useIHeartDemoStates();
//   const { muted } = usePlayerControlStore(
//     useShallow((state) => ({
//       muted: state.muted,
//     }))
//   );
//   const showIHeartDemo = renderIn === "root" && shouldShowIHeartDemo;

//   return (
//     <>
//       <MobileDetails
//         postDetails={postDetails}
//         isActive
//         isExpanded={isExpanded}
//         setIsExpanded={setIsExpanded}
//       />
//       <CommentSheet postDetails={postDetails} />
//       {!isIHeartPlaying && showIHeartDemo && !muted && (
//         <img
//           src="https://media.begenuin.com/iheart_demo/equalizer.gif"
//           alt="gif"
//           className="absolute right-4 top-20 z-10 h-12 w-12"
//         />
//       )}
//     </>
//   );
// }
