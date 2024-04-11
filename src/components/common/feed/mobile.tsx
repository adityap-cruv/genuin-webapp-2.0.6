import { AnimatedInfinityView } from '@components/common/animated-infinity-view'
import dynamic from 'next/dynamic'
import { useFeedListStore } from './store'
import { useEffect } from 'react'
import { useCommentSheetStore } from '../player/comment-sheet/store'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Mousewheel } from 'swiper/modules'
import { useGenuinOptions } from '@lib/stores/genuin-options'
import { type VideoPlayerModalType } from '@lib/schemas/player/video'
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
}

export function Mobile({
  videos,
  fetchNextPage,
  isError,
  isFetchingNextPage,
  isLoading,
  hasNextPage,
  startIndex = 0,
}: MobileProps) {
  const videoSizeBox = useGenuinOptions().sizeBoxes.default
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
  }, [currentIndex])

  useEffect(() => {
    setCurrentIndex(startIndex)
  }, [])

  useEffect(() => {
    setVideoList(videos)
  }, [videos])

  return (
    <div style={{ height: videoSizeBox.height, width: videoSizeBox.width }} className="overflow-clip">
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
        style={{ height: videoSizeBox.height, width: videoSizeBox.width }}>
        {videos.map((item, index) => (
          <SwiperSlide key={index}>
            {() => <Player playIfInViewPort isFirstPlayerInList={index === 0} shouldPlay loop videoDetails={item} />}
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
      <span className="absolute bottom-0 w-full">
        <AnimatedInfinityView
          community={{
            name: videoDetails.community.name ?? '',
            handle: videoDetails.community.handle,
            profileImage: videoDetails.community.profileImage ?? '',
            slug: videoDetails.community.slug,
          }}
          loop={{
            name: videoDetails.loop.name ?? '',
            slug: videoDetails.loop.slug,
          }}
        />
      </span>
    )
}
