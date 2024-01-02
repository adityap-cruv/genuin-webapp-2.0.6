import { useInfiniteQuery } from '@tanstack/react-query'
import axios from 'axios'

export async function fetchUserData(nickname: string) {
  return await axios
    .get(process.env.NEXT_PUBLIC_API_URL + '/api/v3/public/user/details', {
      params: {
        user_id: { nickname },
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
async function fetchVideos(nickname: string, types: [VideoType?, VideoType?], ref: any) {
  return await axios
    .get(process.env.NEXT_PUBLIC_API_URL + '/api/v3/public/profile_videos_v2', {
      params: {
        user_id: { nickname },
        video_types: types,
        ref,
      },
    })
    .then((res) => {
      return { videos: res.data.data.list, end: res.data.data.end_page || false, ref: res.data.data.ref }
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
      return lastPage.ref
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
      return lastPage.ref
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
      return lastPage.ref
    },
  })
}

async function fetchCommunities(nickname: string, ref: any) {
  return await axios
    .get(process.env.NEXT_PUBLIC_API_URL + '/api/v3/public/profile/contributed_communities', {
      params: {
        user_id: { nickname },
        ref,
      },
    })
    .then((res) => {
      const resData = res.data.data
      return { communities: resData?.list, ref: resData?.ref, end: resData?.end_page }
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
      if (lastPage.end) {
        return
      }
      return lastPage.ref
    },
  })
}

async function fetchCommunityLoops(nickname: string, communityHandle: string, ref: any) {
  return await axios
    .get(process.env.NEXT_PUBLIC_API_URL + '/api/v3/public/profile/contributed_community_loops', {
      params: {
        user_id: { nickname },
        community_id: { handle: communityHandle },
        ref,
      },
    })
    .then((res) => {
      return { loops: res.data.data.list, end: res.data.data.end_page, ref: res.data.data.ref }
    })
    .catch((e) => {
      throw new Error('Something went wrong with contributed_community_loops api.')
    })
}

// TODO: make it type safe api.
export function getAllLoops(nickname: string, communityId: string) {
  return useInfiniteQuery({
    queryKey: ['communityLoops', nickname, communityId],
    queryFn: async ({ pageParam }) => await fetchCommunityLoops(nickname, communityId, pageParam),
    getNextPageParam(lastPage, allPages) {
      if (lastPage.end) {
        return
      }
      return lastPage.ref
    },
  })
}

async function fetchCommunityLoopVideos(nickname: string, loopSlug: string, ref: any) {
  return await axios
    .get(process.env.NEXT_PUBLIC_API_URL + '/api/v3/public/profile/contributed_loop_videos', {
      params: {
        user_id: { nickname },
        loop_id: { slug: loopSlug },
        ref,
      },
    })
    .then((res) => {
      return { videos: res.data.data.list, end: res.data.data.end_page, ref: res.data.data.ref }
    })
    .catch((e) => {
      throw new Error('Something went wrong with contributed_loop_videos api.')
    })
}

export function getAllLoopVideos(nickname: string, slug: string) {
  return useInfiniteQuery({
    queryKey: ['videos', nickname, slug],
    queryFn: async ({ pageParam }) => await fetchCommunityLoopVideos(nickname, slug, pageParam),
    getNextPageParam(lastPage, allPages) {
      if (lastPage.end) {
        return
      }
      return lastPage.ref
    },
  })
}
