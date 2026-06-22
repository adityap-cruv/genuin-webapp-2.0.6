---
name: hierarchical-tree
description: Generate a typed Page TypeScript artifact for the Hierarchical Layout System from a prompt + pageTypeHint + breakpoints; use whenever asked to produce a Page artifact (article/recap/topic-hub/gallery/section/landing, brand/advertiser/sponsorship/generative destination). Do NOT use for routing/auth/data-fetching code, generic React components, or UI primitives.
mandatory: true
---

# Hierarchical Tree — Page Artifact Generator

**When to use:** Activate whenever you are asked to produce a `Page` artifact for the Hierarchical Layout System. Typical triggers:

- "Build a topic hub for `<celebrity / show / team>`."
- "Build a recap page for last night's `<event>`."
- "Generate an article page for `<headline>`."
- "Build a landing page for `<product / industry / campaign>`."
- "Generate a destination page for `<advertiser brand>`."
- Any prompt mentioning brand marketing site, conversion destination, sponsorship activation, or generative destination.
- "Produce a Page artifact for `<archetype>` × `<breakpoints>`."
- Any prompt arriving with a `pageTypeHint` in `{ article | recap | topic-hub | gallery | section | landing }` and a `breakpoints` array.

**Do NOT use for:** routing / auth / data-fetching code, generic React components, or UI primitives. The skill emits *one* artifact: a single `.ts` module that exports a `page: Page` (or, in the failure case, an `error` object). Nothing else.

You are generating a **`Page` TypeScript artifact** for the Hierarchical Layout System. The artifact is a static, committed source file that the runtime walker (`@genuin/hierarchical-tree`) consumes to render a complete page. Your output is read by a validator and a human reviewer; nothing in the agent runtime fixes it for you, so it must be **schema-valid, rule-valid, and visually plausible on the first pass** (you get up to 3 retries to converge before emitting an error). This skill is the full contract — every rule, type, and budget you need is inline below.

---

## Iteration loop (dev preview)

The QA loop for emitted artifacts is the **standalone Vite dev surface** that ships inside `@genuin/hierarchical-tree`. The webapp is **not** part of the loop — do not boot Next.js to preview a `Page`.

- Start the dev server: `pnpm --filter @genuin/hierarchical-tree dev` (Vite picks a port; default `5173`).
- Drop your artifact at `packages/hierarchical-tree/src/dev/fixtures/<name>.ts` exporting a `Fixture` of shape `{ page: Page, slotData: Record<string, Record<string, unknown>> }` (the `Fixture` type lives in `src/dev/fixtures/types.ts`).
- Register it in `packages/hierarchical-tree/src/dev/fixtures/fixtures.ts` by adding it to the `FIXTURES` object literal — no barrel re-exports.
- Load it: `http://localhost:5173/?fixture=<name>`. The dev shell wraps your fixture in `<ThemeProvider theme="iheart">` so a publisher theme is visibly applied.

## Verifying the artifact

Two surfaces enforce the Hard rules — they are equivalent:

- **CLI**: `pnpm --filter @genuin/hierarchical-tree validate packages/hierarchical-tree/src/dev/fixtures/<name>.ts` runs schema + rule checks. Exit 0 = clean (or warnings only); exit 1 = rule violations listed as `<path>: <CODE> — <message>`; exit 2 = the artifact failed to import.
- **Dev shell**: the same validator runs on every loaded fixture. Errors render as a red fixed-position panel at the top of the page (`data-testid="hierarchical-validation-errors"`); warnings render as an amber panel. The page still renders below so you can visually QA schema-passing fixtures with rule violations.

Error codes (`BAD_UI_VARIANT`, `LINKOUT_BEFORE_FEED_VIDEO`, `MISSING_CONTENT_SLOT`, `MARKDOWN_DISALLOWED_NODE`, etc.) map 1:1 to the numbered Hard rules below — self-correct against this skill when one fires.

---

## Inputs contract

You receive a single object:

```ts
interface SkillInput {
  /** Natural-language description of the page. */
  prompt: string;

  /**
   * Locked enum hint. Free-string fallback for anything outside the enum.
   * If absent, infer the archetype from `prompt`.
   */
  pageTypeHint?: 'article' | 'recap' | 'topic-hub' | 'gallery' | 'section' | 'landing' | string;

  /**
   * Which `minWidth` thresholds to emit trees for.
   *   Canonical: [0, 748, 1024, 1280, 1512]
   *   Minimum:   [0, 1280]
   * The smallest entry must always be 0.
   */
  breakpoints: number[];
}
```

You may also call the Figma MCP tools (`mcp__plugin_figma_figma__get_design_context`, `get_metadata`, `get_screenshot`) for visual context (file keys + node IDs in the Figma references section). Treat those frames as **legacy visual anchors**, not fidelity targets.

---

## Output schema (literal)

The output is a **single TypeScript module** exporting `page` as a typed constant. Lift these types verbatim — they are the contract.

```ts
/** Closed enum. Cannot emit any other kind. */
type SlotKind = 'content' | 'video' | 'linkout';

/** Closed enum. Per-kind allowed values are enforced by the validator. */
type SlotStyle = 'single' | 'feed' | 'grid' | 'carousel';

interface SlotNode {
  /** Discriminator. Always 'slot'. */
  type: 'slot';
  /** Stable, kebab-case name. Unique within the tree; the same Slot at
   *  different breakpoints should share the same `name` so resolved
   *  props wire across breakpoints. */
  name: string;
  /** Required. Closed enum. */
  kind: SlotKind;
  /** Defaults: 'feed' for video, 'single' for content + linkout. */
  style?: SlotStyle;
  /** Required when style === 'grid' or style === 'carousel'. */
  cols?: number;
  /** Required when style === 'grid'. */
  rows?: number;
  /** Pin the slot to the top of the viewport while content scrolls. */
  sticky?: boolean;
  /** Optional density hint. 'compact' renders smaller cards/cells
   *  (half-height linkouts; v1 for video). 'default' or omitted =
   *  full-size. Effective on linkout (v0) and video (v1) slots only —
   *  has no effect on content slots (validator emits a warning). */
  density?: 'compact' | 'default';
  /** Optional semantic height hint. Maps to a closed max-height scale
   *  in the renderer: 'xs' ≤180 / 'compact' ≤300 / 'sm' ≤420 / 'default'
   *  ≤500 / 'lg' ≤600 / 'hero' ≤700 / 'screen' 100vh. Effective on
   *  video and linkout slots; content slots ignore it (markdown bodies
   *  size themselves). When `aspect` is also set on a video slot,
   *  aspect drives the geometry and `size` becomes a max-height cap on
   *  top. Production hosts can read this and pass it to SDK init
   *  configs. Omitted ≡ no cap (back-compat with v0). */
  size?: 'xs' | 'compact' | 'sm' | 'default' | 'lg' | 'hero' | 'screen';
  /** Optional aspect ratio. Closed enum (reel 9/16, square 1/1,
   *  video 16/9, portrait 3/4, landscape 4/3, banner 21/9). Maps to
   *  inline `aspect-ratio` on the slot's outer wrapper. Effective on
   *  video and linkout; ignored on content (validator emits
   *  ASPECT_NO_EFFECT). On video, aspect drives the rendered geometry. */
  aspect?: 'reel' | 'square' | 'video' | 'portrait' | 'landscape' | 'banner';
  /** Optional minimum height. Closed enum mapped to inline `min-height`
   *  (none 0 / sm 180 / md 300 / lg 420 / hero 600). Effective on all
   *  kinds. Reserves space so the slot wrapper doesn't collapse while
   *  SDK/data load is in flight or the resolver returns nothing. */
  minHeight?: 'none' | 'sm' | 'md' | 'lg' | 'hero';
  /**
   * Optional. Authored hints for the resolver — opaque to the walker.
   * In the dev preview, `slot.props` is **ignored** in favour of
   * `slotData[slot.name]`; production hosts may merge. Do not rely on
   * `slot.props` to carry data the renderer needs.
   */
  props?: Record<string, unknown>;
}

interface UiNode {
  /** Discriminator. Always 'ui'. */
  type: 'ui';
  /** One of the 23 emittable strings in the closed UI vocabulary. */
  uiVariant: string;
  /** Forwarded verbatim to the resolved component. Opaque to the walker. */
  props?: Record<string, unknown>;
  /** Recursive children. */
  children?: LayoutNode[];
}

type LayoutNode = UiNode | SlotNode;

interface LayoutTree {
  /** Stable id (used as the React key for atomic breakpoint swap). */
  id: string;
  /** Mobile-first lower bound. Smallest entry must be 0. */
  minWidth: number;
  /** Root node. Always a UiNode (never a Slot at the root). */
  root: LayoutNode;
}

interface Page {
  /** Stable page id (URL slug, headline-slug, etc.). */
  id: string;
  /** Optional artifact-format version. */
  version?: string;
  /** One LayoutTree per requested breakpoint, sorted ascending by minWidth. */
  breakpoints: LayoutTree[];
}
```

### Output format

Emit a TypeScript module of this exact shape:

```ts
import type { Page } from '@genuin/hierarchical-tree';

export const page: Page = {
  id: 'recap-game-7-2026-05-19',
  breakpoints: [
    { id: 'recap-mobile', minWidth: 0, root: { /* UiNode root */ } },
    { id: 'recap-desktop', minWidth: 1280, root: { /* UiNode root */ } },
  ],
};
```

Constraints on the module:

- **Named export `page`** of type `Page`. No default exports.
- The `import type` line is required so the artifact picks up the canonical type from the runtime package. The validator imports the file via `tsx` and reads `mod.page`.
- No additional exports. The failure case (below) replaces `page` with `error`.
- No runtime code — pure data. No imports of components, no JSX, no top-level expressions that compute anything beyond a literal object.

---

## Slot data — resolved shape (what the slot renderer reads)

Slot renderers do **not** read from `slot.props`. The dev shell wires:

```ts
const resolveSlotProps: ResolveSlotProps = slot => fixture.slotData[slot.name] ?? {};
```

It returns the `slotData[slot.name]` entry verbatim and does **NOT** merge with `slot.props`. Anything you author on `slot.props` (markdown body, link cards, video element ids) is dead in the dev preview. For the dev/QA loop, treat the Slot artifact as carrying `kind`/`style`/`cols`/`rows`/`sticky`/`name` and nothing else of value.

**The agent does NOT emit this resolved data in the artifact** — the host's `resolveSlotProps` provides it at render time, keyed by `slot.name`. But the agent **must choose `name` values that downstream resolvers can wire to real data**; pick stable, kebab-case names that hint at the content (`anchor-video`, `related-grid`, `recap-body`, not `slot-1` / `video-thing`).

The three kinds each have a fixed resolved-props shape (read by `default-slot-renderers.tsx`):

### `content` Slot — resolved props shape

```ts
{
  /** Markdown body string, parsed through the allowlist (see Content body format below). */
  body: string;
}
```

### `video` Slot — resolved props shape

```ts
{
  /** SDK style id; pairs with placementId. When set, the dev shell mounts
   *  the real SDK Embed; otherwise it falls back to a poster + play-overlay. */
  styleId?: string;
  placementId?: string;          // SDK placement id, paired with styleId
  apiKey?: string;               // SDK API key (per-slot or dev-shell default)
  elementId?: string;            // defaults to `genuin-embed-${slot.name}`
  /** Aspect ratio for the placeholder; ignored when SDK mounts. Defaults to
   *  'video' (16:9). Video Slots accept fewer ratios than the `image` UI
   *  variant — no 'banner' here (ASPECT_CLASS map is the source of truth). */
  aspectRatio?: 'video' | 'reel' | 'square' | 'portrait' | 'landscape' | 'auto';
  poster?: string;               // used on the fallback (no-SDK) path
}
```

`styleId` / `placementId` / `apiKey` are **dev-shell and production wiring concerns** — the agent does not author them. When all three are present the dev shell mounts one real Genuin Web SDK embed per Slot; otherwise it renders the library default poster placeholder. The agent's job is to pick stable `slot.name` values so downstream resolvers can wire SDK config to them.

### `linkout` Slot — resolved props shape

```ts
{
  /** One card per linkout. In production, the host swaps in <DynamicLinkouts>. */
  cards: Array<{
    id: string;
    title: string;
    description?: string;
    href: string;
    imageUrl?: string;
  }>;
}
```

---

## Page archetypes

One canonical shape per `pageTypeHint`. These are **sketches**, not full artifacts. For an unknown / free-string `pageTypeHint`, infer the closest archetype from `prompt` and treat it as a starting point.

### `article`

Text-centric long-form. The **workhorse archetype** (news stories, features, opinion).

- **Mobile** — `<Container>` → `<Stack>`: `<Heading level="h3">` title; `<Text size="body-2">` byline/dateline; `<Cluster>` of `<Chip>` tags; `Slot{kind:'content', name:'article-body'}` anchor large markdown body; `<Divider/>`; `<Heading level="headline-3">` "Related"; `Slot{kind:'linkout', style:'grid', cols:2, rows:3}`.
- **Desktop** — `<Container maxW="desktop">` → `<Stack>` → `<SplitView tracks={[746,320]} gap="lg">`: Left track: title + byline + chips + article-body Slot. Right track (sticky rail): `Slot{kind:'video', style:'feed', sticky:true}` topical video + 2–3 `Slot{kind:'linkout', style:'single'}` personalization tiles. Below SplitView: `Slot{kind:'linkout', style:'grid', cols:4, rows:3}` related-grid + ~1 `Slot{kind:'video', style:'carousel', cols:4}`.

### `recap`

Event recap with **video as the engagement anchor** (game/awards/concert clips).

- **Mobile** — `<Container>` → `<Stack>`: `<Heading level="h3">` headline; `<Cluster>` chips; `Slot{kind:'video', style:'feed', sticky:true, name:'anchor-video'}`; `Slot{kind:'content', name:'recap-body'}`; `Slot{kind:'linkout', style:'single'}` × 2–3; `Slot{kind:'linkout', style:'grid', cols:2, rows:3}`.
- **Desktop** — `<Container>` → `<Stack>` → `<SplitView tracks={[746,320]} gap="lg">`: Left: anchor video Slot (carousel of recap clips) + recap content body. Right: sticky `feed` video + 2–3 single linkouts. Below: linkout grid (4×3) + video grid (3×2).

### `topic-hub`

Entity landing page — celebrity/team/show/arc/artist. Mixed-content browse; **high linkout density**, multiple video styles (feed + carousel + grid).

- **Mobile** — `<Container>` → `<Stack>`: `<Avatar size="xl">` + `<Heading>` name + `<Text size="body-2">` description; `<Cluster>` chips; `Slot{kind:'video', style:'feed', sticky:true}`; `Slot{kind:'content', name:'hub-summary'}`; `Slot{kind:'linkout', style:'single'}` × 4–5; `Slot{kind:'linkout', style:'carousel', cols:3}`; `Slot{kind:'linkout', style:'grid', cols:2, rows:4}`.
- **Desktop** — `<Container maxW="wide">` → `<Stack>` → `<SplitView tracks={[746,320]}>`: Left: entity card + anchor `feed` video + summary content + `Slot{kind:'video', style:'carousel', cols:4}`. Right: sticky video Slot + ~4 single linkouts. Below: `Slot{kind:'video', style:'grid', cols:3, rows:2}` + `Slot{kind:'linkout', style:'grid', cols:4, rows:3}`.

### `gallery`

Image-first — photo galleries, listicles, "best of". Many small Slots; visual emphasis.

- **Mobile** — `<Container>` → `<Stack>`: `<Heading level="h3">`; `Slot{kind:'content', name:'intro'}` (1–2 paragraphs); repeated `<Stack>` items each `<Image aspectRatio="landscape">` + caption `<Text size="body-2">` + occasional `Slot{kind:'video', style:'feed'}` interstitial (first video Slot is the anchor); bottom `Slot{kind:'linkout', style:'grid', cols:2, rows:3}`.
- **Desktop** — `<Container>` → `<Stack>`: page header; `Slot{kind:'content', name:'intro'}`; `Slot{kind:'video', style:'feed', sticky:true}` anchor; `<Grid cols={3} gap="md">` of `<Image>` tiles with `<Text>` captions (page tree, not a Slot); `Slot{kind:'linkout', style:'grid', cols:4, rows:3}`.

### `section`

Category/vertical landing — Politics, Sports, Music, Entertainment. Browse-by-topic with featured content + lists.

- **Mobile** — `<Container>` → `<Stack>`: `<Heading>` title + `<Cluster>` sub-category chips; `Slot{kind:'video', style:'feed', sticky:true}` featured anchor; `Slot{kind:'content', name:'section-intro'}`; `Slot{kind:'linkout', style:'single'}` × 3–5; `Slot{kind:'linkout', style:'grid', cols:2, rows:4}`.
- **Desktop** — `<Container maxW="wide">` → `<Stack>` → `<SplitView tracks={[746,320]}>`: Left: anchor video + section-intro content + `Slot{kind:'video', style:'carousel', cols:4}`. Right: sticky feed video + 3–4 single linkouts. Below: `Slot{kind:'linkout', style:'grid', cols:4, rows:3}`.

### `landing`

Brand-side / revenue-side page (Genuin marketing surfaces, advertiser destinations, sponsorship activations, AdCP generative destinations). Primary purpose is conversion (click a CTA, get a feed, see live examples), not consumption. No editorial byline/dateline; chrome is brand-driven.

- **Mobile** — `<Container>` → `<Stack>`: `<Cluster>` of breadcrumb `<Chip>` (optional); `<Heading level="h3" as="h1">` hero headline; `<Text size="body-1">` subhead; `<Cluster>` of 2 CTA `<Button>` (primary + outline/text; primary typically has a leading icon — compose via walker children per the `button` row); `Slot{kind:'video', style:'feed', sticky:true, name:'product-demo'}` (satisfies rule 13); `Slot{kind:'content', name:'landing-body'}` (1 lead paragraph + 1–2 H2 value-prop sections); `<Heading level="headline-3" as="h2">` per feature group; `Slot{kind:'linkout', style:'grid', cols:1, rows:N}` stacked feature/use-case tiles (may appear 1–2 times).
- **Desktop** — `<Container maxW="desktop">` → `<Stack>`: `<Cluster>` breadcrumb chips; `<SplitView tracks={[746,320]} gap="lg">`: Left: `<Heading headline-0 as="h1">` hero + `<Text body-0>` subhead + `<Cluster>` CTAs + `Slot{kind:'video', style:'feed', sticky:true, name:'product-demo'}` + `Slot{kind:'content', name:'landing-body'}`; Right (sticky meta panel): `<Heading headline-3>` template/feature name + `<Text body-2>` short description + `<Stack>` of `<Chip>` feature chiplets (5–8). Then `<Divider/>`; `<Heading headline-2 as="h2">` feature-section heading; `Slot{kind:'linkout', style:'grid', cols:2, rows:1}` environment tiles; `<Heading headline-2 as="h2">` "More styles to discover"; `Slot{kind:'linkout', style:'grid', cols:3, rows:1}` style discovery tiles.

**Landing-specific notes.**

- CTAs replace the editorial "Related" affordance — typically 2 primary CTAs at top + 1 secondary block at bottom.
- The `video` Slot is always a **product demo or hero loop**, not editorial content. Same SDK-embed contract applies.
- Linkouts represent **features / industries / environments / use cases**, not related articles. Cards still resolve to `{ title, description, href }`.
- The right-rail meta panel is a **template / capability summary**, not author/publish-date chrome.
- **Clickable stat / metric tiles are linkouts, not `grid`+`heading`+`text`.** If a "99+ vendors" / "$20 ARPV" tile is a clickable destination, emit it as a `linkout` Slot card (title = big number, description = label). Only use `grid` of `heading`+`text` when tiles are truly decorative (non-clickable).
- **SplitView wraps only the hero.** Put `<heading>` + `<text>` subhead + CTA cluster + anchor `video` Slot + `content` Slot inside the SplitView's left track, and the supplementary meta panel (or supplementary `linkout`) in the right track. Subsequent feature-grid Slots — stats / environments / styles / "more like this" — must live **outside** the SplitView, at the container level, so they share the same width. Two linkout Slots that should look visually parallel must be siblings in the tree, not one-inside-SplitView and one-outside.
- **Use `density: 'compact'` on right-rail linkouts.** The SplitView right rail is tight; default-density cards force the container taller than the hero. Set `density: 'compact'` so 3–5 cards fit. Full-width linkout grids below the SplitView stay at default density.

The fixture `packages/hierarchical-tree/src/dev/fixtures/figma-websitev5.ts` is the canonical landing example.

---

## Composing rules (algorithmic)

Follow these steps **in order** for each generation:

1. **Parse inputs.** Read `prompt`, `pageTypeHint`, `breakpoints`. Verify `breakpoints` is sorted ascending and contains `0`. If not, normalise it (add `0` if missing; sort).
2. **Pick the archetype.** Use `pageTypeHint` if it matches the locked enum. Otherwise infer from `prompt` — closest match in {`article`, `recap`, `topic-hub`, `gallery`, `section`}. Note the choice internally; it informs every following step.
3. **(Optional) Pull visual context** via Figma MCP if archetype shape is unclear. Use it to ground intuition for density and arrangement; do not reproduce the legacy `/grid` or `/websitev5` layouts pixel-for-pixel — they are not the fidelity target.
4. **For each requested breakpoint** (`for b of breakpoints`):
   1. Pick the canonical archetype tree shape for `(archetype, b)`.
   2. **Phase 1 (prerequisite chain)** — place the anchor `content` Slot and at least one anchor `video` Slot with `style: 'feed'`. The anchor video must appear **before** any standalone `linkout` Slot in the tree's reading order.
   3. **Phase 2 (fold-driven interleave)** — fill remaining Slots by footprint:
      - **Above the fold** (top of reading order): small `linkout style: 'single'` tiles alongside the anchor video.
      - **Transition zone** (mid-page): `linkout style: 'carousel'`, `video style: 'carousel'`.
      - **Below the fold** (bottom): `linkout style: 'grid'`, `video style: 'grid'` — densify for exploration.
      - **Apply the input-model heuristic**: mobile → `feed`-heavy + few large tiles; desktop → `grid` + `carousel` heavy.
      - **Apply `density: 'compact'` on supplementary linkouts in tight contexts** — SplitView right rails, secondary feature lists, tertiary navigation tiles. Compact cards shrink chrome (smaller thumb, no description, no CTA) so 3–5 cards fit in a narrow column. Full-width linkout grids stay at default density.
      - **Apply `size` on video / linkout slots whose visual prominence is non-default.** Default (omitted `size`) means "renderer chooses". Use `'compact'` for tight surfaces (sidebar recirculation lists, secondary ad grids, thumbnail strips; caps 300px). Use `'hero'` for above-fold full-width hero feeds (caps 700px). Use `'default'` (or omit) for standard hero carousels (caps 500px). One value per slot — no per-breakpoint override.
   4. **Apply per-breakpoint budgets.** Emit *slightly under* the upper bound — wildly over is a smell.
   5. **For each `content` Slot, craft the markdown body** conforming to the markdown allowlist. The body string does **not** live on the artifact — it belongs in resolved slot props (`slotData[slot.name].body`), supplied by the host. The anchor `content` Slot should plan for a substantive body (paragraphs + at least one H2 subhead); supplementary content Slots can be shorter.
   6. **Width-inheritance check.** For every pair of Slots that should read as visually parallel (same row-shape, same intent — e.g. three side-by-side linkout grids), confirm they are **siblings in the tree** under the same layout-primitive parent. If one lives inside a `split-view`/`grid`/`container` ancestor and its sibling-by-intent doesn't, they render at different widths. "Insert near X" is not enough — rendered width is set by the nearest layout-primitive ancestor, not source order. Adjust the tree so equal-width-by-intent Slots share a parent.
   7. **Validate the tree** against the Hard rules below before returning. If any rule fails, fix it. If after 3 attempts the rules still don't hold, emit the failure-path error object instead of a partial page.
5. **Emit the TypeScript module** with `export const page: Page = { … }` using the literal output format.

---

## Per-breakpoint budgets

Budgets are **two-sided** — a floor *and* a ceiling. The validator errors below the `content` floor, warns above any ceiling, and is silent in between. A page that only clears the hard floor (e.g. 1 video + 2 linkouts on desktop) is *valid* but **light** for this video-first product; aim to land between the recommended floor and slightly under the ceiling. Wildly over — or a bare page that just scrapes the minimum — is a smell.

### Upper bounds (ceilings — validator **warns** when exceeded)

| Breakpoint (`minWidth`) | `content` | `video` | `linkout` | Total Slots |
|---|---|---|---|---|
| 0 (mobile) | 1 | ≤ 4 | ≤ 13 | ≤ 20 |
| 748 (tablet) | 1 | ≤ 4 | ≤ 11 | ~15 |
| 1024 (large tablet) | 1–2 | ≤ 4 | ≤ 13 | ~18 |
| 1280 (desktop) | 1 | ≤ 4 | ≤ 14 | ~18 |
| 1512 (wide desktop) | 1–2 | ≤ 4 | ≤ 13 | ~17 |

### Lower bounds (floors)

| Kind | Hard floor (validator **errors** below this) | Recommended floor (engagement norm — *not* enforced) |
|---|---|---|
| `content` | **≥ 1 per tree** — `MISSING_CONTENT_SLOT` ("each tree requires at least one anchor content Slot") | 1 anchor; 2 for multi-section media pages |
| `video` | **≥ 1 `feed` anchor per tree** — `MISSING_ANCHOR_VIDEO` (required in *every* tree, independent of linkouts; Phase 1 prerequisite). Plus: when a `linkout` exists, the feed video must precede it (`LINKOUT_BEFORE_FEED_VIDEO`). | desktop **≥ 3 anchor videos** (carousel + feed-with-sticky + grid); mobile 2–4 |
| `linkout` | **0** | ≥ 2–3 so recirculation reads as a set, not a one-off |

**Machine-enforced minimums (errors):** `content` ≥ 1 per tree (`MISSING_CONTENT_SLOT`) and a `feed`-style `video` ≥ 1 per tree (`MISSING_ANCHOR_VIDEO`); plus the ordering rule that a `feed` video must precede any `linkout` (`LINKOUT_BEFORE_FEED_VIDEO`). The remaining floors (desktop ≥ 3 videos, ≥ 2–3 linkouts) are soft engagement targets — the validator won't fail a sparse page, so meeting them is on you. The `landing` archetype is the deliberate low-video exception, but it still needs its one feed anchor.

The `video` cap is **4 across every band**. Desktop pages typically converge on 3 anchor videos (carousel + feed-with-sticky + grid); art-directed landing/article pages may add a 4th for a secondary right-rail or below-fold placement. Over 4 is a smell — each video placement is heavy SDK chrome and competes for engagement.

Notes:

- Desktop breakpoints typically converge on **3 anchor videos**: one `carousel` + one `feed` (often sticky) + one `grid`. A 4th is allowed; fewer than 3 under-uses the format.
- Mobile usually stacks 2–4 videos vertically. Linkouts dominate density (8 singles + 5 grids ≈ 13).
- Multi-content (2–4) is allowed for media-publisher pages with multiple sections; rarely useful for mobile.
- The `landing` archetype is the deliberate exception to the video floor: it typically sits at the lower end of linkout count (3–8 total across 1–2 grids) and uses **~1 video Slot** (the product demo). Content Slots = 1. Total Slots well under each row's upper bound.

---

## Fold-based placement rule

- **Above the fold** = anchor + personalize. The anchor `feed` video (often `sticky: true`) commits the majority of above-fold viewport. Small `linkout style: 'single'` tiles surface high-confidence personalized picks alongside the anchor. Few items, large, high-intent.
- **Below the fold** = densify for exploration. `linkout style: 'grid'` and `video style: 'grid'` surface breadth. Many items, smaller per tile, low-commitment.
- **Transition zone** in between carries `carousel` placements.

Mechanically: small-footprint Slots go **toward the top** of reading order; large-footprint Slots go **toward the bottom**. A `linkout style: 'single'` can appear above a `video style: 'carousel'` because above-fold real estate is reserved for high-confidence personalization, even though video is "more important" in kind priority. **Fold position wins inside Phase 2.**

---

## Input-model heuristic

Gesture model varies by breakpoint, which drives placement style.

- **Mobile (≤ 748 px)** — swipe + tap. Reading-flow dominant. Signature video → `style: 'feed'`, `sticky: true`. Few linkouts (≤ 13), mostly small singles + one bulk grid at the bottom. 1–2 Content blocks. Stack vertically; rarely use `SplitView`.
- **Desktop (≥ 1024 px)** — hover + click. Pointer-driven scan. Signature videos appear as **all three styles in one page**: `carousel` (mid-page strip), `feed` with `sticky: true` (sidebar anchor), `grid` (below-fold wall). Lean heavily on `linkout style: 'grid'` (cols 3–4 × rows 3). Use `<SplitView tracks={[746, 320]}>` for main column + sidebar.
- **Wider desktop (≥ 1512 px)** — same input model. Linkout count plateaus; videos stay at 3; `content` count may grow if the article has more sections.

Width determines *how much fits*; gesture determines *what placement shape fits*.

---

## Closed UI vocabulary — 23 emittable `uiVariant` strings

Exactly **23** strings are emittable. Anything else is invalid. The walker forwards `props` verbatim, so unknown props are ignored but useless — stick to what's listed. Two primitives produce accent lines: `heading` with `decoration='ribbon'` (4 px brand bar tied to a single heading) and `accent-border` (wraps arbitrary content blocks). Two wrapper primitives apply visual decoration: `accent-border` adds a side line, `surface` adds a tinted background with rounded corners + padding. They compose.

### Layout primitives (7) — structural scaffolding

| `uiVariant` | Component | Props | When to use |
|---|---|---|---|
| `row` | `Row` | `gap?: 'none'\|'xxs'\|'xs'\|'sm'\|'md'\|'ml'\|'lg'\|'xl'\|'xxl'`; `align?: 'start'\|'center'\|'end'\|'baseline'\|'stretch'`; `justify?: 'start'\|'center'\|'end'\|'between'\|'around'\|'evenly'`; `wrap?: boolean` | Horizontal flex container. "Lay these children side by side." |
| `column` | `Column` | Same props as `row` (`align` horizontal, `justify` vertical when `flex-col`) | Vertical flex container when you need alignment/justification beyond a plain stack. |
| `stack` | `Stack` | `gap?: DsSpace` (default `'md'`); `minHeight?: 'none'\|'sm'\|'md'\|'lg'\|'hero'\|'screen'`; `height?: 'auto'\|'sm'\|'md'\|'lg'\|'hero'\|'screen'\|'full-bleed'` (default `'auto'`; `'full-bleed'`→`'screen'`) | Ergonomic vertical column with consistent gap. First reach for "list of things separated by N". Use `minHeight` to reserve hero/sticky-anchor space. |
| `cluster` | `Cluster` | `gap?: DsSpace` (default `'xs'`); `align?: 'start'\|'center'\|'end'\|'baseline'` | Wrap-friendly flex row. Chip groups, tag clusters, breadcrumbs, action button rows. |
| `grid` | `Grid` | `cols?: number\|string` (number→`repeat(N, minmax(0,1fr))`); `rows?: number\|string`; `gap?: DsSpace`; `colGap?: DsSpace`; `rowGap?: DsSpace` | CSS Grid wrapper for multi-column/row arrangements of UI nodes (NOT Slot multiplication — that's `slot.style: 'grid'`). |
| `split-view` | `SplitView` | `tracks: number\|number[]\|string` (required; `[746,320]`→`"746px 320px"`); `gap?: DsSpace`; `align?: 'start'\|'center'\|'end'\|'stretch'` | Two/three-column ratio split with explicit track widths. Canonical desktop: `<SplitView tracks={[746,320]} gap="lg">`. |
| `container` | `Container` | `maxW?: 'mobile'\|'tablet'\|'desktop'\|'wide'\|'full'\|string` (default `'desktop'`); `px?: 'none'\|'xs'\|'sm'\|'md'\|'lg'\|'xl'` (default `'md'`); `minHeight?: ...`; `height?: 'auto'\|'sm'\|'md'\|'lg'\|'hero'\|'screen'\|'full-bleed'` (default `'auto'`; `'full-bleed'`→`100vh` AND cancels max-width inset) | Max-width content wrapper with centering + inset padding. Always root or near-root. Use `height='full-bleed'` for hero sections breaking out of centered max-width. |

### Static-page atoms (13) — small content elements

| `uiVariant` | Component | Props | When to use |
|---|---|---|---|
| `button` | `Button` | `variant?: 'default'\|'icon'\|'rounded'`; `theme?: 'primary'\|'secondary'\|'outline'\|'text'\|'navigation'`; `size?: 'xs'\|'sm'\|'md'\|'lg'\|'xl'`; `shape?: 'default'\|'pill'\|'square'\|'circle'`; **label**: text-only buttons use `text: string` (walker's `pickTextPayload` reads `props.text`); **icon + label** buttons OMIT `text:` and use walker children — `{ children: [{ uiVariant: 'text', props: { as: 'span', text: 'Label' } }, { uiVariant: 'icon', props: { name: 'arrow-right', size: 'sm', 'aria-label': '' } }] }`. `pickTextPayload` returns walker children when `text:` is absent. | Action button. Use sparingly — most "CTAs" are linkouts. Reserve for in-page "Read more". |
| `avatar` | `Avatar` | `isAvatar: boolean`; `alt: string`; `imageUrl: string`; `size?: 'xs'\|'sm'\|'md'\|'lg'\|'xl'\|'2xl'\|'3xl'\|'4xl'` (default `'sm'`); `shouldZoom?: boolean` | Round portrait. Topic-hub entity portraits; author byline avatars. |
| `chip` | `Chip` | `variant?: 'default'\|'secondary'\|'success'`; `rounded?: 'full'\|'small'`; `text: string` (label via `pickTextPayload` `props.text`, NOT `props.children`) | Small pill/tag label inside `cluster`. `variant='success'` = success green; reserve for active/online status pills. |
| `image` | `Image` | `src: string`; `alt: string`; `aspectRatio?: 'reel'\|'auto'\|'square'\|'video'\|'portrait'\|'landscape'\|'banner'`; `radius?: 'none'\|'sm'\|'md'\|'lg'\|'full'`; `useWebp?: boolean` | Page-level images (hero shots, gallery tiles). For body-internal images, use markdown `![alt](src "caption")` inside a `content` Slot. |
| `decorative-list` | `DecorativeList` | `children: ReactNode` (only `<li>` expected) | Decorative bulleted list with branch-line styling. Niche — prefer markdown lists inside a `content` Slot. |
| `meta-list` | `MetaList` | `items: { label: string; value: string }[]`; `leader?: 'dotted'\|'dashed'\|'solid'\|'none'` (default `'dotted'`) | Key-value metadata `<dl>` with leader lines. Right-rail meta panels or any "label · ··· · value" display. |
| `heading` | `Heading` | `level?: 'h1'\|'h2'\|'h3'\|'headline-0'\|'headline-1'\|'headline-2'\|'headline-3'\|'headline-4'` (default `'headline-2'`); `weight?: 'medium'\|'semibold'\|'bold'`; `as?: 'h1'..'h6'`; `align?: 'left'\|'center'\|'right'`; `decoration?: 'none'\|'ribbon'` (default `'none'`); `text: string` (via `props.text`, NOT `props.children`) | Page/section title. Use `level="h3"`/`"headline-1"` for page H1. Body-internal subheads (H2/H3) belong inside the `content` Slot's markdown, NOT as `heading` UI nodes. `decoration='ribbon'` adds a 4 px brand bar to the left edge — use for right-rail meta-panel headings. |
| `text` | `Text` | `size?: 'body-0'..'body-4'` (default `'body-1'`); `weight?: 'medium'\|'semibold'\|'bold'`; `as?: 'p'\|'span'\|'div'\|'label'`; `align?: 'left'\|'center'\|'right'`; `text: string` (via `props.text`) | Page-level text outside the body — bylines, datelines, captions on `image` nodes, small copy near linkouts. Body prose belongs in `content` Slot markdown. |
| `divider` | `Divider` | `orientation?: 'horizontal'\|'vertical'`; `tone?: 'default'\|'subtle'\|'strong'`; `inset?: 'none'\|'sm'\|'md'\|'lg'` | Page-level separator between major sections. |
| `link` | `Link` | `href: string`; `tone?: 'default'\|'subtle'\|'inverted'`; `weight?: 'medium'\|'semibold'\|'bold'`; `underline?: 'always'\|'hover'\|'none'`; `external?: boolean` (label via a nested `text` child — NOT `props.text`/`props.children`) | Inline anchor at page level. **Asymmetry vs heading/text/chip/button**: `link` does NOT use `pickTextPayload`. Walker renders `<Link {...props}>{children}</Link>`. To label, nest a `text` node: `{ type:'ui', uiVariant:'link', props:{ href:'/author', tone:'subtle' }, children:[{ type:'ui', uiVariant:'text', props:{ text:'View author profile' } }] }`. Body-internal links go in markdown as `[text](href)`. |
| `icon` | `Icon` | `name: 'arrow-right'\|'arrow-left'\|'arrow-up'\|'arrow-down'\|'chevron-right'\|'chevron-left'\|'chevron-up'\|'chevron-down'\|'check'\|'x'\|'plus'\|'minus'\|'search'\|'menu'\|'more-horizontal'\|'more-vertical'\|'share'\|'bookmark'\|'heart'\|'star'\|'external-link'\|'link'\|'copy'\|'play'\|'pause'\|'info'\|'alert-circle'\|'help-circle'`; `size?: 'xs'\|'sm'\|'md'\|'lg'\|'xl'`; `tone?: 'default'\|'subtle'\|'inverted'\|'currentColor'`; `aria-label?: string` (`''` for decorative) | Curated lucide icon. Use only the 28 names above. |
| `accent-border` | `AccentBorder` | `side: 'left'\|'right'\|'top'\|'bottom'` (required); `tone?: 'primary'\|'secondary'\|'neutral'` (default `'primary'`); `weight?: 'thin'\|'medium'\|'thick'` (default `'medium'`); `state?: 'always'\|'reveal'\|'expand'` (default `'always'`); `inset?: 'none'\|'xs'\|'sm'\|'md'` (default `'sm'`) | Container-level border accent wrapping a subtree. Sponsored-content cards (`side='left' state='always'`), hover-revealed underlines (`side='bottom' state='expand'`). Distinct from `heading`'s `decoration='ribbon'`. |
| `surface` | `Surface` | `tone?: 'none'\|'subtle'\|'inverse'\|'brand-tint'\|'brand-strong'\|'accent-strong'` (default `'subtle'`); `radius?: 'none'\|'sm'\|'md'\|'lg'\|'full'` (default `'md'`); `padding?: 'none'\|'xs'\|'sm'\|'md'\|'lg'\|'xl'` (default `'md'`); `minHeight?: ...`; `height?: 'auto'\|'sm'\|'md'\|'lg'\|'hero'\|'screen'\|'full-bleed'` (default `'auto'`; `'full-bleed'`→`'screen'`) | Container-level fill (background + radius + padding). Sidebar panels (`tone='subtle'`), hero bands / BREAKING badges (`tone='brand-strong'`), stat tiles (`tone='brand-tint'`), saturated accent strips (`tone='accent-strong'`), dark strips (`tone='inverse'`). Use `minHeight='hero'` on right-rail surfaces to match the SplitView left-track hero height. Composes with `accent-border`. |

### Authored-structure interactive atoms (3) — content with bounded runtime state

User-toggled state (open/closed, active tab) but **structure and content are authored**. Pass items as a flat array via `props`; the walker expands into the underlying Radix compound API.

| `uiVariant` | Component | Props | When to use |
|---|---|---|---|
| `accordion` | `Accordion` | `type: 'single'\|'multiple'`; `defaultValue?: string\|string[]`; `items: Array<{ value: string; label: string; content: string }>` (content plain text/short markdown) | FAQ sections, product spec drill-downs. Each `item.content` is short — for long-form use a `content` Slot. |
| `tabs` | `Tabs` | `defaultValue: string`; `orientation?: 'horizontal'\|'vertical'`; `items: Array<{ value: string; label: string; content: string }>` | Multi-section content where user picks one view ("Overview"/"Highlights"/"Stats"). Authored content only — never an empty shell. |
| `collapsible` | `Collapsible` | `defaultOpen?: boolean`; `trigger: string` (label); `content: string` | "Show more" patterns — a long aside the reader can hide. Use sparingly. |

### Explicit deny-list — never emit any of these `uiVariant` strings

The validator rejects any artifact using these:

- **Runtime / interaction primitives**: `dialog`, `popover`, `tooltip`, `sheet`, `dynamic-sheet`, `hover-card`, `command`, `loader`, `skeleton`, `toaster`.
- **Form controls**: `form`, `input`, `select`, `checkbox`, `radio-input`, `textarea`, `switch`, `slider`, `phone-input`, `input-otp`, `label`.
- **Tables and media**: `table` (composite; not in v0), `video-player` / `audio-player` (reached **through the `video` Slot kind**, never as a UI node).

---

## Color, theming, and per-publisher branding

Color is **not authored into the artifact**. The same `Page` renders with different palettes under different publishers with no change to the artifact. Three layers handle color, none of which you author:

1. **Primitive defaults.** Most primitives (`heading`, `text`, layout) inherit text color from context. No color needed.
2. **Closed tone / variant prop enums on specific atoms.** Where a primitive accepts color intent, the value is a member of a small closed enum:

| `uiVariant` | Color-related prop | Allowed values |
|---|---|---|
| `button` | `theme` | `primary`, `secondary`, `secondaryDark`, `outline`, `text`, `navigation` |
| `chip` | `variant` | `default`, `secondary`, `success` |
| `link` | `tone` | `default`, `subtle`, `inverted` |
| `icon` | `tone` | `default`, `subtle`, `inverted`, `currentColor` |
| `divider` | `tone` | `default`, `subtle`, `strong` |

Pick from the enum; do not invent values. If a primitive isn't in this table, it has no color prop — color is handled by inheritance.

3. **Host CSS variables for publisher branding.** Per-publisher palettes (iHeart red, McClatchy red, US Weekly purple, etc.) are applied by the host at the React root via CSS-variable overrides. The walker, the primitives, and your output never see publisher names — they keep emitting `gencl:bg-primary-600` and the host's CSS layer resolves it. **You do not emit publisher names in the artifact.**

**When the target publisher has no theme yet:** if the prompt names a publisher and no matching `.theme-<slug>` block exists in `packages/tailwind-config/themes.css`, **do not invent colours into the artifact** and do not emit publisher branding fields. The operator should bootstrap the publisher palette first (the paired `hierarchical-theme` skill: one CSS block + a `ThemeName` literal). Once it exists, return to page generation — the artifact stays theme-agnostic either way. This skill never edits `themes.css` or `ThemeName`.

### Hard rules — forbidden in your output

The validator rejects any artifact that:

- Sets a raw color value via `style` (`{ style: { color: '#FF0000' } }`, `{ style: { background: 'rgb(…)' } }`).
- Uses arbitrary Tailwind color utilities in `className` (`text-[#FF0000]`, `bg-red-500`).
- Emits `className` with color-related utilities at all — color is a primitive's job.
- Emits any `publisher` / `brand` / `theme` field at the artifact level. Theming is host configuration, not artifact data.

**Dark mode** is also a host concern — the host adds `class="dark"` to a wrapper above the page. You never emit dark-mode toggles or alternate trees.

```ts
// ❌ Forbidden — raw hex value in props
{ type: 'ui', uiVariant: 'text', name: 'caption', props: { style: { color: '#888888' } } }
// ❌ Forbidden — arbitrary Tailwind utility
{ type: 'ui', uiVariant: 'heading', name: 'title', props: { className: 'gencl:text-[#FF0000]' } }
// ❌ Forbidden — publisher branding leaked into artifact
{ id: 'recap-iheart-game-7', publisher: 'iheart', breakpoints: [...] }
// ✅ Allowed — closed tone enum
{ type: 'ui', uiVariant: 'link', name: 'read-more', props: { tone: 'subtle', href: '/article/123', text: 'Read more' } }
// ✅ Allowed — closed theme enum on button
{ type: 'ui', uiVariant: 'button', name: 'cta', props: { theme: 'primary', text: 'Subscribe' } }
```

---

## Content body format + markdown allowlist

The `content` Slot's `body` prop is a **markdown string** rendered via `react-markdown` with a constrained allowlist. Your output must stay inside it.

### Allowed constructs

| Markdown construct | Rendered as |
|---|---|
| Paragraphs | `<Text size="body-0">` |
| `*em*` / `_em_` | `<em>` inline |
| `**strong**` / `__strong__` | `<strong>` inline |
| `[text](href)` | `<Link>` Genuin primitive (external-link affordance when `href` is non-relative) |
| `` `code` `` inline | `<code>` |
| `- item` / `* item` / `1. item` lists | `<ul>` / `<ol>` with `<Text>` items |
| `> quote` blockquote | Styled `<blockquote>` |
| Hard breaks (trailing `  \n`) | `<br>` |
| `## subhead` (H2) | `<Heading level="headline-3" as="h2">` |
| `### subhead` (H3) | `<Heading level="headline-4" as="h3">` |
| `![alt](src "caption")` inline figure | `<Figure>` wrapping `<Image>` + caption |

### Disallowed — the validator and runtime will reject

| Construct | Why |
|---|---|
| `# H1` | Page-level only — use a `heading` UI node in the tree. |
| `#### H4` through `###### H6` | Not enabled in v0. |
| Triple-backtick code blocks | Not enabled in v0. |
| Tables (`\| col \|`) | Future composite. |
| HTML passthrough (`<div>`, `<span>`, …) | Security — raw HTML not enabled. Strip it. |
| MDX / inline JSX (`<Component …>`) | Not enabled. Use the page tree for structure. |

### Page-level vs body-internal rule

When deciding where to put a heading/image/element that *could* go either way:

- **If removing it would break the *flow of the prose*, it's body content** → put it inside the `content` Slot's markdown.
- **If it could stand alone as a separate section** the generator might omit/relocate, it's a UI node → put it in the tree.

Concrete consequences:

- The page's main **H1** is a `heading` UI node above the first `content` Slot.
- Mid-article **H2/H3 subheadings** live inside the `content` Slot's markdown.
- An **inline figure** illustrating a paragraph lives in the markdown.
- A **hero image** at the top of the page is an `image` UI node.
- The **byline / dateline** is a `text` UI node next to the title.
- **Tag chips** are a `cluster` of `chip` UI nodes.
- A **related-linkouts grid** at the page bottom is a `linkout` Slot, not body content.

---

## Hard rules / fail conditions (self-check before returning)

Walk the tree once and verify every rule. Any failure means you fix it or — after 3 attempts — emit the failure-path error.

### Structural rules

1. **Slots are leaves.** `SlotNode` has no `children` field. No Slot-inside-Slot path.
2. **No Slot inside a Slot.** A Slot's `props` may not encode another Slot.
3. **UI nodes have no global grid-placement props.** `col`, `row`, `colSpan`, `rowSpan` are **never** valid on a UI node (positioning is internal to each layout primitive — use `grid`, `split-view`, `row`, `column`).
4. **Root is a `UiNode`.** Each `LayoutTree.root` must have `type: 'ui'`, not `type: 'slot'`.

### Slot rules

5. **Every Slot has an explicit `kind`.** Substring-name inference is forbidden (no `name: 'main-video'` without `kind: 'video'`).
6. **`kind` is closed.** Only `'content' | 'video' | 'linkout'`.
7. **Per-kind allowed styles:**
   - `content` → `style` must be `'single'` (or omitted, defaulting to `'single'`).
   - `video` → `style` must be `'feed' | 'grid' | 'carousel'`. **`'single'` is invalid for `video`.**
   - `linkout` → `style` must be `'single' | 'grid' | 'carousel'`.
8. **Decorator requirements:** `style: 'grid'` requires both `cols` and `rows`; `style: 'carousel'` requires `cols`; `cols` and `rows` are positive integers.
9. **Slot `name` is unique within a `LayoutTree`.** Same `name` across breakpoints is encouraged (lets resolved props wire cross-breakpoint).
9a. **Optional `size` decorator caps rendered height.** Closed enum (`'xs'|'compact'|'sm'|'default'|'lg'|'hero'|'screen'`) → 180/300/420/500/600/700 px / 100vh. Effective on `video` and `linkout` (cap on outer wrapper — `overflow-hidden` for video, `overflow-y-auto` for linkout grids/stacks). `content` ignores `size`. Omitted = no cap. Enforced by the Zod enum only.
9b. **Optional `aspect` decorator drives video / linkout geometry.** Closed enum (`'reel'|'square'|'video'|'portrait'|'landscape'|'banner'`) → 9/16, 1/1, 16/9, 3/4, 4/3, 21/9. Effective on `video` and `linkout`; on `content` the validator emits `ASPECT_NO_EFFECT`. On `video`, `aspect` takes precedence — when both `aspect` and `size` are set, `aspect` drives geometry and `size` becomes a max-height cap. Use `'reel'` for portrait phone video, `'banner'` for hero strips, `'square'` for symmetric grid tiles.
9c. **Optional `minHeight` decorator reserves space.** Closed enum (`'none'|'sm'|'md'|'lg'|'hero'`) → 0/180/300/420/600 px on the slot wrapper. Effective on all kinds. Use for sticky-anchor slots, hero rails, and any slot whose runtime data may be absent.
9d. **Closed dimension enums only.** The artifact NEVER specifies raw pixel/vh/`style` dimensions. Slot dimensions use the closed `size`/`aspect`/`minHeight` decorators; UI-level dimensions use `minHeight`/`height` on `surface`/`stack`/`container` only (validator warns `DIMENSION_NO_EFFECT` elsewhere). Width remains the parent layout primitive's job — `grid.cols`, `split-view.tracks`, `container.maxW`; there is no slot-level or UI-level `width` prop. Raw `style: { height, minHeight, maxHeight, aspectRatio, width }` and arbitrary Tailwind `h-[…]`/`min-h-[…]`/`aspect-[…]`/`w-[…]` are forbidden in any `props`.

### UI node rules

10. **UI nodes have no `kind`, no `style`, no `cols`, no `rows`, no `sticky`, no `density`** — those are Slot-only. UI nodes carry `uiVariant`, `props`, `children`.
11. **`uiVariant` must be one of the 23 emittable strings.** Deny-list strings are never valid.

### Slot-filling rules

12. **Anchor `content` Slot is required.** At least one `content` Slot per `LayoutTree` (`MISSING_CONTENT_SLOT`).
12a. **Anchor `feed` video is required.** At least one `video` Slot with `style: 'feed'` per `LayoutTree` (`MISSING_ANCHOR_VIDEO`). A Phase-1 prerequisite applying to *every* tree, independent of linkouts — distinct from rule 13, which only governs *ordering*. (`landing` pages still need their one product-demo feed anchor.)
13. **`feed` video before any `linkout` in *visual* reading order.** At least one `video` Slot with `style: 'feed'` must appear in visual reading order **before** any `linkout` Slot. Visual order matches source order **except for `split-view`**: every Slot inside a `split-view` subtree (any track, any depth) shares the same visual stripe — a `feed` video in any track satisfies the rule for `linkout`s in any other track of the same SplitView (tracks render side-by-side = parallel, not sequential). Across SplitViews and outside any SplitView, normal source order applies (a linkout before the SplitView in source = earlier stripe = still illegal).

### Budget rules

14. **Slot counts within budget** for the breakpoint. Going slightly under the upper bound is fine; over is a smell. The validator warns; visually-dense pages may still pass.

### Output rules

15. **The module exports a typed `page: Page` constant.** Not JSON. Not a function. Not a default export.
16. **The breakpoint `id` is unique** across all `LayoutTree`s in a `Page`.
17. **The smallest `minWidth` is `0`.** Mobile-first.

If any of rules 1–13 (including 12a), 15–17 fail and you cannot fix it, emit the failure-path error.

---

## Worked examples

### Example 1 — Mobile + desktop `recap`

```ts
import type { Page } from '@genuin/hierarchical-tree';

export const page: Page = {
  id: 'recap-celtics-mavericks-2026-05-19',
  version: '2026.05',
  breakpoints: [
    {
      id: 'recap-mobile',
      minWidth: 0,
      root: {
        type: 'ui',
        uiVariant: 'container',
        props: { maxW: 'mobile', px: 'md' },
        children: [
          {
            type: 'ui',
            uiVariant: 'stack',
            props: { gap: 'md' },
            children: [
              { type: 'ui', uiVariant: 'heading', props: { level: 'h3', weight: 'bold', as: 'h1', text: 'Celtics edge Mavericks in Game 7 thriller' } },
              { type: 'ui', uiVariant: 'text', props: { size: 'body-2', as: 'p', text: 'By Maya Chen · May 19, 2026' } },
              {
                type: 'ui', uiVariant: 'cluster', props: { gap: 'xs' },
                children: [
                  { type: 'ui', uiVariant: 'chip', props: { text: 'NBA Finals' } },
                  { type: 'ui', uiVariant: 'chip', props: { text: 'Celtics' } },
                  { type: 'ui', uiVariant: 'chip', props: { text: 'Mavericks' } },
                ],
              },
              { type: 'slot', name: 'anchor-video', kind: 'video', style: 'feed', sticky: true },
              // `recap-body` markdown is supplied by the host's resolveSlotProps
              // as slotData['recap-body'] = { body: '...' }; NOT on slot.props.
              { type: 'slot', name: 'recap-body', kind: 'content', style: 'single' },
              { type: 'slot', name: 'linkout-stats', kind: 'linkout', style: 'single' },
              { type: 'slot', name: 'linkout-photos', kind: 'linkout', style: 'single' },
              { type: 'ui', uiVariant: 'divider', props: { tone: 'default' } },
              { type: 'ui', uiVariant: 'heading', props: { level: 'headline-3', as: 'h2', text: 'Related' } },
              { type: 'slot', name: 'related-grid', kind: 'linkout', style: 'grid', cols: 2, rows: 3 },
            ],
          },
        ],
      },
    },
    {
      id: 'recap-desktop',
      minWidth: 1280,
      root: {
        type: 'ui',
        uiVariant: 'container',
        props: { maxW: 'desktop', px: 'lg' },
        children: [
          {
            type: 'ui',
            uiVariant: 'stack',
            props: { gap: 'lg' },
            children: [
              { type: 'ui', uiVariant: 'heading', props: { level: 'headline-1', weight: 'bold', as: 'h1', text: 'Celtics edge Mavericks in Game 7 thriller' } },
              {
                type: 'ui', uiVariant: 'cluster', props: { gap: 'xs' },
                children: [
                  { type: 'ui', uiVariant: 'chip', props: { text: 'NBA Finals' } },
                  { type: 'ui', uiVariant: 'chip', props: { text: 'Celtics' } },
                  { type: 'ui', uiVariant: 'chip', props: { text: 'Mavericks' } },
                ],
              },
              {
                type: 'ui', uiVariant: 'split-view', props: { tracks: [746, 320], gap: 'lg', align: 'start' },
                children: [
                  {
                    type: 'ui', uiVariant: 'stack', props: { gap: 'md' },
                    children: [
                      { type: 'slot', name: 'anchor-video', kind: 'video', style: 'carousel', cols: 3 },
                      { type: 'slot', name: 'recap-body', kind: 'content', style: 'single' },
                    ],
                  },
                  {
                    type: 'ui', uiVariant: 'stack', props: { gap: 'md' },
                    children: [
                      { type: 'slot', name: 'sidebar-feed', kind: 'video', style: 'feed', sticky: true },
                      { type: 'slot', name: 'sidebar-stats', kind: 'linkout', style: 'single' },
                      { type: 'slot', name: 'sidebar-photos', kind: 'linkout', style: 'single' },
                      { type: 'slot', name: 'sidebar-podcast', kind: 'linkout', style: 'single' },
                    ],
                  },
                ],
              },
              { type: 'ui', uiVariant: 'divider', props: { tone: 'default' } },
              { type: 'ui', uiVariant: 'heading', props: { level: 'headline-2', as: 'h2', text: 'More from the series' } },
              { type: 'slot', name: 'related-grid', kind: 'linkout', style: 'grid', cols: 4, rows: 3 },
              { type: 'slot', name: 'related-videos', kind: 'video', style: 'grid', cols: 3, rows: 2 },
            ],
          },
        ],
      },
    },
  ],
};
```

Phase-1 ordering: in both breakpoints, the anchor `content` Slot and at least one anchor `feed`/`carousel` `video` Slot appear before any standalone `linkout`. The mobile linkouts above the related grid satisfy "above-fold personalization" — alongside the sticky anchor video, not before it.

### Example 2 — Small synthetic mobile-only `recap`

A minimal `Page` demonstrating the schema with the fewest Slots. Use the *shape* as a starting point; **never** ship this minimal artifact as a real page (the budget is undersize).

```ts
import type { Page } from '@genuin/hierarchical-tree';

export const page: Page = {
  id: 'recap-tiny-example',
  breakpoints: [
    {
      id: 'recap-tiny-mobile',
      minWidth: 0,
      root: {
        type: 'ui',
        uiVariant: 'container',
        props: { maxW: 'mobile', px: 'md' },
        children: [
          {
            type: 'ui',
            uiVariant: 'stack',
            props: { gap: 'md' },
            children: [
              { type: 'ui', uiVariant: 'heading', props: { level: 'h3', as: 'h1', text: 'Quick recap' } },
              { type: 'slot', name: 'anchor-video', kind: 'video', style: 'feed', sticky: true },
              // body arrives via resolveSlotProps, keyed by slot.name; never on slot.props.
              { type: 'slot', name: 'recap-body', kind: 'content', style: 'single' },
              { type: 'slot', name: 'linkout-related', kind: 'linkout', style: 'single' },
            ],
          },
        ],
      },
    },
  ],
};
```

### Example 3 — Closed dimension decorators in a hero rail

Canonical pattern for a hero `video` slot needing portrait phone-video geometry, an explicit max-height cap, and a wrapping `surface` that reserves the same hero height so layout doesn't collapse while the SDK mounts.

```ts
{
  type: 'ui',
  uiVariant: 'surface',
  props: {
    tone: 'subtle',
    radius: 'md',
    padding: 'md',
    // Reserves the right rail at hero height before the SDK renders the embed.
    // Without this the surface collapses to the heading's height and the
    // SplitView visibly snaps when the embed mounts.
    minHeight: 'hero',
  },
  children: [
    {
      type: 'ui',
      uiVariant: 'stack',
      props: { gap: 'sm' },
      children: [
        { type: 'ui', uiVariant: 'heading', props: { level: 'headline-4', as: 'h2', decoration: 'ribbon', text: 'Daily Motivation' } },
        {
          type: 'slot',
          name: 'daily-motivation',
          kind: 'video',
          style: 'feed',
          sticky: true,
          // `aspect: 'reel'` drives 9:16 geometry; `size: 'hero'` caps rendered
          // height at 700 px so a single phone-video doesn't dominate the viewport.
          aspect: 'reel',
          size: 'hero',
        },
      ],
    },
  ],
}
```

The cooperating decorators — `surface.minHeight='hero'`, `slot.aspect='reel'`, `slot.size='hero'` — pin the column's vertical footprint to a stable value across SDK load states. Mirror the same `minHeight: 'hero'` on the parallel hero copy-stack (SplitView left track) so both tracks stay aligned.

---

## Negative examples (anti-templates)

Never emit these.

```ts
// 1. WRONG — `kind` is missing. Every Slot needs explicit kind; substring inference is deprecated.
{ type: 'slot', name: 'main-video', style: 'feed' }

// 2. WRONG — Phase 1 not satisfied: a `linkout` appears before any `feed` video.
children: [
  { type: 'slot', name: 'header-linkout', kind: 'linkout', style: 'single' },
  { type: 'slot', name: 'anchor-video', kind: 'video', style: 'feed' },
  { type: 'slot', name: 'body', kind: 'content' },
]
// The anchor feed video must precede any linkout in VISUAL reading order. SplitView
// tracks are an exception (side-by-side: a feed video in one track satisfies linkouts
// in any other track of the same SplitView).

// 3. WRONG — `single` is invalid for `video`. A single video is a `feed` of one.
{ type: 'slot', name: 'lone-video', kind: 'video', style: 'single' }

// 4. WRONG — H1 belongs at page level, not in markdown. Use a `heading` UI node above
//    the content Slot; use `## subhead` inside markdown for subsections only.
{ type: 'slot', kind: 'content', name: 'body', props: { body: '# Game 7 recap\n\nBoston won...' } }

// 5. WRONG — react-markdown does not enable raw HTML / MDX. Use `![alt](src "caption")`
//    in markdown or move the figure to an `image` UI node.
{ type: 'slot', kind: 'content', name: 'body', props: { body: 'Some lead text. <CustomFigure src="..."/> More text.' } }

// 6. WRONG — `dialog` is a deny-list runtime primitive, not emittable.
{ type: 'ui', uiVariant: 'dialog', props: { open: true }, children: [...] }
// ALSO WRONG — `tabs` is allowed but only with authored content; an empty shell is misuse.
{ type: 'ui', uiVariant: 'tabs', props: { defaultValue: 'a' }, children: [] }

// 7. WRONG — col/row/colSpan/rowSpan are not valid on UI nodes. Use a `grid`/`split-view`
//    parent to own placement.
{ type: 'ui', uiVariant: 'image', props: { src: '/hero.jpg', col: 1, colSpan: 2, row: 1 } }
```

---

## Failure path

If, after **up to 3 internal retries**, you cannot produce a `Page` that satisfies every Hard rule, emit a **structured error** module instead of a partial page:

```ts
export const error = {
  type: 'cannot_satisfy',
  reason: 'archetype hint missing and ambiguous prompt',
} as const;
```

Other valid `reason` strings:

- `'prompt missing required context'` — the prompt didn't specify enough subject matter to instantiate the archetype.
- `'budget unsatisfiable for breakpoint'` — the requested breakpoints + archetype combo can't fit within the per-breakpoint slot budgets.
- `'vocabulary insufficient'` — the page calls for a primitive not in the emittable 23 (and you cannot synthesise it from existing primitives).
- `'rule conflict'` — the requested layout conflicts with a hard rule (e.g. caller asked for a Slot at the root, which the schema forbids).

**Never** emit a partial or invalid `Page`. The validator rejects anything that doesn't satisfy the schema + rules. A clean error is recoverable; a malformed `Page` poisons the review queue.

---

## Figma references for visual context

When archetype shape is unclear, use the Figma MCP tools (`mcp__plugin_figma_figma__get_design_context`, `mcp__plugin_figma_figma__get_metadata`, `mcp__plugin_figma_figma__get_screenshot`).

| Frame | File key | Node ID |
|---|---|---|
| `/websitev5` (fixed desktop) | `P9FjWHXqrnBYoXum6NRzxm` | `5240:159768` |
| `/grid` at 420 px (mobile) | `31vZmmekJ2UDRkvvv6EUIR` | `9022:124863` |
| `/grid` at 748 px (small tablet) | `31vZmmekJ2UDRkvvv6EUIR` | `9022:124887` |
| `/grid` at 1024 px (large tablet) | `31vZmmekJ2UDRkvvv6EUIR` | `9094:82095` |
| `/grid` at 1280 px + 1512 px (desktop, wide desktop) | `31vZmmekJ2UDRkvvv6EUIR` | `9022:124911` |

**Important caveat**: these are **legacy visual references**, *not fidelity targets*. They ground intuition for layout density and arrangement; do not reproduce them pixel-for-pixel. The legacy `/websitev5` predates the tree contract; the legacy `/grid` uses a deprecated flat-list shape.

---

## Quick-reference checklist (run before emitting)

- [ ] One `page: Page` named export; module-level `import type { Page } from '@genuin/hierarchical-tree';` only.
- [ ] `page.breakpoints` sorted ascending by `minWidth`; smallest entry is `0`.
- [ ] Each `LayoutTree.root` has `type: 'ui'`.
- [ ] Every Slot has explicit `kind`.
- [ ] No `style: 'single'` on a `video` Slot.
- [ ] `style: 'grid'` Slots have `cols` and `rows`; `style: 'carousel'` Slots have `cols`.
- [ ] At least one `content` Slot per `LayoutTree`.
- [ ] At least one `video` Slot with `style: 'feed'` per `LayoutTree`, appearing before any `linkout` Slot in reading order.
- [ ] Per-breakpoint slot counts within budget.
- [ ] No `col` / `row` / `colSpan` / `rowSpan` on any UI node.
- [ ] Every `uiVariant` is one of the 23 emittable strings.
- [ ] Typography labels use `text:` prop, not `children:` (heading, text, chip, button).
- [ ] No deny-list strings anywhere.
- [ ] All markdown in `content` bodies stays inside the allowlist (no H1, no H4+, no code blocks, no tables, no raw HTML, no MDX).
- [ ] Slot `name`s unique within each tree; the same `name` reused across trees for the same logical slot.
- [ ] Breakpoint `id`s unique across the page.
- [ ] Right-rail / tight-container linkout slots use `density: 'compact'`.
- [ ] Video / linkout slots with non-default visual prominence carry a `size` decorator (`'compact'` for tight surfaces, `'hero'` for above-fold full-width slots).
- [ ] Slots with non-square media use `aspect` (`'reel'` portrait phone video, `'banner'` hero strips, `'square'` symmetric tiles); tight hero rails use `minHeight` on the wrapping `surface`/`stack`/`container` to reserve space across SDK load states.
- [ ] No raw `style: { height, minHeight, maxHeight, aspectRatio, width }` anywhere in `props`; no Tailwind `h-[…]` / `min-h-[…]` / `aspect-[…]` / `w-[…]` arbitrary utilities; dimensions live in the closed enums only.

If any box is unchecked, fix it. If you cannot fix it after 3 attempts, emit the failure-path error.
