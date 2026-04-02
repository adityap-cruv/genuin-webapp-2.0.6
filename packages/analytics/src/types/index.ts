/**
 * Main types export
 */

// Provider types
export type {
  AnalyticsProvider,
  ProviderConfig,
  ProviderError,
  UserTraits,
  PageProperties,
  GroupTraits,
} from './provider'
export { ProviderStatus } from './provider'

// Event types
export type {
  EventPayload,
  PageContext,
  UserContext,
  DeviceContext,
  SessionContext,
  EventContext,
  EventMetadata,
  AnalyticsEvent,
  QueuedEvent,
} from './events'
export { EventPriority } from './events'

// Config types
export type {
  QueueConfig,
  ValidationConfig,
  MergeStrategy,
  MergeRule,
  MergeConfig,
  SanitizationConfig,
  AnalyticsConfig,
} from './config'

// Payload types
export type {
  DefaultPayload,
  MergedPayload,
  SanitizedPayload,
  ValidationResult,
  ValidationError,
  ValidationWarning,
} from './payload'

// Middleware types
export type {
  MiddlewareContext,
  Middleware,
  MiddlewareOptions,
} from './middleware'
