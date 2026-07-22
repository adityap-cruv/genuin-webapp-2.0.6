import { afterEach, describe, it, expect, vi } from "vitest";

import { InstanceRegistry } from "@cxr/instance/registry/InstanceRegistry";
import {
  INFOLINKS_IMPRESSION_MESSAGE,
  SET_PREVIEW_CONFIG_MESSAGE,
  buildPublicApi,
  installMessageBridge,
} from "@cxr/publicApi";

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
    registry.register("inst-1", { expand, collapse: vi.fn() });
    const api = buildPublicApi(registry);
    api.expand("inst-1");
    expect(expand).toHaveBeenCalledOnce();
  });

  it("collapse() calls registered collapse control", () => {
    const registry = new InstanceRegistry();
    const collapse = vi.fn();
    registry.register("inst-1", { expand: vi.fn(), collapse });
    const api = buildPublicApi(registry);
    api.collapse("inst-1");
    expect(collapse).toHaveBeenCalledOnce();
  });

  it("expand() does not throw for unknown instanceId", () => {
    const api = buildPublicApi(new InstanceRegistry());
    expect(() => api.expand("ghost")).not.toThrow();
  });

  it("_emit() is a no-op when the event has no registered handlers", () => {
    const api = buildPublicApi(new InstanceRegistry());
    // No `on()` call for "ad:fill" — the handler set is absent, so _emit returns early.
    expect(() => api._emit("inst-1", "ad:fill")).not.toThrow();
  });

  it("collapse() does not throw for unknown instanceId", () => {
    const api = buildPublicApi(new InstanceRegistry());
    expect(() => api.collapse("ghost")).not.toThrow();
  });

  it("infolinksImpression(id) calls only the targeted instance's handler", () => {
    const registry = new InstanceRegistry();
    const fireA = vi.fn();
    const fireB = vi.fn();
    registry.register("inst-a", { fireInfolinksImpression: fireA });
    registry.register("inst-b", { fireInfolinksImpression: fireB });
    const api = buildPublicApi(registry);
    api.infolinksImpression("inst-a");
    expect(fireA).toHaveBeenCalledOnce();
    expect(fireB).not.toHaveBeenCalled();
  });

  it("infolinksImpression() with no target fires every mounted instance", () => {
    const registry = new InstanceRegistry();
    const fireA = vi.fn();
    const fireB = vi.fn();
    registry.register("inst-a", { fireInfolinksImpression: fireA });
    registry.register("inst-b", { fireInfolinksImpression: fireB });
    const api = buildPublicApi(registry);
    api.infolinksImpression();
    expect(fireA).toHaveBeenCalledOnce();
    expect(fireB).toHaveBeenCalledOnce();
  });

  it("infolinksImpression() tolerates a handler that unregisters mid-iteration", () => {
    const registry = new InstanceRegistry();
    const fireB = vi.fn();
    // First instance's handler destroys itself (unregisters) — the snapshot
    // taken inside infolinksImpression must keep the iteration stable.
    registry.register("inst-a", {
      fireInfolinksImpression: () => registry.unregister("inst-a"),
    });
    registry.register("inst-b", { fireInfolinksImpression: fireB });
    const api = buildPublicApi(registry);
    expect(() => api.infolinksImpression()).not.toThrow();
    expect(fireB).toHaveBeenCalledOnce();
  });

  it("infolinksImpression() does not throw for unknown instanceId", () => {
    const api = buildPublicApi(new InstanceRegistry());
    expect(() => api.infolinksImpression("ghost")).not.toThrow();
  });

  it("setPreviewConfig() calls the registered control", () => {
    const registry = new InstanceRegistry();
    const setPreviewConfig = vi.fn();
    registry.register("inst-1", { expand: vi.fn(), collapse: vi.fn(), setPreviewConfig });
    const api = buildPublicApi(registry);
    api.setPreviewConfig("inst-1", { tag_id: "t" });
    expect(setPreviewConfig).toHaveBeenCalledWith({ tag_id: "t" });
  });

  it("setPreviewConfig() is a no-op for an unknown instance", () => {
    const api = buildPublicApi(new InstanceRegistry());
    expect(() => api.setPreviewConfig("missing", {})).not.toThrow();
  });
});

describe("installMessageBridge", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("routes an inbound cxr:infolinksImpression message to the api, forwarding instanceId", () => {
    const api = buildPublicApi(new InstanceRegistry());
    const spy = vi.spyOn(api, "infolinksImpression");
    const cleanup = installMessageBridge(api);
    window.dispatchEvent(
      new MessageEvent("message", { data: { type: INFOLINKS_IMPRESSION_MESSAGE, instanceId: "inst-1" } })
    );
    expect(spy).toHaveBeenCalledWith("inst-1");
    cleanup();
  });

  it("ignores unrelated messages", () => {
    const api = buildPublicApi(new InstanceRegistry());
    const spy = vi.spyOn(api, "infolinksImpression");
    const cleanup = installMessageBridge(api);
    window.dispatchEvent(new MessageEvent("message", { data: { type: "somethingElse" } }));
    window.dispatchEvent(new MessageEvent("message", { data: "not-an-object" }));
    expect(spy).not.toHaveBeenCalled();
    cleanup();
  });

  it("cleanup removes the listener", () => {
    const api = buildPublicApi(new InstanceRegistry());
    const spy = vi.spyOn(api, "infolinksImpression");
    const cleanup = installMessageBridge(api);
    cleanup();
    window.dispatchEvent(new MessageEvent("message", { data: { type: INFOLINKS_IMPRESSION_MESSAGE } }));
    expect(spy).not.toHaveBeenCalled();
  });

  it("routes cxr:setPreviewConfig to the target instance", () => {
    const registry = new InstanceRegistry();
    const setPreviewConfig = vi.fn();
    registry.register("inst-1", { expand: vi.fn(), collapse: vi.fn(), setPreviewConfig });
    const api = buildPublicApi(registry);
    const cleanup = installMessageBridge(api);
    window.dispatchEvent(
      new MessageEvent("message", {
        data: { type: SET_PREVIEW_CONFIG_MESSAGE, instanceId: "inst-1", config: { tag_id: "t" } },
      })
    );
    expect(setPreviewConfig).toHaveBeenCalledWith({ tag_id: "t" });
    cleanup();
  });
});
