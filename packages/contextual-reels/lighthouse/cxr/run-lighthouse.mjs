#!/usr/bin/env node
// run-lighthouse.mjs — run Lighthouse across the full CXR_TAGS × CXR_SIZES
// matrix (tags.mjs, shared with the ad-resource-budget harness), average the
// scores/metrics across all cells, and either print the averages
// (--save-baseline) or compare them against the committed baseline
// (lighthouse-baseline.json) and fail if any score regresses past tolerance.
//
//   node cxr/run-lighthouse.mjs                    # build dist, run matrix, compare to baseline
//   node cxr/run-lighthouse.mjs --skip-build       # reuse existing dist/
//   node cxr/run-lighthouse.mjs --save-baseline    # write the new average as the baseline
//   node cxr/run-lighthouse.mjs --concurrency 2    # cells in flight at once (default 2)
//
// Each cell gets its own ephemeral-port server (server.mjs, shared with the ad
// resource budget harness) so cells can run concurrently without port clashes.
// Concurrency defaults low (2) because each Lighthouse run already launches
// its own headless Chrome; too many at once starves them of CPU and corrupts
// the very metrics being measured (same reasoning as ad-resource-budget's
// throttled-run concurrency=1 rule).
/* global process */
import { spawn } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { CXR_TAGS, CXR_SIZES } from "../../ad-resource-budget/cxr/tags.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PKG_ROOT = resolve(__dirname, "../.."); // packages/contextual-reels
const RUN_ONE = resolve(__dirname, "../scripts/run-one.mjs");
const SNIPPET = resolve(__dirname, "tag-snippet.html");
const DIST = resolve(PKG_ROOT, "dist");
const BASELINE_PATH = resolve(PKG_ROOT, "lighthouse", "lighthouse-baseline.json");

// Score categories regress if they drop below (baseline - tolerance).
// Timing metrics regress if they exceed max(baseline * (1 + tolerance), floor).
//
// Tolerance is generous because each cell is a SINGLE Lighthouse run against a
// LIVE ad exchange (real GenAd fill, real creative bytes) averaged over only 9
// cells — the same "single run per form factor, no median-of-N" caveat
// LIGHTHOUSE.md's original baseline documented. One cell's ad creative landing
// heavier/lighter than usual, or one layout-shift blip, swings the 9-cell mean
// more than a code regression would. The floor matters most for TBT/CLS, whose
// baselines sit near zero (e.g. 20ms), where a bare 10% relative band (22ms) is
// noise-width and fires on run-to-run jitter alone.
const SCORE_TOLERANCE = 0.05; // 5 points on a 0-1 scale
const METRIC_TOLERANCE = 0.2; // 20%
const METRIC_FLOOR = {
  tbt: 150, // ms
  cls: 0.03,
  fcp: 500, // ms
  lcp: 800, // ms
  speedIndex: 800, // ms
  bootupTime: 150, // ms
  mainthreadWork: 300, // ms
  totalByteWeight: 150 * 1024, // bytes — real ad creative payload varies run to run
};

const C = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  dim: "\x1b[2m",
  bold: "\x1b[1m",
  cyan: "\x1b[36m",
};

function parseArgs(argv) {
  const a = {};
  for (let i = 2; i < argv.length; i++) {
    const k = argv[i];
    if (!k.startsWith("--")) continue;
    const name = k.slice(2);
    const next = argv[i + 1];
    if (next === undefined || next.startsWith("--")) a[name] = true;
    else {
      a[name] = next;
      i++;
    }
  }
  return a;
}

function runBuild() {
  return new Promise((res, rej) => {
    const child = spawn("pnpm", ["--filter=@genuin/contextual-reels", "build"], {
      cwd: resolve(PKG_ROOT, "../.."),
      stdio: "inherit",
    });
    child.on("close", (code) => (code === 0 ? res() : rej(new Error(`build failed (exit ${code})`))));
  });
}

function runOne(tag, size) {
  const args = [
    RUN_ONE,
    "--dir",
    DIST,
    "--html",
    SNIPPET,
    "--tag-id",
    tag.id,
    "--width",
    String(size.width),
    "--height",
    String(size.height),
  ];
  return new Promise((res) => {
    const child = spawn(process.execPath, args, { stdio: ["ignore", "pipe", "pipe"] });
    let out = "";
    let err = "";
    child.stdout.on("data", (d) => (out += d));
    child.stderr.on("data", (d) => (err += d));
    child.on("close", () => {
      try {
        // run-one.mjs prints exactly one JSON line to stdout.
        const line = out.trim().split("\n").pop();
        res({ tag, size, result: JSON.parse(line) });
      } catch {
        console.error(`${C.red}✗ ${tag.variation} @ ${size.label} failed${C.reset}\n${err || out}`);
        res({ tag, size, result: null });
      }
    });
    child.on("error", (e) => {
      console.error(`${C.red}✗ ${tag.variation} @ ${size.label} spawn error: ${e.message}${C.reset}`);
      res({ tag, size, result: null });
    });
  });
}

const METRIC_KEYS = ["performance", "accessibility", "bestPractices", "seo"];
const TIMING_KEYS = ["fcp", "lcp", "tbt", "cls", "speedIndex", "bootupTime", "mainthreadWork", "totalByteWeight"];

function average(cells, formFactor) {
  const acc = {};
  const keys = [...METRIC_KEYS, ...TIMING_KEYS];
  for (const key of keys) acc[key] = 0;
  let n = 0;
  for (const { result } of cells) {
    if (!result) continue;
    const r = result[formFactor];
    for (const key of keys) acc[key] += r[key];
    n++;
  }
  if (n === 0) return null;
  for (const key of keys) acc[key] /= n;
  return acc;
}

function fmtScore(v) {
  return Math.round(v * 100);
}

function printAverages(label, avg) {
  console.log(`\n${C.bold}${label}${C.reset}`);
  console.log(
    `  Performance ${fmtScore(avg.performance)}  Accessibility ${fmtScore(avg.accessibility)}  ` +
      `Best Practices ${fmtScore(avg.bestPractices)}  SEO ${fmtScore(avg.seo)}`
  );
  console.log(
    `  FCP ${Math.round(avg.fcp)}ms  LCP ${Math.round(avg.lcp)}ms  TBT ${Math.round(avg.tbt)}ms  ` +
      `CLS ${avg.cls.toFixed(3)}  Speed Index ${Math.round(avg.speedIndex)}ms`
  );
}

// Returns a list of regression messages (empty = no regressions).
function compareToBaseline(current, baseline, formFactor) {
  const regressions = [];
  for (const key of METRIC_KEYS) {
    const cur = current[key];
    const base = baseline[key];
    if (cur < base - SCORE_TOLERANCE) {
      regressions.push(
        `[${formFactor}] ${key} score dropped: ${fmtScore(cur)} vs baseline ${fmtScore(base)} ` +
          `(tolerance ${SCORE_TOLERANCE * 100} pts)`
      );
    }
  }
  for (const key of TIMING_KEYS) {
    const cur = current[key];
    const base = baseline[key];
    const limit = Math.max(base * (1 + METRIC_TOLERANCE), base + (METRIC_FLOOR[key] || 0));
    if (cur > limit) {
      regressions.push(
        `[${formFactor}] ${key} regressed: ${Math.round(cur)} vs baseline ${Math.round(base)} ` +
          `(limit ${Math.round(limit)}, ${METRIC_TOLERANCE * 100}% tolerance)`
      );
    }
  }
  return regressions;
}

async function main() {
  const args = parseArgs(process.argv);
  const skipBuild = !!args["skip-build"];
  const saveBaseline = !!args["save-baseline"];
  const concurrency = Math.max(1, Number(args.concurrency || 2));

  if (!skipBuild) {
    console.log(`${C.bold}Building @genuin/contextual-reels...${C.reset}`);
    await runBuild();
  }

  const cells = [];
  for (const tag of CXR_TAGS) {
    for (const size of CXR_SIZES) {
      cells.push({ tag, size });
    }
  }

  console.log(
    `${C.dim}${CXR_TAGS.length} tags × ${CXR_SIZES.length} sizes = ${cells.length} cells · concurrency ${concurrency}${C.reset}`
  );

  const rows = new Array(cells.length);
  let next = 0;
  async function worker() {
    while (next < cells.length) {
      const i = next++;
      const { tag, size } = cells[i];
      console.log(`${C.cyan}▶ ${tag.variation} @ ${size.label}${C.reset}`);
      rows[i] = await runOne(tag, size);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, cells.length) }, worker));

  const ok = rows.filter((r) => r.result);
  if (ok.length === 0) {
    console.error(`${C.red}All cells failed — nothing to average.${C.reset}`);
    process.exit(2);
  }
  if (ok.length < rows.length) {
    console.error(`${C.red}${rows.length - ok.length}/${rows.length} cells failed — failing the gate.${C.reset}`);
    process.exit(2);
  }

  const desktopAvg = average(ok, "desktop");
  const mobileAvg = average(ok, "mobile");
  printAverages("Desktop average", desktopAvg);
  printAverages("Mobile average", mobileAvg);

  if (saveBaseline) {
    const baseline = {
      cellCount: ok.length,
      tags: CXR_TAGS.map((t) => t.id),
      sizes: CXR_SIZES.map((s) => s.label),
      desktop: desktopAvg,
      mobile: mobileAvg,
    };
    await writeFile(BASELINE_PATH, JSON.stringify(baseline, null, 2) + "\n");
    console.log(`\n${C.green}Baseline saved to ${BASELINE_PATH}${C.reset}`);
    process.exit(0);
  }

  let baseline;
  try {
    baseline = JSON.parse(await readFile(BASELINE_PATH, "utf8"));
  } catch {
    console.error(`${C.red}No baseline found at ${BASELINE_PATH}. Run with --save-baseline first.${C.reset}`);
    process.exit(2);
  }

  const regressions = [
    ...compareToBaseline(desktopAvg, baseline.desktop, "desktop"),
    ...compareToBaseline(mobileAvg, baseline.mobile, "mobile"),
  ];

  console.log(`\n${C.bold}══ Baseline comparison ══${C.reset}`);
  if (regressions.length === 0) {
    console.log(`${C.green}No regressions — within baseline tolerance.${C.reset}`);
    process.exit(0);
  }
  for (const r of regressions) console.log(`${C.red}✗ ${r}${C.reset}`);
  console.log(`\n${C.red}${C.bold}LIGHTHOUSE REGRESSION — scores fell below baseline.${C.reset}`);
  process.exit(1);
}

main().catch((err) => {
  console.error("run-lighthouse error:", err);
  process.exit(2);
});
