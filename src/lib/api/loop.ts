import { validateLoopCohosts } from '@lib/schemas/loop/cohosts'
import { validateLoopDetails } from '@lib/schemas/loop/details'
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import axios from 'axios'

export async function fetchLoopDetails(loopId: string) {
  return axios
    .get(process.env.NEXT_PUBLIC_API_URL + '/api/v3/public/rt/details', { params: { chat_id: loopId } })
    .then((res) => {
      return res?.data?.data
    })
    .catch((e) => {
      throw new Error('Something went wrong!!')
    })
}

async function fetchLoopVideos(loopId: string, pageNo = 0) {
  return axios
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
      console.log('error::', e)
      throw new Error('Somethig went wrong with loop videos fetching api.')
    })
}

export function getLoopVideos(loopId: string) {
  return useInfiniteQuery({
    queryFn: ({ pageParam }) => fetchLoopVideos(loopId, pageParam),
    queryKey: ['loop', 'videos', 'paginated'],
    getNextPageParam: (lastPage, pages) => {
      if (lastPage.end) {
        return
      }
      return pages.length
    },
  })
}

async function fetchLoopCohosts(chat_id: string, type: string) {
  return axios
    .get(process.env.NEXT_PUBLIC_API_URL + '/api/v3/public/rt/users', {
      params: {
        type: type,
        page_number: 0,
        chat_id: chat_id,
      }
    })
    .then((res) => {
      return res.data.data
    })
    .catch((e) => {
      throw new Error('Something went wrong in fetching videos.')
    })
}

export function getLoopCohosts(chat_id: string, type: string) {
  return useQuery({ queryKey: ['loop', 'cohosts', 'users', chat_id, type], queryFn: () => fetchLoopCohosts(chat_id, type) })
}
