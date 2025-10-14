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
      _initQueue?: Array<() => void>
    }
    onGenuinReady?: (sdk: typeof Genuin) => void
  }
}

// Set up global API for browser usage
if (typeof window !== 'undefined') {
  // Modern global API
  window.GenuinSDK = Genuin

  // Enhanced global API with both legacy and new methods
  window.genuin = {
    // Main SDK instance
    SDK: Genuin,

    // Event handling methods
    on: Genuin.on.bind(Genuin),
    off: Genuin.off.bind(Genuin),
    emit: Genuin.emit.bind(Genuin),
    onAll: Genuin.onAll.bind(Genuin),

    // Legacy methods - now properly connected to new architecture
    init: (config: any) => {
      return Genuin.newInit(config)
    },
    update: (config: any) => {
      return Genuin.newUpdate(config)
    },
  }
}

// Export at the end to ensure it appears in the compiled ES module
export { Genuin }
export default Genuin