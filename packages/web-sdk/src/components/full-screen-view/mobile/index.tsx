import { useEffect } from 'react'
import { useRef } from 'react'
import { getIconLink } from '@/utils'
import { FeedVideoType, SizeBoxType } from '@/type'
import { Shimmer } from '../../shimmer'
import { FullScreenMobilePlayer } from '@/components/player/full-screen-mobile'

const MOBILE_FULL_SCREEN_CLASS_NAME = '__gen__sdk__mobile__full__screen__class'

type FullScreenMobileViewPropsType = {
  sizeBox: SizeBoxType
  showClose?: boolean
  forStandardWall?: boolean
  shouldPlay: boolean
  activeIndex: number
  updateActiveIndex: (index: number) => void
  videos: FeedVideoType[]
  closeModal: () => void
  showNavigationBar: boolean
  onSpark?: (videoId: string, isSparked: boolean) => void
  onCommentCountChange?: (videoId: string, count: number) => void
}

export function FullScreenMobileView({
  sizeBox,
  showClose = true,
  forStandardWall = false,
  shouldPlay,
  activeIndex,
  closeModal,
  showNavigationBar,
  updateActiveIndex,
  videos,
  onSpark,
  onCommentCountChange,
}: FullScreenMobileViewPropsType) {
  const swiperRef = useRef<any>(null)

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const swiper = new Swiper('.' + MOBILE_FULL_SCREEN_CLASS_NAME, {
      direction: 'vertical',
      slidesPerView: 1,
      speed: 500,
      startIndex: activeIndex,
      mousewheel: {
        forceToAxis: true,
        releaseOnEdges: true,
        sensitivity: 0.1,
        thresholdDelta: 5,
        thresholdTime: 500,
      },
    })
    swiper.slideTo(activeIndex, 0)
    swiperRef.current = swiper

    swiper.on('activeIndexChange', (swiper: any) => {
      updateActiveIndex(swiper.activeIndex)
    })

    return () => {
      swiper.destroy()
    }
  }, [])

  useEffect(() => {
    swiperRef.current?.update()
  }, [videos])

  function setDivStyles(node: HTMLDivElement | null) {
    if (!node) return
    node?.style.setProperty('height', `${sizeBox.height}px`, 'important')
    node?.style.setProperty('width', `${sizeBox.width}px`, 'important')
    node?.style.setProperty('max-width', 'unset')
    node?.style.setProperty('max-height', 'unset')
    node?.style.setProperty('min-width', 'unset')
    node?.style.setProperty('min-height', 'unset')
    node?.style.setProperty('margin-bottom', 'unset')
  }

  return (
    <div
      ref={setDivStyles}
      className={`${MOBILE_FULL_SCREEN_CLASS_NAME} swiper flex flex-grow`}>
      <div className='swiper-wrapper'>
        {videos.map((video, index) => {
          return (
            <div
              key={index}
              className='swiper-slide relative overflow-clip'
              ref={setDivStyles}>
              {!video ? (
                <Shimmer />
              ) : (
                <FullScreenMobilePlayer
                  id={getMobileFullScreenPlayerId(video.uuid, forStandardWall)}
                  key={index}
                  video={video}
                  index={index}
                  swiperRef={swiperRef}
                  shouldPlay={shouldPlay}
                  hasNavbar={showNavigationBar}
                  onSpark={onSpark}
                  onCommentCountChange={onCommentCountChange}
                />
              )}
            </div>
          )
        })}
      </div>
      {showClose && (
        <div className='absolute top-4 right-4 z-10'>
          <img
            alt='mute'
            className='h-8 w-8 cursor-pointer'
            src={getIconLink('icCloseWhite')}
            height={32}
            width={32}
            onClick={closeModal}
          />
        </div>
      )}
    </div>
  )
}

function getMobileFullScreenPlayerId(uuid: string, forStandardWall: boolean) {
  return forStandardWall
    ? `__gen__sdk__mobile__standard__wall__${uuid}`
    : `__gen__sdk__mobile__full__screen__${uuid}`
}
