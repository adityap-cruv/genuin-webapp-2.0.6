'use client'
import dynamic from 'next/dynamic'
import { Loader } from '@components/ui/loader'
import { useEffect, useRef } from 'react'
import { usePlayerControlStore } from './player-control-store'
import { useCommentStore } from '../comments/store'
import { useGenuinOptions, type VideoSizeBoxType } from '@lib/stores/genuin-options'
import { ControlLayer } from './control-layer'
import { type VideoPlayerModalType } from '@lib/schemas/player/video'

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

export const Player = {
  mobile: Mobile,
  desktop: Desktop,
}

type MobileProps = {
  videoDetails: VideoPlayerModalType
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
  videoDetails,
  shouldPlay = true,
  loop = false,
  playIfInViewPort,
  shouldShowBackgroundBlurImage = true,
  isFirstPlayerInList = false,
}: Omit<MobileProps, 'sizeBox'>) {
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
  // TODO: If community or loop is private than it will show access denied from api.
  // if (videoData && (videoData.community.private || videoData.loop.private))
  //   return (
  //     <div className="w-ful flex h-full flex-col items-center justify-center gap-y-4 bg-new-off-black">
  //       <LockIcon className="stroke-new-off-white" />
  //       <p className="text-center text-body-1-demi text-new-off-white">
  //         {videoData?.community.private ? (
  //           <span>This Loop is visible to its Collaborators only</span>
  //         ) : (
  //           <span>
  //             This Loop is visible to its Community
  //             <br /> Members only
  //           </span>
  //         )}
  //       </p>
  //     </div>
  //   )

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
            videoSource={videoDetails.video.source}
            poster={videoDetails.video.thumbnail}
            isFirstElement={isFirstPlayerInList}
            loop={loop}
          />
        ) : (
          <InnerPlayer loop={loop} videoSource={videoDetails.video.source} poster={videoDetails.video.thumbnail} />
        )}
        <div className="absolute left-0 top-0 h-full w-full">
          <ControlLayer.mobile
            commentCount={videoDetails.video.commentCount}
            owner={{ ...videoDetails.owner }}
            shareUrl={videoDetails.video.shareUrl}
            slug={videoDetails.video.slug}
            sparkCount={videoDetails.video.sparkCount}
            videoId={videoDetails.video.id}
            attachedLink={videoDetails.video.attachedLink}
            description={videoDetails.video.description}
          />
        </div>
        <CommentSheet videoId={videoDetails.video.id} commentCount={videoDetails.video.commentCount} />
        <div className="absolute bottom-0 h-48 w-full bg-gradient-to-t from-[#111111b3] to-[#11111100]"></div>
      </div>
    </div>
  )
}

type DesktopProps = {
  videoData: {
    source: string
    thumbnail: string
    shareUrl: string
    attachedLink?: string | null
    id: string
    description?: string | null
    sparkCount: number
  }
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
  videoData,
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

  // if (videoData?.community.private || videoData?.loop.private)
  //   return (
  //     <div className="w-ful flex h-full flex-col items-center justify-center gap-y-4 bg-monochrome-9">
  //       <LockIcon className="stroke-secondary" />
  //       <p className="text-center text-body-1-demi">
  //         {videoData?.community.private ? (
  //           <span>This Loop is visible to its Collaborators only</span>
  //         ) : (
  //           <span>
  //             This Loop is visible to its Community
  //             <br /> Members only
  //           </span>
  //         )}
  //       </p>
  //     </div>
  //   )

  return (
    <div className="relative flex h-full w-full snap-start items-center justify-center overflow-clip">
      {shouldShowBackgroundBlurImage && (
        <div
          className="absolute inset-0 z-0 h-full w-full bg-secondary bg-cover bg-center bg-no-repeat blur-2xl"
          style={{ backgroundImage: `url(${videoData.thumbnail})` }}
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
            videoSource={videoData.source}
            poster={videoData.thumbnail}
            isFirstElement={isFirstPlayerInList}
            loop={loop}
          />
        ) : (
          <InnerPlayer loop={loop} videoSource={videoData.source} poster={videoData.thumbnail} />
        )}
        <div className="absolute left-0 top-0 h-full w-full">
          <ControlLayer.desktop
            shareUrl={videoData.shareUrl}
            sparkCount={videoData.sparkCount}
            videoId={videoData.id}
            attachedLink={videoData.attachedLink}
            description={videoData.description}
          />
        </div>
      </div>
    </div>
  )
}
