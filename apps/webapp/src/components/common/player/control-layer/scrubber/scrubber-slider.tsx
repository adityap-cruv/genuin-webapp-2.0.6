'use client'

import * as React from 'react'
import * as SliderPrimitive from '@radix-ui/react-slider'
import { cn, getWebpUrlForImage } from '@/lib/utils'
import { usePlayerContext } from '../../context'

type SliderPropsType = React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> & {
  spriteUrl: string
}

const framesPerRow = 12
const framesPerColumn = 10
const intervalMs = 1000
const frameWidth = 96
const frameHeight = 170

/**
 * Calculate the position in a sprite sheet based on time position
 * Inspired by ThumbnailExtractOperation Swift implementation
 */
function getSpritePosition(
  timeMs: number,
  options: {
    columns: number
    rows: number
    intervalMs: number
    frameWidth: number
    frameHeight: number
  }
): { backgroundPosition: string } {
  const { columns, rows, intervalMs, frameWidth, frameHeight } = options

  // Calculate the frame index based on time
  const frameIndex = Math.floor(timeMs / intervalMs)

  // Calculate row and column position
  const y = Math.floor(frameIndex / columns)
  const x = frameIndex % columns

  // Apply bounds checking
  const boundedY = Math.min(Math.max(0, y), rows - 1)
  const boundedX = Math.min(Math.max(0, x), columns - 1)

  // Return CSS background position
  return {
    backgroundPosition: `-${boundedX * frameWidth}px -${boundedY * frameHeight}px`,
  }
}

const ScrubberSlider = React.forwardRef<React.ElementRef<typeof SliderPrimitive.Root>, SliderPropsType>(
  ({ value, className, spriteUrl, ...props }, ref) => {
    const { duration, showScrubber, showSeeker } = usePlayerContext()
    const scrubberStartTime = React.useMemo(() => ((value?.[0] ?? 0) / 100) * duration, [value, duration])

    const time = React.useMemo(() => {
      if (!duration || !value?.[0]) return '00:00'

      const totalSeconds = (value[0] / 100) * duration
      const minutes = Math.floor(totalSeconds / 60)
      const seconds = Math.floor(totalSeconds % 60)
      return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    }, [value, duration])

    const spritePosition = React.useMemo(() => {
      const timeMs = scrubberStartTime * 1000
      return getSpritePosition(timeMs, {
        columns: framesPerRow,
        rows: framesPerColumn,
        intervalMs,
        frameWidth,
        frameHeight,
      })
    }, [scrubberStartTime])

    return (
      <SliderPrimitive.Root
        ref={ref}
        className={cn(
          'relative left-1/2 flex w-full -translate-x-1/2 touch-none select-none items-center transition-all',
          showSeeker && 'mx-auto w-[90%] py-1.5',
          className
        )}
        value={value}
        {...props}>
        <SliderPrimitive.Track className={cn('relative h-[3px] w-full grow overflow-hidden bg-secondary ')}>
          <SliderPrimitive.Range className="absolute h-full bg-primary " />
        </SliderPrimitive.Track>
        {showSeeker && (
          <SliderPrimitive.Thumb
            className={cn(
              'block h-3 w-3 rounded-full border-2 border-primary bg-primary outline-none transition-all disabled:pointer-events-none disabled:opacity-50'
            )}>
            {showScrubber && (
              <div
                className={cn(
                  'flex w-24 -translate-x-[40%] -translate-y-[calc(100%+36px)] flex-col items-center transition-all',
                  value && value[0] < 3 && '-translate-x-[20%]',
                  value && value[0] > 97 && '-translate-x-3/4'
                )}>
                <div
                  className="aspect-reel w-24 overflow-clip rounded-lg border border-monochrome-white"
                  style={{
                    height: `${frameHeight}px`,
                    backgroundImage: `url(${getWebpUrlForImage(spriteUrl)})`,
                    ...spritePosition,
                    backgroundSize: `${framesPerRow * frameWidth}px ${framesPerColumn * frameHeight}px`,
                  }}
                />
                <p className="text-title-3-demi text-monochrome-white">{time}</p>
              </div>
            )}
          </SliderPrimitive.Thumb>
        )}
      </SliderPrimitive.Root>
    )
  }
)

ScrubberSlider.displayName = 'ScrubberSlider'

export { ScrubberSlider }
