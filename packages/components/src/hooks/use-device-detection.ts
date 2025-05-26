import { useEffect, useState } from "react";
import { UAParser } from "ua-parser-js";

/**
 * Device detection hook based on user agent string.
 */
export function useDeviceDetection() {
  const [parser, setParser] = useState<UAParser | null>(null);
  useEffect(() => {
    setParser(new UAParser());
  }, []);
  return {
    isWindows: parser?.getResult().os.name === "Windows",
    isMac: parser?.getResult().os.name === "macOS",
    isIOS: parser?.getResult().os.name === "iOS",
    isAndroid: parser?.getResult().os.name === "Android",
    isMobile: parser?.getDevice().type === "mobile",
    isTablet: parser?.getDevice().type === "tablet",
  };
}
