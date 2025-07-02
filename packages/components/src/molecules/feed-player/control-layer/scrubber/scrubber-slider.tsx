"use client";

import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn, getWebpUrlForImage } from "@genuin/ui/utils";
import { usePlayerContext } from "../../context/context";

type SliderPropsType = React.ComponentPropsWithoutRef<
  typeof SliderPrimitive.Root
> & {
  spriteUrl: string;
};

const framesPerRow = 12;
const framesPerColumn = 10;
const intervalMs = 1000;
const frameWidth = 96;
const frameHeight = 170;

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
      ...props
    },
    ref
  ) => {
    const scrubberStartTime = React.useMemo(
      () => ((value?.[0] ?? 0) / 100) * playerTimeState.duration,
      [value, playerTimeState]
    );

    const time = React.useMemo(() => {
      const duration = playerTimeState.duration;
      if (!duration || !value?.[0]) return "00:00";

      const totalSeconds = (value[0] / 100) * duration;
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = Math.floor(totalSeconds % 60);
      return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    }, [value, playerTimeState]);

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

    return (
      <SliderPrimitive.Root
        ref={ref}
        className={cn(
          "gencl:relative gencl:left-1/2 gencl:flex gencl:w-full gencl:-translate-x-1/2 gencl:touch-none gencl:select-none gencl:items-center gencl:transition-all",
          showSeeker &&
            "gencl:mx-auto gencl:-translate-y-2 gencl:w-[92%] gencl:pb-3 gencl:py-1.5",
          className
        )}
        value={value}
        {...props}
      >
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
                  "gencl:flex gencl:w-24 gencl:-translate-x-[40%] gencl:-translate-y-[calc(100%+36px)] gencl:flex-col gencl:items-center gencl:transition-all",
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
                <div
                  className="gencl:aspect-reel gencl:w-24 gencl:overflow-clip gencl:rounded-lg gencl:border gencl:border-white"
                  style={{
                    height: `${frameHeight}px`,
                    backgroundImage: `url(${getWebpUrlForImage(spriteUrl)})`,
                    ...spritePosition,
                    backgroundSize: `${framesPerRow * frameWidth}px ${framesPerColumn * frameHeight}px`,
                  }}
                />
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
