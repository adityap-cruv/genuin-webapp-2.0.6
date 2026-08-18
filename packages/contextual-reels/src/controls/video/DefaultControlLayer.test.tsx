/**
 * Tests for DefaultControlLayer — the banner (L1/L2/L5) chrome gating.
 *
 * Two independent flags decide what renders, and they do NOT gate the same set:
 *
 *   splitActive (Octo sheet owns the surface) → hides TopBar AND ClickOverlay
 *   hideChrome                                → hides TopBar AND BottomBar
 *
 * So the overlay survives `hideChrome` while the bottom bar survives
 * `splitActive`. That asymmetry is easy to "tidy" into a single guard, and doing
 * so would either swallow taps or paint the ticker row over the Octo sheet. The
 * E2E L2-OCTO case depends on this exact matrix; this pins it at unit level so a
 * regression names itself instead of surfacing as a puzzling E2E failure.
 */
import React from "react";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Echoes `isActive` back so the argument is genuinely used, which keeps the
// call signature typed for the `toHaveBeenCalledWith` assertion below. The
// component only reads `splitActive`.
const { splitMock } = vi.hoisted(() => ({
  splitMock: vi.fn((isActive: boolean) => ({ splitActive: false, isActive })),
}));

vi.mock("@cxr/providers/GenAIProvider", () => ({ useOctoSplit: (isActive: boolean) => splitMock(isActive) }));
vi.mock("@cxr/instance/InstanceContext", () => ({ useInstanceId: () => "inst-1" }));
vi.mock("@cxr/controls/TopBar", () => ({
  TopBar: () => React.createElement("div", { "data-testid": "stub-topbar" }),
}));
vi.mock("@cxr/controls/BottomBar", () => ({
  BottomBar: (p: { instanceId?: string }) =>
    React.createElement("div", { "data-testid": "stub-bottombar", "data-instance": p.instanceId }),
}));
vi.mock("@cxr/controls/ClickOverlay", () => ({
  ClickOverlay: () => React.createElement("div", { "data-testid": "stub-overlay" }),
}));

const { DefaultControlLayer } = await import("@cxr/controls/video/DefaultControlLayer");

describe("controls/DefaultControlLayer", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    splitMock.mockReturnValue({ splitActive: false, isActive: true });
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  function render(props: Record<string, unknown> = {}): {
    top: boolean;
    bottom: boolean;
    overlay: boolean;
  } {
    act(() => {
      // Only the gating props matter here; children are stubbed above.
      root.render(React.createElement(DefaultControlLayer, { isActive: true, ...props } as never));
    });
    return {
      top: !!container.querySelector('[data-testid="stub-topbar"]'),
      bottom: !!container.querySelector('[data-testid="stub-bottombar"]'),
      overlay: !!container.querySelector('[data-testid="stub-overlay"]'),
    };
  }

  it("renders all three regions by default", () => {
    expect(render()).toEqual({ top: true, bottom: true, overlay: true });
  });

  // hideChrome drops the two BARS but must keep the tap surface alive.
  it("hideChrome drops both bars and KEEPS the click overlay", () => {
    expect(render({ hideChrome: true })).toEqual({ top: false, bottom: false, overlay: true });
  });

  // splitActive hands the surface to the Octo sheet: no top bar, and no overlay
  // (the sheet handles its own input) — but the bottom bar is NOT its business.
  it("splitActive drops the top bar and the overlay, and KEEPS the bottom bar", () => {
    splitMock.mockReturnValue({ splitActive: true, isActive: true });
    expect(render()).toEqual({ top: false, bottom: true, overlay: false });
  });

  it("both flags together render nothing", () => {
    splitMock.mockReturnValue({ splitActive: true, isActive: true });
    expect(render({ hideChrome: true })).toEqual({ top: false, bottom: false, overlay: false });
  });

  // The carousel keeps neighbours mounted, and they read the same shared Octo
  // fraction — so the split must be scoped by isActive or an inactive reel loses
  // its chrome while the active one is in split view.
  it("scopes the Octo split query to this reel's isActive", () => {
    render({ isActive: false });
    expect(splitMock).toHaveBeenCalledWith(false);
    render({ isActive: true });
    expect(splitMock).toHaveBeenCalledWith(true);
  });

  it("threads the instance id from context into the bottom bar", () => {
    render();
    expect(container.querySelector('[data-testid="stub-bottombar"]')?.getAttribute("data-instance")).toBe("inst-1");
  });

  it("treats an absent hideChrome as false", () => {
    expect(render({ hideChrome: undefined }).top).toBe(true);
  });
});
