import { useCallback, useEffect, useState } from 'react'
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
      toggleMuted({ byUser: true, videoId })
    },
    [muted, toggleMuted, videoId]
  )

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation()
    const newVolume = Number(e.target.value)
    setVolume(newVolume)

    // Update progress color dynamically
    const progress = (newVolume / 100) * 100
    e.target.style.background = `linear-gradient(to right, white ${progress}%, var(--monochrome-4) ${progress}%)`
  }

  useEffect(() => {
    // Ensure slider updates on re-renders
    const slider = document.querySelector<HTMLInputElement>('.volume-slider')
    if (slider) {
      const progress = (volume / 100) * 100
      slider.style.background = `linear-gradient(to right, white ${progress}%, var(--monochrome-4) ${progress}%)`
    }
  }, [volume])

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
            className="volume-slider relative h-1.5 w-full cursor-pointer rounded-full"
          />
        </motion.div>
      )}

      {/* Custom thumb and track progress styling */}
      {/* eslint-disable-next-line react/no-unknown-property */}
      <style jsx>{`
        input[type='range'] {
          -webkit-appearance: none;
          appearance: none;
          width: 100%;
          cursor: pointer;
          outline: none;
          border-radius: 15px;
          height: 6px;
          background: linear-gradient(
            to right,
            white ${(volume / 100) * 100}%,
            var(--monochrome-4) ${(volume / 100) * 100}%
          );
        }

        input[type='range']::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          height: 15px;
          width: 15px;
          background-color: white;
          border-radius: 50%;
          border: none;
          transition: 0.2s ease-in-out;
        }
      `}</style>
    </div>
  )
}
