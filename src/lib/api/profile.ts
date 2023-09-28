import { useQuery } from '@tanstack/react-query'
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

// todo need to work on optimization of this api
type VideoType = 'rt' | 'public_video'
async function fetchVideos(nickname: string, types: [VideoType?, VideoType?]) {
  return axios
    .get(process.env.NEXT_PUBLIC_API_URL + '/api/v3/public/profile_videos', {
      params: {
        user_id: nickname,
        video_types: types,
      },
    })
    .then((res) => {
      return res.data.data
    })
    .catch((e) => {
      throw new Error('Something went wrong with profile videos api..')
    })
}

export function getAllVideos(nickname: string) {
  return useQuery({ queryKey: ['all', 'videos'], queryFn: () => fetchVideos(nickname, ['public_video', 'rt']) })
}

export function getLoopVideos(nickname: string) {
  return useQuery({ queryKey: ['loop', 'videos'], queryFn: () => fetchVideos(nickname, ['rt']) })
}

export function getGenuinVideos(nickname: string) {
  return useQuery({ queryKey: ['genuin', 'videos'], queryFn: () => fetchVideos(nickname, ['public_video']) })
}
