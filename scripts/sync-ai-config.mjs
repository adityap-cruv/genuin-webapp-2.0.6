#!/usr/bin/env node
// in root sync-ai-config.mjs
// Syncs .team/ → .github/ (Copilot) and .claude/ (Claude Code)
// Usage: node sync-ai-config.mjs [--dry-run]
// Add to package.json: "ai:sync": "node sync-ai-config.mjs"

import {
  readFileSync,
  writeFileSync,
  mkdirSync,
  readdirSync,
  existsSync,
} from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

// ─── Dry-run flag ────────────────────────────────────────────────────
// Pass --dry-run to preview what would be written without touching any files.
// Useful in CI to verify outputs are up to date: if any file would change, exit 1.

const DRY_RUN = process.argv.includes("--dry-run");
if (DRY_RUN) {
  console.log("🔍 Dry-run mode — no files will be written.\n");
}

let dryRunChanges = 0;

// Read project name from package.json if available, fallback to directory name
let projectName;
try {
  const pkgContent = readFileSync(join(root, "package.json"), "utf-8");
  let pkg;
  try {
    pkg = JSON.parse(pkgContent);
  } catch (parseErr) {
    console.error("❌ Error: package.json contains invalid JSON");
    console.error(`   File: ${join(root, "package.json")}`);
    console.error(`   Details: ${parseErr.message}`);
    process.exit(1);
  }
  projectName = pkg.name ?? dirname(root).split("/").pop();
} catch (readErr) {
  console.error("❌ Error: Could not read package.json");
  console.error(`   File: ${join(root, "package.json")}`);
  console.error(`   Details: ${readErr.message}`);
  process.exit(1);
}

const teamDir = join(root, ".team");
const githubDir = join(root, ".github");
const claudeDir = join(root, ".claude");

// ─── Helpers ────────────────────────────────────────────────────────────────

function ensureDir(dir) {
  if (DRY_RUN) return;
  try {
    mkdirSync(dir, { recursive: true });
  } catch (err) {
    if (err.code !== "EEXIST") {
      throw err;
    }
  }
}

function read(file) {
  try {
    return readFileSync(file, "utf-8");
  } catch (err) {
    console.error(`❌ Error: Could not read file ${file}`);
    console.error(`   Details: ${err.message}`);
    process.exit(1);
  }
}

// ─── Skip writing if file content is unchanged ───────────────────────
// Previously, every sync unconditionally overwrote all output files even when
// nothing changed. This caused the watcher to see its own writes and re-trigger
// a sync loop, and produced noisy git diffs.
// Now: read the existing file and skip the write if content is identical.

function write(filePath, content) {
  if (DRY_RUN) {
    const existing = existsSync(filePath)
      ? readFileSync(filePath, "utf-8")
      : null;
    if (existing === content) {
      console.log(`  ✔  (unchanged) ${filePath}`);
    } else {
      console.log(`  ✏  (would write) ${filePath}`);
      dryRunChanges++;
    }
    return;
  }

  // Skip write if content is identical — prevents watcher feedback loops
  // and unnecessary git diffs.
  if (existsSync(filePath)) {
    try {
      const existing = readFileSync(filePath, "utf-8");
      if (existing === content) return;
    } catch {
      // If we can't read the existing file, fall through and overwrite it.
    }
  }

  try {
    ensureDir(dirname(filePath));
  } catch (err) {
    console.error(`❌ Error: Could not create directory for ${filePath}`);
    console.error(`   Details: ${err.message}`);
    process.exit(1);
  }
  try {
    writeFileSync(filePath, content);
  } catch (err) {
    console.error(`❌ Error: Could not write file ${filePath}`);
    console.error(`   Details: ${err.message}`);
    process.exit(1);
  }
}

function safeRead(filePath) {
  return existsSync(filePath) ? read(filePath).trim() : "";
}

function readDir(dir) {
  return existsSync(dir)
    ? readdirSync(dir).filter((f) => !f.startsWith("."))
    : [];
}

// ─── Load agent tools & descriptions from agents.config.json ─────────
// Previously, AGENT_TOOLS and AGENT_DESCRIPTIONS were hardcoded in this script,
// meaning adding a new agent required editing the sync script itself.
// Now they live in .team/agents.config.json — drop a new .md in .team/agents/
// and add its entry to the config file. No need to touch this script.
//
// Falls back to safe defaults if the config file is missing or an agent has
// no entry, so existing setups continue to work.

const DEFAULT_AGENT_TOOLS = '["codebase", "editFiles"]';
const DEFAULT_AGENT_DESCRIPTION = (name) => `${name} agent`;

let agentConfig = {};

const agentConfigPath = join(teamDir, "agents.config.json");
if (existsSync(agentConfigPath)) {
  try {
    agentConfig = JSON.parse(readFileSync(agentConfigPath, "utf-8"));
  } catch (err) {
    console.warn("⚠️  Could not parse agents.config.json — using defaults.");
    console.warn(`   Details: ${err.message}`);
  }
} else {
  console.warn(
    "⚠️  .team/agents.config.json not found — using built-in defaults for agent tools/descriptions.",
  );
  console.warn(
    "   Create it to manage agent config outside this script. See README for format.",
  );
}

function getAgentTools(name) {
  return agentConfig[name]?.tools
    ? JSON.stringify(agentConfig[name].tools)
    : DEFAULT_AGENT_TOOLS;
}

function getAgentDescription(name) {
  return agentConfig[name]?.description ?? DEFAULT_AGENT_DESCRIPTION(name);
}

// ─── 1. Instructions ─────────────────────────────────────────────────────────
// The tool-specific files (.team/copilot/instructions.md, .team/claude/instructions.md)
// contain ONLY the delta for that tool — not a repeat of the base rules.
// The sync script joins them: base + delta = final output.

const basePath = join(teamDir, "instructions.md");
const copilotPath = join(teamDir, "copilot", "instructions.md");
const claudePath = join(teamDir, "claude", "instructions.md");

const base = safeRead(basePath);
const copilotDelta = safeRead(copilotPath);
const claudeDelta = safeRead(claudePath);

// Copilot → .github/copilot-instructions.md
const copilotParts = [base, copilotDelta].filter(Boolean);
write(
  join(githubDir, "copilot-instructions.md"),
  copilotParts.join("\n\n---\n\n"),
);

// Claude → .claude/CLAUDE.md
const claudeParts = [base, claudeDelta].filter(Boolean);
write(join(claudeDir, "CLAUDE.md"), claudeParts.join("\n\n---\n\n"));

console.log("✅ Instructions synced");

// ─── 2. Agents ───────────────────────────────────────────────────────────────

const agentsDir = join(teamDir, "agents");

for (const file of readDir(agentsDir)) {
  if (!file.endsWith(".md")) continue;
  const name = file.replace(".md", "");
  const content = read(join(agentsDir, file)).trim();
  const tools = getAgentTools(name);
  const description = getAgentDescription(name);

  // Copilot: .github/agents/<n>.agent.md  (requires frontmatter with tools)
  write(
    join(githubDir, "agents", `${name}.agent.md`),
    `---\nname: ${name}\ndescription: ${description}\ntools: ${tools}\n---\n\n${content}\n`,
  );

  // Claude: .claude/agents/<n>.md
  write(join(claudeDir, "agents", `${name}.md`), content);
}

console.log("✅ Agents synced");

// ─── 3. Skills ───────────────────────────────────────────────────────────────
// Skills can be either a flat .md file or a folder containing SKILL.md.
// Both are supported.

const skillsDir = join(teamDir, "skills");

for (const entry of readDir(skillsDir)) {
  const entryPath = join(skillsDir, entry);

  let name, content;

  if (entry.endsWith(".md")) {
    // Flat file: skills/test-runner.md
    name = entry.replace(".md", "");
    content = read(entryPath).trim();
  } else {
    // Folder: skills/test-runner/SKILL.md
    const skillFile = join(entryPath, "SKILL.md");
    if (!existsSync(skillFile)) continue;
    name = entry;
    content = read(skillFile).trim();
  }

  write(join(githubDir, "skills", name, "SKILL.md"), content);
  write(join(claudeDir, "skills", name, "SKILL.md"), content);
}

console.log("✅ Skills synced");

// ─── 4. Guardrails ──────────────────────────────────────────────────────────
// Safety constraints and governance rules for all AI agents.

const guardrailsPath = join(teamDir, "hooks", "guardrails.json");

if (existsSync(guardrailsPath)) {
  const guardrailsContent = read(guardrailsPath).trim();
  write(join(githubDir, "guardrails.json"), guardrailsContent);
  write(join(claudeDir, "guardrails.json"), guardrailsContent);
  console.log("✅ Guardrails synced");
} else {
  console.warn(
    "⚠️  .team/hooks/guardrails.json not found — skipping guardrails sync.",
  );
}

// ─── 5. Hooks (GitHub only) ──────────────────────────────────────────────────

const hooksDir = join(teamDir, "hooks");

for (const file of readDir(hooksDir)) {
  const content = read(join(hooksDir, file)).trim();
  write(join(githubDir, "hooks", file), content);
}

console.log("✅ Hooks synced");

// ─── 6. Claude settings.json ────────────────────────────────────────────────
// .team/claude/settings.json → .claude/settings.json (Claude Code config, hooks, etc.)

const claudeSettingsPath = join(teamDir, "claude", "settings.json");

if (existsSync(claudeSettingsPath)) {
  write(join(claudeDir, "settings.json"), read(claudeSettingsPath).trim());
  console.log("✅ Claude settings.json synced");
} else {
  console.warn("⚠️  .team/claude/settings.json not found — skipping.");
}

// ─── 7. AI Context (Claude only) ─────────────────────────────────────────────
// .team/docs/ai-context.md is read by Claude at session start.
// Warn if missing or empty so the team remembers to keep it updated.

const aiContextPath = join(teamDir, "docs", "ai-context.md");

if (!existsSync(aiContextPath)) {
  console.warn(
    "⚠️  .team/docs/ai-context.md not found — Claude will start sessions without project context.",
  );
} else {
  const aiContextContent = read(aiContextPath).trim();
  if (aiContextContent.length < 100) {
    console.warn(
      "⚠️  .team/docs/ai-context.md looks empty — fill it in so Claude has project context.",
    );
  } else {
    console.log("✅ ai-context.md present");
  }
}

// ─── Done ────────────────────────────────────────────────────────────────────

if (DRY_RUN) {
  console.log(`\n🔍 Dry-run complete. ${dryRunChanges} file(s) would change.`);
  if (dryRunChanges > 0) {
    console.log("   Run without --dry-run to apply changes.");
    process.exit(1); // Exit 1 so CI can detect stale outputs
  } else {
    console.log("   All outputs are up to date. ✔");
  }
} else {
  console.log("\n🎉 AI config synced successfully.");
  console.log(`   ${projectName} → .github/`);
  console.log(`   ${projectName} → .claude/`);
}