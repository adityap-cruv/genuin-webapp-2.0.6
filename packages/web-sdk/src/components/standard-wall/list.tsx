import { useSizeContext } from '@/context/size'
import { Shimmer } from '@/components/shimmer'
import { FullScreenDesktopDetailsView } from '@/components/full-screen-view/desktop/details'
import { HeaderMobile } from '../header/mobile'
import { StandardWallPlayer } from './player'
import { useState } from 'react'
import { FeedVideoType } from '@/type'
import { CommunityUserRole } from '../tree-structure'
import { SWIPER_CONFIG } from '@/utils/constants'
import { useDeviceDetect } from '@/hooks/useDeviceDetect'
import { cn } from '@/utils'
import FullScreenComponents from '../expand-view/full-screen-components'
import { useExpandViewContext } from '@/context/expand-view'
import { useGestureOverlayManager } from '../gestures/gesture-overlay-manager'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Mousewheel } from 'swiper/modules'
import 'swiper/css'

type ListPropsType = {
  swiperElementId: string
  videos: FeedVideoType[]
  activeIndex: number
  /**
   * Whether the any video shouldPlay or nor.
   * This is used to control the play/pause of the video.
   * This is useful when using standard wall in community feed.
   */
  videoShouldPlay: boolean
  onActiveIndexChange: (index: number) => void
  onInit: (swiper: any) => void
  onJoinCommunityStatusChanged?: (
    communityId: string,
    newRole: CommunityUserRole,
  ) => void
  onSpark?: (videoId: string, isSparked: boolean) => void
  onCommentCountChange?: (videoId: string, count: number) => void
}

export function StandardWallList({
  videos,
  activeIndex,
  videoShouldPlay,
  onActiveIndexChange,
  onInit,
  onJoinCommunityStatusChanged,
  onSpark,
  onCommentCountChange,
}: ListPropsType) {
  const { isWindows } = useDeviceDetect()
  const { hideGestureOverlay } = useGestureOverlayManager()
  const { isFullScreen } = useExpandViewContext()

  const {
    sizeBoxes: { video: videoSizeBox },
    isMobile,
  } = useSizeContext()
  const [swiperInstance, setSwiperInstance] = useState<any | null>(null)

  return (
    <div
      className={cn('flex w-full transition-all', {
        'fixed inset-0 z-50 bg-black justify-center': isFullScreen,
      })}
      style={{ height: isFullScreen ? '100%' : videoSizeBox.height }}>
      {isMobile && (
        <div className='absolute z-10 top-0 mx-auto'>
          <HeaderMobile style={{ width: videoSizeBox.width }} />
        </div>
      )}
      <div className='h-full flex aspect-reel'>
        <Swiper
          className='relative shrink-0 bg-black'
          style={{
            height: isFullScreen ? '100%' : videoSizeBox.height,
            width: isFullScreen ? undefined : videoSizeBox.width,
            aspectRatio: isFullScreen ? '9 / 16' : undefined,
          }}
          direction='vertical'
          slidesPerView={1}
          speed={SWIPER_CONFIG.SCROLL_DELAY}
          initialSlide={activeIndex}
          modules={[Mousewheel]}
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
          onInit={(swiper) => {
            onInit(swiper)
            setSwiperInstance(swiper)
          }}
          onActiveIndexChange={(swiper) => {
            onActiveIndexChange(swiper.activeIndex)
            hideGestureOverlay('SWIPE')
          }}
          onDestroy={() => {
            setSwiperInstance(null)
          }}>
          {videos.map((video, index) => (
            <SwiperSlide
              key={index}
              className='relative'>
              {({ isActive, isPrev, isNext }) => {
                if (isActive || isPrev || isNext) {
                  return video ? (
                    <StandardWallPlayer
                      id={'standard__wall__' + video.uuid}
                      videoDetails={video}
                      index={index}
                      shouldPlay={activeIndex === index && videoShouldPlay}
                      onSpark={onSpark}
                    />
                  ) : (
                    <Shimmer key={index} />
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
        !isMobile && (
          <div className='relative w-full'>
            <FullScreenDesktopDetailsView
              renderedIn='STANDARD_WALL'
              videoDetails={videos[activeIndex]}
              showCloseButton={false}
              onCommunityRoleChanged={onJoinCommunityStatusChanged}
              onCommentCountChange={onCommentCountChange}
            />
          </div>
        )
      )}
    </div>
  )
}
