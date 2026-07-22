/**
 * Tests for useMutePassbackGuard — verifies the mute-passback timer arms on
 * the first `player:play`, fires `onAdFail` only if still muted and no ad has
 * filled, is suppressed by a prior `ad:fill`, and does not re-arm on a second
 * `player:play`.
 *
 * Mounted with raw react-dom (no @testing-library/react, matching repo
 * convention) via a throwaway harness component. All four dependencies
 * (useStrategy, usePlayer, useAdWaterfall, useEventBus) are mocked directly so
 * the hook is exercised in isolation from the real providers.
 */
import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const useStrategyMock = vi.fn();
vi.mock("@cxr/strategies/StrategyProvider", () => ({
  useStrategy: () => useStrategyMock(),
}));

const usePlayerMock = vi.fn();
vi.mock("@cxr/providers/PlayerProvider", () => ({
  usePlayer: () => usePlayerMock(),
}));

const onAdFailMock = vi.fn();
vi.mock("@cxr/providers/AdProvider", () => ({
  useAdWaterfall: () => ({ onAdSuccess: vi.fn(), onAdFail: onAdFailMock }),
}));

// A controllable bus: handlers are stored so tests can fire events directly.
const busHandlers = new Map<string, Set<() => void>>();
const busOn = vi.fn((event: string, handler: () => void) => {
  if (!busHandlers.has(event)) busHandlers.set(event, new Set());
  busHandlers.get(event)!.add(handler);
  return () => busHandlers.get(event)?.delete(handler);
});
function fireBus(event: string): void {
  busHandlers.get(event)?.forEach((h) => h());
}
vi.mock("@cxr/instance/InstanceContext", () => ({
  useEventBus: () => ({ on: busOn, emit: vi.fn() }),
}));

vi.mock("@cxr/utils/ads", () => ({
  isAdVerificationCrawler: vi.fn(() => false),
}));

import { useMutePassbackGuard } from "@cxr/strategies/useMutePassbackGuard";
import { isAdVerificationCrawler } from "@cxr/utils/ads";

let container: HTMLDivElement;
let root: Root;

/** Mounts a throwaway harness component that just calls the hook. */
function setup(): void {
  function Harness(): React.JSX.Element {
    useMutePassbackGuard();
    return React.createElement("span");
  }
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
  act(() => {
    root.render(React.createElement(Harness));
  });
}

describe("useMutePassbackGuard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    busHandlers.clear();
    vi.useRealTimers();
    useStrategyMock.mockReturnValue({ mutePassback: false, mutePassbackDelayMs: 1000 });
    usePlayerMock.mockReturnValue({ isMuted: true });
    vi.mocked(isAdVerificationCrawler).mockReturnValue(false);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
    vi.useRealTimers();
  });

  it("does not arm the timer when mutePassback is disabled", () => {
    vi.useFakeTimers();
    useStrategyMock.mockReturnValue({ mutePassback: false, mutePassbackDelayMs: 1000 });
    setup();

    act(() => fireBus("player:play"));
    act(() => vi.advanceTimersByTime(2000));

    expect(onAdFailMock).not.toHaveBeenCalled();
  });

  it("fires onAdFail after the delay when still muted on first play", () => {
    useStrategyMock.mockReturnValue({ mutePassback: true, mutePassbackDelayMs: 1000 });
    usePlayerMock.mockReturnValue({ isMuted: true });
    setup();

    vi.useFakeTimers();
    act(() => fireBus("player:play"));
    act(() => vi.advanceTimersByTime(1000));

    expect(onAdFailMock).toHaveBeenCalledTimes(1);
  });

  it("does NOT fire if ad:fill happens before the timer elapses", () => {
    useStrategyMock.mockReturnValue({ mutePassback: true, mutePassbackDelayMs: 1000 });
    usePlayerMock.mockReturnValue({ isMuted: true });
    setup();

    vi.useFakeTimers();
    act(() => fireBus("player:play"));
    act(() => fireBus("ad:fill"));
    act(() => vi.advanceTimersByTime(1000));

    expect(onAdFailMock).not.toHaveBeenCalled();
  });

  it("does not re-arm on a second player:play", () => {
    useStrategyMock.mockReturnValue({ mutePassback: true, mutePassbackDelayMs: 1000 });
    usePlayerMock.mockReturnValue({ isMuted: true });
    setup();

    vi.useFakeTimers();
    act(() => fireBus("player:play"));
    act(() => fireBus("player:play"));
    act(() => vi.advanceTimersByTime(1000));

    expect(onAdFailMock).toHaveBeenCalledTimes(1);
  });
});
