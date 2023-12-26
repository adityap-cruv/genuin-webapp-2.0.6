import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { v4 } from 'uuid'

type LocalStorageType = {
  userId: string
}

export const useLocalStorage = create(
  persist<LocalStorageType>(
    (set) => {
      return { userId: v4() }
    },
    { name: '_user_id_' }
  )
)
