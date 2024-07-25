import { create } from 'zustand'
import { usePlayerControlStore } from '../player/player-control-store'
import Analytics from '@services/analytics'

type FeedListStoreType = {
  currentIndex: number
  setCurrentIndex: (index: number, oldVideoId: string) => void
}

export const useFeedListStore = create<FeedListStoreType>((set) => {
  return {
    currentIndex: 0,
    setCurrentIndex(index, videoId) {
      set((state) => {
        const { duration, currentTime } = usePlayerControlStore.getState()
        const playerProgress = Math.round((currentTime / duration) * 100)
        const properties = {
          content_category: 'loop',
          content_id: videoId,
          event_record_screen: 'feed',
          event_target_screen: 'none',
          video_length: duration,
          video_view_length: currentTime,
        }
        const eventName = index < state.currentIndex ? 'Swipe Down' : 'Swipe Up'

        void Analytics.track({
          eventName,
          properties,
        })

        if (isNaN(playerProgress)) {
          void Analytics.track({ eventName: 'Video Impression', properties })
          return { currentIndex: index }
        }

        Analytics.triggerAnalyticsForVideoProgress(videoId, duration, currentTime, playerProgress)
        return { currentIndex: index }
      })
    },
  }
})
