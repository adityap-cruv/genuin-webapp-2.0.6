import {
    isChromium,
    isDesktop,
    isIOS,
    isMacOs,
    isMobile,
    isTablet,
    isWindows,
    isAndroid,
  } from 'react-device-detect';
  import { rudderStackTrack } from './useRudderAnalytics';
  
  interface DeviceDetails {
    user_agent: string;
    device_type: string;
    os_type: string;
    geoip?: any;
  }

  let geoip: any
  async function fetchGeoDetails(): Promise<any> {
    try {
      const response = await fetch( process.env.NEXT_PUBLIC_API_URL + `/api/v3/public/ipconfig`);
      const data = await response.json();
      geoip = data.data
      return data.data;
    } catch (error) {
      // console.error('Failed to fetch IP address:', error);
      return null;
    }
  }
  void fetchGeoDetails();
  
  export const analyticsService = async ({ eventName, properties }: { eventName: string; properties: any }): Promise<void> => {
  
    const deviceType = isDesktop ? 'desktop' : isMobile ? 'mobile' : isTablet ? 'tablet' : '';
    const osType = isMacOs ? 'macos' : isWindows ? 'windows' : isIOS ? 'ios' : isChromium ? 'chromium' : isAndroid ? 'android' : 'linux';
    const deviceDetails: DeviceDetails = {
      user_agent: navigator.userAgent,
      device_type: deviceType,
      os_type: osType,
      geoip,
    };
  
    void rudderStackTrack(eventName, properties)
  };
  