# Responsive (Wide) Linkout — Implementation Plan

## 0. Source of truth

Per Figma [node 9322:136877](https://www.figma.com/design/31vZmmekJ2UDRkvvv6EUIR/Genuin-Master-Design-System-V2?node-id=9322-136877&m=dev) — the responsive wide-card design with the full size × state × orientation matrix, picker thresholds, CTA placement rules, and overflow cascade priority.

The "wide / responsive" layout is **distinct** from the existing embed-overlay flow. It's a single self-contained card that fills its host container (post-detail panel, ad slot, etc.). The card adapts to the container's width AND height, switching between size buckets, between two content states (default / expand), and between landscape and portrait orientation.

We're adding a **new sheet state called `responsive`** that hosts this card. The other sheet states (`pl-xs` / `pl-sml` / `default` / `default-active` / `expand-view` / `panel-view` / `full-view`) keep their current behavior unchanged — `full-view` in particular stays the portrait drawer it is today. Only callers that opt in to the new responsive scenario reach the `responsive` state.

## 1. Goal

Add `dynamic-linkout-responsive.stories.tsx` (Storybook) that renders the production `<DynamicLinkouts>` inside a resizable frame and exercises every permutation of the new `responsive` sheet state:

| size   | width bucket | columns | typical role                           |
| ------ | ------------ | ------- | -------------------------------------- |
| xlarge | > 600 px     | 5       | wide hero card (desktop post detail)   |
| large  | > 400 px     | 4       | medium card (sidebar / split layout)   |
| medium | > 200 px     | 3       | narrow desktop column / wide mobile    |
| small  | ≤ 200 px     | 3       | tiny card (compact ad slot)            |

Each size × `state ∈ {default, expand}` × `orientation ∈ {landscape, portrait}` — up to 16 layout permutations — must render correctly. A per-size token bundle drives padding / gap / typography / CTA height; a CSS state selector swaps the visible content (default = hide desc + chips, expand = show everything); orientation toggles the row from `flex-row` (thumb beside details) to `flex-col` (thumb above details).

Story features (mirroring the existing `dynamic-linkout-embed.stories.tsx`):

- Resizable frame (CSS `resize: both`, drag bottom-right corner).
- Preset buttons (`300×600`, `320×250`, `300×250`, `320×100`, plus a few wide presets like `800×500`, `600×400`).
- "Expand" checkbox toggle.
- Stats line: `Frame: W × H px · Variant: state/size`.
- `ResizeObserver` reports the frame's `offsetWidth`/`offsetHeight` (border-box, matching preset buttons).

## 2. Picker logic (per Figma node 9322:136877)

```ts
// Size by frame outer width.
function pickSize(w: number): "xlarge" | "large" | "medium" | "small" {
  if (w > 600) return "xlarge";
  if (w > 400) return "large";
  if (w > 200) return "medium";
  return "small";
}

// Orientation by aspect ratio of the frame.
function pickOrientation(w: number, h: number): "landscape" | "portrait" {
  return h > w ? "portrait" : "landscape";
}
```

State (default vs expand) is **not** width-driven — it's a separate user-controlled toggle (maps to a Storybook arg / checkbox).

Overflow cascade (when the details column can't fit everything):

1. Drop description + chips.
2. If still overflowing, drop the inline CTA. Title and thumbnail always stay.

The reference does this in JS by reading `details.scrollHeight > details.clientHeight + 1` after a forced reflow, then setting `data-hide-meta` / `data-hide-cta` on the card.

## 3. Layout matrix (single DOM, attribute-driven CSS)

The card's DOM is **one** structure regardless of size / state / orientation; CSS selectors keyed off `data-size` / `data-state` / `data-orientation` swap the layout. Two CTA siblings live in the DOM at all times:

- `card__cta--inline` — sits inside the details column, often width: auto.
- `card__cta--full` — sits as a sibling below the thumb+details row, width: 100%.

Per-combination CTA visibility (from `styles.css`):

| state   | size   | orientation | CTA shown            | CTA width / position                          |
| ------- | ------ | ----------- | -------------------- | --------------------------------------------- |
| default | xlarge | landscape   | inline               | auto, sits under title in details column      |
| default | xlarge | portrait    | inline               | auto, pinned to bottom of details (justify-between) |
| default | large  | landscape   | inline               | auto                                          |
| default | large  | portrait    | inline               | auto                                          |
| default | medium | landscape   | inline               | full-width within details column              |
| default | medium | portrait    | inline               | auto                                          |
| default | small  | (any)       | full                 | full-width below the thumb+details row        |
| expand  | (any)  | landscape   | full                 | full-width below the thumb+details row        |
| expand  | (any)  | portrait    | full                 | content-width, left-aligned                   |

Per-size token bundle (CSS custom properties — pad / gaps / title / meta / CTA / radii). Reproduce the `styles.css` `.card[data-size="..."]` blocks. In Tailwind v4 we do this with `data-[size=xlarge]:` variants on the card root, OR by setting CSS custom properties from a small lookup table.

Layout ratios for thumb : details (full table in `styles.css`, lines 384–420). Examples:

- default × xlarge × landscape → thumb 3 : details 2
- expand × xlarge × landscape → thumb 2 : details 3
- default × xlarge × portrait → thumb 4 : details 1
- expand × small × portrait → thumb 1 : details 2

These all become Tailwind `flex-[N]` arbitrary values keyed off the data attributes.

## 4. Component changes

### 4.1 New `responsive` sheet state + `<LinkCard>` branch

Add the state to the dynamic-sheet's enum and types:

```ts
// packages/ui/src/components/dynamic-sheet/types.ts
export const DYNAMIC_SHEET_STATES = [
  "pl-xs",
  "pl-sml",
  "default",
  "default-active",
  "expand-view",
  "panel-view",
  "full-view",
  "responsive", // NEW
] as const;

export const DEFAULT_HEIGHTS: Record<DynamicSheetState, HeightValue> = {
  // ... existing
  responsive: "100%", // fills the host container
};
```

```ts
// packages/components/src/context/base/event-bus.ts
export type SheetState =
  | "pl-xs"
  | "pl-sml"
  | "default"
  | "default-active"
  | "expand-view"
  | "panel-view"
  | "full-view"
  | "responsive"; // NEW
```

```ts
// packages/components/src/hooks/use-sheet-state.ts (priority map)
const SHEET_STATE_PRIORITY: Record<SheetState, number> = {
  // ... existing values; pick a priority that puts `responsive` at or
  // above `panel-view` since it represents a full-card layout.
  responsive: 6, // example
};
```

`<LinkCard>` gets a new render branch keyed off the new state. Today's `isDetail` (panel-view + full-view) keeps its existing fixed portrait layout untouched; the responsive layout is its own branch:

```ts
const isResponsive = sheetState === "responsive"; // NEW
const isDetail = sheetState === "panel-view" || sheetState === "full-view"; // unchanged
```

`isResponsive` renders the new `wide/responsive` card structure, driven by `data-size` / `data-state` / `data-orientation` props (or context). `isDetail` is left exactly as today — production callers using `full-view` (e.g. mobile-expand drag flow) see no behavior change.

The new render is roughly:

```tsx
<div
  className={cn(...)}
  data-size={size}
  data-state={contentState}
  data-orientation={orientation}
  data-hide-meta={hideMeta || undefined}
  data-hide-cta={hideCta || undefined}
>
  <div className="card__main flex">
    <div className="card__thumb">{/* container-query square */}</div>
    <div className="card__details">
      <p className="card__title">{title}</p>
      <p className="card__desc">{description}</p>
      <div className="card__chips">{/* MetaRow chips */}</div>
      {/* inline CTA (default xl/large/medium) */}
      <CTA variant="inline" />
    </div>
  </div>
  {/* full-width CTA (small default + every expand) */}
  <CTA variant="full" />
</div>
```

The `card__thumb` uses CSS `container-type: size` + `width: min(100cqw, 100cqh)` so the thumbnail is always square based on its container — no JS measurement of the image area required.

### 4.2 Per-size token bundle

Mirror the per-size token bundles from Figma node 9322:136877 using **`class-variance-authority` (cva)** — the convention every other variant-driven component in this codebase uses (e.g. [`button.tsx`](packages/ui/src/components/button/button.tsx), [`chip.tsx`](packages/ui/src/components/chip/chip.tsx), [`dialog.tsx`](packages/ui/src/components/dialog/dialog.tsx), [`tooltip.tsx`](packages/ui/src/components/tooltip/tooltip.tsx), [`dynamic-sheet-parts.tsx`](packages/ui/src/components/dynamic-sheet/dynamic-sheet-parts.tsx)). Inline `style={{ "--var": "..." }}` is only used to bridge into third-party APIs (toaster → `sonner`); nothing in our component tree drives sizing through CSS custom properties.

Skeleton:

```ts
import { cva, type VariantProps } from "class-variance-authority";

// Per-size Tailwind class bundles. One `cva` per "slot" so the
// rules stay readable; share the `size` enum across them.
const cardRoot = cva("gencl:flex gencl:flex-col gencl:relative", {
  variants: {
    size: {
      xlarge: "gencl:p-6 gencl:gap-6 gencl:rounded-2xl",
      large:  "gencl:p-4 gencl:gap-4 gencl:rounded-xl",
      medium: "gencl:p-4 gencl:gap-3 gencl:rounded-xl",
      small:  "gencl:p-2 gencl:gap-2 gencl:rounded-lg",
    },
  },
});

const cardTitle = cva("gencl:font-semibold gencl:text-secondary-900", {
  variants: {
    size: {
      xlarge: "gencl:text-[36px] gencl:leading-[44px] gencl:tracking-[-0.2px]",
      large:  "gencl:text-[28px] gencl:leading-[36px] gencl:tracking-[-0.2px]",
      medium: "gencl:text-[20px] gencl:leading-[24px] gencl:tracking-[-0.1px]",
      small:  "gencl:text-body-1-semi-bold",
    },
  },
});

const cardCta = cva(
  "gencl:flex gencl:items-center gencl:gap-1 gencl:bg-secondary-900 gencl:text-white gencl:rounded-lg",
  {
    variants: {
      size: {
        xlarge: "gencl:h-14 gencl:py-4 gencl:pl-4 gencl:pr-2 gencl:text-[20px] gencl:leading-[24px]",
        large:  "gencl:h-12 gencl:py-3 gencl:pl-4 gencl:pr-2 gencl:text-[16px] gencl:leading-[22px]",
        medium: "gencl:h-10 gencl:py-2 gencl:pl-3 gencl:pr-2 gencl:text-[16px] gencl:leading-[22px]",
        small:  "gencl:h-7 gencl:py-1 gencl:pl-3 gencl:pr-1 gencl:text-[14px] gencl:leading-[20px]",
      },
    },
  },
);

// Plus `cardThumbInner`, `cardChips`, `cardCtaArrow`, etc. — one
// per slot whose values change with size (see Figma node 9322:136877).
```

For values that don't have a Tailwind utility (gap-chips-x at 8 px / 6 px / 6 px / 4 px, chip-icon at 14 / 12 / 10 / 9, tracking at -0.2 / -0.1 / 0, etc.) use Tailwind's arbitrary-value syntax: `gencl:gap-x-[6px]`, `gencl:[&_.chip__icon]:size-[10px]`, `gencl:tracking-[-0.1px]`. Avoids leaving the existing styling system.

State (`default` vs `expand`) and orientation (`landscape` vs `portrait`) are handled the same way — additional `variants:` keys in the same `cva` bundles, OR `compoundVariants:` for combinations like `default × small → use full-width CTA`. Same pattern `button.tsx` uses for size + variant combos.

### 4.3 Overflow cascade

JS-driven (matching the reference). New utility in the responsive branch:

```ts
function useOverflowCascade(detailsRef: RefObject<HTMLElement>) {
  const [hideMeta, setHideMeta] = useState(false);
  const [hideCta, setHideCta] = useState(false);

  // Re-run on any layout change:
  // - data-size, data-state, data-orientation changes (passed as deps)
  // - text reflow (description length, chip wrapping, CTA label)
  // - container ResizeObserver
  useLayoutEffect(() => {
    const el = detailsRef.current;
    if (!el) return;
    setHideMeta(false);
    setHideCta(false);
    // Force reflow, then read scrollHeight twice between adjustments.
    void el.offsetHeight;
    if (el.scrollHeight <= el.clientHeight + 1) return;
    setHideMeta(true);
    void el.offsetHeight;
    if (el.scrollHeight <= el.clientHeight + 1) return;
    setHideCta(true);
  }, [size, contentState, orientation, /* + ResizeObserver tick */]);

  return { hideMeta, hideCta };
}
```

`data-hide-meta` and `data-hide-cta` toggle CSS rules that hide `.card__desc` / `.card__chips` and the CTA siblings respectively. **Title and thumb always stay** — that's the priority order from the reference.

### 4.4 Drag indicator / header / footer (sheet chrome)

The responsive card *replaces* the existing sheet chrome. For the new `responsive` state:

- No drag indicator (the responsive card has no drawer affordance — it fills its container).
- No separate sheet header (the title is part of the card body).
- No separate sheet footer (the CTA is part of the card body, either inline or full-width depending on size+state).

Implementation: in `linkouts-dynamic.tsx`, suppress all three for `responsive`:

```ts
const isResponsiveState = linkoutsState === "responsive";
config.showIndicator = isResponsiveState ? false : config.showIndicator;
header = isResponsiveState ? undefined : header;
footer = isResponsiveState ? undefined : footer;
```

The dynamic-sheet's auto-height measurement still works — `measureContentRef` measures the responsive card's natural height. (The new scenario uses `height: "100%"` of its container, not auto, so measurement isn't on the critical path here.)

### 4.5 Scenario config — new `responsive` scenario

`linkouts-sheet-config.ts` currently has scenarios: `expand-mobile`, `expand-desktop-inside`, `expand-desktop-outside`, plus the embed buckets. None of them enable the new `responsive` state, so they're unaffected.

Add a single new scenario, `responsive`, that's the only place the new state is enabled. Callers opt in via `view="responsive"`:

```ts
case "responsive":
  return {
    scenario,
    config: {
      initialState: "responsive",
      enabledStates: ["responsive"],
      heights: { responsive: "100%" }, // fills the host container
      showClose: false,
      showOverlay: false,
      showIndicator: false,
      showFooter: false,
      disableDragAndSwipe: true,
      theme: "light",
    },
    showHeader: false,
    className: () => "gencl:w-full gencl:h-full",
    footerClassName: () => "",
  };
```

Picker mapping in `getLinkoutsConfig`:

```ts
if (view === "responsive") return "responsive";
```

Goes before the other view branches so `view="responsive"` short-circuits the embed/expand routing.

### 4.6 New `DynamicLinkoutsProps` knobs

Two small additions:

```ts
export interface DynamicLinkoutsProps {
  // ...existing
  /** Selects the responsive `full-view` layout (`view="responsive"`). */
  view?: "embed" | "expand" | "default" | "responsive" | null | undefined;
  /** For the responsive layout: which content state to show. */
  responsiveState?: "default" | "expand";
}
```

`responsiveState` defaults to `"default"`. When `view === "responsive"`, the harness passes the user-toggled value.

The size + orientation are computed inside the LinkCard responsive branch via a small `useResize` hook (or a context the card pulls from) — they're entirely container-driven, no caller input needed.

## 5. Storybook story — `dynamic-linkout-responsive.stories.tsx`

Mirrors `dynamic-linkout-embed.stories.tsx`'s structure; differences below.

```tsx
type ResponsiveHarnessProps = {
  /** "default" hides desc + chips, "expand" shows them. */
  contentState?: "default" | "expand";
  /** Forwarded to fixtures so the meta block has data. */
  richData?: boolean;
};

function ResponsiveHarness({ contentState = "default", richData = true }: ...) {
  setDeviceMode("desktop");
  const sheetState = useSheetState();
  // Seed parent state to "responsive" and force it to stick.
  const seededRef = useRef(false);
  if (!seededRef.current) {
    sheetState.openContentType("linkouts", "inside", "responsive");
    sheetState.setContentTypeState("linkouts", "responsive");
    seededRef.current = true;
  }

  const frameRef = useRef<HTMLDivElement>(null);
  const [frame, setFrame] = useState({ w: 800, h: 500 });
  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() =>
      setFrame({ w: el.offsetWidth, h: el.offsetHeight }),
    );
    ro.observe(el);
    setFrame({ w: el.offsetWidth, h: el.offsetHeight });
    return () => ro.disconnect();
  }, []);

  const size = pickSize(frame.w);
  const orientation = pickOrientation(frame.w, frame.h);

  return (
    <div>
      <Presets />
      <div ref={frameRef} className={frameStyles}>
        <DynamicLinkouts
          view="responsive"
          responsiveState={contentState}
          links={...}
          ctaText="Sign Up Now"
          ctaLink={...}
          isActive
          analyticsEventData={...}
        />
      </div>
      <Stats>{frame.w} × {frame.h} px · Variant: {contentState}/{size} · {orientation}</Stats>
    </div>
  );
}
```

Stories:

- `Responsive` — main interactive story. Args: `contentState` ("default" or "expand"), `richData` (true / false). Renders the resizable frame + presets + stats.
- `ResponsiveAllSizes` (optional grid story) — fixed-frame grid showing every size + both states side by side, no resize. Helpful for visual regression / docs.

The story file lives next to `dynamic-linkout-embed.stories.tsx`:

```
packages/components/src/organisms/linkouts/dynamic-linkout-responsive.stories.tsx
```

Storybook registers it automatically (path-based discovery).

## 6. Implementation order

1. **Plan landed (this doc)** — write down the matrix and the picker thresholds.
2. **New sheet state** — add `"responsive"` to `DYNAMIC_SHEET_STATES`, `DEFAULT_HEIGHTS`, the `SheetState` union in `event-bus.ts`, and the priority map in `use-sheet-state.ts`. Pure additive change — every existing switch-on-state remains exhaustive at compile time after the next step.
3. **New `linkouts-sheet-config.ts` scenario** — `responsive` case + `view: "responsive"` mapping in `getLinkoutsConfig`.
4. **`<DynamicLinkouts>` prop additions** — `view: "responsive"`, `responsiveState`. Wire suppression of indicator / header / footer when `linkoutsState === "responsive"`.
5. **`<LinkCard>` `isResponsive` branch** — new responsive structure with `data-size` / `data-state` / `data-orientation`. Per-size CSS-variable tokens. Two CTA siblings. Existing `isDetail` (panel/full-view) layout untouched.
6. **Size + orientation hook** — `useResize(ref)` returning `{ size, orientation }`. Used inside the LinkCard responsive branch (which gets a wrapping ref).
7. **Overflow cascade hook** — `useOverflowCascade(detailsRef, deps)` setting `data-hide-meta` / `data-hide-cta` after measuring `scrollHeight` vs `clientHeight`.
8. **Storybook story** — `dynamic-linkout-responsive.stories.tsx` with the resizable frame harness, presets, expand toggle, stats.
9. **No-regression check** — existing `panel-view` / `full-view` stories render byte-identical to before; the responsive layout only appears in the new story (and any caller that opts in via `view="responsive"`).

## 7. Risks & tradeoffs

- **One extra sheet state to maintain.** `responsive` joins `DYNAMIC_SHEET_STATES`, `SheetState`, `DEFAULT_HEIGHTS`, the priority map, and (where present) any exhaustive switch on state. TypeScript will surface the latter as missing-case errors when added — fix is a passthrough/no-op default for states the caller doesn't handle.
- **Two CTA buttons in the DOM.** Mirrors the reference; CSS picks which is visible. Slight DOM cost vs. conditional rendering, but it's what makes the size/state/orientation transitions glitch-free (no React re-mount per breakpoint).
- **Container queries (`container-type: size`)** — the thumbnail uses `100cqw` / `100cqh`. Modern browsers support this; older ones (Safari < 16, Firefox < 110) won't. We already gate on Safari 16.4+ in the component package; this matches.
- **Overflow cascade reads `scrollHeight` after a forced reflow.** Same trick the reference uses. Should work in jsdom for tests as long as we mock `scrollHeight` / `clientHeight`. Alternative: use ResizeObserver alone and skip the cascade — but then long titles + descriptions can break the layout.
- **No impact on existing states.** `full-view`, `panel-view`, etc. behave exactly as today. Mobile-expand drag and the desktop expand flows are untouched. The responsive card is reachable only when the caller passes `view="responsive"`.

## 7.1 Optional cleanup (status)

Two of the three originally-tracked primitives have been extracted to `link-card-primitives.tsx`:

1. **`<LinkCardThumb>`** ✅ — used by `isDefaultLike`, `isExpand`, and `isDetail` branches. The `pl-sml` chip (custom `4.8 px` radius) and the responsive card's container-query thumb keep their inline implementations.
2. **`<LinkCardInlineCta>`** ✅ — used by `isDefaultLike` and `isExpand` branches. The responsive card's CTA (solid `bg-secondary-900`, multiple width policies) keeps its own implementation in `responsive-card.tsx`.
3. **`<MetaChip>`** — **deferred**. The two call sites (`MetaRow` in `link-card.tsx` and `ResponsiveChips` in `responsive-card.tsx`) diverge: `MetaRow` chips use `className`-based icon sizing (`gencl:size-3`) and have per-chip extras like ellipsis on `address`; `ResponsiveChips` uses inline-style px sizing tied to the responsive bucket. Unifying would need a primitive with both APIs and per-chip-type tweaks — not a clean win. Leave inline.

## 8. Alternative considered (rejected)

We considered overloading `full-view` so the same state hosted both the existing portrait drawer AND the new responsive card, branching on a `view="responsive"` opt-in inside `<LinkCard>`. **Rejected** — overloading a state's semantics by caller-prop made the state's meaning context-dependent and risked breaking mobile-expand if a caller forgot to pass the opt-in. A new `responsive` state is cheaper to reason about: each state owns one layout.

## 9. Done criteria

- The Storybook frame at every preset (`300×600`, `320×250`, `300×250`, `320×100`, plus a few wide presets like `800×500`, `600×400`, `200×200`) renders the expected size/state/orientation per the reference HTML.
- Resizing the frame across the picker thresholds (200, 400, 600 px wide) live-swaps the layout without flicker or remount.
- The expand checkbox swaps between default (hide desc + chips) and expand (show all).
- The stats line agrees with the rendered card (frame dimensions match preset, variant matches `data-state` / `data-size`).
- Long titles / descriptions trigger the overflow cascade in priority order (drop chips first, then CTA; never drop the title or thumb).
- `pnpm --filter @genuin/components exec tsc --noEmit` passes.
- Visual diff: the new responsive layout matches Figma [node 9322:136877](https://www.figma.com/design/31vZmmekJ2UDRkvvv6EUIR/Genuin-Master-Design-System-V2?node-id=9322-136877&m=dev) for each size × state × orientation combination.
