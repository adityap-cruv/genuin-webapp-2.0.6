import { useInfiniteQuery } from '@tanstack/react-query'
import axios from 'axios'

export async function fetchUserData(nickname: string) {
  return await axios
    .get(process.env.NEXT_PUBLIC_API_URL + '/api/v3/public/user/details', {
      params: {
        nickname,
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
  return await axios
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
    queryKey: ['all', 'videos', nickname, ['public_video', 'rt']],
    queryFn: async ({ pageParam }) => await fetchVideos(nickname, ['public_video', 'rt'], pageParam),
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
    queryKey: ['loop', 'videos', nickname, ['rt']],
    queryFn: async ({ pageParam }) => await fetchVideos(nickname, ['rt'], pageParam),
    getNextPageParam(lastPage, allPages) {
      if (lastPage.end) {
        return
      }
      return allPages.length
    },
  })
}

export function getPaginatedGenuinVideos(nickname: string) {
  return useInfiniteQuery({
    queryKey: ['genuin', 'videos', nickname, ['public_video']],
    queryFn: async ({ pageParam }) => await fetchVideos(nickname, ['public_video'], pageParam),
    getNextPageParam(lastPage, allPages) {
      if (lastPage.end) {
        return
      }
      return allPages.length
    },
  })
}
