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
import {
  SDKEventEmitter,
  SDKEventName,
} from "@genuin/components/lib/sdk-event-emitter";
import { useEmbedContext } from "@genuin/components/context";

type IHeartControlsProps = ComponentProps<"div"> & {
  /**
   * Size of the buttons within the controls
   * @default "xs"
   */
  size?: "xs" | "sm" | "md" | "lg" | "xl";
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
  slug?: string;
  isReacted?: boolean;
  reactionCount?: number;
  isActive: boolean;
  videoDescription?: string | null;
  /**
   * Callback functions for handling control actions
   */
  onReactionStateChange?: (isReacted: boolean) => void;
  index?: number;
};

export function IHeartControls({
  className,
  size = "xs",
  variant = "clip",
  isActive,
  contentId,
  slug,
  isReacted = false,
  reactionCount = 0,
  videoDescription,
  index,
  onReactionStateChange,
  ...restProps
}: IHeartControlsProps) {
  const { playingState, togglePlay, muted, toggleMuted } = usePlayerContext();
  const { track, EventName } = useAnalytics();
  const isExpand = variant === "expand";

  // Generate share URL with action=share parameter
  const generateShareUrl = (
    isExpand: boolean,
    slug?: string,
    contentId?: string
  ) => {
    let url = isExpand
      ? window.location.href
      : (() => {
          const baseUrl = window.location.href.replace(/\/$/, "");
          const hasHighlights = baseUrl.includes("/highlights");
          const highlightsPath = hasHighlights ? "" : "/highlights";
          return `${baseUrl}${highlightsPath}/${slug}_${contentId}`;
        })();

    // Add action=share query parameter if not already present
    if (!url.includes("action=share")) {
      const separator = url.includes("?") ? "&" : "?";
      url = `${url}${separator}action=share`;
    }

    return url;
  };

  const shareUrl = generateShareUrl(isExpand, slug, contentId);

  return (
    <div
      role="toolbar"
      aria-label="Media controls"
      aria-orientation={isExpand ? "vertical" : "horizontal"}
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
            aria-label={
              isReacted
                ? `Remove spark (${reactionCount} sparks)`
                : `Spark this video (${reactionCount} sparks)`
            }
            aria-pressed={isReacted}
            className="gencl:w-11 gencl:h-11 gencl:p-0 gencl:flex gencl:items-center gencl:justify-center"
          >
            <DynamicReactionIcon
              isSparked={isReacted}
              sparkCount={reactionCount}
              theme="dark"
              iconHeight={24}
              iconWidth={24}
              type="feed"
              aria-hidden="true"
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
        aria-label={muted ? "Unmute audio" : "Mute audio"}
        aria-pressed={muted}
        className="gencl:w-11 gencl:h-11 gencl:p-0 gencl:flex gencl:items-center gencl:justify-center"
        onClick={() => {
          toggleMuted(true);
        }}
      >
        {muted ? (
          <IHeartMuteIcon theme="dark" size={size} aria-hidden="true" />
        ) : (
          <IHeartUnmuteIcon theme="dark" size={size} aria-hidden="true" />
        )}
      </Button>
      <Button
        theme="custom"
        variant="icon"
        aria-label={playingState === "PLAYING" ? "Pause video" : "Play video"}
        aria-pressed={playingState === "PLAYING"}
        className="gencl:w-11 gencl:h-11 gencl:p-0 gencl:flex gencl:items-center gencl:justify-center"
        onClick={() => {
          togglePlay(true);
        }}
      >
        {playingState === "PLAYING" ? (
          <IHeartPauseIcon theme="dark" size={size} aria-hidden="true" />
        ) : (
          <IHeartPlayIcon theme="dark" size={size} aria-hidden="true" />
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
              title: videoDescription,
              content_category: "loop",
              event_record_screen: "feed",
              event_target_screen: "none",
            });
          }
          // Emit SDK share event
          SDKEventEmitter.emit(SDKEventName.SHARE, {
            shareUrl: shareUrl ?? "",
          });
        }}
      >
        <Button
          theme="custom"
          variant="icon"
          aria-label="Share video"
          className="gencl:w-11 gencl:h-11 gencl:p-0 gencl:flex gencl:items-center gencl:justify-center"
        >
          <IHeartShareIcon theme="dark" size={size} aria-hidden="true" />
        </Button>
      </ShareButton>
    </div>
  );
}
