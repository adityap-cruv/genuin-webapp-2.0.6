import { useMemo } from 'react'

// Singleton to store device detection results
let deviceInfo: ReturnType<typeof detectDevice> | null = null

/**
 * Core device detection function that runs only once
 */
const detectDevice = () => {
  const userAgent =
    navigator.userAgent || navigator.vendor || (window as any).opera

  // Check for mobile devices
  const isMobile =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      userAgent,
    ) && !/Tablet|iPad/i.test(userAgent)

  // Check for tablets
  const isTablet = /Tablet|iPad/i.test(userAgent)

  // Check for desktop
  const isDesktop = !isMobile && !isTablet

  // Check operating systems
  const isIOS = /iPhone|iPad|iPod/i.test(userAgent)
  const isAndroid = /Android/i.test(userAgent)
  const isMacOS = /Mac OS X/i.test(userAgent) && !isIOS
  const isWindows = /Windows/i.test(userAgent)
  const isLinux = /Linux/i.test(userAgent) && !isAndroid

  // Detect browser
  let browserName = 'Unknown'

  if (userAgent.indexOf('Chrome') > -1 && userAgent.indexOf('Edg') === -1) {
    browserName = 'Chrome'
  } else if (userAgent.indexOf('Firefox') > -1) {
    browserName = 'Firefox'
  } else if (
    userAgent.indexOf('Safari') > -1 &&
    userAgent.indexOf('Chrome') === -1
  ) {
    browserName = 'Safari'
  } else if (userAgent.indexOf('Edg') > -1) {
    browserName = 'Edge'
  } else if (
    userAgent.indexOf('MSIE') > -1 ||
    userAgent.indexOf('Trident/') > -1
  ) {
    browserName = 'Internet Explorer'
  }

  return {
    isMobile,
    isTablet,
    isDesktop,
    isIOS,
    isAndroid,
    isMacOS,
    isWindows,
    isLinux,
    browserName,
    userAgent,
  }
}

/**
 * Custom hook to detect device type based on user agent.
 * This function runs only once and reuses the stored values.
 * @returns Device information and flags
 */
export const useDeviceDetect = () => {
  return useMemo(() => {
    // If device info is already detected, return it
    if (deviceInfo) {
      return deviceInfo
    }

    // Otherwise, detect and store the device info
    deviceInfo = detectDevice()
    return deviceInfo
  }, []) // Empty dependency array means this will only run once
}
