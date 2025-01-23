import { useCallback, useEffect } from 'react'
import Analytics from '@/services/analytics'
import { MuteIcon } from '@icons/player-controls/mute-icon'
import { UnmuteIcon } from '@icons/player-controls/unmute-icon'
import { usePlayerControlStore } from '../player-control-store'
import { motion, useAnimationControls } from 'framer-motion'

export const MuteUnmuteButton = ({ videoId }: { videoId: string }) => {
  const { muted, toggleMuted } = usePlayerControlStore()
  const muteAnimationController = useAnimationControls()
  useEffect(() => {
    muteAnimationController
      ?.start({
        width: 0,
        transition: {
          delay: 4,
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
      className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-monochrome-black/40">
      {muted ? <MuteIcon variant="light" /> : <UnmuteIcon variant="light" />}
      <div className="h-full w-2" />
      {muted && (
        <motion.div
          animate={muteAnimationController}
          initial={{ width: 122 }}
          className="flex w-auto min-w-0 overflow-clip text-clip whitespace-nowrap text-body-1-bold">
          <p>Tap to unmute</p>
          <div className="h-full w-2" />
        </motion.div>
      )}
    </div>
  )
}
