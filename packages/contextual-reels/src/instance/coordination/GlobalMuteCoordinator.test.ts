import { describe, it, expect, vi } from "vitest";

import { GlobalMuteCoordinator, getGlobalMuteCoordinator } from "@cxr/instance/coordination/GlobalMuteCoordinator";

describe("GlobalMuteCoordinator", () => {
  it("mutes all other instances when one notifies unmuted", () => {
    const coord = new GlobalMuteCoordinator();
    const mute1 = vi.fn();
    const mute2 = vi.fn();
    coord.register("inst-1", mute1);
    coord.register("inst-2", mute2);
    coord.notifyUnmuted("inst-1");
    expect(mute1).not.toHaveBeenCalled();
    expect(mute2).toHaveBeenCalledOnce();
  });

  it("mutes registered instances not matching caller", () => {
    const coord = new GlobalMuteCoordinator();
    const mute1 = vi.fn();
    coord.register("inst-1", mute1);
    coord.notifyUnmuted("other-inst");
    expect(mute1).toHaveBeenCalledOnce();
  });

  it("unregister removes instance from coordination", () => {
    const coord = new GlobalMuteCoordinator();
    const mute1 = vi.fn();
    coord.register("inst-1", mute1);
    coord.unregister("inst-1");
    coord.notifyUnmuted("other-inst");
    expect(mute1).not.toHaveBeenCalled();
  });

  it("no-op when no instances registered", () => {
    const coord = new GlobalMuteCoordinator();
    expect(() => coord.notifyUnmuted("inst-1")).not.toThrow();
  });

  it("getGlobalMuteCoordinator returns same singleton on repeated calls", () => {
    const a = getGlobalMuteCoordinator();
    const b = getGlobalMuteCoordinator();
    expect(a).toBe(b);
  });
});
