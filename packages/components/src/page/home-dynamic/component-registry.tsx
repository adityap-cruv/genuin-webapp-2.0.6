"use client";

import { cn } from "@genuin/ui/lib/utils";
import { NavArrowButton } from "@genuin/ui/player-controls";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

import { useBaseContext } from "@genuin/components/context/base";
import { SectionHeader } from "@genuin/components/molecules/section-header/section-header";
import { EventCarousel } from "@genuin/components/organisms/event-carousel/event-carousel";
import {
  useEmit,
  useOptionalEventSurface,
  useSurfaceEvent,
} from "@genuin/components/organisms/event-surface/event-surface-context";
import type { VideoContext } from "@genuin/components/organisms/event-surface/event-surface.types";
import {
  HoverLinkCardList,
  type ContextualLinkMetaData,
} from "@genuin/components/organisms/hover-link-card-list/hover-link-card-list";
import { IntelligenceArticleCard } from "@genuin/components/organisms/intelligence-panel/intelligence-article-card";
import { IntelligencePanel } from "@genuin/components/organisms/intelligence-panel/intelligence-panel";
import { IntelligencePanelShell } from "@genuin/components/organisms/intelligence-panel/intelligence-panel-shell";
import type {
  IntelligenceArticle,
  IntelligencePanelLayout,
} from "@genuin/components/organisms/intelligence-panel/intelligence-panel.types";
import { useFeed } from "@genuin/components/react-query/api/feed";
import type { PostDetailsType } from "@genuin/components/react-query/api/feed/schema";
import { getQueryKeyForFeed } from "@genuin/components/react-query/keys/feed";
import type { FeedData } from "@genuin/components/templates/feed/feed.type";

import type { ArticleData, ComponentType, WidgetData, WidgetNode, WidgetWrapper } from "./contract";

// ─── Per-page contexts + shared hooks/tokens ────────────────────────────────────────────
// Consolidated here (from the former block-visibility / widget-bus / intelligence-layout /
// use-community-feed files) so the dynamic-home engine is a few cohesive files, not many tiny ones.

/**
 * Whether the current page block is near the viewport. Video widgets read this to render a live
 * player only when near, and a lightweight poster when far — so off-screen blocks don't hold
 * `<video>`/HLS resources. Defaults to `true` so a widget without a provider still plays.
 */
export const BlockVisibilityContext = createContext<boolean>(true);
export function useBlockVisibility(): boolean {
  return useContext(BlockVisibilityContext);
}

export type HomePlayerOverlayRequest = {
  sourceDomId: string;
};

type OpenHomePlayerOverlay = (request: HomePlayerOverlayRequest) => void;

const HomePlayerOverlayContext = createContext<OpenHomePlayerOverlay | null>(null);

export function HomePlayerOverlayProvider({
  onOpen,
  children,
}: {
  onOpen: OpenHomePlayerOverlay;
  children: ReactNode;
}) {
  return <HomePlayerOverlayContext.Provider value={onOpen}>{children}</HomePlayerOverlayContext.Provider>;
}

/**
 * The `dependsOn` wiring, read off the row's `EventSurface`.
 *
 * Each row is one surface with one bus (see `RowRenderer`), and each widget is an
 * `EventSurfacePanel` whose `id` is its manifest `node.id`. A video panel broadcasts
 * `video:load` / `video:change`; a list panel broadcasts `item:select`. Because every record
 * carries its origin `sourceId`, a dependent can filter to exactly the widget it declared in
 * `dependsOn.widgetId` — which is what keeps two video↔list pairs in one row from cross-talking.
 *
 * `useLatestEvent` deliberately is NOT used here: it latches per event TYPE regardless of origin,
 * so it would hand a list the other pair's video.
 */
function useLatestVideoFrom(sourceId: string | undefined): VideoContext | null {
  const bus = useOptionalEventSurface();
  const [video, setVideo] = useState<VideoContext | null>(null);

  useEffect(() => {
    if (!bus || !sourceId) return;

    // Seed from the latch so a late-mounting list shows the running video immediately, instead of
    // staying empty until a change that may never come.
    const seed = bus.latestRecord("video:change") ?? bus.latestRecord("video:load");
    if (seed && seed.sourceId === sourceId) setVideo(seed.payload as VideoContext);

    const offChange = bus.on("video:change", (payload, record) => {
      if (record.sourceId === sourceId) setVideo(payload);
    });
    const offLoad = bus.on("video:load", (payload, record) => {
      if (record.sourceId === sourceId) setVideo(payload);
    });
    return () => {
      offChange();
      offLoad();
    };
  }, [bus, sourceId]);

  return video;
}

/** Presentation tokens for the Intelligence panels (component design tokens, never in the payload). */
const INTELLIGENCE_LAYOUT: IntelligencePanelLayout = {
  panel: { width: "100%", height: "100%" },
  featuredArticle: {
    height: 199,
    clipPath: "polygon(5% 0, 100% 0, 100% 100%, 0 100%, 0 10%)",
    ctaFontSize: 9,
    ctaClipPath: "polygon(0 0, 100% 0, 100% 45%, 82% 100%, 0 100%)",
  },
  articleCard: { height: 221, imageAspectRatio: "4 / 3" },
  upNextGrid: { minimumCardWidth: 172 },
};
const INTERVIEW_CARD_LAYOUT = { ...INTELLIGENCE_LAYOUT.articleCard, height: "auto" as const };

const SECTION_LOGO = "/images/home/the-foil-logo.jpg";

export type CommunityFeed = {
  feedData: FeedData;
  posts: PostDetailsType[];
  communityName: string;
  communityImage: string;
  groupName?: string;
  isLoading: boolean;
};

/**
 * One community's (or group's) feed — the same brand-scoped `useFeed("HOME", …)` request the
 * existing home page makes. Returns `FeedData`, the flat `posts` and the community name/avatar.
 */
export function useCommunityFeed(communityId: string, groupId?: string): CommunityFeed {
  const { isInIframe, brandDetails } = useBaseContext();
  const options = useMemo(
    () => ({
      isInIframe,
      brandId: brandDetails.brand_id ?? undefined,
      communityIds: [communityId],
      ...(groupId ? { groupIds: [groupId] } : {}),
    }),
    [isInIframe, brandDetails.brand_id, communityId, groupId]
  );
  const { data, isLoading, hasNextPage, isFetchingNextPage, fetchNextPage } = useFeed("HOME", options);
  const posts = useMemo(() => data?.pages.flatMap((page) => page.feed) ?? [], [data]);
  const feedData: FeedData = useMemo(
    () => ({
      queryKey: getQueryKeyForFeed("HOME", options),
      videos: posts,
      isLoading,
      hasNextPage: hasNextPage ?? false,
      isFetchingNextPage,
      fetchNextPage,
      totalVideos: data?.pages[0]?.totalVideos,
      pageSession: data?.pages[0]?.pageSession,
    }),
    [posts, isLoading, hasNextPage, isFetchingNextPage, fetchNextPage, data, options]
  );
  const first = posts[0];
  return {
    feedData,
    posts,
    communityName: first?.community?.name ?? "",
    communityImage: first?.community?.profileImage ?? SECTION_LOGO,
    groupName: groupId ? (first?.group?.name ?? undefined) : undefined,
    isLoading,
  };
}

export type WidgetRenderProps = {
  node: WidgetNode;
  data: WidgetData;
  dataMap: Record<string, WidgetData>;
};

function toArticle(article: ArticleData): IntelligenceArticle {
  return {
    id: article.id,
    title: article.title,
    href: article.href,
    image: { src: article.image.src, alt: article.image.alt ?? "" },
  };
}

// ─── Genuin SDK placement embed ─────────────────────────────────────────────────────────

/**
 * The video slots (carousel / feed / grid) render Genuin SDK PLACEMENT embeds instead of the
 * internal video components. `window.genuin.init({})` scans the page for `.gen-sdk-class`
 * containers and initialises each from its `data-style-id` / `data-placement-id` /
 * `data-api-key`; repeated calls skip already-initialised containers, so placements added by
 * infinite scroll are picked up safely. Each container needs a unique id.
 */
const SDK_SCRIPT_SRC =
  process.env.NEXT_PUBLIC_GENUIN_SDK_URL ?? "https://media.qa.begenuin.com/sdk/2.0.6/gen_sdk.min.js";

type GenuinWindow = Window & {
  genuin?: {
    init?: (config: Record<string, unknown>) => unknown;
    emitInternal?: (event: string, payload?: unknown) => void;
    onInternal?: (event: string, listener: (payload: unknown) => void) => (() => void) | void;
    collapse?: (id: string) => void;
  };
};

let sdkLoadPromise: Promise<void> | null = null;

function loadGenuinSdk(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if ((window as GenuinWindow).genuin?.init) return Promise.resolve();
  if (sdkLoadPromise) return sdkLoadPromise;

  sdkLoadPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${SDK_SCRIPT_SRC}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Genuin SDK failed to load")));
      return;
    }
    const script = document.createElement("script");
    script.src = SDK_SCRIPT_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Genuin SDK failed to load"));
    document.body.appendChild(script);
  });
  return sdkLoadPromise;
}

// Batch init: many placements mounting in one frame trigger a single DOM scan.
let initHandle: number | null = null;
function scheduleGenuinInit() {
  if (typeof window === "undefined" || initHandle !== null) return;
  initHandle = window.requestAnimationFrame(() => {
    initHandle = null;
    // `player_controls: "v2"` matches the hardcoded /home page — keeps the v2 control cluster
    // (mute → play/pause → expand) in both the inline placement and the expanded view.
    (window as GenuinWindow).genuin?.init?.({ configuration: { player_controls: "v2" } });
  });
}

function GenuinPlacement({
  domId,
  styleId,
  placementId,
  apiKey,
  mobileStyleId,
  mobilePlacementId,
  onExpandRequest,
}: {
  domId: string;
  styleId: string;
  placementId: string;
  apiKey: string;
  mobileStyleId?: string;
  mobilePlacementId?: string;
  /** Notifies Home that this existing placement is entering its SDK expand view. */
  onExpandRequest?: () => void;
}) {
  const hasMobilePlacement = Boolean(mobileStyleId && mobilePlacementId);
  const [viewport, setViewport] = useState<"mobile" | "desktop" | null>(hasMobilePlacement ? null : "desktop");
  const lastVideoClickRef = useRef(0);

  useEffect(() => {
    if (!hasMobilePlacement) {
      setViewport("desktop");
      return;
    }

    const mediaQuery = window.matchMedia("(max-width: 767px)");
    const syncViewport = () => setViewport(mediaQuery.matches ? "mobile" : "desktop");
    syncViewport();
    mediaQuery.addEventListener("change", syncViewport);
    return () => mediaQuery.removeEventListener("change", syncViewport);
  }, [hasMobilePlacement]);

  const useMobilePlacement = viewport === "mobile" && hasMobilePlacement;
  const activeStyleId = useMobilePlacement ? mobileStyleId! : styleId;
  const activePlacementId = useMobilePlacement ? mobilePlacementId! : placementId;

  useEffect(() => {
    if (viewport === null) return;
    let cancelled = false;
    loadGenuinSdk()
      .then(() => {
        if (!cancelled) scheduleGenuinInit();
      })
      .catch(() => {
        /* SDK unavailable — the container just stays empty. */
      });
    return () => {
      cancelled = true;
    };
  }, [viewport, activeStyleId, activePlacementId]);

  // The SDK owns the clickable video/control UI inside its Shadow DOM. Pair its global
  // `onVideoClicked` signal with this host's captured video intent so the correct placement opens.
  useEffect(() => {
    if (!onExpandRequest || viewport === null) return;
    let cancelled = false;
    let unsubscribe: (() => void) | undefined;
    let retry: number | undefined;
    let attempts = 0;

    const register = () => {
      if (cancelled) return;
      const genuin = (window as GenuinWindow).genuin;
      if (!genuin?.onInternal) {
        if (attempts++ < 40) retry = window.setTimeout(register, 200);
        return;
      }

      const off = genuin.onInternal("onVideoClicked", () => {
        if (Date.now() - lastVideoClickRef.current > 1200) return;
        lastVideoClickRef.current = 0;
        onExpandRequest();
      });
      if (typeof off === "function") unsubscribe = off;
    };

    loadGenuinSdk()
      .then(register)
      .catch(() => undefined);
    return () => {
      cancelled = true;
      if (retry) window.clearTimeout(retry);
      unsubscribe?.();
    };
  }, [domId, onExpandRequest, viewport]);

  if (viewport === null) {
    return <div style={{ width: "100%", height: "100%" }} />;
  }

  return (
    <div
      key={`${activeStyleId}-${activePlacementId}`}
      id={domId}
      className="gen-sdk-class"
      data-style-id={activeStyleId}
      data-placement-id={activePlacementId}
      data-api-key={apiKey}
      onClickCapture={(event) => {
        const path = event.nativeEvent.composedPath();
        const controlLayerIndex = path.findIndex(
          (target) =>
            target instanceof Element &&
            target.classList.contains("gencl:absolute") &&
            target.classList.contains("gencl:inset-0")
        );
        const clickPath = controlLayerIndex < 0 ? path : path.slice(0, controlLayerIndex);
        const isPlayerControl = clickPath.some(
          (target) =>
            target instanceof Element &&
            (target.matches("button, a, [role='button']") || target.classList.contains("gencl:cursor-pointer"))
        );
        lastVideoClickRef.current = isPlayerControl ? 0 : Date.now();
      }}
      style={{ width: "100%", height: "100%" }}
    />
  );
}

const HOME_FEED_VIEW_ATTRIBUTE = "data-home-feed-view";
const HOME_FEED_SESSION_ATTRIBUTE = "data-home-feed-session";
const HOME_FULL_VIEW_EVENT = "genuin:home-feed-full-view";
const HOME_FEED_VIEW_EVENT = "genuin:home-feed-view";
// High enough to sit above Home, but below Koah's document-level options dialog
// (2147483000). Using the maximum z-index hides that dialog behind the player.
const HOME_FEED_VIEW_Z_INDEX = "1000";
const HOME_FEED_BACK_Z_INDEX = 1001;

function markHomeFeedView(sourceDomId: string, active: boolean) {
  const source = document.getElementById(sourceDomId);
  const embedRoot = source?.shadowRoot?.querySelector<HTMLElement>(".gen-sdk-class");
  for (const element of [source, embedRoot]) {
    if (active) element?.setAttribute(HOME_FEED_VIEW_ATTRIBUTE, "true");
    else element?.removeAttribute(HOME_FEED_VIEW_ATTRIBUTE);
  }
}

function markHomeFeedSession(sourceDomId: string, active: boolean) {
  const source = document.getElementById(sourceDomId);
  const embedRoot = source?.shadowRoot?.querySelector<HTMLElement>(".gen-sdk-class");
  for (const element of [source, embedRoot]) {
    if (active) element?.setAttribute(HOME_FEED_SESSION_ATTRIBUTE, "true");
    else element?.removeAttribute(HOME_FEED_SESSION_ATTRIBUTE);
  }
}

function restoreInlineStyle(element: HTMLElement | null, value: string | null) {
  if (!element) return;
  if (value === null) element.removeAttribute("style");
  else element.setAttribute("style", value);
}

function setImportantStyles(element: HTMLElement, styles: Record<string, string>) {
  for (const [property, value] of Object.entries(styles)) {
    if (
      element.style.getPropertyValue(property) === value &&
      element.style.getPropertyPriority(property) === "important"
    ) {
      continue;
    }
    element.style.setProperty(property, value, "important");
  }
}

/**
 * Home only changes the presentation of the SDK's existing expand-view portal. No second SDK
 * placement, player or route is created, so playback, active video and controls keep one owner.
 */
export function HomePlayerOverlay({
  request,
  boundsRef,
  onClose,
}: {
  request: HomePlayerOverlayRequest;
  boundsRef: React.RefObject<HTMLDivElement | null>;
  onClose: () => void;
}) {
  const [backPosition, setBackPosition] = useState<{ left: number; top: number } | null>(null);

  useLayoutEffect(() => {
    let frame = 0;
    let portalObserver: MutationObserver | null = null;
    let contentObserver: MutationObserver | null = null;
    let host: HTMLElement | null = null;
    let portalContainer: HTMLElement | null = null;
    let feedStageStyle: HTMLStyleElement | null = null;
    let hostStyle: string | null = null;
    let portalStyle: string | null = null;
    let promoted = false;
    let revealed = false;

    const mountFeedStageStyle = () => {
      if (!host?.shadowRoot || feedStageStyle) return;
      feedStageStyle = document.createElement("style");
      feedStageStyle.dataset.homeFeedView = "true";
      feedStageStyle.textContent = `
        [data-portal-container], [data-portal-container] > .gen-sdk-expand-view, #gencl-feed-view {
          position: absolute !important;
          inset: 0 !important;
          width: 100% !important;
          height: 100% !important;
          min-height: 0 !important;
          background-color: #fff !important;
        }
        [data-feed-video-column] {
          height: calc(100% - 48px) !important;
          margin-block: 24px !important;
          border-radius: 12px !important;
          overflow: hidden !important;
        }
        [role="navigation"][aria-label="Video navigation"],
        button[class~="gencl:right-7.5"][class~="gencl:top-6"] {
          display: none !important;
        }
        .swiper-slide-active .gencl\\:group-hover\\:opacity-100.gencl\\:opacity-0 {
          opacity: 1 !important;
          pointer-events: auto !important;
        }
      `;
      host.shadowRoot.appendChild(feedStageStyle);
    };

    const restoreFullView = () => {
      restoreInlineStyle(host, hostStyle);
      restoreInlineStyle(portalContainer, portalStyle);
      feedStageStyle?.remove();
      feedStageStyle = null;
      setBackPosition(null);
    };

    const applyFeedBounds = () => {
      const bounds = boundsRef.current?.getBoundingClientRect();
      if (!host || !portalContainer || !bounds || promoted) return;
      const viewportWidth = window.visualViewport?.width ?? document.documentElement.clientWidth;
      const viewportHeight = window.visualViewport?.height ?? document.documentElement.clientHeight;

      setImportantStyles(host, {
        position: "fixed",
        inset: "auto",
        top: `${bounds.top}px`,
        left: `${bounds.left}px`,
        width: `${Math.min(bounds.width, viewportWidth - bounds.left)}px`,
        height: `${Math.min(bounds.height, viewportHeight - bounds.top)}px`,
        overflow: "hidden",
        "z-index": HOME_FEED_VIEW_Z_INDEX,
      });
      if (revealed) {
        setBackPosition((current) => {
          const next = { left: bounds.left + 24, top: bounds.top + 24 };
          return current?.left === next.left && current.top === next.top ? current : next;
        });
      }
    };

    const settleFeedBounds = (remainingFrames = 3) => {
      applyFeedBounds();
      if (remainingFrames > 1 && !promoted) {
        frame = window.requestAnimationFrame(() => settleFeedBounds(remainingFrames - 1));
      }
    };

    const attachToSdkPortal = (): boolean => {
      host = document.querySelector<HTMLElement>('[data-genuin-overlay-host][data-portal-key="expand-view"]');
      portalContainer = host?.shadowRoot?.querySelector<HTMLElement>("[data-portal-container]") ?? null;
      if (!host || !portalContainer) return false;

      portalObserver?.disconnect();
      portalObserver = null;

      hostStyle = host.getAttribute("style");
      portalStyle = portalContainer.getAttribute("style");
      setImportantStyles(host, { visibility: "hidden" });
      mountFeedStageStyle();
      // Home and the SDK portal commit in separate React roots. Apply immediately for the first
      // paint; the SDK's EXPAND_VIEW_CHANGED signal below performs the final hand-off after its
      // RootPortal effects have committed.
      settleFeedBounds();

      const revealFeed = (): boolean => {
        if (!host || !portalContainer?.querySelector(".gen-sdk-expand-view")) return false;
        revealed = true;
        applyFeedBounds();
        setImportantStyles(host, { visibility: "visible" });
        contentObserver?.disconnect();
        contentObserver = null;
        return true;
      };
      if (!revealFeed()) {
        contentObserver = new MutationObserver(revealFeed);
        contentObserver.observe(portalContainer, { childList: true, subtree: true });
      }
      return true;
    };

    const handleFullView = () => {
      promoted = true;
      markHomeFeedView(request.sourceDomId, false);
      restoreFullView();
      if (host) {
        setImportantStyles(host, {
          position: "fixed",
          inset: "0",
          width: "100%",
          height: "100%",
          overflow: "hidden",
        });
      }
      if (portalContainer) {
        setImportantStyles(portalContainer, {
          position: "fixed",
          inset: "0",
          width: "100%",
          height: "100%",
        });
      }
    };
    const handleFeedView = () => {
      if (!promoted || !host || !portalContainer) return;
      restoreFullView();
      promoted = false;
      markHomeFeedView(request.sourceDomId, true);
      mountFeedStageStyle();
      setImportantStyles(host, { visibility: "visible" });
      settleFeedBounds();
    };
    const handleExpandChange = (raw: unknown) => {
      const value =
        typeof raw === "object" && raw !== null && "payload" in raw ? (raw as { payload: unknown }).payload : raw;
      if (value === true) settleFeedBounds();
      if (value === false) onClose();
    };

    markHomeFeedView(request.sourceDomId, true);
    markHomeFeedSession(request.sourceDomId, true);
    if (!attachToSdkPortal()) {
      // The SDK and Home render through separate React roots. Observe portal creation so the
      // feed bounds land before its first browser paint instead of one animation frame later.
      portalObserver = new MutationObserver(attachToSdkPortal);
      portalObserver.observe(document.body, { childList: true, subtree: true });
    }
    window.addEventListener("resize", applyFeedBounds);
    document.addEventListener(HOME_FULL_VIEW_EVENT, handleFullView);
    document.addEventListener(HOME_FEED_VIEW_EVENT, handleFeedView);
    const unsubscribe: unknown = (window as GenuinWindow).genuin?.onInternal?.(
      "onExpandViewChanged",
      handleExpandChange
    );

    return () => {
      window.cancelAnimationFrame(frame);
      portalObserver?.disconnect();
      contentObserver?.disconnect();
      window.removeEventListener("resize", applyFeedBounds);
      document.removeEventListener(HOME_FULL_VIEW_EVENT, handleFullView);
      document.removeEventListener(HOME_FEED_VIEW_EVENT, handleFeedView);
      if (typeof unsubscribe === "function") unsubscribe();
      restoreFullView();
      markHomeFeedView(request.sourceDomId, false);
      markHomeFeedSession(request.sourceDomId, false);
    };
  }, [boundsRef, onClose, request.sourceDomId]);

  const handleBack = () => {
    (window as GenuinWindow).genuin?.collapse?.(request.sourceDomId);
    onClose();
  };

  if (!backPosition) return null;
  return createPortal(
    <div style={{ position: "fixed", ...backPosition, zIndex: HOME_FEED_BACK_Z_INDEX }}>
      <NavArrowButton direction="left" size="lg" theme="dark" ariaLabel="Back" onClick={handleBack} />
    </div>,
    document.body
  );
}

/** Latch: true once `value` has been true at least once (mount the placement, then keep it). */
function useHasBeenTrue(value: boolean): boolean {
  const [latched, setLatched] = useState(value);
  useEffect(() => {
    if (value && !latched) setLatched(true);
  }, [value, latched]);
  return latched;
}

// ─── Frames ─────────────────────────────────────────────────────────────────────────────

/**
 * Per-widget frame: header + optional spacer + content wrapper, styled from the manifest's
 * `wrapper` flags. Reproduces the hand-tuned panel wrappers in `home.tsx` (the rounded video
 * boxes, the `ring-1 ring-secondary-200` links border, the 42px alignment spacer).
 */
function WidgetFrame({
  heading,
  subHeading,
  logo,
  imageAlt,
  wrapper,
  children,
}: {
  heading?: string;
  subHeading?: string;
  logo?: string;
  imageAlt?: string;
  wrapper?: WidgetWrapper;
  children: ReactNode;
}) {
  const frame = wrapper ?? {};
  return (
    <div className="gencl:flex gencl:h-full gencl:min-h-0 gencl:min-w-0 gencl:flex-col gencl:gap-3">
      {frame.showHeader !== false && (
        <SectionHeader imageUrl={logo} imageAlt={imageAlt} heading={heading} subHeading={subHeading} />
      )}
      {frame.topSpacerPx ? <div className="gen-home-spacer" aria-hidden style={{ height: frame.topSpacerPx }} /> : null}
      <div
        className={cn(
          // `gen-widget-body` is the content box below the header — the mobile stylesheet sizes
          // it by an `intrinsicSize` ratio, so the header's own height is never counted in.
          "gen-widget-body gencl:min-h-0 gencl:min-w-0 gencl:flex-1",
          frame.rounded && "gencl:rounded-xl",
          frame.overflowHidden && "gencl:overflow-hidden",
          frame.border && "gencl:ring-1 gencl:ring-secondary-200"
        )}>
        {children}
      </div>
    </div>
  );
}

/** Placeholder shown before a placement's block first nears the viewport (no embed yet). */
function VideoPlaceholder() {
  return <div className="gencl:h-full gencl:w-full gencl:bg-secondary-900" aria-hidden />;
}

// ─── Widget entries ──────────────────────────────────────────────────────────────────

/**
 * Video slots (carousel / feed / grid) render a Genuin SDK placement of the matching style,
 * configured via the manifest's `config` ({ styleId, placementId, apiKey }). The embed mounts
 * once its block first nears the viewport and then stays mounted (embeds self-pause off-screen,
 * and the SDK has no per-element teardown).
 */
function PlacementWidget({ node, data }: WidgetRenderProps) {
  const isNear = useBlockVisibility();
  const show = useHasBeenTrue(isNear);
  const openHomePlayerOverlay = useContext(HomePlayerOverlayContext);
  // Unique, selector-safe container id (React's useId contains colons). Owned here so the
  // reverse-flow handler can read the SDK's `data-instance-id` off the same container.
  const domId = `gen-sdk-${useId().replace(/:/g, "")}`;

  const styleId = typeof node.config?.styleId === "string" ? node.config.styleId : "";
  const placementId = typeof node.config?.placementId === "string" ? node.config.placementId : "";
  const apiKey = typeof node.config?.apiKey === "string" ? node.config.apiKey : "";

  // `useEmit` is bound to this panel's id (= `node.id`) and its identity never changes, but keep it
  // in a ref anyway so the SDK listener below registers ONCE and never re-subscribes.
  const emit = useEmit();
  const emitRef = useRef(emit);
  emitRef.current = emit;

  // The manifest already knows which community/group this placement plays, so the broadcast can
  // carry them. Held in a ref for the same reason as `emit`.
  const sourceRef = useRef(data.source);
  sourceRef.current = data.source;

  // Which video we last announced — supplies `previousVideoId` and tells a first broadcast
  // (`video:load`) apart from a subsequent one (`video:change`).
  const lastVideoIdRef = useRef<string | null>(null);

  // Forward contextual flow: when THIS placement's embed changes its active video, the SDK emits
  // `player:videoChanged` with its instance id + index. Rebroadcast it on the row's surface so the
  // linked article/list can follow (filtered by instance id here, by `sourceId` on the far end).
  //
  // We RETRY until `window.genuin.onInternal` exists — it can lag the script's `load` event, and if
  // we bail early the listener would never attach until something forced a re-subscribe (e.g. a
  // click). Registering reliably on mount is what makes the video→article highlight work from the
  // START, on automatic scroll, without needing a click first.
  useEffect(() => {
    if (typeof window === "undefined") return;
    let unsubscribe: (() => void) | undefined;
    let cancelled = false;
    let retry: ReturnType<typeof setTimeout> | undefined;
    let attempts = 0;

    const register = () => {
      if (cancelled) return;
      const genuin = window.genuin;
      if (!genuin?.onInternal) {
        if (attempts++ < 40) retry = setTimeout(register, 200); // SDK not fully ready yet.
        return;
      }
      // The SDK's `onInternal` returns an unsubscribe fn at runtime though its global type says
      // `void`; capture it defensively.
      const off: unknown = genuin.onInternal("player:videoChanged", (raw: unknown) => {
        // The SDK delivers a wrapper `{ type, payload, timestamp, embedId }` (web-sdk core/events.ts)
        // — the real data is under `.payload` (same reason the embed provider reads `props.payload`).
        const wrapper = raw as { payload?: { instanceId?: string; index?: number } };
        const event = (wrapper?.payload ?? wrapper) as { instanceId?: string; index?: number };
        const myInstanceId = document.getElementById(domId)?.getAttribute("data-instance-id");
        if (!myInstanceId || event.instanceId !== myInstanceId) return;
        if (typeof event.index !== "number") return;

        const index = event.index;
        const source = sourceRef.current;
        // The SDK's `player:videoChanged` payload is only `{ instanceId, index }` — it does not
        // publish the video's own id (see `SDKPlayerVideoChangedPayload`). So identity here is
        // "the video at position N of this placement", which is stable and unique on the surface
        // and is what the position-linked consumers actually match on. Swap in the real id the day
        // the SDK carries one; nothing else has to change.
        const videoId = `${node.id}#${index}`;
        const payload = {
          videoId,
          communityId: source?.communityId ?? "",
          groupId: source?.groupId ?? "",
          index,
        };

        const previousVideoId = lastVideoIdRef.current;
        lastVideoIdRef.current = videoId;
        if (previousVideoId === null) emitRef.current("video:load", payload);
        else emitRef.current("video:change", { ...payload, previousVideoId });
      });
      if (typeof off === "function") unsubscribe = off as () => void;
    };

    loadGenuinSdk()
      .then(register)
      .catch(() => {
        /* SDK unavailable — no forward flow. */
      });

    return () => {
      cancelled = true;
      if (retry) clearTimeout(retry);
      unsubscribe?.();
    };
  }, [domId, node.id]);

  const handleExpandRequest = useCallback(() => {
    // Mobile keeps the SDK's normal direct-fullscreen path. Desktop Home adds only the
    // intermediate presentation state around that same fullscreen instance.
    if (!openHomePlayerOverlay || !window.matchMedia("(min-width: 1024px)").matches) return;
    markHomeFeedView(domId, true);
    markHomeFeedSession(domId, true);
    openHomePlayerOverlay({ sourceDomId: domId });
  }, [domId, openHomePlayerOverlay]);

  // Reverse contextual flow: a list panel in this row broadcast a selection — tell THIS
  // placement's running embed to slide to it, scoped by the placement's SDK instance id so only
  // this embed reacts. The bus never delivers a panel its own emits, so this cannot echo.
  //
  // NOTE: this reacts to any `item:select` on the row's surface. Every row in the manifest holds
  // exactly ONE video placement, so that is unambiguous; a row with two would need the payload to
  // name its target.
  useSurfaceEvent("item:select", ({ index }) => {
    if (typeof window === "undefined") return;
    const instanceId = document.getElementById(domId)?.getAttribute("data-instance-id");
    if (!instanceId) return;
    (window as GenuinWindow).genuin?.emitInternal?.("player:goToIndex", { instanceId, index });
  });

  return (
    <WidgetFrame
      heading={data.header?.heading}
      subHeading={data.header?.subHeading}
      logo={data.header?.logo}
      wrapper={node.wrapper}>
      {show && styleId && placementId ? (
        <GenuinPlacement
          domId={domId}
          styleId={styleId}
          placementId={placementId}
          apiKey={apiKey}
          mobileStyleId={typeof node.config?.mobileStyleId === "string" ? node.config.mobileStyleId : undefined}
          mobilePlacementId={
            typeof node.config?.mobilePlacementId === "string" ? node.config.mobilePlacementId : undefined
          }
          onExpandRequest={handleExpandRequest}
        />
      ) : (
        <VideoPlaceholder />
      )}
    </WidgetFrame>
  );
}

function IntelligencePanelWidget({ node, data }: WidgetRenderProps) {
  const featured = data.featuredArticle;

  return (
    <WidgetFrame
      heading={data.header?.heading}
      subHeading={data.header?.subHeading}
      logo={data.header?.logo}
      wrapper={node.wrapper}>
      {featured ? (
        <IntelligencePanel
          featuredArticle={toArticle(featured)}
          upNextArticles={(data.upNextArticles ?? []).map(toArticle)}
          layout={INTELLIGENCE_LAYOUT}
          readMoreLabel={data.readMoreLabel}
          upNextLabel={data.upNextLabel}
          onClose={() => undefined}
        />
      ) : null}
    </WidgetFrame>
  );
}

function IntelligenceCardListWidget({ node, data }: WidgetRenderProps) {
  const articles = data.articles ?? [];

  return (
    <WidgetFrame
      heading={data.header?.heading}
      subHeading={data.header?.subHeading}
      logo={data.header?.logo}
      wrapper={node.wrapper}>
      <IntelligencePanelShell size={{ width: "100%", height: "100%" }} onClose={() => undefined}>
        <div
          className={cn(
            "gencl:flex gencl:h-full gencl:min-h-0 gencl:flex-col gencl:gap-2 gencl:overflow-y-auto gencl:pt-2",
            "gencl:scroll-smooth gencl:snap-y gencl:snap-mandatory gencl:overscroll-contain",
            "gencl:[scrollbar-width:none] gencl:[&::-webkit-scrollbar]:hidden"
          )}>
          {articles.map((article) => (
            <IntelligenceArticleCard
              key={article.id}
              article={toArticle(article)}
              layout={INTERVIEW_CARD_LAYOUT}
              imagePosition="top"
              className="gencl:shrink-0 gencl:snap-start gencl:snap-always"
            />
          ))}
        </div>
      </IntelligencePanelShell>
    </WidgetFrame>
  );
}

function EventCarouselWidget({ node, data }: WidgetRenderProps) {
  const events = (data.events ?? []).map((event) => ({
    id: event.id,
    heading: event.heading,
    image: event.image,
    start_date: event.startDate,
    end_date: event.endDate,
    location: event.location,
    cta: event.cta,
  }));

  return (
    <WidgetFrame
      heading={data.header?.heading}
      subHeading={data.header?.subHeading}
      logo={data.header?.logo}
      wrapper={node.wrapper}>
      {/* No onCtaClick: the event CTA's href is now an on-domain `/article/<slug>` link
          (from the BFF), so the LinkCard renders it as a same-tab anchor — matching home.tsx. */}
      <EventCarousel events={events} ariaLabel={data.header?.heading ?? "Events"} />
    </WidgetFrame>
  );
}

function HoverLinkCardListWidget({ node, data, dataMap }: WidgetRenderProps) {
  const emit = useEmit();
  const sourceId = node.dependsOn?.widgetId;

  // Pair each editorial link with a live video from the linked widget's community feed, so the
  // link thumbnails match real videos. (With the video slot now a self-contained SDK placement,
  // the bus link is best-effort — the placement doesn't publish its active video.)
  const sourceData = node.dependsOn ? dataMap[node.dependsOn.widgetId] : undefined;
  const { posts } = useCommunityFeed(sourceData?.source?.communityId ?? "", sourceData?.source?.groupId);

  const items = (data.items ?? []).map((item, index) => {
    const post = posts[index];
    return {
      id: item.id,
      link: item.link,
      title: item.title,
      description: item.description,
      brand: item.brand,
      website: item.website,
      image: post?.video?.thumbnail ?? item.image,
      // Matching key for the index highlight. MUST be stable and always present — the community
      // feed can be empty/misaligned (leaving the feed's video id null), which silently broke the
      // forward flow's programmatic highlight. Use the item's own id so index N always resolves.
      video_id: item.id ?? item.link,
    };
  });

  // Forward flow: follow only the widget this one declared in `dependsOn`, and highlight the item
  // at the broadcast position. Highlight is by `video_id` (what HoverLinkCardList matches on), so
  // map the position → that item's id. Before the first broadcast, default to the FIRST item so the
  // list is mapped to the (index-0) video from page load — display-only, no reverse emit.
  const activeVideo = useLatestVideoFrom(sourceId);
  const activeIndex = activeVideo?.index ?? 0;
  const activeVideoId = items[activeIndex]?.video_id ?? null;

  // Reverse flow: the user moved the list, so announce the selection. The row's video placement
  // picks it up and slides; the bus does not deliver this back to us.
  const selectItem = (item: ContextualLinkMetaData, index: number) =>
    emit("item:select", {
      itemId: String(item.id ?? item.link),
      index,
      videoId: item.video_id ?? null,
    });

  return (
    <WidgetFrame
      heading={data.header?.heading}
      subHeading={data.header?.subHeading}
      logo={data.header?.logo}
      wrapper={node.wrapper}>
      <HoverLinkCardList
        items={items}
        activeVideoId={activeVideoId}
        pinActiveItemToTop
        stepScroll
        autoRotate={false}
        showContainerBorder={false}
        ctaText={data.ctaText}
        width="100%"
        height="100%"
        onLinkClick={selectItem}
        onActiveItemChange={selectItem}
      />
    </WidgetFrame>
  );
}

/** Maps a manifest `component` name to the React entry that renders it from `WidgetData`. */
export const COMPONENT_REGISTRY: Record<ComponentType, (props: WidgetRenderProps) => ReactNode> = {
  video_carousel: PlacementWidget,
  video_feed: PlacementWidget,
  video_grid: PlacementWidget,
  intelligence_panel: IntelligencePanelWidget,
  intelligence_card_list: IntelligenceCardListWidget,
  event_carousel: EventCarouselWidget,
  hover_link_card_list: HoverLinkCardListWidget,
};
