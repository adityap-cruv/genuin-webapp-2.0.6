// Bridge file to maintain compatibility with legacy index
// This file provides the functions that legacy index expects

import { EmbedDataType } from '@genuin/components/context/embed/embed.types'

// RudderStack analytics loading function
export function loadRudderStack(): void {
  // Check if RudderStack is already loaded
  if ((window as any).rudderanalytics) {
    return
  }

  // Create RudderStack loading script
  const script = document.createElement('script')
  script.src = 'https://cdn.rudderlabs.com/v3/rudder-analytics.min.js'
  script.async = true
  script.onload = () => {
    // Initialize RudderStack when script loads
    if ((window as any).rudderanalytics) {
      const writeKey = process.env.NEXT_PUBLIC_RUDDERSTACK_KEY
      const dataPlaneUrl = process.env.NEXT_PUBLIC_RUDDERSTACK_URL

      if (writeKey && dataPlaneUrl) {
        ;(window as any).rudderanalytics
          .load(
            writeKey,
            dataPlaneUrl,
          )(window as any)
          .rudderanalytics.ready(() => {
            console.log('RudderStack loaded successfully')
          })
      }
    }
  }

  document.head.appendChild(script)
}
