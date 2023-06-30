import {
  isChromium,
  isDesktop,
  isIOS,
  isMacOs,
  isMobile,
  isTablet,
  isWindows,
  isAndroid
} from 'react-device-detect'
import { datadogLogs } from "@datadog/browser-logs";

// Set device type
let deviceType = ''
if (isDesktop) {
  deviceType = 'Desktop'
} else if (isMobile) {
  deviceType = 'Mobile'
} else if (isTablet) {
  deviceType = 'Tablet'
} else {
  deviceType = undefined
}

// Set OS type
let osType = ''
if (isMacOs) {
  osType = 'macOS'
} else if (isWindows) {
  osType = 'Windows'
} else if (isIOS) {
  osType = 'iOS'
} else if (isChromium) {
  osType = 'Chromium'
} else if (isAndroid) {
  osType = 'Android'
} else {
  osType = 'linux'
}

// fetch geodetails from api
let geoip;
async function fetchGeoDetails() {
  try {
    const response = await fetch(`${process.env.apiurl}/api/v3/public/ipconfig`);
    const data = await response.json();
    geoip = data.data;
    return data.data;
  } catch (error) {
    console.error('Failed to fetch IP address:', error);
    return '';
  }
}
fetchGeoDetails();

export const analyticsService = async ({ eventName, eventDetails, userDetails }) => {

  // Construct device_details object
  const deviceDetails = {
    user_agent: navigator.userAgent,
    device_type: deviceType,
    os_type: osType,
    geoip
  }

  // console.log(eventName, eventDetails, userDetails, deviceDetails)
  const payLoad = {
    event_details : eventDetails,
    user_details : userDetails,
    device_details : deviceDetails
  }

  if (window.rudderanalytics) {
    window.rudderanalytics.track(eventName, payLoad)
  }

  datadogLogs.logger.info(eventName, payLoad)
}
