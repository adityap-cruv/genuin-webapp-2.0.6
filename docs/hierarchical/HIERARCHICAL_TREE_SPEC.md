# Hierarchical Tree — Layout Generation Specification

Generative page-layout system. The output of the system is a **page tree** — UI components composing the structure, Slots holding placements (content / video / linkout). Build-time / authoring system: the generator emits committed artifacts that get reviewed and published before users see them.

## Table of Contents

1. [Overview](#1-overview)
2. [Page Artifact](#2-page-artifact)
3. [Slots](#3-slots)
4. [UI Nodes](#4-ui-nodes)
5. [Slot-Filling Priority](#5-slot-filling-priority)
6. [Reference Prototypes](#6-reference-prototypes)
7. [Open Items](#7-open-items)
8. [Appendix A — Building Blocks Glossary](#appendix-a--building-blocks-glossary)
9. [Appendix B — Migration Notes (current `/grid` divergence)](#appendix-b--migration-notes-current-grid-divergence)

---

## 1. Overview

### Purpose

Produce pages whose primary content is generated text / markdown, surrounded by player embeds and linkouts, assembled from `@genuin/ui` primitives. The authoritative visual targets live in Figma (see §6); `/websitev5` and `/grid` are legacy prototype implementations based on outdated assumptions and conventions — informative reference, not fidelity benchmarks.

### Generator stages (three stages, layout and content separate)

1. **Layout generation (this document's scope)** — input: user prompt + optional page-type hint + target breakpoints. Output: a `Page` artifact with one `LayoutTree` per breakpoint. Describes *what blocks go where* — no actual content data inside any block. Build-time.
2. **Content generation (out of scope here)** — AI / CMS / editorial pipeline produces actual Content block text for each `content` Slot. May happen before publishing, may be deferred.
3. **Runtime fill (out of scope here)** — the SDK fills `video` / `linkout` Slots, decides whether each Content block has data to render, and trims absent blocks (along with their context-dependent neighbours).

### Inputs to the layout generator

1. **User intent / prompt** — natural-language statement of page purpose. Drives kind selection, slot counts, layout density.
2. **Page-type hint** (optional) — genre signal: "article", "video landing page", "topic hub", "product page", etc. Helps pick layout archetypes.
3. **Target breakpoints** — which `minWidth` thresholds to emit trees for (canonical 5 by default; subsetting allowed).

The layout generator does **not** consume actual Content text, video / linkout availability, content-pool data, or topic-match scores — all runtime concerns.

### Build-time, not runtime

The runtime tree walker is a pure consumer of static `Page` data. It does not generate or mutate layouts in the browser. No runtime AI inference, no client-side generation latency, no streaming layout shapes. A `Page` artifact is a regular committed source file — versioned, diffable, reviewable in PRs. Schema validation runs at build time (CI step).

### Host shell is out of scope; in-page navigation is not

Whatever **mounts** the tree root — a Next.js page file, an embedding iframe, a Storybook decorator, or any other host — is outside the system's contract. Host-level chrome that wraps the mount point (company logo, global top nav with search / login / account, global side nav with home / popular / latest, site footer), routing, auth, and data fetching are all the host app's concern. The system makes no assumptions about what surrounds the mounted tree, and the generator never emits any of it.

**In-page navigation is different.** Navigation that's *content of the page itself* — a topic-hub's category sidebar, an article's section table-of-contents, breadcrumbs derived from the page's subject, a product page's spec-row jumplinks, related-topic pills — is generated content like anything else. If a prompt calls for it ("build a topic hub with a category sidebar", "build an article with a section TOC"), the generator emits it as a UI composite within the tree (see §4), and it varies per prompt because it's *about this page's subject*. It is **not** Slot content — there is no `nav` Slot kind; navigation composites take their links from the same `props` channel as any other UI node (or, where the links are derived from sibling Slots, from a small composite that knows how to read them).

The line: chrome **outside** the mount point belongs to the host and is always the same; navigation **inside** the tree belongs to the generator and varies with the prompt.

---

## 2. Page Artifact

### 2.1 Page shape

```ts
interface Page {
  /** Stable id for the page (URL, slug, etc.). */
  id: string;
  /** One tree per breakpoint, sorted ascending by `minWidth`. */
  breakpoints: LayoutTree[];
}
```

The generator emits at minimum the mobile (`minWidth: 0`) and desktop (`minWidth: 1280`) trees. Intermediate breakpoints (748, 1024, 1512) are optional — if absent, the next-smaller tree is picked.

### 2.2 LayoutTree shape

```ts
interface LayoutTree {
  /** Stable id for cache keys / dev-tools. */
  id: string;
  /** Container width at which this tree activates (registry key). */
  minWidth: number;
  /** Root node of the tree — typically a UI node. */
  root: LayoutNode;
}
```

### 2.3 LayoutNode shape

The Layout is a serialisable tree. Each node is either a UI component (primitive or composite) or a Slot leaf.

```ts
type LayoutNode = UiNode | SlotNode;

interface UiNode {
  /** Discriminator. */
  type: 'ui';
  /** Registry key resolving to a `@genuin/ui` primitive or a composite. */
  uiVariant: string;
  /** Stable name for tooling and diffs. */
  name: string;
  /** Props forwarded verbatim to the resolved component. The component
   *  owns its own layout — flex, CSS grid, etc. — using these props. */
  props?: Record<string, unknown>;
  /** Child nodes — UI or Slot. The component decides how / where to
   *  render them (typically `props.children`). */
  children?: LayoutNode[];
}

interface SlotNode {
  /** Discriminator. */
  type: 'slot';
  /** Selects the renderer from the SlotKind registry. */
  kind: SlotKind;
  /** Stable name (traces to Figma, used for analytics / dev-tools). */
  name: string;
  /** SDK display style — kind-agnostic field, per-kind allow-list.
   *  Defaults per kind: "feed" for video, "single" for content and linkout. */
  style?: 'single' | 'grid' | 'carousel' | 'feed';
  /** Sub-cell counts passed to the SDK when style is "grid" or "carousel".
   *  Lay out content inside the single placement instance — they do NOT
   *  spawn additional React component instances. */
  cols?: number;
  rows?: number;
  /** Sticky-during-scroll. SDK kinds may honor as PiP overlay or CSS sticky;
   *  non-SDK kinds get plain position: sticky. */
  sticky?: boolean;
  /** Optional density hint. 'compact' renders smaller cards/cells
   *  (half-height linkouts; v1 for video). 'default' or omitted =
   *  full-size. Effective on linkout (v0) and video (v1) slots only —
   *  has no effect on content slots (validator emits a warning). */
  density?: 'compact' | 'default';
  /** Optional semantic height. Closed enum mapped to a fixed pixel
   *  ladder in the renderer (`xs` 180 / `compact` 300 / `sm` 420 /
   *  `default` 500 / `lg` 600 / `hero` 700 / `screen` 100vh).
   *  Effective on `video` and `linkout` slots; `content` ignores it. */
  size?: 'xs' | 'compact' | 'sm' | 'default' | 'lg' | 'hero' | 'screen';
  /** Optional aspect ratio. Closed enum (`reel` 9/16, `square` 1/1,
   *  `video` 16/9, `portrait` 3/4, `landscape` 4/3, `banner` 21/9).
   *  Effective on `video` and `linkout` slots; ignored on `content`
   *  (validator emits `ASPECT_NO_EFFECT`). On `video`, `aspect` drives
   *  the rendered geometry and `size` becomes a max-height cap. */
  aspect?: 'reel' | 'square' | 'video' | 'portrait' | 'landscape' | 'banner';
  /** Optional minimum height. Closed enum mapped to inline `minHeight`
   *  (`none` 0 / `sm` 180 / `md` 300 / `lg` 420 / `hero` 600). Effective
   *  on all slot kinds. Reserves space so the slot wrapper doesn't
   *  collapse while SDK/data load is in flight. */
  minHeight?: 'none' | 'sm' | 'md' | 'lg' | 'hero';
  /** Props forwarded to the kind's renderer (feedKey, links, body, etc.).
   *  Build-time-resolved; not a runtime adapter. */
  props?: Record<string, unknown>;
}
```

### 2.4 Tree depth and shape

The tree is **variable-depth**. Simple pages may be two levels (one root UI component wrapping Slots); complex pages like `/websitev5` go deeper. Depth is determined by how the generator assembles UI components.

**Example tree (sketch resembling the legacy `/websitev5` layout — illustrative only, not a fidelity target)**:

```
<PageContainer>                                    ← UI primitive (flex column)
├── <PageHeader>                                   ← UI composite
│   ├── <BackButton />                             ← UI primitive
│   ├── <TitleBlock />                             ← UI composite
│   └── <MetaPanel />                              ← UI composite
├── <SplitView tracks="746px 320px">               ← UI primitive (CSS grid, two named tracks)
│   ├── Slot { kind: 'video', style: 'carousel' } ← Slot leaf
│   └── <LinkoutStack>                             ← UI composite
│       ├── Slot { kind: 'linkout' }              ← Slot leaf
│       └── Slot { kind: 'linkout' }              ← Slot leaf
└── <Grid cols={3}>                                ← UI primitive (CSS grid, 3 × 1fr)
    ├── Slot { kind: 'video', style: 'feed' }     ← Slot leaf
    ├── Slot { kind: 'video', style: 'feed' }     ← Slot leaf
    └── Slot { kind: 'video', style: 'feed' }     ← Slot leaf
```

For a `/grid`-style page, the entire tree may be a single CSS-Grid UI composite wrapping all the Slots; for a `/websitev5`-style page, the trunk is a flex column of nested rows. Both are valid trees.

### 2.5 Tree rules

- The trunk and branches are UI components. Slots are leaves. UI nodes may contain UI nodes and/or Slots; Slots may not contain Slots.
- UI nodes have NO global grid-placement props (`col` / `row` / `colSpan` / `rowSpan`). Positioning is internal to each UI component.
- A UI component that wants a CSS Grid for its children embeds that logic in its own JSX (taking tracks / gutters as its own props).
- Slot positioning is whatever the UI parent provides. Slots declare `kind` / `style` / `cols` / `rows` / `sticky` / `props` only.
- `name` is non-routing metadata. Used by analytics, dev-tools, Figma cross-references — not by the renderer.

### 2.6 Rendering rules

- The runtime walks `LayoutTree.root` recursively. UI nodes resolve to a registered React component (primitive or composite) and render their `children` inside. Slot nodes resolve to a `SlotKind`-keyed renderer.
- A Slot renders **exactly one** component instance, regardless of `style`. The instance receives `style`, `cols`, `rows`, and resolved `props`.
- `sticky: true` on a Slot keeps it visible during page scroll. For `content`, the renderer applies `position: sticky; top: 0`; for SDK-rendered kinds the SDK chooses the mechanism (PiP overlay, CSS sticky, context-dependent).
- `style: "grid"` requires `cols` and `rows`; `style: "carousel"` requires `cols`. The validator must reject otherwise.

### 2.7 Responsive reflow — whole-tree swap

The generator emits **N independent trees**, one per breakpoint. Crossing a breakpoint swaps the entire active `LayoutTree`. Three commitments:

1. **Container-driven, not viewport-driven.** The runtime measures its own host width via `ResizeObserver`. It does NOT read `window.matchMedia`. A page embedded in a 400 px sidebar renders the 0-bucket tree regardless of viewport.
2. **Sparse, generator-emitted registry.** Each breakpoint is a **complete** `LayoutTree` — not a transform of a base tree. Selection picks the entry with the largest `minWidth` ≤ host width. No interpolation. Each tree may have a completely different shape — different UI composites, different depth, different slot count.
3. **Global swap, atomic re-render.** Crossing a breakpoint replaces the entire `LayoutTree` in one render. Slot identity is NOT preserved across breakpoints; cross-breakpoint state must be coordinated via stable Slot-level `name`, not by tree position.

Whole-tree swap is preferred over composite-internal reflow because a page's structure can vary radically across breakpoints (mobile = flex column of Slots; desktop = 3-column CSS grid; ultra-wide = sidebar added). These are different *tree shapes*, not different parameters of one shape.

### 2.8 Canonical breakpoint set

| `minWidth` | Notes |
|---|---|
| 0 | Mobile / narrow embed |
| 748 | Small tablet |
| 1024 | Large tablet / small desktop |
| 1280 | Desktop (canonical Figma frame) |
| 1512 | Wide desktop |

Hosts may override the breakpoint pick with `forcedWidth` (testing / Storybook) and `defaultWidth` (SSR / first render). Custom thresholds beyond the canonical 5 are out of scope for v1, but the data shape doesn't preclude them — the picker is "largest `minWidth` ≤ host width", so any sorted list works.

**Single-breakpoint degenerate case**: a page that only renders at one viewport (like fixed-desktop `/websitev5`) emits a `breakpoints` array of length 1, typically `{ minWidth: 0, tree: ... }`. The picker still works; the page just never reflows.

---

## 3. Slots

### 3.1 SlotKind

`SlotKind` is a closed discriminated union:

```ts
type SlotKind =
  | 'content'   // Generated text/markdown (or static) — the page's primary content
  | 'video'     // Web SDK player embed; may render a companion linkout at SDK's discretion
  | 'linkout';  // Standalone linkout, NOT paired with a video
```

**What's NOT a SlotKind**:

- **`ui`** — UI components form the structural trunk of the tree as `LayoutNode`s with `type: 'ui'`. They are never a Slot.
- **`ad`** — the SDK may serve an ad inside any `video` / `linkout` placement at runtime. Layout authors never declare an ad Slot.
- **`linkout-outside`** — the "outside linkout" is the video player's **companion linkout**, rendered below the player frame at the SDK's discretion. Never exists without its host video; the inside-overlay variant is the same companion rendered on top of the player instead of below. Both are part of the `video` kind's rendering, not separate Slots.

### 3.2 Per-kind contract

Decorators (`style`, `cols`, `rows`, `sticky`) are **kind-agnostic** — same field, same meaning, regardless of kind. The renderer mounts **one** placement instance and forwards the decorators to it; the SDK / component decides what the resulting layout looks like.

| Kind | Renderer | Allowed `style` values | Slot-prop type |
|---|---|---|---|
| `content` | `<Content />` (single block, markdown rendered with a constrained allowlist — see §4.3 page-level vs body-internal rule) | `single` | `{ body, ... }` (markdown string) |
| `video` | Web SDK player; may render companion linkout (inside-overlay or outside-below) at SDK's discretion | `feed`, `grid`, `carousel` (default `feed`) | `{ feedKey, scenario, linkData, ... }` |
| `linkout` | `<DynamicLinkouts view="responsive">` | `single`, `grid`, `carousel` | `{ links, ctaText, ctaLink, richData, ... }` |

`sticky` applies to all kinds — independent of `style`.

The default `style` is per-kind: `feed` for `video` (the SDK has no separate single-video placement — a single video is just a `feed` of one), `single` for `content` and `linkout`.

### 3.3 Decorator semantics

- `style: 'grid'` + `cols` / `rows` → placement renders content as a grid internally (video tile grid, linkout card grid). **One** component instance, not N.
- `style: 'carousel'` + `cols` → horizontal-scroll carousel of `cols` content items inside one placement.
- `style: 'feed'` → vertical-scroll feed (video kind only). Single-video placements use this style too — the SDK has no separate single-video mode.
- `style: 'single'` → one content item inside the placement. Default for `content` and `linkout`. **Not valid for `video`**.
- `sticky: true` → Slot stays visible during page scroll. SDK-rendered kinds may honor as PiP overlay or CSS sticky; `content` gets plain `position: sticky`.
- `density: 'compact' | 'default'` → semantic intent (a hint, not a pixel size). `'compact'` renders the cards/cells with reduced chrome — smaller thumbs, tighter padding, less meta — to fit dense surfaces. Use it on supplementary linkouts in tight contexts: SplitView right rails, dense thumbnail strips, tertiary linkouts that shouldn't dominate the parent layout. Effective on `linkout` (v0) and `video` (v1) slots only; `content` ignores it (the validator emits a `DENSITY_NO_EFFECT` warning if set on a content slot). Default when omitted is `'default'`.
- `size: 'xs' | 'compact' | 'sm' | 'default' | 'lg' | 'hero' | 'screen'` → closed semantic height ladder. The renderer maps each token to a fixed pixel cap (`xs` 180 / `compact` 300 / `sm` 420 / `default` 500 / `lg` 600 / `hero` 700) or `100vh` for `screen`. On `video` slots the renderer sets `height` (matching how publisher hosts mount the SDK with an exact container height); on `linkout` slots the renderer sets `maxHeight` so over-authored cards scroll vertically. `content` ignores `size` (markdown bodies size themselves). Omitted ≡ no cap (back-compat with v0).
- `aspect: 'reel' | 'square' | 'video' | 'portrait' | 'landscape' | 'banner'` → closed semantic aspect ratio (9/16, 1/1, 16/9, 3/4, 4/3, 21/9). Maps to inline `aspect-ratio` on the slot's outer wrapper. Effective on `video` and `linkout` slots; `content` slots ignore it (validator emits `ASPECT_NO_EFFECT`). On `video`, `aspect` drives the rendered geometry — when both `aspect` and `size` are set, `size` becomes a max-height cap on top of the aspect-driven height. Use `'reel'` for portrait phone video, `'banner'` for hero strip layouts, `'square'` for symmetric grids.
- `minHeight: 'none' | 'sm' | 'md' | 'lg' | 'hero'` → closed semantic minimum-height floor (0, 180, 300, 420, 600 px). Maps to inline `min-height` on the slot's outer wrapper. Effective on all slot kinds. Prevents the wrapper from collapsing when the SDK/data is still loading or `resolveSlotProps` returns an empty payload — pair it with `sticky` slots and hero rails so the surrounding layout stays stable across runtime fill outcomes.

### 3.4 Runtime-only behaviour (not declared at layout time)

- **Companion linkout**: a `video` Slot may render a companion linkout — either an inside-overlay (on top of the player frame) or an outside-below (flush under the player frame). The SDK decides which, when, and whether at all. The layout author writes one `video` Slot and allocates enough row height for the worst case; no separate Slot or adjacency rule exists.
- **Ad fallback**: the SDK may render an ad in a `video` or `linkout` placement at runtime. Out of scope for this document.

### 3.5 Slot typing

Slots are typed by `kind`. Each kind maps to **exactly one** canonical renderer via a closed registry. Polymorphism is opt-in only through documented seams.

**Canonical renderer registry**:

```ts
const slotRenderers: Record<SlotKind, SlotRenderer> = {
  'content': renderContent,
  'video':   renderVideo,
  'linkout': renderLinkout,
};

type SlotRenderer = (args: {
  slot: SlotNode;       // includes style, cols, rows, sticky, props
  props: ResolvedSlotProps;
}) => ReactNode;
```

UI nodes use a separate `uiRenderers` registry (§4.2) — they are not Slots and don't share the `SlotRenderer` contract.

**One Slot = one component instance.** The renderer returns one React element. Visual multiplication (video tiles, linkout cards) is the placement's internal concern, parameterised by `style` / `cols` / `rows`.

### 3.6 Polymorphism seams

Two deliberate seams let the host customize *what content* and *which UI peers* the closed renderer set consumes, without expanding the kind list. These are the ONLY sanctioned escape hatches.

Video element coordination (single-active-video, shared `<PlaybackCoordinator>`, etc.) is **not** a seam — the Web SDK is a page-wide singleton and manages that internally across every video placement on the page.

1. **`resolveSlotProps: (slot, kind) => ResolvedSlotProps`** — host-supplied per-slot prop adapter.
   - **What it solves**: Different Slots of the same kind need different content (two `video` Slots from different feeds; three `linkout` Slots with different link sets).
   - **How it works**: The runtime calls this for every Slot before rendering. Host returns a typed props bundle matching the per-kind slot-prop type. The renderer is unaware that the host did anything special.
   - **What it cannot do**: change the renderer kind, mount additional components, or react to runtime state outside the Slot's identity.

2. **`uiRenderers: Record<string, UiRenderer>`** — registry keyed by `uiVariant` for `type: 'ui'` nodes.
   - **What it solves**: UI nodes reference a primitive or composite by string key. The universe is open-ended.
   - **How it works**: Host registers `{ "page-container": PageContainer, "row": Row, "meta-panel": MetaPanel, ... }`. The runtime walks each `type: 'ui'` node, looks up `uiVariant`, renders the component with `props` and recursively renders `children`.
   - **What it cannot do**: produce a Slot.

**Why two seams, not one generic "render anything" prop**: each seam answers a specific question — *what content* for a fixed Slot renderer (`resolveSlotProps`), *which UI component* for tree nodes (`uiRenderers`). A single generic prop would invite hosts to bypass the closed renderer set, making the layout grammar undecidable for the AI generator.

### 3.7 What is NOT allowed

- A Slot may not switch its rendered block type based on data at runtime. If two kinds are needed at the same position, model them as two slots.
- Hosts may not override the renderer for a kind via a prop. The renderer registry is closed for v1.
- A Slot may not be missing a `kind`. The substring-name inference in the current `/grid` implementation is deprecated (see Appendix B).
- A renderer may not mount more than one placement instance per Slot.

---

## 4. UI Nodes

UI nodes are the structural trunk of the page tree. They own their internal layout; Slots are leaves embedded in them.

### 4.1 What UI nodes are (and are not)

- **They own their own layout.** Positioning of children (flex, CSS grid, css modules, absolute) is the component's internal concern. The system imposes no grid coordinates.
- **No `col` / `row` / `colSpan` / `rowSpan` fields.** A UI component that wants a CSS-grid layout for its children embeds that in its own JSX/props (e.g. `<Row gridCols="746px 320px">`).
- **No `kind` field.** `SlotKind` is a Slot concept. UI nodes use `type: 'ui'` at the `LayoutNode` level as their discriminator and stop there. There is no "UI kind" sub-discrimination beyond the `uiVariant` string.
- **No `style` field.** UI nodes are not placements and don't multiply content. They render once, exactly as authored.
- **No SDK behaviour.** No companion linkout, no playback coordination, no breakpoint-aware content negotiation, no `resolveSlotProps`. The Web SDK never sees them. (Breakpoint behaviour is at the tree level — see §2.7.)
- **No content sourcing seam.** `props` on a UI node are emitted verbatim by the generator. If the same component needs different content on different pages, the generator emits different `props` per page.

#### Dimension decorators on wrapper primitives

Three primitives — `surface`, `stack`, `container` — accept the closed `minHeight` and `height` props for reserving vertical space at the UI level. The values are the same closed enums Slots use:

- `minHeight: 'none' | 'sm' | 'md' | 'lg' | 'hero' | 'screen'` → 0 / 180 / 300 / 420 / 600 / 100vh px floor.
- `height: 'auto' | 'sm' | 'md' | 'lg' | 'hero' | 'screen' | 'full-bleed'` → `'auto'` (default) is content-driven; `'sm'`–`'hero'` impose a fixed pixel height (180 / 300 / 420 / 600); `'screen'` is 100vh; `'full-bleed'` is 100vh AND, on `container` only, cancels the parent's max-width inset so the block reaches the viewport edges. On `surface` and `stack`, `'full-bleed'` is an alias for `'screen'`.

All other UI variants (`row`, `column`, `grid`, `split-view`, `cluster`, and the static-page atoms / interactive atoms) ignore both props — they are pure layout glue or content atoms, and dimensions belong to their children or their nearest wrapper. The validator emits a `DIMENSION_NO_EFFECT` warning when `minHeight`/`height` is set on any other variant. Raw pixel literals, `style: { height: '500px' }`, and arbitrary Tailwind `h-[…]` / `min-h-[…]` utilities are all forbidden (see the Hard rules below).

### 4.2 Primitives vs composites

**Primitives** come from `@genuin/ui` (`packages/ui`) — atoms of the design system. They fall into three categories:

| Category | Examples (in `@genuin/ui`) | May the generator emit it? |
|---|---|---|
| **Layout primitives** — structural scaffolding | `row`, `column`, `stack`, `grid`, `container`, `cluster`, `split-view` | **Yes.** These are the trunks and branches that arrange every page. |
| **Static-page atoms** — typography and small content elements that vary per prompt but don't depend on runtime data | `button`, `avatar`, `chip`, `image`, `decorative-list`, `heading` (Display + Headline tiers, 20–100px), `text` (Body tier, 8–16px), `divider` (horizontal/vertical rule), `link` (inline anchor), `icon` (lucide-backed iconography) | **Yes.** These let the generator emit Back buttons, category chips, page titles, paragraphs, inline links, icons, section separators, etc. — the small atoms that make a page feel like a page, not just scaffolding wrapping Slots. |
| **Authored-structure interactive atoms** — content authored by the generator, with bounded runtime state (open/closed/active) the user toggles | `accordion`, `tabs`, `collapsible` | **Yes.** Items / panels / labels are authored by the generator; the user only triggers built-in micro-state (expand/collapse, switch tab). Used in FAQ sections, product spec drill-downs, multi-section content, "read more" patterns. |
| **Runtime / interaction primitives** — open in response to user action, render runtime data states, or capture user input | `dialog`, `popover`, `tooltip`, `sheet`, `dynamic-sheet`, `hover-card`, `command`, `loader`, `skeleton`, `toaster`, `table`, form controls (`input`, `select`, `checkbox`, `radio-input`, `textarea`, `switch`, `slider`, `phone-input`, `input-otp`, `label`, `form`) | **No.** Not emitted directly. They're either host wiring (modals, toasts), interaction surfaces that require state the generator doesn't own (forms), or runtime-state UIs (loaders, skeletons). If they're needed in a generated page, they appear via a curated composite that the host registers in `uiRenderers`. |

**Composites** are assembled from primitives — page-section wrappers, header bands, metadata panels, linkout stacks, single-CSS-grid layouts. The generator may either reference a shared composite from a curated library, or emit a new composite per page when the layout calls for a one-off arrangement.

The `uiRenderers` registry holds both primitives and composites. The runtime treats them identically — a `uiVariant` string resolves to a component, and that component renders.

None of the composite names are part of the spec; the spec only knows there's a `uiVariant` string that resolves to *some* component in the registry. The layout / static-page-atom / runtime split above is the spec's guidance to the generator about *which* `@genuin/ui` exports are fair game — not a runtime distinction.

### 4.3 When to use a UI node vs a Slot

- Structural layout, page chrome, anything that doesn't change with topic / feed (headers, dividers, navigation, metadata panels, rows / columns / grids that arrange children) → **UI node**.
- Anything that should be picked / sized / styled by the slot-filling system based on inputs (video, linkout, generated content) → **Slot**.

#### Page-level structural elements vs body-internal content

When deciding where to put a heading, image, or other element that *could* go either in the page tree or inside a `content` Slot's body, apply this split:

- **Page-level structural elements** (the page title, byline, dateline, tag chips, share/save/comment buttons, related-linkouts grid, dividers between body and related-links, section dividers between major content blocks) → **UI nodes in the tree**. These could stand alone as separate sections the AI generator might omit, relocate, or replicate.
- **Body-internal content** (paragraphs, emphasis, inline links, lists, blockquotes, mid-article H2/H3 subheads, inline figures with captions) → **part of the `content` Slot's markdown `body`**. These are inseparable from the flow of the prose.

**Rule of thumb**: if removing the element would break the *flow* of the article prose, it's body content. If it could stand alone as a separate section that the AI generator might omit or relocate, it's a UI node.

Concretely: the page's main H1 is a `heading` UI node positioned above the first `content` Slot; H2/H3 subsection headings inside the article body live inside the `content` Slot's markdown. An inline figure illustrating a paragraph lives in the `content` Slot's markdown; a hero image at the top of the page is an `image` UI node above the first `content` Slot.

### 4.4 Color, theming, and per-publisher branding

Color is **not authored into the `Page` artifact**. The artifact is theme-agnostic — the same artifact embedded under one publisher's brand renders with different visual colors than the same artifact embedded under another publisher's brand, with no change to the artifact itself.

Color flows through three layers:

1. **Primitive defaults via design-system tokens.** Most primitives (`Heading`, `Text`, layout primitives) render with the inherited color from the surrounding context — they have no color prop. The design system in `packages/tailwind-config/shared-styles.css` defines the token palette (`--gencl-primary`, `--gencl-secondary-*`, `--gencl-red-*`, etc.) consumed via the `gencl:` Tailwind prefix.
2. **Closed tone / variant prop enums on specific atoms.** Where a primitive accepts color intent — `Button.theme`, `Chip.variant`, `Link.tone`, `Icon.tone`, `Divider.tone` — the value is a member of a small closed enum (e.g. `default | subtle | inverted`). The generator picks from the enum; it does not specify a literal color.
3. **Host-supplied CSS variable overrides.** Per-publisher branding (iHeart red, McClatchy red, US Weekly purple, etc.) is applied by the host at the React root via a CSS class (or equivalent) that overrides `--gencl-primary` / `--gencl-secondary-*` / etc. The walker, the primitives, and the `Page` artifact are all untouched — they keep emitting `gencl:bg-primary-600` and the CSS layer resolves it to the active theme's color.

**Forbidden in the artifact** (the validator must reject):

- Raw hex / RGB / HSL color values anywhere in `props` (`{ style: { color: '#FF0000' } }` is invalid).
- Arbitrary Tailwind color utilities (`className: 'text-[#FF0000]'`, `bg-red-500`).
- `style` props with color-related fields (color, background, border-color, etc.).

The generator's vocabulary for "color intent" is the tone/variant prop enums on each primitive, and nothing else. If the agent emits an unknown tone value, the primitive's CVA / lookup map falls back to its default — but the validator should still flag it.

Dark mode is wired at the design system level (`@custom-variant dark`) and is also a host concern — adding `class="dark"` on a wrapper above `<PageRenderer>` toggles dark variants. The artifact does not specify light/dark mode.

See [docs/plans/hierarchical/HIERARCHICAL_THEME_PROVIDER_PLAN.md](../plans/hierarchical/HIERARCHICAL_THEME_PROVIDER_PLAN.md) for the implementation plan that surfaces theming as a typed `<ThemeProvider>` component.

### 4.5 Closed dimension enums only

Hard rule: **the artifact never specifies raw pixel / vh / `style` values for dimensions.** The closed dimension vocabulary is:

- Slot decorators — `size`, `aspect`, `minHeight` (§3.3).
- UI props — `minHeight`, `height` on `surface` / `stack` / `container` (§4.1).
- Width remains the parent layout primitive's job — `grid.cols`, `split-view.tracks`, `container.maxW`. There is no slot-level or UI-level `width` prop, and there will not be one; explicit width on a child would invert the layout-primitive ownership model.

The validator rejects (Zod-level) any value outside the published enums. It additionally warns (`DIMENSION_NO_EFFECT` / `ASPECT_NO_EFFECT`) when a closed decorator is set on a variant that ignores it. Raw `style: { height, minHeight, maxHeight, aspectRatio, width }`, arbitrary Tailwind `h-[…]` / `min-h-[…]` / `aspect-[…]` / `w-[…]` utilities, and any other CSS escape hatch for dimensions are forbidden in artifact `props`.

---

## 5. Slot-Filling Priority

Given a generated wireframe, decides what goes in each Slot.

### 5.1 Prerequisite chain (Phase 1)

Placement priority is two-phase: a fixed prerequisite chain, then a footprint-driven interleave. Phase 1 is placed in this order, no exceptions:

1. **`content`** — always first. At least one **anchor Content block** is required; it defines the page's purpose. Additional `content` Slots are allowed for media-publisher use cases (article intros, multi-section bodies, supplementary text panels) where the page is naturally broken into multiple content regions, often with ads or other Slots interleaved. **Validator-enforced minimum: every tree MUST contain ≥ 1 `content` Slot (`MISSING_CONTENT_SLOT`).**
2. **`video` with `style: 'feed'`** — the "anchor" video that grounds the page. Compact, often `sticky: true`, high engagement. Because Phase 1 is a fixed prerequisite chain with *no exceptions*, the anchor feed video is **required in every tree** — independent of whether any `linkout` is present. **Validator-enforced minimum: every tree MUST contain ≥ 1 `video` Slot with `style: 'feed'` (`MISSING_ANCHOR_VIDEO`).** Additionally, when a `linkout` is present, the anchor feed video MUST appear before it in visual reading order (`LINKOUT_BEFORE_FEED_VIDEO`) — linkouts without a video to attach to don't make sense.

### 5.2 Fold-driven interleave (Phase 2)

Once Phase 1 is satisfied, the remaining Slots are placed by fold position: high-confidence personalized blocks above the fold, denser exploration blocks below. In practice this orders Phase 2 Slots by footprint — small single tiles surface the personalized picks near the anchor, while carousels and grids surface breadth lower down.

| Slot | Footprint | Fold position | Notes |
|---|---|---|---|
| `linkout` style `single` | smallest | above-fold, alongside anchor | M-size linkout card, no multi-cell expansion; high-confidence personalization tile |
| `linkout` style `carousel` | medium | transition / below-fold | horizontal-scroll N cards |
| `video` style `carousel` | medium-large | transition / below-fold | horizontal-scroll N videos |
| `linkout` style `grid` | large | below-fold | M × N card grid; exploration density |
| `video` style `grid` | largest | below-fold | M × N video wall; exploration density |

A `linkout style: 'single'` can appear *above* a `video style: 'carousel'` because above-fold real estate is reserved for high-confidence personalization (small tiles), even though `video` is "more important" in kind priority. **Fold position wins inside Phase 2.**

### 5.3 Fold rule (above-fold anchor + personalize, below-fold densify for exploration)

The top of every page is the **high-confidence zone**: the layout commits the majority of the above-fold viewport to a signature anchor (Phase 1 `feed` video, often `sticky`) plus a small number of personalized tiles curated by the same signals. Few items, large, high-intent.

As the user scrolls past the anchor, confidence in any single recommendation drops, so the layout switches to **denser display styles** — carousels and grids — to surface breadth over depth. Many items, smaller per tile, low-commitment.

In practice:

- `content` and the anchor `feed` video → top of the tree (anchor `feed` often `sticky`). Above-fold anchor.
- Small `linkout` (style `single`) → near top, alongside the anchor. Above-fold personalization.
- `linkout` style `carousel` and `video` style `carousel` → mid-page. Transition zone.
- `linkout` style `grid` and `video` style `grid` → near the bottom of the tree. Below-fold exploration.

### 5.4 Picking the player `style` for a `video` Slot

Driven by available slot footprint and the priority order:

- **Tall, narrow slot, single column at the top** → `feed` (one video at a time, often `sticky`).
- **Wide horizontal strip, ≤ ½ page height** → `carousel` (2–4 tiles scrolling sideways).
- **Wide rectangular region, > ½ page height** → `grid` (3 × N or similar tile wall).

The generator picks `feed` first when in doubt — highest-engagement, smallest-footprint option that satisfies the video role.

### 5.5 Standalone `linkout` Slot vs video companion

The `video` Slot's SDK-rendered companion linkout (inside-overlay or outside-below — both at SDK discretion) handles most "linkout next to video" needs at runtime. The generator places a separate `linkout` Slot only when one of these holds:

- **No `video` Slot in the same tree region** — content-only mobile layouts or pages where the linkout isn't tied to a specific video.
- **Layout needs guaranteed linkout real estate** — the companion is optional; a standalone Slot forces a linkout to appear regardless.
- **Multiple linkouts needed in one region** — a video can have at most one companion; a stack / grid / carousel of multiple distinct linkouts requires a `linkout` Slot.
- **Linkout is topically distinct from the adjacent video** — companion linkouts inherit the video's topic context.

**Default rule**: if a `video` Slot is the obvious owner, let the companion handle it. Only place a `linkout` Slot when one of the above bullets fires.

### 5.6 Slot count bounds per breakpoint

Bounds are **two-sided**. The `Min` column marked **(enforced)** is a hard floor — the validator emits an **error** below it. Upper bounds are empirical (derived from the `/grid` prototype) and emit a **warning**, not an error, when exceeded — but going over is a smell.

| Kind | Min per breakpoint | Max per breakpoint | Notes |
|---|---|---|---|
| `content` | **1 (enforced — `MISSING_CONTENT_SLOT`)** | N (no fixed cap) | At least one anchor block. Media-publisher pages commonly carry 2–4 Content blocks. The first / canonical block is the anchor; the rest are supplementary. |
| `video` | **1 (enforced — `MISSING_ANCHOR_VIDEO`)** — must be a `style: 'feed'` anchor | ~4 | Phase 1 requires the anchor `feed` in **every** tree (independent of linkouts). Desktop breakpoints stabilize at 3 anchor videos (1 carousel + 1 feed-with-sticky + 1 grid); art-directed landing / article pages may carry a 4th for a secondary right-rail or below-fold placement. Validator caps all bands at 4 — over that is a smell (each video placement is heavy SDK chrome and competes with the others for engagement). |
| `linkout` | 0 (no hard floor) | ~14 | Min depends on layout density (Phase 1 must be satisfied first). A `linkout` requires an anchor `feed` video before it (`LINKOUT_BEFORE_FEED_VIDEO`). Desktop breakpoints carry 10–13 linkouts, dominated by `style: 'grid'`. Mobile carries 8 singles + 5 grids ≈ 13. |

> **Enforced minimums (errors):** `content` ≥ 1 per tree, and `video` ≥ 1 with `style: 'feed'` per tree. The `linkout` floor is 0 (no minimum), but any linkout requires a preceding feed video. All maxima are warnings, not errors.

**Density heuristic — content density scales with horizontal real estate, and the dominant placement style follows the breakpoint's input model**:

- Mobile (≤ 748 px): assumes **swipe + tap**. Stack a few videos vertically (4–6) — anchor video as `style: 'feed'` (swipeable, often `sticky`); few linkouts (≤ 13); 1–2 Content blocks. Reading-flow dominant.
- Desktop (≥ 1024 px): assumes **hover + click**. Converge on 3 anchor videos (`carousel` + `feed`/sticky + `grid`) and lean heavily on `linkout` grids (8–11) to fill horizontal space. Grid and carousel placements reward pointer affordances.
- Wider desktop (≥ 1512 px): same input model as desktop. Linkout count plateaus; videos stay at 3; Content count may grow if the article has more sections.

Width determines how much fits at each breakpoint; gesture determines what placement *shape* fits — which is why mobile favours `feed` (one swipe, one video) and desktop favours `grid` / `carousel` (pointer-driven scan).

### 5.7 Runtime fill (Content blocks too)

The generator emits the page tree **optimistically**: N Content blocks plus video and linkout Slots in the arrangement the design calls for, without knowing whether each block will have data at render time. At runtime the SDK decides per block whether to render based on data availability, and skips or collapses nearby blocks when their associated Content is absent (since surrounding Slots depend on Content for context).

The generator does NOT guess at section-break heuristics or publisher-supplied interleave hints. It emits the maximal sensible layout; the runtime trims.

Content selection (which videos / linkouts appear inside each placement, including ad fallback) is the SDK's runtime job. Out of scope.

---

## 6. Reference Prototypes

### Authoritative visual references (Figma)

These are the canonical visual targets. Human reviewers compare generator output against these frames; the spec's structural rules are derived from them.

| Frame | Figma link |
|---|---|
| `/websitev5` (fixed desktop) | [Genuin Website V5 — node 5240:159768](https://www.figma.com/design/P9FjWHXqrnBYoXum6NRzxm/Genuin-Website-V5?node-id=5240-159768) |
| `/grid` at 420px (mobile) | [Genuin Master Design System V2 — node 9022:124863](https://www.figma.com/design/31vZmmekJ2UDRkvvv6EUIR/Genuin-Master-Design-System-V2?node-id=9022-124863) |
| `/grid` at 748px (small tablet) | [Genuin Master Design System V2 — node 9022:124887](https://www.figma.com/design/31vZmmekJ2UDRkvvv6EUIR/Genuin-Master-Design-System-V2?node-id=9022-124887) |
| `/grid` at 1024px (tablet/desktop) | [Genuin Master Design System V2 — node 9094:82095](https://www.figma.com/design/31vZmmekJ2UDRkvvv6EUIR/Genuin-Master-Design-System-V2?node-id=9094-82095) |
| `/grid` at 1280px + 1512px (desktop, wide desktop) | [Genuin Master Design System V2 — node 9022:124911](https://www.figma.com/design/31vZmmekJ2UDRkvvv6EUIR/Genuin-Master-Design-System-V2?node-id=9022-124911) |

Agents with Figma MCP access can read these nodes directly via `get_design_context` / `get_metadata` (file keys: `P9FjWHXqrnBYoXum6NRzxm` for `/websitev5`, `31vZmmekJ2UDRkvvv6EUIR` for `/grid`).

### Legacy reference implementations (informational only)

The following React implementations exist in this repo but are **legacy and based on outdated assumptions / conventions**. Do not treat them as fidelity benchmarks; they're documented here so the spec's empirics and migration notes (Appendix B) trace back to something concrete.

- **`/hierarchical/websitev5`** — `apps/webapp` route → [packages/components/src/legacy/websitev5/websitev5.tsx](packages/components/src/legacy/websitev5/websitev5.tsx). A tree of nested rows: hero carousel embed + surrounding video Slots whose SDK-rendered companion linkouts sit flush below each player. Fixed-desktop layout (no breakpoints). Predates the spec's tree-shape contract.
- **`/hierarchical/grid`** — source: [packages/components/src/legacy/grid/grid.tsx](packages/components/src/legacy/grid/grid.tsx); template at [packages/components/src/legacy/hierarchical-grid/](packages/components/src/legacy/hierarchical-grid/). Five hand-curated trees, one per `minWidth` threshold (0, 748, 1024, 1280, 1512). Implementation uses the flat-list `Layout { colWidths, rowHeights, slots: Slot[] }` shape that this spec's tree model deprecates (see Appendix B). The empirical block counts are still load-bearing for §5.6's budget table: mobile (420) carries 20 Slots (6 video + 13 linkout + 1 content); desktop (1280) carries 18 Slots (3 video + 14 linkout + 1 content); desktop converges on 3 anchor videos (carousel + feed/sticky + grid) with heavy linkout grids.

---

## 7. Open Items

### Component inventory gap (CLOSED)

**Status**: Closed. The seven layout primitives now ship in `@genuin/ui` under
[`packages/ui/src/components/layout/`](packages/ui/src/components/layout/) —
`Row`, `Column`, `Stack`, `Grid`, `Container`, `Cluster`, `SplitView`. All
seven follow the canonical 5-file folder layout (component, test, story, doc,
barrel), share a single source-of-truth `tokens.ts` for the DS-mapped class
lookups (`GAP_CLASS`, `COL_GAP_CLASS`, `ROW_GAP_CLASS`, `PX_CLASS`,
`MAX_W_CLASS`), and expose the lowercase short-form DS spacing scale (`xxs`
… `xxl`). The `uiRenderers` registry described in §3.6 can now resolve
`uiVariant` strings like `"row"`, `"column"`, `"stack"`, `"grid"`,
`"container"`, `"cluster"`, and `"split-view"` to these primitives. The
example tree in §2.4 (referencing `<SplitView tracks="746px 320px">` and
`<Grid cols={3}>`) is now an artifact the generator can emit directly.

See [docs/plans/hierarchical/UI_LAYOUT_PRIMITIVES_PLAN.md](../plans/hierarchical/UI_LAYOUT_PRIMITIVES_PLAN.md) for the
implementation plan that landed this work.

The historical rationale for owning these primitives (rather than adopting a
third-party library) is kept below for the record.

#### Why owned primitives, not a third-party library

Neither `@genuin/ui` nor `@genuin/components` previously provided
general-purpose layout primitives:

- `@genuin/ui` is Radix-based interaction primitives (button, dialog, tabs, accordion, etc.) — no layout. (Radix Primitives ships interaction-only by design; Radix Themes ships layout primitives but is an opinionated styling system that conflicts with the existing Tailwind + CVA + `gencl:` prefix idiom.)
- `@genuin/components` only has **domain-specific templates** (`base-layout`, `hierarchical-grid`, `posts-grid`, `post-layout`) or **page shells**. No generic `Row` / `Column` / `Stack` / `Grid` / `Container`. CVA is used only for component variants, not layout recipes.
- The dominant idiom across both packages was **Tailwind-on-divs**, applied inline per call site.

The tree model expects UI nodes whose `uiVariant` resolves to layout-arranging components. Building that layout-primitive inventory was a prerequisite.

**Decision: author owned layout primitives in `@genuin/ui`** (not adopt a third-party library):

1. **Closed vocabulary for the AI generator** — owned primitives expose exactly the props the generator needs. A third-party library brings its full API; the generator may emit nonsense unless we wrap it.
2. **Dependency approval** — the repo's guardrails require explicit approval for new external dependencies. Owned primitives don't trigger that gate.
3. **No mature third-party option** — `atomic-layout` is stale, `every-layout` is a book not a package, `react-layout` is name-collision-ridden, Radix Themes is a parallel styling system.
4. **Bundle weight** — primitives mount at every breakpoint × page × nesting level. Owned ≈ 200 LOC total; library = tens of KB.
5. **Idiom fit** — `gencl:` prefix, theme tokens, CVA conventions, strict TypeScript are project standards. Owned primitives use them natively.
6. **Layout primitives are cheap** — thin Tailwind wrappers, no accessibility/ARIA complexity. Realistic cost: 1–2 focused days for 7 components plus colocated tests.

**Suggested initial inventory** (place in `@genuin/ui/src/components/layout/`):

- `Row` — flex row with `gap`, `align`, `justify`, `wrap` props.
- `Column` — flex column (semantic alias for vertical Row).
- `Stack` — vertical column with consistent gap; ergonomic over Column for simple cases.
- `Grid` — CSS Grid wrapper with `cols`, `rows`, `gap`, `colGap`, `rowGap` props.
- `Container` — max-width wrapper with `maxW` token.
- `Cluster` — wrap-friendly flex row (chips, tags, action groups).
- `SplitView` — 2-or-3-column ratio split (e.g. `746px 320px`, `1fr 1fr 1fr`).

### Runtime walker — `@genuin/hierarchical-tree`

The runtime that consumes `Page` artifacts and renders them — recursive tree traverser, registry-based dispatcher, container-width-aware shell — lives in a dedicated package **`@genuin/hierarchical-tree`** (under `packages/hierarchical-tree/`). It is the runtime counterpart to this spec, and the single source of truth for:

- The `Page` / `LayoutTree` / `LayoutNode` Zod schema (also consumed by the validator).
- The `<PageRenderer>` component (the spec's §2.6 / §2.7 rules in code form).
- The default `uiRenderers` registry mapping the 20 emittable `uiVariant` strings to their `@genuin/ui` components.
- The default `slotRenderers` for `content` / `video` / `linkout` per spec §3.5.
- Rule-check helpers for spec §2.5, §3.7, §4.1, §5.6 — reusable by the CLI validator and runtime.

A dedicated package (not `packages/components`) signals that this is infrastructure, not a UI component. See [docs/plans/hierarchical/HIERARCHICAL_TREE_RUNTIME_WALKER_PLAN.md](../plans/hierarchical/HIERARCHICAL_TREE_RUNTIME_WALKER_PLAN.md) for the implementation plan.

The package also ships a **standalone Vite dev surface** under `packages/hierarchical-tree/src/dev/` for agent iteration on emitted `Page` artifacts. The dev surface is decoupled from `apps/webapp` — the iteration loop (`pnpm --filter @genuin/hierarchical-tree dev`) never boots Next.js. Fixtures live at `src/dev/fixtures/`, are registered in `fixtures.ts`, and load via the `?fixture=<name>` query. See the [hierarchical-tree skill's "Iteration loop"](../../.team/skills/hierarchical-tree/SKILL.md#iteration-loop-dev-preview) section for the contract.

### Composite curation policy

Composites built from primitives (e.g. `PageHeader`, `MetaPanel`, `LinkoutStack`) live in `@genuin/components`. Each gets a `uiVariant` string in the renderer registry that `@genuin/hierarchical-tree` exposes.

**Policy**: composites start out **ad-hoc per page** — the generator emits a one-off composite assembled from primitives whenever a page needs a particular arrangement. Over time, as usage patterns repeat across pages, frequently-emitted composites get **promoted to shared composites** (registry-stable, curated in `@genuin/components`) and the generator switches from emitting them inline to referencing the shared `uiVariant`. Promotion is usage-driven, not designed up front.

---

## Appendix A — Building Blocks Glossary

| Block | Source | Role | Where it lives | Sizing constraints |
|---|---|---|---|---|
| **Content** | (generated text/markdown or static) | Primary page content; anchors the page's purpose. | Slot | Any size; the dominant content block. |
| **Linkout** | `@genuin/components` linkout-new (responsive scenario) | Standalone linkout, not paired with a video. | Slot | Any size. |
| **Player Embed (with optional companion linkout)** | Genuin Web SDK | Video playback widget. Renders `carousel`, `feed`, or `grid`. Videos are 9:16. May render a companion linkout (inside-overlay or outside-below) at SDK discretion — no separate "outside linkout" slot kind. | Slot | Any slot size; video aspect fixed at 9:16 inside. Slot row height must accommodate the worst case (video + companion below) when an outside companion is possible. |
| **UI Component (primitive)** | `@genuin/ui` (`packages/ui`) | Atoms grouped into four categories per §4.2: **layout primitives** (Row, Column, Stack, Grid, Container, Cluster, SplitView — structural scaffolding the generator emits freely); **static-page atoms** (Button, Avatar, Chip, Image, DecorativeList, Heading, Text, Divider, Link, Icon — small content elements the generator emits); **authored-structure interactive atoms** (Accordion, Tabs, Collapsible — emittable with authored content and runtime open/closed state); **runtime / interaction primitives** (dialog, popover, form controls, loaders, etc. — NOT emitted directly by the generator). Not a slot kind. Each primitive owns its internal layout. | Branches/leaves of the page tree | Driven by the component itself. |
| **UI Component (composite)** | Generator-emitted or curated | Assembled from primitives to capture reusable page sections (header band, meta panel, 3-column row, etc.). Generator may emit per page or reference shared ones. | Same as primitive | Same as primitive |
| **IAB Ad** | (SDK runtime) | Not a slot kind — the SDK may serve an ad inside any `video` / `linkout` placement at runtime, independently of slot dimensions. Out of scope for this document. | Inside video / linkout placements (runtime) | — |

### Brand-side vocabulary cross-reference

Product and design contexts use branded names for the Slot kinds and the video's SDK-rendered companion variants. The mapping:

| Spec term | Brand-side name |
|---|---|
| `video` Slot kind / Player Embed | **Dynamic Player** |
| `linkout` Slot kind | **Dynamic Linkout** (standalone variant) |
| Video's inside-overlay companion linkout (SDK-rendered) | Dynamic Linkout, **in-player** variant |
| Video's outside-below companion linkout (SDK-rendered) | Dynamic Linkout, **out-player** variant |

The spec uses its own terms because they're more precise about *who renders what* (SDK vs Slot, overlay vs flush-below). When talking to design or product, expect the brand-side names.

---

## Appendix B — Migration Notes (current `/grid` divergence)

The existing `/grid` prototype (`packages/components/src/legacy/hierarchical-grid/`) diverges from this spec in several ways. They are documented here as the migration backlog, not as part of the spec proper.

- **Flat-list `Layout` shape, not tree.** The current implementation uses `Layout { colWidths, rowHeights, slots: Slot[] }` — slots live in a flat array with `col` / `row` / `colSpan` / `rowSpan` placement. The spec expects a recursive `LayoutNode` tree with no global grid coordinates. Migration: the `/grid` page becomes a single UI composite (the existing `<HierarchicalGrid>` template, kept as a registry entry) wrapping all the Slots. Slots drop `col` / `row` / `colSpan` / `rowSpan` and become children of that composite.
- **Substring-name kind inference.** The current implementation has only `'video' | 'linkout' | 'ai-response'` and infers the kind from substring-matching `slot.name`. Must be replaced by an explicit `slot.kind` field, with `'ai-response'` renamed to `'content'`. The substring inference is deprecated.
- **Boolean `grid` / `carousel` decorators.** The current implementation expresses sub-layouts as boolean `grid: true` / `carousel: true` flags. Linkout grid slots today mount N `<DynamicLinkouts>` instances via a sub-grid — that's an interim. Under this spec, those become one placement with `style: "grid"` and the SDK is responsible for the internal multi-card layout. Until the SDK exposes linkout-grid as a placement style, the renderer for `linkout` with `style: "grid"` may temporarily fan out into N component instances internally — implementation detail, not part of the authored Layout.
- **`floater: true` decorator.** Current implementation; replaced by the kind-agnostic `sticky` field on `SlotNode`.
- **Existing planning doc**: [packages/components/docs/hierarchical-grid/HIERARCHICAL_GRID_PLAN.md](packages/components/docs/hierarchical-grid/HIERARCHICAL_GRID_PLAN.md) — referenced from `slot.tsx`, `slot-content.tsx`, `slot-kind.ts`, `types.ts`. Reconcile (or retire) when this spec lands.
