/**
 * Tests for `src/analytics/analytics.ts` — merged from:
 * deepMergeOverwrite.test, eventNames.test, eventBuffer.test, sendEventLog.test.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

import {
  EVENT,
  type EventName,
  buildHostMacroBlocks,
  buildHostParamsDiagnostic,
  createEventBuffer,
  sendEventLog,
  sendEventLogFromGlobals,
} from "@cxr/analytics/analytics";
import type { DeviceDetails } from "@cxr/platform/device";

// ─── EVENT vocabulary ─────────────────────────────────────────────────────────

describe("EVENT names", () => {
  it("matches the locked event vocabulary", () => {
    expect(EVENT).toMatchInlineSnapshot(`
      {
        "AD_CLICKED": "Ad Clicked",
        "AD_COMPLETE": "Ad Complete",
        "AD_COMPLETED": "Ad Completed",
        "AD_ERROR": "Ad Error",
        "AD_IMPRESSION": "Ad Impression",
        "AD_IMPRESSION_PIXEL_FIRED": "Ad Impression Pixel Fired",
        "AD_MEDIA_QUARTILE": "Ad Media Quartile",
        "AD_PASSBACK": "Ad Passback",
        "AD_PAUSED": "Ad Paused",
        "AD_REMOVED": "Ad Removed",
        "AD_RENDERED": "Ad Rendered",
        "AD_RENDER_FAILED": "Ad Render Failed",
        "AD_REQUEST": "Ad Request",
        "AD_REQUESTED": "Ad Requested",
        "AD_REQUEST_FAILED": "Ad Request Failed",
        "AD_RESPONSE": "Ad Response",
        "AD_RESPONSE_RECEIVED": "Ad Response Received",
        "AD_SKIPPED": "Ad Skipped",
        "AD_START": "Ad Start",
        "AD_STARTED": "Ad Started",
        "BATCH_COMPLETED": "Batch Completed",
        "BATCH_STARTED": "Batch Started",
        "CTA_CLICK": "cta_click",
        "EMBED_CTA_CLICKED": "Embed CTA Clicked",
        "EMBED_MAXIMIZED": "Embed Maximized",
        "EMBED_MINIMIZED": "Embed Minimized",
        "FEED_API_CALL_COMPLETED": "Feed API Call Completed",
        "FEED_COMPLETED": "Feed Completed",
        "INFOLINKS_IMPRESSION": "Infolinks Impression",
        "SCROLL": "Scroll",
        "SHARE": "share",
        "SPARK": "spark",
        "SWIPE_NEXT": "Swipe Next",
        "SWIPE_PREVIOUS": "Swipe Previous",
        "TAG_CAPTURED": "Tag Captured",
        "TAG_DISPLAYED": "Tag Displayed",
        "TAG_INIT": "Tag Init",
        "VIDEO_COMPLETED": "Video Complete",
        "VIDEO_FIRST_QUARTILE": "Video First Quartile",
        "VIDEO_LOADED": "Video Loaded",
        "VIDEO_MIDPOINT": "Midpoint",
        "VIDEO_MUTED": "Muted",
        "VIDEO_PAUSED": "Video Paused",
        "VIDEO_PLAY": "Video Play",
        "VIDEO_PLAY_INTERRUPTED": "Video Play Interrupted",
        "VIDEO_PLAY_STARTED": "Video Play Started",
        "VIDEO_SHARED": "Video Shared",
        "VIDEO_STARTED": "Video Started",
        "VIDEO_THIRD_QUARTILE": "Video Third Quartile",
        "VIDEO_UNMUTED": "Unmuted",
        "VIDEO_WATCH": "Video Watch",
      }
    `);
  });

  it("exposes a union type derived from EVENT values", () => {
    const name: EventName = EVENT.BATCH_STARTED;
    expect(name).toBe("Batch Started");
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

  it("reports a non-zero size while events are queued and unflushed", () => {
    const buf = createEventBuffer();
    expect(buf.size()).toBe(0);
    buf.enqueue("a", {});
    expect(buf.size()).toBe(1);
    buf.enqueue("b", {});
    expect(buf.size()).toBe(2);
    expect(buf.isFlushed()).toBe(false);
  });

  it("reflects isFlushed() as false before flush and true after", () => {
    const buf = createEventBuffer();
    expect(buf.isFlushed()).toBe(false);
    buf.flush(vi.fn());
    expect(buf.isFlushed()).toBe(true);
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

  it("returns early without throwing when rudderanalytics is missing, regardless of other args", () => {
    const errSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    expect(() =>
      sendEventLog(
        { eventName: "Video Started", tagDetails: { tag_id: "t-9" }, videoDetails: { video: { id: "v-9" } } },
        {
          rudderanalytics: undefined,
          deviceDetails: DEVICE,
          userId: USER_ID,
          windowLink: undefined,
          offsite: { event_details: { foo: "bar" } },
        }
      )
    ).not.toThrow();
    expect(errSpy).toHaveBeenCalledTimes(1);
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
        eventName: "Video Started",
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

  it("keeps the base block and still dispatches when an offsite merge throws", () => {
    const rudder = makeRudder();
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined);

    // A throwing getter on the offsite overlay makes deepMergeOverwrite blow up when it
    // reads the property — exercising safeMerge's catch, which must keep the base block
    // and let dispatch proceed rather than propagating the failure.
    const hostile: Record<string, unknown> = {};
    Object.defineProperty(hostile, "boom", {
      enumerable: true,
      get() {
        throw new Error("hostile offsite getter");
      },
    });

    expect(() =>
      sendEventLog(
        { eventName: "tag_init", tagDetails: { tag_id: "t-1" } },
        {
          rudderanalytics: rudder,
          deviceDetails: DEVICE,
          userId: USER_ID,
          windowLink: "https://host.example",
          offsite: { event_details: hostile },
        }
      )
    ).not.toThrow();

    expect(warnSpy).toHaveBeenCalledWith(
      "[cxr/analytics]",
      "offsite merge failed; using base block",
      expect.any(Error)
    );

    // Dispatch still happened, with the base event_details block intact (the hostile
    // overlay contributed nothing).
    expect(rudder.track).toHaveBeenCalledTimes(1);
    const payload = rudder.track.mock.calls[0]?.[1] as Record<string, unknown>;
    const eventDetails = payload.event_details as Record<string, unknown>;
    expect(eventDetails.tag_id).toBe("t-1");
    expect(eventDetails.page).toBe("https://host.example");
    expect(eventDetails.boom).toBeUndefined();
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
      { eventName: "Video Started", videoDetails: { video: { id: "v", slug: "s" } } },
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

  it("omits tag_id from event_details when tagDetails.tag_id is undefined", () => {
    const rudder = makeRudder();
    sendEventLog(
      { eventName: "tag_init", tagDetails: {} },
      {
        rudderanalytics: rudder,
        deviceDetails: DEVICE,
        userId: USER_ID,
        windowLink: "https://host.example",
        offsite: {},
      }
    );
    const payload = rudder.track.mock.calls[0]?.[1] as Record<string, unknown>;
    expect("tag_id" in (payload.event_details as Record<string, unknown>)).toBe(false);
  });

  it("omits video_share_string when videoDetails.video.slug is falsy", () => {
    const rudder = makeRudder();
    sendEventLog(
      { eventName: "Video Started", videoDetails: { video: { id: "v-1" } } },
      {
        rudderanalytics: rudder,
        deviceDetails: DEVICE,
        userId: USER_ID,
        windowLink: "https://host.example",
        offsite: {},
      }
    );
    const payload = rudder.track.mock.calls[0]?.[1] as Record<string, unknown>;
    expect("video_share_string" in (payload.event_details as Record<string, unknown>)).toBe(false);
    expect((payload.event_details as Record<string, unknown>).video_id).toBe("v-1");
  });

  it("omits video_id when videoDetails.video.id is falsy", () => {
    const rudder = makeRudder();
    sendEventLog(
      { eventName: "Video Started", videoDetails: { video: { slug: "some-clip" } } },
      {
        rudderanalytics: rudder,
        deviceDetails: DEVICE,
        userId: USER_ID,
        windowLink: "https://host.example",
        offsite: {},
      }
    );
    const payload = rudder.track.mock.calls[0]?.[1] as Record<string, unknown>;
    expect("video_id" in (payload.event_details as Record<string, unknown>)).toBe(false);
    expect((payload.event_details as Record<string, unknown>).video_share_string).toBe("some-clip");
  });

  it("omits both video fields when videoDetails.video is entirely absent", () => {
    const rudder = makeRudder();
    sendEventLog(
      { eventName: "Video Started" },
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
    expect("video_id" in eventDetails).toBe(false);
    expect("video_share_string" in eventDetails).toBe(false);
    expect(eventDetails.loop_share_string).toBe("");
  });

  it("falls back to the default module-level hostMacros singleton when deps.hostMacros is omitted", () => {
    const rudder = makeRudder();
    // No `hostMacros` key at all — exercises the `deps.hostMacros ?? defaultHostMacros` branch.
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
    // In jsdom there's no __CXR_SCRIPT_PARAMS__, so the singleton is {} and page falls back to windowLink.
    const payload = rudder.track.mock.calls[0]?.[1] as Record<string, unknown>;
    expect((payload.event_details as Record<string, unknown>).page).toBe("https://host.example");
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
    afterEach(() => {
      delete (window as Window & { rudderanalytics?: unknown }).rudderanalytics;
      delete (window as Window & { offsitePropertiesConfig?: unknown }).offsitePropertiesConfig;
    });

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

    it("logs an error and does not throw when window.rudderanalytics is absent", () => {
      const errSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
      delete (window as Window & { rudderanalytics?: unknown }).rudderanalytics;
      delete (window as Window & { offsitePropertiesConfig?: unknown }).offsitePropertiesConfig;
      expect(() =>
        sendEventLogFromGlobals(
          { eventName: "tag_init" },
          { deviceDetails: DEVICE, userId: USER_ID, windowLink: "https://host.example" }
        )
      ).not.toThrow();
      expect(errSpy).toHaveBeenCalledWith("[cxr/analytics]", "RudderAnalytics is not initialized.");
    });

    it("passes deviceDetails, userId and windowLink straight through to sendEventLog", () => {
      const rudder = makeRudder();
      (window as Window & { rudderanalytics?: unknown }).rudderanalytics = rudder;
      sendEventLogFromGlobals(
        { eventName: "Video Started", tagDetails: { tag_id: "abc" } },
        { deviceDetails: DEVICE, userId: "custom-user", windowLink: "https://custom.example" }
      );
      const payload = rudder.track.mock.calls[0]?.[1] as Record<string, unknown>;
      expect((payload.user_details as Record<string, unknown>).user_id).toBe("custom-user");
      expect((payload.event_details as Record<string, unknown>).page).toBe("https://custom.example");
      expect((payload.event_details as Record<string, unknown>).tag_id).toBe("abc");
      expect(payload.device_details).toEqual(DEVICE);
    });
  });
});

// ─── buildHostMacroBlocks ─────────────────────────────────────────────────────

describe("buildHostMacroBlocks", () => {
  it("splits macros into device / user / consent blocks by meaning", () => {
    const macros = {
      appn: "My App",
      appv: "1.1",
      appb: "com.x.y",
      ifa: "abc",
      deviceid: "dev-1",
      appsi: "999",
      country: "USA",
      loc: "New York",
      loclat: "40.7",
      loclong: "-73.9",
      gdpr: "0",
      gdpr_consent: "",
      us_privacy: "1---",
      dnt: "0",
    };
    const blocks = buildHostMacroBlocks(macros);
    expect(blocks.device).toEqual({
      app_name: "My App",
      app_version: "1.1",
      app_bundle: "com.x.y",
      app_country: "USA",
      app_loc: "New York",
      app_lat: "40.7",
      app_long: "-73.9",
    });
    expect(blocks.user).toEqual({ ifa: "abc", deviceid: "dev-1", app_store_id: "999" });
    expect(blocks.event).toEqual({ gdpr: "0", us_privacy: "1---", dnt: "0" });
  });

  it("omits keys whose macro is absent", () => {
    const blocks = buildHostMacroBlocks({ ifa: "abc" });
    expect(blocks.device).toEqual({});
    expect(blocks.user).toEqual({ ifa: "abc" });
    expect(blocks.event).toEqual({});
  });

  it("omits keys whose macro resolved to an empty string", () => {
    const blocks = buildHostMacroBlocks({ appn: "", ifa: "", gdpr: "" });
    expect(blocks.device).toEqual({});
    expect(blocks.user).toEqual({});
    expect(blocks.event).toEqual({});
  });
});

// ─── buildHostParamsDiagnostic ────────────────────────────────────────────────

describe("buildHostParamsDiagnostic", () => {
  const win = window as unknown as { __CXR_SCRIPT_PARAMS__?: string };

  afterEach(() => {
    delete win.__CXR_SCRIPT_PARAMS__;
  });

  it("returns empty fields when the raw bag is absent", () => {
    delete win.__CXR_SCRIPT_PARAMS__;
    expect(buildHostParamsDiagnostic()).toEqual({
      host_script_params_raw: "",
      host_params_keys: "",
      host_params_unresolved: "",
    });
  });

  it("captures the raw bag verbatim and lists every param key", () => {
    win.__CXR_SCRIPT_PARAMS__ = "appb=com.foo.bar&appv=1.2.3&ifa=abc-123";
    const diag = buildHostParamsDiagnostic();
    expect(diag.host_script_params_raw).toBe("appb=com.foo.bar&appv=1.2.3&ifa=abc-123");
    expect(diag.host_params_keys).toBe("appb,appv,ifa");
    expect(diag.host_params_unresolved).toBe("");
  });

  it("flags tilde and curly placeholders the host never resolved", () => {
    win.__CXR_SCRIPT_PARAMS__ = "appb=~appb~&appv=1.2.3&loc={loc}&appn=~appn~";
    const diag = buildHostParamsDiagnostic();
    // Raw is preserved so consumers see exactly what the host sent.
    expect(diag.host_script_params_raw).toBe("appb=~appb~&appv=1.2.3&loc={loc}&appn=~appn~");
    expect(diag.host_params_keys).toBe("appb,appv,loc,appn");
    // Only the unresolved placeholders are flagged; the real value (appv) is not.
    expect(diag.host_params_unresolved).toBe("appb,loc,appn");
  });

  it("does not flag values that merely contain tilde/brace characters mid-string", () => {
    win.__CXR_SCRIPT_PARAMS__ = "foo=abc~def&bar={notfullybraced&baz=trailing}";
    const diag = buildHostParamsDiagnostic();
    expect(diag.host_params_keys).toBe("foo,bar,baz");
    // None of these match the full-string ^{...}$ / ^~...~$ patterns.
    expect(diag.host_params_unresolved).toBe("");
  });

  it("trims whitespace before testing for an unresolved placeholder", () => {
    win.__CXR_SCRIPT_PARAMS__ = `foo=${encodeURIComponent("  ~appb~  ")}`;
    const diag = buildHostParamsDiagnostic();
    expect(diag.host_params_unresolved).toBe("foo");
  });

  it("returns empty fields when the raw bag is an empty string", () => {
    win.__CXR_SCRIPT_PARAMS__ = "";
    expect(buildHostParamsDiagnostic()).toEqual({
      host_script_params_raw: "",
      host_params_keys: "",
      host_params_unresolved: "",
    });
  });
});

describe("sendEventLog — host macros", () => {
  it("stamps host macro blocks onto the tracked payload", () => {
    const tracked: Array<{ name: string; payload: Record<string, unknown> }> = [];
    const rudder = { track: (name: string, payload: Record<string, unknown>) => tracked.push({ name, payload }) };

    sendEventLog(
      { eventName: "Ad Requested" },
      {
        rudderanalytics: rudder,
        deviceDetails: { device_type: "mobile", os_type: "ios", geoip: {}, user_agent: "ua" },
        userId: "u1",
        windowLink: "https://p.com",
        offsite: {},
        hostMacros: { appn: "My App", ifa: "abc", us_privacy: "1---" },
      }
    );

    const payload = tracked[0]?.payload ?? {};
    expect((payload.device_details as Record<string, unknown>).app_name).toBe("My App");
    expect((payload.user_details as Record<string, unknown>).ifa).toBe("abc");
    expect((payload.event_details as Record<string, unknown>).us_privacy).toBe("1---");
    expect((payload.device_details as Record<string, unknown>).geoip).toEqual({});
  });

  it("lets caller eventDetails and the device snapshot win over colliding host macros", () => {
    const tracked: Array<{ name: string; payload: Record<string, unknown> }> = [];
    const rudder = { track: (name: string, payload: Record<string, unknown>) => tracked.push({ name, payload }) };

    sendEventLog(
      { eventName: "Ad Requested", eventDetails: { gdpr: "caller-wins" } },
      {
        rudderanalytics: rudder,
        deviceDetails: { device_type: "mobile", os_type: "ios", geoip: {}, user_agent: "ua" },
        userId: "real-user",
        windowLink: "https://p.com",
        offsite: {},
        hostMacros: { gdpr: "host-loses", ifa: "abc" },
      }
    );

    const payload = tracked[0]?.payload ?? {};
    // caller-supplied event field wins over host macro of the same name
    expect((payload.event_details as Record<string, unknown>).gdpr).toBe("caller-wins");
    // real user_id wins; host user macro still added additively
    expect((payload.user_details as Record<string, unknown>).user_id).toBe("real-user");
    expect((payload.user_details as Record<string, unknown>).ifa).toBe("abc");
  });
});

describe("sendEventLog — page prefers appb", () => {
  const makeRudder = (sink: Array<{ name: string; payload: Record<string, unknown> }>) => ({
    track: (name: string, payload: Record<string, unknown>) => sink.push({ name, payload }),
  });

  it("uses appb as the page value when present, overriding windowLink", () => {
    const tracked: Array<{ name: string; payload: Record<string, unknown> }> = [];
    sendEventLog(
      { eventName: "Ad Requested" },
      {
        rudderanalytics: makeRudder(tracked),
        deviceDetails: { device_type: "mobile", os_type: "ios", geoip: {}, user_agent: "ua" },
        userId: "u1",
        windowLink: "https://real-page.com",
        offsite: {},
        hostMacros: { appb: "com.x.y" },
      }
    );
    expect((tracked[0]?.payload.event_details as Record<string, unknown>).page).toBe("com.x.y");
  });

  it("falls back to windowLink as page when appb absent", () => {
    const tracked: Array<{ name: string; payload: Record<string, unknown> }> = [];
    sendEventLog(
      { eventName: "Ad Requested" },
      {
        rudderanalytics: makeRudder(tracked),
        deviceDetails: { device_type: "mobile", os_type: "ios", geoip: {}, user_agent: "ua" },
        userId: "u1",
        windowLink: "https://real-page.com",
        offsite: {},
        hostMacros: {},
      }
    );
    expect((tracked[0]?.payload.event_details as Record<string, unknown>).page).toBe("https://real-page.com");
  });
});
