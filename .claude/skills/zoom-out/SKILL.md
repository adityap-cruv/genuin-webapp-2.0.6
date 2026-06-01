---
name: zoom-out
description: Give a high-level MAP of an unfamiliar area of the codebase — the modules involved, who calls them, the data flow, and how it fits the bigger picture — before diving into line-by-line detail. Use when you or the user don't know a section of code well, are onboarding to a feature, or ask "how does X fit together" / "give me the big picture" / "zoom out" / "where does this live". Do NOT use for a deep read of one known file (just read it) or for planning a change (use the planner agent).
metadata:
  author: Genuin (adapted from mattpocock/skills zoom-out)
  version: 1.0.0
---

# Zoom Out

When an area of code is unfamiliar, go **up** a layer of abstraction before going down. Produce a
map, not a line-by-line read.

## Produce

- **Modules involved** — which packages/dirs (atoms → `packages/ui`, molecules/organisms →
  `packages/components`, app/pages → `apps/webapp`) and the key files.
- **Callers & data flow** — what calls this, what it calls, where the data comes from and goes.
- **Domain vocabulary** — use the team's terms (embed, placement, wall, feed, layout, SDK) so the map
  matches how people talk about it.
- **One-paragraph "what & why"** — what this area does and how it fits the bigger picture.

## Then

- **Check `.claude/codebase-map.md` first** — the map may already be recorded (see `codebase-memory`).
- Hand off to the `planner` agent if a change is coming, or dive into the specific file now.
- **Record the map** in `.claude/codebase-map.md` so nobody re-derives it next time.

Keep it breadth over depth — save line-by-line reading for the one file you'll actually change.
