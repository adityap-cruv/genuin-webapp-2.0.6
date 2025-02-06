import { DesktopDetails } from './desktop-details'
import { type ComponentProps, memo, useCallback } from 'react'
import { type Swiper as SwiperType } from 'swiper/types'
import { cn } from '@lib/utils'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Mousewheel, Keyboard } from 'swiper/modules'
import { type VideoSizeBoxType, useGenuinOptions } from '@lib/stores/genuin-options'
import { type VideoPlayerModalType } from '@lib/schemas/player/video'
import { useShallow } from 'zustand/react/shallow'
import { FeedContextProvider, useFeedListContext } from '@components/providers/feed-provider'
import { FeedShimmer } from '../shimmers/feed-shimmer'
import Analytics from '@/services/analytics'
import { usePlayerControlStore } from '../player/player-control-store'
import { Player } from '../player'
import { KsGestureTypes } from '../ks-gestures-types'
import { useGestureOverlay } from '@/hooks/use-gesture-overlay'

type DesktopProps = {
  isLoading: boolean
  isFetchingNextPage: boolean
  fetchNextPage?: () => void
  videos: VideoPlayerModalType[]
  hasNextPage: boolean
  startIndex: number
  className?: string
  /**
   * Pass this parameter if you want to configure custom size box.
   */
  customSizeBox?: VideoSizeBoxType
} & ComponentProps<'div'>

export const Desktop = memo(function Desktop({
  fetchNextPage,
  className,
  customSizeBox,
  videos,
  isFetchingNextPage,
  hasNextPage,
  isLoading,
  startIndex,
  ...restProps
}: DesktopProps) {
  if (isLoading || !videos || videos.length === 0) {
    return <FeedShimmer.desktop />
  }

  return (
    <FeedContextProvider
      startIndex={startIndex}
      videos={videos}
      fetchNextPage={fetchNextPage}
      hasNextPage={hasNextPage}
      isFetchingNextPage={isFetchingNextPage}>
      <SwiperRenderer customSizeBox={customSizeBox} startIndex={startIndex} {...restProps} />
    </FeedContextProvider>
  )
})

type SwiperRendererProps = { customSizeBox?: VideoSizeBoxType; startIndex: number } & ComponentProps<'div'>

const SHELLS = Array.from({ length: 100 })
function SwiperRenderer({ customSizeBox, startIndex, className, ...restProps }: SwiperRendererProps) {
  const { defaultSizeBox } = useGenuinOptions(useShallow((state) => ({ defaultSizeBox: state.sizeBoxes.default })))

  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
  const sizeBox = customSizeBox || defaultSizeBox
  const { allowSlideNext, currentIndex, updateCurrentIndex, videos } = useFeedListContext()
  const { gestureOverlays, setGestureOverlay } = useGestureOverlay(currentIndex)
  const { muted } = usePlayerControlStore(
    useShallow((state) => ({
      muted: state.muted,
    }))
  )

  const handleActiveIndexChange = useCallback(
    (swiper: SwiperType) => {
      // SWIPE gesture will end when the user takes action;
      setGestureOverlay('SWIPE', false)

      updateCurrentIndex(swiper.activeIndex)
    },
    [updateCurrentIndex]
  )

  if (!videos || videos.length === 0)
    return (
      <div className={cn('flex aspect-reel h-full items-center justify-center bg-tertiary-200', className)}>
        <p className="text-title-3-demi text-tertiary">No activity yet</p>
      </div>
    )

  return (
    <div style={{ height: sizeBox.height }} className={cn('flex h-full w-full', className)} {...restProps}>
      <Swiper
        // PLAY_PAUSE gesture will end when the user takes action;
        onClick={() => {
          if (!muted) setGestureOverlay('PLAY_PAUSE', false)
        }}
        onActiveIndexChange={handleActiveIndexChange}
        allowSlideNext={allowSlideNext}
        keyboard={true}
        initialSlide={startIndex}
        speed={500}
        modules={[Mousewheel, Keyboard]}
        mousewheel
        style={{ width: sizeBox.width, height: sizeBox.height }}
        direction="vertical">
        {SHELLS.map((_, index) => {
          return (
            <SwiperSlide key={index}>
              {({ isActive, isPrev, isNext }) => {
                if (isActive || isPrev || isNext)
                  if (videos[index])
                    return (
                      <Player.desktop
                        isActive={isActive}
                        videoData={{
                          ...videos[index].video,
                          clickableUrl: videos[index].video.clickableUrl,
                        }}
                        loop
                        key={index}
                        onEnded={() => {
                          const { currentTime, duration } = usePlayerControlStore.getState()
                          Analytics.triggerAnalyticsForVideoComplete(videos[index].video.id, duration, currentTime)

                          if (!gestureOverlays.SWIPE.hasShown && videos.length > 1) {
                            setGestureOverlay('SWIPE', true)
                          }
                        }}
                      />
                    )
              }}
            </SwiperSlide>
          )
        })}

        {/* Display gestures according to kind gestureStep */}
        {gestureOverlays.SWIPE.isVisible && <KsGestureTypes gestureStep="SWIPE" />}
        {gestureOverlays.PLAY_PAUSE.isVisible && !muted && <KsGestureTypes gestureStep="PLAY_PAUSE" />}
      </Swiper>
      <DesktopDetails {...videos[currentIndex]} />
    </div>
  )
}
