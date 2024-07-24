import { create } from 'zustand'

type EmbedType = 'carousel' | 'standard_wall' | 'feed' | 'default'

type State = {
  activeVideoIndex: number
  muted: boolean
  embedType: EmbedType
  timeState: { duration: number; currentTime: number }
}

type Actions = {
  changeActiveIndex: (index: number) => void
  toggleMuted: () => void
  setEmbedType: (type: EmbedType) => void
  setTimeState: (currentTime: number, duration: number) => void
}

export const useEmbedPlayerState = create<State & Actions>((set) => {
  return {
    activeVideoIndex: 0,
    muted: true,
    embedType: 'default',
    timeState: {
      duration: 0,
      currentTime: 0,
    },
    setTimeState(currentTime, duration) {
      set({ timeState: { currentTime, duration } })
    },
    setEmbedType(type) {
      set({ embedType: type })
    },
    changeActiveIndex(index) {
      set((state) => {
        return { activeVideoIndex: index }
      })
    },
    toggleMuted() {
      set({ muted: false })
    },
  }
})
