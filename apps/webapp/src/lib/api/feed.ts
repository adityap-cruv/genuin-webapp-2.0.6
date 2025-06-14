import { useLocalStorage } from '@lib/stores/local-storage'
import { useInfiniteQuery } from '@tanstack/react-query'
import { parseFeedResponseFromGoApi } from './api-response-parser'
import { type VideoPlayerModalType } from '@lib/schemas/player/video'
import { axiosInstance } from './instance'

/**
 *
 * @param feedType 1 for home, 2 for latest, 3 for popular
 * @param pageParam
 * @returns
 */
async function fetchFeed(
  feedType: 1 | 2 | 3,
  pageParam: { pageSession?: string; lastVideoId?: string; lastVideoParentId?: string }
): Promise<{ reels: VideoPlayerModalType[]; pageSession: string; end: boolean }> {
  return await axiosInstance
    .post('/goservices/feed/home', {
      type: feedType,
      last_video_id: pageParam?.lastVideoId ?? undefined,
      page_session: pageParam?.pageSession ?? undefined,
      device_id: encodeURI(useLocalStorage.getState().deviceId),
    })
    .then((res) => {
      const resData = res.data.data
      const reels = parseFeedResponseFromGoApi(resData.feeds)
      return { reels, pageSession: resData.page_session, end: resData.feeds.length === 0 }
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
    queryFn: async ({ pageParam }) => {
      return await fetchFeed(feedType, pageParam)
    },
    refetchOnWindowFocus: false,
    initialPageParam: {},
    getNextPageParam(lastPage, allPages) {
      if (lastPage.end) return
      return {
        pageSession: lastPage.pageSession,
        lastVideoId: lastPage.reels[lastPage.reels.length - 1]?.video.id,
        lastVideoParentId: lastPage.reels[lastPage.reels.length - 1]?.loop.id,
      }
    },
  })
}
