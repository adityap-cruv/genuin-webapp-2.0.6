import { create } from 'zustand'
import { Analytics } from '../../../services/analytics'
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
      const feedStore = useFeedListStore.getState()
      const modalStore = useFeedModalStore.getState()

      const videoList = feedStore.videoList.length === 0 ? modalStore.videos : feedStore.videoList
      const currentIndex = feedStore.videoList.length === 0 ? modalStore.currentIndex : feedStore.currentIndex

      const progressValue = Math.round((currentTime / duration) * 100)

      let eventName, progressEvent

      if (progressValue >= 25 && progressValue < 26) {
        eventName = 'video_first_quartile'
      } else if (progressValue >= 75 && progressValue < 76) {
        eventName = 'video_third_quartile'
      } else if (currentTime >= duration) {
        eventName = 'video_complete'
      }

      if (eventName) {
        progressEvent = {
          eventName,
          properties: {
            content_category: 'loop',
            content_id: videoList[currentIndex].video?.id,
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
    latency: 0,
    setLatency(latency) {
      set((state) => {
        if (latency !== 0) {
          const { videoList: feedVideoList, currentIndex: feedCurrentIndex } = useFeedListStore.getState()
          const { videos: modalVideoList, currentIndex: modalCurrentIndex } = useFeedModalStore.getState()

          const finalVideoList = feedVideoList.length === 0 ? modalVideoList : feedVideoList
          const finalIndex = feedVideoList.length === 0 ? modalCurrentIndex : feedCurrentIndex

          void Analytics.track({
            eventName: 'Video Started',
            properties: {
              latency,
              video_id: finalVideoList[finalIndex].video.id,
              video_length: state.duration,
              video_url: finalVideoList[finalIndex].video.source,
            },
          })
        }
        return { latency }
      })
    },
  }
})
