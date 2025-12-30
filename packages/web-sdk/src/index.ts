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

// Lazy load React-dependent exports to avoid pulling in React on init
// SDKProvider is only for React users - export as a getter that lazy loads
export function getSDKProvider() {
  return import('./core/context').then((m) => ({
    SDKProvider: m.SDKProvider,
    useSDK: m.useSDK,
    useSDKConfig: m.useSDKConfig,
  }))
}

// Type exports (no runtime cost)
export type { BrandDetailsResponse } from './core/api'

// SDK exports
export { GenuinSDK, Genuin } from './sdk'

// Type exports (selective)
export type { EmbedConfig, EmbedState, EmbedMessage } from './types/embed'
export { EmbedStyle } from './types/embed'

// Import for browser global setup
import { Genuin } from './sdk'

// Extend the global Window interface for TypeScript
declare global {
  interface Window {
    GenuinSDK?: typeof Genuin
    genuin?: {
      SDK?: typeof Genuin
      on?: typeof Genuin.on
      off?: typeof Genuin.off
      init?: (config: any) => ReturnType<typeof Genuin.newInit>
      update?: (config: any) => ReturnType<typeof Genuin.newUpdate>
      expand?: typeof Genuin.expand
      collapse?: typeof Genuin.collapse
      emit?: typeof Genuin.emit
      onAll?: typeof Genuin.onAll
      onInternal: typeof Genuin.onInternal
      offInternal: typeof Genuin.offInternal
      emitInternal: typeof Genuin.emitInternal
      destroy: typeof Genuin.destroy
      _initQueue?: Array<() => void>
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
    onInternal: Genuin.onInternal.bind(Genuin),
    offInternal: Genuin.offInternal.bind(Genuin),
    emitInternal: Genuin.emitInternal.bind(Genuin),
    destroy: Genuin.destroy.bind(Genuin),
    expand: Genuin.expand.bind(Genuin),
    collapse: Genuin.collapse.bind(Genuin),
  }
}

// Export default (Genuin is already exported above from './sdk')
export default Genuin
