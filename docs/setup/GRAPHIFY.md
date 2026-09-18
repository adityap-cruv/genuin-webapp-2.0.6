# Graphify — Code Knowledge Graph

[Graphify](https://github.com/Graphify-Labs/graphify) builds a local, tree-sitter
AST knowledge graph of this monorepo so AI coding tools (and you) can answer
dependency and impact questions ("what depends on X", "who imports `@genuin/…`")
precisely instead of grepping. Code is parsed with tree-sitter AST — imports plus
_approximate_ call/extends edges, not a type-resolved compiler — and Graphify's LLM
semantic layer enriches docs, **not** code. Treat call/data-flow answers as
AST-approximate, not exhaustive.

It is **local and free**: code parsing never leaves your machine, there is no LLM
call for code (0 token cost), and there is no telemetry. See
[`TOOL_TRIALS.md`](../../TOOL_TRIALS.md) for the evaluation that led to adopting it.

---

## Prerequisites (one-time, per machine)

Graphify is a Python CLI managed by [`uv`](https://docs.astral.sh/uv/). It is **not**
an npm dependency and is intentionally not in `package.json` — each developer installs
the CLI once, globally.

```bash
# 1. install uv (Python tool manager)
brew install uv                 # macOS; see https://docs.astral.sh/uv for other OSes

# 2. install the graphify CLI (package name is `graphifyy`, double-y)
uv tool install graphifyy       # puts `graphify` on your PATH (~/.local/bin)

graphify --version              # sanity check (>= 0.9.47)
```

Ensure `~/.local/bin` is on your `PATH` (uv prints a hint if it isn't).

---

## How it's wired in this repo

The project-scoped install is committed, so once you have the CLI it works with no
extra setup:

- **`.claude/skills/graphify/`** — the `/graphify` skill + reference docs.
- **`.claude/settings.json`** — `PreToolUse` hooks (`graphify hook-guard …`) that
  consult the graph before searches/reads. They only **read** the graph; they do
  **not** rebuild it (see "Keeping it fresh"). The command is `graphify` (resolved
  from `PATH`) — **you must have the CLI installed or these hooks no-op/fail**, which
  is why the prerequisites above are required.
- **`.husky/post-commit`, `.husky/post-checkout`, `.husky/post-merge`** +
  **`scripts/graphify-hook.sh`** — committed git hooks (sharing one helper script)
  that **auto-rebuild the graph** after every commit, branch checkout, and `git pull`.
  Activated automatically by `pnpm install` (Husky's `prepare` script) — no
  `graphify hook install` needed. Each is **graceful**: if the `graphify` CLI isn't on
  `PATH` it never blocks or errors — instead, on pull/checkout it prints a **one-time-
  per-day hint** (see `scripts/graphify-hook.sh`) telling the developer how to enable
  it, and stays silent on their own commits. When the CLI is present, the rebuild runs
  detached (AST-only, no LLM), logging to `~/.cache/graphify-rebuild.log`.
- **`.claudeignore`** — keeps the large `graph.json` / `graphify-out/` out of Claude
  Code's context and prompt cache.
- **`.graphifyignore`** — trims `dist/`, `.next/`, `.turbo/`, `coverage/`, `*.d.ts`,
  stories, `apps/legacy-webapp/` (reference-only), `package.json`/lockfiles (else the
  graph fills with npm-dependency-name nodes), and `**/*.md` (else markdown headings
  hijack natural-language queries) — so the graph stays code-focused.
- **`graphify-out/`** — generated graph output; git-ignored, never committed.

## Building the graph

Index the **whole repo from the root** (this is required for cross-package
`@genuin/*` / `@cxr/*` edges to resolve — a per-package build misses app↔package
links):

```bash
graphify update .        # AST-only, ~30s, 0 token cost; re-run after code changes
```

Output lands in `graphify-out/` (git-ignored). The graph is ~12k code nodes / ~27k
edges (varies by branch; markdown and dependency lists are excluded).

## Using it

```bash
graphify explain "<symbol>"        # a node + its dependents (<--) and dependencies (-->)
graphify path "<A>" "<B>"          # shortest relationship path (add --undirected if empty)
```

Or type `/graphify` inside Claude Code. Because the graph exceeds the 5000-node
HTML-viz threshold, prefer querying the JSON over opening `graph.html`:

```bash
graphify cluster-only . --no-viz   # regenerate report/clusters without the heavy HTML
```

### Monorepo notes

- Graphify reads `pnpm-workspace.yaml` + per-package `tsconfig.json` `paths`, so
  `@genuin/ui`, `@genuin/components/*`, `@cxr/*`, `@/*` all resolve to real files.
- Aliases defined **only** in `vite.config`/`vitest.config` (with no tsconfig or
  workspace-name equivalent) will not resolve — mirror them into a `tsconfig` `paths`
  if any are added.
- `apps/legacy-webapp` is excluded on purpose (reference-only).

## Keeping it fresh

**This is automatic — you don't need to do anything.** The committed
`.husky/post-commit`, `.husky/post-checkout`, and `.husky/post-merge` hooks rebuild
the graph after every commit, branch checkout, and `git pull`. They activate on
`pnpm install` (Husky's `prepare` script), so the only per-developer requirement is
having the `graphify` CLI installed (see Prerequisites). If you don't have the CLI,
the hooks silently do nothing.

The rebuild is AST-only (no LLM/API cost), incremental (only changed files
re-extract), and runs detached so it never slows down `git`. Its output is logged to
`~/.cache/graphify-rebuild.log`.

If you ever need to rebuild by hand (e.g. a query looks stale):

```bash
graphify update .          # one-off rebuild
graphify watch .           # or a live foreground watcher for a work session
```

The graph is tied to a commit; if queries look stale, rebuild.

## Uninstall (if you opt out locally)

```bash
graphify uninstall --purge     # removes graphify-out/ and the local skill install
uv tool uninstall graphifyy    # removes the CLI
```

Note: this touches your working tree's committed `.claude/` files — don't commit that
removal unless the team is dropping graphify.
