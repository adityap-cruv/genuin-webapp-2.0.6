import { create } from 'zustand'
import { Analytics } from '@services/analytics'

type PlayerControlStoreType = {
  isPlaying: boolean
  shouldPlay: boolean
  muted: boolean
  toggleMuted: () => void
  mute: () => void
  showMutedLayer: boolean
  toggleMutedLayer: () => void
  play: () => void
  pause: () => void
  setIsPlaying: (isPlaying: boolean) => void
  toggleShouldPlay: () => void
  setShouldPlay: (shouldPlay: boolean) => void
  duration: number
  currentTime: number
  setTimeState: (currentTime: number, duration: number, videoId: string) => void
  volume: number
  setVolume: (volume: number) => void
  prevVolume: number
  toggleButtonVisibility: (action: 'mute' | 'unmute' | 'play' | 'pause' | '') => void
  buttonAction: 'mute' | 'unmute' | 'play' | 'pause' | ''
  isIconVisible: boolean
  isFullScreen: boolean
  toggleFullScreen: () => void
  isCommentBoxOpen: boolean
  toggleCommentBox: () => void
}

export const usePlayerControlStore = create<PlayerControlStoreType>((set) => {
  return {
    shouldPlay: true,
    muted: true,
    showMutedLayer: true,
    volume: 0,
    prevVolume: 100,
    toggleMutedLayer() {
      set((state) => ({ showMutedLayer: !state.showMutedLayer }))
    },
    mute() {
      set((state) => ({ muted: true, prevVolume: state.volume, volume: 0 }))
    },
    toggleMuted() {
      set((state) => {
        const newMuted = !state.muted
        const prevVolume = state.volume > 0 ? state.volume : state.prevVolume
        return {
          muted: newMuted,
          volume: newMuted ? 0 : prevVolume > 0 ? prevVolume : 100,
          prevVolume: state.volume > 0 ? state.volume : state.prevVolume,
        }
      })
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
    setVolume(volume) {
      set((state) => ({
        volume,
        muted: volume === 0, // Auto-mute if volume is 0
        prevVolume: volume > 0 ? volume : state.prevVolume, // Store last non-zero volume
      }))
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

    // For Action button
    buttonAction: '',
    isIconVisible: false,
    toggleButtonVisibility(action: 'mute' | 'unmute' | 'play' | 'pause' | '') {
      if (!action) {
        set({ buttonAction: action })
        return
      } // Do nothing if there is no action

      set({ isIconVisible: true }) // Show the element
      set({ buttonAction: action }) // Set the button action (play, pause, etc.)

      // Hide the element after 1 second
      setTimeout(() => {
        set({ isIconVisible: false })
      }, 1000)
    },

    // For Full Screen
    isFullScreen: false,
    toggleFullScreen() {
      set((state) => ({
        isFullScreen: !state.isFullScreen,
        isCommentBoxOpen: state.isFullScreen ? false : state.isCommentBoxOpen,
      }))
    },
    isCommentBoxOpen: false,
    toggleCommentBox() {
      set((state) => ({ isCommentBoxOpen: !state.isCommentBoxOpen }))
    },
  }
})
