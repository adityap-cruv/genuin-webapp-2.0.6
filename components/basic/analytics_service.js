import {
  isChromium,
  isDesktop,
  isIOS,
  isMacOs,
  isMobile,
  isTablet,
  isWindows
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
}


async function fetchIPAddress() {
  try {
    const response = await fetch('https://nodejs.qa.begenuin.com/api/v3/public/ipconfig');
    const data = await response.json();
    return data.data.ip;
  } catch (error) {
    console.error('Failed to fetch IP address:', error);
    return '';
  }
}

export const analyticsService = async ({ eventName, eventDetails, userDetails }) => {
  const ipAddress = await fetchIPAddress();

  // Construct device_details object
  const deviceDetails = {
    user_agent: navigator.userAgent,
    device_type: deviceType,
    os_type: osType,
    ip: ipAddress
  }

  console.log(eventName, eventDetails, userDetails, deviceDetails)
  const payLoad = {
    eventDetails,
    userDetails,
    deviceDetails
  }

  if(window.rudderanalytics){
    console.log('sending..')
    window.rudderanalytics.track(eventName, payLoad, () => {
      console.log('sent....')
     })
  }

  console.log('sending data to datadog...')
  datadogLogs.logger.info(eventName, payLoad)
  console.log('sent to Datadog.')

}
