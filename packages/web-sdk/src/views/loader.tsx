// Bridge file to maintain compatibility with legacy index
// This file provides the functions that legacy index expects

import { loadNewEmbed } from './embed-loader'
import { AuthUser, EmbedDataType } from '../type'

// Main embed loading function - bridges to the new embed loader
export function loadEmbedView(
  container: HTMLElement,
  embedData: EmbedDataType,
  user?: AuthUser,
  brandName?: string,
): void {
  // Use the new embed loader which uses shared components
  loadNewEmbed(container, embedData, user)
}

// Error view function
export function loadErrorView(container: HTMLElement): void {
  container.innerHTML = `
    <div style="
      display: flex;
      justify-content: center;
      align-items: center;
      height: 200px;
      padding: 20px;
      font-family: Arial, sans-serif;
      color: #666;
      text-align: center;
    ">
      <div>
        <h3 style="margin: 0 0 10px 0; color: #333;">Unable to load content</h3>
        <p style="margin: 0; font-size: 14px;">Please check your configuration and try again.</p>
      </div>
    </div>
  `
}

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
