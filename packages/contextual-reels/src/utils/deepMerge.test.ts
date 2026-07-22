import { describe, expect, it } from "vitest";

import { deepMergeOverwrite } from "@cxr/utils/deepMerge";

describe("deepMergeOverwrite", () => {
  it("returns a shallow clone of base when override is undefined", () => {
    const base = { a: 1, b: 2 };
    const result = deepMergeOverwrite(base, undefined);
    expect(result).toEqual({ a: 1, b: 2 });
    expect(result).not.toBe(base);
  });

  it("returns a shallow clone of base when override is null", () => {
    const base = { a: 1 };
    const result = deepMergeOverwrite(base, null);
    expect(result).toEqual({ a: 1 });
    expect(result).not.toBe(base);
  });

  it("returns a shallow clone of base when override is not an object", () => {
    const base = { a: 1 };
    expect(deepMergeOverwrite(base, "foo" as unknown as object)).toEqual({ a: 1 });
    expect(deepMergeOverwrite(base, 42 as unknown as object)).toEqual({ a: 1 });
  });

  it("clones an array base via slice when override is not an object", () => {
    const base = [1, 2, 3];
    const result = deepMergeOverwrite(base, undefined);
    expect(result).toEqual([1, 2, 3]);
    expect(result).not.toBe(base);
  });

  it("handles null/undefined base by returning empty object clone", () => {
    expect(deepMergeOverwrite(null, undefined)).toEqual({});
    expect(deepMergeOverwrite(undefined, undefined)).toEqual({});
  });

  it("skips undefined values in override", () => {
    const base = { a: 1, b: 2 };
    const result = deepMergeOverwrite(base, { a: undefined, b: 5 });
    expect(result).toEqual({ a: 1, b: 5 });
  });

  it("skips null values in override", () => {
    const base = { a: 1, b: 2 };
    const result = deepMergeOverwrite(base, { a: null, b: 5 });
    expect(result).toEqual({ a: 1, b: 5 });
  });

  it("overwrites primitive values from override", () => {
    const base = { a: 1, b: "x" };
    const result = deepMergeOverwrite(base, { a: 2, b: "y" });
    expect(result).toEqual({ a: 2, b: "y" });
  });

  it("adds new keys from override", () => {
    const base = { a: 1 };
    const result = deepMergeOverwrite(base, { b: 2 });
    expect(result).toEqual({ a: 1, b: 2 });
  });

  it("accepts both snake_case and camelCase keys", () => {
    const base = { event_name: "foo" };
    const result = deepMergeOverwrite(base, { eventName: "bar", other_key: 1 });
    expect(result).toEqual({ event_name: "foo", eventName: "bar", other_key: 1 });
  });

  it("recursively merges plain objects", () => {
    const base = { a: { x: 1, y: 2 }, b: 3 };
    const result = deepMergeOverwrite(base, { a: { y: 9, z: 4 } });
    expect(result).toEqual({ a: { x: 1, y: 9, z: 4 }, b: 3 });
  });

  it("replaces (does NOT merge) array values at leaf level", () => {
    const base = { tags: [1, 2, 3] };
    const result = deepMergeOverwrite(base, { tags: [9, 8] });
    expect(result).toEqual({ tags: [9, 8] });
  });

  it("treats Date instances as override-as-is (not plain object)", () => {
    const d = new Date("2024-01-01");
    const result = deepMergeOverwrite({ when: "old" }, { when: d });
    expect(result.when).toBe(d);
  });

  it("treats Map instances as override-as-is (not plain object)", () => {
    const m = new Map([["k", "v"]]);
    const result = deepMergeOverwrite({ data: { nested: true } }, { data: m });
    expect(result.data).toBe(m);
  });

  it("treats class instances as override-as-is", () => {
    class Foo {
      a = 1;
    }
    const inst = new Foo();
    const result = deepMergeOverwrite({ x: { b: 2 } }, { x: inst });
    expect(result.x).toBe(inst);
  });

  it("merges 3 levels deep", () => {
    const base = { a: { b: { c: { d: 1, e: 2 } } } };
    const result = deepMergeOverwrite(base, { a: { b: { c: { e: 9, f: 3 } } } });
    expect(result).toEqual({ a: { b: { c: { d: 1, e: 9, f: 3 } } } });
  });

  it("does not mutate the base object", () => {
    const base = { a: { x: 1 } };
    const result = deepMergeOverwrite(base, { a: { y: 2 } });
    expect(base).toEqual({ a: { x: 1 } });
    expect(result).toEqual({ a: { x: 1, y: 2 } });
  });

  it("does not mutate base when mutating result at top level", () => {
    const base = { a: 1 };
    const result = deepMergeOverwrite(base, { b: 2 }) as Record<string, number>;
    result.c = 99;
    expect(base).toEqual({ a: 1 });
  });

  it("replaces array when base value is also an array (not plain object)", () => {
    const base = { items: [1, 2] };
    const result = deepMergeOverwrite(base, { items: { 0: "a" } });
    expect(result.items).toEqual({ 0: "a" });
  });

  it("writes override keys when base is null", () => {
    const result = deepMergeOverwrite(null, { a: 1, b: 2 });
    expect(result).toEqual({ a: 1, b: 2 });
  });
});

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
