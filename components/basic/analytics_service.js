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

export const analyticsService = async ({ eventName, eventDetails, userDetails }) => {

  // Construct device_details object
  const deviceDetails = {
    user_agent: navigator.userAgent,
    device_type: deviceType,
    os_type: osType,
    ip: ''
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
