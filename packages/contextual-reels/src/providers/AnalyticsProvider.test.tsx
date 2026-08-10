/**
 * Tests for the AnalyticsProvider.
 *
 * Uses raw `react-dom/client` (no `@testing-library/react`) to keep the
 * footprint dependency-clean.
 *
 * Goals:
 *  - render children (no UI of its own),
 *  - buffer events emitted before analytics is ready,
 *  - flush the buffer in FIFO order once BOTH Rudderstack is ready AND the
 *    geoip fetch has settled — never before, so no event ships without geoip,
 *  - stamp the resolved geoip onto every flushed event,
 *  - never drop events when the geoip fetch fails,
 *  - expose a stable `useAnalytics` hook.
 *
 * `getSharedGeoIp` (not `getIpInfo`) is mocked here — `AnalyticsProvider` calls
 * the shared, never-rejecting cache (see `services/api.ts`), which is the same
 * one the legacy `index.jsx` bootstrap uses for its `Tag Init` event.
 */
import { act, useEffect, type ReactElement, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

import { AnalyticsProvider, useAnalytics } from "@cxr/providers/AnalyticsProvider";

const trackMock = vi.fn();
const readyMock = vi.fn();
const getSharedGeoIpMock = vi.fn();
const initRudderMock = vi.fn();

vi.mock("../analytics/rudderstack", () => ({
  initializeRudderAnalytics: () => initRudderMock(),
  RUDDER_SNIPPET_VERSION: "3.0.3",
}));

vi.mock("../services/api", async (importOriginal) => {
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  const original = await importOriginal<typeof import("../services/api")>();
  return {
    ...original,
    getSharedGeoIp: () => getSharedGeoIpMock(),
  };
});

function setRudder(): void {
  (window as Window & { rudderanalytics?: unknown }).rudderanalytics = {
    track: trackMock,
    ready: readyMock,
    load: vi.fn(),
  };
}

function mount(ui: ReactNode): { root: Root; container: HTMLDivElement } {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => {
    root.render(ui);
  });
  return { root, container };
}

function unmount(root: Root, container: HTMLDivElement): void {
  act(() => root.unmount());
  container.remove();
}

/**
 * Drain the microtasks of the `getIpInfo()` promise chain
 * (`.then().catch().finally()`) so `geoReady` flips true. Flushing is gated on
 * geoip settling, so a synchronous `ready()` alone no longer flushes — tests
 * must let the geoip promise settle too.
 */
async function settleGeoip(): Promise<void> {
  await act(async () => {
    for (let i = 0; i < 5; i++) await Promise.resolve();
  });
}

/** Extract `device_details.geoip` from the Nth `track` call's payload. */
function geoipOfCall(index: number): Record<string, unknown> {
  const payload = trackMock.mock.calls[index]?.[1] as Record<string, unknown>;
  const device = payload.device_details as Record<string, unknown>;
  return device.geoip as Record<string, unknown>;
}

interface ConsumerHandle {
  send: () => void;
}

function Consumer({ name = "evt", handle }: { name?: string; handle: ConsumerHandle }): ReactElement {
  const { sendEvent, setMandatoryData } = useAnalytics();
  handle.send = () => sendEvent(name, { foo: "bar" });
  // Flush is gated on visit_id (a RudderstackEventBuffer required key) in
  // addition to ready+geoip — set it unconditionally on mount so these tests'
  // ready/geoip-only assertions aren't blocked by the third, unrelated gate.
  useEffect(() => {
    setMandatoryData({ visit_id: "test-visit-id" });
  }, [setMandatoryData]);
  return <span>consumer</span>;
}

describe("providers/AnalyticsProvider", () => {
  beforeEach(() => {
    trackMock.mockReset();
    readyMock.mockReset();
    getSharedGeoIpMock.mockReset().mockResolvedValue({ city: "BLR" });
    initRudderMock.mockReset();
    delete (window as Window & { rudderanalytics?: unknown }).rudderanalytics;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders children", () => {
    const { root, container } = mount(
      <AnalyticsProvider>
        <span>hello</span>
      </AnalyticsProvider>
    );
    expect(container.textContent).toContain("hello");
    unmount(root, container);
  });

  it("initialises Rudderstack on mount", () => {
    const { root, container } = mount(
      <AnalyticsProvider>
        <span />
      </AnalyticsProvider>
    );
    expect(initRudderMock).toHaveBeenCalledTimes(1);
    unmount(root, container);
  });

  it("preview mode: sendEvent is a no-op and Rudderstack is not initialised", async () => {
    setRudder();
    // With preview on, ready() must never be registered — assert it stays uncalled.
    const handle: ConsumerHandle = { send: () => undefined };
    const { root, container } = mount(
      <AnalyticsProvider preview>
        <Consumer name="preview_event" handle={handle} />
      </AnalyticsProvider>
    );
    // Fire an event, then fully settle: nothing should ship. In preview the
    // bootstrap effect returns early, so `ready()` is never even registered.
    act(() => handle.send());
    await settleGeoip();

    expect(initRudderMock).not.toHaveBeenCalled();
    expect(readyMock).not.toHaveBeenCalled();
    expect(trackMock).not.toHaveBeenCalled();
    unmount(root, container);
  });

  it("does not throw when getSharedGeoIp resolves null (upstream fetch failed)", async () => {
    // getSharedGeoIp never rejects (see services/api.ts) — a failed geoip
    // fetch surfaces here as a resolved `null`, not a rejection.
    getSharedGeoIpMock.mockReset().mockResolvedValueOnce(null);
    const { root, container } = mount(
      <AnalyticsProvider>
        <span />
      </AnalyticsProvider>
    );
    await settleGeoip();
    unmount(root, container);
  });

  it("buffers events emitted before rudderanalytics.ready resolves", () => {
    const handle: ConsumerHandle = { send: () => undefined };
    const { root, container } = mount(
      <AnalyticsProvider>
        <Consumer name="pre_ready" handle={handle} />
      </AnalyticsProvider>
    );
    act(() => {
      handle.send();
      handle.send();
    });
    expect(trackMock).not.toHaveBeenCalled();
    unmount(root, container);
  });

  it("does NOT flush on ready alone while the geoip fetch is still pending", async () => {
    // getSharedGeoIp hangs until we resolve it, so geoip never settles on its own.
    let resolveGeo: ((v: { city: string }) => void) | undefined;
    getSharedGeoIpMock.mockReset().mockReturnValue(
      new Promise<{ city: string }>((resolve) => {
        resolveGeo = resolve;
      })
    );
    let readyCb: (() => void) | undefined;
    readyMock.mockImplementation((cb: () => void) => {
      readyCb = cb;
    });
    setRudder();
    const handle: ConsumerHandle = { send: () => undefined };
    const { root, container } = mount(
      <AnalyticsProvider>
        <Consumer name="race" handle={handle} />
      </AnalyticsProvider>
    );
    act(() => handle.send());

    // Rudderstack becomes ready FIRST — geoip still in flight.
    act(() => readyCb?.());
    await act(async () => {
      await Promise.resolve();
    });
    expect(trackMock).not.toHaveBeenCalled(); // still buffered — the whole point

    // geoip resolves LAST → this is what unblocks the flush.
    await act(async () => {
      resolveGeo?.({ city: "BLR" });
      for (let i = 0; i < 5; i++) await Promise.resolve();
    });
    expect(trackMock).toHaveBeenCalledTimes(1);
    expect(geoipOfCall(0).city_en).toBe("BLR");
    unmount(root, container);
  });

  it("flushes buffered events in FIFO order once both ready and geoip settle", async () => {
    let readyCb: (() => void) | undefined;
    readyMock.mockImplementation((cb: () => void) => {
      readyCb = cb;
    });
    setRudder();
    const handle: ConsumerHandle = { send: () => undefined };
    const { root, container } = mount(
      <AnalyticsProvider>
        <Consumer name="first" handle={handle} />
      </AnalyticsProvider>
    );
    act(() => {
      handle.send();
      handle.send();
    });
    expect(trackMock).not.toHaveBeenCalled();
    act(() => readyCb?.());
    await settleGeoip();
    expect(trackMock).toHaveBeenCalledTimes(2);
    expect(trackMock.mock.calls[0]?.[0]).toBe("first");
    expect(trackMock.mock.calls[1]?.[0]).toBe("first");
    unmount(root, container);
  });

  it("drops per-tag suppressed events but still emits the rest", async () => {
    // The 320x50 ads-only tag suppresses feed/video-churn noise (strategyConfig).
    // "Scroll" is on its drop list; "Ad Impression" (revenue funnel) is not.
    let readyCb: (() => void) | undefined;
    readyMock.mockImplementation((cb: () => void) => {
      readyCb = cb;
    });
    setRudder();

    function TwoEventConsumer(): ReactElement {
      const { sendEvent, setMandatoryData } = useAnalytics();
      useEffect(() => {
        setMandatoryData({ visit_id: "test-visit-id" });
        sendEvent("Scroll", { foo: "bar" }); // suppressed for this tag
        sendEvent("Ad Impression", { foo: "bar" }); // kept
      }, [sendEvent, setMandatoryData]);
      return <span>two</span>;
    }

    const { root, container } = mount(
      <AnalyticsProvider tagId="6a39163e92929ebec64d78ab" preview={false}>
        <TwoEventConsumer />
      </AnalyticsProvider>
    );
    act(() => readyCb?.());
    await settleGeoip();

    // Only the un-suppressed event reaches Rudderstack.
    expect(trackMock).toHaveBeenCalledTimes(1);
    expect(trackMock.mock.calls[0]?.[0]).toBe("Ad Impression");
    unmount(root, container);
  });

  it("does not suppress any event for a tag with no drop list", async () => {
    let readyCb: (() => void) | undefined;
    readyMock.mockImplementation((cb: () => void) => {
      readyCb = cb;
    });
    setRudder();
    const handle: ConsumerHandle = { send: () => undefined };
    const { root, container } = mount(
      <AnalyticsProvider tagId="unknown-no-suppress-tag" preview={false}>
        <Consumer name="Scroll" handle={handle} />
      </AnalyticsProvider>
    );
    act(() => handle.send());
    act(() => readyCb?.());
    await settleGeoip();
    // "Scroll" is only dropped for tags that list it — here it flows through.
    expect(trackMock).toHaveBeenCalledTimes(1);
    expect(trackMock.mock.calls[0]?.[0]).toBe("Scroll");
    unmount(root, container);
  });

  it("stamps the resolved geoip onto every flushed event", async () => {
    getSharedGeoIpMock.mockReset().mockResolvedValue({ city: "BLR", country_code: "IN" });
    let readyCb: (() => void) | undefined;
    readyMock.mockImplementation((cb: () => void) => {
      readyCb = cb;
    });
    setRudder();
    const handle: ConsumerHandle = { send: () => undefined };
    const { root, container } = mount(
      <AnalyticsProvider>
        <Consumer name="geo" handle={handle} />
      </AnalyticsProvider>
    );
    act(() => {
      handle.send();
      handle.send();
    });
    act(() => readyCb?.());
    await settleGeoip();
    expect(trackMock).toHaveBeenCalledTimes(2);
    expect(geoipOfCall(0).city_en).toBe("BLR");
    expect(geoipOfCall(1).city_en).toBe("BLR");
    unmount(root, container);
  });

  it("stamps geoip onto post-flush (live pass-through) events too", async () => {
    getSharedGeoIpMock.mockReset().mockResolvedValue({ city: "BLR" });
    let readyCb: (() => void) | undefined;
    readyMock.mockImplementation((cb: () => void) => {
      readyCb = cb;
    });
    setRudder();
    const handle: ConsumerHandle = { send: () => undefined };
    const { root, container } = mount(
      <AnalyticsProvider>
        <Consumer name="live" handle={handle} />
      </AnalyticsProvider>
    );
    act(() => readyCb?.());
    await settleGeoip(); // buffer flushed (empty), now in pass-through mode
    trackMock.mockClear();
    act(() => handle.send());
    expect(trackMock).toHaveBeenCalledTimes(1);
    expect(geoipOfCall(0).city_en).toBe("BLR");
    unmount(root, container);
  });

  it("still flushes buffered events (none dropped) when the geoip fetch fails", async () => {
    // getSharedGeoIp never rejects — a failed fetch resolves null (logged
    // upstream inside services/api.ts), which is what unblocks the flush here.
    getSharedGeoIpMock.mockReset().mockResolvedValueOnce(null);
    let readyCb: (() => void) | undefined;
    readyMock.mockImplementation((cb: () => void) => {
      readyCb = cb;
    });
    setRudder();
    const handle: ConsumerHandle = { send: () => undefined };
    const { root, container } = mount(
      <AnalyticsProvider>
        <Consumer name="degraded" handle={handle} />
      </AnalyticsProvider>
    );
    act(() => handle.send());
    act(() => readyCb?.());
    await settleGeoip();
    // Event is NOT lost — it ships with the normalised empty-field fallback
    // that `enrichDeviceDetailsWithGeoIp` produces for a null geoip.
    expect(trackMock).toHaveBeenCalledTimes(1);
    expect(geoipOfCall(0)).toEqual({
      city_en: "",
      country_code: "",
      country_en: "",
      ip: "",
      lat: null,
      lng: null,
    });
    unmount(root, container);
  });

  it("emits directly after flush (post-ready events bypass the buffer)", async () => {
    let readyCb: (() => void) | undefined;
    readyMock.mockImplementation((cb: () => void) => {
      readyCb = cb;
    });
    setRudder();
    const handle: ConsumerHandle = { send: () => undefined };
    const { root, container } = mount(
      <AnalyticsProvider>
        <Consumer name="post_ready" handle={handle} />
      </AnalyticsProvider>
    );
    act(() => readyCb?.());
    await settleGeoip();
    trackMock.mockClear();
    act(() => handle.send());
    expect(trackMock).toHaveBeenCalledTimes(1);
    expect(trackMock.mock.calls[0]?.[0]).toBe("post_ready");
    unmount(root, container);
  });

  it("logs but does not throw when sendEventLog fails to flush an event (malformed payload)", async () => {
    let readyCb: (() => void) | undefined;
    readyMock.mockImplementation((cb: () => void) => {
      readyCb = cb;
    });
    setRudder();
    trackMock.mockImplementationOnce(() => {
      throw new Error("track failed");
    });
    const errSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const handle: ConsumerHandle = { send: () => undefined };
    const { root, container } = mount(
      <AnalyticsProvider>
        <Consumer name="bad_event" handle={handle} />
      </AnalyticsProvider>
    );
    act(() => handle.send());
    act(() => readyCb?.());
    await expect(settleGeoip()).resolves.not.toThrow();
    expect(errSpy).toHaveBeenCalledWith(
      "[cxr/analytics-provider]",
      "failed to flush event",
      "bad_event",
      expect.any(Error)
    );
    unmount(root, container);
  });

  it("useAnalytics throws when called outside an AnalyticsProvider", () => {
    function Outsider(): ReactElement {
      useAnalytics();
      return <span>nope</span>;
    }
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);
    const errSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    expect(() =>
      act(() => {
        root.render(<Outsider />);
      })
    ).toThrow(/AnalyticsProvider/);
    errSpy.mockRestore();
    container.remove();
  });

  it("flushes a buffered event whose payload is undefined (defaults to {})", async () => {
    let readyCb: (() => void) | undefined;
    readyMock.mockImplementation((cb: () => void) => {
      readyCb = cb;
    });
    setRudder();
    function NoPayload({ handle }: { handle: ConsumerHandle }): ReactElement {
      const { sendEvent, setMandatoryData } = useAnalytics();
      handle.send = () => sendEvent("payloadless");
      useEffect(() => {
        setMandatoryData({ visit_id: "test-visit-id" });
      }, [setMandatoryData]);
      return <span>x</span>;
    }
    const handle: ConsumerHandle = { send: () => undefined };
    const { root, container } = mount(
      <AnalyticsProvider>
        <NoPayload handle={handle} />
      </AnalyticsProvider>
    );
    act(() => handle.send());
    act(() => readyCb?.());
    await settleGeoip();
    expect(trackMock).toHaveBeenCalledTimes(1);
    const payload = trackMock.mock.calls[0]?.[1] as Record<string, unknown>;
    expect(payload.event_details).toBeDefined();
    unmount(root, container);
  });

  it("injects tag_id from prop into every event's event_details", async () => {
    let readyCb: (() => void) | undefined;
    readyMock.mockImplementation((cb: () => void) => {
      readyCb = cb;
    });
    setRudder();
    trackMock.mockClear();
    const handle: ConsumerHandle = { send: () => undefined };
    const { root, container } = mount(
      <AnalyticsProvider tagId="tag-xyz">
        <Consumer name="evt" handle={handle} />
      </AnalyticsProvider>
    );
    act(() => handle.send());
    act(() => readyCb?.());
    await settleGeoip();
    expect(trackMock).toHaveBeenCalledTimes(1);
    const payload = trackMock.mock.calls[0]?.[1] as Record<string, unknown>;
    expect((payload.event_details as Record<string, unknown>).tag_id).toBe("tag-xyz");
    unmount(root, container);
  });

  it("defaults volume=0 and is_muted=true on events before any player state is reported", async () => {
    let readyCb: (() => void) | undefined;
    readyMock.mockImplementation((cb: () => void) => {
      readyCb = cb;
    });
    setRudder();
    trackMock.mockClear();
    const handle: ConsumerHandle = { send: () => undefined };
    const { root, container } = mount(
      <AnalyticsProvider>
        <Consumer name="evt" handle={handle} />
      </AnalyticsProvider>
    );
    act(() => handle.send());
    act(() => readyCb?.());
    await settleGeoip();
    const details = (trackMock.mock.calls[0]?.[1] as Record<string, unknown>).event_details as Record<string, unknown>;
    expect(details).toMatchObject({ volume: 0, is_muted: true, event_record_screen: "embed" });
    unmount(root, container);
  });

  it("stamps the latest reported ambient context (volume, is_muted, event_record_screen) onto every event", async () => {
    let readyCb: (() => void) | undefined;
    readyMock.mockImplementation((cb: () => void) => {
      readyCb = cb;
    });
    setRudder();
    trackMock.mockClear();
    let setAmbient: ((partial: Record<string, unknown>) => void) | undefined;
    const handle: ConsumerHandle = { send: () => undefined };
    function ReportConsumer(): ReactElement {
      const { sendEvent, setBaseEventContext, setMandatoryData } = useAnalytics();
      setAmbient = setBaseEventContext;
      handle.send = () => sendEvent("evt", { foo: "bar" });
      useEffect(() => {
        setMandatoryData({ visit_id: "test-visit-id" });
      }, [setMandatoryData]);
      return <span>report-consumer</span>;
    }
    const { root, container } = mount(
      <AnalyticsProvider>
        <ReportConsumer />
      </AnalyticsProvider>
    );
    // Two independent contributors merge (PlayerProvider-style + FullScreenProvider-style).
    act(() => setAmbient?.({ volume: 0.4, is_muted: false }));
    act(() => setAmbient?.({ event_record_screen: "expand" }));
    act(() => handle.send());
    act(() => readyCb?.());
    await settleGeoip();
    const details = (trackMock.mock.calls[0]?.[1] as Record<string, unknown>).event_details as Record<string, unknown>;
    expect(details).toMatchObject({ volume: 0.4, is_muted: false, event_record_screen: "expand" });
    unmount(root, container);
  });

  it("setLiveEventContext snapshots at enqueue time — a later update doesn't retroactively change an earlier buffered event", async () => {
    let readyCb: (() => void) | undefined;
    readyMock.mockImplementation((cb: () => void) => {
      readyCb = cb;
    });
    setRudder();
    trackMock.mockClear();
    const handle: ConsumerHandle = { send: () => undefined };
    let setLive: ((partial: Record<string, unknown>) => void) | undefined;
    function LiveConsumer(): ReactElement {
      const { sendEvent, setLiveEventContext, setMandatoryData } = useAnalytics();
      setLive = setLiveEventContext;
      handle.send = () => sendEvent("evt", {});
      useEffect(() => {
        setMandatoryData({ visit_id: "test-visit-id" });
      }, [setMandatoryData]);
      return <span />;
    }
    const { root, container } = mount(
      <AnalyticsProvider>
        <LiveConsumer />
      </AnalyticsProvider>
    );
    // Both events enqueue BEFORE Rudderstack is ready — both sit in the buffer
    // together, so a flush-time read would let the second update leak onto the
    // first event. It must not.
    act(() => setLive?.({ unit_visible: true }));
    act(() => handle.send()); // event #1 — snapshot unit_visible: true
    act(() => setLive?.({ unit_visible: false }));
    act(() => handle.send()); // event #2 — snapshot unit_visible: false
    act(() => readyCb?.());
    await settleGeoip();

    const firstDetails = (trackMock.mock.calls[0]?.[1] as Record<string, unknown>).event_details as Record<
      string,
      unknown
    >;
    const secondDetails = (trackMock.mock.calls[1]?.[1] as Record<string, unknown>).event_details as Record<
      string,
      unknown
    >;
    expect(firstDetails.unit_visible).toBe(true);
    expect(secondDetails.unit_visible).toBe(false);
    unmount(root, container);
  });

  it("contrasts with setBaseEventContext, which is read at flush time and IS retroactive (by design — passback backfill)", async () => {
    let readyCb: (() => void) | undefined;
    readyMock.mockImplementation((cb: () => void) => {
      readyCb = cb;
    });
    setRudder();
    trackMock.mockClear();
    const handle: ConsumerHandle = { send: () => undefined };
    let setBase: ((partial: Record<string, unknown>) => void) | undefined;
    function BaseConsumer(): ReactElement {
      const { sendEvent, setBaseEventContext, setMandatoryData } = useAnalytics();
      setBase = setBaseEventContext;
      handle.send = () => sendEvent("evt", {});
      useEffect(() => {
        setMandatoryData({ visit_id: "test-visit-id" });
      }, [setMandatoryData]);
      return <span />;
    }
    const { root, container } = mount(
      <AnalyticsProvider>
        <BaseConsumer />
      </AnalyticsProvider>
    );
    act(() => setBase?.({ passback: 0 }));
    act(() => handle.send()); // event #1 — enqueued while passback is still 0
    act(() => setBase?.({ passback: 1 })); // ad fails AFTER event #1 was already buffered
    act(() => handle.send()); // event #2
    act(() => readyCb?.());
    await settleGeoip();

    const firstDetails = (trackMock.mock.calls[0]?.[1] as Record<string, unknown>).event_details as Record<
      string,
      unknown
    >;
    const secondDetails = (trackMock.mock.calls[1]?.[1] as Record<string, unknown>).event_details as Record<
      string,
      unknown
    >;
    // Both flush after passback flipped to 1 — setBaseEventContext is read
    // inside the deferred factory, so event #1 retroactively picks it up too.
    // This is the documented, load-bearing behavior setAdPassback relies on.
    expect(firstDetails.passback).toBe(1);
    expect(secondDetails.passback).toBe(1);
    unmount(root, container);
  });

  it("injects brand_id registered via setBrandId into every event's event_details", async () => {
    let readyCb: (() => void) | undefined;
    readyMock.mockImplementation((cb: () => void) => {
      readyCb = cb;
    });
    setRudder();
    trackMock.mockClear();
    const handle: { send: () => void; setBrand: (id: number | undefined) => void } = {
      send: () => undefined,
      setBrand: () => undefined,
    };
    function BrandConsumer(): ReactElement {
      const { sendEvent, setBrandId, setMandatoryData } = useAnalytics();
      handle.send = () => sendEvent("evt", { foo: "bar" });
      handle.setBrand = setBrandId;
      useEffect(() => {
        setMandatoryData({ visit_id: "test-visit-id" });
      }, [setMandatoryData]);
      return <span />;
    }
    const { root, container } = mount(
      <AnalyticsProvider tagId="tag-xyz">
        <BrandConsumer />
      </AnalyticsProvider>
    );
    // Register brand_id before emitting — mirrors TagLoader's load sequence.
    act(() => handle.setBrand(99));
    act(() => handle.send());
    act(() => readyCb?.());
    await settleGeoip();
    expect(trackMock).toHaveBeenCalledTimes(1);
    const payload = trackMock.mock.calls[0]?.[1] as Record<string, unknown>;
    const details = payload.event_details as Record<string, unknown>;
    expect(details.brand_id).toBe(99);
    expect(details.tag_id).toBe("tag-xyz");
    unmount(root, container);
  });

  it("omits brand_id when setBrandId has not been called", async () => {
    let readyCb: (() => void) | undefined;
    readyMock.mockImplementation((cb: () => void) => {
      readyCb = cb;
    });
    setRudder();
    trackMock.mockClear();
    const handle: ConsumerHandle = { send: () => undefined };
    const { root, container } = mount(
      <AnalyticsProvider tagId="tag-xyz">
        <Consumer name="evt" handle={handle} />
      </AnalyticsProvider>
    );
    act(() => handle.send());
    act(() => readyCb?.());
    await settleGeoip();
    const payload = trackMock.mock.calls[0]?.[1] as Record<string, unknown>;
    expect(payload.event_details as Record<string, unknown>).not.toHaveProperty("brand_id");
    unmount(root, container);
  });

  it("exposes a stable sendEvent reference across renders", () => {
    const seen: Array<unknown> = [];
    function StableConsumer(): ReactElement {
      const { sendEvent } = useAnalytics();
      seen.push(sendEvent);
      return <span>stable</span>;
    }
    const { root, container } = mount(
      <AnalyticsProvider>
        <StableConsumer />
      </AnalyticsProvider>
    );
    act(() => {
      root.render(
        <AnalyticsProvider>
          <StableConsumer />
        </AnalyticsProvider>
      );
    });
    expect(seen[0]).toBe(seen[1]);
    unmount(root, container);
  });

  it("fetches geoip for a servedStatically tag too (parity with normal tags)", async () => {
    setRudder();

    const { root, container } = mount(
      <AnalyticsProvider tagId="6a39163e92929ebec64d78ab" preview={false}>
        <span>child</span>
      </AnalyticsProvider>
    );
    await settleGeoip();

    // Static tags still need geoip on analytics + a real IP for the ad-URL rewrite.
    expect(getSharedGeoIpMock).toHaveBeenCalled();
    unmount(root, container);
  });
});
