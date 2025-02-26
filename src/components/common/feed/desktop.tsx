import { DesktopDetails } from './desktop-details'
import { type ComponentProps, memo, useCallback, useRef, useState } from 'react'
import { type Swiper as SwiperType } from 'swiper/types'
import { cn } from '@lib/utils'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Mousewheel, Keyboard, Virtual } from 'swiper/modules'
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
import { Actions } from '../player/control-layer/actions'
import FullScreenCommentBox from '../full-screen-comment-box'
import FullScreenSideButtons from '../full-screen-side-buttons'
import FullScreenVideoDetails from '../full-screen-video-details'
import { UAParser } from 'ua-parser-js'

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
const CONFIG = {
  SCROLL_DELAY: 500,
  THRESHOLD_TIME: 400, // Increased from 300
  MOUSE_THRESHOLD: {
    WINDOWS: 30, // Higher threshold for Windows
    DEFAULT: 20, // Original threshold for other OS
  },
  MOUSE_SENSITIVITY: {
    WINDOWS: 0.8, // Lower sensitivity for Windows
    DEFAULT: 1, // Original sensitivity for other OS
  },
  DEBOUNCE_TIME: 150, // New debounce time for wheel events
}
function SwiperRenderer({ customSizeBox, startIndex, className, ...restProps }: SwiperRendererProps) {
  const [swiperInstance, setSwiperInstance] = useState<SwiperType | null>(null)
  const { defaultSizeBox } = useGenuinOptions(useShallow((state) => ({ defaultSizeBox: state.sizeBoxes.default })))

  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
  const sizeBox = customSizeBox || defaultSizeBox
  const { allowSlideNext, currentIndex, updateCurrentIndex, videos } = useFeedListContext()
  const { gestureOverlays, setGestureOverlay } = useGestureOverlay(currentIndex)
  const { muted, isFullScreen, isCommentBoxOpen } = usePlayerControlStore(
    useShallow((state) => ({
      muted: state.muted,
      isFullScreen: state.isFullScreen,
      isCommentBoxOpen: state.isCommentBoxOpen,
    }))
  )
  const isWindows = new UAParser().getResult().os.name === 'Windows'
  const touchTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const wheelTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const swiperRef = useRef<SwiperType | null>(null)
  const lastWheelTime = useRef<number>(0)

  const clearTimeouts = useCallback(() => {
    if (touchTimeoutRef.current) {
      clearTimeout(touchTimeoutRef.current)
      touchTimeoutRef.current = null
    }
    if (wheelTimeoutRef.current) {
      clearTimeout(wheelTimeoutRef.current)
      wheelTimeoutRef.current = null
    }
  }, [])

  const handleWheel = useCallback((swiper: SwiperType, event: WheelEvent) => {
    const now = Date.now()
    if (now - lastWheelTime.current < CONFIG.DEBOUNCE_TIME) {
      event.preventDefault()
      return false
    }
    lastWheelTime.current = now
    return true
  }, [])

  const handleActiveIndexChange = useCallback(
    (swiper: SwiperType) => {
      // SWIPE gesture will end when the user takes action;
      setGestureOverlay('SWIPE', false)

      updateCurrentIndex(swiper.activeIndex)
    },
    [updateCurrentIndex]
  )

  const handleSlideChange = useCallback(
    (swiper: SwiperType) => {
      clearTimeouts()
      swiper.mousewheel.disable()

      touchTimeoutRef.current = setTimeout(() => {
        swiper.mousewheel.enable()
      }, CONFIG.SCROLL_DELAY)
    },
    [clearTimeouts]
  )

  if (!videos || videos.length === 0)
    return (
      <div className={cn('flex aspect-reel h-full items-center justify-center bg-tertiary-200', className)}>
        <p className="text-title-3-demi text-tertiary">No activity yet</p>
      </div>
    )

  return (
    <div
      style={{
        height: isFullScreen ? undefined : sizeBox.height,
        backgroundColor: isFullScreen ? 'black' : 'transparent',
      }}
      className={cn('flex h-full w-full', className, {
        'fixed inset-0 z-50': isFullScreen,
      })}
      {...restProps}>
      <div className="relative flex h-full w-full justify-center gap-20">
        <div className={cn('flex', { 'h-full w-full': !isFullScreen })}>
          <Swiper
            // PLAY_PAUSE gesture will end when the user takes action;
            onClick={() => {
              if (!muted) setGestureOverlay('PLAY_PAUSE', false)
            }}
            onSwiper={(swiper) => {
              swiperRef.current = swiper
              ;(swiper as any).on('wheel', handleWheel)
            }}
            direction="vertical"
            modules={[Mousewheel, Keyboard, Virtual]}
            slidesPerView={1}
            speed={CONFIG.SCROLL_DELAY}
            initialSlide={startIndex}
            allowSlideNext={allowSlideNext}
            allowSlidePrev={true}
            keyboard={{
              enabled: true,
              onlyInViewport: true,
            }}
            virtual={{
              enabled: true,
              addSlidesAfter: 1,
              addSlidesBefore: 1,
            }}
            mousewheel={{
              forceToAxis: true,
              releaseOnEdges: true,
              thresholdDelta: isWindows ? CONFIG.MOUSE_THRESHOLD.WINDOWS : CONFIG.MOUSE_THRESHOLD.DEFAULT,
              thresholdTime: CONFIG.THRESHOLD_TIME,
              sensitivity: isWindows ? CONFIG.MOUSE_SENSITIVITY.WINDOWS : CONFIG.MOUSE_SENSITIVITY.DEFAULT,
            }}
            followFinger={false}
            longSwipesRatio={0.2}
            onActiveIndexChange={handleActiveIndexChange}
            onSlideChange={handleSlideChange}
            style={{
              width: sizeBox.width || '100%',
              height: sizeBox.height || '100vh',
            }}>
            {videos.map((_, index) => {
              return (
                <SwiperSlide key={index}>
                  {({ isActive, isPrev, isNext }) => {
                    if (isActive || isPrev || isNext)
                      if (videos[index])
                        return (
                          <>
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
                                Analytics.triggerAnalyticsForVideoComplete(
                                  videos[index].video.id,
                                  duration,
                                  currentTime
                                )

                                if (!gestureOverlays.SWIPE.hasShown && videos.length > 1) {
                                  setGestureOverlay('SWIPE', true)
                                }
                              }}
                            />

                            {isFullScreen && (
                              <div className="fixed absolute inset-0 h-full w-full">
                                <FullScreenVideoDetails
                                  videos={videos}
                                  currentIndex={currentIndex}
                                  isActive={isActive}
                                />
                              </div>
                            )}
                          </>
                        )
                  }}
                </SwiperSlide>
              )
            })}

            {/* Display gestures according to kind gestureStep */}
            {gestureOverlays.SWIPE.isVisible && <KsGestureTypes gestureStep="SWIPE" />}
            {gestureOverlays.PLAY_PAUSE.isVisible && !muted && <KsGestureTypes gestureStep="PLAY_PAUSE" />}
          </Swiper>
          {!isFullScreen && <DesktopDetails {...videos[currentIndex]} />}

          {isFullScreen && (
            <div className="flex h-full flex-col justify-end p-4">
              <Actions.desktop
                shareUrl={videos[currentIndex].video.shareUrl}
                sparkCount={videos[currentIndex].video.sparkCount}
                videoId={videos[currentIndex].video.id}
                videoSlug={videos[currentIndex].video.slug}
                attachedLink={videos[currentIndex].video.attachedLink}
                description={videos[currentIndex].video.descriptionText}
                isSparked={videos[currentIndex].video.isSparked}
                commentCount={videos[currentIndex].video.commentCount}
              />
            </div>
          )}
        </div>

        {isFullScreen && (
          <div className="absolute right-2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col gap-4">
            <FullScreenSideButtons videos={videos} currentIndex={currentIndex} swiperInstance={swiperInstance} />
          </div>
        )}

        {isFullScreen && isCommentBoxOpen && <FullScreenCommentBox videos={videos} currentIndex={currentIndex} />}
      </div>
    </div>
  )
}
