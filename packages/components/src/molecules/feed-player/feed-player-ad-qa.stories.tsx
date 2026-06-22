import { VideoElementProvider } from "@genuin/ui/components/video-player/video-element-provider";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

import { VideoTypes } from "@genuin/components/context";
import { GestureProvider } from "@genuin/components/molecules/gestures/context";
import type { PostDetailsType } from "@genuin/components/react-query/api/feed/schema";

import { PlayerProvider } from "./context";
import { ControlLayer } from "./control-layer";
import { FeedPlayer } from "./feed-player";
import type { GenAdConfig } from "./gen-ad-container";

/**
 * Closed enum of the five ad aspect ratios we ship test fixtures for.
 * Label is also the suffix in the VAST XML and MP4 filenames under
 * packages/ui/.storybook/qa-fixtures/.
 */
const AD_ASPECTS = ["16x9", "9x16", "1x1", "3x4", "4x3"] as const;
type AdAspect = (typeof AD_ASPECTS)[number];

/**
 * 9:16 vertical content clip committed under packages/ui/.storybook/qa-fixtures
 * and mounted at the Storybook root by the staticDirs entry in
 * packages/components/.storybook/main.ts. 1080×1920 H.264, ~7.5 s — short but
 * matches the portrait FeedPlayer layout we actually ship, so the IMA chrome
 * overlay sits over a tall video rather than a letterboxed 16:9 frame. Built
 * from window.location.origin so the request hits this Storybook origin and
 * doesn't trip CORS / 403s against a public CDN.
 */
const CONTENT_VIDEO_PATH = "/videos/content-9x16.mp4";
const CONTENT_VIDEO_SRC =
  typeof window === "undefined" ? CONTENT_VIDEO_PATH : `${window.location.origin}${CONTENT_VIDEO_PATH}`;
/** No poster ships with the local clip; an empty string keeps PostDetailsType happy. */
const CONTENT_VIDEO_POSTER = "";

/**
 * Stable id so PlayerContext / BaseContextManager don't churn between renders
 * when the toolbar updates an aspect / ad URL.
 */
const QA_VIDEO_ID = "feed-player-ad-qa-fixture";

/**
 * Synthetic post details satisfying PostDetailsSchema's required keys. We pass
 * `sponsored: null` (schema is nullish) and skip optional fields the QA path
 * doesn't read. ControlLayer's Default variant reads `video`, `community`,
 * `owner`, and `linkouts` — minimal stubs keep the chrome from short-circuiting.
 */
const QA_POST_DETAILS: PostDetailsType = {
  video: {
    id: QA_VIDEO_ID,
    source: CONTENT_VIDEO_SRC,
    thumbnail: CONTENT_VIDEO_POSTER,
    descritptionText: "Ad QA harness — Sintel trailer with switchable IMA VAST tag.",
    createdAt: Date.now(),
    commentCount: 0,
    shareUrl: "",
    attachedLink: null,
    isSparked: false,
    sparkCount: 0,
    thumbnailM: null,
    description: [],
    slug: QA_VIDEO_ID,
    linkoutId: null,
    clickableUrl: null,
    linkouts: [],
    isPinned: false,
    thumbnailSprite: null,
    videoType: VideoTypes.Content,
  },
  group: {
    id: "ad-qa-group",
    slug: "ad-qa",
    name: "Ad QA",
    description: "",
    shareUrl: "",
    isSubscribed: false,
    role: "UNJOINED",
    isPrivate: false,
  },
  community: {
    id: "ad-qa-community",
    slug: "ad-qa",
    handle: "adqa",
    name: "Ad QA",
    shareUrl: "",
    isPrivate: false,
    userRole: "UNJOINED",
    profileImage: "",
    membersCount: 0,
    groupsCount: 0,
    postsCount: 0,
    brand: { id: 0, name: "Ad QA", slug: "ad-qa", webLogo: "", userLogo: 0 },
  },
  owner: {
    profileImage: "",
    isAvatar: false,
    userName: "adqa",
    name: "Ad QA",
    brand: { id: 0, slug: "ad-qa", userLogo: 0 },
  },
  sponsored: null,
  // PostDetailsSchema also has `section: SectionSchema` (nullish).
  // Omitted — zod nullish accepts undefined.
} as unknown as PostDetailsType;

/**
 * Build an absolute URL the IMA SDK can fetch. The SDK runs in its own iframe
 * at `imasdk.googleapis.com`, so a root-relative URL would resolve against the
 * SDK origin and 404. Anchor on `window.location.origin` (the Storybook preview
 * iframe's origin, which is also where the staticDirs mount lives). The
 * `?v=<timestamp>` query forces FeedPlayer's `adUrl` diff to re-fire on
 * repeated requests of the same aspect.
 */
function buildAdUrl(aspect: AdAspect): string {
  const origin = typeof window === "undefined" ? "" : window.location.origin;
  return `${origin}/ad-tags/vast-${aspect}.xml?v=${Date.now()}`;
}

/**
 * Display-ad QA wiring.
 *
 * We build a `GenAdConfig` directly and pass it via FeedPlayer's `adConfig`
 * prop (which `resolvedAdConfig` short-circuits to ahead of the
 * `adTagObject` → `buildGenAdConfigFromAdTagObject` path). This bypasses
 * `mapBannerAdItem`'s hardcoded `[300, 250]` so the story can request any
 * IAB size. The `tag_id`/`platform`/`networkCode` strings below are
 * placeholders — the *real* GenAd SDK at `media.begenuin.com` calls GAM with
 * them, and GAM returns no-fill from localhost (verified once). So instead
 * of fighting GAM's serving rules, we install a `window.GenAd` mock in the
 * story before the real SDK script runs (see `useLayoutEffect` in
 * `MultiAspectAdPlaybackImpl`). The mock paints a dynamically-sized banner
 * into the container and fires the SDK's lifecycle callbacks, exercising
 * every surface FeedPlayer/GenAdContainer touches except GAM itself.
 */

/**
 * IAB display sizes the QA story supports. Heights stay between 250 (min
 * useful overlay) and 600 (max in-stream-friendly height).
 */
const DISPLAY_SIZES = [
  [300, 250], // Medium Rectangle (MREC) — most common
  [300, 600], // Half Page / Filmstrip — premium portrait
  [336, 280], // Large Rectangle — MREC variant
  [160, 600], // Wide Skyscraper — tall narrow
] as const;
type DisplaySize = (typeof DISPLAY_SIZES)[number];

/**
 * IAB-spec stripe banner sizes that overlay the *bottom* of the player while
 * the content video keeps playing underneath. Mirrors the sizes the dynamic
 * linkout component uses on `feature/GEN-7990/dynamic-linkout-component`
 * (300×50, 320×50, 320×100) with the 468×60 Full Banner added for wider
 * frames where the mobile units would look stranded.
 *
 * IAB doesn't define a stripe between 100 and 250 px height — anything taller
 * than 100 belongs to the MREC / Billboard family (full display ads), which
 * we already cover in `DISPLAY_SIZES`. So for a 640 px player frame the
 * largest fitting *stripe* is 320×100 with ~28 px of unused space below;
 * picking a taller unit (e.g. MREC) is a layout choice, not a stripe.
 */
const BANNER_OVERLAY_SIZES = [
  [300, 50], // Mobile MMA banner
  [320, 50], // Mobile MMA banner
  [320, 100], // Large Mobile Banner
  [468, 60], // Full Banner (legacy desktop)
] as const;
type BannerOverlaySize = (typeof BANNER_OVERLAY_SIZES)[number];

const BANNER_OVERLAY_LABELS: Record<string, string> = {
  "300x50": "Mobile 300×50",
  "320x50": "Mobile 320×50",
  "320x100": "Mobile 320×100",
  "468x60": "Full Banner",
};

/** Largest stripe-banner size that fits inside `(frameW, frameH)`. Tie-break
 *  by area, then by height. Returns `null` when no eligible size fits. */
function pickBannerOverlaySize(frameW: number, frameH: number): BannerOverlaySize | null {
  const candidates = BANNER_OVERLAY_SIZES.filter(([w, h]) => w <= frameW && h <= frameH);
  if (candidates.length === 0) return null;
  return candidates.reduce<BannerOverlaySize>((best, cur) => {
    const bestArea = best[0] * best[1];
    const curArea = cur[0] * cur[1];
    if (curArea !== bestArea) return curArea > bestArea ? cur : best;
    return cur[1] > best[1] ? cur : best;
  }, candidates[0]);
}

function bannerOverlayKey(size: BannerOverlaySize): string {
  return `${size[0]}x${size[1]}`;
}

const DISPLAY_SIZE_LABELS: Record<string, string> = {
  "300x250": "MREC",
  "300x600": "Half Page",
  "336x280": "Large Rect",
  "160x600": "Skyscraper",
};

function displaySizeKey(size: DisplaySize): string {
  return `${size[0]}x${size[1]}`;
}

function buildDisplayAdConfig(size: DisplaySize): GenAdConfig {
  return {
    adSlotId: `genad-slot-${QA_VIDEO_ID}-${size[0]}x${size[1]}`,
    banner: {
      networkCode: "22639388115",
      adUnitPath: "/22639388115/example/banner",
      platform: "gam",
      size: [size[0], size[1]],
    },
  };
}

/**
 * Build a QA banner SVG at the requested dimensions. Visually labels itself
 * as a QA banner so reviewers don't mistake it for real ad inventory. Header
 * strip + centered title + CTA strip — same layout for every size, just
 * scaled to the canvas.
 */
function buildMockBannerSvg(w: number, h: number): string {
  // Scale chrome relative to whichever dimension is smaller so the layout
  // works for both square-ish (300×250) and very tall narrow (160×600) sizes.
  const minDim = Math.min(w, h);
  const headerH = Math.max(20, Math.min(36, Math.floor(minDim * 0.14)));
  const headerFont = Math.max(9, Math.min(14, Math.floor(minDim * 0.08)));
  const titleFont = Math.max(11, Math.min(22, Math.floor(minDim * 0.12)));
  const cx = w / 2;
  const headerTextY = Math.floor(headerH * 0.65);
  const titleY = Math.floor((h + headerH) / 2 + titleFont / 3);
  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
  <rect width="${w}" height="${h}" fill="#1f2937"/>
  <rect x="0" y="0" width="${w}" height="${headerH}" fill="#facc15"/>
  <text x="${Math.max(8, Math.floor(w * 0.04))}" y="${headerTextY}" font-family="ui-sans-serif, system-ui" font-size="${headerFont}" font-weight="700" fill="#111827">AD · ${w}×${h}</text>
  <text x="${cx}" y="${titleY}" text-anchor="middle" font-family="ui-sans-serif, system-ui" font-size="${titleFont}" font-weight="700" fill="#f9fafb">QA Banner</text>
</svg>
`.trim();
}

function buildMockBannerDataUri(w: number, h: number): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(buildMockBannerSvg(w, h))}`;
}

interface MockBannerConfig {
  size: [number, number];
}

interface MockGenAdInit {
  containerElement: HTMLElement;
  banner?: MockBannerConfig | MockBannerConfig[];
  video?: unknown;
  native?: unknown;
  onStageStart?: (provider: string) => void;
  onStageSuccess?: (provider: string) => void;
  onStageFail?: (provider: string, error: Error) => void;
  onWaterfallFail?: () => void;
  onAdCompleted?: (provider: string) => void;
  events?: {
    onAdRendered?: (event: { provider: string }) => void;
    onAdImpression?: (event: { provider: string }) => void;
    onAdStarted?: (event: { provider: string }) => void;
    onAdClicked?: (event: { provider: string }) => void;
  };
}

/**
 * Pick the first banner entry's size from a possibly-array banner config —
 * mirrors the SDK behavior of picking one creative per slot. Defaults to
 * 300×250 if no size is supplied so the mock never paints a 0×0 image.
 */
function pickBannerSize(banner: MockBannerConfig | MockBannerConfig[] | undefined): [number, number] {
  if (!banner) return [300, 250];
  const first = Array.isArray(banner) ? banner[0] : banner;
  return first?.size ?? [300, 250];
}

/**
 * Minimal stub matching the surface GenAdContainer reads from `window.GenAd`.
 * Only the display-ad path is mocked — for video and native, we fall through
 * to `onWaterfallFail` so the container behaves as if no creative was found.
 *
 * Each `init` returns a string id; `destroy` and `mute` accept that id. The
 * stub tracks instances so a QA reviewer can mount and unmount the slot
 * multiple times without leaks.
 */
function installMockGenAd(): () => void {
  const win = window as unknown as { GenAd?: unknown };
  const previous = win.GenAd;
  const instances = new Map<string, { onAdCompleted?: (provider: string) => void; container: HTMLElement }>();
  let nextId = 0;

  win.GenAd = {
    init(config: MockGenAdInit): string {
      const id = `qa-mock-${nextId++}`;
      const { containerElement, banner, onStageStart, onStageSuccess, onWaterfallFail, onAdCompleted, events } = config;
      if (!banner) {
        // No display config to render — surface the same no-fill flow the
        // real SDK uses when the waterfall finds nothing.
        onWaterfallFail?.();
        return id;
      }
      onStageStart?.("banner");
      const [bw, bh] = pickBannerSize(banner);
      const img = document.createElement("img");
      img.src = buildMockBannerDataUri(bw, bh);
      img.alt = `QA mock display banner ${bw}×${bh}`;
      // Match production rendering: the real GenAd SDK paints a fixed-pixel
      // iframe sized to the creative that *clips* when the container is
      // smaller. `max-width: none` bypasses Tailwind v4 preflight's
      // `img { max-width: 100% }` which would otherwise scale the banner down
      // and visually misrepresent how a real ad behaves in a constrained
      // slot. `flex-shrink: 0` keeps the banner at full size inside the
      // flex-centered container.
      img.style.width = `${bw}px`;
      img.style.height = `${bh}px`;
      img.style.maxWidth = "none";
      img.style.flexShrink = "0";
      img.style.cursor = "pointer";
      img.style.display = "block";
      img.addEventListener("click", () => {
        events?.onAdClicked?.({ provider: "banner" });
        // Match production behavior: a click-through ad doesn't keep the
        // creative on screen after the click. Tear our injected node out
        // *before* notifying the SDK so the slot is visually empty as soon
        // as the click fires.
        if (img.parentNode === containerElement) containerElement.removeChild(img);
        instances.delete(id);
        onAdCompleted?.("banner");
      });
      containerElement.appendChild(img);
      instances.set(id, { onAdCompleted, container: containerElement });
      onStageSuccess?.("banner");
      events?.onAdStarted?.({ provider: "banner" });
      events?.onAdImpression?.({ provider: "banner" });
      events?.onAdRendered?.({ provider: "banner" });
      return id;
    },
    destroy(id: string): void {
      const entry = instances.get(id);
      if (!entry) return;
      const { container } = entry;
      // Remove any children we appended during init.
      while (container.firstChild) container.removeChild(container.firstChild);
      instances.delete(id);
    },
    mute(_id: string, _muted: boolean): void {
      // Display ads have no audio; no-op.
    },
  };

  return () => {
    win.GenAd = previous;
  };
}

const meta: Meta = {
  title: "Molecules/FeedPlayer/Ad QA Harness",
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Manual UX harness for the *full* FeedPlayer chrome + IMA ad playback at every aspect ratio. " +
          "Unlike the bare-V2 harness in `packages/ui`, this story mounts real `PlayerProvider` → " +
          "`FeedPlayer` → `ControlLayer` so the Genuin player chrome (scrubber, play/pause, mute, " +
          "expand, reactions) renders alongside IMA's ad chrome (Ad badge, skip, countdown). " +
          "Pick an aspect, click 'Play ad now', drag the corner of the player wrapper to resize. " +
          "Fixtures are mounted from `packages/ui/.storybook/qa-fixtures/` via `staticDirs` in " +
          "`packages/components/.storybook/main.ts`. " +
          "See `packages/components/docs/linkouts/SAMPLE_AD_TAGS.md` for the one-time " +
          "Chrome Private Network Access unblock.",
      },
    },
  },
};

export default meta;

type AdStatus = "idle" | "requested" | "filled" | "ended";
type AdKind = "video" | "display" | "banner-overlay";

function MultiAspectAdPlaybackImpl() {
  const [adKind, setAdKind] = useState<AdKind>("video");
  const [aspect, setAspect] = useState<AdAspect>("9x16");
  // Default to a portrait wrapper so the 9:16 content clip fills the frame
  // without letterboxing on first paint. Override via sliders or corner drag.
  const [width, setWidth] = useState(360);
  const [height, setHeight] = useState(640);
  const [displaySize, setDisplaySize] = useState<DisplaySize>(DISPLAY_SIZES[0]);
  // Banner-overlay size starts as the picker's automatic choice for the
  // current frame; reviewer can override from the toolbar. Falls back to
  // the smallest entry so the toolbar's "active" state always has a value
  // even when no size fits the current frame.
  const [bannerOverlaySize, setBannerOverlaySize] = useState<BannerOverlaySize>(BANNER_OVERLAY_SIZES[0]);
  const [adUrl, setAdUrl] = useState<string | undefined>(undefined);
  // Display ads take the adConfig route (FeedPlayer → GenAdContainer → GenAd
  // SDK). Setting this drops the `<VideoPlayerV2>` mount in favour of
  // `<GenAdContainer>` which paints the banner at the requested size. See
  // feed-player.tsx (resolvedAdConfig memo) for the precedence: when both
  // `adConfig` and `adTagObject` are present, `adConfig` wins.
  const [adConfig, setAdConfig] = useState<GenAdConfig | null>(null);
  // Banner overlay is a separate visual layer: it does NOT go through
  // FeedPlayer's ad path (which would unmount V2). Instead the story
  // paints a positioned stripe over the player wrapper so the content
  // video keeps playing underneath — matches how `<DynamicLinkouts
  // content={{ kind: "banner-ad" }}>` overlays in production.
  const [bannerOverlay, setBannerOverlay] = useState<BannerOverlaySize | null>(null);
  const [adStatus, setAdStatus] = useState<AdStatus>("idle");
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Install a `window.GenAd` mock before `<GenAdContainer>` starts its
  // init polling. `useLayoutEffect` runs after DOM commit but before paint,
  // so the stub is reliably present before the container's `useEffect`
  // (which runs *after* paint) first checks `window.GenAd`. The container's
  // 100 ms polling loop also covers the race if we ever slip.
  useLayoutEffect(() => {
    return installMockGenAd();
  }, []);

  // Wrapper resize ↔ slider state sync. `resize: both` adds a native
  // corner-drag handle; the ResizeObserver feeds the dragged size back into
  // slider state so the two stay aligned. The slot's *inner* ResizeObserver
  // in VideoPlayerV2 separately fires `AdsLayer.resize` so any running ad
  // follows the new shape.
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const sync = () => {
      const w = el.offsetWidth;
      const h = el.offsetHeight;
      setWidth((prev) => (prev === w ? prev : w));
      setHeight((prev) => (prev === h ? prev : h));
    };
    sync();
    const observer = new ResizeObserver(sync);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleAdFilled = useCallback(() => {
    setAdStatus("filled");
  }, []);

  const handleAdPlaybackEnd = useCallback(() => {
    setAdStatus("ended");
  }, []);

  const playAdNow = useCallback(() => {
    setAdStatus("requested");
    if (adKind === "video") {
      setAdConfig(null);
      setBannerOverlay(null);
      setAdUrl(buildAdUrl(aspect));
    } else if (adKind === "display") {
      setAdUrl(undefined);
      setBannerOverlay(null);
      setAdConfig(buildDisplayAdConfig(displaySize));
    } else {
      // Banner overlay: keep V2 mounted (don't set adConfig/adUrl), just
      // paint a positioned stripe over the wrapper.
      setAdUrl(undefined);
      setAdConfig(null);
      setBannerOverlay(bannerOverlaySize);
      setAdStatus("filled");
    }
  }, [adKind, aspect, displaySize, bannerOverlaySize]);

  // `playerSize` is the height/width hint FeedPlayer forwards to the
  // resolver + analytics. Keep it in sync with the slider state.
  const playerSize = useMemo(() => ({ width, height }), [width, height]);

  return (
    <div className="gencl:flex gencl:flex-col gencl:gap-4 gencl:p-6 gencl:bg-secondary-50 gencl:min-h-screen">
      <Toolbar
        adKind={adKind}
        onAdKindChange={setAdKind}
        aspect={aspect}
        onAspectChange={setAspect}
        displaySize={displaySize}
        onDisplaySizeChange={setDisplaySize}
        bannerOverlaySize={bannerOverlaySize}
        onBannerOverlaySizeChange={setBannerOverlaySize}
        autoPickedBanner={pickBannerOverlaySize(width, height)}
        width={width}
        onWidthChange={setWidth}
        height={height}
        onHeightChange={setHeight}
        onPlayAd={playAdNow}
        adStatus={adStatus}
      />

      <div
        ref={wrapperRef}
        data-testid="feed-player-ad-qa-resizable-wrapper"
        // `ring-1` (box-shadow) instead of `border` so the visible outline
        // doesn't subtract from the content box. With `border`, the slot's
        // `clientWidth` was 2px smaller than the slider's `offsetWidth` —
        // making the toolbar (e.g. "360×190") disagree with what the GenAd
        // size guard measured (358×188).
        className="gencl:bg-black gencl:rounded-md gencl:overflow-hidden gencl:resize gencl:ring-1 gencl:ring-secondary-200 gencl:relative"
        style={{ width: `${width}px`, height: `${height}px`, maxWidth: "100%" }}>
        <PlayerProvider
          isActive={true}
          videoId={QA_VIDEO_ID}
          videoUrl={CONTENT_VIDEO_SRC}
          onPlayerIterationEnd={() => undefined}
          videoDescription={QA_POST_DETAILS.video?.descritptionText}
          videoType={VideoTypes.Content}
          explicitAutoPlay={true}
          explicitLoop={false}>
          <GestureProvider isInIframe={false}>
            <FeedPlayer
              src={CONTENT_VIDEO_SRC}
              videoId={QA_VIDEO_ID}
              poster={CONTENT_VIDEO_POSTER}
              className="gencl:bg-secondary-200 gencl:w-full gencl:h-full"
              playsInline
              muted
              isActive
              videoType={VideoTypes.Content}
              sponsorshipInfo={null}
              playerSize={playerSize}
              adUrl={adUrl}
              adConfig={adConfig ?? undefined}
              onAdFilled={handleAdFilled}
              onAdPlaybackEnd={handleAdPlaybackEnd}
            />
            <ControlLayer
              isActive={true}
              postDetails={QA_POST_DETAILS}
              enableExpand={false}
              expandViewDetails={false}
            />
          </GestureProvider>
        </PlayerProvider>
        {bannerOverlay ? <BannerStripeOverlay size={bannerOverlay} frameW={width} frameH={height} /> : null}
      </div>
    </div>
  );
}

interface BannerStripeOverlayProps {
  size: BannerOverlaySize;
  frameW: number;
  frameH: number;
}

/**
 * Bottom-anchored stripe overlay matching the production
 * `<DynamicLinkouts content={{ kind: "banner-ad" }}>` layout pattern: the
 * banner sits centered horizontally in the bottom of the frame and the
 * content video keeps playing underneath. To clear it, switch ad types
 * in the toolbar — no in-banner dismiss control because production
 * stripe creatives don't ship one either. Clips silently when the
 * requested size exceeds the frame so layout QA can see boundary cases.
 */
function BannerStripeOverlay({ size, frameW, frameH }: BannerStripeOverlayProps) {
  const [bw, bh] = size;
  const tooWide = bw > frameW;
  const tooTall = bh > frameH;
  return (
    <div
      data-testid="feed-player-ad-qa-banner-overlay"
      data-banner-size={`${bw}x${bh}`}
      className="gencl:absolute gencl:bottom-0 gencl:left-0 gencl:right-0 gencl:z-20 gencl:flex gencl:justify-center gencl:pointer-events-none">
      <div
        style={{
          width: `${bw}px`,
          height: `${bh}px`,
          maxWidth: "none",
          flexShrink: 0,
          marginBottom: 12,
          position: "relative",
          pointerEvents: "auto",
        }}>
        <img
          src={buildMockBannerDataUri(bw, bh)}
          alt={`QA mock banner overlay ${bw}×${bh}`}
          style={{ width: `${bw}px`, height: `${bh}px`, maxWidth: "none", display: "block" }}
        />
      </div>
      {(tooWide || tooTall) && (
        <span
          aria-live="polite"
          className="gencl:absolute gencl:top-2 gencl:left-2 gencl:rounded gencl:bg-yellow-500 gencl:text-black gencl:text-body-3 gencl:px-2 gencl:py-0.5">
          Banner exceeds frame ({tooWide ? "wider" : "taller"})
        </span>
      )}
    </div>
  );
}

interface ToolbarProps {
  adKind: AdKind;
  onAdKindChange: (next: AdKind) => void;
  aspect: AdAspect;
  onAspectChange: (next: AdAspect) => void;
  displaySize: DisplaySize;
  onDisplaySizeChange: (next: DisplaySize) => void;
  bannerOverlaySize: BannerOverlaySize;
  onBannerOverlaySizeChange: (next: BannerOverlaySize) => void;
  autoPickedBanner: BannerOverlaySize | null;
  width: number;
  onWidthChange: (next: number) => void;
  height: number;
  onHeightChange: (next: number) => void;
  onPlayAd: () => void;
  adStatus: AdStatus;
}

const AD_KIND_OPTIONS: ReadonlyArray<{ value: AdKind; label: string }> = [
  { value: "video", label: "Video (IMA VAST)" },
  { value: "display", label: "Display (GAM full-frame)" },
  { value: "banner-overlay", label: "Banner overlay (stripe)" },
];

function Toolbar({
  adKind,
  onAdKindChange,
  aspect,
  onAspectChange,
  displaySize,
  onDisplaySizeChange,
  bannerOverlaySize,
  onBannerOverlaySizeChange,
  autoPickedBanner,
  width,
  onWidthChange,
  height,
  onHeightChange,
  onPlayAd,
  adStatus,
}: ToolbarProps) {
  return (
    <div className="gencl:flex gencl:flex-col gencl:gap-3 gencl:p-3 gencl:rounded-md gencl:bg-white gencl:border gencl:border-secondary-200">
      <div className="gencl:flex gencl:flex-wrap gencl:items-center gencl:gap-2">
        <span className="gencl:text-body-2-medium">Ad type:</span>
        {AD_KIND_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            data-testid={`feed-player-ad-qa-kind-${opt.value}`}
            onClick={() => onAdKindChange(opt.value)}
            aria-pressed={adKind === opt.value}
            className={
              adKind === opt.value
                ? "gencl:px-3 gencl:py-1 gencl:rounded gencl:bg-primary-600 gencl:text-white gencl:text-body-2-medium"
                : "gencl:px-3 gencl:py-1 gencl:rounded gencl:bg-secondary-100 gencl:text-body-2-medium"
            }>
            {opt.label}
          </button>
        ))}
      </div>

      {adKind === "video" && (
        <div className="gencl:flex gencl:flex-wrap gencl:items-center gencl:gap-2">
          <span className="gencl:text-body-2-medium">Ad aspect:</span>
          {AD_ASPECTS.map((a) => (
            <button
              key={a}
              type="button"
              data-testid={`feed-player-ad-qa-aspect-${a}`}
              onClick={() => onAspectChange(a)}
              aria-pressed={aspect === a}
              className={
                aspect === a
                  ? "gencl:px-3 gencl:py-1 gencl:rounded gencl:bg-primary-600 gencl:text-white gencl:text-body-2-medium"
                  : "gencl:px-3 gencl:py-1 gencl:rounded gencl:bg-secondary-100 gencl:text-body-2-medium"
              }>
              {a.replace("x", ":")}
            </button>
          ))}
          <button
            type="button"
            data-testid="feed-player-ad-qa-play-ad"
            onClick={onPlayAd}
            className="gencl:ml-auto gencl:px-3 gencl:py-1 gencl:rounded gencl:bg-primary-600 gencl:text-white gencl:text-body-2-medium">
            Play ad now
          </button>
        </div>
      )}
      {adKind === "display" && (
        <div className="gencl:flex gencl:flex-wrap gencl:items-center gencl:gap-2">
          <span className="gencl:text-body-2-medium">Banner size:</span>
          {DISPLAY_SIZES.map((size) => {
            const key = displaySizeKey(size);
            const isActive = displaySizeKey(displaySize) === key;
            return (
              <button
                key={key}
                type="button"
                data-testid={`feed-player-ad-qa-display-size-${key}`}
                onClick={() => onDisplaySizeChange(size)}
                aria-pressed={isActive}
                title={`${DISPLAY_SIZE_LABELS[key] ?? ""} (${size[0]}×${size[1]})`}
                className={
                  isActive
                    ? "gencl:px-3 gencl:py-1 gencl:rounded gencl:bg-primary-600 gencl:text-white gencl:text-body-2-medium"
                    : "gencl:px-3 gencl:py-1 gencl:rounded gencl:bg-secondary-100 gencl:text-body-2-medium"
                }>
                {size[0]}×{size[1]}
              </button>
            );
          })}
          <button
            type="button"
            data-testid="feed-player-ad-qa-play-ad"
            onClick={onPlayAd}
            className="gencl:ml-auto gencl:px-3 gencl:py-1 gencl:rounded gencl:bg-primary-600 gencl:text-white gencl:text-body-2-medium">
            Play ad now
          </button>
        </div>
      )}
      {adKind === "banner-overlay" && (
        <div className="gencl:flex gencl:flex-wrap gencl:items-center gencl:gap-2">
          <span className="gencl:text-body-2-medium">Stripe size:</span>
          {BANNER_OVERLAY_SIZES.map((size) => {
            const key = bannerOverlayKey(size);
            const isActive = bannerOverlayKey(bannerOverlaySize) === key;
            const isAutoPick = autoPickedBanner && bannerOverlayKey(autoPickedBanner) === key;
            return (
              <button
                key={key}
                type="button"
                data-testid={`feed-player-ad-qa-banner-overlay-size-${key}`}
                onClick={() => onBannerOverlaySizeChange(size)}
                aria-pressed={isActive}
                title={`${BANNER_OVERLAY_LABELS[key] ?? ""} (${size[0]}×${size[1]})${isAutoPick ? " — picker's choice for this frame" : ""}`}
                className={
                  isActive
                    ? "gencl:px-3 gencl:py-1 gencl:rounded gencl:bg-primary-600 gencl:text-white gencl:text-body-2-medium"
                    : "gencl:px-3 gencl:py-1 gencl:rounded gencl:bg-secondary-100 gencl:text-body-2-medium"
                }>
                {size[0]}×{size[1]}
                {isAutoPick ? " ✓" : ""}
              </button>
            );
          })}
          <button
            type="button"
            data-testid="feed-player-ad-qa-play-ad"
            onClick={onPlayAd}
            className="gencl:ml-auto gencl:px-3 gencl:py-1 gencl:rounded gencl:bg-primary-600 gencl:text-white gencl:text-body-2-medium">
            Show overlay
          </button>
        </div>
      )}

      <div className="gencl:flex gencl:flex-wrap gencl:items-center gencl:gap-4">
        <SliderField
          id="feed-player-ad-qa-width"
          label="Width"
          min={240}
          max={1280}
          step={10}
          value={width}
          onChange={onWidthChange}
        />
        <SliderField
          id="feed-player-ad-qa-height"
          label="Height"
          min={180}
          max={900}
          step={10}
          value={height}
          onChange={onHeightChange}
        />
        <span className="gencl:text-body-3 gencl:text-secondary-600">
          Player: {width} × {height} px (drag the bottom-right corner to resize)
        </span>
      </div>

      <div className="gencl:flex gencl:items-center gencl:gap-2 gencl:text-body-3">
        <span aria-live="polite" data-testid="feed-player-ad-qa-ad-status">
          Ad status: <strong>{adStatus}</strong>
        </span>
      </div>
    </div>
  );
}

interface SliderFieldProps {
  id: string;
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (next: number) => void;
}

function SliderField({ id, label, min, max, step, value, onChange }: SliderFieldProps) {
  return (
    <label htmlFor={id} className="gencl:flex gencl:items-center gencl:gap-2 gencl:text-body-3">
      <span className="gencl:min-w-12">{label}</span>
      <input
        id={id}
        data-testid={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ WebkitAppearance: "auto", appearance: "auto", width: 200 }}
      />
      <span className="gencl:min-w-12 gencl:tabular-nums">{value}px</span>
    </label>
  );
}

type Story = StoryObj;

/**
 * Manual UX harness for FeedPlayer (real Genuin chrome) + IMA ad rendering.
 * Picks a VAST tag for each of the five aspect ratios we ship; resizes the
 * player wrapper to reveal control/skip/CTA alignment bugs across both the
 * Genuin control layer and the IMA ad layer.
 */
export const MultiAspectAdPlayback: Story = {
  render: () => (
    <VideoElementProvider>
      <MultiAspectAdPlaybackImpl />
    </VideoElementProvider>
  ),
  parameters: {
    controls: { disable: true },
  },
};
