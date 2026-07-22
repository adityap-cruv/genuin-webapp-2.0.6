import { describe, expect, it, vi } from "vitest";

import { safeHref } from "@cxr/utils/safeHref";

describe("utils/safeHref", () => {
  it("passes through https and http URLs", () => {
    expect(safeHref("https://example.com/x")).toBe("https://example.com/x");
    expect(safeHref("http://example.com")).toBe("http://example.com");
  });

  it("passes through mailto and tel URLs", () => {
    expect(safeHref("mailto:a@b.com")).toBe("mailto:a@b.com");
    expect(safeHref("tel:+15551234567")).toBe("tel:+15551234567");
  });

  it("passes through relative and protocol-relative URLs (inherit page origin)", () => {
    // JSDOM base is http(s), so both resolve to an allowed protocol.
    expect(safeHref("/creator/jane")).toBe("/creator/jane");
    expect(safeHref("//cdn.example.com/x")).toBe("//cdn.example.com/x");
  });

  it("blocks javascript: URLs", () => {
    expect(safeHref("javascript:alert(1)")).toBe("#");
    expect(safeHref("JavaScript:alert(1)")).toBe("#");
  });

  it("blocks data: and vbscript: URLs", () => {
    expect(safeHref("data:text/html,<script>alert(1)</script>")).toBe("#");
    expect(safeHref("vbscript:msgbox(1)")).toBe("#");
  });

  it("returns '#' for empty, null, or undefined input", () => {
    expect(safeHref("")).toBe("#");
    expect(safeHref(null)).toBe("#");
    expect(safeHref(undefined)).toBe("#");
  });

  it("returns '#' for an unparseable URL", () => {
    // A bare token with no base would parse against the page origin; force the
    // catch branch with a value new URL() rejects even with a base.
    expect(safeHref("http://[invalid")).toBe("#");
  });

  it("passes an absolute URL through with no base when window is undefined (SSR)", () => {
    vi.stubGlobal("window", undefined);
    expect(safeHref("https://example.com/x")).toBe("https://example.com/x");
    vi.unstubAllGlobals();
  });

  it("returns '#' for a relative URL when window is undefined (no base to resolve against)", () => {
    vi.stubGlobal("window", undefined);
    expect(safeHref("/creator/jane")).toBe("#");
    vi.unstubAllGlobals();
  });
});
