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

  if (buttonAction === "PAUSE")
    return (
      <div
        key={buttonAction}
        className={cn(
          "gencl:rounded-full gencl:bg-black/40 gencl:align-middle gencl:backdrop-blur-sm",
          className
        )}
        {...restProps}
      >
        <PauseIcon variant="light" className="gencl:h-8 gencl:w-8" />
      </div>
    );

  if (buttonAction)
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
        {buttonAction === "PLAY" && (
          <PlayIcon variant="light" className="gencl:h-8 gencl:w-8" />
        )}
        {/* {buttonAction === "PAUSE" && (
          <PauseIcon variant="light" className="gencl:h-8 gencl:w-8" />
        )} */}
        {buttonAction === "MUTE" && (
          <MuteIcon variant="light" className="gencl:h-8 gencl:w-8" />
        )}
        {buttonAction === "UNMUTE" && (
          <UnmuteIcon variant="light" className="gencl:h-8 gencl:w-8" />
        )}
      </div>
    );
}
