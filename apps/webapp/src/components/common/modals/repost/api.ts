import { axiosInstance } from '@lib/api/instance'
import { validateRepostCommunityListData } from './schema'

export async function fetchRepostDestinations(videoId: string) {
  return await axiosInstance
    .get('/api/v3/repost_destinations', { params: { source_video_id: videoId, content_type: 2 } })
    .then((res) => {
      return validateRepostCommunityListData(res.data.data.communities)
    })
    .catch((e) => {
      if (e.response.data.code === '5190') return null
      throw new Error('Something went wrong repost destinations api.')
    })
}

/**
 *
 * @param destinationId chat id of loop
 * @param sourceVideoId source video id (self)
 */
export async function repostVideo(destinationId: string, sourceVideoId: string) {
  return await axiosInstance
    .post('/api/v3/repost/create', { chat_id: destinationId, source_video_id: sourceVideoId, content_type: 2 })
    .then((res) => {
      if (res.data.code === 200) return true
      return false
    })
    .catch((e) => {
      return false
    })
}
