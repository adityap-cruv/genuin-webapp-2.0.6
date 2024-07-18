import dynamic from 'next/dynamic'
import { DesktopDetails } from './desktop-details'
import { useFeedListStore } from './store'
import { useEffect, useState } from 'react'
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
  isFetchingNextPage: boolean
  fetchNextPage?: () => void
  videosRef: React.MutableRefObject<VideoPlayerModalType[]>
  className?: string
  /**
   * Pass this parameter if you want to configure custom size box.
   */
  customSizeBox?: VideoSizeBoxType
}

const SHELLS = Array.from({ length: 100 })

export function Desktop({ fetchNextPage, className, customSizeBox, videosRef, isFetchingNextPage }: DesktopProps) {
  const [allowSlideNext, setAllowSlideNext] = useState(videosRef.current.length > 0)
  const sizeBox =
    customSizeBox ?? useGenuinOptions(useShallow((state) => ({ sizeBox: state.sizeBoxes.default }))).sizeBox
  const { currentIndex, setCurrentIndex } = useFeedListStore(
    useShallow((state) => ({ currentIndex: state.currentIndex, setCurrentIndex: state.setCurrentIndex }))
  )

  useEffect(() => {
    const videos = videosRef.current
    if (videos && !isFetchingNextPage && currentIndex === videos.length - 3) {
      fetchNextPage?.()
    }
    if ((currentIndex + 1) % 5 === 0) showInterruption()
    if (videosRef.current.length - 1 === currentIndex) {
      setAllowSlideNext(false)
    } else {
      if (!allowSlideNext) setAllowSlideNext(true)
    }
  }, [currentIndex])

  if (!videosRef.current || videosRef.current.length === 0)
    return (
      <div className={cn('flex aspect-reel h-full items-center justify-center bg-tertiary-200', className)}>
        <p className="text-title-3-demi text-tertiary">No activity yet</p>
      </div>
    )
  return (
    <div className={cn('flex h-full w-full', className)}>
      <Swiper
        onActiveIndexChange={(swiper) => {
          setCurrentIndex(swiper.activeIndex, videosRef.current[currentIndex].video.id)
        }}
        allowSlideNext={allowSlideNext}
        keyboard={true}
        initialSlide={0}
        speed={500}
        modules={[Mousewheel, Keyboard]}
        mousewheel
        style={{ width: sizeBox.width, height: sizeBox.height }}
        direction="vertical">
        {SHELLS.map((item, index) => {
          return (
            <SwiperSlide key={index}>
              {({ isActive, isPrev, isNext }) => {
                if (videosRef.current && (isActive || isPrev || isNext))
                  return (
                    <DesktopPlayer
                      isActive={isActive}
                      videoData={{ ...videosRef.current[index].video }}
                      loop
                      key={index}
                      onEnded={(event) => {
                        triggerAnalyticsForVideoComplete(videosRef.current[index].video.id)
                      }}
                    />
                  )
              }}
            </SwiperSlide>
          )
        })}
      </Swiper>
      {videosRef.current?.[currentIndex]?.video && <DesktopDetails {...videosRef.current[currentIndex]} />}
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
