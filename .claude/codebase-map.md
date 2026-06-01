# Codebase Map

> **Living, team-shared knowledge of this codebase.** Claude reads this *before* searching broadly
> and appends durable findings *after* learning something non-obvious — see the `codebase-memory`
> skill. Keep entries as concise pointers, not paragraphs. Fix or delete entries that go stale.
> This is for durable codebase knowledge — **not** session logs or task history.

## Orientation (start here)

- **Repo layout, conventions, guardrails** — [.claude/CLAUDE.md](CLAUDE.md).
- **React 19 / Next 15 / Tailwind v4 patterns, env vars, package specifics** — [.claude/docs/ai-context.md](docs/ai-context.md).
- **Atomic design placement** — atoms → `packages/ui`, molecules/organisms → `packages/components`,
  app & pages → `apps/webapp`. Shared packages feed **both** the webapp and the web-sdk, so a change
  there affects both delivery formats.

## Gotchas (findings that cost time)

- **`gencl:` Tailwind utilities silently no-op** until `packages/components` prebuilt CSS
  (`dist/index.css`) is rebuilt. Fix: `pnpm install` from repo root (runs `build:styles`) or run the
  `dev:styles` watcher.
- **Tailwind v4 renames** — `shadow-sm`→`shadow-xs`, `rounded`→`rounded-sm`, `outline-none`→
  `outline-hidden`, `ring`→`ring-3` (full list in `docs/ai-context.md`).
- **Bundle size is gated** — there's a chunk-size check in CI; large new client chunks can fail it.

## Architecture notes

<!-- Append how non-obvious systems work, with file pointers. Example shape:
- **<system>** — <one-or-two-line explanation>. (path:line) -->

## File pointers

<!-- Append where hard-to-find things live. Format:
- **<thing>** — <path:line> -->

---

> Single file on purpose. When it outgrows one screen, split into `.claude/memory/<topic>.md` + a
> `MEMORY.md` index (see the `codebase-memory` skill). Stays in-repo → shared with the team via git.
