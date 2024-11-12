import { AnimatedInfinityView } from '@components/common/animated-infinity-view'
import { useFeedListStore } from './store'
import { Player } from '../player'
import { memo, useCallback, useEffect, useState } from 'react'
import { useCommentSheetStore } from '../player/comment-sheet/store'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Mousewheel } from 'swiper/modules'
import { useGenuinOptions, type VideoSizeBoxType } from '@lib/stores/genuin-options'
import { type VideoPlayerModalType } from '@lib/schemas/player/video'
import { showInterruption } from '@components/providers/interruption-provider'
import { useShallow } from 'zustand/react/shallow'
import { AnimatePresence, motion } from 'framer-motion'
import Analytics from '@/services/analytics'
import { usePlayerControlStore } from '../player/player-control-store'
import { FeedShimmer } from '../shimmers/feed-shimmer'
import { KsGestures } from '../ks-gestures'
import { useLocalStorage } from '@/lib/stores/local-storage'
import { type Swiper as SwiperType } from 'swiper/types'

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
  customSizeBox,
  isLoading,
}: MobileProps) {
  const { showKsGestures, gestureStep, updateGestureStep } = useLocalStorage()
  const { defaultSizeBox } = useGenuinOptions((state) => ({
    defaultSizeBox: state.sizeBoxes.default,
    embed: state.embed,
  }))
  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
  const videoSizeBox = customSizeBox || defaultSizeBox
  const { setCurrentIndex, currentIndex } = useFeedListStore(
    useShallow((state) => ({
      setCurrentIndex: state.setCurrentIndex,
      currentIndex: state.currentIndex,
    }))
  )
  // # If comment sheet is open than element should not be scrolled..
  const commentIsOpen = useCommentSheetStore((state) => state.modalIsOpen)

  useEffect(() => {
    if (!videos) return
    if (!isFetchingNextPage && videos.length - 3 <= currentIndex) {
      // console.log('isFetchingNextPage NEXT PGE.')
      fetchNextPage?.()
    }
    if ((currentIndex + 1) % 5 === 0) showInterruption()
  }, [currentIndex])

  const handleActiveIndexChange = useCallback(
    (swiper: SwiperType) => {
      if (!videos) return
      // Update the step if KS gestures are enabled.
      if (showKsGestures) {
        // If the gesture step is swipe, then update the step.
        if (gestureStep === 'swipe') updateGestureStep()
      }
      setCurrentIndex(swiper.activeIndex, videos[currentIndex].video.id)
    },
    [gestureStep, showKsGestures, videos]
  )

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
    <div style={{ ...videoSizeBox }} className="overflow-clip">
      <Swiper
        modules={[Mousewheel]}
        mousewheel={true}
        direction="vertical"
        initialSlide={startIndex}
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
      <InfinityViewBox videoDetails={videos[currentIndex]} />
      {showKsGestures && <KsGestures />}
    </div>
  )
}

const InfinityViewBox = memo(function InfinityViewBox({ videoDetails }: { videoDetails: VideoPlayerModalType }) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    if (!videoDetails) return
    if (!videoDetails.video.linkoutId || !videoDetails.video.linkouts) {
      if (!isVisible) setIsVisible(true)
      return
    }
    let timeoutId: any
    timeoutId = setTimeout(() => {
      setIsVisible(false)
    }, 3000)

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
        timeoutId = null
      }
      setIsVisible(true)
    }
  }, [videoDetails])

  if (videoDetails)
    return (
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.3 } }}
            className="absolute bottom-0 z-10 w-full">
            <AnimatedInfinityView
              community={{
                name: videoDetails.community.name ?? '',
                handle: videoDetails.community.handle,
                profileImage: videoDetails.community.profileImage ?? '',
                slug: videoDetails.community.slug,
                type: videoDetails.community.type ?? null,
                brand: videoDetails.community.brand
                  ? {
                      name: videoDetails.community.brand?.name ?? '',
                      brand_system_user_id: videoDetails.community.brand?.brand_system_user_id ?? '',
                      brand_slug: videoDetails.community.brand?.brand_slug ?? '',
                    }
                  : null,
              }}
              loop={{
                name: videoDetails.loop.name ?? '',
                slug: videoDetails.loop.slug,
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    )
})
