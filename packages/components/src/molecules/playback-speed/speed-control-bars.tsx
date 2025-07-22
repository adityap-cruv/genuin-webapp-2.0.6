import { useCallback, useEffect, useRef, useState } from "react";
import { useFeedContext } from "@genuin/components/templates/feed/context";
import { cn } from "@genuin/ui/lib/utils";
import { useDeviceDetectMediaQuery } from "@genuin/components/hooks/use-devide-detect-media-query";

const LONG_PRESS_DURATION = 500; // 500ms for long press

export const SpeedControlSideBars = () => {
  const { playbackSpeed, setPlaybackSpeed } = useFeedContext();
  const { isMobile } = useDeviceDetectMediaQuery();
  const [activeBar, setActiveBar] = useState<"left" | "right" | null>(null);

  // Merge refs into a single object
  const speedControlRef = useRef<{
    previousSpeed: number;
    longPressTimer?: NodeJS.Timeout;
  }>({
    previousSpeed: playbackSpeed.speed,
  });

  useEffect(() => {
    const playbackSpeedElement = document.querySelector(
      ".playback-speed-class"
    );
    if (playbackSpeedElement) {
      playbackSpeedElement.classList.toggle(
        "gencl:invisible",
        playbackSpeed.isSpeedFromGesture
      );
    }
  }, [playbackSpeed.isSpeedFromGesture]);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent, side: "left" | "right") => {
      setActiveBar(side);
      speedControlRef.current.previousSpeed = playbackSpeed.speed;

      // Start long press timer
      speedControlRef.current.longPressTimer = setTimeout(() => {
        setPlaybackSpeed({ speed: 2, isSpeedFromGesture: true }); // Set to 2x speed on long press
      }, LONG_PRESS_DURATION);
    },
    [playbackSpeed]
  );

  const handleTouchEnd = useCallback(() => {
    // Clear long press timer
    if (speedControlRef.current.longPressTimer) {
      clearTimeout(speedControlRef.current.longPressTimer);
    }

    // If we were at 2x speed (from long press), return to previous speed
    if (playbackSpeed.speed === 2) {
      setPlaybackSpeed({
        speed: speedControlRef.current.previousSpeed,
        isSpeedFromGesture: false,
      });
    }

    setActiveBar(null);
  }, [playbackSpeed, setPlaybackSpeed]);

  if (!isMobile) return;

  return (
    <>
      {/* Left speed control bar */}
      <div
        className={cn(
          "gencl:absolute gencl:left-0 gencl:top-0 gencl:z-10 gencl:h-full gencl:w-14 gencl:opacity-0 gencl:transition-opacity",
          activeBar === "left" && "gencl:bg-white "
        )}
        onTouchStart={(e) => {
          handleTouchStart(e, "left");
        }}
        onTouchEnd={handleTouchEnd}
      />

      {/* Right speed control bar */}
      <div
        className={cn(
          "gencl:absolute gencl:right-0 gencl:top-0 gencl:z-10 gencl:h-full gencl:w-14 gencl:opacity-0 gencl:transition-opacity",
          activeBar === "right" && "gencl:bg-white "
        )}
        onTouchStart={(e) => {
          handleTouchStart(e, "right");
        }}
        onTouchEnd={handleTouchEnd}
      />
    </>
  );
};
