import type { FeedVideoType } from '@/type'
import { Loader } from '@/components/loader'
import { cn } from '@/utils'
import { SWIPER_CONFIG } from '@/utils/constants'
import { useDeviceDetect } from '@/hooks/useDeviceDetect'
import { ExpandViewComponents } from '@/components/expand-view/common-components'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Mousewheel } from 'swiper/modules'
import 'swiper/css'
import { BasePlayer } from '../player/base'
import { useBaseContext } from '@/context/base'
import { ControlLayer } from '../player/control-layer'
import { useExpandViewContext } from '@/components/expand-view/context'
import { useState } from 'react'

type ExpandViewPropsType = {
  videos: FeedVideoType[]
  activeIndex: number
  onCloseExpandView?: () => void
  onSpark?: (videoId: string, isSparked: boolean) => void
  onCommentCountChange?: (videoId: string, count: number) => void
  onActiveIndexChange: (index: number) => void
}

export function ExpandView({
  videos,
  activeIndex,
  onCloseExpandView,
  onSpark,
  onCommentCountChange,
  onActiveIndexChange,
}: ExpandViewPropsType) {
  const { isFullScreen } = useExpandViewContext()
  const { isWindows } = useDeviceDetect()
  const { muted, isVideoPlaying } = useBaseContext()
  const [swiperInstance, setSwiperInstance] = useState<any | null>(null)

  if (!isFullScreen) return

  return (
    <div
      style={{
        height: '100vh',
        width: '100vw',
      }}
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center bg-black',
      )}>
      <div className='h-full flex aspect-reel'>
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
          className='relative shrink-0 bg-black h-full w-full'>
          {videos.map((video, index) => (
            <SwiperSlide key={index}>
              {({ isActive, isPrev, isNext }) => {
                if (isActive || isPrev || isNext) {
                  return video ? (
                    <>
                      <BasePlayer
                        id={'fullscreen__player__' + video.uuid}
                        index={index}
                        shouldPlay={activeIndex === index && isVideoPlaying}
                        muted={muted}
                        src={
                          video.video.media_url_m3u8
                            ? video.video.media_url_m3u8
                            : video.video.media_url
                        }
                        poster={video.video.thumbnail_url}
                        triggerAnalytics
                        className='cursor-pointer'
                      />
                      <ControlLayer
                        index={index}
                        videoDetails={video}
                        onCloseExpandView={onCloseExpandView}
                        onSpark={onSpark}
                        onCommentCountChange={onCommentCountChange}
                      />
                    </>
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

      {/* TODO CHECK BUTTON INSTANCE */}
      <ExpandViewComponents
        videos={videos}
        activeIndex={activeIndex}
        onSpark={onSpark}
        swiperInstance={swiperInstance}
      />
    </div>
  )
}
