'use client'
import { Mousewheel } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Loader } from '@components/ui/loader'
import { useSizeStore } from '@components/embed/size-provider'
import { EmbedPlayer } from '@components/embed/embed-player'
import { useEmbedPlayerState } from '@components/embed/embed-player-state'
import { CustomAvatar } from '@components/custom/custom-avatar'
import { Button } from '@components/ui/button'
import { getFeedForEmbed } from '@/components/embed/api'
import { useShallow } from 'zustand/react/shallow'
import { useEffect, useMemo } from 'react'

export function VerticalView() {
  const { height, width } = useSizeStore()
  const { setActiveVideoId, setEmbedType } = useEmbedPlayerState(
    useShallow((state) => ({ setActiveVideoId: state.setActiveVideoId, setEmbedType: state.setEmbedType }))
  )
  const { data: videoPages, fetchNextPage, isFetchingNextPage } = getFeedForEmbed(1)
  const videos = videoPages?.pages.flatMap((item) => item.reels)

  useEffect(() => {
    setEmbedType('feed')
  }, [])

  function postMessage(link: string) {
    window.parent.postMessage({ action: 'open_link', link }, '*')
  }

  const { ratio, videoHeight, videoWidth } = useMemo(() => {
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
    return { videoHeight, videoWidth, ratio }
  }, [width, height])

  if (!videos)
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader size="md" />
      </div>
    )

  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-tertiary-200">
      <div className="flex justify-between py-2" style={{ width: videoWidth }}>
        <span className="flex w-full items-center gap-2">
          <CustomAvatar
            fallbackString={videos[0].community.name ?? ''}
            imageUrl={videos[0].community.profileImage ?? ''}
            isAvatar={false}
            className="h-8 w-8"
          />
          <p className="line-clamp-1 break-all text-cap-1-bold">{videos[0].community.name}</p>
        </span>
        <Button
          className="px-4"
          onClick={() => {
            postMessage(videos[0].community.shareUrl)
          }}>
          <p className="whitespace-nowrap text-cap-1-demi">Join Community</p>
        </Button>
      </div>
      <Swiper
        width={videoWidth * 0.8}
        className="aspect-reel h-full"
        style={{ width: videoWidth }}
        mousewheel
        modules={[Mousewheel]}
        direction="vertical"
        centeredSlides
        slidesPerView={ratio}
        centeredSlidesBounds
        spaceBetween={8}
        onActiveIndexChange={(swiper) => {
          const activeIndex = swiper.activeIndex
          setActiveVideoId(videos[activeIndex].video.id)
          if (videos.length !== 0 && activeIndex >= videos.length - 3 && !isFetchingNextPage) {
            void fetchNextPage()
          }
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
              {({ isActive }) => {
                return <EmbedPlayer isFirstElement={index === 0} videoData={item} loop={false} isActive={isActive} />
              }}
            </SwiperSlide>
          )
        })}
      </Swiper>
    </div>
  )
}
