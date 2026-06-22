# Hierarchical Theme Provider — Implementation Plan

Plan for adding a typed `<ThemeProvider>` component to `@genuin/ui` that lets hosts apply per-publisher branding (iHeartRadio, US Weekly, Sacramento Bee, etc.) on top of the existing CSS-variable theme system. This is the runtime surface for the theming model documented in [HIERARCHICAL_TREE_SPEC.md §4.4](../../hierarchical/HIERARCHICAL_TREE_SPEC.md#44-color-theming-and-per-publisher-branding).

> **Status**: not started. Documented as the long-term home for theming; not blocking any current chunk. Page artifacts remain theme-agnostic regardless of when this lands.

---

## Goal

Add `<ThemeProvider theme="…" mode="…">` to `@genuin/ui` so hosts can wrap `<PageRenderer>` (or any subtree) with a typed publisher / mode selection. The provider applies CSS variable overrides via a root class / data attribute; descendants automatically pick up the new tokens.

---

## What I read

- `packages/tailwind-config/shared-styles.css` — current Genuin theme: `:root` defines `--gencl-primary`, `--gencl-secondary-*`, `--gencl-red-*`, plus `@theme` typography tokens. `@custom-variant dark (&: is(.dark *))` is pre-wired but unused.
- `apps/webapp/src/app/globals.css` — webapp duplicates some of the same variables locally. Mild duplication that should be reconciled when the provider lands.
- `packages/ui/src/components/{button,chip,link,icon,divider}/*` — atoms with tone/variant props that resolve to design-system color tokens through CVA recipes. The provider doesn't change these; it only swaps the underlying CSS variables.
- `packages/web-sdk/examples/react-basic/App.tsx` — existing `<SDKProvider>` pattern: provider at the React root, descendants read context. ThemeProvider follows the same shape.
- `HIERARCHICAL_TREE_SPEC.md` §4.4 — the spec's locked theming model: artifact is theme-agnostic; theming is host concern.

**Key findings**:

- One brand palette exists today (`--gencl-primary: #0645ff` = Genuin blue). Multi-publisher palettes do not exist yet.
- The Tailwind v4 + CSS-variable architecture is already structured for theming — adding more palettes is a CSS additive change, not a component rewrite.
- No theme switcher component exists today. `.dark` class is wired but never toggled.

---

## Constraints flagged

- **Shared package change** — `packages/ui` is consumed by both `apps/webapp` and `packages/web-sdk`. Per repo guardrails, "changes to shared packages" require approval. The change is purely additive (new component, new CSS theme blocks).
- **No new external dependencies** — uses React + existing Tailwind/CSS variable infrastructure.
- **Client component** — `<ThemeProvider>` may need `'use client'` if it exposes a `useTheme()` hook backed by React Context. A pure className-wrapper variant could stay server-component-safe; decide which during chunk 1.
- **Publisher palettes are design data, not engineering data** — actual iHeart / McClatchy / US Weekly color values must come from each publisher's brand guidelines. The plan ships the *mechanism*; per-publisher palettes are populated separately as the relationships land.

---

## Public API

```ts
// packages/ui/src/components/theme-provider/theme-provider.tsx

/** Known publisher themes. Open-ended via string fallback so hosts can
 *  register custom themes without modifying @genuin/ui. */
export type ThemeName =
  | 'genuin'       // default — the existing :root palette
  | 'iheart'
  | 'mcclatchy'
  | 'us-weekly'
  | string;        // escape hatch

export type ThemeMode = 'light' | 'dark';

export interface ThemeProviderProps {
  /** Publisher / brand theme. Default 'genuin'. */
  theme?: ThemeName;
  /** Light / dark mode. Default 'light'. */
  mode?: ThemeMode;
  /** Render-as element. Default 'div'. */
  asChild?: boolean;
  /** Additional className merged with the theme/mode classes. */
  className?: string;
  children: React.ReactNode;
}

/** Optional hook for descendants that need to know the active theme — most
 *  primitives don't, because they read CSS variables that the provider
 *  has already overridden. Use only when JS-level branching is needed
 *  (e.g. choosing between two icon glyphs based on contrast). */
export function useTheme(): { theme: ThemeName; mode: ThemeMode };
```

Rendered output (sketch):

```tsx
<div className="theme-iheart dark" data-theme="iheart" data-mode="dark">
  {children}
</div>
```

The CSS layer does the work — `.theme-iheart` selector defined in `packages/tailwind-config/shared-styles.css` (or a new sibling file) overrides the `--gencl-primary-*` variables to iHeart's palette; descendants render with those values automatically.

---

## Implementation plan

Ordered tasks. Each row is one focused commit-sized chunk.

| # | Step | Files |
|---|---|---|
| 1 | **Decide: pure className wrapper (server-safe) or Context-backed provider (`'use client'`).** Recommendation: **pure className wrapper for v0** — no React Context, no `useTheme` hook. Descendants don't need to know the theme; CSS variables handle everything. Add `useTheme` if a real use case appears in v1. | (decision, no files) |
| 2 | **Define theme registry CSS** — pick a location: extend `packages/tailwind-config/shared-styles.css` with `.theme-iheart {…}`, `.theme-mcclatchy {…}`, etc., OR create a new `packages/tailwind-config/themes.css` with the publisher blocks. Recommendation: separate file (`themes.css`) so the base palette stays clean and publisher palettes can be edited independently. Each `.theme-<name>` block overrides the brand-accent CSS variables (`--gencl-primary*`, possibly `--gencl-secondary*` if the publisher's neutrals diverge). Ship with **the Genuin default + placeholder blocks for iheart / mcclatchy / us-weekly** with realistic-but-clearly-placeholder palettes; document that real palettes come from publisher brand guidelines. | `packages/tailwind-config/themes.css` (new), import added to `shared-styles.css` |
| 3 | **Build the `ThemeProvider` component** in `packages/ui/src/components/theme-provider/` matching the layout/typography 5-file convention (component, test, story, doc, barrel). Server-component-safe — renders a `<div>` (or `Slot` when `asChild`) with `data-theme`, `data-mode`, and the matching className. No `'use client'`. | `packages/ui/src/components/theme-provider/{theme-provider.tsx, theme-provider.test.tsx, theme-provider.stories.tsx, theme-provider.doc.mdx, index.ts}` |
| 4 | **Register in barrel** — `packages/ui/src/components/index.ts` re-exports `theme-provider`. Add subpath export to `packages/ui/package.json` exports map (`./theme-provider`) if the existing wildcard doesn't already cover it. | `packages/ui/src/components/index.ts`, possibly `packages/ui/package.json` |
| 5 | **Demo / smoke test** — wrap `/hierarchical/preview` with `<ThemeProvider theme="iheart">` (or similar) and confirm the page renders with the override palette. Two stories in `theme-provider.stories.tsx`: one showing all known themes side-by-side; one toggling light/dark. | `apps/webapp/src/app/(site)/(new)/hierarchical/preview/client-page.tsx` (light edit — optional theme toggle for review purposes) |
| 6 | **Verification** — `pnpm typecheck` passes (10/10); `pnpm --filter @genuin/ui test` passes the new suite. Visit `/hierarchical/preview` and toggle through themes; observe CSS variable changes propagate to all primitives. | (verification) |
| 7 | **Optional: ship a `<ThemeSwitcher>` companion** — a tiny dropdown component in `@genuin/ui` for the smoke-test surface. Not needed for production; useful for human-review testing. Defer to v1 if time-constrained. | `packages/ui/src/components/theme-switcher/*` |

Estimated effort: **~1 focused day** for steps 1–6 (the dominant cost is collecting + entering the publisher palettes; the component itself is ~50 lines).

---

## Implementation notes

### Theme registry shape

`packages/tailwind-config/themes.css`:

```css
/* Genuin is the default — :root in shared-styles.css already defines these.
   Re-declare here only if we want to make "genuin" an explicit class for
   symmetry. Otherwise, the absence of a theme-* class falls back to :root. */

.theme-iheart {
  /* TODO(designer-handoff): real iHeart palette per brand guidelines. */
  --gencl-primary:     #c6002b;
  --gencl-primary-600: #9d0022;
  --gencl-primary-700: #6a0017;
  /* greys typically stay design-system-default unless publisher demands otherwise */
}

.theme-mcclatchy {
  /* TODO(designer-handoff) */
  --gencl-primary:     #b8242a;
  --gencl-primary-600: #921c21;
  --gencl-primary-700: #6f1518;
}

.theme-us-weekly {
  /* TODO(designer-handoff) */
  --gencl-primary:     #6a3da8;
  --gencl-primary-600: #5a338f;
  --gencl-primary-700: #4b2a75;
}
```

The placeholder values let the smoke test render visibly-different themes immediately; the `TODO(designer-handoff)` markers signal that the actual colors need confirmation from each publisher's brand guidelines.

### Component shape (server-component-safe v0)

```tsx
// theme-provider.tsx (sketch — not production code)
import { cn } from "../../lib/utils";

export function ThemeProvider({
  theme = "genuin",
  mode = "light",
  asChild = false,
  className,
  children,
}: ThemeProviderProps) {
  const Comp = asChild ? Slot : "div";
  return (
    <Comp
      className={cn(`theme-${theme}`, mode === "dark" && "dark", className)}
      data-theme={theme}
      data-mode={mode}
      data-slot="theme-provider"
    >
      {children}
    </Comp>
  );
}
```

No React Context, no hooks. The whole surface is a className + data attributes; CSS does the rest.

### Why pure className over Context

- Most primitives don't need to know the active theme — they read CSS variables that the wrapper already overrode.
- Server-component-safe is preferable; no `'use client'` boundary added at the page root.
- `useTheme` was the recommended escape hatch — but the only legitimate use case (JS-level branching on theme) hasn't shown up yet, and adding it would force the provider client-side.
- If a real `useTheme` use case appears in v1, the provider can be expanded to dual-mode (pure wrapper + optional context provider for descendants that opt in).

### Dark mode

The existing `@custom-variant dark (&: is(.dark *))` in `shared-styles.css` already handles dark-mode variants (`gencl:dark:bg-secondary-900` works today). The provider just needs to add `class="dark"` when `mode === "dark"`.

For dark-mode-specific palette overrides per publisher (e.g. iHeart's dark mode might use different reds than its light mode), use `.theme-iheart.dark { … }` selectors in `themes.css`. Skip for v0 unless a publisher mandates it.

---

## Decisions

### Locked at chunk start

- **Server-component-safe** — `<ThemeProvider>` is a pure wrapper; no `'use client'`, no React Context, no `useTheme` hook in v0.
- **CSS-class theming, not inline style overrides** — themes live as `.theme-<name>` blocks in `packages/tailwind-config/themes.css`; the provider just applies the class.
- **Open-ended `ThemeName` type** — `'genuin' | 'iheart' | 'mcclatchy' | 'us-weekly' | string` lets hosts add custom themes without forking `@genuin/ui`.
- **Placement** — `@genuin/ui/src/components/theme-provider/` (standard primitive folder convention). Theme CSS lives in `packages/tailwind-config/themes.css`.

### To confirm at chunk start

- **Theme names** — confirmed enum values (`iheart`, `mcclatchy`, `us-weekly`) match the publisher relationships you want named in the type. Worth one Slack-ping confirmation with whoever owns publisher relationships.
- **Whether to register Genuin as a class** (`.theme-genuin`) or keep it as the implicit `:root` default. Recommendation: keep `:root` as the default; named classes only for explicit overrides.

---

## Open questions

- **Real publisher palettes** — placeholder values ship in chunk 2 so the smoke test works. Final palettes need brand-guideline confirmation per publisher. Document the TODO clearly so the placeholders aren't mistaken for production.
- **Mode toggle ergonomics** — does dark mode need a system-preference auto-detect (`prefers-color-scheme: dark`)? Probably yes long-term; not blocking v0. The provider can accept `mode="system"` later and read `window.matchMedia('(prefers-color-scheme: dark)')`.
- **Per-component theme overrides** — should `Button` etc. accept a `theme` prop that overrides the ancestor `<ThemeProvider>`? Probably not — the closed enums on each primitive (`button.theme`, `link.tone`, etc.) already cover the "make this one element different" case. Document the boundary.
- **Cross-package import for the CSS** — `apps/webapp/src/app/globals.css` currently redefines variables that `packages/tailwind-config/shared-styles.css` also defines. When this plan lands, the webapp globals should consume `themes.css` and stop redeclaring its own variables. Tracked separately, not blocking.

---

## Acceptance criteria

v0 is done when:

1. `packages/ui/src/components/theme-provider/` exists with the 5-file convention.
2. `packages/tailwind-config/themes.css` exists with at least `.theme-iheart`, `.theme-mcclatchy`, `.theme-us-weekly` blocks (placeholder palettes documented).
3. `<ThemeProvider>` is exported from `packages/ui/src/components/index.ts`.
4. `pnpm typecheck` passes 10/10; `pnpm --filter @genuin/ui test` passes the new suite.
5. `/hierarchical/preview` renders with at least one non-default theme applied via `<ThemeProvider theme="iheart">` and visibly differs from the default.
6. Spec §4.4 reference to this plan resolves correctly.

v1 adds (deferred):

1. Real publisher palettes (confirmed with brand guidelines).
2. `mode="system"` auto-detect.
3. `useTheme()` hook + Context provider variant if a use case appears.
4. Per-publisher dark mode overrides (`.theme-iheart.dark { … }`).
5. `<ThemeSwitcher>` companion for human-review surfaces.

---

## Recommended approach

Single PR, ~1 day, 7 chunks per the implementation table. The work is mostly mechanical — the actual challenge is collecting publisher palettes. Ship with documented placeholder palettes so the visual diff is immediately observable; replace placeholders as publisher relationships mature.

Theming is **not blocking** any other in-flight work — the spec, the SKILL.md, the runtime walker, and the smoke-test page are all theme-agnostic and will render correctly under whichever theme is active (or the default if none is). Schedule this plan when publisher relationships are concrete enough to populate the palettes.
