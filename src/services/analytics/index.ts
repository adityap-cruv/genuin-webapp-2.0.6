import { axiosInstance } from '@lib/api/instance'
import { rudderStackTrack } from './useRudderAnalytics'
import { useGenuinOptions } from '@lib/stores/genuin-options'
import { useLocalStorage } from '@/lib/stores/local-storage'
import { useEmbedPlayerState } from '@/components/embed/embed-player-state'

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

    const updatedProperties = { ...properties, ...defaultProperties }

    await rudderStackTrack(eventName, updatedProperties)
  },
  pushVideoWatch(videoId: string) {
    void axiosInstance.put('/api/v3/video_view', {
      video_id: videoId,
      type: 2,
    })
  },
  // triggerEventForEmbed({ eventName, properties }: { eventName: string; properties: any }) {
  //   Object.assign(properties, { embed_type: useEmbedPlayerState.getState().embedType })

  //   void Analytics.track({
  //     eventName,
  //     properties,
  //   })
  // },
}
export default Analytics
