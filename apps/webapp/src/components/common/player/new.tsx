import { useCallback, useEffect, type ComponentProps } from 'react'
import { InnerPlayer } from './inner-player'
import { getWebpUrlForImage } from '@/lib/utils'
import { type VideoPlayerModalType } from '@/lib/schemas/player/video'
import { ControlLayer } from './control-layer/new'
import { usePlayerControlStore } from './player-control-store'
import { useShallow } from 'zustand/react/shallow'
import { useCommentStore } from '../comments/store'
import { useGenuinOptions } from '@/lib/stores/genuin-options'
import { getVideoPlayerConfigs } from './utils'
import { PlayerProvider } from './context'

type PlayerProps = {
  videoDetails: VideoPlayerModalType
  isActive: boolean
  /**
   * Controls whether video should repeat or not.
   * default: false
   */
  loop?: boolean
  isInModal?: boolean
  currentIndex?: number
} & ComponentProps<'video'>

export function NewPlayer({ videoDetails, isActive, isInModal, currentIndex, ...restProps }: PlayerProps) {
  // const hasFocus = useGenuinOptions(useShallow((state) => ({ userHasFocus: state.userHasFocus }))).userHasFocus
  const { playerConfigs, hasFocus } = useGenuinOptions(
    useShallow((state) => ({
      playerConfigs: getVideoPlayerConfigs(state.config.web_configs),
      hasFocus: state.userHasFocus,
    }))
  )
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
    // If autoplay is enabled, set shouldPlay to true
    if (!playerConfigs.autoplay) return
    setShouldPlay(activeComment === '')
  }, [activeComment, playerConfigs.autoplay])

  useEffect(() => {
    // If autoplay is enabled, set shouldPlay to true
    if (!playerConfigs.autoplay) return
    hasFocus ? setShouldPlay(activeComment === '') : setShouldPlay(false)
  }, [hasFocus, playerConfigs.autoplay])

  const handleOnClick = useCallback(
    (e: any) => {
      if (!stateShouldPlay) {
        setActiveComment('')
      }
      setShouldPlay(!stateShouldPlay)
    },
    [stateShouldPlay, setActiveComment]
  )

  return (
    <PlayerProvider videoId={videoDetails.video.id}>
      <div className="relative h-full w-full overflow-clip">
        <InnerPlayer
          isActive={isActive}
          id={videoDetails.video.id}
          videoSource={videoDetails.video.source}
          poster={getWebpUrlForImage(videoDetails.video.thumbnail)}
          onClick={handleOnClick}
          {...restProps}
        />
        <ControlLayer videoDetails={videoDetails} isActive={isActive} />
      </div>
    </PlayerProvider>
  )
}
