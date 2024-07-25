import Analytics from '@/services/analytics'
import { create } from 'zustand'

type EmbedType = 'carousel' | 'standard_wall' | 'feed' | 'default'

type State = {
  activeVideoIndex: number
  muted: boolean
  embedType: EmbedType
  timeState: { duration: number; currentTime: number }
}

type PropertiesForAnalyticsType = {
  contentId: string
  contentUrl: string
}

type Actions = {
  changeActiveIndex: (index: number, propertiesForAnalytics?: PropertiesForAnalyticsType) => void
  toggleMuted: () => void
  setEmbedType: (type: EmbedType) => void
  setTimeState: (currentTime: number, duration: number) => void
}

export const useEmbedPlayerState = create<State & Actions>((set) => {
  return {
    activeVideoIndex: 0,
    muted: true,
    embedType: 'default',
    timeState: {
      duration: 0,
      currentTime: 0,
    },
    setTimeState(currentTime, duration) {
      set({ timeState: { currentTime, duration } })
    },
    setEmbedType(type) {
      set({ embedType: type })
    },
    changeActiveIndex(index, properties) {
      set((state) => {
        if (state.activeVideoIndex === index) return state
        const { duration, currentTime } = state.timeState
        const playerProgress = Math.round((currentTime / duration) * 100)

        if (isNaN(playerProgress)) {
          const eventProperties = {
            content_category: 'loop',
            content_id: properties?.contentId,
            content_url: properties?.contentUrl,
            event_record_screen: 'embed',
            video_length: duration,
            video_view_length: currentTime,
          }
          void Analytics.track({
            eventName: 'Video Impression',
            properties: eventProperties,
          })
          return { activeVideoIndex: index }
        }
        Analytics.triggerAnalyticsForVideoProgress(
          properties?.contentId ?? '',
          duration,
          currentTime,
          playerProgress,
          'embed',
          state.activeVideoIndex
        )
        return { activeVideoIndex: index }
      })
    },
    toggleMuted() {
      set({ muted: false })
    },
  }
})
