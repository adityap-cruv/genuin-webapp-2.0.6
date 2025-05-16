import { getApiUrl } from '@/utils'
import { getBaseHeaders } from '@/headers'
import { useInfiniteQuery } from '@tanstack/react-query'
import { getQueryKeyForVideoComments } from '@/utils/constants/keys'
import { validateComment, validateCommentList } from './schema'

export async function fetchComments(videoId: string, lastCommentId?: string) {
  const searchParams = new URLSearchParams({
    conversation_id: videoId,
  })

  if (lastCommentId) {
    searchParams.set('last_comment_id', lastCommentId)
  }

  const response = await fetch(getApiUrl('/api/v3/comments', searchParams), {
    method: 'GET',
    headers: getBaseHeaders(true),
  })
  if (!response.ok) {
    throw new Error('Something went wrong while fetching comments.')
  }
  const resData = await response.json()

  return {
    comments: validateCommentList(resData.data.comments),
    endOfResults: resData.data.end_of_results as boolean,
  }
}

export function getComments(videoId: string) {
  return useInfiniteQuery({
    queryKey: getQueryKeyForVideoComments(videoId),
    queryFn: async ({ pageParam }) => await fetchComments(videoId, pageParam),
    initialPageParam: '',
    getNextPageParam: (lastPage) => {
      if (lastPage.endOfResults) return
      return lastPage.comments[lastPage.comments.length - 1]?.comment_id
    },
  })
}

export async function postComment(
  videoId: string,
  loopId: string,
  comment: string,
) {
  return await fetch(getApiUrl('/api/v3/comment/create'), {
    headers: getBaseHeaders(true),
    method: 'POST',
    body: JSON.stringify({
      comment_text: comment,
      comment_data: JSON.stringify([comment]),
      conversation_id: videoId,
      chat_id: loopId,
      // As of now we only allow text, that's why it is hardcoded to 3
      type: 3,
    }),
  })
    .then(async (res) => {
      const response = await res.json()
      if (response.code === 200) {
        return validateComment(response.data)
      }
      return null
    })
    .catch((e) => {
      console.log('error::', e)
      return null
    })
}

export async function mentionUser(
  chatId: string,
  queryString: string,
  signal: AbortSignal,
) {
  const searchParams = new URLSearchParams({
    query_string: queryString,
    chat_id: chatId,
  })

  try {
    const response = await fetch(getApiUrl('/api/v3/mentions', searchParams), {
      method: 'GET',
      headers: getBaseHeaders(true),
      signal,
    })

    if (!response.ok) {
      throw new Error('Failed to fetch mentions')
    }

    const resData = await response.json()
    return { code: response.status, data: resData.data }
  } catch (e: any) {
    return { code: Number(e?.response?.data?.code) || 500, data: [] }
  }
}

export async function createComment(
  videoId: string,
  loopId: string,
  type: number,
  commentText: string,
  commentData: any,
) {
  try {
    const response = await fetch(getApiUrl('/api/v3/comment/create'), {
      method: 'POST',
      headers: getBaseHeaders(true),
      body: JSON.stringify({
        conversation_id: videoId,
        chat_id: loopId,
        type,
        comment_text: commentText,
        comment_data: JSON.stringify(commentData),
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to create comment')
    }

    const resData = await response.json()
    return { code: response.status, commentData: resData.data }
  } catch (e: any) {
    return { code: Number(e?.response?.data?.code) || 500, commentData: null }
  }
}
