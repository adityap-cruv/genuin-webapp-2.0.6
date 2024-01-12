import { create } from 'zustand'
import { analyticsService } from '../../../services/analytics_service'
import { useFeedListStore } from '../feed/store'

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
      set((state) => {
        const { videoList, currentIndex } = useFeedListStore.getState()

        const progressValue = Math.round((currentTime / state.duration) * 100)
        if(progressValue > 95 && state.duration !== 0){
          void analyticsService({
            eventName: 'Video Ended',
            properties: {
              content_category: 'loop',
              content_id: videoList[currentIndex].video.id,
              event_record_screen: 'feed',
              event_target_screen: 'none',
              video_length: state.duration,
              video_view_length: currentTime,
            },
          })
        }
        return { currentTime }
      })
    },
  }
})
