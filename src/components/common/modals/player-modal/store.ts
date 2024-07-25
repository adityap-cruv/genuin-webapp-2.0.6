import { create } from 'zustand'
import Analytics from '@/services/analytics'
import { usePlayerControlStore } from '@components/common/player/player-control-store'
import { type VideoPlayerModalType } from '@lib/schemas/player/video'

type FeedModalStore = {
  videos: VideoPlayerModalType[]
  setVideos: (videos: VideoPlayerModalType[]) => void
  currentIndex: number
  setCurrentIndex: (index: number) => void
}

export const useFeedModalStore = create<FeedModalStore>((set, get) => {
  return {
    videos: [],
    setVideos(videos) {
      set({ videos })
    },
    currentIndex: 0,
    setCurrentIndex(index) {
      set((state) => {
        const { duration, currentTime } = usePlayerControlStore.getState()
        const playerProgress = Math.round((currentTime / duration) * 100)
        const contentId = state.videos[state.currentIndex]?.video?.id
        const properties = {
          content_category: 'loop',
          content_id: contentId,
          content_type: 'video',
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

        if (isNaN(playerProgress)) return { currentIndex: index }

        // TODO: figure out record screen and check with nayan/ankit about the record screen.
        Analytics.triggerAnalyticsForVideoProgress(contentId, duration, currentTime, playerProgress, 'profile')

        return { currentIndex: index }
      })
    },
  }
})
