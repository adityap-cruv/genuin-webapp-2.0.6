'use client'
import { Mousewheel } from 'swiper/modules'
import { Swiper, SwiperSlide, useSwiper } from 'swiper/react'
import { useSizeStore } from '@components/embed/size-provider'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useMemo, useState } from 'react'
import { EmbedPlayer } from '@components/embed/embed-player'
import { useEmbedPlayerState } from '@components/embed/embed-player-state'
import { getFeedForEmbed } from '@/components/embed/api'

export function CarouselView() {
  const { width, height } = useSizeStore()
  const { setActiveVideoId } = useEmbedPlayerState()
  const { data: videoPages, fetchNextPage, isFetchingNextPage } = getFeedForEmbed(3)
  const videos = useMemo(() => videoPages?.pages.flatMap((item) => item.reels), [videoPages])

  const videoWidth = (height * 9) / 16
  const ratio = width / videoWidth

  if (!videos) {
    return <div className="flex h-full w-full items-center justify-center">Loading...</div>
  }

  return (
    <div className="relative h-full w-full">
      <Swiper
        direction="horizontal"
        spaceBetween={16}
        mousewheel={{ forceToAxis: true }}
        slidesPerView={ratio}
        modules={[Mousewheel]}
        onActiveIndexChange={(swiper) => {
          const activeIndex = swiper.activeIndex
          setActiveVideoId(videos[activeIndex].video.id)
          if (videos.length !== 0 && activeIndex > videos.length - 3 && !isFetchingNextPage) {
            void fetchNextPage()
          }
        }}
        onInit={(swiper) => {
          setActiveVideoId(videos[swiper.activeIndex].video.id)
        }}>
        {videos.map((item, index) => {
          return (
            <SwiperSlide key={index}>
              {({ isActive }) => {
                return (
                  <div
                    style={{ width: height * (9 / 16), height }}
                    className="relative inset-0 aspect-reel overflow-clip rounded-lg bg-contain bg-center bg-no-repeat object-contain">
                    <EmbedPlayer videoData={item} isFirstElement={index === 0} loop={false} isActive={isActive} />
                  </div>
                )
              }}
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
