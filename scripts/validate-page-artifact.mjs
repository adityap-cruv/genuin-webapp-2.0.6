#!/usr/bin/env node
/**
 * Validate a Hierarchical Tree `Page` TypeScript artifact against the
 * Zod schema + rule checks shared with the runtime walker. Imports the
 * artifact module via `tsx` so the script accepts the same `.ts` files
 * the dev shell consumes.
 *
 * Usage:
 *   pnpm --filter @genuin/hierarchical-tree validate <path/to/page.ts>
 *   node scripts/validate-page-artifact.mjs <path/to/page.ts>
 *
 * Exit codes: 0 = ok (with warnings), 1 = rule/schema failure, 2 = import failure.
 */

import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, isAbsolute } from 'node:path';
import { existsSync } from 'node:fs';

const isTTY = Boolean(process.stdout.isTTY);
const red = isTTY ? '\x1b[31m' : '';
const yellow = isTTY ? '\x1b[33m' : '';
const reset = isTTY ? '\x1b[0m' : '';

const [, , inputPath] = process.argv;
if (!inputPath) {
  process.stderr.write('usage: validate-page-artifact.mjs <path/to/page.ts>\n');
  process.exit(2);
}

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, '..');

let absoluteInput = isAbsolute(inputPath) ? inputPath : resolve(process.cwd(), inputPath);
if (!existsSync(absoluteInput)) {
  // Fallback: paths supplied via `pnpm --filter` run with cwd inside
  // the package, but it's natural to copy/paste paths relative to
  // the repo root. Try resolving from the repo root before failing.
  const repoRootAttempt = resolve(repoRoot, inputPath);
  if (existsSync(repoRootAttempt)) {
    absoluteInput = repoRootAttempt;
  } else {
    process.stderr.write(`${red}artifact not found: ${absoluteInput}${reset}\n`);
    process.exit(2);
  }
}

// Spawn `tsx` to run the inline worker that imports the artifact and
// the rule helpers (both TypeScript). tsx resolves from the package's
// node_modules; we look there first, then fall back to the pnpm-hoisted
// copy at the repo root.
const candidateTsxCli = [
  resolve(repoRoot, 'packages/hierarchical-tree/node_modules/tsx/dist/cli.mjs'),
  resolve(repoRoot, 'node_modules/tsx/dist/cli.mjs'),
].find(existsSync);

if (!candidateTsxCli) {
  process.stderr.write(
    `${red}tsx not found; run \`pnpm install\` in the workspace root${reset}\n`,
  );
  process.exit(2);
}

const workerPath = resolve(scriptDir, 'validate-page-artifact.worker.mts');

const result = spawnSync(
  process.execPath,
  [candidateTsxCli, workerPath, absoluteInput],
  { stdio: ['inherit', 'pipe', 'pipe'], encoding: 'utf8' },
);

if (result.status === 2) {
  process.stderr.write(`${red}${result.stderr ?? ''}${reset}`);
  process.exit(2);
}

let payload;
try {
  payload = JSON.parse(result.stdout);
} catch (err) {
  process.stderr.write(`${red}worker output unparseable:${reset} ${err.message}\n`);
  process.stderr.write(result.stdout);
  process.stderr.write(result.stderr ?? '');
  process.exit(2);
}

const label = inputPath;
if (!payload.ok) {
  for (const issue of payload.errors) {
    process.stdout.write(`${red}${label}: ${issue.code}${reset} — ${issue.message} (${issue.path})\n`);
  }
  process.exit(1);
}

for (const warn of payload.warnings) {
  process.stdout.write(`${yellow}${label}: ${warn.code}${reset} — ${warn.message} (${warn.path})\n`);
}
process.stdout.write(`ok: ${label} (${payload.warnings.length} warning(s))\n`);
process.exit(0);
