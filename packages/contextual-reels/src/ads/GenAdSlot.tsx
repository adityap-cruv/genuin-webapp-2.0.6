/**
 * `GenAdSlot` — presentation component for a single in-feed ad slot.
 *
 * Delegates all SDK lifecycle logic to `useGenAdInstance`. This component
 * is responsible only for layout, shimmer, and audio-ad UI chrome.
 *
 * @remarks
 * The component intentionally mirrors `AdsPlaceholder.jsx` in structure so
 * the JSX file can be removed once Phase 2 is fully wired.
 */

import { SafeSuspense } from "@genuin/components/molecules/error/safe-suspense";
import { useEffect, useRef } from "react";

import { useGenAdInstance, type UseGenAdInstanceOptions } from "@cxr/ads/genAdSdk";

// ---------------------------------------------------------------------------
// Inline UI atoms (replaces deleted legacy components/common/Shimmer.jsx)
// ---------------------------------------------------------------------------

/** Animated shimmer placeholder shown while an ad slot loads. */
function Shimmer(): React.JSX.Element {
  return (
    <div
      data-testid="shimmer"
      className="gencl:absolute gencl:inset-0"
      style={{
        background: "linear-gradient(90deg, #1a1a1a 25%, #2a2a2a 50%, #1a1a1a 75%)",
        backgroundSize: "200% 100%",
        animation: "shimmer 1.5s infinite",
      }}
    />
  );
}

/** Slot physical dimensions in CSS pixels. */
interface Dimensions {
  width?: number;
  height?: number;
}

/** Props for `GenAdSlot`. */
export interface GenAdSlotProps extends UseGenAdInstanceOptions {
  dimensions?: Dimensions;
  isFullScreen?: boolean;
  isPlay?: boolean;
  onPlayClick?: () => void;
  onFullScreenClick?: () => void;
  isAudioAds?: boolean;
  /** Optional override — forwarded from parent when known. */
  adLoaded?: boolean;
  /** Called whenever the per-slot adLoaded state changes — lets parents react to fill/no-fill. */
  onAdLoadedChange?: (loaded: boolean) => void;
  /**
   * Called when the ad starts playing.
   * Mirrors how `onAdCompleted` and `onMuteClick` are forwarded — passed
   * through to `useGenAdInstance` which wires it to the GenAd SDK's
   * `onStageStart` callback when `stage === 'play'`.
   */
  onAdPlay?: () => void;
  /**
   * Called when the ad pauses.
   * Mirrors `onAdPlay` — wired to `onStageStart` when `stage === 'pause'`.
   */
  onAdPause?: () => void;
  /** Called when the ad SDK provides CTA details. */
  onAdCTA?: UseGenAdInstanceOptions["onAdCTA"];
}

/**
 * Render a single in-feed ad slot.
 *
 * The SDK mounts inside `<div id={containerId}>`. A shimmer is shown while
 * the ad is loading. Audio-ad UI chrome (tap-to-expand, mute/play controls)
 * is overlaid when the slot is in audio-only mode.
 *
 * @example
 * ```tsx
 * <GenAdSlot
 *   id={item.id}
 *   isActive={isActive}
 *   isMuted={isMuted}
 *   platforms={platforms}
 *   tagDetails={tagDetails}
 *   item={item}
 *   destroySignal={destroySignal}
 *   dimensions={dimensions}
 *   isFullScreen={isFullScreen}
 * />
 * ```
 */
export function GenAdSlot(props: GenAdSlotProps): React.JSX.Element {
  const { dimensions, isFullScreen = false, isPlay, tagDetails, onAdLoadedChange, ...hookProps } = props;

  // Ref attached to the SDK mount target div so `useGenAdInstance` can read
  // the actual rendered dimensions when computing banner size.
  const containerRef = useRef<HTMLDivElement | null>(null);

  const { adLoaded, containerId } = useGenAdInstance({ ...hookProps, isPlaying: isPlay, tagDetails, containerRef });

  // Notify parent when adLoaded changes so AdLayout can gate AdControlLayer rendering.
  useEffect(() => {
    onAdLoadedChange?.(adLoaded);
  }, [adLoaded, onAdLoadedChange]);

  const containerStyle: React.CSSProperties = {
    height: isFullScreen ? "100%" : (dimensions?.height ?? 0) > 0 ? `${dimensions!.height}px` : "100%",
    width: isFullScreen ? "100%" : (dimensions?.width ?? 0) > 0 ? `${dimensions!.width}px` : "100%",
    position: "absolute",
    top: 0,
    left: 0,
  };

  return (
    <div style={containerStyle} data-testid="gen-ad-slot">
      <div
        ref={containerRef}
        id={containerId}
        className="gencl:w-full gencl:h-full gencl:flex gencl:justify-center gencl:flex-col"
      />

      {/* Shimmer placeholder while the SDK hasn't loaded an ad yet */}
      {!adLoaded && (
        <SafeSuspense fallback={null}>
          <Shimmer />
        </SafeSuspense>
      )}
    </div>
  );
}
