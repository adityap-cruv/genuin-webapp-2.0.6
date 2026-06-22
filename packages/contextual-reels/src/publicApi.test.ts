import { describe, it, expect, vi } from "vitest";

import { InstanceRegistry } from "@cxr/instance/registry/InstanceRegistry";
import { buildPublicApi } from "@cxr/publicApi";

describe("buildPublicApi", () => {
  it("on() returns an unsubscribe function", () => {
    const api = buildPublicApi(new InstanceRegistry());
    const unsub = api.on("play", vi.fn());
    expect(typeof unsub).toBe("function");
  });

  it("_emit() delivers payload to registered handler", () => {
    const api = buildPublicApi(new InstanceRegistry());
    const handler = vi.fn();
    api.on("play", handler);
    api._emit("inst-1", "play");
    expect(handler).toHaveBeenCalledWith({ instanceId: "inst-1", event: "play", data: undefined });
  });

  it("unsubscribe stops further delivery", () => {
    const api = buildPublicApi(new InstanceRegistry());
    const handler = vi.fn();
    const unsub = api.on("pause", handler);
    unsub();
    api._emit("inst-1", "pause");
    expect(handler).not.toHaveBeenCalled();
  });

  it("expand() calls registered expand control", () => {
    const registry = new InstanceRegistry();
    const expand = vi.fn();
    registry.register("inst-1", { expand, collapse: vi.fn(), pause: vi.fn() });
    const api = buildPublicApi(registry);
    api.expand("inst-1");
    expect(expand).toHaveBeenCalledOnce();
  });

  it("collapse() calls registered collapse control", () => {
    const registry = new InstanceRegistry();
    const collapse = vi.fn();
    registry.register("inst-1", { expand: vi.fn(), collapse, pause: vi.fn() });
    const api = buildPublicApi(registry);
    api.collapse("inst-1");
    expect(collapse).toHaveBeenCalledOnce();
  });

  it("expand() does not throw for unknown instanceId", () => {
    const api = buildPublicApi(new InstanceRegistry());
    expect(() => api.expand("ghost")).not.toThrow();
  });
});
