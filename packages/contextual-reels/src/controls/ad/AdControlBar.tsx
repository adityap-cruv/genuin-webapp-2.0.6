"use client";

import React, { useState } from "react";

import { CompactControlBar, type CompactBarCta } from "@cxr/controls/CompactControlBar";
import { ExpandCollapseButton } from "@cxr/controls/buttons/atoms/ExpandCollapseButton";
import { MuteUnmuteButton } from "@cxr/controls/buttons/atoms/MuteUnmuteButton";
import { PlayPauseButton } from "@cxr/controls/buttons/atoms/PlayPauseButton";
import type { AdControlBarProps } from "@cxr/controls/control-layer.types";
import { useUserInteracted } from "@cxr/instance/coordination/UserInteractionTracker";

/**
 * Ad control bar routing by `layout`:
 * - "320x50" / "320x100" — delegates to the shared {@link CompactControlBar}
 * - "default" — absolute top-right cluster for fullscreen-style embeds
 */
export function AdControlBar({
  isPlay,
  isMuted,
  isFullScreen = false,
  layout,
  onPlayClick,
  onMuteClick,
  onFullScreenClick,
  ctaDetails,
}: AdControlBarProps): React.JSX.Element {
  // Mute starts as an enticement: the icon shows "sound on" even while the ad is
  // actually muted, until the user taps it. `muteToggled` flips on that first tap
  // (NOT on generic interaction). The first tap on the sound-on enticement always
  // unmutes — the user tapped *for* audio — then a clean mute/unmute cycle follows.
  // Driven by tap (not pointerdown) so it's free of the App-level interaction race.
  const [muteToggled, setMuteToggled] = useState(false);
  // The enticement only applies before the user has engaged with this widget.
  // Once they have interacted (persisted per-instance — e.g. they unmuted an
  // earlier ad in the same widget), the icon must reflect the REAL mute state so
  // a later SYSTEM mute (autoplay policy on the next ad) actually shows the mute
  // icon instead of staying stuck on the "sound on" enticement.
  const interacted = useUserInteracted();
  const perceivedMuted = muteToggled || interacted ? isMuted : false;
  const handleMute = () => {
    if (!muteToggled) {
      // First tap on the sound-on enticement: the user wants audio, so unmute
      // regardless of what `perceivedMuted` (forced false pre-toggle) implies.
      setMuteToggled(true);
      onMuteClick(false);
      return;
    }
    // Subsequent taps: drive audio to the opposite of what the user currently sees.
    onMuteClick(!perceivedMuted);
  };
  const handleExpand = onFullScreenClick ?? (() => undefined);

  if (layout === "320x50" || layout === "320x100") {
    const cta: CompactBarCta | null = ctaDetails
      ? {
          url: ctaDetails.ctaUrl,
          caption: ctaDetails.ctaTitle,
          logoUrl: ctaDetails.advertiserLogo,
          onClick: ctaDetails.onClick,
        }
      : null;

    return (
      <CompactControlBar
        size={layout === "320x50" ? "sm" : "md"}
        cta={cta}
        isPlay={isPlay}
        isMuted={perceivedMuted}
        isFullScreen={isFullScreen}
        onPlayClick={onPlayClick}
        onMuteClick={handleMute}
        onFullScreenClick={handleExpand}
        onWatchClick={onFullScreenClick}
      />
    );
  }

  // layout === 'default'
  // pointer-events-auto: the fullscreen ad break wraps this in a
  // pointer-events-none container; the cluster must opt back in.
  return (
    <div
      className={`gencl:absolute gencl:top-3 gencl:right-3 gencl:flex gencl:flex-row gencl:items-center gencl:gap-2 gencl:z-[10] gencl:pointer-events-auto`}>
      <PlayPauseButton isPlay={isPlay} onClick={onPlayClick} size="xl" />
      <MuteUnmuteButton isMuted={perceivedMuted} onClick={handleMute} size="xl" />
      <ExpandCollapseButton isFullScreen={isFullScreen} onClick={handleExpand} size="xl" />
    </div>
  );
}
