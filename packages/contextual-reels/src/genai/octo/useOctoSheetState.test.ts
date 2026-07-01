/**
 * Tests for `useOctoSheetState` — the standalone Octo sheet-state machine.
 *
 * Rendered with raw React (no @testing-library/react): a shim component calls
 * the hook and captures its return into a module-level handle so assertions can
 * read state and invoke handlers inside `act`.
 */
import type { DynamicSheetState } from "@genuin/ui/dynamic-sheet";
import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { describe, it, expect, beforeEach, afterEach } from "vitest";

import { useOctoSheetState, type UseOctoSheetStateReturn } from "@cxr/genai/octo/useOctoSheetState";

let handle: UseOctoSheetStateReturn;
let container: HTMLDivElement;
let root: Root;

function Probe({ isActive }: { isActive: boolean }): null {
  handle = useOctoSheetState({ isActive });
  return null;
}

function render(isActive: boolean): void {
  act(() => {
    root.render(createElement(Probe, { isActive }));
  });
}

beforeEach(() => {
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

describe("useOctoSheetState — initial state", () => {
  it("starts collapsed and visible", () => {
    render(true);
    expect(handle.octoSheetState).toBe("default");
    expect(handle.octoHidden).toBe(false);
  });
});

describe("useOctoSheetState — applyPhase", () => {
  it("drives the sheet to the phase target and clears the hidden flag", () => {
    render(true);
    act(() => handle.handleClose());
    expect(handle.octoHidden).toBe(true);

    act(() => handle.applyPhase({ sheetState: "panel-view" }));
    expect(handle.octoSheetState).toBe("panel-view");
    expect(handle.octoHidden).toBe(false);
  });

  it("treats a null phase as a no-op", () => {
    render(true);
    act(() => handle.applyPhase({ sheetState: "expand-view" }));
    act(() => handle.applyPhase({ sheetState: null }));
    expect(handle.octoSheetState).toBe("expand-view");
  });
});

describe("useOctoSheetState — handleSheetStateChange", () => {
  it("ignores changes while the reel is inactive", () => {
    render(false);
    act(() => handle.handleSheetStateChange("expand-view"));
    expect(handle.octoSheetState).toBe("default");
  });

  it("applies an upward (programmatic) change", () => {
    render(true);
    act(() => handle.handleSheetStateChange("panel-view"));
    expect(handle.octoSheetState).toBe("panel-view");
  });

  it("collapses to default on a downward swipe from an expanded state", () => {
    render(true);
    act(() => handle.applyPhase({ sheetState: "panel-view" }));
    act(() => handle.handleSheetStateChange("expand-view"));
    expect(handle.octoSheetState).toBe("default");
  });

  it("does not treat a same-state change as a swipe-down", () => {
    render(true);
    act(() => handle.applyPhase({ sheetState: "expand-view" }));
    act(() => handle.handleSheetStateChange("expand-view"));
    expect(handle.octoSheetState).toBe("expand-view");
  });

  it("falls back to priority 0 for an unmapped target state", () => {
    render(true);
    act(() => handle.handleSheetStateChange("mystery" as DynamicSheetState));
    expect(handle.octoSheetState).toBe("mystery");
  });
});

describe("useOctoSheetState — handleClose", () => {
  it("hides Octo and collapses to default", () => {
    render(true);
    act(() => handle.applyPhase({ sheetState: "full-view" }));
    act(() => handle.handleClose());
    expect(handle.octoHidden).toBe(true);
    expect(handle.octoSheetState).toBe("default");
  });
});

describe("useOctoSheetState — handleActionToggle", () => {
  it("toggles visibility off (collapsing) then back on", () => {
    render(true);
    act(() => handle.applyPhase({ sheetState: "expand-view" }));

    // visible → hidden + collapsed
    act(() => handle.handleActionToggle());
    expect(handle.octoHidden).toBe(true);
    expect(handle.octoSheetState).toBe("default");

    // hidden → visible (state untouched, stays default)
    act(() => handle.handleActionToggle());
    expect(handle.octoHidden).toBe(false);
    expect(handle.octoSheetState).toBe("default");
  });
});

describe("useOctoSheetState — reactivation reset", () => {
  it("resets state + visibility on an inactive→active edge", () => {
    render(true);
    act(() => handle.applyPhase({ sheetState: "panel-view" }));
    act(() => handle.handleClose());
    expect(handle.octoHidden).toBe(true);

    // Go inactive, then re-activate → fresh open resets everything.
    render(false);
    render(true);
    expect(handle.octoSheetState).toBe("default");
    expect(handle.octoHidden).toBe(false);
  });
});
