import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
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

async function fetchCommunities(nickname: string, pageNo = 0) {
  return await axios
    .get(process.env.NEXT_PUBLIC_API_URL + '/api/v3/public/profile/contributed_communities', {
      params: {
        user_id: nickname,
        page: pageNo,
      },
    })
    .then((res) => {
      return res.data.data
    })
    .catch((e) => {
      throw new Error('Something went wrong with contributed_communities api.')
    })
}

export function getAllCommunities(nickname: string) {
  return useInfiniteQuery({
    queryKey: ['communities', nickname],
    queryFn: async ({ pageParam }) => await fetchCommunities(nickname, pageParam),
    getNextPageParam(lastPage, allPages) {
      if (lastPage.end_page) {
        return
      }
      return allPages.length
    },
  })
}

async function fetchCommunityLoops(nickname: string, communityId: string, pageNo = 0) {
  return await axios
    .get(process.env.NEXT_PUBLIC_API_URL + '/api/v3/public/profile/contributed_community_loops', {
      params: {
        user_id: nickname,
        community_id: communityId,
        page: pageNo,
      },
    })
    .then((res) => {
      return res.data.data
    })
    .catch((e) => {
      throw new Error('Something went wrong with contributed_community_loops api.')
    })
}

export function getAllLoops(nickname: string, communityId: string) {
  return useInfiniteQuery({
    queryKey: ['communityLoops', nickname, communityId],
    queryFn: async ({ pageParam }) => await fetchCommunityLoops(nickname, communityId, pageParam),
    getNextPageParam(lastPage, allPages) {
      if (lastPage.end_page) {
        return
      }
      return allPages.length
    },
  })
}

async function fetchCommunityLoopVideos(nickname: string, loopId: string, pageNo = 0) {
  return await axios
    .get(process.env.NEXT_PUBLIC_API_URL + '/api/v3/public/profile/contributed_loop_videos', {
      params: {
        user_id: nickname,
        loop_id: loopId,
        page: pageNo,
      },
    })
    .then((res) => {
      return res.data.data
    })
    .catch((e) => {
      throw new Error('Something went wrong with contributed_loop_videos api.')
    })
}

export function getAllLoopVideos(nickname: string, loopId: string) {
  return useInfiniteQuery({
    queryKey: ['videos', nickname, loopId],
    queryFn: async ({ pageParam }) => await fetchCommunityLoopVideos(nickname, loopId, pageParam),
    getNextPageParam(lastPage, allPages) {
      if (lastPage.end_page) {
        return
      }
      return allPages.length
    },
  })
}
