import { validateCommunityDetails } from '@lib/schemas/community'
import { validateVideoListData } from '@lib/schemas/video'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'

export async function fetchCommunityDetails(handle: string) {
  return axios
    .get(process.env.NEXT_PUBLIC_API_URL + '/api/v3/public/community/details', {
      params: {
        community_handle: handle,
      },
    })
    .then((res) => res.data.data)
    .catch((e) => {
      console.log(e)
      throw new Error('Something went wrong with community detail!')
    })
}

async function fetchCommunityVideos(handle: string) {
  return axios
    .get(process.env.NEXT_PUBLIC_API_URL + '/api/v3/public/community/videos', {
      params: {
        community_handle: handle,
      },
    })
    .then((res) => res.data.data.feed)
    .catch((e) => {
      console.log(e)
      throw new Error('Something went wrong with community videos!')
    })
}

export function getCommunityVideos(handle: string) {
  return useQuery({ queryFn: () => fetchCommunityVideos(handle), queryKey: ['community', 'videos'] })
}

async function fetchVideoComments(handle: string) {
  return axios.get(process.env.NEXT_PUBLIC_API_URL + '/api/')
}
