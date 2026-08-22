"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { useBaseContext } from "@genuin/components/context/base";
import { SectionHeader } from "@genuin/components/molecules/section-header/section-header";
import { EventCarousel } from "@genuin/components/organisms/event-carousel/event-carousel";
import type { EventCarouselItem } from "@genuin/components/organisms/event-carousel/event-carousel.types";
import { EventSurface, EventSurfacePanel } from "@genuin/components/organisms/event-surface/event-surface";
import { useEmit, useLatestEvent } from "@genuin/components/organisms/event-surface/event-surface-context";
import { HoverLinkCardList } from "@genuin/components/organisms/hover-link-card-list";
import type { ContextualLinkMetaData } from "@genuin/components/organisms/hover-link-card-list";
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

/**
 * Publisher/brand mark shown beside the section heading — The Foil "F" logo, served as a
 * webapp static asset (`apps/webapp/public/images/home/the-foil-logo.jpg`). Communities that
 * have their own avatar override it (see `useSectionFeed`).
 */
const SECTION_LOGO = "/images/home/the-foil-logo.jpg";

/** T-Mobile sponsor mark, served as a webapp static asset
 * (`apps/webapp/public/images/home/tmobile-logo.png`). */
const TMOBILE_LOGO = "/images/home/tmobile-logo.png";

/** Placeholder thumbnail (matches the EventCarousel/SectionHeader story fixtures). */
const EVENT_IMAGE =
  "https://thefoil.com/media/xjPn5tb1VybfsEuZ4Y9J9RiSHePy3sFR2qDTv3tu7Ic/resize:fill-down:336:258/gravity:ce/quality:60/dpr:1/2025/12/ricardo-pinto-sailgp-1-1.png";

/**
 * Distinct thefoil.com photos (imgproxy URLs pulled from the live homepage) so
 * each section's editorial cards show on-topic imagery instead of one shared
 * placeholder. Grouped by beat.
 */
const IMG = {
  // SailGP
  sailgpNewYork:
    "https://thefoil.com/media/06KbODg1b2NE6ub1rAATrrJyOcvaXwhMBbnZdt-Y5jM/resize:fill-down:532:300/gravity:fp:0.4787792084:0.701049749/quality:60/dpr:1/2026/06/new-york-sailgp-statue-of-liberty-2026.jpg",
  sailgpSimonBruty:
    "https://thefoil.com/media/2Q6FUB7wQVNMPhK1pyngvw4iYy_M-CfGaoK0gX24c28/resize:fill-down:532:300/gravity:fp:0.5:0.5/quality:60/dpr:1/2026/06/sb1-9984-simon-bruty-sailgp.jpg",
  sailgpFelixDiemer:
    "https://thefoil.com/media/bMJRf8vtuHxM8aSkwzHSuEnUPXFmUxByyCq8v6YWufk/resize:fill-down:455:256/gravity:fp:0.5:0.5/quality:60/dpr:1/2025/12/felix-diemer-sailgp-1.png",
  sailgpGeneva:
    "https://thefoil.com/media/a6cGRGkzMRAekl7Z91CPwxhZSUR75vK1dUqwmTV4kiE/resize:fill-down:455:256/gravity:fp:0.5:0.5/quality:60/dpr:2/2026/01/sailgp-geneva-event.png",
  sailgpSamoVidic:
    "https://thefoil.com/media/AkEim6m0U1cJz2068elEZnJEdGZzKG6_RMvmMZ0HojI/resize:fill-down:690:388/gravity:fp:0.5127659574:0.5173727167/quality:60/dpr:2/2026/06/sv3-3959-samo-vidic-for-sailgp.jpg",
  sailgpLosAngeles:
    "https://thefoil.com/media/0xvDzqK_ocsrk8QsiMqmO2OBKXRnpBJcpdMKshQsHUA/resize:fill-down:500:280/gravity:ce/quality:60/dpr:1/2026/01/los-angeles-memorial-coliseum.jpg",
  // America's Cup
  acGrantAustralia:
    "https://thefoil.com/media/Dbo6UstAFKh-9o6Qh0JyqXWJE8qsGooCci0O5ZqDGiM/resize:fill-down:532:300/gravity:fp:0.5:0.5/quality:60/dpr:2/2026/06/grant-auacannouncement-imageteamauac.jpg",
  acAc75:
    "https://thefoil.com/media/34W_UmIkJNtv9FDguxtAFJU4v84RwtefndIpAl3HA8Y/resize:fill-down:690:388/gravity:fp:0.501010101:0.7302059011/quality:60/dpr:1/2026/08/ac75s-pierre-bouras-sam-thom-america-s-cup-png.png",
  acValencia:
    "https://thefoil.com/media/dBTTONdJFQWIf2atg27IKK_tQtdgVuHqlJ6eIv7jACU/resize:fill-down:540:295/gravity:fp:0.5:0.5/quality:60/dpr:1/2026/01/nochesanjuan-valencia-4-1.jpg",
  acAuckland:
    "https://thefoil.com/media/cEU2dqX2riTz_QNbWdMf2JFR4GUC9CxGFkxKPebEY2I/resize:fill-down:532:300/gravity:fp:0.6278381625:0.3250833809/quality:60/dpr:2/2026/08/black-foils-auckland-2026-brett-phibbs.jpg",
  acDesign:
    "https://thefoil.com/media/dtwoxDuA6lLEBMIsdFmKtcF-fieju814c7HeIuHU0mo/resize:fill-down:532:300/gravity:fp:0.1914893617:0.4600980829/quality:60/dpr:1/2026/05/A8I5xxHXMuY.jpg",
  // Offshore / classic 600-milers
  offshorePace:
    "https://thefoil.com/media/bgdhVu68q7INeuPCNx7QiT9_HZemTlB5HoCWAe46xgs/resize:fill-down:690:388/gravity:fp:0.54:0.525974026/quality:60/dpr:1/2026/08/pace-line-honours-craig-nutter-pace.jpeg",
  offshoreNorthstar:
    "https://thefoil.com/media/88hujdjXkimh2hjECgSbi8G11dmmrQgPo1mSEJHk3mg/resize:fill-down:690:388/gravity:fp:0.4804597701:0.5023331499/quality:60/dpr:1/2026/02/northstar1.jpeg",
  offshoreCowes:
    "https://thefoil.com/media/435501a6atGLMO65acWV1U7cqN3mQ4o880afpK5xfxw/resize:fill-down:540:295/gravity:fp:0.3212765957:0.4967784486/quality:60/dpr:2/2026/07/cowes-week-2018.jpg",
  offshoreRp3:
    "https://thefoil.com/media/6RfWX6qzUiTXpUp1DjkLs8YS4WDoTtrwnUtGTdlOefM/resize:fill-down:690:388/gravity:fp:0.5:0.7960871928/quality:60/dpr:1/2026/08/rp3-9614.jpg",
  offshoreMl3:
    "https://thefoil.com/media/281DBEJEmQO6DT5Mg-QujQa5nPnq5Se_C0IkBg61ujM/resize:fill-down:690:388/gravity:fp:0.5:0.5/quality:60/dpr:2/2026/06/ml3-7515.jpg",
  offshoreGeneric:
    "https://thefoil.com/media/1c_B4FpWYUwQxFQPqJ3guvvsujw5XyOK6AecZmtyfKI/resize:fill-down:540:295/gravity:fp:0.5:0.5/quality:60/dpr:1/2026/03/54620591537-354128013c-k.jpg",
} as const;

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
  /** Section 1 Intelligence ("Latest News") — its own community, shown as editorial cards. */
  deskNews: { communityId: "24f3f015-2e3f-4f23-9d1a-0a7097830485", subHeading: "Latest News" },
  /** Latest Videos "Latest Interviews" — its own community, shown as editorial cards. */
  interviews: { communityId: "88f19de9-cda6-48fc-8896-7af03b62bea8", subHeading: "Latest Interviews" },
} satisfies Record<string, SectionSource>;

/* -------------------------------------------------------------------------- */
/* Genuin SDK placements                                                       */
/*                                                                             */
/* Every video surface on this page is a Genuin Web SDK placement, not a local  */
/* feed component: the placement owns which videos it shows, so adding or       */
/* removing a video in the placement is reflected here with no code change.     */
/* The sizes are the ones each placement was designed against — the surrounding */
/* section heights are derived from them.                                       */
/* -------------------------------------------------------------------------- */

type PlacementSource = {
  /** `placement_id` from the embed snippet. */
  placementId: string;
  /** `style_id` from the embed snippet. */
  styleId: string;
  /** Design width of the placement, in px. */
  width: number;
  /** Design height of the placement, in px. */
  height: number;
};

const HOME_PLACEMENTS = {
  /** Section 1 — carousel beside the Latest News intelligence panel. */
  desk: {
    placementId: "6a86fefe1b5332711228a547",
    styleId: "6a86fefe1b5332711228a548",
    width: 1044,
    height: 520,
  },
  /** Latest Videos — feed beside the related-links wheel. */
  latestVideos: {
    placementId: "6a8712d44fc9bb6b22ea8c7a",
    styleId: "6a8712d44fc9bb6b22ea8c7b",
    width: 688,
    height: 387,
  },
  /** Top Categories — full-width carousel. */
  topCategories: {
    placementId: "6a8713aa1b5332711228b24b",
    styleId: "6a8713aa1b5332711228b24c",
    width: 1400,
    height: 365,
  },
  /** Sponsored (T-Mobile) — grid beside the Relevant News panel. */
  sponsoredGrid: {
    placementId: "6a7c797ae26bf2c127deb952",
    styleId: "6a7c797ae26bf2c127deb953",
    width: 1000,
    height: 568,
  },
} satisfies Record<string, PlacementSource>;

/**
 * Hosted Genuin Web SDK bundle (QA).
 *
 * 2.0.6, not 2.0.5: the 2.0.5 build loads `hls.js@latest` off jsDelivr at runtime,
 * which is where the `HTMLVideoElement.onError` / buffer-stall noise comes from.
 * 2.0.6 ships the pinned `hls.js@1` (see `packages/ui/.../video-player/registry.ts`).
 *
 * Override with `NEXT_PUBLIC_GENUIN_SDK_URL` to point the placements at a locally
 * built bundle (`pnpm --filter @genuin/web-sdk serve:dev` →
 * `http://localhost:3000/gen_sdk.js`) — the only way to see unreleased
 * `packages/components` changes on these placements. Same variable the
 * webapp's `GenuinSdkLoader` reads.
 */
const GENUIN_SDK_SRC =
  process.env.NEXT_PUBLIC_GENUIN_SDK_URL ?? "https://media.qa.begenuin.com/sdk/2.0.6/gen_sdk.min.js";

/** Public client embed key — public by design, scoped to the brand's placements. */
const GENUIN_API_KEY = "018b5a9408d982482ee586511456679c1cc1f4bc4adc5dc2";

/**
 * A placement container. Pure markup: the SDK finds it by id/class on `init()` and
 * boots it from these `data-*` attributes — the multi-embed form from
 * `packages/web-sdk/index.multi.html.example`, which is what lets several
 * placements share one page.
 *
 * Content is owned by the placement, not by this page: videos added to or removed
 * from the placement show up here with no code change.
 */
function PlacementContainer({
  id,
  placement,
  width = "100%",
  ariaLabel,
}: {
  /** Unique per container — the SDK tells embeds apart by element id. */
  id: string;
  placement: PlacementSource;
  width?: number | string;
  ariaLabel: string;
}) {
  return (
    <div
      id={`gen-sdk-${id}`}
      className="gen-sdk-class"
      data-placement-id={placement.placementId}
      data-style-id={placement.styleId}
      data-api-key={GENUIN_API_KEY}
      data-testid={`genuin-placement-${id}`}
      aria-label={ariaLabel}
      style={{ width, height: placement.height }}
    />
  );
}

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

/* -------------------------------------------------------------------------- */
/* Per-section editorial content (dummy). Each news / Intelligence panel gets    */
/* its OWN themed set, so no two panels show the same articles. Written in the    */
/* style of thefoil.com's beats — these are placeholders, not real articles.     */
/* -------------------------------------------------------------------------- */

/** Section 1 "Latest News" — the SailGP beat. */
const SAILGP_NEWS: IntelligenceArticle[] = [
  {
    id: "sailgp-news-1",
    title: "SailGP and America's Cup: can they coexist?",
    href: "https://thefoil.com/news/the-questions-that-remain-following-new-york-sailgp/",
    image: { src: IMG.sailgpNewYork, alt: "SailGP and America's Cup" },
  },
  {
    id: "sailgp-news-2",
    title: "Inside the Rockwool Germany Sail Grand Prix",
    href: "https://thefoil.com/series/sailgp/events/rockwool-germany-sail-grand-prix-sassnitz/",
    image: { src: IMG.sailgpSimonBruty, alt: "Rockwool Germany Sail Grand Prix" },
  },
  {
    id: "sailgp-news-3",
    title: "Spain hit 99 km/h in the fleet's fastest run yet off Sassnitz",
    href: "https://thefoil.com/series/sailgp/events/emirates-dubai-sail-grand-prix-presented-by-dp-world/",
    image: { src: IMG.sailgpFelixDiemer, alt: "SailGP fastest run" },
  },
  {
    id: "sailgp-news-4",
    title: "Season 6 standings: three teams still in the title hunt",
    href: "https://thefoil.com/series/sailgp/events/rolex-switzerland-sail-grand-prix-geneva/",
    image: { src: IMG.sailgpGeneva, alt: "SailGP season standings" },
  },
  {
    id: "sailgp-news-5",
    title: "New Zealand vs Australia: the rivalry defining the season",
    href: "https://thefoil.com/news/andy-rice-rates-the-fleet-after-canada-sailgp/",
    image: { src: IMG.sailgpSamoVidic, alt: "New Zealand vs Australia" },
  },
  {
    id: "sailgp-news-6",
    title: "Grand Final preview: everything on the line in Abu Dhabi",
    href: "https://thefoil.com/series/sailgp/events/mubadala-abu-dhabi-sail-grand-prix-2026-season-grand-final-presented-by-abu-dhabi-sports-council/",
    image: { src: IMG.sailgpLosAngeles, alt: "SailGP Grand Final" },
  },
];

/** Tmobile "Relevant News" — the classic 600-mile offshore beat. */
const CLASSIC_600_NEWS: IntelligenceArticle[] = [
  {
    id: "classic-600-news-1",
    title: "Rolex China Sea Race: the fleet sets sail from Hong Kong",
    href: "https://thefoil.com/news/how-pace-took-line-honours-in-the-2026-round-britain-and-ireland-race-one-chapter-at-a-time/",
    image: { src: IMG.offshorePace, alt: "Rolex China Sea Race" },
  },
  {
    id: "classic-600-news-2",
    title: "RORC Caribbean 600: records tumble in a breezy edition",
    href: "https://thefoil.com/news/the-safest-is-when-you-re-pushing-hard-billy-gooderham-explains-flight-control/",
    image: { src: IMG.offshoreNorthstar, alt: "RORC Caribbean 600" },
  },
  {
    id: "classic-600-news-3",
    title: "Rolex Middle Sea Race: 606 miles around Sicily",
    href: "https://thefoil.com/news/freddie-carr-cowes-week-turns-200-why-britain-s-greatest-regatta-still-means-everything/",
    image: { src: IMG.offshoreCowes, alt: "Rolex Middle Sea Race" },
  },
  {
    id: "classic-600-news-4",
    title: "Rolex Fastnet Race: the making of a modern classic",
    href: "https://thefoil.com/news/the-week-in-racing-10-august-26/",
    image: { src: IMG.offshoreRp3, alt: "Rolex Fastnet Race" },
  },
  {
    id: "classic-600-news-5",
    title: "Rolex Sydney Hobart: 628 miles to Constitution Dock",
    href: "https://thefoil.com/news/rate-the-fleet-andy-rice-s-verdict-on-sailgp-new-york/",
    image: { src: IMG.offshoreMl3, alt: "Rolex Sydney Hobart" },
  },
  {
    id: "classic-600-news-6",
    title: "The 600-milers every offshore sailor dreams of",
    href: "https://thefoil.com/news/luca-rizzotti-bought-a-moth-in-2007-and-accidentally-started-a-movement/",
    image: { src: IMG.offshoreGeneric, alt: "Classic 600-milers" },
  },
];

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

// The Latest Videos section is the America's Cup community, so its related-link
// "wheel" is a set of real The Foil podcast episodes (title + link to the episode).
const PODCASTS: { title: string; link: string }[] = [
  {
    title: "Podcast: SailGP vs America's Cup — can they coexist?",
    link: "https://thefoil.com/news/podcast-sailgp-vs-america-s-cup-can-they-coexist/",
  },
  {
    title: "Podcast: Can anyone beat New Zealand to win the 38th America's Cup?",
    link: "https://thefoil.com/news/podcast-can-anyone-beat-new-zealand-to-win-the-38th-america-s-cup/",
  },
  {
    title: "Podcast: America's Cup is back — the full Cagliari debrief",
    link: "https://thefoil.com/news/podcast-america-s-cup-is-back-the-full-cagliari-debrief/",
  },
  {
    title: "Podcast extra: Mozzy and Freddie preview the AC38 Cagliari prelim",
    link: "https://thefoil.com/news/podcast-extra-mozzy-and-freddie-preview-the-ac38-cagliari-prelim/",
  },
  {
    title: "Podcast: 'It starts with a dream' — Glenn Ashby on Australia's AC38 challenge",
    link: "https://thefoil.com/news/podcast-it-starts-with-a-dream-glenn-ashby-on-australia-s-ac38-challenge-the-foil-podcast-ep-20/",
  },
  {
    title: "Podcast: The six American sailors chosen to take back the Cup",
    link: "https://thefoil.com/news/podcast-the-six-american-sailors-chosen-to-take-back-the-cup/",
  },
  {
    title: "Podcast Ep 8: Sydney SailGP preview & Quentin Delapierre on safety",
    link: "https://thefoil.com/news/podcast-ep-8-sydney-sailgp-preview-and-quentin-delapierre-on-safety/",
  },
];

/** A related link tagged with group/community for the videoId -> group -> community fallback. */
type LinkArticle = ContextualLinkMetaData & { groupId: string; communityId: string };

/** Build the related-link list from the live feed (one link per video). */
function buildLinkArticles(videoTags: VideoTag[], posts: PostDetailsType[]): LinkArticle[] {
  return videoTags.map((tag, index) => ({
    id: `interview-link-${index + 1}`,
    video_id: tag.videoId,
    link: PODCASTS[index]?.link ?? "https://thefoil.com/news/",
    title: PODCASTS[index]?.title ?? `The Foil Podcast — episode ${index + 1}`,
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
  href: "https://thefoil.com/news/full-steam-ahead-and-scrambling-to-keep-our-heads-above-water-grant-simmer-on-australia-s-cup-comeback/",
  image: { src: IMG.acGrantAustralia, alt: "Grant Simmer interview" },
};

/** Secondary interviews below the featured one — gives the panel content to scroll. */
const INTERVIEW_UP_NEXT_ARTICLES: IntelligenceArticle[] = [
  {
    id: "interview-2",
    title: "The new AC75 class, explained: what changed and why",
    href: "https://thefoil.com/news/the-week-in-racing-10-august-26/",
    image: { src: IMG.acAc75, alt: "AC75 class" },
  },
  {
    id: "interview-3",
    title: "Defenders vs challengers: who really has the edge?",
    href: "https://thefoil.com/series/sailgp/events/spain-sail-grand-prix-valencia/",
    image: { src: IMG.acValencia, alt: "Defenders vs challengers" },
  },
  {
    id: "interview-4",
    title: "From Auckland to Barcelona: the Cup finds a new home",
    href: "https://thefoil.com/news/the-real-story-behind-the-black-foils-new-sailgp-recruits/",
    image: { src: IMG.acAuckland, alt: "Auckland to Barcelona" },
  },
  {
    id: "interview-5",
    title: "Inside the design war that's reshaping the fleet",
    href: "https://thefoil.com/news/podcast-extra-mozzy-and-freddie-preview-the-ac38-cagliari-prelim/",
    image: { src: IMG.acDesign, alt: "Design war" },
  },
];

/** Featured + up-next together, rendered as image-first cards (big image on top, title below). */
const INTERVIEW_ARTICLES: IntelligenceArticle[] = [INTERVIEW_FEATURED_ARTICLE, ...INTERVIEW_UP_NEXT_ARTICLES];

/** "auto" height so each image-first card sizes to its content (image + title). */
const INTERVIEW_CARD_LAYOUT = { ...INTELLIGENCE_LAYOUT.articleCard, height: "auto" };

/**
 * Render a community's REAL feed posts as Intelligence editorial cards: the video
 * thumbnail becomes the image, its title/description the headline, and the video's
 * canonical share URL the "Read more" link. Falls back to `fallback` while the feed
 * is still empty/loading (the panel always needs at least one card).
 */
function postsToArticles(posts: PostDetailsType[], fallback: IntelligenceArticle[]): IntelligenceArticle[] {
  const articles = posts.flatMap((post, index): IntelligenceArticle[] => {
    const video = post.video;
    if (!video) return [];
    const title = video.attributes?.title || video.descritptionText || post.community?.name || "Untitled";
    return [
      {
        id: video.id || `article-${index}`,
        title,
        href: video.shareUrl || video.clickableUrl || "https://thefoil.com/",
        image: { src: video.thumbnail || EVENT_IMAGE, alt: title },
      },
    ];
  });
  // Real posts first, then top up with the fallback set so a sparse community
  // (e.g. one with a single post) still fills the panel. Capped at 8 cards.
  return [...articles, ...fallback].slice(0, 8);
}

/**
 * Right panel: the intelligence articles. Features the article for whatever
 * video is playing, and broadcasts `item:select` when the user picks an article.
 */
function DeskNewsPanel({ articles, videoTags }: { articles: IntelligenceArticle[]; videoTags: VideoTag[] }) {
  const emit = useEmit();
  // This section's editorial set is fixed (passed in); it does not change with
  // the active video. The first article is featured, the rest fill Up Next.
  const featured = articles[0]!;
  const upNext = articles.slice(1);

  return (
    <IntelligencePanel
      featuredArticle={featured}
      upNextArticles={upNext}
      layout={INTELLIGENCE_LAYOUT}
      onClose={() => undefined}
      onArticleSelect={(article) => {
        // Selecting an article plays this section's first video (the bus target).
        const targetVideoId = videoTags[0]?.videoId;
        if (!targetVideoId) return;
        emit("item:select", {
          itemId: article.id,
          index: articles.findIndex((entry) => entry.id === article.id),
          videoId: targetVideoId,
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
      // One card per scroll gesture (the next card snaps to the top, expands and its video plays).
      stepScroll
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
      // Manual scroll: the card that lands at the top expands AND its video plays —
      // same bus event as a click, so the VideoFeed slides to that video.
      onActiveItemChange={(item, index) => {
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
function InterviewsIntelligencePanel({ articles }: { articles: IntelligenceArticle[] }) {
  return (
    <IntelligencePanelShell size={{ width: "100%", height: "100%" }} onClose={() => undefined}>
      <div className="gencl:mt-2 gencl:flex gencl:flex-col gencl:gap-2">
        {articles.map((article) => (
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

/* -------------------------------------------------------------------------- */
/* Section 2 — Upcoming races                                                  */
/* -------------------------------------------------------------------------- */

const UPCOMING_RACES: EventCarouselItem[] = [
  {
    id: "rockwool-germany-sail-gp-2026",
    heading: "Rockwool Germany Sail Grand Prix | Sassnitz",
    image: { src: IMG.sailgpSimonBruty },
    start_date: "2026-08-22",
    end_date: "2026-08-23",
    location: "Sassnitz, Rügen Island, Germany",
    cta: {
      label: "Read More",
      href: "https://thefoil.com/series/sailgp/events/rockwool-germany-sail-grand-prix-sassnitz/",
    },
  },
  {
    id: "spain-sail-gp-2026",
    heading: "Spain Sail Grand Prix | Valencia",
    image: { src: IMG.acValencia },
    start_date: "2026-09-05",
    end_date: "2026-09-06",
    location: "Valencia, Spain",
    cta: {
      label: "Read More",
      href: "https://thefoil.com/series/sailgp/events/spain-sail-grand-prix-valencia/",
    },
  },
  {
    id: "rolex-switzerland-sail-gp-2026",
    heading: "Rolex Switzerland Sail Grand Prix | Geneva",
    image: { src: IMG.sailgpGeneva },
    start_date: "2026-09-19",
    end_date: "2026-09-20",
    location: "Geneva, Switzerland",
    cta: {
      label: "Read More",
      href: "https://thefoil.com/series/sailgp/events/rolex-switzerland-sail-grand-prix-geneva/",
    },
  },
  {
    id: "france-sail-gp-2026",
    heading: "France Sail Grand Prix | Saint-Tropez",
    image: { src: IMG.sailgpSamoVidic },
    start_date: "2026-09-26",
    end_date: "2026-09-27",
    location: "Saint-Tropez, France",
    cta: { label: "Read More", href: "https://thefoil.com/series/" },
  },
  {
    id: "emirates-dubai-sail-gp-2026",
    heading: "Emirates Dubai Sail Grand Prix | Dubai",
    image: { src: IMG.sailgpLosAngeles },
    start_date: "2026-11-28",
    end_date: "2026-11-29",
    location: "Dubai, United Arab Emirates",
    cta: {
      label: "Read More",
      href: "https://thefoil.com/series/sailgp/events/emirates-dubai-sail-grand-prix-presented-by-dp-world/",
    },
  },
];

/**
 * One full copy of the home page's content.
 *
 * Rendered repeatedly by `Home` for the infinite scroll, so every DOM id it emits
 * is namespaced with `instance` — most importantly the Genuin placement containers,
 * which the SDK keys by element id (two containers sharing an id would leave the
 * second one un-booted).
 */
function HomeSections({ instance }: { instance: number }) {
  // Every section is driven by ONE community (or group) of the current brand — see
  // HOME_SECTIONS. Which brand this resolves to is decided app-side (the
  // `config_params` cookie → brand config → brand-scoped axios instance).
  const desk = useSectionFeed(HOME_SECTIONS.desk);
  const latest = useSectionFeed(HOME_SECTIONS.latestVideos);
  const topCategories = useSectionFeed(HOME_SECTIONS.topCategories);
  const sponsored = useSectionFeed(HOME_SECTIONS.sponsoredGrid);
  // Intelligence panels are driven by their OWN communities (shown as editorial cards).
  const deskNews = useSectionFeed(HOME_SECTIONS.deskNews);
  const interviews = useSectionFeed(HOME_SECTIONS.interviews);

  // Synthetic group/community + related-link overlays, derived from each section's feed.
  const deskTags = useMemo(() => buildVideoTags(desk.posts), [desk.posts]);
  const latestTags = useMemo(() => buildVideoTags(latest.posts), [latest.posts]);
  const linkArticles = useMemo(() => buildLinkArticles(latestTags, latest.posts), [latestTags, latest.posts]);
  const sponsoredTags = useMemo(() => buildVideoTags(sponsored.posts), [sponsored.posts]);
  const deskNewsArticles = useMemo(() => postsToArticles(deskNews.posts, SAILGP_NEWS), [deskNews.posts]);
  const interviewArticles = useMemo(() => postsToArticles(interviews.posts, INTERVIEW_ARTICLES), [interviews.posts]);

  // NOTE: the page is intentionally NOT gated on the feed queries. The four video
  // surfaces are Genuin SDK placements that load their own content, so a slow or
  // empty community feed must not block or hide them — it only affects the section
  // headers and the editorial panels, which have their own fallbacks.

  return (
    <div className="gencl:w-full">
      <div className="gencl:flex gencl:w-full gencl:flex-col">
        {/* Section 1 — video carousel + intelligence, contextually linked via the bus. */}
        <EventSurface
          ariaLabel="SaleGP desk and latest news"
          className="gencl:p-5"
          // Match the Latest Interviews placement: content 2fr / Intelligence 0.75fr.
          columns="minmax(0, 2fr) minmax(0, 0.75fr)"
          gap="lg"
          columnGap="md"
          // 520 px placement + 42 px header + 12 px gap + 2 × 20 px section padding.
          height={614}>
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
              <PlacementContainer
                id={`home-desk-${instance}`}
                placement={HOME_PLACEMENTS.desk}
                ariaLabel="SailGP videos"
              />
            </div>
          </EventSurfacePanel>

          <EventSurfacePanel id="news" className="gencl:flex gencl:min-w-0 gencl:flex-col gencl:gap-3">
            <SectionHeader
              imageUrl={deskNews.communityImage}
              imageAlt={deskNews.communityName}
              heading={deskNews.communityName}
              subHeading="Latest News"
            />
            <div className="gencl:min-h-0 gencl:flex-1">
              <DeskNewsPanel articles={deskNewsArticles} videoTags={deskTags} />
            </div>
          </EventSurfacePanel>
        </EventSurface>

        {/* Section 2 — Upcoming races. */}
        <section
          aria-labelledby={`upcoming-races-heading-${instance}`}
          className="gencl:flex gencl:w-full gencl:flex-col gencl:gap-3 gencl:p-5">
          <SectionHeader
            id={`upcoming-races-heading-${instance}`}
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
        <section className="gencl:flex gencl:w-full gencl:gap-4 gencl:p-5" style={{ height: 481 }}>
          <EventSurface
            ariaLabel="Latest videos and related links"
            width="auto"
            style={{ flex: "2 1 0%" }}
            columns="minmax(0, 1.7fr) minmax(0, 1fr)"
            gap="md"
            // Keep the video, links, and Intelligence spacing consistent (16 px).
            columnGap="md"
            // 387 px placement + 42 px header + 12 px gap.
            height={441}>
            <EventSurfacePanel id="video" className="gencl:flex gencl:min-w-0 gencl:flex-col gencl:gap-3">
              <SectionHeader
                imageUrl={latest.communityImage}
                imageAlt={latest.communityName}
                heading={latest.groupName ?? latest.communityName}
                subHeading={HOME_SECTIONS.latestVideos.subHeading}
              />
              <div className="gencl:min-h-0 gencl:min-w-0 gencl:flex-1 gencl:overflow-hidden gencl:rounded-xl">
                <PlacementContainer
                  id={`home-latest-videos-${instance}`}
                  placement={HOME_PLACEMENTS.latestVideos}
                  ariaLabel="Latest videos"
                />
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
              imageUrl={interviews.communityImage}
              imageAlt={interviews.communityName}
              heading={interviews.communityName}
              subHeading="Latest Interviews"
            />
            <div className="gencl:min-h-0 gencl:flex-1">
              <InterviewsIntelligencePanel articles={interviewArticles} />
            </div>
          </div>
        </section>

        {/* Section 3 — Top Categories (video carousel + heading). */}
        <section
          aria-labelledby={`top-categories-heading-${instance}`}
          className="gencl:flex gencl:w-full gencl:flex-col gencl:gap-3 gencl:p-5">
          <SectionHeader
            id={`top-categories-heading-${instance}`}
            imageUrl={topCategories.communityImage}
            imageAlt={topCategories.communityName}
            heading={topCategories.groupName ?? topCategories.communityName}
            subHeading={HOME_SECTIONS.topCategories.subHeading}
          />
          <div className="gencl:overflow-hidden gencl:rounded-xl" style={{ height: 365 }}>
            <PlacementContainer
              id={`home-top-categories-${instance}`}
              placement={HOME_PLACEMENTS.topCategories}
              ariaLabel="Top categories"
            />
          </div>
        </section>

        {/* Section — Tmobile video grid + Relevant News, wrapped in an EventSurface.
            The Relevant News intelligence is fixed to the first video's community
            (same behaviour as Section 1 — decided on load, doesn't change). */}
        <EventSurface
          ariaLabel="Tmobile grid and relevant news"
          className="gencl:p-5"
          // Match the Latest Interviews placement: content 2fr / Intelligence 0.75fr.
          columns="minmax(0, 2fr) minmax(0, 0.75fr)"
          gap="lg"
          columnGap="md"
          // 568 px placement + 42 px header + 12 px gap + 2 × 20 px section padding.
          height={662}>
          <EventSurfacePanel id="grid" className="gencl:flex gencl:min-w-0 gencl:flex-col gencl:gap-3">
            <SectionHeader
              imageUrl={TMOBILE_LOGO}
              imageAlt="T-Mobile"
              heading="Tmobile"
              subHeading={HOME_SECTIONS.sponsoredGrid.subHeading}
            />
            <div className="gencl:min-h-0 gencl:min-w-0 gencl:w-full gencl:flex-1">
              {/* Match the placement's configured design size so its height is not scaled. */}
              <PlacementContainer
                id={`home-sponsored-grid-${instance}`}
                placement={HOME_PLACEMENTS.sponsoredGrid}
                width={HOME_PLACEMENTS.sponsoredGrid.width}
                ariaLabel="Sponsored videos"
              />
            </div>
          </EventSurfacePanel>

          <EventSurfacePanel id="news" className="gencl:flex gencl:min-w-0 gencl:flex-col gencl:gap-3">
            <SectionHeader
              imageUrl={sponsored.communityImage}
              imageAlt={sponsored.communityName}
              heading={sponsored.communityName}
              subHeading="Relevant News"
            />
            <div className="gencl:min-h-0" style={{ height: 568 }}>
              <DeskNewsPanel articles={CLASSIC_600_NEWS} videoTags={sponsoredTags} />
            </div>
          </EventSurfacePanel>
        </EventSurface>
      </div>
    </div>
  );
}

/**
 * The home page: one copy of `HomeSections` per "page", appended forever as the
 * reader scrolls.
 *
 * The content of each copy is identical — this is a deliberately endless feed of the
 * same page, not paginated data. Each copy re-mounts the four Genuin placements under
 * fresh container ids, so the SDK boots them independently.
 *
 * Section data is fetched once and shared: every copy calls the same `useFeed` query
 * keys, so react-query serves later copies from cache.
 */
export function Home() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [copies, setCopies] = useState(1);

  // Load the SDK, then let it boot the placement containers — the same
  // `window.genuin.init(...)` the hosted embed snippet calls, just run after React
  // has committed the containers. Re-runs when a copy is appended so the new
  // containers get booted too; the SDK skips the ones it has already handled.
  //
  // `configuration` is global to the init call, so every container on this page —
  // including any placement added later — inherits it. `player_controls: "v2"`
  // keeps the v2 control cluster (mute → play/pause → expand, top-right) in both
  // the inline placement and the expanded view; without it the SDK falls back to
  // the v1 controls, which split the cluster and drop the volume ring.
  //
  // Deliberately NOT `design_system: "v2"`: that also switches linkouts to the
  // dynamic sheet, changes the sponsored-badge treatment and makes control sizes
  // width-derived — none of which this page wants yet. Adding a placement here
  // needs no change to the id allowlist in `hooks/embed/use-embed-config.ts`.
  useEffect(() => {
    let cancelled = false;
    const init = () => {
      if (!cancelled) window.genuin?.init({ configuration: { player_controls: "v2" } });
    };

    const existing = document.querySelector<HTMLScriptElement>(`script[src="${GENUIN_SDK_SRC}"]`);
    if (existing) {
      if (window.genuin?.init) init();
      else existing.addEventListener("load", init, { once: true });
    } else {
      const script = document.createElement("script");
      script.src = GENUIN_SDK_SRC;
      script.async = true;
      script.addEventListener("load", init, { once: true });
      document.head.appendChild(script);
    }

    return () => {
      cancelled = true;
    };
  }, [copies]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return undefined;

    // `root` is the page's own scroll container, not the viewport — the layout
    // scrolls inside this component, so a viewport-rooted observer would never fire.
    const observer = new IntersectionObserver(
      (entries) => {
        // One copy per crossing: appending pushes the sentinel back out of the
        // margin, and the next scroll brings it in again.
        if (entries.some((entry) => entry.isIntersecting)) setCopies((count) => count + 1);
      },
      { root: scrollRef.current, rootMargin: "800px 0px" }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={scrollRef} className="gencl:h-full gencl:overflow-auto">
      {Array.from({ length: copies }, (_, index) => (
        <HomeSections key={index} instance={index} />
      ))}
      {/* Scroll tripwire — appending happens when this comes within 800 px of the
          bottom of the scroll container. */}
      <div ref={sentinelRef} aria-hidden style={{ height: 1 }} />
    </div>
  );
}
