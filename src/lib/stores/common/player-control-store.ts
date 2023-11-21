import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

interface PlayerControlStoreType {
  shouldPlay: boolean
  muted: boolean
  toggleMuted: () => void
  play: () => void
  pause: () => void
  playerSizeBox: { height: number; width: number }
  updatePlayerSizeBox: (height: number, width: number) => void
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
    playerSizeBox: { height: 0, width: 0 },
    updatePlayerSizeBox(height, width) {
      set({ playerSizeBox: { height, width } })
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
