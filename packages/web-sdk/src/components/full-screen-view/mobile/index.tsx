import { useEffect, useRef } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Mousewheel } from 'swiper/modules'
import type { Swiper as SwiperType } from 'swiper'

import { FeedVideoType, SizeBoxType } from '@/type'
import { Shimmer } from '../../shimmer'
import { FullScreenMobilePlayer } from '@/components/player/full-screen-mobile'

// Import Swiper styles
import 'swiper/css'

type PlayerModalMobilePropsType = {
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

export function PlayerModalMobile({
  sizeBox,
  forStandardWall = false,
  shouldPlay,
  activeIndex,
  showNavigationBar,
  updateActiveIndex,
  videos,
  onSpark,
  onCommentCountChange,
}: PlayerModalMobilePropsType) {
  const swiperRef = useRef<SwiperType | null>(null)
  // const { brandDetails, customizations } = useBaseContext()

  useEffect(() => {
    // console.log('activeIndex:::', activeIndex)
    // Update swiper to the correct slide when activeIndex changes externally
    if (swiperRef.current && swiperRef.current.activeIndex !== activeIndex) {
      swiperRef.current.slideTo(activeIndex, 0)
    }
  }, [activeIndex])

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

  const handleActiveIndexChange = (swiper: SwiperType) => {
    updateActiveIndex(swiper.activeIndex)
  }

  return (
    <div
      ref={setDivStyles}
      className='flex flex-grow !absolute bottom-0'>
      <Swiper
        onInit={(swiper) => {
          swiperRef.current = swiper
        }}
        direction='vertical'
        slidesPerView={1}
        speed={500}
        initialSlide={activeIndex}
        modules={[Mousewheel]}
        mousewheel={{
          forceToAxis: true,
          releaseOnEdges: true,
          sensitivity: 0.1,
          thresholdDelta: 5,
          thresholdTime: 500,
        }}
        onActiveIndexChange={handleActiveIndexChange}
        className='w-full h-full'>
        {videos.map((video, index) => (
          <SwiperSlide
            key={index}
            className='relative overflow-clip'>
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
          </SwiperSlide>
        ))}
      </Swiper>

      {/* {showClose && (
        <div
          className={cn('absolute top-4 right-4 z-10', {
            'size-9 p-2.5 bg-black/40 rounded-full flex justify-center items-center':
              isCheckFifthVideoType(brandDetails?.brand_id) &&
              customizations?.view === 'carousel',
          })}>
          <img
            alt='close'
            className={cn('h-8 w-8 cursor-pointer', {
              'size-5':
                isCheckFifthVideoType(brandDetails?.brand_id) &&
                customizations?.view === 'carousel',
            })}
            src={getIconLink('icCloseWhite')}
            height={32}
            width={32}
            onClick={closeModal}
          />
        </div>
      )} */}
    </div>
  )
}

function getMobileFullScreenPlayerId(uuid: string, forStandardWall: boolean) {
  return forStandardWall
    ? `__gen__sdk__mobile__standard__wall__${uuid}`
    : `__gen__sdk__mobile__full__screen__${uuid}`
}
