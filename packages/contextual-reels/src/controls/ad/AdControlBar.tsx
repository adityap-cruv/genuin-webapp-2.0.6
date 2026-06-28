"use client";

import React, { useState } from "react";

import { CompactControlBar, type CompactBarCta } from "@cxr/controls/CompactControlBar";
import { ExpandCollapseButton } from "@cxr/controls/buttons/atoms/ExpandCollapseButton";
import { ExpandCollapseButtonV2 } from "@cxr/controls/buttons/atoms/ExpandCollapseButtonV2";
import { MuteUnmuteButton } from "@cxr/controls/buttons/atoms/MuteUnmuteButton";
import { MuteUnmuteButtonV2 } from "@cxr/controls/buttons/atoms/MuteUnmuteButtonV2";
import { PlayPauseButton } from "@cxr/controls/buttons/atoms/PlayPauseButton";
import { PlayPauseButtonV2 } from "@cxr/controls/buttons/atoms/PlayPauseButtonV2";
import type { AdControlBarProps } from "@cxr/controls/control-layer.types";
import { resolveCxrControlSize } from "@cxr/controls/control-size";
import { useAudioEngaged } from "@cxr/controls/useAudioEngaged";
import { useNewPlayerControls } from "@cxr/controls/useNewPlayerControls";

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
  // The enticement ends only on an AUDIO action — a mute-button tap (`muteToggled`)
  // or an unmute via the ad tap-overlay (`mute:unmuted` bus event, tracked by
  // `useAudioEngaged`). It must NOT end on generic interaction: the App root marks
  // any pointer-down as "interacted", so gating on that made a play/pause tap flip
  // the icon to the real (muted) state for an action unrelated to sound. Once an
  // audio action has occurred the icon tracks the REAL mute state thereafter, so a
  // later SYSTEM mute (autoplay policy on the next ad) shows the mute icon.
  const isV2 = useNewPlayerControls();
  const engaged = useAudioEngaged(muteToggled);
  const perceivedMuted = engaged ? isMuted : false;
  const handleMute = () => {
    setMuteToggled(true);
    // Before the user has engaged at all, the icon is the forced sound-on
    // enticement over an actually-muted ad: the tap means "I want audio", so
    // unmute outright. Once engaged (tapped here OR unmuted via the ad overlay),
    // `perceivedMuted` tracks the real state, so just toggle to its opposite.
    onMuteClick(engaged ? !perceivedMuted : false);
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
        useV2Icons={isV2}
        showWatchInSm
        cta={cta}
        isPlay={isPlay}
        isMuted={perceivedMuted}
        isFullScreen={isFullScreen}
        onPlayClick={onPlayClick}
        onMuteClick={handleMute}
        onFullScreenClick={handleExpand}
        onWatchClick={onFullScreenClick}
        className="gencl:p-1!"
      />
    );
  }

  // layout === 'default'
  // pointer-events-auto: the fullscreen ad break wraps this in a
  // pointer-events-none container; the cluster must opt back in.
  if (isV2) {
    // Match the player's V2 control size (DefaultTopBar uses the same call).
    const v2Size = resolveCxrControlSize(undefined, isFullScreen);
    return (
      <div
        className={`gencl:absolute gencl:top-3 gencl:right-3 gencl:flex gencl:flex-row gencl:items-center gencl:gap-2 gencl:z-[10] gencl:pointer-events-auto`}>
        <MuteUnmuteButtonV2
          isMuted={perceivedMuted}
          onClick={handleMute}
          size={v2Size}
          enableVolumeSlider={false}
          shouldAnimate={false}
        />
        <PlayPauseButtonV2 isPlay={isPlay ?? false} onClick={onPlayClick} size={v2Size} shouldAnimate={false} />
        <ExpandCollapseButtonV2 isFullScreen={isFullScreen} onClick={handleExpand} size={v2Size} />
      </div>
    );
  }
  return (
    <div
      className={`gencl:absolute gencl:top-3 gencl:right-3 gencl:flex gencl:flex-row gencl:items-center gencl:gap-2 gencl:z-[10] gencl:pointer-events-auto`}>
      <PlayPauseButton isPlay={isPlay} onClick={onPlayClick} size="xl" />
      <MuteUnmuteButton isMuted={perceivedMuted} onClick={handleMute} size="xl" />
      <ExpandCollapseButton isFullScreen={isFullScreen} onClick={handleExpand} size="xl" />
    </div>
  );
}
