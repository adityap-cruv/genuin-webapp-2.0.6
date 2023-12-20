import { type VideoDataType } from '@lib/schemas/video'
import { create } from 'zustand'

type FeedListStoreType = {
  videoList: VideoDataType[]
  setVideoList: (list: VideoDataType[]) => void
  currentIndex: number
  currentVideoDetails: VideoDataType | undefined
  setCurrentIndex: (index: number) => void
}

export const useFeedListStore = create<FeedListStoreType>((set) => {
  return {
    videoList: [],
    setVideoList(list) {
      set({ videoList: list })
    },
    currentIndex: 0,
    currentVideoDetails: undefined,
    setCurrentIndex(index) {
      set((state) => {
        state.currentVideoDetails = state.videoList[index]
        state.currentIndex = index
        return state
      })
    },
  }
})
