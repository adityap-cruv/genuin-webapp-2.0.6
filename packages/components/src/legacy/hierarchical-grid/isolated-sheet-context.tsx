"use client";

import { useMemo, type ReactNode } from "react";

import { BaseContext, useBaseContext } from "@genuin/components/context/base/context";
import { createBaseEventBus } from "@genuin/components/context/base/event-bus";

/**
 * Wraps `children` in a fresh `BaseContext` whose event bus is scoped
 * to this subtree. Inherits everything else (brand details, embed
 * details, axios instances, etc.) from the parent context.
 *
 * Why each cell needs its own bus:
 *
 * `<DynamicLinkouts>` reads its sheet state from the nearest
 * `BaseContextProvider`'s event bus, keyed by the singleton content
 * type `"linkouts"`. With multiple `<DynamicLinkouts>` instances on
 * the same page (which is the whole point of this template), they
 * would all share one state — and the embed scenarios (`default`,
 * `default-active`, `expand-view`) and the responsive scenario
 * (`responsive`) don't have a compatible shared state. The first
 * cell to push a state would force every other cell into the wrong
 * state, collapsing the layout.
 *
 * Isolating the event bus per cell gives each instance its own
 * state machine. A fresh bus pre-registers `linkouts` with state
 * `"default"` (see `createBaseEventBus`), so the linkout
 * component's resolver falls through to the scenario's
 * `initialState` — exactly what every cell needs.
 *
 * See HIERARCHICAL_GRID_PLAN.md § 8 (bridge component) for the
 * cell composition rationale.
 */
export function IsolatedSheetContext({ children }: { children: ReactNode }) {
  const parent = useBaseContext();
  const isolatedBus = useMemo(() => createBaseEventBus(), []);
  const value = useMemo(() => ({ ...parent, baseEventBus: isolatedBus }), [parent, isolatedBus]);
  return <BaseContext.Provider value={value}>{children}</BaseContext.Provider>;
}
