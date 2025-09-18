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
import { Button } from "@genuin/ui/components";
import { usePlayerContext } from "../../context";
import { useEmbedContext } from "@genuin/components/context/embed";
import { EmbedEventContextType } from "@genuin/components/context/embed/event-bus";
import { PostDetailsType } from "@genuin/components/react-query/api/feed/schema";
import { useEmbedConfigs } from "@genuin/components/hooks/embed/use-embed-config";

type EmbedControlsProps = ComponentProps<"div"> & {
  /**
   * Size of the buttons within the controls
   * @default "xs"
   */
  size?: "xs" | "sm" | "md" | "lg";
  section?: PostDetailsType["section"];
};

export function EmbedControls({
  className,
  size = "xs",
  section,
  ...restProps
}: EmbedControlsProps) {
  const { playingState, togglePlay, muted, toggleMuted } = usePlayerContext();
  const config = useEmbedConfigs();
  const { changeActivePlayerType, updateSelectedSection, embedEventBus } =
    useEmbedContext();
  const [isExpandView, setIsExpandView] = useState(false);

  useEffect(() => {
    function handleActivePlayerTypeChange(
      eventData: any,
      context: EmbedEventContextType
    ) {
      setIsExpandView(context.activePlayerType === "expand-view");
    }

    embedEventBus.on("activePlayerTypeChange", handleActivePlayerTypeChange);
    return () => {
      embedEventBus.off("activePlayerTypeChange", handleActivePlayerTypeChange);
    };
  }, [embedEventBus]);

  return (
    <div className={cn("gencl:flex gencl:gap-1", className)} {...restProps}>
      <Button theme="overlay" size={size} onClick={() => toggleMuted(true)}>
        {muted ? (
          <MuteIcon theme="dark" size={size} />
        ) : (
          <UnmuteIcon theme="dark" size={size} />
        )}
      </Button>
      <Button
        theme="overlay"
        size={size}
        onClick={() => {
          togglePlay(true);
        }}
      >
        {playingState === "PLAYING" ? (
          <PauseIcon theme="dark" size={size} />
        ) : (
          <PlayIcon theme="fill-dark" size={size} />
        )}
      </Button>
      {config.expandViewConfig.enable && (
        <Button
          theme="overlay"
          size={size}
          onClick={() => {
            changeActivePlayerType("expand-view");
            if (section) {
              updateSelectedSection(section);
            }
          }}
        >
          {!isExpandView ? (
            <ExpandIcon theme="dark" size={size} />
          ) : (
            <CollapseIcon theme="dark" size={size} />
          )}
        </Button>
      )}
    </div>
  );
}
