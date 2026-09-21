"use client";

import { cn } from "@genuin/ui/lib/utils";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { useBaseContext } from "@genuin/components/context/base";
import {
  prepareFeedView,
  useOpenFeedViewOverlay,
  usePlacementFeedViewIntent,
} from "@genuin/components/lib/feed-view/feed-view-overlay";
import { useFloatingVideoRestoreTarget } from "@genuin/components/lib/floating-video/use-floating-video-restore-target";
import { buildPageUrl } from "@genuin/components/lib/utils/pages";
import { Link } from "@genuin/components/molecules/link";
import { SectionHeader } from "@genuin/components/molecules/section-header/section-header";
import { EventCarousel } from "@genuin/components/organisms/event-carousel/event-carousel";
import {
  useEmit,
  useLatestEvent,
  useOptionalEventSurface,
  useSurfaceEvent,
} from "@genuin/components/organisms/event-surface/event-surface-context";
import type { VideoContext } from "@genuin/components/organisms/event-surface/event-surface.types";
import {
  HoverLinkCardList,
  type ContextualLinkMetaData,
} from "@genuin/components/organisms/hover-link-card-list/hover-link-card-list";
import { IntelligenceArticleCard } from "@genuin/components/organisms/intelligence-panel/intelligence-article-card";
import {
  INTELLIGENCE_RAIL_CLASS,
  INTELLIGENCE_RAIL_ITEM_CLASS,
  INTELLIGENCE_RAIL_ITEM_SM_RESET_CLASS,
  INTELLIGENCE_RAIL_SM_RESET_CLASS,
  IntelligencePanel,
} from "@genuin/components/organisms/intelligence-panel/intelligence-panel";
import { IntelligencePanelShell } from "@genuin/components/organisms/intelligence-panel/intelligence-panel-shell";
import type {
  IntelligenceArticle,
  IntelligencePanelLayout,
} from "@genuin/components/organisms/intelligence-panel/intelligence-panel.types";
import { useCategory } from "@genuin/components/react-query/api/category/category";
import { useFeed } from "@genuin/components/react-query/api/feed";
import type { PostDetailsType } from "@genuin/components/react-query/api/feed/schema";
import { getQueryKeyForFeed } from "@genuin/components/react-query/keys/feed";
import type { FeedData } from "@genuin/components/templates/feed/feed.type";

import type { ArticleData, ComponentType, FeedSource, WidgetData, WidgetNode, WidgetWrapper } from "./contract";

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
  upNextGrid: { minimumCardWidth: 172, mobileCardWidth: "calc((100% - 24px) / 2)" },
};
const INTERVIEW_CARD_LAYOUT = {
  ...INTELLIGENCE_LAYOUT.articleCard,
  height: "auto" as const,
  // Editorial artwork is delivered in a wide format. Keep this list aligned with the
  // reference card without changing its existing vertical one-card snap behavior.
  imageAspectRatio: "16 / 9",
};

const SECTION_LOGO = "/images/home/the-foil-logo.jpg";

export type CommunityFeed = {
  feedData: FeedData;
  posts: PostDetailsType[];
  communityName: string;
  communityImage: string;
  /** Slug of the widget's community — powers the section header's link to the community page. */
  communitySlug?: string;
  groupName?: string;
  /** Slug of the widget's group, when the widget is group-scoped. */
  groupSlug?: string;
  isLoading: boolean;
};

/**
 * One community's (or group's) feed — the same brand-scoped `useFeed("HOME", …)` request the
 * existing home page makes. Returns `FeedData`, the flat `posts` and the community name/avatar.
 */
export function useCommunityFeed(communityId?: string, groupId?: string): CommunityFeed {
  const { isInIframe, brandDetails } = useBaseContext();
  const { data: categoryData } = useCategory();
  const options = useMemo(
    () => ({
      isInIframe,
      brandId: brandDetails.brand_id ?? undefined,
      communityIds: communityId ? [communityId] : [],
      ...(groupId ? { groupIds: [groupId] } : {}),
      enabled: Boolean(communityId),
      // A community avatar is page metadata, so reuse it across infinite-scroll blocks instead
      // of refetching the same community feed whenever another block mounts.
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      refetchOnMount: false,
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
  // The feed can briefly retain an older community avatar after an edit. Categories power the
  // sidebar and return the current community metadata, so use that same source for Home headers.
  const categoryCommunity = categoryData?.categories
    .flatMap((category) => category.communities)
    .find((community) => community.community_id === communityId);

  return {
    feedData,
    posts,
    communityName: categoryCommunity?.community_name || first?.community?.name || "",
    communityImage: categoryCommunity?.dp || first?.community?.profileImage || SECTION_LOGO,
    communitySlug: categoryCommunity?.slug || first?.community?.slug || undefined,
    groupName: groupId ? (first?.group?.name ?? undefined) : undefined,
    groupSlug: groupId ? (first?.group?.slug ?? undefined) : undefined,
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
  process.env.NEXT_PUBLIC_GENUIN_SDK_URL ?? "https://media.qa.begenuin.com/sdk/2.0.5/gen_sdk.min.js";

type GenuinWindow = Window & {
  genuin?: {
    init?: (config: Record<string, unknown>) => unknown;
    emitInternal?: (event: string, payload?: unknown) => void;
    onInternal?: (event: string, listener: (payload: unknown) => void) => (() => void) | void;
    collapse?: (id: string) => void;
    expand?: (id: string) => void;
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
    (window as GenuinWindow).genuin?.init?.({
      // These placements are nested React roots inside the first-party WebApp. Keeping them in
      // light DOM prevents their hosts from being mistaken for the WebApp's portal root while the
      // SDK still owns each placement and its lifecycle independently.
      useShadowDOM: false,
      configuration: {
        player_controls: "v2",
        // Home SDK placements should navigate like native Popular/Latest/Explore feeds.
        is_enable_redirection: true,
        enable_redirection_tools: { community: true, group: true, user: true },
      },
    });
  });
}

function GenuinPlacement({
  domId,
  styleId,
  placementId,
  apiKey,
  mobileStyleId,
  mobilePlacementId,
  videoIds,
  reinitOnResize = false,
  onExpandRequest,
}: {
  domId: string;
  styleId: string;
  placementId: string;
  apiKey: string;
  mobileStyleId?: string;
  mobilePlacementId?: string;
  /** Video ids registered by the contextual sibling through EventSurface. */
  videoIds?: string[];
  /**
   * Re-initialise the embed after its container settles at a materially different width. The SDK
   * measures its container at `init()` only, so page zoom (or a window resize) leaves the drawn
   * tiles at the old size while the cell around them follows the new one — the sponsor grid then
   * overflowed its box. Only ratio-driven cells need this; everywhere else the cell height is
   * fixed and a re-init would restart playback for nothing. @default false
   */
  reinitOnResize?: boolean;
  /** Notifies Home that this existing placement is entering its SDK expand view. */
  onExpandRequest?: () => void;
}) {
  const hasMobilePlacement = Boolean(mobileStyleId && mobilePlacementId);
  const [viewport, setViewport] = useState<"mobile" | "desktop" | null>(hasMobilePlacement ? null : "desktop");

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
  const videoIdsKey = videoIds?.join(",") ?? "";

  // Bumped when the container settles at a materially different width; it is part of the host
  // div's `key`, so React swaps in a fresh container and the effect below re-inits the embed at
  // the new size — the same remount path the placement already uses for a `videoIds` change.
  const hostFrameRef = useRef<HTMLDivElement>(null);
  const [layoutGeneration, setLayoutGeneration] = useState(0);

  useEffect(() => {
    const frame = hostFrameRef.current;
    if (!reinitOnResize || !frame) return;

    let measuredWidth = frame.getBoundingClientRect().width;
    let settleTimer: number | undefined;
    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width ?? 0;
      // Ignore the first measurement and sub-2% jitter (scrollbars, rounding): only a real
      // zoom/resize should cost the viewer a re-init.
      if (!width || !measuredWidth || Math.abs(width - measuredWidth) / measuredWidth < 0.02) return;
      window.clearTimeout(settleTimer);
      settleTimer = window.setTimeout(() => {
        measuredWidth = width;
        setLayoutGeneration((generation) => generation + 1);
      }, 300);
    });

    observer.observe(frame);
    return () => {
      observer.disconnect();
      window.clearTimeout(settleTimer);
    };
  }, [reinitOnResize]);

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
  }, [viewport, activeStyleId, activePlacementId, videoIdsKey, layoutGeneration]);

  const captureFeedViewIntent = usePlacementFeedViewIntent({
    onExpandRequest: viewport === null ? undefined : onExpandRequest,
    waitForSdk: loadGenuinSdk,
  });

  if (viewport === null) {
    return <div ref={hostFrameRef} style={{ width: "100%", height: "100%" }} />;
  }

  // The outer frame is what the ResizeObserver watches: it survives the re-init that swaps the
  // keyed host below.
  return (
    <div ref={hostFrameRef} style={{ width: "100%", height: "100%" }}>
      <div
        key={`${activeStyleId}-${activePlacementId}-${videoIdsKey}-${layoutGeneration}`}
        id={domId}
        className="gen-sdk-class"
        data-style-id={activeStyleId}
        data-placement-id={activePlacementId}
        data-intelligence-enabled="true"
        data-api-key={apiKey}
        data-video-ids={videoIdsKey || undefined}
        onClickCapture={captureFeedViewIntent}
        style={{ width: "100%", height: "100%" }}
      />
    </div>
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
  source,
  brandSlug,
  imageAlt,
  wrapper,
  children,
}: {
  heading?: string;
  subHeading?: string;
  logo?: string;
  source?: FeedSource;
  /** Sponsor headers carry a brand nickname instead of a `source`; it links to `/brand/<slug>`. */
  brandSlug?: string;
  imageAlt?: string;
  wrapper?: WidgetWrapper;
  children: ReactNode;
}) {
  const frame = wrapper ?? {};
  // The response currently uses The Foil mark as a placeholder for community-backed widgets.
  // Resolve those placeholders from the community feed, while preserving an explicitly authored
  // brand/sponsor logo (for example Musto). Missing community artwork falls back to The Foil.
  const shouldResolveCommunityIdentity = Boolean(source?.communityId) && (!logo || logo === SECTION_LOGO);
  const { communityImage, communityName, communitySlug, groupName, groupSlug } = useCommunityFeed(
    shouldResolveCommunityIdentity ? source?.communityId : undefined,
    shouldResolveCommunityIdentity ? source?.groupId : undefined
  );
  const resolvedLogo = shouldResolveCommunityIdentity ? communityImage : logo;
  const resolvedHeading = shouldResolveCommunityIdentity ? groupName || communityName || heading : heading;
  const resolvedImageAlt = shouldResolveCommunityIdentity ? communityName || imageAlt : imageAlt;
  // The header names a real community/group, so it should take the reader there — mirroring the
  // player's community/group pills. Group-scoped widgets win, matching the heading precedence
  // above. Sponsor headers (an authored logo and no `source`) stay unlinked.
  // A sponsor header is neither a community nor a group, so it never resolved an identity and
  // stayed inert. Its brand page is the destination readers expect from that logo and name.
  const headerHref = !shouldResolveCommunityIdentity
    ? brandSlug
      ? buildPageUrl({ type: "brand", slug: brandSlug })
      : undefined
    : groupSlug
      ? buildPageUrl({ type: "group", slug: groupSlug })
      : communitySlug
        ? buildPageUrl({ type: "community", slug: communitySlug })
        : undefined;

  return (
    <div className="gencl:flex gencl:h-full gencl:min-h-0 gencl:min-w-0 gencl:flex-col gencl:gap-3">
      {frame.showHeader !== false &&
        (headerHref ? (
          <Link
            href={headerHref}
            className="gencl:w-full gencl:min-w-0"
            data-testid="widget-header-link"
            aria-label={`Go to ${resolvedHeading || communityName || heading}`}>
            <SectionHeader
              imageUrl={resolvedLogo}
              imageAlt={resolvedImageAlt}
              heading={resolvedHeading}
              subHeading={subHeading}
            />
          </Link>
        ) : (
          <SectionHeader
            imageUrl={resolvedLogo}
            imageAlt={resolvedImageAlt}
            heading={resolvedHeading}
            subHeading={subHeading}
          />
        ))}
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
  const openFeedViewOverlay = useOpenFeedViewOverlay();
  const registeredItems = useLatestEvent("items:register");
  const contextualVideoIds = registeredItems?.videoIds;
  const contextualVideoIdsRef = useRef(contextualVideoIds);
  contextualVideoIdsRef.current = contextualVideoIds;
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

  // Which video we last announced — supplies `previousVideoId` and tells a first broadcast
  // (`video:load`) apart from a subsequent one (`video:change`).
  const lastVideoIdRef = useRef<string | null>(null);

  // Forward contextual flow: when THIS placement's embed changes its active video, the SDK emits
  // `player:videoChanged` with its real video/community/group identity. Rebroadcast it on the row's
  // surface so a linked article can join on `video_id`, independent of array order or brand.
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
        const wrapper = raw as {
          payload?: {
            instanceId?: string;
            videoId?: string;
            communityId?: string;
            groupId?: string;
            index?: number;
          };
        };
        const event = (wrapper?.payload ?? wrapper) as {
          instanceId?: string;
          videoId?: string;
          communityId?: string;
          groupId?: string;
          index?: number;
        };
        const myInstanceId = document.getElementById(domId)?.getAttribute("data-instance-id");
        if (!myInstanceId || event.instanceId !== myInstanceId) return;
        if (typeof event.index !== "number") return;

        const index = event.index;
        // New SDK bundles publish the real id directly. During a rolling SDK deployment, an older
        // bundle may still publish only the index; because this placement is explicitly scoped to
        // the response's ordered `data-video-ids`, that index safely resolves to the same real id.
        const videoId = event.videoId ?? contextualVideoIdsRef.current?.[index];
        if (!videoId) return;
        if (lastVideoIdRef.current === videoId) return;
        const payload = {
          videoId,
          communityId: event.communityId ?? "",
          groupId: event.groupId ?? "",
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
  }, [domId]);

  const handleExpandRequest = useCallback(
    (options?: { excludeHost?: HTMLElement | null }) => {
      // Mobile keeps the SDK's normal direct-fullscreen path. Desktop Home adds only the
      // intermediate presentation state around that same fullscreen instance.
      if (!openFeedViewOverlay || !window.matchMedia("(min-width: 1024px)").matches) return;
      // `excludeHost` is the retained floating player being handed back: dropping it from the
      // snapshot tells the overlay to adopt that host instead of waiting for a fresh one.
      const existingExpandHosts = prepareFeedView(domId).filter((host) => host !== options?.excludeHost);
      openFeedViewOverlay({ sourceDomId: domId, existingExpandHosts });
    },
    [domId, openFeedViewOverlay]
  );

  // Coming back from a floating card's expand control.
  useFloatingVideoRestoreTarget({
    domId,
    placementId,
    enabled: show,
    onPrepareFeedView: handleExpandRequest,
  });

  // Reverse contextual flow: a list panel in this row broadcast a selection — tell THIS
  // placement's running embed to slide to it, scoped by the placement's SDK instance id so only
  // this embed reacts. The bus never delivers a panel its own emits, so this cannot echo.
  //
  // NOTE: this reacts to any `item:select` on the row's surface. Every row in the manifest holds
  // exactly ONE video placement, so that is unambiguous; a row with two would need the payload to
  // name its target.
  useSurfaceEvent("item:select", ({ videoId }) => {
    if (typeof window === "undefined") return;
    const instanceId = document.getElementById(domId)?.getAttribute("data-instance-id");
    if (!instanceId || !videoId) return;
    (window as GenuinWindow).genuin?.emitInternal?.("player:goToVideo", { instanceId, videoId });
  });

  return (
    <WidgetFrame
      heading={data.header?.heading}
      subHeading={data.header?.subHeading}
      logo={data.header?.logo}
      source={data.source}
      brandSlug={data.header?.brandSlug}
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
          videoIds={contextualVideoIds}
          // A cell whose height comes from the widget's own ratio grows/shrinks with the page
          // width (zoom included), so its embed has to be re-measured; fixed-height cells never
          // move and keep their uninterrupted playback.
          reinitOnResize={node.intrinsicSize !== undefined}
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
      source={data.source}
      brandSlug={data.header?.brandSlug}
      wrapper={node.wrapper}>
      {featured ? (
        <IntelligencePanel
          featuredArticle={toArticle(featured)}
          upNextArticles={(data.upNextArticles ?? []).map(toArticle)}
          layout={INTELLIGENCE_LAYOUT}
          // On home the panel is a column in a fixed-height row: a pinned header ate a strip of
          // that box on every scroll. Let it scroll away so the articles get the full width and
          // height of the card.
          scrollHeader
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
      source={data.source}
      brandSlug={data.header?.brandSlug}
      wrapper={node.wrapper}>
      <IntelligencePanelShell
        size={{ width: "100%", height: "100%" }}
        onClose={() => undefined}
        scrollHeader
        scrollContentClassName={cn(
          // Phones: header on top, rail takes the rest — nothing scrolls vertically.
          "gencl:flex gencl:h-full gencl:flex-col gencl:sm:block!",
          // `sm` and up the shell is the scroller, so the Intelligence header travels with the
          // cards instead of staying pinned above them.
          "gencl:sm:snap-y gencl:sm:snap-mandatory"
        )}>
        <div
          className={cn(
            // Phones: the shared Intelligence rail. `sm` and up: the original
            // vertical snap list.
            INTELLIGENCE_RAIL_CLASS,
            INTELLIGENCE_RAIL_SM_RESET_CLASS,
            "gencl:min-h-0 gencl:flex-1 gencl:sm:pt-2!",
            "gencl:sm:flex-col!",
            // From `sm` up the shell owns the vertical scroll; a scroller here would create a
            // nested scrollbox and separate the Intelligence header from the cards.
            "gencl:sm:h-full! gencl:sm:overflow-visible!"
          )}>
          {articles.map((article) => (
            <IntelligenceArticleCard
              key={article.id}
              article={toArticle(article)}
              layout={INTERVIEW_CARD_LAYOUT}
              imagePosition="top"
              className={cn(
                INTELLIGENCE_RAIL_ITEM_CLASS,
                INTELLIGENCE_RAIL_ITEM_SM_RESET_CLASS,
                "gencl:w-[90%]! gencl:max-w-none!",
                "gencl:snap-always",
                "gencl:[&_[data-slot=intelligence-article-content]]:min-h-0",
                // Reserve the scrolling header plus the list spacing so the initial view keeps a
                // small next-card preview; after the header scrolls away, the active card still
                // owns most of the viewport.
                "gencl:sm:h-[calc(100%-4.25rem)]!",
                // Phones use the taller, edge-to-edge artwork treatment from the reference.
                // Keep `object-cover` from the shared card so the area fills without grey bands.
                "gencl:max-sm:[&_[data-slot=intelligence-article-image]]:grow",
                "gencl:max-sm:[&_[data-slot=intelligence-article-image]]:shrink!",
                // Above phone sizes the artwork takes whatever remains after the full headline;
                // it may crop or shrink, but can never push the text out of the active card.
                "gencl:sm:[&_[data-slot=intelligence-article-image]]:min-h-0",
                "gencl:sm:[&_[data-slot=intelligence-article-image]]:grow",
                "gencl:sm:[&_[data-slot=intelligence-article-image]]:shrink!"
              )}
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
      source={data.source}
      brandSlug={data.header?.brandSlug}
      wrapper={node.wrapper}>
      {/* No onCtaClick: the event CTA's href is now an on-domain `/article/<slug>` link
          (from the BFF), so the LinkCard renders it as a same-tab anchor — matching home.tsx. */}
      <EventCarousel events={events} ariaLabel={data.header?.heading ?? "Events"} />
    </WidgetFrame>
  );
}

function HoverLinkCardListWidget({ node, data }: WidgetRenderProps) {
  const emit = useEmit();
  const sourceId = node.dependsOn?.widgetId;

  // The response owns this relationship. A different brand changes only its response values;
  // this adapter never guesses from titles, runs a parallel feed query, or uses array position as
  // video identity.
  const items = (data.items ?? []).map((item) => ({
    id: item.id,
    link: item.link,
    title: item.title,
    description: item.description,
    brand: item.brand,
    website: item.website,
    image: item.image,
    video_id: item.video_id,
  }));
  const registeredVideoIds = useMemo(() => (data.items ?? []).map(({ video_id }) => video_id), [data.items]);

  useEffect(() => {
    emit("items:register", { videoIds: registeredVideoIds });
  }, [emit, registeredVideoIds]);

  // Follow only the declared source and select by the SDK's real id. The first response item is a
  // display-only seed until the SDK publishes its initial active video.
  const activeVideo = useLatestVideoFrom(sourceId);
  const activeVideoId = activeVideo?.videoId ?? items[0]?.video_id ?? null;

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
      source={data.source}
      brandSlug={data.header?.brandSlug}
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
