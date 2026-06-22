/**
 * Tests for FullScreenProvider — written FIRST per TDD mandate.
 */
import { act, type ReactElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { EventBusProvider } from "@cxr/instance/coordination/EventBusContext";
import { FullScreenProvider, useFullScreen, type FullScreenContextValue } from "@cxr/providers/FullScreenProvider";

// ---------------------------------------------------------------------------
// Harness
// ---------------------------------------------------------------------------

interface ContextHandle {
  ctx: FullScreenContextValue | null;
}

function Consumer({ handle }: { handle: ContextHandle }): ReactElement {
  handle.ctx = useFullScreen();
  return <span data-testid="consumer" />;
}

function mount(handle: ContextHandle): { root: Root; container: HTMLDivElement } {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => {
    root.render(
      <EventBusProvider>
        <FullScreenProvider>
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
});
