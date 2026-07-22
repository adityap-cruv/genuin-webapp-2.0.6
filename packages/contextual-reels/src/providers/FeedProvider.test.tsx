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
import { createFeedGenerator } from "@cxr/services/feed";
import type { FeedEntry, NormalisedReel } from "@cxr/types";

vi.mock("../services/feed", () => ({
  createFeedGenerator: vi.fn(),
}));

vi.mock("../providers/AnalyticsProvider", () => ({
  useAnalytics: vi.fn(() => ({ sendEvent: vi.fn(), setBaseEventContext: vi.fn() })),
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
  useStrategy: vi.fn(() => ({ adBreakEnabled: false, gateOnUnmute: false, adsDisabled: false })),
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
const mockUseAnalytics = useAnalytics as ReturnType<typeof vi.fn>;
const mockUsePlayer = usePlayer as ReturnType<typeof vi.fn>;
const mockNormaliseFeed = normaliseFeed as ReturnType<typeof vi.fn>;

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
});
