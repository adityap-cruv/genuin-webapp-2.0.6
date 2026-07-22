/**
 * On-demand resource snapshot for the three Chrome Heavy-Ad-Intervention (HAI) dimensions
 * — transferred bytes, peak main-thread CPU in a 30 s window, and total main-thread CPU.
 *
 * This is a **passive, pull-based reader**: {@link readResourceSnapshot} computes the
 * current values from the browser's Performance timeline whenever called. There is no
 * interval, no alerting, and no `resource:threshold` emission here — the interval/lifecycle
 * polling that consumes this lives in `@cxr/monitoring/useHeavyAdReporter`.
 *
 * Byte accounting is scoped to the ad's own iframe via `scopeHost` (matched against each
 * resource entry's `name`) — summing every `performance` resource entry on the page would
 * count unrelated page traffic as ad bytes. Sub-resources loaded *inside* a cross-origin ad
 * iframe remain invisible to the parent document's Performance timeline; that gap is
 * accepted (Chrome's own HAI instrumentation has privileged access this API does not).
 * Longtask entries are NOT scoped — long tasks aren't attributable to a source frame from
 * the parent context, so `peakCpuMs`/`totalCpuMs` stay page-wide as a conservative proxy.
 *
 * The pure evaluation ({@link evaluateMetric}) is exported for unit testing.
 */

/** The three HAI-measured resource dimensions. */
export type ResourceMetricKey = "transferBytes" | "peakCpuMs" | "totalCpuMs";

/** Alert level for a single metric, ordered ok < warn < breach. */
export type ResourceLevel = "ok" | "warn" | "breach";

/** Per-metric threshold (the value that, when reached, is a breach). */
export type ResourceThresholds = Record<ResourceMetricKey, number>;

/** A single metric's evaluated state — the shape exposed for reporting. */
export interface ResourceMetricSnapshot {
  /** Current measured consumption for this metric (bytes or ms). */
  current: number;
  /** The configured breach threshold for this metric. */
  threshold: number;
  /** `current / threshold * 100`, clamped at 0 (can exceed 100 on breach). */
  utilizationPercent: number;
  /** ok · warn (>= 80 % of threshold) · breach (>= threshold). */
  level: ResourceLevel;
  /** True once utilization >= 100 %. */
  breached: boolean;
}

/** Full snapshot across all metrics, plus the evaluation timestamp. */
export interface ResourceSnapshot {
  metrics: Record<ResourceMetricKey, ResourceMetricSnapshot>;
  /** The worst level across all metrics. */
  overall: ResourceLevel;
  /** ms since epoch of this evaluation. */
  timestamp: number;
}

/**
 * Chrome Heavy Ad Intervention hard limits (4 MB transferred · 15 s CPU in any 30 s window
 * · 60 s total CPU). These are Chrome's ceilings, not ours — the reference the snapshot's
 * utilization is measured against.
 */
export const HAI_THRESHOLDS: ResourceThresholds = {
  transferBytes: 4 * 1000 * 1000,
  peakCpuMs: 15 * 1000,
  totalCpuMs: 60 * 1000,
};

const METRIC_KEYS: ResourceMetricKey[] = ["transferBytes", "peakCpuMs", "totalCpuMs"];
/** Fraction of a threshold at/above which a metric is `warn` (below breach). */
const WARN_FRACTION = 0.8;

/**
 * Evaluate one metric's current value against its threshold.
 *
 * @param current    measured consumption
 * @param threshold  breach threshold (> 0); <= 0 disables the metric (never breaches)
 */
export function evaluateMetric(current: number, threshold: number): ResourceMetricSnapshot {
  const utilizationPercent = threshold > 0 ? Math.max(0, (current / threshold) * 100) : 0;
  const breached = threshold > 0 && current >= threshold;
  let level: ResourceLevel = "ok";
  if (breached) {
    level = "breach";
  } else if (threshold > 0 && current >= threshold * WARN_FRACTION) {
    level = "warn";
  }
  return { current, threshold, utilizationPercent, level, breached };
}

/** ok=0, warn=1, breach=2. */
function levelRank(level: ResourceLevel): number {
  return level === "breach" ? 2 : level === "warn" ? 1 : 0;
}

/**
 * Sum on-the-wire transfer bytes across resource entries attributable to the ad.
 *
 * @param scopeHost  hostname (or hostname substring) of the ad's iframe `src`. When
 *   provided, only entries whose `name` contains this host are counted. When omitted,
 *   falls back to summing ALL resource entries (page-wide) — callers should always pass
 *   `scopeHost` in production; the fallback exists for environments where the ad's host
 *   isn't yet resolvable (e.g. before the slot has loaded).
 */
function readTransferBytes(scopeHost?: string): number {
  if (typeof performance === "undefined" || typeof performance.getEntriesByType !== "function") return 0;
  let total = 0;
  for (const entry of performance.getEntriesByType("resource")) {
    if (scopeHost && !entry.name.includes(scopeHost)) continue;
    const size = (entry as PerformanceResourceTiming).transferSize;
    if (typeof size === "number") total += size;
  }
  return total;
}

/**
 * Long-task entries as a conservative main-thread CPU proxy: total ms and peak in a 30 s
 * window. NOT scoped to the ad — long tasks aren't attributable to a source frame from the
 * parent document, so this stays a page-wide approximation.
 */
function readCpuMs(): { totalMs: number; peakMs: number } {
  if (typeof performance === "undefined" || typeof performance.getEntriesByType !== "function") {
    return { totalMs: 0, peakMs: 0 };
  }
  let entries: PerformanceEntry[];
  try {
    entries = performance.getEntriesByType("longtask");
  } catch {
    // longtask type unsupported (Safari) — no CPU picture.
    return { totalMs: 0, peakMs: 0 };
  }
  let totalMs = 0;
  for (const entry of entries) totalMs += entry.duration;

  // Peak CPU in any 30 s sliding window across long-task start times.
  const WINDOW_MS = 30_000;
  let peakMs = 0;
  for (let j = 0; j < entries.length; j++) {
    let windowSum = 0;
    for (let i = j; i >= 0; i--) {
      if (entries[j]!.startTime - entries[i]!.startTime <= WINDOW_MS) windowSum += entries[i]!.duration;
      else break;
    }
    if (windowSum > peakMs) peakMs = windowSum;
  }
  return { totalMs, peakMs: Math.max(peakMs, totalMs === 0 ? 0 : peakMs) };
}

/**
 * Read a fresh resource snapshot from the Performance timeline. Pure w.r.t. module state —
 * every call recomputes from the browser's own entries. Safe where Performance APIs are
 * absent (values read 0). Never throws.
 *
 * @param scopeHost   the ad iframe's host, to scope `transferBytes`. See {@link readTransferBytes}.
 * @param thresholds  limits to evaluate against; defaults to {@link HAI_THRESHOLDS}.
 */
export function readResourceSnapshot(
  scopeHost?: string,
  thresholds: ResourceThresholds = HAI_THRESHOLDS
): ResourceSnapshot {
  const cpu = readCpuMs();
  const values: Record<ResourceMetricKey, number> = {
    transferBytes: readTransferBytes(scopeHost),
    totalCpuMs: cpu.totalMs,
    peakCpuMs: cpu.peakMs,
  };
  const metrics = {} as Record<ResourceMetricKey, ResourceMetricSnapshot>;
  let overallRank = 0;
  for (const key of METRIC_KEYS) {
    const m = evaluateMetric(values[key], thresholds[key]);
    metrics[key] = m;
    overallRank = Math.max(overallRank, levelRank(m.level));
  }
  const overall: ResourceLevel = overallRank === 2 ? "breach" : overallRank === 1 ? "warn" : "ok";
  return { metrics, overall, timestamp: Date.now() };
}
