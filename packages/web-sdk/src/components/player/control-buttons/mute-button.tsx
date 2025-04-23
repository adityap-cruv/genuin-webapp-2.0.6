import { useCallback, useEffect, useState } from 'react'
import { useBaseContext } from '@/context/base'
import { UnmuteIcon } from '../../icons/unmute-icon'
import { MuteIcon } from '../../icons/mute-icon'
import { AnimatedText } from './animated-text'

export const AnimatedMuteIcon = ({
  shouldAnimate,
}: {
  shouldAnimate: boolean
}) => {
  const { muted, updateMuted, setVolume, volume, handlePlayerAction } =
    useBaseContext()
  const isMobile = window.matchMedia('(max-width: 768px)').matches
  const [showVolumeSlider, setShowVolumeSlider] = useState(false)
  const [stopAnimating, setStopAnimating] = useState(!shouldAnimate)

  const handleClick = useCallback(
    (e: any) => {
      e.stopPropagation()
      updateMuted(!muted)
      handlePlayerAction(muted ? 'unmute' : 'mute')
      setStopAnimating(true)
    },
    [updateMuted],
  )

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation()
    const newVolume = Number(e.target.value)
    setVolume(newVolume)

    // Update progress color dynamically
    const progress = (newVolume / 100) * 100
    e.target.style.background = `linear-gradient(to right, white ${progress}%, #707070 ${progress}%)`
  }

  useEffect(() => {
    // Ensure slider updates on re-renders
    const slider = document.querySelector<HTMLInputElement>('.volume-slider')
    if (slider) {
      const progress = (volume / 100) * 100
      slider.style.background = `linear-gradient(to right, white ${progress}%, #707070 ${progress}%)`
    }
  }, [volume])

  return (
    <div
      onClick={handleClick}
      className={`group flex z-50 h-12 items-center justify-start overflow-hidden rounded-full bg-black/40 ${showVolumeSlider && !isMobile ? 'w-full bg-black/50' : 'bg-black/40'}`}
      onMouseEnter={() => {
        setShowVolumeSlider(true)
      }}
      onMouseLeave={() => {
        setShowVolumeSlider(false)
      }}>
      <div className='flex h-12 w-12 flex-shrink-0 items-center justify-center'>
        {volume > 0 ? (
          <UnmuteIcon variant='light' />
        ) : (
          <MuteIcon variant='light' />
        )}
      </div>

      {!showVolumeSlider && muted && (
        <AnimatedText
          text='Tap to unmute'
          width={125}
          stop={stopAnimating}
        />
      )}

      {/* Volume slider with smooth animation */}
      {!isMobile && showVolumeSlider && (
        <div
          className={`transition-all duration-300 ease-in-out ${
            showVolumeSlider ? 'opacity-100 w-full' : 'opacity-0 w-0'
          } flex items-center overflow-hidden py-2`}>
          <input
            type='range'
            min='0'
            max='100'
            value={volume}
            onChange={handleVolumeChange}
            onClick={(e) => {
              e.stopPropagation()
            }}
            style={{
              accentColor: 'white',
            }}
            className='volume-slider relative h-1 w-full cursor-pointer rounded-full'
          />
          <div className='h-full w-4' />
        </div>
      )}

      {/* Custom thumb and track progress styling */}
      <style>{`
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
            #707070 ${(volume / 100) * 100}%
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
