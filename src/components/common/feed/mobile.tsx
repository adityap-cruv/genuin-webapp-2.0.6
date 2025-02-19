import { Player } from '../player'
import { useCallback, useState, useEffect } from 'react'
import { useCommentSheetStore } from '../player/comment-sheet/store'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Mousewheel } from 'swiper/modules'
import { useGenuinOptions, type VideoSizeBoxType } from '@lib/stores/genuin-options'
import { type VideoPlayerModalType } from '@lib/schemas/player/video'
import Analytics from '@/services/analytics'
import { usePlayerControlStore } from '../player/player-control-store'
import { FeedShimmer } from '../shimmers/feed-shimmer'
import { type Swiper as SwiperType } from 'swiper/types'
import { FeedContextProvider, useFeedListContext } from '@/components/providers/feed-provider'
import { KsGestureTypes } from '../ks-gestures-types'
import { useGestureOverlay } from '@/hooks/use-gesture-overlay'
import { useShallow } from 'zustand/react/shallow'
import { useIHeartDemoStates } from '@/components/providers/iheart-demo-provider'
import { IHeartDemo } from '../../layouts/desktop/iheart-demo'
import { cn } from '@/lib/utils'

type MobileProps = {
  videos?: VideoPlayerModalType[] | null
  isLoading: boolean
  isError: boolean
  hasNextPage?: boolean
  isFetchingNextPage: boolean
  fetchNextPage?: () => void
  /**
   * pass this number if you want to start from particular index.
   * @default 0
   */
  startIndex: number
  /**
   * Pass this parameter if you want to configure custom size box.
   */
  customSizeBox?: VideoSizeBoxType
}

export function Mobile({
  videos,
  fetchNextPage,
  isFetchingNextPage,
  startIndex = 0,
  hasNextPage,
  customSizeBox,
  isLoading,
}: MobileProps) {
  const { defaultSizeBox } = useGenuinOptions((state) => ({
    defaultSizeBox: state.sizeBoxes.default,
  }))
  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
  const videoSizeBox = customSizeBox || defaultSizeBox

  if (isLoading || !videos) {
    return <FeedShimmer.mobile />
  }

  if (videos.length === 0)
    return (
      <div className="flex h-full w-full items-center justify-center bg-tertiary-200">
        <p className="text-title-3-demi text-tertiary">No activity yet</p>
      </div>
    )

  return (
    <FeedContextProvider
      hasNextPage={hasNextPage ?? false}
      startIndex={startIndex}
      videos={videos}
      fetchNextPage={fetchNextPage}
      isFetchingNextPage={isFetchingNextPage}>
      <SwiperRenderer videoSizeBox={videoSizeBox} />
    </FeedContextProvider>
  )
}

function SwiperRenderer({ videoSizeBox }: { videoSizeBox: VideoSizeBoxType }) {
  const { videos, updateCurrentIndex, currentIndex } = useFeedListContext()
  const { gestureOverlays, setGestureOverlay } = useGestureOverlay(currentIndex)
  // # If comment sheet is open than element should not be scrolled..
  const commentIsOpen = useCommentSheetStore((state) => state.modalIsOpen)
  const { renderIn, shouldShowIHeartDemo, isIHeartPlaying } = useIHeartDemoStates()
  const showIHeartDemo = renderIn === 'root' && shouldShowIHeartDemo
  const { muted } = usePlayerControlStore(
    useShallow((state) => ({
      muted: state.muted,
    }))
  )
  const [showBorder, setShowBorder] = useState(false)
  useEffect(() => {
    if (!isIHeartPlaying && !muted) {
      setShowBorder(true)

      setTimeout(() => {
        setShowBorder(false)
      }, 3000)
    } else {
      setShowBorder(false)
    }
  }, [isIHeartPlaying, muted])

  const handleActiveIndexChange = useCallback(
    (swiper: SwiperType) => {
      if (!videos) return
      // SWIPE gesture will end when the user takes action;
      setGestureOverlay('SWIPE', false)

      updateCurrentIndex(swiper.activeIndex)
    },
    [videos]
  )
  return (
    <>
      <div
        style={{ ...videoSizeBox }}
        className={cn('animated-border relative overflow-clip transition-all ease-in-out', {
          'border-4': showBorder,
        })}>
        <Swiper
          // PLAY_PAUSE gesture will end when the user takes action;
          onClick={() => {
            if (!muted) setGestureOverlay('PLAY_PAUSE', false)
          }}
          modules={[Mousewheel]}
          mousewheel={true}
          direction="vertical"
          initialSlide={currentIndex}
          onActiveIndexChange={handleActiveIndexChange}
          allowSlideNext={!commentIsOpen}
          allowSlidePrev={!commentIsOpen}
          style={videoSizeBox}>
          {videos.map((item, index) => (
            <SwiperSlide key={index}>
              {({ isActive, isPrev, isNext, isVisible }) => {
                if (isActive || isPrev || isNext || isVisible)
                  return (
                    <>
                      <Player.mobile
                        isActive={isActive}
                        loop
                        videoDetails={item}
                        customSizeBox={videoSizeBox}
                        onEnded={(event) => {
                          const { duration, currentTime } = usePlayerControlStore.getState()
                          Analytics.triggerAnalyticsForVideoComplete(item.video.id, duration, currentTime)

                          if (!gestureOverlays.SWIPE.hasShown && videos.length > 1) {
                            setGestureOverlay('SWIPE', true)
                          }
                        }}
                      />
                    </>
                  )
              }}
            </SwiperSlide>
          ))}

          {/* Display gestures according to kind gestureStep */}
          {gestureOverlays.SWIPE.isVisible && <KsGestureTypes gestureStep="SWIPE" />}
          {gestureOverlays.PLAY_PAUSE.isVisible && !muted && <KsGestureTypes gestureStep="PLAY_PAUSE" />}
        </Swiper>
      </div>
      {showIHeartDemo && <IHeartDemo />}
    </>
  )
}
