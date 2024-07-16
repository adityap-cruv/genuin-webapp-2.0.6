import { create } from 'zustand'
import { usePlayerControlStore } from '../player/player-control-store'
import Analytics from '@services/analytics'
import { type VideoPlayerModalType } from '@lib/schemas/player/video'

type FeedListStoreType = {
  videoList: VideoPlayerModalType[]
  setVideoList: (list: VideoPlayerModalType[]) => void
  currentIndex: number
  setCurrentIndex: (index: number) => void
}

export const useFeedListStore = create<FeedListStoreType>((set) => {
  return {
    videoList: [],
    setVideoList(list) {
      set({ videoList: list })
    },
    currentIndex: 0,
    setCurrentIndex(index) {
      set((state) => {
        // TODO: This code is being repeated in multiple places (player-modal). Refactor it.
        const { duration, currentTime } = usePlayerControlStore.getState()
        const playerProgress = Math.round((currentTime / duration) * 100)
        if (isNaN(playerProgress)) {
          return { currentIndex: index }
        }

        const properties = {
          content_category: 'loop',
          content_id: state.videoList[state.currentIndex]?.video?.id,
          event_record_screen: 'feed',
          event_target_screen: 'none',
          video_length: duration,
          video_view_length: currentTime,
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

        const eventName = index < state.currentIndex ? 'Swipe Down' : 'Swipe Up'

        void Analytics.track({
          eventName,
          properties,
        })

        return { currentIndex: index }
      })
    },
  }
})
