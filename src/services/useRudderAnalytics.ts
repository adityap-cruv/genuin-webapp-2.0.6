"use client"
import type { RudderAnalytics } from '@rudderstack/analytics-js';

let _rudderStack: Promise<RudderAnalytics> | undefined;
async function getRudderStack(): Promise<RudderAnalytics> {
  const { RudderAnalytics } = await import('@rudderstack/analytics-js');
  const analyticsInstance = new RudderAnalytics();

  analyticsInstance.load('2TKjFZvo9nt38kcH91svAZ2T1vl', 'https://rudderstack.qa.begenuin.com');

  // analyticsInstance.ready(() => {
  //   console.log('We are all set!!!');
  // });
  window.rudderanalytics = analyticsInstance;
  return analyticsInstance;
}
export async function rudderStackTrack (...args: Parameters<RudderAnalytics['track']>) {
  const x = await(_rudderStack ??= getRudderStack())
  x.track(...args)
}