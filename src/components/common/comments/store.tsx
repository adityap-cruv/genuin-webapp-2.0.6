import { create } from 'zustand'

type CommentStore = {
  /**
   * This variable is used for playing comment if user clicks on it.
   */
  activeCommentIndex: string
  setActiveCommentIndex: (index: string) => void
}

export const useCommentStore = create<CommentStore>((set) => ({
  activeCommentIndex: '',
  setActiveCommentIndex(index) {
    set({ activeCommentIndex: index })
  },
}))
