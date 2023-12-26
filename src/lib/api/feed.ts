import { useInfiniteQuery } from '@tanstack/react-query'
import axios from 'axios'

type FeedOptionsType = {
  userID: string
  feedType: 'popular' | 'lattest'
  pageRef?: any
  brandId?: string
}

async function fetchFeed(options: FeedOptionsType) {
  return await axios
    .get(process.env.NEXT_PUBLIC_API_URL + '/api/v3/public/feed', {
      params: {
        userID: options.userID,
        pageRef: options.pageRef,
        brand_id: options.brandId,
        feed_type: options.feedType,
      },
    })
    .then((res) => {
      return { reels: res.data.data.reels, pageRef: res.data.data.pageRef }
    })
    .catch((e) => {
      throw new Error('Something went wrong feed api.')
    })
}

export function getFeed(options: FeedOptionsType) {
  return useInfiniteQuery({
    queryFn: async ({ pageParam }) => {
      options.pageRef = pageParam
      return await fetchFeed(options)
    },
    queryKey: [options.userID, options.feedType],
    getNextPageParam(lastPage, allPages) {
      if (lastPage.pageRef) return lastPage.pageRef
    },
  })
}
