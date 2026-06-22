/**
 * Tests for useGenAiSwipeGate — written FIRST per TDD mandate.
 */
import React from "react";
import { act } from "react";
import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { CxrEventBus } from "@cxr/instance/coordination/CxrEventBus";

// Mock useEventBus so the hook receives the pre-created testBus instance.
// Must be declared before importing the hook under test.
let testBus: CxrEventBus;

vi.mock("../../instance/coordination/EventBusContext", () => ({
  useEventBus: () => testBus,
}));

import { useGenAiSwipeGate, type GenAiStatus } from "@cxr/feed/hooks/useGenAiSwipeGate";

interface ShimResult {
  status: GenAiStatus;
  swipeDisabled: boolean;
}

let captured: ShimResult = { status: "none", swipeDisabled: false };

interface ShimProps {
  isActiveReel: boolean;
  onAutoAdvance: () => void;
  onPauseVideo: () => void;
  onResumeVideo: () => void;
}

function HookShim(props: ShimProps): null {
  const result = useGenAiSwipeGate(props.isActiveReel, {
    onAutoAdvance: props.onAutoAdvance,
    onPauseVideo: props.onPauseVideo,
    onResumeVideo: props.onResumeVideo,
  });
  captured = result;
  return null;
}

describe("useGenAiSwipeGate", () => {
  let container: HTMLDivElement;
  let root: Root;
  let onAutoAdvance: ReturnType<typeof vi.fn>;
  let onPauseVideo: ReturnType<typeof vi.fn>;
  let onResumeVideo: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.useFakeTimers();
    testBus = new CxrEventBus();
    captured = { status: "none", swipeDisabled: false };
    container = document.createElement("div");
    document.body.appendChild(container);
    onAutoAdvance = vi.fn();
    onPauseVideo = vi.fn();
    onResumeVideo = vi.fn();
    root = createRoot(container);
  });

  afterEach(() => {
    vi.useRealTimers();
    act(() => root.unmount());
    document.body.removeChild(container);
  });

  function render(isActiveReel = true) {
    act(() => {
      root.render(
        React.createElement(HookShim, {
          isActiveReel,
          onAutoAdvance,
          onPauseVideo,
          onResumeVideo,
        })
      );
    });
  }

  it('initialises with status "none" and swipeDisabled false', () => {
    render();
    expect(captured.status).toBe("none");
    expect(captured.swipeDisabled).toBe(false);
  });

  it('sets status to "data-fetching" and disables swipe on genai:dataFetching', () => {
    render();
    act(() => {
      testBus.emit("genai:dataFetching", {});
    });
    expect(captured.status).toBe("data-fetching");
    expect(captured.swipeDisabled).toBe(true);
  });

  it('sets status to "data-loaded" and disables swipe + pauses video on genai:dataReceived', () => {
    render();
    act(() => {
      testBus.emit("genai:dataReceived", {});
    });
    expect(captured.status).toBe("data-loaded");
    expect(captured.swipeDisabled).toBe(true);
    expect(onPauseVideo).toHaveBeenCalledOnce();
  });

  it("re-enables swipe on genai:chatClosed without auto-advance when identifier is not swipe-to-next", () => {
    render();
    act(() => {
      testBus.emit("genai:dataFetching", {});
    });
    act(() => {
      testBus.emit("genai:chatClosed", { identifier: "other" });
    });
    expect(captured.swipeDisabled).toBe(false);
    expect(captured.status).toBe("none");
    act(() => {
      vi.advanceTimersByTime(6000);
    });
    expect(onAutoAdvance).not.toHaveBeenCalled();
  });

  it('calls onAutoAdvance after 5000ms when chatClosed identifier is "swipe-to-next"', () => {
    render();
    act(() => {
      testBus.emit("genai:dataFetching", {});
    });
    act(() => {
      testBus.emit("genai:chatClosed", { identifier: "swipe-to-next" });
    });
    expect(captured.swipeDisabled).toBe(false);
    expect(onAutoAdvance).not.toHaveBeenCalled();
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(onAutoAdvance).toHaveBeenCalledOnce();
  });

  it("does not call onAutoAdvance before 5000ms for swipe-to-next", () => {
    render();
    act(() => {
      testBus.emit("genai:chatClosed", { identifier: "swipe-to-next" });
    });
    act(() => {
      vi.advanceTimersByTime(4999);
    });
    expect(onAutoAdvance).not.toHaveBeenCalled();
  });

  it("does not react to events when isActiveReel=false", () => {
    render(false);
    act(() => {
      testBus.emit("genai:dataFetching", {});
    });
    expect(captured.swipeDisabled).toBe(false);
    expect(captured.status).toBe("none");
  });

  it("cleans up event listeners on unmount", () => {
    render();
    act(() => root.unmount());
    // After unmount, events should not update captured
    const prevStatus = captured.status;
    act(() => {
      testBus.emit("genai:dataFetching", {});
    });
    expect(captured.status).toBe(prevStatus);
    // Re-init for afterEach
    root = createRoot(container);
  });
});
