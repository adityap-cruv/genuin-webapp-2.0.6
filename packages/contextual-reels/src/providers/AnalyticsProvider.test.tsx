/**
 * Tests for the AnalyticsProvider.
 *
 * Uses raw `react-dom/client` (no `@testing-library/react`) to keep the
 * Phase-1 footprint dependency-clean.
 *
 * Goals:
 *  - render children (no UI of its own),
 *  - buffer events emitted before Rudderstack is ready,
 *  - flush the buffer in FIFO order once `ready` fires,
 *  - expose a stable `useAnalytics` hook.
 */
import { act, type ReactElement, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

import { AnalyticsProvider, useAnalytics } from "@cxr/providers/AnalyticsProvider";

const trackMock = vi.fn();
const readyMock = vi.fn();
const getIpInfoMock = vi.fn();
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
    getIpInfo: () => getIpInfoMock(),
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

interface ConsumerHandle {
  send: () => void;
}

function Consumer({ name = "evt", handle }: { name?: string; handle: ConsumerHandle }): ReactElement {
  const { sendEvent } = useAnalytics();
  handle.send = () => sendEvent(name, { foo: "bar" });
  return <span>consumer</span>;
}

describe("providers/AnalyticsProvider", () => {
  beforeEach(() => {
    trackMock.mockReset();
    readyMock.mockReset();
    getIpInfoMock.mockReset().mockResolvedValue({ city: "BLR" });
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

  it("logs but does not throw when getIpInfo rejects", async () => {
    getIpInfoMock.mockReset().mockRejectedValueOnce(new Error("boom"));
    const errSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const { root, container } = mount(
      <AnalyticsProvider>
        <span />
      </AnalyticsProvider>
    );
    // Wait one microtask tick for the promise rejection to drain.
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(errSpy).toHaveBeenCalledWith("[cxr/analytics-provider]", "error :", expect.any(Error));
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

  it("flushes buffered events in FIFO order once ready fires", () => {
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
    expect(trackMock).toHaveBeenCalledTimes(2);
    expect(trackMock.mock.calls[0]?.[0]).toBe("first");
    expect(trackMock.mock.calls[1]?.[0]).toBe("first");
    unmount(root, container);
  });

  it("emits directly after flush (post-ready events bypass the buffer)", () => {
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
    trackMock.mockClear();
    act(() => handle.send());
    expect(trackMock).toHaveBeenCalledTimes(1);
    expect(trackMock.mock.calls[0]?.[0]).toBe("post_ready");
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

  it("flushes a buffered event whose payload is undefined (defaults to {})", () => {
    let readyCb: (() => void) | undefined;
    readyMock.mockImplementation((cb: () => void) => {
      readyCb = cb;
    });
    setRudder();
    function NoPayload({ handle }: { handle: ConsumerHandle }): ReactElement {
      const { sendEvent } = useAnalytics();
      handle.send = () => sendEvent("payloadless");
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
    expect(trackMock).toHaveBeenCalledTimes(1);
    const payload = trackMock.mock.calls[0]?.[1] as Record<string, unknown>;
    expect(payload.event_details).toBeDefined();
    unmount(root, container);
  });

  it("injects tag_id from prop into every event's event_details", () => {
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
    expect(trackMock).toHaveBeenCalledTimes(1);
    const payload = trackMock.mock.calls[0]?.[1] as Record<string, unknown>;
    expect((payload.event_details as Record<string, unknown>).tag_id).toBe("tag-xyz");
    unmount(root, container);
  });

  it("injects brand_id registered via setBrandId into every event's event_details", () => {
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
      const { sendEvent, setBrandId } = useAnalytics();
      handle.send = () => sendEvent("evt", { foo: "bar" });
      handle.setBrand = setBrandId;
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
    expect(trackMock).toHaveBeenCalledTimes(1);
    const payload = trackMock.mock.calls[0]?.[1] as Record<string, unknown>;
    const details = payload.event_details as Record<string, unknown>;
    expect(details.brand_id).toBe(99);
    expect(details.tag_id).toBe("tag-xyz");
    unmount(root, container);
  });

  it("omits brand_id when setBrandId has not been called", () => {
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
    const payload = trackMock.mock.calls[0]?.[1] as Record<string, unknown>;
    expect((payload.event_details as Record<string, unknown>)).not.toHaveProperty("brand_id");
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
});
