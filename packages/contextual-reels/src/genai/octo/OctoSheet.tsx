"use client";
/**
 * OctoSheet — size-aware dispatcher that routes to the correct Octo variant.
 *
 * The dispatcher resolves the embed format and renders output only for the
 * variant that belongs to the calling {@link OctoSheetProps.host}. Multiple
 * hosts can mount `<OctoSheet host=…>` without double-rendering.
 *
 * The private {@link OctoSheetLadder} contains the original sheet-state-machine
 * logic and is only reachable via the `"bottombar"` host.
 */
import { DynamicSheet } from "@genuin/ui/dynamic-sheet";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";

import { resolveAdLayout, type AdLayoutId } from "@cxr/config";
import { useGenAI } from "@cxr/providers/GenAIProvider";

import { OctoCountdownStrip } from "./OctoCountdownStrip";
import { OctoSdkPanel } from "./OctoSdkPanel";
import { OctoSplitView } from "./OctoSplitView";
import { MOBILE_PHASE_MAP, type OctoPhase } from "./octo-phase-map";
import { getOctoSheetConfig, octoFractionForState } from "./octoSheetConfig";
import { useOctoSheetState } from "./useOctoSheetState";

/** Props for {@link OctoSheet}. */
export interface OctoSheetProps {
  /** Stable per-widget instance id. */
  instanceId: string;
  /** Current reel's video id. */
  videoId: string;
  /** Advertiser/brand id (from `tagDetails.customer_id`). */
  brandId?: number;
  /** Player container size in CSS px. */
  dimensions: { width: number; height: number };
  /** Whether the player is fullscreen. */
  isFullScreen: boolean;
  /** Only the active reel drives the sheet. */
  isActive: boolean;
  /** Tag id used for the GenAI allow-list check inside variant components. */
  tagId: string;
  /**
   * Which host mounts this instance. The dispatcher renders output only when the
   * resolved variant belongs to the calling host, else `null` — so multiple
   * hosts can mount `OctoSheet` without double-rendering.
   * - `"bottombar"` → 300×600 and any fullscreen (sheet ladder)
   * - `"split"`     → 300×250 non-fullscreen (50/50)
   * - `"compact"`   → 320×100 / 320×50 non-fullscreen (countdown strip)
   */
  host: "bottombar" | "split" | "compact";
  /**
   * Optional resolved ad-layout id. When provided, the dispatcher uses it
   * directly instead of measuring via `resolveAdLayout(dimensions)`. Required for
   * the compact formats (320×50 / 320×100), whose host skips size measurement so
   * `dimensions` is `{0,0}`.
   */
  adLayoutHint?: AdLayoutId;
}

/** Sheet states that render the SDK in its dense "full" chat mode. */
const FULL_STATES = new Set(["panel-view", "full-view"]);

/**
 * Size-aware Octo dispatcher. Resolves the embed format and routes to the
 * correct variant, rendering output only for the variant that belongs to the
 * calling {@link OctoSheetProps.host}.
 *
 * @param props - {@link OctoSheetProps}
 */
export function OctoSheet(props: OctoSheetProps): React.JSX.Element | null {
  const { dimensions, isFullScreen, host, brandId } = props;

  // Don't render Octo without a brand ID.
  // if (!brandId) return null;

  // Fullscreen (any size) keeps the mobile sheet ladder regardless of outer size.
  if (isFullScreen) {
    return host === "bottombar" ? <OctoSheetLadder {...props} /> : null;
  }

  const layoutId = props.adLayoutHint ?? resolveAdLayout(dimensions.width, dimensions.height);

  switch (layoutId) {
    case "desktop-300x250":
      return host === "split" ? <OctoSplitView {...props} /> : null;
    case "mobile-320x100":
      return host === "compact" ? <OctoCountdownStrip {...props} variant="100" /> : null;
    case "mobile-320x50":
      return host === "compact" ? <OctoCountdownStrip {...props} variant="50" /> : null;
    case "unknown":
      return null;
    case "desktop-300x600":
    default:
      return host === "bottombar" ? <OctoSheetLadder {...props} /> : null;
  }
}

/**
 * Render the dimension-aware Octo dynamic-sheet for one reel.
 * Private — only reachable via the {@link OctoSheet} dispatcher with `host="bottombar"`.
 *
 * @param props - {@link OctoSheetProps}
 * @returns The sheet, or `null` when GenAI is not allowed / no video.
 */
function OctoSheetLadder({
  instanceId,
  videoId,
  brandId,
  dimensions,
  isFullScreen,
  isActive,
}: OctoSheetProps): React.JSX.Element | null {
  const wrapperRef = useRef<HTMLDivElement>(null);
  // The player container (`[data-testid="video-layout"]`) is the positioned
  // ancestor the expanded sheet pins to AND the height base for its % heights —
  // resolved from the wrapper's closest matching ancestor.
  const [playerContainer, setPlayerContainer] = useState<HTMLElement | null>(null);
  const playerContainerRef = useRef<HTMLElement | null>(null);
  playerContainerRef.current = playerContainer;

  // Cousin channel to VideoLayout: the active reel publishes the sheet's share
  // of the container so the player can shrink to `1 - fraction` above it.
  const { setOctoFraction } = useGenAI();

  useLayoutEffect(() => {
    const el = wrapperRef.current?.closest<HTMLElement>('[data-testid="video-layout"]') ?? null;
    setPlayerContainer(el);
  }, []);

  const { octoSheetState, octoHidden, applyPhase, handleSheetStateChange, handleClose } = useOctoSheetState({
    isActive,
  });

  // Monotonic key bumped on each `isActive` false→true edge. Passed to
  // OctoSdkPanel so a revisited reel gets a full SDK destroy + fresh init,
  // dropping any stale chat/prompt state from the previous visit. Mirrors the
  // `wasActiveRef` edge-detection pattern in useOctoSheetState.
  const [activationKey, setActivationKey] = useState(0);
  const wasActiveRef = useRef(false);
  useEffect(() => {
    const wasActive = wasActiveRef.current;
    wasActiveRef.current = isActive;
    if (isActive && !wasActive) setActivationKey((key) => key + 1);
  }, [isActive]);

  const { config, className } = getOctoSheetConfig({ dimensions, isFullScreen, octoState: octoSheetState });

  const renderMode: "compact" | "full" = FULL_STATES.has(octoSheetState) ? "full" : "compact";

  // Only the active reel drives the split. Publish the sheet's container share
  // (0 when collapsed/hidden) so VideoLayout shrinks the player to `1 - share`.
  // Reset to 0 when this reel goes inactive so a backgrounded reel never holds
  // the player shrunk for the next one.
  const shouldSplit = isActive && !octoHidden;
  const fraction = shouldSplit ? octoFractionForState(octoSheetState) : 0;
  useEffect(() => {
    if (!isActive) return;
    setOctoFraction(fraction);
  }, [isActive, fraction, setOctoFraction]);
  useEffect(() => {
    if (!isActive) return;
    return () => setOctoFraction(0);
  }, [isActive, setOctoFraction]);

  // Map an inbound SDK phase to a sheet view (always uses the mobile ladder).
  const onLifecyclePhase = (phase: OctoPhase) => {
    const view = MOBILE_PHASE_MAP[phase];
    applyPhase(view);
  };

  if (!videoId) return null;

  const isOpen = isActive && !octoHidden;

  // Collapsed states render inline in normal flow; the expanded panel/full
  // states pin to the player container's bottom (`absolute bottom-0`) and size
  // as a % of it, so the chat occupies 70%/100% of the embed and the video
  // defers to it (30/70 within the unit). `containerRef` points at the player
  // container so DynamicSheet measures the right height base.
  return (
    <div ref={wrapperRef} className="gencl:w-full">
      <DynamicSheet
        isOpen={isOpen}
        renderMode="inline"
        controlledState={octoSheetState}
        containerRef={playerContainerRef}
        className={className(octoSheetState)}
        config={{
          ...config,
          onStateChange: handleSheetStateChange,
          onClose: handleClose,
          // Swipe/drag only disabled in the dense panel/full-view states (chat
          // owns the gesture there); collapsed states stay swipeable.
          disableDragAndSwipe: FULL_STATES.has(octoSheetState),
        }}
        headerClassName="gai:text-body-1-semi-bold! gai:p-2!">
        <OctoSdkPanel
          instanceId={instanceId}
          videoId={videoId}
          brandId={brandId}
          renderMode={renderMode}
          isOpen={isOpen}
          activationKey={activationKey}
          onLifecyclePhase={onLifecyclePhase}
        />
      </DynamicSheet>
    </div>
  );
}
