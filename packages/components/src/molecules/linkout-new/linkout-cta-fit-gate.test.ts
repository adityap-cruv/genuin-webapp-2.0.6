import { describe, it, expect } from "vitest";

import { computeCtaFitGate } from "./linkout-cta-fit-gate";

describe("computeCtaFitGate", () => {
  it("fits every state when nothing truncates", () => {
    const fits = computeCtaFitGate({ default: false, "default-active": false, "expand-view": false });
    expect(fits).toEqual({ default: true, "default-active": true, "expand-view": true });
  });

  it("fails only the higher state whose CTA truncates", () => {
    const fits = computeCtaFitGate({ default: false, "default-active": false, "expand-view": true });
    expect(fits).toEqual({ default: true, "default-active": true, "expand-view": false });
  });

  it("fails multiple truncated higher states independently", () => {
    const fits = computeCtaFitGate({ "default-active": true, "expand-view": true });
    expect(fits).toEqual({ default: true, "default-active": false, "expand-view": false });
  });

  it("gates `default` too — a CTA that truncates at the floor blocks it (reveal stays at chip)", () => {
    // Narrow card where the resolved CTA (e.g. "Order Now") overflows even the
    // default button. `default` must fail so the auto-advance check blocks
    // chip→default and the reveal stays at the chip rather than showing a
    // truncated CTA.
    const fits = computeCtaFitGate({ default: true, "default-active": true, "expand-view": true });
    expect(fits).toEqual({ default: false, "default-active": false, "expand-view": false });
  });

  it("fail-open: an unmeasured state (absent from the map) fits", () => {
    const fits = computeCtaFitGate({});
    expect(fits).toEqual({ default: true, "default-active": true, "expand-view": true });
  });
});
