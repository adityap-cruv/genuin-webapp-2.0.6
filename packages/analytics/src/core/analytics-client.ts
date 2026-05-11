/**
 * Analytics Client
 * Main orchestrator for the analytics system
 */

import { EventQueue } from "./event-queue";
import { PayloadMerger } from "./payload-merger";
import { EventValidator } from "./event-validator";
import { MiddlewareChain } from "./middleware";

import type { AnalyticsConfig } from "../types/config";
import type { AnalyticsProvider, ProviderStatus, UserTraits, PageProperties, GroupTraits } from "../types/provider";
import type { AnalyticsEvent, EventPayload, EventPriority } from "../types/events";
import type { Middleware } from "../types/middleware";
import type { DefaultPayload } from "../types/payload";

/**
 * Analytics metrics
 */
export interface AnalyticsMetrics {
  totalEvents: number;
  successfulEvents: number;
  failedEvents: number;
  queuedEvents: number;
  providers: {
    id: string;
    name: string;
    status: ProviderStatus;
    eventsSent: number;
    eventsFailed: number;
  }[];
}

/**
 * Default analytics configuration
 */
const DEFAULT_CONFIG: Partial<AnalyticsConfig> = {
  debug: false,
  autoInitialize: true,
};

/**
 * AnalyticsClient is the main entry point for tracking analytics events
 */
export class AnalyticsClient {
  private providers: Map<string, AnalyticsProvider>;
  private queue: EventQueue;
  private payloadMerger: PayloadMerger;
  private validator: EventValidator;
  private middlewareChain: MiddlewareChain;
  private config: AnalyticsConfig;
  private isInitialized: boolean = false;
  private initPromise: Promise<void> | null = null;
  private metrics: {
    totalEvents: number;
    successfulEvents: number;
    failedEvents: number;
    providerMetrics: Map<string, { sent: number; failed: number }>;
  };

  constructor(config: AnalyticsConfig) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.providers = new Map();
    this.queue = new EventQueue(this.config.queue);
    this.payloadMerger = new PayloadMerger(this.config.defaultPayload, this.config.merge, this.config.sanitization);
    this.validator = new EventValidator(this.config.validation);
    this.middlewareChain = new MiddlewareChain({
      debug: this.config.debug,
    });

    this.metrics = {
      totalEvents: 0,
      successfulEvents: 0,
      failedEvents: 0,
      providerMetrics: new Map(),
    };

    // Register providers
    this.config.providers.forEach((provider) => {
      this.registerProvider(provider);
    });

    // Auto-initialize if configured
    if (this.config.autoInitialize) {
      this.initialize().catch((error) => {
        console.error("[AnalyticsClient] Auto-initialization failed:", error);
      });
    }
  }

  /**
   * Initialize all providers
   */
  async initialize(): Promise<void> {
    if (this.initPromise) {
      return this.initPromise;
    }

    if (this.isInitialized) {
      return Promise.resolve();
    }

    this.initPromise = this._initialize();
    return this.initPromise;
  }

  private async _initialize(): Promise<void> {
    if (this.config.debug) {
      console.log("[AnalyticsClient] Initializing providers...");
    }

    // Initialize all providers in parallel
    const initPromises = Array.from(this.providers.values()).map(async (provider) => {
      try {
        if (this.config.debug) {
          console.log(`[AnalyticsClient] Initializing provider: ${provider.name}`);
        }
        await provider.initialize({});
        if (this.config.debug) {
          console.log(`[AnalyticsClient] Provider initialized: ${provider.name}`);
        }
      } catch (error) {
        console.error(`[AnalyticsClient] Failed to initialize provider ${provider.name}:`, error);
      }
    });

    await Promise.allSettled(initPromises);

    this.isInitialized = true;

    if (this.config.debug) {
      console.log("[AnalyticsClient] Initialization complete. Processing queue...");
    }

    // Process queued events
    await this.processQueue();
  }

  /**
   * Track an analytics event
   */
  async track(eventName: string, payload?: EventPayload, options?: { priority?: EventPriority }): Promise<void> {
    this.metrics.totalEvents++;

    try {
      // Validate event
      const validationResult = this.validator.validate(eventName, payload || {});
      if (!validationResult.valid && this.config.validation?.throwOnError) {
        this.metrics.failedEvents++;
        return;
      }

      // Merge with default payload
      const mergedPayload = this.payloadMerger.mergeAndSanitize(payload || {}, eventName);

      // Create event object
      const event: AnalyticsEvent = {
        name: eventName,
        payload: mergedPayload,
        timestamp: Date.now(),
        priority: options?.priority,
      };

      // If not initialized, queue the event
      if (!this.isInitialized) {
        if (this.config.debug) {
          console.log(`[AnalyticsClient] Queueing event: ${eventName}`);
        }
        this.queue.enqueue(event);
        return;
      }

      // Run through middleware
      await this.middlewareChain.execute(event);

      // Send to all providers
      await this.sendToProviders(event);

      this.metrics.successfulEvents++;
    } catch (error) {
      this.metrics.failedEvents++;
      console.error(`[AnalyticsClient] Failed to track event "${eventName}":`, error);

      if (this.config.debug) {
        throw error;
      }
    }
  }

  /**
   * Identify a user
   */
  async identify(userId: string, traits?: UserTraits): Promise<void> {
    if (!this.isInitialized) {
      console.warn("[AnalyticsClient] Cannot identify: not initialized");
      return;
    }

    const identifyPromises = Array.from(this.providers.values()).map((provider) =>
      provider.identify(userId, traits).catch((error) => {
        console.error(`[AnalyticsClient] Provider ${provider.name} identify failed:`, error);
      })
    );

    await Promise.allSettled(identifyPromises);
  }

  /**
   * Track a page view
   */
  async page(pageName: string, properties?: PageProperties): Promise<void> {
    if (!this.isInitialized) {
      console.warn("[AnalyticsClient] Cannot track page: not initialized");
      return;
    }

    const pagePromises = Array.from(this.providers.values()).map((provider) =>
      provider.page(pageName, properties).catch((error) => {
        console.error(`[AnalyticsClient] Provider ${provider.name} page failed:`, error);
      })
    );

    await Promise.allSettled(pagePromises);
  }

  /**
   * Associate a user with a group
   */
  async group(groupId: string, traits?: GroupTraits): Promise<void> {
    if (!this.isInitialized) {
      console.warn("[AnalyticsClient] Cannot group: not initialized");
      return;
    }

    const groupPromises = Array.from(this.providers.values()).map((provider) => {
      if (provider.group) {
        return provider.group(groupId, traits).catch((error) => {
          console.error(`[AnalyticsClient] Provider ${provider.name} group failed:`, error);
        });
      }
      return Promise.resolve();
    });

    await Promise.allSettled(groupPromises);
  }

  /**
   * Register a new provider
   */
  registerProvider(provider: AnalyticsProvider): void {
    this.providers.set(provider.id, provider);
    this.metrics.providerMetrics.set(provider.id, { sent: 0, failed: 0 });

    if (this.config.debug) {
      console.log(`[AnalyticsClient] Registered provider: ${provider.name}`);
    }

    // If already initialized, initialize this provider
    if (this.isInitialized) {
      provider.initialize({}).catch((error) => {
        console.error(`[AnalyticsClient] Failed to initialize provider ${provider.name}:`, error);
      });
    }
  }

  /**
   * Unregister a provider
   */
  unregisterProvider(providerId: string): void {
    const provider = this.providers.get(providerId);
    if (provider) {
      provider.destroy();
      this.providers.delete(providerId);
      this.metrics.providerMetrics.delete(providerId);

      if (this.config.debug) {
        console.log(`[AnalyticsClient] Unregistered provider: ${provider.name}`);
      }
    }
  }

  /**
   * Get a provider by ID
   */
  getProvider(providerId: string): AnalyticsProvider | null {
    return this.providers.get(providerId) || null;
  }

  /**
   * Get provider status
   */
  getProviderStatus(providerId: string): ProviderStatus | null {
    const provider = this.providers.get(providerId);
    return provider ? provider.getStatus() : null;
  }

  /**
   * Set default payload
   */
  setDefaultPayload(payload: DefaultPayload): void {
    this.payloadMerger.setDefaultPayload(payload);
  }

  /**
   * Update default payload with partial data
   */
  updateDefaultPayload(partial: Partial<DefaultPayload>): void {
    this.payloadMerger.updateDefaultPayload(partial);
  }

  /**
   * Get current default payload
   */
  getDefaultPayload(): DefaultPayload {
    return this.payloadMerger.getDefaultPayload();
  }

  /**
   * Add middleware to the chain
   */
  use(middleware: Middleware): void {
    this.middlewareChain.use(middleware);
  }

  /**
   * Remove middleware from the chain
   */
  removeMiddleware(middleware: Middleware): void {
    this.middlewareChain.remove(middleware);
  }

  /**
   * Check if client is ready
   */
  isReady(): boolean {
    return this.isInitialized;
  }

  /**
   * Get current queue size
   */
  getQueueSize(): number {
    return this.queue.size();
  }

  /**
   * Get analytics metrics
   */
  getMetrics(): AnalyticsMetrics {
    return {
      totalEvents: this.metrics.totalEvents,
      successfulEvents: this.metrics.successfulEvents,
      failedEvents: this.metrics.failedEvents,
      queuedEvents: this.queue.size(),
      providers: Array.from(this.providers.values()).map((provider) => {
        const metrics = this.metrics.providerMetrics.get(provider.id) || { sent: 0, failed: 0 };
        return {
          id: provider.id,
          name: provider.name,
          status: provider.getStatus(),
          eventsSent: metrics.sent,
          eventsFailed: metrics.failed,
        };
      }),
    };
  }

  /**
   * Clean up and destroy the client
   */
  destroy(): void {
    // Destroy all providers
    this.providers.forEach((provider) => provider.destroy());
    this.providers.clear();

    // Destroy queue
    this.queue.destroy();

    // Clear middleware
    this.middlewareChain.clear();

    this.isInitialized = false;
    this.initPromise = null;

    if (this.config.debug) {
      console.log("[AnalyticsClient] Destroyed");
    }
  }

  /**
   * Send event to all providers
   */
  private async sendToProviders(event: AnalyticsEvent): Promise<void> {
    const sendPromises = Array.from(this.providers.values()).map(async (provider) => {
      if (!provider.isInitialized()) {
        return;
      }

      const metrics = this.metrics.providerMetrics.get(provider.id)!;

      try {
        await provider.track(event.name, event.payload, event.context);
        metrics.sent++;

        if (this.config.debug) {
          console.log(`[AnalyticsClient] Event sent to ${provider.name}:`, event.name);
        }
      } catch (error) {
        metrics.failed++;
        console.error(`[AnalyticsClient] Failed to send event to ${provider.name}:`, error);
      }
    });

    await Promise.allSettled(sendPromises);
  }

  /**
   * Process queued events
   */
  private async processQueue(): Promise<void> {
    const flushedCount = await this.queue.flush(async (queuedEvent) => {
      // Run through middleware
      await this.middlewareChain.execute(queuedEvent);

      // Send to providers
      await this.sendToProviders(queuedEvent);
    });

    if (this.config.debug && flushedCount > 0) {
      console.log(`[AnalyticsClient] Processed ${flushedCount} queued events`);
    }
  }
}
