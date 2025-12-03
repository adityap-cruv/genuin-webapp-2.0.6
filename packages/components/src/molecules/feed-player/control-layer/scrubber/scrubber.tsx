"use client";
import {
  type ComponentProps,
  useCallback,
  useState,
  useEffect,
  useRef,
} from "react";
import { ScrubberSlider } from "./scrubber-slider";
import { cn } from "@genuin/ui/utils";
import { usePlayerContext } from "../../context/context";
import { useEmbedConfigs } from "@genuin/components/hooks/embed/use-embed-config";

type ScrubberPropsType = Omit<
  ComponentProps<typeof ScrubberSlider> & {
    spriteUrl?: string;
    showSeeker?: boolean;
    value?: number[];
    duration?: number | null | undefined;
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
  duration,
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
    playingState,
    setPlayingState,
  } = usePlayerContext();

  const [scrubberPosition, setScrubberPosition] = useState(0);
  const [isUserInteracting, setIsUserInteracting] = useState(false);
  const userPositionRef = useRef<number | null>(null);

  const {
    view: { brandLayoutType },
  } = useEmbedConfigs();

  // Simplified duration calculation
  const totalDuration = playerTimeState.duration || duration || 0;
  const isVideoLoaded = playerTimeState.duration > 0;

  // Sync scrubber with video time (only when user is not interacting)
  useEffect(() => {
    const shouldBlockUpdates =
      isUserInteracting ||
      showScrubber ||
      !isVideoLoaded ||
      !totalDuration ||
      userPositionRef.current !== null;

    if (shouldBlockUpdates) return;

    const videoProgress = Math.round(
      (playerTimeState.currentTime / totalDuration) * 100
    );
    setScrubberPosition(videoProgress);
  }, [
    playerTimeState.currentTime,
    totalDuration,
    isUserInteracting,
    isVideoLoaded,
    showScrubber,
  ]);

  // Subscribe to video time changes
  useEffect(() => {
    const unsubscribe = onVideoTimeStateChange((state) => {
      if (state.duration) setPlayerTimeState(state);
    });
    return unsubscribe;
  }, [onVideoTimeStateChange]);

  // Utility to reset user interaction state after a delay
  const resetUserInteraction = useCallback(
    (delay = 100) => {
      setTimeout(() => {
        setIsUserInteracting(false);
        setShowScrubber(false);
        setTimeout(() => {
          userPositionRef.current = null;
        }, 400);
      }, delay);
    },
    [setShowScrubber]
  );

  // Handle user dragging
  const handleSeek = useCallback(
    (value: number[]) => {
      const position = value[0];
      if (!position) return;

      // Pause during scrubbing (except for iHeart)
      if (brandLayoutType !== "iheart" && !showScrubber) {
        pause(false);
      }

      setScrubberPosition(position);
      setIsUserInteracting(true);
      userPositionRef.current = position;

      setShowScrubber(true);
      setShowSeeker(true);
      setPlayingState("PAUSED");
    },
    [pause, brandLayoutType, showScrubber, setShowScrubber, setShowSeeker]
  );

  // Handle when user finishes dragging
  const handleValueCommit = useCallback(
    (value: number[]) => {
      const targetPosition = value[0];
      if (!targetPosition) return;
      if (totalDuration > 0) {
        const seekTime = (targetPosition / 100) * totalDuration;

        if (brandLayoutType === "iheart") {
          // For iHeart: start playing and hide seeker when scrubbing ends
          // play(true);
          setShowScrubber(false);
          // For iHeart: maintain a global playback state and synchronize the seeker display based on it.
          seek(seekTime);
          if (feedPlayerShouldPlay) {
            setTimeout(() => {
              setShowSeeker(false);
            }, 1500);
            setPlayingState("PLAYING");
          } else {
            setShowSeeker(true);
            setPlayingState("PAUSED");
          }
        } else {
          play(true, seekTime);
          setPlayingState("PLAYING");
        }

        resetUserInteraction();
      } else {
        // No duration available yet
        setScrubberPosition(targetPosition);
        resetUserInteraction();
      }
    },
    [
      totalDuration,
      brandLayoutType,
      seek,
      play,
      feedPlayerShouldPlay,
      setShowSeeker,
      resetUserInteraction,
    ]
  );

  // Shared skip logic
  const handleSkip = useCallback(
    (seconds: number) => {
      if (!totalDuration) return;

      const currentTime = (scrubberPosition / 100) * totalDuration;
      const newTime = Math.max(
        0,
        Math.min(currentTime + seconds, totalDuration)
      );
      const newPosition = Math.round((newTime / totalDuration) * 100);

      setScrubberPosition(newPosition);
      userPositionRef.current = newPosition;
      play(true, newTime);

      // Clear protection after video settles
      setTimeout(() => {
        userPositionRef.current = null;
      }, 1000);
    },
    [scrubberPosition, totalDuration, play]
  );

  const skipForward = useCallback(() => handleSkip(15), [handleSkip]);
  const skipBackward = useCallback(() => handleSkip(-15), [handleSkip]);

  // Handle global events when user releases outside slider
  useEffect(() => {
    const handleGlobalEnd = () => {
      if (showScrubber) {
        if (brandLayoutType === "iheart") {
          if (feedPlayerShouldPlay) {
            setTimeout(() => setShowSeeker(false), 1500);
            setPlayingState("PLAYING");
          } else {
            setShowSeeker(true);
            setPlayingState("PAUSED");
          }
        }
        resetUserInteraction();
      }
    };

    if (showScrubber) {
      const events = ["mouseup", "touchend", "pointerup"];
      events.forEach((event) =>
        document.addEventListener(event, handleGlobalEnd)
      );

      return () => {
        events.forEach((event) =>
          document.removeEventListener(event, handleGlobalEnd)
        );
      };
    }
  }, [
    showScrubber,
    brandLayoutType,
    feedPlayerShouldPlay,
    setShowSeeker,
    resetUserInteraction,
  ]);

  return (
    <ScrubberSlider
      value={value ?? [scrubberPosition]} // Single source of truth
      className={cn(
        "swiper-no-swiping gencl:rounded-none",
        brandLayoutType === "iheart" && "gencl:py-2 gencl:px-1 gencl:min-h-6",
        className
      )}
      spriteUrl={spriteUrl ?? ""}
      showScrubber={showScrubber}
      onValueChange={handleSeek}
      showSeeker={
        feedPlayerShouldPlay
          ? showSeeker
          : showSeeker && playingState === "PAUSED"
      }
      playerTimeState={{
        duration: totalDuration,
        currentTime: (scrubberPosition / 100) * totalDuration,
      }}
      onValueCommit={handleValueCommit}
      onSkipForward={skipForward}
      onSkipBackward={skipBackward}
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
      duration={duration}
      {...restProps}
    />
  );
}
