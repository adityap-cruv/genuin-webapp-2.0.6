/**
 * Tests for src/config.ts — merged from config/env, config/constants,
 * config/adLayouts, config/tagAllowLists tests.
 */
import { afterEach, describe, it, expect, vi } from "vitest";

import * as config from "@cxr/config";
import {
  AD_LAYOUT,
  adLayoutVariants,
  resolveAdLayout,
  RUDDER_SNIPPET_VERSION,
  RUDDER_SDK_BASE_URL,
  isGenAiAllowed,
  isAdBreakEnabled,
  isIframe,
  hasStackedVariant,
  shouldUseStackedLayout,
  resolveStackedLayout,
  isLocalhost,
  getScriptParam,
  STACKED_LAYOUT_TAG_ID,
  STACKED_LAYOUT_TAGS,
  STACKED_VARIANT_PARAM,
  type AdLayoutId,
} from "@cxr/config";

/** The 300×600 tag registered for the stacked layout. */
const TAG_300x600 = "69b298e3d6a6ad57e7b9a464";

// ─── env constants ────────────────────────────────────────────────────────────

describe("config/env", () => {
  it("matches the production constants snapshot", () => {
    expect({
      apiurl: config.apiurl,
      hostname: config.hostname,
      rudderstackKey: config.rudderstackKey,
      rudderstackLink: config.rudderstackLink,
      env: config.env,
      assetLink: config.assetLink,
      rootTagId: config.rootTagId,
      appStoreLink: config.appStoreLink,
      appleAppStoreLink: config.appleAppStoreLink,
      googlePlayStoreLink: config.googlePlayStoreLink,
      hireLink: config.hireLink,
      investLink: config.investLink,
    }).toMatchInlineSnapshot(`
      {
        "apiurl": "https://api.begenuin.com",
        "appStoreLink": "https://install.begenuin.com/86sn/cgs",
        "appleAppStoreLink": "https://apps.apple.com/US/app/id1511177838?mt=8",
        "assetLink": "https://media.begenuin.com/webapp_assets/",
        "env": "prod",
        "googlePlayStoreLink": "https://play.google.com/store/apps/details?id=com.begenuin.begenuin",
        "hireLink": "https://www.linkedin.com/jobs/genuin-jobs-worldwide?f_C=11153452",
        "hostname": "https://begenuin.com",
        "investLink": "https://www.linkedin.com/company/begenuin/",
        "rootTagId": "gen-ext",
        "rudderstackKey": "",
        "rudderstackLink": "https://etr.begenuin.com",
      }
    `);
  });
});

// ─── SDK constants ────────────────────────────────────────────────────────────

describe("config/constants", () => {
  it("locks the Rudderstack snippet version", () => {
    expect(RUDDER_SNIPPET_VERSION).toBe("3.0.3");
  });

  it("locks the Rudderstack SDK base URL", () => {
    expect(RUDDER_SDK_BASE_URL).toBe("https://cdn.rudderlabs.com/v3");
  });
});

// ─── Ad layout resolver ───────────────────────────────────────────────────────

describe("config/adLayouts", () => {
  it("exposes the canonical variants", () => {
    expect(adLayoutVariants).toEqual([
      { id: AD_LAYOUT.L1, width: 300, height: 600 },
      { id: AD_LAYOUT.L2, width: 300, height: 250 },
      { id: AD_LAYOUT.L3, width: 320, height: 50 },
      { id: AD_LAYOUT.L4, width: 320, height: 100 },
    ]);
  });

  it("returns AD_LAYOUT.Unknown when either dimension is zero or missing", () => {
    expect(resolveAdLayout(0, 600)).toBe(AD_LAYOUT.Unknown);
    expect(resolveAdLayout(300, 0)).toBe(AD_LAYOUT.Unknown);
    expect(resolveAdLayout()).toBe(AD_LAYOUT.Unknown);
  });

  it.each<[number, number, AdLayoutId]>([
    [300, 600, AD_LAYOUT.L1],
    [300, 250, AD_LAYOUT.L2],
    [320, 50, AD_LAYOUT.L3],
    [320, 100, AD_LAYOUT.L4],
  ])("resolves %dx%d to layout id %i", (w, h, expected) => {
    expect(resolveAdLayout(w, h)).toBe(expected);
  });

  it("returns AD_LAYOUT.Unknown for non-pixel-perfect sizes", () => {
    expect(resolveAdLayout(301, 600)).toBe(AD_LAYOUT.Unknown);
    expect(resolveAdLayout(300, 599)).toBe(AD_LAYOUT.Unknown);
    expect(resolveAdLayout(640, 480)).toBe(AD_LAYOUT.Unknown);
  });
});

// ─── Tag allow lists ──────────────────────────────────────────────────────────

describe("config/tagAllowLists", () => {
  it("returns false for unknown GenAI ids", () => {
    expect(isGenAiAllowed("not-a-real-id")).toBe(false);
    expect(isGenAiAllowed("")).toBe(false);
  });
});

// ─── Fullscreen ad break flag ─────────────────────────────────────────────────

describe("config/fullscreenAdBreak", () => {
  it("enables the fullscreen ad break for a configured tag id", () => {
    expect(isAdBreakEnabled("6a391232d73aa25887ac2af3")).toBe(true);
  });

  it("rejects unlisted and empty tag ids", () => {
    expect(isAdBreakEnabled("not-a-listed-tag")).toBe(false);
    expect(isAdBreakEnabled("")).toBe(false);
  });
});

// ─── Stacked layout ───────────────────────────────────────────────────────────

describe("config/stackedLayout", () => {
  /**
   * Stub the frame chain that {@link hasStackedVariant} walks.
   *
   * `current` is our own frame's query string; `top` is the ancestor frame's.
   * Both are exposed as `location.href` (a full URL) so the ancestor walk and
   * `URL` parsing behave like production. Passing `top === "throw"` makes the
   * ancestor frame's `location` throw a cross-origin `SecurityError`.
   * `hostname` feeds {@link isLocalhost}; `referrer` stubs `document.referrer`.
   */
  function setSearch(current: string, top?: string, hostname = "example.com", referrer = "") {
    const host = `http://${hostname}/page`;
    const parentFrame: { parent?: unknown; location: { get href(): string } } = {
      location: {
        get href() {
          if (top === "throw") throw new Error("SecurityError: cross-origin");
          return `${host}${top ?? ""}`;
        },
      },
    };
    // Top frame points to itself so the ancestor walk terminates.
    parentFrame.parent = parentFrame;

    Object.defineProperty(window, "location", {
      configurable: true,
      value: { href: `${host}${current}`, search: current, hostname },
    });
    Object.defineProperty(window, "parent", {
      configurable: true,
      get: () => parentFrame,
    });
    Object.defineProperty(window, "top", {
      configurable: true,
      get: () => parentFrame,
    });
    Object.defineProperty(document, "referrer", {
      configurable: true,
      get: () => referrer,
    });
  }

  afterEach(() => {
    Object.defineProperty(window, "location", {
      configurable: true,
      value: { href: "http://example.com/", search: "", hostname: "example.com" },
    });
    Object.defineProperty(window, "parent", { configurable: true, get: () => window });
    Object.defineProperty(window, "top", { configurable: true, get: () => window });
    Object.defineProperty(document, "referrer", { configurable: true, get: () => "" });
    delete (window as { __CXR_SCRIPT_PARAMS__?: string }).__CXR_SCRIPT_PARAMS__;
  });

  it("detects gen_variant=stacked in the current frame", () => {
    setSearch("?gen_variant=stacked");
    expect(hasStackedVariant()).toBe(true);
  });

  it("detects gen_variant=stacked in the top frame when absent here", () => {
    setSearch("?foo=bar", "?gen_variant=stacked");
    expect(hasStackedVariant()).toBe(true);
  });

  it("returns false when the param is absent in both frames", () => {
    setSearch("?gen_variant=default", "?other=1");
    expect(hasStackedVariant()).toBe(false);
  });

  it("returns false (not throw) when top-frame access is cross-origin blocked", () => {
    setSearch("?foo=bar", "throw");
    expect(hasStackedVariant()).toBe(false);
  });

  it("detects the variant via document.referrer when top is cross-origin (Infolinks case)", () => {
    // Our frame (about:srcdoc) has no query string, the top frame is
    // cross-origin (throws), but the referrer carries the embedder's URL.
    setSearch("", "throw", "example.com", "https://publisher.com/article?gen_variant=stacked");
    expect(hasStackedVariant()).toBe(true);
  });

  it("detects the variant when Infolinks forwards it URL-encoded in the referrer", () => {
    setSearch("", "throw", "example.com", "https://ad.gt/getpixels?code=none%26gen_variant%3Dstacked");
    expect(hasStackedVariant()).toBe(true);
  });

  it("returns false when the referrer carries a different variant", () => {
    setSearch("", "throw", "example.com", "https://publisher.com/article?gen_variant=default");
    expect(hasStackedVariant()).toBe(false);
  });

  it("detects the variant from the loader script params (window.__CXR_SCRIPT_PARAMS__)", () => {
    // No frame or referrer signal at all — only the <script src=?gen_variant=stacked>.
    setSearch("", "throw");
    (window as { __CXR_SCRIPT_PARAMS__?: string }).__CXR_SCRIPT_PARAMS__ = "&gen_variant=stacked";
    expect(hasStackedVariant()).toBe(true);
  });

  it("ignores loader script params carrying a different variant", () => {
    setSearch("", "throw");
    (window as { __CXR_SCRIPT_PARAMS__?: string }).__CXR_SCRIPT_PARAMS__ = "&gen_variant=default&foo=1";
    expect(hasStackedVariant()).toBe(false);
  });

  it("terminates via MAX_FRAME_WALK when the frame chain never converges", () => {
    // Nested cross-origin ad frames (SafeFrame/GAM/Infolinks) can return a fresh
    // WindowProxy identity on every `.parent` access, so `win.parent === win`
    // never becomes true. Here each frame's location IS readable (no throw to
    // break the loop) but carries no match — only the hard MAX_FRAME_WALK cap
    // stops the otherwise-infinite climb. Without the cap this test hangs.
    let framesVisited = 0;
    const makeEndlessFrame = (): unknown =>
      new Proxy(
        {},
        {
          get(_t, prop) {
            if (prop === "parent") return makeEndlessFrame(); // never === self
            if (prop === "location") {
              framesVisited++;
              return { href: "http://ad-frame.example/none?x=1" }; // readable, no match
            }
            return undefined;
          },
        }
      );

    Object.defineProperty(window, "location", {
      configurable: true,
      value: { href: "http://example.com/page", search: "", hostname: "example.com" },
    });
    Object.defineProperty(window, "parent", { configurable: true, get: () => makeEndlessFrame() });
    Object.defineProperty(document, "referrer", { configurable: true, get: () => "" });

    // Returns (does not hang) and the walk is bounded — not thousands of frames.
    expect(hasStackedVariant()).toBe(false);
    expect(framesVisited).toBeLessThanOrEqual(20);
  });

  it("activates only for the opted-in tag at L4 with the param present", () => {
    setSearch("?gen_variant=stacked");
    expect(shouldUseStackedLayout(STACKED_LAYOUT_TAG_ID, AD_LAYOUT.L4)).toBe(true);
  });

  it("does not activate for a different tag id", () => {
    setSearch("?gen_variant=stacked");
    expect(shouldUseStackedLayout("some-other-tag", AD_LAYOUT.L4)).toBe(false);
  });

  it("does not activate for a non-L4 layout", () => {
    setSearch("?gen_variant=stacked");
    expect(shouldUseStackedLayout(STACKED_LAYOUT_TAG_ID, AD_LAYOUT.L3)).toBe(false);
    expect(shouldUseStackedLayout(STACKED_LAYOUT_TAG_ID, AD_LAYOUT.L1)).toBe(false);
  });

  it("does not activate when the param is missing", () => {
    setSearch("?gen_variant=default");
    expect(shouldUseStackedLayout(STACKED_LAYOUT_TAG_ID, AD_LAYOUT.L4)).toBe(false);
  });

  it("detects local development hosts", () => {
    setSearch("", "", "localhost");
    expect(isLocalhost()).toBe(true);
    setSearch("", "", "127.0.0.1");
    expect(isLocalhost()).toBe(true);
    setSearch("", "", "my-machine.local");
    expect(isLocalhost()).toBe(true);
    setSearch("", "", "example.com");
    expect(isLocalhost()).toBe(false);
  });

  it("relaxes the tag-id gate on localhost (any 320×100 slot)", () => {
    setSearch("?gen_variant=stacked", "", "localhost");
    expect(shouldUseStackedLayout("some-other-tag", AD_LAYOUT.L4)).toBe(true);
  });

  it("still enforces L4 + param on localhost", () => {
    setSearch("?gen_variant=stacked", "", "localhost");
    expect(shouldUseStackedLayout("some-other-tag", AD_LAYOUT.L3)).toBe(false);
    setSearch("?gen_variant=default", "", "localhost");
    expect(shouldUseStackedLayout("some-other-tag", AD_LAYOUT.L4)).toBe(false);
  });

  // ── Second registered tag: 300×600 (L1) → 300×300 halves ──

  it("activates the 300×600 tag at L1 with the param present", () => {
    setSearch("?gen_variant=stacked");
    expect(shouldUseStackedLayout(TAG_300x600, AD_LAYOUT.L1)).toBe(true);
  });

  it("does not activate the 300×600 tag at the wrong layout", () => {
    setSearch("?gen_variant=stacked");
    expect(shouldUseStackedLayout(TAG_300x600, AD_LAYOUT.L4)).toBe(false);
    expect(shouldUseStackedLayout(TAG_300x600, AD_LAYOUT.L2)).toBe(false);
  });

  it("resolves the correct config per tag", () => {
    setSearch("?gen_variant=stacked");
    const c320 = resolveStackedLayout(STACKED_LAYOUT_TAG_ID, AD_LAYOUT.L4);
    expect(c320).toEqual({
      requiredLayout: AD_LAYOUT.L4,
      ourLayout: AD_LAYOUT.L3,
      halfHeight: 50,
      width: 320,
      infolinks: { width: 320, height: 50 },
    });
    const c300 = resolveStackedLayout(TAG_300x600, AD_LAYOUT.L1);
    expect(c300).toEqual({
      requiredLayout: AD_LAYOUT.L1,
      ourLayout: AD_LAYOUT.L1,
      halfHeight: 300,
      width: 300,
      infolinks: { width: 300, height: 300 },
    });
  });

  it("returns null from resolveStackedLayout when it should not stack", () => {
    setSearch("?gen_variant=stacked");
    expect(resolveStackedLayout("some-other-tag", AD_LAYOUT.L1)).toBeNull(); // wrong tag, prod host
    setSearch("?gen_variant=default");
    expect(resolveStackedLayout(STACKED_LAYOUT_TAG_ID, AD_LAYOUT.L4)).toBeNull(); // no param
  });

  it("relaxes the tag-id gate on localhost for the 300×600 layout too", () => {
    setSearch("?gen_variant=stacked", "", "localhost");
    const c = resolveStackedLayout("some-other-tag", AD_LAYOUT.L1);
    expect(c?.infolinks).toEqual({ width: 300, height: 300 });
    expect(c?.ourLayout).toBe(AD_LAYOUT.L1);
  });

  it("registry contains both opted-in tags", () => {
    expect(Object.keys(STACKED_LAYOUT_TAGS)).toEqual(
      expect.arrayContaining([STACKED_LAYOUT_TAG_ID, TAG_300x600])
    );
  });

  it("falls back to the raw needle test when the referrer is not a parseable URL", () => {
    // "http://%" fails `new URL()` (caught, falls through) AND fails
    // `decodeURIComponent` (caught, falls back to the raw string) — the raw
    // string still contains the needle, so the match still succeeds.
    setSearch("", "throw", "example.com", "http://%gen_variant=stacked");
    expect(hasStackedVariant()).toBe(true);
  });

  it("returns false (not throw) when reading document.referrer itself throws", () => {
    setSearch("", "throw");
    const referrerSpy = vi.spyOn(document, "referrer", "get").mockImplementation(() => {
      throw new Error("referrer blocked");
    });
    try {
      expect(hasStackedVariant()).toBe(false);
    } finally {
      referrerSpy.mockRestore();
    }
  });
});

// ─── getScriptParam ───────────────────────────────────────────────────────────

describe("config/getScriptParam", () => {
  afterEach(() => {
    delete (window as { __CXR_SCRIPT_PARAMS__?: string }).__CXR_SCRIPT_PARAMS__;
  });

  it("returns undefined when the named param is absent from a non-empty query", () => {
    (window as { __CXR_SCRIPT_PARAMS__?: string }).__CXR_SCRIPT_PARAMS__ = "foo=bar";
    expect(getScriptParam(STACKED_VARIANT_PARAM)).toBeUndefined();
  });

  it("returns undefined when window is undefined (SSR guard)", () => {
    vi.stubGlobal("window", undefined);
    try {
      expect(getScriptParam(STACKED_VARIANT_PARAM)).toBeUndefined();
    } finally {
      vi.unstubAllGlobals();
    }
  });
});

// ─── SSR guards (typeof window === "undefined") ───────────────────────────────

describe("config/ssrGuards", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("hasStackedVariant returns false when window is undefined", () => {
    vi.stubGlobal("window", undefined);
    expect(hasStackedVariant()).toBe(false);
  });

  it("isLocalhost returns false when window is undefined", () => {
    vi.stubGlobal("window", undefined);
    expect(isLocalhost()).toBe(false);
  });

  it("isIframe returns false when window is undefined", () => {
    vi.stubGlobal("window", undefined);
    expect(isIframe()).toBe(false);
  });
});

// ─── isIframe ─────────────────────────────────────────────────────────────────

describe("config/isIframe", () => {
  afterEach(() => {
    // Restore the JSDOM-default self===top identity.
    Object.defineProperty(window, "top", {
      configurable: true,
      get() {
        return window;
      },
    });
  });

  it("returns false when window.self === window.top (top-level page)", () => {
    expect(isIframe()).toBe(false);
  });

  it("returns true when window.self !== window.top (embedded iframe)", () => {
    Object.defineProperty(window, "top", {
      configurable: true,
      get() {
        return {} as Window;
      },
    });
    expect(isIframe()).toBe(true);
  });

  it("returns true when accessing window.top throws a cross-origin SecurityError", () => {
    Object.defineProperty(window, "top", {
      configurable: true,
      get() {
        throw new Error("SecurityError: blocked a frame with origin");
      },
    });
    expect(isIframe()).toBe(true);
  });
});

describe("config/getInitVolumeOverride", () => {
  const setScriptParams = (value: string) => {
    (window as { __CXR_SCRIPT_PARAMS__?: string }).__CXR_SCRIPT_PARAMS__ = value;
  };

  afterEach(() => {
    delete (window as { __CXR_SCRIPT_PARAMS__?: string }).__CXR_SCRIPT_PARAMS__;
  });

  it("returns undefined when the param is absent", () => {
    expect(config.getInitVolumeOverride()).toBeUndefined();
  });

  it("reads a valid in-range value from the loader script params", () => {
    setScriptParams("&GIV=0.5");
    expect(config.getInitVolumeOverride()).toBe(0.5);
  });

  it("accepts the boundary values 0 and 1", () => {
    setScriptParams("&GIV=0");
    expect(config.getInitVolumeOverride()).toBe(0);
    setScriptParams("&GIV=1");
    expect(config.getInitVolumeOverride()).toBe(1);
  });

  it("returns undefined for a non-numeric value", () => {
    setScriptParams("&GIV=loud");
    expect(config.getInitVolumeOverride()).toBeUndefined();
  });

  it("returns undefined for values outside the 0..1 range", () => {
    setScriptParams("&GIV=1.5");
    expect(config.getInitVolumeOverride()).toBeUndefined();
    setScriptParams("&GIV=-0.3");
    expect(config.getInitVolumeOverride()).toBeUndefined();
  });

  it("returns undefined for an empty value", () => {
    setScriptParams("&GIV=");
    expect(config.getInitVolumeOverride()).toBeUndefined();
  });

  // ── data-giv per-div fallback ──────────────────────────────────────────────

  it("falls back to a valid data-giv value when the script param is absent", () => {
    expect(config.getInitVolumeOverride("0.4")).toBe(0.4);
  });

  it("validates data-giv the same way (ignores non-numeric / out of range / empty)", () => {
    expect(config.getInitVolumeOverride("loud")).toBeUndefined();
    expect(config.getInitVolumeOverride("1.5")).toBeUndefined();
    expect(config.getInitVolumeOverride("-0.1")).toBeUndefined();
    expect(config.getInitVolumeOverride("")).toBeUndefined();
    expect(config.getInitVolumeOverride(null)).toBeUndefined();
  });

  it("accepts data-giv boundary values 0 and 1", () => {
    expect(config.getInitVolumeOverride("0")).toBe(0);
    expect(config.getInitVolumeOverride("1")).toBe(1);
  });

  it("prefers the script param over data-giv when both are valid", () => {
    setScriptParams("&GIV=0.8");
    expect(config.getInitVolumeOverride("0.2")).toBe(0.8);
  });

  it("falls back to data-giv when the script param is present but invalid", () => {
    setScriptParams("&GIV=2");
    expect(config.getInitVolumeOverride("0.3")).toBe(0.3);
  });
});
