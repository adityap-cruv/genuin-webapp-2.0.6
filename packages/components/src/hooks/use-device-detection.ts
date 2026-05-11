"use client";
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

  const checkIsPad = (): boolean => {
    try {
      // Prefer feature-based detection (correct for iPadOS)
      const device = parser?.getDevice();
      device?.withFeatureCheck();
      const model = device?.model;
      return model?.toLowerCase() === "ipad";
    } catch {
      // Fallback: plain UA parsing
      return parser?.getResult().device.model?.toLowerCase() === "ipad";
    }
  };

  return {
    isWindows: parser?.getResult().os.name === "Windows",
    isMac: parser?.getResult().os.name === "macOS",
    isIOS: parser?.getResult().os.name === "iOS",
    isAndroid: parser?.getResult().os.name === "Android",
    isMobile: parser?.getDevice().type === "mobile",
    isTablet: parser?.getDevice().type === "tablet",
    isIpad: checkIsPad(),
  };
}
