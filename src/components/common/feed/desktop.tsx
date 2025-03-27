import { DesktopDetails } from './desktop-details'
import { type ComponentProps, memo, useCallback, useRef } from 'react'
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
import { Actions } from '../player/control-layer/actions'
import FullScreenSideButtons from '../expand-view/full-screen-side-buttons'
import FullScreenVideoDetails from '../expand-view/full-screen-video-details'
import FullScreenCommentBoxLayout from '../expand-view/full-screen-comment-box'
import { UAParser } from 'ua-parser-js'
import { IHeartDemo } from '@/components/layouts/desktop/iheart-demo'
import { useIHeartDemoStates } from '@/components/providers/iheart-demo-provider'
import FullScreenEsc from '../expand-view/full-screen-esc'
import { Toaster } from '@/components/ui/toaster'
import { AnimatePresence } from 'framer-motion'
import { useIheartBorderState } from '@/hooks/use-iheart-border'
import { useGestureOverlayManager } from '../gestures/gesture-overlay-manager'

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
  const { defaultSizeBox } = useGenuinOptions(useShallow((state) => ({ defaultSizeBox: state.sizeBoxes.default })))

  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
  const sizeBox = customSizeBox || defaultSizeBox
  const { shouldShowIHeartDemo, isIHeartPlaying } = useIHeartDemoStates()
  const { allowSlideNext, currentIndex, updateCurrentIndex, videos } = useFeedListContext()
  const { showGestureOverlay, hideGestureOverlay, gestureOverlayUI } = useGestureOverlayManager()
  const { muted, isFullScreen, isCommentBoxOpen, toggleFullScreen } = usePlayerControlStore(
    useShallow((state) => ({
      muted: state.muted,
      isFullScreen: state.isFullScreen,
      isCommentBoxOpen: state.isCommentBoxOpen,
      toggleFullScreen: state.toggleFullScreen,
    }))
  )
  const isWindows = new UAParser().getResult().os.name === 'Windows'
  const touchTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const wheelTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const swiperRef = useRef<SwiperType | null>(null)
  const lastWheelTime = useRef<number>(0)
  const showBorder = useIheartBorderState(!isIHeartPlaying && !muted && shouldShowIHeartDemo)

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
      hideGestureOverlay('SWIPE')

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
      className={cn('flex h-full w-full transition-all', className, {
        'fixed inset-0 z-50': isFullScreen,
      })}
      {...restProps}>
      <div className="relative flex h-full w-full justify-center">
        <div className={cn('flex', { 'h-full w-full': !isFullScreen })}>
          <div
            className={cn('relative flex flex-col', { ' w-full flex-row': !isFullScreen })}
            style={{
              height: '100%',
              aspectRatio: isFullScreen ? '9 / 16' : undefined,
            }}>
            {isFullScreen && (
              <div
                style={{
                  height: 'calc(100% - 75px)',
                }}
                className={cn(
                  'pointer-events-none absolute z-10 w-full border-4 bg-transparent transition-all ease-in-out',
                  { 'animated-border': showBorder },
                  { 'border-transparent': !showBorder }
                )}
              />
            )}
            <Swiper
              // PLAY_PAUSE gesture will end when the user takes action;
              onClick={() => {
                if (!muted) hideGestureOverlay('PLAY_PAUSE')
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
              // virtual={{
              //   enabled: true,
              //   addSlidesAfter: 1,
              //   addSlidesBefore: 1,
              // }}
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
                width: isFullScreen ? '100%' : sizeBox.width,
                height: isFullScreen ? '100%' : sizeBox.height,
              }}>
              {videos.map((_, index) => {
                return (
                  <SwiperSlide key={index} virtualIndex={index}>
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

                                  if (videos.length > 1) {
                                    showGestureOverlay('SWIPE')
                                  }
                                }}
                              />

                              {isFullScreen && (
                                <div className="fixed absolute inset-0 h-full w-full">
                                  <FullScreenVideoDetails
                                    videos={videos}
                                    currentIndex={currentIndex}
                                    isActive={isActive}
                                    isFullScreen={isFullScreen}
                                  />
                                </div>
                              )}
                            </>
                          )
                    }}
                  </SwiperSlide>
                )
              })}

              {gestureOverlayUI}
            </Swiper>
            {shouldShowIHeartDemo && isFullScreen && <IHeartDemo />}
            {!isFullScreen && <DesktopDetails {...videos[currentIndex]} />}

            {isFullScreen && (
              <FullScreenEsc
                isFullScreen={isFullScreen}
                toggleFullScreen={toggleFullScreen}
                videoId={videos[currentIndex].video.id}
              />
            )}
          </div>
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
            <FullScreenSideButtons videos={videos} currentIndex={currentIndex} swiperInstance={swiperRef.current} />
          </div>
        )}

        {isFullScreen && (
          <AnimatePresence>
            {isCommentBoxOpen && <FullScreenCommentBoxLayout videos={videos} currentIndex={currentIndex} />}
          </AnimatePresence>
        )}
      </div>
      <Toaster />
    </div>
  )
}
