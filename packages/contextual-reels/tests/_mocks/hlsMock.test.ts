import { describe, expect, it, vi } from "vitest";

import { HlsEvents, createHlsInstanceMock, hlsMockFactory, triggerManifestParsed } from "./hlsMock";

describe("hlsMock", () => {
  it("createHlsInstanceMock exposes the documented surface", () => {
    const inst = createHlsInstanceMock();
    inst.startLoad();
    inst.stopLoad();
    expect(inst.startLoad).toHaveBeenCalledTimes(1);
    expect(inst.stopLoad).toHaveBeenCalledTimes(1);
    expect(inst.currentLevel).toBe(-1);
  });

  it("triggerManifestParsed delivers levels synchronously", () => {
    const inst = createHlsInstanceMock();
    const cb = vi.fn();
    inst.on(HlsEvents.MANIFEST_PARSED, cb);
    triggerManifestParsed(inst, [{ height: 720 }]);
    expect(cb).toHaveBeenCalledWith(HlsEvents.MANIFEST_PARSED, { levels: [{ height: 720 }] });
  });

  it("hlsMockFactory exposes isSupported and Events", () => {
    const mod = hlsMockFactory();
    expect(mod.Events.MANIFEST_PARSED).toBe("hlsManifestParsed");
    const Ctor = mod.default as { isSupported: () => boolean; new (): unknown };
    expect(Ctor.isSupported()).toBe(true);
    const instance = new Ctor() as { startLoad: () => void };
    expect(typeof instance.startLoad).toBe("function");
  });
});
