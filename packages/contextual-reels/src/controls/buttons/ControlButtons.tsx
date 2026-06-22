/**
 * Legacy compact control bar used by AdControlLayer variant="old".
 * New code should use the atom components in ./atoms/ directly.
 */
"use client";

import React from "react";

import { assetLink } from "@cxr/config";

/** Props shared by all control button atoms. */
export interface ControlButtonProps {
  /** Click handler. */
  onClick: () => void;
  /** Rendered size of the icon image. Defaults per button type. */
  size?: { height: string; width: string };
  /** Merged onto the outer `<button>` inline style. */
  style?: React.CSSProperties;
}

const DEFAULT_ICON_SIZE = { height: "24px", width: "24px" } as const;
const DEFAULT_WATCH_ICON_SIZE = { height: "14px", width: "14px" } as const;

function PlayPauseButton({
  isPlay,
  onClick,
  size = DEFAULT_ICON_SIZE,
  style,
}: ControlButtonProps & { isPlay: boolean }): React.JSX.Element {
  const src = `${assetLink}reactions/iheartmedia/cxr/${isPlay ? "pause" : "play"}.svg`;
  return (
    <button
      data-testid="play-pause-btn"
      aria-label={isPlay ? "Pause" : "Play"}
      onClick={onClick}
      className="gencl:border-0 gencl:p-[9px] gencl:rounded-full gencl:cursor-pointer gencl:flex"
      style={style}>
      <img src={src} style={size} alt={isPlay ? "Pause" : "Play"} />
    </button>
  );
}

function MuteUnmuteButton({
  animatedBorder = false,
  isMuted,
  onClick,
  size = DEFAULT_ICON_SIZE,
  style,
}: ControlButtonProps & { isMuted: boolean; animatedBorder?: boolean }): React.JSX.Element {
  const src = `${assetLink}reactions/iheartmedia/cxr/${isMuted ? "mute" : "unmute"}.svg`;
  return (
    <button
      data-testid="mute-btn"
      aria-label={isMuted ? "Unmute" : "Mute"}
      onClick={onClick}
      className={`gencl:border-0 gencl:p-[9px] gencl:rounded-full gencl:cursor-pointer gencl:flex ${isMuted && animatedBorder ? "cxr-animated-border" : ""}`}
      style={style}>
      <img src={src} style={size} alt={isMuted ? "Unmute" : "Mute"} />
    </button>
  );
}

function WatchButton({ isPlay, onClick, style }: ControlButtonProps & { isPlay: boolean }): React.JSX.Element {
  const iconSrc = `${assetLink}reactions/iheartmedia/cxr/${isPlay ? "pause" : "play"}.svg`;
  return (
    <button
      data-testid="watch-btn"
      onClick={onClick}
      className="gencl:flex gencl:items-center gencl:gap-1 gencl:px-[10px] gencl:py-[6px] gencl:rounded-full gencl:bg-transparent gencl:border gencl:border-white gencl:cursor-pointer gencl:text-[12px] gencl:text-white gencl:font-medium"
      style={style}>
      <img src={iconSrc} style={DEFAULT_WATCH_ICON_SIZE} alt={isPlay ? "Pause" : "Play"} />
      Watch
    </button>
  );
}

const compactIconSize = { height: "14px", width: "14px" } as const;

const compactBtnStyle: React.CSSProperties = {
  background: "#00000066",
  backdropFilter: "blur(10px)",
};

const watchBtnStyle: React.CSSProperties = {
  zIndex: 1,
};

/** Props for the compact horizontal control bar (320x50 / 320x100 layouts). */
export interface CompactControlBarProps {
  isPlay: boolean;
  isMuted: boolean;
  onPlayClick: () => void;
  /** Called with the new muted state when the mute button is toggled. */
  onMuteClick: (muted: boolean) => void;
}

/**
 * Legacy compact horizontal control bar for 320x50 / 320x100 ad layouts.
 * Used by AdControlLayer when variant="old".
 */
export function CompactControlBarOld({
  isPlay,
  isMuted,
  onPlayClick,
  onMuteClick,
}: CompactControlBarProps): React.JSX.Element {
  return (
    <div
      data-testid="compact-control-bar"
      className="gencl:h-full gencl:w-full gencl:flex gencl:items-center gencl:justify-end gencl:gap-1 gencl:px-[6px] gencl:pointer-events-auto">
      <WatchButton isPlay={isPlay} onClick={onPlayClick} style={watchBtnStyle} />
      <MuteUnmuteButton
        animatedBorder={true}
        isMuted={isMuted}
        onClick={() => onMuteClick(!isMuted)}
        size={compactIconSize}
        style={compactBtnStyle}
      />
      <PlayPauseButton isPlay={isPlay} onClick={onPlayClick} size={compactIconSize} style={compactBtnStyle} />
    </div>
  );
}

/** Returns a frosted-glass button shell style for a square icon button. */
export function ghostStyle(size: string, padding = "4px"): React.CSSProperties {
  return {
    background: "#00000066",
    backdropFilter: "blur(10px)",
    width: size,
    height: size,
    padding,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };
}
