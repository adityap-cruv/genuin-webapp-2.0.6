'use client'
import { Mousewheel } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Loader } from '@components/ui/loader'
import { getFeed } from '@lib/api/feed'
import { useSize } from './size-provider'

export function VerticalView() {
  const { height, width } = useSize()
  const { data: videoPages, isError, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } = getFeed(1)
  const videos = videoPages?.pages.flatMap((item) => item.reels)

  let videoHeight = (width * 16) / 9

  let ratio = (videoHeight - height) / videoHeight
  if (ratio < 0) ratio = -ratio
  ratio += 1
  let videoWidth = width
  if (videoHeight > height) {
    videoHeight = height * 0.8
    videoWidth = (9 / 16) * videoHeight
    ratio *= 0.7
  }
  console.log('video Height:', videoWidth, videoHeight)
  console.log('ration::', ratio)

  if (videos)
    return (
      <div className="flex h-full w-full items-center justify-center bg-tertiary-400">
        <Swiper
          className="aspect-reel h-full w-full max-w-sm"
          mousewheel
          modules={[Mousewheel]}
          direction="vertical"
          centeredSlides={false}
          slidesPerView={ratio}
          spaceBetween={16}>
          {videos.map((item, index) => {
            return (
              <SwiperSlide
                key={item.video.id}
                style={{ height: videoHeight, width: videoWidth }}
                className="overflow-clip rounded-lg">
                <img className="overflow-clip object-cover" src={item.video.thumbnail} />
              </SwiperSlide>
            )
          })}
        </Swiper>
      </div>
    )

  return (
    <div className="flex h-full w-full items-center justify-center">
      <Loader size="md" />
    </div>
  )
}
