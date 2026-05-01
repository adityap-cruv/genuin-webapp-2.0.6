"use client";
import { cn } from "@genuin/ui/utils";
import { useEffect, useState, type ComponentProps } from "react";

import {
  ExpandIcon,
  MuteIcon,
  PauseIcon,
  PlayIcon,
  UnmuteIcon,
} from "@genuin/ui/icons";
import { CollapseIcon } from "@genuin/ui/icons";

import { usePlayerContext } from "../../context";
import { useEmbedContext } from "@genuin/components/context/embed";
import { EmbedEventContextType } from "@genuin/components/context/embed/event-bus";
import { PostDetailsType } from "@genuin/components/react-query/api/feed/schema";
import { Button } from "@genuin/ui/components/button";
import { useEmbedConfigs } from "@genuin/components/hooks/embed/use-embed-config";
import {
  SDKEventEmitter,
  SDKEventName,
} from "@genuin/components/lib/sdk-event-emitter";
import { useBaseContext } from "@genuin/components/context";

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
    <Button
      theme="overlay"
      className="gencl:px-0"
      size={size}
      onClick={() => toggleMuted(true)}
    >
      {muted ? (
        <MuteIcon theme="dark" size={size} />
      ) : (
        <UnmuteIcon theme="dark" size={size} />
      )}
    </Button>
  );
}

/** Play/pause toggle button styled for embed control bars. */
export function EmbedPlayButton({ size = "xs" }: EmbedButtonProps) {
  const { playingState, togglePlay } = usePlayerContext();

  return (
    <Button
      theme="overlay"
      className="gencl:px-0"
      size={size}
      onClick={() => togglePlay(true)}
    >
      {playingState === "PLAYING" ? (
        <PauseIcon theme="dark" size={size} />
      ) : (
        <PlayIcon theme="fill-dark" size={size} />
      )}
    </Button>
  );
}

/** Expand/collapse button styled for embed control bars. */
export function EmbedExpandButton({
  size = "xs",
  section,
  videoId,
}: EmbedExpandButtonProps) {
  const { changeActivePlayerType, updateSelectedSection, embedEventBus } =
    useEmbedContext();
  const { brand_id } = useBaseContext().brandDetails;
  const [isExpandView, setIsExpandView] = useState(false);

  useEffect(() => {
    function handleActivePlayerTypeChange(
      _eventData: any,
      context: EmbedEventContextType,
    ) {
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
            const nativeVideoHandler = (window as any).webkit?.messageHandlers
              ?.openNativeVideo;
            if (nativeVideoHandler) {
              nativeVideoHandler.postMessage({
                source: "carousel",
                videoId: videoId ?? "",
              });
            }
          }
        }
      }}
    >
      {!isExpandView ? (
        <ExpandIcon theme="dark" size={size} />
      ) : (
        <CollapseIcon theme="dark" size={size} />
      )}
    </Button>
  );
}

export function EmbedControls({
  className,
  size = "xs",
  section,
  videoId,
  ...restProps
}: EmbedControlsProps) {
  const config = useEmbedConfigs();

  return (
    <div className={cn("gencl:flex gencl:gap-1", className)} {...restProps}>
      <EmbedMuteButton size={size} />
      <EmbedPlayButton size={size} />
      {config.expandViewConfig.enable && (
        <EmbedExpandButton size={size} section={section} videoId={videoId} />
      )}
    </div>
  );
}
