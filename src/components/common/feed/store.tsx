import { type VideoDataType } from '@lib/schemas/video'
import { create } from 'zustand'
import { usePlayerControlStore } from '../player/player-control-store'
import { analyticsService } from '../../../services/analytics_service'

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
      set((state) => {
        if (index !== state.currentIndex) {
          const { duration, currentTime } = usePlayerControlStore.getState()
          const numberOfVideos = state.videoList.length
          const progressValue = Math.round((currentTime / duration) * 100)
          const hasCrossed50 = progressValue > 50
          const usersdata = JSON.parse(localStorage.getItem('_user_id_') ?? '')
          const userId = usersdata.state.userId ?? ''

          // console.log('state::', state.videoList, state.currentIndex)
          if (index !== -1 && numberOfVideos > index) {
            const eventName = index < state.currentIndex ? 'Swipe Up' : 'Swipe Down'
            const properties = {
              content_category: 'loop',
              content_id: state.videoList[state.currentIndex]?.video?.id,
              event_record_screen: 'feed',
              event_target_screen: 'none',
              video_length: duration,
              video_view_length: currentTime,
              user_id: userId,
            }
            void analyticsService({
              eventName,
              properties,
            })
            if (hasCrossed50) {
              void analyticsService({
                eventName: 'Video Watched',
                properties,
              })
            }
          }
        }

        return { currentIndex: index }
      })
    },
  }
})
