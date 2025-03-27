import { cn } from '@/lib/utils'
import { type StaticImageData } from 'next/image'
import { type ComponentProps, type ReactNode } from 'react'
import Image from 'next/image'
import { useGenuinOptions } from '@/lib/stores/genuin-options'
import gifChevronUp from '@images/gifs/chevronUp.gif'
import gifClickGesture from '@images/gifs/clickGesture.png'
import gifTapGesture from '@images/gifs/tapGesture.png'
import gifSwipeGesture from '@images/gifs/swipeGesture.png'
import { type GestureOverlayKeysType } from './gesture-store'

const GESTURE_CONFIG: Record<
  GestureOverlayKeysType,
  { mobileImage: StaticImageData; desktopImage: StaticImageData; text: ReactNode }
> = {
  SWIPE: {
    mobileImage: gifSwipeGesture,
    desktopImage: gifChevronUp,
    text: (
      <>
        Swipe up
        <br /> to view videos
      </>
    ),
  },
  PLAY_PAUSE: {
    mobileImage: gifTapGesture,
    desktopImage: gifClickGesture,
    text: (
      <>
        Tap to play or pause <br /> while the video is
        <br /> unmuted
      </>
    ),
  },
}

type LazyGestureGuideOverlayProps = {
  gestureStep: GestureOverlayKeysType
  onClick?: () => void
} & ComponentProps<'div'>

export function LazyGestureGuideOverlay({ gestureStep, className, onClick }: LazyGestureGuideOverlayProps) {
  const { isMobile } = useGenuinOptions()

  const gestureData = GESTURE_CONFIG[gestureStep]
  if (!gestureData) return null

  return (
    <div
      onClick={() => {
        onClick?.()
      }}
      className={cn(
        'pointer-events-none fixed inset-0 z-[1000] h-full w-full bg-monochrome-black/40 backdrop-blur-sm sm:absolute'
      )}>
      <div
        className={cn(
          'flex h-full w-full flex-col items-center justify-center gap-2',
          gestureStep === 'SWIPE' && !isMobile && 'justify-end pb-20',
          className
        )}>
        <Image
          src={isMobile ? gestureData.mobileImage : gestureData.desktopImage}
          alt="gesture"
          height={80}
          width={80}
        />
        <p className="text-center text-body-1-bold text-monochrome-white">{gestureData.text}</p>
      </div>
    </div>
  )
}
