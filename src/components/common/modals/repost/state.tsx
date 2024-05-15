import { create } from 'zustand'
import { type RepostCommunityListType } from './schema'
import { fetchRepostDestinations } from './api'

type States = {
  isOpen: boolean
  videoId: string
  repostCommunityData: RepostCommunityListType | null
  isLoading: boolean
}

type Actions = {
  open: (videoId: string) => void
  close: () => void
  getData: (videoId: string) => Promise<void>
}

const initialStates: States = {
  isOpen: false,
  videoId: '',
  isLoading: true,
  repostCommunityData: null,
}

export const useRepostModalStore = create<Actions & States>((set) => {
  return {
    ...initialStates,
    async getData(videoId) {
      try {
        const data = await fetchRepostDestinations(videoId)
        set({ repostCommunityData: data, isLoading: false })
      } catch (e) {
        console.log('error in getting data::', e)
      }
    },
    open(videoId: string) {
      set((state) => {
        void state.getData(videoId)
        return { isOpen: true, videoId }
      })
    },
    close() {
      set({ ...initialStates })
    },
  }
})
