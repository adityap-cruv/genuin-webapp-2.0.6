# Dynamic Linkout — Full Implementation Plan (GEN-7990)

Branch: `feature/GEN-7990/dynamic-linkout-component`
Date: 2026-05-04

## Goal

Bring the existing `<DynamicLinkouts>` molecule and its supporting `<LinkCard>` view to parity with the canonical Figma design at https://www.figma.com/design/31vZmmekJ2UDRkvvv6EUIR?node-id=8244-19830:

1. Add the **two missing placement-card variants** that Figma exposes but the codebase doesn't render today: **XS** and **S** (Figma names them `Pl-XS` and `Pl-S`; the design's "S, M, L" caption indicates the same chip is reused across small / medium / large embed widths).
2. Plumb through **all data fields** the design surfaces — `description`, `originalPrice`, `currentPrice`, `rating`, `likes`, `downloads`, `phone`, `address` — so the existing `expand-view` / `panel-view` / `full-view` cards visually match the design instead of rendering only `link` / `title` / `image`.
3. Replace the inlined `SAMPLE_LINKS` mocks in the three Storybook story files with a single canonical fixture file so the design data has one source of truth.
4. Add Storybook coverage for the new XS / S variants and for the rich-data versions of the existing variants.

## Non-goals

- Changing the public API of any production caller. All callers continue to pass the same prop shape they pass today; the new richer fields are **opt-in** via additional optional props on `LinkData`. Production sites that consume `<DynamicLinkouts>`:
  - [`feed-player/control-layer/default.tsx`](packages/components/src/molecules/feed-player/control-layer/default.tsx) and the embed variants ([`embed/default-embed.tsx`](packages/components/src/molecules/feed-player/control-layer/embed/default-embed.tsx), [`embed/grubhub-embed.tsx`](packages/components/src/molecules/feed-player/control-layer/embed/grubhub-embed.tsx), [`embed/iheart/clip-player-cta.tsx`](packages/components/src/molecules/feed-player/control-layer/embed/iheart/clip-player-cta.tsx))
  - [`feed-player/control-layer/placement/default-placement.tsx`](packages/components/src/molecules/feed-player/control-layer/placement/default-placement.tsx) and [`feed-player/control-layer/expand-view/expand-view-details.tsx`](packages/components/src/molecules/feed-player/control-layer/expand-view/expand-view-details.tsx)
  - [`organisms/player-swiper/desktop-right-panels.tsx`](packages/components/src/organisms/player-swiper/desktop-right-panels.tsx)
  - [`organisms/embed-tile/embed-tile.tsx`](packages/components/src/organisms/embed-tile/embed-tile.tsx)
- Rewriting the `<DynamicSheet>` drag / portal / hook internals (`useDynamicSheet`, drag tracking, snap math). We **add states** to the `DYNAMIC_SHEET_STATES` enum and configure them via the existing `enabledStates` / `heights` / `autoAdvance` config — no new mechanics.
- Adding tap-to-grow shared-element transitions between the chip states and the expand sheet. The existing fade between snap heights is what the design uses.

## What's wrong today

### 1. XS / S placement states don't exist

The Figma `Linkout` component has 7 `view` values, all stages of one state machine:

```text
pl-xs  ──(3s autoAdvance)──┐
                           ▼
pl-sml ──(3s autoAdvance)── default ──(thumb-on / 3s)── default-active ──(3s autoAdvance)── expand-view ──(swipe up / single tap)── panel-view ──(swipe up)── full-view
```

The `default` → `full-view` half is already implemented and live in [`linkouts-sheet-config.ts`](packages/components/src/molecules/linkout-new/linkouts-sheet-config.ts) (`autoAdvance: [{ from: "default-active", to: "expand-view", delayMs: 3000 }]`). The two **upstream** states `pl-xs` and `pl-sml` are missing entirely — they're not in the [`DYNAMIC_SHEET_STATES`](packages/ui/src/components/dynamic-sheet/types.ts#L5-L11) enum, not in the priority map in [`use-sheet-state.ts`](packages/components/src/hooks/use-sheet-state.ts#L11-L17), and `<LinkCard>` has no render branch for them.

Visual shape ([Figma node 9260-90901](https://www.figma.com/design/31vZmmekJ2UDRkvvv6EUIR/Genuin-Master-Design-System-V2?node-id=9260-90901&m=dev)):

| State | Layout |
| --- | --- |
| `pl-xs` | Full-width translucent chip, 32 px tall, single centered line (`title` or `link`), no thumbnail, no trailing icon. |
| `pl-sml` | Full-width translucent chip, 40 px tall, 24×24 thumbnail prefix, CTA-styled title (e.g. "Sign Up Now"), trailing play icon. |

The chip's outer width is the parent container's width minus 8 px on each side — see §A.8.

### 2. Rich data is silently dropped

The transform at [`linkout-item.tsx:130-136`](packages/components/src/molecules/linkout-new/linkout-item.tsx#L130-L136) builds `LinkMetaData` from `LinkData` but only forwards `link`, `title`, `image`:

```ts
const linksWithMetadata: LinkMetaData[] = links.map((l) => ({
  link: l.link,
  title: l.title,
  image: l.image ?? brandDetails.logo,
  brand: brandDetails.name,
  website: brandDetails.website,
}));
```

`LinkMetaData` already has fields for `description`, `originalPrice`, `currentPrice`, `rating`, `likes`, `downloads`, `phone`, `address`, but they're never populated — so the `expand-view` / `panel-view` / `full-view` `<LinkCard>` branches that *do* render those fields render nothing for them.

### 3. Stories don't show the rich content

[`dynamic-linkout-embed.stories.tsx`](packages/components/src/organisms/linkouts/dynamic-linkout-embed.stories.tsx), [`dynamic-linkout-expand.stories.tsx`](packages/components/src/organisms/linkouts/dynamic-linkout-expand.stories.tsx), and [`dynamic-linkout-mobile.stories.tsx`](packages/components/src/organisms/linkouts/dynamic-linkout-mobile.stories.tsx) each inline a `SAMPLE_LINKS` array (Walmart / Amazon / Target placeholders) carrying only `link`, `title`, `image`, `position`. There's no story that exercises the rich-data card or the XS / S chips.

## What changes

### A. Component changes

#### A.1 `LinkData` widens at the component boundary

**File:** [`packages/components/src/react-query/api/linkouts/schema.ts`](packages/components/src/react-query/api/linkouts/schema.ts)

Extend `linkSchema` with optional fields. Zod treats them as `nullish` so existing payloads still validate.

```diff
 const linkSchema = z.object({
   position: z.number(),
   link: z.string(),
   image: z.string().nullish(),
   title: z.string().nullish(),
+  description: z.string().nullish(),
+  brand: z.string().nullish(),
+  website: z.string().nullish(),
+  originalPrice: z.string().nullish(),
+  currentPrice: z.string().nullish(),
+  rating: z.string().nullish(),
+  likes: z.string().nullish(),
+  downloads: z.string().nullish(),
+  phone: z.string().nullish(),
+  address: z.string().nullish(),
 });
```

`LinkData` derived type picks these up automatically. No callers break — they continue passing only `link/title/image/position`.

#### A.2 `LinkoutItem` forwards the new fields

**File:** [`packages/components/src/molecules/linkout-new/linkout-item.tsx`](packages/components/src/molecules/linkout-new/linkout-item.tsx)

```diff
 const linksWithMetadata: LinkMetaData[] = links.map((l) => ({
   link: l.link,
   title: l.title,
   image: l.image ?? brandDetails.logo,
-  brand: brandDetails.name,
-  website: brandDetails.website,
+  brand: l.brand ?? brandDetails.name,
+  website: l.website ?? brandDetails.website,
+  description: l.description ?? undefined,
+  originalPrice: l.originalPrice ?? undefined,
+  currentPrice: l.currentPrice ?? undefined,
+  rating: l.rating ?? undefined,
+  likes: l.likes ?? undefined,
+  downloads: l.downloads ?? undefined,
+  phone: l.phone ?? undefined,
+  address: l.address ?? undefined,
 }));
```

`brand` / `website` keep their `brandDetails` fallback so production callers that don't supply per-link brand info still render correctly.

#### A.3 Add `pl-xs` and `pl-sml` to the `DynamicSheet` state machine

**File:** [`packages/ui/src/components/dynamic-sheet/types.ts`](packages/ui/src/components/dynamic-sheet/types.ts)

Append to the `DYNAMIC_SHEET_STATES` tuple. The order matters because `useDynamicSheet`'s snap-height math uses array order to compute next/prev states on swipe — putting the new states **first** keeps drag direction intuitive (swipe up moves toward `full-view`):

```diff
 export const DYNAMIC_SHEET_STATES = [
+  "pl-xs",
+  "pl-sml",
   "default",
   "default-active",
   "expand-view",
   "panel-view",
   "full-view",
 ] as const;

 // Numbers are % of container (per DynamicSheetConfig doc-comment),
 // strings are CSS values. Sticking with the file's percentage
 // convention here; per-scenario overrides in linkouts-sheet-config.ts
 // use fixed pixels ("40px") for the chip.
 export const DEFAULT_HEIGHTS: Record<DynamicSheetState, HeightValue> = {
+  "pl-xs": 5,
+  "pl-sml": 6,
   default: 15,
   "default-active": 18,
   "expand-view": 40,
   "panel-view": 70,
   "full-view": 100,
 };
```

In each scenario config in [`linkouts-sheet-config.ts`](packages/components/src/molecules/linkout-new/linkouts-sheet-config.ts) that includes the chip states in `enabledStates`, pin the heights to the design — **XS is 32 px, SML is 40 px** (per the reference):

```ts
heights: {
  "pl-xs": "32px",
  "pl-sml": "40px",
  default: "95px",
  // ...
}
```

**File:** [`packages/components/src/hooks/use-sheet-state.ts`](packages/components/src/hooks/use-sheet-state.ts)

Extend the priority map so `getMostExpandedState` ranks the chip states below `default`:

```diff
 const STATE_PRIORITY: Record<SheetState, number> = {
+  "pl-xs": -2,
+  "pl-sml": -1,
   "default": 0,
   "default-active": 1,
   "expand-view": 2,
   "panel-view": 3,
   "full-view": 4,
 };
```

#### A.4 Render the new states in `<LinkCard>`

**File:** [`packages/components/src/molecules/linkout-new/link-card.tsx`](packages/components/src/molecules/linkout-new/link-card.tsx)

Add two new render branches before the existing `isDefault` block, both 246×40 translucent chips:

```text
pl-xs:
┌────────────────────────────────────────────────┐ 246 × 40
│  ETS | Global education and talent solutions ▶│ bg rgba(19,20,21,0.5), rounded 8, backdrop-blur
└────────────────────────────────────────────────┘

pl-sml:
┌────────────────────────────────────────────────┐ 246 × 40
│ [▢] Sign Up Now                              ▶│
└────────────────────────────────────────────────┘
```

Two distinct chip layouts; both fill parent width and use project tokens per §A.7. Sizes follow the [Figma reference (node 9260-90901)](https://www.figma.com/design/31vZmmekJ2UDRkvvv6EUIR/Genuin-Master-Design-System-V2?node-id=9260-90901&m=dev) exactly.

**`pl-xs`** — minimal centered chip:

- Container: `gencl:bg-secondary-900/50 gencl:backdrop-blur-sm gencl:rounded-lg gencl:h-8 gencl:w-full gencl:flex gencl:items-center gencl:justify-center gencl:px-2`.
- Title only: `data.title || data.link`, `gencl:text-body-2-medium gencl:text-white` (12 / 16 lh, matching the reference's `font-size: 12px; line-height: 16px`), centered, single-line ellipsis. `flex: 0 1 auto` so it takes only what it needs.
- **No thumbnail. No trailing icon.** This is what differentiates it from `pl-sml`.

**`pl-sml`** — chip with thumbnail + CTA + arrow:

- Container: `gencl:bg-secondary-900/50 gencl:backdrop-blur-sm gencl:rounded-lg gencl:h-10 gencl:w-full gencl:flex gencl:items-center gencl:px-2 gencl:gap-2`.
- 24×24 thumbnail prefix using `data.image` with `gencl:object-cover gencl:rounded-[4.8px]`; neutral block (`gencl:bg-secondary-800` dark / `gencl:bg-secondary-100` light) when no image.
- Title: `data.title || data.link`, `gencl:text-body-1-semi-bold! gencl:text-white`, single-line ellipsis, `flex: 1 0 0; min-width: 0`.
- Trailing 24×24 chevron / play icon — re-use the existing `<ExternalLink>` import from `link-card.tsx`.

Both: light theme swaps the bg to `gencl:bg-white` and text to `gencl:text-secondary-900`. `onClick` opens the link.

#### A.5 Wire the chip states + auto-advance into the expand-* scenarios

**File:** [`packages/components/src/molecules/linkout-new/linkouts-sheet-config.ts`](packages/components/src/molecules/linkout-new/linkouts-sheet-config.ts)

The expand scenarios are the ones that own the full state machine (drag handle + auto-advance). They start at the chip and progress through default → default-active → expand-view, with panel-view / full-view available via drag.

```ts
autoAdvance: [
  { from: "pl-xs", to: "default", delayMs: 3000 },
  { from: "pl-sml", to: "default", delayMs: 3000 },
  { from: "default-active", to: "expand-view", delayMs: 3000 }, // existing
],
```

Mapping for the expand scenarios:

| Scenario | Today's `initialState` | New `initialState` |
| --- | --- | --- |
| `expand-mobile` | `default` | `pl-sml` (chip first, auto → default after 3s) |
| `expand-desktop-inside` | `default` | `default` (unchanged — desktop has room for the full card) |
| `expand-desktop-outside` | `expand-view` | `expand-view` (unchanged — outside-panel layout doesn't pass through chip state) |

The embed scenarios are handled separately in §A.9 — they're width-picked, single-state, and don't auto-advance.

While in `pl-xs` / `pl-sml`, drag/swipe is suppressed: setting `disableDragAndSwipe: true` for those states only would require config-shape changes, so for the first cut the chip states keep `disableDragAndSwipe` set to whatever the scenario already chose. Auto-advance to `default` after 3s is the only documented transition out of the chip in the expand-mobile flow.

#### A.6 Move carousel pagination dots out of the sheet panel

**Problem.** The carousel pagination dots (and desktop nav buttons) live inside [`<LinkoutItem>`](packages/components/src/molecules/linkout-new/linkout-item.tsx#L188-L218), which is mounted as a child of the `<DynamicSheet>` body. Rendered DOM:

```text
<DynamicSheet>
  <DynamicSheetBody>      ← visually "the panel"
    <LinkoutItem>
      <Swiper>…</Swiper>
      <div className="…dots…" />   ← inside the panel
    </LinkoutItem>
  </DynamicSheetBody>
</DynamicSheet>
```

**Figma intent** (verified at the layout reference frame `8285:24669`): the `<Carousel>` component is a sibling rendered **after** the panel content, on the video backdrop below the chip / panel. This holds for `Pl-XS`, `Pl-S`, `Default`, `Default Active`, and `Expand View`:

```jsx
{["Pl-XS", "Default Active"].includes(view) && carousel && <Carousel … />}
{isPlS && <LinkoutButtons … />}
{isPlS && carousel && <Carousel … />}
{isDefault && (<div>…content…</div>)}
{isDefault && carousel && <Carousel … />}
{isExpandView && carousel && <Carousel className="… w-[334px]" />}
```

**Change.** Split `<LinkoutItem>` into two pieces:

- **`<LinkoutSlider>`** — owns the `<Swiper>` and the slides. Receives a `swiperRef: RefObject<SwiperType>` and an `onActiveIndexChange` callback so the parent can drive pagination from outside.
- **`<LinkoutCarouselDots>`** — standalone dots component. Receives `total`, `activeIdx`, `onSelect: (idx) => void`, `theme`. The desktop nav buttons follow the same split into `<LinkoutNavButtons>`.

`<DynamicLinkouts>` mounts the slider inside the sheet body, then mounts the dots / nav buttons as a sibling of the sheet (positioned absolutely below the sheet on the video backdrop, in the slot that today is empty). The dots component is conditionally rendered: only when `totalLinks > 1` and the current state is one Figma renders the carousel for (chip / default / default-active / expand). Panel-view and full-view don't show dots in Figma — the multi-link UI changes there to a vertical list — but matching that is out of scope; we'll suppress the dots for those states for now.

**Pathways unaffected.** [`<LinkoutItem>`'s default / default-active branch](packages/components/src/molecules/linkout-new/linkout-item.tsx#L139-L148) returns `<AutoCycleView>` (no Swiper, no dots) — that path is untouched. The split only matters for the Swiper branch, which renders for `expand-view` / `panel-view` / `full-view` / `pl-xs` / `pl-sml`.

**Per-state dot width.** Figma renders the dots at full `w-full` for `pl-xs`, `default-active`, `default`, `pl-sml`, and at `w-[334px]` (centered) for `expand-view`. The `<LinkoutCarouselDots>` component takes a `widthMode: "full" | "fixed-334"` prop driven by the current sheet state.

**Out of scope here:** restyling the dots, changing pagination behaviour, replacing Swiper. Just relocating.

While the file is open: the existing dots use raw hex literals that are 1:1 matches for project tokens. Migrate as part of the same diff:

```diff
- "gencl:bg-[#767B81]"  // active dot
+ "gencl:bg-secondary-600"
- "gencl:bg-[#E9EBEC]"  // inactive dot
+ "gencl:bg-secondary-100"
```

#### A.7 Tailwind / design-token usage policy

Figma's `get_design_context` output produces literal values like `bg-[rgba(19,20,21,0.5)]`, `rounded-[8px]`, `backdrop-blur-[5px]`. These are accurate but bypass the project's design tokens, which makes downstream theming and dark/light swaps brittle. For every new class string we write (chip backgrounds, the new render branches, the dots, the `linkout-card.stories.tsx` decorators), use the existing tokens defined in [`packages/tailwind-config/shared-styles.css`](packages/tailwind-config/shared-styles.css) instead.

Mappings used by this PR:

| Figma | Project class |
| --- | --- |
| `bg-[rgba(19,20,21,0.5)]` (chip translucent dark) | `gencl:bg-secondary-900/50` (`secondary-900 = #1d1f20`, indistinguishable from Figma's `#131415` at 50% alpha) |
| `text-white` / `text-secondary-900` (chip text — dark vs light theme) | `gencl:text-white` / `gencl:text-secondary-900` |
| body-1 semibold (14 px / 20 lh / 600) | `gencl:text-body-1-semi-bold!` |
| `rounded-[8px]` | `gencl:rounded-lg` |
| `backdrop-blur-[5px]` | `gencl:backdrop-blur-sm` (4 px, visually equivalent) |
| `bg-white` (light chip surface) | `gencl:bg-white` |
| Dots active `#767B81` / inactive `#E9EBEC` | `gencl:bg-secondary-600` / `gencl:bg-secondary-100` (exact-hex matches; see §A.6 cleanup) |
| Thumbnail rounding `rounded-[4.8px]` | `gencl:rounded-[4.8px]` (no preset matches; keep as arbitrary value) |

For values that genuinely don't have a token (e.g. the 4.8 px thumbnail rounding), arbitrary classes are fine — but only after confirming there's no project token. The chip's height tokens (`gencl:h-8`, `gencl:h-10`) are existing Tailwind values; no arbitrary heights needed.

#### A.8 Responsive width — panel fills parent minus 8 px insets

Reference: [Figma node 9260-90901](https://www.figma.com/design/31vZmmekJ2UDRkvvv6EUIR/Genuin-Master-Design-System-V2?node-id=9260-90901&m=dev). Every variant (`xs`, `sml`, `default`, `active`, `expand`) fills the linkout container's full width — which is the **parent's width minus 8 px on each side**. There are no fixed-pixel widths on the chip / sheet content.

In our codebase the equivalent is the positioning that consumers apply to the `<DynamicSheet>` overlay. Today the embed scenarios already wrap the sheet in `position:absolute` containers; verify each one applies the 8 px ring (`left: 8 right: 8 bottom: 8` on mobile / overlay scenarios). Inside the sheet the content uses `gencl:w-full` already; the chip layouts in §A.4 add to that.

#### A.9 Tighter width breakpoints to match the Figma reference

Today's scenario picker in [`linkouts-sheet-config.ts`](packages/components/src/molecules/linkout-new/linkouts-sheet-config.ts) buckets by `effectiveVideoWidth` into three ranges (`≤120`, `≤300`, `>300`). The Figma reference uses five (`≤180` xs, `<250` sml, `<300` default, `<400` active, `≥400` expand). We retune the embed scenarios to match.

Replace the existing `embed-120` / `embed-180` / `embed-300` (and their `outside` siblings) with five new scenarios per ring. Each scenario's `enabledStates` is a single state — embed contexts have no sheet drag, so the variant we pick at config time is the variant the user sees:

```diff
 if (view === "embed" && layout === "overlay") {
-  if (effectiveVideoWidth <= 120) return "embed-120";
-  if (effectiveVideoWidth > 300 && isPortrait) return "embed-300";
-  return "embed-180";
+  if (effectiveVideoWidth <= 180) return "embed-xs";
+  if (effectiveVideoWidth < 250) return "embed-sml";
+  if (effectiveVideoWidth < 300) return "embed-default";
+  if (effectiveVideoWidth < 400) return "embed-active";
+  return "embed-expand";
 }
```

| Scenario | Range | `initialState` | `enabledStates` | `heights` |
| --- | --- | --- | --- | --- |
| `embed-xs` | `≤180` | `pl-xs` | `["pl-xs"]` | `{ "pl-xs": "32px" }` |
| `embed-sml` | `181…249` | `pl-sml` | `["pl-sml"]` | `{ "pl-sml": "40px" }` |
| `embed-default` | `250…299` | `default` | `["default"]` | `{ default: "95px" }` |
| `embed-active` | `300…399` | `default-active` | `["default-active"]` | `{ "default-active": "117px" }` |
| `embed-expand` | `≥400` | `expand-view` | `["expand-view"]` | `{ "expand-view": "212px" }` |
| `embed-outside-xs` …`-expand` | same ranges | mirror of above | mirror | mirror |

`expand-mobile` keeps the full state machine (`enabledStates` = `["pl-sml", "default", "default-active", "expand-view", "panel-view", "full-view"]` with the chip auto-advance rule). Embed scenarios do **not** auto-advance — they're single-state placements.

This is a real refactor of the scenario picker — three `if`s become five, three switch arms become five, the `outside` family does the same. Not architecturally hard; just wider blast radius. Production callers (`feed-player/control-layer/embed/*`) rely on the scenario name internally to pick layout — confirm via grep that no caller hardcodes `"embed-180"` etc. before merging.

### B. Fixture file

**New file:** `packages/components/src/organisms/linkouts/linkouts.fixtures.ts`

Single canonical mock based on the Figma design's TOEFL/ETS sample content. Exports:

```ts
export const LINKOUT_FIGMA_FULL: LinkData = {
  position: 0,
  link: "https://www.ets.com/toefl",
  title: "Take the Online TOEFL Test Today and Sign Up Now at ETS!",
  image: "<placeholder url>",
  description: "The TOEFL test measures your English skills…",
  brand: "ETS",
  website: "www.ets.com",
  originalPrice: "$299.99",
  currentPrice: "$199.99",
  rating: "4.5",
  likes: "12.5K",
  downloads: "8.2K",
  phone: "(123) 456-789",
  address: "123 Address, NY, NY, 10000",
};

export const LINKOUT_FIGMA_CAROUSEL: LinkData[] = [/* 3 entries with shared shape, distinct content */];

export const LINKOUT_FIGMA_CTA = { ctaText: "Sign Up Now", ctaLink: LINKOUT_FIGMA_FULL.link };

/** Subset helpers used by stories that intentionally show only a few fields. */
export const LINKOUT_FIGMA_TITLE_ONLY: LinkData[] = /* link + title + position */;
export const LINKOUT_FIGMA_THUMBNAIL_ONLY: LinkData[] = /* link + image + position */;
export const LINKOUT_FIGMA_THUMBNAIL_AND_TITLE: LinkData[] = /* + title */;
```

### C. Storybook changes

#### C.1 Update existing three story files

Replace inlined `SAMPLE_LINKS` / variant arrays with imports from `linkouts.fixtures`. Existing story names and decorators stay; only the data source changes.

- [`dynamic-linkout-mobile.stories.tsx`](packages/components/src/organisms/linkouts/dynamic-linkout-mobile.stories.tsx) — `SAMPLE_LINKS` → `LINKOUT_FIGMA_CAROUSEL`. Variant projections (`thumbnail-only`, etc.) become projections over the fixture.
- [`dynamic-linkout-expand.stories.tsx`](packages/components/src/organisms/linkouts/dynamic-linkout-expand.stories.tsx) — same swap. `LINKS_FULL` becomes `LINKOUT_FIGMA_CAROUSEL` (all fields present).
- [`dynamic-linkout-embed.stories.tsx`](packages/components/src/organisms/linkouts/dynamic-linkout-embed.stories.tsx) — same swap.

After this swap, the existing stories' "expand view" / "panel view" / "full view" sheet states automatically render the rich meta row (price, rating, likes, downloads, phone, address) because the data flows through.

#### C.2 New "Full Figma Card" story per existing file

One new story added to each of the three existing files showing the rich-card layout with **every** field populated. Each story scopes to that file's existing harness (mobile / expand / embed), so reviewers can see the rich data appear in its real layout context, not in isolation.

| Story | Sheet state | Notes |
|---|---|---|
| `dynamic-linkout-mobile.stories.tsx :: FullFigmaCardMobile` | `expand-view` (locked) | Mobile-width card with full meta row, description visible. |
| `dynamic-linkout-expand.stories.tsx :: FullFigmaCardExpand` | `panel-view` initial state | Drag handle still works — moves to `full-view` to show the big vertical layout with all fields. |
| `dynamic-linkout-embed.stories.tsx :: FullFigmaCardEmbed` | `default-active` | Shows the auto-cycle expand layout with rich meta. |

#### C.3 New file: `linkout-card.stories.tsx`

**Why a separate file:** the existing three story files exercise `<DynamicLinkouts>` end-to-end with the sheet harness — useful for transitions, but each one is committed to a single scenario (`expand-mobile` / `expand-desktop` / `embed`). A `<LinkCard>`-level catalogue gives reviewers a single page to compare every render branch (including `pl-xs` and `pl-sml`) without dragging a sheet, and keeps the chip stories independent of the per-scenario `enabledStates` decisions in §A.5.

Stories (one per state, all using `LINKOUT_FIGMA_FULL` so any field that's wired in shows up):

| Story name | `sheetState` | What it shows |
|---|---|---|
| `PlacementXS` | `pl-xs` | Text-only chip 246×40. |
| `PlacementSML` | `pl-sml` | Thumbnail + title chip 246×40. |
| `PlacementSMLLightTheme` | `pl-sml` | Same with `theme="light"`. |
| `Default` | `default` | Compact LinkIcon + title + chevron. |
| `DefaultActive` | `default-active` | Auto-cycle expand row. |
| `ExpandView` | `expand-view` | Horizontal card with thumbnail + title + description + meta row. |
| `PanelView` | `panel-view` | Vertical detail card (medium height). |
| `FullView` | `full-view` | Vertical detail card (tall, 1:1 thumbnail). |

Each story renders against a dark-grey backdrop matching the design's frame so the chip's translucent background reads correctly. Chip stories render in a 320 px wide host frame (matching the smallest embed-180 case from the reference) so the chip stretches `w-full` and the responsive shape is visible — not in an isolated 246×40 box.

#### C.4 Legacy `linkouts.stories.tsx` (organism file, not the dynamic-linkout-* trio)

[`packages/components/src/organisms/linkouts/linkouts.stories.tsx`](packages/components/src/organisms/linkouts/linkouts.stories.tsx) drives the older `<Linkouts>` organism, which still gets `LinkoutsType` mock data inline. It already uses TOEFL/ETS strings, so the rename is small: replace its inline mocks with the same `LINKOUT_FIGMA_*` exports from §B. Keep the existing story names — only the data source changes.

### D. Tests

No unit tests exist today for `<LinkCard>` or `<LinkoutItem>`. I'll add a focused jest+RTL spec at:

**New:** `packages/components/src/molecules/linkout-new/link-card.test.tsx`

Coverage:

- Renders title in `default` sheetState.
- `pl-xs` renders chip with title, no thumbnail, no meta row.
- `pl-sml` renders chip with thumbnail + title.
- `pl-xs` / `pl-sml` honour the `theme="light"` swap.
- Renders description + price + rating only when those fields are present (none rendered for the bare `LinkData`).
- `onClick` fires on chip tap.

Plus a small auto-advance spec for the new state transitions:

**New:** `packages/components/src/molecules/linkout-new/linkouts-sheet-config.test.ts`

- For each scenario whose `initialState` becomes `pl-xs` or `pl-sml`, the returned config includes the matching `autoAdvance` rule with `delayMs: 3000`.
- `enabledStates` includes the chip states alongside `default`.

And a render-shape spec for the relocated dots:

**New:** `packages/components/src/molecules/linkout-new/linkout-item.test.tsx`

- `<LinkoutCarouselDots>` renders `total` buttons; `activeIdx` button gets the highlighted class.
- Clicking a dot calls `onSelect(idx)`.
- Dots component is a pure function of props (no swiper-internal coupling) — verifies the split is clean.

These lock the new contract and prevent accidental regression of the rich-data plumbing, the auto-advance wiring, or the dots relocation.

## Out of scope (explicitly deferred)

- **Per-callsite size override for the S variant.** Figma's "S, M, L" sub-sizes look identical at the chip level; if real per-size differences emerge later, we'd add a width prop without changing the state name.
- **Drag-from-chip-to-expand interaction.** Today's transitions out of the chip are auto-advance only. If the chip should "grow" into the expand sheet on tap or swipe, that's a behavioural change to `DynamicSheet`, separate ticket.
- **Wiring the new data fields to the production API.** `linkSchema` widens to accept them; whether the backend starts returning `description` / `rating` / etc. is a backend story the design team owns.
- **Per-state `disableDragAndSwipe`.** While in `pl-xs` / `pl-sml` the chip should ignore drag, but the existing `DynamicSheet` config-shape only has a scenario-wide flag. Living with the scenario-level setting for now; a per-state override is a follow-up.

## Risks

| Risk | Mitigation |
| --- | --- |
| Schema widening could break a strict zod consumer | New fields are `.nullish()` — existing payloads still validate. `linkSchema` is only consumed via `validateLinkouts`. |
| Adding two states to `DYNAMIC_SHEET_STATES` propagates to every consumer of `DynamicSheetState` | Audit step before merging: grep `DynamicSheetState` and confirm no consumer does an exhaustive switch. The hook's `STATE_PRIORITY` map and `linkouts-sheet-config.ts` are the two known places that *do* enumerate; both updated in this PR. |
| `linksWithMetadata` mapping forwarding optionals adds null-noise | Use `?? undefined` so missing fields stay `undefined` (not `null`); `LinkCard`'s falsy checks already handle both. |

## Order of work

1. Extend `DYNAMIC_SHEET_STATES` and `DEFAULT_HEIGHTS` ([packages/ui/src/components/dynamic-sheet/types.ts](packages/ui/src/components/dynamic-sheet/types.ts)).
2. Extend `STATE_PRIORITY` in [`useSheetState`](packages/components/src/hooks/use-sheet-state.ts).
3. Schema widening (`linkSchema`).
4. `LinkoutItem` adapter forwarding all rich fields.
5. `LinkCard` render branches for `pl-xs` and `pl-sml`.
6. Update `linkouts-sheet-config.ts` for the expand-* scenarios (chip `initialState` + `autoAdvance`, per §A.5).
7. Refactor the embed scenario picker in `linkouts-sheet-config.ts` to the 5-bucket breakpoints (`embed-xs` / `embed-sml` / `embed-default` / `embed-active` / `embed-expand`, plus the `embed-outside-*` mirrors), per §A.9. Grep production callers (`feed-player/control-layer/embed/*`) for hardcoded `"embed-180"` / `"embed-300"` strings before merging.
8. Split `LinkoutItem` into `LinkoutSlider` + `LinkoutCarouselDots` + `LinkoutNavButtons`; relocate dots to render outside the sheet (per §A.6).
9. Fixture file.
10. Update the three `dynamic-linkout-*.stories.tsx` files (and the legacy `linkouts.stories.tsx`) to use the fixture.
11. Add the three "Full Figma Card" stories within those files.
12. New `linkout-card.stories.tsx`.
13. `link-card.test.tsx`, `linkouts-sheet-config.test.ts`, and `linkout-item.test.tsx`.
14. Type-check (`pnpm exec tsc --noEmit`) and storybook smoke before commit. Walk these stories specifically:
    - `Organisms/Linkouts/Dynamic Linkouts Mobile View` (all four variants + the new "Full Figma Card" mobile story).
    - `Organisms/Linkouts/Dynamic Linkouts Embed View` (overlay embed + the new "Full Figma Card" embed story).
    - `Organisms/Linkouts/Dynamic Linkouts Expand View` (desktop + four mobile variants + the new "Full Figma Card" expand story).
    - `Molecules/LinkCard/*` (the new file — every state including `pl-xs`, `pl-sml`).
    - `Organisms/Linkouts/Linkouts` (the legacy `linkouts.stories.tsx` — confirm fixture swap renders correctly).
    - **Skip** `Organisms/Web-SDK/EmbedTile` — story is broken on the current branch (missing `EmbedManagerProvider` decorator). See Follow-ups below.

## Follow-ups (not part of this PR)

- **Revive `embed-tile.stories.tsx`.** The story renders `<EmbedTile />` directly without the required `<EmbedManagerProvider>`, throwing on render. Fixing it cascades into mocking `useEmbedContext()` + `useEmbedConfigs()` + a `swiper` instance — ~30–80 LOC of decorator setup, separate ticket. None of the new linkout work depends on it; the dynamic-linkout-* stories cover the same `<DynamicLinkouts>` pipeline.
- **Per-state `disableDragAndSwipe` for `DynamicSheet`.** The chip states should ignore drag while active; today the flag is scenario-wide, not per-state. A small config-shape extension when there's appetite.
- **Backend wiring for the new `LinkData` fields.** Schema accepts them after this PR; whether the API actually returns `description`, `rating`, `likes`, etc. is a backend story.
- **Step-down on height overflow.** When the host video frame is too short for the variant the width-picker chose, the [Figma reference](https://www.figma.com/design/31vZmmekJ2UDRkvvv6EUIR/Genuin-Master-Design-System-V2?node-id=9260-90901&m=dev) shows the variant degrading to a smaller one until it fits inside `~half of the frame`. Needs a ResizeObserver wired against the actually rendered DOM rather than a config-time `effectiveVideoWidth`. Out of scope here.
