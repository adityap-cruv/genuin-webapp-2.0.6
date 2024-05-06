import { useMotionValueEvent, useScroll } from 'framer-motion'
import { getVideosComments } from '@lib/api/loop'
import { Loader } from '@components/ui/loader'
import { type CommentListType, type CommentType } from '@lib/schemas/loop/comment'
import { CommentItem } from './comment-item'
import { useEffect, useRef } from 'react'
import { CommentIcon } from '@icons/comment-icon'

export const Comments = {
  withApi: WithApi,
  withoutApi: WithoutApi,
}

type Props = {
  videoId: string
  comments: CommentListType
  setComments: (comments: CommentListType) => void
}

function WithApi({ videoId, comments, setComments }: Props) {
  const { isLoading, data, isError, isFetchingNextPage, fetchNextPage } = getVideosComments(videoId)

  useEffect(() => {
    console.log('dat::', data)
    if (data) setComments(data.pages.flatMap((item) => item.comments))
  }, [data])

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader size="md" />
      </div>
    )
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

type WithoutApiProps = {
  comments: CommentType[]
  isLoading: boolean
  isError: boolean
  isFetchingNextPage: boolean
  fetchNextPage: () => void
  hasNextPage?: boolean
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
    <div ref={scrollDivRef} className="h-full overflow-x-clip overflow-y-scroll px-2 pb-20 sm:px-4">
      {comments.map((comment, index) => {
        return <CommentItem key={index} comment={comment} />
      })}
      {isFetchingNextPage && (
        <div className="flex w-full justify-center">
          <Loader size="md" />
        </div>
      )}
    </div>
  )
}

// without api component is only used in desktop-details.tsx.
function WithoutApi({ comments }: WithoutApiProps) {
  // if (comments.length === 0) return <NoComments />
  return (
    <>
      {comments.map((item, index) => (
        <CommentItem key={index} comment={item} />
      ))}
    </>
  )
}

export function NoComments() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center">
      <CommentIcon className="stroke-terfill-tertiary fill-tertiary" />
      <p className="mt-2 text-title-2-bold">No comments yet</p>
      <p className="text-body-1-demi">Be the first one to comment</p>
    </div>
  )
}
