import { create } from 'zustand'

type CommentsStoreType = {
  modalIsOpen: boolean
  /**
   * This variable is used for opening modal.
   */
  currentVideoId: string
  openModal: (videoId: string) => void
  closeModal: () => void
  comments: any[]
  /**
   * This variable is used for playing comment if user clicks on it.
   */
  activeCommentIndex: string
  setActiveCommentIndex: (index: string) => void
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
    activeCommentIndex: '',
    setActiveCommentIndex(index) {
      set({ activeCommentIndex: index })
    },
  }
})
