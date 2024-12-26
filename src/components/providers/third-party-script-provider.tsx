'use client'
import { RudderAnalytics } from '@rudderstack/analytics-js'

export function ThirdPartyScriptProvider({ children }: { children: React.ReactNode }) {
  const analytics = new RudderAnalytics()
  analytics.load(process.env.NEXT_PUBLIC_RUDDERSTACK_KEY, process.env.NEXT_PUBLIC_RUDDERSTACK_URL, {
    storage: {
      type: 'localStorage',
    },
  })
  return <>{children}</>
}
