/**
 * Smart app redirect without refresh loops
 * @param {Object} config Configuration object
 * @param {string} config.appStoreUrl iOS App Store URL
 * @param {string} config.playStoreUrl Google Play Store URL
 * @param {string} [config.fallbackUrl] Optional fallback for desktop
 * @param {number} [config.timeout] Time to wait before store redirect (ms)
 */
const smartAppRedirect = ({ appStoreUrl, playStoreUrl, fallbackUrl = null, timeout = 1500 }) => {
  console.log('🚀 Starting smartAppRedirect')

  // Get user agent
  const userAgent = navigator.userAgent.toLowerCase()
  const isIOS = /ipad|iphone|ipod/.test(userAgent) && !window.MSStream
  const isAndroid = /android/.test(userAgent)

  console.log('📱 Device detection:', { isIOS, isAndroid })

  // Track if redirection has occurred
  let hasRedirected = false

  // Handle the redirect
  const redirect = (url) => {
    if (!hasRedirected && url !== window.location.href) {
      hasRedirected = true
      window.location.replace(url)
    }
  }

  // If not mobile, redirect to fallback once
  if (!isIOS && !isAndroid) {
    const targetUrl = fallbackUrl || appStoreUrl
    console.log('🖥️ Desktop detected, redirecting to:', targetUrl)
    redirect(targetUrl)
    return
  }

  // For iOS, redirect to App Store once
  if (isIOS) {
    alert("ios detected")
    alert(appStoreUrl)
    console.log('🍎 iOS detected, redirecting to:', appStoreUrl)
    redirect(appStoreUrl)
    return
  }

  // For Android
  if (isAndroid) {
    console.log('🤖 Android detected')

    const androidMatch = playStoreUrl.match(/id=(.*?)(&|$)/)
    const packageName = androidMatch ? androidMatch[1] : null

    if (!packageName) {
      console.log('📱 No package name found, redirecting to Play Store')
      redirect(playStoreUrl)
      return
    }

    const isChrome = /chrome/.test(userAgent)
    let appOpened = false

    // Set up timeout for store redirect
    const storeTimeout = setTimeout(() => {
      if (!appOpened) {
        console.log('⏱️ Timeout reached, redirecting to Play Store')
        redirect(playStoreUrl)
      }
    }, timeout)

    // Handle visibility change
    const visibilityHandler = () => {
      if (document.hidden) {
        appOpened = true
        clearTimeout(storeTimeout)
      }
    }

    document.addEventListener('visibilitychange', visibilityHandler, { once: true })

    // Try to open app
    try {
      if (isChrome) {
        // Chrome: use intent
        const intentUrl = `intent://scan/#Intent;scheme=${packageName};package=${packageName};action=android.intent.action.VIEW;end`
        console.log('🔗 Attempting Chrome intent:', intentUrl)
        window.location.replace(intentUrl)
      } else {
        // Other browsers: try market://
        console.log('🔗 Attempting market:// URL')
        window.location.replace(`market://details?id=${packageName}`)
      }
    } catch (e) {
      console.log('❌ Error opening app:', e)
      clearTimeout(storeTimeout)
      document.removeEventListener('visibilitychange', visibilityHandler)
      redirect(playStoreUrl)
    }
  }
}

export default smartAppRedirect
