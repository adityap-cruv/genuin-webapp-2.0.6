import { create } from 'zustand'
import { analyticsService } from '../../../../services/analytics_service'
import { usePlayerControlStore } from '@components/common/player/player-control-store'
import { type LoopVideoListType } from '@lib/schemas/loop/videos'

type FeedModalStore = {
  videos: LoopVideoListType
  setVideos: (videos: LoopVideoListType) => void
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
        if (index !== state.currentIndex) {
          const { duration, currentTime } = usePlayerControlStore.getState()
          const numberOfVideos = state.videos.length
          const progressValue = duration === 0 ? 0 : Math.round((currentTime / duration) * 100)
          const hasCrossed50 = progressValue > 50
          const usersdata = JSON.parse(localStorage.getItem('_user_id_') ?? '')
          const userId = usersdata.state.userId ?? ''

          if (index !== -1 && numberOfVideos > index) {
            const eventName = index < state.currentIndex ? 'Swipe Up' : 'Swipe Down'
            const properties = {
              content_category: 'loop',
              content_id: state.videos[state.currentIndex]?.message_id,
              event_record_screen: 'feed',
              event_target_screen: 'none',
              video_length: duration,
              video_view_length: currentTime,
              user_id: userId,
            }

            if (hasCrossed50) {
              void analyticsService({
                eventName,
                properties,
              })

              void analyticsService({
                eventName: 'Video Watched',
                properties,
              })
            }
          }
          return { currentIndex: index }
        }

        return state
      })
    },
  }
})
