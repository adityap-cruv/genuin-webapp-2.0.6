"use client";

import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn, getWebpUrlForImage } from "@genuin/ui/utils";
import { useCallback, useState } from "react";

type SliderPropsType = React.ComponentPropsWithoutRef<
  typeof SliderPrimitive.Root
> & {
  spriteUrl?: string;
  showOnlyTime?: boolean;
  onSkipForward?: () => void;
  onSkipBackward?: () => void;
};

const framesPerRow = 12;
const framesPerColumn = 10;
const intervalMs = 1000;
const frameWidth = 96;
const frameHeight = 170;

/**
 * Format time in MM:SS format
 */
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

/**
 * Format time for screen readers with natural language
 */
function formatTimeForScreenReader(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  if (mins === 0) {
    return `${secs} ${secs === 1 ? "second" : "seconds"}`;
  }
  return `${mins} ${mins === 1 ? "minute" : "minutes"} and ${secs} ${secs === 1 ? "second" : "seconds"}`;
}

/**
 * Calculate the position in a sprite sheet based on time position
 * Inspired by ThumbnailExtractOperation Swift implementation
 */
function getSpritePosition(
  timeMs: number,
  options: {
    columns: number;
    rows: number;
    intervalMs: number;
    frameWidth: number;
    frameHeight: number;
  }
): { backgroundPosition: string } {
  const { columns, rows, intervalMs, frameWidth, frameHeight } = options;

  // Calculate the frame index based on time
  const frameIndex = Math.floor(timeMs / intervalMs);

  // Calculate row and column position
  const y = Math.floor(frameIndex / columns);
  const x = frameIndex % columns;

  // Apply bounds checking
  const boundedY = Math.min(Math.max(0, y), rows - 1);
  const boundedX = Math.min(Math.max(0, x), columns - 1);

  // Return CSS background position
  return {
    backgroundPosition: `-${boundedX * frameWidth}px -${boundedY * frameHeight}px`,
  };
}

const ScrubberSlider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  SliderPropsType & {
    showScrubber?: boolean;
    playerTimeState: { duration: number; currentTime: number };
    showSeeker?: boolean;
    duration?: number | null | undefined;
  }
>(
  (
    {
      value,
      playerTimeState,
      className,
      showSeeker,
      showScrubber,
      spriteUrl,
      showOnlyTime = false,
      onSkipForward,
      onSkipBackward,
      duration,
      ...props
    },
    ref
  ) => {
    // State for navigation announcements
    const [navigationAnnouncement, setNavigationAnnouncement] =
      useState<string>("");

    // Keyboard event handler for accessibility
    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        // Only handle keyboard events if the scrubber container is focused
        if (e.target !== e.currentTarget) return;

        switch (e.key) {
          case "ArrowRight":
          case "ArrowUp":
            e.preventDefault();
            setNavigationAnnouncement("Skipped forward 15 seconds");
            onSkipForward?.();
            // Clear announcement after a short delay
            setTimeout(() => setNavigationAnnouncement(""), 100);
            break;
          case "ArrowLeft":
          case "ArrowDown":
            e.preventDefault();
            setNavigationAnnouncement("Skipped backward 15 seconds");
            onSkipBackward?.();
            // Clear announcement after a short delay
            setTimeout(() => setNavigationAnnouncement(""), 100);
            break;
        }
      },
      [onSkipForward, onSkipBackward]
    );

    // Simple duration - use player duration or fallback to prop
    const effectiveDuration = playerTimeState.duration || duration || 0;

    const scrubberStartTime = React.useMemo(
      () => ((value?.[0] ?? 0) / 100) * effectiveDuration,
      [value, effectiveDuration]
    );

    const totalSeconds = React.useMemo(() => {
      if (!effectiveDuration || !value?.[0]) return 0;
      return (value[0] / 100) * effectiveDuration;
    }, [value, effectiveDuration]);

    const time = React.useMemo(() => {
      if (!effectiveDuration) return "00:00";

      // Show scrubbed time if user is scrubbing, otherwise current time
      const timeToShow = value?.[0]
        ? totalSeconds
        : playerTimeState.currentTime || 0;

      if (showOnlyTime) {
        const currentTimeFormatted = formatTime(timeToShow);
        const durationFormatted = formatTime(effectiveDuration);
        return (
          <>
            <span>{currentTimeFormatted}</span>
            <span style={{ color: "#B1B1B1" }}> / {durationFormatted}</span>
          </>
        );
      }

      return formatTime(timeToShow);
    }, [
      totalSeconds,
      effectiveDuration,
      showOnlyTime,
      value,
      playerTimeState.currentTime,
    ]);

    const ariaValueText = React.useMemo(() => {
      const timeToShow =
        value?.[0] && effectiveDuration
          ? totalSeconds
          : playerTimeState.currentTime || 0;
      return formatTimeForScreenReader(timeToShow);
    }, [totalSeconds, effectiveDuration, value, playerTimeState.currentTime]);

    const spritePosition = React.useMemo(() => {
      const timeMs = scrubberStartTime * 1000;
      return getSpritePosition(timeMs, {
        columns: framesPerRow,
        rows: framesPerColumn,
        intervalMs,
        frameWidth,
        frameHeight,
      });
    }, [scrubberStartTime]);

    // Current time for accessibility
    const currentTimeFormatted = formatTime(
      value?.[0] && effectiveDuration
        ? (value[0] / 100) * effectiveDuration
        : playerTimeState.currentTime || 0
    );
    const durationFormatted = formatTime(effectiveDuration || 0);
    const scrubberLabel = `Slider, playback position, current time & duration ${currentTimeFormatted} / ${durationFormatted}`;

    return (
      <SliderPrimitive.Root
        ref={ref}
        role="region"
        aria-label={scrubberLabel}
        tabIndex={0}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={value?.[0] ?? 0}
        aria-valuetext={ariaValueText}
        onKeyDown={handleKeyDown}
        className={cn(
          "gencl:relative gencl:left-1/2 gencl:flex gencl:w-full gencl:-translate-x-1/2 gencl:touch-none gencl:select-none gencl:items-center gencl:transition-all",
          "gencl:rounded-md",
          "focus:gencl:ring-2 focus:gencl:ring-primary focus:gencl:ring-opacity-50 focus:gencl:bg-black/10",
          className
        )}
        value={value}
        {...props}
      >
        {/* Screen reader announcement for navigation */}
        <div aria-live="polite" aria-atomic="true" className="gencl:sr-only">
          {navigationAnnouncement}
        </div>
        <SliderPrimitive.Track
          className={cn(
            "gencl:relative gencl:h-[3px] gencl:w-full gencl:grow gencl:overflow-hidden gencl:bg-white/50 "
          )}
        >
          <SliderPrimitive.Range className="gencl:absolute gencl:h-full gencl:bg-primary " />
        </SliderPrimitive.Track>
        {showSeeker && (
          <SliderPrimitive.Thumb
            className={cn(
              "gencl:block gencl:cursor-pointer gencl:h-3 gencl:w-3 gencl:rounded-full gencl:border-2 gencl:border-primary gencl:bg-primary gencl:outline-none gencl:transition-all gencl:disabled:pointer-events-none gencl:disabled:opacity-50"
            )}
          >
            {showScrubber && (
              <div
                className={cn(
                  "gencl:flex gencl:w-24 gencl:-translate-x-[40%] gencl:flex-col gencl:items-center gencl:transition-all",
                  showOnlyTime
                    ? "gencl:-translate-y-10"
                    : "gencl:-translate-y-[calc(100%+36px)]",
                  value &&
                    value[0] !== undefined &&
                    value[0] < 3 &&
                    "gencl:-translate-x-1/5",
                  value &&
                    value[0] !== undefined &&
                    value[0] > 97 &&
                    "gencl:-translate-x-3/4"
                )}
              >
                {!showOnlyTime && spriteUrl && (
                  <div
                    className="gencl:aspect-reel gencl:w-24 gencl:overflow-clip gencl:rounded-lg gencl:border gencl:border-white"
                    style={{
                      height: `${frameHeight}px`,
                      backgroundImage: `url(${getWebpUrlForImage(spriteUrl)})`,
                      ...spritePosition,
                      backgroundSize: `${framesPerRow * frameWidth}px ${framesPerColumn * frameHeight}px`,
                    }}
                  />
                )}
                <p className="gencl:text-body-0-semi-bold gencl:text-white">
                  {time}
                </p>
              </div>
            )}
          </SliderPrimitive.Thumb>
        )}
      </SliderPrimitive.Root>
    );
  }
);

ScrubberSlider.displayName = "ScrubberSlider";

export { ScrubberSlider };
