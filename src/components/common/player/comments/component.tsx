import { Button } from '@components/ui/button'
import Image from 'next/image'
import icComment from '@icons/icCommentSecondary.svg'
import { CommentSheet, CommentSheetContent, CommentSheetPortal } from '@components/custom/comment-sheet'
import { X } from 'lucide-react'
import { usePlayerControlStore } from '../player-control-store'
import { useEffect } from 'react'
import { useCommentsStore } from './store'
import { useResponsive } from '@hooks/useResponsive'
import { getLoopVideoComments } from '@lib/api/loop'
import { Loader } from '@components/ui/loader'
import { type CommentType } from '@lib/schemas/loop/comment'
import { CustomAvatar } from '@components/custom/custom-avatar'
import dynamic from 'next/dynamic'
const CommentPlayer = dynamic(async () => await import('./video-player').then((comp) => comp.CommentPlayer))
const AudioPlayer = dynamic(async () => await import('./audio-player').then((comp) => comp.AudioPlayer))

type Props = {
  container: React.MutableRefObject<HTMLDivElement | null>
  videoId: string
}

export function Comments({ container, videoId }: Props) {
  const { isOpen, close, currentVideoId } = useCommentsStore((state) => ({
    isOpen: state.modalIsOpen,
    close: state.closeModal,
    currentVideoId: state.currentVideoId,
  }))
  const { pauseVideo, playVideo } = usePlayerControlStore((state) => ({
    pauseVideo: state.pause,
    playVideo: state.play,
  }))
  // todo find better solution then this
  const { isSm } = useResponsive()
  const shouldOpen = isOpen && currentVideoId === videoId

  useEffect(() => {
    if (shouldOpen) {
      document.getElementById('reel-list')?.classList.add('!overflow-y-hidden')
      pauseVideo()
    } else {
      document.getElementById('reel-list')?.classList.remove('!overflow-y-hidden')
      playVideo()
    }
  }, [shouldOpen])

  return (
    <CommentSheet open={shouldOpen} modal={false}>
      <CommentSheetPortal container={container.current}>
        <CommentSheetContent
          side={isSm ? 'right' : 'bottom'}
          onInteractOutside={() => {
            close()
          }}>
          <div className="h-full w-full rounded-t-[18px] bg-background sm:rounded-t-none">
            <div className="flex w-full items-center justify-between p-3">
              <p className="text-title-lg">Comments</p>
              <X
                className="h-6 w-6 cursor-pointer stroke-secondary"
                onClick={() => {
                  close()
                }}
              />
            </div>
            <CommentBody videoId={videoId} />
          </div>
        </CommentSheetContent>
      </CommentSheetPortal>
    </CommentSheet>
  )
}

type CommentBodyType = {
  videoId: string
}
function CommentBody({ videoId }: CommentBodyType) {
  const { isLoading, data: comments, isError } = getLoopVideoComments(videoId)
  if (isLoading) {
    return <Loader size="md" />
  }
  if (isError) {
    throw new Error('Something went wrong!')
  }
  if (comments.length === 0) return <NoComments />
  return (
    <div className="hide-scrollbar flex h-body flex-col gap-y-4 overflow-auto px-4">
      {comments.map((comment, index) => {
        return <CommentItem key={index} comment={comment} />
      })}
    </div>
  )
}

function CommentItem({ comment }: { comment: CommentType }) {
  const UI = Comment[comment.comment.type]

  return (
    <div className="flex items-start gap-x-2">
      <CustomAvatar
        className="bg-slate-500 h-6 w-6 bg-red-40"
        fallbackString={comment?.owner.nickname}
        imageUrl={comment.owner?.profile_image}
        isAvatar={comment.owner.is_avatar}
      />
      <div className="flex flex-col items-start gap-y-2">
        <p className="text-title-md">@{comment.owner.nickname}</p>
        <UI comment={comment} />
      </div>
    </div>
  )
}

const Comment = {
  video({ comment }: { comment: CommentType }) {
    const setActiveCommentIndex = useCommentsStore((state) => state.setActiveCommentIndex)
    const activeCommentIndex = useCommentsStore((state) => state.activeCommentIndex)

    if (comment)
      return (
        <CommentPlayer
          videoSource={comment.comment.url ?? ''}
          poster={comment.comment.thumbnail ?? ''}
          commentShareString={comment.comment.share_string}
          onClick={() => {
            if (activeCommentIndex === comment.comment.share_string) {
              // if activeCommentIndex and share_string same than it will pause the video.
              setActiveCommentIndex('')
            } else {
              setActiveCommentIndex(comment.comment.share_string)
            }
          }}
        />
      )
  },
  audio({ comment }: { comment: CommentType }) {
    const setActiveCommentIndex = useCommentsStore((state) => state.setActiveCommentIndex)
    const activeCommentIndex = useCommentsStore((state) => state.activeCommentIndex)
    return (
      <AudioPlayer
        commentShareString={comment.comment.share_string}
        url={comment.comment.url ?? ''}
        waveWidth={170}
        waveHeight={50}
        pipeWidth={5}
        gapWidth={2}
        onClick={() => {
          if (activeCommentIndex === comment.comment.share_string) {
            setActiveCommentIndex('')
          } else {
            setActiveCommentIndex(comment.comment.share_string)
          }
        }}
      />
    )
  },
  text({ comment }: any) {
    return <p className="text-body-sm">{comment.comment.text}</p>
  },
}

function NoComments() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center">
      <Image src={icComment} alt="comment!" />
      <p className="mt-2 text-title-lg">No comments yet</p>
      <p className="text-body-lg">Be the first one to comment</p>
      <Button className="mt-2">
        <p className="m-2 text-title-lg text-monochrome-white">Get app to Comment</p>
      </Button>
    </div>
  )
}
