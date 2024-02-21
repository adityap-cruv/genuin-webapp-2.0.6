import { useInfiniteQuery } from '@tanstack/react-query'
import axios from 'axios'

type FeedOptionsType = {
  userID: string
  feedType: 'popular' | 'lattest' | 'home'
  brandId?: string | null
}

async function fetchFeed(options: FeedOptionsType, ref: any) {
  if (!options.brandId) options.brandId = null
  return await axios
    .get(process.env.NEXT_PUBLIC_API_URL + '/api/v3/public/feed', {
      params: {
        anonymous_user_uuid: options.userID,
        ref,
        brand_id: options.brandId,
        feed_type: options.feedType,
      },
    })
    .then((res) => {
      return { reels: res.data.data.list, ref: res.data.data.ref }
    })
    .catch((e) => {
      throw new Error('Something went wrong feed api.')
    })
}

export function getFeed(options: FeedOptionsType) {
  return useInfiniteQuery({
    queryKey: ['reels',options.userID, options.feedType],
    queryFn: async ({ pageParam }) =>
      await fetchFeed(options, pageParam),
    getNextPageParam(lastPage, allPages) {
      const obj = JSON.parse(lastPage.ref)

      if (obj.pgNo === -1) {
        return
      }
      return obj
    },
  })
}