/**
 * Console Provider
 * Simple provider that logs events to the console (useful for debugging)
 */

import { BaseProvider } from "./base-provider";
import { ProviderStatus } from "../types/provider";
import type { ProviderConfig, UserTraits, PageProperties, GroupTraits } from "../types/provider";

/**
 * Console provider configuration
 */
export interface ConsoleConfig extends ProviderConfig {
  /**
   * Whether to use colored output (if supported)
   * @default true
   */
  useColors?: boolean;

  /**
   * Whether to show timestamps
   * @default true
   */
  showTimestamps?: boolean;

  /**
   * Whether to pretty-print payloads
   * @default true
   */
  prettyPrint?: boolean;

  /**
   * Log level
   * @default 'log'
   */
  logLevel?: "log" | "info" | "warn" | "debug";
}

/**
 * ConsoleProvider logs analytics events to the console
 * Useful for development and debugging
 */
export class ConsoleProvider extends BaseProvider {
  readonly id = "console";
  readonly name = "Console Logger";

  private consoleConfig: Required<ConsoleConfig>;

  constructor(config: ConsoleConfig = {}) {
    super(config);
    this.consoleConfig = {
      useColors: config.useColors ?? true,
      showTimestamps: config.showTimestamps ?? true,
      prettyPrint: config.prettyPrint ?? true,
      logLevel: config.logLevel ?? "log",
    };
  }

  /**
   * Initialize the console provider (immediately ready)
   */
  async initialize(_config: ProviderConfig = {}): Promise<void> {
    if (this.isInitialized()) {
      return Promise.resolve();
    }

    this.setStatus(ProviderStatus.INITIALIZING);

    // Console provider is immediately ready
    this.setStatus(ProviderStatus.READY);

    // Process any queued events
    await this.processQueue();

    return Promise.resolve();
  }

  /**
   * Track an analytics event
   */
  async track(eventName: string, payload: Record<string, any>, context?: Record<string, any>): Promise<void> {
    if (!this.isInitialized()) {
      this.queueEvent({
        name: eventName,
        payload,
        context,
        timestamp: Date.now(),
      });
      return;
    }

    const timestamp = this.consoleConfig.showTimestamps ? new Date().toISOString() : null;
    const prefix = this.getPrefix("TRACK", timestamp);

    if (this.consoleConfig.prettyPrint) {
      console.groupCollapsed(`${prefix} ${eventName}`);
      console.log("Payload:", payload);
      if (context) {
        console.log("Context:", context);
      }
      console.groupEnd();
    } else {
      this.log(`${prefix} ${eventName}`, { payload, context });
    }

    this.metrics.eventsSent++;
  }

  /**
   * Identify a user
   */
  async identify(userId: string, traits?: UserTraits): Promise<void> {
    if (!this.isInitialized()) {
      return;
    }

    const timestamp = this.consoleConfig.showTimestamps ? new Date().toISOString() : null;
    const prefix = this.getPrefix("IDENTIFY", timestamp);

    if (this.consoleConfig.prettyPrint) {
      console.groupCollapsed(`${prefix} ${userId}`);
      if (traits) {
        console.log("Traits:", traits);
      }
      console.groupEnd();
    } else {
      this.log(`${prefix} ${userId}`, { traits });
    }

    this.metrics.identifyCalls++;
  }

  /**
   * Track a page view
   */
  async page(pageName: string, properties?: PageProperties): Promise<void> {
    if (!this.isInitialized()) {
      return;
    }

    const timestamp = this.consoleConfig.showTimestamps ? new Date().toISOString() : null;
    const prefix = this.getPrefix("PAGE", timestamp);

    if (this.consoleConfig.prettyPrint) {
      console.groupCollapsed(`${prefix} ${pageName}`);
      if (properties) {
        console.log("Properties:", properties);
      }
      console.groupEnd();
    } else {
      this.log(`${prefix} ${pageName}`, { properties });
    }

    this.metrics.pageCalls++;
  }

  /**
   * Associate a user with a group
   */
  async group(groupId: string, traits?: GroupTraits): Promise<void> {
    if (!this.isInitialized()) {
      return;
    }

    const timestamp = this.consoleConfig.showTimestamps ? new Date().toISOString() : null;
    const prefix = this.getPrefix("GROUP", timestamp);

    if (this.consoleConfig.prettyPrint) {
      console.groupCollapsed(`${prefix} ${groupId}`);
      if (traits) {
        console.log("Traits:", traits);
      }
      console.groupEnd();
    } else {
      this.log(`${prefix} ${groupId}`, { traits });
    }
  }

  /**
   * Get formatted prefix for log messages
   */
  private getPrefix(type: string, timestamp: string | null): string {
    const parts: string[] = [];

    if (this.consoleConfig.useColors && typeof window !== "undefined") {
      // Browser environment - use emojis
      const emoji =
        {
          TRACK: "📊",
          IDENTIFY: "👤",
          PAGE: "📄",
          GROUP: "👥",
        }[type] || "📝";
      parts.push(emoji);
    }

    parts.push(`[Analytics ${type}]`);

    if (timestamp) {
      parts.push(`[${timestamp}]`);
    }

    return parts.join(" ");
  }

  /**
   * Log using the configured log level
   */
  private log(message: string, data?: any): void {
    const logFn = console[this.consoleConfig.logLevel] || console.log;

    if (data) {
      logFn(message, data);
    } else {
      logFn(message);
    }
  }
}
