import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import Analytics from '@/services/analytics'
import { usePlayerControlStore } from '../common/player/player-control-store'
import { type VideoPlayerModalType } from '@/lib/schemas/player/video'
import { showInterruption } from '@/components/providers/interruption-provider'
import { type CommunityUserRoleType } from '@/lib/schemas/roles'

type FeedContextType = {
  currentIndex: number
  updateCurrentIndex: (index: number) => void
  allowSlideNext: boolean
  videos: VideoPlayerModalType[]
  updateCommunityJoinStatus: (communityId: string, role: CommunityUserRoleType) => void
  updateSparkStatus: (videoId: string, isSparked: boolean) => void
}

export const FeedContext = createContext<FeedContextType>({
  currentIndex: 0,
  updateCurrentIndex: () => {},
  allowSlideNext: true,
  videos: [],
  updateCommunityJoinStatus: () => {},
  updateSparkStatus: () => {},
})

type FeedContextProviderType = {
  children?: React.ReactNode
  startIndex: number
  videos: VideoPlayerModalType[]
  fetchNextPage?: () => void
  isFetchingNextPage?: boolean
  hasNextPage: boolean
  onCommunityJoin?: (communityId: string, role: CommunityUserRoleType) => void
}

export function FeedContextProvider({
  children,
  startIndex,
  videos,
  isFetchingNextPage,
  fetchNextPage,
  hasNextPage,
  onCommunityJoin,
}: FeedContextProviderType) {
  const [currentIndex, setCurrentIndex] = useState(startIndex)
  const [allowSlideNext, setAllowSlideNext] = useState(true)
  const [feedVideos, setFeedVideos] = useState<VideoPlayerModalType[]>(videos)

  useEffect(() => {
    setFeedVideos((oldFeedVideos) => [...oldFeedVideos, ...videos.slice(oldFeedVideos.length)])
  }, [videos])

  const updateCurrentIndex = useCallback(
    (newIndex: number) => {
      const { duration, currentTime } = usePlayerControlStore.getState()
      const playerProgress = Math.round((currentTime / duration) * 100)

      setCurrentIndex((currentIndex) => {
        const eventName = newIndex < currentIndex ? 'Swipe Down' : 'Swipe Up'
        const properties = {
          content_category: 'loop',
          content_id: videos[currentIndex].video.id,
          event_record_screen: 'feed',
          event_target_screen: 'none',
          video_length: duration,
          video_view_length: currentTime,
        }

        void Analytics.track({
          eventName,
          properties,
        })

        void Analytics.track({ eventName: 'Video Impression', properties })

        if (isNaN(playerProgress)) {
          return newIndex
        }

        if (playerProgress >= 25) {
          void Analytics.track({
            eventName: 'Video First Quartile',
            properties,
          })
        }

        if (playerProgress >= 50) {
          void Analytics.track({
            eventName: 'Video Watched',
            properties,
          })
        }

        if (playerProgress >= 75) {
          void Analytics.track({
            eventName: 'Video Third Quartile',
            properties,
          })
        }
        return newIndex
      })
    },
    [videos]
  )

  useEffect(() => {
    if (!videos || videos.length === 0) return

    if (!isFetchingNextPage && currentIndex === videos.length - 3 && hasNextPage) {
      fetchNextPage?.()
    }
    if ((currentIndex + 1) % 5 === 0) {
      showInterruption()
    }

    if (videos.length - 1 === currentIndex) {
      setAllowSlideNext(false)
    } else if (!allowSlideNext) {
      setAllowSlideNext(true)
    }
  }, [currentIndex, videos, hasNextPage])

  const updateCommunityJoinStatus = useCallback((communityId: string, role: CommunityUserRoleType) => {
    setFeedVideos((prev) =>
      prev.map((video) => {
        if (video.community.id === communityId) {
          return {
            ...video,
            community: {
              ...video.community,
              userRole: role,
            },
          }
        }
        return video
      })
    )
    onCommunityJoin?.(communityId, role)
  }, [])

  const updateSparkStatus = useCallback((videoId: string, isSparked: boolean) => {
    setFeedVideos((prev) =>
      prev.map((video) => {
        if (video.video.id === videoId) {
          return {
            ...video,
            video: {
              ...video.video,
              isSparked,
              sparkCount: video.video.sparkCount + (isSparked ? 1 : -1),
            },
          }
        }
        return video
      })
    )
  }, [])

  // useEffect(() => {
  //   console.log('feedVideos', feedVideos)
  // }, [feedVideos])

  return (
    <FeedContext.Provider
      value={{
        currentIndex,
        allowSlideNext,
        updateCurrentIndex,
        videos: feedVideos,
        updateCommunityJoinStatus,
        updateSparkStatus,
      }}>
      {children}
    </FeedContext.Provider>
  )
}

export const useFeedListContext = () => useContext(FeedContext)
