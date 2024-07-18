import { axiosInstance } from '@lib/api/instance'
import { rudderStackTrack } from './useRudderAnalytics'
import { useGenuinOptions } from '@lib/stores/genuin-options'
import { useLocalStorage } from '@/lib/stores/local-storage'

export type PropertiesType = Record<string, string | number | undefined>

export const Analytics = {
  track: async ({ eventName, properties }: { eventName: string; properties: PropertiesType }): Promise<void> => {
    const { user, brandId, config } = useGenuinOptions.getState()
    let channel = !config ? 'genuin web' : 'white label'
    let embedId
    if (window !== window.parent) {
      channel = 'web sdk'
      const pathName = window.location.pathname
      const pathArr = pathName.split('/')
      const embedIndex = pathArr.findIndex((item) => item === 'embed')
      embedId = pathArr[embedIndex + 1]
    }
    const userId = user?.id ? user.id : useLocalStorage.getState().userId
    const defaultProperties = { user_id: userId, brand_id: brandId || undefined, channel, embed_id: embedId }

    const updatedProperties = { ...properties, ...defaultProperties }

    await rudderStackTrack(eventName, updatedProperties)
  },
  pushVideoWatch(videoId: string) {
    void axiosInstance.put('/api/v3/video_view', {
      video_id: videoId,
      type: 2,
    })
  },
}
export default Analytics
