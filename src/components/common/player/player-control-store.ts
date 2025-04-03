import { create } from 'zustand'
import { Analytics } from '@services/analytics'

type ButtonActionType = 'mute' | 'unmute' | 'play' | 'pause' | ''

export type PlayerControlStoreType = {
  isPlaying: boolean
  shouldPlay: boolean
  muted: boolean
  toggleMuted: ({ byUser, videoId }: { byUser?: boolean; videoId?: string }) => void
  mute: () => void
  showMutedLayer: boolean
  toggleMutedLayer: () => void
  play: () => void
  pause: () => void
  setIsPlaying: (isPlaying: boolean) => void
  toggleShouldPlay: () => void
  /**
   * Set shouldPlay and buttonAction.
   * If user is playing the video, pass byUser to true.
   * @param shouldPlay
   * @param byUser
   * @returns
   */
  setShouldPlay: (shouldPlay: boolean, byUser?: boolean) => void
  duration: number
  currentTime: number
  setTimeState: (currentTime: number, duration: number, videoId: string) => void
  volume: number
  setVolume: (volume: number) => void
  prevVolume: number
  buttonAction: ButtonActionType
  isFullScreen: boolean
  toggleFullScreen: () => void
  isCommentBoxOpen: boolean
  toggleCommentBox: () => void
  playingState?: 'paused' | 'playing' | 'loading'
  setPlayingState: (state?: 'paused' | 'playing' | 'loading') => void
}

export const usePlayerControlStore = create<PlayerControlStoreType>((set) => {
  return {
    shouldPlay: true,
    muted: true,
    showMutedLayer: true,
    volume: 0,
    prevVolume: 100,
    playingState: 'loading',
    setPlayingState: (state) => {
      set((oldState) => ({ playingState: state, ...(oldState.playingState === 'loading' && { buttonAction: '' }) }))
    },
    toggleMutedLayer() {
      set((state) => ({ showMutedLayer: !state.showMutedLayer }))
    },
    mute() {
      set((state) => ({ muted: true, prevVolume: state.volume, volume: 0 }))
    },
    toggleMuted({ byUser, videoId }) {
      set((state) => {
        const newMuted = !state.muted
        const prevVolume = state.volume > 0 ? state.volume : state.prevVolume
        void Analytics.track({
          eventName: newMuted ? 'Muted' : 'Unmuted',
          properties: { video_id: videoId },
        })
        return {
          muted: newMuted,
          volume: newMuted ? 0 : prevVolume > 0 ? prevVolume : 100,
          prevVolume: state.volume > 0 ? state.volume : state.prevVolume,
          ...(!!byUser && { buttonAction: newMuted ? 'mute' : 'unmute' }),
        }
      })
    },
    play() {
      set({ shouldPlay: true, buttonAction: 'pause' })
    },
    pause() {
      set({ shouldPlay: false, buttonAction: 'play' })
    },
    toggleShouldPlay() {
      set((state) => ({
        shouldPlay: !state.shouldPlay,
      }))
    },
    setShouldPlay(shouldPlay, byUser) {
      set({ shouldPlay, ...(!!byUser && { buttonAction: !shouldPlay ? 'pause' : 'play' }) })
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

    // For Full Screen
    isFullScreen: false,
    toggleFullScreen() {
      set((state) => ({
        isFullScreen: !state.isFullScreen,
        isCommentBoxOpen: state.isFullScreen ? false : state.isCommentBoxOpen,
      }))
    },
    // For comment box.
    isCommentBoxOpen: false,
    toggleCommentBox() {
      set((state) => ({ isCommentBoxOpen: !state.isCommentBoxOpen }))
    },
  }
})
