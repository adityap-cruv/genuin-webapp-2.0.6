import axios from 'axios'
import { validateVideoData } from '@lib/schemas/video'

export async function fetchVideoDetails(slug: string) {
  return await axios
    .get(process.env.NEXT_PUBLIC_API_URL + '/api/v3/public/video_details', {
      params: {
        video_ids: [{ slug }],
      },
    })
    .then((res) => {
      // removed temporary for deployment
      // return validateVideoData(res.data.data[slug])
      return res.data.data[slug]
    })
    .catch((e) => {
      throw new Error('Something went wrong with video details api.')
    })
}
