import { afterEach, describe, expect, it } from "vitest";

import { installImaMock, resetImaMock } from "./imaMock";

describe("imaMock", () => {
  afterEach(() => {
    resetImaMock();
  });

  it("installs AdEvent.Type constants on window.google.ima", () => {
    installImaMock();
    const w = window as unknown as {
      google: { ima: { AdEvent: { Type: Record<string, string> } } };
    };
    expect(w.google.ima.AdEvent.Type).toEqual({
      LOADED: "loaded",
      STARTED: "started",
      COMPLETE: "complete",
    });
  });

  it("reset wipes the ima namespace", () => {
    installImaMock();
    resetImaMock();
    const w = window as unknown as { google?: { ima?: unknown } };
    expect(w.google?.ima).toBeUndefined();
  });
});
