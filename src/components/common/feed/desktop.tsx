import dynamic from 'next/dynamic'
import { DesktopDetails } from './desktop-details'
import { useFeedListStore } from './store'
import { useEffect } from 'react'
import { cn } from '@lib/utils'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Mousewheel, Keyboard } from 'swiper/modules'
import { type VideoSizeBoxType, useGenuinOptions } from '@lib/stores/genuin-options'
import { type VideoPlayerModalType } from '@lib/schemas/player/video'
import { showInterruption } from '@components/providers/interruption-provider'
import { useShallow } from 'zustand/react/shallow'
import { triggerAnalyticsForVideoComplete } from './analytics-func'

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
  /**
   * Pass this parameter if you want to configure custom size box.
   */
  customSizeBox?: VideoSizeBoxType
}

export function Desktop({ fetchNextPage, isFetchingNextPage, videos, className, customSizeBox }: DesktopProps) {
  const sizeBox =
    customSizeBox ?? useGenuinOptions(useShallow((state) => ({ sizeBox: state.sizeBoxes.default }))).sizeBox
  const { setNewVideos, videoList, setCurrentIndex, currentIndex } = useFeedListStore(
    useShallow((state) => ({
      setNewVideos: state.setVideoList,
      videoList: state.videoList,
      setCurrentIndex: state.setCurrentIndex,
      currentIndex: state.currentIndex,
    }))
  )

  useEffect(() => {
    if (videoList.length !== 0 && currentIndex > videoList.length - 3 && !isFetchingNextPage) {
      fetchNextPage?.()
    }
    if ((currentIndex + 1) % 5 === 0) showInterruption()
  }, [currentIndex, videoList.length])

  // TODO: improvement pending
  useEffect(() => {
    setCurrentIndex(0)
  }, [])

  useEffect(() => {
    setNewVideos(videos ?? [])
  }, [videos])

  if (videoList.length === 0)
    return (
      <div className={cn('flex aspect-reel h-full items-center justify-center bg-tertiary-200', className)}>
        <p className="text-title-3-demi text-tertiary">No activity yet</p>
      </div>
    )

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
                {({ isActive }) => {
                  return (
                    <DesktopPlayer
                      isActive={isActive}
                      videoData={{ ...item.video }}
                      loop
                      key={index}
                      onEnded={(event) => {
                        triggerAnalyticsForVideoComplete(item.video.id)
                      }}
                    />
                  )
                }}
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
          isActive
          videoData={{
            id: videoData.video.id,
            shareUrl: videoData.video.shareUrl,
            attachedLink: videoData.video.attachedLink,
            source: videoData.video.source,
            sparkCount: videoData.video.sparkCount,
            thumbnail: videoData.video.thumbnail,
            slug: videoData.video.slug,
            description: videoData.video.descriptionText,
          }}
          loop
          onEnded={(event) => {
            triggerAnalyticsForVideoComplete(videoData.video.id)
          }}
        />
      </div>
      <DesktopDetails {...videoData} />
    </div>
  )
}
