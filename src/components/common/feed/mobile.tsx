import { AnimatedInfinityView } from '@components/common/animated-infinity-view'
import dynamic from 'next/dynamic'
import { useFeedListStore } from './store'
import { useEffect, useState } from 'react'
import { useCommentSheetStore } from '../player/comment-sheet/store'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Mousewheel } from 'swiper/modules'
import { useGenuinOptions, type VideoSizeBoxType } from '@lib/stores/genuin-options'
import { type VideoPlayerModalType } from '@lib/schemas/player/video'
import { showInterruption } from '@components/providers/interruption-provider'
import { useShallow } from 'zustand/react/shallow'
import { AnimatePresence, motion } from 'framer-motion'
import { triggerAnalyticsForVideoComplete } from './analytics-func'
const Player = dynamic(async () => await import('@components/common/player').then((comp) => comp.Player.mobile))

type MobileProps = {
  videos: VideoPlayerModalType[]
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

export function Mobile({ videos, fetchNextPage, isFetchingNextPage, startIndex = 0, customSizeBox }: MobileProps) {
  const videoSizeBox = customSizeBox ?? useGenuinOptions().sizeBoxes.default
  const { setCurrentIndex, currentIndex } = useFeedListStore(
    useShallow((state) => ({
      setCurrentIndex: state.setCurrentIndex,
      currentIndex: state.currentIndex,
    }))
  )
  // # If comment sheet is open than element should not be scrolled..
  const commentIsOpen = useCommentSheetStore((state) => state.modalIsOpen)

  useEffect(() => {
    if (!isFetchingNextPage && videos.length - 3 <= currentIndex) {
      fetchNextPage?.()
    }
    if ((currentIndex + 1) % 5 === 0) showInterruption()
  }, [currentIndex])

  if (videos.length === 0)
    return (
      <div className="flex h-full w-full items-center justify-center bg-tertiary-200">
        <p className="text-title-3-demi text-tertiary">No activity yet</p>
      </div>
    )

  if (videos.length > 0)
    return (
      <div style={{ ...videoSizeBox }} className="overflow-clip">
        <Swiper
          modules={[Mousewheel]}
          mousewheel={true}
          direction="vertical"
          initialSlide={startIndex}
          onActiveIndexChange={(swiper) => {
            setCurrentIndex(swiper.activeIndex, videos[currentIndex].video.id)
          }}
          allowSlideNext={!commentIsOpen}
          allowSlidePrev={!commentIsOpen}
          style={videoSizeBox}>
          {videos.map((item, index) => (
            <SwiperSlide key={index}>
              {({ isActive }) => {
                return (
                  <Player
                    isActive={isActive}
                    loop
                    videoDetails={item}
                    customSizeBox={videoSizeBox}
                    onEnded={(event) => {
                      triggerAnalyticsForVideoComplete(item.video.id)
                    }}
                  />
                )
              }}
            </SwiperSlide>
          ))}
        </Swiper>
        <InfinityViewBox videoDetails={videos[currentIndex]} />
      </div>
    )
}

function InfinityViewBox({ videoDetails }: { videoDetails: VideoPlayerModalType }) {
  const [isVisible, setIsVisible] = useState(true)
  const { currentIndex } = useFeedListStore()

  useEffect(() => {
    if (!videoDetails.video.linkoutId) return
    let timeoutId: any
    timeoutId = setTimeout(() => {
      setIsVisible(false)
    }, 3000)

    return () => {
      if (timeoutId) timeoutId = null
      setIsVisible(true)
    }
  }, [currentIndex])

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
}
