import type { GroupUserStatusType } from "@genuin/components/types/roles";
import type { CommunityInfoType } from "../../organisms/community-card/community-card.types";

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
  description: string;
  banner: string;
};

export type ArticleGroup = {
  id: string;
  name: string;
  slug: string;
  description: string;
  isSubscribed: boolean;
  isPrivate: boolean;
  role: GroupUserStatusType;
  shareUrl: string;
  stats: { members: number; posts: number; views: number };
};

export const ARTICLE_COMMUNITIES = {
  festival: {
    id: "29bee151-fa36-47c5-9919-612291cc1531",
    name: "iHeartRadio Music Festival",
    slug: "iheartradio-music-festival",
    handle: "iheartradio-music-6ed8ab",
    profileImage:
      "https://media.qa.begenuin.com/uploads/profile_images/community/194bdd15-d169-4289-861f-1876a6b5f366_1790000469537.png",
    isPrivate: false,
    shareUrl: "https://qa.begenuin.com/community/iheartradio-music-festival",
    userRole: "UNJOINED",
    membersCount: 1,
    groupsCount: 1,
    postsCount: 20,
    description: "The official community for the iHeartRadio Music Festival.",
    banner:
      "https://media.qa.begenuin.com/uploads/community/banner/cb4a1431-61e9-46f5-8f36-60fb0b689e5a_1789997419244.png",
  },
  artistRadioStations: {
    id: "5db6106b-f6f3-4f4d-a2f9-b0ef369fda61",
    name: "Artist Radio Stations",
    slug: "artist-radio-stations",
    handle: "artist-radio-stat-66061c",
    profileImage:
      "https://media.qa.begenuin.com/uploads/profile_images/community/b490cfc4-2f72-458d-a436-d8636ce67bca_1789997406886.png",
    isPrivate: false,
    shareUrl: "https://qa.begenuin.com/community/artist-radio-stations",
    userRole: "UNJOINED",
    membersCount: 1,
    groupsCount: 1,
    postsCount: 20,
    description: "Explore artist-curated radio stations, exclusive interviews, and tracks.",
    banner:
      "https://media.qa.begenuin.com/uploads/community/banner/992b9b1d-e0b1-469d-9047-c4495b32f1ae_1789997407151.png",
  },
  sportsRadio: {
    id: "2b552203-cb4e-4414-b3ab-0e0a1b7f0cbe",
    name: "Sports Radio",
    slug: "sports-radio",
    handle: "sports-radio-7e6f35",
    profileImage:
      "https://media.qa.begenuin.com/uploads/profile_images/community/647e5676-0f52-4a9f-9428-c3c6154f14d1_1789997419187.png",
    isPrivate: false,
    shareUrl: "https://qa.begenuin.com/community/sports-radio",
    userRole: "UNJOINED",
    membersCount: 1,
    groupsCount: 1,
    postsCount: 20,
    description: "The home of live sports talk, game coverage, and sports commentary.",
    banner:
      "https://media.qa.begenuin.com/uploads/community/banner/cb4a1431-61e9-46f5-8f36-60fb0b689e5a_1789997419244.png",
  },
  nfl: {
    id: "c810f318-483c-4fec-bd97-379f901c2ad2",
    name: "NFL",
    slug: "nfl",
    handle: "nfl-e16a48",
    profileImage:
      "https://media.qa.begenuin.com/uploads/profile_images/community/a843dd98-d9f6-40b8-98d9-1a5e06166e8f_1789997416942.png",
    isPrivate: false,
    shareUrl: "https://qa.begenuin.com/community/nfl",
    userRole: "UNJOINED",
    membersCount: 1,
    groupsCount: 1,
    postsCount: 20,
    description: "NFL game action, news, and analysis across the league.",
    banner:
      "https://media.qa.begenuin.com/uploads/community/banner/68f7541f-3949-42d3-9503-add165de6a22_1789997416971.png",
  },
  artistRadio: {
    id: "0b32c042-a27e-4c77-b36a-7c0f5064b551",
    name: "Artist Radio",
    slug: "artist-radio",
    handle: "artist-radio-0fa98a",
    profileImage:
      "https://media.qa.begenuin.com/uploads/profile_images/community/958aedc0-ef89-4af8-abf8-1998865d4ba0_1789997401054.png",
    isPrivate: false,
    shareUrl: "https://qa.begenuin.com/community/artist-radio",
    userRole: "UNJOINED",
    membersCount: 1,
    groupsCount: 1,
    postsCount: 20,
    description: "Featured artists, playlists, and behind-the-scenes music content.",
    banner:
      "https://media.qa.begenuin.com/uploads/community/banner/aa76aee6-ec91-4ff7-95e8-e35d5a69eea0_1789997401601.png",
  },
} satisfies Record<string, ArticleCommunity>;

export const ARTICLE_GROUPS = {
  festivalPerformances: {
    id: "3d6a9b91-b6c6-4982-996b-2db298904b71",
    name: "Festival Performances & Highlights",
    slug: "festival-performances-highlights",
    description: "Performances, backstage moments, and highlights from the iHeartRadio Music Festival.",
    isSubscribed: false,
    isPrivate: false,
    role: "UNJOINED",
    shareUrl:
      "https://qa.begenuin.com/group/festival-performances-highlights?community=29bee151-fa36-47c5-9919-612291cc1531",
    stats: { members: 1, posts: 20, views: 0 },
  },
  artistInterviews: {
    id: "5fd072b5-61c1-4972-b91f-109df50f34fb",
    name: "Artist Interviews & Performances",
    slug: "artist-interviews-performances",
    description: "Interviews, studio sessions, and live performances across artist stations.",
    isSubscribed: false,
    isPrivate: false,
    role: "UNJOINED",
    shareUrl:
      "https://qa.begenuin.com/group/artist-interviews-performances?community=5db6106b-f6f3-4f4d-a2f9-b0ef369fda61",
    stats: { members: 1, posts: 20, views: 0 },
  },
  sportsHighlights: {
    id: "15266401-fc39-44cd-a91b-a86a88a14756",
    name: "Sports Highlights & Talk",
    slug: "sports-highlights-talk",
    description: "Breaking sports coverage, talk shows, and game highlights.",
    isSubscribed: false,
    isPrivate: false,
    role: "UNJOINED",
    shareUrl:
      "https://qa.begenuin.com/group/sports-highlights-talk?community=2b552203-cb4e-4414-b3ab-0e0a1b7f0cbe",
    stats: { members: 1, posts: 20, views: 0 },
  },
} satisfies Record<string, ArticleGroup>;

type CommunityKey = keyof typeof ARTICLE_COMMUNITIES;
type GroupKey = keyof typeof ARTICLE_GROUPS;

const ARTICLE_ORIGIN_BY_SLUG: Record<string, [CommunityKey, GroupKey]> = {
  // Rock history & artist interviews
  "2020-09-18-why-september-19th-matters-in-rock-history": ["artistRadioStations", "artistInterviews"],
  "2020-09-18-why-september-20th-matters-in-rock-history": ["artistRadioStations", "artistInterviews"],
  "2026-09-19-cardi-b-confirms-shes-working-on-her-next-album-ahead-of-massive-tour": [
    "artistRadioStations",
    "artistInterviews",
  ],
  "2026-09-19-raven-symone-says-she-wants-to-find-out-what-bts-smells-like": [
    "artistRadioStations",
    "artistInterviews",
  ],
  "2026-09-19-watch-zara-larsson-reveals-who-shes-calling-after-midnight": [
    "artistRadioStations",
    "artistInterviews",
  ],
  "2026-09-20-benson-boone-reveals-why-he-recently-became-a-drake-fan": [
    "artistRadioStations",
    "artistInterviews",
  ],
  "2026-09-20-major-lazer-says-they-plan-to-shock-the-system-with-upcoming-album": [
    "artistRadioStations",
    "artistInterviews",
  ],

  // iHeartRadio Music Festival performances & highlights
  "2026-09-18-cardi-b-brings-the-drama-in-red-hot-set-at-the-2026-iheartradio-music-festival": [
    "festival",
    "festivalPerformances",
  ],
  "2026-09-18-inside-bts-iheartradio-music-festival-takeover-see-the-photos": [
    "festival",
    "festivalPerformances",
  ],
  "2026-09-18-see-the-photos-every-stunning-red-carpet-look-at-the-2026-iheartradio-music-festival": [
    "festival",
    "festivalPerformances",
  ],
  "2026-09-18-watch-bts-fans-emotional-reaction-after-being-surprised-with-front-row-tickets": [
    "festival",
    "festivalPerformances",
  ],
  "2026-09-18-watch-weezer-reveal-surprise-guest-during-nostalgic-vegas-arena-set": [
    "festival",
    "festivalPerformances",
  ],
  "2026-09-19-5-things-you-missed-from-night-1-of-the-2026-iheartradio-music-festival": [
    "festival",
    "festivalPerformances",
  ],
  "2026-09-19-5-things-you-missed-from-night-2-of-the-2026-iheartradio-music-festival": [
    "festival",
    "festivalPerformances",
  ],
  "2026-09-19-bts-fiery-set-at-the-2026-iheartradio-music-festival-was-the-ultimate-mic-drop": [
    "festival",
    "festivalPerformances",
  ],
  "2026-09-19-see-how-muse-illuminated-the-stage-during-electrifying-iheartradio-music-festival-set": [
    "festival",
    "festivalPerformances",
  ],
  "2026-09-19-snoop-dogg-teams-up-with-wiz-khalifa-to-surprise-iheartradio-music-festival-crowd": [
    "festival",
    "festivalPerformances",
  ],
  "2026-09-19-watch-benson-boones-jaw-dropping-signature-backflips-during-fiery-vegas-festival-performance": [
    "festival",
    "festivalPerformances",
  ],
  "2026-09-19-watch-goo-goo-dolls-lead-epic-iris-singalong-during-first-ever-iheartradio-music-festival-set": [
    "festival",
    "festivalPerformances",
  ],
  "2026-09-19-zara-larsson-brings-lucky-fan-on-stage-in-unforgettable-festival-moment": [
    "festival",
    "festivalPerformances",
  ],
  "2026-09-20-major-lazer-leave-it-all-on-the-stage-in-high-energy-festival-performance": [
    "festival",
    "festivalPerformances",
  ],
  "2026-09-20-pregnant-ciara-dances-all-night-long-in-energetic-festival-set-this-mama-gonna-stay-movin": [
    "festival",
    "festivalPerformances",
  ],
  "2026-09-20-smashing-pumpkins-give-preview-of-new-tour-with-mellon-collie-hits-at-vegas-festival": [
    "festival",
    "festivalPerformances",
  ],
  "2026-09-20-watch-lainey-wilson-honor-my-hero-late-legend-dolly-parton-on-stage-one-of-my-dearest-friends": [
    "festival",
    "festivalPerformances",
  ],

  // News, Sports, and Other
  "2026-09-19-trump-announces-plans-to-form-federal-ai-force": ["sportsRadio", "sportsHighlights"],
  "2026-09-19-trump-signs-russia-sanctions-bill": ["sportsRadio", "sportsHighlights"],
  "2026-09-20-cory-booker-says-trump-has-no-regard-for-1st-amendment": ["sportsRadio", "sportsHighlights"],
  "2026-09-20-ice-agent-shoots-man-in-austin": ["sportsRadio", "sportsHighlights"],
  "2026-09-20-poll-shows-trumps-approval-rating-hits-low-ahead-of-midterms": ["sportsRadio", "sportsHighlights"],
  "2026-09-20-trump-plans-military-complex-at-washingtons-triumphal-arch": ["sportsRadio", "sportsHighlights"],
  "2026-09-20-trump-to-meet-mamdani-prior-to-un-speech": ["sportsRadio", "sportsHighlights"],
};

export function getArticleOrigin(slug: string, kind?: string): { community: ArticleCommunity; group: ArticleGroup } {
  const entry = ARTICLE_ORIGIN_BY_SLUG[slug];
  if (entry) return { community: ARTICLE_COMMUNITIES[entry[0]], group: ARTICLE_GROUPS[entry[1]] };
  if (kind === "interview") return { community: ARTICLE_COMMUNITIES.artistRadioStations, group: ARTICLE_GROUPS.artistInterviews };
  if (kind === "event") return { community: ARTICLE_COMMUNITIES.festival, group: ARTICLE_GROUPS.festivalPerformances };
  return { community: ARTICLE_COMMUNITIES.festival, group: ARTICLE_GROUPS.festivalPerformances };
}

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
