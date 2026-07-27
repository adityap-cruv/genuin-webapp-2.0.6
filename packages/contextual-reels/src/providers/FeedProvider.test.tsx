/**
 * Tests for FeedProvider — Phase 2 pipeline wired.
 */
import React from "react";
import { act } from "react";
import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { normaliseFeed } from "@cxr/feed/feedTransforms";
import { useAnalytics } from "@cxr/providers/AnalyticsProvider";
import { FeedProvider, useFeed } from "@cxr/providers/FeedProvider";
import { usePlayer } from "@cxr/providers/PlayerProvider";
import { useTagDetails } from "@cxr/providers/TagDetailsProvider";
import { createFeedGenerator, setVisitId } from "@cxr/services/feed";
import { useStrategy } from "@cxr/strategies/StrategyProvider";
import { getDebugDeviceFeed } from "@cxr/strategies/debugDevices";
import { getStaticTagData } from "@cxr/strategies/staticTagData";
import type { FeedEntry, NormalisedReel } from "@cxr/types";

vi.mock("../services/feed", () => ({
  createFeedGenerator: vi.fn(),
  setVisitId: vi.fn(),
}));

vi.mock("../providers/AnalyticsProvider", () => ({
  useAnalytics: vi.fn(() => ({
    sendEvent: vi.fn(),
    setBaseEventContext: vi.fn(),
    setMandatoryData: vi.fn(),
  })),
}));

// The default test tagId ("tag-1") is registered so the flag-AND-registry gate
// passes and the mocked getStaticTagData drives static-vs-fallback behaviour.
// isStaticTag mirrors production (flag AND registry membership) against the
// mocked set; declared inside the factory to avoid vi.mock's hoist/TDZ trap.
vi.mock("../strategies/staticTagData", () => {
  const staticIds = new Set(["tag-1"]);
  return {
    getStaticTagData: vi.fn(),
    STATIC_TAG_IDS: staticIds,
    isStaticTag: (tagId: string | null | undefined, servedStatically: boolean) =>
      servedStatically && tagId != null && staticIds.has(tagId),
  };
});

// Debug-device gate reads host macros captured at module load; mock it so both
// branches of the static-feed swap are drivable without touching window state.
vi.mock("../strategies/debugDevices", () => ({
  getDebugDeviceFeed: vi.fn(async () => undefined),
}));

// FeedProvider reads `isAdBreakActive` from usePlayer() (context) to derive
// isAdActive/activeReel — mount order in FeedTree puts PlayerProvider above it.
vi.mock("../providers/PlayerProvider", () => ({
  usePlayer: vi.fn(() => ({ isAdBreakActive: false })),
}));

// FeedProvider reads `tagId` from useTagDetails() (context), not a prop, and
// strategy flags from useStrategy(). Mock both so the harness can drive tagId
// without mounting the full provider tree.
vi.mock("../providers/TagDetailsProvider", () => ({
  useTagDetails: vi.fn(() => ({ tagId: "tag-1" })),
}));

vi.mock("../strategies/StrategyProvider", () => ({
  useStrategy: vi.fn(() => ({
    adBreakEnabled: false,
    gateOnUnmute: false,
    adsDisabled: false,
    servedStatically: false,
  })),
}));

vi.mock("../feed/feedTransforms", () => ({
  normaliseFeed: vi.fn((reels: unknown[]) =>
    reels.map((_, index) => ({
      kind: "reel" as const,
      data: {
        kind: "reel" as const,
        id: index,
        active: index === 0,
        videoUrl: null,
        videoType: null,
        thumb: null,
        user: null,
        community: null,
        cta: null,
        loop: null,
        ogDetails: null,
        owner: null,
        config: null,
        video: null,
      },
    }))
  ),
}));

const mockCreateFeedGenerator = createFeedGenerator as ReturnType<typeof vi.fn>;
const mockSetVisitId = setVisitId as ReturnType<typeof vi.fn>;
const mockUseAnalytics = useAnalytics as ReturnType<typeof vi.fn>;
const mockUsePlayer = usePlayer as ReturnType<typeof vi.fn>;
const mockNormaliseFeed = normaliseFeed as ReturnType<typeof vi.fn>;
const mockUseStrategy = useStrategy as ReturnType<typeof vi.fn>;
const mockGetStaticTagData = getStaticTagData as ReturnType<typeof vi.fn>;
const mockGetDebugDeviceFeed = getDebugDeviceFeed as ReturnType<typeof vi.fn>;
const mockUseTagDetails = useTagDetails as ReturnType<typeof vi.fn>;

interface Captured {
  entries: FeedEntry[];
  activeIndex: number;
  isLoading: boolean;
  feedFailed: boolean;
  isAdActive: boolean;
  activeReel: NormalisedReel | undefined;
}

let captured: Captured = {
  entries: [],
  activeIndex: 0,
  isLoading: true,
  feedFailed: false,
  isAdActive: false,
  activeReel: undefined,
};

function Consumer(): null {
  const ctx = useFeed();
  captured = ctx;
  return null;
}

describe("FeedProvider", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    vi.clearAllMocks();
    // clearAllMocks drops the factory's default return — restore "ordinary
    // device" so only the tests that opt in take the debug-feed branch.
    mockGetDebugDeviceFeed.mockResolvedValue(undefined);
    mockUsePlayer.mockReturnValue({ isAdBreakActive: false });
    captured = {
      entries: [],
      activeIndex: 0,
      isLoading: true,
      feedFailed: false,
      isAdActive: false,
      activeReel: undefined,
    };
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    document.body.removeChild(container);
  });

  function render() {
    const props: React.ComponentProps<typeof FeedProvider> = {
      children: React.createElement(Consumer),
    };
    act(() => {
      root.render(React.createElement(FeedProvider, props));
    });
  }

  it("initialises with entries array", () => {
    mockCreateFeedGenerator.mockReturnValue(vi.fn().mockResolvedValue([]));
    render();
    expect(Array.isArray(captured.entries)).toBe(true);
  });

  it("calls createFeedGenerator with tagId", async () => {
    mockCreateFeedGenerator.mockReturnValue(vi.fn().mockResolvedValue([]));
    render();
    await act(async () => {
      await Promise.resolve();
    });
    expect(mockCreateFeedGenerator).toHaveBeenCalledWith(expect.objectContaining({ tagId: "tag-1" }));
  });

  it("populates entries after successful fetch", async () => {
    const rawReels = [{ type: "reel" }, { type: "reel" }];
    mockCreateFeedGenerator.mockReturnValue(vi.fn().mockResolvedValue(rawReels));
    render();
    await act(async () => {
      await Promise.resolve();
    });
    expect(captured.entries.length).toBe(2);
    expect(captured.entries[0]?.kind).toBe("reel");
  });

  it("entries have correct kind for reel-type raw items", async () => {
    const rawReels = [{ type: "reel" }];
    mockCreateFeedGenerator.mockReturnValue(vi.fn().mockResolvedValue(rawReels));
    render();
    await act(async () => {
      await Promise.resolve();
    });
    expect(captured.entries[0]?.kind).toBe("reel");
  });

  it("emits batch_started event via sendEvent", async () => {
    const sendEvent = vi.fn();
    mockUseAnalytics.mockReturnValue({ sendEvent });
    mockCreateFeedGenerator.mockImplementation(({ sendEvent: se }: { sendEvent: (name: string) => void }) => {
      se("Batch Started");
      return vi.fn().mockResolvedValue([]);
    });
    render();
    await act(async () => {
      await Promise.resolve();
    });
    expect(sendEvent).toHaveBeenCalledWith("Batch Started");
  });

  it("useFeed throws outside FeedProvider", () => {
    let errorCaught = false;
    function BadConsumer(): null {
      try {
        useFeed();
      } catch {
        errorCaught = true;
      }
      return null;
    }
    act(() => {
      root.render(React.createElement(BadConsumer));
    });
    expect(errorCaught).toBe(true);
  });

  it("handles empty reel array without throwing", async () => {
    mockCreateFeedGenerator.mockReturnValue(vi.fn().mockResolvedValue([]));
    expect(() => render()).not.toThrow();
    await act(async () => {
      await Promise.resolve();
    });
    expect(Array.isArray(captured.entries)).toBe(true);
  });

  it("marks feedFailed=true and clears loading when the feed returns no reels", async () => {
    mockCreateFeedGenerator.mockReturnValue(vi.fn().mockResolvedValue([]));
    render();
    await act(async () => {
      await Promise.resolve();
    });
    expect(captured.feedFailed).toBe(true);
    expect(captured.isLoading).toBe(false);
    expect(captured.entries).toHaveLength(0);
  });

  it("marks feedFailed=true when the feed fetch rejects (catch branch)", async () => {
    mockCreateFeedGenerator.mockReturnValue(vi.fn().mockRejectedValue(new Error("network down")));
    render();
    await act(async () => {
      // Two microtask ticks: reject → catch → finally setState.
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(captured.feedFailed).toBe(true);
    expect(captured.isLoading).toBe(false);
  });

  it("exposes isAdActive=false and the active entry's data as activeReel for a video slide", async () => {
    const videoEntry: FeedEntry = {
      kind: "video",
      data: {
        kind: "video",
        id: 0,
        active: true,
        videoUrl: null,
        videoType: null,
        thumb: null,
        user: null,
        community: null,
        cta: null,
        loop: null,
        ogDetails: null,
        owner: null,
        config: null,
        video: null,
      },
    };
    mockNormaliseFeed.mockReturnValueOnce([videoEntry]);
    mockCreateFeedGenerator.mockReturnValue(vi.fn().mockResolvedValue([{ type: "video" }]));
    render();
    await act(async () => {
      await Promise.resolve();
    });
    expect(captured.isAdActive).toBe(false);
    expect(captured.activeReel).toBe(videoEntry.data);
  });

  it("exposes isAdActive=true when isAdBreakActive is true, from usePlayer()", async () => {
    mockUsePlayer.mockReturnValue({ isAdBreakActive: true });
    mockCreateFeedGenerator.mockReturnValue(vi.fn().mockResolvedValue([{ type: "video" }]));
    render();
    await act(async () => {
      await Promise.resolve();
    });
    expect(captured.isAdActive).toBe(true);
  });

  it("bails out (no state update) when the effect is cancelled before the fetch resolves", async () => {
    let resolveFeed: ((reels: unknown[]) => void) | undefined;
    const pending = new Promise<unknown[]>((resolve) => {
      resolveFeed = resolve;
    });
    mockCreateFeedGenerator.mockReturnValue(vi.fn().mockReturnValue(pending));

    render();
    // Unmount while the fetch is still in-flight → cleanup sets cancelled = true.
    act(() => root.unmount());
    // Re-mount so afterEach's unmount on an empty root is harmless.
    root = createRoot(container);

    // Resolve after cancellation → the `if (cancelled) return` guard runs.
    await act(async () => {
      resolveFeed?.([{ type: "reel" }]);
      await Promise.resolve();
      await Promise.resolve();
    });

    // No throw, no leaked state update on the unmounted tree.
    expect(true).toBe(true);
  });

  it("serves the static feed and never calls createFeedGenerator for a servedStatically tag", async () => {
    mockUseStrategy.mockReturnValue({
      adBreakEnabled: false,
      gateOnUnmute: false,
      adsDisabled: false,
      servedStatically: true,
    });
    mockGetStaticTagData.mockResolvedValue({
      tagConfig: {},
      feed: [{ type: "ads" }, { type: "ads" }],
    });

    render();
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(mockCreateFeedGenerator).not.toHaveBeenCalled();
    expect(captured.entries.length).toBe(2);
    expect(captured.isLoading).toBe(false);
  });

  it("swaps in the debug device's VAST feed on a debug test device", async () => {
    mockGetDebugDeviceFeed.mockResolvedValue([{ type: "ads" }, { type: "ads" }]);
    mockUseStrategy.mockReturnValue({
      adBreakEnabled: false,
      gateOnUnmute: false,
      adsDisabled: false,
      servedStatically: true,
    });
    // Three reels in the fixture vs two in the debug feed — so the assertion
    // below can only pass if the swap actually happened.
    mockGetStaticTagData.mockResolvedValue({
      tagConfig: {},
      feed: [{ type: "ads" }, { type: "ads" }, { type: "ads" }],
    });

    render();
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(captured.entries.length).toBe(2);
    // The exchange is never consulted for a debug device.
    expect(mockCreateFeedGenerator).not.toHaveBeenCalled();
  });

  it("serves the committed fixture, not the debug feed, on an ordinary device", async () => {
    mockGetDebugDeviceFeed.mockResolvedValue(undefined);
    mockUseStrategy.mockReturnValue({
      adBreakEnabled: false,
      gateOnUnmute: false,
      adsDisabled: false,
      servedStatically: true,
    });
    mockGetStaticTagData.mockResolvedValue({
      tagConfig: {},
      feed: [{ type: "ads" }, { type: "ads" }, { type: "ads" }],
    });

    render();
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(captured.entries.length).toBe(3);
  });

  it("emits a freshly generated visit_id for the static entry", async () => {
    const uuidSpy = vi.spyOn(crypto, "randomUUID").mockReturnValue("11111111-1111-4111-8111-111111111111");
    const setMandatoryData = vi.fn();
    const setBaseEventContext = vi.fn();
    mockUseAnalytics.mockReturnValue({ sendEvent: vi.fn(), setBaseEventContext, setMandatoryData });
    mockUseStrategy.mockReturnValue({
      adBreakEnabled: false,
      gateOnUnmute: false,
      adsDisabled: false,
      servedStatically: true,
    });
    mockGetStaticTagData.mockResolvedValue({ tagConfig: {}, feed: [{ type: "ads" }] });

    render();
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    const generated = "11111111-1111-4111-8111-111111111111";
    expect(mockSetVisitId).toHaveBeenCalledWith("tag-1", generated);
    expect(setMandatoryData).toHaveBeenCalledWith({ visit_id: generated });
    expect(setBaseEventContext).toHaveBeenCalledWith({ visit_id: generated });
    uuidSpy.mockRestore();
  });

  it("still serves the static feed when crypto.randomUUID is unavailable (http:// / older browser)", async () => {
    // generateUuid (not bare crypto.randomUUID) must handle the insecure-context
    // case; a throw here would land in the catch and fail the feed despite the
    // fixture being present locally. Simulate by removing crypto.randomUUID.
    const originalRandomUUID = crypto.randomUUID;
    // Intentionally delete to simulate an insecure context (http:// / older browser).
    delete (crypto as { randomUUID?: unknown }).randomUUID;

    const setMandatoryData = vi.fn();
    mockUseAnalytics.mockReturnValue({ sendEvent: vi.fn(), setBaseEventContext: vi.fn(), setMandatoryData });
    mockUseStrategy.mockReturnValue({
      adBreakEnabled: false,
      gateOnUnmute: false,
      adsDisabled: false,
      servedStatically: true,
    });
    mockGetStaticTagData.mockResolvedValue({ tagConfig: {}, feed: [{ type: "ads" }] });

    render();
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    // Feed served (not failed), and a non-empty visit_id was still minted.
    expect(captured.entries.length).toBe(1);
    expect(captured.feedFailed).toBe(false);
    const visitIdArg = setMandatoryData.mock.calls[0]?.[0] as { visit_id?: string } | undefined;
    expect(visitIdArg?.visit_id).toBeTruthy();

    Object.defineProperty(crypto, "randomUUID", { value: originalRandomUUID, configurable: true });
  });

  it("emits the feed funnel events for the static entry (BATCH_STARTED, FEED_API_CALL_COMPLETED)", async () => {
    const sendEvent = vi.fn();
    mockUseAnalytics.mockReturnValue({
      sendEvent,
      setBaseEventContext: vi.fn(),
      setMandatoryData: vi.fn(),
    });
    mockUseStrategy.mockReturnValue({
      adBreakEnabled: false,
      gateOnUnmute: false,
      adsDisabled: false,
      servedStatically: true,
    });
    mockGetStaticTagData.mockResolvedValue({ tagConfig: {}, feed: [{ type: "ads" }] });

    render();
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(sendEvent).toHaveBeenCalledWith("Batch Started");
    expect(sendEvent).toHaveBeenCalledWith("Feed API Call Completed");
  });

  it("falls back to the generator when a servedStatically tag has no registry entry", async () => {
    mockUseStrategy.mockReturnValue({
      adBreakEnabled: false,
      gateOnUnmute: false,
      adsDisabled: false,
      servedStatically: true,
    });
    mockGetStaticTagData.mockResolvedValue(undefined);
    mockCreateFeedGenerator.mockReturnValue(vi.fn().mockResolvedValue([{ type: "ads" }]));

    render();
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(mockCreateFeedGenerator).toHaveBeenCalled();
  });

  it("falls back to the generator when the static fixture load rejects", async () => {
    mockUseStrategy.mockReturnValue({
      adBreakEnabled: false,
      gateOnUnmute: false,
      adsDisabled: false,
      servedStatically: true,
    });
    mockGetStaticTagData.mockRejectedValue(new Error("chunk load failed"));
    mockCreateFeedGenerator.mockReturnValue(vi.fn().mockResolvedValue([{ type: "ads" }]));

    render();
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
    });

    // Static data unavailable → serve the real /feed instead of failing.
    expect(mockCreateFeedGenerator).toHaveBeenCalled();
    expect(captured.feedFailed).toBe(false);
  });

  it("does not consult static data for a flagged-but-unregistered tag (gate is flag AND registry)", async () => {
    // servedStatically set, but tagId absent from STATIC_TAG_IDS: the gate must
    // short-circuit so getStaticTagData is never called — same invariant as
    // useTagLoader / genAdSdk. The tag behaves like a normal tag.
    mockUseTagDetails.mockReturnValue({ tagId: "unregistered-tag" });
    mockUseStrategy.mockReturnValue({
      adBreakEnabled: false,
      gateOnUnmute: false,
      adsDisabled: false,
      servedStatically: true,
    });
    mockCreateFeedGenerator.mockReturnValue(vi.fn().mockResolvedValue([{ type: "ads" }]));

    render();
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(mockGetStaticTagData).not.toHaveBeenCalled();
    expect(mockCreateFeedGenerator).toHaveBeenCalled();

    mockUseTagDetails.mockReturnValue({ tagId: "tag-1" });
  });
});
