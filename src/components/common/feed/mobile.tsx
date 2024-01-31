import { AnimatedInfinityView } from '@components/common/animated-infinity-view'
import dynamic from 'next/dynamic'
import { type VideoDataType } from '@lib/schemas/video'
import { useFeedListStore } from './store'
import { useEffect } from 'react'
import { useCommentSheetStore } from '../player/comment-sheet/store'
import { FeedShimmer } from '../shimmers/feed-shimmer'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Mousewheel } from 'swiper/modules'
import { useGenuinOptions } from '@lib/stores/genuin-options'
const Player = dynamic(async () => await import('@components/common/player').then((comp) => comp.Player.mobile))

type MobileProps = {
  videos: VideoDataType[]
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

// TODO: remove props sizebox
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

  if (videos)
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
              {() => <Player playIfInViewPort isFirstPlayerInList={index === 0} shouldPlay loop videoData={item} />}
            </SwiperSlide>
          ))}
          <InfinityViewBox />
        </Swiper>
      </div>
    )

  return <FeedShimmer.mobile />
}

function InfinityViewBox() {
  const { videoList, currentIndex } = useFeedListStore((state) => ({
    currentIndex: state.currentIndex,
    videoList: state.videoList,
  }))
  const videoDetails = videoList[currentIndex]
  if (videoDetails?.video)
    return (
      <span className="absolute bottom-0 w-full">
        <AnimatedInfinityView
          community={{
            name: videoDetails.community.name ?? '',
            handle: videoDetails.community.handle,
            profileImage: videoDetails.community.dp ?? '',
            slug: videoDetails.community.slug,
          }}
          loop={{
            name: videoDetails.loop.name ?? '',
            shareString: videoDetails.loop.share_string,
            slug: videoDetails.loop.slug,
          }}
        />
      </span>
    )
}
