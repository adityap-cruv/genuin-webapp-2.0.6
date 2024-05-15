import { create } from 'zustand'

type States = {
  isOpen: boolean
}

type Actions = {
  open: () => void
}

export const useRepostModalStore = create<Actions & States>((set) => {
  return {
    isOpen: false,
    open() {
      set({ isOpen: true })
    },
  }
})
