import dynamic from 'next/dynamic'
import { DesktopDetails } from './desktop-details'
import { useFeedListStore } from './store'
import { useEffect } from 'react'
import { cn } from '@lib/utils'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Mousewheel, Keyboard } from 'swiper/modules'
import { type VideoSizeBoxType, useGenuinOptions } from '@lib/stores/genuin-options'
import { type VideoPlayerModalType } from '@lib/schemas/player/video'

const DesktopPlayer = dynamic(async () => await import('@components/common/player').then((comp) => comp.Player.desktop))

type DesktopProps = {
  // queryFuncResult: UseInfiniteQueryResult
  videos?: VideoPlayerModalType[]
  isLoading: boolean
  isError: boolean
  hasNextPage?: boolean
  isFetchingNextPage: boolean
  fetchNextPage?: () => void
  className?: string
}

export function Desktop({ fetchNextPage, isFetchingNextPage, videos, className }: DesktopProps) {
  const sizeBox = useGenuinOptions().sizeBoxes.default
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
    setNewVideos(videos ?? [])
  }, [videos])

  if (videoList.length > 0)
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
                    videoData={{ ...item.video }}
                    loop
                    key={index}
                  />
                )}
              </SwiperSlide>
            )
          })}
        </Swiper>
        {videoList[currentIndex]?.video && <DesktopDetails {...videoList[currentIndex]} />}
      </div>
    )
}

type SinglePlayerProps = {
  videoData: VideoPlayerModalType
  sizeBox: VideoSizeBoxType
  className?: string
}

// TODO: Remove this component and use swiper instead.
export function SinglePlayer({ sizeBox, className, videoData }: SinglePlayerProps) {
  return (
    <div className={cn('flex h-full w-full', className)}>
      <div style={{ ...sizeBox }} className="hide-scrollbar overflow-x-clip">
        <DesktopPlayer
          shouldPlay
          sizeBox={sizeBox}
          videoData={{
            id: videoData.video.id,
            shareUrl: videoData.video.shareUrl,
            attachedLink: videoData.video.attachedLink,
            source: videoData.video.source,
            sparkCount: videoData.video.sparkCount,
            thumbnail: videoData.video.thumbnail,
            description: videoData.video.description,
          }}
          loop
        />
      </div>
      <DesktopDetails {...videoData} />
    </div>
  )
}
