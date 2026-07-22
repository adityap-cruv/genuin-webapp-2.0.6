#!/usr/bin/env node
// check-tag.mjs — entry point. Loads a built JS ad tag inside an ad iframe,
// measures resource consumption, compares to budgets.json, prints a report, and
// exits 1 on an error-severity breach so it can gate a build.
//
//   node check-tag.mjs --dir ../dist --entry tag.js --profile medium-rectangle-300x250
//   node check-tag.mjs --url https://cdn.example.com/tags/tag.js --throttle 4
//
// Flags:
//   --dir <path>        directory containing the built tag (served locally)
//   --entry <file>      tag file within --dir (e.g. tag.js)            [with --dir]
//   --url <url>         absolute URL of a deployed tag                 [alt to --dir]
//   --html <file>       file containing inline tag HTML to inject      [alt]
//   --tag-id <id>       substitute __CR_TAG_ID__ in the --html snippet with <id>
//   --width <px>        substitute __CR_WIDTH__  in the --html snippet (default 320)
//   --height <px>       substitute __CR_HEIGHT__ in the --html snippet (default 100)
//   --budgets <path>    budget file (default ./budgets.json)
//   --profile <name>    ad-size profile from the budget file (default "default")
//   --observe <ms>      observation window (default from budgets, 30000)
//   --throttle <n>      CPU throttling rate to emulate slow hardware (default 1)
//   --runs <n>          run N times, assert worst case (default 1)
//   --quick             short observation (10s); skips the 30s peak-CPU check
//   --strict            treat IAB warn-severity breaches as failures
//   --view-mode <direct|iframe>          mount surface (default "direct")
//   --interaction <non-interacted|interacted>  post-observe gesture (default "non-interacted")
//   --post-interact-observe <ms>         window after the gesture (default from budgets, 10000)
//   --out <path>        JSON report path (default ./ad-budget-report.json)
import { readFile, writeFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { startServer } from './lib/server.mjs';
import { measure } from './lib/measure.mjs';
import { evaluate, printReport } from './lib/report.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));

function parseArgs(argv) {
  const a = {};
  for (let i = 2; i < argv.length; i++) {
    const k = argv[i];
    if (!k.startsWith('--')) continue;
    const name = k.slice(2);
    const next = argv[i + 1];
    if (next === undefined || next.startsWith('--')) { a[name] = true; }
    else { a[name] = next; i++; }
  }
  return a;
}

// Deep-merge a profile's overrides onto the base limits.
function applyProfile(limits, profile) {
  if (!profile) return limits;
  const out = JSON.parse(JSON.stringify(limits));
  for (const [key, override] of Object.entries(profile)) {
    if (key.startsWith('_')) continue;
    out[key] = { ...(out[key] || {}), ...override };
  }
  return out;
}

async function main() {
  const args = parseArgs(process.argv);

  if (!args.dir && !args.url && !args.html) {
    console.error('Provide one of: --dir <distDir> --entry <file> | --url <tagUrl> | --html <file>');
    process.exit(2);
  }

  const budgetsPath = resolve(args.budgets || resolve(__dirname, 'budgets.json'));
  const budgets = JSON.parse(await readFile(budgetsPath, 'utf8'));
  const defaults = budgets.defaults || {};

  const profileName = args.profile || 'default';
  const profile = (budgets.profiles || {})[profileName];
  if (!profile) {
    console.error(`Unknown profile "${profileName}". Available: ${Object.keys(budgets.profiles || {}).join(', ')}`);
    process.exit(2);
  }
  const limits = applyProfile(budgets.limits, profile);

  const cpuThrottle = Number(args.throttle || defaults.cpuThrottle || 1);
  const observeMs = args.quick ? 10000 : Number(args.observe || defaults.observeMs || 30000);
  const settleMs = Number(defaults.settleMs || 1500);
  const cpuSampleMs = Number(defaults.cpuSampleMs || 1000);
  const runs = Number(args.runs || defaults.runs || 1);
  const strict = !!args.strict;

  const VIEW_MODES = ['direct', 'iframe'];
  const viewMode = args['view-mode'] || 'direct';
  if (!VIEW_MODES.includes(viewMode)) {
    console.error(`Unknown view mode "${viewMode}". Available: ${VIEW_MODES.join(', ')}`);
    process.exit(2);
  }

  const INTERACTION_STATES = ['non-interacted', 'interacted'];
  const interactionState = args.interaction || 'non-interacted';
  if (!INTERACTION_STATES.includes(interactionState)) {
    console.error(`Unknown interaction state "${interactionState}". Available: ${INTERACTION_STATES.join(', ')}`);
    process.exit(2);
  }
  const postInteractObserveMs = Number(args['post-interact-observe'] || defaults.postInteractObserveMs || 10000);

  // Figure out what to serve / load.
  //
  // --dir and --html may be combined: serve a local dist directory AND inject a
  // custom inline snippet as the iframe body. This is how a tag whose loader
  // resolves sibling chunks relative to its own <script> src (e.g. CXR's
  // gen_ext.min.js → gen_ext-<hash>.js) gets measured — the snippet provides the
  // mount markup the tag needs, while the dist dir serves the chunks same-origin
  // so the loader's dynamic import() resolves to the local build, not the CDN.
  let serverOpts = {};
  let target = '';
  if (args.html) {
    let inlineTag = await readFile(resolve(args.html), 'utf8');
    // Optional placeholder substitution: lets one snippet template be reused for
    // many ad ids (e.g. CXR runs the same mount markup for each tag variation).
    if (args['tag-id']) {
      inlineTag = inlineTag.replace(/__CR_TAG_ID__/g, String(args['tag-id']));
    }
    // Mount pixel size drives the resolved ad layout (320×50 → L3, no player;
    // 320×100 → L4, banner player). Default to 320×100 so the single-tag
    // `pnpm budget` path (which passes no size) behaves exactly as before.
    const width = args.width !== undefined ? Number(args.width) : 320;
    const height = args.height !== undefined ? Number(args.height) : 100;
    inlineTag = inlineTag
      .replace(/__CR_WIDTH__/g, String(width))
      .replace(/__CR_HEIGHT__/g, String(height));
    serverOpts = { inlineTag };
    target = `${args.html} (inline)`;
    if (args.dir) {
      serverOpts.distDir = resolve(args.dir);
      target = `${args.html} + ${args.dir} (inline + local dir)`;
    }
  } else if (args.dir) {
    if (!args.entry) { console.error('--dir requires --entry <file>'); process.exit(2); }
    serverOpts = { distDir: resolve(args.dir), tagSrc: '/' + String(args.entry).replace(/^\//, '') };
    target = `${args.entry} (local dir)`;
  } else if (args.url) {
    serverOpts = { tagSrc: args.url };
    target = args.url;
  }

  const server = await startServer({ ...serverOpts, viewMode });
  let measured;
  try {
    measured = await measure({
      url: server.origin, observeMs, settleMs, cpuSampleMs, cpuThrottle, runs,
      interactionState, postInteractObserveMs,
    });
  } finally {
    await server.close();
  }

  const { rows, failed } = evaluate({ measured, limits, cpuThrottle, strict });
  printReport({ rows, measured, cpuThrottle, runs, target });

  const report = {
    target,
    profile: profileName,
    timestamp: new Date().toISOString(),
    config: { observeMs, cpuThrottle, runs, strict, viewMode, interactionState },
    measured,
    results: rows.map((r) => ({
      check: r.key, label: r.label, status: r.status,
      value: r.value, limit: r.limit.max, unit: r.limit.unit,
      severity: r.limit.severity, source: r.limit.source, note: r.note || undefined,
    })),
    passed: !failed,
  };
  const outPath = resolve(args.out || 'ad-budget-report.json');
  await writeFile(outPath, JSON.stringify(report, null, 2));
  console.log(`report → ${outPath}`);

  // Interacted-cell cost is report-only — HAI itself only governs un-interacted
  // frames, so a breach here must never fail the build, even when this entry
  // point is invoked directly instead of through run-budgets.mjs.
  if (failed && interactionState !== 'interacted') {
    console.log('\x1b[31mBUDGET BREACH — failing build.\x1b[0m');
    process.exit(1);
  }
  if (failed) {
    console.log('\x1b[33mBudget breach on an interacted cell (report-only; not failing).\x1b[0m');
    process.exit(0);
  }
  console.log('\x1b[32mWithin budget.\x1b[0m');
  process.exit(0);
}

main().catch((err) => {
  console.error('ad-budget-check error:', err);
  process.exit(2);
});
