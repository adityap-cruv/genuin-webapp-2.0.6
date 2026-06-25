/**
 * Tests for src/config.ts — merged from config/env, config/constants,
 * config/adLayouts, config/tagAllowLists tests.
 */
import { describe, it, expect } from "vitest";

import * as config from "@cxr/config";
import {
  AD_LAYOUT,
  adLayoutVariants,
  resolveAdLayout,
  RUDDER_SNIPPET_VERSION,
  RUDDER_SDK_BASE_URL,
  isGenAiAllowed,
  isAdBreakEnabled,
  type AdLayoutId,
} from "@cxr/config";

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
    expect(isAdBreakEnabled("6a2fefd87ce338c3a5afc605")).toBe(true);
  });

  it("rejects unlisted and empty tag ids", () => {
    expect(isAdBreakEnabled("not-a-listed-tag")).toBe(false);
    expect(isAdBreakEnabled("")).toBe(false);
  });
});
