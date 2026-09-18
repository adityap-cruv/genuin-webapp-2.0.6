// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";

import { buildTargetingSync } from "./targeting";

/**
 * `resolveMetaKeywords` and `resolvePageUrl` are private to targeting.ts, so
 * every case here is exercised through the public `buildTargetingSync()`
 * — asserting on its `keywords` / `page_url` fields covers the same branches.
 */

function setMetaKeywords(content: string | null): void {
  document.querySelectorAll('meta[name="keywords"]').forEach((el) => el.remove());
  if (content === null) return;
  const meta = document.createElement("meta");
  meta.setAttribute("name", "keywords");
  meta.setAttribute("content", content);
  document.head.appendChild(meta);
}

function setWindowTop(topOverride: unknown): void {
  Object.defineProperty(window, "top", { value: topOverride, configurable: true });
}

function setWindowTopThrowing(): void {
  Object.defineProperty(window, "top", {
    configurable: true,
    get() {
      throw new DOMException("Blocked frame access", "SecurityError");
    },
  });
}

function resetWindowTop(): void {
  Object.defineProperty(window, "top", { value: window, configurable: true });
}

function setReferrer(value: string): void {
  Object.defineProperty(document, "referrer", { value, configurable: true });
}

afterEach(() => {
  setMetaKeywords(null);
  resetWindowTop();
  setReferrer("");
});

describe("buildTargetingSync — keywords", () => {
  it("omits keywords when no meta tag is present", () => {
    setMetaKeywords(null);
    expect(buildTargetingSync()?.keywords).toBeUndefined();
  });

  it("omits keywords when the meta tag content is empty", () => {
    setMetaKeywords("");
    expect(buildTargetingSync()?.keywords).toBeUndefined();
  });

  it("trims whitespace around each keyword", () => {
    setMetaKeywords("  Sports ,  NBA  ");
    expect(buildTargetingSync()?.keywords).toBe("Sports, NBA");
  });

  it("drops empty entries produced by stray/trailing commas", () => {
    setMetaKeywords("Sports,, ,Basketball,");
    expect(buildTargetingSync()?.keywords).toBe("Sports, Basketball");
  });

  it("de-duplicates exact (case-sensitive) repeats but keeps different casing", () => {
    setMetaKeywords("Sports, NBA, nba, Basketball, Basketball");
    expect(buildTargetingSync()?.keywords).toBe("Sports, NBA, nba, Basketball");
  });

  it("preserves first-seen order", () => {
    setMetaKeywords("Zebra, Apple, Zebra, Mango");
    expect(buildTargetingSync()?.keywords).toBe("Zebra, Apple, Mango");
  });
});

describe("buildTargetingSync — page_url", () => {
  it("uses window.location.href when not inside an iframe", () => {
    resetWindowTop(); // window.top === window.self
    expect(buildTargetingSync()?.page_url).toBe(window.location.href);
  });

  it("reads the top frame's URL directly when the iframe is same-origin", () => {
    const parentHref = "https://parent.example.com/host-page?utm=abc";
    setWindowTop({ location: { href: parentHref } });
    expect(buildTargetingSync()?.page_url).toBe(parentHref);
  });

  it("falls back to document.referrer when the iframe is cross-origin", () => {
    setWindowTopThrowing();
    setReferrer("https://host.example.com/article-that-embeds-us");
    expect(buildTargetingSync()?.page_url).toBe("https://host.example.com/article-that-embeds-us");
  });

  it("falls back to the iframe's own URL when cross-origin AND referrer is blank", () => {
    setWindowTopThrowing();
    setReferrer("");
    expect(buildTargetingSync()?.page_url).toBe(window.location.href);
  });
});

describe("buildTargetingSync — combined", () => {
  it("includes both fields when both resolve", () => {
    setMetaKeywords("Sports, NBA");
    resetWindowTop();
    const metadata = buildTargetingSync();
    expect(metadata).toEqual({ keywords: "Sports, NBA", page_url: window.location.href });
  });

  it("omits keywords but keeps page_url when there is no meta tag", () => {
    setMetaKeywords(null);
    resetWindowTop();
    const metadata = buildTargetingSync();
    expect(metadata).toEqual({ page_url: window.location.href });
    expect(metadata).not.toHaveProperty("keywords");
  });
});
