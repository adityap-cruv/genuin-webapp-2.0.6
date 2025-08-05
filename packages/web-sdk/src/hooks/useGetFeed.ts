import { useEffect, useState, useCallback } from 'react'
import { fetchFeed } from '@/views/api/feed'
import { FeedType, FeedVideoType, SDKConfig } from '@/type'
import { mapFeedTypeToNumber } from '@/utils'
import { useAuth } from '@/context/auth'
import { getVideoDetails } from '@/components/pages/video/api'

type UseGetFeedType = {
  feedType?: FeedType
  communityIds?: string[]
  loopIds?: { loop_id: string; community_id: string }[]
  contextualParams: SDKConfig['contextualParams']
  brandIds?: number[]
  startVideoSlug?: string
}

export function useGetFeed({
  communityIds,
  loopIds,
  feedType = 'HOME',
  contextualParams,
  brandIds,
  startVideoSlug,
}: UseGetFeedType) {
  const [videos, setVideos] = useState<FeedVideoType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingNextPage, setIsLoadingNextPage] = useState(false)
  const [hasNextPage, setHasNextPage] = useState(true)
  const { user } = useAuth()
  const onlyLoopIds = loopIds?.flatMap((item) => item.loop_id)
  // const { contextualParams } = useBrandDetails()
  // If the accessToken changes than update the feed with the new accessToken.
  // This will make sure that the feed is updated when the user logs in or logs out.
  useEffect(() => {
    async function fetchInitialFeed() {
      setIsLoading(true)
      try {
        if (startVideoSlug) {
          try {
            const video = await getVideoDetails(startVideoSlug)
            setVideos([video])
          } catch (e) {
            // Silently ignore error.
          }
          // Now fetch the feed and append
          setTimeout(async () => {
            const res = await fetchFeed({
              communityIds,
              loopIds: onlyLoopIds,
              feedType: mapFeedTypeToNumber(feedType),
              contextualParams,
              brandIds,
            })
            let newVideos = res.feed as FeedVideoType[]
            newVideos = newVideos.filter(
              (video) => video.video.slug !== startVideoSlug,
            )
            setVideos((prev) => [...prev, ...newVideos])
            if (res.endOfFeed) setHasNextPage(false)
          }, 400)
        } else {
          const res = await fetchFeed({
            communityIds,
            loopIds: onlyLoopIds,
            feedType: mapFeedTypeToNumber(feedType),
            contextualParams,
            brandIds,
          })
          setVideos(res.feed ?? [])
          if (res.endOfFeed) setHasNextPage(false)
        }
      } catch (e) {
        throw new Error('Failed to fetch feed')
      } finally {
        setIsLoading(false)
      }
    }
    fetchInitialFeed()
  }, [
    feedType,
    user?.accessToken,
    contextualParams,
    startVideoSlug,
    communityIds,
    loopIds,
    brandIds,
  ])

  const fetchNextVideosPage = useCallback(() => {
    if (!hasNextPage) return
    const lastVideoId = videos[videos?.length - 1]?.uuid
    if (!lastVideoId || isLoadingNextPage) return
    setIsLoadingNextPage(true)
    fetchFeed({
      lastVideoId,
      loopIds: onlyLoopIds,
      communityIds,
      feedType: mapFeedTypeToNumber(feedType),
      contextualParams,
    })
      .then((res) => {
        if (res.feed.length !== 0) {
          let newVideos = res.feed as FeedVideoType[]

          if (startVideoSlug) {
            newVideos = newVideos.filter(
              (video) => video.video.slug !== startVideoSlug,
            )
          }
          setVideos((x) => [...x, ...newVideos])
        }
        if (res.endOfFeed) setHasNextPage(false)
      })
      .catch(() => {
        console.log('Something went wrong.')
      })
      .finally(() => {
        setIsLoadingNextPage(false)
      })
  }, [videos, isLoadingNextPage, hasNextPage, feedType])

  return {
    videos,
    isLoading,
    fetchNextVideosPage,
    isLoadingNextPage,
    hasNextPage,
  }
}
