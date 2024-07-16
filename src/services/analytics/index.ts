import { axiosInstance } from '@lib/api/instance'
import { rudderStackTrack } from './useRudderAnalytics'
import { useGenuinOptions } from '@lib/stores/genuin-options'

export type PropertiesType = Record<string, string | number | undefined>

export const Analytics = {
  track: async ({ eventName, properties }: { eventName: string; properties: PropertiesType }): Promise<void> => {
    const defaultProperties = { user_id: useGenuinOptions.getState().user?.id, channel: 'genuin web' }

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
