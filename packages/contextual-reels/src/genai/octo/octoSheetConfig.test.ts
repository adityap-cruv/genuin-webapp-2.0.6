/**
 * Tests for `octoSheetConfig` — the pure config/className resolver shared by the
 * Octo sheet ladder. Covers the player-shrink fraction map, the enabled-state
 * ladder per ad layout (including the fullscreen unlock + short-format caps),
 * the autoAdvance rules per active state, theme selection, and the per-state
 * panel className branches.
 */
import type { DynamicSheetState } from "@genuin/ui/dynamic-sheet";
import { describe, it, expect } from "vitest";

import { getOctoSheetConfig, octoFractionForState, type OctoSheetConfigParams } from "@cxr/genai/octo/octoSheetConfig";

const L1 = { width: 300, height: 600 };
const L2 = { width: 300, height: 250 };
const L3 = { width: 320, height: 50 };
const L4 = { width: 320, height: 100 };
const L5 = { width: 320, height: 480 };
const UNKNOWN = { width: 123, height: 456 };

function build(params: Partial<OctoSheetConfigParams> = {}): ReturnType<typeof getOctoSheetConfig> {
  return getOctoSheetConfig({
    dimensions: L1,
    isFullScreen: false,
    octoState: "default",
    ...params,
  });
}

describe("octoFractionForState", () => {
  it("reports 0 for collapsed/overlay states", () => {
    expect(octoFractionForState("default")).toBe(0);
    expect(octoFractionForState("default-active")).toBe(0);
    expect(octoFractionForState("expand-view")).toBe(0);
  });

  it("reports the sheet share for panel/full states", () => {
    expect(octoFractionForState("panel-view")).toBe(0.7);
    expect(octoFractionForState("full-view")).toBe(1);
  });

  it("falls back to 0 for an unmapped state", () => {
    expect(octoFractionForState("unmapped" as DynamicSheetState)).toBe(0);
  });
});

describe("getOctoSheetConfig — enabled state ladder", () => {
  it("exposes the full ladder for the L1 primary banner", () => {
    expect(build({ dimensions: L1 }).config.enabledStates).toEqual([
      "default",
      "default-active",
      "expand-view",
      "panel-view",
      "full-view",
    ]);
  });

  it("exposes the full ladder for the tall L5 (320×480) format", () => {
    expect(build({ dimensions: L5 }).config.enabledStates).toEqual([
      "default",
      "default-active",
      "expand-view",
      "panel-view",
      "full-view",
    ]);
  });

  it("caps L2 and L4 short formats at expand-view", () => {
    expect(build({ dimensions: L2 }).config.enabledStates).toEqual(["default", "default-active", "expand-view"]);
    expect(build({ dimensions: L4 }).config.enabledStates).toEqual(["default", "default-active", "expand-view"]);
  });

  it("caps the L3 bar at default only", () => {
    expect(build({ dimensions: L3 }).config.enabledStates).toEqual(["default"]);
  });

  it("falls back to the full ladder for an unknown layout", () => {
    expect(build({ dimensions: UNKNOWN }).config.enabledStates).toEqual([
      "default",
      "default-active",
      "expand-view",
      "panel-view",
      "full-view",
    ]);
  });

  it("unlocks the full ladder in fullscreen regardless of embed size", () => {
    expect(build({ dimensions: L3, isFullScreen: true }).config.enabledStates).toEqual([
      "default",
      "default-active",
      "expand-view",
      "panel-view",
      "full-view",
    ]);
  });
});

describe("getOctoSheetConfig — autoAdvance rules", () => {
  it("returns no rules in the default state", () => {
    expect(build({ octoState: "default" }).config.autoAdvance).toEqual([]);
  });

  it("snaps lower states up to default-active", () => {
    expect(build({ octoState: "default-active" }).config.autoAdvance).toEqual([
      { from: "default", to: "default-active", delayMs: 1 },
      { from: "expand-view", to: "default-active", delayMs: 1 },
    ]);
  });

  it("snaps lower states up to expand-view", () => {
    expect(build({ octoState: "expand-view" }).config.autoAdvance).toEqual([
      { from: "default", to: "expand-view", delayMs: 1 },
      { from: "default-active", to: "expand-view", delayMs: 1 },
    ]);
  });

  it("snaps lower states up to panel-view", () => {
    expect(build({ octoState: "panel-view" }).config.autoAdvance).toEqual([
      { from: "default", to: "panel-view", delayMs: 1 },
      { from: "default-active", to: "panel-view", delayMs: 1 },
      { from: "expand-view", to: "panel-view", delayMs: 1 },
    ]);
  });

  it("snaps every lower state up to full-view", () => {
    expect(build({ octoState: "full-view" }).config.autoAdvance).toEqual([
      { from: "default", to: "full-view", delayMs: 1 },
      { from: "default-active", to: "full-view", delayMs: 1 },
      { from: "expand-view", to: "full-view", delayMs: 1 },
      { from: "panel-view", to: "full-view", delayMs: 1 },
    ]);
  });
});

describe("getOctoSheetConfig — chrome + theme", () => {
  it("uses a dark theme + no close/overlay in the default state", () => {
    const { config } = build({ octoState: "default" });
    expect(config.theme).toBe("dark");
    expect(config.showClose).toBe(false);
    expect(config.showOverlay).toBe(false);
    expect(config.navTitle).toBeUndefined();
  });

  it("keeps a dark theme but shows close once collapsed→active", () => {
    const { config } = build({ octoState: "default-active" });
    expect(config.theme).toBe("dark");
    expect(config.showClose).toBe(true);
    expect(config.showOverlay).toBe(false);
    expect(config.navTitle).toBe("Octo GPT");
  });

  it("switches to a light theme for expand-view (no overlay)", () => {
    const { config } = build({ octoState: "expand-view" });
    expect(config.theme).toBe("light");
    expect(config.showOverlay).toBe(false);
  });

  it("uses a light theme + overlay for panel/full states", () => {
    expect(build({ octoState: "panel-view" }).config.theme).toBe("light");
    expect(build({ octoState: "panel-view" }).config.showOverlay).toBe(true);
    expect(build({ octoState: "full-view" }).config.theme).toBe("light");
    expect(build({ octoState: "full-view" }).config.showOverlay).toBe(true);
  });

  it("never shows the drag indicator and always starts at default", () => {
    const { config } = build();
    expect(config.showIndicator).toBe(false);
    expect(config.initialState).toBe("default");
  });

  it("exposes the shared px/percent height map", () => {
    expect(build().config.heights).toEqual({
      default: "60px",
      "default-active": "158px",
      "expand-view": "280px",
      "panel-view": "70%",
      "full-view": "100%",
    });
  });
});

describe("getOctoSheetConfig — className helper", () => {
  it("keeps collapsed states transparent (shadow-none)", () => {
    const { className } = build();
    expect(className("default")).toContain("gencl:shadow-none!");
    expect(className("default-active")).toContain("gencl:shadow-none!");
    expect(className("expand-view")).toContain("gencl:shadow-none!");
  });

  it("pins panel/full states to the container bottom as a rounded white surface", () => {
    const { className } = build();
    for (const state of ["panel-view", "full-view"] as const) {
      const cls = className(state);
      expect(cls).toContain("gencl:absolute!");
      expect(cls).toContain("gencl:bottom-0!");
      expect(cls).toContain("gencl:bg-white!");
      expect(cls).toContain("gencl:rounded-t-2xl!");
    }
  });

  it("always applies the shared transition utility", () => {
    const { className } = build();
    expect(className("default")).toContain("gencl:transition-all");
  });
});
