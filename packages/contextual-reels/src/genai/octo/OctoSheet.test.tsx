/**
 * Tests for `OctoSheet` — the size-aware dispatcher and its private
 * `OctoSheetLadder`.
 *
 * Rendered with raw React (no @testing-library/react). The three variant
 * children, the `DynamicSheet` shell, and `useGenAI` are mocked so the test
 * focuses on routing (host × layout → which variant renders) and the ladder's
 * own wiring (split-fraction publishing, render-mode mapping, phase handling).
 */
import type { ReactNode } from "react";
import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const setOctoFraction = vi.fn();

vi.mock("@cxr/providers/GenAIProvider", () => ({
  useGenAI: () => ({ setOctoFraction }),
}));

// Inert variant markers — the dispatcher's job is which one renders, not what.
vi.mock("./OctoSplitView", () => ({
  OctoSplitView: () => createElement("div", { "data-testid": "octo-split-view" }),
}));
vi.mock("./OctoCountdownStrip", () => ({
  OctoCountdownStrip: (props: { variant: string }) =>
    createElement("div", { "data-testid": "octo-countdown-strip", "data-variant": props.variant }),
}));
const sdkPanelProps: Array<Record<string, unknown>> = [];
vi.mock("./OctoSdkPanel", () => ({
  OctoSdkPanel: (props: { renderMode: string }) => {
    sdkPanelProps.push(props as Record<string, unknown>);
    return createElement("div", { "data-testid": "octo-sdk-panel", "data-render-mode": props.renderMode });
  },
}));

// DynamicSheet shell: render children + echo the controlled state so the ladder
// path is exercised without the real sheet's measurement/animation internals.
const sheetProps: Array<Record<string, unknown>> = [];
vi.mock("@genuin/ui/dynamic-sheet", () => ({
  DynamicSheet: (props: { children?: ReactNode; controlledState?: string; isOpen?: boolean }) => {
    sheetProps.push(props as Record<string, unknown>);
    return createElement(
      "div",
      {
        "data-testid": "dynamic-sheet",
        "data-controlled-state": String(props.controlledState),
        "data-is-open": String(props.isOpen),
      },
      props.children
    );
  },
}));

import { AD_LAYOUT } from "@cxr/config";
import { OctoSheet, type OctoSheetProps } from "@cxr/genai/octo/OctoSheet";

const baseProps: OctoSheetProps = {
  instanceId: "inst-1",
  videoId: "vid-1",
  brandId: 7,
  dimensions: { width: 300, height: 600 },
  isFullScreen: false,
  isActive: true,
  tagId: "tag-1",
  host: "bottombar",
};

let container: HTMLDivElement;
let root: Root;

function render(props: OctoSheetProps): void {
  act(() => {
    root.render(createElement(OctoSheet, props));
  });
}

beforeEach(() => {
  setOctoFraction.mockClear();
  sheetProps.length = 0;
  sdkPanelProps.length = 0;
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

describe("OctoSheet — dispatcher gating", () => {
  it("renders nothing without a brand id", () => {
    render({ ...baseProps, brandId: undefined });
    expect(container.firstChild).toBeNull();
  });

  it("renders nothing for an unknown layout", () => {
    render({ ...baseProps, adLayoutHint: AD_LAYOUT.Unknown });
    expect(container.firstChild).toBeNull();
  });
});

describe("OctoSheet — fullscreen routing", () => {
  it("routes fullscreen to the ladder only for the bottombar host", () => {
    render({ ...baseProps, isFullScreen: true, host: "bottombar" });
    expect(container.querySelector("[data-testid=\"dynamic-sheet\"]")).not.toBeNull();
  });

  it("renders nothing for non-bottombar hosts in fullscreen", () => {
    render({ ...baseProps, isFullScreen: true, host: "split" });
    expect(container.firstChild).toBeNull();
  });
});

describe("OctoSheet — layout routing (non-fullscreen)", () => {
  it("routes L2 to the split view for the split host", () => {
    render({ ...baseProps, adLayoutHint: AD_LAYOUT.L2, host: "split" });
    expect(container.querySelector("[data-testid=\"octo-split-view\"]")).not.toBeNull();
  });

  it("returns null for L2 on a non-split host", () => {
    render({ ...baseProps, adLayoutHint: AD_LAYOUT.L2, host: "bottombar" });
    expect(container.firstChild).toBeNull();
  });

  it("routes L4 to the 100 countdown strip for the compact host", () => {
    render({ ...baseProps, adLayoutHint: AD_LAYOUT.L4, host: "compact" });
    const strip = container.querySelector("[data-testid=\"octo-countdown-strip\"]");
    expect(strip?.getAttribute("data-variant")).toBe("100");
  });

  it("routes L3 to the 50 countdown strip for the compact host", () => {
    render({ ...baseProps, adLayoutHint: AD_LAYOUT.L3, host: "compact" });
    const strip = container.querySelector("[data-testid=\"octo-countdown-strip\"]");
    expect(strip?.getAttribute("data-variant")).toBe("50");
  });

  it("returns null for a compact layout on a non-compact host", () => {
    render({ ...baseProps, adLayoutHint: AD_LAYOUT.L3, host: "bottombar" });
    expect(container.firstChild).toBeNull();
  });

  it("routes the default L1 layout to the ladder for the bottombar host", () => {
    render({ ...baseProps, adLayoutHint: AD_LAYOUT.L1, host: "bottombar" });
    expect(container.querySelector("[data-testid=\"dynamic-sheet\"]")).not.toBeNull();
  });

  it("measures the layout from dimensions when no hint is given", () => {
    render({ ...baseProps, dimensions: { width: 300, height: 250 }, host: "split" });
    expect(container.querySelector("[data-testid=\"octo-split-view\"]")).not.toBeNull();
  });
});

describe("OctoSheet — ladder behaviour", () => {
  it("renders nothing in the ladder when there is no video", () => {
    render({ ...baseProps, videoId: "", host: "bottombar" });
    expect(container.querySelector("[data-testid=\"dynamic-sheet\"]")).toBeNull();
  });

  it("opens the sheet and mounts the SDK in compact mode at default state", () => {
    render(baseProps);
    const sheet = container.querySelector("[data-testid=\"dynamic-sheet\"]");
    expect(sheet?.getAttribute("data-is-open")).toBe("true");
    expect(sheet?.getAttribute("data-controlled-state")).toBe("default");
    const panel = container.querySelector("[data-testid=\"octo-sdk-panel\"]");
    expect(panel?.getAttribute("data-render-mode")).toBe("compact");
  });

  it("publishes a zero split fraction while collapsed", () => {
    render(baseProps);
    expect(setOctoFraction).toHaveBeenCalledWith(0);
  });

  it("resets the fraction to 0 on unmount", () => {
    render(baseProps);
    setOctoFraction.mockClear();
    act(() => root.unmount());
    expect(setOctoFraction).toHaveBeenCalledWith(0);
  });

  it("drives the sheet to panel-view + full render mode on a response phase", () => {
    render(baseProps);
    // The ladder hands its phase handler to OctoSdkPanel; invoke it directly to
    // drive the mobile phase map (response → panel-view).
    const onLifecyclePhase = sdkPanelProps[sdkPanelProps.length - 1]?.onLifecyclePhase as
      | ((phase: string) => void)
      | undefined;
    expect(typeof onLifecyclePhase).toBe("function");

    setOctoFraction.mockClear();
    act(() => onLifecyclePhase?.("response"));

    const sheet = container.querySelector("[data-testid=\"dynamic-sheet\"]");
    expect(sheet?.getAttribute("data-controlled-state")).toBe("panel-view");
    const panel = container.querySelector("[data-testid=\"octo-sdk-panel\"]");
    expect(panel?.getAttribute("data-render-mode")).toBe("full");
    // panel-view publishes the 0.7 split fraction.
    expect(setOctoFraction).toHaveBeenCalledWith(0.7);
  });

  it("leaves the sheet untouched on an idle phase (null mapping)", () => {
    render(baseProps);
    const onLifecyclePhase = sdkPanelProps[sdkPanelProps.length - 1]?.onLifecyclePhase as
      | ((phase: string) => void)
      | undefined;
    act(() => onLifecyclePhase?.("idle"));
    const sheet = container.querySelector("[data-testid=\"dynamic-sheet\"]");
    expect(sheet?.getAttribute("data-controlled-state")).toBe("default");
  });

  it("does not publish a fraction for an inactive reel", () => {
    render({ ...baseProps, isActive: false });
    expect(setOctoFraction).not.toHaveBeenCalled();
  });
});
