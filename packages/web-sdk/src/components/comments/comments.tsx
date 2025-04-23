import { useCallback, useEffect, useId, useMemo } from 'react'
import { getComments } from './api'
import { CommentIcon } from '../icons/comment-icon'
import { type QueryKey } from '@tanstack/react-query'
import { queryClient } from '@/context/react-query'
import { getQueryKeyForVideoComments } from '@/utils/constants/keys'
import { CommentItem, CommentItemShimmer } from './item'

type CommentsPropsType = { videoId: string; shareUrl: string }

function updateCommentReactionData(
  queryKey: QueryKey,
  commentId: string,
  isReacted: boolean,
) {
  type QueryDataType = ReturnType<typeof getComments>['data']
  queryClient.setQueryData(
    queryKey,
    (oldData: QueryDataType): QueryDataType => {
      if (!oldData) return
      return {
        ...oldData,
        pages: oldData?.pages.map((page) => {
          return {
            ...page,
            comments: page.comments.map((comment) => {
              if (comment.comment_id === commentId) {
                return {
                  ...comment,
                  is_sparked: isReacted,
                  no_of_sparks: isReacted
                    ? comment.no_of_sparks + 1
                    : comment.no_of_sparks - 1,
                }
              }
              return comment
            }),
          }
        }),
      }
    },
  )
}

export function Comments({ videoId, shareUrl }: CommentsPropsType) {
  const {
    data: commentsData,
    isLoading,
    isError,
    hasNextPage,
    fetchNextPage,
  } = getComments(videoId)

  const comments = useMemo(
    () => commentsData?.pages.flatMap((page) => page.comments),
    [commentsData],
  )

  const handleReactionChange = useCallback(
    (commentId: string, isReacted: boolean) => {
      updateCommentReactionData(
        getQueryKeyForVideoComments(videoId),
        commentId,
        isReacted,
      )
    },
    [videoId],
  )

  if (isLoading) {
    return (
      <div className='flex flex-col p-4 gap-3'>
        {Array.from({ length: 5 }).map((_, i) => {
          return <CommentItemShimmer key={i} />
        })}
      </div>
    )
  }

  if (isError || !comments) {
    return
  }

  if (comments.length === 0)
    return (
      <div className='overflow-visible h-full flex items-center justify-center'>
        <NoComments />
      </div>
    )

  return (
    <div className='p-4 overflow-visible last:pb-20'>
      {comments?.map((comment) => {
        return (
          <CommentItem
            key={comment.comment_id}
            commentDetails={comment}
            shareUrl={shareUrl}
            onReactionChange={handleReactionChange}
          />
        )
      })}
      {hasNextPage && <FetchNextOnEnd fetchNext={fetchNextPage} />}
    </div>
  )
}

function FetchNextOnEnd({ fetchNext }: { fetchNext: () => void }) {
  const id = useId()

  useEffect(() => {
    const element = document.getElementById(id)
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        fetchNext()
      }
    })

    if (element) {
      observer.observe(element)
    }

    return () => {
      if (element) observer.unobserve(element)
    }
  }, [fetchNext])

  return (
    <div
      id={id}
      style={{ height: 20, width: '100%' }}
    />
  )
}

function NoComments() {
  return (
    <div className='flex flex-col items-center justify-center'>
      <CommentIcon style={{ fill: 'var(--tertiary)' }} />
      <p className='mt-2 text-title-2-bold'>No comments yet</p>
      <p className='text-body-1-demi'>Be the first one to comment</p>
    </div>
  )
}
