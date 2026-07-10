import type { AdCtaDetails } from "@cxr/ads/genAdSdk";
import type { AdLayoutId } from "@cxr/config";
import type { NormalisedReel, TagResponse } from "@cxr/types";

/** Supported UI variant identifiers for the control layer. */
export type ControlLayerVariant = "default" | "iheart";

/** Full prop surface for the ControlLayer orchestrator. */
export interface ControlLayerProps {
  variant: ControlLayerVariant;
  item: NormalisedReel;
  tagDetails: TagResponse;
  dimensions: { width: number; height: number };
  isActive: boolean;
  isFullScreen: boolean;
  isMuted: boolean;
  isPlay: boolean;
  animatedBorder?: boolean;
  onMuteClick: () => void;
  onPlayClick: () => void;
  onFullScreenClick: () => void;
}

/** Full prop surface for the VideoControlLayer orchestrator. */
export interface VideoControlLayerProps extends ControlLayerProps {
  /** The numeric embed layout id (see `AD_LAYOUT`). */
  adLayout: AdLayoutId;
}

/** Full prop surface for the AdControlLayer. */
export interface AdControlLayerProps {
  isFullScreen: boolean;
  isPlay: boolean;
  isMuted: boolean;
  adLayout: AdLayoutId;
  /**
   * Whether the ad slot has received a fill or definitive no-fill from the waterfall.
   * Controls are hidden while this is false (ad is still loading).
   */
  isAdReady: boolean;
  variant?: "old" | "new";
  /** CTA details from the ad SDK — when present, linkout button renders with these values. */
  ctaDetails?: AdCtaDetails | null;
  onPlayClick: () => void;
  onMuteClick: (muted: boolean) => void;
  onFullScreenClick: () => void;
  /**
   * DOM container id of the ad slot this control layer drives. Forwarded to each
   * {@link ClickOverlayProps} so a tap can emit `ad:unmuteRequest` targeting the
   * exact slot (instance isolation when multiple ads share one widget bus).
   */
  containerId: string;
  /**
   * Fullscreen-redirect mode. Single source of truth is
   * {@link FullScreenContextValue.isRedirectMode}, read once in `AdLayout` and
   * threaded down. Required (no default) so the compiler forces every hop to
   * forward it — a silent `false` default could diverge from the real value.
   * When true, both the expand button and the Watch button are hidden (the CTA
   * click-through is carried by the ad tap / linkout button instead).
   */
  redirectMode: boolean;
}

/** Props forwarded to the TopBar router. */
export interface TopBarProps {
  variant: ControlLayerVariant;
  isFullScreen: boolean;
  isMuted: boolean;
  isPlay: boolean;
  isActive?: boolean;
  onMuteClick: () => void;
  onPlayClick: () => void;
  onFullScreenClick: () => void;
}

/** Props forwarded to the BottomBar router. */
export interface BottomBarProps {
  variant: ControlLayerVariant;
  item: NormalisedReel;
  tagDetails: TagResponse;
  dimensions: { width: number; height: number };
  isActive: boolean;
  isFullScreen: boolean;
  isMuted: boolean;
  isPlay: boolean;
  instanceId: string;
  onMuteClick: () => void;
  onPlayClick: () => void;
}

/**
 * Props passed to TopBar leaf components.
 *
 * `variant` IS forwarded — DefaultTopBar uses it to decide which buttons to show
 * (iheart shows only the expand/collapse button; default shows mute+play+expand).
 * Optional here (unlike {@link TopBarProps}) since callers may omit it, defaulting
 * to `"default"` behaviour.
 */
export type TopBarSubProps = Omit<TopBarProps, "variant"> & { variant?: ControlLayerVariant };

/**
 * Props passed to BottomBar leaf components.
 *
 * Unlike TopBarSubProps, `variant` IS forwarded — DefaultBottomBar uses it to decide
 * the action-icon set (iheart shows all 4; default shows spark?/share? per config).
 * Optional here (unlike {@link BottomBarProps}) since callers may omit it, defaulting
 * to `"default"` behaviour.
 */
export type BottomBarSubProps = Omit<BottomBarProps, "variant"> & { variant?: ControlLayerVariant };

/** Props for VideoBanner sub-component (300x600 / 300x250). */
export interface VideoBannerProps {
  isFullScreen: boolean;
  variant: ControlLayerVariant;
  item: NormalisedReel;
  tagDetails: TagResponse;
  dimensions: { width: number; height: number };
  isActive: boolean;
  isMuted: boolean;
  isPlay: boolean;
  /**
   * When true, a non-fullscreen tap on the video area expands to fullscreen
   * (`onFullScreenClick`) instead of toggling mute. Set for the 300x250 / 300x600
   * banner layouts (tap-to-expand) and the 300x250 Octo overlay. Defaults to false.
   */
  expandOnTap?: boolean;
  /**
   * When true, the banner chrome (TopBar / BottomBar) is hidden, leaving only the
   * bare video + tap overlay. Used by the 300x250 Octo overlay, where Octo owns
   * the chrome. Independent of {@link expandOnTap}. Defaults to false.
   */
  hideChrome?: boolean;
  onMuteClick: () => void;
  onPlayClick: () => void;
  onFullScreenClick: () => void;
}

/** Props for the shared ClickOverlay atom. */
export interface ClickOverlayProps {
  /**
   * When false, a tap unmutes the ad at a default audible volume (by emitting
   * `ad:unmuteRequest` for {@link containerId} plus a user-sourced mute-state
   * update). When true, a tap toggles play/pause.
   */
  isFullScreen: boolean;
  onFullScreenClick: () => void;
  onPlayClick: () => void;
  /**
   * DOM container id of the ad slot this overlay covers. When present, a
   * non-fullscreen tap emits `ad:unmuteRequest` for it so the matching
   * `useGenAdInstance` (and only that one) performs the gesture-bound SDK
   * volume+unmute. Omitted for non-ad (video) control layers, which have no
   * GenAd slot to target — those still update player mute state on tap.
   */
  containerId?: string;
  /**
   * When false, a non-fullscreen tap does NOT unmute (no `ad:unmuteRequest`
   * emit, no mute-state update). Tap-to-unmute is only allowed for the compact
   * 320x50 / 320x100 ad layouts; the default (fullscreen-style) layout passes
   * false. Defaults to true.
   */
  allowUnmute?: boolean;
  /**
   * When true, a non-fullscreen tap calls {@link onFullScreenClick} (expand)
   * instead of unmuting. Takes precedence over {@link allowUnmute}. Used by the
   * 300x250 Octo overlay layout. Defaults to false.
   */
  expandOnTap?: boolean;
}

/** Props for the new AdControlBar component. */
export interface AdControlBarProps {
  isPlay?: boolean;
  isMuted: boolean;
  isFullScreen?: boolean;
  /**
   * Controls which bar layout to render.
   * - '320x50'  — compact single-row: mute + play + expand (tiny icons)
   * - '320x100' — two-row: top-right controls + bottom Watch/Linkout row
   * - 'default' — top-right absolute cluster (fullscreen-style)
   */
  layout: "320x50" | "320x100" | "default";
  onPlayClick?: () => void;
  /** Called with the new muted state when toggle fires. */
  onMuteClick: (muted: boolean) => void;
  onFullScreenClick?: () => void;
  /** CTA details from the ad SDK — when present, linkout button renders. */
  ctaDetails?: AdCtaDetails | null;
  /**
   * Fullscreen-redirect mode. Single source of truth is
   * {@link FullScreenContextValue.isRedirectMode}, read once in `AdLayout` and
   * threaded down. Required (no default) so the compiler forces every hop to
   * forward it. When true, both the expand button and the Watch button are
   * hidden (the CTA click-through is carried by the ad tap / linkout button).
   */
  redirectMode: boolean;
}
