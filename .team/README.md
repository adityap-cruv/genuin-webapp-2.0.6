---
priority: high
enforceRouting: true
startupChecks:
  - readAiContext
  - applyRouting
---

# .team — AI Configuration System

A single source of truth for all AI tooling in this repository.
Write your rules, agents, and skills once in `.team/` — the sync script
distributes them to **GitHub Copilot** (`.github/`) and **Claude Code** (`.claude/`)
automatically.

---

## Table of Contents

- [How It Works](#how-it-works)
- [Folder Structure](#folder-structure)
- [Quick Start](#quick-start)
- [Auto-Sync Setup](#auto-sync-setup)
- [Scripts Reference](#scripts-reference)
- [What Lives Where](#what-lives-where)
  - [Instructions](#1-instructions)
  - [Agents](#2-agents)
  - [Skills](#3-skills)
  - [Guardrails](#4-guardrails)
  - [Hooks](#5-hooks)
  - [AI Context](#6-ai-context)
- [Agent Reference](#agent-reference)
- [Skill Reference](#skill-reference)
- [Adding a New Agent](#adding-a-new-agent)
- [Adding a New Skill](#adding-a-new-skill)
- [Rules & Guardrails](#rules--guardrails)
- [Important: Never Edit Generated Files](#important-never-edit-generated-files)

---

## How It Works

```
.team/          ← ✏️ Edit everything here
    │
    ├── sync-ai-config.mjs
    │       │
    │       ▼
    ├──▶  .github/       ← GitHub Copilot reads this
    └──▶  .claude/       ← Claude Code reads this
```

You only ever touch files inside `.team/`. The sync script reads them and writes the
correct format into `.github/` and `.claude/`. Both AI tools stay in sync with zero
duplication.

**`.github/` and `.claude/` are fully generated — never edit them directly.**

---

## Folder Structure

```
root folder
├──Scripts/
    ├── sync-ai-config.mjs          ← Sync script: .team/ → .github/ + .claude/
    ├── fetch-skills.mjs            ← Fetches remote skills from GitHub

├──.team/
    ├── README.md                   ← You are here
    ├── instructions.md             ← Base rules shared by all AI tools
    ├── agents.config.json          ← Agent tool restrictions and descriptions
    ├── skills.registry.json        ← Registry of all skills (local + remote)
    │
    ├── copilot/
    │   └── instructions.md         ← Copilot-only delta (routing 8–10)
    │
    ├── claude/
    │   └── instructions.md         ← Claude-only delta (sub-agents, skill loading)
    │
    ├── agents/
    │   ├── planner.md              ← Plans features, read-only
    │   ├── implementer.md          ← Writes types + code + tests
    │   ├── reviewer.md             ← Reviews code against conventions
    │   ├── debugger.md             ← Root cause analysis, minimal fixes
    │   ├── security-auditor.md     ← Security audit, read-only
    │   ├── e2e-tester.md           ← Playwright E2E tests (Page Object Model)
    │   └── prd-writer.md           ← Product Requirements Documents
    │
    ├── skills/
    │   ├── skills.registry.json    ← Tracks local and remote skills
    │   ├── accessibility.md        ← WCAG 2.1 AA audit checklist
    │   ├── refactor.md             ← Safe refactoring methodology
    │   ├── performance.md          ← Performance audit patterns
    │   ├── security-audit.md       ← Security audit checklist
    │   ├── e2e-testing.md          ← Playwright E2E conventions
    │   ├── prd-writer.md           ← PRD writing conventions
    │   ├── test-runner.md          ← Vitest unit test conventions
    │   └── debug/
    │       └── SKILL.md            ← Debugging methodology and patterns
    │
    ├── hooks/
    │   ├── guardrails.json         ← AI behaviour rules (never/always/requireApproval)
    │   └── format.json             ← Reserved (not currently synced)
    │
    └── docs/
        └── ai-context.md           ← Project state (read by Claude at session start)
```

---

## Quick Start

**1. Copy `.team/` into the root of your project:**

```
your-project/
├── .team/          ← drop this folder here
├── src/
├── package.json
└── ...
```

**2. Add the scripts to your `package.json`:**

```json
{
  "scripts": {
    "ai:sync": "node scripts/sync-ai-config.mjs",
    "ai:fetch": "node scripts/fetch-skills.mjs"
  }
}
```

**3. Run the first sync:**

```bash
pnpm ai:sync
```

This generates `.github/` and `.claude/` from everything in `.team/`. It will also
auto-create `docs/ai-context.md` from the template if it doesn't exist yet.

**4. Fill in your project context:**

Open `docs/ai-context.md` (created in the previous step) and fill in your project
details — what it does, current focus, active decisions. Claude reads this at the
start of every session.

---

## Auto-Sync Setup

There is one automatic sync layer:

### Pre-commit Hook (on every git commit)

The sync runs automatically before every commit. Set this up with your preferred hook manager:

**Husky:**

```bash
npx husky init
echo "node scripts/sync-ai-config.mjs" >> .husky/pre-commit
```

**Lefthook (`lefthook.yml`):**

```yaml
pre-commit:
  commands:
    ai-sync:
      run: node scripts/sync-ai-config.mjs
    lint-staged:
      run: pnpm lint-staged
```

**Simple `package.json` + `simple-git-hooks`:**

```json
{
  "simple-git-hooks": {
    "pre-commit": "node scripts/sync-ai-config.mjs && pnpm lint-staged"
  }
}
```

### Layer 3 — CI (optional, as a safety net)

Add to your CI pipeline to catch any out-of-sync generated files:

```yaml
- name: Verify AI config is in sync
  run: |
    node scripts/sync-ai-config.mjs
    git diff --exit-code .github/ .claude/
```

This fails the build if someone edited `.github/` or `.claude/` directly.

---

## Scripts Reference

| Script     | Command                           | What it does                                             |
| ---------- | --------------------------------- | -------------------------------------------------------- |
| `ai:sync`  | `node scripts/sync-ai-config.mjs` | One-shot sync of all `.team/` → `.github/` + `.claude/`  |
| `ai:fetch` | `node scripts/fetch-skills.mjs`   | Downloads remote skills listed in `skills.registry.json` |

---

## What Lives Where

### 1. Instructions

**File:** `.team/instructions.md`

The base ruleset that applies to **all** AI tools. Covers language choices, code style,
architecture patterns, error handling, testing, security, and accessibility. Think of
it as your team's engineering constitution.

**Tool-specific deltas:**

| File                            | Purpose                                                                           |
| ------------------------------- | --------------------------------------------------------------------------------- |
| `.team/copilot/instructions.md` | Copilot-specific routing rules (how to behave as each agent in chat)              |
| `.team/claude/instructions.md`  | Claude-specific rules (sub-agent activation, skill file loading, session startup) |

The sync script joins base + delta for each tool:

```
instructions.md + copilot/instructions.md → .github/copilot-instructions.md
instructions.md + claude/instructions.md  → .claude/CLAUDE.md
```

Do not repeat base rules in the delta files — only write what is different.

---

### 2. Agents

**Folder:** `.team/agents/`

Each `.md` file defines a specialist AI agent with a focused role. Agents are how you
get consistent, expert-level output for specific tasks instead of one-size-fits-all responses.

The sync script writes agents into both tools:

```
.team/agents/planner.md → .github/agents/planner.agent.md   (with frontmatter + tools list)
                        → .claude/agents/planner.md
```

See [Agent Reference](#agent-reference) for the full list.

---

### 3. Skills

**Folder:** `.team/skills/`

Skills are detailed instruction sets for specific domains — deeper and more specific
than general instructions. An agent loads a skill before tackling a domain-specific
task (e.g., the debugger loads `debug/SKILL.md`, the e2e-tester loads `e2e-testing/SKILL.md`).

Skills can be a flat `.md` file or a folder with a `SKILL.md` inside — both work:

```
skills/refactor.md              ← flat file skill
skills/debug/SKILL.md           ← folder skill
```

The registry (`skills.registry.json`) tracks all skills and their sources. Local skills
are managed by your team; remote skills can be fetched from GitHub URLs (see [Skill Reference](#skill-reference)).

---

### 4. Guardrails

**File:** `.team/hooks/guardrails.json`

Safety constraints and governance rules for all AI agents. Defines what the AI must
never do, must always do, and what requires human approval.

The sync script includes guardrails in both synced outputs:

```
.team/hooks/guardrails.json → .github/guardrails.json
                            → .claude/guardrails.json
```

All agents have access to the same guardrails, ensuring consistent behavior across tools.

See [Rules & Guardrails](#rules--guardrails) for key highlights.

---

### 5. Hooks

**Folder:** `.team/hooks/`

Currently contains:

- **`guardrails.json`** — AI behaviour rules (synced to both .github/ and .claude/)
- **`format.json`** — Reserved for pre-commit/pre-push commands (not currently synced)

Hooks are synced to `.github/hooks/` for GitHub Copilot integration.

---

### 6. AI Context

**File:** `.team/docs/ai-context.md`

Project state and context that Claude reads at session startup. This file is **not synced**
to `.claude/` — instead, Claude reads it directly from `.team/docs/` each session.

This ensures:

- The AI always has the latest project context
- Context changes take effect immediately without re-syncing
- No stale local copies in generated directories

Fill this file with project state, architecture notes, and any current restrictions or areas
that need caution. The template is provided for reference.

---

## Agent Reference

| Agent              | Role                                                                           | File edits?  | Key tools                                          |
| ------------------ | ------------------------------------------------------------------------------ | ------------ | -------------------------------------------------- |
| `planner`          | Explores codebase, produces structured implementation plans                    | ❌ Read-only | `codebase`, `fetch`, `search`, `githubRepo`        |
| `implementer`      | Writes types, implementation code, and tests                                   | ✅ Yes       | `codebase`, `editFiles`, `findTestFiles`           |
| `reviewer`         | Reviews code for correctness, types, errors, tests, security                   | ❌ Read-only | `codebase`, `findTestFiles`, `problems`            |
| `debugger`         | Root cause analysis, applies minimal targeted fix                              | ✅ Yes       | `codebase`, `editFiles`, `runCommands`, `problems` |
| `security-auditor` | Audits for vulnerabilities — never suggests auth/CORS changes without approval | ❌ Read-only | `codebase`, `fetch`                                |
| `e2e-tester`       | Writes and fixes Playwright E2E tests using Page Object Model                  | ✅ Yes       | `codebase`, `editFiles`, `runCommands`             |
| `prd-writer`       | Writes and reviews Product Requirements Documents                              | ✅ Yes       | `codebase`, `fetch`, `search`                      |

**Routing** — agents are activated automatically based on keywords in your prompt:

| Keywords in your prompt                              | Agent activated    |
| ---------------------------------------------------- | ------------------ |
| `plan`, `design`, `architecture`, `how should I`     | `planner`          |
| `implement`, `build`, `create`, `add feature`        | `implementer`      |
| `review`, `check this`, `give me feedback`           | `reviewer`         |
| `debug`, `fix`, `broken`, `error`, `not working`     | `debugger`         |
| `security`, `audit`, `vulnerability`, `is this safe` | `security-auditor` |
| `e2e`, `playwright`, `user flow`, `write a test`     | `e2e-tester`       |
| `prd`, `product requirements`, `feature spec`        | `prd-writer`       |

---

## Skill Reference

| Skill            | File                       | When it's loaded                          |
| ---------------- | -------------------------- | ----------------------------------------- |
| `debug`          | `skills/debug/SKILL.md`    | Debug requests, `debugger` agent          |
| `e2e-testing`    | `skills/e2e-testing.md`    | Playwright / E2E test requests            |
| `accessibility`  | `skills/accessibility.md`  | A11y / WCAG requests                      |
| `performance`    | `skills/performance.md`    | Performance audit / optimisation requests |
| `security-audit` | `skills/security-audit.md` | Security audit requests                   |
| `refactor`       | `skills/refactor.md`       | Refactor / clean up requests              |
| `prd-writer`     | `skills/prd-writer.md`     | PRD writing requests                      |
| `test-runner`    | `skills/test-runner.md`    | Vitest unit test requests                 |

---

## Adding a New Agent

A new agent extends AI capabilities for a specific domain. Follow these steps carefully:

### Step 1: Define the Agent's Responsibilities

Before creating files, write down:

- **What problem does it solve?** (e.g., "Audit code for memory leaks")
- **What's its workflow?** (e.g., "Profile → Identify → Fix → Verify")
- **What tools does it need?** (GitHub Copilot only; Claude Code has full access regardless)
- **What does it output?** (e.g., "A report + fixed code" or "Read-only analysis")
- **What is it NOT responsible for?** (e.g., "Not for general debugging")

### Step 2: Create the Agent File

Create `.team/agents/your-agent.md`:

```markdown
# Your Agent Name

**Purpose:** One sentence.

**Methodology:**

1. Step 1 — Do this
2. Step 2 — Do that
3. Step 3 — Verify it works

**Responsibilities:**

- ✅ Handles: feature A, feature B
- ❌ Does not handle: feature C (delegated to X agent)

**Output:**

- Modifies files: Yes / No
- Returns: (describe what the agent returns)

**Key patterns:**

- Pattern 1: When X, do Y
- Pattern 2: When Z, do W

**Example:**
User says: "my code is slow"
Agent does: (step-by-step description)
```

### Step 3: Register in `.team/agents.config.json`

Add a new entry with the agent's accessible tools:

```json
{
  "your-agent": {
    "tools": ["codebase", "editFiles", "runCommands"],
    "description": "Exactly what this agent does in one sentence"
  }
}
```

#### Available Tools

⚠️ **GitHub Copilot only:** These tool restrictions are enforced by GitHub Copilot to control which VS Code features each agent can access. **Claude Code does not enforce these restrictions** — it reads your codebase directly and has full access.

| Tool            | What it can do                                      |
| --------------- | --------------------------------------------------- |
| `codebase`      | Search and read code files                          |
| `editFiles`     | Modify files (write code, fix bugs)                 |
| `runCommands`   | Execute terminal commands (tests, builds)           |
| `findTestFiles` | Locate test files related to source files           |
| `fetch`         | Make web requests (documentation, APIs)             |
| `usages`        | Find all references and usages of a symbol          |
| `problems`      | Access TypeScript/lint errors from the LSP          |
| `githubRepo`    | Search public GitHub repositories for code examples |
| `search`        | General text search across workspace                |

**For GitHub Copilot agents:** Choose the minimum tools needed — more tools = more capability but also more risk.

### Step 4: Add Routing Keywords

Update `.team/instructions.md` in the **Agent Routing** section. Add a new numbered rule:

```markdown
**8. Your Domain** — if the prompt contains any of:
`keyword1`, `keyword2`, `keyword3`, `keyword4`
→ **Activate the `your-agent` agent.** Brief description of what it does.
```

Place it **in order** — the first matching rule wins. If your agent handles more specific cases than an existing one, put it first.

### Step 5: Set Up Tool-Specific Routing (if needed)

**For Copilot only:** Add routing to `.team/copilot/instructions.md` if different behavior needed.

**For Claude only:** Add routing to `.team/claude/instructions.md` if different behavior needed.

Example (Claude-specific):

```markdown
**8. Your Domain requests** — if the prompt contains any of:
`keyword1`, `keyword2`
→ Load `.team/skills/your-domain/SKILL.md` before responding.
```

### Step 6: Sync and Test

```bash
pnpm ai:sync
```

Then test by asking the AI a prompt with your keywords. It should activate your new agent.

---

---

## Adding a New Skill

Skills are domain-specific instruction sets that agents load before tackling expert-level tasks.
A skill contains project conventions, checklists, best practices, and examples for a specific domain.

### When to Create a New Skill

Create a skill when:

- ✅ A domain needs **project-specific conventions** (e.g., "our accessibility audits check X, Y, Z")
- ✅ Multiple agents need **the same domain knowledge** (e.g., both debugger and implementer need performance patterns)
- ✅ The instructions are **longer than a paragraph** (e.g., detailed checklists, workflows)

**Don't create a skill when:**

- ❌ It's a one-off instruction for a single agent (put it in the agent definition instead)
- ❌ It duplicates base instructions (put it in `.team/instructions.md` instead)
- ❌ It's deployment or infrastructure knowledge (belongs in `docs/ai-context.md`)

### Step 1: Outline the Skill

Document:

- **Purpose** — what domain does it cover? (e.g., "Playwright E2E testing patterns")
- **When triggered** — what keywords/requests load it? (e.g., `playwright`, `e2e`, `integration test`)
- **Key principles** — 3-5 core ideas (e.g., "Use Page Object Model, avoid hard waits")
- **Project-specific patterns** — your conventions (e.g., "All POM classes go in `e2e/pages/`)
- **Common mistakes** — what to avoid (anti-patterns specific to your project)
- **Checklists** — step-by-step procedures
- **Examples** — real scenarios with code

### Step 2: Create the Skill File

**Option A — Simple skill (single file):**

```bash
touch .team/skills/your-skill.md
```

File structure:

```markdown
# Your Skill Name

## Overview

What this skill covers in 2-3 sentences.

## When to Use This Skill

Load this skill when: [describe the trigger conditions]

## Core Principles

1. **Principle 1** — Explanation
2. **Principle 2** — Explanation
3. **Principle 3** — Explanation

## Project-Specific Patterns

### Pattern 1: File Organization

[Your file structure]

### Pattern 2: Naming Conventions

[Your naming rules]

### Pattern 3: Code Architecture

[Your architectural approach]

## Checklist

- [ ] Check 1
- [ ] Check 2
- [ ] Check 3

## Common Mistakes

- ❌ **Mistake 1** — Why it's bad, correct approach
- ❌ **Mistake 2** — Why it's bad, correct approach

## Examples

### Example 1: [Scenario]
```

[Code example]

```

### Example 2: [Scenario]
```

[Code example]

```

## Resources
- [Link 1]
- [Link 2]
```

**Option B — Complex skill (with supporting files):**

```bash
mkdir -p .team/skills/your-skill
touch .team/skills/your-skill/SKILL.md
touch .team/skills/your-skill/checklist.md  (optional)
touch .team/skills/your-skill/examples.md   (optional)
```

The main file must be named `SKILL.md`. Any supporting files are part of the same skill.

### Step 3: Register in `.team/skills.registry.json` (for remote skills)

⚠️ **Important:** The registry serves two purposes:

- **Local skills** — The sync script reads `.team/skills/` directly. Registration is optional.
- **Remote skills** — You must register these here and run `pnpm ai:fetch` to download them.

**For local skills (optional):**

Add to the `skills` array in `.team/skills.registry.json`:

```json
{
  "name": "your-skill",
  "description": "What this skill teaches (2-3 words)",
  "source": "local",
  "path": ".team/skills/your-skill.md"
}
```

Or if using a folder (Option B):

```json
{
  "name": "your-skill",
  "description": "What this skill teaches",
  "source": "local",
  "path": ".team/skills/your-skill/SKILL.md"
}
```

**For remote skills (GitHub-hosted):**

Add to the `skills` array:

```json
{
  "name": "your-skill",
  "description": "What this skill teaches",
  "source": "remote",
  "url": "https://raw.githubusercontent.com/owner/repo/main/path/to/SKILL.md"
}
```

Then download it:

```bash
pnpm ai:fetch
```

**Complete registry structure example:**

```json
{
  "version": 1,
  "description": "Registry of all skills (local and remote)",
  "skills": [
    {
      "name": "your-skill",
      "description": "Brief description",
      "source": "local",
      "path": ".team/skills/your-skill.md"
    }
  ]
}
```

### Step 4: Add Keyword Routing

Choose the routing approach that fits your needs:

**Option A — All agents (in `.team/instructions.md`):**

Add a numbered routing rule:

```markdown
**Load `.team/skills/your-skill.md`** when the prompt contains:
`keyword1`, `keyword2`, `keyword3`

When triggered, all AI tools load this skill before responding.
```

**Option B — Claude-specific (in `.team/claude/instructions.md`):**

Add to the Skill loading table:

```markdown
| Task type | Skill to load |
| Your task type | `.team/skills/your-skill.md` |
```

**Option C — Copilot-specific (in `.team/copilot/instructions.md`):**

Add routing rules specific to Copilot's chat interface.

**Option D — Agent-specific (in the agent `.md` file):**

Document that the agent loads the skill (e.g., "This agent loads `.team/skills/debug/SKILL.md`"), but routing still happens in the instructions files.

### Step 5: Sync

```bash
pnpm ai:sync
```

Your skill is now available to all agents.

### Step 6: Test

Test by triggering the skill with its keywords. The AI should reference your checklist, patterns, or examples.

---

### Skill Writing Tips

1. **Be specific to your project** — Avoid generic advice. Focus on YOUR conventions, YOUR tools, YOUR architecture.
2. **Use checklists** — AI agents love structured checklists. Make them concrete and actionable.
3. **Show, don't tell** — Include real code examples from your project. Use your actual file structure, naming patterns, and error messages.
4. **Keep it updated** — As your project evolves, update the skill. Stale skills are worse than no skill.
5. **Link to source** — If your project has detailed docs, link to them. Example: "For more details, see `docs/testing-guide.md`"

### Common Questions About Skills

**Q: Will my skill be automatically loaded?**

A: Only if you add routing keywords. Create the skill file, then add keywords to `.team/instructions.md` or tool-specific files. Without routing, the AI can access the skill but won't load it automatically.

**Q: Do I need to register local skills in the registry?**

A: No. Local skills are synced directly from `.team/skills/`. Registration is only required for remote skills you want to fetch from GitHub.

**Q: Can I have both a flat file and folder with the same name?**

A: No. Choose either `.team/skills/your-skill.md` (flat) OR `.team/skills/your-skill/SKILL.md` (folder), not both.

---

---

## Rules & Guardrails

The full guardrail rules live in `.team/hooks/guardrails.json`. Key highlights:

**The AI must never:**

- Add `console.log` to committed code
- Use hardcoded secrets, tokens, or environment-specific URLs
- Use `@ts-ignore` without an explanatory comment
- Use the `any` type without a justified comment
- Create barrel files (`index.ts` re-exporting everything)
- Cross-import between apps in `apps/`
- Use CommonJS `require()` — ESM only
- Use `page.waitForTimeout()` in Playwright tests
- Edit `.github/` or `.claude/` directly — these are generated

**The AI must always:**

- Write TypeScript in strict mode
- Handle errors explicitly — no empty `catch` blocks
- Colocate test files next to source files
- Add JSDoc to all exported functions and types
- Use named exports over default exports
- Return `{ data, error }` at API boundaries instead of throwing
- Validate external data at trust boundaries with Zod or equivalent
- Add `data-testid` attributes to interactive elements that need testing

**The AI must ask for human approval before:**

- Deleting or renaming public API surfaces
- Changing shared packages in `packages/`
- Modifying CI/CD pipeline configuration
- Adding new external dependencies
- Changing authentication or session handling logic
- Changing CORS, CSP, or any security-related HTTP headers

---

## Important: Never Edit Generated Files

`.github/` and `.claude/` are **fully generated** by `sync-ai-config.mjs`.
Any direct edits will be overwritten the next time the sync runs.

```
✅ Edit this:   .team/agents/debugger.md
❌ Never edit:  .claude/agents/debugger.md   ← generated
❌ Never edit:  .github/agents/debugger.agent.md   ← generated
```

If you need to change how something is generated, edit the source in `.team/` and
let the sync handle the rest.
