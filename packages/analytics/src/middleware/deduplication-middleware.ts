/**
 * Deduplication Middleware
 * Prevents duplicate events from being tracked within a time window
 */

import type { Middleware } from "../types/middleware";

/**
 * Deduplication options
 */
export interface DeduplicationOptions {
  /**
   * Time window for deduplication in milliseconds
   * @default 1000 (1 second)
   */
  timeWindow?: number;

  /**
   * Maximum number of events to track for deduplication
   * @default 100
   */
  maxTracked?: number;

  /**
   * Whether to include payload in deduplication key
   * If false, only event name is used
   * @default false
   */
  includePayload?: boolean;
}

/**
 * Event fingerprint for deduplication
 */
interface EventFingerprint {
  key: string;
  timestamp: number;
}

/**
 * Creates deduplication middleware
 */
export function createDeduplicationMiddleware(options: DeduplicationOptions = {}): Middleware {
  const { timeWindow = 1000, maxTracked = 100, includePayload = false } = options;

  const recentEvents: EventFingerprint[] = [];

  /**
   * Generate deduplication key for an event
   */
  function generateKey(eventName: string, payload?: Record<string, any>): string {
    if (!includePayload || !payload) {
      return eventName;
    }

    // Create a simple hash of the payload
    const payloadStr = JSON.stringify(payload);
    return `${eventName}:${payloadStr}`;
  }

  /**
   * Clean up old events outside the time window
   */
  function cleanupOldEvents() {
    const now = Date.now();
    const cutoff = now - timeWindow;

    // Remove events older than cutoff
    while (recentEvents.length > 0) {
      const firstEvent = recentEvents[0];
      if (!firstEvent || firstEvent.timestamp >= cutoff) {
        break;
      }
      recentEvents.shift();
    }

    // Also enforce max tracked limit
    while (recentEvents.length > maxTracked) {
      recentEvents.shift();
    }
  }

  /**
   * Check if event is a duplicate
   */
  function isDuplicate(key: string, timestamp: number): boolean {
    cleanupOldEvents();

    // Check if this exact event was tracked recently
    return recentEvents.some((event) => event.key === key && timestamp - event.timestamp < timeWindow);
  }

  /**
   * Track an event
   */
  function trackEvent(key: string, timestamp: number) {
    recentEvents.push({ key, timestamp });
  }

  return async (event, next, context) => {
    const key = generateKey(event.name, event.payload);
    const timestamp = event.timestamp;

    // Check if duplicate
    if (isDuplicate(key, timestamp)) {
      if (context.debug) {
        console.warn(`[DeduplicationMiddleware] Dropping duplicate event: ${event.name}`);
      }
      // Don't call next() - stop the chain
      return;
    }

    // Track this event
    trackEvent(key, timestamp);

    // Continue to next middleware
    await next();
  };
}

/**
 * Default deduplication middleware (1 second window)
 */
export const deduplicationMiddleware = createDeduplicationMiddleware();
