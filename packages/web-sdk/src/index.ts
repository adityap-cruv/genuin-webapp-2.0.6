// Import styles
import './styles.css'

// Modern API exports
export * from './core'
export * from './sdk'
export * from './types'

// React components for React users
export { SDKProvider, useSDK, useSDKConfig } from './core/context'

// Main SDK class for vanilla JS and React
export { GenuinSDK, Genuin } from './sdk'

// Import for browser global setup
import { Genuin } from './sdk'

// Types
export {
  EmbedStyle,
  type EmbedConfig,
  type EmbedState,
  type EmbedMessage,
} from './types/embed'

export {
  SDKEventType,
  ErrorType,
  type SDKEvent,
  type EventListener,
  type SDKError,
} from './core'

// Set up global API for browser usage
if (typeof window !== 'undefined') {
  // Modern global API
  ;(window as any).GenuinSDK = Genuin

  // Enhanced global API with both legacy and new methods
  ;(window as any).genuin = {
    // Main SDK instance
    SDK: Genuin,

    // Event handling methods
    on: Genuin.on.bind(Genuin),
    off: Genuin.off.bind(Genuin),

    // Legacy methods - now properly connected to new architecture
    init: (config: any) => {
      return Genuin.legacyInit(config)
    },
    update: (config: any) => {
      return Genuin.legacyUpdate(config)
    },
  }

  // Setup DOM initialization like legacy SDK
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initializeLegacyEmbeds()
    })
  } else {
    initializeLegacyEmbeds()
  }

  // Handle window.onGenuinReady callback
  if ((window as any).onGenuinReady) {
    const callback = (window as any).onGenuinReady
    const div = document.getElementById('gen-sdk')
    if (div) {
      Genuin.initializeDivWithCallback(div, callback)
    }
  }

  function initializeLegacyEmbeds() {
    const embedDivs = document.querySelectorAll(
      '.gen-sdk-class:not([data-initialized])',
    )
    if (embedDivs.length > 0) {
      // Initialize without config to trigger DOM-based initialization
      Genuin.legacyInit()
    }

    // Setup iframe message handling
    window.addEventListener('message', (event) => {
      const receivedObj = event.data
      if (receivedObj?.action === 'open_link') {
        window.open(receivedObj.link, '_blank')
      }
    })
  }
}
