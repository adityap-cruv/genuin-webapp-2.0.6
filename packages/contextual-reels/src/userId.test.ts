/**
 * Tests for `src/userId.ts` — covers generateUuid and the userId singleton.
 * Merged from utils/uuid.test.ts.
 */
import { afterEach, describe, expect, it, vi } from "vitest";

import { userId, generateUuid } from "@cxr/userId";
import * as again from "@cxr/userId";

const UUID_LIKE_RE = /^[0-9a-f-]{8,}$/i;

// ─── userId singleton ─────────────────────────────────────────────────────────

describe("userId", () => {
  it("is a non-empty string", () => {
    expect(typeof userId).toBe("string");
    expect(userId.length).toBeGreaterThan(0);
  });

  it("is stable across imports", () => {
    expect(again.userId).toBe(userId);
  });

  it("looks like a UUID (hex segments separated by dashes)", () => {
    // Matches both RFC4122 and our fallback "UUID-ish" output.
    expect(userId).toMatch(/^[0-9a-f-]{32,}$/i);
  });
});

// ─── generateUuid ─────────────────────────────────────────────────────────────

describe("generateUuid", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns a non-empty string", () => {
    const id = generateUuid();
    expect(typeof id).toBe("string");
    expect(id.length).toBeGreaterThan(0);
  });

  it("returns distinct values across calls", () => {
    const ids = new Set<string>();
    for (let i = 0; i < 50; i += 1) {
      ids.add(generateUuid());
    }
    expect(ids.size).toBe(50);
  });

  it("matches a UUID-ish hex/dash format", () => {
    expect(generateUuid()).toMatch(UUID_LIKE_RE);
  });

  it("uses crypto.randomUUID when available", () => {
    const cryptoObj = globalThis.crypto as Crypto | undefined;
    if (!cryptoObj || typeof cryptoObj.randomUUID !== "function") {
      return;
    }
    const spy = vi.spyOn(cryptoObj, "randomUUID").mockReturnValue("11111111-1111-4111-8111-111111111111");
    const id = generateUuid();
    expect(spy).toHaveBeenCalledTimes(1);
    expect(id).toBe("11111111-1111-4111-8111-111111111111");
  });

  it("falls back when crypto itself is undefined", () => {
    // Exercises the falsy branch of `cryptoObj && typeof cryptoObj.randomUUID`.
    const original = Object.getOwnPropertyDescriptor(globalThis, "crypto");
    Object.defineProperty(globalThis, "crypto", {
      configurable: true,
      value: undefined,
    });
    try {
      const id = generateUuid();
      expect(id).toMatch(UUID_LIKE_RE);
      expect(id.length).toBeGreaterThanOrEqual(16);
    } finally {
      if (original) {
        Object.defineProperty(globalThis, "crypto", original);
      }
    }
  });

  it("falls back when crypto.randomUUID is absent", () => {
    const cryptoObj = globalThis.crypto as Crypto | undefined;
    const original = cryptoObj?.randomUUID;
    if (cryptoObj && original) {
      Object.defineProperty(cryptoObj, "randomUUID", {
        configurable: true,
        value: undefined,
      });
    }
    try {
      const id = generateUuid();
      expect(id).toMatch(UUID_LIKE_RE);
      expect(id.length).toBeGreaterThanOrEqual(16);
    } finally {
      if (cryptoObj && original) {
        Object.defineProperty(cryptoObj, "randomUUID", {
          configurable: true,
          value: original,
        });
      }
    }
  });
});
