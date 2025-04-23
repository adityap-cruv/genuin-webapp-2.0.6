import { checkAndAppendHttps, cn } from '@/utils'
import { useCallback, useContext, useId, useState } from 'react'
import { getComments, postComment } from './api'
import { BaseContext } from '@/context/base'
import { useAuth } from '@/context/auth'
import { AuthenticationModal } from '../authentication'
import { useBrandDetails } from '@/context/brand-details'
import { CommentDetailsType } from './schema'
import { queryClient } from '@/context/react-query'
import { getQueryKeyForVideoComments } from '@/utils/constants/keys'

type CommentInputBoxComponentPropsType = {
  link: string
  videoId: string
  loopId: string
}

function prependComment(commentData: CommentDetailsType, videoId: string) {
  type QueryDataType = ReturnType<typeof getComments>['data']
  queryClient.setQueryData(
    getQueryKeyForVideoComments(videoId),
    (oldData: QueryDataType): QueryDataType => {
      if (!oldData) return
      return {
        ...oldData,
        pages: oldData.pages.map((page, index) => {
          if (index === 0) {
            return { ...page, comments: [commentData, ...page.comments] }
          }
          return page
        }),
      }
    },
  )
}

export function CommentInputBox({
  link,
  videoId,
  loopId,
}: CommentInputBoxComponentPropsType) {
  const inputId = useId()
  const { customizations } = useContext(BaseContext)
  const { status } = useAuth()
  const { embedStyle } = useBrandDetails()

  const [commentInput, setCommentInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleOnClick = useCallback(() => {
    if (embedStyle === 'standard_wall') {
      if (status === 'authenticated') {
        return
      } else {
        AuthenticationModal.open()
      }
    } else {
      if (status === 'authenticated') {
        return
      }
      window.open(checkAndAppendHttps(link), '_blank')
    }
  }, [status, embedStyle])

  const handleCommentPost = useCallback(() => {
    const commentInputElement = document.getElementById(
      inputId,
    ) as HTMLInputElement
    const value = commentInputElement?.value.trim()
    if (value.length === 0 || !commentInputElement) return
    setIsLoading(true)
    postComment(videoId, loopId, value)
      .then(async (comment) => {
        if (comment) prependComment(comment, videoId)
      })
      .catch((e) => {
        console.log('error happened::', e)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [videoId, inputId])

  if (!customizations?.is_enable_engagement_tools) return

  return (
    <div
      onClick={handleOnClick}
      className='absolute bottom-0 left-0 z-10 bg-tertiary-200 w-full py-2 px-6 flex gap-6 items-center '>
      <input
        id={inputId}
        onChange={(e) => {
          setCommentInput(e.target.value.trim())
        }}
        disabled={status !== 'authenticated'}
        type='text'
        className={cn(
          'text-title-3-me bg-background rounded-[60px] w-full py-2 px-4 cursor-pointer border border-solid border-tertiary-200 ',
          status === 'authenticated'
            ? 'pointer-events-auto'
            : 'pointer-events-none',
        )}
        placeholder='Add a Comment'
        maxLength={500}
      />
      <button
        className='text-title-3-bold absolute right-10 top-1/2 -translate-y-1/2 bg-transparent text-primary'
        disabled={commentInput.length === 0 || isLoading}
        onClick={handleCommentPost}>
        Post
      </button>
    </div>
  )
}
