'use client'
import { useEffect, useRef } from 'react'
import { RudderAnalytics } from '@rudderstack/analytics-js'

export function ThirdPartyScriptProvider({ children }: { children: React.ReactNode }) {
  const analyticsRef = useRef<RudderAnalytics | null>(null)

  useEffect(() => {
    if (!analyticsRef.current) {
      const analytics = new RudderAnalytics()
      analytics.load(process.env.NEXT_PUBLIC_RUDDERSTACK_KEY, process.env.NEXT_PUBLIC_RUDDERSTACK_URL, {
        storage: {
          type: 'localStorage',
          cookie: {},
          entries: {
            userId: { type: 'localStorage' },
            anonymousId: { type: 'localStorage' },
            sessionInfo: { type: 'localStorage' },
            userTraits: { type: 'localStorage' }, // Optional: For user traits
            initialReferrer: { type: 'localStorage' }, // Optional: For referrer tracking
            groupId: { type: 'localStorage' }, // Optional: For group tracking
            groupTraits: { type: 'localStorage' }, // Optional: For group traits
            initialReferringDomain: { type: 'localStorage' }, // Optional: For referrer tracking
            authToken: { type: 'localStorage' }, // Optional: For auth token
          },
        },
        plugins: ['DeviceModeDestinations'],
        integrations: {
          All: false, // Disables all third-party integrations
          'Google Analytics': false,
        },
      })
      analyticsRef.current = analytics
    }
  }, [])

  return <>{children}</>
}
