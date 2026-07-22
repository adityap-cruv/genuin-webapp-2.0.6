import { afterEach, describe, expect, it } from "vitest";

import { AD_LAYOUT } from "@cxr/config";
import { isAdVerificationCrawler, isCompactLayout } from "@cxr/utils/ads";

describe("utils/ads isCompactLayout", () => {
  it("is true for the compact layouts L3 and L4", () => {
    expect(isCompactLayout(AD_LAYOUT.L3)).toBe(true);
    expect(isCompactLayout(AD_LAYOUT.L4)).toBe(true);
  });

  it("is false for every other layout", () => {
    const others = Object.values(AD_LAYOUT).filter(
      (id) => id !== AD_LAYOUT.L3 && id !== AD_LAYOUT.L4
    );
    for (const id of others) {
      expect(isCompactLayout(id)).toBe(false);
    }
  });
});

describe("utils/ads isAdVerificationCrawler", () => {
  const originalSearch = window.location.search;

  function setSearch(search: string): void {
    window.history.replaceState(null, "", `${window.location.pathname}${search}`);
  }

  afterEach(() => {
    setSearch(originalSearch);
    // Restore window.top to its default (self) if a test overrode it.
    delete (window as unknown as { __topOverride?: unknown }).__topOverride;
    Object.defineProperty(window, "top", {
      configurable: true,
      get: () => window,
    });
  });

  it("returns true when il.advtq is present in the current frame", () => {
    setSearch("?il.advtq=844,10");
    expect(isAdVerificationCrawler()).toBe(true);
  });

  it("returns false when il.advtq is absent everywhere", () => {
    setSearch("?foo=bar");
    expect(isAdVerificationCrawler()).toBe(false);
  });

  it("returns true when il.advtq is present only in the top frame", () => {
    setSearch("?foo=bar");
    Object.defineProperty(window, "top", {
      configurable: true,
      get: () => ({ location: { search: "?il.advtq=1,2" } }) as Window,
    });
    expect(isAdVerificationCrawler()).toBe(true);
  });

  it("returns false when reading window.top.location throws (cross-origin)", () => {
    setSearch("?foo=bar");
    Object.defineProperty(window, "top", {
      configurable: true,
      get: () =>
        ({
          get location(): Location {
            throw new DOMException("blocked", "SecurityError");
          },
        }) as unknown as Window,
    });
    expect(isAdVerificationCrawler()).toBe(false);
  });

  it("returns false when window.top is null (uses the ?? '' fallback)", () => {
    setSearch("?foo=bar");
    Object.defineProperty(window, "top", {
      configurable: true,
      get: () => null,
    });
    expect(isAdVerificationCrawler()).toBe(false);
  });
});
