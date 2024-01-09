import { type VideoDataType } from '@lib/schemas/video'
import { create } from 'zustand'

type FeedListStoreType = {
  videoList: VideoDataType[]
  setVideoList: (list: VideoDataType[]) => void
  currentIndex: number
  setCurrentIndex: (index: number) => void
}

export const useFeedListStore = create<FeedListStoreType>((set) => {
  return {
    videoList: [],
    setVideoList(list) {
      set({ videoList: list })
    },
    currentIndex: 0,
    setCurrentIndex(index) {
      set({ currentIndex: index })
    },
  }
})
