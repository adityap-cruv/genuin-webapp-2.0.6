import { AnimatedInfinityView } from '@components/common/animated-infinity-view'
import dynamic from 'next/dynamic'
import { useFeedListStore } from './store'
import { useEffect } from 'react'
import { useCommentSheetStore } from '../player/comment-sheet/store'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Mousewheel } from 'swiper/modules'
import { useGenuinOptions, type VideoSizeBoxType } from '@lib/stores/genuin-options'
import { type VideoPlayerModalType } from '@lib/schemas/player/video'
import { showInterruption } from '@components/providers/inerruption-provider'
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
  const { setCurrentIndex, setVideoList, currentIndex, videoList } = useFeedListStore((state) => ({
    setCurrentIndex: state.setCurrentIndex,
    setVideoList: state.setVideoList,
    currentIndex: state.currentIndex,
    videoList: state.videoList,
  }))
  // # If comment sheet is open than element should not be scrolled..
  const commentIsOpen = useCommentSheetStore((state) => state.modalIsOpen)

  useEffect(() => {
    if (!isFetchingNextPage && videoList.length - 3 <= currentIndex) {
      fetchNextPage?.()
    }
    if ((currentIndex + 1) % 5) showInterruption()
  }, [currentIndex])

  useEffect(() => {
    setCurrentIndex(startIndex)
  }, [])

  useEffect(() => {
    setVideoList(videos)
  }, [videos])

  return (
    <div style={{ ...videoSizeBox }} className="overflow-clip">
      <Swiper
        modules={[Mousewheel]}
        mousewheel={true}
        direction="vertical"
        initialSlide={startIndex}
        onActiveIndexChange={(swiper) => {
          setCurrentIndex(swiper.activeIndex)
        }}
        allowSlideNext={!commentIsOpen}
        allowSlidePrev={!commentIsOpen}
        style={videoSizeBox}>
        {videos.map((item, index) => (
          <SwiperSlide key={index}>
            <Player
              playIfInViewPort
              isFirstPlayerInList={index === 0}
              shouldPlay
              loop
              videoDetails={item}
              customSizeBox={videoSizeBox}
            />
          </SwiperSlide>
        ))}
      </Swiper>
      <InfinityViewBox />
    </div>
  )
}

function InfinityViewBox() {
  const { videoList, currentIndex } = useFeedListStore((state) => ({
    currentIndex: state.currentIndex,
    videoList: state.videoList,
  }))
  const videoDetails = videoList[currentIndex]
  if (videoDetails)
    return (
      <div className="absolute bottom-0 z-10 w-full">
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
      </div>
    )
}
