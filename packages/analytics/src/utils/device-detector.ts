/**
 * Device Detection Utility
 * Detects device and OS information using ua-parser-js
 */

import { UAParser } from "ua-parser-js";

export interface DeviceInfo {
  type?: "mobile" | "tablet" | "desktop";
  model?: string;
  vendor?: string;
}

export interface OSInfo {
  name?: string;
  version?: string;
}

/**
 * DeviceDetector provides device detection utilities
 */
export class DeviceDetector {
  private static parser: UAParser | null = null;

  /**
   * Get parser instance (singleton)
   */
  private static getParser(): UAParser {
    if (!this.parser) {
      this.parser = new UAParser();
    }
    return this.parser;
  }

  /**
   * Detect device information
   */
  static detect(): DeviceInfo {
    if (typeof window === "undefined") {
      return { type: "desktop" };
    }

    try {
      const parser = this.getParser();
      const result = parser.getResult();
      const device = result.device || {};

      // Map UAParser device type to our simplified types
      let type: "mobile" | "tablet" | "desktop" = "desktop";
      if (device.type === "mobile") {
        type = "mobile";
      } else if (device.type === "tablet") {
        type = "tablet";
      }

      return {
        type,
        model: device.model,
        vendor: device.vendor,
      };
    } catch (error) {
      console.error("[DeviceDetector] Error detecting device:", error);
      return { type: "desktop" };
    }
  }

  /**
   * Get device type
   */
  static getType(): "mobile" | "tablet" | "desktop" {
    return this.detect().type || "desktop";
  }

  /**
   * Get device model
   */
  static getModel(): string | undefined {
    return this.detect().model;
  }

  /**
   * Get device vendor
   */
  static getVendor(): string | undefined {
    return this.detect().vendor;
  }

  /**
   * Detect OS information
   */
  static getOS(): OSInfo {
    if (typeof window === "undefined") {
      return {};
    }

    try {
      const parser = this.getParser();
      const result = parser.getResult();
      return result.os || {};
    } catch (error) {
      console.error("[DeviceDetector] Error detecting OS:", error);
      return {};
    }
  }

  /**
   * Get OS name
   */
  static getOSName(): string | undefined {
    return this.getOS().name;
  }

  /**
   * Get OS version
   */
  static getOSVersion(): string | undefined {
    return this.getOS().version;
  }

  /**
   * Check if mobile device
   */
  static isMobile(): boolean {
    return this.getType() === "mobile";
  }

  /**
   * Check if tablet device
   */
  static isTablet(): boolean {
    return this.getType() === "tablet";
  }

  /**
   * Check if desktop device
   */
  static isDesktop(): boolean {
    return this.getType() === "desktop";
  }

  /**
   * Check if iOS
   */
  static isIOS(): boolean {
    const osName = this.getOSName();
    return osName === "iOS" || osName === "iPadOS";
  }

  /**
   * Check if Android
   */
  static isAndroid(): boolean {
    return this.getOSName() === "Android";
  }

  /**
   * Check if Windows
   */
  static isWindows(): boolean {
    return this.getOSName() === "Windows";
  }

  /**
   * Check if macOS
   */
  static isMacOS(): boolean {
    return this.getOSName() === "Mac OS";
  }
}
