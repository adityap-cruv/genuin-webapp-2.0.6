import axios from 'axios'

export async function fetchUserData(nickname: string) {
  return axios
    .get(process.env.NEXT_PUBLIC_API_URL + '/api/v3/public/user/details', {
      params: {
        nickname: nickname,
      },
    })
    .then((res) => {
      return res.data.data
    })
    .catch((e) => {
      // console.log('e::', e)
      throw new Error('Something went wrong...')
    })
}

export async function fetchAllVideos(nickname: string) {
  return axios
    .get(process.env.NEXT_PUBLIC_API_URL + '/api/v3/public/profile_videos', {
      params: {
        user_id: nickname,
        video_types: ['rt'],
      },
    })
    .then((res) => {
      return res.data.data
    })
    .catch((e) => {
      throw new Error('Something went wrong with profile videos api..')
    })
}
