/**
 * Tests for VideoControlLayer — the router that picks the correct video control
 * sub-component by ad layout + fullscreen + GenAI state.
 *
 * Routing matrix exercised here:
 * - compact (320x50 / 320x100) & not fullscreen → CompactControlBar (+ optional Octo strip)
 * - compact 320x50 with Octo allowed → Octo-replaces-bar host + WatchButton
 * - banner / default sizes → DefaultControlLayer (with expandOnTap / hideChrome flags)
 *
 * Leaf components are mocked to identifiable hosts so the test asserts ROUTING
 * and the forwarded flags, not the leaves' internal rendering (covered elsewhere).
 */
import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("@cxr/config", () => ({
  AD_LAYOUT: { Unknown: 0, L1: 1, L2: 2, L3: 3, L4: 4, L5: 5 },
}));

vi.mock("@cxr/instance/InstanceContext", () => ({
  useInstanceId: () => "test-instance",
}));

// GenAI gate — mutable so each test sets whether Octo is enabled.
const genAiState = vi.hoisted(() => ({ genAiEnabled: false }));
vi.mock("@cxr/providers/GenAIProvider", () => ({
  useGenAI: () => genAiState,
}));

const tagDetailsState = vi.hoisted(() => ({
  tagDetails: undefined as TagResponse | undefined,
}));
vi.mock("@cxr/providers/TagDetailsProvider", () => ({
  useTagDetails: () => ({ tagDetails: tagDetailsState.tagDetails, apiFailed: false }),
}));

// useNewPlayerControls toggles the V2 icon set; mutable for the V2/iheart branch.
let useV2Flag = true;
vi.mock("@cxr/controls/useNewPlayerControls", () => ({
  useNewPlayerControls: () => useV2Flag,
}));

// Capture the props forwarded to each leaf so routing flags can be asserted.
const defaultLayerProps = vi.hoisted(() => ({ current: null as Record<string, unknown> | null }));
vi.mock("@cxr/controls/video/DefaultControlLayer", () => ({
  DefaultControlLayer: (props: Record<string, unknown>) => {
    defaultLayerProps.current = props;
    return React.createElement("div", { "data-testid": "default-control-layer" });
  },
}));

const compactBarProps = vi.hoisted(() => ({ current: null as Record<string, unknown> | null }));
vi.mock("@cxr/controls/CompactControlBar", () => ({
  CompactControlBar: (props: Record<string, unknown>) => {
    compactBarProps.current = props;
    return React.createElement("div", { "data-testid": "compact-control-bar" });
  },
}));

vi.mock("@cxr/genai/octo/OctoSheet", () => ({
  OctoSheet: () => React.createElement("div", { "data-testid": "octo-sheet" }),
}));

const watchButtonProps = vi.hoisted(() => ({ current: null as Record<string, unknown> | null }));
vi.mock("@cxr/controls/buttons/atoms/WatchButton", () => ({
  WatchButton: (props: Record<string, unknown>) => {
    watchButtonProps.current = props;
    return React.createElement("div", { "data-testid": "watch-btn" });
  },
}));

import { AD_LAYOUT } from "@cxr/config";
import { VideoControlLayer, CompactUnmuteOverlay } from "@cxr/controls/VideoControlLayer";
import type { TagResponse } from "@cxr/types";
import type { NormalisedReel } from "@cxr/types";

function makeReel(overrides: Partial<NormalisedReel> = {}): NormalisedReel {
  return {
    kind: "video",
    id: 0,
    active: true,
    videoUrl: null,
    videoType: null,
    thumb: null,
    user: null,
    community: null,
    loop: null,
    ogDetails: null,
    config: null,
    owner: { profile_image: "https://x/a.png", nickname: "alice" },
    video: { id: "vid-1", description: "A clip" },
    cta: null,
    playerType: "default",
    ...overrides,
  } as NormalisedReel;
}

const tagDetails: TagResponse = { tag_id: "tag-1", brand_id: 1 };

describe("VideoControlLayer", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    genAiState.genAiEnabled = false;
    useV2Flag = true;
    defaultLayerProps.current = null;
    compactBarProps.current = null;
    watchButtonProps.current = null;
    tagDetailsState.tagDetails = tagDetails;
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    document.body.removeChild(container);
  });

  function render(overrides: Partial<React.ComponentProps<typeof VideoControlLayer>> = {}) {
    act(() => {
      root.render(
        React.createElement(VideoControlLayer, {
          variant: "default",
          item: makeReel(),
          dimensions: { width: 300, height: 600 },
          isActive: true,
          isFullScreen: false,
          isMuted: false,
          isPlay: true,
          adLayout: AD_LAYOUT.L1,
          onMuteClick: vi.fn(),
          onLayerUnmuteClick: vi.fn(),
          onPlayClick: vi.fn(),
          onFullScreenClick: vi.fn(),
          ...overrides,
        })
      );
    });
  }

  const query = (id: string) => container.querySelector(`[data-testid="${id}"]`);

  // OctoSheet is lazy() behind Suspense (kept off the ad-frame critical path), so
  // it resolves on a microtask after render. Flush it before asserting it mounted.
  async function flushLazy(): Promise<void> {
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
  }

  describe("compact layouts (not fullscreen)", () => {
    it("320x100: renders the CompactControlBar inside the compact wrapper with an unmute overlay", () => {
      render({ adLayout: AD_LAYOUT.L4 });
      expect(query("compact-control-bar")).toBeTruthy();
      expect(query("compact-unmute-overlay")).toBeTruthy();
      // No GenAI → no Octo strip.
      expect(query("octo-sheet")).toBeNull();
    });

    it("320x100: forwards md size and V2 icons to the bar", () => {
      render({ adLayout: AD_LAYOUT.L4 });
      expect(compactBarProps.current?.size).toBe("md");
      expect(compactBarProps.current?.useV2Icons).toBe(true);
    });

    it("320x50: forwards sm size to the bar", () => {
      render({ adLayout: AD_LAYOUT.L3 });
      expect(compactBarProps.current?.size).toBe("sm");
    });

    it("320x100 with GenAI + videoId: mounts the Octo strip below the bar", async () => {
      genAiState.genAiEnabled = true;
      render({ adLayout: AD_LAYOUT.L4 });
      await flushLazy();
      expect(query("compact-control-bar")).toBeTruthy();
      expect(query("octo-sheet")).toBeTruthy();
      // Octo present → the bar hides its ticker/actions.
      expect(compactBarProps.current?.hideTickerAndActions).toBe(true);
    });

    it("320x50 with GenAI + videoId: Octo REPLACES the bar (host + Watch button)", async () => {
      genAiState.genAiEnabled = true;
      render({ adLayout: AD_LAYOUT.L3 });
      await flushLazy();
      expect(query("octo-compact-host")).toBeTruthy();
      expect(query("octo-sheet")).toBeTruthy();
      expect(query("watch-btn")).toBeTruthy();
      // The control bar is not rendered in this branch.
      expect(query("compact-control-bar")).toBeNull();
    });

    it("320x50 Octo host: Watch button expands when on_click is 'fullscreen'", async () => {
      genAiState.genAiEnabled = true;
      const onFullScreenClick = vi.fn();
      const onPlayClick = vi.fn();
      tagDetailsState.tagDetails = { ...tagDetails, config: { on_click: "fullscreen" } };
      render({ adLayout: AD_LAYOUT.L3, onFullScreenClick, onPlayClick });
      await flushLazy();
      expect(watchButtonProps.current?.onClick).toBe(onFullScreenClick);
    });

    it("320x50 Octo host: Watch button degrades to play/pause when expand is disabled", async () => {
      genAiState.genAiEnabled = true;
      const onFullScreenClick = vi.fn();
      const onPlayClick = vi.fn();
      tagDetailsState.tagDetails = { ...tagDetails, config: { on_click: "none" } };
      render({ adLayout: AD_LAYOUT.L3, onFullScreenClick, onPlayClick });
      await flushLazy();
      expect(watchButtonProps.current?.onClick).toBe(onPlayClick);
    });

    it("320x50 with GenAI but NO videoId: falls back to the CompactControlBar path", () => {
      genAiState.genAiEnabled = true;
      render({ adLayout: AD_LAYOUT.L3, item: makeReel({ video: { description: "no id" } }) });
      expect(query("octo-compact-host")).toBeNull();
      expect(query("compact-control-bar")).toBeTruthy();
    });

    it("iheart variant uses the legacy (non-V2) icon set on the bar", () => {
      render({ adLayout: AD_LAYOUT.L4, variant: "iheart" });
      expect(compactBarProps.current?.useV2Icons).toBe(false);
    });

    it("non-iheart with V2 disabled uses the legacy icon set", () => {
      useV2Flag = false;
      render({ adLayout: AD_LAYOUT.L4 });
      expect(compactBarProps.current?.useV2Icons).toBe(false);
    });

    it("compact unmute overlay calls onLayerUnmuteClick (not onMuteClick) while muted", () => {
      const onMuteClick = vi.fn();
      const onLayerUnmuteClick = vi.fn();
      render({ adLayout: AD_LAYOUT.L4, isMuted: true, onMuteClick, onLayerUnmuteClick });
      act(() => {
        (query("compact-unmute-overlay") as HTMLElement).click();
      });
      expect(onLayerUnmuteClick).toHaveBeenCalledOnce();
      expect(onMuteClick).not.toHaveBeenCalled();
    });
  });

  describe("banner / default layouts → DefaultControlLayer", () => {
    it("L1 banner (not fullscreen): expandOnTap is true, hideChrome false", () => {
      render({ adLayout: AD_LAYOUT.L1 });
      expect(query("default-control-layer")).toBeTruthy();
      expect(defaultLayerProps.current?.expandOnTap).toBe(true);
      expect(defaultLayerProps.current?.hideChrome).toBe(false);
    });

    it("L2 banner (not fullscreen): expandOnTap true", () => {
      render({ adLayout: AD_LAYOUT.L2 });
      expect(defaultLayerProps.current?.expandOnTap).toBe(true);
    });

    it("L5 (320×480, not fullscreen): expandOnTap true, hideChrome false", () => {
      render({ adLayout: AD_LAYOUT.L5 });
      expect(defaultLayerProps.current?.expandOnTap).toBe(true);
      expect(defaultLayerProps.current?.hideChrome).toBe(false);
    });

    it("L2 with GenAI + videoId (not fullscreen): hideChrome true (Octo owns the chrome)", () => {
      genAiState.genAiEnabled = true;
      render({ adLayout: AD_LAYOUT.L2 });
      expect(defaultLayerProps.current?.hideChrome).toBe(true);
    });

    it("fullscreen compact layout falls through to DefaultControlLayer (expandOnTap false)", () => {
      render({ adLayout: AD_LAYOUT.L4, isFullScreen: true });
      expect(query("default-control-layer")).toBeTruthy();
      expect(query("compact-control-bar")).toBeNull();
      expect(defaultLayerProps.current?.expandOnTap).toBe(false);
    });

    it("Unknown layout (not a banner): expandOnTap false", () => {
      render({ adLayout: AD_LAYOUT.Unknown });
      expect(query("default-control-layer")).toBeTruthy();
      expect(defaultLayerProps.current?.expandOnTap).toBe(false);
    });

    it("fullscreen disables Octo (octoAllowed=false) so L2 hideChrome stays false", () => {
      genAiState.genAiEnabled = true;
      render({ adLayout: AD_LAYOUT.L2, isFullScreen: true });
      expect(defaultLayerProps.current?.hideChrome).toBe(false);
    });

    it("on_click 'fullscreen': forwards expandEnabled=true and expandOnTap=true", () => {
      tagDetailsState.tagDetails = { ...tagDetails, config: { on_click: "fullscreen" } };
      render({ adLayout: AD_LAYOUT.L1 });
      expect(defaultLayerProps.current?.expandEnabled).toBe(true);
      expect(defaultLayerProps.current?.expandOnTap).toBe(true);
    });

    it("on_click not 'fullscreen': forwards expandEnabled=false and expandOnTap=false", () => {
      tagDetailsState.tagDetails = { ...tagDetails, config: { on_click: "none" } };
      render({ adLayout: AD_LAYOUT.L1 });
      expect(defaultLayerProps.current?.expandEnabled).toBe(false);
      expect(defaultLayerProps.current?.expandOnTap).toBe(false);
    });

    it("absent on_click config: defaults expandEnabled to true", () => {
      tagDetailsState.tagDetails = tagDetails;
      render({ adLayout: AD_LAYOUT.L1 });
      expect(defaultLayerProps.current?.expandEnabled).toBe(true);
    });
  });
});

describe("CompactUnmuteOverlay", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    document.body.removeChild(container);
  });

  it("calls onMuteClick when muted", () => {
    const onMuteClick = vi.fn();
    act(() => {
      root.render(<CompactUnmuteOverlay isMuted={true} onMuteClick={onMuteClick} />);
    });
    act(() => {
      (container.querySelector('[data-testid="compact-unmute-overlay"]') as HTMLElement).click();
    });
    expect(onMuteClick).toHaveBeenCalledOnce();
  });

  it("does NOT call onMuteClick when already unmuted", () => {
    const onMuteClick = vi.fn();
    act(() => {
      root.render(<CompactUnmuteOverlay isMuted={false} onMuteClick={onMuteClick} />);
    });
    act(() => {
      (container.querySelector('[data-testid="compact-unmute-overlay"]') as HTMLElement).click();
    });
    expect(onMuteClick).not.toHaveBeenCalled();
  });

  it("stops pointer/touch propagation", () => {
    act(() => {
      root.render(<CompactUnmuteOverlay isMuted={false} onMuteClick={vi.fn()} />);
    });
    const el = container.querySelector('[data-testid="compact-unmute-overlay"]')!;
    for (const type of ["pointerdown", "pointermove", "touchstart", "touchmove"]) {
      const event = new Event(type, { bubbles: true });
      const spy = vi.spyOn(event, "stopPropagation");
      act(() => {
        el.dispatchEvent(event);
      });
      expect(spy).toHaveBeenCalled();
    }
  });
});
