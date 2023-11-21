import { validateVideoListData } from '@lib/schemas/video'
import { useInfiniteQuery } from '@tanstack/react-query'
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
      throw new Error('Something went wrong in profile details api.')
    })
}

type VideoType = 'rt' | 'public_video'
async function fetchVideos(nickname: string, types: [VideoType?, VideoType?], pageNo = 0) {
  return axios
    .get(process.env.NEXT_PUBLIC_API_URL + '/api/v3/public/profile_videos_v2', {
      params: {
        user_id: nickname,
        video_types: types,
        page: pageNo,
      },
    })
    .then((res) => {
      return { videos: res.data.data.videos, end: res.data.data.end_of_videos || false }
    })
    .catch((e) => {
      throw new Error('Something went wrong with profile videos api.')
    })
}

export function getPaginatedAllVideos(nickname: string) {
  return useInfiniteQuery({
    queryKey: ['all', 'videos'],
    queryFn: ({ pageParam }) => fetchVideos(nickname, ['public_video', 'rt'], pageParam),
    getNextPageParam(lastPage, allPages) {
      if (lastPage.end) {
        return
      }
      return allPages.length
    },
  })
}

export function getPaginatedLoopVideos(nickname: string) {
  return useInfiniteQuery({
    queryKey: ['loop', 'videos'],
    queryFn: ({ pageParam }) => fetchVideos(nickname, ['rt'], pageParam),
  })
}

export function getPaginatedGenuinVideos(nickname: string) {
  return useInfiniteQuery({
    queryKey: ['genuin', 'videos'],
    queryFn: ({ pageParam }) => fetchVideos(nickname, ['public_video'], pageParam),
  })
}
