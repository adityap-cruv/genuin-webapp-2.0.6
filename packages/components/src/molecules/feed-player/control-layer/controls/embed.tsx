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

type EmbedControlsProps = ComponentProps<"div"> & {
  /**
   * Size of the buttons within the controls
   * @default "xs"
   */
  size?: "xs" | "sm" | "md" | "lg";
};

export function EmbedControls({
  className,
  size = "xs",
  ...restProps
}: EmbedControlsProps) {
  const { playingState, togglePlay, muted, toggleMuted } = usePlayerContext();
  const { changeActivePlayerType, embedEventBus } = useEmbedContext();
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
      <Button
        theme="overlay"
        size={size}
        onClick={() => {
          changeActivePlayerType("expand-view");
        }}
      >
        {!isExpandView ? (
          <ExpandIcon theme="dark" size={size} />
        ) : (
          <CollapseIcon theme="dark" size={size} />
        )}
      </Button>
    </div>
  );
}
