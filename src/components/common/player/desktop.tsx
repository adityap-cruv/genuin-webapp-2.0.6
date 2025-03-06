'use client'
import { useCallback, useEffect, type DetailedHTMLProps, type VideoHTMLAttributes } from 'react'
import { usePlayerControlStore } from './player-control-store'
import { useCommentStore } from '../comments/store'
import { useGenuinOptions } from '@lib/stores/genuin-options'
import { ControlLayer } from './control-layer'
import { InnerPlayer } from './inner-player'
import { useShallow } from 'zustand/react/shallow'
import { getWebpUrlForImage } from '@/lib/utils'

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
    slug: string
    clickableUrl: string | null
    commentCount?: number
  }
  isActive: boolean
  /**
   * Controls whether video should repeat or not.
   * default: false
   */
  loop?: boolean
  isInModal?: boolean
} & DetailedHTMLProps<VideoHTMLAttributes<HTMLVideoElement>, HTMLVideoElement>

export function Desktop({ videoData, loop = false, isActive, isInModal, ...restProps }: DesktopProps) {
  const hasFocus = useGenuinOptions(useShallow((state) => ({ userHasFocus: state.userHasFocus }))).userHasFocus
  const { setShouldPlay, stateShouldPlay } = usePlayerControlStore(
    useShallow((state) => ({
      setShouldPlay: state.setShouldPlay,
      stateShouldPlay: state.shouldPlay,
    }))
  )
  const { activeComment, setActiveComment } = useCommentStore(
    useShallow((state) => ({
      activeComment: state.activeCommentIndex,
      setActiveComment: state.setActiveCommentIndex,
    }))
  )

  useEffect(() => {
    setShouldPlay(activeComment === '')
  }, [activeComment])

  useEffect(() => {
    hasFocus ? setShouldPlay(activeComment === '') : setShouldPlay(false)
  }, [hasFocus])

  const handleOnClick = useCallback(
    (e: any) => {
      if (!stateShouldPlay) {
        setActiveComment('')
      }
      setShouldPlay(!stateShouldPlay)
    },
    [stateShouldPlay]
  )

  return (
    <div className="relative h-full overflow-hidden" onClick={handleOnClick}>
      <InnerPlayer
        isActive={isActive}
        id={videoData.id}
        loop={loop}
        videoSource={videoData.source}
        poster={getWebpUrlForImage(videoData.thumbnail)}
        {...restProps}
      />
      <div className="absolute left-0 top-0 h-full w-full">
        <ControlLayer.desktop
          shareUrl={videoData.shareUrl}
          sparkCount={videoData.sparkCount}
          videoId={videoData.id}
          videoSlug={videoData.slug}
          attachedLink={videoData.attachedLink}
          description={videoData.description}
          isSparked={videoData.isSparked}
          isInModal={isInModal}
          clickableUrl={videoData.clickableUrl}
          commentCount={videoData.commentCount}
        />
      </div>
    </div>
  )
}
