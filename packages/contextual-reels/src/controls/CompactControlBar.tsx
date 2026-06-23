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
  onPlayClick,
  onMuteClick,
  onFullScreenClick,
  onWatchClick,
  useV2Icons = false,
  className,
  ...rest
}: CompactControlBarProps): React.JSX.Element {
  const showImage = Boolean(identity?.imageUrl);
  const showName = Boolean(identity?.name);
  const hasCta = Boolean(cta?.url && cta?.caption);
  // Linkout needs the md row height; in sm the CTA only affects Watch sizing.
  const showLinkout = hasCta && size === "md";
  const handleWatch = onWatchClick ?? onFullScreenClick ?? noop;
  // 320×50 (sm) → xs, 320×100 (md) → sm — matches resolveCxrControlSize's collapsed row.
  const v2Size: PlayerControlSize = size === "sm" ? "xs" : "sm";

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
      ? "gencl:h-full gencl:w-full gencl:flex gencl:flex-col gencl:items-end gencl:justify-between gencl:gap-0.5 gencl:p-0.5"
      : "gencl:h-full gencl:w-full gencl:flex gencl:flex-col gencl:justify-between gencl:p-1 gencl:gap-0.5";

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
                isMuted={isMuted}
                onClick={onMuteClick}
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
              <ExpandCollapseButtonV2
                isFullScreen={isFullScreen}
                onClick={onFullScreenClick ?? noop}
                size={v2Size}
              />
            </>
          ) : (
            <>
              <MuteUnmuteButton animatedBorder={animatedBorder} isMuted={isMuted} onClick={onMuteClick} size={size} />
              <PlayPauseButton isPlay={isPlay ?? false} onClick={onPlayClick ?? noop} size={size} />
              <ExpandCollapseButton isFullScreen={isFullScreen} onClick={onFullScreenClick ?? noop} size={size} />
            </>
          )}
        </div>
      </div>

      {description && (
        <div
          data-testid="compact-bar-description"
          className={`cxr-ticker-mask gencl:w-full gencl:max-w-full gencl:px-2 ${size === "md" ? "gencl:py-0.5" : ""}`}
          // md shows the translucent pill; sm (50px) scrolls the same ticker with no background.
          style={
            size === "sm"
              ? undefined
              : {
                  borderRadius: "8px",
                  background: "rgba(19, 20, 21, 0.60)",
                  backdropFilter: "blur(7.5px)",
                  WebkitBackdropFilter: "blur(7.5px)",
                }
          }>
          {/* Two identical copies + the -50% keyframe give a seamless loop; the
              duplicate is aria-hidden so screen readers announce the text once.
              Duration scales with length to keep a constant scroll speed. */}
          <div className="cxr-ticker-track" style={{ ["--cxr-ticker-duration" as string]: `${tickerDuration}s` }}>
            {[false, true].map((isClone) => (
              <span
                key={isClone ? "clone" : "main"}
                ref={isClone ? undefined : tickerSpanRef}
                aria-hidden={isClone || undefined}
                className="gencl:whitespace-nowrap gencl:pr-8"
                style={{
                  color: "#FFF",
                  fontFeatureSettings: "'liga' off, 'clig' off",
                  fontSize: "12px",
                  fontStyle: "normal",
                  fontWeight: 500,
                  lineHeight: "20px",
                  letterSpacing: 0,
                }}>
                {description}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 320×50 (sm) shows only identity + ticker — no Watch/Linkout actions row. */}
      {size === "md" && (
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
