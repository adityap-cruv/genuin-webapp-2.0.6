# UI Layout Primitives — Implementation Plan

Plan for building the layout primitive component inventory called out as the prerequisite in [HIERARCHICAL_TREE_SPEC.md](../../hierarchical/HIERARCHICAL_TREE_SPEC.md#7-open-items) (Component Inventory Gap, §7). These are the building blocks the generative layout system composes into pages.

---

## Goal

Add seven layout primitive components to `@genuin/ui` (`packages/ui/src/components/layout/`) so the Hierarchical Tree generator has a closed, enumerable vocabulary of layout-arranging components to target. The primitives are thin, opinionated Tailwind wrappers around CSS flex and grid — no new design, just a formal set of named components matching arrangements already used inline across the codebase.

---

## What I read

- `packages/ui/src/components/button/{button.tsx, button.test.tsx, button.stories.tsx, index.ts}` — canonical CVA + Tailwind component pattern.
- `packages/ui/src/components/chip/`, `dialog/`, `popover/` — sibling components confirming the file-layout convention.
- `packages/ui/src/components/index.ts` — components barrel (every component re-exports here).
- `packages/ui/src/lib/utils.ts` — `cn` helper used throughout.
- `HIERARCHICAL_TREE_SPEC.md` §4 (UI Nodes), §7 (Component Inventory Gap with the suggested 7-component inventory).
- **Genuin Master Design System V2 Figma file** (nodes `6159:110280` and `6162:726`) — size + spacing token scales.

**Findings**:

- All `@genuin/ui` components follow a strict folder layout: `<name>.tsx`, `<name>.test.tsx`, `<name>.stories.tsx`, `<name>.doc.mdx`, `index.ts`.
- All styling goes through CVA (`class-variance-authority`) + Tailwind with the `gencl:` prefix.
- Composition is via `@radix-ui/react-slot` for `asChild` polymorphism where applicable.
- Components export named values only; tests import from `./<name>`.
- The `packages/ui/src/components/index.ts` barrel re-exports each component folder.
- No layout-arranging primitives exist today (`Row`, `Column`, `Stack`, `Grid`, `Container`, `Cluster`, `SplitView` are all missing). Layout is currently inline `<div className="gencl:flex ...">` at call sites.
- **The design system defines a discrete scale of named size / spacing tokens** (XXS / XS / SM / MD / LG / XL / XXL / XXXL). The layout primitives MUST use these named tokens, not raw numeric Tailwind units, to stay in sync with the DS.

---

## Design system token reference

All `gap` / `padding` / `maxW` props on the layout primitives accept the **DS-named token set**, not raw Tailwind units. This keeps the inventory aligned with Figma and ensures the AI generator emits design-system-compliant Layout JSON.

### Spacing scale (Figma node 6162:726 — Padding)

This is the scale used by layout primitives for `gap`, `padding`, `margin` props. **Tops at 40 px**, matching the design system's `paddingXXL = 40` and `controlHeightLG = 40` tokens.

The DS scale has 8 distinct steps. Mapping to a lowercase short-form token set used by the primitives:

| DS short token | Pixel value | Figma DS name | Tailwind class equivalent | Typical use |
|---|---|---|---|---|
| `xxs` | 4 px | `paddingXXS` | `gap-1` / `p-1` | Tight inline spacing (icon ↔ label) |
| `xs` | 8 px | `paddingXS` | `gap-2` / `p-2` | Compact lists, chip rows |
| `sm` | 12 px | `paddingSM` | `gap-3` / `p-3` | Small sections within a card |
| `md` (default) | 16 px | `padding` (no suffix — DS base) | `gap-4` / `p-4` | Default body spacing |
| `ml` | 20 px | `paddingMD` | `gap-5` / `p-5` | Between sub-sections |
| `lg` | 24 px | `paddingLG` | `gap-6` / `p-6` | Between major sections |
| `xl` | 32 px | `paddingXL` | `gap-8` / `p-8` | Between page regions |
| `xxl` | 40 px | `paddingXXL` | `gap-10` / `p-10` | Top-level page separators |

**Note on `md` vs `ml`**: the DS uses the unsuffixed token `padding` (= 16 px) as its default, and `paddingMD` (= 20 px) as the *medium* step above default. The primitive API mirrors this with `md` = default = 16 px and `ml` = "medium-large" = 20 px (matches the `sizeML` short name from the Size scale). This is intentional — the goal is to preserve the DS's 8-step granularity rather than collapse two scale steps.

The Figma DS-original names live as JSDoc cross-references in `tokens.ts`; the lowercase short form is what consumers type.

### Size scale — **NOT used by layout primitives** (Figma node 6159:110280 — Size)

The design system also defines a `size*` scale that goes one step further at the top (`sizeXXL = 48`). It is consumed by **element-sizing** concerns — icons, avatars, chips, control widths — not by gap/padding/margin. The layout primitives in this plan do **not** consume the size scale. Documented here so contributors don't conflate the two.

| DS token | Pixel value | Matches DS spacing token |
|---|---|---|
| `sizeXXS` | 4 px | `paddingXXS` |
| `sizeXS` | 8 px | `paddingXS` |
| `sizeSM` | 12 px | `paddingSM` |
| `size` | 16 px | `padding` (default) |
| `sizeML` | 20 px | `paddingMD` |
| `sizeLG` | 24 px | `paddingLG` |
| `sizeXL` | 32 px | `paddingXL` |
| `sizeXXL` | **48 px** | (no spacing equivalent — extends one step beyond the spacing scale's top of 40 px) |

If a component needs the 48 px value, it's about **how big the element itself is**, not how far apart it sits from its neighbours. That belongs to the consuming component's own sizing prop (e.g. `Avatar size="xxl"`), not to the layout primitives.

### Control-height tokens (for reference, not used by layout primitives)

These are part of the same DS scale and consumed by `Button`, `Input`, `Chip`, etc. — **not** by layout primitives directly. Documented here so contributors don't try to apply them.

| Token | Value | Component height (e.g. button) |
|---|---|---|
| `controlHeightXS` | 16 px | very small chips |
| `controlHeightSM` | 24 px | dense table rows |
| `controlHeight` | 32 px | default control height |
| `controlHeightLG` | 40 px | large buttons / inputs |

### Implications for the primitives

- **No raw numeric gap props** (`gap: 4`). Use named tokens (`gap: 'md'`).
- **No arbitrary Tailwind classes** in CVA recipes (`gencl:gap-[15px]`). Only DS-mapped classes.
- **`Container.maxW`** also takes a named token (see `Container` spec below).
- **Tests assert the DS class** lands in `className` (e.g. `gencl:gap-4` for `gap: 'md'`), making it a regression test for token drift.

---

## Constraints flagged

- **Shared package change**. `packages/ui` is consumed by both `apps/webapp` and `packages/web-sdk`. Adding new components is additive and low-risk, but per repo guardrails any change to a shared package warrants explicit approval before merging.
- **No new external dependencies**. The plan uses only what `@genuin/ui` already depends on (`class-variance-authority`, `@radix-ui/react-slot`, `clsx`, Tailwind classes). No additions trigger the `requireApproval` dependency gate.
- **`@genuin/ui` consumers may already render layout via inline Tailwind in many places**. Migrating those call sites is out of scope for this plan — the primitives just have to exist; adoption is gradual.
- **Component naming**. `Row` / `Column` / `Stack` etc. are common names that may collide with other libraries when published. Confined to `@genuin/ui` namespace, this is fine.

---

## Components to build

Seven primitives, each in its own folder under `packages/ui/src/components/layout/`. All are pure presentational components — no client state, no `'use client'` directive. They are Server-Component-safe by default.

### 1. `Row`

Horizontal flex container. The bread-and-butter primitive used for "lay these children out side by side."

**File**: `packages/ui/src/components/layout/row/row.tsx`

**Props** (type sketch):

```ts
/** DS-aligned spacing scale. See "Design system token reference" above. */
type DsSpace = 'none' | 'xxs' | 'xs' | 'sm' | 'md' | 'ml' | 'lg' | 'xl' | 'xxl';

interface RowProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Spacing between children. Named DS token, not raw Tailwind units. */
  gap?: DsSpace;
  /** Vertical alignment of children. */
  align?: 'start' | 'center' | 'end' | 'baseline' | 'stretch';
  /** Horizontal distribution of children. */
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  /** Wrap to multiple lines when out of horizontal space. */
  wrap?: boolean;
  /** Render as a different element (uses Radix Slot). */
  asChild?: boolean;
}
```

**Behaviour**: emits `display: flex; flex-direction: row` with the corresponding Tailwind classes. Defaults: `gap="none"`, `align="stretch"`, `justify="start"`, `wrap=false`.

---

### 2. `Column`

Vertical flex container. Semantic alias for "lay these children out top-to-bottom."

**File**: `packages/ui/src/components/layout/column/column.tsx`

**Props**: same shape as `Row` (gap, align, justify, wrap, asChild). `align` controls horizontal alignment, `justify` controls vertical distribution (axis-flipped meaning).

**Behaviour**: emits `display: flex; flex-direction: column`.

**Note**: kept as a separate component (not just `<Row direction="column">`) because the semantic intent — "this is a vertical group" — is clearer in code and easier for the generator to emit.

---

### 3. `Stack`

Vertical column with **consistent gap** between children, no extra layout knobs. The ergonomic shortcut for the most common "vertical list of things separated by N" pattern. ~80% of "column with gap" usage maps to `Stack`; reach for `Column` when you need `align` / `justify` control.

**File**: `packages/ui/src/components/layout/stack/stack.tsx`

**Props**:

```ts
interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Vertical spacing between children. Named DS token. */
  gap?: DsSpace;
  /** Render as a different element. */
  asChild?: boolean;
}
```

**Behaviour**: `flex flex-col` plus the gap class from the DS map. No alignment props — those are an opt-in via `Column`. Default `gap="md"` (16 px) since `Stack` is meant as the ergonomic shortcut and most lists want a sensible default gap rather than zero.

---

### 4. `Grid`

CSS Grid wrapper. The generator's main primitive for multi-column / multi-row arrangements.

**File**: `packages/ui/src/components/layout/grid/grid.tsx`

**Props**:

```ts
interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Column tracks. Number = repeat(N, minmax(0, 1fr));
   *  string = raw grid-template-columns value (e.g. "746px 320px"). */
  cols?: number | string;
  /** Row tracks. Same convention as cols. */
  rows?: number | string;
  /** Symmetric gap between cells. Named DS token. Mutually exclusive
   *  with colGap/rowGap. */
  gap?: DsSpace;
  /** Column gap only. */
  colGap?: DsSpace;
  /** Row gap only. */
  rowGap?: DsSpace;
  /** Render as a different element. */
  asChild?: boolean;
}
```

**Behaviour**: emits `display: grid`. Numeric `cols`/`rows` translate to `repeat(N, minmax(0, 1fr))`; string values pass through as raw `grid-template-*` values via inline `style` (because Tailwind can't safelist arbitrary track strings at compile time).

**Mutual exclusion**: if `gap` is set, `colGap` / `rowGap` are ignored (validator-checked in development, prop-level merging in production).

---

### 5. `Container`

Max-width content wrapper with horizontal centering. The page-level "don't let content stretch wider than X" primitive.

**File**: `packages/ui/src/components/layout/container/container.tsx`

**Props**:

```ts
/** Container size token. Mirrors the Hierarchical Tree breakpoint set
 *  so a Container can target an exact Figma frame without raw px. */
type ContainerMaxW =
  | 'mobile'        // 420 px frame
  | 'tablet-sm'     // 748 px frame
  | 'tablet'        // 1024 px frame
  | 'desktop'       // 1280 px frame (canonical Figma desktop)
  | 'desktop-wide'  // 1512 px frame
  | 'full'
  | string;         // raw escape hatch (e.g. "960px")

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Max width — named breakpoint token or raw value. */
  maxW?: ContainerMaxW;
  /** Horizontal padding inside the container. Named DS token. */
  px?: Extract<DsSpace, 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'>;
  /** Render as a different element (e.g. <main>, <section>). */
  asChild?: boolean;
}
```

**Behaviour**: `mx-auto w-full` plus a `max-w-*` class based on `maxW`. Defaults: `maxW="desktop"`, `px="md"`. The named breakpoint tokens align 1:1 with the Hierarchical Tree's canonical breakpoint set, so the AI generator can emit `<Container maxW="desktop">` without committing to a px literal in the artifact.

---

### 6. `Cluster`

Wrap-friendly flex row. The primitive for chips, tags, action button groups, breadcrumbs — anything that should wrap when it runs out of horizontal space.

**File**: `packages/ui/src/components/layout/cluster/cluster.tsx`

**Props**:

```ts
interface ClusterProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Gap between items. Applies in both axes when wrapping. Named DS token. */
  gap?: DsSpace;
  /** Vertical alignment of items within a line. */
  align?: 'start' | 'center' | 'end' | 'baseline';
  /** Render as a different element. */
  asChild?: boolean;
}
```

**Behaviour**: `flex flex-wrap items-center` plus the gap class from the DS map. The "wrap is always on" distinction is what separates this from `Row` — different intent, different name, easier for the generator to target. Default `gap="xs"` (8 px, the typical chip-row gap).

---

### 7. `SplitView`

Two-or-three-column ratio split with **explicit track widths**. The primitive for the canonical Hierarchical Tree pattern: "video on the left, linkout stack on the right at 746/320" or "three equal columns of 1fr each."

**File**: `packages/ui/src/components/layout/split-view/split-view.tsx`

**Props**:

```ts
interface SplitViewProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Column tracks. Required. Accepts a number (equal 1fr splits),
   *  an array of pixel widths ([746, 320]), or a raw template string
   *  ("746px 320px", "1fr 2fr 1fr"). */
  tracks: number | number[] | string;
  /** Gap between columns. Named DS token. */
  gap?: DsSpace;
  /** Vertical alignment of column contents. */
  align?: 'start' | 'center' | 'end' | 'stretch';
  /** Render as a different element. */
  asChild?: boolean;
}
```

**Behaviour**: thin wrapper around `Grid` with `rows=1`; lives as its own primitive because the "ratio split" intent is common enough to warrant a dedicated name. `tracks: 2` → `1fr 1fr`, `tracks: 3` → `1fr 1fr 1fr`, `tracks: [746, 320]` → `746px 320px`, `tracks: "2fr 1fr"` → passed through.

**Tradeoff**: this primitive overlaps with `Grid` (could be expressed as `<Grid cols="746px 320px">`). Kept as a separate primitive because the generator emits "split-view" patterns frequently enough that a dedicated name reduces tree noise. If we later find it's just sugar with no usage benefit, it can be folded into `Grid` and removed.

---

## File / folder layout per primitive

Every primitive follows the existing `@genuin/ui` component convention:

```
packages/ui/src/components/layout/
├── row/
│   ├── row.tsx              ← component + CVA
│   ├── row.test.tsx         ← unit tests (Jest + RTL)
│   ├── row.stories.tsx      ← Storybook story
│   ├── row.doc.mdx          ← short component documentation
│   └── index.ts             ← `export * from "./row";`
├── column/
│   └── ...
├── stack/
│   └── ...
├── grid/
│   └── ...
├── container/
│   └── ...
├── cluster/
│   └── ...
├── split-view/
│   └── ...
└── index.ts                 ← `export * from "./row";` × 7
```

The new layout barrel is then re-exported from `packages/ui/src/components/index.ts`:

```ts
// packages/ui/src/components/index.ts
export * from "./layout";
// ... existing exports
```

---

## Implementation plan

Ordered tasks. Each row is one focused commit-sized chunk.

| # | Step | Files |
|---|---|---|
| 1 | Create the `layout/` directory and the shared **`tokens.ts`** file (DS-named space + max-width token maps). This is the source-of-truth for the design-system scale; every primitive imports from here. | `packages/ui/src/components/layout/tokens.ts`, `packages/ui/src/components/layout/index.ts` |
| 2 | Implement `Stack` first (the simplest, no variants beyond `gap`). Use it to lock the convention (CVA pattern, `asChild` via Radix Slot, `data-slot` attribute, DS-token consumption via `tokens.ts`, test scaffold). | `layout/stack/{stack.tsx, stack.test.tsx, stack.stories.tsx, index.ts}` |
| 3 | Implement `Row` and `Column` together (siblings, same prop shape). | `layout/row/`, `layout/column/` |
| 4 | Implement `Cluster` (wrap-friendly Row variant). | `layout/cluster/` |
| 5 | Implement `Grid` (CSS Grid with number-or-string tracks). The trickiest because of the number-vs-string track polymorphism — see "Implementation notes" below. | `layout/grid/` |
| 6 | Implement `SplitView` (thin wrapper over `Grid`). | `layout/split-view/` |
| 7 | Implement `Container` (max-width + centering, consuming `MAX_W_CLASS` and `PX_CLASS` from `tokens.ts`). | `layout/container/` |
| 8 | Register the `layout` barrel in `packages/ui/src/components/index.ts`. | `packages/ui/src/components/index.ts` |
| 9 | Run `pnpm typecheck` from repo root; confirm 8/8 pass. | (verification) |
| 10 | Run `pnpm --filter @genuin/ui test` and confirm all new component tests pass on Jest and Vitest. | (verification) |
| 11 | Update [HIERARCHICAL_TREE_SPEC.md §7](../../hierarchical/HIERARCHICAL_TREE_SPEC.md#7-open-items) to mark the inventory gap as closed; add a paragraph linking to the new components and noting that the `uiRenderers` registry can now resolve these `uiVariant` strings. | `HIERARCHICAL_TREE_SPEC.md` |

Estimated total effort: **1–2 focused days** for the seven components plus tests and stories, per the spec's prior estimate.

---

## Implementation notes

### CVA usage + shared DS token maps

Use CVA only where there are genuine *variants* (enumerated string values). For the DS-named `gap` / `padding` tokens, derive Tailwind classes via a shared lookup map. Put the maps in **one shared file** (`packages/ui/src/components/layout/tokens.ts`) so all seven primitives import the same source of truth — no per-component duplication, no drift if the DS scale shifts later.

```ts
// packages/ui/src/components/layout/tokens.ts
export type DsSpace =
  | 'none' | 'xxs' | 'xs' | 'sm' | 'md' | 'ml' | 'lg' | 'xl' | 'xxl';

/** DS space token → Tailwind gap-* class. Mirrors Figma Padding scale
 *  (node 6162:726). Tops at 40 px (paddingXXL). The size scale's 48 px
 *  (sizeXXL) is intentionally NOT included — that's element-sizing,
 *  not spacing. */
export const GAP_CLASS: Record<DsSpace, string> = {
  none: 'gencl:gap-0',
  xxs:  'gencl:gap-1',   // 4 px  — paddingXXS
  xs:   'gencl:gap-2',   // 8 px  — paddingXS
  sm:   'gencl:gap-3',   // 12 px — paddingSM
  md:   'gencl:gap-4',   // 16 px — `padding` (DS default, no suffix)
  ml:   'gencl:gap-5',   // 20 px — paddingMD
  lg:   'gencl:gap-6',   // 24 px — paddingLG
  xl:   'gencl:gap-8',   // 32 px — paddingXL
  xxl:  'gencl:gap-10',  // 40 px — paddingXXL (top of scale)
};

export const COL_GAP_CLASS: Record<DsSpace, string> = { /* gencl:gap-x-* */ };
export const ROW_GAP_CLASS: Record<DsSpace, string> = { /* gencl:gap-y-* */ };
export const PX_CLASS: Record<DsSpace, string> = { /* gencl:px-* */ };

/** Container max-width tokens — align with the Hierarchical Tree breakpoints. */
export type ContainerMaxW =
  | 'mobile' | 'tablet-sm' | 'tablet' | 'desktop' | 'desktop-wide' | 'full' | string;

export const MAX_W_CLASS: Record<Exclude<ContainerMaxW, string>, string> = {
  'mobile':       'gencl:max-w-[420px]',
  'tablet-sm':    'gencl:max-w-[748px]',
  'tablet':       'gencl:max-w-[1024px]',
  'desktop':      'gencl:max-w-[1280px]',
  'desktop-wide': 'gencl:max-w-[1512px]',
  'full':         'gencl:max-w-full',
};
```

Each primitive's component file imports from `./tokens` and applies the class via `cn`. This keeps CVA recipes clean (alignment / justification stay in CVA; gap / padding / max-width tokens are looked up) and avoids the cartesian-product blowup of enumerating `gap × align × justify × wrap` in a single CVA recipe.

### `Grid` and `SplitView` — number vs string tracks

When `cols` is a `number`, emit a Tailwind class: `gencl:grid-cols-N` (assuming Tailwind has `grid-cols-1` through `grid-cols-12` available — verify against the project's Tailwind config; if not, safelist or fall back to inline style).

When `cols` is a `string`, set it via `style={{ gridTemplateColumns: cols }}` because Tailwind cannot safelist arbitrary track strings at build time. Document this clearly in the doc.mdx — runtime style attribute is unavoidable for the generative use case where designers express arbitrary tracks per breakpoint.

### `asChild` via Radix Slot

Match the pattern used by `Button`:

```tsx
const Comp = asChild ? Slot : 'div';
return <Comp className={cn(...)} {...props} ref={ref} />;
```

Forward refs on every primitive (`React.forwardRef`), since layout primitives are commonly the target of refs from animation libraries and IntersectionObservers.

### `data-slot` attribute

Match the convention used elsewhere in `@genuin/ui` (e.g. `data-slot="dynamic-sheet"` in dynamic-sheet). Each primitive emits `data-slot="layout-row"` / `"layout-column"` / etc. so Storybook docs and dev-tools can identify them.

### Theme tokens

Gap / padding values come from the **Genuin Design System v2 Padding scale** (Figma node `6162:726`) — see the "Design system token reference" section above. The mapping from DS tokens (`xxs`/`xs`/`sm`/`md`/`ml`/`lg`/`xl`/`xxl`) to pixel values is fixed and lives in the shared `tokens.ts` file; primitive consumers never see the raw px or Tailwind units.

The primitives are pure layout — they do not introduce color, border, background, or font styling. Anything visual is the consumer's concern via children or `className` overrides.

If the DS scale changes, the only file that needs to update is `packages/ui/src/components/layout/tokens.ts`. All seven primitives inherit automatically. This is the main reason the maps are colocated in one file.

---

## Testing plan

For each primitive, the test file (`<name>.test.tsx`) covers at minimum:

1. **Default render** — renders a `<div>` with the base classes from CVA.
2. **Each enumerated prop variant** — for `align`, `justify`, `wrap`, etc., assert the right Tailwind class lands in `className`.
3. **DS token mapping** — for `gap` / `padding` props, assert that each named token (`'xxs'`, `'xs'`, `'sm'`, `'md'`, `'ml'`, `'lg'`, `'xl'`, `'xxl'`) lands the expected `gencl:gap-*` / `gencl:p-*` class from `tokens.ts`. This doubles as a regression test against DS token drift.
4. **`asChild` polymorphism** — render `<Row asChild><section /></Row>` and assert the element is `<section>` (not `<div>`).
5. **`className` merging** — pass a custom `className` and assert it's merged via `cn` (not overridden).
6. **`ref` forwarding** — pass a ref and assert it lands on the underlying element.

For `Grid` specifically, add:

7. **Number cols** — assert `grid-cols-N` class is present.
8. **String cols** — assert `style.gridTemplateColumns` matches the input.
9. **Mutual exclusion** — assert that `gap` overrides `colGap` + `rowGap` (or warns in dev).

For `SplitView`, add:

10. **Array tracks** — `[746, 320]` produces `style.gridTemplateColumns: "746px 320px"`.
11. **Number tracks** — `2` produces `grid-cols-2`.

For `Container`, add:

12. **`maxW` token mapping** — assert each named token (`'mobile'`, `'tablet'`, `'desktop'`, etc.) produces the expected `gencl:max-w-[Npx]` class from `MAX_W_CLASS`.

Additionally, `tokens.ts` itself gets a dedicated test file (`tokens.test.ts`) asserting all DS tokens map to non-empty class strings — guards against accidental deletion or typo in the shared map.

Tests use Jest + `@testing-library/react` (the existing convention in `@genuin/ui`). Each file runs in both the Jest and Vitest harnesses (`packages/ui` is configured for both — `pnpm test` runs both).

---

## Storybook documentation

Each primitive ships with `<name>.stories.tsx` covering:

- **Default** — minimal example, all defaults.
- **All variants** — one story per `align`/`justify`/`gap`/etc. variant on a grid.
- **`asChild` example** — show the polymorphism by rendering as `<section>` or `<main>`.
- **Composition example** — nested primitives demonstrating real-world usage (e.g. `<Container><Stack><Row>...</Row><Row>...</Row></Stack></Container>`).

`<name>.doc.mdx` is a short overview: when to use this primitive vs siblings, prop reference, and a "how this maps to the Hierarchical Tree spec" cross-reference.

---

## Acceptance criteria

The plan is done when:

1. All seven components live in `packages/ui/src/components/layout/` with the canonical 5-file layout (component, test, story, doc, barrel).
2. The `packages/ui/src/components/index.ts` barrel re-exports the new layout barrel.
3. `pnpm typecheck` passes 8/8.
4. `pnpm --filter @genuin/ui test` passes (both Jest and Vitest harnesses).
5. Storybook builds clean: `pnpm --filter @genuin/ui storybook` shows all seven primitives under a "Layout" category with stories.
6. [HIERARCHICAL_TREE_SPEC.md §7](../../hierarchical/HIERARCHICAL_TREE_SPEC.md#7-open-items) is updated to mark the gap closed and link to the new components.
7. No existing call sites are modified (migration is intentionally out of scope — that's a separate adoption effort).

---

## Decisions

All five originally open questions have been resolved.

- **DS token name normalization** → **lowercase short form** (`xxs` / `xs` / `sm` / `md` / `ml` / `lg` / `xl` / `xxl`) on the prop API. Figma-original CamelCase names (`paddingXXS`/…/`paddingXXL`) live as JSDoc cross-references in `tokens.ts` so contributors can trace back to the Figma source.
- **Spacing vs size scales** → spacing tops at 40 px (`paddingXXL`), size tops at 48 px (`sizeXXL`). `DsSpace` is the 9-token set `none | xxs | xs | sm | md | ml | lg | xl | xxl`. The size scale's 48 px value is documented as out-of-scope for layout primitives in the token reference section.
- **`Stack` direction prop** → **no horizontal variant.** `Stack` stays vertical-only to preserve its "ergonomic shortcut" purpose. Horizontal stacking uses `Row` with `gap`.
- **`Container.maxW` token names** → ship the breakpoint-aligned names (`mobile` / `tablet-sm` / `tablet` / `desktop` / `desktop-wide` / `full`) since they map 1:1 to the Hierarchical Tree breakpoint set. If a content-focused semantic alias set (e.g. `narrow`/`wide`) is needed later, it can be added as additional values without removing the breakpoint names.
- **PR scope** → **one PR for all seven primitives.** They're tiny, share a single `tokens.ts` source of truth, and form a single conceptual set; splitting adds review overhead without reducing risk.

---

## Recommended approach

Build all seven primitives in one focused 1–2 day session as outlined in the implementation plan table. Lock conventions with `Stack` first, then propagate the pattern to the rest. Single PR review; flag the shared-package change in the PR description for approval.

After landing, the **adoption** of these primitives (migrating existing inline-Tailwind layout patterns to use them) is a separate, gradual effort — not a precondition. The Hierarchical Tree generator can target them as soon as they exist; existing code stays untouched.
