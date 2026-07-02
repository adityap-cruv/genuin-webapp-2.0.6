/**
 * Tests for src/config.ts — merged from config/env, config/constants,
 * config/adLayouts, config/tagAllowLists tests.
 */
import { afterEach, describe, it, expect } from "vitest";

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
  STACKED_LAYOUT_TAG_ID,
  STACKED_LAYOUT_TAGS,
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
   * Stub `window.location` (search + hostname) and `window.top.location.search`.
   * Defaults `hostname` to a non-local host so the tag-id gate is exercised;
   * pass a local host explicitly to test the localhost bypass.
   */
  function setSearch(current: string, top?: string, hostname = "example.com") {
    Object.defineProperty(window, "location", {
      configurable: true,
      value: { search: current, hostname },
    });
    Object.defineProperty(window, "top", {
      configurable: true,
      get() {
        if (top === "throw") throw new Error("SecurityError: cross-origin");
        return { location: { search: top ?? "" } };
      },
    });
  }

  afterEach(() => {
    Object.defineProperty(window, "location", {
      configurable: true,
      value: { search: "", hostname: "example.com" },
    });
    Object.defineProperty(window, "top", {
      configurable: true,
      get() {
        return window;
      },
    });
  });

  it("detects variant=stacked in the current frame", () => {
    setSearch("?variant=stacked");
    expect(hasStackedVariant()).toBe(true);
  });

  it("detects variant=stacked in the top frame when absent here", () => {
    setSearch("?foo=bar", "?variant=stacked");
    expect(hasStackedVariant()).toBe(true);
  });

  it("returns false when the param is absent in both frames", () => {
    setSearch("?variant=default", "?other=1");
    expect(hasStackedVariant()).toBe(false);
  });

  it("returns false (not throw) when top-frame access is cross-origin blocked", () => {
    setSearch("?foo=bar", "throw");
    expect(hasStackedVariant()).toBe(false);
  });

  it("activates only for the opted-in tag at L4 with the param present", () => {
    setSearch("?variant=stacked");
    expect(shouldUseStackedLayout(STACKED_LAYOUT_TAG_ID, AD_LAYOUT.L4)).toBe(true);
  });

  it("does not activate for a different tag id", () => {
    setSearch("?variant=stacked");
    expect(shouldUseStackedLayout("some-other-tag", AD_LAYOUT.L4)).toBe(false);
  });

  it("does not activate for a non-L4 layout", () => {
    setSearch("?variant=stacked");
    expect(shouldUseStackedLayout(STACKED_LAYOUT_TAG_ID, AD_LAYOUT.L3)).toBe(false);
    expect(shouldUseStackedLayout(STACKED_LAYOUT_TAG_ID, AD_LAYOUT.L1)).toBe(false);
  });

  it("does not activate when the param is missing", () => {
    setSearch("?variant=default");
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
    setSearch("?variant=stacked", "", "localhost");
    expect(shouldUseStackedLayout("some-other-tag", AD_LAYOUT.L4)).toBe(true);
  });

  it("still enforces L4 + param on localhost", () => {
    setSearch("?variant=stacked", "", "localhost");
    expect(shouldUseStackedLayout("some-other-tag", AD_LAYOUT.L3)).toBe(false);
    setSearch("?variant=default", "", "localhost");
    expect(shouldUseStackedLayout("some-other-tag", AD_LAYOUT.L4)).toBe(false);
  });

  // ── Second registered tag: 300×600 (L1) → 300×300 halves ──

  it("activates the 300×600 tag at L1 with the param present", () => {
    setSearch("?variant=stacked");
    expect(shouldUseStackedLayout(TAG_300x600, AD_LAYOUT.L1)).toBe(true);
  });

  it("does not activate the 300×600 tag at the wrong layout", () => {
    setSearch("?variant=stacked");
    expect(shouldUseStackedLayout(TAG_300x600, AD_LAYOUT.L4)).toBe(false);
    expect(shouldUseStackedLayout(TAG_300x600, AD_LAYOUT.L2)).toBe(false);
  });

  it("resolves the correct config per tag", () => {
    setSearch("?variant=stacked");
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
      ourLayout: AD_LAYOUT.L2,
      halfHeight: 300,
      width: 300,
      infolinks: { width: 300, height: 300 },
    });
  });

  it("returns null from resolveStackedLayout when it should not stack", () => {
    setSearch("?variant=stacked");
    expect(resolveStackedLayout("some-other-tag", AD_LAYOUT.L1)).toBeNull(); // wrong tag, prod host
    setSearch("?variant=default");
    expect(resolveStackedLayout(STACKED_LAYOUT_TAG_ID, AD_LAYOUT.L4)).toBeNull(); // no param
  });

  it("relaxes the tag-id gate on localhost for the 300×600 layout too", () => {
    setSearch("?variant=stacked", "", "localhost");
    const c = resolveStackedLayout("some-other-tag", AD_LAYOUT.L1);
    expect(c?.infolinks).toEqual({ width: 300, height: 300 });
    expect(c?.ourLayout).toBe(AD_LAYOUT.L2);
  });

  it("registry contains both opted-in tags", () => {
    expect(Object.keys(STACKED_LAYOUT_TAGS)).toEqual(
      expect.arrayContaining([STACKED_LAYOUT_TAG_ID, TAG_300x600])
    );
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
