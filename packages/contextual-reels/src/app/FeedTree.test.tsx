/**
 * Tests for FeedTree.tsx — the provider stack + fullscreen overlay that
 * mounts once TagDetailsGate lets the tag config through, and NativeFeedShim
 * (renders skeleton/NoContent/Feed, bridges bus events to the public API,
 * arms the mute-passback timer as side effects).
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

import FeedTree from "@cxr/app/FeedTree";

import { AD_LAYOUT, type AdLayoutId } from "../config";

// ── Provider passthroughs ──────────────────────────────────────────────────

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

const useTagDetailsMock = vi.fn(() => ({
  tagDetails: { tag_id: "tag-1", config: {}, brand_id: "brand-9" } as Record<string, unknown> | undefined,
  apiFailed: false,
  tagId: "tag-1",
  brandId: undefined as number | undefined,
  adLayout: AD_LAYOUT.Unknown as AdLayoutId,
}));

vi.mock("../providers/TagDetailsProvider", () => ({
  useTagDetails: () => useTagDetailsMock(),
}));

const sendEventMock = vi.fn();
const useAnalyticsMock = vi.fn(() => ({ sendEvent: sendEventMock }));

vi.mock("../providers/AnalyticsProvider", () => ({
  useAnalytics: () => useAnalyticsMock(),
}));

const feedProps: Array<Record<string, unknown>> = [];
vi.mock("../feed/Feed", () => ({
  Feed: (props: Record<string, unknown>) => {
    feedProps.push(props);
    return React.createElement("div", { "data-testid": "feed" });
  },
}));

vi.mock("../app/FeedSkeleton", () => ({
  FeedSkeleton: () => React.createElement("div", { "data-testid": "feed-skeleton" }),
}));

// ── Instance + coordination ─────────────────────────────────────────────────

// A controllable bus: handlers are stored so tests can fire events.
const busHandlers = new Map<string, Set<() => void>>();
const busOn = vi.fn((event: string, handler: () => void) => {
  if (!busHandlers.has(event)) busHandlers.set(event, new Set());
  busHandlers.get(event)!.add(handler);
  return () => busHandlers.get(event)?.delete(handler);
});
const testBus = { on: busOn, emit: vi.fn() };

vi.mock("../instance/InstanceContext", () => ({
  useInstanceId: vi.fn(() => "test-instance"),
  useEventBus: () => testBus,
  useMarkUserInteracted: vi.fn(() => vi.fn()),
}));

vi.mock("../instance/coordination/usePlayerCoordination", () => ({
  usePlayerCoordination: vi.fn(),
}));

vi.mock("../instance/coordination/usePublicApiBridge", () => ({
  usePublicApiBridge: vi.fn(),
}));

vi.mock("../instance/registry/useInstanceRegistration", () => ({
  useInstanceRegistration: vi.fn(),
}));

vi.mock("../strategies/useMutePassbackGuard", () => ({
  useMutePassbackGuard: vi.fn(),
}));

// Mocked wholesale (rather than mocking its IntersectionObserver/AdProvider
// dependencies) — its own state machine is covered by
// app/useFeedVisibilityGate.test.ts; this file only checks that FeedTree
// respects `shouldRender`.
const useFeedVisibilityGateMock = vi.fn(() => ({ shouldRender: true, overlayRef: vi.fn() }));
vi.mock("../app/useFeedVisibilityGate", () => ({
  useFeedVisibilityGate: () => useFeedVisibilityGateMock(),
}));

const getSnapshotMock = vi.fn(() => null);
vi.mock("@cxr/monitoring/useResourceMonitor", () => ({
  useResourceMonitor: vi.fn(() => ({ getSnapshot: getSnapshotMock })),
}));

const useHeavyAdReporterMock = vi.fn();
vi.mock("@cxr/monitoring/useHeavyAdReporter", () => ({
  useHeavyAdReporter: (...args: unknown[]) => useHeavyAdReporterMock(...args),
}));

// Flushes any pending promise-chain microtasks (mirrors the previous getTag
// then/catch → setState flush; kept so downstream state updates settle, and
// so the lazy-loaded Feed chunk resolves).
async function flushPromises(): Promise<void> {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
}

describe("FeedTree", () => {
  let container: HTMLDivElement;
  let root: Root;
  const onDismiss = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    busHandlers.clear();
    feedProps.length = 0;
    vi.useRealTimers();

    useStrategyMock.mockReturnValue({ mutePassback: false, mutePassbackDelayMs: 3000, genAiEnabled: false });
    useFeedVisibilityGateMock.mockReturnValue({ shouldRender: true, overlayRef: vi.fn() });
    useFeedMock.mockReturnValue({ entries: [], activeIndex: 0, isLoading: false, feedFailed: false });
    usePlayerMock.mockReturnValue({ isMuted: true, isPlaying: false, setPlaying: setPlayingMock });
    useFullScreenMock.mockReturnValue({ isFullScreen: false });
    useTagDetailsMock.mockReturnValue({
      tagDetails: { tag_id: "tag-1", config: {}, brand_id: "brand-9" },
      apiFailed: false,
      tagId: "tag-1",
      brandId: undefined,
      adLayout: AD_LAYOUT.Unknown,
    });

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

  function render(props: Partial<React.ComponentProps<typeof FeedTree>> = {}): void {
    act(() => {
      root.render(React.createElement(FeedTree, { onDismiss, dataGiv: null, ...props }));
    });
  }

  it("renders the overlay container", async () => {
    render();
    await flushPromises();
    expect(container.querySelector("#overlay-test-instance")).toBeTruthy();
  });

  it("shows the skeleton while the feed is loading", async () => {
    useFeedMock.mockReturnValue({ entries: [], activeIndex: 0, isLoading: true, feedFailed: false });
    render();
    await flushPromises();
    expect(container.querySelector('[data-testid="feed-skeleton"]')).toBeTruthy();
  });

  it("shows the skeleton (not Feed) when the visibility gate is holding render, even with entries loaded", async () => {
    useFeedVisibilityGateMock.mockReturnValue({ shouldRender: false, overlayRef: vi.fn() });
    useFeedMock.mockReturnValue({
      entries: [{ kind: "reel" }] as unknown[],
      activeIndex: 0,
      isLoading: false,
      feedFailed: false,
    });
    render();
    await flushPromises();
    expect(container.querySelector('[data-testid="feed-skeleton"]')).toBeTruthy();
    expect(container.querySelector('[data-testid="feed"]')).toBeFalsy();
    expect(container.querySelector('[data-testid="cxr-no-content"]')).toBeFalsy();
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
    useTagDetailsMock.mockReturnValue({
      tagDetails: { tag_id: "tag-1", config: { variant: "compact" }, brand_id: "b" },
      apiFailed: false,
      tagId: "tag-1",
      brandId: undefined,
      adLayout: AD_LAYOUT.Unknown,
    });
    render();
    await flushPromises();
    expect(container.querySelector('[data-testid="feed"]')).toBeTruthy();
  });

  it("falls back to the 'default' variant when tagDetails has no config.variant", async () => {
    useFeedMock.mockReturnValue({
      entries: [{ kind: "reel" }] as unknown[],
      activeIndex: 0,
      isLoading: false,
      feedFailed: false,
    });
    useTagDetailsMock.mockReturnValue({
      tagDetails: { tag_id: "tag-1", config: {}, brand_id: "b" },
      apiFailed: false,
      tagId: "tag-1",
      brandId: undefined,
      adLayout: AD_LAYOUT.Unknown,
    });
    render();
    await flushPromises();
    expect(feedProps[feedProps.length - 1]?.variant).toBe("default");
  });

  // The close button is currently disabled unconditionally in NativeFeedShim
  // (`showCloseButton = false`) while the Infolinks stacked layout owns the
  // close affordance — the former layout-gated logic is preserved in a comment
  // there for future re-enable. These tests pin the current "never mounted"
  // behavior across every layout so a re-enable is a deliberate, test-breaking
  // change rather than a silent one.
  it("does not render a close button for L4 layouts (close button disabled)", async () => {
    useTagDetailsMock.mockReturnValue({
      tagDetails: { tag_id: "tag-1", config: {}, brand_id: "brand-9" },
      apiFailed: false,
      tagId: "tag-1",
      brandId: undefined,
      adLayout: AD_LAYOUT.L4,
    });
    render();
    await flushPromises();
    expect(container.querySelector('[data-testid="cxr-close"]')).toBeNull();
  });

  it("does not render a close button for non-audio layouts", async () => {
    render();
    await flushPromises();
    expect(container.querySelector('[data-testid="cxr-close"]')).toBeNull();
  });

  it("does not render a close button in fullscreen even for L3", async () => {
    useFullScreenMock.mockReturnValue({ isFullScreen: true });
    useTagDetailsMock.mockReturnValue({
      tagDetails: { tag_id: "tag-1", config: {}, brand_id: "brand-9" },
      apiFailed: false,
      tagId: "tag-1",
      brandId: undefined,
      adLayout: AD_LAYOUT.L3,
    });
    render();
    await flushPromises();
    expect(container.querySelector('[data-testid="cxr-close"]')).toBeNull();
  });

  it("mounts useHeavyAdReporter with sendEvent, emit, getSnapshot, and getContext", async () => {
    render();
    await flushPromises();

    expect(useHeavyAdReporterMock).toHaveBeenCalledWith(
      expect.objectContaining({
        sendEvent: sendEventMock,
        emit: expect.any(Function),
        getSnapshot: getSnapshotMock,
        getContext: expect.any(Function),
      })
    );
  });

  it("the emit dep forwards to the per-instance bus", async () => {
    render();
    await flushPromises();

    const call = useHeavyAdReporterMock.mock.calls.at(-1)?.[0] as {
      emit: (event: string, payload: Record<string, unknown>) => void;
    };
    const payload = { reason: "budget-exceeded-inferred" };
    call.emit("ad:removed", payload);

    expect(testBus.emit).toHaveBeenCalledWith("ad:removed", payload);
  });

  it("getContext reflects the active feed entry and player/tag state", async () => {
    useFeedMock.mockReturnValue({
      entries: [{ kind: "ad", data: { id: 7 } }] as unknown[],
      activeIndex: 0,
      isLoading: false,
      feedFailed: false,
    });
    usePlayerMock.mockReturnValue({ isMuted: false, isPlaying: false, setPlaying: setPlayingMock });

    render();
    await flushPromises();

    const call = useHeavyAdReporterMock.mock.calls.at(-1)?.[0] as { getContext: () => Record<string, unknown> };
    const context = call.getContext();
    expect(context).toMatchObject({
      tagId: "tag-1",
      instanceId: "test-instance",
      activeIndex: 0,
      activeReelId: 7,
      adSource: "ad",
      isMuted: false,
    });
  });
});
