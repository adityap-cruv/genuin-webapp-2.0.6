/**
 * Middleware types
 */

import type { AnalyticsEvent } from './events'

/**
 * Context passed to middleware
 */
export interface MiddlewareContext {
  /**
   * Session ID
   */
  sessionId?: string

  /**
   * Device ID
   */
  deviceId?: string

  /**
   * Whether running in debug mode
   */
  debug?: boolean

  /**
   * Additional context data
   */
  [key: string]: any
}

/**
 * Middleware function type
 */
export type Middleware = (
  event: AnalyticsEvent,
  next: () => Promise<void>,
  context: MiddlewareContext
) => Promise<void>

/**
 * Middleware options
 */
export interface MiddlewareOptions {
  /**
   * Priority/order of middleware execution
   * Lower numbers execute first
   */
  priority?: number

  /**
   * Whether middleware is enabled
   */
  enabled?: boolean
}
