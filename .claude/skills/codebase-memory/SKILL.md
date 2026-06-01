---
name: codebase-memory
description: Persist and reuse what you learn about THIS codebase across sessions so you never re-discover the same thing twice. Use at the START of any investigation, "where is X", "how does X work", or bug hunt — read .claude/codebase-map.md first — and at the END, record any non-obvious finding (file locations, how a system works, gotchas) back into it. Triggers whenever you're about to search the codebase broadly or you just learned something worth not re-deriving.
metadata:
  author: Genuin
  version: 1.0.0
---

# Codebase Memory

Claude has no memory between sessions — but [`.claude/codebase-map.md`](../../codebase-map.md) does.
Treat it as the team's shared, growing knowledge of this codebase. **Read it before searching; write
to it after learning.** This is the mechanism that stops Claude re-grepping the same files and
re-deriving the same flows for every new task.

## Before you search the codebase

1. **Read `.claude/codebase-map.md`.** If it already answers "where is X" or "how does Y work", use
   that — do not re-grep what's already mapped.
2. Only fan out a broad search for what the map doesn't cover.

## After you learn something non-obvious

Append a **concise entry — a pointer, not a paragraph**:

- **Where** something lives (`path:line`) when it took real effort to find.
- **How** a non-obvious flow or system works (one or two lines).
- **Gotchas** that cost time (build quirks, ordering requirements, footguns).

**Skip** the obvious, one-off bug details, and anything already in `CLAUDE.md` or
`docs/ai-context.md` (link to those instead of duplicating).

## Format

```
- **<topic>** — <fact / how it works>. (path:line)
```

## Hygiene

- Pointers, not content. Keep the map scannable.
- If an entry is wrong or stale, **fix or delete it** — a misleading map is worse than a missing one.
- This file is for *durable* codebase knowledge, not session logs or task history.

## When the map grows

`codebase-map.md` is a single file on purpose — keep it lean. When it outgrows roughly one screen
(a few hundred lines) and the sections get unwieldy, split it into a folder that mirrors this team's
memory pattern, then keep using it the same way:

1. Create `.claude/memory/<topic>.md` — one file per area (e.g. `embed-architecture.md`,
   `build-gotchas.md`), each holding that topic's durable facts.
2. Create `.claude/memory/MEMORY.md` — a one-line-per-file index (`- [Title](file.md) — hook`) that
   becomes the entry point Claude reads first.
3. Repoint `CLAUDE.md` (the "Reuse codebase knowledge" bullet) and this skill at the index.

Don't split prematurely — a single file is lower-overhead while the knowledge base is small. This
stays **in-repo** so it's shared with the whole team via git (not in `~/.claude`, which would be
personal-only).
