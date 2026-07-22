import { describe, expect, it } from "vitest";

import { isHeavyAdInterventionReport, parseInterventionLimit } from "@cxr/monitoring/heavyAdReporter";
import { evaluateMetric, type ResourceSnapshot } from "@cxr/monitoring/resourceMonitor";

describe("isHeavyAdInterventionReport", () => {
  it("is true for a report with body.id === HeavyAdIntervention", () => {
    expect(isHeavyAdInterventionReport({ type: "intervention", body: { id: "HeavyAdIntervention" } })).toBe(true);
  });

  it("is true via message fallback when id is absent", () => {
    expect(
      isHeavyAdInterventionReport({ type: "intervention", body: { message: "Heavy Ad Intervention removed frame" } })
    ).toBe(true);
  });

  it("is false for a non-intervention report", () => {
    expect(isHeavyAdInterventionReport({ type: "deprecation", body: { id: "HeavyAdIntervention" } })).toBe(false);
  });

  it("is false for an unrelated intervention report", () => {
    expect(isHeavyAdInterventionReport({ type: "intervention", body: { id: "SomeOtherIntervention" } })).toBe(false);
  });

  it("is false for null/malformed input", () => {
    expect(isHeavyAdInterventionReport(null)).toBe(false);
    expect(isHeavyAdInterventionReport(undefined)).toBe(false);
    expect(isHeavyAdInterventionReport("not an object")).toBe(false);
    expect(isHeavyAdInterventionReport({ type: "intervention" })).toBe(false);
  });
});

function snapshotWithTop(key: "transferBytes" | "peakCpuMs" | "totalCpuMs"): ResourceSnapshot {
  const low = evaluateMetric(0, 1000);
  const high = evaluateMetric(900, 1000);
  return {
    overall: "warn",
    timestamp: 0,
    metrics: {
      transferBytes: key === "transferBytes" ? high : low,
      peakCpuMs: key === "peakCpuMs" ? high : low,
      totalCpuMs: key === "totalCpuMs" ? high : low,
    },
  };
}

describe("parseInterventionLimit", () => {
  it("detects network from message", () => {
    expect(parseInterventionLimit("Ad exceeded network bandwidth limit", null)).toBe("network");
  });

  it("detects cpu-total from message", () => {
    expect(parseInterventionLimit("Ad exceeded total CPU limit", null)).toBe("cpu-total");
  });

  it("detects cpu-peak from message", () => {
    expect(parseInterventionLimit("Ad exceeded peak CPU window", null)).toBe("cpu-peak");
  });

  it("falls back to the highest-utilization snapshot metric on an ambiguous message", () => {
    expect(parseInterventionLimit("Ad was heavy", snapshotWithTop("peakCpuMs"))).toBe("cpu-peak");
  });

  it("returns unknown with no message and no snapshot", () => {
    expect(parseInterventionLimit(undefined, null)).toBe("unknown");
  });

  it("returns unknown when snapshot has zero utilization everywhere", () => {
    const zeroed = snapshotWithTop("transferBytes");
    zeroed.metrics.transferBytes = evaluateMetric(0, 1000);
    expect(parseInterventionLimit("", zeroed)).toBe("unknown");
  });
});
