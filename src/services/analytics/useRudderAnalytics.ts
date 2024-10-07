'use client'
import { useGenuinOptions } from '@lib/stores/genuin-options'
import type { RudderAnalytics } from '@rudderstack/analytics-js'
import { getIpAddress } from '@/lib/api/config'
import { useLocalStorage } from '@/lib/stores/local-storage'

export async function rudderStackTrack(...args: Parameters<RudderAnalytics['track']>) {
  const x = window.rudderanalytics as RudderAnalytics | undefined | null
  const brandId = useGenuinOptions.getState().brandId
  if (args[1] && brandId) (args[1] as any).brand_id = brandId
  x?.track(...args)
}

export async function rudderStackIdentify() {
  const ip = await getIpAddress()
  const x = window.rudderanalytics as RudderAnalytics | undefined | null
  const userId = useGenuinOptions.getState().user?.id ?? useLocalStorage.getState().userId
  x?.identify(userId, {}, { ip })
}
