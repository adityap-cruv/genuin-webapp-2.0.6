"use client";
import { Button } from "@genuin/ui/components/button";
import { ExpandIconOld, MuteIconOld, PauseIconOld, PlayIconOld, UnmuteIconOld } from "@genuin/ui/icons";
import { CollapseIconOld } from "@genuin/ui/icons";
import { cn } from "@genuin/ui/utils";
import { useEffect, useState, type ComponentProps } from "react";

import { useBaseContext } from "@genuin/components/context";
import { useEmbedContext } from "@genuin/components/context/embed";
import type { EmbedEventContextType } from "@genuin/components/context/embed/event-bus";
import { useEmbedConfigs } from "@genuin/components/hooks/embed/use-embed-config";
import { SDKEventEmitter, SDKEventName } from "@genuin/components/lib/sdk-event-emitter";
import type { PostDetailsType } from "@genuin/components/react-query/api/feed/schema";

import { usePlayerContext } from "../../context";

type ButtonSize = "xs" | "sm" | "md" | "lg";

type EmbedControlsProps = ComponentProps<"div"> & {
  /**
   * Size of the buttons within the controls
   * @default "xs"
   */
  size?: ButtonSize;
  section?: PostDetailsType["section"];
  videoId?: string;
};

type EmbedButtonProps = {
  /** Size of the button icon */
  size?: ButtonSize;
};

type EmbedExpandButtonProps = EmbedButtonProps & {
  section?: PostDetailsType["section"];
  videoId?: string;
};

/** Mute/unmute toggle button styled for embed control bars. */
export function EmbedMuteButton({ size = "xs" }: EmbedButtonProps) {
  const { muted, toggleMuted } = usePlayerContext();

  return (
    <Button theme="overlay" className="gencl:px-0" size={size} onClick={() => toggleMuted(true)}>
      {muted ? <MuteIconOld theme="dark" size={size} /> : <UnmuteIconOld theme="dark" size={size} />}
    </Button>
  );
}

/** Play/pause toggle button styled for embed control bars. */
export function EmbedPlayButton({ size = "xs" }: EmbedButtonProps) {
  const { playingState, togglePlay } = usePlayerContext();

  return (
    <Button theme="overlay" className="gencl:px-0" size={size} onClick={() => togglePlay(true)}>
      {playingState === "PLAYING" ? (
        <PauseIconOld theme="dark" size={size} />
      ) : (
        <PlayIconOld theme="fill-dark" size={size} />
      )}
    </Button>
  );
}

/** Expand/collapse button styled for embed control bars. */
export function EmbedExpandButton({ size = "xs", section, videoId }: EmbedExpandButtonProps) {
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
    <Button
      theme="overlay"
      className="gencl:px-0"
      size={size}
      onClick={() => {
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
      }}>
      {!isExpandView ? <ExpandIconOld theme="dark" size={size} /> : <CollapseIconOld theme="dark" size={size} />}
    </Button>
  );
}

export function EmbedControls({ className, size = "xs", section, videoId, ...restProps }: EmbedControlsProps) {
  const config = useEmbedConfigs();

  return (
    <div className={cn("gencl:flex gencl:gap-1", className)} {...restProps}>
      <EmbedMuteButton size={size} />
      <EmbedPlayButton size={size} />
      {config.expandViewConfig.enable && <EmbedExpandButton size={size} section={section} videoId={videoId} />}
    </div>
  );
}
