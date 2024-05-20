import { create } from 'zustand'

type State = {
  activeVideoId: string
  muted: boolean
}

type Actions = {
  setActiveVideoId: (id: string) => void
  toggleMuted: () => void
}

export const useEmbedPlayerState = create<State & Actions>((set) => {
  return {
    activeVideoId: '',
    muted: true,
    setActiveVideoId(id) {
      set({ activeVideoId: id })
    },
    toggleMuted() {
      set({ muted: false })
    },
  }
})
