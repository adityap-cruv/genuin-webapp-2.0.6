import { validateVideoData } from '@lib/schemas/video'
import axios from 'axios'

export async function fetchVideoDetails(videoId: string) {
  return axios
    .get(process.env.NEXT_PUBLIC_API_URL + '/api/v3/public/video_details', {
      params: {
        video_share_string: videoId,
      },
    })
    .then((res) => {
      // return validateVideoData(res.data.data)
      return res.data.data
    })
    .catch((e) => {
      throw new Error('Something went wrong with video details api.')
    })
}
