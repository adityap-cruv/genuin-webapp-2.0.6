import { useCallback, useEffect } from 'react'
import { useCommentSheetStore } from '../player/comment-sheet/store'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Mousewheel } from 'swiper/modules'
import { useGenuinOptions, type VideoSizeBoxType } from '@lib/stores/genuin-options'
import { type VideoPlayerModalType } from '@lib/schemas/player/video'
import { usePlayerControlStore } from '../player/player-control-store'
import { FeedShimmer } from '../shimmers/feed-shimmer'
import { type Swiper as SwiperType } from 'swiper/types'
import { FeedContextProvider, useFeedListContext } from '@/components/providers/feed-provider'
import { useShallow } from 'zustand/react/shallow'
import { useIHeartDemoStates } from '@/components/providers/iheart-demo-provider'
import { IHeartDemo } from '../../layouts/desktop/iheart-demo'
import { cn } from '@/lib/utils'
import { useIheartBorderState } from '@/hooks/use-iheart-border'
import { useGestureOverlayManager } from '../gestures/gesture-overlay-manager'
import { NewPlayer } from '../player/new'
import Analytics from '@/services/analytics'

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
  const { showGestureOverlay, hideGestureOverlay, gestureOverlayUI } = useGestureOverlayManager()
  // # If comment sheet is open than element should not be scrolled..
  const commentIsOpen = useCommentSheetStore((state) => state.modalIsOpen)
  const { renderIn, shouldShowIHeartDemo, isIHeartPlaying } = useIHeartDemoStates()
  const showIHeartDemo = renderIn === 'root' && shouldShowIHeartDemo
  const { muted, setPlayerShouldPlay } = usePlayerControlStore(
    useShallow((state) => ({
      muted: state.muted,
      setPlayerShouldPlay: state.setShouldPlay,
    }))
  )
  const showBorder = useIheartBorderState(!isIHeartPlaying && !muted && showIHeartDemo)

  const handleActiveIndexChange = useCallback(
    (swiper: SwiperType) => {
      if (!videos) return
      // SWIPE gesture will end when the user takes action;
      hideGestureOverlay('SWIPE')
      updateCurrentIndex(swiper.activeIndex)
    },
    [videos]
  )

  useEffect(() => {
    setPlayerShouldPlay(!commentIsOpen)
  }, [commentIsOpen])
  return (
    <>
      <div style={{ ...videoSizeBox }} className={cn('relative overflow-clip')}>
        <div
          className={cn(
            'pointer-events-none absolute z-10 h-full w-full border-4 bg-transparent transition-all ease-in-out',
            { 'animated-border': showBorder },
            { 'border-transparent': !showBorder }
          )}
        />
        <Swiper
          // PLAY_PAUSE gesture will end when the user takes action;
          onClick={() => {
            if (!muted) hideGestureOverlay('PLAY_PAUSE')
          }}
          modules={[Mousewheel]}
          mousewheel={true}
          direction="vertical"
          initialSlide={currentIndex}
          onActiveIndexChange={handleActiveIndexChange}
          allowSlideNext={!commentIsOpen}
          allowSlidePrev={!commentIsOpen}
          style={videoSizeBox}>
          {videos.map((videoDetails, index) => (
            <SwiperSlide key={index}>
              {({ isActive, isPrev, isNext, isVisible }) => {
                if (isActive || isPrev || isNext || isVisible)
                  return (
                    <>
                      {/* <Player.mobile
                        isActive={isActive}
                        loop
                        videoDetails={item}
                        customSizeBox={videoSizeBox}
                        onEnded={(event) => {
                          const { duration, currentTime } = usePlayerControlStore.getState()
                          Analytics.triggerAnalyticsForVideoComplete(item.video.id, duration, currentTime)

                          if (videos.length > 1) {
                            showGestureOverlay('SWIPE')
                          }
                        }}
                      /> */}
                      <NewPlayer
                        videoDetails={videoDetails}
                        isActive={isActive}
                        onEnded={(event) => {
                          const { duration, currentTime } = usePlayerControlStore.getState()
                          Analytics.triggerAnalyticsForVideoComplete(videoDetails.video.id, duration, currentTime)

                          if (videos.length > 1) {
                            showGestureOverlay('SWIPE')
                          }
                        }}
                      />
                    </>
                  )
              }}
            </SwiperSlide>
          ))}

          {gestureOverlayUI}
        </Swiper>
      </div>
      {showIHeartDemo && <IHeartDemo />}
    </>
  )
}
