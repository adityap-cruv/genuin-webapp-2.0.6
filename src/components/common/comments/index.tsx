import { useMotionValueEvent, useScroll } from 'framer-motion'
import { getVideosComments } from '@lib/api/loop'
import { Loader } from '@components/ui/loader'
import { type CommentListType, type CommentType } from '@lib/schemas/loop/comment'
import { CommentItem } from './comment-item'
import { useCallback, useMemo, useRef } from 'react'
import { CommentIcon } from '@icons/comment-icon'
import { getQueryKeyForVideoComments } from '@/lib/utils/keys'
import { queryClient } from '@/components/providers/query-client-provider'

export const Comments = {
  withApi: WithApi,
  withoutApi: WithoutApi,
}

type Props = {
  videoId: string
  slug: string
  videoShareUrl: string
}

/**
 * This function will update data in queryClient
 * @param id
 * @param isReacted
 */
export const updateCommentReactionData = (videoId: string, commentId: string, isReacted: boolean) => {
  type QueryDataType = ReturnType<typeof getVideosComments>['data']

  queryClient.setQueryData(getQueryKeyForVideoComments(videoId), (oldData: QueryDataType) => {
    if (!oldData) return
    return {
      ...oldData,
      pages: oldData?.pages.map((page) => {
        return {
          ...page,
          comments: page.comments.map((comment) => {
            if (comment.comment_id === commentId)
              return {
                ...comment,
                no_of_sparks: isReacted ? comment.no_of_sparks + 1 : comment.no_of_sparks - 1,
                is_sparked: isReacted,
              }
            return comment
          }),
        }
      }),
    }
  })
}

function WithApi({ videoId, slug, videoShareUrl }: Props) {
  const { isLoading, data: commentsData, isError, isFetchingNextPage, fetchNextPage } = getVideosComments(videoId)

  const comments = useMemo(() => commentsData?.pages.flatMap((page) => page.comments), [commentsData])

  const handleCommentReactionChange = useCallback((commentId: string, isReacted: boolean) => {
    updateCommentReactionData(videoId, commentId, isReacted)
  }, [])

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader size="md" />
      </div>
    )
  }

  if (isError || !comments || comments.length === 0) return <NoComments />

  return (
    <div className="h-full">
      <CommentList
        videoShareUrl={videoShareUrl}
        slug={slug}
        comments={comments}
        isFetchingNextPage={isFetchingNextPage}
        fetchNextPage={fetchNextPage}
        onCommentReactionChange={handleCommentReactionChange}
      />
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
  videoId: string
  videoShareUrl: string
  slug: string
  onCommentReactionChange: (id: string, isReacted: boolean) => void
}

type CommentListProps = {
  comments: CommentListType
  isFetchingNextPage: boolean
  fetchNextPage: any
  videoShareUrl: string
  slug: string
  onCommentReactionChange: (id: string, isReacted: boolean) => void
}

function CommentList({
  comments,
  slug,
  isFetchingNextPage,
  fetchNextPage,
  videoShareUrl,
  onCommentReactionChange,
}: CommentListProps) {
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
        return (
          <CommentItem
            key={index}
            comment={comment}
            slug={slug}
            videoShareUrl={videoShareUrl}
            onCommentReactionChange={(isReacted) => {
              onCommentReactionChange(comment.comment_id, isReacted)
            }}
          />
        )
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
function WithoutApi({ comments, slug, videoShareUrl, onCommentReactionChange }: WithoutApiProps) {
  return (
    <>
      {comments.map((item, index) => (
        <CommentItem
          key={index}
          comment={item}
          slug={slug}
          videoShareUrl={videoShareUrl}
          onCommentReactionChange={(isReacted) => {
            onCommentReactionChange(item.comment_id, isReacted)
          }}
        />
      ))}
    </>
  )
}

export function NoComments() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center py-10">
      <CommentIcon className="fill-tertiary" />
      <p className="mt-2 text-title-2-bold">No comments yet</p>
      <p className="text-body-1-demi">Be the first one to comment</p>
    </div>
  )
}
