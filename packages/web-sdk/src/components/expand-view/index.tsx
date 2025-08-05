import type { FeedVideoType } from '@/type'
import { Loader } from '@/components/loader'
import { cn, parseColors, resolveVideoUrl } from '@/utils'
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
import { useEffect, useState } from 'react'
import { PlayerProvider } from '../player/context'
import { useWindowSize } from '@/hooks/use-window-size'
import { ExpandViewEsc } from './esc-tab'
import { createPortal } from 'react-dom'

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
  const { isFullScreen, activeIndex: stateActiveIndex } = useExpandViewContext()
  const { isWindows, isMobile } = useDeviceDetect()
  const {
    muted,
    isVideoPlaying,
    customizations,
    setIsVideoPlaying,
    brandDetails,
  } = useBaseContext()
  const { width, height } = useWindowSize()
  const [swiperInstance, setSwiperInstance] = useState<any | null>(null)

  useEffect(() => {
    if (
      isFullScreen &&
      (customizations?.view === 'carousel' || customizations?.view === 'feed')
    ) {
      setIsVideoPlaying(true)
    } else {
      setIsVideoPlaying(false)
    }
  }, [isFullScreen])

  // useEffect(() => {
  //   if (!isFullScreen) return
  //   const rootElement = customizations?.element
  //   if (!rootElement) return

  //   rootElement.classList.add('gen-sdk-expand-open')

  //   return () => {
  //     rootElement.classList.remove('gen-sdk-expand-open')
  //   }
  // }, [isFullScreen])

  if (!isFullScreen) return null

  const parsedColors = parseColors(brandDetails?.brand_colors)

  const content = (
    <div
      className='gen-sdk-class'
      style={{ zIndex: 99999, ...parsedColors }}>
      <div
        style={{ height, width }}
        className={cn(
          'fixed inset-0 z-50 flex items-center justify-center bg-black',
        )}>
        <div className={cn('h-full flex aspect-reel', isMobile && 'w-full')}>
          <Swiper
            direction='vertical'
            slidesPerView={1}
            speed={SWIPER_CONFIG.SCROLL_DELAY}
            initialSlide={stateActiveIndex ?? activeIndex}
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
            className='relative shrink-0 overflow-clip bg-black h-full w-full'>
            {videos.map((video, index) => (
              <SwiperSlide key={index}>
                {({ isActive, isPrev, isNext }) => {
                  if (isActive || isPrev || isNext) {
                    return video ? (
                      <PlayerProvider>
                        <BasePlayer
                          id={'fullscreen__player__' + video.uuid}
                          index={index}
                          shouldPlay={activeIndex === index && isVideoPlaying}
                          muted={muted}
                          src={resolveVideoUrl(
                            brandDetails?.brand_id,
                            video.video.media_url_m3u8,
                            video.video.media_url,
                          )}
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
                      </PlayerProvider>
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
            <ExpandViewEsc
              videoId={videos[activeIndex]?.video?.uuid ?? ''}
              onCloseExpandView={onCloseExpandView}
            />
          </Swiper>
        </div>

        {/* TODO CHECK BUTTON INSTANCE */}
        {!isMobile && (
          <ExpandViewComponents
            videos={videos}
            activeIndex={activeIndex}
            onSpark={onSpark}
            swiperInstance={swiperInstance}
          />
        )}
      </div>
    </div>
  )

  return createPortal(content, document.body)
}
