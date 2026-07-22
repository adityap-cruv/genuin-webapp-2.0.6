/**
 * Tests for useSwipeGate.
 */
import React from "react";
import { act } from "react";
import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { useSwipeGate } from "@cxr/feed/hooks/useSwipeGate";

function HookShim({
  enable,
  disable,
  disableReasons,
}: {
  enable: () => void;
  disable: () => void;
  disableReasons: boolean[];
}): null {
  useSwipeGate({ enable, disable }, disableReasons);
  return null;
}

describe("useSwipeGate", () => {
  let container: HTMLDivElement;
  let root: Root;
  let enable: ReturnType<typeof vi.fn>;
  let disable: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    enable = vi.fn();
    disable = vi.fn();
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    document.body.removeChild(container);
  });

  function render(disableReasons: boolean[]): void {
    act(() => {
      root.render(React.createElement(HookShim, { enable, disable, disableReasons }));
    });
  }

  it("enables swipe when every reason is false", () => {
    render([false, false]);
    expect(enable).toHaveBeenCalled();
    expect(disable).not.toHaveBeenCalled();
  });

  it("disables swipe when one reason is true", () => {
    render([false, true]);
    expect(disable).toHaveBeenCalled();
    expect(enable).not.toHaveBeenCalled();
  });

  it("disables swipe when every reason is true", () => {
    render([true, true]);
    expect(disable).toHaveBeenCalled();
    expect(enable).not.toHaveBeenCalled();
  });

  it("stays disabled while any reason remains true, even if another clears — the combined boolean is unchanged, so the effect doesn't re-fire, but enable() is never called either", () => {
    render([true, true]);
    expect(disable).toHaveBeenCalledTimes(1);

    disable.mockClear();
    enable.mockClear();
    render([true, false]);
    // Combined disable-state didn't change (still "disabled"), so neither
    // callback fires again — the effect only reacts to the combined boolean flipping.
    expect(disable).not.toHaveBeenCalled();
    expect(enable).not.toHaveBeenCalled();
  });

  it("re-enables swipe only once every reason clears", () => {
    render([true, false]);
    expect(disable).toHaveBeenCalledTimes(1);

    enable.mockClear();
    render([false, false]);
    expect(enable).toHaveBeenCalledTimes(1);
  });

  it("does not re-fire the effect when the combined boolean hasn't changed", () => {
    render([true, false]);
    disable.mockClear();
    render([false, true]);
    // Combined result is still "disabled" both times — no extra disable() call.
    expect(disable).not.toHaveBeenCalled();
  });
});
