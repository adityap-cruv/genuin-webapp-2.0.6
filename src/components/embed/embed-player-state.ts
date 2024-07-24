import { create } from 'zustand'

type EmbedType = 'carousel' | 'standard_wall' | 'feed' | 'default'

type State = {
  activeVideoId: string
  muted: boolean
  embedType: EmbedType
  timeState: { duration: number; currentTime: number }
}

type Actions = {
  setActiveVideoId: (id: string) => void
  toggleMuted: () => void
  setEmbedType: (type: EmbedType) => void
  setTimeState: (currentTime: number, duration: number) => void
}

export const useEmbedPlayerState = create<State & Actions>((set) => {
  return {
    activeVideoId: '',
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
    setActiveVideoId(id) {
      set({ activeVideoId: id })
    },
    toggleMuted() {
      set({ muted: false })
    },
  }
})
