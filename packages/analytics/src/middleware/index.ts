/**
 * Built-in middleware exports
 */

export {
  enrichmentMiddleware,
  createEnrichmentMiddleware,
} from './enrichment-middleware'
export type { EnrichmentOptions } from './enrichment-middleware'

export {
  loggingMiddleware,
  createLoggingMiddleware,
} from './logging-middleware'
export type { LoggingOptions } from './logging-middleware'

export {
  deduplicationMiddleware,
  createDeduplicationMiddleware,
} from './deduplication-middleware'
export type { DeduplicationOptions } from './deduplication-middleware'
