import { useCallback, useEffect, useState } from 'react'
import Analytics from '@/services/analytics'
import { MuteIcon } from '@icons/player-controls/mute-icon'
import { UnmuteIcon } from '@icons/player-controls/unmute-icon'
import { usePlayerControlStore } from '../player-control-store'
import { motion, useAnimationControls } from 'framer-motion'
import { useGenuinOptions } from '@/lib/stores/genuin-options'

export const AnimatedMuteIcon = ({ videoId }: { videoId: string }) => {
  const { muted, toggleMuted, setVolume, volume } = usePlayerControlStore()
  const muteAnimationController = useAnimationControls()
  const isMobile = useGenuinOptions().isMobile
  const [showVolumeSlider, setShowVolumeSlider] = useState(false)

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

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation()
    const newVolume = Number(e.target.value)
    setVolume(newVolume)
  }

  return (
    <div
      onClick={handleClick}
      className={`group flex h-12 items-center justify-start overflow-hidden rounded-full ${
        showVolumeSlider && !isMobile ? 'w-full bg-monochrome-black/50' : 'w-fit bg-monochrome-black/40'
      }`}
      onMouseEnter={() => {
        setShowVolumeSlider(true)
      }}
      onMouseLeave={() => {
        setShowVolumeSlider(false)
      }}>
      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center">
        {volume > 0 ? <UnmuteIcon variant="light" /> : <MuteIcon variant="light" />}
      </div>

      {!showVolumeSlider && muted && (
        <motion.div
          animate={muteAnimationController}
          exit={{ width: 0 }}
          initial={{ width: 0 }}
          className="text-body-1 flex w-auto min-w-0 overflow-clip text-clip whitespace-nowrap">
          <p className="text-monochrome-white">Tap to unmute</p>
          <div className="h-full w-2" />
        </motion.div>
      )}

      {/* Volume slider with smooth animation */}
      {!isMobile && (
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{
            width: showVolumeSlider ? '100%' : '0',
            opacity: showVolumeSlider ? 1 : 0,
          }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className={`${showVolumeSlider && 'mr-4'} flex items-center overflow-hidden py-2`}>
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={handleVolumeChange}
            onClick={(e) => {
              e.stopPropagation()
            }}
            className="accent relative h-1.5 w-full cursor-pointer rounded-full bg-secondary-300"
          />
        </motion.div>
      )}

      {/* Custom thumb and track progress styling */}
      {/* eslint-disable-next-line react/no-unknown-property */}
      <style jsx>{`
        .accent {
          accent-color: white;
        }
      `}</style>
    </div>
  )
}
