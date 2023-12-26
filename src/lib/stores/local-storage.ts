import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { uuid } from 'uuidv4'

type LocalStorageType = {
  userId: string
}

export const useLocalStorage = create(
  persist<LocalStorageType>(
    (set) => {
      return { userId: uuid() }
    },
    { name: '_user_id_' }
  )
)
