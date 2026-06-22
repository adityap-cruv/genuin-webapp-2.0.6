/**
 * track-bundle-size.mjs
 *
 * Reads dist/ from the package root, computes raw and gzip sizes for every
 * .js and .css file, and writes a markdown table to stdout ready to paste
 * into docs/build-metrics/PERFORMANCE_MATRIX.md.
 *
 * Usage (from packages/contextual-reels):
 *   node scripts/track-bundle-size.mjs
 *
 * Exit codes:
 *   0 — success
 *   1 — dist/ does not exist (run pnpm build first)
 */

import { existsSync, readdirSync, readFileSync } from "fs";
import { join, relative } from "path";
import { dirname } from "path";
import { fileURLToPath } from "url";
import { gzipSync } from "zlib";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/** Root of the package — one level up from scripts/ */
const PKG_ROOT = join(__dirname, "..");
const DIST_DIR = join(PKG_ROOT, "dist");

/**
 * Recursively collect all .js and .css files under a directory.
 * Excludes .map files.
 *
 * @param {string} dir - Absolute path to search.
 * @returns {string[]} Absolute file paths.
 */
function collectFiles(dir) {
  const entries = readdirSync(dir, { withFileTypes: true });
  /** @type {string[]} */
  const results = [];

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectFiles(fullPath));
    } else if (
      entry.isFile() &&
      !entry.name.endsWith(".map") &&
      (entry.name.endsWith(".js") || entry.name.endsWith(".css"))
    ) {
      results.push(fullPath);
    }
  }

  return results.sort();
}

/**
 * Format a byte count as a human-readable string (B, KB, MB).
 *
 * @param {number} bytes
 * @returns {string}
 */
function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)}MB`;
}

/**
 * Build and print the markdown table.
 */
function run() {
  if (!existsSync(DIST_DIR)) {
    process.stderr.write("Error: dist/ directory not found.\nRun `pnpm build` first, then re-run this script.\n");
    process.exit(1);
  }

  const files = collectFiles(DIST_DIR);

  if (files.length === 0) {
    process.stderr.write("Warning: dist/ exists but contains no .js or .css files.\nRun `pnpm build` first.\n");
    process.exit(1);
  }

  /** @type {Array<{ name: string, raw: number, gz: number }>} */
  const rows = [];
  let totalRaw = 0;
  let totalGz = 0;

  for (const filePath of files) {
    const buf = readFileSync(filePath);
    const gz = gzipSync(buf).length;
    totalRaw += buf.length;
    totalGz += gz;
    rows.push({
      name: relative(DIST_DIR, filePath),
      raw: buf.length,
      gz,
    });
  }

  // Sort: loader first, then by gz descending so biggest chunks surface early.
  rows.sort((a, b) => {
    if (a.name === "gen_ext.min.js") return -1;
    if (b.name === "gen_ext.min.js") return 1;
    return b.gz - a.gz;
  });

  const lines = ["| File | Raw | Gzip |", "|---|---|---|"];

  for (const row of rows) {
    lines.push(`| \`${row.name}\` | ${formatBytes(row.raw)} | ${formatBytes(row.gz)} |`);
  }

  lines.push(`| **Total** | **${formatBytes(totalRaw)}** | **${formatBytes(totalGz)}** |`);

  process.stdout.write(lines.join("\n") + "\n");
}

run();
