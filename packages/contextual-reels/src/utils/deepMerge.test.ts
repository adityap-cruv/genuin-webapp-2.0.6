/**
 * Tests for `deepMergeOverwrite` — focused on the unbounded-recursion guards
 * added after a host-supplied circular / deep `offsitePropertiesConfig` caused
 * `Maximum call stack size exceeded` at widget init/analytics.
 */
import { describe, it, expect } from "vitest";

import { deepMergeOverwrite } from "@cxr/utils/deepMerge";

describe("deepMergeOverwrite — recursion guards", () => {
  it("does not throw on a circular override (cycle on both sides at same key)", () => {
    const base: Record<string, unknown> = {};
    base.self = base;
    const override: Record<string, unknown> = {};
    override.self = override;

    expect(() => deepMergeOverwrite(base, override)).not.toThrow();
  });

  it("does not throw on a self-referential override merged into a plain base", () => {
    const base: Record<string, unknown> = { a: { b: {} } };
    const override: Record<string, unknown> = { a: { b: {} } };
    // back-edge: override.a.b points back to override.a
    (override.a as Record<string, unknown>).b = override.a;

    expect(() => deepMergeOverwrite(base, override)).not.toThrow();
  });

  it("does not throw on pathologically deep (non-circular) nesting", () => {
    const makeDeep = (n: number) => {
      const root: Record<string, unknown> = {};
      let cur = root;
      for (let i = 0; i < n; i++) {
        const next: Record<string, unknown> = {};
        cur.c = next;
        cur = next;
      }
      return root;
    };
    expect(() => deepMergeOverwrite(makeDeep(100_000), makeDeep(100_000))).not.toThrow();
  });

  it("still merges a shared sub-object reused across sibling keys (non-cyclic DAG)", () => {
    // The same object referenced by two sibling keys must NOT be treated as a
    // cycle — the path-scoped `seen` set is cleared on unwind.
    const shared = { flag: true };
    const base = { x: { flag: false }, y: { flag: false } };
    const override = { x: shared, y: shared };

    const result = deepMergeOverwrite(base, override) as {
      x: { flag: boolean };
      y: { flag: boolean };
    };
    expect(result.x.flag).toBe(true);
    expect(result.y.flag).toBe(true);
  });

  it("preserves normal merge semantics for ordinary nested input", () => {
    const base = { a: 1, nested: { keep: "yes", overwrite: "old" } };
    const override = { b: 2, nested: { overwrite: "new" } };
    const result = deepMergeOverwrite(base, override) as Record<string, unknown>;

    expect(result).toEqual({ a: 1, b: 2, nested: { keep: "yes", overwrite: "new" } });
  });

  it("does not mutate base or override", () => {
    const base = { nested: { v: 1 } };
    const override = { nested: { v: 2 } };
    deepMergeOverwrite(base, override);
    expect(base.nested.v).toBe(1);
    expect(override.nested.v).toBe(2);
  });
});
