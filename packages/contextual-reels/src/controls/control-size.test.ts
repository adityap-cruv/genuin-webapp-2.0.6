/**
 * Tests for the per-layout V2 control-size table.
 *
 * `CONTROL_SIZE_BY_LAYOUT` is pure data behind a lookup, so line coverage stays
 * 100% no matter what the cells say — every layout is asserted explicitly here
 * instead, otherwise a wrong cell (an L3 bar sized `sm`, say) ships silently.
 */
import { describe, it, expect } from "vitest";

import { AD_LAYOUT, type AdLayoutId } from "@cxr/config";
import { resolveCxrControlSize } from "@cxr/controls/control-size";

/** The intended size per layout: `[collapsed, fullscreen]`. */
const EXPECTED: ReadonlyArray<readonly [string, AdLayoutId, string, string]> = [
  ["Unknown (unmatched slot size)", AD_LAYOUT.Unknown, "md", "lg"],
  ["L1 300×600", AD_LAYOUT.L1, "sm", "lg"],
  ["L2 300×250", AD_LAYOUT.L2, "sm", "lg"],
  // L3 is the 50px bar — the only layout that drops to the smallest icons.
  ["L3 320×50", AD_LAYOUT.L3, "xs", "lg"],
  ["L4 320×100", AD_LAYOUT.L4, "sm", "lg"],
  ["L5 320×480", AD_LAYOUT.L5, "sm", "lg"],
];

describe("resolveCxrControlSize", () => {
  for (const [label, layout, collapsed, fullscreen] of EXPECTED) {
    it(`${label}: ${collapsed} collapsed, ${fullscreen} in fullscreen`, () => {
      expect(resolveCxrControlSize(layout, false)).toBe(collapsed);
      expect(resolveCxrControlSize(layout, true)).toBe(fullscreen);
    });
  }

  it("covers every layout the config declares", () => {
    const covered = new Set(EXPECTED.map(([, layout]) => layout));
    expect([...Object.values(AD_LAYOUT)].every((id) => covered.has(id))).toBe(true);
  });

  // Provider-less renders (and the FeedNavButtons path before the waterfall
  // reports) pass `undefined` — it must land on the fallback row, not throw.
  it("falls back to the default row for an undefined layout", () => {
    expect(resolveCxrControlSize(undefined, false)).toBe("md");
    expect(resolveCxrControlSize(undefined, true)).toBe("lg");
  });

  // A layout id outside the table (a size added to AD_LAYOUT without a row)
  // must degrade to the fallback rather than return undefined downstream.
  it("falls back to the default row for an unmapped layout id", () => {
    const unmapped = 99 as AdLayoutId;
    expect(resolveCxrControlSize(unmapped, false)).toBe("md");
    expect(resolveCxrControlSize(unmapped, true)).toBe("lg");
  });
});
