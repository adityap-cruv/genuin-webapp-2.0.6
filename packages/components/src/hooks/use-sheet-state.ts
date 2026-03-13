"use client";

import { useState, useEffect, useCallback, useMemo } from "react";

import { useBaseContext } from "@genuin/components/context/base/context";
import type {
  SheetState,
  SheetContentType,
  SheetContentPlacement,
  BaseEventBusContext,
} from "@genuin/components/context/base/event-bus";

// Priority order for deriving the "most expanded" global sheet state.
const STATE_PRIORITY: Record<SheetState, number> = {
  default: 0,
  "default-active": 1,
  "expand-view": 2,
  "panel-view": 3,
  "full-view": 4,
};

function getMostExpandedState(
  states: Partial<Record<SheetContentType, SheetState>>,
): SheetState {
  let max: SheetState = "default";
  for (const state of Object.values(states)) {
    if (state && STATE_PRIORITY[state] > STATE_PRIORITY[max]) max = state;
  }
  return max;
}

/**
 * Hook for reading and updating bottom-sheet state.
 *
 * Each content type independently owns its visual sheet state via `sheetContentStates`.
 * `sheetState` is a derived convenience value (the "most expanded" state across all
 * active types) for components that only care about global open/closed status.
 */
export function useSheetState() {
  const { baseEventBus } = useBaseContext();

  const [activeSheetContentTypes, setActiveSheetContentTypes] = useState<
    SheetContentType[]
  >(() => baseEventBus.getContext().activeSheetContentTypes || []);

  const [sheetContentStates, setSheetContentStates] = useState<
    Partial<Record<SheetContentType, SheetState>>
  >(() => baseEventBus.getContext().sheetContentStates || {});

  const [sheetContentPlacements, setSheetContentPlacements] = useState<
    Partial<Record<SheetContentType, SheetContentPlacement>>
  >(() => baseEventBus.getContext().sheetContentPlacements || {});

  // ── Subscriptions ─────────────────────────────────────────────────────────

  useEffect(() => {
    const onStateChange = (_: unknown, ctx: BaseEventBusContext) => {
      setSheetContentStates(ctx.sheetContentStates);
    };
    baseEventBus.on("sheetStateChange", onStateChange);
    return () => baseEventBus.off("sheetStateChange", onStateChange);
  }, [baseEventBus]);

  useEffect(() => {
    const onTypeChange = (_: unknown, ctx: BaseEventBusContext) => {
      setActiveSheetContentTypes(ctx.activeSheetContentTypes);
      setSheetContentPlacements(ctx.sheetContentPlacements);
      setSheetContentStates(ctx.sheetContentStates);
    };
    baseEventBus.on("sheetContentTypeChange", onTypeChange);
    return () => baseEventBus.off("sheetContentTypeChange", onTypeChange);
  }, [baseEventBus]);

  // ── Derived ───────────────────────────────────────────────────────────────

  /**
   * The "most expanded" sheet state across all active content types.
   * Useful for components that only care whether any sheet is open (e.g. disabling swiper).
   */
  const sheetState = useMemo(
    () => getMostExpandedState(sheetContentStates),
    [sheetContentStates],
  );

  // ── Helpers ───────────────────────────────────────────────────────────────

  /** Returns true if the given content type is currently active. */
  const hasContentType = useCallback(
    (type: SheetContentType) => activeSheetContentTypes.includes(type),
    [activeSheetContentTypes],
  );

  /** Returns the current sheet state for a content type, defaulting to "default". */
  const getContentTypeState = useCallback(
    (type: SheetContentType): SheetState =>
      sheetContentStates[type] ?? "default",
    [sheetContentStates],
  );

  /** Updates the sheet visual state for a specific content type. */
  const setContentTypeState = useCallback(
    (type: SheetContentType, state: SheetState) => {
      baseEventBus.emit("sheetStateChange", undefined, (ctx) => ({
        ...ctx,
        sheetContentStates: { ...ctx.sheetContentStates, [type]: state },
      }));
    },
    [baseEventBus],
  );

  /** Opens a content type. If already active, updates its placement only. */
  const openContentType = useCallback(
    (
      type: SheetContentType,
      placement: SheetContentPlacement = "inside",
      initialState: SheetState = "default",
    ) => {
      baseEventBus.emit("sheetContentTypeChange", undefined, (ctx) => {
        const alreadyActive = ctx.activeSheetContentTypes.includes(type);
        return {
          ...ctx,
          activeSheetContentTypes: alreadyActive
            ? ctx.activeSheetContentTypes
            : [...ctx.activeSheetContentTypes, type],
          sheetContentPlacements: {
            ...ctx.sheetContentPlacements,
            [type]: placement,
          },
          sheetContentStates: {
            ...ctx.sheetContentStates,
            [type]: alreadyActive
              ? ctx.sheetContentStates[type] ?? initialState
              : initialState,
          },
        };
      });
    },
    [baseEventBus],
  );

  /** Closes a content type, removing its state and placement. */
  const closeContentType = useCallback(
    (type: SheetContentType) => {
      baseEventBus.emit("sheetContentTypeChange", undefined, (ctx) => {
        const placements = { ...ctx.sheetContentPlacements };
        delete placements[type];
        const states = { ...ctx.sheetContentStates };
        delete states[type];
        return {
          ...ctx,
          activeSheetContentTypes: ctx.activeSheetContentTypes.filter(
            (t) => t !== type,
          ),
          sheetContentPlacements: placements,
          sheetContentStates: states,
        };
      });
    },
    [baseEventBus],
  );

  /**
   * Toggles a content type — opens if not active, closes if already active.
   */
  const toggleContentType = useCallback(
    (
      type: SheetContentType,
      placement: SheetContentPlacement = "inside",
      initialState: SheetState = "default",
    ) => {
      baseEventBus.emit("sheetContentTypeChange", undefined, (ctx) => {
        if (ctx.activeSheetContentTypes.includes(type)) {
          const placements = { ...ctx.sheetContentPlacements };
          delete placements[type];
          const states = { ...ctx.sheetContentStates };
          delete states[type];
          return {
            ...ctx,
            activeSheetContentTypes: ctx.activeSheetContentTypes.filter(
              (t) => t !== type,
            ),
            sheetContentPlacements: placements,
            sheetContentStates: states,
          };
        }
        return {
          ...ctx,
          activeSheetContentTypes: [...ctx.activeSheetContentTypes, type],
          sheetContentPlacements: {
            ...ctx.sheetContentPlacements,
            [type]: placement,
          },
          sheetContentStates: {
            ...ctx.sheetContentStates,
            [type]: initialState,
          },
        };
      });
    },
    [baseEventBus],
  );

  /** Clears all active content types, states and placements. */
  const resetSheet = useCallback(() => {
    baseEventBus.emit("sheetContentTypeChange", undefined, (ctx) => ({
      ...ctx,
      activeSheetContentTypes: [],
      sheetContentPlacements: {},
      sheetContentStates: {},
    }));
  }, [baseEventBus]);

  return {
    // Derived global state — "most expanded" across all active types.
    // Kept for backward compat with player.tsx, player-swiper.tsx, link-item-card.tsx.
    sheetState,
    activeSheetContentTypes,
    sheetContentStates,
    sheetContentPlacements,
    hasContentType,
    getContentTypeState,
    setContentTypeState,
    openContentType,
    closeContentType,
    toggleContentType,
    resetSheet,
  } as const;
}
