/**
 * GenAI SDK Loader - Script Tag Entry Point
 *
 * This loader is designed for script tag usage where the SDK needs to:
 * 1. Auto-detect where it's loaded from
 * 2. Manually inject CSS before loading the SDK
 * 3. Expose a global API on window.GenAISDK
 *
 * Usage:
 *   <script src="https://cdn.example.com/genai-loader.js"></script>
 *   <script>
 *     window.GenAISDK.init({ ... });
 *   </script>
 */

;(function(window) {
  'use strict';

  // Auto-detect SDK base URL from the loader script location
  let SDK_BASE_URL = window.GENAI_SDK_BASE_URL;

  if (!SDK_BASE_URL) {
    const currentScript = document.currentScript ||
      Array.from(document.scripts).find(script =>
        script.src.includes('genai-loader') ||
        script.src.includes('genai-sdk')
      );

    if (currentScript && currentScript.src) {
      const scriptUrl = new URL(currentScript.src);
      SDK_BASE_URL = scriptUrl.href.replace(/\/[^\/]*$/, '/'); // Remove filename, keep directory
    } else {
      // Fallback to current page location
      SDK_BASE_URL = window.location.href.replace(/\/[^\/]*$/, '/');
    }
  }

  // Global state
  let sdkLoaded = false;
  let sdkLoading = false;
  let loadPromise = null;
  let styleElement = null;

  /**
   * Load the main CSS file
   */
  function loadCSS() {
    return new Promise((resolve, reject) => {
      // If CSS already loaded, resolve immediately
      if (styleElement) {
        resolve();
        return;
      }

      // Check if CSS is already in the page (via bundler or previous load)
      const existingStyles = document.querySelectorAll('link[rel="stylesheet"], style');
      for (const styleTag of existingStyles) {
        const href = styleTag.href || '';
        const content = styleTag.textContent || '';
        if (href.includes('genai-sdk') || content.includes('genai-sdk-container')) {
          console.log('GenAI CSS already loaded');
          resolve();
          return;
        }
      }

      // Create and inject CSS link
      styleElement = document.createElement('link');
      styleElement.rel = 'stylesheet';
      styleElement.type = 'text/css';

      // Construct CSS URL from SDK base URL
      const cssUrl = SDK_BASE_URL + 'genai-sdk.css';
      styleElement.href = cssUrl;

      styleElement.onload = () => {
        console.log('GenAI CSS loaded successfully');
        resolve();
      };

      styleElement.onerror = () => {
        console.error('Failed to load GenAI CSS from:', cssUrl);
        reject(new Error(`Failed to load stylesheet: ${cssUrl}`));
      };

      document.head.appendChild(styleElement);
    });
  }

  /**
   * Load the main SDK module
   */
  function loadSDK() {
    if (sdkLoaded) {
      return Promise.resolve(window.GenAISDKModule);
    }

    if (sdkLoading) {
      return loadPromise;
    }

    sdkLoading = true;

    // Construct SDK JS URL
    const sdkUrl = SDK_BASE_URL + 'genai-sdk.es.js';

    console.log('Loading GenAI SDK from:', sdkUrl);

    loadPromise = import(sdkUrl)
      .then((module) => {
        sdkLoaded = true;
        window.GenAISDKModule = module;
        console.log('GenAI SDK loaded successfully');
        return module;
      })
      .catch((error) => {
        sdkLoading = false;
        console.error('Failed to load GenAI SDK:', error);
        console.error('SDK URL:', sdkUrl);
        console.error('Base URL:', SDK_BASE_URL);
        throw error;
      });

    return loadPromise;
  }

  /**
   * Initialize SDK - load CSS first, then SDK, then call init
   */
  function init(config) {
    return loadCSS()
      .then(() => loadSDK())
      .then((module) => module.init(config))
      .catch((error) => {
        console.error('Failed to initialize GenAI SDK:', error);
        throw error;
      });
  }

  /**
   * Destroy SDK instance
   */
  function destroy() {
    return loadSDK()
      .then((module) => module.destroy())
      .catch((error) => {
        console.error('Failed to destroy GenAI SDK:', error);
        throw error;
      });
  }

  // Expose global API
  window.GenAISDK = {
    init: init,
    destroy: destroy,
    isLoaded: () => sdkLoaded,
    isLoading: () => sdkLoading,
  };

  console.log('GenAI SDK Loader initialized');
})(window);
