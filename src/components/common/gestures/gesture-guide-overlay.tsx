import { cn } from '@/lib/utils'
import { type StaticImageData } from 'next/image'
import { type ComponentProps, type ReactNode } from 'react'
import Image from 'next/image'
import gifChevronUp from '@images/gifs/chevronUp.gif'
import gifClickGesture from '@images/gifs/clickGesture.png'
import gifTapGesture from '@images/gifs/tapGesture.png'
import gifSwipeGesture from '@images/gifs/swipeGesture.png'
import { type GestureOverlayKeysType } from './gesture-store'

type GestureConfig = {
  mobileImage: StaticImageData
  desktopImage: StaticImageData
  getText: (tapBehavior?: any) => ReactNode
}

const GESTURE_CONFIG: Record<GestureOverlayKeysType, GestureConfig> = {
  SWIPE: {
    mobileImage: gifSwipeGesture,
    desktopImage: gifChevronUp,
    getText: () => (
      <>
        Swipe up
        <br /> to view videos
      </>
    ),
  },
  PLAY_PAUSE: {
    mobileImage: gifTapGesture,
    desktopImage: gifClickGesture,
    getText: (tapBehavior: number) => {
      switch (tapBehavior) {
        case 1:
          return <>Tap to Mute/Unmute</>
        case 2:
          return <>Tap to Play/Pause</>
        case 3:
          return (
            <>
              Tap to play or pause <br /> while the video is
              <br /> unmuted
            </>
          )
        default:
          return (
            <>
              Tap to play or pause <br /> while the video is
              <br /> unmuted
            </>
          )
      }
    },
  },
}

type LazyGestureGuideOverlayProps = {
  gestureStep: GestureOverlayKeysType
  tapBehavior?: number
} & ComponentProps<'div'>

export function LazyGestureGuideOverlay({ gestureStep, tapBehavior, className }: LazyGestureGuideOverlayProps) {
  const gestureData = GESTURE_CONFIG[gestureStep]
  if (!gestureData) return null

  const gestureText = gestureData.getText(tapBehavior)
  return (
    <div
      className={cn(
        'pointer-events-none fixed inset-0 z-[1000] h-full w-full bg-monochrome-black/40 backdrop-blur-sm sm:absolute'
      )}>
      <div
        className={cn(
          'flex h-full w-full flex-col items-center justify-center gap-2',
          gestureStep === 'SWIPE' && 'sm:justify-end sm:pb-20',
          className
        )}>
        <Image src={gestureData.mobileImage} alt="gesture" height={80} width={80} className="sm:hidden" />
        <Image src={gestureData.desktopImage} alt="gesture" height={80} width={80} className="hidden sm:block" />
        <p className="text-center text-body-1-bold text-monochrome-white">{gestureText}</p>
      </div>
    </div>
  )
}
