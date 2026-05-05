import { Loader } from "@genuin/ui/loader";
import { MuteIcon } from "@genuin/ui/icons";
import { UnmuteIcon } from "@genuin/ui/icons";
import { cn } from "@genuin/ui/utils";
import { PlayIcon } from "@genuin/ui/icons";
import { PauseIcon } from "@genuin/ui/icons";
import { usePlayerContext } from "../context/context";
import { ComponentProps } from "react";

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

export function PlayingState({
  className,
  showOnlyPlayAction = false,
  ...restProps
}: PlayingStateProps) {
  const { playingState, buttonAction, pausedBySystem } = usePlayerContext();

  // System pause UI must remain stable across active/index/src transitions.
  if (pausedBySystem) {
    return (
      <div
        key="system-pause"
        className="gencl:flex gencl:flex-col gencl:items-center gencl:gap-2 gencl:absolute gencl:h-full gencl:w-full gencl:justify-center"
      >
        <div
          role="status"
          aria-live="polite"
          className={cn(
            "gencl:rounded-full gencl:bg-black/40 gencl:align-middle gencl:backdrop-blur-sm",
            "gencl:flex gencl:items-center gencl:justify-center gencl:h-16 gencl:w-16",
          )}
          {...restProps}
        >
          <PauseIcon theme="dark" size="xl" aria-hidden="true" />
        </div>
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
          className,
        )}
        {...restProps}
      >
        <Loader size="sm" aria-hidden="true" />
      </div>
    );

  // Special handling for layouts that only show play action
  if (showOnlyPlayAction) {
    // Only show PlayIcon when action is PLAY, hide all other actions (PAUSE, MUTE, UNMUTE)
    if (buttonAction === "PAUSE") {
      return (
        <div
          key={buttonAction}
          role="status"
          aria-live="polite"
          aria-label={getAriaLabelForAction(buttonAction)}
          className={cn(
            "gencl:rounded-full gencl:bg-black/40 gencl:align-middle gencl:backdrop-blur-sm",
            "gencl:delay-500 gencl:animate-fade-out gencl:duration-1500",
            className,
          )}
          {...restProps}
        >
          <PlayIcon theme="fill-dark" size="xl" aria-hidden="true" />
        </div>
      );
    }

    // Don't show anything for other actions (PAUSE, MUTE, UNMUTE)
    return null;
  }

  // Default behavior for non-iHeart layouts
  if (buttonAction === "PAUSE" && playingState === "PAUSED") {
    return (
      <div
        key={buttonAction}
        role="status"
        aria-live="polite"
        aria-label={getAriaLabelForAction(buttonAction)}
        className={cn(
          "gencl:rounded-full gencl:bg-black/40 gencl:align-middle gencl:backdrop-blur-sm",
          className,
        )}
        {...restProps}
      >
        <PauseIcon theme="dark" size="xl" aria-hidden="true" />
      </div>
    );
  }

  const renderIcon = () => {
    switch (buttonAction) {
      case "PLAY":
        return <PlayIcon theme="fill-dark" size="xl" aria-hidden="true" />;
      case "MUTE":
        return <MuteIcon theme="dark" size="xl" aria-hidden="true" />;
      case "UNMUTE":
        return <UnmuteIcon theme="dark" size="xl" aria-hidden="true" />;
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
    <div
      key={buttonAction}
      role="status"
      aria-live="polite"
      aria-label={ariaLabel}
      className={cn(
        "gencl:rounded-full gencl:bg-black/40 gencl:align-middle gencl:backdrop-blur-sm",
        "gencl:delay-500 gencl:animate-fade-out gencl:duration-1500",
        className,
      )}
      {...restProps}
    >
      {icon}
    </div>
  );
}
