/**
 * Tests for RudderstackEventBuffer
 */
import { describe, it, expect, beforeEach, vi } from "vitest";

import { RudderstackEventBuffer } from "./rudderstackBuffer";

describe("RudderstackEventBuffer", () => {
  let buffer: RudderstackEventBuffer;

  beforeEach(() => {
    buffer = new RudderstackEventBuffer(["visit_id"], 500);
  });

  describe("State Transitions", () => {
    it("initializes in uninitialized state", () => {
      expect(buffer.getState()).toBe("uninitialized");
    });

    it("transitions to buffering when event queued", () => {
      buffer.enqueue("test-event", () => ({}));
      expect(buffer.getState()).toBe("buffering");
    });

    it("transitions to ready when all required data available", () => {
      const emitter = vi.fn();
      buffer.setEmitter(emitter);
      buffer.enqueue("test-event", () => ({}));
      expect(buffer.getState()).toBe("buffering");

      buffer.setMandatoryData({ visit_id: "abc123" });
      expect(buffer.getState()).toBe("flushed"); // Auto-flushed
    });

    it("transitions to flushed after flush called", () => {
      const emitter = vi.fn();
      buffer.flush(emitter);
      expect(buffer.getState()).toBe("flushed");
      expect(buffer.isFlushed()).toBe(true);
    });
  });

  describe("Event Queueing", () => {
    it("queues event when uninitialized", () => {
      buffer.enqueue("event-1", () => ({ test: "data" }));
      expect(buffer.getQueueSize()).toBe(1);
    });

    it("sends event immediately when ready", () => {
      const emitter = vi.fn();
      buffer.setEmitter(emitter);
      buffer.setMandatoryData({ visit_id: "abc123" });

      buffer.enqueue("event-1", () => ({ test: "data" }));
      expect(emitter).toHaveBeenCalledWith("event-1", { test: "data" });
      expect(buffer.getQueueSize()).toBe(0);
    });

    it("sends event immediately when flushed", () => {
      const emitter = vi.fn();
      buffer.setEmitter(emitter);
      buffer.flush(emitter);

      buffer.enqueue("event-1", () => ({ test: "data" }));
      expect(emitter).toHaveBeenCalledWith("event-1", { test: "data" });
    });

    it("maintains FIFO order", () => {
      const emitter = vi.fn();
      buffer.setEmitter(emitter);

      buffer.enqueue("event-1", () => ({ order: 1 }));
      buffer.enqueue("event-2", () => ({ order: 2 }));
      buffer.enqueue("event-3", () => ({ order: 3 }));

      buffer.setMandatoryData({ visit_id: "abc123" });

      expect(emitter.mock.calls).toEqual([
        ["event-1", { order: 1 }],
        ["event-2", { order: 2 }],
        ["event-3", { order: 3 }],
      ]);
    });
  });

  describe("Mandatory Data", () => {
    it("stores mandatory data", () => {
      buffer.setMandatoryData({ visit_id: "abc123" });
      expect(buffer.getMandatoryData()).toEqual({ visit_id: "abc123" });
    });

    it("merges mandatory data", () => {
      buffer.setMandatoryData({ visit_id: "abc123" });
      buffer.setMandatoryData({ geoip: { country: "US" } });
      expect(buffer.getMandatoryData()).toEqual({
        visit_id: "abc123",
        geoip: { country: "US" },
      });
    });

    it("flushes when all required keys available", () => {
      const emitter = vi.fn();
      buffer.setEmitter(emitter);
      buffer.enqueue("event-1", () => ({}));
      expect(buffer.getState()).toBe("buffering");

      buffer.setMandatoryData({ visit_id: "abc123" });
      expect(buffer.getState()).toBe("flushed");
    });

    it("does not flush if only optional data available", () => {
      const emitter = vi.fn();
      buffer.setEmitter(emitter);
      buffer.enqueue("event-1", () => ({}));
      buffer.setMandatoryData({ geoip: { country: "US" } });
      expect(buffer.getState()).toBe("buffering"); // visit_id still missing
    });
  });

  describe("Unavailable Keys", () => {
    it("marks field as unavailable", () => {
      buffer.markUnavailable("geoip");
      const data = buffer.getMandatoryData();
      // Field is not present
      expect(data.geoip).toBeUndefined();
    });

    it("flushes when required key marked unavailable", () => {
      const emitter = vi.fn();
      buffer.setEmitter(emitter);
      buffer.enqueue("event-1", () => ({}));
      expect(buffer.getState()).toBe("buffering");

      buffer.markUnavailable("visit_id");
      expect(buffer.getState()).toBe("flushed");
    });

    it("flushes when all required keys unavailable", () => {
      const emitter = vi.fn();
      buffer.setEmitter(emitter);
      buffer.enqueue("event-1", () => ({}));
      buffer.markUnavailable("visit_id");
      expect(buffer.getState()).toBe("flushed");
    });
  });

  describe("Flushing", () => {
    it("flushes all queued events", () => {
      const emitter = vi.fn();
      buffer.setEmitter(emitter);
      buffer.enqueue("event-1", () => ({ data: "a" }));
      buffer.enqueue("event-2", () => ({ data: "b" }));
      buffer.enqueue("event-3", () => ({ data: "c" }));

      buffer.setMandatoryData({ visit_id: "xyz" });

      expect(emitter).toHaveBeenCalledTimes(3);
      expect(buffer.getQueueSize()).toBe(0);
    });

    it("prevents duplicate flush", () => {
      const emitter = vi.fn();
      buffer.setEmitter(emitter);
      buffer.flush(emitter);
      buffer.flush(emitter); // Second flush should be ignored

      expect(buffer.isFlushed()).toBe(true);
    });

    it("emits events to provided emitter", () => {
      const emitter = vi.fn();
      buffer.setEmitter(emitter);
      buffer.enqueue("event-1", () => ({ test: "data" }));
      buffer.setMandatoryData({ visit_id: "abc123" });

      expect(emitter).toHaveBeenCalledWith("event-1", { test: "data" });
    });
  });

  describe("Queue Management", () => {
    it("enforces max queue size", () => {
      const smallBuffer = new RudderstackEventBuffer(["visit_id"], 3);
      const emitter = vi.fn();
      smallBuffer.setEmitter(emitter);

      smallBuffer.enqueue("event-1", () => ({}));
      smallBuffer.enqueue("event-2", () => ({}));
      smallBuffer.enqueue("event-3", () => ({}));
      expect(smallBuffer.getQueueSize()).toBe(3);

      smallBuffer.enqueue("event-4", () => ({})); // Exceeds max
      expect(smallBuffer.getQueueSize()).toBe(3); // Oldest dropped

      smallBuffer.setMandatoryData({ visit_id: "abc123" });

      // event-1 should be dropped, event-2, 3, 4 remain
      expect(emitter.mock.calls.map((c) => c[0])).toEqual(["event-2", "event-3", "event-4"]);
    });
  });

  describe("Clear", () => {
    it("resets buffer state", () => {
      const emitter = vi.fn();
      buffer.setEmitter(emitter);
      buffer.enqueue("event-1", () => ({}));
      buffer.setMandatoryData({ visit_id: "abc123" });
      expect(buffer.getQueueSize()).toBe(0); // Auto-flushed
      expect(buffer.getState()).toBe("flushed");

      buffer.clear();
      expect(buffer.getQueueSize()).toBe(0);
      expect(buffer.getState()).toBe("uninitialized");
      expect(buffer.getMandatoryData()).toEqual({});
    });
  });

  describe("Multiple Required Keys", () => {
    it("requires all specified keys", () => {
      const multiBuffer = new RudderstackEventBuffer(["visit_id", "geoip"], 500);
      const emitter = vi.fn();
      multiBuffer.setEmitter(emitter);

      multiBuffer.enqueue("event-1", () => ({}));
      expect(multiBuffer.getState()).toBe("buffering");

      // Set one key
      multiBuffer.setMandatoryData({ visit_id: "abc123" });
      expect(multiBuffer.getState()).toBe("buffering"); // Still waiting for geoip

      // Set second key
      multiBuffer.setMandatoryData({ geoip: { country: "US" } });
      expect(multiBuffer.getState()).toBe("flushed"); // Now flushed
    });

    it("allows unavailable keys to substitute", () => {
      const multiBuffer = new RudderstackEventBuffer(["visit_id", "geoip"], 500);
      const emitter = vi.fn();
      multiBuffer.setEmitter(emitter);

      multiBuffer.enqueue("event-1", () => ({}));
      multiBuffer.setMandatoryData({ visit_id: "abc123" });
      multiBuffer.markUnavailable("geoip");

      expect(multiBuffer.getState()).toBe("flushed");
    });
  });

  describe("Late Binding Payloads", () => {
    it("computes payload at flush time with updated base context", () => {
      const emitter = vi.fn();
      buffer.setEmitter(emitter);

      const baseContext: Record<string, unknown> = { initial: true };
      buffer.enqueue("event-1", () => ({ ...baseContext }));
      expect(buffer.getQueueSize()).toBe(1);

      // Update base context AFTER enqueueing
      baseContext.visit_id = "abc123";
      buffer.setMandatoryData({ visit_id: "abc123" });

      // Event should include updated base context
      expect(emitter).toHaveBeenCalledWith("event-1", {
        initial: true,
        visit_id: "abc123",
      });
    });
  });
});
