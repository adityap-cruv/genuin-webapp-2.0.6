/**
 * Pure helpers for the Heavy-Ad-Intervention (HAI) removal reporter.
 *
 * Chrome fires a `ReportingObserver` report of type `"intervention"` when it unloads a
 * heavy ad frame. These helpers classify such a report and derive which resource limit
 * was exceeded, so `useHeavyAdReporter` can emit a diagnostic "Ad Removed" event.
 *
 * Kept pure (no observer, no DOM) so the classification/parsing is unit-testable.
 */

import type { ResourceMetricKey, ResourceSnapshot } from "@cxr/monitoring/resourceMonitor";

/**
 * The exceeded HAI resource limit, as reported by Chrome or derived from the snapshot.
 *
 * | limit       | HAI ceiling                   | metric          |
 * | ----------- | ----------------------------- | --------------- |
 * | `network`   | > 4 MB transferred            | `transferBytes` |
 * | `cpu-peak`  | > 15 s CPU in any 30 s window | `peakCpuMs`     |
 * | `cpu-total` | > 60 s total CPU              | `totalCpuMs`    |
 * | `unknown`   | message unrecognized AND snapshot gave no signal | — |
 */
export type InterventionLimit = "network" | "cpu-peak" | "cpu-total" | "unknown";

/** The minimal shape of a `ReportingObserver` report body we read. */
interface InterventionReportBody {
  id?: string;
  message?: string;
  sourceFile?: string | null;
  lineNumber?: number | null;
}

/** The minimal shape of a `ReportingObserver` report we read. */
interface InterventionReport {
  type?: string;
  body?: InterventionReportBody;
}

/** Chrome's stable-ish id for the Heavy Ad Intervention report. */
const HEAVY_AD_ID = "HeavyAdIntervention";
/** Message fallback when the id is absent (the id/message shape is not a frozen standard). */
const HEAVY_AD_MESSAGE_RE = /heavy\s*ad\s*intervention/i;

/**
 * True when `report` is a `ReportingObserver` intervention report attributable to Chrome's
 * Heavy Ad Intervention. Guards against null/malformed reports and other intervention types.
 */
export function isHeavyAdInterventionReport(report: unknown): boolean {
  if (!report || typeof report !== "object") return false;
  const r = report as InterventionReport;
  if (r.type !== "intervention") return false;
  const body = r.body;
  if (!body || typeof body !== "object") return false;
  if (body.id === HEAVY_AD_ID) return true;
  return typeof body.message === "string" && HEAVY_AD_MESSAGE_RE.test(body.message);
}

/** Map a ResourceMonitor metric key to its intervention-limit label. */
const METRIC_TO_LIMIT: Record<ResourceMetricKey, InterventionLimit> = {
  transferBytes: "network",
  peakCpuMs: "cpu-peak",
  totalCpuMs: "cpu-total",
};

/**
 * Derive which HAI limit was exceeded. Prefers explicit hints in the report `message`
 * (Chrome names the resource); when the message is ambiguous, falls back to the
 * highest-utilization metric in `snapshot`; otherwise `"unknown"`.
 *
 * @param message   the intervention report message (may be empty/absent)
 * @param snapshot  the last ResourceMonitor snapshot, or null when unavailable
 */
export function parseInterventionLimit(
  message: string | undefined,
  snapshot: ResourceSnapshot | null
): InterventionLimit {
  const msg = (message ?? "").toLowerCase();

  // Explicit message hints. Order matters: "total"/"peak" qualify a CPU message, so test
  // them before the bare network/bandwidth check.
  if (/network|bandwidth|bytes|download/.test(msg)) return "network";
  if (/total\s*cpu|cpu.*total/.test(msg)) return "cpu-total";
  if (/peak\s*cpu|cpu.*(peak|window|short)/.test(msg)) return "cpu-peak";

  // Ambiguous message → blame the metric closest to (or over) its threshold.
  if (snapshot) {
    const byUtil: Array<[ResourceMetricKey, number]> = [
      ["transferBytes", snapshot.metrics.transferBytes.utilizationPercent],
      ["peakCpuMs", snapshot.metrics.peakCpuMs.utilizationPercent],
      ["totalCpuMs", snapshot.metrics.totalCpuMs.utilizationPercent],
    ];
    byUtil.sort((a, b) => b[1] - a[1]);
    const [topMetric, topUtil] = byUtil[0]!;
    if (topUtil > 0) return METRIC_TO_LIMIT[topMetric];
  }

  return "unknown";
}
