import { cn } from '@/lib/utils'
import { type StaticImageData } from 'next/image'
import { type ComponentProps, type ReactNode } from 'react'
import Image from 'next/image'
import { useGenuinOptions } from '@/lib/stores/genuin-options'
import gifChevronUp from '@images/gifs/chevronUp.gif'
import gifClickGesture from '@images/gifs/clickGesture.png'
import gifTapGesture from '@images/gifs/tapGesture.png'
import gifSwipeGesture from '@images/gifs/swipeGesture.png'
import { useKsGestureStore } from '@/lib/stores/ks-gestures'
import { usePlayerControlStore } from './player/player-control-store'
import { useShallow } from 'zustand/react/shallow'

/**
 * When user comes on website for the first time ksGestures will be shown.
 * To educate user about the gestures to use the <Feed />.
 * It will be shown only once. And local-storage will be used to store the state.
 */
export function KsGestureTypes({ gestureStep }: { gestureStep: 'PLAY_PAUSE' | 'SWIPE' }) {
  const { isMobile } = useGenuinOptions()
  const { gestureOverlays, setGestureOverlay } = useKsGestureStore()
  const { play, pause, shouldPlay } = usePlayerControlStore(
    useShallow((state) => ({
      play: state.play,
      pause: state.pause,
      shouldPlay: state.shouldPlay,
    }))
  )

  return (
    <div
      // PLAY_PAUSE gesture will end when the user takes action; this is typical for desktop and mobile devices.
      onClick={() => {
        if (gestureStep !== 'PLAY_PAUSE' || !gestureOverlays.SWIPE.hasShown) return

        setGestureOverlay('PLAY_PAUSE', false)

        shouldPlay ? pause() : play()
      }}
      className={cn(
        'fixed inset-0 z-[1000] h-full w-full bg-monochrome-black/40 backdrop-blur-sm sm:absolute',
        gestureStep !== 'PLAY_PAUSE' && 'pointer-events-none'
      )}>
      {gestureStep === 'SWIPE' &&
        (isMobile ? (
          <GestureContent
            image={gifSwipeGesture}
            text={
              <>
                Swipe up
                <br /> to view videos
              </>
            }
          />
        ) : (
          <GestureContent
            className="justify-end pb-20"
            image={gifChevronUp}
            text={
              <>
                Swipe up
                <br /> to view videos
              </>
            }
          />
        ))}
      {gestureStep === 'PLAY_PAUSE' &&
        (isMobile ? (
          <GestureContent
            image={gifTapGesture}
            text={
              <>
                Tap to play or pause <br /> while the video is
                <br /> unmuted
              </>
            }
          />
        ) : (
          <GestureContent
            image={gifClickGesture}
            text={
              <>
                Click to play or pause <br /> while the video is
                <br /> unmuted
              </>
            }
          />
        ))}
    </div>
  )
}

type GestureContentPropsType = {
  image: StaticImageData
  text: string | ReactNode
} & ComponentProps<'div'>

function GestureContent({ image, text, className }: GestureContentPropsType) {
  return (
    <div className={cn('flex h-full w-full flex-col items-center justify-center gap-2', className)}>
      <Image src={image} alt="gif" height={80} width={80} />
      <p className="text-center text-body-1-bold text-monochrome-white">{text}</p>
    </div>
  )
}
