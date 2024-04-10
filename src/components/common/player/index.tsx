'use client'
import dynamic from 'next/dynamic'
import { Loader } from '@components/ui/loader'
import { type VideoDataType } from '@lib/schemas/video'
import { useEffect, useRef } from 'react'
import { usePlayerControlStore } from './player-control-store'
import { useCommentStore } from '../comments/store'
import { LockIcon } from '@icons/LockIcon'
import { useGenuinOptions, type VideoSizeBoxType } from '@lib/stores/genuin-options'

const CommentSheet = dynamic(async () => await import('./comment-sheet').then((comp) => comp.CommentSheet))
const InnerPlayer = dynamic(async () => await import('./inner-player').then((comp) => comp.InnerPlayer), {
  loading: (_) => {
    return <Loader size="lg" />
  },
})
const ViewportPlayer = dynamic(async () => await import('./inner-player').then((comp) => comp.ViewportPlayer), {
  loading: (_) => {
    return <Loader size="lg" />
  },
})
const MobileControlLayer = dynamic(async () => await import('./control-layer').then((comp) => comp.ControlLayer.mobile))
const DesktopControlLayer = dynamic(
  async () => await import('./control-layer').then((comp) => comp.ControlLayer.desktop)
)

export const Player = {
  mobile: Mobile,
  desktop: Desktop,
}

type Props = {
  videoData: VideoDataType
  /**
   * This field is very mandatory if you want play to stop after rendering
   * then pass false value. Otherwise it will start playing video automatically.
   */
  shouldPlay: boolean
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
   * Sizebox is mandatory. To get sizebox see hooke useVideoSizeBox.
   * Tip: Please don't render withour sizebox
   */
  sizeBox: VideoSizeBoxType
  /**
   * If it is enabled video will play if only if video is in viewport.
   */
  playIfInViewPort?: boolean
  /**
   * Default is true, if you want to remove backgroundblur than make it false
   */
  shouldShowBackgroundBlurImage?: boolean
  /**
   * If you are playing reels in list and you want first video to play automatically and next
   * video will be playing once it is in viewport.
   * defaults to false.
   */
  isFirstPlayerInList?: boolean
}

function Mobile({
  videoData,
  shouldPlay = true,
  loop = false,
  playIfInViewPort,
  shouldShowBackgroundBlurImage = true,
  isFirstPlayerInList = false,
}: Omit<Props, 'sizeBox'>) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const sizeBox = useGenuinOptions().sizeBoxes.default
  const hasFocus = useGenuinOptions().userHasFocus
  const { setShouldPlay, toggleShouldPlay } = usePlayerControlStore((state) => ({
    setShouldPlay: state.setShouldPlay,
    toggleShouldPlay: state.toggleShouldPlay,
  }))

  useEffect(() => {
    setShouldPlay(shouldPlay)
  }, [shouldPlay])

  useEffect(() => {
    hasFocus ? setShouldPlay(shouldPlay) : setShouldPlay(false)
  }, [hasFocus])

  if (videoData && (videoData.community.private || videoData.loop.private))
    return (
      <div className="w-ful flex h-full flex-col items-center justify-center gap-y-4 bg-new-off-black">
        <LockIcon className="stroke-new-off-white" />
        <p className="text-center text-body-1-demi text-new-off-white">
          {videoData?.community.private ? (
            <span>This Loop is visible to its Collaborators only</span>
          ) : (
            <span>
              This Loop is visible to its Community
              <br /> Members only
            </span>
          )}
        </p>
      </div>
    )

  if (videoData?.video) {
    return (
      <div
        onClick={(e) => {
          toggleShouldPlay()
        }}
        style={{ backgroundImage: `url(${videoData.video.thumbnail})` }}
        className="relative flex h-full w-full snap-start items-center justify-center overflow-clip bg-cover bg-center bg-no-repeat">
        <div className="absolute top-0 z-10 h-24 w-full bg-gradient-to-b from-[#111111b3] to-[#11111100]"></div>
        <div
          ref={containerRef}
          className="relative overflow-hidden"
          style={{ width: sizeBox.width, height: sizeBox.height }}>
          {playIfInViewPort ? (
            <ViewportPlayer
              videoSource={videoData.video.url}
              poster={videoData.video.thumbnail}
              isFirstElement={isFirstPlayerInList}
              loop={loop}
            />
          ) : (
            <InnerPlayer loop={loop} videoSource={videoData.video.url} poster={videoData.video.thumbnail} />
          )}
          <div className="absolute left-0 top-0 h-full w-full">
            <MobileControlLayer videoData={videoData} />
          </div>
          <CommentSheet
            container={containerRef}
            videoDetails={videoData}
            noOfComments={videoData.video.no_of_comments ?? 0}
          />
          <div className="absolute bottom-0 h-48 w-full bg-gradient-to-t from-[#111111b3] to-[#11111100]"></div>
        </div>
      </div>
    )
  }
}

type DesktopProps = {
  videoData: VideoDataType
  /**
   * This field is very mandatory if you want play to stop after rendering
   * then pass false value. Otherwise it will start playing video automatically.
   */
  shouldPlay: boolean
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
   * Sizebox is mandatory. To get sizebox see hooke useVideoSizeBox.
   * Tip: Please don't render withour sizebox
   */
  sizeBox: VideoSizeBoxType
  /**
   * If it is enabled video will play if only if video is in viewport.
   */
  playIfInViewPort?: boolean
  /**
   * Default is true, if you want to remove backgroundblur than make it false
   */
  shouldShowBackgroundBlurImage?: boolean
  /**
   * If you are playing reels in list and you want first video to play automatically and next
   * video will be playing once it is in viewport.
   * defaults to false.
   */
  isFirstPlayerInList?: boolean
}

function Desktop({
  // videoData,
  loop = false,
  shouldPlay = true,
  sizeBox,
  playIfInViewPort,
  shouldShowBackgroundBlurImage = true,
  isFirstPlayerInList = false,
}: DesktopProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const hasFocus = useGenuinOptions().userHasFocus
  const { setShouldPlay, stateShouldPlay } = usePlayerControlStore((state) => ({
    setShouldPlay: state.setShouldPlay,
    stateShouldPlay: state.shouldPlay,
  }))
  const { activeComment, setActiveComment } = useCommentStore((state) => ({
    activeComment: state.activeCommentIndex,
    setActiveComment: state.setActiveCommentIndex,
  }))

  useEffect(() => {
    setShouldPlay(shouldPlay)
  }, [shouldPlay])

  useEffect(() => {
    setShouldPlay(activeComment === '')
  }, [activeComment])

  useEffect(() => {
    hasFocus ? setShouldPlay(shouldPlay && activeComment === '') : setShouldPlay(false)
  }, [hasFocus])

  if (videoData?.community.private || videoData?.loop.private)
    return (
      <div className="w-ful flex h-full flex-col items-center justify-center gap-y-4 bg-monochrome-9">
        <LockIcon className="stroke-secondary" />
        <p className="text-center text-body-1-demi">
          {videoData?.community.private ? (
            <span>This Loop is visible to its Collaborators only</span>
          ) : (
            <span>
              This Loop is visible to its Community
              <br /> Members only
            </span>
          )}
        </p>
      </div>
    )

  if (videoData?.video) {
    return (
      <div className="relative flex h-full w-full snap-start items-center justify-center overflow-clip">
        {shouldShowBackgroundBlurImage && (
          <div
            className="absolute inset-0 z-0 h-full w-full bg-secondary bg-cover bg-center bg-no-repeat blur-2xl"
            style={{ backgroundImage: `url(${videoData.video.thumbnail})` }}
          />
        )}
        <div
          ref={containerRef}
          className="relative overflow-hidden"
          onClick={(e) => {
            if (!stateShouldPlay) {
              setActiveComment('')
            }
            setShouldPlay(!stateShouldPlay)
          }}
          style={{ ...sizeBox }}>
          {playIfInViewPort ? (
            <ViewportPlayer
              videoSource={videoData.video.url}
              poster={videoData.video.thumbnail}
              isFirstElement={isFirstPlayerInList}
              loop={loop}
            />
          ) : (
            <InnerPlayer loop={loop} videoSource={videoData.video.url} poster={videoData.video.thumbnail} />
          )}
          <div className="absolute left-0 top-0 h-full w-full">
            <DesktopControlLayer videoData={videoData} />
          </div>
        </div>
      </div>
    )
  }
}
