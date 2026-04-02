/**
 * Event types and interfaces
 */

/**
 * Generic event payload type
 */
export type EventPayload = Record<string, any>

/**
 * Page context information
 */
export interface PageContext {
  url?: string
  path?: string
  title?: string
  referrer?: string
  queryParams?: Record<string, string | string[]>
}

/**
 * User context information
 */
export interface UserContext {
  userId?: string
  genUserId?: string
  anonymousId?: string
  traits?: Record<string, any>
}

/**
 * Device context information
 */
export interface DeviceContext {
  type?: 'mobile' | 'tablet' | 'desktop'
  model?: string
  browser?: {
    name?: string
    version?: string
  }
  os?: {
    name?: string
    version?: string
  }
}

/**
 * Session context information
 */
export interface SessionContext {
  sessionId?: string
  startTime?: number
  lastActivityTime?: number
  isNewSession?: boolean
}

/**
 * Complete event context
 */
export interface EventContext {
  page?: PageContext
  user?: UserContext
  device?: DeviceContext
  session?: SessionContext
  [key: string]: any
}

/**
 * Event metadata
 */
export interface EventMetadata {
  source?: string
  version?: string
  [key: string]: any
}

/**
 * Priority level for events
 */
export enum EventPriority {
  LOW = 1,
  NORMAL = 3,
  HIGH = 5,
}

/**
 * Complete analytics event structure
 */
export interface AnalyticsEvent {
  /**
   * Event name
   */
  name: string

  /**
   * Event payload data
   */
  payload: EventPayload

  /**
   * Timestamp when event was created
   */
  timestamp: number

  /**
   * Optional event context
   */
  context?: EventContext

  /**
   * Optional event metadata
   */
  metadata?: EventMetadata

  /**
   * Optional priority level
   */
  priority?: EventPriority
}

/**
 * Queued event with additional tracking info
 */
export interface QueuedEvent extends AnalyticsEvent {
  /**
   * When the event was queued
   */
  queuedAt: number

  /**
   * Number of retry attempts
   */
  retryCount?: number
}
