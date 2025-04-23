import { getApiUrl } from '@/utils'
import { validateRepostCommunityListData } from './schema'
import { getBaseHeaders } from '@/headers'

export async function fetchRepostDestinations(videoId: string) {
  try {
    const url = getApiUrl(
      '/api/v3/repost_destinations',
      new URLSearchParams({ source_video_id: videoId, content_type: '2' }),
    )

    const response = await fetch(url, {
      method: 'GET',
      headers: getBaseHeaders(true),
    })

    if (!response.ok) {
      const errorData = await response.json()
      if (errorData.code === '5190') {
        return null
      }
      throw new Error('Something went wrong repost destinations API.')
    }

    const resData = await response.json()
    return validateRepostCommunityListData(resData.data.communities)
  } catch (e) {
    console.error('::Error in fetchRepostDestinations::', e)
    throw new Error('Something went wrong repost destinations API.')
  }
}

/**
 *
 * @param destinationId chat id of loop
 * @param sourceVideoId source video id (self)
 */
export async function repostVideo(
  destinationId: string,
  sourceVideoId: string,
): Promise<boolean> {
  try {
    const response = await fetch(getApiUrl('/api/v3/repost/create'), {
      method: 'POST',
      headers: getBaseHeaders(true),
      body: JSON.stringify({
        chat_id: destinationId,
        source_video_id: sourceVideoId,
        content_type: 2,
      }),
    })

    if (!response.ok) {
      return false
    }

    const resData = await response.json()
    return resData.code === 200
  } catch (e) {
    console.error('::Error in repostVideo::', e)
    return false
  }
}
