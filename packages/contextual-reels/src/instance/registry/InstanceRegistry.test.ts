import { describe, it, expect, vi, beforeEach } from "vitest";

import { InstanceRegistry, getInstanceRegistry } from "@cxr/instance/registry/InstanceRegistry";

describe("InstanceRegistry", () => {
  it("registers and retrieves controls", () => {
    const registry = new InstanceRegistry();
    const controls = { expand: vi.fn(), collapse: vi.fn(), pause: vi.fn() };
    registry.register("inst-1", controls);
    expect(registry.get("inst-1")).toBe(controls);
  });

  it("unregister removes the instance", () => {
    const registry = new InstanceRegistry();
    registry.register("inst-1", { expand: vi.fn(), collapse: vi.fn(), pause: vi.fn() });
    registry.unregister("inst-1");
    expect(registry.get("inst-1")).toBeUndefined();
  });

  it("getAll returns all registered entries", () => {
    const registry = new InstanceRegistry();
    registry.register("a", { expand: vi.fn(), collapse: vi.fn(), pause: vi.fn() });
    registry.register("b", { expand: vi.fn(), collapse: vi.fn(), pause: vi.fn() });
    expect(registry.getAll().size).toBe(2);
  });

  it("getAll returns a readonly view — direct mutation is not possible at the type level", () => {
    const registry = new InstanceRegistry();
    registry.register("x", { expand: vi.fn(), collapse: vi.fn(), pause: vi.fn() });
    const all = registry.getAll();
    // ReadonlyMap has no .set / .delete — we can only assert the type guard at runtime
    expect(typeof (all as Map<string, unknown>).set).toBe("function"); // underlying map still has it
    expect(all.get("x")).toBeDefined();
  });

  it("register overwrites an existing entry", () => {
    const registry = new InstanceRegistry();
    const first = { expand: vi.fn(), collapse: vi.fn(), pause: vi.fn() };
    const second = { expand: vi.fn(), collapse: vi.fn(), pause: vi.fn() };
    registry.register("inst-1", first);
    registry.register("inst-1", second);
    expect(registry.get("inst-1")).toBe(second);
  });

  it("unregister is a no-op for unknown ids", () => {
    const registry = new InstanceRegistry();
    expect(() => registry.unregister("does-not-exist")).not.toThrow();
  });

  it("get returns undefined for unknown ids", () => {
    const registry = new InstanceRegistry();
    expect(registry.get("missing")).toBeUndefined();
  });

  it("get resolves a DOM element id via a registered alias", () => {
    const registry = new InstanceRegistry();
    const controls = { expand: vi.fn(), collapse: vi.fn(), pause: vi.fn() };
    registry.register("cxr-internal-1", controls);
    registry.registerAlias("gen-ext-1", "cxr-internal-1");
    // Lookup by DOM id resolves through the alias map to the same controls.
    expect(registry.get("gen-ext-1")).toBe(controls);
  });

  it("unregister removes the alias pointing at the unregistered instance", () => {
    const registry = new InstanceRegistry();
    const controls = { expand: vi.fn(), collapse: vi.fn(), pause: vi.fn() };
    registry.register("cxr-internal-1", controls);
    registry.registerAlias("gen-ext-1", "cxr-internal-1");
    registry.unregister("cxr-internal-1");
    // Both the instance and its alias must be gone.
    expect(registry.get("cxr-internal-1")).toBeUndefined();
    expect(registry.get("gen-ext-1")).toBeUndefined();
  });

  it("unregister leaves aliases for other instances intact", () => {
    const registry = new InstanceRegistry();
    const keep = { expand: vi.fn(), collapse: vi.fn(), pause: vi.fn() };
    const drop = { expand: vi.fn(), collapse: vi.fn(), pause: vi.fn() };
    registry.register("cxr-keep", keep);
    registry.register("cxr-drop", drop);
    registry.registerAlias("gen-ext-keep", "cxr-keep");
    registry.registerAlias("gen-ext-drop", "cxr-drop");
    registry.unregister("cxr-drop");
    // The unrelated alias still resolves.
    expect(registry.get("gen-ext-keep")).toBe(keep);
    expect(registry.get("gen-ext-drop")).toBeUndefined();
  });

  describe("getInstanceRegistry singleton", () => {
    beforeEach(() => {
      // Reset the module-level singleton between tests by re-importing.
      // Since Vitest caches modules, we test observable behaviour instead.
    });

    it("returns the same singleton on repeated calls", () => {
      const a = getInstanceRegistry();
      const b = getInstanceRegistry();
      expect(a).toBe(b);
    });

    it("singleton retains state across calls", () => {
      const registry = getInstanceRegistry();
      const controls = { expand: vi.fn(), collapse: vi.fn(), pause: vi.fn() };
      registry.register("singleton-test", controls);
      expect(getInstanceRegistry().get("singleton-test")).toBe(controls);
      // cleanup so other tests are not affected
      registry.unregister("singleton-test");
    });
  });
});
