// InstanceRegistry is a dependency-free leaf module (no further imports of its
// own), so importing it here doesn't compromise this file's self-containment
// the way importing @cxr/config would — it's the only reachable, non-React
// way to actually tear a widget instance down (destroy control is registered
// by index.jsx itself, no AdProvider/React involved).
import { parseHostMacros } from "@cxr/hostMacros";
import { getInstanceRegistry } from "@cxr/instance/registry/InstanceRegistry";

export type PixelStage = "sdk_load" | "init" | "render" | "runtime";

export type PixelErrorType = "initialization_error" | "render_error" | "runtime_error" | "network_error";

/** Dedup key for failures with no widget instance context (e.g. the core script itself failing to load). */
export const PAGE_LEVEL_KEY = "__page__";

/**
 * Hardcoded base — never depends on config/env resolution succeeding.
 * Path shape: `<base>/<brand_id>/<tag_id>/px-script-error`.
 */
const FALLBACK_PIXEL_BASE_URL = "https://api.begenuin.com/goservices/dsp/pixel";

/**
 * Resolve the pixel base URL without depending on `@cxr/config` (or anything
 * else) being importable/loadable — this module must fire a pixel even if the
 * rest of the app's module graph is broken. Reads `import.meta.env` directly
 * and defensively; any failure falls back to the hardcoded default.
 */
function resolvePixelBaseUrl(): string {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- import.meta.env shape is bundler-defined
    const env = (import.meta as any)?.env as Record<string, string | undefined> | undefined;
    return env?.VITE_CXR_PIXEL_URL || FALLBACK_PIXEL_BASE_URL;
  } catch {
    return FALLBACK_PIXEL_BASE_URL;
  }
}

/**
 * Read the full cleaned host-macro bag from `window.__CXR_SCRIPT_PARAMS__`
 * via the shared parser used by the rest of the package. This keeps the pixel
 * reporter aligned with analytics/ad URL resolution without re-implementing the
 * cleaning rules in a second place.
 */
function readResolvedHostMacros(): Record<string, string> {
  try {
    return parseHostMacros();
  } catch {
    return {};
  }
}

/** Read one cleaned host macro from the same bag used by `hostMacros.ts`. */
function readHostMacroBestEffort(name: string): string | undefined {
  return readResolvedHostMacros()[name];
}

/**
 * Query params on the `px-script-error` pixel that are sourced from host
 * macros — the pixel's own param name always matches the host macro name
 * (`ifa` → `getHostMacro("ifa")`, etc), except the three IFA aliases which
 * all read the same `ifa` macro. Falls back to `"0"` when the host never
 * supplied (or never resolved) the value, per the pixel spec.
 */
const HOST_MACRO_PIXEL_PARAMS: ReadonlyArray<[param: string, macroName: string]> = [
  ["appn", "appn"],
  ["appv", "appv"],
  ["appb", "appb"],
  ["appsu", "appsu"],
  ["ifa", "ifa"],
  ["appidfa", "ifa"],
  ["appaid", "ifa"],
  ["deviceid", "ifa"],
  ["appsi", "appsi"],
  ["appc", "appc"],
  ["country", "country"],
  ["loc", "loc"],
  ["loclong", "loclong"],
  ["loclat", "loclat"],
  ["dnt", "dnt"],
  ["gdpr", "gdpr"],
  ["gdpr_consent", "gdpr_consent"],
  ["us_privacy", "us_privacy"],
  ["d", "appb"],
];

export interface PixelDimensions {
  width?: number;
  height?: number;
}

/** Cap on the `reason` query param so one long error message can't blow up the pixel URL. */
const MAX_REASON_LENGTH = 200;

/**
 * Best-effort extraction of a short, human-readable reason from whatever a
 * catch block or logger call captured. Accepts the shapes actually seen at
 * this codebase's call sites: a thrown `Error`, an arbitrary thrown value, or
 * a logger's `...args` rest array (where the last arg is often the Error).
 * Never throws; falls back to `undefined` when nothing usable is found.
 */
function extractReason(source: unknown): string | undefined {
  try {
    if (source instanceof Error) return source.message;
    if (Array.isArray(source)) {
      const errArg = [...source].reverse().find((arg) => arg instanceof Error) as Error | undefined;
      if (errArg) return errArg.message;
      const stringArg = source.find((arg) => typeof arg === "string");
      if (typeof stringArg === "string") return stringArg;
      return undefined;
    }
    if (typeof source === "string") return source;
    return undefined;
  } catch {
    return undefined;
  }
}

/**
 * Build the full `px-script-error` pixel URL. `brandId`/`tagId` are path
 * segments — `brandId` falls back to `"0"` when unknown (e.g. the tag fetch
 * itself is what failed, so `tagDetails.brand_id` was never resolved);
 * `tagId` is expected to always be known (it's the widget's configured tag,
 * available before any fetch). Only host-macro values that were actually
 * resolved by the shared parser are forwarded; missing or unresolved values are
 * omitted entirely. `reason` (when present) is the failing error's message,
 * truncated to `MAX_REASON_LENGTH` — no stack trace, to keep the URL short and
 * avoid leaking internal file paths in a GET request that may be logged by
 * intermediate servers/proxies.
 */
function buildPixelUrl(
  brandId: string | number | undefined,
  tagId: string | undefined,
  dimensions: PixelDimensions,
  stage: PixelStage,
  errorType: PixelErrorType,
  reason: string | undefined
): string {
  const base = resolvePixelBaseUrl();
  const brandSegment = brandId === undefined || brandId === "" ? "0" : String(brandId);
  const resolvedTagId = tagId && tagId.trim() ? tagId : (readHostMacroBestEffort("tagId") ?? "0");
  const tagSegment = resolvedTagId && resolvedTagId.trim() ? resolvedTagId : "0";
  const path = `${base}/${encodeURIComponent(brandSegment)}/${encodeURIComponent(tagSegment)}/px-script-error`;

  const resolvedHostMacros = readResolvedHostMacros();
  const params = new URLSearchParams();

  // Pass through only the host macros that were actually resolved by the
  // shared parser. This keeps the payload aligned with what the host truly
  // supplied, without inventing zero-valued fallbacks for missing context.
  for (const [macroName, value] of Object.entries(resolvedHostMacros)) {
    if (macroName === "tagId") continue;
    params.set(macroName, value);
  }
  for (const [param, macroName] of HOST_MACRO_PIXEL_PARAMS) {
    const value = resolvedHostMacros[macroName];
    if (value !== undefined) {
      params.set(param, value);
    }
  }

  // Preserve the legacy pixel aliases for ifa, even when the host only supplied
  // the canonical `ifa` macro. This keeps the pixel payload consistent with the
  // existing contract while still forwarding only resolved host values.
  if (resolvedHostMacros.ifa !== undefined) {
    if (!params.has("appidfa")) params.set("appidfa", resolvedHostMacros.ifa);
    if (!params.has("appaid")) params.set("appaid", resolvedHostMacros.ifa);
    if (!params.has("deviceid")) params.set("deviceid", resolvedHostMacros.ifa);
  }

  if (resolvedHostMacros.appb !== undefined && !params.has("d")) {
    params.set("d", resolvedHostMacros.appb);
  }
  params.set("w", dimensions.width ? String(dimensions.width) : "0");
  params.set("h", dimensions.height ? String(dimensions.height) : "0");
  params.set("ho", "1");
  params.set("error_type", errorType);
  params.set("error_stage", stage);
  if (reason && reason.trim()) {
    params.set("error_reason", reason.trim().slice(0, MAX_REASON_LENGTH));
  }

  return `${path}?${params.toString()}`;
}

/**
 * Best-effort ad-passback notification with no dependency on React/AdProvider
 * being mounted. Safe to call from anywhere (pre-mount failures included) —
 * mirrors `notifyAdNoFill` in `ads/waterfall.ts` without importing it, so a
 * broken module graph elsewhere can't prevent this from firing.
 */
function notifyAdPassbackBestEffort(): void {
  try {
    if (typeof window === "undefined") return;
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({ type: "noAdsCallback" }, "*");
    }
    const cb = (window as Window & { noAdsCallback?: () => void }).noAdsCallback;
    if (typeof cb === "function") {
      cb();
    }
  } catch (err) {
    console.error("PixelReporter: failed to notify ad passback:", err);
  }
}

/**
 * Tear the widget instance down via its registered `destroy` control, if one
 * exists. Works regardless of whether `AdProvider`/React ever mounted — the
 * `destroy` control is registered by `index.jsx` itself as soon as the React
 * root is created (before `AdProvider` exists), so this reaches every stage
 * from the moment a root exists onward. No-ops silently when no instance is
 * registered (e.g. a failure before any root was ever created) or when
 * `instanceId` is `undefined` (the page-level sdk_load stage, before any
 * `.gen-ext` node was even read).
 */
function destroyInstanceBestEffort(instanceId: string | undefined): void {
  if (!instanceId) return;
  try {
    getInstanceRegistry().get(instanceId)?.destroy?.();
  } catch (err) {
    console.error("PixelReporter: failed to destroy widget instance:", err);
  }
}

export interface PixelFailureEvent {
  instanceId: string | undefined;
  stage: PixelStage;
  errorType: PixelErrorType;
  /** Short reason extracted from the failure, if one was available. */
  reason: string | undefined;
}

export type PixelFailureListener = (event: PixelFailureEvent) => void;

/** Optional context a call site may have available when it reports a failure. */
export interface PixelReportContext {
  /** Widget's configured tag id — expected to always be known. Falls back to `"0"` when absent. */
  tagId?: string;
  /** Resolved brand id, only known once the tag fetch succeeds. Falls back to `"0"` when absent. */
  brandId?: string | number;
  /** Ad slot width in px, for the pixel's `w` param. Falls back to `"0"` when absent. */
  width?: number;
  /** Ad slot height in px, for the pixel's `h` param. Falls back to `"0"` when absent. */
  height?: number;
  /**
   * Whatever the call site caught: a thrown `Error`, an arbitrary thrown
   * value, or a logger's `...args` rest array. A short reason is extracted
   * from it (see {@link extractReason}) and sent as the pixel's `reason`
   * param, truncated. Omit when no error/args are available at the call site.
   */
  error?: unknown;
}

/**
 * Fires a tracking pixel the first time a given widget instance (or the page,
 * for pre-mount failures) breaks anywhere in the render lifecycle. Subsequent
 * failures for an already-reported key are silently suppressed so one broken
 * widget can't flood the pixel endpoint.
 *
 * Deliberately self-contained: no imports from `@cxr/config`, `@cxr/hostMacros`,
 * or anywhere else in the app, so a failure that breaks other modules can
 * never prevent this one from still firing the pixel + best-effort ad passback.
 */
export class PixelReporter {
  private static instance: PixelReporter;
  private reportedKeys = new Set<string>();
  private listeners = new Set<PixelFailureListener>();

  private constructor() {}

  static getInstance(): PixelReporter {
    if (!PixelReporter.instance) {
      PixelReporter.instance = new PixelReporter();
    }
    return PixelReporter.instance;
  }

  /**
   * Subscribe to every reported failure (post-dedup — fires once per key,
   * same as the pixel itself). Lets a mounted `AdProvider` react to a failure
   * with its own richer `onAdFail()` (analytics event + widget teardown)
   * regardless of which stage/callsite originated the report. Returns an
   * unsubscribe function.
   */
  onFailure(listener: PixelFailureListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * @param instanceId The widget instance that broke, or `undefined` for a
   * failure that occurs before any `.gen-ext` node is parsed (stage `sdk_load`).
   * @param stage Which part of the render lifecycle caught the failure.
   * @param errorType Small fixed taxonomy shared with the web-sdk pixel payload.
   * @param context Whatever tagId/brandId/dimensions the call site has on hand.
   * Any field left unset resolves to `"0"` in the fired pixel, per spec.
   */
  report(
    instanceId: string | undefined,
    stage: PixelStage,
    errorType: PixelErrorType,
    context: PixelReportContext = {}
  ): void {
    const key = instanceId ?? PAGE_LEVEL_KEY;
    if (this.reportedKeys.has(key)) {
      return;
    }
    this.reportedKeys.add(key);

    const reason = extractReason(context.error);

    try {
      const url = buildPixelUrl(
        context.brandId,
        context.tagId,
        { width: context.width, height: context.height },
        stage,
        errorType,
        reason
      );
      new Image().src = url;
      console.log(`[PixelReporter] fired pixel (stage=${stage}, error_type=${errorType}):`, url);
    } catch (err) {
      console.error("PixelReporter: failed to fire error pixel:", err);
    }

    // Ad passback fires on EVERY failure stage, independent of whether
    // AdProvider is mounted — this is the pre-mount / no-React-context path.
    notifyAdPassbackBestEffort();

    // Destroy the widget instance on every failure stage too — passback means
    // "this ad slot is dead," so the (possibly broken) widget must actually
    // come down, not just notify the host. Reaches every stage from the
    // moment a root exists onward (registered by index.jsx itself, no
    // AdProvider required).
    destroyInstanceBestEffort(instanceId);

    // Post-mount stages (render/runtime) ALSO get the fuller AdProvider-driven
    // onAdFail() (analytics event + widget teardown) if a provider for this
    // instance happens to be mounted and listening.
    this.listeners.forEach((listener) => {
      try {
        listener({ instanceId, stage, errorType, reason });
      } catch (err) {
        console.error("PixelReporter: a failure listener threw:", err);
      }
    });
  }

  /** Test-only: clears dedup state and listeners between test cases. */
  reset(): void {
    this.reportedKeys.clear();
    this.listeners.clear();
  }
}
