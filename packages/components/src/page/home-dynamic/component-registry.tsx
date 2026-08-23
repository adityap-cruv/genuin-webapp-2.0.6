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
import { SectionHeader } from "@genuin/components/molecules/section-header/section-header";
import { EventCarousel } from "@genuin/components/organisms/event-carousel/event-carousel";
import { HoverLinkCardList } from "@genuin/components/organisms/hover-link-card-list/hover-link-card-list";
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

/**
 * Per-page contextual-link bus (the `dependsOn` wiring). Each page block gets its own provider,
 * so page 1's carousel never drives page 2's panels. One shared "active index" per key links a
 * source and its dependents bidirectionally by position (video at index N ↔ list item N).
 */
type WidgetBusValue = {
  getActiveIndex: (key: string) => number | undefined;
  setActiveIndex: (key: string, index: number) => void;
};
const WidgetBusContext = createContext<WidgetBusValue | null>(null);
export function WidgetBusProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState<Record<string, number>>({});
  const getActiveIndex = useCallback((key: string) => active[key], [active]);
  const setActiveIndex = useCallback((key: string, index: number) => {
    setActive((prev) => (prev[key] === index ? prev : { ...prev, [key]: index }));
  }, []);
  const value = useMemo<WidgetBusValue>(
    () => ({ getActiveIndex, setActiveIndex }),
    [getActiveIndex, setActiveIndex]
  );
  return <WidgetBusContext.Provider value={value}>{children}</WidgetBusContext.Provider>;
}
export function useWidgetBus(): WidgetBusValue | null {
  return useContext(WidgetBusContext);
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

/** Contextual-link key: dependents share their source's key; sources use their own id. */
function linkKey(node: WidgetNode): string {
  return node.dependsOn?.widgetId ?? node.id;
}

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
}: {
  domId: string;
  styleId: string;
  placementId: string;
  apiKey: string;
}) {
  useEffect(() => {
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
  }, []);

  return (
    <div
      id={domId}
      className="gen-sdk-class"
      data-style-id={styleId}
      data-placement-id={placementId}
      data-api-key={apiKey}
      style={{ width: "100%", height: "100%" }}
    />
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
      {frame.topSpacerPx ? <div aria-hidden style={{ height: frame.topSpacerPx }} /> : null}
      <div
        className={cn(
          "gencl:min-h-0 gencl:min-w-0 gencl:flex-1",
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
  const bus = useWidgetBus();
  // Unique, selector-safe container id (React's useId contains colons). Owned here so the
  // reverse-flow effect can read the SDK's `data-instance-id` off the same container.
  const domId = `gen-sdk-${useId().replace(/:/g, "")}`;

  const styleId = typeof node.config?.styleId === "string" ? node.config.styleId : "";
  const placementId = typeof node.config?.placementId === "string" ? node.config.placementId : "";
  const apiKey = typeof node.config?.apiKey === "string" ? node.config.apiKey : "";

  // Latest bus setter in a ref so the SDK listener registers ONCE and never re-subscribes when the
  // bus value changes (it changes on every setActiveIndex). `setActiveIndex` itself is stable.
  const setActiveIndexRef = useRef(bus?.setActiveIndex);
  setActiveIndexRef.current = bus?.setActiveIndex;

  // Forward contextual flow: when THIS placement's embed changes its active video, the SDK emits
  // `player:videoChanged` with its instance id + index. Record that index on the bus so the linked
  // article/list highlights the item at the same position (filtered by instance id).
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
        if (typeof event.index === "number") setActiveIndexRef.current?.(node.id, event.index);
      });
      if (typeof off === "function") unsubscribe = off as () => void;
    };

    loadGenuinSdk().then(register).catch(() => {
      /* SDK unavailable — no forward flow. */
    });

    return () => {
      cancelled = true;
      if (retry) clearTimeout(retry);
      unsubscribe?.();
    };
  }, [domId, node.id]);

  // Reverse contextual flow: when a linked article selects an index (written to this widget's
  // bus key), tell THIS placement's running embed to slide to it — scoped by the placement's
  // SDK instance id so only this embed reacts.
  const activeIndex = bus?.getActiveIndex(node.id);
  useEffect(() => {
    if (activeIndex == null || typeof window === "undefined") return;
    const instanceId = document.getElementById(domId)?.getAttribute("data-instance-id");
    if (!instanceId) return;
    (window as GenuinWindow).genuin?.emitInternal?.("player:goToIndex", {
      instanceId,
      index: activeIndex,
    });
  }, [activeIndex, domId]);

  return (
    <WidgetFrame
      heading={data.header?.heading}
      subHeading={data.header?.subHeading}
      logo={data.header?.logo}
      wrapper={node.wrapper}>
      {show && styleId && placementId ? (
        <GenuinPlacement domId={domId} styleId={styleId} placementId={placementId} apiKey={apiKey} />
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
        <div className="gencl:mt-2 gencl:flex gencl:flex-col gencl:gap-2">
          {articles.map((article) => (
            <IntelligenceArticleCard
              key={article.id}
              article={toArticle(article)}
              layout={INTERVIEW_CARD_LAYOUT}
              imagePosition="top"
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
  const bus = useWidgetBus();
  const key = linkKey(node);

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

  // Index relay (matches home.tsx): the placement reports its active position to the bus; we
  // highlight the item at that index. Highlight is by `video_id` (what HoverLinkCardList matches
  // on), so map the active index → that item's id. Before the first forward event, default to the
  // FIRST item so the list is mapped to the (index-0) video from page load — display-only, no
  // reverse emit (that's driven by the bus, which this default does not write to).
  const activeIndex = bus?.getActiveIndex(key) ?? 0;
  const activeVideoId = items[activeIndex]?.video_id ?? null;

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
        onLinkClick={(_item, index) => bus?.setActiveIndex(key, index)}
        onActiveItemChange={(_item, index) => bus?.setActiveIndex(key, index)}
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
