/**
 * Genuin SDK Dynamic Loader
 *
 * This script provides a dynamic loading mechanism for the Genuin SDK
 * that supports code splitting for optimal performance.
 */

;(function (window) {
  ;('use strict')

  // Configuration - auto-detect base URL from script location
  let SDK_BASE_URL = window.GENUIN_SDK_BASE_URL

  // Auto-detect SDK base URL from the loader script location
  if (!SDK_BASE_URL) {
    const currentScript =
      document.currentScript ||
      Array.from(document.scripts).find(
        (script) =>
          script.src.includes('genuin-loader') || script.src.includes('gen_sdk')
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

  const SDK_VERSION = '2.0.6'

  // Global state
  let sdkLoaded = false
  let sdkLoading = false
  let loadPromise = null
  let genuinSDKInstance = null

  /**
   * Get the SDK class from the loaded module
   */
  function getSDKClass(sdk) {
    const GenuinClass = sdk.default || sdk.Genuin
    if (GenuinClass) {
      return GenuinClass
    } else if (window.genuin?.SDK) {
      return window.genuin.SDK
    }
    throw new Error('Genuin SDK not properly loaded')
  }

  /**
   * Load the main SDK module
   */
  function loadSDK() {
    if (sdkLoaded) {
      return Promise.resolve(genuinSDKInstance)
    }

    if (sdkLoading) {
      return loadPromise
    }

    // Performance marker: SDK load start
    if (typeof performance !== 'undefined' && performance.mark) {
      performance.mark('genuin-sdk-load-start')
    }
    if (window.__GENUIN_METRICS__) {
      window.__GENUIN_METRICS__.markSDKLoadStart()
    }

    sdkLoading = true
    // Function to get the actual SDK filename from manifest
    function getSDKFilename() {
      // In production, use the filename that was injected during build
      // This placeholder gets replaced by the build process with the actual hashed filename
      return Promise.resolve('__SDK_FILENAME_PLACEHOLDER__')
    }

    // Define sdkUrl at higher scope so it's accessible in catch block
    let sdkUrl = ''

    loadPromise = getSDKFilename()
      .then((filename) => {
        // Ensure we have a proper absolute URL for the SDK
        if (SDK_BASE_URL.startsWith('http') || SDK_BASE_URL.startsWith('/')) {
          // Absolute URL or root-relative path
          sdkUrl = SDK_BASE_URL + filename
        } else {
          // Relative path - resolve relative to current page
          const baseUrl = new URL(window.location.href)
          sdkUrl = new URL(SDK_BASE_URL + filename, baseUrl).href
        }

        console.log('Loading Genuin SDK from:', sdkUrl)

        // Mark that we're using ES module loading to prevent global setup conflicts
        window.__GENUIN_ES_MODULE__ = true

        return import(sdkUrl)
      })
      .then((module) => {
        sdkLoaded = true
        window.GenuinSDK = module
        genuinSDKInstance = module.default || module.Genuin

        // Performance marker: SDK load end
        if (typeof performance !== 'undefined' && performance.mark) {
          performance.mark('genuin-sdk-load-end')
          if (performance.measure) {
            performance.measure(
              'genuin-sdk-load',
              'genuin-sdk-load-start',
              'genuin-sdk-load-end'
            )
          }
        }
        if (window.__GENUIN_METRICS__) {
          window.__GENUIN_METRICS__.markSDKLoadEnd()
        }

        // Ensure React is properly available before continuing
        // This helps prevent timing issues with vendor chunks
        if (window.React || module.React) {
          console.log('✅ React detected in SDK module')
        } else {
          console.warn(
            '⚠️ React not immediately detected - may be in separate vendor chunk'
          )
        }

        // onGenuinReady callback after SDK is fully loaded
        callOnGenuinReadyCallback(genuinSDKInstance)

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
    return loadSDK().then((sdk) => {
      const GenuinClass = getSDKClass(sdk)
      return GenuinClass.newInit(config)
    })
  }

  function getCSSUrl() {
    let cssUrl
    if (
      __DEV_ENVIRONMENT__ ||
      SDK_BASE_URL.includes('localhost') ||
      SDK_BASE_URL.includes('192.168') ||
      SDK_BASE_URL.includes('127.0.0.1')
    ) {
      // In development or local serving, use the same base URL detection as the JS SDK
      if (SDK_BASE_URL.startsWith('http') || SDK_BASE_URL.startsWith('/')) {
        // Absolute URL or root-relative path
        cssUrl = SDK_BASE_URL + 'assets/__CSS_FILENAME_PLACEHOLDER__'
      } else {
        // Relative path - resolve relative to current page
        const baseUrl = new URL(window.location.href)
        cssUrl = new URL(
          SDK_BASE_URL + 'assets/__CSS_FILENAME_PLACEHOLDER__',
          baseUrl
        ).href
      }
    } else {
      cssUrl = `__MEDIA_BASE_URL__/sdk/__SDK_VERSION_PATH__assets/__CSS_FILENAME_PLACEHOLDER__`
    }
    return cssUrl
  }

  /**
   * Update existing embed configuration
   */
  function update(config) {
    return loadSDK().then((sdk) => {
      const GenuinClass = getSDKClass(sdk)
      return GenuinClass.newUpdate(config)
    })
  }

  /**
   * Add event listener
   */
  function on(event, callback) {
    return loadSDK().then((sdk) => {
      const GenuinClass = getSDKClass(sdk)
      return GenuinClass.on(event, callback)
    })
  }

  /**
   * Remove event listener
   */
  function off(event, callback) {
    return loadSDK().then((sdk) => {
      const GenuinClass = getSDKClass(sdk)
      return GenuinClass.off(event, callback)
    })
  }

  /**
   * Remove event listener
   */
  function emit(event, payload) {
    return loadSDK().then((sdk) => {
      const GenuinClass = getSDKClass(sdk)
      return GenuinClass.emit(event, payload)
    })
  }

  /**
   * Expand embed view
   */
  function expand(options) {
    return loadSDK().then((sdk) => {
      const GenuinClass = getSDKClass(sdk)
      return GenuinClass.expand(options)
    })
  }

  /**
   * Collapse embed view
   */
  function collapse(options) {
    return loadSDK().then((sdk) => {
      const GenuinClass = getSDKClass(sdk)
      return GenuinClass.collapse(options)
    })
  }

  /**
   * Logout the current user
   */
  function logout() {
    return loadSDK().then((sdk) => {
      const GenuinClass = getSDKClass(sdk)
      return GenuinClass.logout()
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
      } else if (method === 'emit') {
        emit(...args)
          .then(resolve)
          .catch(reject)
      } else if (method === 'expand') {
        expand(...args)
          .then(resolve)
          .catch(reject)
      } else if (method === 'collapse') {
        collapse(...args)
          .then(resolve)
          .catch(reject)
      } else if (method === 'logout') {
        logout(...args)
          .then(resolve)
          .catch(reject)
      }
    })
    initQueue.length = 0
  }

  //  Handle onGenuinReady callback
  function callOnGenuinReadyCallback(sdk) {
    const callback = window.onGenuinReady
    try {
      if (typeof callback === 'function') {
        console.log('Calling onGenuinReady callback')
        const div = document.getElementById('gen-sdk')
        if (div && typeof sdk.newInitWithCallback === 'function') {
          sdk.newInitWithCallback(div, callback)
        } else {
          callback(sdk)
        }
      }
    } catch (err) {
      console.error('Error calling onGenuinReady callback', err)
    }
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

    emit: function (...args) {
      if (queueProcessed) {
        return emit(...args)
      }

      return new Promise((resolve, reject) => {
        initQueue.push({ method: 'emit', args, resolve, reject })
        setTimeout(processInitQueue, 0)
      })
    },

    expand: function (...args) {
      if (queueProcessed) {
        return expand(...args)
      }

      return new Promise((resolve, reject) => {
        initQueue.push({ method: 'expand', args, resolve, reject })
        setTimeout(processInitQueue, 0)
      })
    },

    collapse: function (...args) {
      if (queueProcessed) {
        return collapse(...args)
      }

      return new Promise((resolve, reject) => {
        initQueue.push({ method: 'collapse', args, resolve, reject })
        setTimeout(processInitQueue, 0)
      })
    },

    logout: function (...args) {
      if (queueProcessed) {
        return logout(...args)
      }

      return new Promise((resolve, reject) => {
        initQueue.push({ method: 'logout', args, resolve, reject })
        setTimeout(processInitQueue, 0)
      })
    },

    // Utility methods
    version: SDK_VERSION,
    isLoaded: () => sdkLoaded,
    isLoading: () => sdkLoading,
    cssUrl: getCSSUrl(),
  }

  // Setup iframe message handling for legacy compatibility
  window.addEventListener('message', (event) => {
    const receivedObj = event.data
    if (receivedObj?.action === 'open_link') {
      window.open(receivedObj.link, '_blank')
    }
  })

  window.addEventListener('DOMContentLoaded', () => {
    if (window.onGenuinReady) {
      if (sdkLoaded && genuinSDKInstance) {
        callOnGenuinReadyCallback(genuinSDKInstance)
        return
      }
      loadSDK().then((sdk) => {
        const genuinSDKInstance = sdk.default || sdk.Genuin
        callOnGenuinReadyCallback(genuinSDKInstance)
      })
      // })
    } else {
      Object.defineProperty(window, 'onGenuinReady', {
        configurable: true,
        enumerable: true,
        set(fn) {
          // Replace with actual value
          Object.defineProperty(window, 'onGenuinReady', {
            value: fn,
            writable: true,
            configurable: true,
            enumerable: true,
          })
          // If SDK already loaded, call immediately
          if (sdkLoaded && genuinSDKInstance) {
            callOnGenuinReadyCallback(genuinSDKInstance)
          } else {
            loadSDK().then((sdk) => {
              const genuinSDKInstance = sdk.default || sdk.Genuin
              callOnGenuinReadyCallback(genuinSDKInstance)
            })
          }
          // Otherwise, it will be called when SDK finishes loading
        },
        get() {
          return undefined
        },
      })
    }
  })
})(window)
