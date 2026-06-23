import { MuteIcon } from "@genuin/ui/icons";
import { UnmuteIcon } from "@genuin/ui/icons";
import { PlayIcon } from "@genuin/ui/icons";
import { PauseIcon } from "@genuin/ui/icons";
import { Loader } from "@genuin/ui/loader";
import { cn } from "@genuin/ui/utils";
import type { ComponentProps } from "react";

import { usePlayerContext } from "../context/context";

import { IconCircleButton } from "@genuin/ui/player-controls";

export type PlayingStateProps = ComponentProps<"div"> & {
  showOnlyPlayAction?: boolean;
};

/**
 * Get accessible label for button action state
 */
function getAriaLabelForAction(action: string | null): string {
  switch (action) {
    case "PLAY":
      return "Playing video";
    case "PAUSE":
      return "Video paused";
    case "MUTE":
      return "Audio muted";
    case "UNMUTE":
      return "Audio unmuted";
    default:
      return "";
  }
}

export function PlayingState({ className, showOnlyPlayAction = false, ...restProps }: PlayingStateProps) {
  const { playingState, buttonAction, pausedBySystem } = usePlayerContext();

  // System pause UI must remain stable across active/index/src transitions.
  if (pausedBySystem) {
    return (
      <div
        key="system-pause"
        className="gencl:flex gencl:flex-col gencl:items-center gencl:gap-2 gencl:absolute gencl:h-full gencl:w-full gencl:justify-center">
        <IconCircleButton
          size="xl"
          role="status"
          aria-live="polite"
          icon={<PauseIcon theme="dark" aria-hidden="true" />}
          {...restProps}
        />
        <p className="gencl:bg-black/40 gencl:p-2 gencl:backdrop-blur-sm gencl:rounded-md gencl:text-center gencl:text-body-1-semi-bold gencl:text-white">
          Tap to unmute and play
        </p>
      </div>
    );
  }

  // If no buttonAction is set (which happens when not user initiated), don't render anything
  if (!buttonAction) {
    return null;
  }

  if (playingState === "LOADING")
    return (
      <div
        role="status"
        aria-live="polite"
        aria-label="Loading video"
        className={cn(
          "gencl:rounded-full gencl:bg-black/40",
          "gencl:align-middle gencl:opacity-100 gencl:backdrop-blur-sm gencl:transition-all gencl:duration-100",
          className
        )}
        {...restProps}>
        <Loader size="sm" aria-hidden="true" />
      </div>
    );

  // Special handling for layouts that only show play action
  if (showOnlyPlayAction) {
    // Only show PlayIcon when action is PLAY, hide all other actions (PAUSE, MUTE, UNMUTE)
    if (buttonAction === "PAUSE") {
      return (
        <IconCircleButton
          key={buttonAction}
          size="xl"
          role="status"
          aria-live="polite"
          aria-label={getAriaLabelForAction(buttonAction)}
          className={cn("gencl:delay-500 gencl:animate-fade-out gencl:duration-1500", className)}
          icon={<PlayIcon theme="fill-dark" aria-hidden="true" />}
          {...restProps}
        />
      );
    }

    // Don't show anything for other actions (PAUSE, MUTE, UNMUTE)
    return null;
  }

  // Default behavior for non-iHeart layouts
  if (buttonAction === "PAUSE" && playingState === "PAUSED") {
    return (
      <IconCircleButton
        key={buttonAction}
        size="xl"
        role="status"
        aria-live="polite"
        aria-label={getAriaLabelForAction(buttonAction)}
        className={className}
        icon={<PauseIcon theme="dark" aria-hidden="true" />}
        {...restProps}
      />
    );
  }

  const renderIcon = () => {
    switch (buttonAction) {
      case "PLAY":
        return <PlayIcon theme="fill-dark" aria-hidden="true" />;
      case "MUTE":
        return <MuteIcon theme="dark" aria-hidden="true" />;
      case "UNMUTE":
        return <UnmuteIcon theme="dark" aria-hidden="true" />;
      default:
        return null;
    }
  };

  const icon = renderIcon();

  // Only render if we have a valid icon to show
  if (!icon) {
    return null;
  }

  const ariaLabel = getAriaLabelForAction(buttonAction);

  return (
    <IconCircleButton
      key={buttonAction}
      size="xl"
      role="status"
      aria-live="polite"
      aria-label={ariaLabel}
      className={cn("gencl:delay-500 gencl:animate-fade-out gencl:duration-1500", className)}
      icon={icon}
      {...restProps}
    />
  );
}
