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
