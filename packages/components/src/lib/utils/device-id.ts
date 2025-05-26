import FingerPringJS from "@fingerprintjs/fingerprintjs";
import { useLocalStorage } from "usehooks-ts";

/**
 * Key for storing the device ID in local storage.
 */
export const DEVICE_ID_KEY_FOR_LOCAL_STORAGE = "geuinDeviceId";

/**
 * Gets a new device ID. Based on FingerPringJS.
 * This function is called when the device ID is not available in local storage.
 * @param onDeviceId - A callback function that is called with the new device ID.
 * @returns
 */
export async function getNewDeviceId(onDeviceId?: (deviceId: string) => void) {
  return FingerPringJS.load().then(async (fp) => {
    const visitorId = (await fp.get()).visitorId;
    onDeviceId?.(visitorId);
  });
}

/**
 * Get the device ID from local storage.
 * @returns The device ID or undefined if not found.
 */
export function getDeviceId() {
  const deviceId = localStorage.getItem(DEVICE_ID_KEY_FOR_LOCAL_STORAGE);
  if (!deviceId || deviceId.trim() === "" || deviceId === "undefined") {
    return undefined;
  }
  return deviceId.trim();
}

export function useGetDeviceId() {
  return useLocalStorage<string | undefined>(
    DEVICE_ID_KEY_FOR_LOCAL_STORAGE,
    undefined
  );
}
