import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { HostMacros } from "@cxr/hostMacros";
import {
  buildDspPixelUrl,
  type DspPixelContext,
  type DspPixelEvent,
  FALLBACK_DSP_PIXEL_BASE_URL,
  fireDspPixel,
} from "@cxr/observability/dsp-pixel";

/** Full host-macro bag — every app-context param the DSP pixel can carry. */
const FULL_MACROS: HostMacros = {
  appb: "com.test.app",
  appn: "Test App",
  appsu: "https://store.example/app",
  appsi: "store-77",
  dnt: "0",
};

/** Full per-ad context — every param the DSP pixel can carry. */
const FULL_CONTEXT: DspPixelContext = {
  tagId: "tag-123",
  brandId: 42,
  visitId: "visit-abc",
  provider: "video",
  creativeId: "creative-9",
  advertiserDomain: "adv.example",
};

const EVENTS: readonly DspPixelEvent[] = ["ad_render", "start", "complete"];

/** Install an `Image` stub that records every assigned `src`. */
function stubImage(): { srcs: string[] } {
  const captured: string[] = [];
  // @ts-expect-error -- test stub, not a full Image implementation
  globalThis.Image = class {
    set src(value: string) {
      captured.push(value);
    }
  };
  return { srcs: captured };
}

describe("buildDspPixelUrl", () => {
  it.each(EVENTS)("builds the <base>/<brand>/<tag>/%s path", (event) => {
    const url = buildDspPixelUrl(event, FULL_CONTEXT, FULL_MACROS);

    expect(url.startsWith(`${FALLBACK_DSP_PIXEL_BASE_URL}/42/tag-123/${event}?`)).toBe(true);
  });

  it("falls back to '1' for an undefined brand and tag segment", () => {
    const url = buildDspPixelUrl("start", { ...FULL_CONTEXT, brandId: undefined, tagId: undefined }, FULL_MACROS);

    expect(url.startsWith(`${FALLBACK_DSP_PIXEL_BASE_URL}/1/1/start?`)).toBe(true);
  });

  it("falls back to '1' for an empty brand and whitespace tag segment", () => {
    const url = buildDspPixelUrl("start", { ...FULL_CONTEXT, brandId: "", tagId: "   " }, FULL_MACROS);

    expect(url.startsWith(`${FALLBACK_DSP_PIXEL_BASE_URL}/1/1/start?`)).toBe(true);
  });

  it("encodes the brand and tag path segments", () => {
    const url = buildDspPixelUrl("complete", { ...FULL_CONTEXT, brandId: "a/b", tagId: "t?d" }, FULL_MACROS);

    expect(url.startsWith(`${FALLBACK_DSP_PIXEL_BASE_URL}/a%2Fb/t%3Fd/complete?`)).toBe(true);
  });

  it("sets the constant src and fill_src to triton", () => {
    const params = new URL(buildDspPixelUrl("start", FULL_CONTEXT, FULL_MACROS)).searchParams;

    expect(params.get("src")).toBe("triton");
    expect(params.get("fill_src")).toBe("triton");
  });

  it("maps ad_id from the context visitId", () => {
    const params = new URL(buildDspPixelUrl("start", FULL_CONTEXT, FULL_MACROS)).searchParams;

    expect(params.get("ad_id")).toBe("visit-abc");
  });

  it("omits ad_id when the visitId is undefined", () => {
    const params = new URL(buildDspPixelUrl("start", { ...FULL_CONTEXT, visitId: undefined }, FULL_MACROS))
      .searchParams;

    expect(params.has("ad_id")).toBe(false);
  });

  it("carries tag_id as a query param in addition to the path segment", () => {
    const params = new URL(buildDspPixelUrl("start", FULL_CONTEXT, FULL_MACROS)).searchParams;

    expect(params.get("tag_id")).toBe("tag-123");
  });

  it("omits the tag_id query param when tagId is undefined (path still falls back to 1)", () => {
    const url = buildDspPixelUrl("start", { ...FULL_CONTEXT, tagId: undefined }, FULL_MACROS);

    expect(url.startsWith(`${FALLBACK_DSP_PIXEL_BASE_URL}/42/1/start?`)).toBe(true);
    expect(new URL(url).searchParams.has("tag_id")).toBe(false);
  });

  it("maps the host-macro app context params", () => {
    const params = new URL(buildDspPixelUrl("start", FULL_CONTEXT, FULL_MACROS)).searchParams;

    expect(params.get("bundle")).toBe("com.test.app");
    expect(params.get("app_name")).toBe("Test App");
    expect(params.get("name_s")).toBe("Test App");
    expect(params.get("store_url")).toBe("https://store.example/app");
    expect(params.get("store_id")).toBe("store-77");
    expect(params.get("dnt")).toBe("0");
  });

  it("omits every host-macro param when the macro bag is empty", () => {
    const params = new URL(buildDspPixelUrl("start", FULL_CONTEXT, {})).searchParams;

    for (const param of ["bundle", "app_name", "name_s", "store_url", "store_id", "dnt"]) {
      expect(params.has(param)).toBe(false);
    }
  });

  it("URL-encodes macro values rather than emitting them raw", () => {
    const url = buildDspPixelUrl("start", FULL_CONTEXT, { appn: "My App & Co", appsu: "https://s.example/a?b=c" });
    const params = new URL(url).searchParams;

    expect(url).not.toContain("My App & Co");
    expect(params.get("app_name")).toBe("My App & Co");
    expect(params.get("store_url")).toBe("https://s.example/a?b=c");
  });

  it("maps the SDK-sourced creative_id, adv and provider params", () => {
    const params = new URL(buildDspPixelUrl("start", FULL_CONTEXT, FULL_MACROS)).searchParams;

    expect(params.get("creative_id")).toBe("creative-9");
    expect(params.get("adv")).toBe("adv.example");
    expect(params.get("provider")).toBe("video");
  });

  it("omits the SDK-sourced optionals when they are absent", () => {
    const context: DspPixelContext = { tagId: "tag-123", brandId: 42, visitId: "visit-abc" };
    const params = new URL(buildDspPixelUrl("start", context, FULL_MACROS)).searchParams;

    expect(params.has("creative_id")).toBe(false);
    expect(params.has("adv")).toBe(false);
    expect(params.has("provider")).toBe(false);
  });

  it("stamps ts and a distinct cachebuster cb on every URL", () => {
    const params = new URL(buildDspPixelUrl("start", FULL_CONTEXT, FULL_MACROS)).searchParams;

    expect(params.get("ts")).toMatch(/^\d+$/);
    const cb = params.get("cb");
    expect(cb).toBeTruthy();
    expect(cb).not.toBe(params.get("ts"));
  });

  it("emits no unresolved literal or 'undefined' text", () => {
    const url = buildDspPixelUrl("start", { tagId: "tag-1", brandId: undefined, visitId: undefined }, {});

    expect(url).not.toContain("undefined");
    expect(url).not.toContain("{");
  });

  it("reads ua and device_language from a present navigator", () => {
    const params = new URL(buildDspPixelUrl("start", FULL_CONTEXT, FULL_MACROS)).searchParams;

    // jsdom always supplies a userAgent + language.
    expect(params.get("ua")).toBeTruthy();
    expect(params.get("device_language")).toBeTruthy();
  });

  describe("navigator guards", () => {
    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it("omits ua and device_language when navigator is undefined", () => {
      vi.stubGlobal("navigator", undefined);

      const params = new URL(buildDspPixelUrl("start", FULL_CONTEXT, FULL_MACROS)).searchParams;

      expect(params.has("ua")).toBe(false);
      expect(params.has("device_language")).toBe(false);
    });

    it("omits ua and device_language when navigator fields are empty strings", () => {
      vi.stubGlobal("navigator", { userAgent: "", language: "" });

      const params = new URL(buildDspPixelUrl("start", FULL_CONTEXT, FULL_MACROS)).searchParams;

      expect(params.has("ua")).toBe(false);
      expect(params.has("device_language")).toBe(false);
    });
  });

  it("falls back to the hostMacros singleton when no macros are passed", () => {
    // The singleton is empty in jsdom (no __CXR_SCRIPT_PARAMS__), so the
    // host-macro params drop out while the constant params still resolve.
    const params = new URL(buildDspPixelUrl("start", FULL_CONTEXT)).searchParams;

    expect(params.get("src")).toBe("triton");
    expect(params.has("bundle")).toBe(false);
  });
});

describe("fireDspPixel", () => {
  let originalImage: typeof Image;
  let originalNodeEnv: string | undefined;

  beforeEach(() => {
    originalImage = globalThis.Image;
    originalNodeEnv = process.env.NODE_ENV;
    // The beacon is production-only; every test below that expects a request
    // must therefore run as a production build.
    process.env.NODE_ENV = "production";
  });

  afterEach(() => {
    globalThis.Image = originalImage;
    process.env.NODE_ENV = originalNodeEnv;
    vi.restoreAllMocks();
  });

  it.each(EVENTS)("fires an Image beacon for the %s event on the right path", (event) => {
    const image = stubImage();

    fireDspPixel(event, FULL_CONTEXT, FULL_MACROS);

    expect(image.srcs).toHaveLength(1);
    expect(image.srcs[0]!.startsWith(`${FALLBACK_DSP_PIXEL_BASE_URL}/42/tag-123/${event}?`)).toBe(true);
  });

  it("is not deduplicated — an ad break may play several ads per session", () => {
    const image = stubImage();

    fireDspPixel("ad_render", FULL_CONTEXT, FULL_MACROS);
    fireDspPixel("start", FULL_CONTEXT, FULL_MACROS);
    fireDspPixel("complete", FULL_CONTEXT, FULL_MACROS);
    fireDspPixel("start", FULL_CONTEXT, FULL_MACROS);

    expect(image.srcs).toHaveLength(4);
  });

  it("no-ops without throwing when Image is unavailable", () => {
    // @ts-expect-error -- simulating a locked-down window with no Image constructor
    globalThis.Image = undefined;

    expect(() => fireDspPixel("start", FULL_CONTEXT, FULL_MACROS)).not.toThrow();
  });

  it("swallows a throwing Image constructor and warns", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    // @ts-expect-error -- test stub that throws on construction
    globalThis.Image = class {
      constructor() {
        throw new Error("blocked by CSP");
      }
    };

    expect(() => fireDspPixel("complete", FULL_CONTEXT, FULL_MACROS)).not.toThrow();
    expect(warn).toHaveBeenCalled();
  });

  it("falls back to the hostMacros singleton when no macros are passed", () => {
    const image = stubImage();

    fireDspPixel("start", FULL_CONTEXT);

    expect(image.srcs).toHaveLength(1);
    expect(image.srcs[0]!.startsWith(`${FALLBACK_DSP_PIXEL_BASE_URL}/42/tag-123/start?`)).toBe(true);
  });

  describe("production-only gate", () => {
    it.each(["qa", "development", "test", undefined])("sends no request when NODE_ENV is %s", (nodeEnv) => {
      const image = stubImage();
      if (nodeEnv === undefined) {
        delete process.env.NODE_ENV;
      } else {
        process.env.NODE_ENV = nodeEnv;
      }

      fireDspPixel("ad_render", FULL_CONTEXT, FULL_MACROS);
      fireDspPixel("complete", FULL_CONTEXT, FULL_MACROS);

      expect(image.srcs).toEqual([]);
    });

    it("does not construct an Image at all outside production", () => {
      let constructed = 0;
      // @ts-expect-error -- test stub, not a full Image implementation
      globalThis.Image = class {
        constructor() {
          constructed += 1;
        }
        set src(_value: string) {}
      };
      process.env.NODE_ENV = "qa";

      fireDspPixel("start", FULL_CONTEXT, FULL_MACROS);

      expect(constructed).toBe(0);
    });
  });
});
