/**
 * Tests for useResourceMonitor — verifies the returned getSnapshot is stable across
 * re-renders and reads a real snapshot from the Performance timeline.
 *
 * Mounted with raw react-dom (no @testing-library/react, matching repo convention) via a
 * throwaway harness component.
 */
import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it } from "vitest";

import type { ResourceSnapshot } from "@cxr/monitoring/resourceMonitor";
import { useResourceMonitor } from "@cxr/monitoring/useResourceMonitor";

let container: HTMLDivElement;
let root: Root;

describe("useResourceMonitor", () => {
  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  it("returns a stable getSnapshot that reads the Performance timeline", () => {
    let captured: { getSnapshot: () => ResourceSnapshot | null } | undefined;
    let renderCount = 0;
    const capturedFns: Array<() => ResourceSnapshot | null> = [];

    function Harness(): React.JSX.Element {
      captured = useResourceMonitor();
      capturedFns.push(captured.getSnapshot);
      renderCount += 1;
      return React.createElement("span");
    }

    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    act(() => {
      root.render(React.createElement(Harness));
    });
    act(() => {
      root.render(React.createElement(Harness));
    });

    expect(renderCount).toBe(2);
    expect(capturedFns[0]).toBe(capturedFns[1]);

    const snapshot = captured!.getSnapshot();
    expect(snapshot).not.toBeNull();
    expect(snapshot?.metrics.transferBytes).toBeDefined();
  });
});
