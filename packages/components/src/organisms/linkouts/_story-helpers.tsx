"use client";

/**
 * Shared scaffolding for the three linkout storybook files
 * (`dynamic-linkout-embed`, `dynamic-linkout-mobile`,
 * `dynamic-linkout-responsive`). Pure storybook code — never
 * shipped to production.
 */

import { VideoPlayer } from "@genuin/ui/components/video-player";
import { getColor } from "colorthief";
import { useEffect, useRef, useState, type ReactNode, type RefObject } from "react";

import { setDeviceMode } from "../../../.storybook/preview";
import type { SheetState } from "../../context/base/event-bus";
import { useSheetState } from "../../hooks/use-sheet-state";
import { FeedContext } from "../../templates/feed/context";

const STORY_VIDEO_POSTER = "https://peach.blender.org/wp-content/uploads/title_anouncement.jpg?x11217";

// ── FeedContextStoryWrapper ─────────────────────────────────────
//
// Provides a minimal `FeedContext` so any descendants that read
// `activeIndex` / expand-view callbacks (e.g. the linkouts inside
// the production component tree) get sane no-op defaults.

export function FeedContextStoryWrapper({ children }: { children: ReactNode }) {
  const [activeIndex, setActiveIndex] = useState(0);
  return (
    <FeedContext.Provider
      value={{
        activeIndex,
        setActiveIndex,
        showExpandView: true,
        openExpandView: () => {},
        closeExpandView: () => {},
        toggleExpandView: () => {},
      }}>
      {children}
    </FeedContext.Provider>
  );
}

// ── StoryVideoBackdrop ──────────────────────────────────────────
//
// Static video poster that fills its parent — used by the embed
// and mobile harnesses to mimic the production "video behind
// linkouts" surface. Unmuted preload off, controls hidden.

export function StoryVideoBackdrop({
  className = "gencl:w-full gencl:h-full gencl:object-contain",
  asAbsolute = false,
}: {
  className?: string;
  /** When true, wraps the player in an `absolute inset-0` div so
   *  the backdrop fills the nearest positioned ancestor without
   *  the caller having to do it. */
  asAbsolute?: boolean;
}) {
  const player = (
    <VideoPlayer poster={STORY_VIDEO_POSTER} play={false} controls={false} muted preload="none" className={className} />
  );
  if (!asAbsolute) return player;
  return <div className="gencl:absolute gencl:inset-0 gencl:pointer-events-none">{player}</div>;
}

// ── useSeededLinkoutState ───────────────────────────────────────
//
// Both `embed` and `responsive` harnesses need the same setup:
// pick a device-mode synchronously (so the `matchMedia` mock fires
// before any descendant runs `useDeviceDetectMediaQuery`), then
// force the parent sheet's `linkouts` content type to a specific
// `initialState` (because the event bus pre-registers `linkouts`
// in `activeSheetContentTypes`, the first `openContentType` would
// preserve any stale state — `setContentTypeState` overrides
// unconditionally). Cleanup closes the content type on unmount.

export function useSeededLinkoutState({
  initialState,
  deviceMode = "desktop",
}: {
  initialState: SheetState;
  deviceMode?: "desktop" | "mobile";
}) {
  // Sync `matchMedia` mock before any hook reads it.
  setDeviceMode(deviceMode);

  const sheet = useSheetState();
  const { openContentType, closeContentType, setContentTypeState } = sheet;

  const seededRef = useRef(false);
  if (!seededRef.current) {
    openContentType("linkouts", "inside", initialState);
    setContentTypeState("linkouts", initialState);
    seededRef.current = true;
  }

  useEffect(() => {
    return () => closeContentType("linkouts");
  }, [closeContentType]);

  return sheet;
}

// ── useFrameSize ────────────────────────────────────────────────
//
// Tracks an element's `offsetWidth` / `offsetHeight` (border-box,
// matching what the preset buttons advertise) via ResizeObserver.
// Returns the ref + the live size.

export function useFrameSize<T extends HTMLElement = HTMLDivElement>(
  initial: { w: number; h: number } = { w: 360, h: 600 }
): { ref: RefObject<T | null>; size: { w: number; h: number } } {
  const ref = useRef<T>(null);
  const [size, setSize] = useState(initial);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setSize({ w: el.offsetWidth, h: el.offsetHeight });
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, size };
}

// ── Banner ad placeholders ──────────────────────────────────────
//
// Storybook stand-in for `<GenAdContainer>` rendering a banner /
// display ad. Real production rendering happens inside the GenAd
// SDK, which talks to ad networks at runtime — flaky and
// non-deterministic for visual review. The mock below renders a
// static placeholder at the exact ad dimensions so stories can show
// the linkout → ad fallback layout without a live SDK request.

// Source banner creatives downloaded from Figma (DisplayMobile
// component, file 31vZmmekJ2UDRkvvv6EUIR, nodes 9541:28193 /
// 9563:113380 / 9537:100577). All three sizes share the same TOEFL
// source image; Figma applies different absolute-positioned crops
// per size — reproduced here via `BANNER_CROP_BY_SIZE` so each
// variant renders exactly as designed.
import bannerImage300x50Url from "./_story-assets/banner-300x50.png";
import bannerImage320x100Url from "./_story-assets/banner-320x100.png";
import bannerImage320x50Url from "./_story-assets/banner-320x50.png";
import displayImage300x250Url from "./_story-assets/display-300x250.png";
import displayImage300x600Url from "./_story-assets/display-300x600.png";

/**
 * Shared video creative used by every video-ad ratio. The same clip
 * is rendered into the chosen aspect-ratio frame with
 * `object-fit: cover`, so each ratio crops a different region of the
 * source — matches the Figma intent (one canonical creative, cropped
 * per slot) and avoids checking in five copies of essentially the
 * same media. Hosted on the existing begenuin CDN.
 */
const VIDEO_AD_SRC_URL = "https://vz-8bbc7bbf-a1e.b-cdn.net/4b01ccd6-4da4-4128-b17d-26714707fd69/play_360p.mp4";

type BannerCropSpec = {
  src: string;
  /** Image height as a percentage of the container height — drives
   *  the scale at which the source is rendered. From Figma's
   *  `h-[417.45%]` etc. */
  imgHeightPct: number;
  /** Negative top offset (percentage of container height) used to
   *  position the source so the focal region of the creative aligns
   *  inside the crop. From Figma's `top-[-33.42%]` etc. */
  imgTopPct: number;
};

/** Per-size source-image crop spec, exported so the storybook
 *  mock for `<GenAdContainer>` can produce identical visuals when
 *  the production code path is exercised via the `@genuin/.../gen-ad-container`
 *  Vite alias in `.storybook/main.ts`. */
export const BANNER_CROP_BY_SIZE: Record<string, BannerCropSpec> = {
  "300x50": {
    src: bannerImage300x50Url,
    imgHeightPct: 417.45,
    imgTopPct: -33.42,
  },
  "320x50": {
    src: bannerImage320x50Url,
    imgHeightPct: 445.28,
    imgTopPct: -39.82,
  },
  "320x100": {
    src: bannerImage320x100Url,
    imgHeightPct: 208.72,
    imgTopPct: -15.2,
  },
};

/** Catalogue of supported banner ad sizes (Figma 9542-28205 /
 *  9563-113374 / 9563-113776). Listed ascending; the picker below
 *  walks this list from largest to smallest. */
export const BANNER_AD_SIZES: ReadonlyArray<{ w: number; h: number }> = [
  { w: 300, h: 50 },
  { w: 320, h: 50 },
  { w: 320, h: 100 },
];

/** Minimum frame height required to show *any* banner ad. Below
 *  this, the player is too cramped to spare vertical pixels for an
 *  ad without crowding the video. */
export const BANNER_AD_MIN_FRAME_HEIGHT = 200;

/** Maximum allowed banner height. A guardrail per the design spec
 *  ("ads higher than 100px should not be displayed") — keeps a
 *  rogue larger entry in `BANNER_AD_SIZES` out of the picker. */
export const BANNER_AD_MAX_HEIGHT = 100;

/**
 * Pick the largest banner size that fits the frame, or `null` when
 * no eligible size exists. Rules:
 *   - frame height must be ≥ `BANNER_AD_MIN_FRAME_HEIGHT`,
 *   - ad height must be ≤ `BANNER_AD_MAX_HEIGHT`,
 *   - ad width must be ≤ frame width.
 * Sort tiebreaker: prefer the entry with greater area, then with
 * greater height (so 320×100 beats 320×50 at equal width).
 */
export function pickBannerAdSize(frameW: number, frameH: number): { w: number; h: number } | null {
  if (frameH < BANNER_AD_MIN_FRAME_HEIGHT) return null;
  const candidates = BANNER_AD_SIZES.filter((s) => s.w <= frameW && s.h <= BANNER_AD_MAX_HEIGHT);
  if (candidates.length === 0) return null;
  return candidates.reduce((best, cur) => {
    const bestArea = best.w * best.h;
    const curArea = cur.w * cur.h;
    if (curArea !== bestArea) return curArea > bestArea ? cur : best;
    return cur.h > best.h ? cur : best;
  });
}

/**
 * Storybook placeholder mirroring `<GenAdContainer>`'s footprint.
 * Reproduces the Figma `DisplayMobile/300x50 | 320x50 | 320x100`
 * banner mockups: the source creative is rendered inside the
 * banner-sized crop window per Figma's positioning percentages, with
 * an "Ad" badge in the top-left and the dimensions label centered.
 *
 * Use via the `pickBannerAdSize` helper to choose the size for the
 * current frame; pass `null` to suppress the placeholder entirely.
 */
export function MockGenAdContainer({
  width,
  height,
  className,
}: {
  width: number;
  height: number;
  className?: string;
}) {
  const crop = BANNER_CROP_BY_SIZE[`${width}x${height}`];
  return (
    <div
      data-testid="mock-gen-ad-container"
      data-ad-size={`${width}x${height}`}
      className={className}
      style={{
        width,
        height,
        position: "relative",
        margin: "0 auto",
        overflow: "hidden",
        background: "#f4f5f6",
        border: "1px solid #dfe1e3",
        borderRadius: 0,
        boxSizing: "border-box",
      }}>
      {crop && (
        // Background creative — positioned exactly as Figma scales
        // it inside the banner frame (height/top percentages applied
        // to the container's height).
        <img
          alt=""
          aria-hidden="true"
          src={crop.src}
          style={{
            position: "absolute",
            left: 0,
            width: "100%",
            height: `${crop.imgHeightPct}%`,
            top: `${crop.imgTopPct}%`,
            maxWidth: "none",
            pointerEvents: "none",
          }}
        />
      )}
      {/* "Ad" badge — Figma 9541:28185 / 28190 / 28170: 12 px tall
        pill, 4 px inset, white surface with backdrop blur, 8 px
        Body-4 Medium label. */}
      <span
        style={{
          position: "absolute",
          top: 4,
          left: 4,
          height: 12,
          display: "inline-flex",
          alignItems: "center",
          padding: "0 4px",
          background: "#ffffff",
          color: "#1d1f20",
          borderRadius: 4,
          fontFamily: "Inter, system-ui, sans-serif",
          fontSize: 8,
          fontWeight: 500,
          lineHeight: "12px",
          backdropFilter: "blur(7.5px)",
        }}>
        Ad
      </span>
      {/* Centered dimensions label matches the Figma overlay
        (Body-1 Semi-Bold). Kept as a recognizable storybook hint
        showing which variant the picker landed on. */}
      <span
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#131415",
          fontFamily: "Inter, system-ui, sans-serif",
          fontSize: 14,
          fontWeight: 600,
          lineHeight: "20px",
          pointerEvents: "none",
        }}>
        {width}x{height}
      </span>
    </div>
  );
}

/**
 * Storybook wrapper that drops `<MockGenAdContainer>` into the
 * linkout panel chrome shown in Figma node 9563:113378 — a 4 px
 * padded, 8 px radius, `rgba(0,0,0,0.5)` + 5 px backdrop-blur
 * surface that the linkout slot uses to host the banner ad. A small
 * dot strip is rendered as a sibling beneath the panel, matching
 * the carousel dots that the production sheet exposes when the
 * linkout itself has multiple items.
 *
 * Production note: today `<GenAdContainer>` is a sibling of
 * `<DynamicLinkouts>` (under `<FeedPlayer>`), not a child — this
 * mock previews a future state where the banner ad renders *inside*
 * the linkout panel.
 */
export function MockLinkoutBannerPanel({
  width,
  height,
  className,
}: {
  width: number;
  height: number;
  className?: string;
}) {
  return (
    <div
      data-testid="mock-linkout-banner-panel"
      className={className}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 4,
      }}>
      {/* Panel chrome — Figma `Component 3` (9563:113378). */}
      <div
        style={{
          padding: 4,
          borderRadius: 8,
          background: "rgba(0, 0, 0, 0.5)",
          backdropFilter: "blur(5px)",
          // Width of the panel = banner + 8 px horizontal padding so
          // the content fits without horizontal clipping.
          boxSizing: "content-box",
        }}>
        <MockGenAdContainer width={width} height={height} />
      </div>
      {/* Carousel dot strip — matches Figma `Carousel` (8285:26109)
        used by the linkout slot when more than one item is in the
        rotation. Static 4-dot strip here, since the banner ad mock
        doesn't actually rotate. */}
      <div
        aria-hidden="true"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 4,
          paddingTop: 2,
          paddingBottom: 4,
        }}>
        {[0, 1, 2, 3].map((idx) => (
          <span
            key={idx}
            style={{
              width: 6,
              height: 6,
              borderRadius: 3,
              // Active dot is light gray (`secondary-150` #DFE1E3);
              // inactive dots are the secondary-600 wash from the
              // dark linkout chrome — matches the canonical theme
              // exposed by `<LinkoutCarouselDots>` in dark mode.
              background: idx === 0 ? "#dfe1e3" : "#767b81",
            }}
          />
        ))}
      </div>
    </div>
  );
}

// ── Display ad placeholders (MPU / half-page) ────────────────────
//
// Larger, center-anchored display ad variants. Distinct from the
// `BANNER_*` set because they sit inside the player frame rather
// than along its bottom edge and have their own size/positioning
// rules per Figma (DisplayMobile 300×250 = 9563:113435; DisplayDesktop
// 300×600 = 9563:113468). The center-vertical offset of `-75.5 px`
// for the 300×250 comes from Figma's `top-[calc(50%-75.5px)]`; the
// 300×600 sits dead-centre.

type DisplayAdSpec =
  | {
      src: string;
      /** Position the ad's top edge at this fraction of the frame
       *  height. Scales with the frame so the ad doesn't crowd the
       *  top chrome on small frames, and is clamped at render time
       *  so the ad never extends past the frame bottom. */
      anchor: "top";
      topRatio: number;
    }
  | {
      src: string;
      /** Centre the ad vertically inside the frame. Width is always
       *  centred horizontally regardless of `anchor`. */
      anchor: "center";
    };

/** Catalogue of supported display ad sizes (Figma 9563-113432 and
 *  9563-113317). Listed ascending; the picker walks the list
 *  largest-first when choosing what fits. */
export const DISPLAY_AD_SIZES: ReadonlyArray<{ w: number; h: number }> = [
  { w: 300, h: 250 },
  { w: 300, h: 600 },
];

const DISPLAY_AD_BY_SIZE: Record<string, DisplayAdSpec> = {
  "300x250": {
    src: displayImage300x250Url,
    // Figma reference: 450×800 frame with the ad top edge at
    // ≈ 199.5 px from the top → 199.5 / 800 ≈ 0.25. Using a
    // ratio (instead of a fixed pixel offset from centre) keeps
    // the ad properly placed when the frame is shorter than the
    // Figma reference — and the clamp in
    // `<MockDisplayAdContainer>` pulls the ad back into bounds
    // when the frame gets too short for the ratio.
    anchor: "top",
    topRatio: 0.25,
  },
  "300x600": {
    src: displayImage300x600Url,
    // Figma `top: calc(50% + 0.5px)` — essentially dead-centre.
    anchor: "center",
  },
};

/**
 * Pick the largest display ad size that fits inside the frame, or
 * `null` when neither fits. Each ad's own width and height must be
 * ≤ the frame's width and height respectively — no padding,
 * matching the design.
 */
export function pickDisplayAdSize(frameW: number, frameH: number): { w: number; h: number } | null {
  const candidates = DISPLAY_AD_SIZES.filter((s) => s.w <= frameW && s.h <= frameH);
  if (candidates.length === 0) return null;
  return candidates.reduce((best, cur) => {
    const bestArea = best.w * best.h;
    const curArea = cur.w * cur.h;
    return curArea > bestArea ? cur : best;
  });
}

/**
 * Storybook placeholder for the centre-anchored display ad. Renders
 * the Figma DisplayMobile/300x250 or DisplayDesktop/300x600 creative
 * positioned absolutely inside its parent frame, with the position
 * derived from the frame dimensions and clamped so the ad never
 * extends past any edge. The parent must be `position: relative`
 * (or fixed) so the ad anchors against it.
 */
export function MockDisplayAdContainer({
  width,
  height,
  frameWidth,
  frameHeight,
  className,
}: {
  width: number;
  height: number;
  /** Live width of the parent frame. Used to compute clamps. */
  frameWidth: number;
  /** Live height of the parent frame. Used to compute clamps. */
  frameHeight: number;
  className?: string;
}) {
  const spec = DISPLAY_AD_BY_SIZE[`${width}x${height}`];
  // Ideal top edge per Figma: a ratio for top-anchored ads, dead
  // centre for center-anchored ads. Clamped into `[0, frameH - h]`
  // so the ad always lies fully inside the frame even when the
  // ratio would push it off-screen.
  const idealTop = spec?.anchor === "top" ? frameHeight * spec.topRatio : (frameHeight - height) / 2;
  const clampedTop = Math.max(0, Math.min(frameHeight - height, idealTop));
  // Horizontal placement is always centred — both supported sizes
  // are 300 wide.
  const clampedLeft = Math.max(0, (frameWidth - width) / 2);
  return (
    <div
      data-testid="mock-display-ad-container"
      data-ad-size={`${width}x${height}`}
      className={className}
      style={{
        position: "absolute",
        left: clampedLeft,
        top: clampedTop,
        width,
        height,
        overflow: "hidden",
        background: "#f4f5f6",
        border: "1px solid #dfe1e3",
        boxSizing: "border-box",
      }}>
      {spec && (
        <img
          alt=""
          aria-hidden="true"
          src={spec.src}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            pointerEvents: "none",
          }}
        />
      )}
      {/* Centred Body-1 Semi-Bold size label, same as the banner
        mocks — visual cue showing which variant the picker chose. */}
      <span
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#131415",
          fontFamily: "Inter, system-ui, sans-serif",
          fontSize: 14,
          fontWeight: 600,
          lineHeight: "20px",
          pointerEvents: "none",
        }}>
        {width}x{height}
      </span>
    </div>
  );
}

// ── Video ad placeholders (aspect-ratio fitted) ──────────────────
//
// Aspect-ratio fitted creatives that sit on top of the video player
// — analogous to the production GenAd SDK's IMA-served video ad.
// The mock fits the creative to the frame with `object-fit: contain`
// semantics: the ad is centred, scaled to touch either the frame's
// width or height (whichever runs out first), and never extends past
// the opposite edge. The leftover space appears as a letterbox.
// Source assets from Figma node IDs declared in `VIDEO_AD_RATIOS`.

export type VideoAdRatio = "9:16" | "3:4" | "1:1" | "4:3" | "16:9";

/** Catalogue of supported video-ad aspect ratios (Figma 9563-113513
 *  / 9563-113578 / 9563-113653 / 9563-113689 / 9563-84159). Listed
 *  in the order shown in the design picker. The same source clip
 *  (`VIDEO_AD_SRC_URL`) is rendered for every ratio — the chosen
 *  container aspect ratio plus `object-fit: cover` does the framing. */
export const VIDEO_AD_RATIOS: ReadonlyArray<{
  label: VideoAdRatio;
  ar: number;
}> = [
  { label: "9:16", ar: 9 / 16 },
  { label: "3:4", ar: 3 / 4 },
  { label: "1:1", ar: 1 },
  { label: "4:3", ar: 4 / 3 },
  { label: "16:9", ar: 16 / 9 },
];

/**
 * Storybook placeholder for the video ad. Renders the Figma
 * `Video (…)` mockup at the chosen aspect ratio, fitted into the
 * frame using `object-fit: contain` semantics (centred, touching
 * one or both edges depending on the frame's own ratio). Parent
 * frame must be `position: relative` so the absolute placement
 * anchors against it.
 */
export function MockVideoAdContainer({
  ratio,
  frameWidth,
  frameHeight,
  className,
}: {
  ratio: VideoAdRatio;
  /** Live width of the parent frame. */
  frameWidth: number;
  /** Live height of the parent frame. */
  frameHeight: number;
  className?: string;
}) {
  const spec = VIDEO_AD_RATIOS.find((r) => r.label === ratio);
  if (!spec || frameWidth <= 0 || frameHeight <= 0) return null;

  // Contain-fit: pick the dimension that runs out first. If the
  // frame is wider than the ad's natural ratio, the ad's height
  // is the limiter; otherwise its width is.
  const frameAR = frameWidth / frameHeight;
  const fitsByHeight = frameAR > spec.ar;
  const width = fitsByHeight ? frameHeight * spec.ar : frameWidth;
  const height = fitsByHeight ? frameHeight : frameWidth / spec.ar;
  const left = (frameWidth - width) / 2;
  const top = (frameHeight - height) / 2;

  return (
    <div
      data-testid="mock-video-ad-container"
      data-ad-ratio={ratio}
      className={className}
      style={{
        position: "absolute",
        left,
        top,
        width,
        height,
        overflow: "hidden",
        background: "#009456",
        boxSizing: "border-box",
      }}>
      {/* Same source video for every ratio — `object-fit: cover`
        re-frames it to the chosen container aspect (9:16 / 3:4 /
        1:1 / 4:3 / 16:9). Muted + playsInline so it can autoplay
        in modern browsers without user gesture; loop so reviewers
        always see motion regardless of when they open the story. */}
      <video
        // `key` on ratio forces a remount on aspect-ratio change so
        // the new crop is applied cleanly from the first frame
        // (older browsers don't invalidate `object-fit` mid-stream).
        key={ratio}
        src={VIDEO_AD_SRC_URL}
        autoPlay
        muted
        loop
        playsInline
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          pointerEvents: "none",
        }}
      />
      <span
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#ffffff",
          fontFamily: "Inter, system-ui, sans-serif",
          fontSize: 16,
          fontWeight: 600,
          lineHeight: "22px",
          pointerEvents: "none",
          // The label sits on top of live video — add a subtle dark
          // wash behind it so it stays readable regardless of
          // current frame brightness.
          textShadow: "0 1px 2px rgba(0, 0, 0, 0.5)",
        }}>
        Video ({ratio})
      </span>
    </div>
  );
}

// ── Dominant-color extraction ──────────────────────────────────
//
// Storybook-only helper that samples a banner / display creative
// and returns its dominant colour. Used to drive the display-ad
// gradient backdrop (Figma node 10089:29042 — predominant creative
// colour at the top stop, gray-900 at the bottom). Production
// would receive the colour from the ad payload instead of running
// an in-page extraction.
//
// Approach: load the creative into an `<Image>` element with
// `crossOrigin="anonymous"`, hand it to `colorthief`'s `getColor`,
// return the CSS `rgb(...)` string. CORS-tainted canvases throw —
// the hook swallows the error and returns `null`, the caller falls
// back to a hard-coded default.

/**
 * Look up the source URL for a supported display-ad size, or
 * `null` when the size isn't in the catalogue. Used by the
 * `useDominantColor` hook to point at the right creative.
 */
export function getDisplayAdImageUrl(width: number, height: number): string | null {
  return DISPLAY_AD_BY_SIZE[`${width}x${height}`]?.src ?? null;
}

/**
 * Sample the dominant colour from an image at the given URL.
 * Returns the colour as a CSS `rgb(r, g, b)` string once
 * extraction completes, or `null` while the image is loading /
 * on any failure (CORS-tainted canvas, decode error, etc.).
 *
 * Resampling is keyed on `imageUrl` — passing a new URL kicks off
 * a fresh extraction; passing `null` clears the previous result.
 */
export function useDominantColor(imageUrl: string | null): string | null {
  const [color, setColor] = useState<string | null>(null);
  useEffect(() => {
    if (!imageUrl) {
      setColor(null);
      return;
    }
    let cancelled = false;
    const img = new Image();
    // Required for `canvas.getImageData()` to succeed against
    // cross-origin sources. The image server must respond with
    // `Access-Control-Allow-Origin`; CDN-served creatives that
    // don't will throw a SecurityError on extraction.
    img.crossOrigin = "anonymous";
    img.onload = () => {
      // colorthief's `getColor` is async — handle the promise
      // rejection so a tainted-canvas error doesn't bubble.
      getColor(img)
        .then((result) => {
          if (!cancelled && result) setColor(result.css("rgb"));
        })
        .catch(() => {
          /* CORS / decode failure — caller falls back to default */
        });
    };
    img.onerror = () => {
      /* image failed to load — caller falls back to default */
    };
    img.src = imageUrl;
    return () => {
      cancelled = true;
    };
  }, [imageUrl]);
  return color;
}
