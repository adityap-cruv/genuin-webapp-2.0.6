# Claude Code Tool Trials — genuin-webapp (branch: chore/tool-trials-2.0.6)

Trial venue: this worktree (branched off `release/genuin-sdk/2.0.6` @ 0085f04cc).
Methodology (established with graphify, reused for the rest):
1. Isolate the trial; keep the global `~/.claude` setup protected (back up settings before any install).
2. Verify data/privacy safety (cloud sync OFF, telemetry OFF, no secrets leave the machine).
3. Test **value empirically**, not by reputation.
4. Check the **prompt-cache / context cost** (large artifacts → `.claudeignore`).
5. Confirm a **clean uninstall** path before committing to anything.
6. Compare against what we already have before adding overlap.

---

## 1. graphify — KEEP (scoped) ✅

Code knowledge-graph (tree-sitter AST, local, 0 token cost). PyPI `graphifyy`, CLI via `uv`.

- **Verified value:** impact/dependency analysis is a clear win over grep — directional (dependent vs dependency), auto-resolves `@genuin/*` + `@cxr/*` aliases, one command. `path` (data-flow) works but is finicky (directed often empty → `--undirected`, noisier).
- **Monorepo:** works out-of-the-box on our pnpm+turbo `@scope/*` layout — reads `pnpm-workspace.yaml` + per-package tsconfig `paths`. Requirement: **index at repo root** (not per-package) so app↔package edges resolve. Verified `apps/webapp → packages/components` edge resolves.
- **Setup applied:** upgraded to 0.9.47; root-indexed (16,869 nodes / 32,251 edges after excluding legacy); `.claudeignore` keeps `graph.json`/`graphify-out/` out of prompt cache; `.graphifyignore` trims dist/.next/.turbo/coverage/*.d.ts and **`apps/legacy-webapp/`** (reference-only).
- **Use:** `graphify explain "<symbol>"`, `graphify path "A" "B"`, `/graphify`; re-index with `graphify update .`.
- **Uninstall:** `graphify uninstall --purge` + `uv tool uninstall graphifyy` + `brew uninstall uv`.
- **Verdict:** keep as on-demand impact-analysis / navigation aid. Not an always-on grep replacement.

---

## 2. claude-mem — TRIALED; likely REDUNDANT for us ⚠️

Automatic cross-session memory. Plugin `claude-mem@thedotmack` v13.15.2. Global by design.

**Functional status (verified):**
- Installs & runs: worker daemon up (PID/port 37703), SQLite DB created, Bun 1.3.14 + uv OK. `doctor` = all required checks pass. (Install hit an upstream tree-sitter peer-dep conflict but recovered via `--legacy-peer-deps`.)
- **Safety:** cloud sync **OFF** (no `CLAUDE_MEM_*` env vars — Begenuin-safe); telemetry was **ON by default**, now **DISABLED**. Git-guardrail hook survived the install.
- **Stores locally:** observations, session summaries, and **full user-prompt text**; dormant `sync_*` cloud tables present.

**Costs / concerns:**
- **Heavy global footprint:** persistent Bun daemon + a port + 5 session hooks (SessionStart/UserPromptSubmit/PostToolUse/Stop/SessionEnd) firing every session, across VS Code + CLI.
- **Spends your Claude subscription quota:** uses the Claude Code OAuth token to LLM-compress every session's memory — a real cost given weekly usage limits.
- **Per-session context injection:** memory is injected at SessionStart (adds tokens every session).
- **Overlaps / replaces native memory:** ships a `--disable-auto-memory` flag; you already use Claude Code's native memory (`MEMORY.md`). Two memory systems doing the same job.

**Value test limitation:** real cross-session value only shows over multiple live sessions; a single automated run can't prove it (0 observations captured — capture is hook-driven at session end).

**Verdict (provisional):** works and is safe, but it's a heavy, quota-consuming global system that **duplicates the native memory you already have**. Unless you specifically want its extras (automatic capture, searchable FTS store, web viewer) that native memory lacks, it's redundant. Recommendation: **lean uninstall** unless you want to live with it for a few days to judge capture quality firsthand.
- **Uninstall:** `npx claude-mem uninstall` then verify `~/.claude-mem` and `~/.claude/plugins/marketplaces/thedotmack` gone + plugin disabled in `~/.claude/settings.json`.

---

## 3. ponytail — TRIALED; good quality, partially redundant for us ⚠️

Injected code-minimalism ruleset ("lazy senior dev": YAGNI, stdlib first, no unrequested abstractions). Plugin `ponytail@ponytail` v4.9.0. Global by design.

**Functional status (verified):**
- Installs cleanly via `claude plugin install ponytail@ponytail`. Git-guardrail survived; no statusLine added (that's Windows-only); settings.json only gained the plugin enable + marketplace entry.
- 6 skills, 3 hooks (SessionStart, **SubagentStart**, UserPromptSubmit). No cloud, no telemetry.
- Default mode **full**. Activates in new sessions.

**Cost (from `claude plugin details`):**
- **~983 tokens always-on, added to every session** (all repos, VS Code + CLI).
- Plus on-invoke skill costs (~2.2k when the main skill fires).
- **Injects into subagents** (SubagentStart) — so every one of your 19 delegated agents also pays the tax; tunable via `PONYTAIL_SUBAGENT_MATCHER`.

**Quality:** genuinely good. The "ladder" (does it need to exist → reuse existing → stdlib → native platform → installed dep → one line → minimum), "bug fix = root cause, grep every caller", and mature guards ("lazy means efficient not careless", "smallest change in the wrong place isn't lazy, it's a second bug") — not naive minimalism.

**Fit concerns for us:**
- **Redundant with existing conventions:** the genuin-webapp `.claude/CLAUDE.md` already has a "token economy / inline-first / right-size / don't over-engineer" section. ponytail re-states much of it — but globally, for every repo, at a per-session token cost.
- **Tension with design-oriented subagents:** a blanket "no abstractions / laziest solution" injected into `architect`/`planner` (whose job is deliberate design) can pull against their intent. Scope with `PONYTAIL_SUBAGENT_MATCHER` if kept.

**Verdict:** the best-fitting of the two global tools and genuinely well-crafted — but it duplicates guidance you already encode in CLAUDE.md and taxes every session + subagent. If you want a consistent minimalism nudge across *all* repos (not just genuin-webapp), keep it — ideally `lite` mode + a subagent matcher. Otherwise it's redundant.
- **Modes:** `/ponytail lite|full|ultra`, or "stop ponytail".
- **Uninstall:** `node ~/.claude/plugins/marketplaces/ponytail/scripts/uninstall.js` (clears config/statusline), then `claude plugin uninstall ponytail@ponytail` + `claude plugin marketplace remove ponytail`.

---

## Bottom line

| Tool | Verdict | State now |
|------|---------|-----------|
| **graphify** | **Keep** — real impact-analysis value, monorepo-correct, prompt-cache-safe | Installed, scoped to this worktree, committed |
| **claude-mem** | **Lean uninstall** — heavy, spends subscription quota, duplicates native memory | Installed + running globally (cloud OFF, telemetry OFF); try live or remove |
| **ponytail** | **Optional** — high quality but redundant with existing CLAUDE.md conventions; taxes every session + subagent | Installed + enabled globally (full mode); try live or remove |

Both claude-mem and ponytail are **global** (affect all VS Code + CLI sessions) and left enabled for a live trial. Disable/uninstall commands are in each section above.
