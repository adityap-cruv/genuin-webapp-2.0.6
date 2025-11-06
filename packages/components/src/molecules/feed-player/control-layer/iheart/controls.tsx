"use client";
import { cn } from "@genuin/ui/utils";
import { useEffect, useState, type ComponentProps } from "react";

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
import { useBaseContext } from "@genuin/components/context";

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
  //  Access baseContextManager to subscribe to preview index change events
  const { baseContextManager } = useBaseContext();

  //  Track custom muted state for video preview (hover) mode
  // This state is separate from the actual player mute state and controls UI appearance only
  // When true, displays mute icon even if player is not actually muted
  const [customMuted, setCustomMuted] = useState(false);

  //  Listen for preview index changes to update custom mute UI state
  // When a video enters preview mode (hover), it should show as muted in the controls
  useEffect(() => {
    function handlePreviewIndexChanged(payload: any) {
      // Set customMuted to true when this video's index matches the preview index
      // This shows a muted icon during hover/preview without affecting actual audio state
      setCustomMuted(payload.previewIndex === index);
    }

    // Subscribe to preview index changes
    baseContextManager.on("onPreviewIndexChanged", handlePreviewIndexChanged);

    // Cleanup: unsubscribe when component unmounts or dependencies change
    return () => {
      baseContextManager.off(
        "onPreviewIndexChanged",
        handlePreviewIndexChanged
      );
    };
  }, [baseContextManager, index]);

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
      // role="toolbar"
      // aria-label="Media controls"
      // aria-orientation={isExpand ? "vertical" : "horizontal"}
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
          onClick={(e) => {
            e?.stopPropagation();
          }}
          className="gencl:w-11 gencl:h-11"
          tabIndex={-1}
        >
          <Button
            theme="custom"
            aria-label={
              isReacted ? `Thumb up, Pressed` : `Thumb up, Not pressed`
            }
            aria-pressed={isReacted}
            role="button"
            tabIndex={-1}
            variant="icon"
            className="gencl:w-11 gencl:h-11 gencl:p-0 gencl:flex gencl:items-center gencl:justify-center"
          >
            <DynamicReactionIcon
              isSparked={isReacted}
              sparkCount={reactionCount}
              theme="dark"
              iconHeight={24}
              iconWidth={24}
              type="feed"
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
        aria-label={muted ? "Mute, Pressed" : "Mute, Not pressed"}
        role="button"
        aria-pressed={muted}
        tabIndex={0}
        className="gencl:w-11 gencl:h-11 gencl:p-0 gencl:flex gencl:items-center gencl:justify-center"
        onClick={() => {
          toggleMuted(true, customMuted && !muted);
        }}
      >
        {muted || customMuted ? (
          <IHeartMuteIcon theme="dark" size={size} aria-hidden="true" />
        ) : (
          <IHeartUnmuteIcon theme="dark" size={size} aria-hidden="true" />
        )}
      </Button>

      <Button
        theme="custom"
        variant="icon"
        aria-label={
          playingState === "PLAYING" ? "Paused, Not pressed" : "Paused, Pressed"
        }
        role="button"
        aria-pressed={playingState !== "PLAYING"}
        tabIndex={0}
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
          aria-label="Share"
          role="button"
          tabIndex={0}
          className="gencl:w-11 gencl:h-11 gencl:p-0 gencl:flex gencl:items-center gencl:justify-center"
        >
          <IHeartShareIcon theme="dark" size={size} aria-hidden="true" />
        </Button>
      </ShareButton>
    </div>
  );
}
