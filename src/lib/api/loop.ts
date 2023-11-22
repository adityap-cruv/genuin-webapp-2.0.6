import { validateLoopCohosts } from '@lib/schemas/loop/cohosts'
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import axios from 'axios'

export async function fetchLoopDetails(loopId: string) {
  return await axios
    .get(process.env.NEXT_PUBLIC_API_URL + '/api/v3/public/rt/details', { params: { chat_id: loopId } })
    .then((res) => {
      return res?.data?.data
    })
    .catch((e) => {
      throw new Error('Something went wrong!!')
    })
}

async function fetchLoopVideos(loopId: string, pageNo = 0) {
  return await axios
    .get(process.env.NEXT_PUBLIC_API_URL + '/api/v3/public/rt/videos_v2', {
      params: {
        share_string: loopId,
        page: pageNo,
      },
    })
    .then((res) => {
      return { videos: res.data.data.videos, end: res.data.data.end_of_videos ?? false }
    })
    .catch((e) => {
      throw new Error('Somethig went wrong with loop videos fetching api.')
    })
}

export function getLoopVideos(loopId: string) {
  return useInfiniteQuery({
    queryFn: async ({ pageParam }) => await fetchLoopVideos(loopId, pageParam),
    queryKey: ['loop', 'videos', 'paginated'],
    getNextPageParam: (lastPage, pages) => {
      if (lastPage.end) {
        return
      }
      return pages.length
    },
  })
}

async function fetchLoopCohosts(loopId: string) {
  return await axios
    .get(process.env.NEXT_PUBLIC_API_URL + '/api/v3/public/rt/users', {
      params: { chat_id: loopId },
    })
    .then((res) => {
      return validateLoopCohosts(res.data.data)
    })
    .catch((e) => {
      throw new Error('Something went wrong in fetching videos.')
    })
}

export function getLoopCohosts(loopId: string) {
  return useQuery({ queryKey: ['loop', 'cohosts', 'users'], queryFn: async () => await fetchLoopCohosts(loopId) })
}
