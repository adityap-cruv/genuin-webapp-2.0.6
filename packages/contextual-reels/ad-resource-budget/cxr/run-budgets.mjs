#!/usr/bin/env node
// run-budgets.mjs — run the ad-resource-budget harness across the full matrix
// of CXR tag variations × mount sizes × view modes × interaction states
// (cxr/tags.mjs), score each cell, and print a combined scorecard. Size matters
// because 320×50 resolves to the L3 layout (no player → no reel video), a very
// different resource profile from 320×100. View mode matters because a
// publisher-embedded iframe adds a same-origin wrapper frame. Interaction state
// matters because expanding + swiping loads additional creative/HLS segments
// that a passive HAI-style observation never triggers.
//
// Fill is non-deterministic, so each cell is measured with --runs (default 3)
// and the harness asserts the worst case. Exits 1 if ANY **non-interacted**
// cell breaches an error-severity (Chrome HAI) limit — interacted cells are
// report-only (see score()) since HAI itself never gates on post-interaction
// cost, so a single invocation gates all variations without over-constraining
// a metric nobody has set a real ceiling for yet.
//
//   node cxr/run-budgets.mjs                 # 3 runs/tag, unthrottled
//   node cxr/run-budgets.mjs --throttle 4    # stress HAI's CPU limits
//   node cxr/run-budgets.mjs --runs 5        # more runs for tighter worst-case
//   node cxr/run-budgets.mjs --report-only   # measure + score, never fail
//   node cxr/run-budgets.mjs --concurrency 4 # cells in flight at once (default 4)
//
// Cells are independent (own ephemeral-port server + own browser instance), so
// they run concurrently instead of one at a time — a pool of --concurrency
// workers pulls cells off a shared queue. CPU-throttled runs (--throttle > 1)
// still run one at a time: throttling emulates slow hardware by capping this
// process's CPU budget, and concurrent browsers would contend for real CPU and
// invalidate each other's throttled measurement.
import { spawn } from "node:child_process";
import { readFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { CXR_TAGS, CXR_SIZES, CXR_PROFILE, CXR_VIEW_MODES, CXR_INTERACTION_STATES } from "./tags.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PKG_ROOT = resolve(__dirname, "../.."); // packages/contextual-reels
const CHECK = resolve(__dirname, "../scripts/check-tag.mjs");
const SNIPPET = resolve(__dirname, "tag-snippet.html");
const DIST = resolve(PKG_ROOT, "dist");

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
    if (next === undefined || next.startsWith("--")) {
      a[name] = true;
    } else {
      a[name] = next;
      i++;
    }
  }
  return a;
}

// Run check-tag.mjs for one tag at one mount size × view mode × interaction
// state. Its own report (JSON) is the return value. With concurrency > 1,
// several children stream at once, so raw stdio:'inherit' would interleave
// their output line-by-line into an unreadable mess — output is buffered per
// child and flushed as one block when it closes, keeping each cell's log
// contiguous while still running in parallel.
function runOne(tag, size, viewMode, interaction, { runs, throttle, outPath }) {
  const args = [
    CHECK,
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
    "--profile",
    CXR_PROFILE,
    "--runs",
    String(runs),
    "--view-mode",
    viewMode.id,
    "--interaction",
    interaction.id,
    "--out",
    outPath,
  ];
  if (throttle && Number(throttle) > 1) args.push("--throttle", String(throttle));

  return new Promise((res) => {
    const header = `\n${C.cyan}${C.bold}▶ ${tag.variation} @ ${size.label} · ${viewMode.id} · ${interaction.id}${C.reset}  ${C.dim}${tag.label} · tag ${tag.id}${C.reset}`;
    const child = spawn(process.execPath, args, { stdio: ["ignore", "pipe", "pipe"] });
    let out = "";
    child.stdout.on("data", (d) => {
      out += d;
    });
    child.stderr.on("data", (d) => {
      out += d;
    });
    // check-tag exits 1 on breach — expected here; the runner decides overall
    // status from the report, not the child's exit code.
    child.on("close", () => {
      console.log(header);
      process.stdout.write(out);
      res();
    });
    child.on("error", (err) => {
      console.log(header);
      console.error(`  spawn error: ${err.message}`);
      res();
    });
  });
}

function fmtBytes(v) {
  if (v >= 1048576) return `${(v / 1048576).toFixed(2)} MB`;
  return `${(v / 1024).toFixed(0)} KB`;
}

// Letter grade from the HAI headroom + IAB warn breaches. HAI breach caps at F.
// errBreach here always reflects this cell's own error-severity checks; the
// caller (main) is responsible for deciding whether an interacted cell's
// errBreach counts toward the build gate (it must not — report-only per the
// user's decision that HAI itself never gates on post-interaction cost).
function score(report) {
  if (!report) return { grade: "—", headroom: 0, note: "no report" };
  const byKey = Object.fromEntries(report.results.map((r) => [r.check, r]));
  const total = byKey.transferredBytesTotal;
  const errBreach = report.results.some((r) => r.severity === "error" && r.status === "fail");
  const warnBreach = report.results.filter(
    (r) => r.severity === "warn" && (r.status === "warn" || r.status === "fail")
  ).length;

  // Fraction of the 4 MB HAI transfer ceiling used (the dominant risk).
  const frac = total ? total.value / total.limit : 0;
  let grade;
  if (errBreach) grade = "F";
  else if (frac <= 0.5 && warnBreach === 0) grade = "A";
  else if (frac <= 0.7 && warnBreach <= 1) grade = "B";
  else if (frac <= 0.85) grade = "C";
  else grade = "D";
  return { grade, frac, errBreach, warnBreach, total };
}

async function main() {
  const args = parseArgs(process.argv);
  const runs = Number(args.runs || 3);
  const throttle = args.throttle;
  const reportOnly = !!args["report-only"];
  // Throttled runs emulate slow hardware by capping CPU; running several
  // browsers at once would let them steal CPU from each other and corrupt the
  // throttled measurement, so throttled cells are forced to concurrency 1.
  const concurrency = throttle && Number(throttle) > 1 ? 1 : Math.max(1, Number(args.concurrency || 4));

  const cellCount = CXR_TAGS.length * CXR_SIZES.length * CXR_VIEW_MODES.length * CXR_INTERACTION_STATES.length;
  console.log(`${C.bold}CXR Ad Resource Budget — all variations${C.reset}`);
  console.log(
    `${C.dim}${CXR_TAGS.length} tags × ${CXR_SIZES.length} sizes × ${CXR_VIEW_MODES.length} view-modes × ${CXR_INTERACTION_STATES.length} interaction-states = ${cellCount} cells · profile "${CXR_PROFILE}" · ${runs} runs/cell${throttle ? ` · CPU throttle ${throttle}x` : ""} · concurrency ${concurrency}${C.reset}`
  );

  // Cross size × tag × view-mode × interaction-state into the full matrix.
  // Report filenames are keyed by all four axes
  // (ad-budget-report.<variation>.<size>.<viewMode>.<interaction>.json) so no
  // cell clobbers another's report, which is also what makes concurrent cells
  // safe — each has its own report file, own ephemeral-port server, own browser.
  const cells = [];
  for (const tag of CXR_TAGS) {
    for (const size of CXR_SIZES) {
      for (const viewMode of CXR_VIEW_MODES) {
        for (const interaction of CXR_INTERACTION_STATES) {
          cells.push({ tag, size, viewMode, interaction });
        }
      }
    }
  }

  const rows = new Array(cells.length);
  let next = 0;
  async function worker() {
    while (next < cells.length) {
      const i = next++;
      const { tag, size, viewMode, interaction } = cells[i];
      const outPath = resolve(
        PKG_ROOT,
        `ad-budget-report.${tag.variation}.${size.label}.${viewMode.id}.${interaction.id}.json`
      );
      await runOne(tag, size, viewMode, interaction, { runs, throttle, outPath });
      let report = null;
      try {
        report = JSON.parse(await readFile(outPath, "utf8"));
      } catch {
        /* left null */
      }
      rows[i] = { tag, size, viewMode, interaction, report, sc: score(report) };
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, cells.length) }, worker));

  // ---- combined scorecard -------------------------------------------------
  const gradeColor = { A: C.green, B: C.green, C: C.yellow, D: C.yellow, F: C.red, "—": C.dim };
  const pad = (s, n) =>
    (String(s) + " ".repeat(Math.max(n, String(s).length + 1))).slice(0, Math.max(n, String(s).length + 1));
  // Abbreviated so the row stays terminal-width friendly with two more columns.
  const viewAbbrev = { direct: "direct", iframe: "iframe" };
  const interactAbbrev = { "non-interacted": "no-int", interacted: "interact" };

  console.log(`\n${C.bold}══ Scorecard ══${C.reset}`);
  console.log(
    `${C.dim}${pad("  VARIATION", 14)}${pad("SIZE", 10)}${pad("VIEW", 9)}${pad("INTERACT", 10)}${pad("GRADE", 7)}${pad("TOTAL", 11)}${pad("HAI 4MB", 10)}${pad("CPU", 8)}WARN${C.reset}`
  );
  for (const { tag, size, viewMode, interaction, report, sc } of rows) {
    const g = `${gradeColor[sc.grade]}${sc.grade}${C.reset}`;
    const total = sc.total ? fmtBytes(sc.total.value) : "—";
    const haiPct = sc.total ? `${Math.round(sc.frac * 100)}%` : "—";
    const cpu = report ? `${report.measured.cpuTotalSeconds.toFixed(1)}s` : "—";
    // Interacted cells never gate the build, so their HAI cell is never shown
    // as "OVER" even if errBreach is true for that cell in isolation.
    const gates = interaction.id === "non-interacted";
    const haiCell = sc.errBreach && gates ? `${C.red}${haiPct} OVER${C.reset}` : `${C.green}${haiPct}${C.reset}`;
    console.log(
      `  ${pad(tag.variation, 12)}${pad(size.label, 10)}${pad(viewAbbrev[viewMode.id], 9)}${pad(interactAbbrev[interaction.id], 10)}${pad(g, 7 + (gradeColor[sc.grade].length + C.reset.length))}${pad(total, 11)}${pad(haiCell, 10 + (C.red.length + C.reset.length))}${pad(cpu, 8)}${sc.warnBreach || 0}`
    );
  }
  console.log(`${C.dim}  Grade: A ≤50%·0 warn · B ≤70%·≤1 warn · C ≤85% · D <100% · F = HAI breach${C.reset}`);
  console.log(
    `${C.dim}  Gate: only "no-int" (non-interacted) cells' HAI breach fails the build — "interact" cells are informational only.${C.reset}`
  );

  // Post-interaction informational note per interacted cell (never part of the
  // pass/fail gate — see score()'s doc comment and the user's report-only decision).
  for (const { tag, size, viewMode, interaction, report } of rows) {
    if (interaction.id !== "interacted" || !report?.measured?.interacted) continue;
    const m = report.measured;
    console.log(
      `${C.dim}  ↳ ${tag.variation} @ ${size.label} · ${viewMode.id} post-interaction: ` +
        `${fmtBytes(m.postInteractionTransferredBytes)} · ${m.postInteractionCpuSeconds.toFixed(1)}s CPU · ` +
        `expand ${m.expandFound ? "found" : "not found"} · swipe ${m.swipeSucceeded ? "ok" : "failed"}${C.reset}`
    );
  }

  // Heaviest request per breaching cell — the actionable "what to cut" line.
  // Only non-interacted cells can breach here (see anyBreach below); interacted
  // cells are excluded from this line to match the same report-only gating.
  for (const { tag, size, viewMode, interaction, report, sc } of rows) {
    if (interaction.id !== "non-interacted" || !sc.errBreach || !report?.measured?.topRequests?.length) continue;
    const top = report.measured.topRequests[0];
    console.log(
      `\n${C.red}  ✗ ${tag.variation} @ ${size.label} · ${viewMode.id}${C.reset} over HAI. Heaviest: ${C.bold}${fmtBytes(top.bytes)}${C.reset} ${C.dim}${top.type} · ${top.url.length > 64 ? top.url.slice(0, 61) + "…" : top.url}${C.reset}`
    );
  }

  // Gate: only non-interacted cells' error-severity breach can fail the build.
  // Interacted cells are measured and reported (informational note above) but
  // never fail the run — HAI itself does not gate on post-interaction cost.
  const anyBreach = rows.some((r) => r.interaction.id === "non-interacted" && r.sc.errBreach);
  console.log("");
  if (anyBreach && !reportOnly) {
    console.log(`${C.red}${C.bold}BUDGET BREACH — one or more variations exceed Chrome HAI limits.${C.reset}`);
    process.exit(1);
  }
  if (anyBreach) {
    console.log(`${C.yellow}Breaches present (report-only mode; not failing).${C.reset}`);
    process.exit(0);
  }
  console.log(`${C.green}${C.bold}All variations within budget.${C.reset}`);
  process.exit(0);
}

main().catch((err) => {
  console.error("cxr budget runner error:", err);
  process.exit(2);
});
