import { BasePlayer } from '../player/base'
import { useBaseContext } from '@/context/base'
import { AudioCommentPlayer } from '../full-screen-modal/audio-player'
import { useCommentContext } from '@/context/comment'
import { PlayIcon } from '../icons/play-icon'

export const Content = { video: VideoCommentPlayer, audio: AudioCommentPlayer }

type VideoCommentPlayerPropsType = {
  id: string
  src: string
  thumbnail: string
}

function VideoCommentPlayer({
  id,
  src,
  thumbnail,
}: VideoCommentPlayerPropsType) {
  const { activeCommentId, pauseComment, playComment } = useCommentContext()
  const { muted, shouldPlay } = useBaseContext()
  const commentShouldPlay = shouldPlay === 'COMMENT' && activeCommentId === id

  return (
    <div
      className='relative aspect-square w-2/5 rounded-lg overflow-clip'
      onClick={
        commentShouldPlay
          ? pauseComment
          : () => {
              playComment(id)
            }
      }>
      <BasePlayer
        id={getCommentPlayerId(id)}
        shouldPlay={commentShouldPlay}
        src={src}
        muted={muted}
        poster={thumbnail}
        loop
        triggerAnalytics={false}
      />
      {!commentShouldPlay && (
        <div className='flex items-center justify-center absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-2 bg-black/60 rounded-full'>
          <PlayIcon
            height={20}
            width={20}
            className='h-5 w-5'
          />
        </div>
      )}
    </div>
  )
}

function getCommentPlayerId(id: string) {
  return '__gen__sdk__comment__player__' + id
}
