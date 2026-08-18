"use client";

import { useMemo, useState } from "react";

import { useBaseContext } from "@genuin/components/context/base";
import { ErrorState } from "@genuin/components/molecules/error-state";
import { SectionHeader } from "@genuin/components/molecules/section-header/section-header";
import { EventCarousel } from "@genuin/components/organisms/event-carousel/event-carousel";
import type { EventCarouselItem } from "@genuin/components/organisms/event-carousel/event-carousel.types";
import { EventSurface, EventSurfacePanel } from "@genuin/components/organisms/event-surface/event-surface";
import {
  useEmit,
  useLatestEvent,
  useSurfaceEvent,
} from "@genuin/components/organisms/event-surface/event-surface-context";
import { HoverLinkCardList } from "@genuin/components/organisms/hover-link-card-list";
import type { ContextualLinkMetaData } from "@genuin/components/organisms/hover-link-card-list";
import { IntelligenceArticleCard } from "@genuin/components/organisms/intelligence-panel/intelligence-article-card";
import { IntelligencePanel } from "@genuin/components/organisms/intelligence-panel/intelligence-panel";
import { IntelligencePanelShell } from "@genuin/components/organisms/intelligence-panel/intelligence-panel-shell";
import type {
  IntelligenceArticle,
  IntelligencePanelLayout,
} from "@genuin/components/organisms/intelligence-panel/intelligence-panel.types";
import { VideoCarousel } from "@genuin/components/organisms/video-carousel/video-carousel";
import { VideoFeed } from "@genuin/components/organisms/video-feed/video-feed";
import { VideoGrid } from "@genuin/components/organisms/video-grid/video-grid";
import { useFeed } from "@genuin/components/react-query/api/feed";
import type { PostDetailsType } from "@genuin/components/react-query/api/feed/schema";
import { getQueryKeyForFeed } from "@genuin/components/react-query/keys/feed";
import type { FeedData } from "@genuin/components/templates/feed/feed.type";

/**
 * Publisher/brand mark shown beside the section heading — The Foil "F" logo, served as a
 * webapp static asset (`apps/webapp/public/images/home/the-foil-logo.jpg`). Communities that
 * have their own avatar override it (see `useSectionFeed`).
 */
const SECTION_LOGO = "/images/home/the-foil-logo.jpg";

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
/* Community-driven sections                                                    */
/*                                                                             */
/* Every video component on the page shows ONE community (optionally narrowed  */
/* to a group) of the current brand, and its SectionHeader shows that           */
/* community's real name / avatar from the feed API. Change the ids here.       */
/*                                                                             */
/* The Foil (QA brand 3840) — community uuid → groups (uuid):                   */
/*   SailGP              48ebbb76-3213-4faf-b626-0ade6ceb256f                    */
/*     Season 6          49c36846-ef58-4d20-a97e-139454f06d02                    */
/*   America's Cup       dde76c1a-9adb-4347-a44f-eae4b3d622ab                    */
/*     Videos            4ca45d6b-f7f1-4af7-a66c-69c266e0ee7f                    */
/*     Opinion/Analysis  2c6cc49a-9824-4171-8f64-b7f752e05ae8                    */
/*   Olympics            90e35b26-32e0-4fa4-94fe-e0821f76948a                    */
/*     LA 2028           8a4ba163-de60-4c57-998c-d2d4a2e7324d                    */
/*   Round-the-World     88f19de9-cda6-48fc-8896-7af03b62bea8                    */
/*     Opinion/Analysis  ef26d576-0fca-4442-b950-608ed3b42fec                    */
/*   Classic 600-Milers  5e0a78dd-ff62-4c6a-a3cc-c6fc7dd36950                    */
/*     Youth             f8b3f7a9-4bd6-4a72-9390-d84c35b9fed9                    */
/*     Videos            6eca912a-eccc-4e2a-9609-687c54572d9f                    */
/*   Other Sailing       24f3f015-2e3f-4f23-9d1a-0a7097830485                    */
/*     Interviews        2f398e21-cfb4-405d-b4b8-9e9d70e3e1fc                    */
/* -------------------------------------------------------------------------- */

type SectionSource = {
  /** Community uuid (`community_ids` on `/goservices/feed/v1/home`). */
  communityId: string;
  /** Optional group uuid (`loop_ids`) to narrow the community further. */
  groupId?: string;
  /** Header sub-heading (the API has no community tagline). */
  subHeading: string;
};

const HOME_SECTIONS = {
  /** Section 1 — video carousel + intelligence. */
  desk: { communityId: "48ebbb76-3213-4faf-b626-0ade6ceb256f", subHeading: "Insight, action and spotlight" },
  /** Latest Videos (VideoFeed) + related links + interviews panel. */
  latestVideos: { communityId: "dde76c1a-9adb-4347-a44f-eae4b3d622ab", subHeading: "Fresh Insights" },
  /** Top Categories carousel. */
  topCategories: { communityId: "90e35b26-32e0-4fa4-94fe-e0821f76948a", subHeading: "You might like" },
  /** Sponsored grid + relevant news. */
  sponsoredGrid: { communityId: "5e0a78dd-ff62-4c6a-a3cc-c6fc7dd36950", subHeading: "Brought to you by Tmobile" },
} satisfies Record<string, SectionSource>;

/** What a section knows about its community once the feed has answered. */
type SectionFeed = {
  feedData: FeedData;
  posts: PostDetailsType[];
  /** Real community name from the feed (falls back to a placeholder while loading). */
  communityName: string;
  /** Community avatar from the feed, else the brand mark. */
  communityImage: string;
  /** Group name when the section is narrowed to a group. */
  groupName?: string;
  isLoading: boolean;
};

/**
 * One community's (or group's) feed for a section — the same brand-scoped request
 * `VideoFeed`/`VideoGrid` make (`useFeed("HOME", { communityIds, groupIds })` — `HOME` sends
 * `type: 1`, which the API requires; `FEED_V1` without it is rejected with 412).
 */
function useSectionFeed(source: SectionSource): SectionFeed {
  const { isInIframe, brandDetails } = useBaseContext();
  const options = useMemo(
    () => ({
      isInIframe,
      brandId: brandDetails.brand_id ?? undefined,
      communityIds: [source.communityId],
      ...(source.groupId ? { groupIds: [source.groupId] } : {}),
    }),
    [isInIframe, brandDetails.brand_id, source.communityId, source.groupId]
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
    communityName: first?.community?.name ?? "…",
    communityImage: first?.community?.profileImage ?? SECTION_LOGO,
    groupName: source.groupId ? (first?.group?.name ?? undefined) : undefined,
    isLoading,
  };
}

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
  const byCommunity = communityId ? linkArticles.find((article) => article.communityId === communityId) : undefined;
  return byCommunity?.video_id ?? null;
}

const INTERVIEW_FEATURED_ARTICLE: IntelligenceArticle = {
  id: "interview-featured",
  title: "'Full steam ahead and scrambling to keep our heads above water': Grant Simmer on Australia's Cup comeback",
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
  const demoLinkouts = posts.find((post) => Array.isArray(post.video?.linkouts) && post.video.linkouts.length)?.video
    ?.linkouts;

  return posts.map((post) => ({
    ...post,
    video: post.video
      ? {
          ...post.video,
          cardLayoutId: 7,
          linkouts:
            Array.isArray(post.video.linkouts) && post.video.linkouts.length ? post.video.linkouts : demoLinkouts,
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
  const community = resolveCommunity(videoTags[0]?.groupId, videoTags[0]?.communityId) ?? COMMUNITIES[0]!;
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
  const activeLinkVideoId = resolveLinkVideoId(active?.videoId, active?.groupId, active?.communityId, linkArticles);

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
      // 500×296 tiles (16:9-ish) → 2 columns ≈ 1008 px, leaving more room for the news panel.
      tileWidth={500}
      tileHeight={296}
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
  // Every section is driven by ONE community (or group) of the current brand — see
  // HOME_SECTIONS. Which brand this resolves to is decided app-side (the
  // `config_params` cookie → brand config → brand-scoped axios instance).
  const desk = useSectionFeed(HOME_SECTIONS.desk);
  const latest = useSectionFeed(HOME_SECTIONS.latestVideos);
  const topCategories = useSectionFeed(HOME_SECTIONS.topCategories);
  const sponsored = useSectionFeed(HOME_SECTIONS.sponsoredGrid);

  // Synthetic group/community + related-link overlays, derived from each section's feed.
  const deskTags = useMemo(() => buildVideoTags(desk.posts), [desk.posts]);
  const latestTags = useMemo(() => buildVideoTags(latest.posts), [latest.posts]);
  const linkArticles = useMemo(() => buildLinkArticles(latestTags, latest.posts), [latestTags, latest.posts]);
  const sponsoredTags = useMemo(() => buildVideoTags(sponsored.posts), [sponsored.posts]);
  const gridPosts = useMemo(() => buildGridPosts(sponsored.posts), [sponsored.posts]);

  const anyLoading = desk.isLoading || latest.isLoading || topCategories.isLoading || sponsored.isLoading;
  const totalPosts = desk.posts.length + latest.posts.length + topCategories.posts.length + sponsored.posts.length;

  if (anyLoading && totalPosts === 0) {
    return (
      <div
        className="gencl:flex gencl:h-full gencl:items-center gencl:justify-center gencl:p-6"
        role="status"
        aria-live="polite">
        <span className="gencl:text-secondary-500">Loading…</span>
      </div>
    );
  }

  if (!anyLoading && totalPosts === 0) {
    return (
      <div className="gencl:h-full gencl:overflow-auto">
        <ErrorState type="NO_CONTENT" />
      </div>
    );
  }

  return (
    <div className="gencl:h-full gencl:overflow-auto">
      <div className="gencl:flex gencl:w-full gencl:flex-col">
        {/* Section 1 — video carousel + intelligence, contextually linked via the bus. */}
        <EventSurface
          ariaLabel="SaleGP desk and latest news"
          className="gencl:p-6"
          // Carousel ≈ 71 % / Intelligence ≈ 29 % — the panel is kept narrow so the
          // carousel shows more cards.
          columns="minmax(0, 2.5fr) minmax(0, 1fr)"
          gap="lg"
          // Breathing room to the LEFT of the intelligence panel (20 px).
          columnGap="ml"
          // 500 px of content + 2 × 24 px section padding.
          height={548}>
          <EventSurfacePanel id="video" className="gencl:flex gencl:min-w-0 gencl:flex-col gencl:gap-3">
            <SectionHeader
              imageUrl={desk.communityImage}
              imageAlt={desk.communityName}
              heading={desk.groupName ?? desk.communityName}
              subHeading={HOME_SECTIONS.desk.subHeading}
            />
            {/* `overflow-hidden`: the carousel must stay inside its column and never
                paint under the intelligence panel next to it. */}
            <div className="gencl:min-h-0 gencl:min-w-0 gencl:flex-1 gencl:overflow-hidden gencl:rounded-xl">
              <DeskVideoPanel feedData={desk.feedData} videoTags={deskTags} />
            </div>
          </EventSurfacePanel>

          <EventSurfacePanel id="news" className="gencl:flex gencl:min-w-0 gencl:flex-col gencl:gap-3">
            <SectionHeader
              imageUrl={desk.communityImage}
              imageAlt={desk.communityName}
              heading={desk.communityName}
              subHeading="Latest News"
            />
            <div className="gencl:min-h-0 gencl:flex-1">
              <DeskNewsPanel videoTags={deskTags} />
            </div>
          </EventSurfacePanel>
        </EventSurface>

        {/* Section 2 — Upcoming races. */}
        <section
          aria-labelledby="upcoming-races-heading"
          className="gencl:flex gencl:w-full gencl:flex-col gencl:gap-3 gencl:p-6">
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
        <section className="gencl:flex gencl:w-full gencl:gap-4 gencl:p-6" style={{ height: 508 }}>
          <EventSurface
            ariaLabel="Latest videos and related links"
            width="auto"
            style={{ flex: "2 1 0%" }}
            columns="minmax(0, 1.7fr) minmax(0, 1fr)"
            gap="md"
            // Extra room to the LEFT of the hover-link list (24 px).
            columnGap="lg"
            height={460}>
            <EventSurfacePanel id="video" className="gencl:flex gencl:min-w-0 gencl:flex-col gencl:gap-3">
              <SectionHeader
                imageUrl={latest.communityImage}
                imageAlt={latest.communityName}
                heading={latest.groupName ?? latest.communityName}
                subHeading={HOME_SECTIONS.latestVideos.subHeading}
              />
              <div className="gencl:min-h-0 gencl:min-w-0 gencl:flex-1 gencl:overflow-hidden gencl:rounded-xl">
                <InterviewsVideoPanel posts={latest.posts} videoTags={latestTags} />
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

          {/* Narrower than the video+links surface (2 : 0.75) so the interviews panel stays compact. */}
          <div className="gencl:flex gencl:min-w-0 gencl:flex-col gencl:gap-3" style={{ flex: "0.75 1 0%" }}>
            <SectionHeader
              imageUrl={latest.communityImage}
              imageAlt={latest.communityName}
              heading={latest.communityName}
              subHeading="Latest Interviews"
            />
            <div className="gencl:min-h-0 gencl:flex-1">
              <InterviewsIntelligencePanel />
            </div>
          </div>
        </section>

        {/* Section 3 — Top Categories (video carousel + heading). */}
        <section
          aria-labelledby="top-categories-heading"
          className="gencl:flex gencl:w-full gencl:flex-col gencl:gap-3 gencl:p-6">
          <SectionHeader
            id="top-categories-heading"
            imageUrl={topCategories.communityImage}
            imageAlt={topCategories.communityName}
            heading={topCategories.groupName ?? topCategories.communityName}
            subHeading={HOME_SECTIONS.topCategories.subHeading}
          />
          <div className="gencl:overflow-hidden gencl:rounded-xl" style={{ height: 440 }}>
            <VideoCarousel
              feedType="HOME"
              externalFeedData={topCategories.feedData}
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
          className="gencl:p-6"
          columns="max-content minmax(0, 1fr)"
          gap="lg"
          // Breathing room to the LEFT of the news panel (32 px).
          columnGap="ml"
          // Header row (42 + 12 gap) + 2 × 296 px tiles + 8 px grid gap + 2 × 24 px padding.
          height={702}>
          <EventSurfacePanel id="grid" className="gencl:flex gencl:min-w-0 gencl:flex-col gencl:gap-3">
            <SectionHeader
              imageUrl={TMOBILE_LOGO}
              imageAlt="T-Mobile"
              heading={sponsored.groupName ?? sponsored.communityName}
              subHeading={HOME_SECTIONS.sponsoredGrid.subHeading}
            />
            <div className="gencl:min-h-0 gencl:flex-1">
              <TmobileGridPanel gridPosts={gridPosts} videoTags={sponsoredTags} />
            </div>
          </EventSurfacePanel>

          <EventSurfacePanel id="news" className="gencl:flex gencl:min-w-0 gencl:flex-col gencl:gap-3">
            <SectionHeader
              imageUrl={sponsored.communityImage}
              imageAlt={sponsored.communityName}
              heading={sponsored.communityName}
              subHeading="Relevant News"
            />
            <div className="gencl:min-h-0 gencl:flex-1">
              <DeskNewsPanel videoTags={sponsoredTags} />
            </div>
          </EventSurfacePanel>
        </EventSurface>
      </div>
    </div>
  );
}
