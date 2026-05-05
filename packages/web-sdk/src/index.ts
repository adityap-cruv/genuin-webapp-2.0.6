// Lazy load styles to reduce initial bundle size
// Styles will be loaded when needed via dynamic import
if (typeof window !== 'undefined') {
  // Load styles asynchronously after initial load
  Promise.resolve().then(() => {
    import('./styles.css').catch(() => {
      // Silently fail if CSS can't be loaded
    })
  })
}

// Selective exports instead of export * to reduce bundle size
// Core exports (always needed - non-React)
export {
  EventManager,
  SDKEventType,
  type SDKEvent,
  type EventListener,
} from './core/events'
export { ErrorHandler, ErrorType, type SDKError } from './core/errors'
export { TokenManager } from './core/token-manager'
export { ThemeManager, type BrandTheme } from './core/theme'

// React context exports
export { SDKProvider, useSDK, useSDKConfig } from './core/context'

// Type exports (no runtime cost)
export type { BrandDetailsResponse } from './core/api'

// SDK exports
export { GenuinSDK, Genuin } from './sdk'

// Type exports (selective)
export type { EmbedConfig, EmbedState, EmbedMessage } from './types/embed'
export { EmbedStyle } from './types/embed'

// Import for browser global setup
import { Genuin } from './sdk'
import type { ConfigByUser, UpdateConfigByUserType } from './type'

// Extend the global Window interface for TypeScript
declare global {
  interface Window {
    GenuinSDK?: typeof Genuin
    genuin?: {
      SDK?: typeof Genuin
      on?: typeof Genuin.on
      off?: typeof Genuin.off
      init?: (config: ConfigByUser) => ReturnType<typeof Genuin.newInit>
      update?: (config: UpdateConfigByUserType) => ReturnType<typeof Genuin.newUpdate>
      expand?: typeof Genuin.expand
      collapse?: typeof Genuin.collapse
      // Widened to `string` so that cross-package callers (e.g. sdk-event-emitter
      // in @genuin/components) can pass their own event-name enums without a
      // type mismatch against the SDK-internal SDKEventType enum.
      emit?: (eventType: string, payload?: unknown) => void
      onAll?: typeof Genuin.onAll
      emitInternal: (eventType: string, payload?: unknown) => void
      onInternal: (eventType: string, listener: (payload: unknown) => void) => () => void
      offInternal: (eventType: string, listener: (payload: unknown) => void) => void
      destroy: typeof Genuin.destroy
      _initQueue?: Array<() => void>
      version?: string
      /** URL of the SDK stylesheet injected into Shadow DOM. Set by the SDK at init time. */
      cssUrl?: string
    }
    onGenuinReady?: (sdk: typeof Genuin) => void
  }
}

// Set up global API for browser usage
if (typeof window !== 'undefined') {
  // Modern global API
  // window.GenuinSDK = Genuin

  // Enhanced global API with both legacy and new methods
  window.genuin = {
    ...window.genuin,
    // Main SDK instance
    SDK: Genuin,
    // Cast needed: the window.genuin interface uses `string` for cross-package
    // compatibility, but the underlying methods use the narrower SDKEventType.
    onInternal: Genuin.onInternal.bind(Genuin) as (eventType: string, listener: (payload: unknown) => void) => () => void,
    offInternal: Genuin.offInternal.bind(Genuin) as (eventType: string, listener: (payload: unknown) => void) => void,
    emitInternal: Genuin.emitInternal.bind(Genuin) as (eventType: string, payload?: unknown) => void,
    destroy: Genuin.destroy.bind(Genuin),
    expand: Genuin.expand.bind(Genuin),
    collapse: Genuin.collapse.bind(Genuin),
  }
}

// Export default (Genuin is already exported above from './sdk')
export default Genuin
