'use client'
import { useEffect, useRef } from 'react'
import { RudderAnalytics } from '@rudderstack/analytics-js'

export function ThirdPartyScriptProvider({ children }: { children: React.ReactNode }) {
  const analyticsRef = useRef<RudderAnalytics | null>(null)

  if (!analyticsRef.current) {
    const analytics = new RudderAnalytics()
    analytics.load(process.env.NEXT_PUBLIC_RUDDERSTACK_KEY, process.env.NEXT_PUBLIC_RUDDERSTACK_URL, {
      storage: {
        type: 'localStorage',
      },
      plugins: ['DeviceModeDestinations', 'ErrorReporting'],
      consentManagement: {
        enabled: false,
      },
      integrations: {
        All: false, // Disables all third-party integrations
      },
    })
    analyticsRef.current = analytics
  }

  useEffect(() => {
    console.log('RudderStack initialized.')
  }, [])

  return <>{children}</>
}
