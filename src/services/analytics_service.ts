import { axiosInstance } from '@lib/api/instance'
import { rudderStackTrack } from './useRudderAnalytics'
import { tryJsonParse } from '@lib/utils'

export const analyticsService = async ({
  eventName,
  properties,
}: {
  eventName: string
  properties: any
}): Promise<void> => {
  const userIdString = localStorage.getItem('_user_id_')
  const userId = userIdString ? tryJsonParse(userIdString).state.userId ?? '' : ''
  const defaultProperties = { user_id: userId }

  const updatedProperties = { ...properties, ...defaultProperties }
  await rudderStackTrack(eventName, updatedProperties)
}

export function pushVideoWatch(videoId: string) {
  void axiosInstance.put('/api/v3/video_view', {
    video_id: videoId,
    type: 2,
  })
}
