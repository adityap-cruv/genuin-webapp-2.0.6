/**
 * Provider types and interfaces
 */

/**
 * Status of an analytics provider
 */
export enum ProviderStatus {
  UNINITIALIZED = 'uninitialized',
  INITIALIZING = 'initializing',
  READY = 'ready',
  ERROR = 'error',
  DESTROYED = 'destroyed',
}

/**
 * Base configuration for all providers
 */
export interface ProviderConfig {
  [key: string]: any
}

/**
 * Error from a provider
 */
export interface ProviderError {
  providerId: string
  providerName: string
  error: Error
  timestamp: number
  context?: string
}

/**
 * User traits for identify calls
 */
export interface UserTraits {
  [key: string]: any
}

/**
 * Page properties for page calls
 */
export interface PageProperties {
  [key: string]: any
}

/**
 * Group traits for group calls
 */
export interface GroupTraits {
  [key: string]: any
}

/**
 * Core interface that all analytics providers must implement
 */
export interface AnalyticsProvider {
  /**
   * Unique identifier for this provider instance
   */
  readonly id: string

  /**
   * Human-readable name of the provider
   */
  readonly name: string

  /**
   * Initialize the provider
   * This should load any required SDKs and set up the provider
   */
  initialize(config: ProviderConfig): Promise<void>

  /**
   * Check if the provider is initialized and ready to track events
   */
  isInitialized(): boolean

  /**
   * Get the current status of the provider
   */
  getStatus(): ProviderStatus

  /**
   * Track an analytics event
   */
  track(
    eventName: string,
    payload: Record<string, any>,
    context?: Record<string, any>
  ): Promise<void>

  /**
   * Identify a user
   */
  identify(userId: string, traits?: UserTraits): Promise<void>

  /**
   * Track a page view
   */
  page(pageName: string, properties?: PageProperties): Promise<void>

  /**
   * Associate a user with a group
   */
  group?(groupId: string, traits?: GroupTraits): Promise<void>

  /**
   * Clean up and destroy the provider
   */
  destroy(): void

  /**
   * Optional error handler
   */
  onError?: (error: ProviderError) => void
}
