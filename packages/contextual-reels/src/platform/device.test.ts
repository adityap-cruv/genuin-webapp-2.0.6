/**
 * Tests for `src/platform/device.ts` — merged from:
 * device/detect.test, enrichDeviceDetailsWithGeoIp.test, getDeviceDetailsSnapshot.test.
 */
import { describe, expect, it, vi } from "vitest";

import {
  detectDevice,
  enrichDeviceDetailsWithGeoIp,
  getDeviceDetailsSnapshot,
  isWebView,
  resolveClientIp,
} from "@cxr/platform/device";
import type { RawGeoIpResponse } from "@cxr/services/api";

// ─── detectDevice ─────────────────────────────────────────────────────────────

const IPHONE_SAFARI =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 " +
  "(KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1";

const IPAD_OS13_MAC_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 " +
  "(KHTML, like Gecko) Version/17.0 Safari/605.1.15";

const ANDROID_PHONE =
  "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) " +
  "Chrome/120.0.0.0 Mobile Safari/537.36";

const ANDROID_TABLET =
  "Mozilla/5.0 (Linux; Android 13; SM-X700) AppleWebKit/537.36 (KHTML, like Gecko) " + "Chrome/120.0.0.0 Safari/537.36";

const WIN_CHROME =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) " +
  "Chrome/120.0.0.0 Safari/537.36";

const MAC_CHROME =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) " +
  "Chrome/120.0.0.0 Safari/537.36";

const LINUX_FIREFOX = "Mozilla/5.0 (X11; Linux x86_64; rv:120.0) Gecko/20100101 Firefox/120.0";

const GOOGLEBOT = "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)";

// ─── isWebView UA fixtures ─────────────────────────────────────────────────────

const IOS_WKWEBVIEW =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 " + "(KHTML, like Gecko) Mobile/15E148";

const ANDROID_WEBVIEW_WV =
  "Mozilla/5.0 (Linux; Android 13; Pixel 7; wv) AppleWebKit/537.36 (KHTML, like Gecko) " +
  "Version/4.0 Chrome/120.0.0.0 Mobile Safari/537.36";

const ANDROID_WEBVIEW_LEGACY =
  "Mozilla/5.0 (Linux; U; Android 9; Pixel 3 Build/PQ3A.190801.002) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Version/4.0 Chrome/71.0.3578.99 Mobile Safari/537.36";

const FACEBOOK_IAB =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 " +
  "(KHTML, like Gecko) Mobile/15E148 [FBAN/FBIOS;FBAV/450.0.0.0;]";

const INSTAGRAM_IAB =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 " +
  "(KHTML, like Gecko) Mobile/15E148 Instagram 300.0.0.0.0";

const WECHAT_IAB =
  "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) " +
  "Version/4.0 Chrome/120.0.0.0 Mobile Safari/537.36 MicroMessenger/8.0.40";

const TIKTOK_IAB =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 " +
  "(KHTML, like Gecko) Mobile/15E148 musical_ly_2023800030";

const LINKEDIN_IAB =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 " +
  "(KHTML, like Gecko) Mobile/15E148 LinkedInApp";

describe("detectDevice", () => {
  it("recognises iPhone Safari", () => {
    expect(detectDevice(IPHONE_SAFARI, true)).toEqual({
      isMobile: true,
      osType: "ios",
      deviceType: "mobile",
    });
  });

  it("recognises an explicit iPad UA as an iOS tablet", () => {
    const IPAD_LEGACY =
      "Mozilla/5.0 (iPad; CPU OS 12_0 like Mac OS X) AppleWebKit/605.1.15 " +
      "(KHTML, like Gecko) Version/12.0 Mobile/15E148 Safari/604.1";
    expect(detectDevice(IPAD_LEGACY, true)).toEqual({
      isMobile: false,
      osType: "ios",
      deviceType: "tablet",
    });
  });

  it("recognises iPad iPadOS-13 (Mac UA + touch)", () => {
    expect(detectDevice(IPAD_OS13_MAC_UA, true)).toEqual({
      isMobile: false,
      osType: "ios",
      deviceType: "tablet",
    });
  });

  it("recognises Android Chrome mobile", () => {
    expect(detectDevice(ANDROID_PHONE, true)).toEqual({
      isMobile: true,
      osType: "android",
      deviceType: "mobile",
    });
  });

  it("recognises Android Chrome tablet", () => {
    expect(detectDevice(ANDROID_TABLET, true)).toEqual({
      isMobile: false,
      osType: "android",
      deviceType: "tablet",
    });
  });

  it("recognises Windows desktop Chrome", () => {
    expect(detectDevice(WIN_CHROME, false)).toEqual({
      isMobile: false,
      osType: "windows",
      deviceType: "desktop",
    });
  });

  it("recognises Macintosh Chrome (no touch)", () => {
    expect(detectDevice(MAC_CHROME, false)).toEqual({
      isMobile: false,
      osType: "macos",
      deviceType: "desktop",
    });
  });

  it("recognises Linux Firefox", () => {
    expect(detectDevice(LINUX_FIREFOX, false)).toEqual({
      isMobile: false,
      osType: "linux",
      deviceType: "desktop",
    });
  });

  it("flags Googlebot as bot", () => {
    expect(detectDevice(GOOGLEBOT, false)).toEqual({
      isMobile: false,
      osType: "other",
      deviceType: "bot",
    });
  });

  it("treats Surface (Windows touch) as desktop", () => {
    const SURFACE =
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64; Touch) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
    expect(detectDevice(SURFACE, true)).toEqual({
      isMobile: false,
      osType: "windows",
      deviceType: "desktop",
    });
  });

  it("handles an empty UA defensively", () => {
    expect(detectDevice("", false)).toEqual({
      isMobile: false,
      osType: "other",
      deviceType: "desktop",
    });
  });

  it("reads from navigator by default", () => {
    const result = detectDevice();
    expect(typeof result.isMobile).toBe("boolean");
    expect(typeof result.osType).toBe("string");
    expect(typeof result.deviceType).toBe("string");
  });

  it("defensively falls back to an empty UA and no touch when navigator is undefined (SSR)", () => {
    vi.stubGlobal("navigator", undefined);
    expect(detectDevice()).toEqual({
      isMobile: false,
      osType: "other",
      deviceType: "desktop",
    });
    vi.unstubAllGlobals();
  });

  it("falls back to an empty string when navigator.userAgent is undefined", () => {
    vi.stubGlobal("navigator", { maxTouchPoints: 0 });
    expect(detectDevice()).toEqual({
      isMobile: false,
      osType: "other",
      deviceType: "desktop",
    });
    vi.unstubAllGlobals();
  });
});

// ─── enrichDeviceDetailsWithGeoIp ─────────────────────────────────────────────

const baseDevice = {
  device_type: "desktop" as const,
  os_type: "macos" as const,
  geoip: {},
  user_agent: "jest",
};

describe("services/enrichDeviceDetailsWithGeoIp", () => {
  it("does not mutate the input device-details object", () => {
    const input = { ...baseDevice };
    const out = enrichDeviceDetailsWithGeoIp(input, { city: "Pune" });
    expect(out).not.toBe(input);
    expect(input.geoip).toEqual({});
  });

  it("reads city primarily from `city`, falling back to `city_en`", () => {
    expect(enrichDeviceDetailsWithGeoIp(baseDevice, { city: "A" }).geoip.city_en).toBe("A");
    expect(enrichDeviceDetailsWithGeoIp(baseDevice, { city_en: "B" }).geoip.city_en).toBe("B");
    expect(enrichDeviceDetailsWithGeoIp(baseDevice, {}).geoip.city_en).toBe("");
  });

  it("reads country code via country -> country_code", () => {
    expect(enrichDeviceDetailsWithGeoIp(baseDevice, { country: "IN" }).geoip.country_code).toBe("IN");
    expect(enrichDeviceDetailsWithGeoIp(baseDevice, { country_code: "US" }).geoip.country_code).toBe("US");
    expect(enrichDeviceDetailsWithGeoIp(baseDevice, {}).geoip.country_code).toBe("");
  });

  it("reads country name via country_name -> country_en", () => {
    expect(enrichDeviceDetailsWithGeoIp(baseDevice, { country_name: "India" }).geoip.country_en).toBe("India");
    expect(enrichDeviceDetailsWithGeoIp(baseDevice, { country_en: "USA" }).geoip.country_en).toBe("USA");
  });

  it("reads ip via ip -> query -> tip", () => {
    expect(enrichDeviceDetailsWithGeoIp(baseDevice, { ip: "1.1.1.1" }).geoip.ip).toBe("1.1.1.1");
    expect(enrichDeviceDetailsWithGeoIp(baseDevice, { query: "2.2.2.2" }).geoip.ip).toBe("2.2.2.2");
    expect(enrichDeviceDetailsWithGeoIp(baseDevice, { tip: "3.3.3.3" }).geoip.ip).toBe("3.3.3.3");
    expect(enrichDeviceDetailsWithGeoIp(baseDevice, {}).geoip.ip).toBe("");
  });

  it("reads lat/lng from latitude/longitude as floats", () => {
    const out = enrichDeviceDetailsWithGeoIp(baseDevice, { latitude: "12.9", longitude: "77.6" });
    expect(out.geoip.lat).toBeCloseTo(12.9);
    expect(out.geoip.lng).toBeCloseTo(77.6);
  });

  it("falls back to lat/lon/lng aliases", () => {
    expect(enrichDeviceDetailsWithGeoIp(baseDevice, { lat: 1, lon: 2 }).geoip).toMatchObject({
      lat: 1,
      lng: 2,
    });
    expect(enrichDeviceDetailsWithGeoIp(baseDevice, { lat: 1, lng: 3 }).geoip.lng).toBe(3);
  });

  it("parses lat/lng from a comma-separated `location` string when both are missing", () => {
    const out = enrichDeviceDetailsWithGeoIp(baseDevice, { location: "12.9,77.6" });
    expect(out.geoip.lat).toBeCloseTo(12.9);
    expect(out.geoip.lng).toBeCloseTo(77.6);
  });

  it("returns null lat/lng for non-numeric input", () => {
    const out = enrichDeviceDetailsWithGeoIp(baseDevice, { latitude: "not-a-number" });
    expect(out.geoip.lat).toBeNull();
  });

  it("returns null lat/lng when nothing is present", () => {
    const out = enrichDeviceDetailsWithGeoIp(baseDevice, {});
    expect(out.geoip.lat).toBeNull();
    expect(out.geoip.lng).toBeNull();
  });

  it("handles an undefined/null geoip input gracefully", () => {
    const out = enrichDeviceDetailsWithGeoIp(baseDevice, undefined as unknown as RawGeoIpResponse);
    expect(out.geoip).toEqual({
      city_en: "",
      country_code: "",
      country_en: "",
      ip: "",
      lat: null,
      lng: null,
    });
  });
});

// ─── getDeviceDetailsSnapshot ─────────────────────────────────────────────────

const UA_MAC_CHROME =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36";
const UA_WINDOWS_CHROME =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36";
const UA_IPHONE =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Version/17.0 Mobile/15E148 Safari/604.1";
const UA_LINUX_CHROME =
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36";
const UA_ANDROID =
  "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Mobile Safari/537.36";

describe("services/getDeviceDetailsSnapshot", () => {
  it("returns the four required fields with a fresh `geoip` object", () => {
    const snap = getDeviceDetailsSnapshot(UA_MAC_CHROME);
    expect(snap).toHaveProperty("device_type");
    expect(snap).toHaveProperty("os_type");
    expect(snap).toHaveProperty("user_agent");
    expect(snap.geoip).toEqual({});
  });

  it('resolves Mac Chrome to os_type "macos" (not chromium)', () => {
    expect(getDeviceDetailsSnapshot(UA_MAC_CHROME).os_type).toBe("macos");
  });

  it('resolves Windows Chrome to os_type "windows"', () => {
    expect(getDeviceDetailsSnapshot(UA_WINDOWS_CHROME).os_type).toBe("windows");
  });

  it('resolves iPhone Safari to os_type "ios"', () => {
    expect(getDeviceDetailsSnapshot(UA_IPHONE).os_type).toBe("ios");
  });

  it('resolves Linux Chrome to os_type "chromium"', () => {
    expect(getDeviceDetailsSnapshot(UA_LINUX_CHROME, false, true).os_type).toBe("chromium");
  });

  it('resolves Linux non-Chrome to os_type "linux"', () => {
    expect(getDeviceDetailsSnapshot("Mozilla/5.0 (X11; Linux x86_64)", false, false).os_type).toBe("linux");
  });

  it('resolves Android Chrome (touch device, not Mac) to "android"', () => {
    expect(getDeviceDetailsSnapshot(UA_ANDROID, true, false).os_type).toBe("android");
  });

  it('returns device_type "mobile" for iPhone UA', () => {
    expect(getDeviceDetailsSnapshot(UA_IPHONE).device_type).toBe("mobile");
  });

  it('returns device_type "desktop" for desktop UAs', () => {
    expect(getDeviceDetailsSnapshot(UA_MAC_CHROME).device_type).toBe("desktop");
    expect(getDeviceDetailsSnapshot(UA_WINDOWS_CHROME).device_type).toBe("desktop");
  });

  it("preserves the supplied user_agent verbatim", () => {
    expect(getDeviceDetailsSnapshot(UA_MAC_CHROME).user_agent).toBe(UA_MAC_CHROME);
  });

  it("returns independent geoip objects on each call", () => {
    const a = getDeviceDetailsSnapshot(UA_MAC_CHROME);
    const b = getDeviceDetailsSnapshot(UA_MAC_CHROME);
    expect(a.geoip).not.toBe(b.geoip);
  });

  it('coalesces bot UA to device_type "desktop"', () => {
    const botUa = "Googlebot/2.1 (+http://www.google.com/bot.html)";
    expect(getDeviceDetailsSnapshot(botUa, false, false).device_type).toBe("desktop");
  });

  it("reads navigator defaults for ua/hasTouch when not provided", () => {
    const snap = getDeviceDetailsSnapshot();
    expect(typeof snap.user_agent).toBe("string");
    expect(typeof snap.device_type).toBe("string");
    expect(typeof snap.os_type).toBe("string");
  });

  it("treats explicit `hasTouch=false` distinctly from the navigator default", () => {
    expect(getDeviceDetailsSnapshot(UA_MAC_CHROME, false).os_type).toBe("macos");
  });
});

describe("resolveClientIp", () => {
  it("prefers ip, then query, then tip", () => {
    expect(resolveClientIp({ ip: "1.1.1.1", query: "2.2.2.2", tip: "3.3.3.3" })).toBe("1.1.1.1");
    expect(resolveClientIp({ query: "2.2.2.2", tip: "3.3.3.3" })).toBe("2.2.2.2");
    expect(resolveClientIp({ tip: "3.3.3.3" })).toBe("3.3.3.3");
  });

  it("returns undefined when no IP field is present or geoip is nullish", () => {
    expect(resolveClientIp({ city: "Pune" })).toBeUndefined();
    expect(resolveClientIp(null)).toBeUndefined();
    expect(resolveClientIp(undefined)).toBeUndefined();
  });
});

// ─── isWebView ──────────────────────────────────────────────────────────────────

describe("isWebView", () => {
  it("detects iOS WKWebView (no Safari token)", () => {
    expect(isWebView(IOS_WKWEBVIEW)).toBe(true);
  });

  it("does not flag real Mobile Safari on iOS", () => {
    expect(isWebView(IPHONE_SAFARI)).toBe(false);
  });

  it("detects Android WebView via the 'wv' token", () => {
    expect(isWebView(ANDROID_WEBVIEW_WV)).toBe(true);
  });

  it("detects legacy Android WebView UA shape", () => {
    expect(isWebView(ANDROID_WEBVIEW_LEGACY)).toBe(true);
  });

  it("does not flag real Android Chrome mobile", () => {
    expect(isWebView(ANDROID_PHONE)).toBe(false);
  });

  it("detects the Facebook in-app browser", () => {
    expect(isWebView(FACEBOOK_IAB)).toBe(true);
  });

  it("detects the Instagram in-app browser", () => {
    expect(isWebView(INSTAGRAM_IAB)).toBe(true);
  });

  it("detects the WeChat in-app browser", () => {
    expect(isWebView(WECHAT_IAB)).toBe(true);
  });

  it("detects the TikTok in-app browser", () => {
    expect(isWebView(TIKTOK_IAB)).toBe(true);
  });

  it("detects the LinkedIn in-app browser", () => {
    expect(isWebView(LINKEDIN_IAB)).toBe(true);
  });

  it("does not flag desktop Chrome, Firefox, or Mac Chrome", () => {
    expect(isWebView(WIN_CHROME)).toBe(false);
    expect(isWebView(LINUX_FIREFOX)).toBe(false);
    expect(isWebView(MAC_CHROME)).toBe(false);
  });

  it("does not flag iPadOS 13+ (Mac UA + touch), matching detectDevice's own carve-out", () => {
    expect(isWebView(IPAD_OS13_MAC_UA)).toBe(false);
  });

  it("returns false for an empty/undefined UA", () => {
    expect(isWebView("")).toBe(false);
    expect(isWebView(undefined)).toBe(false);
  });
});
