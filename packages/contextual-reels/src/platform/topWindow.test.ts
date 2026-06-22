/**
 * Tests for the top-window walker and href resolver.
 *
 * Uses stub window objects so the legacy cross-origin-throw behaviour can be
 * simulated without touching the real jsdom window.
 */
import { describe, it, expect } from "vitest";

import { getTopWindow, getWindowLink, topWindow, windowLink } from "@cxr/platform/topWindow";

interface StubWindow {
  parent: StubWindow;
  location: { href: string };
}

function makeWin(href: string): StubWindow {
  const win = { location: { href } } as Partial<StubWindow> as StubWindow;
  win.parent = win;
  return win;
}

function chain(...wins: StubWindow[]): void {
  // Wire each window's `parent` to the next; the last keeps `parent === self`.
  for (let i = 0; i < wins.length - 1; i += 1) {
    (wins[i] as StubWindow).parent = wins[i + 1] as StubWindow;
  }
}

describe("platform/topWindow", () => {
  describe("getTopWindow", () => {
    it("returns the same window when parent === self", () => {
      const win = makeWin("https://only.example");
      expect(getTopWindow(win as unknown as Window)).toBe(win);
    });

    it("walks up to the outermost accessible parent", () => {
      const grand = makeWin("https://outer.example");
      const parent = makeWin("https://mid.example");
      const self = makeWin("https://inner.example");
      chain(self, parent, grand);
      expect(getTopWindow(self as unknown as Window)).toBe(grand);
    });

    it("returns the last accessible window when a cross-origin access throws", () => {
      const safeOuter = makeWin("https://safe.example");
      const blockedParent = {
        get parent(): StubWindow {
          throw new Error("cross-origin");
        },
        location: {
          get href(): string {
            throw new Error("cross-origin");
          },
        },
      } as unknown as StubWindow;
      const self = makeWin("https://inner.example");
      (self as StubWindow).parent = safeOuter;
      (safeOuter as StubWindow).parent = blockedParent;
      // Walking should land on safeOuter — its parent's `.location.href` throws.
      expect(getTopWindow(self as unknown as Window)).toBe(safeOuter);
    });
  });

  describe("getWindowLink", () => {
    it("returns href from the supplied window", () => {
      const win = makeWin("https://example.com/page");
      expect(getWindowLink(win as unknown as Window)).toBe("https://example.com/page");
    });

    it("returns undefined when accessing href throws", () => {
      const win = {
        get location(): { href: string } {
          throw new Error("cross-origin");
        },
      } as unknown as Window;
      expect(getWindowLink(win)).toBeUndefined();
    });

    it("falls back to topWindow when called with no arguments", () => {
      // jsdom resolves to a real string href; we just assert the type.
      expect(typeof getWindowLink()).toBe("string");
    });

    it("returns undefined when explicitly given undefined", () => {
      expect(getWindowLink(undefined)).toBeUndefined();
    });
  });

  describe("eager singletons", () => {
    it("exports a topWindow value resolved at module load", () => {
      expect(topWindow).toBeDefined();
    });

    it("exports a string-or-undefined windowLink resolved at module load", () => {
      expect(["string", "undefined"]).toContain(typeof windowLink);
    });
  });
});
