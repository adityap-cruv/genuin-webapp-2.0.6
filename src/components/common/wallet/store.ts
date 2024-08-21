import { create } from 'zustand'

type WalletStoreType = {
  currentCardView: string
  setCurrentCardView: (view: string) => void
}

export const useWalletStore = create<WalletStoreType>((set) => {
  return {
    currentCardView: 'Reward',
    setCurrentCardView(view: string) {
      set({ currentCardView: view })
    },
  }
})
