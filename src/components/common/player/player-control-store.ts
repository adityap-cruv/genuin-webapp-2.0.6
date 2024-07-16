import { create } from 'zustand'
import { Analytics } from '@services/analytics'

type PlayerControlStoreType = {
  isPlaying: boolean
  shouldPlay: boolean
  muted: boolean
  toggleMuted: () => void
  play: () => void
  pause: () => void
  setIsPlaying: (isPlaying: boolean) => void
  toggleShouldPlay: () => void
  setShouldPlay: (shouldPlay: boolean) => void
  duration: number
  currentTime: number
  setTimeState: (currentTime: number, duration: number, videoId: string) => void
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
    currentTime: 0,
    isPlaying: false,
    setIsPlaying(isPlaying) {
      set({ isPlaying })
    },
    setTimeState(currentTime, duration, videoId) {
      const progressValue = Math.round((currentTime / duration) * 100)

      let eventName, progressEvent

      if (progressValue >= 25 && progressValue < 26) {
        eventName = 'Video First Quartile'
      }
      if (progressValue >= 75 && progressValue < 76) {
        eventName = 'Video Third Quartile'
      }

      if (eventName) {
        progressEvent = {
          eventName,
          properties: {
            content_category: 'loop',
            content_id: videoId,
            event_record_screen: 'feed',
            event_target_screen: 'none',
            video_length: duration,
            video_view_length: currentTime,
          },
        }

        void Analytics.track(progressEvent)
      }

      set({ currentTime, duration })
    },
  }
})
