import React from 'react'
import { useBaseContext } from '@/context/base'
import { BasePlayer } from '../base'
import { FeedVideoType } from '@/type'
import { ControlLayer } from '../control-layer'

type FullScreenMobilePlayerPropsType = {
  id: string
  video: FeedVideoType
  index: number
  swiperRef: any
  /**
   * if there is a navbar than it should be true should add padding on top.
   * default is false
   */
  hasNavbar?: boolean
  shouldPlay: boolean
  onCommentCountChange?: (videoId: string, count: number) => void
  onSpark?: (videoId: string, isSparked: boolean) => void
}

export function FullScreenMobilePlayer({
  video,
  index,
  id,
  shouldPlay,
  onSpark,
  onCommentCountChange,
}: FullScreenMobilePlayerPropsType) {
  const {
    activeIndex,
    muted,

    setIsVideoPlaying,
    isVideoPlaying,
  } = useBaseContext()
  const playerShouldPlay = shouldPlay && isVideoPlaying && index === activeIndex

  return (
    <div className='h-full w-full relative'>
      <BasePlayer
        id={id}
        src={
          video.video.media_url_m3u8
            ? video.video.media_url_m3u8
            : video.video.media_url
        }
        shouldPlay={playerShouldPlay}
        muted={muted}
        poster={video.video.thumbnail_url}
        index={index}
        triggerAnalytics
      />
      <ControlLayer
        videoDetails={video}
        isVideoPlaying={isVideoPlaying}
        setIsVideoPlaying={setIsVideoPlaying}
        onSpark={onSpark}
        onCommentCountChange={onCommentCountChange}
        index={index}
      />
    </div>
  )
}
