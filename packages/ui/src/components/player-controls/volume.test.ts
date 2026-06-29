import { resolveVolumeChange } from "./volume";

describe("resolveVolumeChange", () => {
  it("passes percent scale through unchanged", () => {
    expect(resolveVolumeChange(60, "percent")).toEqual({ volume: 60, muted: false });
  });

  it("converts percent to 0-1 for the unit scale", () => {
    expect(resolveVolumeChange(60, "unit")).toEqual({ volume: 0.6, muted: false });
  });

  it("flags muted when dragged to zero (both scales)", () => {
    expect(resolveVolumeChange(0, "percent")).toEqual({ volume: 0, muted: true });
    expect(resolveVolumeChange(0, "unit")).toEqual({ volume: 0, muted: true });
  });

  it("does not flag muted above zero", () => {
    expect(resolveVolumeChange(1, "unit").muted).toBe(false);
  });
});
