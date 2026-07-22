import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { evaluateMetric, readResourceSnapshot } from "@cxr/monitoring/resourceMonitor";

describe("evaluateMetric", () => {
  it("is ok well under threshold", () => {
    const m = evaluateMetric(100, 1000);
    expect(m).toEqual({ current: 100, threshold: 1000, utilizationPercent: 10, level: "ok", breached: false });
  });

  it("is warn at the 80% boundary", () => {
    const m = evaluateMetric(800, 1000);
    expect(m.level).toBe("warn");
    expect(m.breached).toBe(false);
  });

  it("is breach at the threshold", () => {
    const m = evaluateMetric(1000, 1000);
    expect(m.level).toBe("breach");
    expect(m.breached).toBe(true);
  });

  it("is breach over the threshold", () => {
    const m = evaluateMetric(1500, 1000);
    expect(m.level).toBe("breach");
    expect(m.utilizationPercent).toBe(150);
  });

  it("never breaches when threshold is 0 or negative", () => {
    const m = evaluateMetric(999999, 0);
    expect(m.level).toBe("ok");
    expect(m.breached).toBe(false);
    expect(m.utilizationPercent).toBe(0);
  });
});

describe("readResourceSnapshot ad-scoping", () => {
  const originalGetEntries = performance.getEntriesByType.bind(performance);

  beforeEach(() => {
    vi.spyOn(performance, "getEntriesByType").mockImplementation((type: string) => {
      if (type === "resource") {
        return [
          { name: "https://ads.example.com/creative.js", transferSize: 500_000 } as PerformanceResourceTiming,
          { name: "https://unrelated-cdn.example.com/app.js", transferSize: 9_000_000 } as PerformanceResourceTiming,
        ] as PerformanceEntryList;
      }
      if (type === "longtask") return [] as PerformanceEntryList;
      return originalGetEntries(type);
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("counts only resource entries matching scopeHost", () => {
    const snapshot = readResourceSnapshot("ads.example.com");
    expect(snapshot.metrics.transferBytes.current).toBe(500_000);
  });

  it("falls back to page-wide sum when scopeHost is omitted", () => {
    const snapshot = readResourceSnapshot();
    expect(snapshot.metrics.transferBytes.current).toBe(9_500_000);
  });
});

/** Build a fake longtask PerformanceEntry with the fields readCpuMs reads. */
function longtask(startTime: number, duration: number): PerformanceEntry {
  return { entryType: "longtask", name: "self", startTime, duration } as PerformanceEntry;
}

describe("readResourceSnapshot CPU accounting", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("reads 0 for every metric when performance is undefined", () => {
    // Guards in both readTransferBytes (101) and readCpuMs (117) short-circuit to 0.
    vi.stubGlobal("performance", undefined);
    const snapshot = readResourceSnapshot("ads.example.com");
    expect(snapshot.metrics.transferBytes.current).toBe(0);
    expect(snapshot.metrics.totalCpuMs.current).toBe(0);
    expect(snapshot.metrics.peakCpuMs.current).toBe(0);
    expect(snapshot.overall).toBe("ok");
  });

  it("reads 0 CPU when getEntriesByType is not a function", () => {
    // Object present but missing getEntriesByType → typeof !== "function" branch.
    vi.stubGlobal("performance", {} as Performance);
    const snapshot = readResourceSnapshot();
    expect(snapshot.metrics.totalCpuMs.current).toBe(0);
    expect(snapshot.metrics.peakCpuMs.current).toBe(0);
    expect(snapshot.metrics.transferBytes.current).toBe(0);
  });

  it("returns zero CPU when getEntriesByType('longtask') throws (Safari)", () => {
    vi.spyOn(performance, "getEntriesByType").mockImplementation((type: string) => {
      if (type === "longtask") throw new Error("longtask unsupported");
      return [] as unknown as PerformanceEntryList;
    });
    const snapshot = readResourceSnapshot();
    expect(snapshot.metrics.totalCpuMs.current).toBe(0);
    expect(snapshot.metrics.peakCpuMs.current).toBe(0);
  });

  it("sums total CPU and finds the peak within a 30s sliding window", () => {
    // Three tasks: two inside one 30s window, the third outside it. The peak window is
    // the tightest sum (the two neighbours), exercising the inner break at 137.
    const entries = [longtask(0, 5_000), longtask(10_000, 4_000), longtask(90_000, 3_000)];
    vi.spyOn(performance, "getEntriesByType").mockImplementation((type: string) => {
      if (type === "longtask") return entries as unknown as PerformanceEntryList;
      if (type === "resource") return [] as unknown as PerformanceEntryList;
      return [] as unknown as PerformanceEntryList;
    });

    const snapshot = readResourceSnapshot();
    expect(snapshot.metrics.totalCpuMs.current).toBe(12_000); // 5000 + 4000 + 3000
    // Window ending at the second task: 5000 + 4000 = 9000. The third is 90s later, so its
    // own window (just itself) = 3000. Peak = 9000.
    expect(snapshot.metrics.peakCpuMs.current).toBe(9_000);
  });

  it("rolls overall up to breach and marks a warn metric when CPU crosses thresholds", () => {
    // peakCpuMs threshold is 15s: a single 16s task breaches peak+total. totalCpuMs
    // threshold is 60s; 16s is under warn there. Overall must roll up to breach (169),
    // and levelRank must see a non-breach warn somewhere for the warn ternary (88).
    const entries = [
      longtask(0, 16_000), // peak breach
    ];
    vi.spyOn(performance, "getEntriesByType").mockImplementation((type: string) => {
      if (type === "longtask") return entries as unknown as PerformanceEntryList;
      return [] as unknown as PerformanceEntryList;
    });

    // Custom thresholds so totalCpuMs lands in the warn band (>=80%, <100%): total=16000,
    // threshold 18000 → 88.9% → warn. peakCpuMs threshold 10000 → breach.
    const snapshot = readResourceSnapshot(undefined, {
      transferBytes: 4_000_000,
      peakCpuMs: 10_000,
      totalCpuMs: 18_000,
    });
    expect(snapshot.metrics.peakCpuMs.level).toBe("breach");
    expect(snapshot.metrics.totalCpuMs.level).toBe("warn");
    expect(snapshot.overall).toBe("breach");
  });

  it("rolls overall up to warn (not breach) when the worst metric is only warn", () => {
    const entries = [longtask(0, 9_000)];
    vi.spyOn(performance, "getEntriesByType").mockImplementation((type: string) => {
      if (type === "longtask") return entries as unknown as PerformanceEntryList;
      return [] as unknown as PerformanceEntryList;
    });
    // peak/total = 9000; threshold 10000 → 90% → warn, no breach. overallRank === 1 → warn.
    const snapshot = readResourceSnapshot(undefined, {
      transferBytes: 4_000_000,
      peakCpuMs: 10_000,
      totalCpuMs: 10_000,
    });
    expect(snapshot.overall).toBe("warn");
  });
});
