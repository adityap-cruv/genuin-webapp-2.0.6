/**
 * Runtime reporter for ad removal due to exceeding resource budget — two independent
 * detection paths, one shared emission.
 *
 * Path A — Chrome's Heavy Ad Intervention (HAI), authoritative: a `ReportingObserver` for
 * `"intervention"` reports. Chromium-only; best-effort (Chrome can tear the frame down
 * before the callback runs; a cross-origin ad iframe's report may not reach the parent
 * document's observer at all).
 *
 * Path B — inferred breach, the no-miss fallback: this hook itself polls
 * `getSnapshot()` on an interval while mounted, on `document.visibilitychange` → "hidden"
 * (the user backgrounding the tab is a teardown-adjacent moment worth a check), AND once
 * more on unmount (the natural lifecycle-transition point — the ad's slot unmounts on slide
 * change per `AdLayout`'s `destroySignal` swap). If the snapshot ever reaches
 * `overall === "breach"` and Path A hasn't already fired, this fires the same event with
 * `reason: "budget-exceeded-inferred"` and `report: null`. This is the ONLY signal on
 * non-Chromium browsers, and closes the cross-origin/teardown-race gaps Path A alone cannot.
 *
 * Path B's `transferBytes` accounting (`readResourceSnapshot`, page-wide) is only trustworthy
 * when the widget's OWN `performance` timeline can't contain the host page's unrelated bytes.
 * That holds in exactly one deployment mode: **iframe-embedded** — the widget's own iframe has
 * an isolated Performance timeline, so `getEntriesByType("resource")` there only ever sees
 * what the widget itself requested. It does NOT hold for Shadow DOM or direct-mount (the
 * current default embed modes) — those share the host page's own `document`/`performance`,
 * so a heavy host page (e.g. 10 MB host + a 4 MB ad, well within budget) can push the summed
 * page-wide total past 4 MB and false-fire "Ad Removed" even though the ad itself is fine.
 *
 * `enablePathB` therefore defaults to `isIframe()` (the shared `@cxr/config` helper,
 * `window.self !== window.top`) — Path B is live only when the widget is actually running
 * inside its own iframe. In Shadow DOM/direct mode this default resolves to `false`,
 * regardless of dev/prod: iframe isolation is what makes page-wide byte counting trustworthy,
 * not the build mode — a Vite-dev-server-inflated number inside an isolated iframe is still a
 * legitimate (if less precise) local way to exercise Path B's real firing behavior; it's only
 * unsafe when that inflated/leaked number could include bytes the ad never actually caused. A
 * caller can still override via the explicit `enablePathB` param either direction. Getting real
 * ad-iframe scoping for the non-iframe embed modes (so Path B could be safe there too) is
 * tracked as separate follow-up work — see genAdSdk.ts's `containerRef`/shadow-DOM notes for
 * why a plain `document.getElementById(containerId)` query isn't sufficient on its own for
 * that path.
 *
 * Both paths assemble the same `AdRemovedPayload` and fire through one `fireRemoval`,
 * guarded by a single `firedRef` so an HAI removal is reported **at most once per mount**
 * regardless of which path detects it first.
 */
import { useEffect, useRef } from "react";

import { EVENT } from "@cxr/analytics/analytics";
import { isIframe } from "@cxr/config";
import {
  isHeavyAdInterventionReport,
  parseInterventionLimit,
  type InterventionLimit,
} from "@cxr/monitoring/heavyAdReporter";
import type { ResourceSnapshot } from "@cxr/monitoring/resourceMonitor";
import { createLogger } from "@cxr/utils/logger";

const logger = createLogger("cxr/monitoring/heavy-ad-reporter");

/** Default polling cadence for Path B while the ad slot is mounted. */
const DEFAULT_INFERENCE_INTERVAL_MS = 5000;

/** Widget context captured at removal time — the "where" alongside the "why". */
export interface HeavyAdRemovalContext {
  tagId: string;
  instanceId: string;
  activeIndex: number | null;
  activeReelId: string | number | null;
  adLayout: number | string | null;
  adSource: string | null;
  isMuted: boolean | null;
  msSinceMount: number;
}

/** The full "why" payload emitted on an HAI removal (Path A) or inferred breach (Path B). */
export interface AdRemovedPayload {
  /** "heavy-ad-intervention" = Chrome's own report (Path A). "budget-exceeded-inferred" =
   *  our own snapshot crossed the breach threshold with no Chrome report seen (Path B). */
  reason: "heavy-ad-intervention" | "budget-exceeded-inferred";
  limit: InterventionLimit;
  /** The browser's intervention report, or null when this fired via the inferred path. */
  report: { message: string; sourceFile: string | null; lineNumber: number | null } | null;
  resources: ResourceSnapshot | null;
  context: HeavyAdRemovalContext;
}

/** A `ReportingObserver`-like handle — narrowed to what this hook uses. */
interface ObserverHandle {
  observe: () => void;
  disconnect: () => void;
}

/** Injected dependencies. `observerFactory` defaults to the global `ReportingObserver`. */
export interface HeavyAdReporterDeps {
  /** Analytics emit (→ RudderStack). */
  sendEvent: (name: string, payload?: Record<string, unknown>) => void;
  /** Client-bus emit (→ window.cxr / host page). */
  emit: (event: string, payload: Record<string, unknown>) => void;
  /** Reader for the latest resource snapshot (null before the monitor starts). */
  getSnapshot: () => ResourceSnapshot | null;
  /** Reader for current widget context, evaluated lazily at removal time. */
  getContext: () => HeavyAdRemovalContext;
  /**
   * Factory for the reporting observer. Defaults to `new ReportingObserver(cb, …)`.
   * Injected in tests. `undefined` (and no global) → Path A no-ops; Path B still runs.
   */
  observerFactory?: (callback: (reports: unknown[]) => void) => ObserverHandle;
  /**
   * Install a `_debugSimulateAdRemoval(limit?)` trigger that runs the full emit path with a
   * synthetic report — for local testing, since real HAI never fires on localhost. Defaults
   * to `import.meta.env.DEV` (dev server only; stripped from prod builds).
   */
  enableDebug?: boolean;
  /** Object to install the debug trigger on. Defaults to `window.cxr`. Injected in tests. */
  debugTarget?: Record<string, unknown>;
  /** Path B polling cadence in ms. Defaults to {@link DEFAULT_INFERENCE_INTERVAL_MS}. */
  inferenceIntervalMs?: number;
  /**
   * Whether Path B (inferred breach) is active at all. Defaults to `isIframe()` — see the
   * file-level doc comment: page-wide byte accounting is only trustworthy when the widget's
   * iframe isolates it from the host page's own resources. Path A (Chrome's own report) is
   * unaffected by this flag. Injectable for tests (pass `true`/`false` explicitly to bypass
   * the environment-derived default).
   */
  enablePathB?: boolean;
}

/** True only under the Vite dev server; folds to false in every build. */
function isDevEnv(): boolean {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- import.meta.env shape is bundler-defined
  return Boolean((import.meta as any).env?.DEV);
}

/** Resolve the observer factory: explicit injection, else the global ReportingObserver, else null. */
function resolveObserverFactory(
  injected: HeavyAdReporterDeps["observerFactory"]
): ((cb: (reports: unknown[]) => void) => ObserverHandle) | null {
  if (injected) return injected;
  const Ctor = (globalThis as { ReportingObserver?: unknown }).ReportingObserver;
  if (typeof Ctor !== "function") return null;
  const ObserverCtor = Ctor as new (
    cb: (reports: unknown[]) => void,
    opts?: { types?: string[]; buffered?: boolean }
  ) => ObserverHandle;
  return (cb) => new ObserverCtor(cb, { types: ["intervention"], buffered: true });
}

/**
 * Mount the ad-removal reporter for the current widget instance — both detection paths.
 *
 * @example
 * useHeavyAdReporter({ sendEvent, emit: (e, p) => bus.emit(e, p), getSnapshot, getContext });
 */
export function useHeavyAdReporter(deps: HeavyAdReporterDeps): void {
  const depsRef = useRef(deps);
  depsRef.current = deps;
  // Removal is terminal for the frame — emit at most once per instance, either path.
  const firedRef = useRef(false);

  useEffect(() => {
    const fireRemoval = (
      reason: AdRemovedPayload["reason"],
      body: { message?: string; sourceFile?: string; lineNumber?: number } | null
    ): void => {
      if (firedRef.current) return;
      firedRef.current = true;

      const { sendEvent, emit, getSnapshot, getContext } = depsRef.current;
      const snapshot = getSnapshot();
      const payload: AdRemovedPayload = {
        reason,
        limit: parseInterventionLimit(body?.message, snapshot),
        report: body
          ? { message: body.message ?? "", sourceFile: body.sourceFile ?? null, lineNumber: body.lineNumber ?? null }
          : null,
        resources: snapshot,
        context: getContext(),
      };

      logger.warn(`ad removed (${reason}, limit=${payload.limit})`, payload);
      sendEvent(EVENT.AD_REMOVED, payload as unknown as Record<string, unknown>);
      emit("ad:removed", payload as unknown as Record<string, unknown>);
    };

    // --- Path B: inferred breach — interval while mounted + one final check on unmount ---
    // Defaults to iframe-only (see file-level doc comment) — page-wide byte counting is only
    // trustworthy when the widget's iframe isolates it from the host page's own resources.
    const pathBEnabled = depsRef.current.enablePathB ?? isIframe();

    const checkInferredBreach = (): void => {
      if (firedRef.current || !pathBEnabled) return;
      const snapshot = depsRef.current.getSnapshot();
      if (snapshot?.overall === "breach") fireRemoval("budget-exceeded-inferred", null);
    };
    const intervalMs = depsRef.current.inferenceIntervalMs ?? DEFAULT_INFERENCE_INTERVAL_MS;
    const intervalId = pathBEnabled ? globalThis.setInterval(checkInferredBreach, intervalMs) : null;

    const handleVisibilityChange = (): void => {
      if (typeof document !== "undefined" && document.visibilityState === "hidden") checkInferredBreach();
    };
    if (pathBEnabled && typeof document !== "undefined") {
      document.addEventListener("visibilitychange", handleVisibilityChange);
    }

    // --- Path A: Chrome's own report ---
    const debugEnabled = depsRef.current.enableDebug ?? isDevEnv();
    const debugTarget = depsRef.current.debugTarget ?? (globalThis as { cxr?: Record<string, unknown> }).cxr;
    if (debugEnabled && debugTarget) {
      const simulate = (limit?: string): void => {
        firedRef.current = false; // allow repeated manual fires while testing
        logger.warn("_debugSimulateAdRemoval — synthetic HAI removal", { limit });
        fireRemoval("heavy-ad-intervention", {
          message: `Simulated Heavy Ad Intervention removal (${limit ?? "unknown"})`,
        });
      };
      debugTarget._debugSimulateAdRemoval = simulate;
    }

    const factory = resolveObserverFactory(depsRef.current.observerFactory);
    let observer: ObserverHandle | null = null;
    if (factory) {
      const handleReports = (reports: unknown[]): void => {
        const report = reports.find(isHeavyAdInterventionReport);
        if (!report) return;
        const body = (report as { body?: { message?: string; sourceFile?: string; lineNumber?: number } }).body ?? {};
        fireRemoval("heavy-ad-intervention", body);
      };
      try {
        observer = factory(handleReports);
        observer.observe();
      } catch {
        observer = null;
      }
    }

    return () => {
      if (intervalId !== null) globalThis.clearInterval(intervalId);
      if (typeof document !== "undefined") {
        document.removeEventListener("visibilitychange", handleVisibilityChange);
      }
      checkInferredBreach(); // final lifecycle-transition check before this instance's context disappears
      observer?.disconnect();
      if (debugEnabled && debugTarget && debugTarget._debugSimulateAdRemoval) {
        delete debugTarget._debugSimulateAdRemoval;
      }
    };
    // Deps are read through depsRef so the observer/interval attach once per mount.
  }, []);
}
