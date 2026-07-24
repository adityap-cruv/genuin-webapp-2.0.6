/**
 * Tests for FullScreenProvider — written FIRST per TDD mandate.
 */
import { act, type ReactElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const { sendEventMock, setBaseEventContextMock, loggerInfoMock, useTagDetailsMock } = vi.hoisted(() => ({
  sendEventMock: vi.fn(),
  setBaseEventContextMock: vi.fn(),
  loggerInfoMock: vi.fn(),
  useTagDetailsMock: vi.fn<() => { tagId: string; brandId: number | undefined }>(() => ({
    tagId: "test-tag",
    brandId: undefined,
  })),
}));
vi.mock("@cxr/providers/AnalyticsProvider", () => ({
  useAnalytics: () => ({ sendEvent: sendEventMock, setBrandId: vi.fn(), setBaseEventContext: setBaseEventContextMock }),
}));
vi.mock("@cxr/utils/logger", () => ({
  createLogger: () => ({ debug: vi.fn(), info: loggerInfoMock, warn: vi.fn(), error: vi.fn() }),
}));
vi.mock("@cxr/providers/TagDetailsProvider", () => ({
  useTagDetails: () => useTagDetailsMock(),
}));

import { InstanceProvider, useEventBus } from "@cxr/instance/InstanceContext";
import type { CxrEventBus } from "@cxr/instance/coordination/CxrEventBus";
import { FullScreenProvider, useFullScreen, type FullScreenContextValue } from "@cxr/providers/FullScreenProvider";

// ---------------------------------------------------------------------------
// Harness
// ---------------------------------------------------------------------------

interface ContextHandle {
  ctx: FullScreenContextValue | null;
  bus?: CxrEventBus;
}

function Consumer({ handle }: { handle: ContextHandle }): ReactElement {
  handle.ctx = useFullScreen();
  handle.bus = useEventBus();
  return <span data-testid="consumer" />;
}

function mount(handle: ContextHandle): { root: Root; container: HTMLDivElement } {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => {
    root.render(
      <InstanceProvider instanceId="test-instance">
        <FullScreenProvider>
          <Consumer handle={handle} />
        </FullScreenProvider>
      </InstanceProvider>
    );
  });
  return { root, container };
}

function unmount(root: Root, container: HTMLDivElement): void {
  act(() => root.unmount());
  container.remove();
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("FullScreenProvider", () => {
  beforeEach(() => {
    sendEventMock.mockClear();
    setBaseEventContextMock.mockClear();
    loggerInfoMock.mockClear();
    useTagDetailsMock.mockReturnValue({ tagId: "test-tag", brandId: undefined });
    document.body.className = "";
  });

  afterEach(() => {
    document.body.className = "";
  });

  it("starts in normal state", () => {
    const handle: ContextHandle = { ctx: null };
    const { root, container } = mount(handle);

    expect(handle.ctx?.isFullScreen).toBe(false);

    unmount(root, container);
  });

  it("exposes isFullScreenSupported: true outside a webview", () => {
    const handle: ContextHandle = { ctx: null };
    const { root, container } = mount(handle);

    expect(handle.ctx?.isFullScreenSupported).toBe(true);

    unmount(root, container);
  });

  it("reports event_record_screen: embed on mount and expand when entering fullscreen", () => {
    const handle: ContextHandle = { ctx: null };
    const { root, container } = mount(handle);
    // Initial (collapsed) render publishes the embed view.
    expect(setBaseEventContextMock).toHaveBeenCalledWith({ event_record_screen: "embed" });

    setBaseEventContextMock.mockClear();
    act(() => {
      handle.ctx?.enterFullScreen();
    });
    expect(setBaseEventContextMock).toHaveBeenCalledWith({ event_record_screen: "expand" });

    unmount(root, container);
  });

  it("enterFullScreen sets isFullScreen true", () => {
    const handle: ContextHandle = { ctx: null };
    const { root, container } = mount(handle);

    act(() => {
      handle.ctx?.enterFullScreen();
    });

    expect(handle.ctx?.isFullScreen).toBe(true);

    unmount(root, container);
  });

  it("exitFullScreen sets isFullScreen false", () => {
    const handle: ContextHandle = { ctx: null };
    const { root, container } = mount(handle);

    act(() => {
      handle.ctx?.enterFullScreen();
    });
    act(() => {
      handle.ctx?.exitFullScreen();
    });

    expect(handle.ctx?.isFullScreen).toBe(false);

    unmount(root, container);
  });

  it("tracks Embed Maximized / Embed Minimized on fullscreen enter and exit", () => {
    const handle: ContextHandle = { ctx: null };
    const { root, container } = mount(handle);

    act(() => {
      handle.ctx?.enterFullScreen();
    });
    expect(sendEventMock).toHaveBeenCalledWith("Embed Maximized");

    act(() => {
      handle.ctx?.exitFullScreen();
    });
    expect(sendEventMock).toHaveBeenCalledWith("Embed Minimized");

    unmount(root, container);
  });

  it("toggleFullScreen flips state", () => {
    const handle: ContextHandle = { ctx: null };
    const { root, container } = mount(handle);

    act(() => {
      handle.ctx?.toggleFullScreen();
    });
    expect(handle.ctx?.isFullScreen).toBe(true);

    act(() => {
      handle.ctx?.toggleFullScreen();
    });
    expect(handle.ctx?.isFullScreen).toBe(false);

    unmount(root, container);
  });

  it("Escape key exits fullscreen", () => {
    const handle: ContextHandle = { ctx: null };
    const { root, container } = mount(handle);

    act(() => {
      handle.ctx?.enterFullScreen();
    });
    act(() => {
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    });

    expect(handle.ctx?.isFullScreen).toBe(false);

    unmount(root, container);
  });

  it("useFullScreen throws outside provider", () => {
    function Outsider(): ReactElement {
      useFullScreen();
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
    ).toThrow("useFullScreen must be used inside <FullScreenProvider>");

    errSpy.mockRestore();
    act(() => root.unmount());
    container.remove();
  });

  // -------------------------------------------------------------------------
  // Native Browser Fullscreen API path
  // -------------------------------------------------------------------------

  describe("native fullscreen API", () => {
    let originalExit: Document["exitFullscreen"] | undefined;
    let originalFullscreenElement: PropertyDescriptor | undefined;

    beforeEach(() => {
      originalExit = document.exitFullscreen;
      originalFullscreenElement = Object.getOwnPropertyDescriptor(Document.prototype, "fullscreenElement");
    });

    afterEach(() => {
      // Restore document.exitFullscreen.
      Object.defineProperty(document, "exitFullscreen", {
        configurable: true,
        value: originalExit,
        writable: true,
      });
      // Restore the fullscreenElement getter.
      if (originalFullscreenElement) {
        Object.defineProperty(document, "fullscreenElement", originalFullscreenElement);
      } else {
        Object.defineProperty(document, "fullscreenElement", {
          configurable: true,
          get: () => null,
        });
      }
    });

    /** Stubs `document.fullscreenElement` to a fixed value. */
    function stubFullscreenElement(value: Element | null): void {
      Object.defineProperty(document, "fullscreenElement", {
        configurable: true,
        get: () => value,
      });
    }

    it("calls the native exitFullscreen when an element is fullscreen", async () => {
      stubFullscreenElement(document.documentElement);
      const exitSpy = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(document, "exitFullscreen", {
        configurable: true,
        value: exitSpy,
        writable: true,
      });

      const handle: ContextHandle = { ctx: null };
      const { root, container } = mount(handle);

      await act(async () => {
        await handle.ctx?.exitFullScreen();
      });

      expect(exitSpy).toHaveBeenCalledTimes(1);

      unmount(root, container);
    });

    it("falls back to manual exit when native exitFullscreen rejects", async () => {
      stubFullscreenElement(document.documentElement);
      const exitSpy = vi.fn().mockRejectedValue(new Error("denied"));
      Object.defineProperty(document, "exitFullscreen", {
        configurable: true,
        value: exitSpy,
        writable: true,
      });

      const handle: ContextHandle = { ctx: null };
      const { root, container } = mount(handle);

      act(() => {
        handle.ctx?.enterFullScreen();
      });
      expect(handle.ctx?.isFullScreen).toBe(true);

      await act(async () => {
        await handle.ctx?.exitFullScreen();
      });

      expect(exitSpy).toHaveBeenCalledTimes(1);
      expect(handle.ctx?.isFullScreen).toBe(false);

      unmount(root, container);
    });

    it("uses manual exit when an element is fullscreen but no exit method exists", async () => {
      stubFullscreenElement(document.documentElement);
      Object.defineProperty(document, "exitFullscreen", {
        configurable: true,
        value: undefined,
        writable: true,
      });

      const handle: ContextHandle = { ctx: null };
      const { root, container } = mount(handle);

      act(() => {
        handle.ctx?.enterFullScreen();
      });

      await act(async () => {
        await handle.ctx?.exitFullScreen();
      });

      expect(handle.ctx?.isFullScreen).toBe(false);

      unmount(root, container);
    });

    it("enters fullscreen state when fullscreenchange fires with an active element", () => {
      const handle: ContextHandle = { ctx: null };
      const { root, container } = mount(handle);

      stubFullscreenElement(document.documentElement);
      act(() => {
        document.dispatchEvent(new Event("fullscreenchange"));
      });
      expect(handle.ctx?.isFullScreen).toBe(true);

      unmount(root, container);
    });

    it("exits fullscreen state when fullscreenchange fires with no active element", () => {
      const handle: ContextHandle = { ctx: null };
      const { root, container } = mount(handle);

      // First simulate native enter, then native exit.
      stubFullscreenElement(document.documentElement);
      act(() => {
        document.dispatchEvent(new Event("fullscreenchange"));
      });
      expect(handle.ctx?.isFullScreen).toBe(true);

      stubFullscreenElement(null);
      act(() => {
        document.dispatchEvent(new Event("fullscreenchange"));
      });
      expect(handle.ctx?.isFullScreen).toBe(false);

      unmount(root, container);
    });
  });

  // -------------------------------------------------------------------------
  // enterFullScreen:
  //  - Not in iframe: always manual (React state) fullscreen. Native
  //    requestFullscreen is never attempted.
  //  - In iframe: real Browser Fullscreen API attempted first. On
  //    unavailability/denial/rejection, falls back to manual (React state)
  //    fullscreen — every embed always gets some fullscreen experience.
  // -------------------------------------------------------------------------

  describe("enterFullScreen — not in iframe", () => {
    it("never calls native requestFullscreen and expands manually", () => {
      const originalRequest = document.documentElement.requestFullscreen;
      const requestSpy = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(document.documentElement, "requestFullscreen", {
        configurable: true,
        value: requestSpy,
        writable: true,
      });

      const handle: ContextHandle = { ctx: null };
      const { root, container } = mount(handle);

      act(() => {
        handle.ctx?.enterFullScreen();
      });

      expect(requestSpy).not.toHaveBeenCalled();
      expect(handle.ctx?.isFullScreen).toBe(true);

      Object.defineProperty(document.documentElement, "requestFullscreen", {
        configurable: true,
        value: originalRequest,
        writable: true,
      });
      unmount(root, container);
    });
  });

  describe("enterFullScreen — in iframe", () => {
    let originalRequest: Element["requestFullscreen"] | undefined;
    let originalFullscreenEnabled: PropertyDescriptor | undefined;
    let topDescriptor: PropertyDescriptor | undefined;

    beforeEach(() => {
      originalRequest = document.documentElement.requestFullscreen;
      originalFullscreenEnabled = Object.getOwnPropertyDescriptor(document, "fullscreenEnabled");
      topDescriptor = Object.getOwnPropertyDescriptor(window, "top");
      Object.defineProperty(document, "fullscreenEnabled", {
        configurable: true,
        get: () => true,
      });
      // Force inIframe() === true.
      Object.defineProperty(window, "top", {
        configurable: true,
        get: () => ({}) as Window,
      });
    });

    afterEach(() => {
      Object.defineProperty(document.documentElement, "requestFullscreen", {
        configurable: true,
        value: originalRequest,
        writable: true,
      });
      if (originalFullscreenEnabled) {
        Object.defineProperty(document, "fullscreenEnabled", originalFullscreenEnabled);
      } else {
        Object.defineProperty(document, "fullscreenEnabled", {
          configurable: true,
          get: () => undefined,
        });
      }
      if (topDescriptor) {
        Object.defineProperty(window, "top", topDescriptor);
      } else {
        Object.defineProperty(window, "top", { configurable: true, get: () => window });
      }
    });

    /** Stubs `document.documentElement.requestFullscreen`. */
    function stubRequest(impl: (() => Promise<void>) | undefined): void {
      Object.defineProperty(document.documentElement, "requestFullscreen", {
        configurable: true,
        value: impl,
        writable: true,
      });
    }

    function stubFullscreenEnabled(value: boolean): void {
      Object.defineProperty(document, "fullscreenEnabled", {
        configurable: true,
        get: () => value,
      });
    }

    it("awaits native requestFullscreen and defers state to fullscreenchange on success", async () => {
      const requestSpy = vi.fn().mockResolvedValue(undefined);
      stubRequest(requestSpy);

      const handle: ContextHandle = { ctx: null };
      const { root, container } = mount(handle);

      await act(async () => {
        await handle.ctx?.enterFullScreen();
      });

      expect(requestSpy).toHaveBeenCalledTimes(1);
      // State stays false until the browser emits fullscreenchange.
      expect(handle.ctx?.isFullScreen).toBe(false);

      unmount(root, container);
    });

    it("redirects when requestFullscreen rejects", async () => {
      const requestSpy = vi.fn().mockRejectedValue(new Error("gesture required"));
      stubRequest(requestSpy);
      stubFullscreenEnabled(true);

      const handle: ContextHandle = { ctx: null };
      const { root, container } = mount(handle);

      await act(async () => {
        await handle.ctx?.enterFullScreen();
      });

      expect(handle.ctx?.isFullScreen).toBe(false);
      expect(loggerInfoMock).toHaveBeenCalled();

      unmount(root, container);
    });

    it("redirects when no requestFullscreen method exists on the element", async () => {
      stubRequest(undefined);
      stubFullscreenEnabled(true);

      const handle: ContextHandle = { ctx: null };
      const { root, container } = mount(handle);

      await act(async () => {
        await handle.ctx?.enterFullScreen();
      });

      expect(handle.ctx?.isFullScreen).toBe(false);
      expect(loggerInfoMock).toHaveBeenCalled();

      unmount(root, container);
    });

    it("redirects when requestFullscreen rejects, regardless of the fullscreenEnabled permission flag", async () => {
      const requestSpy = vi.fn().mockRejectedValue(new Error("gesture required"));
      stubRequest(requestSpy);
      stubFullscreenEnabled(false);

      const handle: ContextHandle = { ctx: null };
      const { root, container } = mount(handle);

      await act(async () => {
        await handle.ctx?.enterFullScreen();
      });

      expect(handle.ctx?.isFullScreen).toBe(false);
      expect(loggerInfoMock).toHaveBeenCalled();

      unmount(root, container);
    });

    it("redirects when no requestFullscreen method exists and the permission is denied", async () => {
      stubRequest(undefined);
      stubFullscreenEnabled(false);

      const handle: ContextHandle = { ctx: null };
      const { root, container } = mount(handle);

      await act(async () => {
        await handle.ctx?.enterFullScreen();
      });

      expect(handle.ctx?.isFullScreen).toBe(false);
      expect(loggerInfoMock).toHaveBeenCalled();

      unmount(root, container);
    });

    it("uses the webkit-prefixed requestFullscreen when the standard one is absent", async () => {
      const webkitRequest = vi.fn().mockResolvedValue(undefined);
      stubRequest(undefined);
      // Vendor-prefixed method is not in the DOM lib types; assigning it exercises the
      // requestFS `??` fallback chain. Justified cast over `any`.
      (
        document.documentElement as unknown as { webkitRequestFullscreen?: () => Promise<void> }
      ).webkitRequestFullscreen = webkitRequest;

      const handle: ContextHandle = { ctx: null };
      const { root, container } = mount(handle);

      await act(async () => {
        await handle.ctx?.enterFullScreen();
      });

      expect(webkitRequest).toHaveBeenCalledTimes(1);

      delete (document.documentElement as unknown as { webkitRequestFullscreen?: () => Promise<void> })
        .webkitRequestFullscreen;
      unmount(root, container);
    });
  });

  describe("enterFullScreen — webview", () => {
    let originalUserAgent: string;

    beforeEach(() => {
      originalUserAgent = navigator.userAgent;
    });

    afterEach(() => {
      Object.defineProperty(navigator, "userAgent", {
        configurable: true,
        value: originalUserAgent,
      });
    });

    function stubWebviewUserAgent(): void {
      Object.defineProperty(navigator, "userAgent", {
        configurable: true,
        value:
          "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 " +
          "(KHTML, like Gecko) Mobile/15E148 [FBAN/FBIOS;FBAV/450.0.0.0;]",
      });
    }

    it("reports isFullScreenSupported: false in a webview", () => {
      stubWebviewUserAgent();

      const handle: ContextHandle = { ctx: null };
      const { root, container } = mount(handle);

      expect(handle.ctx?.isFullScreenSupported).toBe(false);

      unmount(root, container);
    });

    it("redirects immediately in a webview without attempting native or manual fullscreen", async () => {
      stubWebviewUserAgent();
      const requestSpy = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(document.documentElement, "requestFullscreen", {
        configurable: true,
        value: requestSpy,
        writable: true,
      });

      const handle: ContextHandle = { ctx: null };
      const { root, container } = mount(handle);

      await act(async () => {
        await handle.ctx?.enterFullScreen();
      });

      expect(requestSpy).not.toHaveBeenCalled();
      expect(handle.ctx?.isFullScreen).toBe(false);
      expect(loggerInfoMock).toHaveBeenCalled();

      unmount(root, container);
    });
  });

  describe("redirectToFullScreen — per-brand destination (opens in a new tab)", () => {
    let originalUserAgent: string;

    beforeEach(() => {
      originalUserAgent = navigator.userAgent;
    });

    afterEach(() => {
      Object.defineProperty(navigator, "userAgent", {
        configurable: true,
        value: originalUserAgent,
      });
      vi.restoreAllMocks();
    });

    function stubWebviewUserAgent(): void {
      Object.defineProperty(navigator, "userAgent", {
        configurable: true,
        value:
          "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 " +
          "(KHTML, like Gecko) Mobile/15E148 [FBAN/FBIOS;FBAV/450.0.0.0;]",
      });
    }

    /** jsdom doesn't implement window.open navigation; simulate an allowed popup. */
    function allowPopup() {
      return vi.spyOn(window, "open").mockReturnValue({} as Window);
    }

    /** Simulate a popup blocker: window.open returns null. */
    function blockPopup() {
      return vi.spyOn(window, "open").mockReturnValue(null);
    }

    it("opens the configured URL in a new tab for a brand with a redirect entry, in a webview", async () => {
      const windowOpenSpy = allowPopup();
      stubWebviewUserAgent();
      useTagDetailsMock.mockReturnValue({ tagId: "test-tag", brandId: 3252 });

      const handle: ContextHandle = { ctx: null };
      const { root, container } = mount(handle);

      await act(async () => {
        await handle.ctx?.enterFullScreen();
      });

      expect(windowOpenSpy).toHaveBeenCalledWith(
        "https://infolinks.begenuin.com/home?embed_id=6a4b8a153b428877f20c9bb5",
        "_blank",
        "noopener,noreferrer"
      );
      expect(handle.ctx?.redirectFailed).toBe(false);

      unmount(root, container);
    });

    it("opens the configured URL in a new tab from an in-iframe, non-webview enter attempt with no Fullscreen API", async () => {
      const windowOpenSpy = allowPopup();
      const topDescriptor = Object.getOwnPropertyDescriptor(window, "top");
      Object.defineProperty(window, "top", {
        configurable: true,
        get: () => ({}) as Window,
      });
      const originalRequest = document.documentElement.requestFullscreen;
      Object.defineProperty(document.documentElement, "requestFullscreen", {
        configurable: true,
        value: undefined,
        writable: true,
      });
      useTagDetailsMock.mockReturnValue({ tagId: "test-tag", brandId: 3252 });

      const handle: ContextHandle = { ctx: null };
      const { root, container } = mount(handle);

      await act(async () => {
        await handle.ctx?.enterFullScreen();
      });

      expect(windowOpenSpy).toHaveBeenCalledWith(
        "https://infolinks.begenuin.com/home?embed_id=6a4b8a153b428877f20c9bb5",
        "_blank",
        "noopener,noreferrer"
      );
      expect(handle.ctx?.redirectFailed).toBe(false);

      Object.defineProperty(document.documentElement, "requestFullscreen", {
        configurable: true,
        value: originalRequest,
        writable: true,
      });
      if (topDescriptor) {
        Object.defineProperty(window, "top", topDescriptor);
      } else {
        Object.defineProperty(window, "top", { configurable: true, get: () => window });
      }
      unmount(root, container);
    });

    it("does not open a tab and logs when the brand has no configured redirect", async () => {
      const windowOpenSpy = vi.spyOn(window, "open");
      stubWebviewUserAgent();
      useTagDetailsMock.mockReturnValue({ tagId: "test-tag", brandId: 9999 });

      const handle: ContextHandle = { ctx: null };
      const { root, container } = mount(handle);

      await act(async () => {
        await handle.ctx?.enterFullScreen();
      });

      expect(windowOpenSpy).not.toHaveBeenCalled();
      expect(loggerInfoMock).toHaveBeenCalled();

      unmount(root, container);
    });

    it("starts with redirectFailed: false", () => {
      useTagDetailsMock.mockReturnValue({ tagId: "test-tag", brandId: 3252 });

      const handle: ContextHandle = { ctx: null };
      const { root, container } = mount(handle);

      expect(handle.ctx?.redirectFailed).toBe(false);

      unmount(root, container);
    });

    it("sets redirectFailed: true when window.open is blocked by a popup blocker (returns null)", async () => {
      const windowOpenSpy = blockPopup();
      stubWebviewUserAgent();
      useTagDetailsMock.mockReturnValue({ tagId: "test-tag", brandId: 3252 });

      const handle: ContextHandle = { ctx: null };
      const { root, container } = mount(handle);

      await act(async () => {
        await handle.ctx?.enterFullScreen();
      });

      expect(windowOpenSpy).toHaveBeenCalled();
      expect(handle.ctx?.redirectFailed).toBe(true);

      unmount(root, container);
    });

    it("sets redirectFailed: true when window.open throws", async () => {
      vi.spyOn(window, "open").mockImplementation(() => {
        throw new Error("blocked");
      });
      stubWebviewUserAgent();
      useTagDetailsMock.mockReturnValue({ tagId: "test-tag", brandId: 3252 });

      const handle: ContextHandle = { ctx: null };
      const { root, container } = mount(handle);

      await act(async () => {
        await handle.ctx?.enterFullScreen();
      });

      expect(handle.ctx?.redirectFailed).toBe(true);

      unmount(root, container);
    });
  });

  // -------------------------------------------------------------------------
  // Vendor-prefixed exit fallback + cross-origin iframe detection.
  // -------------------------------------------------------------------------

  describe("vendor fallbacks", () => {
    let originalExit: Document["exitFullscreen"] | undefined;
    let originalFullscreenElement: PropertyDescriptor | undefined;

    beforeEach(() => {
      originalExit = document.exitFullscreen;
      originalFullscreenElement = Object.getOwnPropertyDescriptor(Document.prototype, "fullscreenElement");
    });

    afterEach(() => {
      Object.defineProperty(document, "exitFullscreen", {
        configurable: true,
        value: originalExit,
        writable: true,
      });
      if (originalFullscreenElement) {
        Object.defineProperty(document, "fullscreenElement", originalFullscreenElement);
      } else {
        Object.defineProperty(document, "fullscreenElement", {
          configurable: true,
          get: () => null,
        });
      }
    });

    it("uses the webkit-prefixed exitFullscreen when the standard one is absent", async () => {
      Object.defineProperty(document, "fullscreenElement", {
        configurable: true,
        get: () => document.documentElement,
      });
      Object.defineProperty(document, "exitFullscreen", {
        configurable: true,
        value: undefined,
        writable: true,
      });
      const webkitExit = vi.fn().mockResolvedValue(undefined);
      // Vendor-prefixed exit is not typed on Document; assigning it exercises the exitFS
      // `??` fallback chain. Justified cast over `any`.
      (document as unknown as { webkitExitFullscreen?: () => Promise<void> }).webkitExitFullscreen = webkitExit;

      const handle: ContextHandle = { ctx: null };
      const { root, container } = mount(handle);

      await act(async () => {
        await handle.ctx?.exitFullScreen();
      });

      expect(webkitExit).toHaveBeenCalledTimes(1);

      delete (document as unknown as { webkitExitFullscreen?: () => Promise<void> }).webkitExitFullscreen;
      unmount(root, container);
    });

    it("treats a cross-origin parent (window.top access throwing) as an iframe, redirecting when no requestFullscreen exists", async () => {
      // Force inIframe()'s try/catch to take the catch path: accessing window.top throws,
      // exactly like a cross-origin embed. With inIframe() === true and no native
      // requestFullscreen available, enterFullScreen redirects.
      const topDescriptor = Object.getOwnPropertyDescriptor(window, "top");
      Object.defineProperty(window, "top", {
        configurable: true,
        get: () => {
          throw new Error("cross-origin");
        },
      });

      const originalRequest = document.documentElement.requestFullscreen;
      Object.defineProperty(document.documentElement, "requestFullscreen", {
        configurable: true,
        value: undefined,
        writable: true,
      });

      const handle: ContextHandle = { ctx: null };
      const { root, container } = mount(handle);

      await act(async () => {
        await handle.ctx?.enterFullScreen();
      });

      expect(handle.ctx?.isFullScreen).toBe(false);
      expect(loggerInfoMock).toHaveBeenCalled();

      Object.defineProperty(document.documentElement, "requestFullscreen", {
        configurable: true,
        value: originalRequest,
        writable: true,
      });
      if (topDescriptor) {
        Object.defineProperty(window, "top", topDescriptor);
      } else {
        Object.defineProperty(window, "top", { configurable: true, get: () => window });
      }
      unmount(root, container);
    });
  });
});
