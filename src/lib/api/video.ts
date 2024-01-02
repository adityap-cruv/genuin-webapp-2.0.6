import axios from 'axios'
import { validateVideoData } from '@lib/schemas/video'

export async function fetchVideoDetails(slug: string) {
  return await axios
    .get(process.env.NEXT_PUBLIC_API_URL + '/api/v3/public/video_details', {
      params: {
        video_id: { slug },
      },
    })
    .then((res) => {
      return validateVideoData(res.data.data)
      // return res.data.data
    })
    .catch((e) => {
      throw new Error('Something went wrong with video details api.')
    })
}
