/**
 * Tests for useInactivityAdvance — written FIRST per TDD mandate.
 */
import React from "react";
import { act } from "react";
import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// jsdom does not implement PointerEvent — provide a minimal polyfill
if (typeof PointerEvent === "undefined") {
  (globalThis as unknown as Record<string, unknown>)["PointerEvent"] = class PointerEvent extends MouseEvent {
    constructor(type: string, init?: PointerEventInit) {
      super(type, init);
    }
  };
}

import { useInactivityAdvance } from "@cxr/feed/hooks/useInactivityAdvance";

interface ShimProps {
  isActive: boolean;
  onAdvance: () => void;
  timeoutMs?: number;
}

function HookShim(props: ShimProps): null {
  useInactivityAdvance({
    isActive: props.isActive,
    onAdvance: props.onAdvance,
    timeoutMs: props.timeoutMs,
  });
  return null;
}

describe("useInactivityAdvance", () => {
  let container: HTMLDivElement;
  let root: Root;
  let onAdvance: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.useFakeTimers();
    container = document.createElement("div");
    document.body.appendChild(container);
    onAdvance = vi.fn();
    root = createRoot(container);
  });

  afterEach(() => {
    vi.useRealTimers();
    act(() => root.unmount());
    document.body.removeChild(container);
  });

  function render(isActive: boolean, timeoutMs?: number) {
    act(() => {
      root.render(React.createElement(HookShim, { isActive, onAdvance, timeoutMs }));
    });
  }

  it("calls onAdvance after 10s default timeout when isActive=true", () => {
    render(true);
    expect(onAdvance).not.toHaveBeenCalled();
    act(() => {
      vi.advanceTimersByTime(10000);
    });
    expect(onAdvance).toHaveBeenCalledOnce();
  });

  it("does not call onAdvance when isActive=false", () => {
    render(false);
    act(() => {
      vi.advanceTimersByTime(15000);
    });
    expect(onAdvance).not.toHaveBeenCalled();
  });

  it("respects custom timeoutMs", () => {
    render(true, 5000);
    act(() => {
      vi.advanceTimersByTime(4999);
    });
    expect(onAdvance).not.toHaveBeenCalled();
    act(() => {
      vi.advanceTimersByTime(2);
    });
    expect(onAdvance).toHaveBeenCalledOnce();
  });

  it("resets timer on pointer event", () => {
    render(true, 10000);
    act(() => {
      vi.advanceTimersByTime(8000);
    });
    act(() => {
      window.dispatchEvent(new PointerEvent("pointerdown"));
    });
    act(() => {
      vi.advanceTimersByTime(8000);
    });
    // Should not have fired yet — only 8s since reset
    expect(onAdvance).not.toHaveBeenCalled();
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(onAdvance).toHaveBeenCalledOnce();
  });

  it("resets timer on click event", () => {
    render(true, 10000);
    act(() => {
      vi.advanceTimersByTime(8000);
    });
    act(() => {
      window.dispatchEvent(new MouseEvent("click"));
    });
    act(() => {
      vi.advanceTimersByTime(8000);
    });
    expect(onAdvance).not.toHaveBeenCalled();
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(onAdvance).toHaveBeenCalledOnce();
  });

  it("resets timer on touch event", () => {
    render(true, 10000);
    act(() => {
      vi.advanceTimersByTime(8000);
    });
    act(() => {
      window.dispatchEvent(new TouchEvent("touchstart"));
    });
    act(() => {
      vi.advanceTimersByTime(8000);
    });
    expect(onAdvance).not.toHaveBeenCalled();
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(onAdvance).toHaveBeenCalledOnce();
  });

  it("clears timer when isActive transitions to false", () => {
    render(true, 10000);
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    // Switch to inactive
    act(() => {
      root.render(React.createElement(HookShim, { isActive: false, onAdvance, timeoutMs: 10000 }));
    });
    act(() => {
      vi.advanceTimersByTime(10000);
    });
    expect(onAdvance).not.toHaveBeenCalled();
  });
});
