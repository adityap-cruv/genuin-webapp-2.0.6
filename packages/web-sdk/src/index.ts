// Import styles
import './styles.css'

// Modern API exports
export * from './core'
export * from './sdk'
export * from './types'

// React components for React users
export { SDKProvider, useSDK, useSDKConfig } from './core/context'

// Main SDK class for vanilla JS and React
export { GenuinSDK } from './sdk'

// Import for browser global setup
import { Genuin } from './sdk'

// Types
export {
  EmbedStyle,
  type EmbedConfig,
  type EmbedState,
  type EmbedMessage,
} from './types/embed'

export {
  SDKEventType,
  ErrorType,
  type SDKEvent,
  type EventListener,
  type SDKError,
} from './core'

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
      emit?: typeof Genuin.emit
      onAll?: typeof Genuin.onAll
      onInternal: typeof Genuin.onInternal
      offInternal: typeof Genuin.offInternal
      emitInternal: typeof Genuin.emitInternal
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
  }
}

// Export at the end to ensure it appears in the compiled ES module
export { Genuin }
export default Genuin