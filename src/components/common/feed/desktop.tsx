import { type VideoSizeBoxType } from '@hooks/use-video-size-box'
import { type VideoDataType } from '@lib/schemas/video'
import dynamic from 'next/dynamic'
import { DesktopDetails } from './desktop-details'
import { useFeedListStore } from './store'
import { useEffect } from 'react'
import { cn } from '@lib/utils'
import { FeedShimmer } from '../shimmers/feed-shimmer'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Mousewheel, Keyboard } from 'swiper/modules'

const DesktopPlayer = dynamic(async () => await import('@components/common/player').then((comp) => comp.Player.desktop))

type DesktopProps = {
  sizeBox: VideoSizeBoxType
  // queryFuncResult: UseInfiniteQueryResult
  videos: VideoDataType[]
  isLoading: boolean
  isError: boolean
  hasNextPage?: boolean
  isFetchingNextPage: boolean
  fetchNextPage?: () => void
  className?: string
}

export function Desktop({ sizeBox, fetchNextPage, isFetchingNextPage, videos, className }: DesktopProps) {
  const { setNewVideos, videoList, setCurrentIndex, currentIndex } = useFeedListStore((state) => ({
    setNewVideos: state.setVideoList,
    videoList: state.videoList,
    setCurrentIndex: state.setCurrentIndex,
    currentIndex: state.currentIndex,
  }))

  useEffect(() => {
    if (currentIndex > videoList.length - 3 && !isFetchingNextPage) {
      fetchNextPage?.()
    }
  }, [currentIndex])

  // TODO improvement pending
  useEffect(() => {
    setCurrentIndex(0)
  }, [])

  useEffect(() => {
    setNewVideos(videos)
  }, [videos])

  if (videoList)
    return (
      <div className={cn('flex h-full w-full', className)}>
        <Swiper
          onActiveIndexChange={(swiper) => {
            setCurrentIndex(swiper.activeIndex)
          }}
          keyboard={true}
          initialSlide={0}
          speed={500}
          modules={[Mousewheel, Keyboard]}
          mousewheel
          style={{ width: sizeBox.width, height: sizeBox.height }}
          direction="vertical">
          {videoList.map((item, index) => {
            return (
              <SwiperSlide key={index}>
                {() => (
                  <DesktopPlayer
                    playIfInViewPort
                    isFirstPlayerInList={index === 0}
                    shouldPlay
                    sizeBox={sizeBox}
                    videoData={item}
                    loop
                  />
                )}
              </SwiperSlide>
            )
          })}
        </Swiper>
        <DesktopDetails videoDetails={videoList[currentIndex]} />
      </div>
    )

  return <FeedShimmer.desktop />
}

type SinglePlayerProps = {
  videoDetails: VideoDataType
  sizeBox: VideoSizeBoxType
  className?: string
}

export function SinglePlayer({ sizeBox, videoDetails, className }: SinglePlayerProps) {
  return (
    <div className={cn('flex h-full w-full', className)}>
      <div style={{ width: sizeBox.width, height: sizeBox.height }} className="hide-scrollbar overflow-x-clip">
        <DesktopPlayer shouldPlay sizeBox={sizeBox} videoData={videoDetails} loop />
      </div>
      <DesktopDetails videoDetails={videoDetails} />
    </div>
  )
}
