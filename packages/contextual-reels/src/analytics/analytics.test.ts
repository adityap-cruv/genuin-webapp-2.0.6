/**
 * Tests for `src/analytics/analytics.ts` — merged from:
 * deepMergeOverwrite.test, eventNames.test, eventBuffer.test, sendEventLog.test.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

import {
  EVENT,
  type EventName,
  createEventBuffer,
  sendEventLog,
  sendEventLogFromGlobals,
} from "@cxr/analytics/analytics";
import type { DeviceDetails } from "@cxr/platform/device";
import { deepMergeOverwrite } from "@cxr/utils/deepMerge";

// ─── deepMergeOverwrite ───────────────────────────────────────────────────────

describe("deepMergeOverwrite", () => {
  it("returns a shallow clone of base when override is undefined", () => {
    const base = { a: 1, b: 2 };
    const result = deepMergeOverwrite(base, undefined);
    expect(result).toEqual({ a: 1, b: 2 });
    expect(result).not.toBe(base);
  });

  it("returns a shallow clone of base when override is null", () => {
    const base = { a: 1 };
    const result = deepMergeOverwrite(base, null);
    expect(result).toEqual({ a: 1 });
    expect(result).not.toBe(base);
  });

  it("returns a shallow clone of base when override is not an object", () => {
    const base = { a: 1 };
    expect(deepMergeOverwrite(base, "foo" as unknown as object)).toEqual({ a: 1 });
    expect(deepMergeOverwrite(base, 42 as unknown as object)).toEqual({ a: 1 });
  });

  it("clones an array base via slice when override is not an object", () => {
    const base = [1, 2, 3];
    const result = deepMergeOverwrite(base, undefined);
    expect(result).toEqual([1, 2, 3]);
    expect(result).not.toBe(base);
  });

  it("handles null/undefined base by returning empty object clone", () => {
    expect(deepMergeOverwrite(null, undefined)).toEqual({});
    expect(deepMergeOverwrite(undefined, undefined)).toEqual({});
  });

  it("skips undefined values in override", () => {
    const base = { a: 1, b: 2 };
    const result = deepMergeOverwrite(base, { a: undefined, b: 5 });
    expect(result).toEqual({ a: 1, b: 5 });
  });

  it("skips null values in override", () => {
    const base = { a: 1, b: 2 };
    const result = deepMergeOverwrite(base, { a: null, b: 5 });
    expect(result).toEqual({ a: 1, b: 5 });
  });

  it("overwrites primitive values from override", () => {
    const base = { a: 1, b: "x" };
    const result = deepMergeOverwrite(base, { a: 2, b: "y" });
    expect(result).toEqual({ a: 2, b: "y" });
  });

  it("adds new keys from override", () => {
    const base = { a: 1 };
    const result = deepMergeOverwrite(base, { b: 2 });
    expect(result).toEqual({ a: 1, b: 2 });
  });

  it("accepts both snake_case and camelCase keys", () => {
    const base = { event_name: "foo" };
    const result = deepMergeOverwrite(base, { eventName: "bar", other_key: 1 });
    expect(result).toEqual({ event_name: "foo", eventName: "bar", other_key: 1 });
  });

  it("recursively merges plain objects", () => {
    const base = { a: { x: 1, y: 2 }, b: 3 };
    const result = deepMergeOverwrite(base, { a: { y: 9, z: 4 } });
    expect(result).toEqual({ a: { x: 1, y: 9, z: 4 }, b: 3 });
  });

  it("replaces (does NOT merge) array values at leaf level", () => {
    const base = { tags: [1, 2, 3] };
    const result = deepMergeOverwrite(base, { tags: [9, 8] });
    expect(result).toEqual({ tags: [9, 8] });
  });

  it("treats Date instances as override-as-is (not plain object)", () => {
    const d = new Date("2024-01-01");
    const result = deepMergeOverwrite({ when: "old" }, { when: d });
    expect(result.when).toBe(d);
  });

  it("treats Map instances as override-as-is (not plain object)", () => {
    const m = new Map([["k", "v"]]);
    const result = deepMergeOverwrite({ data: { nested: true } }, { data: m });
    expect(result.data).toBe(m);
  });

  it("treats class instances as override-as-is", () => {
    class Foo {
      a = 1;
    }
    const inst = new Foo();
    const result = deepMergeOverwrite({ x: { b: 2 } }, { x: inst });
    expect(result.x).toBe(inst);
  });

  it("merges 3 levels deep", () => {
    const base = { a: { b: { c: { d: 1, e: 2 } } } };
    const result = deepMergeOverwrite(base, { a: { b: { c: { e: 9, f: 3 } } } });
    expect(result).toEqual({ a: { b: { c: { d: 1, e: 9, f: 3 } } } });
  });

  it("does not mutate the base object", () => {
    const base = { a: { x: 1 } };
    const result = deepMergeOverwrite(base, { a: { y: 2 } });
    expect(base).toEqual({ a: { x: 1 } });
    expect(result).toEqual({ a: { x: 1, y: 2 } });
  });

  it("does not mutate base when mutating result at top level", () => {
    const base = { a: 1 };
    const result = deepMergeOverwrite(base, { b: 2 }) as Record<string, number>;
    result.c = 99;
    expect(base).toEqual({ a: 1 });
  });

  it("replaces array when base value is also an array (not plain object)", () => {
    const base = { items: [1, 2] };
    const result = deepMergeOverwrite(base, { items: { 0: "a" } });
    expect(result.items).toEqual({ 0: "a" });
  });

  it("writes override keys when base is null", () => {
    const result = deepMergeOverwrite(null, { a: 1, b: 2 });
    expect(result).toEqual({ a: 1, b: 2 });
  });
});

// ─── EVENT vocabulary ─────────────────────────────────────────────────────────

describe("EVENT names", () => {
  it("matches the locked event vocabulary", () => {
    expect(EVENT).toMatchInlineSnapshot(`
      {
        "AD_COMPLETE": "ad_complete",
        "AD_ERROR": "ad_error",
        "AD_IMPRESSION_SNAKE": "ad_impression",
        "AD_IMPRESSION_TITLE": "Ad Impression",
        "AD_PASSBACK": "Ad Passback",
        "AD_REQUEST": "ad_request",
        "AD_REQUESTED_TITLE": "Ad Requested",
        "AD_REQUEST_FAILED": "Ad Request Failed",
        "AD_RESPONSE": "ad_response",
        "AD_RESPONSE_RECEIVED": "Ad Response Received",
        "BATCH_COMPLETED": "batch_completed",
        "BATCH_STARTED": "batch_started",
        "CTA_CLICK": "cta_click",
        "FEED_API_CALL_COMPLETED": "feed_api_call_completed",
        "FEED_COMPLETED": "feed_completed",
        "SCROLL": "scroll",
        "SHARE": "share",
        "SPARK": "spark",
        "TAG_CAPTURED": "tag_captured",
        "TAG_DISPLAYED": "tag_displayed",
        "TAG_INIT": "tag_init",
        "VIDEO_COMPLETED": "video_completed",
        "VIDEO_FIRST_QUARTILE": "video_first_quartile",
        "VIDEO_LOADED": "video_loaded",
        "VIDEO_MIDPOINT": "video_midpoint",
        "VIDEO_PLAY_INTERRUPTED": "video_play_interrupted",
        "VIDEO_PLAY_STARTED": "video_play_started",
        "VIDEO_STARTED": "video_started",
        "VIDEO_THIRD_QUARTILE": "video_third_quartile",
        "VIDEO_WATCH": "video_watch",
      }
    `);
  });

  it("exposes a union type derived from EVENT values", () => {
    const name: EventName = EVENT.BATCH_STARTED;
    expect(name).toBe("batch_started");
  });
});

// ─── createEventBuffer ────────────────────────────────────────────────────────

describe("createEventBuffer", () => {
  it("starts un-flushed with size 0", () => {
    const buf = createEventBuffer();
    expect(buf.isFlushed()).toBe(false);
    expect(buf.size()).toBe(0);
  });

  it("queues events before flush without emitting", () => {
    const buf = createEventBuffer();
    const emit = vi.fn();
    buf.enqueue("a", { x: 1 });
    buf.enqueue("b", { x: 2 });
    expect(emit).not.toHaveBeenCalled();
    expect(buf.size()).toBe(2);
    buf.flush(emit);
    expect(emit).toHaveBeenCalledTimes(2);
  });

  it("emits queued events in FIFO order on flush", () => {
    const buf = createEventBuffer();
    const emit = vi.fn();
    buf.enqueue("first", { i: 1 });
    buf.enqueue("second", { i: 2 });
    buf.enqueue("third", { i: 3 });
    buf.flush(emit);
    expect(emit.mock.calls).toEqual([
      ["first", { i: 1 }],
      ["second", { i: 2 }],
      ["third", { i: 3 }],
    ]);
  });

  it("marks the buffer as flushed and clears queue", () => {
    const buf = createEventBuffer();
    buf.enqueue("a", {});
    buf.flush(vi.fn());
    expect(buf.isFlushed()).toBe(true);
    expect(buf.size()).toBe(0);
  });

  it("emits new enqueues directly after flush (no buffering)", () => {
    const buf = createEventBuffer();
    const emit = vi.fn();
    buf.flush(emit);
    buf.enqueue("after", { v: 1 });
    expect(emit).toHaveBeenCalledTimes(1);
    expect(emit).toHaveBeenCalledWith("after", { v: 1 });
    expect(buf.size()).toBe(0);
  });

  it("treats double flush as a no-op", () => {
    const buf = createEventBuffer();
    const emit = vi.fn();
    buf.enqueue("a", {});
    buf.flush(emit);
    buf.flush(emit);
    expect(emit).toHaveBeenCalledTimes(1);
  });

  it("handles missing payload (undefined) cleanly", () => {
    const buf = createEventBuffer();
    const emit = vi.fn();
    buf.enqueue("x");
    buf.flush(emit);
    expect(emit).toHaveBeenCalledWith("x", undefined);
  });
});

// ─── sendEventLog ─────────────────────────────────────────────────────────────

const DEVICE: DeviceDetails = {
  device_type: "desktop",
  os_type: "macos",
  geoip: { city_en: "BLR", country_code: "IN" },
  user_agent: "jest",
};

const USER_ID = "uid-test";

function makeRudder() {
  return { track: vi.fn(), load: vi.fn(), ready: vi.fn() };
}

describe("analytics/sendEventLog", () => {
  beforeEach(() => {
    delete (window as Window & { offsitePropertiesConfig?: unknown }).offsitePropertiesConfig;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("console.errors and does NOT call track when rudderanalytics is missing", () => {
    const errSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    sendEventLog(
      { eventName: "tag_init" },
      {
        rudderanalytics: undefined,
        deviceDetails: DEVICE,
        userId: USER_ID,
        windowLink: "https://host.example",
        offsite: {},
      }
    );
    expect(errSpy).toHaveBeenCalledWith("[cxr/analytics]", "RudderAnalytics is not initialized.");
  });

  it("emits the canonical payload shape on track()", () => {
    const rudder = makeRudder();
    sendEventLog(
      { eventName: "tag_init", tagDetails: { tag_id: "t-1" } },
      {
        rudderanalytics: rudder,
        deviceDetails: DEVICE,
        userId: USER_ID,
        windowLink: "https://host.example",
        offsite: {},
      }
    );
    expect(rudder.track).toHaveBeenCalledTimes(1);
    expect(rudder.track).toHaveBeenCalledWith("tag_init", {
      event_name: "tag_init",
      event_details: {
        page: "https://host.example",
        tag_id: "t-1",
        video_share_string: undefined,
        loop_share_string: "",
        video_id: undefined,
      },
      device_details: DEVICE,
      user_details: { user_id: USER_ID },
    });
  });

  it("extracts video fields from videoDetails when present", () => {
    const rudder = makeRudder();
    sendEventLog(
      {
        eventName: "video_started",
        tagDetails: { tag_id: "t-1" },
        videoDetails: {
          video: { id: "v-1", slug: "cool-clip" },
          loop: { share_string: "shr-1" },
        },
      },
      {
        rudderanalytics: rudder,
        deviceDetails: DEVICE,
        userId: USER_ID,
        windowLink: "https://host.example",
        offsite: {},
      }
    );
    const payload = rudder.track.mock.calls[0]?.[1] as Record<string, unknown>;
    const eventDetails = payload.event_details as Record<string, unknown>;
    expect(eventDetails.video_share_string).toBe("cool-clip");
    expect(eventDetails.loop_share_string).toBe("shr-1");
    expect(eventDetails.video_id).toBe("v-1");
  });

  it("applies snake_case offsite overrides", () => {
    const rudder = makeRudder();
    sendEventLog(
      { eventName: "tag_init" },
      {
        rudderanalytics: rudder,
        deviceDetails: DEVICE,
        userId: USER_ID,
        windowLink: "https://host.example",
        offsite: {
          event_details: { custom: "value", tag_id: "overridden" },
          user_details: { tier: "premium" },
        },
      }
    );
    const payload = rudder.track.mock.calls[0]?.[1] as Record<string, unknown>;
    expect((payload.event_details as Record<string, unknown>).custom).toBe("value");
    expect((payload.event_details as Record<string, unknown>).tag_id).toBe("overridden");
    expect((payload.user_details as Record<string, unknown>).tier).toBe("premium");
  });

  it("applies camelCase offsite overrides", () => {
    const rudder = makeRudder();
    sendEventLog(
      { eventName: "tag_init" },
      {
        rudderanalytics: rudder,
        deviceDetails: DEVICE,
        userId: USER_ID,
        windowLink: "https://host.example",
        offsite: {
          eventDetails: { camel: "yes" },
          deviceDetails: { os_type: "overridden" },
          userDetails: { plan: "pro" },
        },
      }
    );
    const payload = rudder.track.mock.calls[0]?.[1] as Record<string, unknown>;
    expect((payload.event_details as Record<string, unknown>).camel).toBe("yes");
    expect((payload.device_details as Record<string, unknown>).os_type).toBe("overridden");
    expect((payload.user_details as Record<string, unknown>).plan).toBe("pro");
  });

  it("does NOT allow offsite config to override the incoming event name", () => {
    const rudder = makeRudder();
    sendEventLog(
      { eventName: "tag_init" },
      {
        rudderanalytics: rudder,
        deviceDetails: DEVICE,
        userId: USER_ID,
        windowLink: "https://host.example",
        offsite: { event_details: { event_name: "malicious_override" } },
      }
    );
    expect(rudder.track.mock.calls[0]?.[0]).toBe("tag_init");
    const payload = rudder.track.mock.calls[0]?.[1] as Record<string, unknown>;
    expect(payload.event_name).toBe("tag_init");
  });

  it('defaults loop_share_string to "" when videoDetails.loop is missing', () => {
    const rudder = makeRudder();
    sendEventLog(
      { eventName: "video_started", videoDetails: { video: { id: "v", slug: "s" } } },
      {
        rudderanalytics: rudder,
        deviceDetails: DEVICE,
        userId: USER_ID,
        windowLink: "https://host.example",
        offsite: {},
      }
    );
    const payload = rudder.track.mock.calls[0]?.[1] as Record<string, unknown>;
    expect((payload.event_details as Record<string, unknown>).loop_share_string).toBe("");
  });

  it("calls track exactly once per invocation", () => {
    const rudder = makeRudder();
    sendEventLog(
      { eventName: "tag_init" },
      {
        rudderanalytics: rudder,
        deviceDetails: DEVICE,
        userId: USER_ID,
        windowLink: "https://host.example",
        offsite: {},
      }
    );
    expect(rudder.track).toHaveBeenCalledTimes(1);
  });

  describe("sendEventLogFromGlobals", () => {
    it("defaults offsite to {} when window.offsitePropertiesConfig is absent", () => {
      const rudder = makeRudder();
      (window as Window & { rudderanalytics?: unknown; offsitePropertiesConfig?: unknown }).rudderanalytics = rudder;
      sendEventLogFromGlobals(
        { eventName: "tag_init" },
        { deviceDetails: DEVICE, userId: USER_ID, windowLink: "https://host.example" }
      );
      expect(rudder.track).toHaveBeenCalledTimes(1);
      delete (window as Window & { rudderanalytics?: unknown }).rudderanalytics;
    });

    it("reads rudderanalytics + offsite from window", () => {
      const rudder = makeRudder();
      (window as Window & { rudderanalytics?: unknown; offsitePropertiesConfig?: unknown }).rudderanalytics = rudder;
      (window as Window & { offsitePropertiesConfig?: unknown }).offsitePropertiesConfig = {
        event_details: { foo: "bar" },
      };
      sendEventLogFromGlobals(
        { eventName: "tag_init" },
        { deviceDetails: DEVICE, userId: USER_ID, windowLink: "https://host.example" }
      );
      expect(rudder.track).toHaveBeenCalledTimes(1);
      const payload = rudder.track.mock.calls[0]?.[1] as Record<string, unknown>;
      expect((payload.event_details as Record<string, unknown>).foo).toBe("bar");
      delete (window as Window & { rudderanalytics?: unknown }).rudderanalytics;
    });
  });
});
