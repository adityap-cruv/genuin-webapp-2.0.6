import { type ComponentProps, type ReactNode } from 'react'
import { cn, getGifLink, getIconLink } from '@/utils'
import { GestureOverlayKeysType } from './context'

const GESTURE_CONFIG: Record<
  GestureOverlayKeysType,
  { mobileImage: string; desktopImage: string; text: ReactNode }
> = {
  SWIPE: {
    mobileImage: getIconLink('swipeGesture', 'png'),
    desktopImage: getGifLink('chevronUp'),
    text: (
      <>
        Swipe up
        <br /> to view videos
      </>
    ),
  },
  PLAY_PAUSE: {
    mobileImage: getIconLink('tapGesture', 'png'),
    desktopImage: getIconLink('clickGesture', 'png'),
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

export function LazyGestureGuideOverlay({
  gestureStep,
  className,
  onClick,
}: LazyGestureGuideOverlayProps) {
  const gestureData = GESTURE_CONFIG[gestureStep]
  if (!gestureData) return null

  return (
    <div
      onClick={() => {
        onClick?.()
      }}
      className={cn(
        'fixed inset-0 z-[1000] h-full w-full bg-black/40 backdrop-blur-sm sm:absolute pointer-events-none',
      )}>
      <div
        className={cn(
          'flex h-full w-full flex-col items-center justify-center gap-2',
          gestureStep === 'SWIPE' && 'sm:justify-end sm:pb-20',
          className,
        )}>
        <img
          src={gestureData.mobileImage}
          alt='gesture'
          className='h-20 w-20 sm:hidden'
        />
        <img
          src={gestureData.desktopImage}
          alt='gesture'
          className='h-20 w-20 hidden sm:block'
        />
        <p className='text-center text-body-1-bold text-white'>
          {gestureData.text}
        </p>
      </div>
    </div>
  )
}
