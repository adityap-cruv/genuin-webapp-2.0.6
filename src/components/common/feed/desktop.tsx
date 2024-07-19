import dynamic from 'next/dynamic'
import { DesktopDetails } from './desktop-details'
import { type ComponentProps, useContext } from 'react'
import { cn } from '@lib/utils'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Mousewheel, Keyboard } from 'swiper/modules'
import { type VideoSizeBoxType, useGenuinOptions } from '@lib/stores/genuin-options'
import { type VideoPlayerModalType } from '@lib/schemas/player/video'
import { useShallow } from 'zustand/react/shallow'
import { triggerAnalyticsForVideoComplete } from './analytics-func'
import { FeedContext, FeedContextProvider } from './feed-provider'
import { FeedShimmer } from '../shimmers/feed-shimmer'

const DesktopPlayer = dynamic(async () => await import('@components/common/player').then((comp) => comp.Player.desktop))

type DesktopProps = {
  isLoading: boolean
  isFetchingNextPage: boolean
  fetchNextPage?: () => void
  videos: VideoPlayerModalType[]
  hasNextPage: boolean
  startIndex: number
  className?: string
  /**
   * Pass this parameter if you want to configure custom size box.
   */
  customSizeBox?: VideoSizeBoxType
} & ComponentProps<'div'>

export function Desktop({
  fetchNextPage,
  className,
  customSizeBox,
  videos,
  isFetchingNextPage,
  hasNextPage,
  isLoading,
  startIndex,
  ...restProps
}: DesktopProps) {
  if (isLoading) {
    return <FeedShimmer.desktop />
  }

  return (
    <FeedContextProvider
      startIndex={startIndex}
      videos={videos}
      fetchNextPage={fetchNextPage}
      hasNextPage={hasNextPage}
      isFetchingNextPage={isFetchingNextPage}>
      <SwiperRenderer customSizeBox={customSizeBox} startIndex={startIndex} {...restProps} />
    </FeedContextProvider>
  )
}

type SwiperRendererProps = { customSizeBox?: VideoSizeBoxType; startIndex: number } & ComponentProps<'div'>

const SHELLS = Array.from({ length: 100 })
function SwiperRenderer({ customSizeBox, startIndex, className, ...restProps }: SwiperRendererProps) {
  const sizeBox =
    customSizeBox ?? useGenuinOptions(useShallow((state) => ({ sizeBox: state.sizeBoxes.default }))).sizeBox
  const { allowSlideNext, currentIndex, updateCurrentIndex, videos } = useContext(FeedContext)

  if (!videos || videos.length === 0)
    return (
      <div className={cn('flex aspect-reel h-full items-center justify-center bg-tertiary-200', className)}>
        <p className="text-title-3-demi text-tertiary">No activity yet</p>
      </div>
    )

  return (
    <div className={cn('flex h-full w-full', className)} {...restProps}>
      <Swiper
        onActiveIndexChange={(swiper) => {
          updateCurrentIndex(swiper.activeIndex, videos[currentIndex].video.id)
        }}
        allowSlideNext={allowSlideNext}
        keyboard={true}
        initialSlide={startIndex}
        speed={500}
        shortSwipes={false}
        modules={[Mousewheel, Keyboard]}
        mousewheel
        style={{ width: sizeBox.width, height: sizeBox.height }}
        direction="vertical">
        {SHELLS.map((_, index) => {
          return (
            <SwiperSlide key={index}>
              {({ isActive, isPrev, isNext }) => {
                if (isActive || isPrev || isNext)
                  if (videos[index])
                    return (
                      <DesktopPlayer
                        isActive={isActive}
                        videoData={{ ...videos[index].video }}
                        loop
                        key={index}
                        onEnded={(event) => {
                          triggerAnalyticsForVideoComplete(videos[index].video.id)
                        }}
                      />
                    )
              }}
            </SwiperSlide>
          )
        })}
      </Swiper>
      <DesktopDetails {...videos[currentIndex]} />
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
