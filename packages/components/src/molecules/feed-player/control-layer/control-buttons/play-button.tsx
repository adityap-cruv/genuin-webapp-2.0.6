import { PauseIcon } from "@genuin/ui/icons";
import { PlayIcon } from "@genuin/ui/icons";
import { cn } from "@genuin/ui/utils";
import { ComponentProps, memo, useCallback, useState } from "react";
import { AnimatedText } from "./animated-text";
import { usePlayerContext } from "../../context";
import { Pause } from "lucide-react";

type PlayButtonProps = {
  shouldAnimate: boolean;
} & ComponentProps<"div">;

export const AnimatedPlayButton = memo(function PlayButton({
  className,
  shouldAnimate,
  ...restProps
}: PlayButtonProps) {
  const { playingState, togglePlay } = usePlayerContext();
  const [stopAnimating, setStopAnimating] = useState(!shouldAnimate);

  return (
    <div
      onClick={() => {
        togglePlay(true);
        setStopAnimating(true);
      }}
      className={cn(
        "gencl:group gencl:cursor-pointer gencl:flex gencl:justify-center gencl:items-center gencl:rounded-full gencl:bg-black/40 gencl:transition-all gencl:duration-300 gencl:ease-in-out gencl:hover:bg-black/50",
        className
      )}
      {...restProps}
    >
      <div className="gencl:flex gencl:size-9 gencl:sm:size-12! gencl:flex-shrink-0 gencl:items-center gencl:justify-center">
        {playingState === "PLAYING" ? (
          <PauseIcon theme="dark" className="gencl:size-5 gencl:sm:size-6!" />
        ) : (
          <PlayIcon
            theme="fill-dark"
            className="gencl:size-5 gencl:sm:size-6!"
          />
        )}
      </div>
      <AnimatedText text="Tap to play" width={110} stop={stopAnimating} />
    </div>
  );
});
