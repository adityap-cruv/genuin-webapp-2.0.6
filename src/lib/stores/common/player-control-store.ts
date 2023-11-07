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
  }
})
