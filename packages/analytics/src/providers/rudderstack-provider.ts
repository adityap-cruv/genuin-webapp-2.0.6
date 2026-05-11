/**
 * Rudderstack Provider
 * Analytics provider implementation for Rudderstack
 */

import { BaseProvider } from "./base-provider";
import { ProviderStatus } from "../types/provider";
import type { ProviderConfig, UserTraits, PageProperties, GroupTraits } from "../types/provider";

/**
 * Rudderstack-specific configuration
 */
export interface RudderstackConfig extends ProviderConfig {
  /**
   * Rudderstack write key
   */
  writeKey: string;

  /**
   * Rudderstack dataplane URL
   */
  dataplaneUrl: string;

  /**
   * Options passed to rudderanalytics.load()
   */
  loadOptions?: {
    storage?: {
      type?: "localStorage" | "sessionStorage" | "cookie";
      cookie?: Record<string, any>;
      entries?: Record<string, any>;
    };
    plugins?: string[];
    integrations?: Record<string, boolean>;
    [key: string]: any;
  };

  /**
   * Whether to use modern or legacy SDK bundle
   * @default 'modern'
   */
  sdkVersion?: "modern" | "legacy";

  /**
   * Custom CDN URL (optional)
   */
  cdnUrl?: string;
}

/**
 * Default Rudderstack load options
 */
const DEFAULT_LOAD_OPTIONS = {
  storage: {
    type: "localStorage" as const,
    cookie: {},
    entries: {
      userId: { type: "localStorage" },
      anonymousId: { type: "localStorage" },
      sessionInfo: { type: "localStorage" },
      userTraits: { type: "localStorage" },
      initialReferrer: { type: "localStorage" },
      groupId: { type: "localStorage" },
      groupTraits: { type: "localStorage" },
      initialReferringDomain: { type: "localStorage" },
      authToken: { type: "localStorage" },
    },
  },
  plugins: ["DeviceModeDestinations"],
  integrations: {
    All: false,
    "Google Analytics": false,
  },
};

/**
 * RudderstackProvider handles analytics tracking via Rudderstack
 */
export class RudderstackProvider extends BaseProvider {
  readonly id = "rudderstack";
  readonly name = "Rudderstack";

  private sdk: any = null;
  private rudderstackConfig: RudderstackConfig;

  constructor(config: RudderstackConfig) {
    super(config);
    this.rudderstackConfig = config;

    // Validate required config
    if (!config.writeKey) {
      throw new Error("[RudderstackProvider] writeKey is required");
    }
    if (!config.dataplaneUrl) {
      throw new Error("[RudderstackProvider] dataplaneUrl is required");
    }
  }

  /**
   * Initialize the Rudderstack SDK
   */
  async initialize(_config: ProviderConfig = {}): Promise<void> {
    if (this.initPromise) {
      return this.initPromise;
    }

    if (this.isInitialized()) {
      return Promise.resolve();
    }

    this.setStatus(ProviderStatus.INITIALIZING);

    this.initPromise = this._initialize();
    return this.initPromise;
  }

  private async _initialize(): Promise<void> {
    try {
      if (typeof window === "undefined") {
        throw new Error("[RudderstackProvider] Window object not available (non-browser environment)");
      }

      // Load Rudderstack SDK from CDN
      await this.loadSDK();

      // Get SDK instance
      this.sdk = (window as any).rudderanalytics;

      if (!this.sdk) {
        throw new Error("[RudderstackProvider] Rudderstack SDK failed to load");
      }

      // Merge load options
      const loadOptions = {
        ...DEFAULT_LOAD_OPTIONS,
        ...this.rudderstackConfig.loadOptions,
      };

      // Initialize Rudderstack
      this.sdk.load(this.rudderstackConfig.writeKey, this.rudderstackConfig.dataplaneUrl, loadOptions);

      // Wait for SDK to be ready
      await this.waitForReady();

      this.setStatus(ProviderStatus.READY);

      // Process any queued events
      await this.processQueue();
    } catch (error) {
      this.setStatus(ProviderStatus.ERROR);
      this.handleError(error as Error, "initialization");
      throw error;
    }
  }

  /**
   * Track an analytics event
   */
  async track(eventName: string, payload: Record<string, any>, context?: Record<string, any>): Promise<void> {
    if (!this.isInitialized()) {
      // Queue event if not initialized
      this.queueEvent({
        name: eventName,
        payload,
        context,
        timestamp: Date.now(),
      });
      return;
    }

    try {
      // Map context to Rudderstack options format
      const options = this.mapContextToOptions(context);

      // Call Rudderstack track
      this.sdk.track(eventName, payload, options);

      this.metrics.eventsSent++;
    } catch (error) {
      this.metrics.eventsFailed++;
      this.handleError(error as Error, `track: ${eventName}`);
      throw error;
    }
  }

  /**
   * Identify a user
   */
  async identify(userId: string, traits?: UserTraits): Promise<void> {
    if (!this.isInitialized()) {
      console.warn("[RudderstackProvider] Cannot identify: not initialized");
      return;
    }

    try {
      this.sdk.identify(userId, traits || {});
      this.metrics.identifyCalls++;
    } catch (error) {
      this.handleError(error as Error, "identify");
      throw error;
    }
  }

  /**
   * Track a page view
   */
  async page(pageName: string, properties?: PageProperties): Promise<void> {
    if (!this.isInitialized()) {
      console.warn("[RudderstackProvider] Cannot track page: not initialized");
      return;
    }

    try {
      this.sdk.page(pageName, properties || {});
      this.metrics.pageCalls++;
    } catch (error) {
      this.handleError(error as Error, "page");
      throw error;
    }
  }

  /**
   * Associate a user with a group
   */
  async group(groupId: string, traits?: GroupTraits): Promise<void> {
    if (!this.isInitialized()) {
      console.warn("[RudderstackProvider] Cannot group: not initialized");
      return;
    }

    try {
      this.sdk.group(groupId, traits || {});
    } catch (error) {
      this.handleError(error as Error, "group");
      throw error;
    }
  }

  /**
   * Clean up
   */
  destroy(): void {
    if (this.sdk && this.sdk.reset) {
      try {
        this.sdk.reset();
      } catch (error) {
        console.error("[RudderstackProvider] Error resetting SDK:", error);
      }
    }

    this.sdk = null;
    super.destroy();
  }

  /**
   * Load Rudderstack SDK from CDN
   */
  private async loadSDK(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      // Check if already loaded
      if (typeof window !== "undefined" && (window as any).rudderanalytics) {
        resolve();
        return;
      }

      try {
        // Create rudderanalytics stub methods to queue events before SDK loads
        const rudderanalytics = ((window as any).rudderanalytics = [] as any);

        // Methods to stub
        const methods = [
          "load",
          "page",
          "track",
          "identify",
          "alias",
          "group",
          "ready",
          "reset",
          "getAnonymousId",
          "setAnonymousId",
          "getUserId",
          "getUserTraits",
          "getGroupId",
          "getGroupTraits",
          "startSession",
          "endSession",
          "getSessionId",
        ];

        // Create stub for each method to queue calls
        for (let i = 0; i < methods.length; i++) {
          const method = methods[i];
          if (!method) continue; // Guard against undefined

          rudderanalytics[method] = (function (methodName: string) {
            return function () {
              rudderanalytics.push([methodName].concat(Array.prototype.slice.call(arguments)));
            };
          })(method);
        }

        // Determine SDK URL
        const sdkVersion = this.rudderstackConfig.sdkVersion || "modern";
        const cdnUrl = this.rudderstackConfig.cdnUrl || `https://cdn.rudderlabs.com/v3/${sdkVersion}/rsa.min.js`;

        // Load the actual SDK script
        const script = document.createElement("script");
        script.type = "text/javascript";
        script.async = true;
        script.src = cdnUrl;

        script.onload = () => {
          resolve();
        };

        script.onerror = () => {
          // Fallback to legacy bundle if modern fails
          if (sdkVersion === "modern") {
            const legacyScript = document.createElement("script");
            legacyScript.type = "text/javascript";
            legacyScript.async = true;
            legacyScript.src = "https://cdn.rudderlabs.com/v3/legacy/rsa.min.js";

            legacyScript.onload = () => {
              resolve();
            };

            legacyScript.onerror = () => {
              reject(new Error("[RudderstackProvider] Failed to load Rudderstack SDK from CDN (modern and legacy)"));
            };

            document.head.appendChild(legacyScript);
          } else {
            reject(new Error("[RudderstackProvider] Failed to load Rudderstack SDK from CDN"));
          }
        };

        document.head.appendChild(script);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Wait for Rudderstack SDK to be ready
   */
  private async waitForReady(): Promise<void> {
    return new Promise<void>((resolve) => {
      if (this.sdk && this.sdk.ready) {
        this.sdk.ready(() => {
          resolve();
        });
      } else {
        // Fallback timeout
        setTimeout(() => {
          resolve();
        }, 5000);
      }
    });
  }

  /**
   * Map event context to Rudderstack options format
   */
  private mapContextToOptions(context?: Record<string, any>): Record<string, any> {
    if (!context) {
      return {};
    }

    const options: Record<string, any> = {};

    // Map device context to OS field
    if (context.device) {
      const device = context.device;
      if (device.os) {
        options.os = {
          name: device.os.name,
          version: device.os.version,
        };
      }
      if (device.browser) {
        options.browser = {
          name: device.browser.name,
          version: device.browser.version,
        };
      }
    }

    // Map page context
    if (context.page) {
      options.page = { ...context.page };
    }

    // Map any additional context fields
    Object.keys(context).forEach((key) => {
      if (key !== "device" && key !== "page" && key !== "user" && key !== "session") {
        options[key] = context[key];
      }
    });

    return options;
  }
}
