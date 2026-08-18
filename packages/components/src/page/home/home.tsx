
"use client";

import { useMemo, useState } from "react";

import { useBaseContext } from "@genuin/components/context/base";
import { SectionHeader } from "@genuin/components/molecules/section-header/section-header";
import { ErrorState } from "@genuin/components/molecules/error-state";
import { EventCarousel } from "@genuin/components/organisms/event-carousel/event-carousel";
import type { EventCarouselItem } from "@genuin/components/organisms/event-carousel/event-carousel.types";
import { EventSurface, EventSurfacePanel } from "@genuin/components/organisms/event-surface/event-surface";
import { useEmit, useLatestEvent, useSurfaceEvent } from "@genuin/components/organisms/event-surface/event-surface-context";
import { IntelligencePanel } from "@genuin/components/organisms/intelligence-panel/intelligence-panel";
import { IntelligenceArticleCard } from "@genuin/components/organisms/intelligence-panel/intelligence-article-card";
import { IntelligencePanelShell } from "@genuin/components/organisms/intelligence-panel/intelligence-panel-shell";
import type {
  IntelligenceArticle,
  IntelligencePanelLayout,
} from "@genuin/components/organisms/intelligence-panel/intelligence-panel.types";
import { VideoCarousel } from "@genuin/components/organisms/video-carousel/video-carousel";
import { VideoFeed } from "@genuin/components/organisms/video-feed/video-feed";
import { VideoGrid } from "@genuin/components/organisms/video-grid/video-grid";
import { HoverLinkCardList } from "@genuin/components/organisms/hover-link-card-list";
import type { ContextualLinkMetaData } from "@genuin/components/organisms/hover-link-card-list";
import { useFeed } from "@genuin/components/react-query/api/feed";
import type { PostDetailsType } from "@genuin/components/react-query/api/feed/schema";
import { getQueryKeyForFeed } from "@genuin/components/react-query/keys/feed";
import type { FeedData } from "@genuin/components/templates/feed/feed.type";

/**
 * Publisher/brand mark shown beside the section heading. Rendered inline as a
 * self-contained SVG data URI so the page has no external asset dependency.
 * TODO(home): swap for the real publisher logo once the asset pipeline is wired.
 */
const SECTION_LOGO = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40">' +
    '<rect width="40" height="40" rx="10" fill="#000000"/>' +
    '<text x="20" y="28" font-family="Arial, Helvetica, sans-serif" font-size="22"' +
    ' font-weight="700" fill="#ffffff" text-anchor="middle">F</text>' +
    "</svg>"
)}`;

/** T-Mobile brand mark (magenta) — placeholder, same inline-SVG approach as SECTION_LOGO. */
const TMOBILE_LOGO = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40">' +
    '<rect width="40" height="40" rx="10" fill="#e20074"/>' +
    '<text x="20" y="28" font-family="Arial, Helvetica, sans-serif" font-size="22"' +
    ' font-weight="700" fill="#ffffff" text-anchor="middle">T</text>' +
    "</svg>"
)}`;

/** Placeholder thumbnail (matches the EventCarousel/SectionHeader story fixtures). */
const EVENT_IMAGE =
  "https://thefoil.com/media/xjPn5tb1VybfsEuZ4Y9J9RiSHePy3sFR2qDTv3tu7Ic/resize:fill-down:336:258/gravity:ce/quality:60/dpr:1/2025/12/ricardo-pinto-sailgp-1-1.png";

/* -------------------------------------------------------------------------- */
/* Section 1 — SaleGP Desk (video carousel) <-> Latest News (intelligence)     */
/*                                                                             */
/* The two panels are contextually linked through the EventSurface bus:        */
/*   • the active/hovered video broadcasts `video:change`; the news panel       */
/*     features the article for that video's group (fallback: community).       */
/*   • selecting an article broadcasts `item:select`; the carousel slides to    */
/*     that group's/community's video and plays it.                             */
/* -------------------------------------------------------------------------- */

// A community/group owns a WHOLE set of intelligence articles. The news panel
// maps to the community/group of the active video — NOT to the individual video —
// so the articles change ONLY when the active video crosses into another
// community/group, never per video.
type DeskCommunity = {
  groupId: string;
  communityId: string;
  articles: IntelligenceArticle[];
};

/** A video's synthetic group/community assignment (built from the live feed). */
type VideoTag = { videoId: string; groupId: string; communityId: string };

const COMMUNITY_DEFS: { key: string; groupId: string; communityId: string; titles: string[] }[] = [
  {
    key: "sailgp",
    groupId: "grp-sailgp",
    communityId: "com-sailgp",
    titles: [
      "SailGP and America's Cup: can they coexist?",
      "Inside the Rockwool Germany Grand Prix",
      "The fleet's fastest run yet",
      "Season standings shake-up",
      "Grand final preview",
    ],
  },
  {
    key: "americas-cup",
    groupId: "grp-americas-cup",
    communityId: "com-americas-cup",
    titles: [
      "America's Cup is back",
      "The new AC75 class, explained",
      "Defenders vs challengers",
      "From Auckland to Barcelona",
      "The design war heats up",
    ],
  },
  {
    key: "foiling-tech",
    groupId: "grp-foiling-tech",
    communityId: "com-foiling-tech",
    titles: [
      "The technology behind modern foiling",
      "Jet fighters dancing on water",
      "How wing trim wins races",
      "Materials that changed sailing",
      "Reading the data on the water",
    ],
  },
];

const COMMUNITIES: DeskCommunity[] = COMMUNITY_DEFS.map((def) => ({
  groupId: def.groupId,
  communityId: def.communityId,
  articles: def.titles.map((title, index) => ({
    id: `${def.key}-article-${index + 1}`,
    title,
    href: `https://thefoil.com/news/${def.key}-${index + 1}`,
    image: { src: EVENT_IMAGE, alt: title },
  })),
}));

/**
 * Assign each live video to a community in contiguous chunks, so scrolling stays
 * within a community for several videos before the articles change. The feed
 * comes from the brand's `HOME` API, so this is a demo overlay of synthetic
 * group/community ids on top of the real videos (the intelligence articles are
 * placeholder content, not part of the feed payload).
 */
function buildVideoTags(posts: PostDetailsType[]): VideoTag[] {
  const perCommunity = Math.max(1, Math.ceil(posts.length / COMMUNITIES.length));
  return posts.map((post, index) => {
    const community = COMMUNITIES[Math.min(Math.floor(index / perCommunity), COMMUNITIES.length - 1)]!;
    return {
      videoId: post.video?.id ?? `desk-video-${index + 1}`,
      groupId: community.groupId,
      communityId: community.communityId,
    };
  });
}

/** Resolve a community by group id first, then community id. */
function resolveCommunity(groupId?: string, communityId?: string): DeskCommunity | undefined {
  if (!groupId && !communityId) return undefined;
  return (
    (groupId ? COMMUNITIES.find((community) => community.groupId === groupId) : undefined) ??
    (communityId ? COMMUNITIES.find((community) => community.communityId === communityId) : undefined)
  );
}

/** The first video belonging to a community (group first, then community). */
function firstVideoIdForCommunity(community: DeskCommunity, videoTags: VideoTag[]): string | undefined {
  return (
    videoTags.find((tag) => tag.groupId === community.groupId)?.videoId ??
    videoTags.find((tag) => tag.communityId === community.communityId)?.videoId
  );
}

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

/* -------------------------------------------------------------------------- */
/* Section — Latest Videos (VideoFeed) <-> related links (HoverLinkCardList),   */
/* plus a standalone Intelligence "Latest Interviews" panel shell.              */
/*                                                                             */
/* VideoFeed + HoverLinkCardList are linked through the EventSurface bus and    */
/* mapped at the VIDEO ID level (fallback: group id, then community id): when    */
/* the active video changes, the list scrolls that video's link to the top      */
/* (its "wheel", the focused card grows); picking a link plays that video.      */
/* -------------------------------------------------------------------------- */

const PODCAST_TITLES = [
  "Podcast: SailGP vs America's Cup: Can they coexist?",
  "Podcast: Can anyone beat New Zealand?",
  "Podcast: America's Cup is back! The fleet reacts",
  "'Like watching jet fighters dance on water'",
  "Podcast: Inside the Rockwool Germany Grand Prix",
];

/** A related link tagged with group/community for the videoId -> group -> community fallback. */
type LinkArticle = ContextualLinkMetaData & { groupId: string; communityId: string };

/** Build the related-link list from the live feed (one link per video). */
function buildLinkArticles(videoTags: VideoTag[], posts: PostDetailsType[]): LinkArticle[] {
  return videoTags.map((tag, index) => ({
    id: `interview-link-${index + 1}`,
    video_id: tag.videoId,
    link: `https://thefoil.com/podcast/episode-${index + 1}`,
    title: PODCAST_TITLES[index] ?? `Podcast episode ${index + 1}`,
    description:
      "Click here to listen on Spotify and other platforms. Sailing has never been healthier — on this week's pod, that's exactly the promise we dig into.",
    image: posts[index]?.video?.thumbnail ?? EVENT_IMAGE,
    brand: "The Foil",
    website: "thefoil.com",
    groupId: tag.groupId,
    communityId: tag.communityId,
  }));
}

/** The link video_id to pin: video id first, then group id, then community id. */
function resolveLinkVideoId(
  videoId: string | undefined,
  groupId: string | undefined,
  communityId: string | undefined,
  linkArticles: LinkArticle[]
): string | null {
  if (videoId && linkArticles.some((article) => article.video_id === videoId)) return videoId;
  const byGroup = groupId ? linkArticles.find((article) => article.groupId === groupId) : undefined;
  if (byGroup?.video_id) return byGroup.video_id;
  const byCommunity = communityId
    ? linkArticles.find((article) => article.communityId === communityId)
    : undefined;
  return byCommunity?.video_id ?? null;
}

const INTERVIEW_FEATURED_ARTICLE: IntelligenceArticle = {
  id: "interview-featured",
  title:
    "'Full steam ahead and scrambling to keep our heads above water': Grant Simmer on Australia's Cup comeback",
  href: "https://thefoil.com/interviews/grant-simmer",
  image: { src: EVENT_IMAGE, alt: "Grant Simmer interview" },
};

/** Secondary interviews below the featured one — gives the panel content to scroll. */
const INTERVIEW_UP_NEXT_ARTICLES: IntelligenceArticle[] = [
  {
    id: "interview-2",
    title: "The new AC75 class, explained: what changed and why",
    href: "https://thefoil.com/interviews/ac75-class",
    image: { src: EVENT_IMAGE, alt: "AC75 class" },
  },
  {
    id: "interview-3",
    title: "Defenders vs challengers: who really has the edge?",
    href: "https://thefoil.com/interviews/defenders-vs-challengers",
    image: { src: EVENT_IMAGE, alt: "Defenders vs challengers" },
  },
  {
    id: "interview-4",
    title: "From Auckland to Barcelona: the Cup finds a new home",
    href: "https://thefoil.com/interviews/auckland-to-barcelona",
    image: { src: EVENT_IMAGE, alt: "Auckland to Barcelona" },
  },
  {
    id: "interview-5",
    title: "Inside the design war that's reshaping the fleet",
    href: "https://thefoil.com/interviews/design-war",
    image: { src: EVENT_IMAGE, alt: "Design war" },
  },
];

/** Featured + up-next together, rendered as image-first cards (big image on top, title below). */
const INTERVIEW_ARTICLES: IntelligenceArticle[] = [INTERVIEW_FEATURED_ARTICLE, ...INTERVIEW_UP_NEXT_ARTICLES];

/** "auto" height so each image-first card sizes to its content (image + title). */
const INTERVIEW_CARD_LAYOUT = { ...INTELLIGENCE_LAYOUT.articleCard, height: "auto" };

/** Mark the live posts sponsored (cardLayoutId 7) and give every tile a linkout —
 * the exact transformation the VideoGrid story uses — so each tile shows the
 * "Sponsored" pill (top-left) and the linkout CTA bar below, the same as the
 * standalone VideoGrid component. */
function buildGridPosts(posts: PostDetailsType[]): PostDetailsType[] {
  const demoLinkouts = posts.find(
    (post) => Array.isArray(post.video?.linkouts) && post.video.linkouts.length
  )?.video?.linkouts;

  return posts.map((post) => ({
    ...post,
    video: post.video
      ? {
          ...post.video,
          cardLayoutId: 7,
          linkouts:
            Array.isArray(post.video.linkouts) && post.video.linkouts.length
              ? post.video.linkouts
              : demoLinkouts,
          linkoutId: post.video.linkoutId ?? 4046,
        }
      : post.video,
  })) as PostDetailsType[];
}

/**
 * Left panel: the video carousel. Broadcasts the active video and follows
 * article selections from the news panel.
 */
function DeskVideoPanel({ feedData, videoTags }: { feedData: FeedData; videoTags: VideoTag[] }) {
  const emit = useEmit();
  // Controlled active video, kept in sync with the carousel so a later article
  // selection is always a real change (and never yanks a manual swipe back).
  const [activeVideoId, setActiveVideoId] = useState<string | undefined>(undefined);

  // React to an article selection from the other panel: play that video.
  useSurfaceEvent("item:select", (payload) => {
    if (payload.videoId) setActiveVideoId(payload.videoId);
  });

  return (
    <VideoCarousel
      feedType="HOME"
      externalFeedData={feedData}
      ctaText="Read More"
      showNavigation={false}
      activeVideoId={activeVideoId}
      containerClassName="gencl:h-full"
      onActiveVideoChange={(details) => {
        // Map the active video to its synthetic group/community via the side table
        // (the feed's own ids are not distinct enough for the demo).
        const tag = videoTags.find((entry) => entry.videoId === details.videoId);
        setActiveVideoId(details.videoId);
        emit("video:change", {
          videoId: details.videoId,
          groupId: tag?.groupId ?? "",
          communityId: tag?.communityId ?? "",
          index: details.index,
          previousVideoId: null,
        });
      }}
    />
  );
}

/**
 * Right panel: the intelligence articles. Features the article for whatever
 * video is playing, and broadcasts `item:select` when the user picks an article.
 */
function DeskNewsPanel({ videoTags }: { videoTags: VideoTag[] }) {
  const emit = useEmit();
  // The intelligence data is decided ONCE from the FIRST video's community/group.
  // It does NOT change when the active video (or its community) changes.
  const community =
    resolveCommunity(videoTags[0]?.groupId, videoTags[0]?.communityId) ?? COMMUNITIES[0]!;
  const featured = community.articles[0]!;
  const upNext = community.articles.slice(1);

  return (
    <IntelligencePanel
      featuredArticle={featured}
      upNextArticles={upNext}
      layout={INTELLIGENCE_LAYOUT}
      onClose={() => undefined}
      onArticleSelect={(article) => {
        // Selecting an article plays a video of THIS community/group (mapping by
        // community/group, not a specific video id).
        const targetVideoId = firstVideoIdForCommunity(community, videoTags);
        if (!targetVideoId) return;
        emit("item:select", {
          itemId: article.id,
          index: community.articles.findIndex((entry) => entry.id === article.id),
          videoId: targetVideoId,
        });
      }}
    />
  );
}

/** Left panel: the VideoFeed. Broadcasts the active video and follows link selections. */
function InterviewsVideoPanel({ posts, videoTags }: { posts: PostDetailsType[]; videoTags: VideoTag[] }) {
  const emit = useEmit();
  const [activeVideoId, setActiveVideoId] = useState<string | undefined>(undefined);

  useSurfaceEvent("item:select", (payload) => {
    if (payload.videoId) setActiveVideoId(payload.videoId);
  });

  return (
    <VideoFeed
      posts={posts}
      activeVideoId={activeVideoId}
      width="100%"
      height="100%"
      onActiveVideoChange={(post, index) => {
        const tag = videoTags.find((entry) => entry.videoId === post.video?.id);
        setActiveVideoId(post.video?.id);
        emit("video:change", {
          videoId: post.video?.id ?? "",
          groupId: tag?.groupId ?? "",
          communityId: tag?.communityId ?? "",
          index,
          previousVideoId: null,
        });
      }}
    />
  );
}

/**
 * Middle panel: the HoverLinkCardList "wheel". Scrolls the active video's link to
 * the top (video id first, then group, then community) and plays a link's video on click.
 */
function InterviewsLinkPanel({ linkArticles }: { linkArticles: LinkArticle[] }) {
  const emit = useEmit();
  const active = useLatestEvent("video:change");
  const activeLinkVideoId = resolveLinkVideoId(
    active?.videoId,
    active?.groupId,
    active?.communityId,
    linkArticles
  );

  return (
    <HoverLinkCardList
      items={linkArticles}
      activeVideoId={activeLinkVideoId}
      pinActiveItemToTop
      autoRotate={false}
      showContainerBorder={false}
      ctaText="Read More"
      width="100%"
      height="100%"
      onLinkClick={(item, index) => {
        if (item.video_id) {
          emit("item:select", { itemId: item.id ?? item.link, index, videoId: item.video_id });
        }
      }}
    />
  );
}

/**
 * Right panel (standalone): the reusable panel shell composing image-first article
 * cards — the "Reusable Panel Shell" pattern (IntelligencePanelShell +
 * IntelligenceArticleCard with `imagePosition="top"`: big image on top, title
 * below). Scrolls inside its fixed-height column.
 */
function InterviewsIntelligencePanel() {
  return (
    <IntelligencePanelShell size={{ width: "100%", height: "100%" }} onClose={() => undefined}>
      <div className="gencl:mt-2 gencl:flex gencl:flex-col gencl:gap-2">
        {INTERVIEW_ARTICLES.map((article) => (
          <IntelligenceArticleCard
            key={article.id}
            article={article}
            layout={INTERVIEW_CARD_LAYOUT}
            imagePosition="top"
          />
        ))}
      </div>
    </IntelligencePanelShell>
  );
}

/**
 * Video grid for the Tmobile section. Broadcasts the active video (same as the
 * Section 1 video panel). The Relevant News panel is fixed to the first video's
 * community, so it doesn't react to changes.
 */
function TmobileGridPanel({ gridPosts, videoTags }: { gridPosts: PostDetailsType[]; videoTags: VideoTag[] }) {
  const emit = useEmit();
  return (
    <VideoGrid
      posts={gridPosts}
      columns={2}
      tileWidth={540}
      tileHeight={320}
      onActiveVideoChange={(post, index) => {
        const tag = videoTags.find((entry) => entry.videoId === post.video?.id);
        emit("video:change", {
          videoId: post.video?.id ?? "",
          groupId: tag?.groupId ?? "",
          communityId: tag?.communityId ?? "",
          index,
          previousVideoId: null,
        });
      }}
    />
  );
}

/* -------------------------------------------------------------------------- */
/* Section 2 — Upcoming races                                                  */
/* -------------------------------------------------------------------------- */

const UPCOMING_RACES: EventCarouselItem[] = [
  {
    id: "rockwool-germany-sail-gp-2026",
    heading: "Rockwool Germany Sail Grand Prix | Sassnitz",
    image: { src: EVENT_IMAGE },
    start_date: "2026-08-22",
    end_date: "2026-08-23",
    location: "Sassnitz, Rügen Island, Germany",
    cta: { label: "Read More", href: "/events/rockwool-germany-sail-grand-prix-sassnitz" },
  },
  {
    id: "spain-sail-gp-2026",
    heading: "Spain Sail Grand Prix | Valencia",
    image: { src: EVENT_IMAGE },
    start_date: "2026-09-05",
    end_date: "2026-09-06",
    location: "Valencia, Spain",
    cta: { label: "Read More", href: "/events/spain-sail-grand-prix-valencia" },
  },
  {
    id: "rolex-switzerland-sail-gp-2026",
    heading: "Rolex Switzerland Sail Grand Prix | Geneva",
    image: { src: EVENT_IMAGE },
    start_date: "2026-09-19",
    end_date: "2026-09-20",
    location: "Geneva, Switzerland",
    cta: { label: "Read More", href: "/events/rolex-switzerland-sail-grand-prix-geneva" },
  },
  {
    id: "rockwool-germany-sail-gp-2026-repeat",
    heading: "Rockwool Germany Sail Grand Prix | Sassnitz",
    image: { src: EVENT_IMAGE },
    start_date: "2026-08-22",
    end_date: "2026-08-23",
    location: "Sassnitz, Rügen Island, Germany",
    cta: { label: "Read More", href: "/events/rockwool-germany-sail-grand-prix-sassnitz-2" },
  },
  {
    id: "spain-sail-gp-2026-repeat",
    heading: "Spain Sail Grand Prix | Valencia",
    image: { src: EVENT_IMAGE },
    start_date: "2026-09-05",
    end_date: "2026-09-06",
    location: "Valencia, Spain",
    cta: { label: "Read More", href: "/events/spain-sail-grand-prix-valencia-2" },
  },
];

export function Home() {
  // The whole page is driven by the brand's HOME feed — the same brand-scoped
  // request the old `<Feed feedType="HOME" />` made. Which brand this resolves to
  // is decided app-side (the `config_params` cookie → brand config → brand-scoped
  // axios instance), so pointing the app at a different brand swaps this data.
  const { isInIframe, brandDetails } = useBaseContext();
  const feedQueryOptions = useMemo(
    () => ({ isInIframe, brandId: brandDetails.brand_id ?? undefined }),
    [isInIframe, brandDetails.brand_id]
  );
  const { data, isLoading, isError, hasNextPage, isFetchingNextPage, fetchNextPage } = useFeed(
    "HOME",
    feedQueryOptions
  );

  const posts = useMemo(() => data?.pages.flatMap((page) => page.feed) ?? [], [data]);

  // One shared FeedData for every carousel/feed on the page (single network call,
  // consistent data across sections; the carousels drive pagination on scroll).
  const feedData: FeedData = useMemo(
    () => ({
      queryKey: getQueryKeyForFeed("HOME", feedQueryOptions),
      videos: posts,
      isLoading,
      hasNextPage: hasNextPage ?? false,
      isFetchingNextPage,
      fetchNextPage,
      totalVideos: data?.pages[0]?.totalVideos,
      pageSession: data?.pages[0]?.pageSession,
    }),
    [posts, isLoading, hasNextPage, isFetchingNextPage, fetchNextPage, data, feedQueryOptions]
  );

  // Synthetic group/community + related-link overlays, derived from the live feed.
  const videoTags = useMemo(() => buildVideoTags(posts), [posts]);
  const linkArticles = useMemo(() => buildLinkArticles(videoTags, posts), [videoTags, posts]);
  const gridPosts = useMemo(() => buildGridPosts(posts), [posts]);

  if (isError) {
    return (
      <div className="gencl:h-full gencl:overflow-auto">
        <ErrorState type="ERROR" />
      </div>
    );
  }

  if (isLoading && posts.length === 0) {
    return (
      <div
        className="gencl:flex gencl:h-full gencl:items-center gencl:justify-center gencl:p-6"
        role="status"
        aria-live="polite">
        <span className="gencl:text-secondary-500">Loading…</span>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="gencl:h-full gencl:overflow-auto">
        <ErrorState type="NO_CONTENT" />
      </div>
    );
  }

  return (
    <div className="gencl:h-full gencl:overflow-auto">
      <div className="gencl:flex gencl:w-full gencl:flex-col gencl:gap-6 gencl:p-4 gencl:sm:p-6!">
        {/* Section 1 — video carousel + intelligence, contextually linked via the bus. */}
        <EventSurface
          ariaLabel="SaleGP desk and latest news"
          columns="minmax(0, 2fr) minmax(0, 1fr)"
          gap="lg"
          height={500}>
          <EventSurfacePanel id="video" className="gencl:flex gencl:min-w-0 gencl:flex-col gencl:gap-3">
            <SectionHeader
              imageUrl={SECTION_LOGO}
              imageAlt="The Foil"
              heading="SaleGP Desk"
              subHeading="Insight, action and spotlight on SailGP"
            />
            <div className="gencl:min-h-0 gencl:flex-1">
              <DeskVideoPanel feedData={feedData} videoTags={videoTags} />
            </div>
          </EventSurfacePanel>

          <EventSurfacePanel id="news" className="gencl:flex gencl:min-w-0 gencl:flex-col gencl:gap-3">
            {/* Spacer (header height) so the intelligence panel aligns with the video
                content instead of the "SaleGP Desk" header above it. */}
            <div aria-hidden style={{ height: 42 }} />
            <div className="gencl:min-h-0 gencl:flex-1">
              <DeskNewsPanel videoTags={videoTags} />
            </div>
          </EventSurfacePanel>
        </EventSurface>

        {/* Section 2 — Upcoming races. */}
        <section
          aria-labelledby="upcoming-races-heading"
          className="gencl:flex gencl:w-full gencl:flex-col gencl:gap-3">
          <SectionHeader
            id="upcoming-races-heading"
            imageUrl={SECTION_LOGO}
            imageAlt="The Foil"
            heading="Upcoming races: leading edge in action"
            subHeading="What's next?"
          />
          <EventCarousel events={UPCOMING_RACES} ariaLabel="Upcoming races" />
        </section>

        {/* Section — Latest Videos + related links (bus-linked) + Latest Interviews.
            Fixed height so every column (incl. the Intelligence panel) is height-
            constrained and scrolls internally instead of growing to its content. */}
        <section className="gencl:flex gencl:w-full gencl:gap-4" style={{ height: 460 }}>
          <EventSurface
            ariaLabel="Latest videos and related links"
            width="auto"
            style={{ flex: "2 1 0%" }}
            columns="minmax(0, 1.7fr) minmax(0, 1fr)"
            gap="md"
            height={460}>
            <EventSurfacePanel id="video" className="gencl:flex gencl:min-w-0 gencl:flex-col gencl:gap-3">
              <SectionHeader
                imageUrl={SECTION_LOGO}
                imageAlt="The Foil"
                heading="Latest Videos"
                subHeading="Fresh Insights"
              />
              <div className="gencl:min-h-0 gencl:flex-1">
                <InterviewsVideoPanel posts={posts} videoTags={videoTags} />
              </div>
            </EventSurfacePanel>
            <EventSurfacePanel id="links" className="gencl:flex gencl:min-w-0 gencl:flex-col gencl:gap-3">
              {/* Spacer aligns the list top with the video content (matches the header row). */}
              <div aria-hidden style={{ height: 42 }} />
              {/* Border lives on this non-scrolling wrapper so the list's scrollbar
                  can't cover the right edge (the ring is outside the scroll area). */}
              <div className="gencl:min-h-0 gencl:flex-1 gencl:overflow-hidden gencl:rounded-xl gencl:ring-1 gencl:ring-secondary-200">
                <InterviewsLinkPanel linkArticles={linkArticles} />
              </div>
            </EventSurfacePanel>
          </EventSurface>

          <div className="gencl:flex gencl:min-w-0 gencl:flex-col gencl:gap-3" style={{ flex: "1 1 0%" }}>
            <SectionHeader
              imageUrl={SECTION_LOGO}
              imageAlt="The Foil"
              heading="Latest Interviews"
              subHeading="Fresh Insights"
            />
            <div className="gencl:min-h-0 gencl:flex-1">
              <InterviewsIntelligencePanel />
            </div>
          </div>
        </section>

        {/* Section 3 — Top Categories (video carousel + heading). */}
        <section
          aria-labelledby="top-categories-heading"
          className="gencl:flex gencl:w-full gencl:flex-col gencl:gap-3">
          <SectionHeader
            id="top-categories-heading"
            imageUrl={SECTION_LOGO}
            imageAlt="The Foil"
            heading="Top Categories in The Foil"
            subHeading="You might like"
          />
          <div style={{ height: 440 }}>
            <VideoCarousel
              feedType="HOME"
              externalFeedData={feedData}
              ctaText="Read More"
              showNavigation={false}
              containerClassName="gencl:h-full"
            />
          </div>
        </section>

        {/* Section — Tmobile video grid + Relevant News, wrapped in an EventSurface.
            The Relevant News intelligence is fixed to the first video's community
            (same behaviour as Section 1 — decided on load, doesn't change). */}
        <EventSurface
          ariaLabel="Tmobile grid and relevant news"
          columns="max-content minmax(0, 1fr)"
          gap="lg"
          height={702}>
          <EventSurfacePanel id="grid" className="gencl:flex gencl:min-w-0 gencl:flex-col gencl:gap-3">
            <SectionHeader
              imageUrl={TMOBILE_LOGO}
              imageAlt="T-Mobile"
              heading="Tmobile"
              subHeading="Brought to you by Tmobile"
            />
            <div className="gencl:min-h-0 gencl:flex-1">
              <TmobileGridPanel gridPosts={gridPosts} videoTags={videoTags} />
            </div>
          </EventSurfacePanel>

          <EventSurfacePanel id="news" className="gencl:flex gencl:min-w-0 gencl:flex-col gencl:gap-3">
            <SectionHeader
              imageUrl={SECTION_LOGO}
              imageAlt="The Foil"
              heading="Relevant News"
              subHeading="Fresh Insights"
            />
            <div className="gencl:min-h-0 gencl:flex-1">
              <DeskNewsPanel videoTags={videoTags} />
            </div>
          </EventSurfacePanel>
        </EventSurface>
      </div>
    </div>
  );
}
