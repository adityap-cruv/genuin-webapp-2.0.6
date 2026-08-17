"use client";

/**
 * VideoFeed — vertical, auto-advancing video feed for our own pages, composed only from the
 * existing production pieces (same pipeline the web-sdk embed uses):
 *
 *   data      → `useFeed` (`FEED_V1` with community_ids / loop_ids, or `VIDEO` with video ids)
 *   tile      → `PlayerProvider → FeedPlayer → controls-v2 Controls` + "date • duration • description"
 *   expand    → the real full-screen `FeedView variant="expand"` (actions, comments, linkouts)
 *   scrolling → Swiper (vertical), wheel / touch / keyboard, auto-advance on video end
 *
 * Sections in this file: types · query mapping · meta line · data hook · slide · expand view · VideoFeed.
 */

import { cn, getFormattedDuration, getMonthYear } from "@genuin/ui/lib/utils";
import type { PlayerControlSize } from "@genuin/ui/player-controls";
import {
  lazy,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { RemoveScroll } from "react-remove-scroll";
import { A11y, Keyboard, Mousewheel } from "swiper/modules";
import { Swiper, SwiperSlide, useSwiper } from "swiper/react";
import type { Swiper as SwiperType } from "swiper/types";

import { VideoTypes } from "@genuin/components/context";
import { useBaseContext } from "@genuin/components/context/base";
import { useDeviceDetectMediaQuery } from "@genuin/components/hooks/use-devide-detect-media-query";
import useViewportHeight from "@genuin/components/hooks/use-screen-height";
import { SafeSuspense } from "@genuin/components/molecules/error/safe-suspense";
import { PlayerProvider } from "@genuin/components/molecules/feed-player/context";
import { useFeed } from "@genuin/components/react-query/api/feed/feed";
import type { AdsPostDetailsType, PostDetailsType } from "@genuin/components/react-query/api/feed/schema";
import { getQueryKeyForFeed } from "@genuin/components/react-query/keys/feed";
import { FEED_SKELETON_THEME, FeedSkeleton, PlayerSkeleton } from "@genuin/components/templates/feed/feed-skeleton";

import type {
  VideoFeedData,
  VideoFeedExpandViewProps,
  VideoFeedProps,
  VideoFeedQuery,
  VideoFeedSlideProps,
  VideoFeedSourceProps,
} from "./video-feed.types";

import "swiper/css";

// Same lazy chunks the production feed / SDK expand view load — the player is heavy, keep it off the critical path.
const FeedPlayer = lazy(() =>
  import("@genuin/components/molecules/feed-player").then((m) => ({ default: m.FeedPlayer }))
);
// V2 controls directly (not the `design_system=v2`-gated switcher): mute → play/pause → expand top-right.
const Controls = lazy(() =>
  import("@genuin/components/molecules/feed-player/control-layer/controls/controls-v2").then((m) => ({
    default: m.Controls,
  }))
);
const FeedView = lazy(() => import("@genuin/components/templates/feed").then((m) => ({ default: m.FeedView })));

// ─── Props → useFeed query mapping ──────────────────────────────────────────────────────────────────────

/**
 * Maps the organism's `videoId / videoIds / communityId / groupId` props onto the
 * production `useFeed` hook — the same request the web-sdk embed makes.
 *
 * | Props                              | Request                                                    |
 * | ---------------------------------- | ---------------------------------------------------------- |
 * | `videoId` only / `videoIds`        | `GET /goservices/feed/video` (single page, ids as given)   |
 * | `communityId` / `groupId`          | `POST /goservices/feed/v1/home` `community_ids`/`loop_ids` |
 * | `videoId` + community/group        | same feed, `videoId` prepended as the first slide          |
 */
export function resolveVideoFeedQuery({
  videoId,
  videoIds,
  communityId,
  groupId,
}: Pick<VideoFeedSourceProps, "videoId" | "videoIds" | "communityId" | "groupId">): VideoFeedQuery {
  const communityIds = communityId ? [communityId] : undefined;
  const groupIds = groupId ? [groupId] : undefined;
  const hasScope = Boolean(communityIds || groupIds);
  const explicitIds = videoIds?.length ? videoIds : videoId && !hasScope ? [videoId] : undefined;

  return {
    feedType: explicitIds ? "VIDEO" : "FEED_V1",
    options: {
      isInIframe: false,
      ...(explicitIds ? { videoIds: explicitIds } : {}),
      ...(communityIds ? { communityIds } : {}),
      ...(groupIds ? { groupIds } : {}),
      ...(videoId && hasScope ? { initialVideoIds: [videoId] } : {}),
    },
    hasSource: Boolean(explicitIds || hasScope),
  };
}

// ─── Meta line ("date • duration • description") ────────────────────────────────────────────────────────

type VideoLike = NonNullable<PostDetailsType["video"]>;

/**
 * Description text of a video. The API returns `description` as either a string or an
 * array of `string | { text }` runs; `descritptionText` is the pre-flattened variant.
 */
export function getVideoDescriptionText(video: Pick<VideoLike, "description" | "descritptionText" | "attributes">) {
  if (video.descritptionText) return video.descritptionText.trim();
  const description = video.description as unknown;
  if (typeof description === "string") return description.trim();
  if (Array.isArray(description)) {
    return description
      .map((run) =>
        typeof run === "string" ? run : run && typeof run === "object" && "text" in run ? String(run.text) : ""
      )
      .filter(Boolean)
      .join(" ")
      .trim();
  }
  return video.attributes?.title?.trim() ?? "";
}

/**
 * The bottom overlay line — same rules as the production placement overlay
 * (`control-layer/placement/placement-metadata.tsx`): `date • duration • description`,
 * each part omitted when unavailable.
 *
 * @example "Jan 6, 2026 • 1 min 30 sec • Short clip description"
 */
export function buildVideoMetaParts(video: VideoLike | null | undefined): string[] {
  if (!video) return [];
  const parts: string[] = [];

  const timestamp = video.attributes?.timestamp ?? video.createdAt ?? undefined;
  if (typeof timestamp === "number" && Number.isFinite(timestamp) && timestamp > 0) {
    parts.push(getMonthYear(timestamp));
  }

  if (typeof video.duration === "number" && video.duration > 0) {
    const formatted = getFormattedDuration(String(video.duration));
    if (formatted) parts.push(formatted);
  }

  const description = getVideoDescriptionText(video);
  if (description) parts.push(description);

  return parts;
}

/** `buildVideoMetaParts` joined with the ` • ` separator. */
export function buildVideoMetaText(video: VideoLike | null | undefined): string {
  return buildVideoMetaParts(video).join(" • ");
}

// ─── Data hook ──────────────────────────────────────────────────────────────────────────────────────


export function isPlayablePost(post: PostDetailsType | AdsPostDetailsType): post is PostDetailsType {
  return (post as AdsPostDetailsType).type !== "ads" && Boolean(post.video?.id && post.video?.source);
}

/**
 * Data layer of `VideoFeed`. Returns a flat, ad-free list of playable posts plus
 * pagination handles. When `posts` is passed the hook is a no-op pass-through.
 */
export function useVideoFeedData({ posts: staticPosts, enabled = true, ...source }: VideoFeedSourceProps): VideoFeedData {
  const videoIdsKey = source.videoIds?.join(",");
  const { feedType, options, hasSource } = useMemo(
    () => resolveVideoFeedQuery(source),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- keyed on primitive values, not the object identity
    [source.videoId, videoIdsKey, source.communityId, source.groupId]
  );

  const useStatic = staticPosts !== undefined;
  // `getQueryKeyForFeed` serialises EVERY option (incl. `enabled`), so the key must be
  // derived from the exact object handed to `useFeed`.
  const feedOptions = useMemo(
    () => ({ ...options, enabled: enabled && !useStatic && hasSource }),
    [options, enabled, useStatic, hasSource]
  );
  const query = useFeed(feedType, feedOptions);
  const queryKey = useMemo(() => getQueryKeyForFeed(feedType, feedOptions), [feedType, feedOptions]);

  const fetchedPosts = useMemo(() => {
    const items = query.data?.pages.flatMap((page) => page.feed) ?? [];
    return items.filter(isPlayablePost);
  }, [query.data]);

  const staticPlayable = useMemo(() => (staticPosts ?? []).filter(isPlayablePost), [staticPosts]);

  const { hasNextPage, isFetchingNextPage, fetchNextPage: fetchNext } = query;
  const fetchNextPage = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) void fetchNext();
  }, [hasNextPage, isFetchingNextPage, fetchNext]);

  if (useStatic) {
    return {
      posts: staticPlayable,
      queryKey: ["video-feed", "static"],
      isLoading: false,
      isError: false,
      hasNextPage: false,
      isFetchingNextPage: false,
      fetchNextPage: () => undefined,
      totalVideos: staticPlayable.length,
      pageSession: null,
    };
  }

  return {
    posts: fetchedPosts,
    queryKey,
    isLoading: hasSource && enabled && query.isPending,
    isError: query.isError,
    hasNextPage: Boolean(hasNextPage),
    isFetchingNextPage,
    fetchNextPage,
    totalVideos: query.data?.pages[0]?.totalVideos,
    pageSession: query.data?.pages[0]?.pageSession ?? null,
  };
}

// ─── Slide (player + controls + meta) ──────────────────────────────────────────────────────────────────

/** Top-right control size — `sm` token: 24 px outer · 18 px inner · 12 px glyph, on every device. */
export const VIDEO_FEED_CONTROL_SIZE: PlayerControlSize = "sm";


/**
 * One slide of `VideoFeed`: `PlayerProvider → FeedPlayer + top-right Controls
 * (mute · play/pause · expand) + bottom meta line`. Mirrors the composition of the
 * production embed tile without the embed-config coupling.
 */
export function VideoFeedSlide({
  post,
  index,
  isActive,
  shouldRender,
  totalVideos,
  activeIndex,
  size,
  showControls,
  showMeta,
  loopSelf,
  expanded,
  onToggleExpand,
  onIterationEnd,
}: VideoFeedSlideProps) {
  const swiper = useSwiper();
  const { theme } = useBaseContext();
  const { isMobile } = useDeviceDetectMediaQuery();
  const video = post.video;

  const metaText = useMemo(() => buildVideoMetaText(video), [video]);

  const handleIterationEnd = useCallback(
    (move?: boolean) => {
      if (move === false) return;
      onIterationEnd();
    },
    [onIterationEnd]
  );

  if (!video || !shouldRender) {
    return <div className="gencl:h-full gencl:w-full gencl:bg-black" aria-hidden />;
  }

  return (
    <PlayerProvider
      isEmbed
      index={index}
      isActive={isActive}
      videoId={video.id}
      videoUrl={video.source}
      explicitAutoPlay={isActive}
      explicitLoop={loopSelf && isActive}
      swiper={swiper}
      totalVideos={totalVideos}
      activeIndex={activeIndex}
      showExpandView={expanded}
      toggleExpandView={onToggleExpand}
      onPlayerIterationEnd={handleIterationEnd}
      videoDescription={video.descritptionText}
      videoType={video.videoType ?? VideoTypes.Content}>
      <div
        data-slot="video-feed-slide"
        data-video-id={video.id}
        data-active={isActive || undefined}
        className="gencl:group gencl:relative gencl:h-full gencl:w-full gencl:overflow-hidden gencl:bg-black">
        <SafeSuspense
          fallback={
            <PlayerSkeleton colors={FEED_SKELETON_THEME[theme === "light" ? "light" : "dark"]} isMobile={isMobile} />
          }
          errorFallback={null}>
          <FeedPlayer
            id={"video-feed-player--" + video.id}
            videoId={video.id}
            src={video.source}
            poster={video.thumbnail}
            adUrl={video.adUrl ?? undefined}
            adsPlatform={video.adsPlatform}
            adTagObject={post.adTagObject ?? undefined}
            videoDescription={video.descritptionText}
            videoType={video.videoType ?? VideoTypes.Content}
            className="gencl:h-full! gencl:w-full! gencl:object-cover gencl:bg-cover!"
            playsInline
            index={index}
            isActive={isActive}
            playerSize={size}
            sponsorshipInfo={post.sponsored}
          />
        </SafeSuspense>

        {showControls && isActive && (
          <SafeSuspense fallback={null} errorFallback={null}>
            <Controls
              variant="default"
              enableExpand
              size={VIDEO_FEED_CONTROL_SIZE}
              // `default` carries a webapp header offset (`top-12`); this feed has no header.
              className="gencl:top-0! gencl:p-3!"
            />
          </SafeSuspense>
        )}

        {showMeta && metaText && (
          <div
            data-slot="video-feed-meta"
            className={cn(
              "gencl:pointer-events-none gencl:absolute gencl:inset-x-0 gencl:bottom-0 gencl:z-10",
              "gencl:bg-gradient-to-t gencl:from-black/70 gencl:to-transparent gencl:px-3 gencl:pb-2.5 gencl:pt-8"
            )}>
            <p
              className="gencl:line-clamp-2 gencl:text-body-2-medium gencl:text-white gencl:drop-shadow-sm"
              title={metaText}>
              {metaText}
            </p>
          </div>
        )}
      </div>
    </PlayerProvider>
  );
}

// ─── Expand view (full-screen FeedView) ────────────────────────────────────────────────────────────────


/**
 * Full-screen "expand view" of `VideoFeed` — the same `FeedView variant="expand"` the
 * web-sdk expand view mounts (side actions, comments, linkouts, ↑↓ navigation), portalled
 * to `document.body` with page scroll locked. Escape closes it.
 *
 * Uses a plain `createPortal` rather than `RootPortal`: that molecule renders nothing
 * outside SDK (`isEmbed`) mode, and `FeedView` already positions itself `fixed top-0`
 * when expanded (`templates/feed/core.tsx`).
 */
export function VideoFeedExpandView({ data, startIndex, onClose, onActiveIndexChange }: VideoFeedExpandViewProps) {
  const { isDesktop } = useDeviceDetectMediaQuery();
  const { theme, parsedBrandColors } = useBaseContext();
  const viewportHeight = useViewportHeight();
  const [target, setTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setTarget(document.body);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  if (!target) return null;

  return createPortal(
    <RemoveScroll>
      <div
        data-slot="video-feed-expand-view"
        role="dialog"
        aria-modal="true"
        aria-label="Expanded video feed"
        className={cn(
          "gen-sdk-class gencl:fixed gencl:inset-0 gencl:z-50 gencl:w-screen",
          theme === "light" ? "gencl:bg-white" : "gencl:bg-black"
        )}
        style={{ ...parsedBrandColors, height: `${viewportHeight}px` }}>
        <SafeSuspense fallback={<FeedSkeleton variant="fullscreen" showCommentsSkeleton={isDesktop} />}>
          <FeedView
            startIndex={startIndex}
            defaultExpandView
            onCloseExpandView={onClose}
            variant="expand"
            platform="webapp"
            feedData={{
              videos: data.posts,
              fetchNextPage: data.fetchNextPage,
              hasNextPage: data.hasNextPage,
              isFetchingNextPage: data.isFetchingNextPage,
              isLoading: data.isLoading,
              queryKey: data.queryKey,
              totalVideos: data.totalVideos,
              pageSession: data.pageSession,
            }}
            onActiveIndexChange={onActiveIndexChange}
            disableNativeFullscreenApi
          />
        </SafeSuspense>
      </div>
    </RemoveScroll>,
    target
  );
}

// ─── VideoFeed ──────────────────────────────────────────────────────────────────────────────────────

/** Same wheel tuning as the production feed swiper (`organisms/player-swiper/swiper-implementation.tsx`). */
const MOUSEWHEEL = { forceToAxis: true, releaseOnEdges: true, thresholdDelta: 20, thresholdTime: 400 } as const;
const SLIDE_SPEED_MS = 500;
/** Prefetch the next page when the user is this many slides from the end. */
const PREFETCH_OFFSET = 3;

/** Default tile sizes (px) — desktop/tablet and mobile. */
export const VIDEO_FEED_SIZE = {
  desktop: { width: 688, height: 387 },
  mobile: { width: 382, height: 215 },
} as const;

const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

/**
 * Vertical, snap-scrolling video feed for our own pages — the same player pipeline the
 * web-sdk embed uses (`PlayerProvider → FeedPlayer → Controls`) fed by `useFeed`.
 *
 * - auto-advances when a video ends (`autoAdvance`), wraps with `loop`
 * - manual scroll: wheel / touch / keyboard (↑ ↓)
 * - top-right mute · play/pause · expand; bottom `date • duration • description`
 * - expand opens the real full-screen `FeedView` (side actions, comments, linkouts) — same as
 *   the web-sdk expand view — and hands the active slide back on close
 * - fixed tile size: 688×387 on desktop/tablet, 382×215 on mobile (`width`/`height` to override)
 *
 * @example
 * <VideoFeed communityId="1fa079ce3e000d64" />
 * <VideoFeed videoId="d3462334-…" groupId="1fdbea0285001400" />
 */
export function VideoFeed({
  videoId,
  videoIds,
  communityId,
  groupId,
  posts: staticPosts,
  enabled,
  autoAdvance = true,
  loop = false,
  showControls = true,
  showMeta = true,
  width,
  height,
  style,
  onActiveVideoChange,
  onExpandChange,
  className,
  ...sectionProps
}: VideoFeedProps) {
  const data = useVideoFeedData({
    videoId,
    videoIds,
    communityId,
    groupId,
    posts: staticPosts,
    enabled,
  });
  const { posts, isLoading, isError, hasNextPage, fetchNextPage } = data;
  const { theme } = useBaseContext();
  const { isMobile } = useDeviceDetectMediaQuery();

  const rootRef = useRef<HTMLElement>(null);
  const swiperRef = useRef<SwiperType | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [size, setSize] = useState({ width: 0, height: 0 });

  const defaultSize = isMobile ? VIDEO_FEED_SIZE.mobile : VIDEO_FEED_SIZE.desktop;
  const resolvedWidth = width ?? defaultSize.width;
  const resolvedHeight = height ?? defaultSize.height;
  const total = posts.length;

  // Track the rendered box so the player + control sizing follow the container (and full view).
  useIsomorphicLayoutEffect(() => {
    const el = rootRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const update = () => setSize({ width: el.clientWidth, height: el.clientHeight });
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Keep Swiper's geometry in sync when the box changes (expand/collapse, orientation).
  useEffect(() => {
    swiperRef.current?.update();
  }, [size.width, size.height]);

  // Index the expanded feed is on; applied to the inline swiper when the overlay closes.
  const expandIndexRef = useRef(0);

  const openExpand = useCallback(() => {
    expandIndexRef.current = swiperRef.current?.activeIndex ?? activeIndex;
    setExpanded(true);
    onExpandChange?.(true);
  }, [activeIndex, onExpandChange]);

  const closeExpand = useCallback(() => {
    setExpanded(false);
    onExpandChange?.(false);
    const swiper = swiperRef.current;
    const target = expandIndexRef.current;
    if (swiper && !swiper.destroyed && swiper.activeIndex !== target) swiper.slideTo(target, 0);
  }, [onExpandChange]);

  const toggleExpand = useCallback(() => {
    if (expanded) closeExpand();
    else openExpand();
  }, [expanded, openExpand, closeExpand]);

  const handleExpandIndexChange = useCallback((index: number) => {
    expandIndexRef.current = index;
  }, []);


  const handleSlideChange = useCallback(
    (swiper: SwiperType) => {
      const next = swiper.activeIndex;
      setActiveIndex(next);
      const post = posts[next];
      if (post) onActiveVideoChange?.(post, next);
    },
    [posts, onActiveVideoChange]
  );

  // Prefetch the next page whenever we are near the end — as an effect (not only on
  // slide change) so a short first page or a fast auto-advance never runs out of slides.
  useEffect(() => {
    if (hasNextPage && total > 0 && total - activeIndex <= PREFETCH_OFFSET) fetchNextPage();
  }, [hasNextPage, total, activeIndex, fetchNextPage]);

  // Fire for the very first slide too (Swiper only emits slideChange on change).
  const announcedFirstRef = useRef(false);
  useEffect(() => {
    if (announcedFirstRef.current || !posts[0]) return;
    announcedFirstRef.current = true;
    onActiveVideoChange?.(posts[0], 0);
  }, [posts, onActiveVideoChange]);

  // Set when a video ended on the last loaded slide while the next page was still
  // loading; consumed by the effect below as soon as more slides exist.
  const pendingAdvanceRef = useRef(false);

  const handleIterationEnd = useCallback(() => {
    if (!autoAdvance) return;
    const swiper = swiperRef.current;
    if (!swiper) return;
    // Defer past the current render/effect cycle, like the production feed does.
    window.setTimeout(() => {
      if (swiper.destroyed) return;
      if (swiper.activeIndex < total - 1) {
        swiper.slideNext(SLIDE_SPEED_MS);
      } else if (hasNextPage) {
        pendingAdvanceRef.current = true;
        fetchNextPage();
      } else if (loop && total > 1) {
        swiper.slideTo(0, SLIDE_SPEED_MS);
      }
    }, 0);
  }, [autoAdvance, loop, total, hasNextPage, fetchNextPage]);

  useEffect(() => {
    if (!pendingAdvanceRef.current) return;
    const swiper = swiperRef.current;
    if (!swiper || swiper.destroyed) return;
    if (swiper.activeIndex < total - 1) {
      pendingAdvanceRef.current = false;
      // Let Swiper register the freshly rendered slides before moving.
      window.setTimeout(() => {
        if (!swiper.destroyed) swiper.slideNext(SLIDE_SPEED_MS);
      }, 0);
    } else if (!hasNextPage) {
      pendingAdvanceRef.current = false;
      if (loop && total > 1) swiper.slideTo(0, SLIDE_SPEED_MS);
    }
  }, [total, hasNextPage, loop]);

  const slides = useMemo(
    () =>
      posts.map((post, index) => {
        // While the expand overlay is open the inline tile must not play (two players, one video).
        const isActive = index === activeIndex && !expanded;
        const shouldRender = Math.abs(index - activeIndex) <= 1;
        return (
          <SwiperSlide key={post.video?.id ?? index} className="gencl:h-full gencl:w-full">
            <VideoFeedSlide
              post={post}
              index={index}
              isActive={isActive}
              shouldRender={shouldRender}
              totalVideos={total}
              activeIndex={activeIndex}
              size={size}
              showControls={showControls}
              showMeta={showMeta}
              loopSelf={loop && total === 1}
              expanded={expanded}
              onToggleExpand={toggleExpand}
              onIterationEnd={handleIterationEnd}
            />
          </SwiperSlide>
        );
      }),
    [posts, activeIndex, total, size, showControls, showMeta, loop, expanded, toggleExpand, handleIterationEnd]
  );

  const skeletonColors = FEED_SKELETON_THEME[theme === "light" ? "light" : "dark"];

  return (
    <section
      ref={rootRef}
      data-slot="video-feed"
      data-expanded={expanded || undefined}
      aria-label="Video feed"
      className={cn(
        "gencl:relative gencl:max-w-full gencl:overflow-hidden gencl:rounded-xl gencl:bg-black gencl:text-white",
        className
      )}
      style={{ width: resolvedWidth, height: resolvedHeight, ...style }}
      {...sectionProps}>
      {isLoading ? (
        <PlayerSkeleton colors={skeletonColors} isMobile={isMobile} />
      ) : isError ? (
        <StateMessage>Couldn’t load videos. Please try again.</StateMessage>
      ) : total === 0 ? (
        <StateMessage>No videos available.</StateMessage>
      ) : (
        <Swiper
          modules={[Mousewheel, Keyboard, A11y]}
          direction="vertical"
          slidesPerView={1}
          spaceBetween={0}
          speed={SLIDE_SPEED_MS}
          mousewheel={MOUSEWHEEL}
          keyboard={{ enabled: true, onlyInViewport: true }}
          a11y={{ enabled: true, prevSlideMessage: "Previous video", nextSlideMessage: "Next video" }}
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
          }}
          onSlideChange={handleSlideChange}
          className="gencl:h-full gencl:w-full">
          {slides}
        </Swiper>
      )}
      {expanded && total > 0 && (
        <VideoFeedExpandView
          data={data}
          startIndex={expandIndexRef.current}
          onClose={closeExpand}
          onActiveIndexChange={handleExpandIndexChange}
        />
      )}
    </section>
  );
}

function StateMessage({ children }: { children: ReactNode }) {
  return (
    <div
      role="status"
      className="gencl:flex gencl:h-full gencl:w-full gencl:items-center gencl:justify-center gencl:p-4 gencl:text-center gencl:text-body-1-normal gencl:text-white/80">
      {children}
    </div>
  );
}
