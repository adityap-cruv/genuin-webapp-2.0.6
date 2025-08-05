import { useCallback, useEffect, useState, type ComponentProps } from 'react'
import { ScrubberSlider } from './scrubber-slider'
import { cn } from '@/utils'
import { usePlayerContext } from '../../context'
import { useBaseContext } from '@/context/base'

type ScrubberPropsType = ComponentProps<typeof ScrubberSlider> & {
  spriteUrl?: string
  showSeeker?: boolean
  value?: number[]
}

export function Scrubber({
  value,
  spriteUrl,
  className,
  ...restProps
}: ScrubberPropsType) {
  const { timeState, setShowScrubber, playerRef, play } = usePlayerContext()
  const { setIsVideoPlaying } = useBaseContext()
  const [progressValue, setProgressValue] = useState(0)

  useEffect(() => {
    if (!timeState.duration) return
    setProgressValue(
      Math.round((timeState.currentTime / timeState.duration) * 100),
    )
  }, [timeState])

  // Handle touch event for seeking
  const handleSeek = useCallback(
    (value: number[]) => {
      setProgressValue(value[0])
      setShowScrubber(true)
    },
    [setShowScrubber],
  )

  const handleValueCommit = useCallback(
    (value: number[]) => {
      if (!timeState.duration) return

      const seekPosition = value[0]
      const seekTime = (seekPosition / 100) * timeState.duration
      setShowScrubber(false)

      // Update video time
      if (playerRef.current) {
        playerRef.current.player.getMedia().currentTime = seekTime
        play()
        setIsVideoPlaying(true)
      }
    },
    [timeState, setShowScrubber],
  )

  return (
    <ScrubberSlider
      value={value ?? [progressValue]} // Pass the current progress value
      className={cn('w-full swiper-no-swiping rounded-none', className)}
      spriteUrl={spriteUrl ?? ''}
      onValueChange={handleSeek}
      onValueCommit={handleValueCommit}
      {...restProps}
    />
  )
}
