
"use client";

import { useState } from "react";

import { SectionHeader } from "@genuin/components/molecules/section-header/section-header";
import { EventCarousel } from "@genuin/components/organisms/event-carousel/event-carousel";
import type { EventCarouselItem } from "@genuin/components/organisms/event-carousel/event-carousel.types";
import { testFeedData } from "@genuin/components/organisms/embed/test-data-feed";
import { EventSurface, EventSurfacePanel } from "@genuin/components/organisms/event-surface/event-surface";
import { useEmit, useLatestEvent, useSurfaceEvent } from "@genuin/components/organisms/event-surface/event-surface-context";
import { IntelligencePanel } from "@genuin/components/organisms/intelligence-panel/intelligence-panel";
import type {
  IntelligenceArticle,
  IntelligencePanelLayout,
} from "@genuin/components/organisms/intelligence-panel/intelligence-panel.types";
import { VideoCarousel } from "@genuin/components/organisms/video-carousel/video-carousel";
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

// Reuse the shared fixture (no network) for the carousel — show ALL videos.
// TODO(home): replace with a real feed source that carries real group/community ids.
const DESK_VIDEOS = testFeedData.pages.flatMap((page) => page.feed);

const DESK_FEED_DATA: FeedData = {
  queryKey: ["home", "sale-gp-desk"],
  videos: DESK_VIDEOS,
  isLoading: false,
  hasNextPage: false,
  isFetchingNextPage: false,
  fetchNextPage: () => undefined,
  totalVideos: DESK_VIDEOS.length,
  pageSession: null,
};

// A community/group owns a WHOLE set of intelligence articles. The news panel
// maps to the community/group of the active video — NOT to the individual video —
// so the articles change ONLY when the active video crosses into another
// community/group, never per video.
type DeskCommunity = {
  groupId: string;
  communityId: string;
  articles: IntelligenceArticle[];
};

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

// Assign each video to a community in contiguous chunks, so scrolling stays
// within a community for several videos before the articles change.
const VIDEOS_PER_COMMUNITY = Math.max(1, Math.ceil(DESK_VIDEOS.length / COMMUNITIES.length));

function communityForVideoIndex(index: number): DeskCommunity {
  return COMMUNITIES[Math.min(Math.floor(index / VIDEOS_PER_COMMUNITY), COMMUNITIES.length - 1)]!;
}

// video id -> its community/group (side table; the fixture posts stay untouched).
const VIDEO_TAGS = DESK_VIDEOS.map((post, index) => {
  const community = communityForVideoIndex(index);
  return {
    videoId: post.video?.id ?? `desk-video-${index + 1}`,
    groupId: community.groupId,
    communityId: community.communityId,
  };
});

/** Resolve a community by group id first, then community id. */
function resolveCommunity(groupId?: string, communityId?: string): DeskCommunity | undefined {
  if (!groupId && !communityId) return undefined;
  return (
    (groupId ? COMMUNITIES.find((community) => community.groupId === groupId) : undefined) ??
    (communityId ? COMMUNITIES.find((community) => community.communityId === communityId) : undefined)
  );
}

/** The first video belonging to a community (group first, then community). */
function firstVideoIdForCommunity(community: DeskCommunity): string | undefined {
  return (
    VIDEO_TAGS.find((tag) => tag.groupId === community.groupId)?.videoId ??
    VIDEO_TAGS.find((tag) => tag.communityId === community.communityId)?.videoId
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

/**
 * Left panel: the video carousel. Broadcasts the active video and follows
 * article selections from the news panel.
 */
function DeskVideoPanel() {
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
      externalFeedData={DESK_FEED_DATA}
      ctaText="Read More"
      activeVideoId={activeVideoId}
      containerClassName="gencl:h-full"
      onActiveVideoChange={(details) => {
        // Map the active video to its synthetic group/community via the side table
        // (the fixture's own ids are not distinct enough for the demo).
        const tag = VIDEO_TAGS.find((entry) => entry.videoId === details.videoId);
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
function DeskNewsPanel() {
  const emit = useEmit();
  const activeVideo = useLatestEvent("video:change");
  // Map the WHOLE panel to the active video's community/group (not the video id),
  // so the article set is stable across every video in the same community.
  const community = resolveCommunity(activeVideo?.groupId, activeVideo?.communityId) ?? COMMUNITIES[0]!;
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
        const targetVideoId = firstVideoIdForCommunity(community);
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
              <DeskVideoPanel />
            </div>
          </EventSurfacePanel>

          <EventSurfacePanel id="news" className="gencl:flex gencl:min-w-0 gencl:flex-col gencl:gap-3">
            <SectionHeader
              imageUrl={SECTION_LOGO}
              imageAlt="The Foil"
              heading="Latest News"
              subHeading="Fresh Insights"
            />
            <div className="gencl:min-h-0 gencl:flex-1">
              <DeskNewsPanel />
            </div>
          </EventSurfacePanel>
        </EventSurface>

        {/* Section 2 — Upcoming races. */}
        <section
          aria-labelledby="upcoming-races-heading"
          className="gencl:flex gencl:w-full gencl:flex-col gencl:gap-4 gencl:rounded-2xl gencl:bg-white gencl:p-4 gencl:sm:p-5">
          <SectionHeader
            id="upcoming-races-heading"
            imageUrl={SECTION_LOGO}
            imageAlt="The Foil"
            heading="Upcoming races: leading edge in action"
            subHeading="What's next?"
          />
          <EventCarousel events={UPCOMING_RACES} ariaLabel="Upcoming races" />
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
              externalFeedData={DESK_FEED_DATA}
              ctaText="Read More"
              containerClassName="gencl:h-full"
            />
          </div>
        </section>
      </div>
    </div>
  );
}
