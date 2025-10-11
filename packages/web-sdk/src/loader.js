/**
 * Genuin SDK Dynamic Loader
 *
 * This script provides a dynamic loading mechanism for the Genuin SDK
 * that supports code splitting for optimal performance.
 */

;(function (window) {
  'use strict'

  // Configuration - auto-detect base URL from script location
  let SDK_BASE_URL = window.GENUIN_SDK_BASE_URL

  // Auto-detect SDK base URL from the loader script location
  if (!SDK_BASE_URL) {
    const currentScript =
      document.currentScript ||
      Array.from(document.scripts).find(
        (script) =>
          script.src.includes('genuin-loader') ||
          script.src.includes('gen_sdk'),
      )

    if (currentScript && currentScript.src) {
      const scriptUrl = new URL(currentScript.src)
      let baseUrl = scriptUrl.href.replace(/\/[^\/]*$/, '/') // Remove filename, keep directory

      // Handle different hosting scenarios:
      // 1. Development: script at ./dist/gen_sdk.js -> base should be ./dist/
      // 2. Production: dist folder hosted directly, script at ./gen_sdk.js -> base should be ./

      // If script is in a 'dist' folder, keep the dist path
      // If script is at root level, assume dist contents are at root
      if (!baseUrl.includes('/dist/')) {
        // Script is likely at root level (dist contents hosted directly)
        // Base URL is the same directory as the script
        SDK_BASE_URL = baseUrl
      } else {
        // Script is in dist folder, keep the dist path
        SDK_BASE_URL = baseUrl
      }
    } else {
      // Fallback to current page location
      SDK_BASE_URL = window.location.href.replace(/\/[^\/]*$/, '/')
    }
  }

  const SDK_VERSION = '2.0.0'

  // Allowed events list - only these events can be listened to
  const ALLOWED_EVENTS = [
    'onPlay',
    'onPause',
    'onMuteChange',
    // Add allowed event names here
  ]

  // Global state
  let sdkLoaded = false
  let sdkLoading = false
  let loadPromise = null

  /**
   * Load the main SDK module
   */
  function loadSDK() {
    if (sdkLoaded) {
      return Promise.resolve(window.GenuinSDK)
    }

    if (sdkLoading) {
      return loadPromise
    }

    sdkLoading = true

    // Ensure we have a proper absolute URL for the SDK
    let sdkUrl
    if (SDK_BASE_URL.startsWith('http') || SDK_BASE_URL.startsWith('/')) {
      // Absolute URL or root-relative path
      sdkUrl = SDK_BASE_URL + 'genuin-sdk.js'
    } else {
      // Relative path - resolve relative to current page
      const baseUrl = new URL(window.location.href)
      sdkUrl = new URL(SDK_BASE_URL + 'genuin-sdk.js', baseUrl).href
    }

    console.log('Loading Genuin SDK from:', sdkUrl)

    // Mark that we're using ES module loading to prevent global setup conflicts
    window.__GENUIN_ES_MODULE__ = true

    loadPromise = import(sdkUrl)
      .then((module) => {
        sdkLoaded = true
        window.GenuinSDK = module

        // Ensure React is properly available before continuing
        // This helps prevent timing issues with vendor chunks
        if (window.React || module.React) {
          console.log('✅ React detected in SDK module')
        } else {
          console.warn(
            '⚠️ React not immediately detected - may be in separate vendor chunk',
          )
        }

        // Don't set up window.genuin here - loader already handles it
        // Just return the module for internal use
        return module
      })
      .catch((error) => {
        sdkLoading = false
        console.error('Failed to load Genuin SDK:', error)

        // Log additional debugging info
        console.group('🐛 SDK Loading Debug Info')
        console.log('SDK URL:', sdkUrl)
        console.log('Base URL:', SDK_BASE_URL)
        console.log('Current Location:', window.location.href)
        console.log('Error Details:', error)
        console.groupEnd()

        throw error
      })

    return loadPromise
  }

  /**
   * Initialize SDK and create embed based on configuration
   */
  function init(config) {
    return loadMainCSS().then(() => {
      return loadSDK().then((sdk) => {
        // Use the default export of the module
        const GenuinClass = sdk.default || sdk.Genuin

        if (GenuinClass) {
          return GenuinClass.newInit(config)
        }
        throw new Error('Genuin SDK not properly loaded')
      })
    })
  }

  /**
   * Load the main CSS file from the CDN
   * URL format: {MEDIA_BASE_URL}/sdk/{VERSION_PATH}assets/web-sdk.css
   * - MEDIA_BASE_URL: Environment-specific CDN URL (replaced at build time)
   * - VERSION_PATH: Optional version-specific path (e.g., "2.0.0/" or empty)
   */
  function loadMainCSS() {
    return new Promise((resolve, reject) => {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      // Use environment-specific media URL with optional version path, replaced during build
      link.href = `__MEDIA_BASE_URL__/sdk/__SDK_VERSION_PATH__assets/web-sdk.css`

      link.onload = () => {
        console.log('CSS file loaded')
        resolve(true)
      }

      link.onerror = () => {
        reject(new Error('Failed to load the CSS file.'))
      }

      document.head.appendChild(link)
    })
  }

  /**
   * Update existing embed configuration
   */
  function update(config) {
    return loadSDK().then((sdk) => {
      const GenuinClass = sdk.default || sdk.Genuin

      if (GenuinClass) {
        return GenuinClass.legacyUpdate(config)
      }
      throw new Error('Genuin SDK not properly loaded')
    })
  }

  /**
   * Add event listener
   */
  function on(event, callback) {
    // Validate event against allowlist
    if (ALLOWED_EVENTS.length > 0 && !ALLOWED_EVENTS.includes(event)) {
      console.warn(
        `Event "${event}" is not in the allowed events list. Allowed events:`,
        ALLOWED_EVENTS,
      )
      return Promise.resolve()
    }

    return loadSDK().then((sdk) => {
      const GenuinClass = sdk.default || sdk.Genuin

      if (GenuinClass) {
        return GenuinClass.on(event, callback)
      }
    })
  }

  /**
   * Remove event listener
   */
  function off(event, callback) {
    // Validate event against allowlist
    if (ALLOWED_EVENTS.length > 0 && !ALLOWED_EVENTS.includes(event)) {
      console.warn(
        `Event "${event}" is not in the allowed events list. Allowed events:`,
        ALLOWED_EVENTS,
      )
      return Promise.resolve()
    }

    return loadSDK().then((sdk) => {
      const GenuinClass = sdk.default || sdk.Genuin

      if (GenuinClass) {
        return GenuinClass.off(event, callback)
      }
    })
  }

  // Queue for early initialization calls
  const initQueue = []
  let queueProcessed = false

  // Process any queued initialization calls
  function processInitQueue() {
    if (queueProcessed) return
    queueProcessed = true

    initQueue.forEach(({ method, args, resolve, reject }) => {
      // Call the original function directly
      if (method === 'init') {
        init(...args)
          .then(resolve)
          .catch(reject)
      } else if (method === 'update') {
        update(...args)
          .then(resolve)
          .catch(reject)
      } else if (method === 'on') {
        on(...args)
          .then(resolve)
          .catch(reject)
      } else if (method === 'off') {
        off(...args)
          .then(resolve)
          .catch(reject)
      }
    })
    initQueue.length = 0
  }

  // Enhanced global API with queueing for early calls
  window.genuin = {
    init: function (...args) {
      if (queueProcessed) {
        return init(...args)
      }

      // Queue the call if called before loader is ready
      return new Promise((resolve, reject) => {
        initQueue.push({ method: 'init', args, resolve, reject })
        // Process queue on next tick to allow loader to finish
        setTimeout(processInitQueue, 0)
      })
    },

    update: function (...args) {
      if (queueProcessed) {
        return update(...args)
      }

      return new Promise((resolve, reject) => {
        initQueue.push({ method: 'update', args, resolve, reject })
        setTimeout(processInitQueue, 0)
      })
    },

    on: function (...args) {
      if (queueProcessed) {
        return on(...args)
      }

      return new Promise((resolve, reject) => {
        initQueue.push({ method: 'on', args, resolve, reject })
        setTimeout(processInitQueue, 0)
      })
    },

    off: function (...args) {
      if (queueProcessed) {
        return off(...args)
      }

      return new Promise((resolve, reject) => {
        initQueue.push({ method: 'off', args, resolve, reject })
        setTimeout(processInitQueue, 0)
      })
    },

    // Utility methods
    version: SDK_VERSION,
    isLoaded: () => sdkLoaded,
    isLoading: () => sdkLoading,
  }

  // Setup iframe message handling for legacy compatibility
  window.addEventListener('message', (event) => {
    const receivedObj = event.data
    if (receivedObj?.action === 'open_link') {
      window.open(receivedObj.link, '_blank')
    }
  })
})(window)
