import { afterEach, describe, expect, it, vi } from "vitest";

import { installRudderstackMock, resetRudderstackMock } from "./rudderstackMock";

describe("rudderstackMock", () => {
  afterEach(() => {
    resetRudderstackMock();
  });

  it("exposes track/load/ready as mocks on window.rudderanalytics", () => {
    const api = installRudderstackMock();
    api.track("evt", { a: 1 });
    expect(api.track).toHaveBeenCalledWith("evt", { a: 1 });
  });

  it("ready resolves synchronously", () => {
    const api = installRudderstackMock();
    const cb = vi.fn();
    api.ready(cb);
    expect(cb).toHaveBeenCalledTimes(1);
  });
});
