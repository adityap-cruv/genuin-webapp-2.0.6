/**
 * Base Provider
 * Abstract base class for all analytics providers
 */

import { EventQueue } from "../core/event-queue";
import { ProviderStatus } from "../types/provider";
import type {
  AnalyticsProvider,
  ProviderConfig,
  ProviderError,
  UserTraits,
  PageProperties,
  GroupTraits,
} from "../types/provider";
import type { AnalyticsEvent } from "../types/events";

/**
 * BaseProvider provides common functionality for all providers
 */
export abstract class BaseProvider implements AnalyticsProvider {
  abstract readonly id: string;
  abstract readonly name: string;

  protected status: ProviderStatus = ProviderStatus.UNINITIALIZED;
  protected initPromise: Promise<void> | null = null;
  protected config: ProviderConfig;
  protected queue: EventQueue;
  protected metrics = {
    eventsSent: 0,
    eventsFailed: 0,
    identifyCalls: 0,
    pageCalls: 0,
  };

  public onError?: (error: ProviderError) => void;

  constructor(config: ProviderConfig = {}) {
    this.config = config;
    this.queue = new EventQueue({
      maxSize: 50,
      maxAge: 300000,
      strategy: "fifo",
    });
  }

  /**
   * Initialize the provider (must be implemented by subclasses)
   */
  abstract initialize(config: ProviderConfig): Promise<void>;

  /**
   * Track an event (must be implemented by subclasses)
   */
  abstract track(eventName: string, payload: Record<string, any>, context?: Record<string, any>): Promise<void>;

  /**
   * Identify a user (must be implemented by subclasses)
   */
  abstract identify(userId: string, traits?: UserTraits): Promise<void>;

  /**
   * Track a page view (must be implemented by subclasses)
   */
  abstract page(pageName: string, properties?: PageProperties): Promise<void>;

  /**
   * Associate a user with a group (optional)
   */
  async group(_groupId: string, _traits?: GroupTraits): Promise<void> {
    // Default implementation does nothing
    // Providers can override if they support groups
  }

  /**
   * Destroy the provider (optional override)
   */
  destroy(): void {
    this.status = ProviderStatus.DESTROYED;
    this.queue.clear();
  }

  /**
   * Check if provider is initialized
   */
  isInitialized(): boolean {
    return this.status === ProviderStatus.READY;
  }

  /**
   * Get current provider status
   */
  getStatus(): ProviderStatus {
    return this.status;
  }

  /**
   * Get provider metrics
   */
  getMetrics() {
    return {
      ...this.metrics,
      queueSize: this.queue.size(),
    };
  }

  /**
   * Handle errors
   */
  protected handleError(error: Error, context?: string): void {
    const providerError: ProviderError = {
      providerId: this.id,
      providerName: this.name,
      error,
      timestamp: Date.now(),
      context,
    };

    console.error(`[${this.name}] Error:`, error);

    if (this.onError) {
      try {
        this.onError(providerError);
      } catch (callbackError) {
        console.error(`[${this.name}] Error in onError callback:`, callbackError);
      }
    }
  }

  /**
   * Queue an event for later processing
   */
  protected queueEvent(event: AnalyticsEvent): void {
    this.queue.enqueue(event);
  }

  /**
   * Process queued events
   */
  protected async processQueue(): Promise<void> {
    if (!this.isInitialized()) {
      return;
    }

    await this.queue.flush(async (queuedEvent) => {
      await this.track(queuedEvent.name, queuedEvent.payload, queuedEvent.context);
    });
  }

  /**
   * Update provider status
   */
  protected setStatus(status: ProviderStatus): void {
    this.status = status;
  }

  /**
   * Helper to wait for a condition with timeout
   */
  protected async waitFor(condition: () => boolean, timeout: number = 10000): Promise<void> {
    const startTime = Date.now();

    return new Promise((resolve, reject) => {
      const check = () => {
        if (condition()) {
          resolve();
        } else if (Date.now() - startTime > timeout) {
          reject(new Error(`Timeout waiting for condition after ${timeout}ms`));
        } else {
          setTimeout(check, 100);
        }
      };

      check();
    });
  }

  /**
   * Helper to retry an operation
   */
  protected async retry<T>(operation: () => Promise<T>, maxRetries: number = 3, delay: number = 1000): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        if (attempt < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, delay * (attempt + 1)));
        }
      }
    }

    throw lastError;
  }
}
