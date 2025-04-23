import type { FeedVideoType, SizeBoxType } from '@/type'
import { Loader } from '@/components/loader'
import { DesktopModalPlayer } from '@/components/player/full-screen-desktop'
import { FullScreenDesktopDetailsView } from './details'
import { CommunityUserRole } from '@/components/tree-structure'
import { cn } from '@/utils'
import { type ShouldPlayType } from '@/context/base'
import { useState } from 'react'
import { SWIPER_CONFIG } from '@/utils/constants'
import { useDeviceDetect } from '@/hooks/useDeviceDetect'
import FullScreenSideButtons from '@/components/expand-view/full-screen-side-buttons'
import FullScreenComponents from '@/components/expand-view/full-screen-components'
import { useExpandViewContext } from '@/context/expand-view'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Mousewheel } from 'swiper/modules'
import 'swiper/css'

type FullScreenDesktopViewPropsType = {
  videos: FeedVideoType[]
  activeIndex: number
  modalSizeBox: SizeBoxType
  videoSizeBox: SizeBoxType
  shouldPlay: boolean
  renderedIn: ShouldPlayType
  closeModal?: () => void
  onCommunityRoleChanged?: (
    communityId: string,
    role: CommunityUserRole,
  ) => void
  onSpark?: (videoId: string, isSparked: boolean) => void
  onCommentCountChange?: (videoId: string, count: number) => void
  onActiveIndexChange: (index: number) => void
}

export function FullScreenDesktopView({
  videos,
  activeIndex,
  shouldPlay,
  modalSizeBox,
  videoSizeBox,
  renderedIn,
  closeModal,
  onCommunityRoleChanged,
  onSpark,
  onCommentCountChange,
  onActiveIndexChange,
}: FullScreenDesktopViewPropsType) {
  const { isFullScreen } = useExpandViewContext()
  const { isWindows } = useDeviceDetect()
  const [swiperInstance, setSwiperInstance] = useState<any | null>(null)

  return (
    <div
      className={cn('flex items-center gap-4', {
        'h-full w-full justify-center bg-black': isFullScreen,
      })}>
      <div
        className={cn(
          '__gen__sdk__animate__move__to__center bg-background overflow-clip rounded-2xl flex opacity-100 h-full w-full',
          { 'bg-black justify-center': isFullScreen },
        )}
        style={{
          height: isFullScreen ? '100%' : modalSizeBox.height,
          width: isFullScreen ? '100%' : modalSizeBox.width,
        }}>
        <div className='flex h-full'>
          <Swiper
            direction='vertical'
            slidesPerView={1}
            speed={SWIPER_CONFIG.SCROLL_DELAY}
            initialSlide={activeIndex}
            mousewheel={{
              forceToAxis: true,
              releaseOnEdges: true,
              thresholdDelta: isWindows
                ? SWIPER_CONFIG.MOUSE_THRESHOLD.WINDOWS
                : SWIPER_CONFIG.MOUSE_THRESHOLD.DEFAULT,
              thresholdTime: SWIPER_CONFIG.THRESHOLD_TIME,
              sensitivity: isWindows
                ? SWIPER_CONFIG.MOUSE_SENSITIVITY.WINDOWS
                : SWIPER_CONFIG.MOUSE_SENSITIVITY.DEFAULT,
            }}
            modules={[Mousewheel]}
            onInit={(swiper) => {
              setSwiperInstance(swiper)
            }}
            onActiveIndexChange={(swiper) => {
              onActiveIndexChange(swiper.activeIndex)
            }}
            onDestroy={() => {
              setSwiperInstance(null)
            }}
            className='relative shrink-0 bg-black'
            style={{
              height: isFullScreen ? '100%' : videoSizeBox.height,
              width: isFullScreen ? undefined : videoSizeBox.width,
              aspectRatio: isFullScreen ? '9 / 16' : undefined,
            }}>
            {videos.map((video, index) => (
              <SwiperSlide key={index}>
                {({ isActive, isPrev, isNext }) => {
                  if (isActive || isPrev || isNext) {
                    return video ? (
                      <DesktopModalPlayer
                        id={'fullscreen__player__' + video.uuid}
                        videoDetails={video}
                        shouldPlay={isActive && shouldPlay}
                        videoSizeBox={videoSizeBox ?? { height: 0, width: 0 }}
                        index={index}
                        onSpark={onSpark}
                        onCommentCountChange={onCommentCountChange}
                      />
                    ) : (
                      <div className='flex items-center justify-center h-full w-full'>
                        <Loader />
                      </div>
                    )
                  }
                  return null
                }}
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {isFullScreen ? (
          <FullScreenComponents
            videos={videos}
            activeIndex={activeIndex}
            swiperInstance={swiperInstance}
            onSpark={onSpark}
          />
        ) : (
          <FullScreenDesktopDetailsView
            videoDetails={videos[activeIndex]}
            className='w-full'
            closeModal={closeModal}
            onCommunityRoleChanged={onCommunityRoleChanged}
            onCommentCountChange={onCommentCountChange}
            renderedIn={renderedIn}
          />
        )}
      </div>

      {!isFullScreen && (
        <div className='flex items-center flex-col gap-4'>
          <FullScreenSideButtons
            videos={videos}
            currentIndex={activeIndex}
            swiperInstance={swiperInstance}
          />
        </div>
      )}
    </div>
  )
}
