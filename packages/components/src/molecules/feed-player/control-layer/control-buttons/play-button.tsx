import { PauseIcon } from "@genuin/ui/icons";
import { PlayIcon } from "@genuin/ui/icons";
import { cn } from "@genuin/ui/utils";
import { ComponentProps, memo, useCallback } from "react";
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
  // const [stopAnimating, setStopAnimating] = useState(!shouldAnimate);
  // const [hasInteracted, setHasInteracted] = useState(false);
  // const prevState = useRef(isVideoPlaying);

  // useEffect(() => {
  //   if (hasInteracted) {
  //     setStopAnimating(true);
  //   }
  // }, [hasInteracted]);

  // useEffect(() => {
  //   if (prevState.current !== isVideoPlaying) {
  //     setHasInteracted(true);
  //     prevState.current = isVideoPlaying;
  //   }
  // }, [isVideoPlaying]);

  // const handleClick = useCallback((e: any) => {
  //   e.stopPropagation();
  //   // setHasInteracted(true);
  // }, []);

  return (
    <div
      onClick={() => togglePlay(true)}
      // onMouseEnter={() => {
      //   if (!hasInteracted) setStopAnimating(true);
      // }}
      // onMouseLeave={() => {
      //   if (!hasInteracted) setStopAnimating(false);
      // }}
      className={cn(
        "gencl:group gencl:cursor-pointer gencl:flex gencl:h-12 gencl:w-12 gencl:justify-center gencl:items-center gencl:rounded-full gencl:bg-black/40 gencl:transition-all gencl:duration-300 gencl:ease-in-out gencl:hover:bg-black/50",
        className
      )}
      {...restProps}
    >
      <div className="gencl:flex gencl:h-12 gencl:w-12 gencl:flex-shrink-0 gencl:items-center gencl:justify-center">
        {playingState === "PLAYING" ? (
          <PauseIcon variant="light" />
        ) : (
          <PlayIcon variant="light" />
        )}
      </div>

      {/* Animated Text should stop once user interacts */}
      {/* {!hasInteracted && ( */}
      <AnimatedText text="Tap to play" width={110} stop={false} />
      {/* )} */}
    </div>
  );
});
