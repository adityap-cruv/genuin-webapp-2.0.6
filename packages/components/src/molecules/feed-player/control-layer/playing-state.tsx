import { Loader } from "@genuin/ui/loader";
import { MuteIcon } from "@genuin/ui/icons";
import { UnmuteIcon } from "@genuin/ui/icons";
import { cn } from "@genuin/ui/utils";
import { PlayIcon } from "@genuin/ui/icons";
import { PauseIcon } from "@genuin/ui/icons";
import { usePlayerContext } from "../context/context";
import { ComponentProps } from "react";

export function PlayingState({
  className,
  ...restProps
}: ComponentProps<"div">) {
  const { playingState, buttonAction } = usePlayerContext();

  // If no buttonAction is set (which happens when not user initiated), don't render anything
  if (!buttonAction) {
    return null;
  }

  if (playingState === "LOADING")
    return (
      <div
        className={cn(
          "gencl:rounded-full gencl:bg-black/40",
          "gencl:align-middle gencl:opacity-100 gencl:backdrop-blur-sm gencl:transition-all gencl:duration-100",
          className
        )}
        {...restProps}
      >
        <Loader size="sm" />
      </div>
    );

  if (buttonAction === "PAUSE" && playingState === "PAUSED") {
    return (
      <div
        key={buttonAction}
        className={cn(
          "gencl:rounded-full gencl:bg-black/40 gencl:align-middle gencl:backdrop-blur-sm",
          className
        )}
        {...restProps}
      >
        <PauseIcon theme="dark" size="xl" />
      </div>
    );
  }

  // Render icon based on buttonAction (only if it's a valid action)
  const renderIcon = () => {
    switch (buttonAction) {
      case "PLAY":
        return <PlayIcon theme="fill-dark" size="xl" />;
      case "MUTE":
        return <MuteIcon theme="light" size="xl" />;
      case "UNMUTE":
        return <UnmuteIcon theme="light" size="xl" />;
      default:
        return null;
    }
  };

  const icon = renderIcon();

  // Only render if we have a valid icon to show
  if (!icon) {
    return null;
  }

  return (
    <div
      key={buttonAction}
      className={cn(
        "gencl:rounded-full gencl:bg-black/40 gencl:align-middle gencl:backdrop-blur-sm",
        "gencl:delay-500 gencl:animate-fade-out",
        className
      )}
      {...restProps}
    >
      {icon}
    </div>
  );
}
