/**
 * Video feed layout component.
 *
 * Handles container sizing per embed size. All control chrome is delegated
 * to VideoControlLayer, which routes internally based on adLayout.
 *
 * - default / 300x250 / 300x600: ResizeObserver + LightPlayer + VideoControlLayer
 * - mobile-320x100: 100px thumbnail player left + VideoControlLayer right
 * - mobile-320x50: no player, VideoControlLayer fills the bar
 *
 * When `adObject` is provided the fullscreen ad break overlay is activated
 * for video-with-ad entries. Callers that omit `adObject` see no change.
 */

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

import { GenAdSlot } from "@cxr/ads/GenAdSlot";
import { genAdSlotAdProps } from "@cxr/ads/adSlotProps";
import type { AdCtaDetails } from "@cxr/ads/genAdSdk";
import { EVENT } from "@cxr/analytics/analytics";
import { AD_LAYOUT, type AdLayoutId } from "@cxr/config";
import { AdControlLayer } from "@cxr/controls/AdControlLayer";
import { CompactUnmuteOverlay, VideoControlLayer } from "@cxr/controls/VideoControlLayer";
import type { ControlLayerVariant } from "@cxr/controls/control-layer.types";
import { AD_FADE_MS, useFullscreenAdBreak } from "@cxr/feed/hooks/useFullscreenAdBreak";
import { OctoSheet } from "@cxr/genai/octo/OctoSheet";
import { useInstanceId } from "@cxr/instance/registry/InstanceContext";
import { LightPlayer } from "@cxr/player/LightPlayer";
import { useAdWaterfall } from "@cxr/providers/AdProvider";
import { useAnalytics } from "@cxr/providers/AnalyticsProvider";
import { useFullScreen } from "@cxr/providers/FullScreenProvider";
import { useGenAI, useOctoSplit } from "@cxr/providers/GenAIProvider";
import { usePlayer } from "@cxr/providers/PlayerProvider";
import { useStrategy } from "@cxr/strategies/StrategyProvider";
import type { NormalisedAd, NormalisedReel, TagResponse } from "@cxr/types";

/** Neutral dark backdrop when no brand_color is configured for the tag. */
const DEFAULT_COMPACT_BACKGROUND = "#1a1a1a";

/** Props for {@link VideoLayout}. */
export interface VideoLayoutProps {
  reel: NormalisedReel;
  isActive: boolean;
  tagDetails: TagResponse;
  variant?: ControlLayerVariant;
  onTimeUpdate: (index: number, currentTime: number, duration: number) => void;
  /** Advance the carousel one slide — called when the video ends. */
  onAutoAdvance?: () => void;
  /** When present, activates the fullscreen ad break overlay for video-with-ad entries. */
  adObject?: NormalisedAd;
}

/**
 * Unified video layout — mounts player and delegates control chrome to VideoControlLayer.
 *
 * When `adObject` is supplied the fullscreen ad break overlay is activated on top of
 * the player; video playback is suppressed while the ad is on screen.
 *
 * @param props  reel, isActive, tagDetails, variant, onTimeUpdate, onAutoAdvance, adObject.
 */
export function VideoLayout({
  reel,
  isActive,
  tagDetails,
  variant = "default",
  onTimeUpdate,
  onAutoAdvance,
  adObject,
}: VideoLayoutProps): React.JSX.Element {
  const { adLayout } = useAdWaterfall();
  const { isMuted, volume, isPlaying, setMuted, setPlaying, setAdBreakActive } = usePlayer();
  const { splitActive, playerShare, octoAxis } = useOctoSplit(isActive);
  const { isFullScreen, toggleFullScreen, isRedirectMode } = useFullScreen();
  const { genAiEnabled } = useGenAI();
  const { compactBackgroundColor } = useStrategy();
  const instanceId = useInstanceId();
  const analytics = useAnalytics();
  // This reel's video id, stamped onto every video event (gesture + lifecycle)
  // so analytics can attribute the event to its video.
  const videoId = reel.video?.id;
  // Latest playback position for the Video Play / Video Paused `start_position`
  // payload field (mirrors the Web SDK's play/pause tracking).
  const currentTimeRef = useRef(0);

  const handleMuteToggle = useCallback(
    (nextMuted: boolean, extra?: Record<string, unknown>) => {
      setMuted(nextMuted);
      analytics.sendEvent(nextMuted ? EVENT.VIDEO_MUTED : EVENT.VIDEO_UNMUTED, { by_user: true, ...extra });
    },
    [setMuted, analytics]
  );

  // Ad break — only activates when adObject is present; hook is always called (rules of hooks).
  const adBreak = useFullscreenAdBreak({
    isActive,
    adObject,
    onAdComplete: onAutoAdvance,
  });

  const [isAdBreakReady, setAdBreakReady] = useState(false);
  const [adBreakCta, setAdBreakCta] = useState<AdCtaDetails | null>(null);

  useEffect(() => {
    if (!adBreak.isAdVisible) return;
    setAdBreakActive(true);
    return () => setAdBreakActive(false);
  }, [adBreak.isAdVisible, setAdBreakActive]);

  useEffect(() => {
    if (adBreak.shouldMountAd) return;
    setAdBreakReady(false);
    setAdBreakCta(null);
  }, [adBreak.shouldMountAd]);

  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // L3 (320×50) has no visible player — mount an audio-only player lazily, only
  // after the user unmutes THIS slide, so a silent unit never decodes video.
  // `isMuted` is shared feed-wide state, so gate on `isActive` too: otherwise a
  // single unmute would engage every off-screen VideoLayout at once and mount a
  // hidden LightPlayer for the whole feed. Once engaged we keep it mounted: a
  // later re-mute pauses via volume 0 / isPlay, it must not tear the element down
  // (which would drop audio and reset position).
  const [l3AudioEngaged, setL3AudioEngaged] = useState(false);
  useEffect(() => {
    if (isActive && !isMuted) setL3AudioEngaged(true);
  }, [isActive, isMuted]);

  useLayoutEffect(() => {
    const needsResize = adLayout !== AD_LAYOUT.L3 && adLayout !== AD_LAYOUT.L4;
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
    currentTimeRef.current = currentTime;
    onTimeUpdate(id, currentTime, duration);
  }

  // Compact-layout backdrop: strategy color (client-side per-tag override) wins over
  // the backend-supplied brand_color; everyone else gets the neutral dark background.
  const compactBackground = compactBackgroundColor ?? tagDetails?.brand_color ?? DEFAULT_COMPACT_BACKGROUND;

  const controlLayerProps = {
    variant,
    item: reel,
    tagDetails,
    dimensions,
    isActive,
    isFullScreen,
    isMuted,
    // Control chrome shows the video playing state even during an ad break — the player isPlay
    // guards (renderL1/L2/L4) pause the actual video, but the controls reflect user intent.
    isPlay: isActive && isPlaying,
    adLayout,
    onMuteClick: () => handleMuteToggle(!isMuted, { video_id: videoId }),
    onPlayClick: () => {
      const willPlay = !isPlaying;
      setPlaying(willPlay);
      // During a fullscreen ad break the on-screen surface is the ad, so a
      // pause is an ad pause (tracked via genAdSdk → `Ad Paused`), not a video
      // pause. Skip the video event to avoid double-counting the same gesture.
      if (adBreak.isAdVisible) return;
      analytics.sendEvent(willPlay ? EVENT.VIDEO_PLAY : EVENT.VIDEO_PAUSED, {
        by_user: true,
        video_id: videoId,
        position_index: reel.id,
        start_position: currentTimeRef.current,
      });
    },
    onFullScreenClick: toggleFullScreen,
  };

  // Ad break overlay — z-80 sits above player/Octo/control chrome.
  const adBreakOverlay = adObject && adBreak.isOverlayMounted && (
    <div
      data-testid="fullscreen-ad-break"
      className="gencl:absolute gencl:inset-0 gencl:z-80 gencl:bg-black"
      style={{
        opacity: adBreak.isAdVisible ? 1 : 0,
        pointerEvents: adBreak.isAdVisible ? "auto" : "none",
        transition: `opacity ${AD_FADE_MS}ms ease`,
      }}>
      {adBreak.shouldMountAd && (
        <>
          <GenAdSlot
            id={adObject.id}
            instanceId={instanceId}
            isActive={isActive}
            isMuted={isMuted}
            isPlay={isPlaying}
            item={{}}
            {...genAdSlotAdProps(adObject)}
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
          <div className="gencl:absolute gencl:inset-0 gencl:z-100 gencl:pointer-events-none">
            <AdControlLayer
              adLayout={adLayout}
              isFullScreen={isFullScreen}
              isPlay={isPlaying}
              isMuted={isMuted ?? false}
              isAdReady={isAdBreakReady}
              ctaDetails={adBreakCta}
              redirectMode={isRedirectMode}
              onPlayClick={() => setPlaying(!isPlaying)}
              // Mirror the video-mute path: an ad mute/unmute emits `Muted`/`Unmuted`
              // too (matches the Web SDK's single instrumented toggle).
              onMuteClick={(nextMuted) => {
                setMuted(nextMuted);
                analytics.sendEvent(nextMuted ? EVENT.VIDEO_MUTED : EVENT.VIDEO_UNMUTED, { by_user: true });
              }}
              onFullScreenClick={toggleFullScreen}
              containerId={`gen-ad-slot-${instanceId}-${adObject.id}`}
            />
          </div>
        </>
      )}
    </div>
  );

  // ─── L3: 320×50 — controls fill bar; audio-only player mounts on unmute ─────
  function renderL3(): React.JSX.Element {
    return (
      <div
        data-testid="video-layout"
        className="gencl:relative gencl:h-full gencl:w-full gencl:flex gencl:items-center gencl:justify-end gencl:box-border"
        style={{ background: compactBackground }}>
        {/* Audio-only player: the 50px bar has no room for a frame, so the
            player is clipped to a 1px offscreen box — the video track still
            decodes and plays audio. Mounted only once the user has unmuted
            (l3AudioEngaged) so a silent unit never fetches/decodes video. */}
        {l3AudioEngaged && (
          <div
            aria-hidden="true"
            className="gencl:absolute gencl:h-px gencl:w-px gencl:overflow-hidden gencl:opacity-0 gencl:pointer-events-none"
            style={{ left: -9999, top: 0 }}>
            <LightPlayer
              content={reel.videoUrl ?? ""}
              id={reel.id}
              videoId={videoId}
              poster={reel.thumb ?? undefined}
              volume={volume}
              isPlay={isActive && isPlaying && !adBreak.suppressVideo}
              hideScrubber={true}
              tagDetails={{}}
              videoDetails={reel as unknown as Record<string, unknown>}
              onTimeUpdate={() => undefined}
              onEnded={onAutoAdvance}
            />
          </div>
        )}
        <VideoControlLayer animatedBorder={true} {...controlLayerProps} />
      </div>
    );
  }

  // ─── L4: 320×100 — 100px thumbnail player + controls ───────────────────────
  function renderL4(): React.JSX.Element {
    return (
      <div
        data-testid="video-layout"
        className="gencl:relative gencl:h-full gencl:w-full gencl:flex gencl:flex-col gencl:overflow-hidden">
        <CompactUnmuteOverlay
          isMuted={isMuted}
          onMuteClick={() => {
            setMuted(false);
            analytics.sendEvent(EVENT.VIDEO_UNMUTED, { by_user: true, video_id: videoId });
          }}
        />
        <div className="gencl:flex gencl:w-full gencl:flex-1 gencl:overflow-hidden">
          <div className="gencl:h-[100px] gencl:shrink-0 gencl:overflow-hidden gencl:aspect-9/16">
            <LightPlayer
              content={reel.videoUrl ?? ""}
              id={reel.id}
              videoId={videoId}
              poster={reel.thumb ?? undefined}
              volume={volume}
              isPlay={isActive && isPlaying && !adBreak.suppressVideo}
              tagDetails={{}}
              videoDetails={reel as unknown as Record<string, unknown>}
              onTimeUpdate={() => undefined}
              onEnded={onAutoAdvance}
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

  // ─── L2: 300×250 — player pinned left + Octo overlay right ─────────────────
  function renderL2(): React.JSX.Element {
    const containerClassName = "gencl:relative gencl:w-[300px] gencl:h-[250px] gencl:overflow-hidden gencl:bg-black";
    const playerDimensions = { width: 300, height: 250 };

    // Left edge of Octo overlay: flush right of the 9/16 player column at 250px tall.
    const octoOverlayLeft = (dimensions.height || 250) * (9 / 16);
    const isPlayerPlaying = isActive && isPlaying && !splitActive && !adBreak.suppressVideo;

    // GenAI: player pinned left of the Octo column. Otherwise centred horizontally.
    const playerClassName =
      genAiEnabled && reel.video?.id
        ? "gencl:absolute gencl:top-0 gencl:bottom-0 gencl:left-0 gencl:aspect-9/16 gencl:overflow-hidden"
        : "gencl:absolute gencl:top-0 gencl:bottom-0 gencl:left-1/2 gencl:-translate-x-1/2 gencl:aspect-9/16 gencl:overflow-hidden";

    return (
      <div ref={containerRef} data-testid="video-layout" className={containerClassName}>
        <div data-testid="video-layout-player" className={playerClassName}>
          <LightPlayer
            content={reel.videoUrl ?? ""}
            ad={reel.cta?.link}
            id={reel.id}
            videoId={videoId}
            poster={reel.thumb ?? undefined}
            volume={volume}
            isPlay={isPlayerPlaying}
            hideScrubber={true}
            tagDetails={{}}
            videoDetails={reel as unknown as Record<string, unknown>}
            onTimeUpdate={handleTimeUpdate}
            onEnded={onAutoAdvance}
            videoMode="contain"
          />
        </div>
        {genAiEnabled && reel.video?.id && (
          <div
            className="gencl:absolute gencl:top-0 gencl:bottom-0 gencl:right-0 gencl:z-60"
            style={{ left: octoOverlayLeft }}>
            <OctoSheet
              instanceId={instanceId}
              videoId={reel.video.id}
              brandId={tagDetails?.brand_id}
              dimensions={playerDimensions}
              isFullScreen={isFullScreen}
              isActive={isActive}
              tagId={tagDetails?.tag_id ?? ""}
              host="split"
              adLayoutHint={adLayout as AdLayoutId}
            />
          </div>
        )}
        <VideoControlLayer {...controlLayerProps} dimensions={playerDimensions} />
      </div>
    );
  }

  // ─── L1: 300×600 / fullscreen — full player ─────────────────────────────────
  function renderL1(): React.JSX.Element {
    const isPlayerPlaying = isActive && isPlaying && !splitActive && !adBreak.suppressVideo;

    const isHorizontalSplit = splitActive && octoAxis === "x";
    const splitPlayerWidth = isHorizontalSplit ? (dimensions.height || 250) * (9 / 16) : 0;

    // Horizontal split: 9/16 column pinned left. Otherwise full-width, height driven by
    // the runtime playerShare (kept inline — Tailwind can't express the % or the easing).
    const playerClassName = isHorizontalSplit
      ? "gencl:absolute gencl:top-0 gencl:bottom-0 gencl:left-0 gencl:aspect-9/16 gencl:overflow-hidden"
      : "gencl:absolute gencl:top-0 gencl:left-0 gencl:right-0 gencl:overflow-hidden";
    const playerStyle: React.CSSProperties | undefined = isHorizontalSplit
      ? undefined
      : {
          height: `${playerShare * 100}%`,
          transition: "height 320ms cubic-bezier(0.32, 0.72, 0, 1)",
        };

    return (
      <div
        ref={containerRef}
        data-testid="video-layout"
        className="gencl:relative gencl:flex gencl:justify-center gencl:items-center gencl:h-full gencl:w-full gencl:bg-black">
        <div data-testid="video-layout-player" className={playerClassName} style={playerStyle}>
          <LightPlayer
            content={reel.videoUrl ?? ""}
            ad={reel.cta?.link}
            id={reel.id}
            videoId={videoId}
            poster={reel.thumb ?? undefined}
            volume={volume}
            isPlay={isPlayerPlaying}
            hideScrubber={splitActive}
            tagDetails={{}}
            videoDetails={reel as unknown as Record<string, unknown>}
            onTimeUpdate={handleTimeUpdate}
            onEnded={onAutoAdvance}
            videoMode="contain"
          />
        </div>
        <div
          className={isHorizontalSplit ? "gencl:absolute gencl:inset-0 gencl:z-70" : undefined}
          style={isHorizontalSplit ? { width: splitPlayerWidth } : undefined}>
          <VideoControlLayer {...controlLayerProps} dimensions={dimensions} />
        </div>
      </div>
    );
  }

  // ─── Dispatch ───────────────────────────────────────────────────────────────
  function renderLayout(): React.JSX.Element {
    if (isFullScreen) return renderL1();
    if (adLayout === AD_LAYOUT.L3) return renderL3();
    if (adLayout === AD_LAYOUT.L4) return renderL4();
    if (adLayout === AD_LAYOUT.L2) return renderL2();
    return renderL1();
  }

  return (
    <div className="gencl:relative gencl:h-full gencl:w-full">
      {renderLayout()}
      {adBreakOverlay}
    </div>
  );
}
