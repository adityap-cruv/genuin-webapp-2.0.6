'use client'
import { useGenuinOptions } from '@lib/stores/genuin-options'
import type { RudderAnalytics } from '@rudderstack/analytics-js'
import { getIpAddress } from '@/lib/api/config'
import { useLocalStorage } from '@/lib/stores/local-storage'

export async function rudderStackTrack(eventName: string, properties: Record<string, string | number | undefined>) {
  const x = window.rudderanalytics as RudderAnalytics | undefined | null
  const brandId = useGenuinOptions.getState().brandId
  if (properties && brandId) (properties as any).brand_id = brandId
  x?.track(eventName, properties)
}

export async function rudderStackIdentify() {
  const ip = await getIpAddress()
  const x = window.rudderanalytics as RudderAnalytics | undefined | null
  const userId = useGenuinOptions.getState().user?.id ?? useLocalStorage.getState().userId
  x?.identify(userId, {}, { ip })
}
