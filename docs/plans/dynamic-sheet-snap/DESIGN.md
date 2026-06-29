# Dynamic Sheet — Snap-Point Drag Rework (Design Spike)

> **Status:** Draft / spike · **Owner:** TBD · **Target:** post-2.0.6 (not the 2.0.6 release branch).
>
> Replaces `DynamicSheet`'s hand-rolled, step-by-step / commit-on-release drag with a
> continuous, **velocity-projected snap-point** model; decouples the generic sheet from
> linkout scenario knowledge; makes the sheet a **single controlled** component. Addresses
> the PR #244 review: *"dynamic sheet behaviour is not smooth (target: Instagram comment
> section)"* and *"sheet-state-management is complex, can be simpler."* These are two
> symptoms of one cause — fixing them is one redesign.

---

## 1. Trigger & scope

**Driver scenario.** A video opened full-screen from a carousel/grid/feed on **any viewport
too narrow to fit the comments + linkout right panels** — i.e. **mobile (always narrow),
tablet (often), and narrow desktop** — so the linkout renders as an **in-player overlay over
the bottom of the video** (the `expand-mobile` / `expand-desktop-inside` family of
scenarios). In that overlay the linkout has five states, ascending by screen space:

```text
default ─ default-active ─ expand ─ panel ─ full
```

Today these are switched by dragging the drag indicator. We want the drag to feel like the
Instagram comment sheet.

**Scope of the change.** Although that scenario is the driver, the rework is to the
**generic `DynamicSheet`** (`packages/ui`) for **all** consumers — it is treated as a new
feature, not a scoped patch (decided). Consumers today: linkouts, comments, octo (§9).

---

## 2. Current state — why it's both unsmooth and complex

`DynamicSheet` is a discrete state machine (`SheetState` enum) × per-scenario
`enabledStates`/`heights` config, driving **CSS transitions**, with two behaviour knobs and
a measurement hack:

- `stepByStepSwipeUp: true` — each drag-release advances exactly **one** state, regardless
  of how far you dragged.
- `commitOnDragEnd: true` — the drag is **visual-only** and the state commits at pointer-up
  (added to hide mid-drag flicker through intermediate snap heights).
- `autoHeightProvider` — renders hidden per-state "measurement wells" to resolve `"auto"`
  heights and stop adjacent states (`default` ↔ `default-active`) colliding on the same
  height (the drag-time "blink").

Files: [`use-dynamic-sheet.ts`](../../../packages/ui/src/components/dynamic-sheet/use-dynamic-sheet.ts),
[`dynamic-sheet.tsx`](../../../packages/ui/src/components/dynamic-sheet/dynamic-sheet.tsx),
[`types.ts`](../../../packages/ui/src/components/dynamic-sheet/types.ts),
[`linkouts-sheet-config.ts`](../../../packages/components/src/molecules/linkout-new/linkouts-sheet-config.ts).

**Not smooth** because: CSS transitions aren't interruptible (can't grab mid-animation), and
`commitOnDragEnd` + `stepByStepSwipeUp` mean the release ignores velocity and position.
**Complex** because: the generic sheet knows linkout vocabulary; there are **two sources of
truth** (the sheet's internal `currentState` synced to the parent's `linkoutsState` via an
`initialState` override); and the measurement-well + collision logic exists only to patch
the discrete-height model.

---

## 3. Locked decisions

| # | Decision |
|---|---|
| a | Drop `stepByStepSwipeUp`. On release, **velocity-projected snap to the nearest distinct-height state** (release at `panel` height ⇒ `panel`, even starting from `default-active`). Drop `commitOnDragEnd` — the panel follows the finger continuously. |
| b | `default` / `default-active` are **non-drag** (collapsed rest, reached by auto-advance / tap / dragging below the lowest snap). Drag snap points are the **distinct-height** states: `expand · panel · full`. This removes the height-collision the well/blink hacks fought. |
| c | The change is to the **generic** sheet, for **all** consumers. |
| d | The sheet is a **single controlled component** (parent owns state); generic sheet is **decoupled** from domain/scenario knowledge. |

---

## 4. Target model

States become points on a continuous height axis. The sheet's entire contract:

```ts
interface DynamicSheetProps {
  /** Ascending by height. `"auto"` = measured from content (§7). */
  snapPoints: { id: string; height: number | "auto" }[];
  /** Controlled: the currently-committed snap id. */
  activeId: string;
  /** Fired when a drag/tap resolves to a snap (or to dismiss). */
  onSnap: (id: string) => void;
  /** Resistance past the top snap / below the bottom (rubber-band). */
  dragElastic?: number;
  header?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;     // scrollable body
  // …theme, close affordance, etc.
}
```

Behaviour:
1. **Follow the finger** in `y` while dragging the indicator; rubber-band past the extremes.
2. **On release**, compute the target = snap point nearest the released height, **projected
   by velocity** (a fast flick travels further than a slow drag to the same point), then
   **spring-animate** to it. Animations are **interruptible** (re-grab mid-flight).
3. Dragging **below the lowest snap** past a threshold → collapse/dismiss.
4. **Tap on the indicator** = advance one snap (kept; orthogonal to drag).
5. The sheet emits `onSnap(id)`; the **consumer** maps that id to its domain state. The
   sheet never owns the state.

This single rule replaces `stepByStepSwipeUp`, `commitOnDragEnd`, and the bespoke snap math.

---

## 5. Decoupling — generic sheet vs. domain

Today the generic sheet knows linkout concepts (`SheetState` values like `expand-view` /
`panel-view`, per-scenario config). Target: the sheet knows only `snapPoints` + `activeId` +
`onSnap`. The **linkout / comments / octo** layers own their own state sets, auto-advance
rules, and the mapping `domainState ↔ snapId`.

Benefits:
- Sheet has **one responsibility** (drag → snap → report) and is unit-testable in isolation.
- Comments and octo **reuse** it without inheriting linkout's enum or scenario config.
- Consumers evolve their state sets **without editing shared `packages/ui`** (the
  change-class our guardrails most restrict).
- A small generic contract is what makes the "generic for everyone" rollout (§9) tractable.

---

## 6. What gets deleted vs. kept

| Deleted / replaced | Kept (cleaner) |
|---|---|
| `stepByStepSwipeUp`, `commitOnDragEnd` + bespoke step/snap math | Per-snap **height** resolution (now plain snap positions) |
| Two-sources-of-truth state sync (`initialState` override) | Time-based `autoAdvance` (`default→default-active→expand`) — orthogonal to drag |
| `autoHeightProvider` hidden measurement wells + adjacent-collision logic | `"auto"` height **measurement**, via ResizeObserver on the real node (§7) |
| `SheetState` linkout vocabulary inside the sheet | Header / footer / scrollable-body slots; pull-to-dismiss; content-scroll ↔ sheet-drag handoff |

---

## 7. Auto-height measurement (an unavoidable concern)

Snapping needs a **pixel height per snap point** to position the panel mid-drag and to
compute nearest-snap on release. `panel`/`full` are static (`70vh` / `100%`), but the
collapsed rest and `expand` are **`"auto"`** — they hug content whose height depends on the
link's data (one line vs. image + chips + CTA), so it's only known after render.

- **Why it stays:** you can't snap to a height you haven't measured.
- **Why it's simpler than today:** decision (b) made `default`/`default-active` non-drag, so
  there's no longer a collision to avoid between near-identical `auto` heights — we need
  *one* collapsed height and *one* `expand` height, not anti-collision rendering.
- **Cleaner mechanism:** observe the **real content node** with a `ResizeObserver` (heights
  update live as data / late-loading images reflow) instead of rendering parallel hidden
  wells. The wells and their footguns go away.

---

## 8. Animation / gesture engine — the open call (PoC decides)

The locked behaviour needs velocity, inertia, spring, and interruptible animation. Options:

| Option | What it gives | Cost |
|---|---|---|
| **Framer Motion (`motion`)** | `drag="y"` + `dragElastic` + inertia + spring `animate()`, interruptible, `useDragControls` to drag from the indicator. The velocity-snap + interruptibility we want, mostly for free. | New dep + **web-sdk bundle** weight (we gate on `check-chunk-size`). Needs team approval. |
| **@use-gesture + minimal spring** | Tiny gesture lib for drag/velocity; pair with a small spring (or hand-rolled rAF spring) for the animation. | More glue code; smaller bundle than Framer. |
| **Hand-rolled (rAF spring + velocity sampler)** | No dep, full control, zero bundle cost. | Re-implements the exact physics that's hard to get right — the reason the current sheet isn't smooth. Highest implementation risk. |
| **Vaul** | Purpose-built sheet w/ snap points. | **Rejected:** Radix-Dialog/modal-based; our overlay is **inline, non-modal** over the video. Poor fit. |

**The PoC's job is to retire this call with data** (§10): build the driver scenario with
**Framer** and with **@use-gesture + small spring**, measure the **gzipped web-sdk bundle
delta** of each, and compare feel (velocity accuracy, interruptibility).

### 8.1 PoC results — bundle cost (measured)

Marginal gzipped cost of each engine's realistic used surface, React externalized
(esbuild micro-bundle; reproducible via [`bundle-measure.mjs`](./bundle-measure.mjs)):

| Engine | minified | **gzipped** |
|---|---|---|
| @use-gesture (gesture only; spring hand-rolled) | 19.9 KB | **6.7 KB** |
| @use-gesture + @react-spring/web | 61.7 KB | **23.3 KB** |
| Framer `LazyMotion` + `m` (optimized) | 75.2 KB | **26.8 KB** |
| Framer `motion.div` (default import) | 128.1 KB | **42.7 KB** |
| Hand-rolled | 0 | **0** |

Versions: `motion@12`, `@use-gesture/react@10`, `@react-spring/web@10`.

**Reading:** the part of "hand-rolled" that is genuinely risky is the **gesture/velocity
layer** — pointer/touch normalization + velocity sampling across browsers (iOS Safari).
**@use-gesture solves exactly that for 6.7 KB**, leaving only the **snap spring** to
hand-roll — a rAF spring toward a target height (~30 lines; interruptible = re-point the
target). So `@use-gesture + tiny hand-rolled spring` buys down the real risk at a fraction
of Framer's weight (6.7 KB vs 27–43 KB). For an embeddable, chunk-size-gated SDK that gap
is material. Framer's only real edge is polished interruptible springs out of the box, at
+20–36 KB.

### 8.2 PoC results — feel (decided)

Built the driver overlay as a prototype (`packages/ui/src/components/dynamic-sheet/poc/`,
`@use-gesture` + animation, Storybook story) and tuned it live. Findings:

- A **spring is the wrong model here.** Tuning for the desired feel drove stiffness to the
  max and made damping imperceptible — i.e. the wanted feel is a fast, *non-springy* snap
  with no overshoot to shape. The spring was replaced by a **single ease-out cubic tween**.
- Final feel: **`projectionMs = 800`, `durationMs = 150`.** `projectionMs 800` means a flick
  overshoots the whole frame, so the gesture reads as **flick → extreme snap in that
  direction, slow drag → nearest snap** (standard bottom-sheet behaviour). `durationMs 150`
  is the snappy ease to the resolved target.
- The tween is **frame-rate-stable** (no explicit-Euler instability), so it's also safer for
  production than the high-stiffness spring would have been.

### 8.3 Decision

**Engine: `@use-gesture/react` (6.7 KB) for gesture + velocity, + a ~10-line ease-out tween
for the snap.** No spring library. Rationale: the bundle is a fraction of Framer's
(6.7 KB vs 26.8–42.7 KB), and the feel PoC proved we use **none** of Framer's spring/inertia
sophistication — we tuned it out. The model drops `stiffness`/`damping` entirely; the only
animation knobs are `projectionMs` (fling reach) and `durationMs` (ease duration).

---

## 9. Consumer inventory & rollout

Generic-for-everyone means migrating every `DynamicSheet` consumer onto the snap-point API:

- **Linkouts** — `linkouts-dynamic.tsx` + `linkouts-sheet-config.ts` (the driver).
- **Comments** — the comment sheet (currently the disabled `DynamicSheet` block in
  `expand-view-details.tsx`; Instagram-comments is the explicit visual target).
- **Octo** — `use-octo-sheet-management.ts` / `octo-dynamic-sheet.tsx`.

**Rollout — direct cutover (revised).** The snap-point behaviour is *new and unreleased*, so
there is no production behaviour to preserve — we **do not** keep a dual old+new API or an
adapter, and we don't gate on stories as a production-safety net. We rework the sheet's
contract and update all three consumers as **one coherent change**:

1. Evolve the PoC `SnapSheet` into the production generic sheet (the new `DynamicSheet`):
   the full contract — `snapPoints` (px or `"auto"`), controlled `activeId`, `onSnap`,
   header / footer / scrollable body, close. **Port the existing sheet's iOS scroll ↔ drag
   handoff** (the proven `handleContent*` pull-to-close logic) so the hard-won gesture fixes
   carry over — don't reinvent them.
2. Migrate the three consumers (linkouts, comments, octo) to the new contract; each maps its
   domain states onto snap points and owns its own auto-advance.
3. Delete the old machinery (`stepByStepSwipeUp`, `commitOnDragEnd`, `autoHeightProvider`
   wells, scenario coupling).

"Generic" here is **not an extra component** — it's the one shared sheet, decoupled from
linkout vocabulary so it serves all three consumers without duplication. Stories remain a
dev sanity aid, not a release gate.

---

## 10. PoC — plan & exit criteria

Spike on the **driver scenario only** (the in-player overlay), in Storybook + the running app
(`https://localhost:3002/?design_system=v2`), exercised across the viewport classes that hit
it — **mobile, tablet, and narrow desktop** (the desktop case is reproduced by narrowing the
window until the right panels drop). Touch (mobile/tablet) and pointer (desktop) must both
be covered:

Exit criteria:
1. Drag `expand → panel → full` and back; **release at a height lands on that snap** (the
   locked requirement: `default-active` dragged to panel-height ⇒ `panel`).
2. A **fast flick** projects further than a slow drag to the same point (velocity).
3. Animations are **interruptible** (grab mid-spring).
4. Drag below the lowest snap **collapses/dismisses**.
5. **Bundle delta measured** for Framer vs @use-gesture in the web-sdk, within budget (or
   the overage documented for the approval decision).
6. A written **engine recommendation**.

---

## 11. Risks

- **Blast radius** — shared `packages/ui` component touching all consumers. → build generic,
  migrate consumer-by-consumer, with stories as the regression net.
- **iOS Safari gesture/scroll** — the existing content-scroll ↔ sheet-drag handoff and
  pointer-capture behaviour (and the `swiper-no-swiping` / `noSwiping` interplay we just
  fixed for the inner link swiper) **must be preserved**. The hard-won fixes documented in
  the (now-trimmed) comments are load-bearing — don't regress them.
- **Web-sdk bundle** — embeddable; a new animation dep is a real budget question (§8).
- **Accessibility** — keyboard / programmatic state changes must still drive the sheet
  (snap by `activeId`, not only by gesture).

---

## 12. Open questions

1. ~~**Engine** (§8) — pending the PoC bundle/feel numbers.~~ **Resolved: `@use-gesture` + ease-out tween** (no spring). See §8.1–8.3.
2. Do **comments** and **octo** want the *same* velocity-snap feel, or different snap sets?
   (They get the same mechanism regardless; only their `snapPoints` differ.)
3. Does any consumer still need **time-based auto-advance** to interact with drag, or is
   auto-advance purely a non-drag entry path? (Assumed the latter.)
