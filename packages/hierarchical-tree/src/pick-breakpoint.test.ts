import { describe, expect, it } from "vitest";

import { pickBreakpoint } from "./pick-breakpoint";
import type { LayoutTree } from "./schema";

const ROOT = { type: "ui" as const, uiVariant: "container" };

const REGISTRY: LayoutTree[] = [
  { id: "mobile", minWidth: 0, root: ROOT },
  { id: "tablet", minWidth: 768, root: ROOT },
  { id: "desktop", minWidth: 1024, root: ROOT },
];

describe("pickBreakpoint", () => {
  it("returns the largest minWidth ≤ width", () => {
    expect(pickBreakpoint(0, REGISTRY).id).toBe("mobile");
    expect(pickBreakpoint(767, REGISTRY).id).toBe("mobile");
    expect(pickBreakpoint(768, REGISTRY).id).toBe("tablet");
    expect(pickBreakpoint(1023, REGISTRY).id).toBe("tablet");
    expect(pickBreakpoint(1024, REGISTRY).id).toBe("desktop");
    expect(pickBreakpoint(9999, REGISTRY).id).toBe("desktop");
  });

  it("falls back to the smallest entry when the registry starts above 0", () => {
    const above: LayoutTree[] = [
      { id: "lg", minWidth: 768, root: ROOT },
      { id: "xl", minWidth: 1280, root: ROOT },
    ];
    expect(pickBreakpoint(100, above).id).toBe("lg");
  });

  it("throws when the registry is empty", () => {
    expect(() => pickBreakpoint(100, [])).toThrow();
  });
});
