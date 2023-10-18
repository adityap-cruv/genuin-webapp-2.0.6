import { useInfiniteQuery } from '@tanstack/react-query'
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
      return res.data.data
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
      return pages.length
    },
  })
}
