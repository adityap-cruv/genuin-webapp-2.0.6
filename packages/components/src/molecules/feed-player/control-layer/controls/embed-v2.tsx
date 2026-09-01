"use client";
import { ExpandIcon, MuteIcon, PauseIcon, PlayIcon, UnmuteIcon } from "@genuin/ui/icons";
import { CollapseIcon } from "@genuin/ui/icons";
import { IconCircleButton, type PlayerControlSize } from "@genuin/ui/player-controls";
import { cn } from "@genuin/ui/utils";
import { useEffect, useState, type ComponentProps } from "react";

import { useBaseContext } from "@genuin/components/context";
import { useEmbedContext } from "@genuin/components/context/embed";
import type { EmbedEventContextType } from "@genuin/components/context/embed/event-bus";
import { useEmbedConfigs } from "@genuin/components/hooks/embed/use-embed-config";
import { SDKEventEmitter, SDKEventName } from "@genuin/components/lib/sdk-event-emitter";
import type { PostDetailsType } from "@genuin/components/react-query/api/feed/schema";

import { usePlayerContext } from "../../context";

type EmbedControlsProps = ComponentProps<"div"> & {
  /** Size of the buttons. @default "sm" */
  size?: PlayerControlSize;
  section?: PostDetailsType["section"];
  videoId?: string;
  /** Whether the expand/collapse action is relevant in this presentation. */
  enableExpand?: boolean;
  /** Optional presentation-level action used instead of opening a new expand view. */
  onExpandClick?: () => void;
};

type EmbedButtonProps = {
  size?: PlayerControlSize;
};

type EmbedExpandButtonProps = EmbedButtonProps & {
  section?: PostDetailsType["section"];
  videoId?: string;
  onExpandClick?: () => void;
};

/** Mute/unmute toggle button styled for embed control bars. */
export function EmbedMuteButton({ size = "sm" }: EmbedButtonProps) {
  const { muted, toggleMuted } = usePlayerContext();
  const { volume } = useBaseContext();
  const volPct = muted ? 0 : Math.max(0, Math.min(100, volume));

  return (
    <IconCircleButton
      size={size}
      className="gencl:cursor-pointer"
      volPct={volPct}
      onClick={() => toggleMuted(true)}
      icon={muted ? <MuteIcon theme="dark" /> : <UnmuteIcon theme="dark" />}
    />
  );
}

/** Play/pause toggle button styled for embed control bars. */
export function EmbedPlayButton({ size = "sm" }: EmbedButtonProps) {
  const { playingState, togglePlay } = usePlayerContext();

  return (
    <IconCircleButton
      size={size}
      className="gencl:cursor-pointer"
      onClick={() => togglePlay(true)}
      icon={playingState === "PLAYING" ? <PauseIcon theme="dark" /> : <PlayIcon theme="fill-dark" />}
    />
  );
}

/** Expand/collapse button styled for embed control bars. */
export function EmbedExpandButton({ size = "sm", section, videoId, onExpandClick }: EmbedExpandButtonProps) {
  const { changeActivePlayerType, updateSelectedSection, embedEventBus } = useEmbedContext();
  const { brand_id } = useBaseContext().brandDetails;
  const [isExpandView, setIsExpandView] = useState(false);

  useEffect(() => {
    function handleActivePlayerTypeChange(_eventData: any, context: EmbedEventContextType) {
      setIsExpandView(context.activePlayerType === "expand-view");
    }

    embedEventBus.on("activePlayerTypeChange", handleActivePlayerTypeChange);
    return () => {
      embedEventBus.off("activePlayerTypeChange", handleActivePlayerTypeChange);
    };
  }, [embedEventBus]);

  return (
    <IconCircleButton
      size={size}
      className="gencl:cursor-pointer"
      aria-label={onExpandClick ? "Back to Feed View" : isExpandView ? "Collapse" : "Expand"}
      onClick={() => {
        if (onExpandClick) {
          onExpandClick();
          return;
        }

        changeActivePlayerType("expand-view");
        if (section) {
          updateSelectedSection(section);
        }

        if (!isExpandView) {
          SDKEventEmitter.emit(SDKEventName.VIDEO_CLICKED, {
            videoId: videoId ?? "",
          });

          const isBrandPeacock = brand_id === 3182;
          if (isBrandPeacock) {
            const nativeVideoHandler = (window as any).webkit?.messageHandlers?.openNativeVideo;
            if (nativeVideoHandler) {
              nativeVideoHandler.postMessage({
                source: "carousel",
                videoId: videoId ?? "",
              });
            }
          }
        }
      }}
      icon={!isExpandView ? <ExpandIcon theme="dark" /> : <CollapseIcon theme="dark" />}
    />
  );
}

export function EmbedControls({
  className,
  size = "sm",
  section,
  videoId,
  enableExpand = true,
  onExpandClick,
  ...restProps
}: EmbedControlsProps) {
  const config = useEmbedConfigs();

  return (
    <div className={cn("gencl:flex gencl:gap-1", className)} {...restProps}>
      <EmbedMuteButton size={size} />
      <EmbedPlayButton size={size} />
      {enableExpand && config.expandViewConfig.enable && (
        <EmbedExpandButton size={size} section={section} videoId={videoId} onExpandClick={onExpandClick} />
      )}
    </div>
  );
}
