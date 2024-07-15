'use client'
import dynamic from 'next/dynamic'
import { Loader } from '@components/ui/loader'
import { useEffect } from 'react'
import { usePlayerControlStore } from './player-control-store'
import { useCommentStore } from '../comments/store'
import { useGenuinOptions } from '@lib/stores/genuin-options'
import { ControlLayer } from './control-layer'

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

type DesktopProps = {
  videoData: {
    isSparked?: boolean | null | undefined
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
  // sizeBox: VideoSizeBoxType
  /**
   * If it is enabled video will play if only if video is in viewport.
   */
  playIfInViewPort?: boolean
  /**
   * Default is true, if you want to remove backgroundblur than make it false
   */
  // shouldShowBackgroundBlurImage?: boolean
  /**
   * If you are playing reels in list and you want first video to play automatically and next
   * video will be playing once it is in viewport.
   * defaults to false.
   */
  isFirstPlayerInList?: boolean
}

export function Desktop({
  videoData,
  loop = false,
  shouldPlay = true,
  playIfInViewPort,
  isFirstPlayerInList = false,
}: DesktopProps) {
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
    <div
      className="relative h-full overflow-hidden"
      onClick={(e) => {
        if (!stateShouldPlay) {
          setActiveComment('')
        }
        setShouldPlay(!stateShouldPlay)
      }}>
      {playIfInViewPort ? (
        <ViewportPlayer
          id={videoData.id}
          videoSource={videoData.source}
          poster={videoData.thumbnail}
          isFirstElement={isFirstPlayerInList}
          loop={loop}
        />
      ) : (
        <InnerPlayer id={videoData.id} loop={loop} videoSource={videoData.source} poster={videoData.thumbnail} />
      )}
      <div className="absolute left-0 top-0 h-full w-full">
        <ControlLayer.desktop
          shareUrl={videoData.shareUrl}
          sparkCount={videoData.sparkCount}
          videoId={videoData.id}
          attachedLink={videoData.attachedLink}
          description={videoData.description}
          isSparked={videoData.isSparked}
        />
      </div>
    </div>
  )
}
