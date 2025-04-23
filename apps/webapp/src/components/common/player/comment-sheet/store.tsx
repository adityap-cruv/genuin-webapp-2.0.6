import { create } from 'zustand'

type CommentSheetStoreType = {
  modalIsOpen: boolean
  /**
   * This variable is used for opening modal.
   */
  currentVideoId: string
  openModal: (videoId: string) => void
  closeModal: () => void
  comments: any[]
}

export const useCommentSheetStore = create<CommentSheetStoreType>((set) => {
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
  }
})
