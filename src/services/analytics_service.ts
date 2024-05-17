import { axiosInstance } from '@lib/api/instance'
import { rudderStackTrack } from './useRudderAnalytics'

export const analyticsService = async ({
  eventName,
  properties,
}: {
  eventName: string
  properties: any
}): Promise<void> => {
  await rudderStackTrack(eventName, properties)
}

export function pushVideoWatch(videoId: string) {
  void axiosInstance.put('/api/v3/video_view', {
    video_id: videoId,
    type: 2,
  })
}
