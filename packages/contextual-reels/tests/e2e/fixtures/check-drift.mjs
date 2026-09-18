/**
 * Fixture drift check — compare the committed QA captures against live QA.
 *
 * The E2E suite replays `tests/e2e/fixtures/raw/<tag>.{tag,feed}.json` verbatim.
 * Nothing verified they still match what the API actually returns, and that is
 * not a hypothetical risk: the captured feeds were missing `visit_id`, one of the
 * two keys `RudderstackEventBuffer` requires before it will flush. Every E2E run
 * therefore emitted zero analytics, silently, for months. It was found by
 * accident while rebuilding the suite.
 *
 * This compares SHAPE, not values. Ad payloads, timestamps, ids and CDN URLs all
 * change per response, so a value diff would be permanently red and would teach
 * everyone to ignore the job. What matters is that a key the bundle reads has not
 * appeared or vanished.
 *
 * Two severities, for the same reason:
 *
 *   FAIL    a LOAD_BEARING key drifted — something the bundle actually reads.
 *   NOTICE  the envelope gained or lost some other field. The backend churns
 *           presentational fields routinely (`allowed_domains` is declared
 *           optional in services/api.ts and never read, and live has already
 *           dropped it), so gating on this would make the job red for changes
 *           that cannot affect the widget — and a job that is always red is a
 *           job everyone learns to ignore.
 *
 * If a NOTICE turns out to matter, promote that key into LOAD_BEARING; that is
 * the intended workflow, and it is why notices are printed rather than hidden.
 *
 * Exit codes:
 *   0  no drift (or the endpoint was unreachable — see --strict)
 *   1  drift found
 *   2  bad usage / unreadable fixture
 *
 * Usage:
 *   node tests/e2e/fixtures/check-drift.mjs
 *   node tests/e2e/fixtures/check-drift.mjs --strict   # network failure also fails
 */
/* global process */
import { readFileSync, readdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const RAW_DIR = resolve(here, "raw");
const API = "https://api.qa.begenuin.com/goservices";

const strict = process.argv.includes("--strict");

/**
 * Drift the harness already compensates for, so the job is not red from day one.
 *
 * `visit_id` is session-scoped: the live API mints a fresh one per response, so
 * a captured value would be meaningless and re-capturing would not keep it
 * current. `mountWidget.withVisitId()` injects a deterministic one instead,
 * which is MORE faithful than the capture (a real /feed always carries one).
 *
 * Anything listed here must name the compensating code. An entry with no
 * compensation is drift being hidden, not handled — fix the fixture instead.
 */
const COMPENSATED = new Map([
  ["data.visit_id", "tests/e2e/support/mountWidget.ts → withVisitId() injects one per mount"],
  ["visit_id", "tests/e2e/support/mountWidget.ts → withVisitId() injects one per mount"],
]);

/**
 * Keys the bundle actually reads. Drift in anything else is noise — the backend
 * adds and removes presentational fields routinely — but a change here breaks
 * the widget. Each entry notes the consumer so a failure is actionable.
 */
const LOAD_BEARING = {
  feed: [
    ["data.visit_id", "services/feed.ts → setMandatoryData; the analytics buffer will not flush without it"],
    ["data.reels", "providers/FeedProvider.tsx → normaliseFeed"],
    ["data.reels[].type", "feed/feedTransforms.ts → ads-vs-video routing"],
  ],
  tag: [
    ["data.brand_id", "providers/StrategyProvider → BRAND_STRATEGIES lookup"],
    ["data.config", "StrategyProvider → enable_ask_question (GenAI)"],
  ],
};

/** Recursively describe an object's key shape, collapsing arrays to their first element. */
function shapeOf(value, path = "", out = new Set()) {
  if (Array.isArray(value)) {
    if (path) out.add(`${path}[]`);
    if (value.length > 0) shapeOf(value[0], `${path}[]`, out);
    return out;
  }
  if (value !== null && typeof value === "object") {
    for (const [k, v] of Object.entries(value)) {
      const next = path ? `${path}.${k}` : k;
      out.add(next);
      shapeOf(v, next, out);
    }
    return out;
  }
  return out;
}

/** Read a dotted path, treating `[]` as "first element". */
function readPath(root, path) {
  let cur = root;
  for (const seg of path.replace(/\[\]/g, ".0").split(".")) {
    if (cur === null || cur === undefined) return undefined;
    cur = cur[seg];
  }
  return cur;
}

async function fetchJson(url) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 20_000);
  try {
    const res = await fetch(url, { headers: { "x-user-id": "e2e-drift-check" }, signal: ctrl.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

async function main() {
  let files;
  try {
    files = readdirSync(RAW_DIR).filter((f) => f.endsWith(".tag.json"));
  } catch (err) {
    console.error(`Cannot read ${RAW_DIR}: ${String(err)}`);
    process.exit(2);
  }
  if (files.length === 0) {
    console.error("No fixtures found.");
    process.exit(2);
  }

  const drift = [];
  const unreachable = [];
  const compensated = new Set();
  const notices = [];

  for (const file of files) {
    const tagId = file.replace(".tag.json", "");
    for (const kind of ["tag", "feed"]) {
      const path = resolve(RAW_DIR, `${tagId}.${kind}.json`);
      let captured;
      try {
        captured = JSON.parse(readFileSync(path, "utf8"));
      } catch {
        continue; // some tags only have a .tag.json
      }

      const url = kind === "feed" ? `${API}/ad_creative/feed?tag_id=${tagId}` : `${API}/ad_creative?tag_id=${tagId}`;

      let live;
      try {
        live = await fetchJson(url);
      } catch (err) {
        unreachable.push(`${tagId}.${kind}: ${String(err)}`);
        continue;
      }

      // 1. Load-bearing keys must be present in BOTH. A key that the live API
      //    has and the fixture lacks is exactly the visit_id failure mode.
      for (const [keyPath, consumer] of LOAD_BEARING[kind]) {
        const inLive = readPath(live, keyPath) !== undefined;
        const inFixture = readPath(captured, keyPath) !== undefined;
        if (inLive && !inFixture) {
          if (COMPENSATED.has(keyPath)) {
            compensated.add(`${keyPath} — ${COMPENSATED.get(keyPath)}`);
          } else {
            drift.push(`MISSING FROM FIXTURE  ${tagId}.${kind}  ${keyPath}\n    consumer: ${consumer}`);
          }
        } else if (!inLive && inFixture) {
          drift.push(`GONE FROM LIVE API    ${tagId}.${kind}  ${keyPath}\n    consumer: ${consumer}`);
        }
      }

      // 2. Top-level envelope shape — informational only, see the severity note
      //    in the module doc comment.
      const liveTop = [...shapeOf(live.data ?? {})].filter((k) => !k.includes("."));
      const fixTop = [...shapeOf(captured.data ?? {})].filter((k) => !k.includes("."));
      const added = liveTop.filter((k) => !fixTop.includes(k) && !COMPENSATED.has(k));
      const removed = fixTop.filter((k) => !liveTop.includes(k));
      if (added.length || removed.length) {
        notices.push(
          `${tagId}.${kind}` +
            (added.length ? `\n      live has, fixture lacks: ${added.join(", ")}` : "") +
            (removed.length ? `\n      fixture has, live lacks: ${removed.join(", ")}` : "")
        );
      }
    }
  }

  if (compensated.size) {
    console.log(`\nCompensated by the harness (not drift):`);
    compensated.forEach((c) => console.log(`  ${c}`));
  }

  if (notices.length) {
    console.log(`\nEnvelope notices (informational — not a failure):`);
    notices.forEach((n) => console.log(`    ${n}`));
    console.log("  Promote a key into LOAD_BEARING if the bundle starts reading it.");
  }

  if (unreachable.length) {
    console.log(`\nUnreachable (${unreachable.length}):`);
    unreachable.forEach((u) => console.log(`  ${u}`));
  }

  if (drift.length) {
    console.log(`\n❌ Fixture drift (${drift.length}):\n`);
    drift.forEach((d) => console.log(`  ${d}\n`));
    console.log("Refresh with the curl commands in tests/e2e/README.md#fixtures,");
    console.log("then re-run the E2E suite — a shape change usually moves behaviour too.\n");
    process.exit(1);
  }

  if (unreachable.length && strict) {
    console.log("\n❌ --strict: QA API unreachable.\n");
    process.exit(1);
  }

  console.log(
    `\n✅ No load-bearing drift across ${files.length} tag(s)` +
      (notices.length ? ` (${notices.length} envelope notice(s) above).` : ".") +
      "\n"
  );
  process.exit(0);
}

main().catch((err) => {
  console.error(String(err));
  process.exit(2);
});
