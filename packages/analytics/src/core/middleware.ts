/**
 * Middleware System
 * Implements chain of responsibility pattern for event processing
 */

import type { Middleware, MiddlewareContext, MiddlewareOptions } from '../types/middleware'
import type { AnalyticsEvent } from '../types/events'

/**
 * Middleware with metadata
 */
interface MiddlewareEntry {
  middleware: Middleware
  options: Required<MiddlewareOptions>
}

/**
 * Default middleware options
 */
const DEFAULT_MIDDLEWARE_OPTIONS: Required<MiddlewareOptions> = {
  priority: 50,
  enabled: true,
}

/**
 * MiddlewareChain manages and executes a chain of middleware functions
 */
export class MiddlewareChain {
  private middlewareList: MiddlewareEntry[] = []
  private context: MiddlewareContext

  constructor(context: MiddlewareContext = {}) {
    this.context = context
  }

  /**
   * Add middleware to the chain
   */
  use(middleware: Middleware, options: MiddlewareOptions = {}): void {
    const entry: MiddlewareEntry = {
      middleware,
      options: { ...DEFAULT_MIDDLEWARE_OPTIONS, ...options },
    }

    this.middlewareList.push(entry)

    // Sort by priority (lower priority number = executes first)
    this.sort()
  }

  /**
   * Remove middleware from the chain
   */
  remove(middleware: Middleware): void {
    this.middlewareList = this.middlewareList.filter(
      (entry) => entry.middleware !== middleware
    )
  }

  /**
   * Clear all middleware
   */
  clear(): void {
    this.middlewareList = []
  }

  /**
   * Execute the middleware chain for an event
   */
  async execute(event: AnalyticsEvent): Promise<void> {
    // Filter to only enabled middleware
    const enabledMiddleware = this.middlewareList.filter(
      (entry) => entry.options.enabled
    )

    if (enabledMiddleware.length === 0) {
      return
    }

    // Create the chain
    let index = 0

    const next = async (): Promise<void> => {
      if (index >= enabledMiddleware.length) {
        return
      }

      const entry = enabledMiddleware[index]
      if (!entry) return // Guard against undefined

      index++

      try {
        await entry.middleware(event, next, this.context)
      } catch (error) {
        console.error('[MiddlewareChain] Middleware error:', error)
        throw error
      }
    }

    // Start the chain
    await next()
  }

  /**
   * Update middleware context
   */
  updateContext(partial: Partial<MiddlewareContext>): void {
    this.context = { ...this.context, ...partial }
  }

  /**
   * Get current context
   */
  getContext(): MiddlewareContext {
    return { ...this.context }
  }

  /**
   * Get number of middleware
   */
  size(): number {
    return this.middlewareList.length
  }

  /**
   * Get number of enabled middleware
   */
  enabledSize(): number {
    return this.middlewareList.filter((entry) => entry.options.enabled).length
  }

  /**
   * Sort middleware by priority
   */
  private sort(): void {
    this.middlewareList.sort((a, b) => a.options.priority - b.options.priority)
  }
}
