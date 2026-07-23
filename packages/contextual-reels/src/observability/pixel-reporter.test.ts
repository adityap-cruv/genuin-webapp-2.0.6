import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { getInstanceRegistry } from "@cxr/instance/registry/InstanceRegistry";
import { PAGE_LEVEL_KEY, PixelReporter, fireTagInitPixel } from "@cxr/observability/pixel-reporter";

describe("PixelReporter", () => {
  let originalImage: typeof Image;

  beforeEach(() => {
    originalImage = globalThis.Image;
    PixelReporter.getInstance().reset();
  });

  afterEach(() => {
    globalThis.Image = originalImage;
  });

  it("fires a pixel with error_type and stage in the query string", () => {
    const reporter = PixelReporter.getInstance();
    let capturedSrc = "";
    // @ts-expect-error -- test stub, not a full Image implementation
    globalThis.Image = class {
      set src(value: string) {
        capturedSrc = value;
      }
    };

    reporter.report("instance-1", "render", "render_error");

    expect(capturedSrc).toContain("error_type=render_error");
    expect(capturedSrc).toContain("error_stage=render");
  });

  it("fires only once for the same instanceId", () => {
    const reporter = PixelReporter.getInstance();
    let fireCount = 0;
    // @ts-expect-error -- test stub, not a full Image implementation
    globalThis.Image = class {
      set src(_value: string) {
        fireCount += 1;
      }
    };

    reporter.report("instance-1", "init", "initialization_error");
    reporter.report("instance-1", "render", "render_error");
    reporter.report("instance-1", "runtime", "runtime_error");

    expect(fireCount).toBe(1);
  });

  it("fires independently for different instanceIds", () => {
    const reporter = PixelReporter.getInstance();
    let fireCount = 0;
    // @ts-expect-error -- test stub, not a full Image implementation
    globalThis.Image = class {
      set src(_value: string) {
        fireCount += 1;
      }
    };

    reporter.report("instance-1", "init", "initialization_error");
    reporter.report("instance-2", "init", "initialization_error");

    expect(fireCount).toBe(2);
  });

  it("uses the page-level key when instanceId is undefined", () => {
    const reporter = PixelReporter.getInstance();
    let fireCount = 0;
    // @ts-expect-error -- test stub, not a full Image implementation
    globalThis.Image = class {
      set src(_value: string) {
        fireCount += 1;
      }
    };

    reporter.report(undefined, "sdk_load", "network_error");
    reporter.report(undefined, "sdk_load", "network_error");

    expect(fireCount).toBe(1);
    expect(PAGE_LEVEL_KEY).toBe("__page__");
  });

  it("never throws even if Image construction fails", () => {
    const reporter = PixelReporter.getInstance();
    // @ts-expect-error -- test stub, not a full Image implementation
    globalThis.Image = class {
      constructor() {
        throw new Error("boom");
      }
    };
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    expect(() => reporter.report("instance-3", "runtime", "runtime_error")).not.toThrow();
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  // ── px-script-error URL shape ────────────────────────────────────────────

  describe("pixel URL shape", () => {
    let capturedSrc: string;

    beforeEach(() => {
      capturedSrc = "";
      // @ts-expect-error -- test stub, not a full Image implementation
      globalThis.Image = class {
        set src(value: string) {
          capturedSrc = value;
        }
      };
    });

    afterEach(() => {
      delete (window as { __CXR_SCRIPT_PARAMS__?: string }).__CXR_SCRIPT_PARAMS__;
      delete (window as { __CXR_BUILD_ID__?: string }).__CXR_BUILD_ID__;
    });

    it("puts brandId/tagId as path segments, falling back to 1/0 when absent", () => {
      PixelReporter.getInstance().report("instance-1", "init", "initialization_error", {
        brandId: 42,
        tagId: "tag-abc",
      });

      const url = new URL(capturedSrc);
      expect(url.pathname).toBe("/goservices/dsp/pixel/42/tag-abc/px-script-error");
    });

    it("falls back to 1/1 in the path when brandId/tagId are not provided (server rejects 0)", () => {
      PixelReporter.getInstance().report("instance-1", "init", "initialization_error");

      const url = new URL(capturedSrc);
      expect(url.pathname).toBe("/goservices/dsp/pixel/1/1/px-script-error");
    });

    it("uses the initial loader tagId from window.__CXR_SCRIPT_PARAMS__ when no tagId is passed", () => {
      (window as { __CXR_SCRIPT_PARAMS__?: string }).__CXR_SCRIPT_PARAMS__ = "tagId=loader-tag";

      PixelReporter.getInstance().report("instance-1", "init", "initialization_error");

      const url = new URL(capturedSrc);
      expect(url.pathname).toBe("/goservices/dsp/pixel/1/loader-tag/px-script-error");
    });

    it("resolves host macros from window.__CXR_SCRIPT_PARAMS__ into query params", () => {
      (window as { __CXR_SCRIPT_PARAMS__?: string }).__CXR_SCRIPT_PARAMS__ =
        "appn=com.example.app&country=US&ifa=abc-123";

      PixelReporter.getInstance().report("instance-1", "init", "initialization_error");

      const url = new URL(capturedSrc);
      expect(url.searchParams.get("appn")).toBe("com.example.app");
      expect(url.searchParams.get("country")).toBe("US");
      // ifa fans out to its three aliases.
      expect(url.searchParams.get("ifa")).toBe("abc-123");
      expect(url.searchParams.get("appidfa")).toBe("abc-123");
      expect(url.searchParams.get("appaid")).toBe("abc-123");
      expect(url.searchParams.get("deviceid")).toBe("abc-123");
    });

    it("passes through extra cleaned host macros from the loader bag", () => {
      (window as { __CXR_SCRIPT_PARAMS__?: string }).__CXR_SCRIPT_PARAMS__ = "appn=com.example.app&foo=bar&baz=qux";

      PixelReporter.getInstance().report("instance-1", "init", "initialization_error");

      const url = new URL(capturedSrc);
      expect(url.searchParams.get("foo")).toBe("bar");
      expect(url.searchParams.get("baz")).toBe("qux");
    });

    it("omits host macros that the host never resolved instead of inventing zero values", () => {
      (window as { __CXR_SCRIPT_PARAMS__?: string }).__CXR_SCRIPT_PARAMS__ = "appn=~appn~&appv=";

      PixelReporter.getInstance().report("instance-1", "init", "initialization_error");

      const url = new URL(capturedSrc);
      expect(url.searchParams.has("appn")).toBe(false);
      expect(url.searchParams.has("appv")).toBe(false);
      expect(url.searchParams.has("appb")).toBe(false);
      expect(url.searchParams.has("gdpr_consent")).toBe(false);
    });

    it("includes width/height as w/h, falling back to 0", () => {
      PixelReporter.getInstance().report("instance-1", "render", "render_error", { width: 320, height: 50 });

      const url = new URL(capturedSrc);
      expect(url.searchParams.get("w")).toBe("320");
      expect(url.searchParams.get("h")).toBe("50");

      PixelReporter.getInstance().reset();
      PixelReporter.getInstance().report("instance-2", "render", "render_error");
      const url2 = new URL(capturedSrc);
      expect(url2.searchParams.get("w")).toBe("0");
      expect(url2.searchParams.get("h")).toBe("0");
    });

    it("always sets ho=1", () => {
      PixelReporter.getInstance().report("instance-1", "init", "initialization_error");
      expect(new URL(capturedSrc).searchParams.get("ho")).toBe("1");
    });

    it("includes reason from a thrown Error", () => {
      PixelReporter.getInstance().report("instance-1", "init", "initialization_error", {
        error: new Error("mount failed"),
      });

      expect(new URL(capturedSrc).searchParams.get("error_reason")).toBe("mount failed");
    });

    it("includes reason from a logger-style args array (last Error wins)", () => {
      PixelReporter.getInstance().report("instance-1", "runtime", "runtime_error", {
        error: ["something broke", new Error("underlying cause")],
      });

      expect(new URL(capturedSrc).searchParams.get("error_reason")).toBe("underlying cause");
    });

    it("falls back to a string arg when no Error is present in the args array", () => {
      PixelReporter.getInstance().report("instance-1", "runtime", "runtime_error", {
        error: ["plain string reason"],
      });

      expect(new URL(capturedSrc).searchParams.get("error_reason")).toBe("plain string reason");
    });

    it("truncates a reason longer than 200 chars", () => {
      const longMessage = "x".repeat(300);
      PixelReporter.getInstance().report("instance-1", "init", "initialization_error", {
        error: new Error(longMessage),
      });

      const reason = new URL(capturedSrc).searchParams.get("error_reason");
      expect(reason).toHaveLength(200);
    });

    it("omits the reason param entirely when no error context is provided", () => {
      PixelReporter.getInstance().report("instance-1", "init", "initialization_error");

      expect(new URL(capturedSrc).searchParams.has("error_reason")).toBe(false);
    });

    it("omits the reason param when the error context yields nothing usable", () => {
      PixelReporter.getInstance().report("instance-1", "init", "initialization_error", { error: { weird: "object" } });

      expect(new URL(capturedSrc).searchParams.has("error_reason")).toBe(false);
    });

    it("stamps bid from window.__CXR_BUILD_ID__ on the pixel", () => {
      (window as { __CXR_BUILD_ID__?: string }).__CXR_BUILD_ID__ = "Dk3f9Xa2.b1e05db";

      PixelReporter.getInstance().report("instance-1", "init", "initialization_error");

      const url = new URL(capturedSrc);
      expect(url.searchParams.get("bid")).toBe("Dk3f9Xa2.b1e05db");
    });

    it("defaults bid to 0 when no build id global is present", () => {
      delete (window as { __CXR_BUILD_ID__?: string }).__CXR_BUILD_ID__;

      PixelReporter.getInstance().report("instance-1", "init", "initialization_error");

      const url = new URL(capturedSrc);
      expect(url.searchParams.get("bid")).toBe("0");
    });
  });

  // ── best-effort ad passback ───────────────────────────────────────────────

  describe("ad passback notification", () => {
    beforeEach(() => {
      // @ts-expect-error -- test stub, not a full Image implementation
      globalThis.Image = class {
        set src(_value: string) {}
      };
    });

    afterEach(() => {
      delete (window as Window & { noAdsCallback?: () => void }).noAdsCallback;
    });

    it("calls window.noAdsCallback on every reported failure", () => {
      const noAdsCallback = vi.fn();
      (window as Window & { noAdsCallback?: () => void }).noAdsCallback = noAdsCallback;

      PixelReporter.getInstance().report("instance-1", "render", "render_error");

      expect(noAdsCallback).toHaveBeenCalledTimes(1);
    });

    it("does not throw when window.noAdsCallback is absent", () => {
      expect(() => PixelReporter.getInstance().report("instance-1", "render", "render_error")).not.toThrow();
    });
  });

  // ── instance destroy on failure ───────────────────────────────────────────

  describe("widget instance destroy", () => {
    beforeEach(() => {
      // @ts-expect-error -- test stub, not a full Image implementation
      globalThis.Image = class {
        set src(_value: string) {}
      };
    });

    it("calls the registered destroy control for the reported instanceId", () => {
      const destroy = vi.fn();
      getInstanceRegistry().register("instance-1", { destroy });

      PixelReporter.getInstance().report("instance-1", "init", "initialization_error");

      expect(destroy).toHaveBeenCalledTimes(1);
      getInstanceRegistry().unregister("instance-1");
    });

    it("does not throw when no instance is registered for the instanceId", () => {
      expect(() =>
        PixelReporter.getInstance().report("no-such-instance", "init", "initialization_error")
      ).not.toThrow();
    });

    it("does not throw when instanceId is undefined (page-level sdk_load stage)", () => {
      expect(() => PixelReporter.getInstance().report(undefined, "sdk_load", "network_error")).not.toThrow();
    });

    it("does not throw when the destroy control itself throws", () => {
      const destroy = vi.fn(() => {
        throw new Error("boom");
      });
      getInstanceRegistry().register("instance-1", { destroy });
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      expect(() => PixelReporter.getInstance().report("instance-1", "init", "initialization_error")).not.toThrow();
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
      getInstanceRegistry().unregister("instance-1");
    });
  });

  // ── px-ti (tag_init) pixel ────────────────────────────────────────────────

  describe("fireTagInitPixel", () => {
    let capturedSrc: string;

    beforeEach(() => {
      capturedSrc = "";
      // @ts-expect-error -- test stub, not a full Image implementation
      globalThis.Image = class {
        set src(value: string) {
          capturedSrc = value;
        }
      };
    });

    afterEach(() => {
      delete (window as { __CXR_SCRIPT_PARAMS__?: string }).__CXR_SCRIPT_PARAMS__;
      delete (window as { __CXR_BUILD_ID__?: string }).__CXR_BUILD_ID__;
    });

    it("fires the px-ti pixel with brandId/tagId as path segments", () => {
      fireTagInitPixel({ brandId: 42, tagId: "tag-abc" });

      const url = new URL(capturedSrc);
      expect(url.pathname).toBe("/goservices/dsp/pixel/42/tag-abc/px-ti");
    });

    it("falls back to brand 1 in the path when brandId is not resolved yet", () => {
      fireTagInitPixel({ tagId: "tag-abc" });

      const url = new URL(capturedSrc);
      expect(url.pathname).toBe("/goservices/dsp/pixel/1/tag-abc/px-ti");
    });

    it("falls back to the loader tagId, then 1, when no tagId is passed (server rejects 0)", () => {
      fireTagInitPixel();
      expect(new URL(capturedSrc).pathname).toBe("/goservices/dsp/pixel/1/1/px-ti");

      (window as { __CXR_SCRIPT_PARAMS__?: string }).__CXR_SCRIPT_PARAMS__ = "tagId=loader-tag";
      fireTagInitPixel();
      expect(new URL(capturedSrc).pathname).toBe("/goservices/dsp/pixel/1/loader-tag/px-ti");
    });

    it("resolves host macros from window.__CXR_SCRIPT_PARAMS__ into query params", () => {
      (window as { __CXR_SCRIPT_PARAMS__?: string }).__CXR_SCRIPT_PARAMS__ =
        "appn=com.example.app&country=US&ifa=abc-123";

      fireTagInitPixel({ tagId: "tag-abc" });

      const url = new URL(capturedSrc);
      expect(url.searchParams.get("appn")).toBe("com.example.app");
      expect(url.searchParams.get("country")).toBe("US");
      expect(url.searchParams.get("ifa")).toBe("abc-123");
      expect(url.searchParams.get("appidfa")).toBe("abc-123");
    });

    it("defaults passback to 0 and mirrors an explicit value", () => {
      fireTagInitPixel({ tagId: "tag-abc" });
      expect(new URL(capturedSrc).searchParams.get("passback")).toBe("0");

      fireTagInitPixel({ tagId: "tag-abc", passback: 1 });
      expect(new URL(capturedSrc).searchParams.get("passback")).toBe("1");
    });

    it("stamps bid from window.__CXR_BUILD_ID__, defaulting to 0", () => {
      fireTagInitPixel({ tagId: "tag-abc" });
      expect(new URL(capturedSrc).searchParams.get("bid")).toBe("0");

      (window as { __CXR_BUILD_ID__?: string }).__CXR_BUILD_ID__ = "Dk3f9Xa2.b1e05db";
      fireTagInitPixel({ tagId: "tag-abc" });
      expect(new URL(capturedSrc).searchParams.get("bid")).toBe("Dk3f9Xa2.b1e05db");
    });

    it("never throws when Image construction fails", () => {
      // @ts-expect-error -- test stub that throws on construction
      globalThis.Image = class {
        constructor() {
          throw new Error("Image blocked");
        }
      };
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      expect(() => fireTagInitPixel({ tagId: "tag-abc" })).not.toThrow();
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it("no-ops when Image is unavailable (locked-down WebView)", () => {
      // @ts-expect-error -- simulate a runtime with no Image constructor
      globalThis.Image = undefined;

      expect(() => fireTagInitPixel({ tagId: "tag-abc" })).not.toThrow();
      expect(capturedSrc).toBe("");
    });
  });
});
