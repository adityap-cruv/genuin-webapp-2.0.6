import { create } from 'zustand'

// Define the type for a transaction
// type Transaction = {
//   amount: number
//   created_at: number
//   metadata: Record<string, any> | null
//   status: string
//   title: string
//   transaction_id: number
// }

type WalletDetailsType = {
  lifetime_cash_balance: number
  lifetime_point_balance: number
  point_balance: number
  cash_balance: number
}

type WalletStoreType = {
  currentCardView: string
  setCurrentCardView: (view: string) => void
  walletDetails: WalletDetailsType
  setWalletDetails: (walletDetails: WalletDetailsType) => void
}

export const useWalletStore = create<WalletStoreType>((set) => ({
  currentCardView: 'Reward',
  setCurrentCardView: (view: string) => {
    set({ currentCardView: view })
  },
  walletDetails: {
    lifetime_cash_balance: 0,
    lifetime_point_balance: 0,
    point_balance: 0,
    cash_balance: 0,
  },
  setWalletDetails: (walletDetails) => {
    set({ walletDetails })
  },
}))
