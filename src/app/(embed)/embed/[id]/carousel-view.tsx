'use client'
import { getFeed } from '@lib/api/feed'
import { Mousewheel } from 'swiper/modules'
import { Swiper, SwiperSlide, useSwiper } from 'swiper/react'
import { useSize } from './size-provider'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { EmbedPlayer } from '@components/embed/embed-player'
import { useEmbedPlayerState } from '@components/embed/embed-player-state'

export function CarouselView() {
  const { width, height } = useSize()
  const { setActiveVideoId } = useEmbedPlayerState()
  const { data: videoPages, isError, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } = getFeed(3)
  const videos = videoPages?.pages.flatMap((item) => item.reels)

  const videoWidth = (height * 9) / 16
  const ratio = width / videoWidth

  if (videos)
    return (
      <div className="relative h-full w-full">
        <Swiper
          className="h-full w-full"
          direction="horizontal"
          spaceBetween={16}
          mousewheel={{ forceToAxis: true }}
          slidesPerView={ratio}
          modules={[Mousewheel]}
          onActiveIndexChange={(swiper) => {
            setActiveVideoId(videos[swiper.activeIndex].video.id)
          }}
          onInit={(swiper) => {
            setActiveVideoId(videos[swiper.activeIndex].video.id)
          }}>
          {videos.map((item, index) => {
            return (
              <SwiperSlide key={index}>
                <div
                  style={{ width: height * (9 / 16), height, background: `url(${item.video.thumbnail})` }}
                  className="relative inset-0 aspect-reel overflow-clip rounded-lg bg-contain bg-center bg-no-repeat object-contain">
                  <EmbedPlayer videoId={item.video.id} videoSource={item.video.source} />
                </div>
              </SwiperSlide>
            )
          })}
          <SwiperButtons />
        </Swiper>
      </div>
    )
}

function SwiperButtons() {
  const [states, setStates] = useState({ isStart: true, isEnd: false })
  const slider = useSwiper()

  return (
    <>
      {!states.isStart && (
        <button
          onClick={() => {
            slider.slidePrev()
            setStates({ isStart: slider.isBeginning, isEnd: slider.isEnd })
          }}
          className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-lg bg-monochrome-9 p-1">
          <ChevronLeft />
        </button>
      )}
      {!states.isEnd && (
        <button
          onClick={() => {
            slider.slideNext()
            setStates({ isStart: slider.isBeginning, isEnd: slider.isEnd })
          }}
          className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-lg bg-monochrome-9 p-1">
          <ChevronRight />
        </button>
      )}
    </>
  )
}
