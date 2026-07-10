/**
 * Host macro capture.
 *
 * CXR runs inside an app webview and cannot resolve app / user / geo / privacy
 * context itself. The host resolves these values and passes them on the loader
 * `<script src>` query string, which the loader merges into
 * `window.__CXR_SCRIPT_PARAMS__`. This module parses that bag once into a
 * cleaned, typed map consumed by ad-URL substitution and analytics.
 */

/** Cleaned host macro map — every value is a non-empty, resolved string. */
export interface HostMacros {
  readonly [key: string]: string;
}

/**
 * True for an unresolved host placeholder the host never substituted. Covers
 * both delimiter conventions the host may leak: curly `{appv}` and tilde
 * `~appv~`. Tilde is the app/SSP macro form observed in real webview payloads,
 * so it must be dropped here — otherwise a leaked `~appb~` flows on as if it
 * were a real value and pollutes `device_details` / `page` and ad URLs.
 */
function isUnresolved(value: string): boolean {
  const trimmed = value.trim();
  return /^\{.*\}$/.test(trimmed) || /^~.*~$/.test(trimmed);
}

/**
 * Parse `window.__CXR_SCRIPT_PARAMS__` into a cleaned macro map. Empty values
 * and unresolved braced literals (`{appv}`) are dropped so downstream payloads
 * never carry placeholder noise. Exported for tests; production reads the
 * {@link hostMacros} singleton.
 */
export function parseHostMacros(): HostMacros {
  if (typeof window === "undefined") return {};
  // Reads the same window.__CXR_SCRIPT_PARAMS__ bag as getScriptParam() in
  // config.ts, but returns the whole cleaned map rather than a single value.
  const raw = (window as { __CXR_SCRIPT_PARAMS__?: string }).__CXR_SCRIPT_PARAMS__;
  if (!raw) return {};

  const out: Record<string, string> = {};
  for (const [key, value] of new URLSearchParams(raw)) {
    if (!value.trim() || isUnresolved(value)) continue;
    out[key] = value;
  }
  return out;
}

/**
 * Captured once at module load. Mirrors the singleton pattern used by
 * `userId` / `windowLink`.
 */
export const hostMacros: HostMacros = parseHostMacros();

/**
 * Read a single cleaned host macro.
 *
 * @param name The macro name as it appears on the loader URL (e.g. `ifa`).
 * @returns The cleaned value, or `undefined` when absent / empty / unresolved.
 */
export function getHostMacro(name: string): string | undefined {
  return hostMacros[name];
}
