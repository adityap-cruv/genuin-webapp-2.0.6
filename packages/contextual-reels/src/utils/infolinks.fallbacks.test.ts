import { afterEach, describe, expect, it, vi } from "vitest";

// Force windowLink undefined so resolvePageUrl() falls through to its
// document.referrer / location.href / undefined branches. The sibling
// infolinks.test.ts covers the windowLink-present path.
vi.mock("@cxr/platform/topWindow", () => ({
  windowLink: undefined,
}));

const { createInfolinksFrame, resolvePageUrl } = await import("@cxr/utils/infolinks");

describe("utils/infolinks resolvePageUrl fallbacks (no windowLink)", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("falls back to document.referrer when set", () => {
    vi.spyOn(document, "referrer", "get").mockReturnValue("https://publisher.example/page");
    expect(resolvePageUrl()).toBe("https://publisher.example/page");
  });

  it("falls back to window.location.href when referrer is empty", () => {
    vi.spyOn(document, "referrer", "get").mockReturnValue("");
    expect(resolvePageUrl()).toBe(window.location.href);
  });

  it("returns undefined when there is no window (SSR-like)", () => {
    vi.spyOn(document, "referrer", "get").mockReturnValue("");
    vi.stubGlobal("window", undefined);
    expect(resolvePageUrl()).toBeUndefined();
  });

  it("omits purl from the srcdoc when the page URL is unresolvable", () => {
    vi.spyOn(document, "referrer", "get").mockReturnValue("");
    vi.stubGlobal("window", undefined);
    // document still exists (jsdom binds it independently of window), so the
    // iframe can be created; resolvePageUrl() returns undefined → no purl key.
    const frame = createInfolinksFrame({ width: 320, height: 50 });
    expect(frame.srcdoc).not.toContain('"purl"');
  });
});
