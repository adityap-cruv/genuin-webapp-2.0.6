'use client'
import { Mousewheel } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Loader } from '@components/ui/loader'
import { getFeed } from '@lib/api/feed'
import { useSize } from './size-provider'
import { EmbedPlayer } from '@components/embed/embed-player'
import { useEmbedPlayerState } from '@components/embed/embed-player-state'
import { CustomAvatar } from '@components/custom/custom-avatar'
import { Button } from '@components/ui/button'

export function VerticalView() {
  const { height, width } = useSize()
  const { setActiveVideoId } = useEmbedPlayerState()
  const { data: videoPages } = getFeed(1)
  const videos = videoPages?.pages.flatMap((item) => item.reels)

  function postMessage(link: string) {
    window.parent.postMessage({ action: 'open_link', link }, '*')
  }

  let videoHeight = (width * 16) / 9

  let ratio = (videoHeight - height) / videoHeight
  if (ratio < 0) ratio = -ratio
  ratio += 1
  let videoWidth = width - 16
  if (videoHeight > height) {
    videoHeight = height * 0.8
    videoWidth = (9 / 16) * videoHeight
    ratio *= 0.7
  }

  if (videos)
    return (
      <div className="flex h-full w-full flex-col items-center justify-center bg-tertiary-200 px-2">
        <div className="flex w-full justify-between p-2">
          <span className="flex items-center gap-2">
            <CustomAvatar
              fallbackString={videos[0].community.name ?? ''}
              imageUrl={videos[0].community.profileImage ?? ''}
              isAvatar={false}
              className="h-8 w-8"
            />
            <p className="text-cap-1-bold">{videos[0].community.name}</p>
          </span>
          <Button
            className="px-4"
            onClick={() => {
              postMessage(videos[0].community.shareUrl)
            }}>
            <p className="text-cap-1-demi">Join Community</p>
          </Button>
        </div>
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
                <EmbedPlayer videoData={item} isFirstElement={index === 0} loop />
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
