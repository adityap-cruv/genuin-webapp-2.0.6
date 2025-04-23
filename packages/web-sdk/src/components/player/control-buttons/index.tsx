import { cn } from '@/utils'
import { ComponentProps } from 'react'
import { AnimatedMuteIcon } from './mute-button'
import { AnimatedPlayButton } from './play-button'
import { useBrandDetails } from '@/context/brand-details'
import { useSizeContext } from '@/context/size'

type ControlButtonsProps = ComponentProps<'div'>

export function ControlButtons({
  className,
  ...restProps
}: ControlButtonsProps) {
  const { isMobile } = useSizeContext()
  const {
    brandDetails: {
      web_configs: { tap_behavior: tapBehavior },
    },
  } = useBrandDetails()

  // Show mute button only if tap behaviour is 2 (play/pause) or if it's not mobile
  const showMuteButton = isMobile ? tapBehavior !== 1 : true
  // Show play button only if tap behaviour is 1 (mute/unmute) or if it's not mobile
  const showPlayButton = isMobile ? tapBehavior === 1 : true
  // Animate play/pause button only if tap behaviour is 2
  const shouldAnimatePlayPause = tapBehavior === 2
  // Animate mute/unmute button only if tap behaviour is not 2
  const shouldAnimateMuteUnmute = tapBehavior !== 2

  return (
    <div
      className={cn('flex items-center gap-2 w-full', className)}
      {...restProps}>
      {showPlayButton && (
        <AnimatedPlayButton shouldAnimate={shouldAnimatePlayPause} />
      )}
      {showMuteButton && (
        <AnimatedMuteIcon shouldAnimate={shouldAnimateMuteUnmute} />
      )}
    </div>
  )
}
