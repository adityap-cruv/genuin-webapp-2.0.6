import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

type StateType = {
  embed: boolean
  brandId: string
  logoUrl: string
  showNavbar: boolean
}

type ActionsType = {
  setData: (data: StateType) => void
}

export const useEmbedDataStore = create(
  persist<StateType & ActionsType>(
    (set, get) => {
      return {
        embed: false,
        brandId: '',
        logoUrl: '',
        showNavbar: true,
        setData(data) {
          set(data)
        },
      }
    },
    { name: 'embed-options', storage: createJSONStorage(() => sessionStorage) }
  )
)
