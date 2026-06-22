import { describe, expect, it } from "vitest";

import { createPlayerHandleMock, flushVliteOnReady, vlitejsMockFactory } from "./vlitejsMock";

describe("vlitejsMock", () => {
  it("createPlayerHandleMock exposes the documented vi.fn surface", () => {
    const p = createPlayerHandleMock();
    p.play();
    p.pause();
    expect(p.play).toHaveBeenCalledTimes(1);
    expect(p.pause).toHaveBeenCalledTimes(1);
    expect(p.isMuted()).toBe(false);
  });

  it("vlitejsMockFactory exposes a default-exported Vlitejs class", () => {
    const mod = vlitejsMockFactory() as { default: new (...args: unknown[]) => unknown };
    const Vlitejs = mod.default;
    const instance = new Vlitejs(".sel") as { player: { play: () => void } };
    expect(typeof instance.player.play).toBe("function");
  });

  it("flushVliteOnReady invokes the captured onReady callback", () => {
    const mod = vlitejsMockFactory() as { default: new (...args: unknown[]) => unknown };
    let received = false;
    const inst = new mod.default(".sel", { onReady: () => (received = true) }) as Parameters<
      typeof flushVliteOnReady
    >[0];
    flushVliteOnReady(inst);
    expect(received).toBe(true);
  });
});
