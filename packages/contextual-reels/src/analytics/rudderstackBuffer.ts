/**
 * Centralized RudderStack event buffer for mandatory data.
 *
 * Ensures events are only sent to RudderStack when all mandatory data
 * (visit_id, geoip) is available or explicitly marked unavailable.
 *
 * State machine:
 * - Uninitialized: No mandatory data, buffer all events
 * - Buffering: Some mandatory data arrived, waiting for rest
 * - Ready: All mandatory data available (or marked unavailable), fire immediately
 * - Flushed: Buffer flushed, now in steady state
 */

import { createLogger } from "@cxr/utils/logger";

const logger = createLogger("cxr/rudderstack-buffer");

/** Mandatory data required before events can be sent. */
export interface MandatoryEventPayload {
  visit_id?: string;
  geoip?: {
    country?: string;
    lat?: number;
    long?: number;
  };
}

/** Event queued in the buffer. */
interface BufferedEvent {
  eventName: string;
  // Payload factory: called at flush time to get latest payload (base context + mandatory data)
  getPayload: () => unknown;
  timestamp: number;
}

/** Buffer state. */
export type BufferState = "uninitialized" | "buffering" | "ready" | "flushed";

/** Callback to emit an event to RudderStack. */
export type EventEmitter = (eventName: string, payload: unknown) => void;

/**
 * RudderStack event buffer.
 *
 * Queues events until all required mandatory data is available,
 * then flushes them in FIFO order.
 */
export class RudderstackEventBuffer {
  private queue: BufferedEvent[] = [];
  private mandatoryData: MandatoryEventPayload = {};
  private unavailableKeys = new Set<string>();
  private state: BufferState = "uninitialized";
  private emitter?: EventEmitter;
  private flushed = false;
  private readonly requiredKeys: string[];
  private readonly maxQueueSize: number;

  /**
   * Create a new RudderStack event buffer.
   *
   * @param requiredKeys - Fields that must be available before flushing. Default: ['visit_id']
   * @param maxQueueSize - Maximum queue size before dropping oldest events. Default: 500
   */
  constructor(requiredKeys: string[] = ["visit_id"], maxQueueSize: number = 500) {
    this.requiredKeys = requiredKeys;
    this.maxQueueSize = maxQueueSize;
    logger.debug("RudderstackEventBuffer created", {
      requiredKeys,
      maxQueueSize,
    });
  }

  /**
   * Set a piece of mandatory data when an API returns.
   *
   * @param partial - Partial mandatory data (e.g., { visit_id: "abc123" })
   */
  setMandatoryData(partial: Partial<MandatoryEventPayload>): void {
    this.mandatoryData = { ...this.mandatoryData, ...partial };
    logger.debug("Mandatory data set", {
      mandatoryData: this.mandatoryData,
      state: this.state,
    });
    this.checkAndFlush();
  }

  /**
   * Mark a field as unavailable (API failed).
   *
   * @param key - Field name that will never arrive (e.g., "geoip")
   */
  markUnavailable(key: string): void {
    this.unavailableKeys.add(key);
    logger.warn(`Mandatory field marked unavailable: ${key}`);
    this.checkAndFlush();
  }

  /**
   * Enqueue or send an event.
   *
   * If buffer is ready/flushed, emit immediately.
   * Otherwise, add to queue.
   *
   * @param eventName - Name of the event
   * @param getPayload - Factory function that returns payload at flush time (allows late binding of base context)
   */
  enqueue(eventName: string, getPayload: () => unknown): void {
    if (this.state === "ready" || this.state === "flushed") {
      // Send immediately
      if (this.emitter) {
        this.emitter(eventName, getPayload());
      }
      return;
    }

    // Add to queue
    this.queue.push({
      eventName,
      getPayload,
      timestamp: Date.now(),
    });

    // Enforce max queue size
    if (this.queue.length > this.maxQueueSize) {
      const dropped = this.queue.shift();
      logger.warn("Event queue exceeded max size, dropped oldest", {
        dropped: dropped?.eventName,
        queueSize: this.queue.length,
      });
    }

    this.state = "buffering";
    logger.debug("Event queued", {
      eventName,
      queueSize: this.queue.length,
      state: this.state,
    });
  }

  /**
   * Flush queued events to RudderStack.
   *
   * @param emitter - Callback to emit each event
   */
  flush(emitter: EventEmitter): void {
    if (this.flushed) {
      logger.debug("Buffer already flushed, ignoring duplicate flush");
      return;
    }

    this.emitter = emitter;
    this.flushed = true;
    this.state = "flushed";

    const queueSize = this.queue.length;
    logger.debug("Flushing buffer", {
      queueSize,
      mandatoryData: this.mandatoryData,
      unavailableKeys: Array.from(this.unavailableKeys),
    });

    // Emit all queued events in order
    for (const event of this.queue) {
      emitter(event.eventName, event.getPayload());
    }

    this.queue = [];
    logger.debug("Buffer flushed", { emittedCount: queueSize });
  }

  /**
   * Set the emitter callback without flushing.
   *
   * Call this early to arm the buffer so it can auto-emit events
   * as mandatory data becomes ready.
   */
  setEmitter(emitter: EventEmitter): void {
    this.emitter = emitter;
    logger.debug("Buffer emitter armed");
    // Try to flush if data is already ready
    this.checkAndFlush();
  }

  /**
   * Check if all mandatory data is ready, and auto-flush if so.
   */
  private checkAndFlush(): void {
    if (this.flushed) return;

    // Check if all required keys are either present or marked unavailable
    const allReady = this.requiredKeys.every(
      (key) => this.mandatoryData[key as keyof MandatoryEventPayload] !== undefined ||
        this.unavailableKeys.has(key)
    );

    if (allReady && !this.flushed && this.emitter) {
      this.state = "ready";
      logger.debug("All mandatory data ready", {
        requiredKeys: this.requiredKeys,
        mandatoryData: this.mandatoryData,
      });

      // Auto-flush queued events now that data is ready
      this.flushed = true;
      const queueSize = this.queue.length;
      if (queueSize > 0) {
        logger.debug("Auto-flushing queued events", { queueSize });
        for (const event of this.queue) {
          this.emitter(event.eventName, event.getPayload());
        }
        this.queue = [];
      }
      this.state = "flushed";
    }
  }

  /**
   * Check if buffer has been flushed.
   */
  isFlushed(): boolean {
    return this.flushed;
  }

  /**
   * Get the current state.
   */
  getState(): BufferState {
    return this.state;
  }

  /**
   * Get the current queue size.
   */
  getQueueSize(): number {
    return this.queue.length;
  }

  /**
   * Get the current mandatory data.
   */
  getMandatoryData(): MandatoryEventPayload {
    return { ...this.mandatoryData };
  }

  /**
   * Clear the buffer (for testing).
   */
  clear(): void {
    this.queue = [];
    this.mandatoryData = {};
    this.unavailableKeys.clear();
    this.state = "uninitialized";
    this.flushed = false;
    logger.debug("Buffer cleared");
  }
}
