---
name: web-design-review
description: Review UI code against web design/UX guidelines for this React 19 + Next 15 + Tailwind v4 stack — animation, typography, content handling, images/CLS, navigation & URL state, touch/safe-areas, dark mode, i18n, hydration safety, and interactive states. Use when asked to "review my UI", "check the design/UX", "audit the visuals", or polish a component. Do NOT use for accessibility/WCAG audits (use the accessibility skill — it owns a11y, focus, forms) or React/data architecture (use frontend-patterns).
metadata:
  author: Genuin (adapted from vercel-labs/agent-skills web-design-guidelines)
  version: 1.0.0
  argument-hint: <file-or-glob to review>
---

# Web Design Review

Review the given file(s) against the design/UX guidelines below and report violations.

> **Boundary:** This skill covers *design, UX, motion, typography, perf-CLS, i18n, theming*.
> Accessibility (semantic HTML, focus management, form labels, contrast, ARIA, keyboard) is owned by
> the **`accessibility`** skill — run that for a11y; this skill assumes it and does not duplicate it.

## How to run

1. If no file/glob was given, ask which files to review.
2. Read the target files. Check each against the categories below.
3. Output findings grouped by file, one per line, terse and VS Code-clickable.

## Output contract

```
path/to/file.tsx
  12 - Animates `width`; animate transform/opacity only (causes layout thrash)
  40 - <img> has no width/height — will cause CLS
  ✓ no other issues

path/to/clean.tsx
  ✓ pass
```

Use `path:line - issue`. Sacrifice grammar for brevity. No preamble or explanation unless the fix is
non-obvious. Don't restate code back.

## Guidelines

### Animation & Motion
- Animate `transform`/`opacity` only — never `width`/`height`/`top`/`left` or `transition: all`.
- Honor `prefers-reduced-motion` (Tailwind: `motion-reduce:*`); disable non-essential motion.
- Keep transitions ~150–300ms; avoid animating on initial page load.

### Typography & Content
- Use real ellipsis `…` and curly quotes `“ ”`; `text-balance`/`text-pretty` for headings.
- Prevent overflow: `min-w-0` on flex children, `line-clamp-*` / `truncate` for long text.
- Tabular numbers (`tabular-nums`) for aligned figures; sensible `max-w-*` (~65ch) for reading.

### Images & CLS
- Always set explicit `width`/`height` (or `fill` + sized container) — prevents layout shift.
- Use `next/image`; `priority`/`fetchPriority="high"` for LCP image, `loading="lazy"` otherwise.
- Provide an aspect-ratio box for media that loads async.

### Performance (visual)
- Virtualize lists > ~50 items (see `nextjs-server-performance` / `@tanstack/react-virtual`).
- `content-visibility: auto` for long offscreen sections.
- Defer non-critical third-party scripts (`next/script` `strategy="lazyOnload"`).

### Navigation & URL State
- Use `next/link` for internal navigation (not `<a>`/router.push for plain links).
- Reflect shareable UI state (filters, tabs, search) in the URL, not just local state.
- Preserve scroll position appropriately; show active-route state.

### Touch & Safe Areas
- Touch targets ≥ 44×44px. Respect `env(safe-area-inset-*)` on mobile/PWA.
- `touch-action`/`overscroll-behavior` where custom gestures or scroll containers exist.

### Dark Mode & Theming
- Set `color-scheme` so native controls/scrollbars theme correctly.
- Use theme tokens (CSS variables / Tailwind theme), not hardcoded hex per mode.
- Ensure images/illustrations work (or swap) in both themes.

### Locale & i18n
- Format dates/numbers with `Intl.DateTimeFormat`/`Intl.NumberFormat`, not manual strings.
- `translate="no"` on code/IDs/brand names; never concatenate translated fragments.
- Don't hardcode currency symbols or date order.

### Hydration Safety
- No `Date.now()`/`Math.random()`/locale-dependent output in render without `suppressHydrationWarning`
  or a client-only guard — causes hydration mismatch.
- Don't read `window`/`localStorage` during render of a component that also renders on the server.

### Hover & Interactive States
- Pair `:hover` with `:focus-visible`; don't rely on hover alone (touch has none).
- Show clear `:active`/pressed and `disabled` states; cursor reflects interactivity.

### Anti-patterns (flag these)
- `transition: all`; animating layout properties.
- `<div onClick>` for actions (→ use `<button>`; flag to the `accessibility` skill too).
- Fixed pixel heights on text containers; `overflow: hidden` hiding real content.
- Hardcoded colours bypassing theme tokens; `<img>` without dimensions.

---

> Source: adapted from Vercel Labs `web-design-guidelines` (Web Interface Guidelines). Vendored as a
> local checklist (no runtime WebFetch) to keep reviews offline and deterministic.
