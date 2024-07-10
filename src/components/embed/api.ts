import { axiosInstance } from '../../lib/api/instance'
import { useLocalStorage } from '@lib/stores/local-storage'
import { useInfiniteQuery } from '@tanstack/react-query'
import { parseFeedResponse } from '../../lib/api/api-response-parser'
import { type VideoPlayerModalType } from '@lib/schemas/player/video'
import { useSizeStore } from './size-provider'

export async function getEmbedDetails(id: string): Promise<{ status: boolean; data: any }> {
  return await axiosInstance
    .get('/api/v3/embed', {
      params: {
        id,
      },
    })
    .then((res) => {
      return { status: res.status === 200, data: res.data.data }
    })
    .catch((e) => {
      throw new Error()
      // console.log('error')
    })
}

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
    .get('/api/v3/v1/feeds', {
      params: {
        brand_id: useSizeStore.getState().config?.brand_id ?? undefined,
        type: feedType,
        last_video_id: pageParam?.lastVideoId ?? undefined,
        page_session: pageParam?.pageSession ?? undefined,
        device_id: encodeURI(useLocalStorage.getState().deviceId),
        last_video_type: pageParam?.lastVideoId ? 'loop' : undefined,
        last_video_parent_id: pageParam?.lastVideoId ? pageParam.lastVideoParentId : undefined,
      },
    })
    .then((res) => {
      const resData = res.data.data
      const reels = parseFeedResponse(resData.feeds)
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
export function getFeedForEmbed(feedType: 1 | 2 | 3) {
  return useInfiniteQuery({
    queryKey: ['home', 'embed', feedType],
    queryFn: async ({ pageParam }) => {
      return await fetchFeed(feedType, pageParam)
    },
    refetchOnWindowFocus: false,
    getNextPageParam(lastPage, allPages) {
      if (lastPage.end) return
      return {
        pageSession: lastPage.pageSession,
        lastVideoId: lastPage.reels[lastPage.reels.length - 1].video.id,
        lastVideoParentId: lastPage.reels[lastPage.reels.length - 1].loop.id,
      }
    },
  })
}
