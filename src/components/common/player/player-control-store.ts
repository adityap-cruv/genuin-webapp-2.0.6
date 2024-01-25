import { create } from 'zustand'
import { analyticsService } from '../../../services/analytics_service'
import { useFeedListStore } from '../feed/store'
import { useFeedModalStore } from '../modals/player-modal/store'

type PlayerControlStoreType = {
  shouldPlay: boolean
  muted: boolean
  toggleMuted: () => void
  play: () => void
  pause: () => void
  toggleShouldPlay: () => void
  setShouldPlay: (shouldPlay: boolean) => void
  duration: number
  setDuration: (duration: number) => void
  setCurrentTime: (currentTime: number) => void
  currentTime: number
  setTimeState: (currentTime: number, duration: number) => void
  latency: number
  setLatency: (latency: number) => void
}

export const usePlayerControlStore = create<PlayerControlStoreType>((set) => {
  return {
    shouldPlay: true,
    muted: true,
    toggleMuted() {
      set((state) => ({ muted: !state.muted }))
    },
    play() {
      set({ shouldPlay: true })
    },
    pause() {
      set({ shouldPlay: false })
    },
    toggleShouldPlay() {
      set((state) => ({
        shouldPlay: !state.shouldPlay,
      }))
    },
    setShouldPlay(shouldPlay) {
      set({ shouldPlay })
    },
    duration: 0,
    setDuration(duration) {
      set((state) => ({ duration }))
    },
    currentTime: 0,
    setCurrentTime(currentTime) {
      set((state) => ({ currentTime }))
    },
    setTimeState(currentTime, duration) {
      const { videoList: feedVideoList, currentIndex: feedCurrentIndex } = useFeedListStore.getState()
      const { videos: modalVideoList, currentIndex: modalCurrentIndex } = useFeedModalStore.getState()

      const finalVideoList = feedVideoList.length === 0 ? modalVideoList : feedVideoList
      const finalIndex = feedVideoList.length === 0 ? modalCurrentIndex : feedCurrentIndex

      const progressValue = Math.round((currentTime / duration) * 100)
      const usersdata = JSON.parse(localStorage.getItem('_user_id_') ?? '')
      const userId = usersdata.state.userId ?? ''

      if (progressValue > 95 && duration !== 0) {
        void analyticsService({
          eventName: 'Video Watched',
          properties: {
            content_category: 'loop',
            content_id: finalVideoList[finalIndex].video.id,
            event_record_screen: 'feed',
            event_target_screen: 'none',
            video_length: duration,
            video_view_length: currentTime,
            user_id: userId,
          },
        })
      }

      set({ currentTime, duration })
    },
    latency: 0,
    setLatency(latency) {
      set((state) => {
        if (latency !== 0) {
          const { videoList: feedVideoList, currentIndex: feedCurrentIndex } = useFeedListStore.getState()
          const { videos: modalVideoList, currentIndex: modalCurrentIndex } = useFeedModalStore.getState()

          const finalVideoList = feedVideoList.length === 0 ? modalVideoList : feedVideoList
          const finalIndex = feedVideoList.length === 0 ? modalCurrentIndex : feedCurrentIndex

          const usersdata = JSON.parse(localStorage.getItem('_user_id_') ?? '')
          const userId = usersdata.state.userId ?? ''

          void analyticsService({
            eventName: 'Video Started',
            properties: {
              latency,
              user_id: userId,
              video_id: finalVideoList[finalIndex].video.id,
              video_length: state.duration,
              video_url: finalVideoList[finalIndex].video.url,
            },
          })
        }
        return { latency }
      })
    },
  }
})
