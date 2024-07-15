'use client'
import dynamic from 'next/dynamic'
import { Loader } from '@components/ui/loader'
import { useEffect } from 'react'
import { usePlayerControlStore } from './player-control-store'
import { useGenuinOptions, type VideoSizeBoxType } from '@lib/stores/genuin-options'
import { ControlLayer } from './control-layer'
import { type VideoPlayerModalType } from '@lib/schemas/player/video'
import { useShallow } from 'zustand/react/shallow'

const CommentSheet = dynamic(async () => await import('./comment-sheet').then((comp) => comp.CommentSheet))

const InnerPlayer = dynamic(async () => await import('./inner-player').then((comp) => comp.InnerPlayer), {
  loading: (_) => {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader size="lg" />
      </div>
    )
  },
})

const ViewportPlayer = dynamic(async () => await import('./inner-player').then((comp) => comp.ViewportPlayer), {
  loading: (_) => {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader size="lg" />
      </div>
    )
  },
})

type MobileProps = {
  videoDetails: VideoPlayerModalType
  /**
   * This field is very mandatory if you want play to stop after rendering
   * then pass false value. Otherwise it will start playing video automatically.
   */
  shouldPlay: boolean
  /**
   * Swiper's active param.
   */
  isActive: boolean
  /**
   * Controls whether video should repeat or not.
   * default: false
   */
  loop?: boolean
  /**
   * default: true
   */
  // showControls?: boolean
  /**
   * Size-box is mandatory. To get size-box see hooke useVideoSizeBox.
   * Tip: Please don't render without size-box
   */
  sizeBox: VideoSizeBoxType
  /**
   * If it is enabled video will play if only if video is in viewport.
   */
  playIfInViewPort?: boolean
  /**
   * If you are playing reels in list and you want first video to play automatically and next
   * video will be playing once it is in viewport.
   * defaults to false.
   */
  isFirstPlayerInList?: boolean
  /**
   * Pass this parameter if you want to configure custom size box.
   */
  customSizeBox?: VideoSizeBoxType
}

export function Mobile({
  videoDetails,
  shouldPlay = true,
  isActive,
  loop = false,
  playIfInViewPort,
  isFirstPlayerInList = false,
  customSizeBox,
}: Omit<MobileProps, 'sizeBox'>) {
  const sizeBox =
    customSizeBox ?? useGenuinOptions(useShallow((state) => ({ sizeBoxes: state.sizeBoxes }))).sizeBoxes.default
  const hasFocus = useGenuinOptions(useShallow((state) => ({ userHasFocus: state.userHasFocus }))).userHasFocus
  const { setShouldPlay, toggleShouldPlay } = usePlayerControlStore(
    useShallow((state) => ({
      setShouldPlay: state.setShouldPlay,
      toggleShouldPlay: state.toggleShouldPlay,
    }))
  )

  useEffect(() => {
    setShouldPlay(shouldPlay)
  }, [shouldPlay])

  useEffect(() => {
    hasFocus ? setShouldPlay(shouldPlay) : setShouldPlay(false)
  }, [hasFocus])

  return (
    <div
      onClick={(e) => {
        toggleShouldPlay()
      }}
      style={{ backgroundImage: `url(${videoDetails.video.thumbnail})` }}
      className="relative flex h-full w-full snap-start items-center justify-center overflow-clip bg-cover bg-center bg-no-repeat">
      <div className="absolute top-0 z-10 h-24 w-full bg-gradient-to-b from-[#111111b3] to-[#11111100]"></div>
      <div className="relative overflow-hidden" style={{ width: sizeBox.width, height: sizeBox.height }}>
        {playIfInViewPort ? (
          <ViewportPlayer
            id={videoDetails.video.id}
            videoSource={videoDetails.video.source}
            poster={videoDetails.video.thumbnail}
            isFirstElement={isFirstPlayerInList}
            loop={loop}
          />
        ) : (
          <InnerPlayer
            id={videoDetails.video.id}
            loop={loop}
            videoSource={videoDetails.video.source}
            poster={videoDetails.video.thumbnail}
          />
        )}
        <div className="absolute left-0 top-0 h-full w-full">
          <ControlLayer.mobile
            isActive={isActive}
            linkoutId={videoDetails.video.linkoutId}
            commentCount={videoDetails.video.commentCount}
            owner={videoDetails.owner}
            shareUrl={videoDetails.video.shareUrl}
            slug={videoDetails.video.slug}
            sparkCount={videoDetails.video.sparkCount}
            videoId={videoDetails.video.id}
            attachedLink={videoDetails.video.attachedLink}
            descriptionArr={videoDetails.video.descriptionArr}
            descriptionText={videoDetails.video.descriptionText}
            isSparked={videoDetails.video.isSparked}
          />
        </div>
        <CommentSheet
          videoDetails={videoDetails}
          videoId={videoDetails.video.id}
          commentCount={videoDetails.video.commentCount}
        />
      </div>
    </div>
  )
}
