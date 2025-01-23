import { useCallback, useEffect } from 'react'
import Analytics from '@/services/analytics'
import { MuteIcon } from '@icons/player-controls/mute-icon'
import { UnmuteIcon } from '@icons/player-controls/unmute-icon'
import { usePlayerControlStore } from '../player-control-store'
import { motion, useAnimationControls } from 'framer-motion'

// TODO: Make this component more reusable
export const AnimatedMuteIcon = ({ videoId }: { videoId: string }) => {
  const { muted, toggleMuted } = usePlayerControlStore()
  const muteAnimationController = useAnimationControls()
  useEffect(() => {
    muteAnimationController
      ?.start({
        width: 122,
        transition: {
          delay: 3,
          duration: 0.5,
          repeatType: 'mirror',
          repeatDelay: 3,
          repeat: Infinity,
        },
      })
      .catch((_e) => {})
  }, [])

  const handleClick = useCallback(
    (e: any) => {
      e.stopPropagation()
      toggleMuted()
      void Analytics.track({
        eventName: muted ? 'Unmute' : 'Mute',
        properties: { video_id: videoId },
      })
    },
    [muted, toggleMuted, videoId]
  )

  return (
    <div
      onClick={handleClick}
      className="flex h-10 w-fit items-center justify-center overflow-hidden rounded-full bg-monochrome-black/40 pl-2">
      {muted ? <MuteIcon variant="light" /> : <UnmuteIcon variant="light" />}
      <div className="h-full w-2" />
      {muted && (
        <motion.div
          animate={muteAnimationController}
          exit={{ width: 0 }}
          initial={{ width: 0 }}
          className="text-body-1 flex w-auto min-w-0 overflow-clip text-clip whitespace-nowrap">
          <p className="text-monochrome-white">Tap to unmute</p>
          <div className="h-full w-2" />
        </motion.div>
      )}
    </div>
  )
}
