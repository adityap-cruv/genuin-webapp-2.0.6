/**
 * Eager per-page-load user identifier.
 *
 * Consolidates: utils/uuid + the userId singleton.
 *
 * Generated once at module load, then reused across the entire widget so that
 * analytics events emitted from any subsystem are correlated.
 *
 * NOTE: This is an anonymous correlation id, not a security primitive. It is
 * not stored or restored across pages.
 */

// ─── UUID generation ──────────────────────────────────────────────────────────

/**
 * Returns a UUID-ish string suitable for analytics identifiers.
 *
 * Prefers `crypto.randomUUID()` when available; falls back to a
 * timestamp + `Math.random` hex composition.
 *
 * @returns A unique string (not a security primitive).
 */
export function generateUuid(): string {
  const cryptoObj = typeof globalThis !== "undefined" ? globalThis.crypto : undefined;
  if (cryptoObj && typeof cryptoObj.randomUUID === "function") {
    return cryptoObj.randomUUID();
  }
  return _fallbackUuid();
}

function _fallbackUuid(): string {
  const timePart = Date.now().toString(16);
  const randPart = Math.random().toString(16).slice(2).padEnd(12, "0").slice(0, 12);
  const randPart2 = Math.random().toString(16).slice(2).padEnd(12, "0").slice(0, 12);
  // 8-4-4-4-12 shape, hex characters only. Not RFC4122-compliant, but UUID-ish.
  return [
    randPart.slice(0, 8),
    randPart.slice(8, 12).padEnd(4, "0"),
    `4${randPart2.slice(0, 3)}`,
    `8${randPart2.slice(3, 6)}`,
    `${randPart2.slice(6, 12)}${timePart}`.slice(0, 12).padEnd(12, "0"),
  ].join("-");
}

// ─── Singleton ────────────────────────────────────────────────────────────────

/** Stable per-page-load anonymous user identifier. */
export const userId: string = generateUuid();
