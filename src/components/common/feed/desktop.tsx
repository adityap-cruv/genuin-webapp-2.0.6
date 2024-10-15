import dynamic from 'next/dynamic'
import { DesktopDetails } from './desktop-details'
import { type ComponentProps, memo, useContext } from 'react'
import { cn } from '@lib/utils'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Mousewheel, Keyboard } from 'swiper/modules'
import { type VideoSizeBoxType, useGenuinOptions } from '@lib/stores/genuin-options'
import { type VideoPlayerModalType } from '@lib/schemas/player/video'
import { useShallow } from 'zustand/react/shallow'
import { FeedContext, FeedContextProvider } from './feed-provider'
import { FeedShimmer } from '../shimmers/feed-shimmer'
import Analytics from '@/services/analytics'
import { usePlayerControlStore } from '../player/player-control-store'

const DesktopPlayer = dynamic(async () => await import('@components/common/player').then((comp) => comp.Player.desktop))

type DesktopProps = {
  isLoading: boolean
  isFetchingNextPage: boolean
  fetchNextPage?: () => void
  videosRef: React.MutableRefObject<VideoPlayerModalType[]>
  hasNextPage: boolean
  startIndex: number
  className?: string
  /**
   * Pass this parameter if you want to configure custom size box.
   */
  customSizeBox?: VideoSizeBoxType
} & ComponentProps<'div'>

export const Desktop = memo(function Desktop({
  fetchNextPage,
  className,
  customSizeBox,
  videosRef,
  isFetchingNextPage,
  hasNextPage,
  isLoading,
  startIndex,
  ...restProps
}: DesktopProps) {
  if (isLoading || videosRef.current.length === 0) {
    return <FeedShimmer.desktop />
  }

  return (
    <FeedContextProvider
      startIndex={startIndex}
      videosRef={videosRef}
      fetchNextPage={fetchNextPage}
      hasNextPage={hasNextPage}
      isFetchingNextPage={isFetchingNextPage}>
      <SwiperRenderer customSizeBox={customSizeBox} startIndex={startIndex} {...restProps} />
    </FeedContextProvider>
  )
})

type SwiperRendererProps = { customSizeBox?: VideoSizeBoxType; startIndex: number } & ComponentProps<'div'>

const SHELLS = Array.from({ length: 100 })
function SwiperRenderer({ customSizeBox, startIndex, className, ...restProps }: SwiperRendererProps) {
  const sizeBox =
    customSizeBox ?? useGenuinOptions(useShallow((state) => ({ sizeBox: state.sizeBoxes.default }))).sizeBox
  const { allowSlideNext, currentIndex, updateCurrentIndex, videosRef } = useContext(FeedContext)

  if (!videosRef.current || videosRef.current.length === 0)
    return (
      <div className={cn('aspect-reel flex h-full items-center justify-center bg-tertiary-200', className)}>
        <p className="text-title-3-demi text-tertiary">No activity yet</p>
      </div>
    )

  return (
    <div className={cn('flex h-full w-full', className)} {...restProps}>
      <Swiper
        onActiveIndexChange={(swiper) => {
          updateCurrentIndex(swiper.activeIndex, videosRef.current[currentIndex].video.id)
        }}
        allowSlideNext={allowSlideNext}
        keyboard={true}
        initialSlide={startIndex}
        speed={500}
        modules={[Mousewheel, Keyboard]}
        mousewheel
        style={{ width: sizeBox.width, height: sizeBox.height }}
        direction="vertical">
        {SHELLS.map((_, index) => {
          return (
            <SwiperSlide key={index}>
              {({ isActive, isPrev, isNext }) => {
                if (isActive || isPrev || isNext)
                  if (videosRef.current[index])
                    return (
                      <DesktopPlayer
                        isActive={isActive}
                        videoData={{
                          ...videosRef.current[index].video,
                          clickableUrl: videosRef.current[index].video.clickableUrl,
                        }}
                        loop
                        key={index}
                        onEnded={(event) => {
                          const { currentTime, duration } = usePlayerControlStore.getState()
                          Analytics.triggerAnalyticsForVideoComplete(
                            videosRef.current[index].video.id,
                            duration,
                            currentTime
                          )
                        }}
                      />
                    )
              }}
            </SwiperSlide>
          )
        })}
      </Swiper>
      <DesktopDetails {...videosRef.current[currentIndex]} />
    </div>
  )
}

type SinglePlayerProps = {
  videoData: VideoPlayerModalType
  sizeBox: VideoSizeBoxType
  className?: string
  isInModal?: boolean
}

// TODO: Remove this component and use swiper instead.
export function SinglePlayer({ sizeBox, className, videoData, isInModal }: SinglePlayerProps) {
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
            clickableUrl: videoData.video.clickableUrl,
          }}
          loop
          onEnded={(event) => {
            const { currentTime, duration } = usePlayerControlStore.getState()
            Analytics.triggerAnalyticsForVideoComplete(videoData.video.id, duration, currentTime)
          }}
          isInModal={isInModal}
        />
      </div>
      <DesktopDetails {...videoData} />
    </div>
  )
}
