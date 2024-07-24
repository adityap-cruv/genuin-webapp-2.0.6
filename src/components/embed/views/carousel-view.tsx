'use client'
import { Mousewheel, Keyboard } from 'swiper/modules'
import { type SwiperClass, Swiper, SwiperSlide, useSwiper } from 'swiper/react'
import { useEmbedConfig } from '@/components/embed/embed-config-provider'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { EmbedPlayer } from '@components/embed/embed-player'
import { useEmbedPlayerState } from '@components/embed/embed-player-state'
import { getFeedForEmbed } from '@/components/embed/api'
import { useShallow } from 'zustand/react/shallow'
import { useDebouncedCallback } from 'use-debounce'

export function CarouselView() {
  const swiperRef = useRef<SwiperClass | null>(null)
  const { width, height } = useEmbedConfig(useShallow((state) => ({ width: state.width, height: state.height })))
  const { changeActiveIndex, setEmbedType, activeVideoId } = useEmbedPlayerState(
    useShallow((state) => ({
      changeActiveIndex: state.changeActiveIndex,
      setEmbedType: state.setEmbedType,
      activeVideoId: state.activeVideoIndex,
    }))
  )
  const { data: videoPages, fetchNextPage, isFetchingNextPage } = getFeedForEmbed(3)
  const videos = useMemo(() => videoPages?.pages.flatMap((item) => item.reels), [videoPages])
  const [activeThroughHover, setActiveThroughHover] = useState(-1)
  const debounce = useDebouncedCallback((index) => {
    changeActiveIndex(index)
    setActiveThroughHover(index)
  }, 500)

  useEffect(() => {
    setEmbedType('carousel')
  }, [])

  const ratio = useMemo(() => width / ((height * 9) / 16), [height])

  if (!videos) {
    return <div className="flex h-full w-full items-center justify-center">Loading...</div>
  }

  return (
    <div className="relative h-full w-full">
      <Swiper
        onSwiper={(swiper) => {
          swiperRef.current = swiper
        }}
        direction="horizontal"
        spaceBetween={16}
        speed={500}
        mousewheel={{
          forceToAxis: true,
          releaseOnEdges: true,
          sensitivity: 0.1,
          thresholdDelta: 5,
          thresholdTime: 500,
        }}
        onReachEnd={() => {
          if (videos.length !== 0 && !isFetchingNextPage) {
            void fetchNextPage()
          }
        }}
        slidesPerView={ratio}
        modules={[Mousewheel, Keyboard]}
        onActiveIndexChange={(swiper) => {
          changeActiveIndex(swiper.activeIndex)
        }}
        onInit={(swiper) => {
          changeActiveIndex(swiper.activeIndex)
        }}>
        {videos.map((item, index) => {
          return (
            <SwiperSlide key={item.video.id}>
              {({ isActive }) => {
                return (
                  <div
                    onMouseOver={(e) => {
                      debounce(index)
                    }}
                    onMouseLeave={(e) => {
                      debounce.cancel()
                      if (activeThroughHover !== -1) setActiveThroughHover(-1)
                    }}
                    style={{ width: height * (9 / 16), height }}
                    className="relative inset-0 aspect-reel overflow-clip rounded-lg bg-contain bg-center bg-no-repeat object-contain">
                    <EmbedPlayer
                      index={index}
                      isFirstElement={index === 0}
                      videoData={item}
                      isActive={isActive}
                      loop={activeThroughHover === activeVideoId}
                      onEnded={(e) => {
                        if (!activeThroughHover && swiperRef.current) swiperRef.current.slideNext()
                      }}
                    />
                  </div>
                )
              }}
            </SwiperSlide>
          )
        })}
        <SwiperButtons slidesPerView={ratio} />
      </Swiper>
    </div>
  )
}

function SwiperButtons({ slidesPerView }: { slidesPerView: number }) {
  const [states, setStates] = useState({ isStart: true, isEnd: false })
  const slider = useSwiper()

  slider.on('slideChange', () => {
    setStates({ isStart: slider.isBeginning, isEnd: slider.isEnd })
  })

  return (
    <>
      {!states.isStart && (
        <button
          onClick={() => {
            slider.slideTo(slider.activeIndex - slidesPerView)
          }}
          className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-lg bg-monochrome-9 p-1">
          <ChevronLeft />
        </button>
      )}
      {!states.isEnd && (
        <button
          onClick={() => {
            slider.slideTo(slider.activeIndex + slidesPerView)
          }}
          className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-lg bg-monochrome-9 p-1">
          <ChevronRight />
        </button>
      )}
    </>
  )
}
