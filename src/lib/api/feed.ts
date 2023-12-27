import { useInfiniteQuery } from '@tanstack/react-query'
import axios from 'axios'

type FeedOptionsType = {
  userID: string
  feedType: 'popular' | 'lattest' | 'home'
  pageRef?: any
  brandId?: string | null
}

async function fetchFeed(options: FeedOptionsType) {
  if (!options.brandId) options.brandId = null
  return await axios
    .get(process.env.NEXT_PUBLIC_API_URL + '/api/v3/public/feed', {
      params: {
        anonymous_user_uuid: options.userID,
        ref: options.pageRef,
        brand_id: options.brandId,
        feed_type: options.feedType,
      },
    })
    .then((res) => {
      return { reels: res.data.data.list, pageRef: res.data.data.ref }
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
