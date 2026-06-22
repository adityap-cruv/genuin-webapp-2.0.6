/**
 * Video feed layout component.
 *
 * Handles container sizing per embed size. All control chrome is delegated
 * to VideoControlLayer, which routes internally based on adLayout.
 *
 * - default / 300x250 / 300x600: ResizeObserver + LightPlayer + VideoControlLayer
 * - mobile-320x100: 100px thumbnail player left + VideoControlLayer right
 * - mobile-320x50: no player, VideoControlLayer fills the bar
 */

import { useEffect, useLayoutEffect, useRef, useState } from "react";

import { GenAdSlot } from "@cxr/ads/GenAdSlot";
import { genAdSlotAdProps } from "@cxr/ads/adSlotProps";
import type { AdCtaDetails } from "@cxr/ads/genAdSdk";
import { isGenAiAllowed, type AdLayoutId } from "@cxr/config";
import { AdControlLayer } from "@cxr/controls/AdControlLayer";
import { VideoControlLayer } from "@cxr/controls/VideoControlLayer";
import type { ControlLayerVariant } from "@cxr/controls/control-layer.types";
import { AD_FADE_MS, useFullscreenAdBreak } from "@cxr/feed/hooks/useFullscreenAdBreak";
import { OctoSheet } from "@cxr/genai/octo/OctoSheet";
import { useInstanceId } from "@cxr/instance/registry/InstanceContext";
import { LightPlayer } from "@cxr/player/LightPlayer";
import { useAdWaterfall } from "@cxr/providers/AdProvider";
import { useFullScreen } from "@cxr/providers/FullScreenProvider";
import { useOctoSplit } from "@cxr/providers/GenAIProvider";
import { usePlayer } from "@cxr/providers/PlayerProvider";
import type { NormalisedReel, TagResponse } from "@cxr/types";

/** Neutral dark backdrop used for any tag without a brand override. */
const DEFAULT_COMPACT_BACKGROUND = "#1a1a1a";

/**
 * Per-tag compact-layout backdrop overrides. Tags not listed fall back to
 * {@link DEFAULT_COMPACT_BACKGROUND}.
 */
const COMPACT_BACKGROUND_BY_TAG_ID = new Map<string, string>([
  // Pink brand fill.
  ["6a2fefd87ce338c3a5afc605", "#EC298C"],
  ["69b298f4d6a6ad57e7b9a499", "#EC298C"],
  ["69b298e3d6a6ad57e7b9a464", "#EC298C"],
  ["6a032e34054c8fcb08582510", "#EC298C"],
  ["6a032de445fa9f171bd291cb", "#EC298C"],
  ["6a3915b692929ebec64d785e", "#EC298C"],
  ["6a39163e92929ebec64d78ab", "#EC298C"],
  ["6a3916de30e1406c10507518", "#EC298C"],
  ["6a391708a7d9f8da7f6e56ad", "#EC298C"],
  // Red brand fill.
  ["6a391232d73aa25887ac2af3", "#E32C26"],
]);

/** Props for {@link VideoLayout}. */
export interface VideoLayoutProps {
  reel: NormalisedReel;
  isActive: boolean;
  tagDetails: TagResponse;
  variant?: ControlLayerVariant;
  onTimeUpdate: (index: number, currentTime: number, duration: number) => void;
  /** Advance the carousel one slide — called when the video ends. */
  onAutoAdvance?: () => void;
}

/**
 * Unified video layout — mounts player and delegates control chrome to VideoControlLayer.
 *
 * @param props  reel, isActive, tagDetails, variant, onTimeUpdate, onAutoAdvance.
 */
export function VideoLayout({
  reel,
  isActive,
  tagDetails,
  variant = "default",
  onTimeUpdate,
  onAutoAdvance,
}: VideoLayoutProps): React.JSX.Element {
  const { adLayout, setAdBreakActive } = useAdWaterfall();
  const { isMuted, volume, isPlaying, setMuted, setPlaying } = usePlayer();
  const { splitActive, playerShare, octoAxis } = useOctoSplit(isActive);
  const { isFullScreen, toggleFullScreen } = useFullScreen();
  const instanceId = useInstanceId();

  // Ad break — requests in every view (outer + expanded); no-fill leaves the
  // video untouched, completion advances the feed.
  const adBreak = useFullscreenAdBreak({
    isActive,
    adObject: reel.adObject,
    onAdComplete: onAutoAdvance,
  });

  const [isAdBreakReady, setAdBreakReady] = useState(false);
  const [adBreakCta, setAdBreakCta] = useState<AdCtaDetails | null>(null);

  // Hide widget-level chrome (action rail) while this reel's ad/cover is up.
  useEffect(() => {
    if (!adBreak.isAdVisible) return;
    setAdBreakActive(true);
    return () => setAdBreakActive(false);
  }, [adBreak.isAdVisible, setAdBreakActive]);

  // Reset chrome state when the slot unmounts so the next attempt starts clean.
  useEffect(() => {
    if (adBreak.shouldMountAd) return;
    setAdBreakReady(false);
    setAdBreakCta(null);
  }, [adBreak.shouldMountAd]);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useLayoutEffect(() => {
    const needsResize = adLayout !== "mobile-320x50" && adLayout !== "mobile-320x100";
    if (!needsResize) return;
    const el = containerRef.current;
    if (!el) return;
    // Read current size synchronously before paint so first render has correct dimensions.
    const { width, height } = el.getBoundingClientRect();
    setDimensions({ width, height });
    const ro = new ResizeObserver(([entry]) => {
      if (entry) {
        const { width: w, height: h } = entry.contentRect;
        setDimensions({ width: w, height: h });
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [adLayout]);

  function handleTimeUpdate(currentTime: number, duration: number, id: number): void {
    onTimeUpdate(id, currentTime, duration);
  }

  // Compact-layout backdrop: listed brand tags get their override fill; everyone
  // else gets the neutral dark background.
  const compactBackground =
    COMPACT_BACKGROUND_BY_TAG_ID.get(tagDetails?.tag_id ?? "") ?? DEFAULT_COMPACT_BACKGROUND;

  const controlLayerProps = {
    variant,
    item: reel,
    tagDetails,
    dimensions,
    isActive,
    isFullScreen,
    isMuted,
    isPlay: isActive && isPlaying,
    adLayout,
    onMuteClick: () => setMuted(!isMuted),
    onPlayClick: () => setPlaying(!isPlaying),
    onFullScreenClick: toggleFullScreen,
  };

  // Fullscreen ad break overlay — rendered in every branch so a playing ad
  // survives collapse into the compact/normal views. Invisible while
  // requesting, fades in on fill, stays as a black cover after completion
  // while the carousel advances. z-80 > player/Octo/control chrome.
  const adBreakOverlay = adBreak.isOverlayMounted && reel.adObject && (
    <div
      data-testid="fullscreen-ad-break"
      className="gencl:absolute gencl:inset-0 gencl:z-80"
      style={{
        background: "#000",
        opacity: adBreak.isAdVisible ? 1 : 0,
        pointerEvents: adBreak.isAdVisible ? "auto" : "none",
        transition: `opacity ${AD_FADE_MS}ms ease`,
      }}>
      {adBreak.shouldMountAd && (
        <>
          <GenAdSlot
            id={reel.adObject.id}
            instanceId={instanceId}
            isActive={isActive}
            isMuted={isMuted}
            isPlay={isPlaying}
            tagDetails={{ tag_id: tagDetails?.tag_id }}
            item={{}}
            {...genAdSlotAdProps(reel.adObject)}
            isFullScreen={isFullScreen}
            onMuteClick={setMuted}
            onPlayClick={() => setPlaying(!isPlaying)}
            destroySignal={0}
            onWaterfallSuccess={adBreak.handleWaterfallSuccess}
            onWaterfallFail={adBreak.handleWaterfallFail}
            onAdCompleted={adBreak.handleAdCompleted}
            onAdLoadedChange={setAdBreakReady}
            onAdCTA={setAdBreakCta}
          />
          {/* Ad chrome (same layer AdLayout uses), raised above the SDK's
              own stacking contexts; taps pass through except on controls. */}
          <div className="gencl:absolute gencl:inset-0 gencl:z-100 gencl:pointer-events-none">
            <AdControlLayer
              adLayout={adLayout}
              isFullScreen={isFullScreen}
              isPlay={isPlaying}
              isMuted={isMuted ?? false}
              isAdReady={isAdBreakReady}
              ctaDetails={adBreakCta}
              onPlayClick={() => setPlaying(!isPlaying)}
              onMuteClick={setMuted}
              onFullScreenClick={toggleFullScreen}
              containerId={`gen-ad-slot-${instanceId}-${reel.adObject.id}`}
            />
          </div>
        </>
      )}
    </div>
  );

  // Branch trees render inside a stable wrapper (see the component return) so
  // the ad-break slot keeps its tree position across fullscreen/normal
  // switches — remounting it would destroy the GenAd instance and fire a
  // duplicate ad request; the SDK re-lays-out via updateView instead.
  function renderLayout(): React.JSX.Element {
    // ─── mobile-320x50 — no player, controls fill bar ────────────────────────
    if (adLayout === "mobile-320x50" && !isFullScreen) {
      return (
        <div
          data-testid="video-layout"
          className="gencl:relative gencl:h-full gencl:w-full gencl:flex gencl:items-center gencl:justify-end gencl:box-border"
          style={{ background: compactBackground }}>
          <VideoControlLayer animatedBorder={true} {...controlLayerProps} />
        </div>
      );
    }

    // ─── mobile-320x100 — 100px thumbnail player + controls, Octo strip below ──
    if (adLayout === "mobile-320x100" && !isFullScreen) {
      return (
        <div
          data-testid="video-layout"
          className="gencl:relative gencl:h-full gencl:w-full gencl:flex gencl:flex-col gencl:overflow-hidden">
          {/* Whole-banner unmute overlay — mirrors the ad overlay: any tap
              (thumbnail or empty chrome) unmutes; expanding happens only via
              the expand / Watch buttons, which sit above this (z-2 > z-1). */}
          <div
            data-testid="compact-unmute-overlay"
            onClick={() => {
              if (isMuted) setMuted(false);
            }}
            onPointerDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            className="gencl:absolute gencl:inset-0 gencl:z-1 gencl:bg-transparent gencl:cursor-pointer"
          />
          <div className="gencl:flex gencl:w-full gencl:flex-1 gencl:overflow-hidden">
            <div className="gencl:h-[100px] gencl:shrink-0 gencl:overflow-hidden" style={{ aspectRatio: "9/16" }}>
              <LightPlayer
                content={reel.videoUrl ?? ""}
                id={reel.id}
                poster={reel.thumb ?? undefined}
                isMuted={isMuted}
                volume={volume}
                isPlay={isActive && isPlaying && !adBreak.suppressVideo}
                tagDetails={{}}
                videoDetails={reel as unknown as Record<string, unknown>}
                onTimeUpdate={() => undefined}
              />
            </div>
            <div
              className="gencl:flex-1 gencl:min-w-0 gencl:flex gencl:flex-col gencl:overflow-hidden"
              style={{ background: compactBackground }}>
              <VideoControlLayer animatedBorder={true} {...controlLayerProps} />
            </div>
          </div>
        </div>
      );
    }

    // ─── default / 300x250 / 300x600 — full player + control layer ───────────
    const isDesktop300x250 = adLayout === "desktop-300x250" && !isFullScreen;
    const containerClassName = isDesktop300x250
      ? "gencl:relative gencl:w-[300px] gencl:h-[250px] gencl:overflow-hidden"
      : "gencl:relative gencl:flex gencl:justify-center gencl:items-center gencl:h-full gencl:w-full";
    const containerStyle = { background: "#000" };

    const playerDimensions = adLayout === "desktop-300x250" && !isFullScreen ? { width: 300, height: 250 } : dimensions;

    // Pause while the Octo sheet or the ad break owns the screen. Global
    // `isPlaying` is untouched, so the next slide resumes normally.
    const isPlayerPlaying = isActive && isPlaying && !splitActive && !adBreak.suppressVideo;

    const isHorizontalSplit = splitActive && octoAxis === "x";

    // 300×250 only overlays an Octo column when the tag/reel actually mounts one
    // (see the OctoSheet gate below). Without it there's nothing to share space
    // with, so the player should be centred in the box instead of pinned left.
    const has300x250Octo = isDesktop300x250 && isGenAiAllowed(tagDetails?.tag_id ?? "") && Boolean(reel.video?.id);

    // 300×250 (with Octo) pins the video to its natural 9/16 width on the left
    // (Octo overlays the rest) — same geometry as the legacy horizontal split.
    const pinPlayerLeft = isHorizontalSplit || has300x250Octo;

    // In 300×250 (and the legacy horizontal split) the player is pinned to its
    // natural 9/16 width on the left edge at full height; the Octo column takes
    // the remaining space.
    // In vertical split the player shrinks to `playerShare` of the container height.
    const horizontalPlayerStyle: React.CSSProperties = pinPlayerLeft
      ? {
          position: "absolute",
          top: 0,
          left: 0,
          bottom: 0,
          // 9:16 aspect ratio at full height — width = height × (9/16)
          aspectRatio: "9 / 16",
          overflow: "hidden",
        }
      : isDesktop300x250
        ? {
            position: "absolute",
            top: 0,
            left: "50%",
            bottom: 0,
            transform: "translateX(-50%)",
            // 9:16 aspect ratio at full height — width = height × (9/16)
            aspectRatio: "9 / 16",
            overflow: "hidden",
          }
        : {
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: `${playerShare * 100}%`,
            overflow: "hidden",
            transition: "height 320ms cubic-bezier(0.32, 0.72, 0, 1)",
          };

    // Compute the pixel width the 9/16 player occupies so the Octo column can
    // be positioned flush against it. For desktop-300x250 the container is fixed
    // 250px tall → player width ≈ 140px. Fall back to 140 if ResizeObserver hasn't
    // fired yet (dimensions.height === 0).
    const splitPlayerWidth = isHorizontalSplit ? (dimensions.height || 250) * (9 / 16) : 0;

    // Left edge of the 300×250 Octo overlay column: flush right of the player's
    // natural 9/16 width (≈140px at 250px tall) so the visible video strip on the
    // left stays uncovered and tappable to expand.
    const octoOverlayLeft = (dimensions.height || 250) * (9 / 16);

    return (
      <div ref={containerRef} data-testid="video-layout" className={containerClassName} style={containerStyle}>
        <div data-testid="video-layout-player" style={horizontalPlayerStyle}>
          <LightPlayer
            content={reel.videoUrl ?? ""}
            ad={reel.cta?.link}
            id={reel.id}
            poster={reel.thumb ?? undefined}
            isMuted={isMuted}
            volume={volume}
            isPlay={isPlayerPlaying}
            hideScrubber={splitActive || isDesktop300x250}
            tagDetails={{}}
            // TODO(cxr): tighten LightPlayer prop types — videoDetails should accept NormalisedReel directly
            videoDetails={reel as unknown as Record<string, unknown>}
            onTimeUpdate={handleTimeUpdate}
            onEnded={onAutoAdvance}
            videoMode="contain"
          />
        </div>

        {/* 300×250 Octo overlay: locked full-view, layered on top of the full-size
          player. The player fills the 300×250 box and keeps playing; this Octo
          column overlays the right portion, flush right of the player's natural
          9/16 width so the visible video strip on the left stays tappable
          (→ expand via the ClickOverlay below). The wrapper is z-60 so Octo sits
          above the player + control chrome and stays interactable. Only mounted
          for 300×250 non-fullscreen. */}
        {has300x250Octo && reel.video?.id && (
          <div
            className="gencl:absolute gencl:top-0 gencl:bottom-0 gencl:right-0 gencl:z-60"
            style={{ left: octoOverlayLeft }}>
            <OctoSheet
              instanceId={instanceId}
              videoId={reel.video.id}
              brandId={tagDetails?.customer_id ? Number(tagDetails.customer_id) : undefined}
              dimensions={playerDimensions}
              isFullScreen={isFullScreen}
              isActive={isActive}
              tagId={tagDetails?.tag_id ?? ""}
              host="split"
              adLayoutHint={adLayout as AdLayoutId}
            />
          </div>
        )}

        <div
          style={
            isHorizontalSplit ? { position: "absolute", inset: 0, width: splitPlayerWidth, zIndex: 70 } : undefined
          }>
          <VideoControlLayer {...controlLayerProps} dimensions={playerDimensions} />
        </div>
      </div>
    );
  }

  return (
    <div className="gencl:relative gencl:h-full gencl:w-full">
      {renderLayout()}
      {adBreakOverlay}
    </div>
  );
}
