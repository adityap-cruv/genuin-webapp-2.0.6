import { useGenuinOptions } from '@lib/stores/genuin-options'
import { useLocalStorage } from '@lib/stores/local-storage'
import { encryptText } from '@lib/utils'
import { useInfiniteQuery } from '@tanstack/react-query'
import axios from 'axios'

/**
 *
 * @param feedType 1 for home, 2 for latest, 3 for popular
 * @param pageParam
 * @returns
 */
async function fetchFeed(feedType: 1 | 2 | 3, pageParam: string) {
  console.log('device id::', useLocalStorage.getState().deviceId)
  return await axios
    .get(process.env.NEXT_PUBLIC_API_URL + '/api/v3/feeds', {
      params: {
        brand_id: useGenuinOptions.getState().brandId,
        type: feedType,
        last_video_id: pageParam,
        device_id: encodeURI(useLocalStorage.getState().deviceId),
      },
    })
    .then((res) => {
      return { reels: res.data.data.list, ref: res.data.data.ref }
    })
    .catch((e) => {
      throw new Error('Something went wrong feed api.')
    })
}

/**
 *
 * @param feedType 1 for home, 2 for latest, 3 for popular
 * @returns
 */
export function getFeed(feedType: 1 | 2 | 3) {
  return useInfiniteQuery({
    queryKey: ['home', feedType],
    queryFn: async ({ pageParam }) => await fetchFeed(feedType, pageParam),
    getNextPageParam(lastPage, allPages) {
      const obj = JSON.parse(lastPage.ref)

      if (obj.pgNo === -1) {
        return
      }
      return obj
    },
  })
}
