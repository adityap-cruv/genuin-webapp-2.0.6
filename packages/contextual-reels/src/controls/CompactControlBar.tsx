"use client";

import { type PlayerControlSize } from "@genuin/ui/player-controls";
import React, { useLayoutEffect, useRef, useState } from "react";

import { ExpandCollapseButton } from "@cxr/controls/buttons/atoms/ExpandCollapseButton";
import { ExpandCollapseButtonV2 } from "@cxr/controls/buttons/atoms/ExpandCollapseButtonV2";
import { LinkoutButton } from "@cxr/controls/buttons/atoms/LinkoutButton";
import { MuteUnmuteButton } from "@cxr/controls/buttons/atoms/MuteUnmuteButton";
import { MuteUnmuteButtonV2 } from "@cxr/controls/buttons/atoms/MuteUnmuteButtonV2";
import { PlayPauseButton } from "@cxr/controls/buttons/atoms/PlayPauseButton";
import { PlayPauseButtonV2 } from "@cxr/controls/buttons/atoms/PlayPauseButtonV2";
import { WatchButton } from "@cxr/controls/buttons/atoms/WatchButton";
import { useAudioEngaged } from "@cxr/controls/useAudioEngaged";

const noop = (): void => undefined;

/**
 * Ticker scroll speed in CSS px per second. Duration is derived from the
 * rendered text width so the scroll speed stays constant for any description
 * length — short and long captions move at the same rate.
 */
const TICKER_PX_PER_SECOND = 40;

/** Identity shown in the compact bar's top row — avatar/logo and/or display name. */
export interface CompactBarIdentity {
  /** Avatar (video owner) or advertiser logo URL. */
  imageUrl?: string | null;
  /** Display name (owner nickname or advertiser name). */
  name?: string | null;
}

/** Linkout CTA rendered beside the Watch button when url + caption are present. */
export interface CompactBarCta {
  url: string;
  caption: string;
  logoUrl?: string;
  onClick?: () => void;
}

/** Props for {@link CompactControlBar}. */
export interface CompactControlBarProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Density: 'sm' = 320×50, 'md' = 320×100. */
  size: "sm" | "md";
  /** Top-row identity — image/name render only when present. */
  identity?: CompactBarIdentity | null;
  /** One-line truncated description row. Hidden when absent. */
  description?: string | null;
  /**
   * When true, suppress the scrolling description ticker and the Watch/Linkout
   * actions row — used in 320×100 when the Octo strip occupies that space, so
   * only identity + the icon cluster remain.
   */
  hideTickerAndActions?: boolean;
  /** Linkout CTA (ads) — renders beside Watch in 'md' when complete. */
  cta?: CompactBarCta | null;
  isPlay?: boolean;
  isMuted: boolean;
  isFullScreen?: boolean;
  animatedBorder?: boolean;
  onPlayClick?: () => void;
  /** Pre-toggled mute handler. */
  onMuteClick: () => void;
  onFullScreenClick?: () => void;
  /** Watch tap — falls back to onFullScreenClick. */
  onWatchClick?: () => void;
  /** Render the Design System V2 double-circle icons instead of the legacy set. */
  useV2Icons?: boolean;
  /**
   * 320×50 ad layout: genAd renders the description externally, so CXR drops the
   * ticker and shows a right-aligned Watch button on the second row instead.
   * Video sm ignores this and keeps its ticker-only second row.
   */
  showWatchInSm?: boolean;
}

/**
 * Data-driven compact (320×50 / 320×100) control bar shared by video chrome
 * (VideoControlLayer) and ad chrome (AdControlBar). Rows render based on the
 * data passed; the icon cluster and Watch row always render.
 */
export function CompactControlBar({
  size,
  identity,
  description,
  cta,
  isPlay,
  isMuted,
  isFullScreen = false,
  animatedBorder = true,
  hideTickerAndActions = false,
  onPlayClick,
  onMuteClick,
  onFullScreenClick,
  onWatchClick,
  useV2Icons = false,
  showWatchInSm = false,
  className,
  ...rest
}: CompactControlBarProps): React.JSX.Element {
  // A tap on THIS bar's mute button is itself an audio action — it ends the
  // enticement even when it sets the player TO muted. An audible-start unit
  // (initialVolume > 0) muted by tapping here never emits `mute:unmuted`
  // (PlayerProvider only emits on the unmuted transition), so without this
  // local latch the icon would keep showing "sound on" over actually-muted
  // playback. Mirrors AdControlBar's `muteToggled`.
  const [muteTapped, setMuteTapped] = useState(false);
  const handleMute = (): void => {
    setMuteTapped(true);
    onMuteClick();
  };
  // Enticement ends only on an audio action — a mute-button tap here OR a
  // `mute:unmuted` bus event (overlay unmute / another bar) — never on a
  // play/pause or other generic tap. See useAudioEngaged.
  const hasInteracted = useAudioEngaged(muteTapped);

  const showImage = Boolean(identity?.imageUrl);
  const showName = Boolean(identity?.name);
  const hasCta = Boolean(cta?.url && cta?.caption);
  // Linkout needs the md row height; in sm the CTA only affects Watch sizing.
  const showLinkout = hasCta && size === "md";
  const handleWatch = onWatchClick ?? onFullScreenClick ?? noop;
  // 320×50 (sm) → xs, 320×100 (md) → sm — matches resolveCxrControlSize's collapsed row.
  const v2Size: PlayerControlSize = size === "sm" ? "xs" : "sm";
  // Ad sm: drop the ticker (genAd renders it) and show only a Watch button.
  const showSmWatch = size === "sm" && showWatchInSm && !hideTickerAndActions;
  // Ticker renders for md and for video sm; ad sm suppresses it in favour of Watch.
  const showTicker = Boolean(description) && !hideTickerAndActions && !showSmWatch;

  // Constant scroll speed: derive duration from the measured text width instead
  // of the character count, so long captions don't whip past faster than short
  // ones. One span (text + trailing pad) is exactly the -50% scroll distance.
  const tickerSpanRef = useRef<HTMLSpanElement>(null);
  const [tickerDuration, setTickerDuration] = useState(12);
  useLayoutEffect(() => {
    const span = tickerSpanRef.current;
    if (!span) return;
    setTickerDuration(Math.max(4, span.offsetWidth / TICKER_PX_PER_SECOND));
  }, [description, size]);

  const containerClass =
    size === "sm"
      ? "gencl:h-full gencl:w-full gencl:flex gencl:flex-col gencl:items-end gencl:justify-between gencl:gap-0.5 gencl:px-0.5"
      : "gencl:h-full gencl:w-full gencl:flex gencl:flex-col gencl:justify-between gencl:p-1 gencl:gap-1";

  return (
    <div data-testid="compact-control-bar" className={`${containerClass} ${className ?? ""}`.trim()} {...rest}>
      <div data-testid="compact-bar-top-row" className="gencl:flex gencl:items-center gencl:gap-2 gencl:w-full">
        {showImage && (
          <img
            data-testid="compact-bar-identity-image"
            src={identity!.imageUrl!}
            alt={identity?.name ?? ""}
            className="gencl:w-6 gencl:h-6 gencl:rounded-lg gencl:object-cover gencl:shrink-0"
          />
        )}
        {showName && (
          <span
            data-testid="compact-bar-identity-name"
            className="gencl:text-white gencl:text-xs gencl:font-medium gencl:truncate gencl:flex-1 gencl:min-w-0">
            {identity!.name}
          </span>
        )}
        <div className="gencl:flex gencl:items-center gencl:gap-1 gencl:pointer-events-auto gencl:shrink-0 gencl:ml-auto">
          {useV2Icons ? (
            <>
              <MuteUnmuteButtonV2
                isMuted={hasInteracted ? isMuted : false}
                onClick={handleMute}
                size={v2Size}
                enableVolumeSlider={false}
                shouldAnimate={false}
                animatedBorder={animatedBorder}
              />
              <PlayPauseButtonV2
                isPlay={isPlay ?? false}
                onClick={onPlayClick ?? noop}
                size={v2Size}
                shouldAnimate={false}
              />
              <ExpandCollapseButtonV2 isFullScreen={isFullScreen} onClick={onFullScreenClick ?? noop} size={v2Size} />
            </>
          ) : (
            <>
              <MuteUnmuteButton
                animatedBorder={animatedBorder}
                isMuted={hasInteracted ? isMuted : false}
                onClick={handleMute}
                size={size}
              />
              <PlayPauseButton isPlay={isPlay ?? false} onClick={onPlayClick ?? noop} size={size} />
              <ExpandCollapseButton isFullScreen={isFullScreen} onClick={onFullScreenClick ?? noop} size={size} />
            </>
          )}
        </div>
      </div>

      {showTicker && (
        // Outer pill owns the background + side padding; the inner ticker mask
        // clips the scroll inside that padded area, so text keeps a hard ~8px
        // gap from the edges (no blurry fade).
        <div
          data-testid="compact-bar-description"
          className={`gencl:w-full gencl:max-w-full gencl:overflow-hidden ${
            size === "md" ? "gencl:px-2 gencl:py-0.5" : "gencl:px-1.5"
          }`}
          // Both sizes show the translucent pill; sm (50px) uses a tighter
          // radius and side padding so it stays proportional in the shorter bar.
          style={{
            borderRadius: size === "sm" ? "6px" : "8px",
            background: "rgba(19, 20, 21, 0.60)",
            backdropFilter: "blur(7.5px)",
            WebkitBackdropFilter: "blur(7.5px)",
          }}>
          <div className="cxr-ticker-mask gencl:w-full gencl:max-w-full">
            {/* Two identical copies + the -50% keyframe give a seamless loop; the
                duplicate is aria-hidden so screen readers announce the text once.
                Duration scales with length to keep a constant scroll speed. */}
            <div className="cxr-ticker-track" style={{ ["--cxr-ticker-duration" as string]: `${tickerDuration}s` }}>
              {[false, true].map((isClone) => (
                <span
                  key={isClone ? "clone" : "main"}
                  ref={isClone ? undefined : tickerSpanRef}
                  aria-hidden={isClone || undefined}
                  // sm pads the trailing gap proportionally to its smaller text.
                  className={`gencl:whitespace-nowrap ${size === "sm" ? "gencl:pr-6" : "gencl:pr-8"}`}
                  style={{
                    color: "#FFF",
                    fontFeatureSettings: "'liga' off, 'clig' off",
                    fontSize: size === "sm" ? "10px" : "12px",
                    fontStyle: "normal",
                    fontWeight: 500,
                    lineHeight: size === "sm" ? "14px" : "20px",
                    letterSpacing: 0,
                  }}>
                  {description}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 320×50 ad layout: genAd renders the description externally, so CXR shows
          only a right-aligned Watch button on the second row (no ticker). */}
      {showSmWatch && (
        <div
          data-testid="compact-bar-actions"
          className="gencl:flex gencl:justify-end gencl:z-15 gencl:pointer-events-auto gencl:ml-auto">
          {/* Compact for the 50px bar: tighten the button's vertical padding and
              type so the two rows fit within 320×50. */}
          <WatchButton
            isPlay={false}
            onClick={handleWatch}
            variant="rect"
            pulse
            style={{ fontSize: "11px", paddingTop: "3px", paddingBottom: "3px" }}
          />
        </div>
      )}

      {/* 320×50 (sm) shows only identity + ticker — no Watch/Linkout actions row.
          Hidden too when the Octo strip owns the 320×100 lower area. */}
      {size === "md" && !hideTickerAndActions && (
        <div
          data-testid="compact-bar-actions"
          className="gencl:w-full gencl:flex gencl:gap-1 gencl:h-8 gencl:rounded-full gencl:z-15 gencl:pointer-events-auto">
          <WatchButton
            isPlay={false}
            onClick={handleWatch}
            variant="rect"
            fullWidth={!showLinkout}
            pulse
            style={{ fontSize: "14px" }}
          />
          {showLinkout && (
            <LinkoutButton href={cta!.url} caption={cta!.caption} logoUrl={cta!.logoUrl} onClick={cta!.onClick} />
          )}
        </div>
      )}
    </div>
  );
}
