import { create } from 'zustand'
import Analytics from '@services/analytics'
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
        if (index !== state.currentIndex) {
          const { duration, currentTime } = usePlayerControlStore.getState()
          const numberOfVideos = state.videos.length
          const progressValue = duration === 0 ? 0 : Math.round((currentTime / duration) * 100)
          const hasCrossed50 = progressValue > 50
          const usersdata = JSON.parse(localStorage.getItem('_user_id_') ?? '')
          const userId = usersdata.state.userId ?? ''

          if (index !== -1 && numberOfVideos > index) {
            const eventName = index < state.currentIndex ? 'Swipe Down' : 'Swipe Up'
            const properties = {
              content_category: 'loop',
              content_id: state.videos[state.currentIndex]?.video.id,
              event_record_screen: 'feed',
              event_target_screen: 'none',
              video_length: duration,
              video_view_length: currentTime,
              user_id: userId,
            }

            if (hasCrossed50) {
              void Analytics.track({
                eventName,
                properties,
              })

              void Analytics.track({
                eventName: 'Video Watched',
                properties,
              })
              Analytics.pushVideoWatch(state.videos[state.currentIndex]?.video.id)
            }
          }
          return { currentIndex: index }
        }

        return state
      })
    },
  }
})
