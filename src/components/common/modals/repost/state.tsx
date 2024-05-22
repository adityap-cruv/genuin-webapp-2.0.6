import { create } from 'zustand'
import { type RepostCommunityListType } from './schema'
import { fetchRepostDestinations } from './api'

type States = {
  isOpen: boolean
  videoId: string
  repostCommunityData: RepostCommunityListType | null
  filteredRepostCommunityData: RepostCommunityListType | null
  isLoading: boolean
  searchStr: string
}

type Actions = {
  open: (videoId: string) => void
  close: () => void
  getData: (videoId: string) => Promise<void>
  search: (searchStr: string) => void
}

const initialStates: States = {
  isOpen: false,
  videoId: '',
  searchStr: '',
  isLoading: true,
  repostCommunityData: null,
  filteredRepostCommunityData: null,
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
    search(searchStr) {
      set((state) => {
        if (!searchStr) {
          state.filteredRepostCommunityData = null
          return { ...state }
        }
        const newData: RepostCommunityListType = []
        const data = state.repostCommunityData ? [...state.repostCommunityData] : []

        data?.forEach((item, index, arr) => {
          const filteredChats = item.chats.filter((item, index, arr) => {
            return item.group.group_name ? item.group.group_name.includes(searchStr) : false
          })
          if (filteredChats.length) {
            newData.push({ ...item, chats: filteredChats })
          } else {
            if (item.name?.includes(searchStr)) newData.push(item)
          }
        })

        state.filteredRepostCommunityData = newData
        state.searchStr = searchStr
        return { ...state }
      }, true)
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
