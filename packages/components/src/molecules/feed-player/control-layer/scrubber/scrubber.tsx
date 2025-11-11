"use client";
import { type ComponentProps, useCallback, useState, useEffect } from "react";
import { ScrubberSlider } from "./scrubber-slider";
import { cn } from "@genuin/ui/utils";
import { usePlayerContext } from "../../context/context";
import { useEmbedConfigs } from "@genuin/components/hooks/embed/use-embed-config";

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
  const [playerTimeState, setPlayerTimeState] = useState({
    duration: 0,
    currentTime: 0,
  });
  const {
    onVideoTimeStateChange,
    showSeeker,
    setShowSeeker,
    play,
    pause,
    seek,
    showScrubber,
    feedPlayerShouldPlay,
    setShowScrubber,
  } = usePlayerContext();
  const [progressValue, setProgressValue] = useState(0);
  const {
    view: { brandLayoutType },
  } = useEmbedConfigs();

  useEffect(() => {
    if (!playerTimeState.duration || showScrubber) return;
    const newProgressValue = Math.round(
      (playerTimeState.currentTime / playerTimeState.duration) * 100
    );
    setProgressValue(newProgressValue);
  }, [playerTimeState, showScrubber]);

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

      // Only pause while scrubbing for iHeart brand layout
      if (brandLayoutType !== "iheart" && !showScrubber) {
        pause(false);
      }

      setProgressValue(value[0]);
      setShowScrubber(true);
      setShowSeeker(true);
    },
    [
      setProgressValue,
      setShowScrubber,
      setShowSeeker,
      showScrubber,
      pause,
      brandLayoutType,
    ]
  );

  const handleValueCommit = useCallback(
    (value: number[]) => {
      if (!playerTimeState.duration) return;
      if (!value[0]) return;

      const seekPosition = value[0];
      const seekTime = (seekPosition / 100) * playerTimeState.duration;

      if (brandLayoutType === "iheart") {
        // For iHeart: seek and start playing after scrubbing
        seek(seekTime);
        setShowScrubber(false);
        // For iHeart: maintain a global playback state and synchronize the seeker display based on it.
        if (feedPlayerShouldPlay) {
          setShowSeeker(false);
        } else {
          setShowSeeker(true);
        }
      } else {
        // Default behavior for other layouts
        play(true, seekTime);
        setShowScrubber(false);
      }

      // Update video time
      // if (playerRef.current) {
      //   playerRef.current.getMedia().currentTime = seekTime;
      //   void play(playerRef.current).then(() => {
      //     setShouldPlay(true);
      //   });
      // }
    },
    [
      setShowScrubber,
      setShowSeeker,
      playerTimeState.duration,
      play,
      brandLayoutType,
      feedPlayerShouldPlay,
    ]
  );

  // Skip forward/backward functions for keyboard accessibility
  const skipForward = useCallback(() => {
    if (!playerTimeState.duration) return;
    const newTime = Math.min(
      playerTimeState.currentTime + 15,
      playerTimeState.duration
    );
    play(true, newTime);
  }, [playerTimeState.currentTime, playerTimeState.duration, play]);

  const skipBackward = useCallback(() => {
    if (!playerTimeState.duration) return;
    // If current time is less than 15 seconds, move to 0
    const newTime =
      playerTimeState.currentTime < 15
        ? 0
        : Math.max(playerTimeState.currentTime - 15, 0);
    play(true, newTime);
  }, [playerTimeState.currentTime, playerTimeState.duration, play]);

  // Add global event listeners to handle cases where user releases outside the slider
  useEffect(() => {
    const handleGlobalEnd = () => {
      if (showScrubber) {
        if (brandLayoutType === "iheart") {
          // For iHeart: start playing and hide seeker when scrubbing ends
          // play(true);
          setShowScrubber(false);
          // For iHeart: maintain a global playback state and synchronize the seeker display based on it.
          if (feedPlayerShouldPlay) {
            setShowSeeker(false);
          } else {
            setShowSeeker(true);
          }
        } else {
          // Default behavior for other layouts
          setShowScrubber(false);
        }
      }
    };

    if (showScrubber) {
      document.addEventListener("mouseup", handleGlobalEnd);
      document.addEventListener("touchend", handleGlobalEnd);
      document.addEventListener("pointerup", handleGlobalEnd);
    }

    return () => {
      document.removeEventListener("mouseup", handleGlobalEnd);
      document.removeEventListener("touchend", handleGlobalEnd);
      document.removeEventListener("pointerup", handleGlobalEnd);
    };
  }, [
    showScrubber,
    setShowScrubber,
    setShowSeeker,
    play,
    brandLayoutType,
    feedPlayerShouldPlay,
  ]);

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
      onSkipForward={skipForward}
      onSkipBackward={skipBackward}
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
      // onMouseEnter={() => setShowSeeker?.(true)}
      // onMouseLeave={() => setShowSeeker?.(false)}
      {...restProps}
    />
  );
}
