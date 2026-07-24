/**
 * Device detection and device-details snapshot utilities.
 *
 * Consolidates: device/detect, services/enrichDeviceDetailsWithGeoIp,
 * services/getDeviceDetailsSnapshot.
 */

import type { RawGeoIpResponse } from "@cxr/services/api";

// ─── Device detection ─────────────────────────────────────────────────────────

export type OsType = "ios" | "android" | "windows" | "macos" | "linux" | "other";
export type DeviceType = "mobile" | "tablet" | "desktop" | "bot";

/** Classified device information. */
export interface DeviceInfo {
  isMobile: boolean;
  osType: OsType;
  deviceType: DeviceType;
}

const BOT_RE = /bot|crawler|spider|crawling/i;
const IPHONE_RE = /iPhone|iPod/i;
const IPAD_RE = /iPad/i;
const ANDROID_RE = /Android/i;
const ANDROID_MOBILE_RE = /Android.*Mobile/i;
const WINDOWS_RE = /Windows/i;
const MAC_RE = /Macintosh|Mac OS X/i;
const LINUX_RE = /Linux/i;
const IOS_UA_RE = /iPhone|iPod|iPad/i;
const SAFARI_TOKEN_RE = /Safari/i;
const ANDROID_WV_RE = /; ?wv\)/i;
const ANDROID_LEGACY_WV_RE = /Version\/\d+\.\d+.*Chrome\/\d+\.\d+/i;
const IN_APP_BROWSER_RE =
  /FBAN|FBAV|FB_IAB|Instagram|Twitter|Line\/|MicroMessenger|musical_ly|TikTok|Snapchat|LinkedInApp|Pinterest|GSA\//i;

function readNavigatorUa(): string {
  if (typeof navigator === "undefined") return "";
  return navigator.userAgent ?? "";
}

function readNavigatorTouch(): boolean {
  if (typeof navigator === "undefined") return false;
  return (navigator.maxTouchPoints ?? 0) > 0;
}

/**
 * Classify the current (or supplied) user agent.
 *
 * @param ua       User-agent string. Defaults to `navigator.userAgent`.
 * @param hasTouch Whether the device reports touch. Defaults to
 *                 `navigator.maxTouchPoints > 0`. Used to disambiguate
 *                 iPadOS 13+ which masquerades as a Mac UA.
 */
export function detectDevice(ua?: string, hasTouch?: boolean): DeviceInfo {
  const agent = ua ?? readNavigatorUa();
  const touch = hasTouch ?? readNavigatorTouch();

  if (BOT_RE.test(agent)) {
    return { isMobile: false, osType: "other", deviceType: "bot" };
  }
  if (IPHONE_RE.test(agent)) {
    return { isMobile: true, osType: "ios", deviceType: "mobile" };
  }
  if (IPAD_RE.test(agent)) {
    return { isMobile: false, osType: "ios", deviceType: "tablet" };
  }
  // iPadOS 13+ reports a Mac UA; touch capability is the giveaway.
  if (MAC_RE.test(agent) && touch && !WINDOWS_RE.test(agent)) {
    return { isMobile: false, osType: "ios", deviceType: "tablet" };
  }
  if (ANDROID_RE.test(agent)) {
    if (ANDROID_MOBILE_RE.test(agent)) {
      return { isMobile: true, osType: "android", deviceType: "mobile" };
    }
    return { isMobile: false, osType: "android", deviceType: "tablet" };
  }
  if (WINDOWS_RE.test(agent)) {
    return { isMobile: false, osType: "windows", deviceType: "desktop" };
  }
  if (MAC_RE.test(agent)) {
    return { isMobile: false, osType: "macos", deviceType: "desktop" };
  }
  if (LINUX_RE.test(agent)) {
    return { isMobile: false, osType: "linux", deviceType: "desktop" };
  }
  return { isMobile: false, osType: "other", deviceType: "desktop" };
}

/**
 * Best-effort webview / in-app-browser detection. Heuristic — there is no single
 * reliable signal across platforms. Errs toward covering the common real-world
 * webviews (iOS WKWebView, Android WebView, named in-app browsers) rather than
 * minimizing false positives.
 *
 * @param ua User-agent string. Defaults to `navigator.userAgent`.
 */
export function isWebView(ua?: string): boolean {
  const agent = ua ?? readNavigatorUa();
  if (!agent) return false;

  if (IN_APP_BROWSER_RE.test(agent)) return true;

  // iOS WKWebView drops the Safari token that real Mobile Safari always keeps.
  if (IOS_UA_RE.test(agent) && !SAFARI_TOKEN_RE.test(agent)) return true;

  if (ANDROID_RE.test(agent) && (ANDROID_WV_RE.test(agent) || ANDROID_LEGACY_WV_RE.test(agent))) {
    return true;
  }

  return false;
}

// ─── Device details shape ─────────────────────────────────────────────────────

/** Normalised geoip block embedded inside device details. */
export interface NormalisedGeoIp {
  city_en: string;
  country_code: string;
  country_en: string;
  ip: string;
  lat: number | null;
  lng: number | null;
}

/** Shape of the device-details object the widget snapshots once per page. */
export interface DeviceDetails {
  device_type: string;
  os_type: string;
  geoip: Partial<NormalisedGeoIp>;
  user_agent: string;
}

// ─── GeoIP enricher ───────────────────────────────────────────────────────────

function tryFloat(value: unknown): number | null {
  if (value === undefined || value === null) return null;
  const n = parseFloat(String(value).trim());
  return Number.isFinite(n) ? n : null;
}

/**
 * Extract the client IP from a raw geoip payload, trying the fields the gateway
 * may use in priority order (`ip` → `query` → `tip`). Returns `undefined` when
 * none is present or `geoip` is nullish.
 *
 * @param geoip  Raw geoip payload returned by {@link getIpInfo}, or null.
 */
export function resolveClientIp(geoip: RawGeoIpResponse | null | undefined): string | undefined {
  return geoip?.ip ?? geoip?.query ?? geoip?.tip ?? undefined;
}

/**
 * Merge geoip fields into a fresh copy of `device` and return it. Never
 * mutates the caller-supplied object.
 *
 * @param device Snapshot returned by {@link getDeviceDetailsSnapshot}.
 * @param geoip  Raw geoip payload returned by {@link getIpInfo}.
 */
export function enrichDeviceDetailsWithGeoIp(
  device: DeviceDetails,
  geoip: RawGeoIpResponse | null | undefined
): DeviceDetails {
  const safe = (geoip ?? {}) as RawGeoIpResponse;
  const locationParts = (safe.location && String(safe.location).split(",")) || ([] as string[]);

  const mapped: NormalisedGeoIp = {
    city_en: safe.city ?? safe.city_en ?? "",
    country_code: safe.country ?? safe.country_code ?? "",
    country_en: safe.country_name ?? safe.country_en ?? "",
    ip: safe.ip ?? safe.query ?? safe.tip ?? "",
    lat: tryFloat(safe.latitude ?? safe.lat ?? locationParts[0]),
    lng: tryFloat(safe.longitude ?? safe.lon ?? safe.lng ?? locationParts[1]),
  };

  return {
    ...device,
    geoip: mapped,
  };
}

// ─── Device details snapshot ──────────────────────────────────────────────────

/**
 * Map a UA's classified properties to the legacy `os_type` string.
 *
 * Preserves the priority chain from `src/utility.js`:
 *   isMacOs    -> 'macos'
 *   isWindows  -> 'windows'
 *   isIOS      -> 'ios'
 *   isChromium -> 'chromium'
 *   isAndroid  -> 'android'
 *   else       -> 'linux'
 */
function resolveOsType(
  ua: string,
  hasTouch: boolean,
  isChrome: boolean
): "macos" | "windows" | "ios" | "chromium" | "android" | "linux" {
  const info = detectDevice(ua, hasTouch);
  if (info.osType === "macos") return "macos";
  if (info.osType === "windows") return "windows";
  if (info.osType === "ios") return "ios";
  if (info.osType === "linux" && isChrome) return "chromium";
  if (info.osType === "android") return "android";
  return "linux";
}

function resolveDeviceType(info: DeviceInfo): string {
  if (info.deviceType === "bot") return "desktop";
  return info.deviceType;
}

/**
 * Build a fresh device-details snapshot. Pure — no side effects, safe to call
 * many times. Caller is responsible for layering on a geoip block via
 * {@link enrichDeviceDetailsWithGeoIp}.
 *
 * @param ua        User agent string. Defaults to `navigator.userAgent`.
 * @param hasTouch  Whether the device reports touch input.
 * @param isChrome  Whether the browser is Chromium-engine.
 */
export function getDeviceDetailsSnapshot(ua?: string, hasTouch?: boolean, isChrome?: boolean): DeviceDetails {
  /* c8 ignore next */
  const agent = ua ?? (typeof navigator !== "undefined" ? navigator.userAgent : "");
  /* c8 ignore next 3 */
  const touch = hasTouch ?? (typeof navigator !== "undefined" ? (navigator.maxTouchPoints ?? 0) > 0 : false);
  const chrome = isChrome ?? /Chrome\//.test(agent);

  const info = detectDevice(agent, touch);
  return {
    device_type: resolveDeviceType(info),
    os_type: resolveOsType(agent, touch, chrome),
    geoip: {},
    user_agent: agent,
  };
}
