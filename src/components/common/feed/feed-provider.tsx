import { createContext, useCallback, useEffect, useState } from 'react'
import Analytics from '@/services/analytics'
import { usePlayerControlStore } from '../player/player-control-store'
import { type VideoPlayerModalType } from '@/lib/schemas/player/video'
import { showInterruption } from '@/components/providers/interruption-provider'

type FeedContextType = {
  currentIndex: number
  updateCurrentIndex: (index: number, videoId: string) => void
  allowSlideNext: boolean
  videos: VideoPlayerModalType[]
}

export const FeedContext = createContext<FeedContextType>({
  currentIndex: 0,
  updateCurrentIndex: () => {},
  allowSlideNext: true,
  videos: [],
})

type FeedContextProviderType = {
  children: React.ReactNode
  startIndex: number
  videos: VideoPlayerModalType[]
  fetchNextPage?: () => void
  isFetchingNextPage?: boolean
  hasNextPage: boolean
}

export function FeedContextProvider({
  children,
  startIndex,
  videos,
  isFetchingNextPage,
  fetchNextPage,
  hasNextPage,
}: FeedContextProviderType) {
  const [currentIndex, setCurrentIndex] = useState(startIndex)
  const [allowSlideNext, setAllowSlideNext] = useState(true)

  const updateCurrentIndex = useCallback((newIndex: number) => {
    const { duration, currentTime } = usePlayerControlStore.getState()
    const playerProgress = Math.round((currentTime / duration) * 100)

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

    if (isNaN(playerProgress)) {
      setCurrentIndex(newIndex)
      return
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
    setCurrentIndex(newIndex)
  }, [])

  useEffect(() => {
    if (!videos || videos.length === 0) return

    if (!isFetchingNextPage && currentIndex === videos.length - 3 && hasNextPage) {
      // fetchNextPage?.()
    }
    if ((currentIndex + 1) % 5 === 0) {
      showInterruption()
    }

    if (videos.length - 1 === currentIndex) {
      setAllowSlideNext(false)
    } else if (!allowSlideNext) {
      setAllowSlideNext(true)
    }
  }, [currentIndex, videos.length, hasNextPage])

  return (
    <FeedContext.Provider value={{ currentIndex, allowSlideNext, updateCurrentIndex, videos }}>
      {children}
    </FeedContext.Provider>
  )
}
