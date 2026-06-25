import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const enterFullScreen = vi.fn();

vi.mock("../../config", async (importOriginal) => {
  const original = await importOriginal<Record<string, unknown>>();
  return { ...original, isGenAiAllowed: vi.fn(() => true) };
});
vi.mock("../../providers/FullScreenProvider", () => ({
  useFullScreen: () => ({ isFullScreen: false, enterFullScreen, exitFullScreen: vi.fn(), toggleFullScreen: vi.fn() }),
}));
// Render the SDK panel as an inert marker so the test focuses on the strip's
// lifecycle handling, not the real SDK.
vi.mock("./OctoSdkPanel", () => ({
  OctoSdkPanel: () => React.createElement("div", { "data-testid": "octo-sdk-panel" }),
}));

import { StrategyProvider } from "@cxr/strategies/StrategyProvider";

import { OctoCountdownStrip } from "./OctoCountdownStrip";

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
        React.createElement(StrategyProvider, {
          tagId: "t1",
          children: React.createElement(OctoCountdownStrip, {
            instanceId: "i1",
            videoId: "v1",
            tagId: "t1",
            isActive: true,
            isFullScreen: false,
            dimensions: { width: 320, height: 50 },
            host: "compact",
            variant: "50",
          }),
        })
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
        React.createElement(StrategyProvider, {
          tagId: "t2",
          children: React.createElement(OctoCountdownStrip, {
            instanceId: "i2",
            videoId: "v2",
            tagId: "t2",
            isActive: true,
            isFullScreen: false,
            dimensions: { width: 320, height: 100 },
            host: "compact",
            variant: "100",
          }),
        })
      );
    });
    const panel = container.querySelector("[data-octo-strip-panel-id]");
    const panelId = panel?.getAttribute("data-octo-strip-panel-id") ?? "";
    act(() => emitPhase(panelId, "idle"));
    expect(enterFullScreen).not.toHaveBeenCalled();
  });
});
