"use client";

import { useState } from "react";
import { UAParser } from "ua-parser-js";

type BrowserInfo = {
  isSafari: boolean;
  isChrome: boolean;
  isFirefox: boolean;
  isEdge: boolean;
  isOpera: boolean;
  isBrave: boolean;
  browserName: string | undefined;
  browserVersion: string | undefined;
};

const getDefaultBrowserInfo = (): BrowserInfo => {
  const parser = new UAParser();
  const result = parser.getResult();
  const browserName = result.browser.name;
  const browserVersion = result.browser.version;

  return {
    isSafari: browserName === "Safari" || browserName === "Mobile Safari",
    isChrome: browserName === "Chrome",
    isFirefox: browserName === "Firefox",
    isEdge: browserName === "Edge",
    isOpera: browserName === "Opera",
    isBrave: browserName === "Brave",
    browserName,
    browserVersion,
  };
};

/**
 * Browser detection hook that identifies the user's browser type.
 * Uses ua-parser-js to parse the user agent string.
 *
 * @returns Object with boolean flags for different browsers and the browser name
 *
 * @example
 * ```tsx
 * const { isSafari, isChrome, browserName } = useBrowserDetect();
 * if (isSafari) {
 *   // Apply Safari-specific logic
 * }
 * ```
 */
export function useBrowserDetect(): BrowserInfo {
  const [browserInfo] = useState<BrowserInfo>(getDefaultBrowserInfo);

  return browserInfo;
}
