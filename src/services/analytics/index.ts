import { axiosInstance } from '@lib/api/instance'
import { rudderStackTrack } from './useRudderAnalytics'
import { useGenuinOptions } from '@lib/stores/genuin-options'
import { useLocalStorage } from '@/lib/stores/local-storage'
import { useEmbedPlayerState } from '@/components/embed/embed-player-state'
import { useWalletBalanceHandler } from '../wallet-handler'

export type PropertiesType = Record<string, string | number | undefined>

type AnalyticsTrackType = {
  eventName: string
  properties: PropertiesType
}

export const Analytics = {
  track: async ({ eventName, properties }: AnalyticsTrackType): Promise<void> => {
    const { user, brandId, config } = useGenuinOptions.getState()
    let channel = !config ? 'genuin web' : 'white label'
    let embedId
    const environment = config ? config.environment : undefined
    if (window !== window.parent) {
      channel = 'web sdk'
      const pathName = window.location.pathname
      const pathArr = pathName.split('/')
      const embedIndex = pathArr.findIndex((item) => item === 'embed')
      embedId = pathArr[embedIndex + 1]
      // page = {
      //   url: window.parent.location.href,
      //   path: window.parent.location.pathname,
      // }
    }
    const userId = user?.id ? user.id : useLocalStorage.getState().userId
    const embedType = embedId ? useEmbedPlayerState.getState().embedType : undefined
    const defaultProperties = {
      embed_type: embedType,
      user_id: userId,
      brand_id: brandId || undefined,
      channel,
      embed_id: embedId,
      environment,
    }

    Object.assign(properties, defaultProperties)

    await rudderStackTrack(eventName, properties)
  },
  pushVideoWatch(videoId: string) {
    void axiosInstance.put('/api/v3/video_view', {
      video_id: videoId,
      type: 2,
    })
  },
  triggerAnalyticsForVideoComplete(
    videoId: string,
    duration: number,
    currentTime: number,
    recordScreen?: string,
    position?: number
  ) {
    const properties = {
      content_category: 'loop',
      content_id: videoId,
      event_record_screen: recordScreen ?? 'feed',
      event_target_screen: 'none',
      video_length: duration,
      video_view_length: currentTime,
      video_position: position,
    }
    void Analytics.track({ eventName: 'Video Impression', properties })

    void Analytics.track({
      eventName: 'Video First Quartile',
      properties,
    })

    void Analytics.track({
      eventName: 'Video Watched',
      properties,
    })

    void Analytics.track({
      eventName: 'Video Third Quartile',
      properties,
    })

    void Analytics.track({
      eventName: 'Video Complete',
      properties,
    })

    const { handleWalletBalance } = useWalletBalanceHandler()
    void handleWalletBalance({ action: 'view', videoId, type: 'POST' })
  },
  triggerAnalyticsForVideoProgress(
    videoId: string,
    duration: number,
    currentTime: number,
    playerProgress: number,
    recordScreen?: string,
    position?: number
  ) {
    const properties = {
      content_category: 'loop',
      content_id: videoId,
      event_record_screen: recordScreen ?? 'feed',
      event_target_screen: 'none',
      video_length: duration,
      video_view_length: currentTime,
      video_position: position,
    }
    void Analytics.track({ eventName: 'Video Impression', properties })
    if (playerProgress >= 25) {
      void Analytics.track({
        eventName: 'Video First Quartile',
        properties,
      })
    }

    if (playerProgress >= 50) {
      void Analytics.track({
        eventName: 'Video Watched',
        properties,
      })
    }

    if (playerProgress >= 75) {
      void Analytics.track({
        eventName: 'Video Third Quartile',
        properties,
      })
    }
  },
}
export default Analytics
