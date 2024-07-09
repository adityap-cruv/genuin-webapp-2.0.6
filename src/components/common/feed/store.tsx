import { create } from 'zustand'
import { usePlayerControlStore } from '../player/player-control-store'
import Analytics from '@services/analytics'
import { type VideoPlayerModalType } from '@lib/schemas/player/video'

type FeedListStoreType = {
  videoList: VideoPlayerModalType[]
  setVideoList: (list: VideoPlayerModalType[]) => void
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
      set((state) => {
        if (index !== state.currentIndex) {
          const { duration, currentTime } = usePlayerControlStore.getState()
          const numberOfVideos = state.videoList.length
          const progressValue = Math.round((currentTime / duration) * 100)
          const hasCrossed50 = progressValue > 50

          // console.log('state::', state.videoList, state.currentIndex)
          if (index !== -1 && numberOfVideos > index) {
            const eventName = index < state.currentIndex ? 'Swipe Down' : 'Swipe Up'
            const properties = {
              content_category: 'loop',
              content_id: state.videoList[state.currentIndex]?.video?.id,
              event_record_screen: 'feed',
              event_target_screen: 'none',
              video_length: duration,
              video_view_length: currentTime,
            }
            void Analytics.track({
              eventName,
              properties,
            })
            if (hasCrossed50) {
              void Analytics.track({
                eventName: 'Video Watched',
                properties,
              })
              Analytics.pushVideoWatch(state.videoList[state.currentIndex]?.video?.id)
            }
          }
        }

        return { currentIndex: index }
      })
    },
  }
})
