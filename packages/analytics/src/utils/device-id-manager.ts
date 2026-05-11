/**
 * Device ID Manager Utility
 * Manages persistent device ID for analytics
 */

import { v4 as uuidv4 } from "uuid";

const DEVICE_ID_KEY = "genuin-analytics-device-id";

/**
 * DeviceIdManager handles device ID tracking for analytics
 */
export class DeviceIdManager {
  /**
   * Get device ID (creates new one if doesn't exist)
   */
  static getDeviceId(): string {
    if (typeof window === "undefined" || typeof localStorage === "undefined") {
      return this.generateDeviceId();
    }

    try {
      let deviceId = localStorage.getItem(DEVICE_ID_KEY);

      if (!deviceId) {
        deviceId = this.generateDeviceId();
        localStorage.setItem(DEVICE_ID_KEY, deviceId);
      }

      return deviceId;
    } catch (error) {
      console.error("[DeviceIdManager] Error getting device ID:", error);
      return this.generateDeviceId();
    }
  }

  /**
   * Generate a new device ID
   */
  static generateDeviceId(): string {
    return uuidv4();
  }

  /**
   * Clear device ID
   */
  static clearDeviceId(): void {
    if (typeof window === "undefined" || typeof localStorage === "undefined") {
      return;
    }

    try {
      localStorage.removeItem(DEVICE_ID_KEY);
    } catch (error) {
      console.error("[DeviceIdManager] Error clearing device ID:", error);
    }
  }

  /**
   * Set a specific device ID
   */
  static setDeviceId(deviceId: string): void {
    if (typeof window === "undefined" || typeof localStorage === "undefined") {
      return;
    }

    try {
      localStorage.setItem(DEVICE_ID_KEY, deviceId);
    } catch (error) {
      console.error("[DeviceIdManager] Error setting device ID:", error);
    }
  }

  /**
   * Get device ID that's aware of iframe context
   * Tries to get device ID from parent window if in iframe
   */
  static getDeviceIdIframeAware(): string {
    if (typeof window === "undefined") {
      return this.generateDeviceId();
    }

    try {
      // Check if we're in an iframe
      if (window !== window.parent) {
        try {
          // Try to access parent's localStorage
          const parentDeviceId = window.parent.localStorage?.getItem(DEVICE_ID_KEY);
          if (parentDeviceId) {
            // Store in our own localStorage too
            if (typeof localStorage !== "undefined") {
              localStorage.setItem(DEVICE_ID_KEY, parentDeviceId);
            }
            return parentDeviceId;
          }
        } catch (error) {
          // Cross-origin iframe, can't access parent localStorage
          // Fall through to get own device ID
        }
      }

      // Not in iframe or couldn't access parent - use own device ID
      return this.getDeviceId();
    } catch (error) {
      console.error("[DeviceIdManager] Error getting iframe-aware device ID:", error);
      return this.generateDeviceId();
    }
  }
}
