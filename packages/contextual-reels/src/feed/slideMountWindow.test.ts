import { describe, it, expect } from "vitest";

import { computeSlideMountWindow } from "@cxr/feed/slideMountWindow";

describe("computeSlideMountWindow", () => {
  it("returns just the active index when it is the only slide in view (at rest, radius 0)", () => {
    expect([...computeSlideMountWindow(2, new Set([2]))]).toEqual([2]);
  });

  it("unions the outgoing and incoming slides while a swipe is in flight", () => {
    const window = computeSlideMountWindow(2, new Set([2, 3]));
    expect(window.has(2)).toBe(true);
    expect(window.has(3)).toBe(true);
    expect(window.size).toBe(2);
  });

  it("always includes the active index even when visibleIndices is empty", () => {
    expect([...computeSlideMountWindow(1, new Set())]).toEqual([1]);
  });

  it("always includes the active index even when it is absent from visibleIndices", () => {
    const window = computeSlideMountWindow(0, new Set([4]));
    expect(window.has(0)).toBe(true);
    expect(window.has(4)).toBe(true);
  });

  it("adds the immediate neighbours when radius is 1", () => {
    const window = computeSlideMountWindow(2, new Set([2]), { radius: 1, itemCount: 5 });
    expect([...window].sort((a, b) => a - b)).toEqual([1, 2, 3]);
  });

  it("loop-wraps neighbour indices at the edges when itemCount is given", () => {
    // active 0, radius 1, 5 slides → previous wraps to 4, next is 1.
    const window = computeSlideMountWindow(0, new Set([0]), { radius: 1, itemCount: 5 });
    expect([...window].sort((a, b) => a - b)).toEqual([0, 1, 4]);
  });

  it("adds radius neighbours on both sides when radius is 2", () => {
    const window = computeSlideMountWindow(2, new Set([2]), { radius: 2, itemCount: 6 });
    expect([...window].sort((a, b) => a - b)).toEqual([0, 1, 2, 3, 4]);
  });

  it("does not wrap neighbour indices when itemCount is omitted", () => {
    const window = computeSlideMountWindow(0, new Set([0]), { radius: 1 });
    expect([...window].sort((a, b) => a - b)).toEqual([-1, 0, 1]);
  });

  it("does not mutate the passed visibleIndices set", () => {
    const visible = new Set([2]);
    computeSlideMountWindow(5, visible, { radius: 1, itemCount: 10 });
    expect([...visible]).toEqual([2]);
  });
});
