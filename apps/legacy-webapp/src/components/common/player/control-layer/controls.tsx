import { memo, type ComponentProps } from 'react'
import { CollapseIcon } from '@icons/player-controls/collapse-icon'
import { ExpandIcon } from '@icons/player-controls/expand-icon'
import { usePlayerControlStore } from '../player-control-store'
import { useAnalyticsTracker } from './actions/use-analytics-event'
import { cn } from '@/lib/utils'
import { useGenuinOptions } from '@/lib/stores/genuin-options'
import { AnimatedPlayButton } from './play-button'
import { AnimatedMuteButton } from './mute-button'

type ControlButtonsPropsType = ComponentProps<'div'> & {
  videoId: string
}

export const Controls = memo(function Controls({ videoId, className, ...restProps }: ControlButtonsPropsType) {
  const { isMobile } = useGenuinOptions((state) => ({
    isMobile: state.isMobile,
  }))
  const { toggleFullScreen, isFullScreen } = usePlayerControlStore()
  const { trackEvent } = useAnalyticsTracker()
  return (
    <>
      <div
        className="absolute inset-0 z-10 h-20"
        style={{
          background: 'linear-gradient(0deg, rgba(0, 0, 0, 0.00) 0%, rgba(0, 0, 0, 0.50) 100%)',
        }}
      />
      <div
        className={cn('absolute top-16 z-40 flex h-20 w-full justify-between gap-3 px-4 pt-4 sm:top-0', className)}
        {...restProps}>
        <ControlButtons videoId={videoId} />
        {!isMobile && (
          <div
            onClick={(e) => {
              e.stopPropagation()
              toggleFullScreen()
              trackEvent(isFullScreen ? 'Video Minimized' : 'Video Maximized', videoId)
            }}
            className="hidden h-12 w-12 flex-shrink-0 cursor-pointer items-center justify-center rounded-full bg-monochrome-black/40 md:flex">
            {isFullScreen ? <CollapseIcon variant="light" /> : <ExpandIcon variant="light" />}
          </div>
        )}
      </div>
    </>
  )
})

export function ControlButtons({ videoId, className, ...restProps }: ControlButtonsPropsType) {
  const { isMobile, shouldAnimateMuteUnmute, shouldAnimatePlayPause, tapBehaviour } = useGenuinOptions((state) => ({
    isMobile: state.isMobile,
    shouldAnimatePlayPause: state.config.web_configs?.tap_behavior === 2,
    shouldAnimateMuteUnmute: state.config.web_configs?.tap_behavior !== 2,
    tapBehaviour: state.config.web_configs?.tap_behavior,
  }))

  // Show mute button only if tap behaviour is 2 (play/pause) or if it's not mobile
  const showMuteButton = isMobile ? tapBehaviour !== 1 : true
  // Show play button only if tap behaviour is 1 (mute/unmute) or if it's not mobile
  const showPlayButton = isMobile ? tapBehaviour === 1 : true

  return (
    <div className={cn('flex w-full gap-3', className)} {...restProps}>
      {showPlayButton && <AnimatedPlayButton videoId={videoId} shouldAnimate={shouldAnimatePlayPause} />}
      {showMuteButton && <AnimatedMuteButton videoId={videoId} shouldAnimate={shouldAnimateMuteUnmute} />}
    </div>
  )
}
