'use client'
import { useEffect, useRef } from 'react'
import { RudderAnalytics } from '@rudderstack/analytics-js'

export function ThirdPartyScriptProvider({ children }: { children: React.ReactNode }) {
  const analyticsRef = useRef<RudderAnalytics | null>(null)

  if (!analyticsRef.current) {
    const analytics = new RudderAnalytics()
    analytics.load(process.env.NEXT_PUBLIC_RUDDERSTACK_KEY, process.env.NEXT_PUBLIC_RUDDERSTACK_URL, {
      storage: {
        type: 'memoryStorage',
        cookie: {},
      },
      plugins: ['DeviceModeDestinations', 'ErrorReporting', 'StorageEncryption', 'StorageMigrator', 'XhrQueue'],
    })
    analyticsRef.current = analytics
  }

  useEffect(() => {
    console.log('RudderStack initialized.')
  }, [])

  return <>{children}</>
}
