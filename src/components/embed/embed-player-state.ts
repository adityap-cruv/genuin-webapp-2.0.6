import { create } from 'zustand'

type State = {
  activeVideoId: string
  muted: boolean
}

type Actions = {
  setActiveVideoId: (id: string) => void
}

export const useEmbedPlayerState = create<State & Actions>((set) => {
  return {
    activeVideoId: '',
    muted: true,
    setActiveVideoId(id) {
      console.log('set::2', id)
      set({ activeVideoId: id })
    },
  }
})
