"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useBaseContext } from "@genuin/components/context/base/context";
import type {
  SheetState,
  SheetContentType,
  BaseEventBusContext,
} from "@genuin/components/context/base/event-bus";

/**
 * Hook that subscribes to the base event bus for sheet state and content type changes.
 * Consolidates the duplicated subscription logic previously scattered across
 * `PlayerList` and `ExpandViewDetails`.
 *
 * @returns Current sheet state, content type, and helper functions to update them.
 */
export function useSheetState() {
  const { baseEventBus } = useBaseContext();

  const [sheetState, setSheetState] = useState<SheetState>(
    () => baseEventBus.getContext().sheetState,
  );

  const [sheetContentType, setSheetContentType] = useState<SheetContentType>(
    () => baseEventBus.getContext().sheetContentType,
  );

  // Subscribe to sheet state changes
  useEffect(() => {
    const handleStateChange = (_: unknown, context: BaseEventBusContext) => {
      setSheetState(context.sheetState);
    };

    baseEventBus.on("sheetStateChange", handleStateChange);

    return () => {
      baseEventBus.off("sheetStateChange", handleStateChange);
    };
  }, [baseEventBus]);

  // Subscribe to sheet content type changes
  useEffect(() => {
    const handleContentTypeChange = (
      _: unknown,
      context: BaseEventBusContext,
    ) => {
      setSheetContentType(context.sheetContentType);
    };

    baseEventBus.on("sheetContentTypeChange", handleContentTypeChange);

    return () => {
      baseEventBus.off("sheetContentTypeChange", handleContentTypeChange);
    };
  }, [baseEventBus]);

  /**
   * Update the sheet state in the event bus and notify all subscribers.
   */
  const updateSheetState = useCallback(
    (state: SheetState) => {
      baseEventBus.emit(
        "sheetStateChange",
        undefined,
        (currentContext) => ({
          ...currentContext,
          sheetState: state,
        }),
      );
    },
    [baseEventBus],
  );

  /**
   * Update the sheet content type in the event bus and notify all subscribers.
   */
  const updateSheetContentType = useCallback(
    (contentType: SheetContentType) => {
      baseEventBus.emit(
        "sheetContentTypeChange",
        undefined,
        (currentContext) => ({
          ...currentContext,
          sheetContentType: contentType,
        }),
      );
    },
    [baseEventBus],
  );

  /**
   * Track any pending reset timeout so we can cancel it when a new state is requested.
   */
  const resetTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /**
   * Convenience: reset both sheet state and content type to defaults.
   * Cancels any pending reset before scheduling a new one to avoid stale events.
   */
  const resetSheet = useCallback(() => {
    if (resetTimeoutRef.current) {
      clearTimeout(resetTimeoutRef.current);
      resetTimeoutRef.current = null;
    }

    updateSheetContentType("default");
    // Small delay to let the content type update propagate before resetting state
    resetTimeoutRef.current = setTimeout(() => {
      updateSheetState("default");
      resetTimeoutRef.current = null;
    }, 100);
  }, [updateSheetState, updateSheetContentType]);

  useEffect(() => {
    return () => {
      if (resetTimeoutRef.current) {
        clearTimeout(resetTimeoutRef.current);
      }
    };
  }, []);

  return {
    sheetState,
    sheetContentType,
    updateSheetState,
    updateSheetContentType,
    resetSheet,
  } as const;
}
