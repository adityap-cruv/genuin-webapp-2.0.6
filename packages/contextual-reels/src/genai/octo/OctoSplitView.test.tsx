/**
 * Tests for `OctoSplitView` — the 300×250 non-fullscreen Octo overlay.
 *
 * Rendered with raw React (no @testing-library/react). `OctoSdkPanel` is mocked
 * as an inert marker that echoes the props the view forwards, so the test can
 * assert the overlay's wiring (full render mode, xs density, isOpen gating, and
 * the activation-key bump on reel re-activation) without the real SDK.
 */
import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const panelProps: Array<Record<string, unknown>> = [];

vi.mock("./OctoSdkPanel", () => ({
  OctoSdkPanel: (props: Record<string, unknown>) => {
    panelProps.push(props);
    return createElement("div", {
      "data-testid": "octo-sdk-panel",
      "data-is-open": String(props.isOpen),
      "data-render-mode": String(props.renderMode),
      "data-ui-density": String(props.uiDensity),
      "data-activation-key": String(props.activationKey),
    });
  },
}));

import type { OctoSheetProps } from "@cxr/genai/octo/OctoSheet";
import { OctoSplitView } from "@cxr/genai/octo/OctoSplitView";

const baseProps: OctoSheetProps = {
  instanceId: "inst-1",
  videoId: "vid-1",
  brandId: 42,
  dimensions: { width: 300, height: 250 },
  isFullScreen: false,
  isActive: true,
  tagId: "tag-1",
  host: "split",
};

let container: HTMLDivElement;
let root: Root;

function render(props: OctoSheetProps): void {
  act(() => {
    root.render(createElement(OctoSplitView, props));
  });
}

beforeEach(() => {
  panelProps.length = 0;
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

describe("OctoSplitView", () => {
  it("renders nothing when there is no video", () => {
    render({ ...baseProps, videoId: "" });
    expect(container.querySelector("[data-testid=\"octo-split-view\"]")).toBeNull();
  });

  it("mounts the SDK panel in full mode at xs density when active", () => {
    render(baseProps);
    const panel = container.querySelector("[data-testid=\"octo-sdk-panel\"]");
    expect(panel).not.toBeNull();
    expect(panel?.getAttribute("data-render-mode")).toBe("full");
    expect(panel?.getAttribute("data-ui-density")).toBe("xs");
    expect(panel?.getAttribute("data-is-open")).toBe("true");
  });

  it("keeps the panel closed when the reel is inactive", () => {
    render({ ...baseProps, isActive: false });
    const panel = container.querySelector("[data-testid=\"octo-sdk-panel\"]");
    expect(panel?.getAttribute("data-is-open")).toBe("false");
  });

  it("bumps the activation key on an inactive→active edge", () => {
    render({ ...baseProps, isActive: false });
    const before = container
      .querySelector("[data-testid=\"octo-sdk-panel\"]")
      ?.getAttribute("data-activation-key");
    expect(before).toBe("0");

    render({ ...baseProps, isActive: true });
    const after = container
      .querySelector("[data-testid=\"octo-sdk-panel\"]")
      ?.getAttribute("data-activation-key");
    expect(after).toBe("1");
  });

  it("forwards an onLifecyclePhase no-op handler that does not throw", () => {
    render(baseProps);
    const last = panelProps[panelProps.length - 1];
    expect(typeof last?.onLifecyclePhase).toBe("function");
    expect(() => (last?.onLifecyclePhase as () => void)()).not.toThrow();
  });
});
