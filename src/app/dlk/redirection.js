/**
 * Smart app redirect with debug logging
 * @param {Object} config Configuration object
 * @param {string} config.appStoreUrl iOS App Store URL
 * @param {string} config.playStoreUrl Google Play Store URL
 * @param {string} [config.fallbackUrl] Optional fallback for desktop
 * @param {number} [config.timeout] Time to wait before store redirect (ms)
 */
const smartAppRedirect = ({ appStoreUrl, playStoreUrl, fallbackUrl = null, timeout = 1500 }) => {
  console.log('🚀 Starting smartAppRedirect with config:', {
    appStoreUrl,
    playStoreUrl,
    fallbackUrl,
    timeout,
  })

  // Get user agent
  const userAgent = navigator.userAgent.toLowerCase()
  const isIOS = userAgent.includes('ipad') || userAgent.includes('iphone') || userAgent.includes('ipod') && !window.MSStream
  const isAndroid = userAgent.includes('android')

  console.log('📱 Device detection:', {
    userAgent,
    isIOS,
    isAndroid,
  })

  // Extract app info from store URLs
  const getAppInfo = () => {
    console.log('🔍 Extracting app info from URLs')

    if (isIOS) {
      const iosMatch = appStoreUrl.match(/id(\d+)/)
      const iosAppId = iosMatch ? iosMatch[1] : null
      console.log('📱 iOS app ID extracted:', iosAppId)
      return {
        storeUrl: appStoreUrl,
        scheme: `id${iosAppId}`,
      }
    }
    if (isAndroid) {
      const androidMatch = playStoreUrl.match(/id=(.*?)(&|$)/)
      const packageName = androidMatch ? androidMatch[1] : null
      console.log('🤖 Android package name extracted:', packageName)
      return {
        storeUrl: playStoreUrl,
        scheme: packageName,
      }
    }
    console.log('💻 Desktop detected, using fallback')
    return { storeUrl: fallbackUrl || appStoreUrl }
  }

  const appInfo = getAppInfo()
  console.log('📊 App info:', appInfo)

  // If not on mobile, just redirect to fallback
  if (!isIOS && !isAndroid) {
    console.log('🖥️ Non-mobile device detected, redirecting to:', appInfo.storeUrl)
    window.location.href = appInfo.storeUrl
    return
  }

  // Try to open app first
  const openApp = () => {
    console.log('🎯 Attempting to open app')
    const now = Date.now()

    // Try to open the app
    if (isIOS) {
      const deepLink = `${appInfo.storeUrl}`
      console.log('🔗 Attempting iOS deep link:', deepLink)
      window.location.href = deepLink
    } else if (isAndroid) {
      const intentUrl = `intent://#Intent;scheme=${appInfo.scheme};package=${appInfo.scheme};end`
      console.log('🔗 Attempting Android intent:', intentUrl)
      window.location.href = intentUrl
    }

    // Check if app was opened
    setTimeout(() => {
      const timeElapsed = Date.now() - now
      console.log('⏱️ Timeout reached. Time elapsed:', timeElapsed)

      if (timeElapsed < timeout + 100) {
        console.log('📱 App not opened, redirecting to store:', appInfo.storeUrl)
        window.location.href = appInfo.storeUrl
      } else {
        console.log('✅ App appears to have opened successfully')
      }
    }, timeout)
  }

  // Handle visibility change
  let hidden, visibilityChange
  if (typeof document.hidden !== 'undefined') {
    hidden = 'hidden'
    visibilityChange = 'visibilitychange'
  } else if (typeof document.msHidden !== 'undefined') {
    hidden = 'msHidden'
    visibilityChange = 'msvisibilitychange'
  } else if (typeof document.webkitHidden !== 'undefined') {
    hidden = 'webkitHidden'
    visibilityChange = 'webkitvisibilitychange'
  }

  console.log('👁️ Visibility API support:', {
    hidden,
    visibilityChange,
    supported: !!visibilityChange,
  })

  // Listen for visibility change
  const handleVisibilityChange = () => {
    console.log('👁️ Visibility changed. Document hidden:', document[hidden])
    if (!document[hidden]) {
      console.log('↩️ User returned to page, redirecting to store:', appInfo.storeUrl)
      window.location.href = appInfo.storeUrl
    }
  }

  if (visibilityChange) {
    document.addEventListener(visibilityChange, handleVisibilityChange, false)
    console.log('✅ Visibility change listener attached')
  }

  // Start the process
  console.log('🚀 Starting app open attempt')
  openApp()
}

// Example usage with common apps:
/*
// Facebook
smartAppRedirect({
    appStoreUrl: 'https://apps.apple.com/us/app/facebook/id284882215',
    playStoreUrl: 'https://play.google.com/store/apps/details?id=com.facebook.katana',
    timeout: 2000
});

// Instagram
smartAppRedirect({
    appStoreUrl: 'https://apps.apple.com/us/app/instagram/id389801252',
    playStoreUrl: 'https://play.google.com/store/apps/details?id=com.instagram.android',
    timeout: 2000
});
*/

export default smartAppRedirect
