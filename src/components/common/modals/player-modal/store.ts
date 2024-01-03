import { type VideoDataListType } from '@lib/schemas/video'
import { create } from 'zustand'

type FeedModalStore = {
  videos: VideoDataListType
  setVideos: (videos: VideoDataListType) => void
  currentIndex: number
  setCurrentIndex: (index: number) => void
}

export const useFeedModalStore = create<FeedModalStore>((set) => {
  return {
    videos: [],
    setVideos(videos: VideoDataListType) {
      set({ videos })
    },
    currentIndex: 0,
    setCurrentIndex(index) {
      set((state) => {
        const numberOfVideos = state.videos.length
        if (index !== -1 && numberOfVideos > index) return { currentIndex: index }
        return state
      })
    },
  }
})
