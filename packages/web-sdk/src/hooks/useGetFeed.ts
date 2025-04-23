import { useEffect, useState, useCallback } from 'react'
import { fetchFeed } from '@/views/api/feed'
import { FeedType, FeedVideoType } from '@/type'
import { mapFeedTypeToNumber } from '@/utils'
import { useAuth } from '@/context/auth'

type UseGetFeedType = {
  feedType?: FeedType
  communityIds?: string[]
  loopIds?: { loop_id: string; community_id: string }[]
}

export function useGetFeed({
  communityIds,
  loopIds,
  feedType = 'HOME',
}: UseGetFeedType) {
  const [videos, setVideos] = useState<FeedVideoType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingNextPage, setIsLoadingNextPage] = useState(false)
  const [hasNextPage, setHasNextPage] = useState(true)
  const { user } = useAuth()

  const onlyLoopIds = loopIds?.flatMap((item) => item.loop_id)

  // If the accessToken changes than update the feed with the new accessToken.
  // This will make sure that the feed is updated when the user logs in or logs out.
  useEffect(() => {
    setIsLoading(true)
    fetchFeed({
      communityIds,
      loopIds: onlyLoopIds,
      feedType: mapFeedTypeToNumber(feedType),
    })
      .then((res) => {
        setVideos(res.feed ?? [])
        if (res.endOfFeed) setHasNextPage(false)
      })
      .catch(() => {
        throw new Error('Failed to fetch feed')
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [feedType, user?.accessToken])

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
    })
      .then((res) => {
        if (res.feed.length !== 0) setVideos((x) => [...x, ...res.feed])
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
