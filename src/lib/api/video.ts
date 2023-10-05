import axios from 'axios'

export async function getVideoDetails(videoId: string) {
  return axios
    .get(process.env.NEXT_PUBLIC_API_URL + '/api/v3/public/video_details', {
      params: {
        video_share_string: videoId,
      },
    })
    .then((res) => {
      return res.data.data
    })
    .catch((e) => {
      throw new Error('Something went wrong with video details api.')
    })
}
