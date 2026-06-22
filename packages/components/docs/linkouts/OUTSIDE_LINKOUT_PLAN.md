# Plan — "Outside" linkout variants & Storybook category

## Goal

Add a "Dynamic Linkouts Outside View" storybook category that mirrors the existing
"Dynamic Linkouts Embed View" stories (`PlacementXSEmbed` / `PlacementSMLEmbed` /
`DefaultEmbed` / `DefaultActiveEmbed` / `ExpandViewEmbed`) but renders the linkout
**below the video frame** in a light-theme panel — matching Figma node
`10076:79915` (layout) and `10075:76988` (colours). The existing
`layout="outside"` API surface is reused; what changes is the harness layout, the
visual chrome (rounded corners, panel background, dot colours), and the panel's
attachment to the frame.

## What I read

| File | Key findings |
| --- | --- |
| `packages/components/src/organisms/linkouts/dynamic-linkout-embed.stories.tsx` | `EmbedHarness` renders the linkout *over* the video — a flex column with `justify-content: flex-end` plus `StoryVideoBackdrop` as an absolutely-positioned sibling of the linkout slot. The five stories to copy (`PlacementXSEmbed`, `PlacementSMLEmbed`, `DefaultEmbed`, `DefaultActiveEmbed`, `ExpandViewEmbed`) all pass `view="embed"` / `deviceMode="desktop"` and rely on the harness layout. |
| `packages/components/src/molecules/linkout-new/linkouts-sheet-config.ts` | `embed-outside-*` scenarios already exist (`embed-outside-xs` / `-sml` / `-default` / `-active` / `-expand`), reached when `view === "embed" && layout === "outside"`. All have `theme: "light"`, `disableDragAndSwipe: true`, `showIndicator: false`. Panel `className` is `"gencl:w-full gencl:rounded-none!"` — flush across all four corners, **doesn't match the Figma `rounded-bl-8 rounded-br-8`**. The colours are already light-theme. |
| `packages/components/src/molecules/linkout-new/linkout-item.tsx` | `<LinkoutCarouselDots>` accepts a `theme` prop but the active/inactive dot colours are hard-coded to `secondary-600` / `secondary-100` and the comment explicitly says `void theme;`. Figma shows light dots at gray-700 (`#585c61`) active and gray-150 (`#dfe1e3`) inactive — the current dot colours don't match. |
| `packages/components/src/molecules/linkout-new/link-card.tsx` | Branches on `theme === "dark"` for chip surfaces / text. Most of the light-theme path is in place. The bottom-of-card CTA pill in the outside Figma is `bg-secondary-900` (dark pill, white text) — verify the existing light-theme branch renders it as the Figma shows. |
| Figma `10076:79915` (layout reference) | Frame is `bg-[#131415]` + `rounded-tl-8 rounded-tr-8` only (bottom flush). Below the frame, a `Linkout-Link-OutPlayer` sibling: `bg-white` + `backdrop-blur-[5px]` + `rounded-bl-8 rounded-br-8`, attached flush to the frame's bottom edge. A `Carousel` dot strip sits below the linkout. |
| Figma `10075:76988` (colour reference, "Light" carousel variant) | Dots: active `gray-700` `#585c61`, inactive `gray-150` `#dfe1e3`. Panel: `bg-white`, `backdrop-blur-[5px]`. CTA pill: `bg-gray-900` `#1D1F20`, white label. |

## Constraints flagged

- **Shared-package change.** Touches `packages/components/molecules/linkout-new/*` (scenario config + carousel dot colours). Consumed by both `apps/webapp` and `packages/web-sdk`. Requires approval.
- **Public-API surface stays the same.** `layout="outside"` already exists on `<DynamicLinkouts>`. No new props — the only contract change is in the visual output of the existing outside scenarios. Hosts that already pass `layout="outside"` get the new visuals automatically (intended).
- **No new external dependencies.** Storybook stories + visual tweaks only.
- **Auth / CORS / CSP / security headers.** None.

## Plan

### Phase A — config + visuals

1. **`linkouts-sheet-config.ts`** — replace `gencl:rounded-none!` with bottom-only
   rounding in the `embed-outside-*` scenarios so the panel's bottom corners are
   `rounded-bl-8 rounded-br-8` while the top stays flush against the frame's
   bottom edge.

   Affected scenarios: `embed-outside-xs`, `embed-outside-sml`,
   `embed-outside-default`, `embed-outside-active`, `embed-outside-expand`.

   Extract a shared constant alongside `panelFullClassName`:

   ```ts
   // sketch — do not implement here
   const OUTSIDE_PANEL_CLASS =
     "gencl:w-full gencl:rounded-t-none! gencl:rounded-b-lg!";
   ```

   And replace each `className: () => "gencl:w-full gencl:rounded-none!"`
   with `className: () => OUTSIDE_PANEL_CLASS` so the five scenarios stay
   in lock-step.

2. **`linkout-item.tsx` (`<LinkoutCarouselDots>`)** — wire the `theme` prop
   to the dot colours instead of ignoring it.

   Verified token mapping against
   `packages/tailwind-config/shared-styles.css`:

   | Role | Dark theme | Light theme |
   | --- | --- | --- |
   | Active dot | `bg-secondary-600` (`#767b81`) | `bg-secondary-700` (`#585c61`) |
   | Inactive dot | `bg-secondary-100` (`#e9ebec`) | `bg-secondary-150` (`#dfe1e3`) |

   Implementation sketch:

   ```ts
   // sketch — do not implement here
   const activeBg = theme === "light" ? "gencl:bg-secondary-700" : "gencl:bg-secondary-600";
   const inactiveBg = theme === "light" ? "gencl:bg-secondary-150" : "gencl:bg-secondary-100";
   ```

   Drop the `void theme;` line in the same edit — it's the stub that
   suppressed the unused-var warning while the colours were hard-coded.

   The dots are rendered as a sibling of the dynamic sheet inside
   `linkouts-dynamic.tsx`; they're already passed `theme={baseConfig.theme}`.
   For `embed-outside-*` scenarios `baseConfig.theme === "light"`, so
   flipping the colour mapping is enough — no caller-side changes needed.

3. **`linkouts-dynamic.tsx` (or scenario config — see below)** — confirm the
   outer wrapper's `flex-end` justification keeps the linkout pinned to the
   bottom of its (sibling) host container. The outside layout has the linkout
   *below* the frame, not overlaid — the host's flex column with `justify-end`
   doesn't apply. The wrapper's current `flex-direction: column;
   justify-content: flex-end` doesn't break anything when the wrapper sits in
   a normal block flow (it just affects the children's vertical pack), so this
   is a no-op for the outside layout.

   *No code change* needed here — flagged so the implementer doesn't second-
   guess the wrapper style when reviewing the embed-vs-outside diff.

### Phase B — storybook category

4. **`packages/components/src/organisms/linkouts/dynamic-linkout-outside.stories.tsx`**
   *(new file)* — sibling of `dynamic-linkout-embed.stories.tsx`.

   Set `meta.title = "Organisms/Linkouts/Dynamic Linkouts Outside View"` so
   the storybook sidebar shows the new folder under the existing "Linkouts"
   group.

   Reuse the existing `SAMPLE_LINKS` / `LINKOUT_FIGMA_CTA` /
   `FeedContextStoryWrapper` / `useSeededLinkoutState` / `StoryVideoBackdrop`
   helpers from `_story-helpers.tsx` so the two harnesses share fixture
   data — no duplication.

   Define a new `OutsideHarness` that lays out the video and the linkout as
   *vertical siblings* (the layout reference from Figma `10076:79915`):

   ```tsx
   // sketch — do not implement here
   <div style={{ width: frameWidth }}>
     <div
       style={{
         width: "100%",
         height: frameHeight,
         position: "relative",
         borderTopLeftRadius: 8,
         borderTopRightRadius: 8,
         overflow: "hidden",
         background: "#131415",
       }}>
       <StoryVideoBackdrop ... />
       {/* Optional placement header (sponsored chip, controls) */}
     </div>
     {/* Linkout slot — sibling, attaches flush */}
     <DynamicLinkouts
       links={...}
       ctaText={...}
       ctaLink={...}
       isActive
       view="embed"
       layout="outside"  // ← the key change
       effectiveVideoWidth={frameWidth}
       aspectRatio="9:16"
       analyticsEventData={...}
     />
   </div>
   ```

   The harness explicitly does **not** use the `EmbedHarness`'s flex-end
   absolute-overlay layout — the outside layout is two stacked blocks.

5. Add the five stories matching the embed set:

   - `PlacementXSOutside` — `width: 180` (or whatever maps to `embed-outside-xs`)
   - `PlacementSMLOutside` — `width: 220`
   - `DefaultOutside` — `width: 280`
   - `DefaultActiveOutside` — `width: 360`
   - `ExpandViewOutside` — `width: 450`

   Each story passes the same `view` / `deviceMode` / `initialState` /
   `richData` argument shape as its embed sibling. The scenario picker
   automatically routes to `embed-outside-{xs,sml,default,active,expand}`
   because `layout="outside"`.

6. **`dynamic-linkouts-outside-view.doc.mdx`** *(new file)* — attach the
   docs page to the new story group via `<Meta of={Stories} />`. Base on
   `dynamic-linkouts-embed-view.doc.mdx` and adjust:

   - Lead with the "below-frame attachment" narrative: outside layout is
     a sibling of the player, not an overlay, and the panel's chrome is
     the light-theme white surface with bottom-only rounding.
   - Reuse the same variant tables (width buckets → `embed-outside-{xs,sml,default,active,expand}`).
     The width thresholds are identical to the embed picker
     (`linkouts-sheet-config.ts:111-115`); copy them verbatim.
   - Drop the embed-view-specific sections about the floating-card
     `mx-2` inset — outside layout uses `w-full`.
   - Include `<Canvas of={Stories.X} />` for each of the five new
     stories.

   Strip `tags: ["autodocs"]` from the stories' meta (matches the embed
   convention) so the MDX page is the canonical Docs tab.

### Phase C — tests

7. **No new unit tests needed for the wiring change** — the existing
   `linkouts-sheet-config.ts` scenarios were already reachable via
   `layout="outside"`. Phase A's edits are cosmetic and covered by the new
   Storybook canvas stories.

8. **`<LinkoutCarouselDots>` colour change** — colocate a small unit test
   that mounts the dots in both themes and asserts the right Tailwind class
   appears. Optional but cheap; gives confidence the next "light theme"
   addition doesn't regress.

## Decisions made

- **`default-active` auto-advance on outside layout.** Keep enabled —
  the existing `autoAdvance: [{ from: "default", to: "expand-view", delayMs: 3000 }]`
  on the `embed-outside-default` / `embed-outside-active` scenarios stays
  intact. Outside layout matches embed parity.
- **Rounded-top frame chrome.** Inline in `OutsideHarness` inside
  `dynamic-linkout-outside.stories.tsx`. No helper extraction unless a
  second consumer appears later.
- **Light-theme dot tokens.** Use existing tailwind tokens (verified
  against `packages/tailwind-config/shared-styles.css`): active =
  `bg-secondary-700`, inactive = `bg-secondary-150` (light theme); dark
  theme stays at `bg-secondary-600` / `bg-secondary-100`. No new token
  introductions needed.

## Open questions

None — proceed with implementation.

## Recommended approach

Land in one PR. Phase A and Phase B are independent in scope but share the
same review surface ("outside linkout looks right") — splitting would just
force a reviewer to switch contexts.

Order within the PR:
1. Lift the panel className to a shared `OUTSIDE_PANEL_CLASS` constant in
   `linkouts-sheet-config.ts` and apply to all five scenarios (Phase A.1).
2. Make `<LinkoutCarouselDots>`'s `theme` prop real (Phase A.2).
3. Write the new `OutsideHarness` + five stories + the meta file
   (Phase B.4-5).
4. Optional: dot-colour unit test (Phase C.8).

`<FeedPlayer>` and the production link-card path are unchanged — the only
production-visible effect is that callers passing `layout="outside"` get the
new visuals automatically. If that's not desired for the current production
callers, gate the new visuals behind a `legacyOutsideStyling` boolean and
flip it per-caller; recommend not gating and just updating callers in the
same PR (small surface).
