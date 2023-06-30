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
  deviceType = 'desktop'
} else if (isMobile) {
  deviceType = 'mobile'
} else if (isTablet) {
  deviceType = 'tablet'
} else {
  deviceType = ''
}

// Set OS type
let osType = ''
if (isMacOs) {
  osType = 'macos'
} else if (isWindows) {
  osType = 'windows'
} else if (isIOS) {
  osType = 'ios'
} else if (isChromium) {
  osType = 'chromium'
} else if (isAndroid) {
  osType = 'android'
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

let userDetails = {};

export const analyticsService = async ({ eventName, eventDetails }) => {

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
