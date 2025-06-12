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
import { usePlayerControlStore } from '../player/player-control-store'
import { UAParser } from 'ua-parser-js'
import { IHeartDemo } from '@/components/layouts/desktop/iheart-demo'
import { useIHeartDemoStates } from '@/components/providers/iheart-demo-provider'
import ExpandViewEsc from '../expand-view/esc-tab'
import { Toaster } from '@/components/ui/toaster'
import { useIheartBorderState } from '@/hooks/use-iheart-border'
import { useGestureOverlayManager } from '../gestures/gesture-overlay-manager'
import { NewPlayer } from '../player/new'
import Analytics from '@/services/analytics'
import { FullScreenLayout } from '../expand-view/layout'
import { UnseenMessageRibbon } from '../unseen-message-ribbon'

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
  unreadMessageCount?: number
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
  unreadMessageCount,
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
      <SwiperRenderer
        customSizeBox={customSizeBox}
        startIndex={startIndex}
        unreadMessageCount={unreadMessageCount}
        {...restProps}
      />
    </FeedContextProvider>
  )
})

type SwiperRendererProps = {
  customSizeBox?: VideoSizeBoxType
  startIndex: number
  unreadMessageCount?: number
} & ComponentProps<'div'>
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
function SwiperRenderer({
  customSizeBox,
  startIndex,
  className,
  unreadMessageCount,
  ...restProps
}: SwiperRendererProps) {
  const { defaultSizeBox } = useGenuinOptions(
    useShallow((state) => ({
      defaultSizeBox: state.sizeBoxes.default,
    }))
  )
   
  const sizeBox = customSizeBox || defaultSizeBox
  const { shouldShowIHeartDemo, isIHeartPlaying } = useIHeartDemoStates()
  const { allowSlideNext, currentIndex, updateCurrentIndex, videos } = useFeedListContext()
  const { showGestureOverlay, hideGestureOverlay, gestureOverlayUI } = useGestureOverlayManager()
  const { muted, isFullScreen, isCommentBoxOpen } = usePlayerControlStore(
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
      }}
      className={cn('relative flex h-full w-full justify-center transition-all', className, {
        'fixed inset-0 z-50 bg-monochrome-black': isFullScreen,
      })}
      {...restProps}>
      <div className={cn('relative flex h-full flex-col', { 'w-full flex-row': !isFullScreen })}>
        {/* For UnseenMessageRibbon */}
        {unreadMessageCount !== undefined && unreadMessageCount !== 0 && (
          <div className="absolute inset-0 z-10 flex h-fit w-full items-center justify-center">
            <UnseenMessageRibbon messageCount={unreadMessageCount ?? 0} />
          </div>
        )}

        {/* For iHeart */}
        {shouldShowIHeartDemo && isFullScreen && (
          <>
            <IHeartDemo />
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
          </>
        )}

        <Swiper
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
          className="aspect-reel h-full">
          {videos.map((_, index) => {
            return (
              <SwiperSlide key={index} virtualIndex={index}>
                {({ isActive, isPrev, isNext }) => {
                  if (isActive || isPrev || isNext)
                    if (videos[index])
                      return (
                        <>
                          <NewPlayer
                            currentIndex={currentIndex}
                            videoDetails={videos[index]}
                            isActive={isActive}
                            loop
                            onEnded={() => {
                              const { currentTime, duration } = usePlayerControlStore.getState()
                              Analytics.triggerAnalyticsForVideoComplete(videos[index].video.id, duration, currentTime)

                              if (videos.length > 1) {
                                showGestureOverlay('SWIPE')
                              }
                            }}
                          />
                        </>
                      )
                }}
              </SwiperSlide>
            )
          })}
          <ExpandViewEsc videoId={videos[currentIndex].video.id} />
          {gestureOverlayUI}
        </Swiper>

        {/* Desktop Details for feed view */}
        {!isFullScreen && <DesktopDetails {...videos[currentIndex]} />}
      </div>

      {/* FullScreen Components  */}
      {isFullScreen && (
        <FullScreenLayout
          currentIndex={currentIndex}
          videos={videos}
          isCommentBoxOpen={isCommentBoxOpen}
          swiperInstance={swiperRef.current}
        />
      )}
      <Toaster />
    </div>
  )
}
