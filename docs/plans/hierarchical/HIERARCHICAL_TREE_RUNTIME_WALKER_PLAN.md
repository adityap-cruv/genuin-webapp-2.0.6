# Hierarchical Tree Runtime Walker — Implementation Plan

Plan for building the runtime walker called out in [HIERARCHICAL_TREE_SPEC.md §2.6](../../hierarchical/HIERARCHICAL_TREE_SPEC.md#26-rendering-rules) and §2.7. This is the function that takes a `Page` artifact and renders it as a React tree — the smoke-test page (`/hierarchical/preview` in `apps/webapp/`) cannot show generated output to human reviewers without it, so it gates chunk C of the [Hierarchical Layout Skill plan](HIERARCHICAL_LAYOUT_SKILL_PLAN.md).

---

## Goal

Build a `<PageRenderer>` component (plus the supporting Zod schema, default registries, and types) in a new dedicated package `@genuin/hierarchical-tree` that consumes a `Page` artifact, picks the active `LayoutTree` based on container width, walks the tree recursively, and renders each `UiNode` and `SlotNode` via host-supplied registries — closing the gap between an emitted `Page` artifact and a visible page that reviewers can compare against Figma frames.

---

## What I read

- `HIERARCHICAL_TREE_SPEC.md` §2.1–§2.3 (Page / LayoutTree / LayoutNode shapes), §2.5 (Tree rules), §2.6 (Rendering rules), §2.7 (Responsive reflow), §2.8 (Canonical breakpoint set), §3 (Slots — `SlotKind` registry, decorator semantics, polymorphism seams), §4 (UI Nodes — registry, primitives vs composites).
- `packages/components/src/legacy/hierarchical-grid/use-container-width.ts` — existing `useContainerWidth` hook (ResizeObserver-based, seeded with `defaultWidth`, reads `contentBoxSize.inlineSize`).
- `packages/components/src/legacy/hierarchical-grid/pick-breakpoint.ts` — existing mobile-first `pickBreakpoint` picker (largest `minWidth` ≤ host width).
- `packages/components/src/legacy/hierarchical-grid/slot.tsx`, `slot-content.tsx`, `slot-kind.ts` — existing Slot rendering for the legacy `/grid` template. **Legacy** per spec Appendix B: uses substring-name inference (`'video' | 'linkout' | 'ai-response'`) and boolean `grid` / `carousel` decorators rather than the spec's `kind` / `style` model. Useful as reference for how the existing `<DynamicLinkouts>` and Web SDK player wiring work, but **not directly reusable** — the walker uses the spec's tree model.
- `packages/components/src/legacy/grid/grid.tsx` and `packages/components/src/legacy/websitev5/websitev5.tsx` — the two legacy reference implementations. Both bake the layout in directly (no walker); they're not consumers of the new walker.
- `packages/ui/src/components/{layout,typography,divider,link,icon}/*` — the 20 emittable primitives the walker registers by default.

---

## Constraints flagged

- **New shared package** — `@genuin/hierarchical-tree` (under `packages/hierarchical-tree/`) is a new internal package. Per repo guardrails, "changes to shared packages" require approval; adding a brand-new shared package is the same gate. The package is the runtime counterpart to `HIERARCHICAL_TREE_SPEC.md` — co-locates types, Zod schema, validator, walker, default renderers, and (later) composite registry. PR description must flag the new package explicitly so reviewers know to inspect `package.json`, `tsconfig.json`, exports map, and the dependency surface.
- **Why a new package, not `packages/components`** — the walker is infrastructure (recursive tree traversal + registry dispatcher + breakpoint-aware shell), not a molecule/organism UI component. Bolting it onto `packages/components` would muddle that package's atomic-design role. A dedicated package signals "this is the spec's runtime" and gives the validator + future tooling a clean home.
- **Client component** — the walker uses `ResizeObserver` (via `useContainerWidth`), so the root `<PageRenderer>` is `'use client'`. UI nodes and Slot renderers themselves can be server-component-safe; the walker just owns the breakpoint-pick effect.
- **One new external dependency** — `react-markdown` (~12 KB gzipped), used by the default `content` Slot renderer to render the body markdown allowlist defined under "Content body markdown allowlist". Per repo guardrails, "Adding new external dependencies" requires approval — must be called out in the PR description. Everything else uses what's already in the repo: React, `zod`, `@genuin/ui`. Existing `useContainerWidth` and `pickBreakpoint` from the legacy hierarchical-grid template (`packages/components/src/legacy/hierarchical-grid/`) are duplicated into the new package for v0 — clean separation from the legacy template, consolidation deferred.
- **Cross-package imports** — `@genuin/hierarchical-tree` depends on `@genuin/ui` for primitives (the default UI registry). It does **not** depend on `@genuin/components` (no circular risk; components has business molecules that may want to import from hierarchical-tree but not vice versa).
- **No call-site adoption of the new walker for /grid or /websitev5** — those pages stay as legacy implementations (spec §6 explicitly tags them as informational, not the fidelity target). Migrating them is out of scope; the new walker only powers the smoke-test page.

---

## Public API

```ts
// packages/hierarchical-tree/src/types.ts

/** Page / LayoutTree / LayoutNode types, derived from the Zod schema
 *  in `./schema`. The schema is the source of truth for the artifact
 *  contract; types are inferred via `z.infer<typeof pageSchema>`. */
import type { Page, LayoutNode, UiNode, SlotNode, SlotKind } from './schema';

/** Maps a `uiVariant` string to a React component. Host-supplied,
 *  per spec §3.6's `uiRenderers` seam. */
export type UiRenderer = React.ComponentType<{
  props: Record<string, unknown>;
  children?: React.ReactNode;
}>;

export type UiRenderers = Record<string, UiRenderer>;

/** Maps a `SlotKind` to a slot renderer. Closed at the spec level
 *  (`content | video | linkout`); the walker ships a default registry
 *  hosts may override only for testing. */
export type SlotRenderer = (args: {
  slot: SlotNode;
  props: ResolvedSlotProps;
}) => React.ReactNode;

export type SlotRenderers = Record<SlotKind, SlotRenderer>;

/** Per spec §3.6's `resolveSlotProps` seam. Host turns the Slot's
 *  authored `props` into the renderer-ready props bundle. */
export type ResolveSlotProps = (
  slot: SlotNode,
  kind: SlotKind,
) => ResolvedSlotProps;

export interface PageRendererProps {
  /** The page artifact to render. */
  page: Page;
  /** Custom UI renderers; merged on top of the default registry. */
  uiRenderers?: UiRenderers;
  /** Custom Slot renderers; merged on top of the default registry. */
  slotRenderers?: Partial<SlotRenderers>;
  /** Host-supplied per-slot prop adapter (spec §3.6). */
  resolveSlotProps?: ResolveSlotProps;
  /** Override the container width pick — used for testing / Storybook.
   *  When set, `useContainerWidth` is bypassed and the breakpoint
   *  matching `forcedWidth` is chosen. */
  forcedWidth?: number;
  /** Seed width before ResizeObserver fires. Avoids blank first paint;
   *  matches the existing hierarchical-grid hook's `defaultWidth`. */
  defaultWidth?: number;
  /** What to render when a `uiVariant` isn't registered. Default:
   *  throw in dev, render a visible fallback chip in prod. */
  onMissingUiVariant?: 'throw' | 'fallback' | ((variant: string) => React.ReactNode);
}
```

Default exports from `packages/hierarchical-tree/src/`:

```ts
export { PageRenderer } from './page-renderer';
export { defaultUiRenderers } from './default-ui-renderers';
export { defaultSlotRenderers } from './default-slot-renderers';
export type { /* ... */ } from './types';
```

---

## Implementation plan

Ordered tasks. Each row is one focused commit-sized chunk.

| # | Step | Files |
|---|---|---|
| 0 | **Scaffold the new package** `@genuin/hierarchical-tree`. `package.json` (workspace internal, `"name": "@genuin/hierarchical-tree"`, ESM, depends on `@genuin/ui` via `workspace:*`, `react` as peer, `zod` direct), `tsconfig.json` (extends `@genuin/typescript-config/base.json`), exports map (`"."` for the runtime, possibly `"./schema"` for the Zod schema standalone), placeholder `src/index.ts`. Add to `pnpm-workspace.yaml` if needed (workspaces are usually globbed; verify). Run `pnpm install` to wire it. ~45 min. | `packages/hierarchical-tree/{package.json, tsconfig.json, src/index.ts}` + possible `pnpm-workspace.yaml` update |
| 1 | **Define types + Zod schema** mirroring spec §2.1–§2.3. `Page`, `LayoutTree`, `LayoutNode` (`UiNode` ∪ `SlotNode`), `SlotKind`. The Zod schema doubles as the validator's source-of-truth (chunk A of the skill plan can now `import { pageSchema } from '@genuin/hierarchical-tree/schema'`). | `packages/hierarchical-tree/src/{types.ts, schema.ts, schema.test.ts}` |
| 2 | **Extract `useContainerWidth` and `pickBreakpoint`** from the legacy hierarchical-grid template into the new module. Don't break the existing template — both modules can have their own copy at v0; consolidation is a follow-up. Co-locate tests. | `packages/hierarchical-tree/src/{use-container-width.ts, use-container-width.test.ts, pick-breakpoint.ts, pick-breakpoint.test.ts}` |
| 3 | **Build the recursive walker** — `renderNode(node, ctx)` function that dispatches on `node.type`. For `'ui'`: look up `uiVariant` in the registry, render with `props` and recursive children. For `'slot'`: look up `kind` in the Slot registry, call `resolveSlotProps`, render. Apply `sticky` per spec §3.3 (CSS `position: sticky; top: 0` for `content`; SDK-mediated for video/linkout via their renderers). | `packages/hierarchical-tree/src/render-node.tsx`, `render-node.test.tsx` |
| 4 | **Default Slot renderers** — implement `content` / `video` / `linkout` wrappers. `content` uses `react-markdown` with the allowlist + custom component mappings under "Content body markdown allowlist" (h2/h3 → Heading; image → Figure/Image; link → Link; paragraphs/lists/etc. → Text + native semantic tags). `video` → existing Web SDK player. `linkout` → existing `<DynamicLinkouts view="responsive">`. Add `react-markdown` to `packages/hierarchical-tree/package.json` deps (~12 KB gzipped). | `packages/hierarchical-tree/src/default-slot-renderers.tsx`, `default-slot-renderers.test.tsx`, `packages/hierarchical-tree/package.json` |
| 5 | **Default UI renderers** — map all 20 emittable `uiVariant` strings (7 layout + 10 static-page atoms + 3 authored-structure interactive atoms) to their `@genuin/ui` components. One module that imports each component and registers the string key → component mapping. | `packages/hierarchical-tree/src/default-ui-renderers.tsx`, `default-ui-renderers.test.tsx` |
| 6 | **Public `<PageRenderer>` component** — wires `useContainerWidth` + `pickBreakpoint` + `renderNode`. Marked `'use client'`. Honors `forcedWidth` / `defaultWidth` overrides for testing. Atomic re-render on breakpoint cross (spec §2.7) via `key={chosenTree.id}` on the rendered root. | `packages/hierarchical-tree/src/page-renderer.tsx`, `page-renderer.test.tsx` |
| 7 | **Storybook stories** — one story per archetype shape (small synthetic Page artifacts authored inline in the stories), plus a "forced width" story that demos atomic swap across breakpoints. | `packages/hierarchical-tree/src/page-renderer.stories.tsx` |
| 8 | **Component docs** — short doc-mdx covering when to use the walker, the host-extension seams, fallback behaviour, and SSR considerations. | `packages/hierarchical-tree/src/page-renderer.doc.mdx` |
| 9 | **Package barrel** — `packages/hierarchical-tree/src/index.ts` re-exports `PageRenderer`, `defaultUiRenderers`, `defaultSlotRenderers`, and the public types. Optionally a separate `schema` export entry (configured in `package.json` exports map) so consumers can pull just the Zod schema without the React surface — useful for the CLI validator in `scripts/`. | `packages/hierarchical-tree/src/index.ts` (+ exports map adjustments in `package.json`) |
| 10 | **Verification** — `pnpm typecheck` passes (9/9 with the new package); `pnpm --filter @genuin/hierarchical-tree test` passes the new suites. | (verification) |

Estimated total effort: **1.5–2 focused days**.

---

## Implementation notes

### Walker structure

```tsx
// render-node.tsx (sketch — not production code)
interface RenderContext {
  uiRenderers: UiRenderers;
  slotRenderers: SlotRenderers;
  resolveSlotProps?: ResolveSlotProps;
  onMissingUiVariant: NonNullable<PageRendererProps['onMissingUiVariant']>;
}

function renderNode(node: LayoutNode, ctx: RenderContext): React.ReactNode {
  if (node.type === 'slot') {
    const renderer = ctx.slotRenderers[node.kind];
    // Validator should have caught this; defensive at runtime too.
    if (!renderer) throw new Error(`No slot renderer for kind '${node.kind}'`);
    const resolvedProps = ctx.resolveSlotProps?.(node, node.kind) ?? node.props ?? {};
    const element = renderer({ slot: node, props: resolvedProps });
    return node.sticky && node.kind === 'content'
      ? <div className="gencl:sticky gencl:top-0" key={node.name}>{element}</div>
      : element;
  }
  // node.type === 'ui'
  const Component = ctx.uiRenderers[node.uiVariant];
  if (!Component) {
    return handleMissingUiVariant(node.uiVariant, ctx.onMissingUiVariant);
  }
  const children = node.children?.map((child, i) =>
    <React.Fragment key={child.type === 'slot' ? child.name : `${child.uiVariant}-${i}`}>
      {renderNode(child, ctx)}
    </React.Fragment>
  );
  return <Component props={node.props ?? {}}>{children}</Component>;
}
```

Key invariants enforced by the walker (matching spec §2.5 and §3.7):

- A `SlotNode` always has `kind` set; missing-kind is a defensive runtime error. The Zod validator should catch this before runtime, but the walker re-checks because runtime drift is cheap to guard against.
- A `UiNode` with missing `uiVariant` in the registry goes through `onMissingUiVariant`. Default is `throw` in dev, `fallback` (visible chip with the missing key) in prod.
- `style: 'grid'` requires `cols` + `rows`; `style: 'carousel'` requires `cols`. The Slot renderer validates and falls through to the default `feed`/`single` if invalid (defensive — validator catches this earlier).
- Keys: UI children keyed by `uiVariant + index`; Slot children keyed by `name` (spec §2.5: `name` is stable cross-breakpoint metadata).

### Breakpoint reflow — atomic swap

Per spec §2.7, crossing a breakpoint replaces the entire `LayoutTree` in one render — no in-place reconciliation. The walker enforces this by keying the rendered root on the active tree's `id`:

```tsx
// page-renderer.tsx (sketch)
'use client';

export function PageRenderer({ page, forcedWidth, defaultWidth = 0, ...rest }: PageRendererProps) {
  const { ref, width } = useContainerWidth<HTMLDivElement>(defaultWidth);
  const effectiveWidth = forcedWidth ?? width;
  const chosen = pickBreakpoint(effectiveWidth, page.breakpoints);
  return (
    <div ref={ref} data-page-id={page.id} data-active-breakpoint={chosen.minWidth}>
      {/* Keying on tree id forces a fresh subtree on breakpoint cross. */}
      <React.Fragment key={chosen.id}>
        {renderNode(chosen.root, /* ctx from rest */)}
      </React.Fragment>
    </div>
  );
}
```

The container `<div>` is the host's measured element (spec §2.7 commitment 1: container-driven). The walker explicitly does NOT read `window.matchMedia`; testing this is part of the Storybook "forced width" story.

### Slot renderers — what each does at v0

- **`content`** — renders the Content block. Takes `{ body: string }` (markdown) in `resolvedProps`. Rendered via `react-markdown` with a constrained allowlist + custom component mappings to the Genuin design-system primitives — see the "Content body markdown allowlist" table below. Wrapped in `<div className="…sticky…">` when `sticky: true`.
- **`video`** — renders the existing Web SDK player embed. Forwards `style` / `cols` / `rows` / `sticky` to the SDK. Companion linkout (in-player overlay or out-player below) is the SDK's runtime decision per spec §3.4; the renderer just allocates the slot.
- **`linkout`** — renders `<DynamicLinkouts view="responsive">` from existing `@genuin/components`. Standalone variant only — companion linkouts come through the `video` Slot's SDK rendering, not here.

The default Slot renderers are intentionally thin — the heavy lifting lives in the existing Web SDK and `<DynamicLinkouts>` components. The walker just wires them into the tree.

### `resolveSlotProps` for v0

For the smoke-test page, host supplies a static map from Slot `name` → resolved props (synthetic data in `apps/webapp/src/content/page-artifacts/sample-data/`). Production wiring (real feeds, real linkouts) comes after v0 ships; the seam is the same.

### Default UI renderer registry

20 entries, one per emittable primitive. Generated by a single `default-ui-renderers.tsx` module that imports each component and maps the canonical `uiVariant` string to it. The host can extend (`uiRenderers={{ ...defaultUiRenderers, 'page-header': PageHeader }}`) when registering composites; can't override primitive entries (closed at the registry level).

Suggested mapping (matches the locked manifest in `HIERARCHICAL_LAYOUT_SKILL_PLAN.md`):

| `uiVariant` key | Component |
|---|---|
| `row`, `column`, `stack`, `grid`, `container`, `cluster`, `split-view` | Layout primitives from `@genuin/ui/components/layout/` |
| `heading`, `text` | Typography primitives from `@genuin/ui/components/typography/` |
| `button`, `avatar`, `chip`, `image`, `decorative-list` | Existing `@genuin/ui` static-page atoms |
| `divider`, `link`, `icon` | New atoms (commit `c564f2704`) |
| `accordion`, `tabs`, `collapsible` | Existing `@genuin/ui` authored-structure interactive atoms |

### Testing plan

For each module, the test file covers:

**`renderNode`** (the walker core):
1. UI-only tree — renders nested UI nodes with `props` forwarded.
2. Slot-only tree — Slot renderer called once, receives `style` / `cols` / `rows` / `sticky` / `props`.
3. Mixed tree — UI wraps Slots; Slot leaves render.
4. Missing `uiVariant` — throws in dev (`onMissingUiVariant: 'throw'`); renders fallback chip in prod.
5. Missing Slot `kind` (defensive) — throws; the validator should catch this earlier.
6. `sticky: true` on a `content` Slot — wraps in `gencl:sticky gencl:top-0`.
7. Key stability — Slot `name` becomes the React key; UI nodes get a deterministic key from `uiVariant + index`.

**`<PageRenderer>`** (integration):
1. Single-breakpoint page renders correctly.
2. Multi-breakpoint page picks the right `LayoutTree` based on container width (test using `forcedWidth`).
3. Atomic swap on breakpoint cross — assert the rendered subtree's key changes; assert no DOM nodes are reused across the swap.
4. `defaultWidth` seeds the first render — no flash of incorrect content.
5. `forcedWidth` bypasses the ResizeObserver entirely.

**`pickBreakpoint`** (already battle-tested in the legacy hierarchical-grid template):
- Mobile-first picker: largest `minWidth` ≤ host width.
- Width below all `minWidth` thresholds → falls back to the smallest (typically `minWidth: 0`).
- Equal `minWidth` entries → first wins (spec doesn't specify, but the legacy implementation picks the last; carry forward existing behaviour).

**`useContainerWidth`**:
- ResizeObserver fires → state updates.
- Initial render uses `defaultWidth`.
- Reads `contentBoxSize.inlineSize`; falls back to `contentRect.width` (Safari pre-15.4 case).
- Cleanup disconnects the observer on unmount.

Tests use Vitest + `@testing-library/react` (the existing convention in `@genuin/components`).

---

## Decisions

### Locked

- **Package placement** — new dedicated package `@genuin/hierarchical-tree`. The walker is infrastructure (recursive tree traversal + registry dispatcher + breakpoint-aware shell), not a UI atom or molecule, so it doesn't fit `packages/ui` or `packages/components`. A dedicated package gives the spec's runtime — walker, Zod schema, validator, default registries, and future composite curation — a clean home and signals "this is the spec's runtime" to anyone reading the repo. Cross-app + web-sdk consumable via `workspace:*`.
- **Default registries shipped** — `defaultUiRenderers` (20 entries) and `defaultSlotRenderers` (content/video/linkout) are exported alongside `<PageRenderer>`. Hosts can override; sane defaults for the common case.
- **Client component** — root `<PageRenderer>` is `'use client'` because of `useContainerWidth`. Slot renderers and UI renderers stay server-component-friendly where possible.
- **Atomic breakpoint swap via `key`** — keying on the active tree's `id` is the v0 mechanism. Hits spec §2.7 commitment 3 "Global swap, atomic re-render".
- **Missing `uiVariant` default** — `throw` in dev, `fallback` in prod. The `fallback` renders a visible chip with the missing key so production drift is loud but non-fatal.
- **No migration of `/grid` and `/websitev5`** — those stay as legacy implementations per spec §6.
- **Content body format** — markdown rendered via `react-markdown` with a constrained allowlist + custom component mappings (see "Content body markdown allowlist" subsection below). H1 stays a page-level UI node; H2/H3 subheads and inline figures are allowed body-internal markdown. No HTML passthrough, no component embeds (`react-markdown` doesn't permit them by default; we don't enable that).
- **`useContainerWidth` + `pickBreakpoint` source** — **duplicate** the two hooks from `packages/components/src/legacy/hierarchical-grid/` into `@genuin/hierarchical-tree` for v0. Each file is ~30 lines; duplication is the cheapest correct option. Other paths considered and rejected: importing across packages would invert the layering (the runtime depending on `@genuin/components`); extracting to a shared `@genuin/utils/breakpoint` is a fine v1 consolidation but adds refactor scope to v0.
- **Zod schema location** — the schema lives in `@genuin/hierarchical-tree/src/schema.ts` and is the single source of truth for the `Page` artifact contract. The CLI validator script (`scripts/validate-page-artifact.mjs` per the skill plan) imports `pageSchema` from `@genuin/hierarchical-tree/schema` and uses it to validate.
- **Web SDK initialisation** — host-provided. The walker does NOT wrap pages in `<SDKProvider>` or any playback-coordinator. The host (e.g. `apps/webapp`'s `(site)` layout or the `/hierarchical/preview` route file) wraps once at the root with `<SDKProvider initialConfig={…}>`; the `video` Slot renderer assumes an SDK context exists and uses `useSDK()` / mounts embed elements as descendants. The legacy `<PlaybackCoordinator>` from `packages/components/src/legacy/{grid,websitev5}/` is not needed — per spec §3.6, the Web SDK is a page-wide singleton and manages single-active-video coordination internally. Pattern reference: `packages/web-sdk/examples/react-basic/App.tsx`.

#### Content body markdown allowlist

The `content` Slot's `body` is a markdown string. The walker renders it via `react-markdown` with the following table — custom component mappings route standard markdown nodes to Genuin's design-system primitives so body content uses the same typography / link / image components as the rest of the page tree.

| Markdown construct | Allowed? | Rendered as |
|---|---|---|
| Paragraph (`text`) | ✅ | `<Text size="body-0">` |
| Emphasis (`*em*`) | ✅ | `<em>` inline |
| Strong (`**strong**`) | ✅ | `<strong>` inline |
| Inline code (`` `code` ``) | ✅ | `<code>` styled minimally |
| Link (`[label](href)`) | ✅ | `<Link>` (Genuin primitive); external-link affordance when href is non-relative |
| Unordered list (`-`/`*`) | ✅ | `<ul>` with `<Text>` items |
| Ordered list (`1.`) | ✅ | `<ol>` with `<Text>` items |
| Blockquote (`>`) | ✅ | Styled `<blockquote>` wrapping `<Text>` |
| Hard break | ✅ | `<br>` |
| H2 subhead (`##`) | ✅ | `<Heading level="headline-3" as="h2">` |
| H3 subhead (`###`) | ✅ | `<Heading level="headline-4" as="h3">` |
| Image (`![alt](src "caption")`) | ✅ | `<Figure>` wrapping `<Image>` + optional `<Text size="body-2">` caption (title attribute is the caption) |
| H1 | ❌ | Page-level only — use a `heading` UI node in the tree |
| H4–H6 | ❌ for v0 | Articles rarely need deeper hierarchy; re-enable if publisher content demands it |
| Code block (`` ``` ``) | ❌ for v0 | Re-enable if a publisher use case needs it |
| Table | ❌ | Composite job (a future `table` `uiVariant`) |
| HTML passthrough | ❌ | Security — `react-markdown` does NOT enable `rehype-raw`; the validator should reject body strings containing raw HTML if it can detect them, but the renderer is the final gate |
| Component embeds / MDX | ❌ | Use the page tree — see spec §4.3 |

**The rule of thumb** for what belongs in the body vs in the tree:

- If removing the element would break the *flow of the prose*, it's body content → goes in the `content` Slot's markdown.
- If the element could stand alone as a separate page section that the AI generator might omit or relocate (page title, share buttons, related-linkouts grid, divider between body and related-links), it's a UI node → goes in the tree.

The spec §4.3 captures this rule.

**External dependency**: `react-markdown` (~12 KB gzipped). Per repo guardrails, "Adding new external dependencies" requires approval — flag in the PR description. `remark-gfm` (strikethrough, task lists, autolinks, additional table support) is optional and skipped for v0.

### Recommendations to confirm at chunk start

None — all previously-recommended items are now locked above. Outstanding non-blocking items live in "Open questions" below.

---

## Open questions

None remaining. The four items that lived here previously (composite handling, Web SDK initialisation, SSR behaviour, walker performance) were all either resolved into the Locked decisions above or shown to be non-concerns. The resolutions are summarised in the Locked section:

- **Composite handling** — resolved as `onMissingUiVariant: 'throw'` in dev / `'fallback'` in prod (already locked under "Missing `uiVariant` default").
- **Web SDK initialisation** — resolved by the host-provides-SDKProvider pattern (newly locked below).
- **SSR behaviour** — non-concern: initial consumers are publishers with mobile-first traffic; `defaultWidth: 0` (mobile-first) is the natural seed and matches the dominant breakpoint. No per-host tuning needed for v0.
- **Walker performance** — non-concern at v0: a `Page` artifact is static, `<PageRenderer>` re-renders only on mount + resize + breakpoint cross (handful of executions per page lifetime), and React Compiler auto-memoises subtrees. If profiling ever shows a hotspot, memoise `renderNode` results keyed on `(node, resolvedProps)` in a later pass — but premature in v0.

---

## Acceptance criteria

v0 is done when:

1. `packages/hierarchical-tree/` exists as a new internal workspace package with `package.json`, `tsconfig.json`, exports map, and the file layout above (10 source files + tests + Storybook + doc).
2. `<PageRenderer>` renders a 1-breakpoint synthetic Page artifact (validator-pass shape) without errors.
3. `<PageRenderer>` swaps the active `LayoutTree` atomically across breakpoint thresholds (Storybook "forced width" story passes).
4. Default `uiRenderers` covers all 20 emittable primitives; default `slotRenderers` covers `content` / `video` / `linkout`.
5. `pnpm typecheck` passes (now 9/9 with the new package).
6. `pnpm --filter @genuin/hierarchical-tree test` passes the new suites.
7. `packages/hierarchical-tree/src/index.ts` exports `PageRenderer`, default registries, and public types. Optional `./schema` subpath export exposes the Zod schema standalone.
8. The smoke-test page in `apps/webapp/` (e.g. `/hierarchical/preview`) can import `<PageRenderer>` from `@genuin/hierarchical-tree` and render a synthetic Page artifact (sample data from `apps/webapp/src/content/page-artifacts/sample-data/`).
9. The skill plan's chunk A validator (`scripts/validate-page-artifact.mjs`) can import `pageSchema` from `@genuin/hierarchical-tree/schema` — the package is the single source of truth for the Page artifact contract.

v1 (productionised) adds:

1. Real markdown rendering inside the `content` Slot.
2. SSR-aware `defaultWidth` selection.
3. Composite curation (host registers `<PageHeader>`, `<MetaPanel>`, `<LinkoutStack>` etc. in `uiRenderers`).
4. Performance optimisations (memoised walker, if profiling demands).
5. Migration of `/grid` or `/websitev5` to consume `<PageRenderer>` — optional, only if the legacy implementations need to be retired.

---

## Recommended approach

Build the walker in three focused chunks:

1. **Chunk 0: scaffold the package** (~45 min) — `package.json`, `tsconfig.json`, exports map, placeholder `src/index.ts`. Lands as its own commit so the package shows up cleanly in the diff and reviewers can sanity-check the dependency surface before any real code goes in.
2. **Chunk 1: walker core** (~1 day) — types + Zod schema, `pickBreakpoint` + `useContainerWidth` duplicated into the new package, `renderNode` recursive function, default UI registry mapping the 20 primitives. End state: the walker can render any synthetic Page artifact in unit tests, but not yet wired to the smoke-test page. **This is also where chunk A of the skill plan's validator finds its schema** — once `pageSchema` is exported, `scripts/validate-page-artifact.mjs` can be written against it.
3. **Chunk 2: integration + slot renderers** (~0.5–1 day) — `<PageRenderer>` public component, default Slot renderers for `content`/`video`/`linkout`, Storybook stories, doc-mdx, smoke-test page integration in `apps/webapp/`. End state: a synthetic Page artifact renders end-to-end in the browser.

This sequencing means chunks 0 and 1 can land standalone (no `apps/webapp/` changes); the smoke-test integration in chunk 2 stacks on a known-good walker + schema. All three chunks ship as one PR for review, but reviewable commit-by-commit.

The walker is the visible-output gate for chunk C of the Hierarchical Layout Skill plan — without it, reviewers compare JSON against Figma frames, which kills the review loop. Land this before chunk C starts. The validator (skill plan chunk A) becomes a thin wrapper around this package's schema, so the two efforts are naturally coupled.

Total effort: ~2 focused days.
