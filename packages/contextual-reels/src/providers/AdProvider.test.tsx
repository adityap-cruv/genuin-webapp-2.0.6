/**
 * Tests for `AdProvider`.
 */
import { act, type ReactNode, type ReactElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { AD_LAYOUT } from "@cxr/config";
import {
  installGenaiBridge,
  shouldCountFill,
  shouldCountNoFill,
  notifyAdFill,
  notifyAdNoFill,
} from "@cxr/ads/waterfall";
import { CxrEventBus } from "@cxr/instance/coordination/CxrEventBus";
import { AdProvider, useAdWaterfall, type AdWaterfallContextValue } from "@cxr/providers/AdProvider";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const sendEventMock = vi.fn();

vi.mock("./AnalyticsProvider", () => ({
  useAnalytics: () => ({ sendEvent: sendEventMock }),
}));

// Mock useEventBus so AdProvider receives a stable pre-created bus.
let testBus: CxrEventBus;

vi.mock("../instance/coordination/EventBusContext", () => ({
  useEventBus: () => testBus,
}));

vi.mock("../ads/waterfall", () => ({
  shouldCountFill: vi.fn(() => true),
  shouldCountNoFill: vi.fn(() => true),
  notifyAdFill: vi.fn(),
  notifyAdNoFill: vi.fn(),
  installGenaiBridge: vi.fn(() => vi.fn()),
}));

// ---------------------------------------------------------------------------
// Harness
// ---------------------------------------------------------------------------

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

interface ContextHandle {
  ctx: AdWaterfallContextValue | null;
}

function Consumer({ handle }: { handle: ContextHandle }): ReactElement {
  handle.ctx = useAdWaterfall();
  return <span />;
}

// ---------------------------------------------------------------------------
// adLayout / isAudioOnlyAds tests
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("providers/AdProvider", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    testBus = new CxrEventBus();
    (shouldCountFill as ReturnType<typeof vi.fn>).mockReturnValue(true);
    (shouldCountNoFill as ReturnType<typeof vi.fn>).mockReturnValue(true);
    (installGenaiBridge as ReturnType<typeof vi.fn>).mockImplementation(() => vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders children", () => {
    const { root, container } = mount(
      <AdProvider tagId="tag1">
        <span>child</span>
      </AdProvider>
    );
    expect(container.textContent).toContain("child");
    unmount(root, container);
  });

  it("useAdWaterfall throws outside AdProvider", () => {
    function Outsider(): ReactElement {
      useAdWaterfall();
      return <span />;
    }
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);
    const errSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    expect(() =>
      act(() => {
        root.render(<Outsider />);
      })
    ).toThrow(/AdProvider/);
    errSpy.mockRestore();
    container.remove();
  });

  it("calls notifyAdFill when shouldCountFill returns true", () => {
    const handle: ContextHandle = { ctx: null };
    const { root, container } = mount(
      <AdProvider tagId="tag1">
        <Consumer handle={handle} />
      </AdProvider>
    );

    act(() => {
      handle.ctx?.onAdSuccess("video");
    });

    expect(notifyAdFill).toHaveBeenCalledTimes(1);
    unmount(root, container);
  });

  it("does not call notifyAdFill when shouldCountFill returns false", () => {
    (shouldCountFill as ReturnType<typeof vi.fn>).mockReturnValue(false);
    const handle: ContextHandle = { ctx: null };
    const { root, container } = mount(
      <AdProvider tagId="tag1">
        <Consumer handle={handle} />
      </AdProvider>
    );

    act(() => {
      handle.ctx?.onAdSuccess("video");
    });

    expect(notifyAdFill).not.toHaveBeenCalled();
    unmount(root, container);
  });

  it("calls notifyAdNoFill and emits Ad Passback when shouldCountNoFill returns true", () => {
    const handle: ContextHandle = { ctx: null };
    const { root, container } = mount(
      <AdProvider tagId="tag1" tagHeight={50} tagWidth={320}>
        <Consumer handle={handle} />
      </AdProvider>
    );

    act(() => {
      handle.ctx?.onAdFail();
    });

    expect(notifyAdNoFill).toHaveBeenCalledTimes(1);
    expect(sendEventMock).toHaveBeenCalledWith(
      "Ad Passback",
      expect.objectContaining({
        tag_height: 50,
        tag_width: 320,
      })
    );
    unmount(root, container);
  });

  it("does not call notifyAdNoFill when shouldCountNoFill returns false", () => {
    (shouldCountNoFill as ReturnType<typeof vi.fn>).mockReturnValue(false);
    const handle: ContextHandle = { ctx: null };
    const { root, container } = mount(
      <AdProvider tagId="tag1">
        <Consumer handle={handle} />
      </AdProvider>
    );

    act(() => {
      handle.ctx?.onAdFail();
    });

    expect(notifyAdNoFill).not.toHaveBeenCalled();
    unmount(root, container);
  });

  it("installs the genai bridge on mount", () => {
    const { root, container } = mount(
      <AdProvider tagId="tag1">
        <span />
      </AdProvider>
    );
    expect(installGenaiBridge).toHaveBeenCalledTimes(1);
    unmount(root, container);
  });

  it("calls bridge cleanup on unmount", () => {
    const cleanupMock = vi.fn();
    (installGenaiBridge as ReturnType<typeof vi.fn>).mockReturnValueOnce(cleanupMock);

    const { root, container } = mount(
      <AdProvider tagId="tag1">
        <span />
      </AdProvider>
    );
    unmount(root, container);

    expect(cleanupMock).toHaveBeenCalledTimes(1);
  });

  it("genai:onFill dispatched → calls notifyAdFill via bridge", () => {
    // Capture the onFill callback passed to installGenaiBridge (now the 2nd arg)
    let capturedOnFill: (() => void) | undefined;
    (installGenaiBridge as ReturnType<typeof vi.fn>).mockImplementationOnce((_: unknown, onFill: () => void) => {
      capturedOnFill = onFill;
      return vi.fn();
    });

    const { root, container } = mount(
      <AdProvider tagId="tag1">
        <span />
      </AdProvider>
    );

    act(() => {
      capturedOnFill?.();
    });

    expect(notifyAdFill).toHaveBeenCalledTimes(1);
    unmount(root, container);
  });

  it("genai:onNoFill dispatched → calls notifyAdNoFill + Ad Passback via bridge", () => {
    let capturedOnNoFill: (() => void) | undefined;
    (installGenaiBridge as ReturnType<typeof vi.fn>).mockImplementationOnce(
      (_: unknown, __: unknown, onNoFill: () => void) => {
        capturedOnNoFill = onNoFill;
        return vi.fn();
      }
    );

    const { root, container } = mount(
      <AdProvider tagId="tag1" tagHeight={250} tagWidth={300}>
        <span />
      </AdProvider>
    );

    act(() => {
      capturedOnNoFill?.();
    });

    expect(notifyAdNoFill).toHaveBeenCalledTimes(1);
    expect(sendEventMock).toHaveBeenCalledWith("Ad Passback", expect.any(Object));
    unmount(root, container);
  });

  // ── adLayout / isAudioOnlyAds ─────────────────────────────────────────────

  it("exposes adLayout defaulting to 'unknown' when prop is omitted", () => {
    const handle: ContextHandle = { ctx: null };
    const { root, container } = mount(
      <AdProvider tagId="tag1">
        <Consumer handle={handle} />
      </AdProvider>
    );
    expect(handle.ctx?.adLayout).toBe("unknown");
    expect(handle.ctx?.isAudioOnlyAds).toBe(false);
    unmount(root, container);
  });

  it("exposes the adLayout prop value in context", () => {
    const handle: ContextHandle = { ctx: null };
    const { root, container } = mount(
      <AdProvider tagId="tag1" adLayout={AD_LAYOUT.L2}>
        <Consumer handle={handle} />
      </AdProvider>
    );
    expect(handle.ctx?.adLayout).toBe(AD_LAYOUT.L2);
    expect(handle.ctx?.isAudioOnlyAds).toBe(false);
    unmount(root, container);
  });

  it("sets isAudioOnlyAds=true for mobile-320x50", () => {
    const handle: ContextHandle = { ctx: null };
    const { root, container } = mount(
      <AdProvider tagId="tag1" adLayout={AD_LAYOUT.L3}>
        <Consumer handle={handle} />
      </AdProvider>
    );
    expect(handle.ctx?.isAudioOnlyAds).toBe(true);
    unmount(root, container);
  });

  it("sets isAudioOnlyAds=true for mobile-320x100", () => {
    const handle: ContextHandle = { ctx: null };
    const { root, container } = mount(
      <AdProvider tagId="tag1" adLayout={AD_LAYOUT.L4}>
        <Consumer handle={handle} />
      </AdProvider>
    );
    expect(handle.ctx?.isAudioOnlyAds).toBe(true);
    unmount(root, container);
  });
});
