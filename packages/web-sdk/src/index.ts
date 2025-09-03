// Import styles
import './styles.css'

// Modern API exports
export * from './core'
export * from './sdk'
export * from './types'

// React components for React users
export { SDKProvider, useSDK, useSDKConfig } from './core/context'

// Main SDK class for vanilla JS and React
export { GenuinSDK } from './sdk'

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

// Initialize browser globals when module loads (for legacy/IIFE builds)
function initializeBrowserGlobals() {
  if (typeof window === 'undefined') return // Modern global API
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

  console.log('Genuin SDK loaded', window)
  // Handle window.onGenuinReady callback.
  // Problem: many pages assign `window.onGenuinReady = (...) => {}` after
  // the SDK script is loaded. If the SDK only checks once on load it will
  // miss that assignment and the callback will appear undefined. To be robust
  // we call any existing callback now and also install a setter so that
  // future assignments to `window.onGenuinReady` are detected and invoked.
  const callOnGenuinReady = (cb: any) => {
    try {
      if (typeof cb === 'function') {
        // If there's a gen-sdk div, prefer initializing via the helper
        const div = document.getElementById('gen-sdk')
        if (div && typeof Genuin.initializeDivWithCallback === 'function') {
          Genuin.initializeDivWithCallback(div, cb)
        } else {
          // Fallback: directly call the callback with the SDK instance
          cb(Genuin)
        }
      }
    } catch (err) {
      // swallow errors from user-provided callback but surface to console
      // so integrators can debug their callback code
      // eslint-disable-next-line no-console
      console.error('Error calling onGenuinReady callback', err)
    }
  }

  // If the page already set the callback before the SDK loaded, call it.
  if ((window as any).onGenuinReady) {
    callOnGenuinReady((window as any).onGenuinReady)
  } else {
    // Intercept future assignments: when the host page assigns
    // `window.onGenuinReady = fn` we will call the function immediately with
    // the SDK instance. After first assignment we replace the property with
    // the actual value so normal reads/writes behave as expected.
    Object.defineProperty(window, 'onGenuinReady', {
      configurable: true,
      enumerable: true,
      set(fn) {
        // replace the property with the actual function value so the page
        // can later call it directly if desired
        Object.defineProperty(window, 'onGenuinReady', {
          value: fn,
          writable: true,
          configurable: true,
          enumerable: true,
        })
        callOnGenuinReady(fn)
      },
      get() {
        return undefined
      },
    })
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

// Only initialize browser globals for IIFE builds
// ES module imports will get the exports directly
if (typeof window !== 'undefined' && !(window as any).__GENUIN_ES_MODULE__) {
  initializeBrowserGlobals()
}

// Export at the end to ensure it appears in the compiled ES module
export { Genuin }
export default Genuin
