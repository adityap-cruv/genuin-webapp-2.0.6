import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { HostMacros } from "@cxr/hostMacros";
import { ADELEMENT_PIXEL_URL, buildAdElementPixelUrl, fireAdElementPixel } from "@cxr/observability/adelement-pixel";

/** Full macro bag — every param the AdElement pixel can carry is resolved. */
const FULL_MACROS: HostMacros = {
  aid: "placement-1",
  seller: "seller-9",
  rid: "req-abc",
  appn: "Test App",
  appv: "1.2.3",
  appb: "com.test.app",
  appsu: "https://store.example/app",
  ifa: "IFA-123",
  appsi: "store-77",
  appc: "app-cat",
  country: "US",
  loc: "loc-str",
  loclong: "-122.4",
  loclat: "37.7",
  dnt: "0",
  gdpr: "1",
  gdpr_consent: "consent-str",
  us_privacy: "1---",
  c1: "one",
  c2: "two",
  c3: "three",
  c6: "six",
  c7: "seven",
  c8: "eight",
  c9: "nine",
  c10: "ten",
  c11: "eleven",
  c12: "twelve",
  c13: "thirteen",
  c14: "fourteen",
};

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

describe("buildAdElementPixelUrl", () => {
  it("points at the AdElement endpoint", () => {
    const url = buildAdElementPixelUrl("start_gen", FULL_MACROS);

    expect(url.startsWith(`${ADELEMENT_PIXEL_URL}?`)).toBe(true);
    expect(ADELEMENT_PIXEL_URL).toBe("https://b.adelement.com/v");
  });

  it.each([
    ["start_gen", "start_gen"],
    ["complete_gen", "complete_gen"],
  ] as const)("stamps ev=%s", (event, expected) => {
    const params = new URL(buildAdElementPixelUrl(event, FULL_MACROS)).searchParams;

    expect(params.get("ev")).toBe(expected);
  });

  it("sends the fixed w/h/ho params", () => {
    const params = new URL(buildAdElementPixelUrl("start_gen", FULL_MACROS)).searchParams;

    expect(params.get("w")).toBe("320");
    expect(params.get("h")).toBe("50");
    expect(params.get("ho")).toBe("1");
  });

  it("maps p/sid/cb from the aid/seller/rid host macros", () => {
    const params = new URL(buildAdElementPixelUrl("start_gen", FULL_MACROS)).searchParams;

    expect(params.get("p")).toBe("placement-1");
    expect(params.get("sid")).toBe("seller-9");
    expect(params.get("cb")).toBe("req-abc");
  });

  it("mirrors the ifa macro onto all four IFA aliases", () => {
    const params = new URL(buildAdElementPixelUrl("start_gen", FULL_MACROS)).searchParams;

    expect(params.get("ifa")).toBe("IFA-123");
    expect(params.get("appidfa")).toBe("IFA-123");
    expect(params.get("appaid")).toBe("IFA-123");
    expect(params.get("deviceid")).toBe("IFA-123");
  });

  it("mirrors the appb macro onto d", () => {
    const params = new URL(buildAdElementPixelUrl("start_gen", FULL_MACROS)).searchParams;

    expect(params.get("appb")).toBe("com.test.app");
    expect(params.get("d")).toBe("com.test.app");
  });

  it("forwards the privacy, geo, app and custom c* params", () => {
    const params = new URL(buildAdElementPixelUrl("start_gen", FULL_MACROS)).searchParams;

    expect(params.get("dnt")).toBe("0");
    expect(params.get("gdpr")).toBe("1");
    expect(params.get("gdpr_consent")).toBe("consent-str");
    expect(params.get("us_privacy")).toBe("1---");
    expect(params.get("country")).toBe("US");
    expect(params.get("loclat")).toBe("37.7");
    expect(params.get("loclong")).toBe("-122.4");
    expect(params.get("loc")).toBe("loc-str");
    expect(params.get("appn")).toBe("Test App");
    expect(params.get("appv")).toBe("1.2.3");
    expect(params.get("appsu")).toBe("https://store.example/app");
    expect(params.get("appsi")).toBe("store-77");
    expect(params.get("appc")).toBe("app-cat");
    expect(params.get("c1")).toBe("one");
    expect(params.get("c14")).toBe("fourteen");
  });

  it("URL-encodes macro values rather than emitting them raw", () => {
    const url = buildAdElementPixelUrl("start_gen", { appn: "My App & Co", appsu: "https://s.example/a?b=c" });

    expect(url).not.toContain("My App & Co");
    const params = new URL(url).searchParams;
    expect(params.get("appn")).toBe("My App & Co");
    expect(params.get("appsu")).toBe("https://s.example/a?b=c");
  });

  it("omits every param whose host macro is absent, keeping only ev/w/h/ho", () => {
    const url = buildAdElementPixelUrl("complete_gen", {});
    const params = new URL(url).searchParams;

    expect([...params.keys()].sort()).toEqual(["ev", "h", "ho", "w"]);
    expect(url).not.toContain("{aid}");
    expect(url).not.toContain("undefined");
  });

  it("omits only the missing macros when the bag is partial", () => {
    const params = new URL(buildAdElementPixelUrl("start_gen", { ifa: "IFA-9", country: "IN" })).searchParams;

    expect(params.get("ifa")).toBe("IFA-9");
    expect(params.get("deviceid")).toBe("IFA-9");
    expect(params.get("country")).toBe("IN");
    expect(params.has("p")).toBe(false);
    expect(params.has("appb")).toBe(false);
    expect(params.has("d")).toBe(false);
  });
});

describe("fireAdElementPixel", () => {
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

  it("fires an Image beacon carrying ev=start_gen", () => {
    const image = stubImage();

    fireAdElementPixel("start_gen", FULL_MACROS);

    expect(image.srcs).toHaveLength(1);
    expect(new URL(image.srcs[0]!).searchParams.get("ev")).toBe("start_gen");
  });

  it("fires an Image beacon carrying ev=complete_gen", () => {
    const image = stubImage();

    fireAdElementPixel("complete_gen", FULL_MACROS);

    expect(image.srcs).toHaveLength(1);
    expect(new URL(image.srcs[0]!).searchParams.get("ev")).toBe("complete_gen");
  });

  it("is not deduplicated — an ad break may play several ads per session", () => {
    const image = stubImage();

    fireAdElementPixel("start_gen", FULL_MACROS);
    fireAdElementPixel("complete_gen", FULL_MACROS);
    fireAdElementPixel("start_gen", FULL_MACROS);
    fireAdElementPixel("complete_gen", FULL_MACROS);

    expect(image.srcs).toHaveLength(4);
  });

  it("no-ops without throwing when Image is unavailable", () => {
    // @ts-expect-error -- simulating a locked-down window with no Image constructor
    globalThis.Image = undefined;

    expect(() => fireAdElementPixel("start_gen", FULL_MACROS)).not.toThrow();
  });

  it("swallows a throwing Image constructor so the ad lifecycle is unaffected", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    // @ts-expect-error -- test stub that throws on construction
    globalThis.Image = class {
      constructor() {
        throw new Error("blocked by CSP");
      }
    };

    expect(() => fireAdElementPixel("complete_gen", FULL_MACROS)).not.toThrow();
    expect(warn).toHaveBeenCalled();
  });

  it("falls back to the hostMacros singleton when no macros are passed", () => {
    const image = stubImage();

    fireAdElementPixel("start_gen");

    expect(image.srcs).toHaveLength(1);
    expect(new URL(image.srcs[0]!).searchParams.get("ev")).toBe("start_gen");
  });

  describe("production-only gate", () => {
    // QA is the case that matters: Vite sets `import.meta.env.PROD` true for
    // `build:qa` as well, so gating on that instead of NODE_ENV would leak QA
    // ad plays into AdElement's live reporting.
    it.each(["qa", "development", "test", undefined])("sends no request when NODE_ENV is %s", (nodeEnv) => {
      const image = stubImage();
      if (nodeEnv === undefined) {
        delete process.env.NODE_ENV;
      } else {
        process.env.NODE_ENV = nodeEnv;
      }

      fireAdElementPixel("start_gen", FULL_MACROS);
      fireAdElementPixel("complete_gen", FULL_MACROS);

      expect(image.srcs).toEqual([]);
    });

    it("sends the request when NODE_ENV is production", () => {
      const image = stubImage();
      process.env.NODE_ENV = "production";

      fireAdElementPixel("start_gen", FULL_MACROS);

      expect(image.srcs).toHaveLength(1);
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

      fireAdElementPixel("start_gen", FULL_MACROS);

      expect(constructed).toBe(0);
    });
  });
});
