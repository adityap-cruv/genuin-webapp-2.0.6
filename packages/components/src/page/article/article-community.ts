// Community / group attribution for on-domain article pages.
//
// Each article says which community + group it is attached to; the records below
// are the real ones from the publisher's brand (captured from
// `/api/v3/trending/categories_communities` and `/api/v3/community/loops`), so the
// ids, slugs and names match the backend and the cards/pills link to pages that
// actually exist.
//
// The payload shape is the feed API's (`PostDetailsType["community" | "group"]`),
// i.e. exactly what `<Pills />` already takes — plus the few extra fields the cards
// render. When the article API starts returning `community` / `group` itself, drop
// these constants and let that payload flow straight through; `Article.community`
// / `Article.group` already carry it.
//
// Server-safe (NO "use client"): only data + pure mappers live here.

import type { GroupUserStatusType } from "@genuin/components/types/roles";

import type { CommunityInfoType } from "../../organisms/community-card/community-card.types";

/**
 * Community as the feed API models it (`PostDetailsType["community"]`), plus the
 * two editorial fields `CommunityCard` renders and the pill doesn't.
 */
export type ArticleCommunity = {
  id: string;
  name: string;
  slug: string;
  handle: string;
  profileImage: string;
  isPrivate: boolean;
  shareUrl: string;
  userRole: "UNJOINED" | "MEMBER" | "MODERATOR" | "LEADER" | "REQUESTED";
  membersCount: number;
  groupsCount: number;
  postsCount: number;
  /** Card-only: blurb under the community name. */
  description: string;
  /** Card-only: banner image for the `explore` variant. */
  banner: string;
};

/**
 * Group as the feed API models it (`PostDetailsType["group"]`), plus the counters
 * `GroupCard` shows.
 */
export type ArticleGroup = {
  id: string;
  name: string;
  slug: string;
  description: string;
  isSubscribed: boolean;
  isPrivate: boolean;
  role: GroupUserStatusType;
  shareUrl: string;
  /** Card-only: the stat row under the group name. */
  stats: { members: number; posts: number; views: number };
};

function community(
  id: string,
  slug: string,
  handle: string,
  name: string,
  profileImage: string,
  banner: string,
  description: string,
  shareUrl: string
): ArticleCommunity {
  return {
    id,
    slug,
    handle,
    name,
    profileImage,
    description,
    banner,
    isPrivate: false,
    shareUrl,
    userRole: "UNJOINED",
    membersCount: 0,
    groupsCount: 0,
    postsCount: 0,
  };
}

function group(id: string, slug: string, name: string, description: string, shareUrl: string): ArticleGroup {
  return {
    id,
    slug,
    name,
    description,
    stats: { members: 0, posts: 0, views: 0 },
    isSubscribed: false,
    isPrivate: false,
    role: "UNJOINED",
    shareUrl,
  };
}

/** The publisher's communities, as they exist on the backend. */
export const ARTICLE_COMMUNITIES = {
  sailgp: community(
    "48ebbb76-3213-4faf-b626-0ade6ceb256f",
    "sailgp",
    "sailgptoken4229",
    "SailGP",
    "https://media.qa.begenuin.com/uploads/profile_images/community/m/8bedf23e-bb08-4b73-8341-8c468d503331_1789125335882.png",
    "https://media.qa.begenuin.com/uploads/community/banner/b82c86c5-40d5-4950-bc0f-417ba1c2c061_1788872959187.png",
    "SailGP racing, teams, events, technology and behind-the-scenes coverage from The Foil.",
    "https://testfoil.qa.begenuin.com/community/sailgp"
  ),
  americasCup: community(
    "dde76c1a-9adb-4347-a44f-eae4b3d622ab",
    "americas-cup",
    "americascup",
    "America's Cup",
    "https://media.qa.begenuin.com/uploads/profile_images/community/m/a4ad4c70-86bb-408c-ac1e-8931f05a7bb7_1789193246774.png",
    "https://media.qa.begenuin.com/uploads/community/banner/19544b7c-4c04-4b79-9fc6-2b98012dfb90_1788872944500.png",
    "Recurring site series with related articles, events, teams, or videos.",
    "https://testfoil.qa.begenuin.com/community/americas-cup"
  ),
  olympics: community(
    "90e35b26-32e0-4fa4-94fe-e0821f76948a",
    "olympics",
    "olympics",
    "Olympics",
    "https://media.qa.begenuin.com/uploads/profile_images/community/m/204af728-ce21-42d3-857a-5d45424e2c2a_1788872925782.png",
    "https://media.qa.begenuin.com/uploads/community/banner/eb180132-8637-4a6e-9038-ec7a9cb9ee95_1788872928699.png",
    "Recurring site series with related articles, events, teams, or videos.",
    "https://testfoil.qa.begenuin.com/community/olympics"
  ),
  otherSailing: community(
    "24f3f015-2e3f-4f23-9d1a-0a7097830485",
    "other-sailing",
    "othersailing",
    "Other Sailing",
    "https://media.qa.begenuin.com/uploads/profile_images/community/m/cf9f3113-ba50-4cbb-9136-c886c557b45c_1788872888575.png",
    "https://media.qa.begenuin.com/uploads/community/banner/4b6495cc-4dfb-4e65-8dee-2ccab9571970_1788872891689.png",
    "Recurring site series with related articles, events, teams, or videos.",
    "https://testfoil.qa.begenuin.com/community/other-sailing"
  ),
  classic600: community(
    "5e0a78dd-ff62-4c6a-a3cc-c6fc7dd36950",
    "classic-600-milers",
    "classic600milers",
    "Classic 600-Milers",
    "https://media.qa.begenuin.com/uploads/profile_images/community/m/83629217-b547-47e4-8215-bbdfbd3aa211_1788872874179.png",
    "https://media.qa.begenuin.com/uploads/community/banner/195b6990-4c6a-4a80-b126-3e7d1953609d_1788872877097.png",
    "Recurring site series with related articles, events, teams, or videos.",
    "https://testfoil.qa.begenuin.com/community/classic-600-milers"
  ),
  news: community(
    "e9fa5e09-ac10-4336-9c38-319aa575fd88",
    "news",
    "news",
    "News",
    "https://media.qa.begenuin.com/uploads/profile_images/community/m/7cf53151-e3c9-41cc-9b50-7538403dac10_1788872333712.png",
    "https://media.qa.begenuin.com/uploads/community/banner/7a92279d-8645-47f4-9098-8bc605bab99f_1788872340496.png",
    "Recurring site series with related articles, events, teams, or videos.",
    "https://testfoil.qa.begenuin.com/community/news"
  ),
  offshoreLegends: community(
    "97587b0d-21cf-4211-940f-1dfcdb86986c",
    "offshore-legends",
    "offshorelegendsenlargeme",
    "🌎 Offshore Legends",
    "https://media.qa.begenuin.com/uploads/profile_images/community/m/3068c079-c35d-4c1a-bbfa-b62f29bdce76_1788872969871.png",
    "https://media.qa.begenuin.com/uploads/community/banner/b91ddd08-6644-47c1-babc-cc1b3b1e5bc8_1788872972993.png",
    "⛵ Follow the toughest races on Earth and learn from elite offshore sailors. Objective: Connect fans and competitors around endurance sailing.",
    "https://testfoil.qa.begenuin.com/community/offshore-legends"
  ),
} satisfies Record<string, ArticleCommunity>;

/** The groups those communities own, as they exist on the backend. */
export const ARTICLE_GROUPS = {
  sailgpSeason6: group(
    "49c36846-ef58-4d20-a97e-139454f06d02",
    "season-6",
    "Season 6",
    "Recurring editorial topic within the SailGP community.",
    "https://testfoil.qa.begenuin.com/group/season-6?community=24029d3896000e6d"
  ),
  sailgpOpinion: group(
    "7a466186-a9c1-494c-9672-6c2062aecb62",
    "opinion-analysis",
    "Opinion / Analysis",
    "Recurring editorial topic within the Classic 600-Milers community.",
    "https://testfoil.qa.begenuin.com/group/opinion-analysis?community=24029d3896000e6d"
  ),
  sailgpInterviews: group(
    "deb61afa-5f76-4002-b28d-3878d56a2eb5",
    "interviews",
    "Interviews",
    "Recurring editorial topic suitable for a repeatable content stream.",
    "https://testfoil.qa.begenuin.com/group/interviews?community=24029d3896000e6d"
  ),
  sailgpPodcast: group(
    "54c158fd-38dc-4393-b7ea-661abffccc6a",
    "podcast-kccw",
    "Podcast",
    "Recurring editorial topic within the Round-the-World community.",
    "https://testfoil.qa.begenuin.com/group/podcast-kccw?community=24029d3896000e6d"
  ),
  cupMatchRacing: group(
    "12b81467-950d-45d2-a513-c097f69253c1",
    "match-racing",
    "Match Racing",
    "Recurring editorial topic within the America's Cup community.",
    "https://testfoil.qa.begenuin.com/group/match-racing?community=240d084c8e000e73"
  ),
  cupOpinion: group(
    "2c6cc49a-9824-4171-8f64-b7f752e05ae8",
    "opinion-analysis-0p1n",
    "Opinion / Analysis",
    "Recurring editorial topic within the America's Cup community.",
    "https://testfoil.qa.begenuin.com/group/opinion-analysis-0p1n?community=240d084c8e000e73"
  ),
  cupPodcast: group(
    "c7dd9482-32fa-4268-8d11-230ccdd4d5f4",
    "podcast",
    "Podcast",
    "Recurring editorial topic within the America's Cup community.",
    "https://testfoil.qa.begenuin.com/group/podcast?community=240d084c8e000e73"
  ),
  olympicsLa2028: group(
    "8a4ba163-de60-4c57-998c-d2d4a2e7324d",
    "la-2028",
    "LA 2028",
    "Recurring editorial topic within the Olympics community.",
    "https://testfoil.qa.begenuin.com/group/la-2028?community=240d085191000e75"
  ),
  olympicsInterviews: group(
    "64170d81-5d9a-4887-be42-433ce6930d44",
    "interviews-30rt",
    "Interviews",
    "Interviews channel in Olympics.",
    "https://testfoil.qa.begenuin.com/group/interviews-30rt?community=240d085191000e75"
  ),
  olympicsOpinion: group(
    "2c5e687c-cbb5-45ea-ad65-0ebf860c3c45",
    "opinion-analysis-k4co",
    "Opinion / Analysis",
    "Opinion / Analysis channel in Olympics.",
    "https://testfoil.qa.begenuin.com/group/opinion-analysis-k4co?community=240d085191000e75"
  ),
  otherSailingInterviews: group(
    "2f398e21-cfb4-405d-b4b8-9e9d70e3e1fc",
    "interviews-v6yd",
    "Interviews",
    "Recurring editorial topic within the Other Sailing community.",
    "https://testfoil.qa.begenuin.com/group/interviews-v6yd?community=240fdb989c000e78"
  ),
  classic600Videos: group(
    "6eca912a-eccc-4e2a-9609-687c54572d9f",
    "videos-h63b",
    "Videos",
    "Videos from the imported website.",
    "https://testfoil.qa.begenuin.com/group/videos-h63b?community=240fe3dd08000e79"
  ),
  newsInterviews: group(
    "07fe3739-ca7d-4b8e-a1e7-0fb2eda4a875",
    "interviews-4hu3",
    "Interviews",
    "Recurring editorial topic within the News community.",
    "https://testfoil.qa.begenuin.com/group/interviews-4hu3?community=243385b401800e89"
  ),
  offshoreCrashComebacks: group(
    "ef0c5da7-fc25-4543-a048-a07aca1ee477",
    "crash-comebacks",
    "⛵️ Crash Comebacks",
    "Discuss strategies for quick team recovery post-crash, aligning with Test Foil's objective.",
    "https://testfoil.qa.begenuin.com/group/crash-comebacks?community=2400cb264b000e6b"
  ),
} satisfies Record<string, ArticleGroup>;

type CommunityKey = keyof typeof ARTICLE_COMMUNITIES;
type GroupKey = keyof typeof ARTICLE_GROUPS;

/** What each article is attached to: `[community, group]`. */
const ARTICLE_ORIGIN_BY_SLUG: Record<string, [CommunityKey, GroupKey]> = {
  // Weekly round-ups.
  "the-week-in-racing-31-august-26": ["news", "newsInterviews"],
  "the-week-in-racing-24-august-26": ["news", "newsInterviews"],
  "the-week-in-racing-10-august-26": ["news", "newsInterviews"],

  // SailGP — reports.
  "flying-roos-hit-high-five-with-victory-in-sassnitz": ["sailgp", "sailgpSeason6"],
  "flying-roos-and-black-foils-lead-the-way-in-germany": ["sailgp", "sailgpSeason6"],
  "black-foils-dominate-practice-day-in-sassnitz": ["sailgp", "sailgpSeason6"],

  // SailGP — columns and analysis.
  "rate-the-fleet-andy-rice-on-sassnitz-sailgp": ["sailgp", "sailgpOpinion"],
  "freddie-carr-the-sailgp-teams-that-must-decide-to-stick-or-twist": ["sailgp", "sailgpOpinion"],
  "plans-uncovered-to-reinvent-sailgp-s-race-weekend-news-even-to-the-sailors": ["sailgp", "sailgpOpinion"],
  "andy-rice-rates-the-fleet-after-canada-sailgp": ["sailgp", "sailgpOpinion"],
  "rate-the-fleet-andy-rice-s-verdict-on-sailgp-new-york": ["sailgp", "sailgpOpinion"],
  "the-questions-that-remain-following-new-york-sailgp": ["sailgp", "sailgpOpinion"],

  // SailGP — the sailors.
  "the-real-story-behind-the-black-foils-new-sailgp-recruits": ["sailgp", "sailgpInterviews"],
  "the-safest-is-when-you-re-pushing-hard-billy-gooderham-explains-flight-control": ["sailgp", "sailgpInterviews"],

  // SailGP — season events.
  "emirates-dubai-sail-grand-prix-presented-by-dp-world": ["sailgp", "sailgpSeason6"],
  "france-sail-grand-prix-saint-tropez": ["sailgp", "sailgpSeason6"],
  "mubadala-abu-dhabi-sail-grand-prix-2026-season-grand-final-presented-by-abu-dhabi-sports-council": [
    "sailgp",
    "sailgpSeason6",
  ],
  "rockwool-germany-sail-grand-prix-sassnitz": ["sailgp", "sailgpSeason6"],
  "rolex-switzerland-sail-grand-prix-geneva": ["sailgp", "sailgpSeason6"],
  "spain-sail-grand-prix-valencia": ["sailgp", "sailgpSeason6"],

  // America's Cup.
  "luna-rossa-test-new-rudder-and-take-a-knock": ["americasCup", "cupMatchRacing"],
  "full-steam-ahead-and-scrambling-to-keep-our-heads-above-water-grant-simmer-on-australia-s-cup-comeback": [
    "americasCup",
    "cupOpinion",
  ],

  // Offshore and the classics.
  "the-ocean-race-atlantic": ["offshoreLegends", "offshoreCrashComebacks"],
  "how-pace-took-line-honours-in-the-2026-round-britain-and-ireland-race-one-chapter-at-a-time": [
    "offshoreLegends",
    "offshoreCrashComebacks",
  ],
  "freddie-carr-cowes-week-turns-200-why-britain-s-greatest-regatta-still-means-everything": [
    "classic600",
    "classic600Videos",
  ],

  // Olympic classes and one-designs.
  "andy-rice-a-good-worlds-for-gbr-and-a-good-worlds-for-the-470-class": ["olympics", "olympicsOpinion"],
  "rising-stars-nathan-berger-the-17-year-old-wingfoiler-beating-his-heroes": ["olympics", "olympicsInterviews"],
  "the-olympian-windsurfer-with-a-golden-future-far-beyond-la-2028": ["olympics", "olympicsLa2028"],
  "luca-rizzotti-bought-a-moth-in-2007-and-accidentally-started-a-movement": ["otherSailing", "otherSailingInterviews"],

  // Podcast episodes.
  "podcast-america-s-cup-is-back-the-full-cagliari-debrief": ["americasCup", "cupPodcast"],
  "podcast-can-anyone-beat-new-zealand-to-win-the-38th-america-s-cup": ["americasCup", "cupPodcast"],
  "podcast-extra-mozzy-and-freddie-preview-the-ac38-cagliari-prelim": ["americasCup", "cupPodcast"],
  "podcast-it-starts-with-a-dream-glenn-ashby-on-australia-s-ac38-challenge-the-foil-podcast-ep-20": [
    "americasCup",
    "cupPodcast",
  ],
  "podcast-sailgp-vs-america-s-cup-can-they-coexist": ["americasCup", "cupPodcast"],
  "podcast-the-six-american-sailors-chosen-to-take-back-the-cup": ["americasCup", "cupPodcast"],
  "podcast-ep-8-sydney-sailgp-preview-and-quentin-delapierre-on-safety": ["sailgp", "sailgpPodcast"],
};

/**
 * The community + group an article is attached to. Falls back by kind, so an
 * article added to the snapshot later is still attributed to a real community.
 */
export function getArticleOrigin(slug: string, kind?: string): { community: ArticleCommunity; group: ArticleGroup } {
  const entry = ARTICLE_ORIGIN_BY_SLUG[slug];
  if (entry) return { community: ARTICLE_COMMUNITIES[entry[0]], group: ARTICLE_GROUPS[entry[1]] };
  if (kind === "podcast") return { community: ARTICLE_COMMUNITIES.americasCup, group: ARTICLE_GROUPS.cupPodcast };
  if (kind === "event") return { community: ARTICLE_COMMUNITIES.sailgp, group: ARTICLE_GROUPS.sailgpSeason6 };
  return { community: ARTICLE_COMMUNITIES.news, group: ARTICLE_GROUPS.newsInterviews };
}

/** Map the article's community onto the shape `<CommunityCard />` expects. */
export function toCommunityCardInfo(community: ArticleCommunity): CommunityInfoType {
  return {
    id: community.id,
    name: community.name,
    dp: community.profileImage,
    banner: community.banner,
    description: community.description,
    handle: community.handle,
    slug: community.slug,
    stats: {
      members: community.membersCount,
      groups: community.groupsCount,
      posts: community.postsCount,
    },
    type: community.isPrivate ? "PRIVATE" : "PUBLIC",
  };
}

/** Map the article's group onto the props `<GroupCard />` expects. */
export function toGroupCardProps(group: ArticleGroup, community: ArticleCommunity) {
  return {
    owner: {
      userName: community.handle,
      url: `/community/${community.slug}`,
    },
    group: {
      chat_id: group.id,
      name: group.name,
      isPrivate: group.isPrivate,
      url: group.shareUrl,
      slug: group.slug,
      description: group.description,
      role: group.role,
      stats: group.stats,
    },
  };
}
