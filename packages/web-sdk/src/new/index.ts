import { sdkManager } from './sdk-manager'

// Check if we're in a browser environment and set up SDK manager
if (typeof window !== 'undefined') {
  console.log('Setting up SDK Manager in browser environment')

  // Set up window.genuin with queue to handle race conditions
  const genuin = ((window as any).genuin = (window as any).genuin || {})
  const queue = (genuin._queue = genuin._queue || [])
  let isInitialized = false
  let isDOMReady = false

  const initializeSDK = (args: any[]) => {
    if (isInitialized) return
    isInitialized = true
    sdkManager.init(...args)
  }

  // Function to process the queue
  const processQueue = () => {
    isDOMReady = true
    queue.forEach(([method, args]: [string, any]) => {
      if (method === 'init') {
        initializeSDK(args)
      }
    })
    queue.length = 0
  }

  // Set up genuin.init and genuin.initialize (alias)
  genuin.init = function (...args: any[]) {
    if (isInitialized) return
    if (isDOMReady) {
      initializeSDK(args)
    } else {
      queue.push(['init', args])
    }
  }

  genuin.initialize = genuin.init // Alias for consistency

  // Wait for DOM to be ready before processing queue
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', processQueue)
  } else {
    // DOM is already ready
    processQueue()
  }

  // Handle window.onGenuinReady callback.
  // Problem: many pages assign `window.onGenuinReady = (...) => {}` after
  // the SDK script is loaded. If the SDK only checks once on load it will
  // miss that assignment and the callback will appear undefined. To be robust
  // we call any existing callback now and also install a setter so that
  // future assignments to `window.onGenuinReady` are detected and invoked.
  const callOnGenuinReady = (cb: any) => {
    try {
      if (typeof cb === 'function') {
        // Pass the genuin object with initialize method
        cb(genuin)
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
} else {
  console.warn('SDK Manager not initialized - not in browser environment')
}
