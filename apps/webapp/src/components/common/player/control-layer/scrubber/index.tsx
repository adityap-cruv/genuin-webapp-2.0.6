import { type ComponentProps, useCallback, useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { ScrubberSlider } from './scrubber-slider'
import { usePlayerContext } from '../../context'
import { usePlayerControlStore } from '../../player-control-store'

type ScrubberPropsType = ComponentProps<typeof ScrubberSlider> & {
  spriteUrl?: string
  showSeeker?: boolean
  value?: number[]
}

export function Scrubber({ spriteUrl, className, value, ...restProps }: ScrubberPropsType) {
  const { setShouldPlay } = usePlayerControlStore()
  const { currentTime, duration, playerRef, setShowScrubber, play } = usePlayerContext()
  const [progressValue, setProgressValue] = useState(0)

  useEffect(() => {
    if (!duration) return
    setProgressValue(Math.round((currentTime / duration) * 100))
  }, [currentTime, duration])

  // Handle touch event for seeking
  const handleSeek = useCallback(
    (value: number[]) => {
      setProgressValue(value[0])
      setShowScrubber(true)
    },
    [setShowScrubber]
  )

  const handleValueCommit = useCallback(
    (value: number[]) => {
      if (!duration) return

      const seekPosition = value[0]
      const seekTime = (seekPosition / 100) * duration
      setShowScrubber(false)

      // Update video time
      if (playerRef.current) {
        playerRef.current.getMedia().currentTime = seekTime
        void play(playerRef.current).then(() => {
          setShouldPlay(true)
        })
      }
    },
    [duration, playerRef, setShowScrubber]
  )

  return (
    <ScrubberSlider
      value={value ?? [progressValue]} // Pass the current progress value
      className={cn('swiper-no-swiping rounded-none', className)}
      spriteUrl={spriteUrl ?? ''}
      onValueChange={handleSeek}
      onValueCommit={handleValueCommit}
      {...restProps}
    />
  )
}
