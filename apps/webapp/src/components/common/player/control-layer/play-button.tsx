import { useCallback, useEffect, useState, useMemo } from 'react'
import { useAnimationControls } from 'framer-motion'
import Analytics from '@/services/analytics'
import { PlayIcon } from '@icons/player-controls/play-icon'
import { PauseIcon } from '@icons/player-controls/pause-icon'
import { usePlayerControlStore } from '../player-control-store'
import { ControlAnimation } from './control-animations'

type AnimatedPlayButtonPropsType = {
  videoId: string
  /**
   * Whether to animate the button
   * @default true
   */
  shouldAnimate?: boolean
}

export const AnimatedPlayButton: React.FC<AnimatedPlayButtonPropsType> = ({ videoId, shouldAnimate = true }) => {
  const { isPlaying, setShouldPlay, shouldPlay, buttonAction } = usePlayerControlStore()
  const playAnimationController = useAnimationControls()
  const [show, setShow] = useState(true)

  const buttonText = useMemo(() => (shouldPlay ? 'Tap to pause' : 'Tap to play'), [shouldPlay])

  useEffect(() => {
    // If the button action is not empty, it means the button has been clicked
    if (buttonAction) {
      setShow(false)
    }
  }, [buttonAction])

  useEffect(() => {
    if (!shouldAnimate) {
      playAnimationController.stop()
      return
    }

    void playAnimationController?.start({
      width: 112,
      transition: {
        delay: 3,
        duration: 0.5,
        repeatType: 'mirror',
        repeatDelay: 3,
        repeat: Infinity,
      },
    })
  }, [])

  const handleClick = useCallback(
    (e: any) => {
      e.stopPropagation()
      setShouldPlay(!shouldPlay, true)
      void Analytics.track({
        eventName: isPlaying ? 'Pause' : 'Play',
        properties: { video_id: videoId },
      })
    },
    [isPlaying, setShouldPlay, shouldPlay, videoId]
  )

  return (
    <div
      onClick={handleClick}
      className="flex h-12 w-fit shrink-0 items-center justify-start overflow-hidden rounded-full bg-monochrome-black/40">
      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center">
        {shouldPlay ? <PauseIcon variant="light" /> : <PlayIcon variant="light" />}
      </div>
      <ControlAnimation text={buttonText} animationController={playAnimationController} show={show} />
    </div>
  )
}
