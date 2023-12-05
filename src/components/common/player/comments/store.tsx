import { create } from 'zustand'

type CommentsStoreType = {
  modalIsOpen: boolean
  currentVideoId: string
  openModal: (videoId: string) => void
  closeModal: () => void
  comments: any[]
}

export const useCommentsStore = create<CommentsStoreType>((set) => {
  return {
    modalIsOpen: false,
    currentVideoId: '',
    openModal(videoId: string) {
      set({ modalIsOpen: true, currentVideoId: videoId })
    },
    closeModal() {
      set({ modalIsOpen: false })
    },
    comments: [],
  }
})
