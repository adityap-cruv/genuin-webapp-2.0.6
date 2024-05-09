'use client'
import { Mousewheel } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Loader } from '@components/ui/loader'
import { getFeed } from '@lib/api/feed'
import { useSize } from './size-provider'
import { EmbedPlayer } from '@components/embed/embed-player'
import { useEmbedPlayerState } from '@components/embed/embed-player-state'

export function VerticalView() {
  const { height, width } = useSize()
  const { setActiveVideoId } = useEmbedPlayerState()
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
          spaceBetween={16}
          onActiveIndexChange={(swiper) => {
            setActiveVideoId(videos[swiper.activeIndex].video.id)
          }}
          onInit={(swiper) => {
            setActiveVideoId(videos[swiper.activeIndex].video.id)
          }}>
          {videos.map((item, index) => {
            return (
              <SwiperSlide
                key={item.video.id}
                style={{ height: videoHeight, width: videoWidth }}
                className="overflow-clip rounded-lg">
                <EmbedPlayer videoId={item.video.id} videoSource={item.video.source} />
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
