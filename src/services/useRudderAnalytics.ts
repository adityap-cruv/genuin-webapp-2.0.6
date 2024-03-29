'use client'
import type { RudderAnalytics } from '@rudderstack/analytics-js'

let _rudderStack: Promise<RudderAnalytics> | undefined
async function getRudderStack(): Promise<RudderAnalytics> {
  const { RudderAnalytics } = await import('@rudderstack/analytics-js')
  const analyticsInstance = new RudderAnalytics()
  console.log('analyticsInstance:', analyticsInstance)
  // analyticsInstance.load(process.env.NEXT_PUBLIC_RUDDERSTACK_KEY ?? '', process.env.NEXT_PUBLIC_RUDDERSTACK_URL ?? '')

  // analyticsInstance.ready(() => {
  //   console.log('We are all set!!!');
  // });
  window.rudderanalytics = analyticsInstance
  return analyticsInstance
}
export async function rudderStackTrack(...args: Parameters<RudderAnalytics['track']>) {
  const x = await (_rudderStack ??= getRudderStack())
  x.track(...args)
}
