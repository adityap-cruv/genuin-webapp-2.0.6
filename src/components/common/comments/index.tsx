import { useMotionValueEvent, useScroll } from 'framer-motion'
import { ReadMore } from '@components/common/read-more'
import { getLoopVideoComments } from '@lib/api/loop'
import { Loader } from '@components/ui/loader'
import { type CommentListType, type CommentType } from '@lib/schemas/loop/comment'
import { CustomAvatar } from '@components/custom/custom-avatar'
import dynamic from 'next/dynamic'
import { Button } from '@components/ui/button'
import Image from 'next/image'
import icComment from '@icons/icCommentSecondary.svg'
import { useRef } from 'react'
import { useCommentStore } from './store'
const CommentPlayer = dynamic(async () => await import('./video-player').then((comp) => comp.CommentPlayer))
const AudioPlayer = dynamic(async () => await import('./audio-player').then((comp) => comp.AudioPlayer))

export function Comments({ videoId }: { videoId: string }) {
  const { isLoading, data, isError, isFetchingNextPage, fetchNextPage } = getLoopVideoComments(videoId)
  const comments = data?.pages.flatMap((item) => {
    return item.comments
  })

  if (isLoading) {
    return <Loader size="md" />
  }
  if (isError) {
    throw new Error('Something went wrong!')
  }
  if (comments?.length === 0) return <NoComments />
  return (
    <div className="h-full">
      {comments && (
        <CommentList comments={comments} isFetchingNextPage={isFetchingNextPage} fetchNextPage={fetchNextPage} />
      )}
    </div>
  )
}

type CommentListProps = {
  comments: CommentListType
  isFetchingNextPage: boolean
  fetchNextPage: any
}

function CommentList({ comments, isFetchingNextPage, fetchNextPage }: CommentListProps) {
  const scrollDivRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ container: scrollDivRef, layoutEffect: false })

  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    if (Number(latest.toFixed(1)) > 0.8 && !isFetchingNextPage) {
      void fetchNextPage()
    }
  })
  return (
    <div ref={scrollDivRef} className="h-full overflow-x-clip overflow-y-scroll px-4">
      {comments.map((comment, index) => {
        return <CommentItem key={index} comment={comment} />
      })}
      {isFetchingNextPage && <Loader className="h-40 w-full" size="md" />}
    </div>
  )
}

function CommentItem({ comment }: { comment: CommentType }) {
  const UI = Comment[comment.comment.type]
  return (
    <div className="flex items-start gap-x-2 py-2">
      <CustomAvatar
        className="bg-slate-500 h-6 w-6 bg-red-40"
        fallbackString={comment?.owner.nickname}
        imageUrl={comment.owner?.profile_image}
        isAvatar={comment.owner.is_avatar}
      />
      <div className="flex w-full flex-col items-start gap-y-1">
        <p className="text-title-md">@{comment.owner.nickname}</p>
        <UI comment={comment} />
      </div>
    </div>
  )
}

const Comment = {
  video({ comment }: { comment: CommentType }) {
    const setActiveCommentIndex = useCommentStore((state) => state.setActiveCommentIndex)
    const activeCommentIndex = useCommentStore((state) => state.activeCommentIndex)
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
    const setActiveCommentIndex = useCommentStore((state) => state.setActiveCommentIndex)
    const activeCommentIndex = useCommentStore((state) => state.activeCommentIndex)
    return (
      <AudioPlayer
        commentShareString={comment.comment.share_string}
        url={comment.comment.url ?? ''}
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
    return <ReadMore className="text-body-sm" text={comment.comment.text} />
  },
}

function NoComments() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center">
      <Image src={icComment} alt="comment!" />
      <p className="mt-2 text-title-lg">No comments yet</p>
      <p className="text-body-lg">Be the first one to comment</p>
      <Button className="mt-2" size="custom">
        <p className="text-title-lg text-monochrome-white">Get app to Comment</p>
      </Button>
    </div>
  )
}
