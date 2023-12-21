import { create } from 'zustand'

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
      set((state) => ({ currentTime }))
    },
  }
})
