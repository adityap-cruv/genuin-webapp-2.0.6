import { afterEach, describe, expect, it, vi } from "vitest";

import {
  getLastGenAdInitOptions,
  installGenAdMock,
  resetGenAdMock,
  simulateAdCompleted,
  simulateVolumeChange,
  simulateWaterfallFail,
  simulateWaterfallSuccess,
} from "./genAdMock";

describe("genAdMock", () => {
  afterEach(() => {
    resetGenAdMock();
  });

  it("installs window.GenAd with init/destroy/muteByContainer mocks", () => {
    installGenAdMock();
    const w = window as unknown as { GenAd: { init: unknown; destroy: unknown } };
    expect(typeof w.GenAd.init).toBe("function");
    expect(typeof w.GenAd.destroy).toBe("function");
  });

  it("captures the most recent init options", () => {
    installGenAdMock();
    (window as unknown as { GenAd: { init: (o: unknown) => void } }).GenAd.init({
      container: "a",
    });
    expect(getLastGenAdInitOptions()?.container).toBe("a");
  });

  it("simulateWaterfallSuccess invokes onAdLoaded", () => {
    installGenAdMock();
    const onAdLoaded = vi.fn();
    (window as unknown as { GenAd: { init: (o: unknown) => void } }).GenAd.init({ onAdLoaded });
    simulateWaterfallSuccess("video");
    expect(onAdLoaded).toHaveBeenCalledWith("video");
  });

  it("simulateWaterfallFail invokes onAdFailed", () => {
    installGenAdMock();
    const onAdFailed = vi.fn();
    (window as unknown as { GenAd: { init: (o: unknown) => void } }).GenAd.init({ onAdFailed });
    simulateWaterfallFail("banner");
    expect(onAdFailed).toHaveBeenCalledWith("banner", expect.any(Error));
  });

  it("simulateAdCompleted and simulateVolumeChange forward to callbacks", () => {
    installGenAdMock();
    const onAdCompleted = vi.fn();
    const onVolumeChange = vi.fn();
    (window as unknown as { GenAd: { init: (o: unknown) => void } }).GenAd.init({
      onAdCompleted,
      onVolumeChange,
    });
    simulateAdCompleted();
    simulateVolumeChange(-0.2);
    expect(onAdCompleted).toHaveBeenCalled();
    expect(onVolumeChange).toHaveBeenCalledWith(-0.2);
  });

  it("throws if helpers are called before install", () => {
    expect(() => simulateAdCompleted()).toThrow(/GenAd mock not installed/);
  });
});
