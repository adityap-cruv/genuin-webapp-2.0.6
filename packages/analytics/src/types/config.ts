/**
 * Configuration types
 */

import type { AnalyticsProvider } from "./provider";
import type { EventPayload } from "./events";

/**
 * Queue configuration
 */
export interface QueueConfig {
  /**
   * Maximum number of events to queue
   * @default 100
   */
  maxSize?: number;

  /**
   * Maximum age of events in milliseconds
   * Events older than this will be expired
   * @default 300000 (5 minutes)
   */
  maxAge?: number;

  /**
   * Queue strategy
   * @default 'fifo'
   */
  strategy?: "fifo" | "lifo" | "priority";

  /**
   * Whether to persist queue to localStorage
   * @default false
   */
  persist?: boolean;

  /**
   * Key to use for localStorage persistence
   * @default 'genuin-analytics-queue'
   */
  persistKey?: string;

  /**
   * Debounce time for saving to localStorage (ms)
   * @default 1000
   */
  persistDebounce?: number;
}

/**
 * Validation configuration
 */
export interface ValidationConfig {
  /**
   * Whether to enable validation
   * @default true in development, false in production
   */
  enabled?: boolean;

  /**
   * Whitelist of allowed event names
   * If set, only these events will be tracked
   */
  whitelist?: string[];

  /**
   * Blacklist of disallowed event names
   * These events will never be tracked
   */
  blacklist?: string[];

  /**
   * Whether to throw errors on validation failure
   * @default true in development, false in production
   */
  throwOnError?: boolean;

  /**
   * Whether to log warnings on validation failure
   * @default true
   */
  logWarnings?: boolean;
}

/**
 * Merge strategy for payloads
 */
export type MergeStrategy = "deep" | "shallow" | "override" | "additive";

/**
 * Merge rule for specific events
 */
export interface MergeRule {
  /**
   * Merge strategy to use
   */
  strategy: MergeStrategy;

  /**
   * Which payload takes priority in conflicts
   * @default 'event'
   */
  priority?: "default" | "event";

  /**
   * Optional transformation function
   */
  transform?: (payload: EventPayload) => EventPayload;
}

/**
 * Merge configuration
 */
export interface MergeConfig {
  /**
   * Default merge strategy
   * @default 'deep'
   */
  defaultStrategy?: MergeStrategy;

  /**
   * Event-specific merge rules
   */
  rules?: Map<string, MergeRule>;
}

/**
 * Sanitization configuration
 */
export interface SanitizationConfig {
  /**
   * Whether to remove null values
   * @default true
   */
  removeNull?: boolean;

  /**
   * Whether to remove undefined values
   * @default true
   */
  removeUndefined?: boolean;

  /**
   * Whether to remove empty strings
   * @default false
   */
  removeEmptyStrings?: boolean;

  /**
   * List of sensitive keys to remove
   */
  sensitiveKeys?: string[];

  /**
   * Whether to trim string values
   * @default true
   */
  trimStrings?: boolean;
}

/**
 * Main analytics configuration
 */
export interface AnalyticsConfig {
  /**
   * List of analytics providers to use
   */
  providers: AnalyticsProvider[];

  /**
   * Default payload to merge with all events
   */
  defaultPayload?: EventPayload;

  /**
   * Queue configuration
   */
  queue?: QueueConfig;

  /**
   * Validation configuration
   */
  validation?: ValidationConfig;

  /**
   * Merge configuration
   */
  merge?: MergeConfig;

  /**
   * Sanitization configuration
   */
  sanitization?: SanitizationConfig;

  /**
   * Whether to enable debug logging
   * @default false
   */
  debug?: boolean;

  /**
   * Whether to automatically initialize on creation
   * @default true
   */
  autoInitialize?: boolean;
}
