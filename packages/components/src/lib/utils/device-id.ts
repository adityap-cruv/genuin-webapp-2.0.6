import { useLocalStorage } from "usehooks-ts";

import internalStorage from "@genuin/components/lib/utils/internal-storage-manager";

/**
 * Key for storing the device ID in local storage.
 */
export const DEVICE_ID_KEY_FOR_LOCAL_STORAGE = "geuinDeviceId";

/**
 * Type definitions for FingerprintJS loaded from CDN
 */
declare global {
  interface Window {
    FingerprintJS?: {
      load: (options?: any) => Promise<{
        get: () => Promise<{ visitorId: string; [key: string]: any }>;
      }>;
    };
  }
}

/**
 * CDN URL for FingerprintJS library
 * Using jsDelivr CDN with specific version for reliability and caching
 */
const FINGERPRINTJS_CDN_URL = "https://cdn.jsdelivr.net/npm/@fingerprintjs/fingerprintjs@4.6.2/dist/fp.umd.min.js";

/**
 * Promise to track FingerprintJS script loading
 * Ensures we only load the script once, even if multiple calls happen simultaneously
 */
let fingerprintJSLoadPromise: Promise<void> | null = null;

/**
 * Loads FingerprintJS from CDN using a lazy-loading approach
 * Inspired by RudderStack CDN loading pattern from analytics service
 * @returns Promise that resolves when FingerprintJS is loaded and available
 */
function loadFingerprintJSScript(): Promise<void> {
  // Return existing promise if already loading or loaded
  if (fingerprintJSLoadPromise) {
    return fingerprintJSLoadPromise;
  }

  fingerprintJSLoadPromise = new Promise<void>((resolve, reject) => {
    // Check if already loaded
    if (typeof window !== "undefined" && window.FingerprintJS) {
      resolve();
      return;
    }

    if (typeof window === "undefined") {
      reject(new Error("[FingerprintJS] Window object not available"));
      return;
    }

    try {
      const script = document.createElement("script");
      script.type = "text/javascript";
      script.async = true;
      script.src = FINGERPRINTJS_CDN_URL;

      script.onload = () => {
        if (window.FingerprintJS) {
          resolve();
        } else {
          reject(new Error("[FingerprintJS] Script loaded but FingerprintJS not available on window"));
        }
      };

      script.onerror = () => {
        fingerprintJSLoadPromise = null; // Reset promise to allow retry
        reject(new Error("[FingerprintJS] Failed to load FingerprintJS from CDN"));
      };

      document.head.appendChild(script);
    } catch (error) {
      fingerprintJSLoadPromise = null; // Reset promise to allow retry
      reject(error);
    }
  });

  return fingerprintJSLoadPromise;
}

/**
 * Gets a new device ID. Based on FingerprintJS loaded from CDN.
 * This function is called when the device ID is not available in local storage.
 * @param onDeviceId - A callback function that is called with the new device ID.
 * @returns Promise that resolves when device ID is generated
 */
export async function getNewDeviceId(onDeviceId?: (deviceId: string) => void): Promise<void> {
  try {
    // Lazy load FingerprintJS from CDN
    await loadFingerprintJSScript();

    // Use the CDN-loaded FingerprintJS
    if (!window.FingerprintJS) {
      throw new Error("[FingerprintJS] Library not available after loading");
    }

    const fp = await window.FingerprintJS.load();
    const result = await fp.get();
    const visitorId = result.visitorId;

    onDeviceId?.(visitorId);
  } catch (error) {
    console.error("[FingerprintJS] Error generating device ID:", error);
    // Optionally: Generate a fallback ID or rethrow
    throw error;
  }
}

/**
 * Get the device ID from local storage.
 * @returns The device ID or undefined if not found.
 */
export function getDeviceId(isInIframe: boolean) {
  const deviceId = isInIframe
    ? internalStorage.getItem(DEVICE_ID_KEY_FOR_LOCAL_STORAGE)
    : localStorage.getItem(DEVICE_ID_KEY_FOR_LOCAL_STORAGE);
  if (!deviceId || deviceId.trim() === "" || deviceId === "undefined") {
    return undefined;
  }
  return isInIframe ? deviceId.trim() : JSON.parse(deviceId);
}

export function useGetDeviceId() {
  return useLocalStorage<string | undefined>(DEVICE_ID_KEY_FOR_LOCAL_STORAGE, undefined);
}
