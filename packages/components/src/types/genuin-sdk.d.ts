/**
 * Type definitions for the Genuin SDK's global interface
 */

interface GenuinSDK {
  /**
   * Initializes the SDK with the provided configuration
   */
  init: (config: any) => void;

  /**
   * Updates the SDK with new configuration parameters
   */
  update: (config: any) => void;

  /**
   * Emits an event to the SDK event system
   */
  emit: (eventName: string, payload: any) => void;
  emitInternal: (eventName: string, payload: any) => void;

  /**
   * Registers an event listener
   */
  on: (eventName: string, listener: (props: any) => void) => void;
  onInternal: (eventName: string, listener: (props: any) => void) => void;

  /**
   * Removes an event listener
   */
  off: (eventName: string, listener: (props: any) => void) => void;
  offInternal: (eventName: string, listener: (props: any) => void) => void;
  onAll: (listener: (props: any) => void) => void;
  /**
   * Version of the Genuin SDK currently loaded on the page.
   */
  version?: string;
}

declare global {
  interface Window {
    /**
     * Global Genuin SDK instance
     */
    genuin?: GenuinSDK;
  }
}

export {};
