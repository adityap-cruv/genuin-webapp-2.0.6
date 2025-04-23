import { PauseIcon } from '@/components/icons/pause-icon'
import { PlayIcon } from '@/components/icons/play-icon'
import { cn } from '@/utils'
import { ComponentProps, memo, useEffect, useRef, useState } from 'react'
import { AnimatedText } from './animated-text'
import { useBaseContext } from '@/context/base'

type PlayButtonProps = {
  shouldAnimate: boolean
} & ComponentProps<'div'>

export const AnimatedPlayButton = memo(function PlayButton({
  className,
  shouldAnimate,
  ...restProps
}: PlayButtonProps) {
  const { setIsVideoPlaying, isVideoPlaying, handlePlayerAction } =
    useBaseContext()
  const [stopAnimating, setStopAnimating] = useState(!shouldAnimate)
  const [hasInteracted, setHasInteracted] = useState(false)
  const prevState = useRef(isVideoPlaying)

  useEffect(() => {
    if (hasInteracted) {
      setStopAnimating(true)
    }
  }, [hasInteracted])

  useEffect(() => {
    if (prevState.current !== isVideoPlaying) {
      setHasInteracted(true)
      prevState.current = isVideoPlaying
    }
  }, [isVideoPlaying])

  return (
    <div
      onClick={(e) => {
        e.stopPropagation()
        setIsVideoPlaying(!isVideoPlaying)
        handlePlayerAction(isVideoPlaying ? 'pause' : 'play')
        setHasInteracted(true)
      }}
      onMouseEnter={() => {
        if (!hasInteracted) setStopAnimating(true)
      }}
      onMouseLeave={() => {
        if (!hasInteracted) setStopAnimating(false)
      }}
      className={cn(
        'group flex h-12 items-center rounded-full bg-black/40 transition-all duration-300 ease-in-out hover:bg-black/50',
        className,
      )}
      {...restProps}>
      <div className='flex h-12 w-12 flex-shrink-0 items-center justify-center'>
        {isVideoPlaying ? (
          <PauseIcon variant='light' />
        ) : (
          <PlayIcon variant='light' />
        )}
      </div>

      {/* Animated Text should stop once user interacts */}
      {!hasInteracted && (
        <AnimatedText
          text='Tap to play'
          width={110}
          stop={stopAnimating}
        />
      )}
    </div>
  )
})
