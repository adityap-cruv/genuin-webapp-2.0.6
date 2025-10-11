"use client";
import { cn } from "@genuin/ui/utils";
import { type ComponentProps } from "react";

import {
  IHeartMuteIcon,
  IHeartPauseIcon,
  IHeartPlayIcon,
  IHeartShareIcon,
  IHeartUnmuteIcon,
} from "@genuin/ui/icons";
import { Button } from "@genuin/ui/components";
import { usePlayerContext } from "../../context";
import { ShareButton } from "@genuin/components/molecules/share-button";
import { useAnalytics } from "@genuin/components/context/analytics";
import { ReactionButton } from "@genuin/components/molecules/reaction-button";
import { DynamicReactionIcon } from "@genuin/components/molecules/reaction-button";

type IHeartControlsProps = ComponentProps<"div"> & {
  /**
   * Size of the buttons within the controls
   * @default "xs"
   */
  size?: "xs" | "sm" | "md" | "lg";
  /**
   * Variant of the controls layout
   * - "clip": Default horizontal layout without reaction icon
   * - "expand": Vertical layout with reaction icon at the top
   * @default "clip"
   */
  variant?: "clip" | "expand";
  /**
   * Data required for share and reaction functionality (same as Actions component)
   */
  contentId?: string;
  shareUrl?: string;
  slug?: string;
  isReacted?: boolean;
  reactionCount?: number;
  /**
   * Callback functions for handling control actions
   */
  onReactionStateChange?: (isReacted: boolean) => void;
};

export function IHeartControls({
  className,
  size = "xs",
  variant = "clip",
  contentId,
  shareUrl,
  slug,
  isReacted = false,
  reactionCount = 0,
  onReactionStateChange,
  ...restProps
}: IHeartControlsProps) {
  const { playingState, togglePlay, muted, toggleMuted } = usePlayerContext();
  const { track, EventName } = useAnalytics();

  const isExpand = variant === "expand";

  return (
    <div
      className={cn("gencl:flex", isExpand && "gencl:flex-col", className)}
      {...restProps}
    >
      {isExpand && (
        <ReactionButton
          shareUrl={shareUrl ?? ""}
          videoSlug={slug ?? ""}
          isReacted={isReacted}
          contentId={contentId ?? ""}
          reactionCount={reactionCount}
          contentType="VIDEO"
          onReactionStateChange={onReactionStateChange}
          reactionButtonTheme="dark"
          withCustomChildren
          asChild
          onClick={(e) => {
            e?.stopPropagation();
          }}
        >
          <Button
            theme="custom"
            variant="icon"
            className="gencl:w-11 gencl:h-11 gencl:p-0 gencl:flex gencl:items-center gencl:justify-center"
          >
            <DynamicReactionIcon
              isSparked={isReacted}
              sparkCount={reactionCount}
              theme="dark"
              iconHeight={24}
              iconWidth={24}
            />
          </Button>
        </ReactionButton>
      )}

      {/* {isExpand && (
        <Button
          theme="custom"
          variant="icon"
          className="gencl:w-11 gencl:h-11 gencl:p-0 gencl:flex gencl:items-center gencl:justify-center"
          onClick={() => {
            onReactionClick?.();
          }}
        >
          <IHeartReactionIcon theme="dark" size={size} />
        </Button>
      )} */}

      <Button
        theme="custom"
        variant="icon"
        className="gencl:w-11 gencl:h-11 gencl:p-0 gencl:flex gencl:items-center gencl:justify-center"
        onClick={() => {
          toggleMuted(true);
        }}
      >
        {muted ? (
          <IHeartMuteIcon theme="dark" size={size} />
        ) : (
          <IHeartUnmuteIcon theme="dark" size={size} />
        )}
      </Button>
      <Button
        theme="custom"
        variant="icon"
        className="gencl:w-11 gencl:h-11 gencl:p-0 gencl:flex gencl:items-center gencl:justify-center"
        onClick={() => {
          togglePlay(true);
        }}
      >
        {playingState === "PLAYING" ? (
          <IHeartPauseIcon theme="dark" size={size} />
        ) : (
          <IHeartPlayIcon theme="dark" size={size} />
        )}
      </Button>

      <ShareButton
        pathName={shareUrl ?? ""}
        withCustomChildren
        onClick={() => {
          // Track share event (same as Actions component)
          if (contentId) {
            track(EventName.VIDEO_SHARED, {
              content_id: contentId,
              content_category: "loop",
              event_record_screen: "feed",
              event_target_screen: "none",
            });
          }
        }}
      >
        <Button
          theme="custom"
          variant="icon"
          className="gencl:w-11 gencl:h-11 gencl:p-0 gencl:flex gencl:items-center gencl:justify-center"
        >
          <IHeartShareIcon theme="dark" size={size} />
        </Button>
      </ShareButton>
    </div>
  );
}
