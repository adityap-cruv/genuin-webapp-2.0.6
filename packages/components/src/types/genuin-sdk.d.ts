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
   * Seeds the SDK with a host-provided authenticated session so it renders
   * authenticated without an auth/login API call.
   */
  setUser?: (session: { user: unknown; accessToken: string; refreshToken?: string }) => void;

  /**
   * Clears the current user / logs out of the SDK.
   */
  logout?: () => void;

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
  // URL of the CSS file for the currently loaded SDK version.
  cssUrl?: string;
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
