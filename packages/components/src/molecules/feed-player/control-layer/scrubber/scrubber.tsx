import { type ComponentProps, useCallback, useState, useEffect } from "react";
import { ScrubberSlider } from "./scrubber-slider";
import { cn } from "@genuin/ui/utils";
import { usePlayerContext } from "../../context/context";

type ScrubberPropsType = Omit<
  ComponentProps<typeof ScrubberSlider> & {
    spriteUrl?: string;
    showSeeker?: boolean;
    value?: number[];
  },
  "playerTimeState"
>;

/**
 * Right now, this component is only used in feed player.
 * It is used to show the scrubber and the current time of the video.
 * If you want to use this component in other players, you need to pass the playerTimeState as a prop.
 * You can use the `onVideoTimeStateChange` method from the player context to get the current time and duration of the video.
 * @param param0
 * @returns
 */
export function Scrubber({
  spriteUrl,
  className,
  value,
  ...restProps
}: ScrubberPropsType) {
  const [showScrubber, setShowScrubber] = useState(false);
  const [showSeeker, setShowSeeker] = useState(false);
  const [playerTimeState, setPlayerTimeState] = useState({
    duration: 0,
    currentTime: 0,
  });
  const { onVideoTimeStateChange, buttonAction, play } = usePlayerContext();
  const [progressValue, setProgressValue] = useState(0);

  /**
   * In case of user action only we need to show seeker.
   * If user action is play or pause, we need to show the seeker.
   */
  useEffect(() => {
    if (buttonAction === "PAUSE") {
      setShowSeeker(true);
    } else if (buttonAction === "PLAY") {
      setShowSeeker(false);
    }
  }, [buttonAction]);

  useEffect(() => {
    if (!playerTimeState.duration) return;
    const progressValue = Math.round(
      (playerTimeState.currentTime / playerTimeState.duration) * 100
    );
    setProgressValue(progressValue);
  }, [playerTimeState]);

  useEffect(() => {
    const unsubscribe = onVideoTimeStateChange((state) => {
      if (!state.duration) return;
      setPlayerTimeState(state);
    });

    return () => {
      unsubscribe();
    };
  }, [onVideoTimeStateChange]);

  // Handle touch event for seeking
  const handleSeek = useCallback(
    (value: number[]) => {
      if (!value[0]) return;
      setProgressValue(value[0]);
      setShowScrubber(true);
    },
    [setShowScrubber]
  );

  const handleValueCommit = useCallback(
    (value: number[]) => {
      if (!playerTimeState.duration) return;
      if (!value[0]) return;

      const seekPosition = value[0];
      const seekTime = (seekPosition / 100) * playerTimeState.duration;
      play(true, seekTime);
      setShowScrubber(false);

      // Update video time
      // if (playerRef.current) {
      //   playerRef.current.getMedia().currentTime = seekTime;
      //   void play(playerRef.current).then(() => {
      //     setShouldPlay(true);
      //   });
      // }
    },
    [setShowScrubber, playerTimeState.duration, play]
  );

  return (
    <ScrubberSlider
      value={value ?? [progressValue]} // Pass the current progress value
      className={cn("swiper-no-swiping gencl:rounded-none", className)}
      spriteUrl={spriteUrl ?? ""}
      showScrubber={showScrubber}
      onValueChange={handleSeek}
      showSeeker={showSeeker}
      playerTimeState={playerTimeState}
      onValueCommit={handleValueCommit}
      {...restProps}
    />
  );
}
