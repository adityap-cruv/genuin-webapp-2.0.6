// Server-only home-feed data for iHeart brand 3938.
// All editorial cards are sourced from the imported article catalog; no Foil
// community, event, sponsor, or external article assignments are retained.

import { articleHref, getAllArticleSlugs, getArticleBySlug, type Article } from "@genuin/components/page/article/article-data";
import type { ArticleData, EventData, FeedSource, HeaderData, HomeDataPage, LinkItemData, WidgetData } from "@genuin/components/page/home-dynamic/contract";

import { getHomeLayoutForPage } from "./layout";

const ARTICLE_POOL = getAllArticleSlugs()
  .map((slug) => getArticleBySlug(slug))
  .filter((article): article is NonNullable<typeof article> => Boolean(article));

// Keep the existing placement's video identities so the SDK/video rail remains unchanged;
// Video identities matching placement 6ab125485468e3445269e1d9 (style 6ab125485468e3445269e1da)
const PLACEMENT_VIDEO_IDS = [
  "ba5568e1-89eb-474d-bcc4-9bdb3a179c03",
  "24202e6c-beca-4fb7-a442-c33136372de6",
  "c1d54965-739b-4b47-8e0a-b2f5cab11b2a",
  "9a080779-d8cd-4589-934d-4e728e561c69",
  "11b93539-1a9d-413e-b3fd-9e359b77220e",
  "4e05347e-fc22-4b83-af9a-d605792a8618",
  "94000fd2-2521-4047-9027-9a5a2c8ecf49",
  "381e2ae7-9688-425c-90a0-469b676fbade",
  "3aee53ff-3f4c-487d-9d30-d746da8c12f2",
  "443119a5-c32d-44e2-9eff-580c829768b2",
  "24729653-de6f-498d-b077-b243c5594eb2",
  "041ae71d-14ff-4002-951d-28d0ffa6b3dc",
  "8042d4cf-d794-4256-b7f1-7d88b3d8067a",
  "105fe3c8-ebfe-4d6d-b5ce-f7273c8831dc",
  "4fe9dffa-d5e8-4539-abc3-878be75c7786",
  "5961ff9c-c43a-49a6-8d12-527591b73183",
  "2648a296-f752-4841-b8c9-8dfee938b00f",
  "ae19201f-605e-4f6c-8ae2-5262ab8ef117",
  "aac5401a-fc2f-41b4-9f7b-74f198992933",
  "e9ba3fa0-0055-49fd-aa6a-d14d3a1c608a",
] as const;

function poolArticle(index: number): Article {
  const article = ARTICLE_POOL[index % ARTICLE_POOL.length];
  if (!article) throw new Error("iHeart article catalog is empty");
  return article;
}

function articleData(index: number): ArticleData {
  const article = poolArticle(index);
  return { id: article.entityId ?? article.slug, title: article.title, href: articleHref(article.slug), image: { src: article.heroImage.src, alt: article.heroImage.alt } };
}

function articleDescription(index: number): string {
  return poolArticle(index).standfirst ?? "Read the latest from iHeart.";
}

function contextualLinks(pageIndex: number): LinkItemData[] {
  return Array.from({ length: Math.min(20, ARTICLE_POOL.length) }, (_, offset) => {
    const index = pageIndex * 3 + offset;
    const article = poolArticle(index);
    return {
      id: `${pageIndex}-related-${offset}`,
      video_id: PLACEMENT_VIDEO_IDS[offset % PLACEMENT_VIDEO_IDS.length]!,
      link: articleHref(article.slug),
      title: article.title,
      description: articleDescription(index),
      brand: "iHeart",
      website: "iheart.com",
      image: article.heroImage.src,
    };
  });
}

function events(pageIndex: number): EventData[] {
  return Array.from({ length: Math.min(6, ARTICLE_POOL.length) }, (_, offset) => {
    const index = pageIndex * 2 + offset;
    const article = poolArticle(index);
    const date = article.publishedAt?.slice(0, 10) ?? "2026-09-19";
    return {
      id: article.entityId ?? article.slug,
      heading: article.title,
      image: { src: article.heroImage.src },
      startDate: date,
      endDate: date,
      location: "iHeart",
      cta: { label: "Read article", href: articleHref(article.slug) },
    };
  });
}

const BRAND_COMMUNITIES = {
  festival: {
    id: "29bee151-fa36-47c5-9919-612291cc1531",
    name: "iHeartRadio Music Festival",
    slug: "iheartradio-music-festival",
    dp: "https://media.qa.begenuin.com/uploads/profile_images/community/194bdd15-d169-4289-861f-1876a6b5f366_1790000469537.png",
  },
  festivalGroup: {
    communityId: "29bee151-fa36-47c5-9919-612291cc1531",
    groupId: "3d6a9b91-b6c6-4982-996b-2db298904b71",
    name: "Festival Performances & Highlights",
    slug: "festival-performances-highlights",
    communitySlug: "iheartradio-music-festival",
    dp: "https://media.qa.begenuin.com/uploads/profile_images/community/194bdd15-d169-4289-861f-1876a6b5f366_1790000469537.png",
  },
  sportsRadio: {
    id: "2b552203-cb4e-4414-b3ab-0e0a1b7f0cbe",
    name: "Sports Radio",
    slug: "sports-radio",
    dp: "https://media.qa.begenuin.com/uploads/profile_images/community/647e5676-0f52-4a9f-9428-c3c6154f14d1_1789997419187.png",
  },
  artistRadioStations: {
    id: "5db6106b-f6f3-4f4d-a2f9-b0ef369fda61",
    name: "Artist Radio Stations",
    slug: "artist-radio-stations",
    dp: "https://media.qa.begenuin.com/uploads/profile_images/community/b490cfc4-2f72-458d-a436-d8636ce67bca_1789997406886.png",
  },
  nfl: {
    id: "c810f318-483c-4fec-bd97-379f901c2ad2",
    name: "NFL",
    slug: "nfl",
    dp: "https://media.qa.begenuin.com/uploads/profile_images/community/a843dd98-d9f6-40b8-98d9-1a5e06166e8f_1789997416942.png",
  },
  artistInterviewsGroup: {
    communityId: "5db6106b-f6f3-4f4d-a2f9-b0ef369fda61",
    groupId: "5fd072b5-61c1-4972-b91f-109df50f34fb",
    name: "Artist Interviews & Performances",
    slug: "artist-interviews-performances",
    communitySlug: "artist-radio-stations",
    dp: "https://media.qa.begenuin.com/uploads/profile_images/community/b490cfc4-2f72-458d-a436-d8636ce67bca_1789997406886.png",
  },
  artistRadio: {
    id: "0b32c042-a27e-4c77-b36a-7c0f5064b551",
    name: "Artist Radio",
    slug: "artist-radio",
    dp: "https://media.qa.begenuin.com/uploads/profile_images/community/958aedc0-ef89-4af8-abf8-1998865d4ba0_1789997401054.png",
  },
  sportsHighlightsGroup: {
    communityId: "2b552203-cb4e-4414-b3ab-0e0a1b7f0cbe",
    groupId: "15266401-fc39-44cd-a91b-a86a88a14756",
    name: "Sports Highlights & Talk",
    slug: "sports-highlights-talk",
    communitySlug: "sports-radio",
    dp: "https://media.qa.begenuin.com/uploads/profile_images/community/647e5676-0f52-4a9f-9428-c3c6154f14d1_1789997419187.png",
  },
} as const;

const SPONSORS = [
  {
    id: "usski",
    brandSlug: "usski",
    heading: "U.S. Ski",
    subHeading: "Sponsored",
    logo: "https://media.qa.begenuin.com/uploads/brands/logo/U.S.Ski_favicon_1789993902.png",
    ctaText: "Learn More",
  },
  {
    id: "capitalone",
    brandSlug: "capitalone",
    heading: "Capital One",
    subHeading: "Sponsored",
    logo: "https://media.qa.begenuin.com/uploads/brands/logo/Capital_One_favicon_1789994759.png",
    ctaText: "Learn More",
  },
] as const;

function baseData(pageIndex: number): Record<string, WidgetData> {
  const featured = articleData(pageIndex);
  // Intelligence panels show one featured story plus four up-next stories (five total),
  // matching the original home-feed density.
  const upNext = [1, 2, 3, 4].map((offset) => articleData(pageIndex + offset));
  const articles = [0, 1, 2, 3, 4].map((offset) => articleData(pageIndex + offset));

  const cFestival = BRAND_COMMUNITIES.festival;
  const gFestival = BRAND_COMMUNITIES.festivalGroup;
  const cSports = BRAND_COMMUNITIES.sportsRadio;
  const cArtistStations = BRAND_COMMUNITIES.artistRadioStations;
  const cNfl = BRAND_COMMUNITIES.nfl;
  const gArtistInterviews = BRAND_COMMUNITIES.artistInterviewsGroup;
  const cArtistRadio = BRAND_COMMUNITIES.artistRadio;
  const sponsor = SPONSORS[pageIndex % SPONSORS.length]!;

  return {
    salegp_desk: {
      id: "salegp_desk",
      header: {
        heading: cFestival.name,
        subHeading: "Latest iHeart coverage",
        logo: cFestival.dp,
        communitySlug: cFestival.slug,
      },
      source: { feedType: "HOME", communityId: cFestival.id },
      ctaText: "Read More",
    },
    latest_news: {
      id: "latest_news",
      header: {
        heading: gFestival.name,
        subHeading: "Latest Articles",
        logo: gFestival.dp,
        communitySlug: gFestival.communitySlug,
        groupSlug: gFestival.slug,
      },
      source: { feedType: "HOME", communityId: gFestival.communityId, groupId: gFestival.groupId },
      featuredArticle: featured,
      upNextArticles: upNext,
      readMoreLabel: "Read more",
      upNextLabel: "More from iHeart",
    },
    upcoming_races: {
      id: "upcoming_races",
      header: {
        heading: cSports.name,
        subHeading: "Published articles",
        logo: cSports.dp,
        communitySlug: cSports.slug,
      },
      source: { feedType: "HOME", communityId: cSports.id },
      events: events(pageIndex),
    },
    latest_videos: {
      id: "latest_videos",
      header: {
        heading: cArtistStations.name,
        subHeading: "Latest Highlights",
        logo: cArtistStations.dp,
        communitySlug: cArtistStations.slug,
      },
      source: { feedType: "HOME", communityId: cArtistStations.id },
    },
    related_links: {
      id: "related_links",
      header: {
        heading: cNfl.name,
        subHeading: "More to explore",
        logo: cNfl.dp,
        communitySlug: cNfl.slug,
      },
      source: { feedType: "HOME", communityId: cNfl.id },
      items: contextualLinks(pageIndex),
    },
    latest_interviews: {
      id: "latest_interviews",
      header: {
        heading: gArtistInterviews.name,
        subHeading: "Featured Stories",
        logo: gArtistInterviews.dp,
        communitySlug: gArtistInterviews.communitySlug,
        groupSlug: gArtistInterviews.slug,
      },
      source: { feedType: "HOME", communityId: gArtistInterviews.communityId, groupId: gArtistInterviews.groupId },
      articles,
    },
    top_categories: {
      id: "top_categories",
      header: {
        heading: cArtistRadio.name,
        subHeading: "Music, news and culture",
        logo: cArtistRadio.dp,
        communitySlug: cArtistRadio.slug,
      },
      source: { feedType: "HOME", communityId: cArtistRadio.id },
      ctaText: "Read More",
    },
    tmobile: {
      id: pageIndex === 0 ? "tmobile" : `sponsor-${sponsor.id}-p${pageIndex + 1}`,
      header: {
        heading: sponsor.heading,
        subHeading: sponsor.subHeading,
        logo: sponsor.logo,
        brandSlug: sponsor.brandSlug,
      },
      sponsored: true,
      ctaText: sponsor.ctaText,
    },
    relevant_news: {
      id: "relevant_news",
      header: {
        heading: cNfl.name,
        subHeading: "More Coverage",
        logo: cNfl.dp,
        communitySlug: cNfl.slug,
      },
      source: { feedType: "HOME", communityId: cNfl.id },
      featuredArticle: articleData(pageIndex + 2),
      upNextArticles: upNext,
    },
  };
}

function cursorForIndex(index: number): string {
  return Buffer.from(`iheart-3938:${index}`, "utf8").toString("base64url");
}

function indexForCursor(cursor: string | null): number {
  if (!cursor) return 0;
  try {
    const value = Buffer.from(cursor, "base64url").toString("utf8");
    const index = Number(value.split(":").at(-1));
    return Number.isFinite(index) && index >= 0 ? index : 0;
  } catch {
    return 0;
  }
}

export function getHomeFeedPage(cursor: string | null): HomeDataPage {
  const pageIndex = indexForCursor(cursor);
  return {
    metadata: { page: "home", schemaVersion: 1, pageSession: "iheart-3938", pageIndex },
    pagination: { cursor, nextCursor: cursorForIndex(pageIndex + 1), endOfFeed: false },
    data: baseData(pageIndex),
    layout: getHomeLayoutForPage(pageIndex),
  };
}
