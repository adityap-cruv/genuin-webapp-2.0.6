import { describe, it, expect } from "vitest";

import { shouldPromoteToPlayerExpand } from "./linkout-expand-promotion";

describe("shouldPromoteToPlayerExpand", () => {
  it("promotes on panel-view", () => {
    expect(shouldPromoteToPlayerExpand("expand-view", "panel-view")).toBe(true);
  });

  it("promotes on full-view", () => {
    expect(shouldPromoteToPlayerExpand("panel-view", "full-view")).toBe(true);
  });

  it("promotes on the default-active -> expand-view snap-skip case", () => {
    expect(shouldPromoteToPlayerExpand("default-active", "expand-view")).toBe(true);
  });

  it("does not promote default -> expand-view (no drag, e.g. auto-advance)", () => {
    expect(shouldPromoteToPlayerExpand("default", "expand-view")).toBe(false);
  });

  it("does not promote for chip/default states", () => {
    expect(shouldPromoteToPlayerExpand("pl-sml", "default")).toBe(false);
    expect(shouldPromoteToPlayerExpand("default", "default-active")).toBe(false);
  });
});
