/**
 * Logging Middleware
 * Logs analytics events to the console (useful for debugging)
 */

import type { Middleware } from '../types/middleware'

/**
 * Logging options
 */
export interface LoggingOptions {
  /**
   * Whether to log events
   * @default true
   */
  enabled?: boolean

  /**
   * Whether to use console.group for better formatting
   * @default true
   */
  useGroups?: boolean

  /**
   * Whether to log payload
   * @default true
   */
  logPayload?: boolean

  /**
   * Whether to log context
   * @default false
   */
  logContext?: boolean

  /**
   * Log level
   * @default 'log'
   */
  logLevel?: 'log' | 'info' | 'debug' | 'warn'
}

/**
 * Creates logging middleware that logs events to console
 */
export function createLoggingMiddleware(options: LoggingOptions = {}): Middleware {
  const {
    enabled = true,
    useGroups = true,
    logPayload = true,
    logContext = false,
    logLevel = 'log',
  } = options

  return async (event, next, middlewareContext) => {
    if (!enabled || !middlewareContext.debug) {
      await next()
      return
    }

    const logFn = console[logLevel] || console.log
    const timestamp = new Date(event.timestamp).toISOString()

    if (useGroups && console.groupCollapsed) {
      console.groupCollapsed(`📊 [Analytics] ${event.name} - ${timestamp}`)

      if (logPayload) {
        console.log('Payload:', event.payload)
      }

      if (logContext && event.context) {
        console.log('Context:', event.context)
      }

      if (event.priority) {
        console.log('Priority:', event.priority)
      }

      console.groupEnd()
    } else {
      const parts = [`📊 [Analytics] ${event.name} - ${timestamp}`]

      if (logPayload) {
        parts.push('\nPayload:', JSON.stringify(event.payload, null, 2))
      }

      if (logContext && event.context) {
        parts.push('\nContext:', JSON.stringify(event.context, null, 2))
      }

      logFn(...parts)
    }

    // Continue to next middleware
    await next()
  }
}

/**
 * Default logging middleware
 */
export const loggingMiddleware = createLoggingMiddleware()
