import { describe, it, expect } from "vitest";

import {
  GATED_REVEAL_STATES,
  REVEAL_PANEL_CHROME_PX,
  combineRevealGates,
  computeRevealGate,
  gateRevealStates,
  isGatedRevealState,
  isRevealTargetAllowed,
  type RevealFits,
} from "./linkout-expand-gate";
import type { LinkoutState } from "./linkout-state-machine";

const ALL: LinkoutState[] = ["pl-sml", "default", "default-active", "expand-view", "panel-view", "full-view"];
const CHROME = REVEAL_PANEL_CHROME_PX["expand-view"]; // 36; the three states share it today

describe("isGatedRevealState", () => {
  it("recognises the three card states", () => {
    for (const s of GATED_REVEAL_STATES) expect(isGatedRevealState(s)).toBe(true);
  });
  it("rejects chips + panel/full", () => {
    for (const s of ["pl-xs", "pl-sml", "panel-view", "full-view"]) expect(isGatedRevealState(s)).toBe(false);
  });
});

describe("computeRevealGate — fail-open cases", () => {
  it("fits every state when the gate is off, even with huge bodies", () => {
    const fits = computeRevealGate({
      gateApplies: false,
      bodyPxByState: { default: 9999, "default-active": 9999, "expand-view": 9999 },
      frameHeightPx: 100,
    });
    expect(fits).toEqual({ default: true, "default-active": true, "expand-view": true });
  });

  it("fits a state whose body is not measured yet (0) — never block on first paint", () => {
    const fits = computeRevealGate({ gateApplies: true, bodyPxByState: {}, frameHeightPx: 600 });
    expect(fits).toEqual({ default: true, "default-active": true, "expand-view": true });
  });

  it("fits when the frame is not measured yet (0)", () => {
    const fits = computeRevealGate({
      gateApplies: true,
      bodyPxByState: { "expand-view": 400 },
      frameHeightPx: 0,
    });
    expect(fits["expand-view"]).toBe(true);
  });
});

describe("computeRevealGate — per-state threshold (gate on, measured)", () => {
  it("gates each state independently by its own measured body", () => {
    // frame 600 → half is 300. default 120+36=156 fits; expand 300+36=336 doesn't.
    const fits = computeRevealGate({
      gateApplies: true,
      bodyPxByState: { default: 120, "default-active": 240, "expand-view": 300 },
      frameHeightPx: 600,
    });
    expect(fits.default).toBe(true); // 156 <= 300
    expect(fits["default-active"]).toBe(true); // 276 <= 300
    expect(fits["expand-view"]).toBe(false); // 336 > 300
  });

  it("fits at exactly 50% (boundary inclusive)", () => {
    const fits = computeRevealGate({
      gateApplies: true,
      bodyPxByState: { "expand-view": 300 - CHROME },
      frameHeightPx: 600,
    });
    expect(fits["expand-view"]).toBe(true); // == 300 == half of 600
  });

  it("does not fit one px over 50%", () => {
    const fits = computeRevealGate({
      gateApplies: true,
      bodyPxByState: { "expand-view": 301 - CHROME },
      frameHeightPx: 600,
    });
    expect(fits["expand-view"]).toBe(false);
  });

  it("honours a custom per-state chrome map", () => {
    const fits = computeRevealGate({
      gateApplies: true,
      bodyPxByState: { default: 260 },
      frameHeightPx: 600,
      chromePxByState: { default: 40, "default-active": 40, "expand-view": 40 },
    });
    expect(fits.default).toBe(true); // 260 + 40 = 300 == half
  });
});

describe("isRevealTargetAllowed", () => {
  const fits = { default: true, "default-active": false, "expand-view": false } as const;
  it("defers to the verdict for gated targets", () => {
    expect(isRevealTargetAllowed("default", fits)).toBe(true);
    expect(isRevealTargetAllowed("default-active", fits)).toBe(false);
    expect(isRevealTargetAllowed("expand-view", fits)).toBe(false);
  });
  it("always allows ungated targets (chips, panel/full)", () => {
    for (const s of ["pl-sml", "panel-view", "full-view"]) expect(isRevealTargetAllowed(s, fits)).toBe(true);
  });
});

describe("gateRevealStates", () => {
  it("drops only the gated states that don't fit; chips + panel/full pass", () => {
    const fits = { default: true, "default-active": false, "expand-view": false } as const;
    const out = gateRevealStates(ALL, fits);
    expect(out).toEqual(["pl-sml", "default", "panel-view", "full-view"]);
  });

  it("keeps every state when all gated states fit", () => {
    const fits = { default: true, "default-active": true, "expand-view": true } as const;
    expect(gateRevealStates(ALL, fits)).toEqual(ALL);
  });
});

describe("computeRevealGate + gateRevealStates — integration", () => {
  it("a tall expand-view caps the reveal at default-active", () => {
    const fits = computeRevealGate({
      gateApplies: true,
      bodyPxByState: { default: 100, "default-active": 150, "expand-view": 320 },
      frameHeightPx: 600,
    });
    const out = gateRevealStates(ALL, fits);
    expect(out).not.toContain("expand-view");
    expect(out).toContain("default-active");
  });

  it("a tall default caps the reveal at the chip (default dropped too)", () => {
    const fits = computeRevealGate({
      gateApplies: true,
      bodyPxByState: { default: 320, "default-active": 340, "expand-view": 400 },
      frameHeightPx: 500, // half 250; even 320+36 > 250
    });
    const out = gateRevealStates(ALL, fits);
    expect(out).not.toContain("default");
    expect(out).not.toContain("default-active");
    expect(out).not.toContain("expand-view");
    expect(out).toContain("pl-sml"); // chip survives — never gated
  });
});

describe("combineRevealGates", () => {
  const all = (v: boolean): RevealFits => ({ default: v, "default-active": v, "expand-view": v });

  it("a single gate passes through unchanged", () => {
    const g: RevealFits = { default: true, "default-active": false, "expand-view": true };
    expect(combineRevealGates(g)).toEqual(g);
  });

  it("ANDs per state — a state fails if ANY gate fails it", () => {
    const height: RevealFits = { default: true, "default-active": true, "expand-view": false };
    const cta: RevealFits = { default: true, "default-active": false, "expand-view": true };
    expect(combineRevealGates(height, cta)).toEqual({
      default: true,
      "default-active": false,
      "expand-view": false,
    });
  });

  it("an all-true (fail-open) gate is the identity", () => {
    const g: RevealFits = { default: false, "default-active": true, "expand-view": false };
    expect(combineRevealGates(g, all(true))).toEqual(g);
  });

  it("no gates → all fit (vacuous AND)", () => {
    expect(combineRevealGates()).toEqual(all(true));
  });
});
