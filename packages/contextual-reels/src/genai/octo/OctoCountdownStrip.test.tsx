import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const enterFullScreen = vi.fn();

// Toggled per-test so the countdown→idle handler's `!isIframe()` guard branch
// (fullscreen entry suppressed inside an iframe) can be exercised both ways.
let isIframeValue = false;

vi.mock("../../config", async (importOriginal) => {
  const original = await importOriginal<Record<string, unknown>>();
  return {
    ...original,
    isGenAiAllowed: vi.fn(() => true),
    isIframe: vi.fn(() => isIframeValue),
  };
});
vi.mock("../../providers/FullScreenProvider", () => ({
  useFullScreen: () => ({ isFullScreen: false, enterFullScreen, exitFullScreen: vi.fn(), toggleFullScreen: vi.fn() }),
}));
// StrategyProvider (rendered via the SP wrapper) reads tagId/brandId from
// useTagDetails; without a real TagDetailsProvider in the tree it would throw.
// Mock it to a harmless superset covering every field any consumer here reads.
const { useTagDetailsMock } = vi.hoisted(() => ({
  useTagDetailsMock: vi.fn(() => ({ brandId: undefined, adLayout: 0, tagId: undefined })),
}));
vi.mock("@cxr/providers/TagDetailsProvider", () => ({
  useTagDetails: () => useTagDetailsMock(),
}));
// Render the SDK panel as an inert marker so the test focuses on the strip's
// lifecycle handling, not the real SDK. It invokes the forwarded
// `onLifecyclePhase` no-op once on mount so that handler is exercised.
vi.mock("./OctoSdkPanel", () => ({
  OctoSdkPanel: (props: { onLifecyclePhase?: (phase: string) => void }) => {
    props.onLifecyclePhase?.("idle");
    return React.createElement("div", { "data-testid": "octo-sdk-panel" });
  },
}));

import { StrategyProvider } from "@cxr/strategies/StrategyProvider";

import { OctoCountdownStrip } from "./OctoCountdownStrip";

// StrategyProvider returns ReactNode, which trips createElement's component
// overload; alias to a plain FC type so children can be passed positionally
// (avoids the react/no-children-prop lint error).
const SP = StrategyProvider as (props: { tagId: string; children?: React.ReactNode }) => React.ReactNode;

function emitPhase(panelId: string, phase: string): void {
  window.dispatchEvent(
    new CustomEvent("genai:octoLifecycle", { detail: { parentOctoPanelId: panelId, phase } })
  );
}

describe("OctoCountdownStrip", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    enterFullScreen.mockClear();
    isIframeValue = false;
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });
  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  it("enters fullscreen on a countdown→idle transition", () => {
    act(() => {
      root.render(
        React.createElement(
          SP,
          { tagId: "t1" },
          React.createElement(OctoCountdownStrip, {
            instanceId: "i1",
            videoId: "v1",
            tagId: "t1",
            isActive: true,
            isFullScreen: false,
            dimensions: { width: 320, height: 50 },
            host: "compact",
            variant: "50",
          })
        )
      );
    });

    const panel = container.querySelector("[data-octo-strip-panel-id]");
    const panelId = panel?.getAttribute("data-octo-strip-panel-id") ?? "";

    act(() => emitPhase(panelId, "countdown"));
    expect(enterFullScreen).not.toHaveBeenCalled();
    act(() => emitPhase(panelId, "idle"));
    expect(enterFullScreen).toHaveBeenCalledTimes(1);
  });

  it("ignores idle when no countdown preceded it", () => {
    act(() => {
      root.render(
        React.createElement(
          SP,
          { tagId: "t2" },
          React.createElement(OctoCountdownStrip, {
            instanceId: "i2",
            videoId: "v2",
            tagId: "t2",
            isActive: true,
            isFullScreen: false,
            dimensions: { width: 320, height: 100 },
            host: "compact",
            variant: "100",
          })
        )
      );
    });
    const panel = container.querySelector("[data-octo-strip-panel-id]");
    const panelId = panel?.getAttribute("data-octo-strip-panel-id") ?? "";
    act(() => emitPhase(panelId, "idle"));
    expect(enterFullScreen).not.toHaveBeenCalled();
  });

  function mountStrip(props: {
    instanceId: string;
    videoId: string;
    tagId: string;
    isActive: boolean;
    variant: "100" | "50";
  }): void {
    act(() => {
      root.render(
        React.createElement(
          SP,
          { tagId: props.tagId },
          React.createElement(OctoCountdownStrip, {
            instanceId: props.instanceId,
            videoId: props.videoId,
            tagId: props.tagId,
            isActive: props.isActive,
            isFullScreen: false,
            dimensions: { width: 320, height: props.variant === "100" ? 100 : 50 },
            host: "compact",
            variant: props.variant,
          })
        )
      );
    });
  }

  it("renders nothing when there is no video", () => {
    mountStrip({ instanceId: "i3", videoId: "", tagId: "t3", isActive: true, variant: "50" });
    expect(container.querySelector("[data-testid=\"octo-countdown-strip\"]")).toBeNull();
  });

  it("ignores a lifecycle event addressed to a different panel", () => {
    mountStrip({ instanceId: "i4", videoId: "v4", tagId: "t4", isActive: true, variant: "100" });
    act(() => emitPhase("some-other-panel", "countdown"));
    act(() => emitPhase("some-other-panel", "idle"));
    expect(enterFullScreen).not.toHaveBeenCalled();
  });

  it("ignores a lifecycle event with no phase", () => {
    mountStrip({ instanceId: "i5", videoId: "v5", tagId: "t5", isActive: true, variant: "100" });
    const panelId =
      container.querySelector("[data-octo-strip-panel-id]")?.getAttribute("data-octo-strip-panel-id") ?? "";
    act(() => {
      window.dispatchEvent(
        new CustomEvent("genai:octoLifecycle", { detail: { parentOctoPanelId: panelId } })
      );
    });
    expect(enterFullScreen).not.toHaveBeenCalled();
  });

  it("does not enter fullscreen inside an iframe on countdown→idle", () => {
    isIframeValue = true;
    mountStrip({ instanceId: "i6", videoId: "v6", tagId: "t6", isActive: true, variant: "50" });
    const panelId =
      container.querySelector("[data-octo-strip-panel-id]")?.getAttribute("data-octo-strip-panel-id") ?? "";
    act(() => emitPhase(panelId, "countdown"));
    act(() => emitPhase(panelId, "idle"));
    expect(enterFullScreen).not.toHaveBeenCalled();
  });

  it("resets stale phase on reactivation so a re-emitted idle does not fire fullscreen", () => {
    mountStrip({ instanceId: "i7", videoId: "v7", tagId: "t7", isActive: false, variant: "100" });
    const panelId =
      container.querySelector("[data-octo-strip-panel-id]")?.getAttribute("data-octo-strip-panel-id") ?? "";

    // inactive → active edge bumps the activation key and clears the prev phase.
    mountStrip({ instanceId: "i7", videoId: "v7", tagId: "t7", isActive: true, variant: "100" });

    // A lone idle (no preceding countdown after the reset) must not enter fullscreen.
    act(() => emitPhase(panelId, "idle"));
    expect(enterFullScreen).not.toHaveBeenCalled();

    // A fresh countdown→idle on the re-activated session still works.
    act(() => emitPhase(panelId, "countdown"));
    act(() => emitPhase(panelId, "idle"));
    expect(enterFullScreen).toHaveBeenCalledTimes(1);
  });
});
