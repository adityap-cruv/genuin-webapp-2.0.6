import { useGenuinOptions } from '@lib/stores/genuin-options'
import { useLocalStorage } from '@lib/stores/local-storage'
import { useInfiniteQuery } from '@tanstack/react-query'
import axios from 'axios'
import { parseFeedResponse } from './api-response-parser'
import { type VideoPlayerModalType } from '@lib/schemas/player/video'

/**
 *
 * @param feedType 1 for home, 2 for latest, 3 for popular
 * @param pageParam
 * @returns
 */
async function fetchFeed(
  feedType: 1 | 2 | 3,
  pageParam: { pageSession?: string; lastVideoId?: string }
): Promise<{ reels: VideoPlayerModalType[]; pageSession: string }> {
  return await axios
    .get(process.env.NEXT_PUBLIC_API_URL + '/api/v3/feeds', {
      params: {
        brand_id: useGenuinOptions.getState().brandId,
        type: feedType,
        last_video_id: pageParam?.lastVideoId ?? undefined,
        page_session: pageParam?.pageSession ?? undefined,
        device_id: encodeURI(useLocalStorage.getState().deviceId),
      },
    })
    .then((res) => {
      const resData = res.data.data
      const reels = parseFeedResponse(resData.feeds)
      return { reels, pageSession: resData.page_session }
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
      return { pageSession: lastPage.pageSession, lastVideoId: lastPage.reels[lastPage.reels.length - 1].video.id }
    },
  })
}
