import { describe, it, expect, vi } from "vitest";

import {
  GlobalPlayerCoordinator,
  getGlobalPlayerCoordinator,
} from "@cxr/instance/coordination/GlobalPlayerCoordinator";

describe("GlobalPlayerCoordinator", () => {
  it("pauses all other instances when one notifies play", () => {
    const coord = new GlobalPlayerCoordinator();
    const pause1 = vi.fn();
    const pause2 = vi.fn();
    coord.register("inst-1", pause1);
    coord.register("inst-2", pause2);
    coord.notifyPlay("inst-1");
    expect(pause1).not.toHaveBeenCalled();
    expect(pause2).toHaveBeenCalledOnce();
  });

  it("pauses registered instances not matching caller", () => {
    const coord = new GlobalPlayerCoordinator();
    const pause1 = vi.fn();
    coord.register("inst-1", pause1);
    coord.notifyPlay("other-inst");
    expect(pause1).toHaveBeenCalledOnce();
  });

  it("unregister removes instance from coordination", () => {
    const coord = new GlobalPlayerCoordinator();
    const pause1 = vi.fn();
    coord.register("inst-1", pause1);
    coord.unregister("inst-1");
    coord.notifyPlay("other-inst");
    expect(pause1).not.toHaveBeenCalled();
  });

  it("getGlobalPlayerCoordinator returns same singleton on repeated calls", () => {
    const a = getGlobalPlayerCoordinator();
    const b = getGlobalPlayerCoordinator();
    expect(a).toBe(b);
  });
});
