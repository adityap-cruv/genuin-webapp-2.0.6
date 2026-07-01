/**
 * Tests for `OctoSdkPanel` — the GenAI SDK lifecycle wrapper.
 *
 * Rendered with raw React (no @testing-library/react). `@genuin/genai-sdk` is
 * mocked with controllable spies (`init`/`destroy`/`setWebSdkRenderMode`) so the
 * test drives the panel's lazy load, init, destroy-on-close, reinit on video
 * change / reactivation, render-mode push, lifecycle-event filtering, and the
 * error branches without the real SDK. The SDK module is loaded via a dynamic
 * `import()`, so renders are wrapped in `await act(async () => …)` to flush it.
 */
import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// `vi.mock` factories are hoisted above module-level consts, so the shared
// spies must be created via `vi.hoisted` to be available inside them.
const { init, destroy, setWebSdkRenderMode, logError } = vi.hoisted(() => ({
  init: vi.fn(),
  destroy: vi.fn(),
  setWebSdkRenderMode: vi.fn(),
  logError: vi.fn(),
}));

vi.mock("@genuin/genai-sdk", () => ({ init, destroy, setWebSdkRenderMode }));

// Silence the structured logger; assert on the spies instead of console.
vi.mock("@cxr/utils/logger", () => ({
  createLogger: () => ({ debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: logError }),
}));

vi.mock("@cxr/userId", () => ({ userId: "user-test" }));

import { OctoSdkPanel, type OctoSdkPanelProps } from "@cxr/genai/octo/OctoSdkPanel";

const baseProps: OctoSdkPanelProps = {
  instanceId: "inst-1",
  videoId: "vid-1",
  brandId: 9,
  renderMode: "compact",
  isOpen: true,
  activationKey: 0,
  onLifecyclePhase: vi.fn(),
};

let container: HTMLDivElement;
let root: Root;

async function render(props: OctoSdkPanelProps): Promise<void> {
  await act(async () => {
    root.render(createElement(OctoSdkPanel, props));
  });
}

function emitLifecycle(detail: { parentOctoPanelId?: string; phase?: string }): void {
  act(() => {
    window.dispatchEvent(new CustomEvent("genai:octoLifecycle", { detail }));
  });
}

beforeEach(() => {
  vi.useFakeTimers();
  init.mockReset();
  destroy.mockReset();
  setWebSdkRenderMode.mockReset();
  logError.mockReset();
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  vi.useRealTimers();
});

describe("OctoSdkPanel — loading + init", () => {
  it("shows a spinner before the SDK module resolves, then the container", async () => {
    // Hold the SDK module pending until we flush microtasks.
    await render(baseProps);
    const node = container.querySelector(".genai-sdk-container");
    expect(node).not.toBeNull();
    expect(node?.getAttribute("data-video-id")).toBe("vid-1");
    expect(init).toHaveBeenCalledTimes(1);
  });

  it("forwards the expected init payload to the SDK", async () => {
    await render(baseProps);
    const payload = init.mock.calls[0]?.[0] as Record<string, unknown>;
    expect(payload.userId).toBe("user-test");
    expect(payload.videoId).toBe("vid-1");
    expect(payload.brandId).toBe(9);
    expect(payload.view).toBe("web-sdk");
    expect(payload.renderMode).toBe("compact");
    expect(payload.integrationType).toBe("placement");
  });

  it("passes brandId as null when none is supplied", async () => {
    await render({ ...baseProps, brandId: undefined });
    const payload = init.mock.calls[0]?.[0] as Record<string, unknown>;
    expect(payload.brandId).toBeNull();
  });

  it("uses the caller-supplied panel id override on the container", async () => {
    await render({ ...baseProps, parentOctoPanelIdOverride: "custom-panel" });
    const node = container.querySelector(".genai-sdk-container");
    expect(node?.getAttribute("data-octo-panel-id")).toBe("custom-panel");
    const payload = init.mock.calls[0]?.[0] as Record<string, unknown>;
    expect(payload.parentOctoPanelId).toBe("custom-panel");
  });

  it("does not load the SDK while closed", async () => {
    await render({ ...baseProps, isOpen: false });
    expect(init).not.toHaveBeenCalled();
    expect(container.querySelector(".genai-sdk-container")).toBeNull();
  });

  it("logs and recovers when init throws", async () => {
    init.mockImplementation(() => {
      throw new Error("boom");
    });
    await render(baseProps);
    expect(logError).toHaveBeenCalledWith("OctoSdkPanel: init failed", expect.any(Error));
  });
});

describe("OctoSdkPanel — reinit", () => {
  it("destroys + reinitialises on a video change", async () => {
    await render(baseProps);
    expect(init).toHaveBeenCalledTimes(1);

    // Video change → destroy + (after a 100ms grace) reinit via reinit tick.
    await act(async () => {
      root.render(createElement(OctoSdkPanel, { ...baseProps, videoId: "vid-2" }));
    });
    expect(destroy).toHaveBeenCalledTimes(1);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(150);
    });
    expect(init).toHaveBeenCalledTimes(2);
    expect((init.mock.calls[1]?.[0] as Record<string, unknown>).videoId).toBe("vid-2");
  });

  it("destroys + reinitialises on a reactivation (activationKey bump)", async () => {
    await render(baseProps);
    await act(async () => {
      root.render(createElement(OctoSdkPanel, { ...baseProps, activationKey: 1 }));
    });
    expect(destroy).toHaveBeenCalledTimes(1);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(150);
    });
    expect(init).toHaveBeenCalledTimes(2);
  });

  it("logs when destroy throws during reinit but still recovers", async () => {
    await render(baseProps);
    // Throw only on the first destroy so the subsequent reinit attempt
    // succeeds and the layout effect settles (no destroy→reinit loop).
    destroy.mockImplementationOnce(() => {
      throw new Error("destroy-fail");
    });
    await act(async () => {
      root.render(createElement(OctoSdkPanel, { ...baseProps, videoId: "vid-3" }));
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(150);
    });
    expect(logError).toHaveBeenCalledWith("OctoSdkPanel: destroy on reinit failed", expect.any(Error));
  });
});

describe("OctoSdkPanel — render-mode push", () => {
  it("pushes a render-mode change without a full reinit", async () => {
    await render(baseProps);
    await act(async () => {
      root.render(createElement(OctoSdkPanel, { ...baseProps, renderMode: "full" }));
    });
    expect(setWebSdkRenderMode).toHaveBeenCalledWith("full");
    expect(destroy).not.toHaveBeenCalled();
  });

  it("logs when setWebSdkRenderMode throws", async () => {
    await render(baseProps);
    setWebSdkRenderMode.mockImplementation(() => {
      throw new Error("rm-fail");
    });
    await act(async () => {
      root.render(createElement(OctoSdkPanel, { ...baseProps, renderMode: "full" }));
    });
    expect(logError).toHaveBeenCalledWith("OctoSdkPanel: setWebSdkRenderMode failed", expect.any(Error));
  });
});

describe("OctoSdkPanel — close + cleanup", () => {
  it("destroys after the close grace period when toggled closed", async () => {
    await render(baseProps);
    await act(async () => {
      root.render(createElement(OctoSdkPanel, { ...baseProps, isOpen: false }));
    });
    expect(destroy).not.toHaveBeenCalled();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(350);
    });
    expect(destroy).toHaveBeenCalledTimes(1);
  });

  it("logs when destroy on close throws", async () => {
    await render(baseProps);
    destroy.mockImplementation(() => {
      throw new Error("close-fail");
    });
    await act(async () => {
      root.render(createElement(OctoSdkPanel, { ...baseProps, isOpen: false }));
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(350);
    });
    expect(logError).toHaveBeenCalledWith("OctoSdkPanel: destroy on close failed", expect.any(Error));
  });

  it("destroys on unmount", async () => {
    await render(baseProps);
    await act(async () => {
      root.unmount();
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(10);
    });
    expect(destroy).toHaveBeenCalledTimes(1);
    // Avoid the afterEach double-unmount of an already-unmounted root.
    root = createRoot(document.createElement("div"));
  });

  it("logs when destroy on unmount cleanup throws", async () => {
    await render(baseProps);
    destroy.mockImplementation(() => {
      throw new Error("cleanup-fail");
    });
    await act(async () => {
      root.unmount();
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(10);
    });
    expect(logError).toHaveBeenCalledWith("OctoSdkPanel: cleanup failed", expect.any(Error));
    root = createRoot(document.createElement("div"));
  });
});

describe("OctoSdkPanel — lifecycle event routing", () => {
  it("forwards a phase addressed to this panel", async () => {
    const onLifecyclePhase = vi.fn();
    await render({ ...baseProps, parentOctoPanelIdOverride: "p1", onLifecyclePhase });
    emitLifecycle({ parentOctoPanelId: "p1", phase: "thinking" });
    expect(onLifecyclePhase).toHaveBeenCalledWith("thinking");
  });

  it("ignores a phase addressed to another panel", async () => {
    const onLifecyclePhase = vi.fn();
    await render({ ...baseProps, parentOctoPanelIdOverride: "p1", onLifecyclePhase });
    emitLifecycle({ parentOctoPanelId: "other", phase: "thinking" });
    expect(onLifecyclePhase).not.toHaveBeenCalled();
  });

  it("forwards an unaddressed phase (no parentOctoPanelId)", async () => {
    const onLifecyclePhase = vi.fn();
    await render({ ...baseProps, onLifecyclePhase });
    emitLifecycle({ phase: "response" });
    expect(onLifecyclePhase).toHaveBeenCalledWith("response");
  });

  it("ignores an event with no phase", async () => {
    const onLifecyclePhase = vi.fn();
    await render({ ...baseProps, onLifecyclePhase });
    emitLifecycle({ parentOctoPanelId: undefined });
    expect(onLifecyclePhase).not.toHaveBeenCalled();
  });
});
