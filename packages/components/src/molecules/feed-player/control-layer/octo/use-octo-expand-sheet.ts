"use client";
import type { DynamicSheetState } from "@genuin/ui/dynamic-sheet";
import { useEffect, useState } from "react";

import { useEmbedConfigs } from "@genuin/components/hooks/embed/use-embed-config";
import { useSheetState } from "@genuin/components/hooks/use-sheet-state";

import { useOctoSheetManagement } from "./use-octo-sheet-management";

type UseOctoExpandSheetProps = {
  isActive: boolean;
};

/**
 * Hook that owns all Octo expand-sheet state and logic for the expand view.
 *
 * Extracts everything previously computed inside `OctoExpandSheet` so that
 * `ExpandViewDetails` can read `isOctoVisible` (and the rest of Octo state)
 * directly rather than receiving it via an `onVisibilityChange` callback.
 */
export function useOctoExpandSheet({ isActive }: UseOctoExpandSheetProps) {
  const { engagement } = useEmbedConfigs();
  const isOctoEnabled = engagement.engagementTools.octo;

  const {
    hasContentType,
    getContentTypeState,
    setContentTypeState,
    resetSheet,
    octoHidden,
    setOctoHidden,
    setOctoVisible,
  } = useSheetState();
  const octoSheetState: DynamicSheetState = getContentTypeState("octo");

  const [shouldShowOcto, setShouldShowOcto] = useState(false);

  useEffect(() => {
    setShouldShowOcto(false);
    if (!isActive) return;
    const timer = setTimeout(() => setShouldShowOcto(true), 100);
    return () => {
      clearTimeout(timer);
      resetSheet();
    };
  }, [isActive, resetSheet]);

  const octoSheetManagement = useOctoSheetManagement({
    isActive,
    isOctoEnabled,
    shouldShowOcto,
    octoSheetState,
    setContentTypeState,
    resetSheet,
    octoHidden,
    setOctoHidden,
    setOctoVisible,
  });

  const isCompactOctoState =
    !octoSheetState ||
    octoSheetState === "default" ||
    octoSheetState === "default-active" ||
    octoSheetState === "expand-view";
  const octoRenderMode: "compact" | "full" = isCompactOctoState ? "compact" : "full";

  const isSwipeBlocked =
    hasContentType("octo") &&
    (octoSheetState === "default" || octoSheetState === "default-active" || octoSheetState === "expand-view");

  return {
    isOctoEnabled,
    shouldShowOcto,
    octoSheetState,
    octoRenderMode,
    isSwipeBlocked,
    ...octoSheetManagement,
  };
}
