/**
 * Sanity tests for the strategy config registry.
 *
 * The cascade behaviour itself is tested in strategies.test.ts; here we only
 * assert the registries are well-formed and the migrated tag entries exist.
 */
import { describe, it, expect } from "vitest";

import { DEFAULT_STRATEGIES } from "@cxr/strategies/strategies";
import {
  BRAND_STRATEGIES,
  GEOIP_DISABLED_TAG_IDS,
  isGeoIpDisabled,
  STRATEGY_PRESETS,
  TAG_STRATEGIES,
} from "@cxr/strategies/strategyConfig";

const STRATEGY_KEYS = Object.keys(DEFAULT_STRATEGIES);

describe("strategies/strategyConfig — registries", () => {
  it("every preset only sets valid Strategies keys", () => {
    for (const bundle of Object.values(STRATEGY_PRESETS)) {
      for (const key of Object.keys(bundle)) {
        expect(STRATEGY_KEYS).toContain(key);
      }
    }
  });

  it("every tag entry only sets valid keys (plus optional preset)", () => {
    const allowed = [...STRATEGY_KEYS, "preset"];
    for (const entry of Object.values(TAG_STRATEGIES)) {
      for (const key of Object.keys(entry)) {
        expect(allowed).toContain(key);
      }
    }
  });

  it("any attached preset names a defined preset", () => {
    for (const entry of Object.values(TAG_STRATEGIES)) {
      if (entry.preset !== undefined) {
        expect(Object.keys(STRATEGY_PRESETS)).toContain(entry.preset);
      }
    }
  });

  it("retains the migrated single-hit and ad-break tag ids", () => {
    expect(TAG_STRATEGIES["6a2fefd87ce338c3a5afc605"]).toBeDefined();
    expect(TAG_STRATEGIES["69b298e3d6a6ad57e7b9a464"]).toBeDefined();
  });

  it("every brand entry only sets valid Strategies keys", () => {
    for (const bundle of Object.values(BRAND_STRATEGIES)) {
      for (const key of Object.keys(bundle)) {
        expect(STRATEGY_KEYS).toContain(key);
      }
    }
  });

  it("brand 3252 sets the pink compact-backdrop color", () => {
    expect(BRAND_STRATEGIES[3252]?.compactBackgroundColor).toBe("#EC298C");
  });
});

describe("strategies/strategyConfig — geoip disable (TEMPORARY, server-load relief)", () => {
  it("lists the 12 Direct IO iHM/Infolinks Audio (Sep) tags", () => {
    expect(GEOIP_DISABLED_TAG_IDS.size).toBe(12);
  });

  it("every geoip-disabled tag is a defined TAG_STRATEGIES entry", () => {
    for (const id of GEOIP_DISABLED_TAG_IDS) {
      expect(TAG_STRATEGIES[id]).toBeDefined();
    }
  });

  it("isGeoIpDisabled is true for a listed tag, false for an unlisted one", () => {
    expect(isGeoIpDisabled("6a9ba985ee6dc7773d0c42a6")).toBe(true);
    expect(isGeoIpDisabled("6a2fefd87ce338c3a5afc605")).toBe(false);
  });

  it("isGeoIpDisabled is false for null/undefined/empty tag ids", () => {
    expect(isGeoIpDisabled(null)).toBe(false);
    expect(isGeoIpDisabled(undefined)).toBe(false);
    expect(isGeoIpDisabled("")).toBe(false);
  });
});
