import { describe, it, expect } from "vitest";

import { linkoutTransition, type LinkoutMachine, type LinkoutState } from "./linkout-state-machine";

const ALL: LinkoutState[] = ["pl-xs", "pl-sml", "default", "default-active", "expand-view", "panel-view", "full-view"];
const m = (state: LinkoutState, lastVideoId: string | null = "v1"): LinkoutMachine => ({ state, lastVideoId });

describe("linkoutTransition — USER_ACTION (default → default-active)", () => {
  it("advances default → default-active", () => {
    expect(linkoutTransition(m("default"), { type: "USER_ACTION" }, ALL).state).toBe("default-active");
  });
  it("is forward-only (no revert from default-active)", () => {
    expect(linkoutTransition(m("default-active"), { type: "USER_ACTION" }, ALL).state).toBe("default-active");
  });
  it("does not fire from a chip", () => {
    expect(linkoutTransition(m("pl-sml"), { type: "USER_ACTION" }, ALL).state).toBe("pl-sml");
  });
  it("respects enabledStates (default-active disabled → stay)", () => {
    const enabled: LinkoutState[] = ["pl-sml", "default", "expand-view"];
    expect(linkoutTransition(m("default"), { type: "USER_ACTION" }, enabled).state).toBe("default");
  });
});

describe("linkoutTransition — ACTIVATE_VIDEO (Bug 3: no restart on return)", () => {
  it("resets to pl-sml for a genuinely new video id", () => {
    const next = linkoutTransition(m("default-active", "v1"), { type: "ACTIVATE_VIDEO", videoId: "v2" }, ALL);
    expect(next.state).toBe("pl-sml");
    expect(next.lastVideoId).toBe("v2");
  });
  it("does NOT reset when the same video re-activates (return from expand)", () => {
    const next = linkoutTransition(m("default-active", "v1"), { type: "ACTIVATE_VIDEO", videoId: "v1" }, ALL);
    expect(next.state).toBe("default-active");
    expect(next.lastVideoId).toBe("v1");
  });
});
