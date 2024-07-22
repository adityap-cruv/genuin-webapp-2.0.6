import { create } from 'zustand'

type EmbedType = 'carousel' | 'standard_wall' | 'feed' | 'default'

type State = {
  activeVideoId: string
  muted: boolean
  embedType: EmbedType
}

type Actions = {
  setActiveVideoId: (id: string) => void
  toggleMuted: () => void
  setEmbedType: (type: EmbedType) => void
}

export const useEmbedPlayerState = create<State & Actions>((set) => {
  return {
    activeVideoId: '',
    muted: true,
    embedType: 'default',
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
