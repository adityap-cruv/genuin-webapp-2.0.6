/**
 * @genuin/analytics
 * Generic analytics package with multi-provider support
 */

// Core
export { AnalyticsClient } from "./core/analytics-client";
export type { AnalyticsMetrics } from "./core/analytics-client";

export { EventQueue } from "./core/event-queue";
export { PayloadMerger } from "./core/payload-merger";
export { EventValidator } from "./core/event-validator";
export type { EventSchema, ValidatorFunction } from "./core/event-validator";
export { MiddlewareChain } from "./core/middleware";

// Providers
export { BaseProvider } from "./providers/base-provider";
export { RudderstackProvider } from "./providers/rudderstack-provider";
export type { RudderstackConfig } from "./providers/rudderstack-provider";
export { ConsoleProvider } from "./providers/console-provider";
export type { ConsoleConfig } from "./providers/console-provider";

// Types - Export all types
export * from "./types";

// Utilities
export { BrowserDetector, DeviceDetector, URLParser, SessionManager, DeviceIdManager } from "./utils";
export type { BrowserInfo, DeviceInfo, OSInfo, SessionData } from "./utils";
