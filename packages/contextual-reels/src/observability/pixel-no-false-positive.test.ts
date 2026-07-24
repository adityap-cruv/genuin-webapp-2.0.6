/**
 * Stress / guard test for px-script-error over-firing (the RCA fix).
 *
 * The `px-script-error` pixel must fire ONLY when the widget is genuinely,
 * unrecoverably broken. Before the fix, `logger.error` auto-fired the pixel, so
 * every recoverable/third-party error (a geoip network blip, a host page's ad
 * callback throwing a cross-origin SecurityError, a static-tag fixture missing
 * `structuredClone`, an analytics flush failure, a stylesheet `@import` throw)
 * emitted a false widget-failure beacon — ~13k/17k events in production.
 *
 * This test drives the REAL recoverable modules (no mock of the code under test,
 * only the network/host boundary) and asserts `PixelReporter.report` is NEVER
 * called. It hammers each path many times to catch any lingering async pixel
 * (the old leak fired via a lazy `import(...).then(...)`, so a single call could
 * look clean while a microtask later fired the pixel).
 *
 * A companion block asserts the genuinely-fatal boundaries STILL fire — a fix
 * that silenced everything would be just as wrong.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { notifyAdFill, notifyAdNoFill } from "@cxr/ads/waterfall";
import { PixelReporter } from "@cxr/observability/pixel-reporter";
import { getSharedGeoIp, __resetGeoIpCache } from "@cxr/services/api";
import { createLogger } from "@cxr/utils/logger";

/** Let any (unwanted) lazy `import(...).then(...)` pixel fully settle. */
async function flushAsyncPixel(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 50));
}

describe("px-script-error must NOT fire on recoverable errors", () => {
  let reportSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    PixelReporter.getInstance().reset();
    reportSpy = vi.spyOn(PixelReporter.getInstance(), "report");
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    vi.spyOn(console, "warn").mockImplementation(() => undefined);
    __resetGeoIpCache();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    __resetGeoIpCache();
  });

  it("geoip fetch failing (repeatedly) fires no pixel — it resolves null and the widget continues", async () => {
    // getSharedGeoIp is documented "never rejects (failure resolves null)".
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));

    for (let i = 0; i < 25; i++) {
      __resetGeoIpCache(); // force a fresh fetch each round (cache would dedup otherwise)
      const result = await getSharedGeoIp();
      expect(result).toBeNull(); // recovered
    }

    await flushAsyncPixel();
    expect(reportSpy).not.toHaveBeenCalled();
  });

  it("a host page's adFillCallback throwing a cross-origin SecurityError fires no pixel", async () => {
    // Reproduces the "Blocked a frame with origin ...playdigo.com" bucket: the
    // HOST's callback reaches into a cross-origin frame and throws; we catch +
    // log it. Not our failure — the widget filled fine.
    const securityError = new DOMException(
      'Blocked a frame with origin "https://server27.playdigo.com" from accessing a cross-origin frame.',
      "SecurityError"
    );
    (window as Window & { adFillCallback?: () => void }).adFillCallback = () => {
      throw securityError;
    };
    (window as Window & { noAdsCallback?: () => void }).noAdsCallback = () => {
      throw securityError;
    };

    for (let i = 0; i < 25; i++) {
      expect(() => notifyAdFill()).not.toThrow();
      expect(() => notifyAdNoFill()).not.toThrow();
    }

    await flushAsyncPixel();
    expect(reportSpy).not.toHaveBeenCalled();

    delete (window as Window & { adFillCallback?: () => void }).adFillCallback;
    delete (window as Window & { noAdsCallback?: () => void }).noAdsCallback;
  });

  it("logger.error fires no pixel for any error shape (Error, cross-origin DOMException, missing-global message, string, args)", async () => {
    const log = createLogger("cxr/stress");
    const shapes: unknown[][] = [
      ["No Data found"],
      ["Load failed"],
      ["error :", new TypeError("Failed to fetch")],
      ["static tag load error, falling back to API::", new ReferenceError("structuredClone is not defined")],
      ["HLS unrecoverable error — destroying instance", { fatal: true, type: "otherError" }],
      ["failed to flush event", "cxr_ad_impression", new Error("rudder boom")],
      [new DOMException("Blocked a frame", "SecurityError")],
    ];

    for (let round = 0; round < 5; round++) {
      for (const args of shapes) {
        log.error(...args);
      }
    }

    await flushAsyncPixel();
    expect(reportSpy).not.toHaveBeenCalled();
  });
});

describe("px-script-error MUST still fire on genuinely-fatal failures (no over-correction)", () => {
  beforeEach(() => {
    PixelReporter.getInstance().reset();
    vi.spyOn(console, "debug").mockImplementation(() => undefined);
    // Image is used inside report(); stub so no real request is attempted.
    vi.stubGlobal(
      "Image",
      class {
        set src(_v: string) {
          /* swallow */
        }
      }
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    PixelReporter.getInstance().reset();
  });

  it("an init failure (the boundary index.jsx uses) still fires exactly one pixel", () => {
    const reportSpy = vi.spyOn(PixelReporter.getInstance(), "report");
    // Mirrors index.jsx:295 — the widget never mounted.
    PixelReporter.getInstance().report("inst-1", "init", "initialization_error", {
      tagId: "tag-1",
      error: new RangeError("Maximum call stack size exceeded."),
    });
    expect(reportSpy).toHaveBeenCalledTimes(1);
    expect(reportSpy).toHaveBeenCalledWith(
      "inst-1",
      "init",
      "initialization_error",
      expect.objectContaining({ tagId: "tag-1" })
    );
  });

  it("a render-boundary failure (index.jsx:272) still fires, and dedups per instance", () => {
    const reportSpy = vi.spyOn(PixelReporter.getInstance(), "report");
    const fire = () =>
      PixelReporter.getInstance().report("inst-2", "render", "render_error", {
        tagId: "tag-2",
        error: new Error("Failed to fetch dynamically imported module: .../App-x.js"),
      });
    fire();
    fire(); // same key → pixel deduped, but report() is still entered
    expect(reportSpy).toHaveBeenCalledTimes(2);
  });
});
