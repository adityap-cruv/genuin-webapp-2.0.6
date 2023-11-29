import { type VideoDataListType } from '@lib/schemas/video'
import { create } from 'zustand'

type TabsStoreType = {
  currentIndex: number
  setCurrentIndex: (newIndex: number) => void
  videos: VideoDataListType
  setVideos: (newVideos: VideoDataListType) => void
}

export const useTabsStore = create<TabsStoreType>((set) => {
  return {
    currentIndex: -1,
    setCurrentIndex(newIndex) {
      set({ currentIndex: newIndex })
    },
    videos: [],
    setVideos(newVideos) {
      set({ videos: newVideos })
    },
  }
})
