import { afterEach, describe, expect, it, vi } from "vitest";

/** Load the module fresh so its once-captured singleton re-reads the window. */
async function loadFresh() {
  vi.resetModules();
  return import("./hostMacros");
}

afterEach(() => {
  delete (window as { __CXR_SCRIPT_PARAMS__?: string }).__CXR_SCRIPT_PARAMS__;
  vi.resetModules();
});

describe("hostMacros", () => {
  it("parses populated params into a map", async () => {
    (window as { __CXR_SCRIPT_PARAMS__?: string }).__CXR_SCRIPT_PARAMS__ =
      "tagId=abc&appn=My%20App&ifa=123&country=USA";
    const { parseHostMacros } = await loadFresh();
    expect(parseHostMacros()).toEqual({
      tagId: "abc",
      appn: "My App",
      ifa: "123",
      country: "USA",
    });
  });

  it("drops empty values", async () => {
    (window as { __CXR_SCRIPT_PARAMS__?: string }).__CXR_SCRIPT_PARAMS__ =
      "appn=Foo&appv=&gdpr_consent=";
    const { parseHostMacros } = await loadFresh();
    expect(parseHostMacros()).toEqual({ appn: "Foo" });
  });

  it("drops whitespace-only values", async () => {
    (window as { __CXR_SCRIPT_PARAMS__?: string }).__CXR_SCRIPT_PARAMS__ = "appn=%20%20&ifa=real";
    const { parseHostMacros } = await loadFresh();
    // appn=%20%20 decodes to "  " — treated as absent.
    expect(parseHostMacros()).toEqual({ ifa: "real" });
  });

  it("drops unresolved braced literals", async () => {
    (window as { __CXR_SCRIPT_PARAMS__?: string }).__CXR_SCRIPT_PARAMS__ = "appv=%7Bappv%7D&appn=Real";
    const { parseHostMacros } = await loadFresh();
    // %7Bappv%7D decodes to {appv} — treated as absent.
    expect(parseHostMacros()).toEqual({ appn: "Real" });
  });

  it("returns an empty map when the param bag is absent", async () => {
    const { parseHostMacros } = await loadFresh();
    expect(parseHostMacros()).toEqual({});
  });

  it("getHostMacro reads a single cleaned value", async () => {
    (window as { __CXR_SCRIPT_PARAMS__?: string }).__CXR_SCRIPT_PARAMS__ = "ifa=xyz&appv=";
    const { getHostMacro } = await loadFresh();
    expect(getHostMacro("ifa")).toBe("xyz");
    expect(getHostMacro("appv")).toBeUndefined();
  });
});
