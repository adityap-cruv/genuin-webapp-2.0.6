import { Player } from '../player'
import { useCallback } from 'react'
import { useCommentSheetStore } from '../player/comment-sheet/store'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Mousewheel } from 'swiper/modules'
import { useGenuinOptions, type VideoSizeBoxType } from '@lib/stores/genuin-options'
import { type VideoPlayerModalType } from '@lib/schemas/player/video'
import Analytics from '@/services/analytics'
import { usePlayerControlStore } from '../player/player-control-store'
import { FeedShimmer } from '../shimmers/feed-shimmer'
import { KsGestures } from '../ks-gestures'
import { useLocalStorage } from '@/lib/stores/local-storage'
import { type Swiper as SwiperType } from 'swiper/types'
import { FeedContextProvider, useFeedListContext } from '@/components/providers/feed-provider'

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
    embed: state.embed,
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
  const { showKsGestures, gestureStep, updateGestureStep } = useLocalStorage()
  // # If comment sheet is open than element should not be scrolled..
  const commentIsOpen = useCommentSheetStore((state) => state.modalIsOpen)

  const handleActiveIndexChange = useCallback(
    (swiper: SwiperType) => {
      if (!videos) return
      // Update the step if KS gestures are enabled.
      if (showKsGestures) {
        // If the gesture step is swipe, then update the step.
        if (gestureStep === 'swipe') updateGestureStep()
      }
      updateCurrentIndex(swiper.activeIndex)
    },
    [gestureStep, showKsGestures, videos]
  )
  return (
    <div style={{ ...videoSizeBox }} className="relative overflow-clip">
      <Swiper
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
                  <Player.mobile
                    isActive={isActive}
                    loop
                    videoDetails={item}
                    customSizeBox={videoSizeBox}
                    onEnded={(event) => {
                      const { duration, currentTime } = usePlayerControlStore.getState()
                      Analytics.triggerAnalyticsForVideoComplete(item.video.id, duration, currentTime)
                    }}
                  />
                )
            }}
          </SwiperSlide>
        ))}
      </Swiper>
      {showKsGestures && <KsGestures />}
    </div>
  )
}
