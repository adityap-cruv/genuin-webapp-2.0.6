#!/usr/bin/env node
// Reads skills.registry.json and downloads any remote skills into .team/skills/
// Usage: node fetch-skills.mjs
// Add to package.json: "skills:fetch": "node fetch-skills.mjs"

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const registryPath = join(root, ".team", "skills.registry.json");
let registry;

try {
  const registryContent = readFileSync(registryPath, "utf-8");
  registry = JSON.parse(registryContent);
} catch (err) {
  if (err.code === "ENOENT") {
    console.error("❌ Error: skills.registry.json not found");
    console.error(`   Expected location: ${registryPath}`);
    console.error("   This file is part of the repo check it exists and your branch is up to date.");
  } else if (err instanceof SyntaxError) {
    console.error("❌ Error: skills.registry.json contains invalid JSON");
    console.error(`   File: ${registryPath}`);
    console.error(`   Details: ${err.message}`);
  } else {
    console.error("❌ Error: Could not read skills.registry.json");
    console.error(`   File: ${registryPath}`);
    console.error(`   Details: ${err.message}`);
  }
  process.exit(1);
}

if (!registry || typeof registry !== "object") {
  console.error("❌ Error: Invalid registry — must be a JSON object");
  console.error(`   File: ${registryPath}`);
  console.error("   Fix: Ensure registry is valid JSON");
  process.exit(1);
}

if (!Array.isArray(registry.skills)) {
  console.error("❌ Error: Invalid registry structure — skills must be an array");
  console.error(`   File: ${registryPath}`);
  console.error("   Fix: Ensure registry has a 'skills' array property");
  process.exit(1);
}

// ─── Fetch timeout ───────────────────────────────────────────────────
//  Each request aborts after FETCH_TIMEOUT_MS to prevent indefinite blocking.
// script indefinitely. Now each request aborts after 10 seconds.

const FETCH_TIMEOUT_MS = 10_000;

// ─── Better skill content validation ─────────────────────────────────
// Previously, validation checked for the string "# Skill:" which most real
// skill files don't use — causing constant false-positive warnings.
// Now we check for something structural: the file must have at least one
// markdown heading (##) and a minimum length, which any real skill file has.

function looksLikeSkill(content) {
  return content.length > 200 && content.includes("##");
}

// ─── Parallel fetching ───────────────────────────────────────────────
// Previously, skills were fetched sequentially with await inside a for..of loop.
// With 5+ remote skills at ~300ms each, that adds up fast.
// Now all remote fetches run in parallel via Promise.allSettled(), so total
// fetch time is roughly the slowest single request instead of the sum of all.

const results = { fetched: [], skipped: [], failed: [] };

// Handle local skills (no network needed — process synchronously first)
for (const skill of registry.skills) {
  if (skill.source !== "local") continue;

  if (skill.path) {
    const localPath = join(root, skill.path);
    if (!existsSync(localPath)) {
      results.failed.push(`${skill.name} — local path not found: ${skill.path}`);
      console.error(`  ❌ ${skill.name}: local file missing at ${skill.path}`);
      continue;
    }
  }
  results.skipped.push(`${skill.name} (local — managed manually)`);
}

// Fetch all remote (github) skills in parallel
const remoteSkills = registry.skills.filter((s) => s.source === "github");

async function fetchSkill(skill) {
  if (!skill.url) {
    return { skill, error: "missing 'url' field" };
  }

  console.log(`⬇  Fetching ${skill.name} from ${skill.url}`);

  let response;
  try {
    // Fix #3: abort after FETCH_TIMEOUT_MS
    response = await fetch(skill.url, {
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
  } catch (err) {
    const reason =
      err.name === "TimeoutError"
        ? `timed out after ${FETCH_TIMEOUT_MS / 1000}s`
        : err.message;
    return { skill, error: reason };
  }

  if (!response.ok) {
    return { skill, error: `HTTP ${response.status} from ${skill.url}` };
  }

  let content;
  try {
    content = await response.text();
  } catch (err) {
    return { skill, error: `failed to read response body: ${err.message}` };
  }

  // structural validation instead of fragile string match
  if (!looksLikeSkill(content)) {
    console.warn(
      `  ⚠  ${skill.name}: file seems too short or lacks section headings — saving anyway`,
    );
  }

  const skillDir = join(root, ".team", "skills", skill.name);
  try {
    mkdirSync(skillDir, { recursive: true });
  } catch (mkdirErr) {
    return { skill, error: `could not create directory: ${mkdirErr.message}` };
  }

  const skillPath = join(skillDir, "SKILL.md");
  const header = `<!-- Fetched from ${skill.url} — do not edit directly. Run fetch-skills.mjs to update. -->\n\n`;
  try {
    writeFileSync(skillPath, header + content);
  } catch (writeErr) {
    return { skill, error: `could not write file: ${writeErr.message}` };
  }

  console.log(`  ✅ Saved to .team/skills/${skill.name}/SKILL.md`);
  return { skill, error: null };
}

// Run all remote fetches concurrently
const settled = await Promise.allSettled(remoteSkills.map(fetchSkill));

for (const outcome of settled) {
  if (outcome.status === "rejected") {
    // fetchSkill itself shouldn't throw, but guard anyway
    results.failed.push(`unknown — unexpected rejection: ${outcome.reason}`);
    continue;
  }
  const { skill, error } = outcome.value;
  if (error) {
    results.failed.push(`${skill.name} — ${error}`);
    console.error(`  ❌ ${skill.name}: ${error}`);
  } else {
    results.fetched.push(skill.name);
  }
}

// ─── Summary ─────────────────────────────────────────────────────────────────

console.log("\n--- fetch-skills summary ---");
if (results.fetched.length)
  console.log(`✅ Fetched: ${results.fetched.join(", ")}`);
if (results.skipped.length)
  console.log(`⏭  Skipped: ${results.skipped.join(", ")}`);
if (results.failed.length)
  console.log(`❌ Failed:  ${results.failed.join(", ")}`);

if (results.failed.length > 0) {
  console.log("\nRun sync after fixing errors: node sync-ai-config.mjs");
  process.exit(1);
} else {
  console.log("\nRun sync to propagate changes: node scripts/sync-ai-config.mjs");
}