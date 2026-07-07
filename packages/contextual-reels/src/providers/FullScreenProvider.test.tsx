/**
 * Tests for FullScreenProvider — written FIRST per TDD mandate.
 */
import { act, type ReactElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { EventBusProvider, useEventBus } from "@cxr/instance/coordination/EventBusContext";
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

function mount(handle: ContextHandle, brandId?: number): { root: Root; container: HTMLDivElement } {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => {
    root.render(
      <EventBusProvider>
        <FullScreenProvider brandId={brandId}>
          <Consumer handle={handle} />
        </FullScreenProvider>
      </EventBusProvider>
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
  // Native enter path (only attempted inside an iframe on non-iOS).
  //
  // `inIframe()` is forced true by making window.top differ from window.self,
  // and `requestFullscreen` on documentElement is stubbed per scenario.
  // -------------------------------------------------------------------------

  describe("native enterFullScreen path (iframe, non-iOS)", () => {
    let originalRequest: Element["requestFullscreen"] | undefined;

    beforeEach(() => {
      // Force inIframe() === true.
      Object.defineProperty(window, "top", {
        configurable: true,
        get: () => ({}) as Window,
      });
      originalRequest = document.documentElement.requestFullscreen;
    });

    afterEach(() => {
      Object.defineProperty(window, "top", {
        configurable: true,
        get: () => window,
      });
      Object.defineProperty(document.documentElement, "requestFullscreen", {
        configurable: true,
        value: originalRequest,
        writable: true,
      });
    });

    /** Stubs `document.documentElement.requestFullscreen`. */
    function stubRequest(impl: (() => Promise<void>) | undefined): void {
      Object.defineProperty(document.documentElement, "requestFullscreen", {
        configurable: true,
        value: impl,
        writable: true,
      });
    }

    it("awaits the native requestFullscreen and defers state to fullscreenchange", async () => {
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

    it("redirects to the fallback URL when native requestFullscreen rejects (brand 3252)", async () => {
      const requestSpy = vi.fn().mockRejectedValue(new Error("gesture required"));
      stubRequest(requestSpy);
      const openSpy = vi.spyOn(window, "open").mockImplementation(() => null);

      const handle: ContextHandle = { ctx: null };
      const { root, container } = mount(handle, 3252);

      await act(async () => {
        await handle.ctx?.enterFullScreen();
      });

      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(openSpy).toHaveBeenCalledWith(
        "https://infolinks.begenuin.com/home?embed_id=6a4b8a153b428877f20c9bb5",
        "_blank",
        "noopener,noreferrer"
      );
      expect(handle.ctx?.isFullScreen).toBe(false);

      openSpy.mockRestore();
      unmount(root, container);
    });

    it("redirects to the fallback URL when no requestFullscreen method exists (brand 3252)", async () => {
      stubRequest(undefined);
      const openSpy = vi.spyOn(window, "open").mockImplementation(() => null);

      const handle: ContextHandle = { ctx: null };
      const { root, container } = mount(handle, 3252);

      await act(async () => {
        await handle.ctx?.enterFullScreen();
      });

      expect(openSpy).toHaveBeenCalledWith(
        "https://infolinks.begenuin.com/home?embed_id=6a4b8a153b428877f20c9bb5",
        "_blank",
        "noopener,noreferrer"
      );
      expect(handle.ctx?.isFullScreen).toBe(false);

      openSpy.mockRestore();
      unmount(root, container);
    });

    it("includes video_id in the fallback URL when a video id has been broadcast", async () => {
      stubRequest(undefined);
      const openSpy = vi.spyOn(window, "open").mockImplementation(() => null);

      const handle: ContextHandle = { ctx: null };
      const { root, container } = mount(handle, 3252);

      act(() => {
        handle.bus?.emit("genai:videoId", { videoId: "vid-123" });
      });

      await act(async () => {
        await handle.ctx?.enterFullScreen();
      });

      expect(openSpy).toHaveBeenCalledWith(
        "https://infolinks.begenuin.com/home?embed_id=6a4b8a153b428877f20c9bb5&video_id=vid-123",
        "_blank",
        "noopener,noreferrer"
      );

      openSpy.mockRestore();
      unmount(root, container);
    });

    it("falls back to manual fullscreen (no redirect) when requestFullscreen rejects for a non-3252 brand", async () => {
      const requestSpy = vi.fn().mockRejectedValue(new Error("gesture required"));
      stubRequest(requestSpy);
      const openSpy = vi.spyOn(window, "open").mockImplementation(() => null);

      const handle: ContextHandle = { ctx: null };
      const { root, container } = mount(handle, 9999);

      await act(async () => {
        await handle.ctx?.enterFullScreen();
      });

      expect(openSpy).not.toHaveBeenCalled();
      expect(handle.ctx?.isFullScreen).toBe(true);

      openSpy.mockRestore();
      unmount(root, container);
    });

    it("falls back to manual fullscreen (no redirect) when no requestFullscreen method exists and brandId is unresolved", async () => {
      stubRequest(undefined);
      const openSpy = vi.spyOn(window, "open").mockImplementation(() => null);

      const handle: ContextHandle = { ctx: null };
      const { root, container } = mount(handle);

      await act(async () => {
        await handle.ctx?.enterFullScreen();
      });

      expect(openSpy).not.toHaveBeenCalled();
      expect(handle.ctx?.isFullScreen).toBe(true);

      openSpy.mockRestore();
      unmount(root, container);
    });

    it("uses the webkit-prefixed requestFullscreen when the standard one is absent", async () => {
      const webkitRequest = vi.fn().mockResolvedValue(undefined);
      stubRequest(undefined);
      // Vendor-prefixed method is not in the DOM lib types; assigning it exercises the
      // requestFS `??` fallback chain. Justified cast over `any`.
      (document.documentElement as unknown as { webkitRequestFullscreen?: () => Promise<void> })
        .webkitRequestFullscreen = webkitRequest;

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

    it("treats a cross-origin parent (window.top access throwing) as an iframe", () => {
      // Force inIframe()'s try/catch to take the catch path: accessing window.top throws,
      // exactly like a cross-origin embed. With inIframe() === true and non-iOS, the native
      // path runs; absent any requestFullscreen, it redirects to the fallback URL (brand 3252).
      const topDescriptor = Object.getOwnPropertyDescriptor(window, "top");
      const requestDescriptor = Object.getOwnPropertyDescriptor(document.documentElement, "requestFullscreen");
      const openSpy = vi.spyOn(window, "open").mockImplementation(() => null);
      Object.defineProperty(window, "top", {
        configurable: true,
        get: () => {
          throw new Error("cross-origin");
        },
      });
      Object.defineProperty(document.documentElement, "requestFullscreen", {
        configurable: true,
        value: undefined,
        writable: true,
      });

      const handle: ContextHandle = { ctx: null };
      const { root, container } = mount(handle, 3252);

      act(() => {
        handle.ctx?.enterFullScreen();
      });

      expect(openSpy).toHaveBeenCalledWith(
        "https://infolinks.begenuin.com/home?embed_id=6a4b8a153b428877f20c9bb5",
        "_blank",
        "noopener,noreferrer"
      );
      expect(handle.ctx?.isFullScreen).toBe(false);

      openSpy.mockRestore();
      if (topDescriptor) {
        Object.defineProperty(window, "top", topDescriptor);
      } else {
        Object.defineProperty(window, "top", { configurable: true, get: () => window });
      }
      if (requestDescriptor) {
        Object.defineProperty(document.documentElement, "requestFullscreen", requestDescriptor);
      }
      unmount(root, container);
    });
  });
});
