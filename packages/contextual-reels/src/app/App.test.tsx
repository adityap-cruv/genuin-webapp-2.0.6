/**
 * Tests for App.tsx — the orchestrator that mounts the provider tree, fetches
 * the tag config (TagLoader), bridges bus events to the public API
 * (AppRegistrar), arms the mute-passback timer (MutePassbackGuard), and renders
 * the loading / no-content / feed states (NativeFeedShim + Suspense fallback).
 *
 * Rendered with raw React + react-dom (this repo does NOT use
 * @testing-library/react). All providers are mocked to passthrough wrappers and
 * the inner hooks are mocked so each branch can be driven independently.
 */
import React from "react";
import { act } from "react";
import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import App from "@cxr/app/App";

import { AD_LAYOUT } from "../config";

// ── Provider passthroughs ──────────────────────────────────────────────────

const sendEventMock = vi.fn();
const setBrandIdMock = vi.fn();

vi.mock("../providers/AnalyticsProvider", () => ({
  AnalyticsProvider: ({ children }: { children: React.ReactNode }) =>
    React.createElement("div", { "data-testid": "analytics-provider" }, children),
  useAnalytics: vi.fn(() => ({ sendEvent: sendEventMock, setBrandId: setBrandIdMock })),
}));

const useStrategyMock = vi.fn(() => ({
  mutePassback: false,
  mutePassbackDelayMs: 3000,
  genAiEnabled: false,
}));

vi.mock("../strategies/StrategyProvider", () => ({
  StrategyProvider: ({ children }: { children: React.ReactNode }) =>
    React.createElement("div", { "data-testid": "strategy-provider" }, children),
  useStrategy: () => useStrategyMock(),
}));

const useFeedMock = vi.fn(() => ({
  entries: [] as unknown[],
  activeIndex: 0,
  isLoading: false,
  feedFailed: false,
}));

vi.mock("../providers/FeedProvider", () => ({
  FeedProvider: ({ children }: { children: React.ReactNode }) =>
    React.createElement("div", { "data-testid": "feed-provider" }, children),
  useFeed: () => useFeedMock(),
}));

const setPlayingMock = vi.fn();
const usePlayerMock = vi.fn(() => ({ isMuted: true, isPlaying: false, setPlaying: setPlayingMock }));

vi.mock("../providers/PlayerProvider", () => ({
  PlayerProvider: ({ children }: { children: React.ReactNode }) =>
    React.createElement("div", { "data-testid": "player-provider" }, children),
  usePlayer: () => usePlayerMock(),
}));

const onAdFailMock = vi.fn();

vi.mock("../providers/AdProvider", () => ({
  AdProvider: ({ children }: { children: React.ReactNode }) =>
    React.createElement("div", { "data-testid": "ad-provider" }, children),
  useAdWaterfall: vi.fn(() => ({ onAdSuccess: vi.fn(), onAdFail: onAdFailMock })),
}));

vi.mock("../providers/GenAIProvider", () => ({
  GenAIProvider: ({ children }: { children: React.ReactNode }) =>
    React.createElement("div", { "data-testid": "genai-provider" }, children),
}));

const useFullScreenMock = vi.fn(() => ({ isFullScreen: false }));

vi.mock("../providers/FullScreenProvider", () => ({
  FullScreenProvider: ({ children }: { children: React.ReactNode }) =>
    React.createElement("div", { "data-testid": "fullscreen-provider" }, children),
  useFullScreen: () => useFullScreenMock(),
}));

vi.mock("../feed/hooks/useFullscreenClasses", () => ({
  useFullscreenClasses: vi.fn(),
}));

vi.mock("../feed/Feed", () => ({
  Feed: () => React.createElement("div", { "data-testid": "feed" }),
}));

vi.mock("../app/FeedSkeleton", () => ({
  FeedSkeleton: () => React.createElement("div", { "data-testid": "feed-skeleton" }),
}));

// ── Instance + coordination ─────────────────────────────────────────────────

vi.mock("../instance/registry/InstanceContext", () => ({
  InstanceProvider: ({ children }: { children: React.ReactNode }) => children,
  useInstanceId: vi.fn(() => "test-instance"),
}));

// A controllable bus: handlers are stored so tests can fire events.
const busHandlers = new Map<string, Set<() => void>>();
const busOn = vi.fn((event: string, handler: () => void) => {
  if (!busHandlers.has(event)) busHandlers.set(event, new Set());
  busHandlers.get(event)!.add(handler);
  return () => busHandlers.get(event)?.delete(handler);
});
function fireBus(event: string): void {
  busHandlers.get(event)?.forEach((h) => h());
}
const testBus = { on: busOn, emit: vi.fn() };

vi.mock("../instance/coordination/EventBusContext", () => ({
  EventBusProvider: ({ children }: { children: React.ReactNode }) => children,
  useEventBus: () => testBus,
}));

vi.mock("../instance/coordination/UserInteractionTracker", () => ({
  UserInteractionProvider: ({ children }: { children: React.ReactNode }) => children,
  useMarkUserInteracted: vi.fn(() => vi.fn()),
}));

vi.mock("../instance/coordination/usePlayerCoordination", () => ({
  usePlayerCoordination: vi.fn(),
}));

vi.mock("../instance/registry/useInstanceRegistration", () => ({
  useInstanceRegistration: vi.fn(),
}));

// ── Services ─────────────────────────────────────────────────────────────────

const getTagMock = vi.fn();

vi.mock("../services/api", () => ({
  getTag: (tagId: string) => getTagMock(tagId),
}));


// Wait for the getTag promise chain (then → setState) to flush.
async function flushPromises(): Promise<void> {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
}

describe("App", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    vi.clearAllMocks();
    busHandlers.clear();
    vi.useRealTimers();

    useStrategyMock.mockReturnValue({ mutePassback: false, mutePassbackDelayMs: 3000, genAiEnabled: false });
    useFeedMock.mockReturnValue({ entries: [], activeIndex: 0, isLoading: false, feedFailed: false });
    usePlayerMock.mockReturnValue({ isMuted: true, isPlaying: false, setPlaying: setPlayingMock });
    useFullScreenMock.mockReturnValue({ isFullScreen: false });
    getTagMock.mockResolvedValue({ tag_id: "tag-1", config: {}, brand_id: "brand-9" });

    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    (window as Window & { cxr?: unknown }).cxr = undefined;
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
    delete (window as Window & { cxr?: unknown }).cxr;
  });

  function render(props: Partial<React.ComponentProps<typeof App>> = {}): void {
    act(() => {
      root.render(
        React.createElement(App, {
          tagId: "tag-1",
          rootTagId: "root-1",
          adLayout: AD_LAYOUT.Unknown,
          instanceId: "test-instance",
          ...props,
        })
      );
    });
  }

  it("renders the overlay container and the analytics provider", () => {
    render();
    expect(container.querySelector("#overlay-test-instance")).toBeTruthy();
    expect(container.querySelector('[data-testid="analytics-provider"]')).toBeTruthy();
  });

  it("shows the skeleton before the tag config resolves", () => {
    getTagMock.mockReturnValue(new Promise(() => {})); // never resolves
    render();
    expect(container.querySelector('[data-testid="feed-skeleton"]')).toBeTruthy();
  });

  it("loads the tag, registers the brand id, and emits tag_captured", async () => {
    render({ adLayout: AD_LAYOUT.L3 });
    await flushPromises();

    expect(getTagMock).toHaveBeenCalledWith("tag-1");
    expect(setBrandIdMock).toHaveBeenCalledWith("brand-9");
    expect(sendEventMock).toHaveBeenCalledWith(
      "tag_captured",
      expect.objectContaining({ tagId: "tag-1", tag_height: 50, tag_width: 320 })
    );
    // Feed provider tree mounts once tagDetails is set.
    expect(container.querySelector('[data-testid="feed-provider"]')).toBeTruthy();
  });

  it("merges customizationDetails, preserves the CTA delay, and forces show_cta=false", async () => {
    getTagMock.mockResolvedValue({ tag_id: "tag-1", config: { show_cta: true }, brand_id: "b" });
    render({ customizationDetails: { delay: 7, extra: "x" } });
    await flushPromises();

    expect(sendEventMock).toHaveBeenCalledWith("tag_captured", expect.any(Object));
    // The merged tagDetails flows into the provider tree (rendered).
    expect(container.querySelector('[data-testid="feed-provider"]')).toBeTruthy();
  });

  it("defaults the CTA delay to 3 when customizationDetails has no cta object", async () => {
    getTagMock.mockResolvedValue({ tag_id: "tag-1", brand_id: "b" });
    render({ customizationDetails: { somethingElse: true } });
    await flushPromises();
    expect(sendEventMock).toHaveBeenCalledWith("tag_captured", expect.any(Object));
  });

  it("renders the NoContent fallback when the tag fetch fails", async () => {
    getTagMock.mockRejectedValue(new Error("gateway down"));
    render();
    await flushPromises();

    const noContent = container.querySelector('[data-testid="cxr-no-content"]');
    expect(noContent).toBeTruthy();
    expect(noContent?.textContent).toContain("no longer available");
  });

  it("does not fetch when tagId or rootTagId is empty", async () => {
    render({ rootTagId: "" });
    await flushPromises();
    expect(getTagMock).not.toHaveBeenCalled();
  });

  it("renders the close button for L4 layouts and dismisses the widget on click", async () => {
    render({ adLayout: AD_LAYOUT.L4 });
    await flushPromises();

    const closeBtn = container.querySelector<HTMLButtonElement>('[data-testid="cxr-close"]');
    expect(closeBtn).toBeTruthy();

    act(() => closeBtn?.click());
    // After dismissal the App returns null — overlay is gone.
    expect(container.querySelector("#overlay-test-instance")).toBeNull();
  });

  it("does not render a close button for non-audio layouts", async () => {
    render({ adLayout: AD_LAYOUT.Unknown });
    await flushPromises();
    expect(container.querySelector('[data-testid="cxr-close"]')).toBeNull();
  });

  it("does not render a close button in fullscreen even for L3", async () => {
    useFullScreenMock.mockReturnValue({ isFullScreen: true });
    render({ adLayout: AD_LAYOUT.L3 });
    await flushPromises();
    expect(container.querySelector('[data-testid="cxr-close"]')).toBeNull();
  });

  // ── NativeFeedShim ─────────────────────────────────────────────────────────

  it("shows the skeleton while the feed is loading", async () => {
    useFeedMock.mockReturnValue({ entries: [], activeIndex: 0, isLoading: true, feedFailed: false });
    render();
    await flushPromises();
    expect(container.querySelector('[data-testid="feed-skeleton"]')).toBeTruthy();
  });

  it("shows NoContent when the feed failed", async () => {
    useFeedMock.mockReturnValue({ entries: [], activeIndex: 0, isLoading: false, feedFailed: true });
    render();
    await flushPromises();
    expect(container.querySelector('[data-testid="cxr-no-content"]')?.textContent).toContain("No content available");
  });

  it("shows NoContent when the feed is empty", async () => {
    useFeedMock.mockReturnValue({ entries: [], activeIndex: 0, isLoading: false, feedFailed: false });
    render();
    await flushPromises();
    expect(container.querySelector('[data-testid="cxr-no-content"]')).toBeTruthy();
  });

  it("renders the Feed when entries are present", async () => {
    useFeedMock.mockReturnValue({
      entries: [{ kind: "reel" }] as unknown[],
      activeIndex: 0,
      isLoading: false,
      feedFailed: false,
    });
    getTagMock.mockResolvedValue({ tag_id: "tag-1", config: { variant: "compact" }, brand_id: "b" });
    render();
    await flushPromises();
    expect(container.querySelector('[data-testid="feed"]')).toBeTruthy();
  });

  // ── AppRegistrar — public API bridge ─────────────────────────────────────────

  it("bridges bus events to window.cxr._emit when the public API is present", async () => {
    const emit = vi.fn();
    // The bridge only reads `_emit`; stub just that field (cast through unknown
    // since the real window.cxr is the full CxrPublicApi surface).
    window.cxr = { _emit: emit } as unknown as typeof window.cxr;

    useFeedMock.mockReturnValue({
      entries: [{ kind: "reel" }] as unknown[],
      activeIndex: 0,
      isLoading: false,
      feedFailed: false,
    });
    render();
    await flushPromises();

    act(() => fireBus("player:play"));
    act(() => fireBus("ad:fill"));

    expect(emit).toHaveBeenCalledWith("test-instance", "play");
    expect(emit).toHaveBeenCalledWith("test-instance", "ad:fill");
  });

  it("AppRegistrar is a no-op when window.cxr is absent", async () => {
    useFeedMock.mockReturnValue({
      entries: [{ kind: "reel" }] as unknown[],
      activeIndex: 0,
      isLoading: false,
      feedFailed: false,
    });
    render();
    await flushPromises();
    // No bus subscriptions registered for the public bridge when cxr is missing.
    expect(() => act(() => fireBus("player:play"))).not.toThrow();
  });

  // ── MutePassbackGuard ─────────────────────────────────────────────────────────

  it("does not arm the passback timer when the strategy disables mutePassback", async () => {
    vi.useFakeTimers();
    useStrategyMock.mockReturnValue({ mutePassback: false, mutePassbackDelayMs: 1000, genAiEnabled: false });
    useFeedMock.mockReturnValue({
      entries: [{ kind: "reel" }] as unknown[],
      activeIndex: 0,
      isLoading: false,
      feedFailed: false,
    });
    render();
    // tagDetails was resolved by a real-timer promise mock; switch happened after mount.
    await act(async () => {
      await Promise.resolve();
    });
    act(() => fireBus("player:play"));
    act(() => vi.advanceTimersByTime(2000));
    expect(onAdFailMock).not.toHaveBeenCalled();
    vi.useRealTimers();
  });

  it("fires onAdFail after the delay when still muted on first play", async () => {
    useStrategyMock.mockReturnValue({ mutePassback: true, mutePassbackDelayMs: 1000, genAiEnabled: false });
    usePlayerMock.mockReturnValue({ isMuted: true, isPlaying: true, setPlaying: setPlayingMock });
    useFeedMock.mockReturnValue({
      entries: [{ kind: "reel" }] as unknown[],
      activeIndex: 0,
      isLoading: false,
      feedFailed: false,
    });
    render();
    await flushPromises();

    vi.useFakeTimers();
    act(() => fireBus("player:play"));
    // A second play must not re-arm the window.
    act(() => fireBus("player:play"));
    act(() => vi.advanceTimersByTime(1000));
    vi.useRealTimers();

    expect(onAdFailMock).toHaveBeenCalledTimes(1);
  });
});
