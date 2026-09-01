// Article data + accessors for the on-domain /article/<slug> pages.
//
// Server-safe (NO "use client"): the route (server component) and home.tsx both import
// from here. The content is an auto-generated snapshot from thefoil.com; getArticleBySlug
// is the single seam to later swap the static snapshot for the real publisher DB.

/**
 * Data model for on-domain article pages.
 *
 * The home page's editorial links (Intelligence "Latest News" / "Relevant News",
 * "Latest Interviews", the podcast wheel, and the Upcoming Races event cards) used
 * to open thefoil.com in a new tab. They now point at `/article/<slug>`, which
 * renders the article's content on our own domain from {@link Article} records.
 *
 * The content currently lives in a static snapshot (`article-content.ts`), read
 * through {@link getArticleBySlug}. That accessor is the single seam to later back
 * these pages with the real publisher DB/API without touching any component.
 */

/** A single block of an article's body, rendered in order. */
export type ArticleBlock =
  | { type: "heading"; text: string }
  | { type: "paragraph"; text: string }
  | { type: "image"; src: string; alt?: string; caption?: string };

/** What kind of editorial content an article represents (drives the header label). */
export type ArticleKind = "news" | "interview" | "podcast" | "event";

/** Where an article was sourced from (attribution back to the original). */
export type ArticleSource = {
  /** Human-readable publisher name, e.g. "The Foil". */
  name: string;
  /** The original canonical URL the content was snapshotted from. */
  url: string;
};

/** A publisher article rendered on our own domain. */
export type Article = {
  /**
   * URL slug — the last path segment of the source article. Doubles as the
   * `/article/<slug>` route param, so it must be unique and URL-safe.
   */
  slug: string;
  kind: ArticleKind;
  title: string;
  /** Dek / standfirst shown under the headline (optional). */
  standfirst?: string;
  /** Byline (name + role) as displayed on the source (optional). */
  author?: string;
  /** Publish date, as displayed on the source (optional). */
  publishedAt?: string;
  heroImage: { src: string; alt: string };
  /** Ordered body content. */
  body: ArticleBlock[];
  /** Event-only: the date range shown in the event header. */
  eventDate?: string;
  /** Event-only: the venue / city shown in the event header. */
  location?: string;
  source: ArticleSource;
};

/** Slug → article lookup, the shape of the static snapshot in `article-content.ts`. */
export type ArticleContentMap = Record<string, Article>;

// AUTO-GENERATED editorial snapshot — do not hand-edit.
//
// Content captured from thefoil.com for the home page's on-domain article pages.
// Keyed by slug and read through `getArticleBySlug` (see get-article.ts); replace
// this map with a DB/API fetch when the real content store is available.

export const ARTICLE_CONTENT: ArticleContentMap = {
  "the-week-in-racing-31-august-26": {
    slug: "the-week-in-racing-31-august-26",
    kind: "news",
    title: "The week in racing - 31 August ‘26",
    standfirst:
      "A first Hungarian ILCA 7 world title, a reshaped 52 Super Series fight and a fast Atlantic crossing headline the week in sailing.",
    author: "Benedict Donovan, Deputy Editor",
    publishedAt: "31st August 2026 8:09pm",
    heroImage: {
      src: "https://thefoil.com/media/mEob3-vvRywjK5WGiYDMwmaHASqp4I5G721zCToGbHI/resize:fill-down:1200:630/g:ce/quality:60/dpr:1/2026/08/ilca-mens-medal-race76900-jordan-roberts-down-under-sail.jpg",
      alt: "ILCA 7 fleet racing in Dublin Bay",
    },
    body: [
      {
        type: "heading",
        text: "Vadnai makes Hungarian sailing history",
      },
      {
        type: "paragraph",
        text: "Jonatán Vadnai became Hungary's first ILCA 7 world champion in Dún Laoghaire. A 4-1 final-day score lifted him to the title on 47 points and delivered his country's first medal of any colour in the class.",
      },
      {
        type: "heading",
        text: "The 52 Super Series tightens in Lanzarote",
      },
      {
        type: "paragraph",
        text: "The Royal Cup shifted the championship picture before the final regatta. Changing breeze and close TP52 racing kept the leading crews under pressure and ensured the season would remain open into its last stop.",
      },
      {
        type: "heading",
        text: "A transatlantic sprint begins",
      },
      {
        type: "paragraph",
        text: "The Ocean Race Atlantic starts from New York on 1 September, sending six mixed-gender IMOCA crews on a 3,300-nautical-mile course to Lorient. New-generation boats from DMG MORI and Team Malizia add an immediate design contest to the race.",
      },
      {
        type: "paragraph",
        text: "The week ahead also brings the Maxi Yacht Rolex Cup in Porto Cervo, the J/70 World Championship in Cascais and the iQFOiL World Championship in Weymouth.",
      },
    ],
    source: {
      name: "The Foil",
      url: "https://thefoil.com/news/the-week-in-racing-31-august-26/",
    },
  },
  "rate-the-fleet-andy-rice-on-sassnitz-sailgp": {
    slug: "rate-the-fleet-andy-rice-on-sassnitz-sailgp",
    kind: "news",
    title: "Rate the fleet: Andy Rice on Sassnitz SailGP",
    standfirst:
      "Andy Rice assesses a Germany Sail Grand Prix shaped by split-fleet imbalance, extreme speed and difficult tactical conditions.",
    author: "Andy Rice, Senior Contributor",
    publishedAt: "27th August 2026 2:41pm",
    heroImage: {
      src: "https://thefoil.com/media/gMKzLo51XG0f-bdYGtYcg5tK2rAaq94rI6wy0sm5D3M/resize:fill-down:1200:630/g:ce/quality:60/dpr:1/2026/08/rp3-3823.jpg",
      alt: "SailGP fleet racing at Sassnitz",
    },
    body: [
      {
        type: "heading",
        text: "Canada lead Rice's order",
      },
      {
        type: "paragraph",
        text: "NorthStar Canada top the assessment after qualifying from the more competitive group and recovering repeatedly in patchy breeze. A difficult final start cost them the win, but second place confirmed a team moving in the right direction.",
      },
      {
        type: "heading",
        text: "Australia turn resilience into victory",
      },
      {
        type: "paragraph",
        text: "The Flying Roos combined consistently strong starts with stable high-speed handling. After setbacks in the fleet races, Tom Slingsby's crew controlled the final and collected their fifth event victory of the season.",
      },
      {
        type: "heading",
        text: "New Zealand and France show their pace",
      },
      {
        type: "paragraph",
        text: "The Black Foils dominated Group A before finishing fourth in the final, while France set a new SailGP speed record of 107.63km/h. Spain completed the podium despite an unusually uneven weekend.",
      },
      {
        type: "paragraph",
        text: "Rice's wider rankings reward teams that handled the hardest group and the unstable conditions rather than simply following the final event order.",
      },
    ],
    source: {
      name: "The Foil",
      url: "https://thefoil.com/news/rate-the-fleet-andy-rice-on-sassnitz-sailgp/",
    },
  },
  "luna-rossa-test-new-rudder-and-take-a-knock": {
    slug: "luna-rossa-test-new-rudder-and-take-a-knock",
    kind: "news",
    title: "Luna Rossa test new rudder – and take a knock",
    standfirst:
      "A revised rudder gave Luna Rossa useful data in Cagliari before an afternoon loss of control exposed the limits of the new configuration.",
    author: "Benedict Donovan, Deputy Editor",
    publishedAt: "27th August 2026 11:10am",
    heroImage: {
      src: "https://thefoil.com/media/HLzTMMiNRo7BBMxBRINZ4GDsNvtbw_N44jsl-aufD-I/resize:fill-down:1200:630/g:ce/quality:60/dpr:1/2026/08/260826-lr-b3-d20-207.jpg",
      alt: "Luna Rossa testing its AC75 off Cagliari",
    },
    body: [
      {
        type: "heading",
        text: "A new blade goes on trial",
      },
      {
        type: "paragraph",
        text: "Luna Rossa returned to the water after a two-week break with a reshaped rudder carrying more area near the top and less lower down. The team used a light morning session off Cagliari to work through the first checks.",
      },
      {
        type: "heading",
        text: "The afternoon exposes the limit",
      },
      {
        type: "paragraph",
        text: "As the crew increased the load through fast bear-aways and gybes, the rudder ventilated and stalled. Flight controller Vittorio Bissaro described a brief loss of steering and yaw control before the boat was brought back under command.",
      },
      {
        type: "paragraph",
        text: "The incident interrupted the session but also supplied the engineering team with clear information about the working range of the revised blade as the AC75 programme builds towards its next competitive test.",
      },
    ],
    source: {
      name: "The Foil",
      url: "https://thefoil.com/news/luna-rossa-test-new-rudder-and-take-a-knock/",
    },
  },
  "freddie-carr-the-sailgp-teams-that-must-decide-to-stick-or-twist": {
    slug: "freddie-carr-the-sailgp-teams-that-must-decide-to-stick-or-twist",
    kind: "news",
    title: "Freddie Carr: The SailGP teams that must decide to stick or twist",
    standfirst:
      "With Season 6 entering its decisive phase, SailGP teams must choose between roster changes and giving existing combinations more time.",
    author: "Freddie Carr, Senior Contributor",
    publishedAt: "25th August 2026 6:00pm",
    heroImage: {
      src: "https://thefoil.com/media/Nke01VR-k1qZL82Rwri60kjT7jiawrqQiiHUclRRRr0/resize:fill-down:1200:630/g:ce/quality:60/dpr:1/2026/08/fd2-2946.jpg",
      alt: "SailGP crews competing at Sassnitz",
    },
    body: [
      {
        type: "heading",
        text: "One move can reshape a fleet",
      },
      {
        type: "paragraph",
        text: "Carr uses Iain Jensen's move to the Flying Roos as the clearest example of a transfer improving an already strong programme. Australia have won five of the first nine events and look more complete across the boat.",
      },
      {
        type: "heading",
        text: "A professional transfer market emerges",
      },
      {
        type: "paragraph",
        text: "SailGP's athlete framework is giving teams more control over recruitment and retention. Small, long-term squads mean that a single signing, reserve promotion or role change can have an outsized effect.",
      },
      {
        type: "heading",
        text: "Change is not the only answer",
      },
      {
        type: "paragraph",
        text: "The improved United States team shows the value of keeping faith with a roster, while Rockwool Racing are pursuing more foiling time together. Other teams may look towards emerging America's Cup talent as they plan for Season 7.",
      },
      {
        type: "paragraph",
        text: "For the lower half of the standings, the decision is broader than replacing athletes: coaching, preparation, role allocation and time on the water may be equally important.",
      },
    ],
    source: {
      name: "The Foil",
      url: "https://thefoil.com/news/freddie-carr-the-sailgp-teams-that-must-decide-to-stick-or-twist/",
    },
  },
  "the-week-in-racing-24-august-26": {
    slug: "the-week-in-racing-24-august-26",
    kind: "news",
    title: "The week in racing - 24 August ‘26",
    standfirst:
      "A SailGP speed record, an America's Cup legal dispute and two new youth world champions lead the weekly racing review.",
    author: "Benedict Donovan, Deputy Editor",
    publishedAt: "24th August 2026 7:33pm",
    heroImage: {
      src: "https://thefoil.com/media/fyOQZBfU_g5YeedI347I43cwARP09ukJ1dRDdN3XF0I/resize:fill-down:850:500/gravity:fp:0.3595744681:0.3743615093/quality:60/dpr:1/2026/08/138a2341-peter-brogger-ilca.jpg",
      alt: "ILCA racing photographed by Peter Brøgger",
    },
    body: [
      {
        type: "heading",
        text: "Sassnitz delivers two extremes",
      },
      {
        type: "paragraph",
        text: "France reached 107.63km/h to set a new SailGP speed record, while Australia's Flying Roos later won a final that slowed dramatically as the breeze faded. It was their fifth event victory of the season.",
      },
      {
        type: "heading",
        text: "The America's Cup dispute continues",
      },
      {
        type: "paragraph",
        text: "New filings added detail to the disagreement between Athena Racing and Ineos over the British campaign's AC75 and other assets. The case remained unresolved as the America's Cup marked its 175th anniversary.",
      },
      {
        type: "heading",
        text: "Youth titles decided in Aarhus",
      },
      {
        type: "paragraph",
        text: "Erik Scheidt won the men's ILCA 6 Youth Worlds with a race to spare. Hermionie Ghicas overturned a one-point deficit by winning all three final-day races to claim the women's title.",
      },
      {
        type: "paragraph",
        text: "The preview section turns towards the 52 Super Series in Lanzarote, the ILCA 7 Men's Worlds in Dublin Bay and the Star European Championship in Medemblik.",
      },
    ],
    source: {
      name: "The Foil",
      url: "https://thefoil.com/news/the-week-in-racing-24-august-26/",
    },
  },
  "flying-roos-hit-high-five-with-victory-in-sassnitz": {
    slug: "flying-roos-hit-high-five-with-victory-in-sassnitz",
    kind: "news",
    title: "Flying Roos hit high five with victory in Sassnitz",
    standfirst:
      "Australia mastered a weather-disrupted final to claim a fifth SailGP event win and extend their championship advantage.",
    author: "Benedict Donovan, Deputy Editor",
    publishedAt: "23rd August 2026 2:40pm",
    heroImage: {
      src: "https://thefoil.com/media/BdlC5UIxTylK26eNkVoAfU388-gOxuqKz8CSsX-Y6Nk/resize:fill-down:690:388/gravity:fp:0.4787472036:0.6386820846/quality:60/dpr:1/2026/08/jl206387.jpg",
      alt: "The Flying Roos racing at the Germany Sail Grand Prix",
    },
    body: [
      {
        type: "heading",
        text: "Squalls scramble the fleet",
      },
      {
        type: "paragraph",
        text: "Patchy rain and large changes in pressure turned Sunday's fleet races into a test of keeping the F50s foiling. Germany and Canada made decisive gains while several leading crews were caught in low-speed patches.",
      },
      {
        type: "heading",
        text: "Four teams reach the final",
      },
      {
        type: "paragraph",
        text: "Canada and Australia qualified from Group B, with New Zealand and Spain advancing from Group A. France missed out despite having set the weekend's outright speed record.",
      },
      {
        type: "heading",
        text: "Australia escape early",
      },
      {
        type: "paragraph",
        text: "NorthStar's early approach compressed the chasing boats and gave Tom Slingsby a clear route from the start. Australia stayed in flight and established a lead that survived even as the wind disappeared near the finish.",
      },
      {
        type: "paragraph",
        text: "Canada drifted through for second ahead of Spain and New Zealand. The result moved the Flying Roos to 76 championship points, 14 clear of Los Gallos.",
      },
    ],
    source: {
      name: "The Foil",
      url: "https://thefoil.com/news/flying-roos-hit-high-five-with-victory-in-sassnitz/",
    },
  },
  "flying-roos-and-black-foils-lead-the-way-in-germany": {
    slug: "flying-roos-and-black-foils-lead-the-way-in-germany",
    kind: "news",
    title: "Flying Roos and Black Foils lead the way in Germany",
    standfirst:
      "Australia and New Zealand topped their groups after a high-speed first day at Sassnitz, where France set a new league record.",
    author: "Benedict Donovan, Deputy Editor",
    publishedAt: "22nd August 2026 2:37pm",
    heroImage: {
      src: "https://thefoil.com/media/NNb4DtCTPtZShEt-6LdvgHQTi8SPkbNtcR99cIawY40/resize:fill-down:690:388/gravity:fp:0.758974359:0.8208106473/quality:60/dpr:1/2026/08/fd1-0713.jpg",
      alt: "SailGP racing on the opening day in Germany",
    },
    body: [
      {
        type: "heading",
        text: "Australia control Group B",
      },
      {
        type: "paragraph",
        text: "The Flying Roos opened with two wins before finishing sixth in the final race of the day. Their combination of starting accuracy and stable handling left them one point ahead of a consistent Artemis Sweden.",
      },
      {
        type: "heading",
        text: "The Black Foils return to the front",
      },
      {
        type: "paragraph",
        text: "New Zealand won the first Group A race and backed it up with second and fourth places. France and Spain shared the other wins, keeping qualification open for the second day.",
      },
      {
        type: "heading",
        text: "France reset the speed record",
      },
      {
        type: "paragraph",
        text: "DS Team France recorded 107.63km/h in the third Group A race. The mark surpassed the previous SailGP record and capped a day run with the smaller 18-metre wings in winds above 20 knots.",
      },
    ],
    source: {
      name: "The Foil",
      url: "https://thefoil.com/news/flying-roos-and-black-foils-lead-the-way-in-germany/",
    },
  },
  "black-foils-dominate-practice-day-in-sassnitz": {
    slug: "black-foils-dominate-practice-day-in-sassnitz",
    kind: "news",
    title: "Black Foils dominate practice day in Sassnitz",
    standfirst:
      "New Zealand set the practice benchmark in marginal foiling conditions before the Germany Sail Grand Prix.",
    author: "Andy Rice, Senior Contributor",
    publishedAt: "21st August 2026 6:30pm",
    heroImage: {
      src: "https://thefoil.com/media/sfEU1EC1ADnEWMSxAFjCV90hscMHSO0NrwQVvnxZrPY/resize:fill-down:690:388/gravity:fp:0.6787096774:0.5812742086/quality:60/dpr:1/2026/08/260821-sailgp-sassnitz-the-foil-ls1-3878.jpg",
      alt: "Black Foils practising off Sassnitz",
    },
    body: [
      {
        type: "heading",
        text: "New Zealand set the early standard",
      },
      {
        type: "paragraph",
        text: "Pete Burling's crew recorded 1-1-2 in the three Group A practice races. Their strongest recovery came after rounding the first mark in fifth and maintaining flight better than the boats ahead.",
      },
      {
        type: "heading",
        text: "Group B ends level",
      },
      {
        type: "paragraph",
        text: "Australia and Artemis Sweden both finished practice on seven points. Nathan Outteridge's decisive start in the second race showed how quickly a short-lived opening could alter the order.",
      },
      {
        type: "paragraph",
        text: "The practice session used the 24-metre rig in marginal breeze, while stronger weekend conditions were expected to bring the smaller 18-metre wing into play.",
      },
    ],
    source: {
      name: "The Foil",
      url: "https://thefoil.com/news/black-foils-dominate-practice-day-in-sassnitz/",
    },
  },
  "plans-uncovered-to-reinvent-sailgp-s-race-weekend-news-even-to-the-sailors": {
    slug: "plans-uncovered-to-reinvent-sailgp-s-race-weekend-news-even-to-the-sailors",
    kind: "news",
    title: "Plans uncovered to reinvent SailGP's race weekend – news even to the sailors",
    standfirst:
      "A short-lived fan survey revealed possible group draws, tiered racing and scoring changes for a future SailGP format.",
    author: "Benedict Donovan, Deputy Editor",
    publishedAt: "21st August 2026 11:41am",
    heroImage: {
      src: "https://thefoil.com/media/4VuyF-wFzDEjovsQXItmgj349qoEU1bP95n2xJbldIM/resize:fill-down:690:388/gravity:fp:0.5:0.5/quality:60/dpr:1/2026/08/jl108682-1.jpg",
      alt: "SailGP fleet racing under a proposed new weekend format",
    },
    body: [
      {
        type: "heading",
        text: "Three ways to form the groups",
      },
      {
        type: "paragraph",
        text: "The survey compared using previous event standings, a tiered random draw and a live drivers' draft. Each option attempts to balance competitive groups without making the weekend predictable.",
      },
      {
        type: "heading",
        text: "Tiered racing and a final qualifier",
      },
      {
        type: "paragraph",
        text: "One proposal would move the strongest boats into a Sunday Tier 1, place the remaining teams in Tier 2 and then combine them in a last-chance race for the final Grand Final position.",
      },
      {
        type: "heading",
        text: "Scoring and presentation could change too",
      },
      {
        type: "paragraph",
        text: "The ideas included larger rewards for race winners and clearer graphics, explainers and live standings for fans. The concepts appeared to target a possible 14-team 2027 season rather than the closing stages of Season 6.",
      },
    ],
    source: {
      name: "The Foil",
      url: "https://thefoil.com/news/plans-uncovered-to-reinvent-sailgp-s-race-weekend-news-even-to-the-sailors/",
    },
  },
  "andy-rice-a-good-worlds-for-gbr-and-a-good-worlds-for-the-470-class": {
    slug: "andy-rice-a-good-worlds-for-gbr-and-a-good-worlds-for-the-470-class",
    kind: "news",
    title: "Andy Rice: A good Worlds for GBR, and a good Worlds for the 470 Class",
    standfirst:
      "A record mixed-fleet entry, a British world title and a successful medal series strengthen the 470's Olympic case.",
    author: "Andy Rice, Senior Contributor",
    publishedAt: "19th August 2026 7:17pm",
    heroImage: {
      src: "https://thefoil.com/media/CxqVH27Gkk4cj5ZFmExBBvQ76uSmVy-6172HPyItfEE/resize:fill-down:690:388/gravity:fp:0.5010989011:0.3081960898/quality:60/dpr:1/2026/08/55457634027-d7ba2b7d10-o.jpg",
      alt: "Mixed 470 racing at the 2026 World Championship",
    },
    body: [
      {
        type: "heading",
        text: "An established class under review",
      },
      {
        type: "paragraph",
        text: "The 470 is the oldest class on the current Olympic sailing programme and faces scrutiny before Brisbane 2032. Rice argues that its tactical racing and ability to handle a wide range of conditions remain valuable.",
      },
      {
        type: "heading",
        text: "A strong turnout in Enoshima",
      },
      {
        type: "paragraph",
        text: "Seventy-four teams entered the Worlds, the largest fleet since the mixed format began. Light conditions limited the venue's range, but the size and depth of the entry supported the class's international case.",
      },
      {
        type: "heading",
        text: "Great Britain hold their nerve",
      },
      {
        type: "paragraph",
        text: "Martin Wrigley and Bettine Harris recovered from a difficult first medal race to win the next and secure their first world title. Germany took silver and Spain's defending champions finished with bronze.",
      },
      {
        type: "paragraph",
        text: "The event also demonstrated a more focused media approach and offered useful evidence as the class prepares to defend its place on the Olympic programme.",
      },
    ],
    source: {
      name: "The Foil",
      url: "https://thefoil.com/news/andy-rice-a-good-worlds-for-gbr-and-a-good-worlds-for-the-470-class/",
    },
  },
  "the-ocean-race-atlantic": {
    slug: "the-ocean-race-atlantic",
    kind: "event",
    title: "The Ocean Race Atlantic",
    standfirst:
      "Six mixed-gender IMOCA crews race 3,300 nautical miles from New York to Lorient in a direct transatlantic sprint.",
    eventDate: "1 September 2026",
    location: "New York to Lorient",
    heroImage: {
      src: "https://thefoil.com/media/0IFpwb4HJabWEJukldoszeTslP9-KwJiWsr1dItg4qM/resize:fill-down:460:240/gravity:fp:0.4787792084:0.701049749/quality:60/dpr:1/2026/08/tora1.webp",
      alt: "IMOCA racing in The Ocean Race Atlantic",
    },
    body: [
      {
        type: "heading",
        text: "A direct North Atlantic test",
      },
      {
        type: "paragraph",
        text: "The fleet leaves New York for a 3,300-nautical-mile passage to Lorient. Fast routing through the Gulf Stream could put the leading boats in France in little more than a week.",
      },
      {
        type: "heading",
        text: "New boats enter the race",
      },
      {
        type: "paragraph",
        text: "DMG MORI Global One and Team Malizia's latest IMOCA make their first competitive appearances. Their contrasting hull concepts add a design comparison to a fleet that also includes the reigning European champions.",
      },
      {
        type: "paragraph",
        text: "Every entry sails with two women, two men and an onboard reporter, combining sporting competition with continuous coverage from the Atlantic.",
      },
    ],
    source: {
      name: "The Foil",
      url: "https://thefoil.com/events/the-ocean-race-atlantic/",
    },
  },
  "rising-stars-nathan-berger-the-17-year-old-wingfoiler-beating-his-heroes": {
    slug: "rising-stars-nathan-berger-the-17-year-old-wingfoiler-beating-his-heroes",
    kind: "interview",
    title: "Rising Stars: Nathan Berger, the 17-year-old wingfoiler beating his heroes",
    standfirst:
      "The Tarifa-based teenager reached a World Tour final, launched his own board and is already challenging athletes he grew up watching.",
    author: "Benedict Donovan, Deputy Editor",
    publishedAt: "2nd May 2026 10:11am",
    heroImage: {
      src: "https://thefoil.com/media/6jqFsZkVz92e9pViFIC9cvcOgfOK1JayU4J0n2Ya0i8/resize:fill-down:690:388/gravity:fp:0.5757575758:0.4289940828/quality:60/dpr:1/2026/05/nathan-berger8.jpg",
      alt: "Wingfoiler Nathan Berger competing on the GWA World Tour",
    },
    body: [
      {
        type: "heading",
        text: "A breakthrough at 17",
      },
      {
        type: "paragraph",
        text: "Nathan Berger eliminated several leading riders, including the reigning world champion, on his way to the final at the GWA Wing Foil World Tour opener in Leucate. He finished fourth days before his seventeenth birthday.",
      },
      {
        type: "heading",
        text: "Learning in Tarifa",
      },
      {
        type: "paragraph",
        text: "Berger first tried wingfoiling with his father's equipment at 12 and learned through repeated crashes on the same afternoon. Training in Tarifa has since exposed him to a wide range of wind and water conditions.",
      },
      {
        type: "heading",
        text: "Designing equipment around freestyle",
      },
      {
        type: "paragraph",
        text: "A year of prototypes with KT Foiling produced a shorter, wider board designed around landing freestyle tricks cleanly. Berger balances that equipment work and competition with school, gym training and a strong focus on avoiding injury.",
      },
      {
        type: "paragraph",
        text: "He left the opening event fourth in the standings and headed to his home stop in Tarifa aiming to keep progressing towards the top of the world ranking.",
      },
    ],
    source: {
      name: "The Foil",
      url: "https://thefoil.com/news/rising-stars-nathan-berger-the-17-year-old-wingfoiler-beating-his-heroes/",
    },
  },
  "the-olympian-windsurfer-with-a-golden-future-far-beyond-la-2028": {
    slug: "the-olympian-windsurfer-with-a-golden-future-far-beyond-la-2028",
    kind: "interview",
    title: "The Olympian windsurfer with a golden future far beyond LA 2028",
    standfirst:
      "Olympic silver medallist Grae Morris is using wingfoil and downwind-foil racing to expand his skills on the road to Los Angeles and Brisbane.",
    author: "Andy Rice, Senior Contributor",
    publishedAt: "7th February 2026 7:35am",
    heroImage: {
      src: "https://thefoil.com/media/U8j6sq1yq50MNqneZqWV-fKQwvMWiJ23hK4IqlF_wBM/resize:fill-down:690:388/gravity:fp:0.5:0.5/quality:60/dpr:1/2026/02/grae-morris-2.jpeg",
      alt: "Australian Olympic windsurfer Grae Morris",
    },
    body: [
      {
        type: "heading",
        text: "An all-round approach to LA 2028",
      },
      {
        type: "paragraph",
        text: "Grae Morris won iQFOiL silver at Paris 2024 at the age of 20. Rather than narrowing his programme immediately, he has used wingfoil and SUP downwind events to learn new handling, tactical and mental skills.",
      },
      {
        type: "heading",
        text: "Choosing difficult situations",
      },
      {
        type: "paragraph",
        text: "Morris deliberately enters disciplines where he is not the favourite. A sixth place at his first Formula Wing World Championship showed how existing racecraft could compensate while his speed and board handling developed.",
      },
      {
        type: "heading",
        text: "SailGP remains a future target",
      },
      {
        type: "paragraph",
        text: "Time around the Flying Roos has given Morris a close look at F50 preparation and high-pressure racing. His immediate priorities remain Olympic gold in Los Angeles and a home Games in Brisbane before a possible move into SailGP.",
      },
      {
        type: "paragraph",
        text: "The sudden-death formats common to modern windsurfing have made pressure part of his routine, and he sees that experience as useful preparation for every stage of his career.",
      },
    ],
    source: {
      name: "The Foil",
      url: "https://thefoil.com/news/the-olympian-windsurfer-with-a-golden-future-far-beyond-la-2028/",
    },
  },
  "andy-rice-rates-the-fleet-after-canada-sailgp": {
    slug: "andy-rice-rates-the-fleet-after-canada-sailgp",
    kind: "news",
    title: "Andy Rice rates the fleet after Canada SailGP",
    author: "Andy Rice, Senior Contributor",
    publishedAt: "25th June 2026 5:32pm",
    heroImage: {
      src: "https://thefoil.com/media/EG0w0w5wHoBs8thBCM0yBrG4ARt9G7WeDVtpvDj8SvY/resize:fill-down:1500:500/gravity:fp:0.5127659574:0.5173727167/quality:60/dpr:1/2026/06/sv3-3959-samo-vidic-for-sailgp.jpg",
      alt: "Andy Rice rates the fleet after Canada SailGP",
    },
    body: [
      {
        type: "heading",
        text: "1. Spain",
      },
      {
        type: "paragraph",
        text: "Finished: 1st",
      },
      {
        type: "paragraph",
        text: 'Diego Botin executed what Rice describes as "the move of the season" during Race 3 in Group A, threading through a gap "to leeward of Australia and just ahead of France." Botin reportedly closed his eyes, hoping the daring manoeuvre would succeed. Spain\'s victory propels them to second overall in season standings, tied with Britain. Rice notes they "deserve" this win after facing considerable misfortune throughout the season.',
      },
      {
        type: "paragraph",
        text: 'Verdict: "The victory Spain has deserved all season"',
      },
      {
        type: "image",
        src: "https://thefoil.com/media/M3Z-3utI8SCDLsXx0ANfolIy36ZFiouomvIlVKQwznk/resize:fit:1200:800/gravity:ce/quality:60/dpr:1/2026/06/jl109215.jpg",
        alt: "Spain SailGP",
        caption: "JL109215",
      },
      {
        type: "heading",
        text: "2. Switzerland",
      },
      {
        type: "paragraph",
        text: "Finished: 3rd",
      },
      {
        type: "paragraph",
        text: "Sebastien Schneiter's team, now sponsored by Explora Journeys, demonstrated strong starting technique throughout the event. Switzerland secured their first podium finish and $140,000 in prize money after overtaking Australia before the finish line.",
      },
      {
        type: "paragraph",
        text: 'Verdict: "Schneiter has found a winning formula at the start and he won\'t tell us what it is"',
      },
      {
        type: "image",
        src: "https://thefoil.com/media/UnIBRZH_FUOpwLjEow4dWI2VrjtNao8rdZpamGmQTak/resize:fit:1200:800/gravity:ce/quality:60/dpr:1/2026/06/sv3-7170-samo-vidic-for-sailgp.jpg",
        alt: "Switzerland SailGP",
        caption: "SV3_7170 Samo Vidic for SailGP",
      },
      {
        type: "heading",
        text: "3. Sweden",
      },
      {
        type: "paragraph",
        text: "Finished: 2nd",
      },
      {
        type: "paragraph",
        text: 'Nathan Outteridge achieved his second podium finish of 2026 following third place in Rio. Rice suggests the time spent "cruising around the world with his young family" since co-helming Emirates Team New Zealand to America\'s Cup victory in October 2024 may explain the slower-than-expected championship form. Sweden excelled with consistent performances and strong manoeuvres.',
      },
      {
        type: "paragraph",
        text: 'Verdict: "Carry on like this and Sweden can still contend for the grand final in November"',
      },
      {
        type: "heading",
        text: "4. New Zealand",
      },
      {
        type: "paragraph",
        text: "Finished: 5th",
      },
      {
        type: "paragraph",
        text: "The Black Foils returned with a new boat and new grinder Stewart Dodson, replacing injured Louis Sinclair. Pete Burling's team demonstrated precision match-racing skills during the Group A battle, though they narrowly missed qualifying for the final against Spain and Denmark.",
      },
      {
        type: "paragraph",
        text: 'Verdict: "Black Foils are almost back to their best"',
      },
      {
        type: "image",
        src: "https://thefoil.com/media/F2fXj452IhNDTSO0twWXa6Dlg3kf1XuhV7_bLB3m3w/resize:fit:1200:800/gravity:ce/quality:60/dpr:1/2026/06/415800-jonathan-nackstrand-for-sailgp.jpg",
        alt: "New Zealand SailGP",
        caption: "415800 Jonathan Nackstrand for SailGP",
      },
      {
        type: "heading",
        text: "5. Australia",
      },
      {
        type: "paragraph",
        text: "Finished: 4th",
      },
      {
        type: "paragraph",
        text: 'Tom Slingsby\'s team won two races on the challenging Saturday but ultimately placed fourth. Rice observes they made "one small mistake" when Slingsby chose to pursue different wind conditions downwind rather than follow the leading boats, allowing Switzerland to claim third and the accompanying prize money.',
      },
      {
        type: "paragraph",
        text: 'Verdict: "One small mistake cost them a lot, but the Roos are still the benchmark"',
      },
      {
        type: "image",
        src: "https://thefoil.com/media/QJmtzEMeP6M9MEBvLGAzJQroNkHlL46iLQ3Lb9tnpeo/resize:fit:1200:800/gravity:ce/quality:60/dpr:1/2026/06/jl106596-jason-ludlow-for-sailgp.jpg",
        alt: "Australia SailGP",
        caption: "JL106596 Jason Ludlow for SailGP",
      },
      {
        type: "heading",
        text: "6. USA",
      },
      {
        type: "paragraph",
        text: "Finished: 6th",
      },
      {
        type: "paragraph",
        text: "Taylor Canfield's crew struggled with Saturday's marginal conditions, drifting into a wind hole while leading before recovering with strong performances on Sunday. Rice describes this as the team's second modest showing this season but maintains no serious concerns exist.",
      },
      {
        type: "paragraph",
        text: 'Verdict: "The second wobble of the season, but still nothing to worry about yet"',
      },
      {
        type: "image",
        src: "https://thefoil.com/media/2egZmokdIb8pleVFh5Rtes0c6LvjnI20A3pCSQjbru8/resize:fit:1200:800/gravity:ce/quality:60/dpr:1/2026/06/rp3-7516-ricardo-pinto.jpg",
        alt: "USA SailGP",
        caption: "RP3_7516 Ricardo Pinto",
      },
      {
        type: "heading",
        text: "7. Canada",
      },
      {
        type: "paragraph",
        text: "Finished: 8th",
      },
      {
        type: "paragraph",
        text: "Giles Scott's team performed well on Sunday in proper foiling conditions with two second-place finishes. Despite disappointing overall results, the home crowd showed enthusiastic support.",
      },
      {
        type: "paragraph",
        text: 'Verdict: "The result doesn\'t show it, but Canada are gradually returning to better form"',
      },
      {
        type: "image",
        src: "https://thefoil.com/media/o-6fjtxVnpoMDtdm0_m8lGRKQbNowtdKotd2XS5IzBo/resize:fit:1200:800/gravity:ce/quality:60/dpr:1/2026/06/185794-samo-vidic-for-sailgp.jpg",
        alt: "Canada SailGP",
        caption: "185794 Samo Vidic for SailGP",
      },
      {
        type: "heading",
        text: "9. France",
      },
      {
        type: "paragraph",
        text: "Finished: 10th",
      },
      {
        type: "paragraph",
        text: "Quentin Delapierre's DS Automobiles FRA team struggled in the competitive Group A. Rice cites mitigating factors including Manon Audinet's return to strategy following injury and new wing trimmer Moth World Champion Enzo Balanger's second appearance.",
      },
      {
        type: "paragraph",
        text: 'Verdict: "Sub-par performance despite the disruptions to France\'s season"',
      },
      {
        type: "image",
        src: "https://thefoil.com/media/R6MldlH9XyzUriNs0ajHSz06mSGBpDtuJuqTCvFcCVw/resize:fit:1200:800/gravity:ce/quality:60/dpr:1/2026/06/rp2-7769-1-ricardo-pinto.jpg",
        alt: "France SailGP",
        caption: "RP2_7769_1 Ricardo Pinto",
      },
      {
        type: "heading",
        text: "10. Great Britain",
      },
      {
        type: "paragraph",
        text: "Finished: 11th",
      },
      {
        type: "paragraph",
        text: "Emirates GBR experienced misfortune on Saturday when Dylan Fletcher drifted into a wind hole while competing for the lead. A high-speed crash on Sunday caused wingsail damage, preventing them from competing in favorable foiling conditions.",
      },
      {
        type: "paragraph",
        text: 'Verdict: "The British have lost their early-season momentum, but Portsmouth gives them all the motivation they need to get back on track"',
      },
      {
        type: "image",
        src: "https://thefoil.com/media/wClCAltPSbrQzTX9I5JpbO1cJoLVjrrQMcEtFWY8k00/resize:fit:1200:800/gravity:ce/quality:60/dpr:1/2026/06/jl206017-jason-ludlow.jpg",
        alt: "Great Britain SailGP",
        caption: "JL206017 Jason Ludlow",
      },
      {
        type: "heading",
        text: "11. Italy",
      },
      {
        type: "paragraph",
        text: "Finished: 9th",
      },
      {
        type: "paragraph",
        text: "Red Bull Italy's primary achievement involved third place in the final fleet race. Rice notes the team managed only to defeat Emirates GBR, who withdrew after equipment failure.",
      },
      {
        type: "paragraph",
        text: 'Verdict: "As per New York, yet to meet the expectations of team boss Jimmy Spithill"',
      },
      {
        type: "image",
        src: "https://thefoil.com/media/PQB5rlfqzja5D7YNX5_Luo2loc3g0cHT1rppLmKLQ5o/resize:fit:1200:800/gravity:ce/quality:60/dpr:1/2026/06/sv3-1748-samo-vidic-for-sailgp.jpg",
        alt: "Italy SailGP",
        caption: "SV3_1748 Samo Vidic for SailGP",
      },
      {
        type: "heading",
        text: "12. Brazil",
      },
      {
        type: "paragraph",
        text: "Finished: 13th",
      },
      {
        type: "paragraph",
        text: "The Brazilian team experimented with crew position swaps, moving Martine Grael into strategy and Paul Goodison to the helm. This adjustment produced modest improvements in pre-start positioning, though a leeward mark collision on Sunday hampered overall performance.",
      },
      {
        type: "paragraph",
        text: 'Verdict: "An experiment worth trying"',
      },
      {
        type: "image",
        src: "https://thefoil.com/media/TFB16qXhOXSSAsI0YCiecaW-qSxJDL17_Xjx1n8V38M/resize:fit:1200:800/gravity:ce/quality:60/dpr:1/2026/06/rp2-6742-ricardo-pinto-for-sailgp.jpg",
        alt: "Brazil SailGP",
        caption: "RP2_6742 Ricardo Pinto for SailGP",
      },
      {
        type: "heading",
        text: "13. Denmark",
      },
      {
        type: "paragraph",
        text: "Finished: 12th",
      },
      {
        type: "paragraph",
        text: "Rockwool Racing, acquired by American Magic, continues to underperform. Nicolai Sehested expresses frustration with the team's results and publicly dislikes split fleet formats. Denmark occasionally demonstrates independent decision-making but needs greater tactical engagement.",
      },
      {
        type: "paragraph",
        text: 'Verdict: "Not that far off the pace, but the Danes need to find some Viking spirit"',
      },
    ],
    source: {
      name: "The Foil",
      url: "https://thefoil.com/news/andy-rice-rates-the-fleet-after-canada-sailgp/",
    },
  },
  "freddie-carr-cowes-week-turns-200-why-britain-s-greatest-regatta-still-means-everything": {
    slug: "freddie-carr-cowes-week-turns-200-why-britain-s-greatest-regatta-still-means-everything",
    kind: "news",
    title: "Freddie Carr: Cowes Week turns 200 - why Britain's greatest regatta still means everything",
    author: "Freddie Carr, Senior Contributor",
    publishedAt: "28th July 2026 3:59pm",
    heroImage: {
      src: "https://thefoil.com/media/06WQCm_NgY6vhkG_Bhg5IKKbGvKrmNQHmRBoLe7fnCA/resize:fill-down:1500:500/gravity:fp:0.3212765957:0.4967784486/quality:60/dpr:1/2026/07/cowes-week-2018.jpg",
      alt: "Cowes Week turns 200",
    },
    body: [
      {
        type: "paragraph",
        text: "Cowes Week is Britain's regatta.",
      },
      {
        type: "paragraph",
        text: "If you're a British yacht sailor, it's the event you have to do at least once. It's our equivalent of Wimbledon or the Grand National. There are bigger regattas and there are faster boats, but none carry the same history, prestige or uniquely British atmosphere as Cowes Week.",
      },
      {
        type: "paragraph",
        text: "This year feels even more special. Racing has taken place off Cowes for 200 years, making it one of the oldest and most enduring sporting events anywhere in the world.",
      },
      {
        type: "paragraph",
        text: "It's also hard to believe that it's been 30 years since I first tried to compete at Cowes Week.",
      },
      {
        type: "paragraph",
        text: 'I was a 14-year-old Laser sailor desperate to get my first taste of yacht racing. My dad\'s advice was simple: "Go over to Cowes, walk the docks and ask people if they need crew. Someone will give you a ride."',
      },
      {
        type: "paragraph",
        text: "So that's exactly what I did.",
      },
      {
        type: "paragraph",
        text: "Armed with plenty of enthusiasm but very little experience, I spent the week wandering the pontoons asking anyone who would listen if they needed another pair of hands.",
      },
      {
        type: "paragraph",
        text: "I didn't get a single ride.",
      },
      {
        type: "paragraph",
        text: "By the middle of the week I'd accepted defeat and ended up selling ice creams from a local shop just to earn a bit of pocket money instead.",
      },
      {
        type: "paragraph",
        text: "Looking back, it wasn't the Cowes Week I'd imagined.",
      },
      {
        type: "paragraph",
        text: "But it left an enormous impression on me.",
      },
      {
        type: "paragraph",
        text: "Everywhere I looked there were incredible yachts, world-class sailors and larger-than-life characters. The town buzzed from first light until long after the racing had finished. It felt less like a regatta and more like a festival of sailing. To a 14-year-old kid, the crews walking the streets might as well have been rock stars.",
      },
      {
        type: "paragraph",
        text: "I remember standing on the dock looking at these amazing boats thinking, one day I want to sail on those boats. I want to be one of those guys.",
      },
      {
        type: "paragraph",
        text: "Thirty years later, that feeling hasn't changed. Cowes Week remains unlike any other regatta on the calendar. It is where history meets the present, where Olympic medallists, America's Cup sailors, weekend racers and first-time crews all share the same stretch of water. That is what makes this 200th edition so significant.",
      },
      {
        type: "image",
        src: "https://thefoil.com/media/q7WTloU8fi18yp-cov5qiEU9irc8jKOcokOOt6xwPt0/resize:fit:1200:800/gravity:ce/quality:60/dpr:1/2026/07/cowes10.png",
        alt: "Cowes Week 2025",
        caption: "Cowes Week 2025",
      },
      {
        type: "heading",
        text: "More than just another regatta",
      },
      {
        type: "paragraph",
        text: "Cowes Week has always been difficult to define because it is so much more than a race meeting.",
      },
      {
        type: "paragraph",
        text: "On any given day there are up to 40 races taking place simultaneously across the Solent, with fleets ranging from classic wooden keelboats that have been racing for generations to the latest high-performance handicap yachts. Around 750 boats and thousands of sailors descend on the Isle of Wight, making it one of the largest sailing regattas anywhere in the world.",
      },
      {
        type: "paragraph",
        text: "It is one of the few events where a professional America's Cup sailor can be lining up alongside someone competing in their very first regatta. That mix is what has always made Cowes Week special.",
      },
      {
        type: "image",
        src: "https://thefoil.com/media/GokpMC9sOXrADyl-egjwMMO8uyuCRwb245oFtJd6mjM/resize:fit:1200:800/gravity:ce/quality:60/dpr:1/2026/07/cowes3.png",
        alt: "Cowes Week 2025",
        caption: "Cowes Week 2025",
      },
      {
        type: "heading",
        text: "A week that belongs to every sailor",
      },
      {
        type: "paragraph",
        text: "Unlike many elite sailing events, Cowes Week remains remarkably accessible.",
      },
      {
        type: "paragraph",
        text: "Whether you race a J/70, a Dragon, an XOD, an IRC grand prix yacht or a family cruiser, there is likely to be a start line waiting for you. Every fleet has its own story, its own rivalries and its own heroes.",
      },
      {
        type: "paragraph",
        text: "For many owners and crews this is the biggest week of their season. For others it is simply an excuse to spend seven days racing hard before enjoying the unique atmosphere ashore.",
      },
      {
        type: "paragraph",
        text: "Few sporting events blend competition and social life as naturally as Cowes Week.",
      },
      {
        type: "image",
        src: "https://thefoil.com/media/7YOWvCsxKrCfMXunoWxeiDJQarznUjI86p5j0Nenkco/resize:fit:1200:800/gravity:ce/quality:60/dpr:1/2026/07/cowes-martyn-wright-2.jpg",
        alt: "Cowes Week racing",
        caption: "Martyn Wright",
      },
      {
        type: "heading",
        text: "The Solent never gives anything away",
      },
      {
        type: "paragraph",
        text: "The racing itself remains some of the most tactically demanding anywhere.",
      },
      {
        type: "paragraph",
        text: "Tide dominates almost every decision. Wind bends around the Isle of Wight, funnels through the western Solent and changes character completely depending on where you are on the racecourse.",
      },
      {
        type: "paragraph",
        text: "Local knowledge still counts for plenty, but it rarely guarantees success.",
      },
      {
        type: "paragraph",
        text: "Every race becomes a constant balancing act between current, geography, pressure and fleet positioning. Win the shifts but lose the tide and you'll go backwards. Nail the current but miss a pressure line and the result is exactly the same.",
      },
      {
        type: "paragraph",
        text: "It's one of the reasons so many of the world's best sailors keep returning.",
      },
      {
        type: "image",
        src: "https://thefoil.com/media/ilF7jeXJ83A9awKHdWZYsqn7VqGV_t7VrBA6E-hV4QA/resize:fit:1200:800/gravity:ce/quality:60/dpr:1/2026/07/cowes11.png",
        alt: "Cowes Week 2025",
        caption: "Cowes Week 2025",
      },
      {
        type: "heading",
        text: "Celebrating 200 years ashore",
      },
      {
        type: "paragraph",
        text: "The bicentenary isn't just being celebrated on the water. Throughout the week, Cowes will host its biggest shoreside programme in years, turning the town into a festival befitting one of British sport's oldest events.",
      },
      {
        type: "paragraph",
        text: "The return of the iconic Friday night fireworks - absent since 2019 - will provide a spectacular finale to the regatta, lighting up the Solent in celebration of 200 years of racing. Live music, entertainment, exhibitions and family attractions will run throughout the week, while Northwood House, Cowes Yacht Haven and venues across the town will host a packed programme of social events.",
      },
      {
        type: "paragraph",
        text: "The organisers are also embracing the history of the regatta with special bicentenary exhibitions and displays celebrating the evolution of Cowes Week from a two-race regatta in 1826 into one of the world's largest and longest-running sailing events. Visitors will have the opportunity to explore two centuries of yachting heritage while enjoying a modern regatta that continues to attract sailors from every corner of the sport.",
      },
      {
        type: "paragraph",
        text: "For many competitors, the racing will always come first. But this year there is a sense that everyone taking part - whether afloat or ashore - is becoming part of sailing history.",
      },
      {
        type: "image",
        src: "https://thefoil.com/media/CryPllFSaK4Fi3584LMtmupQqGczZ9rgO6FqNXCXolo/resize:fit:1200:800/gravity:ce/quality:60/dpr:1/2026/07/cowes-week-fireworks.jpg",
        alt: "Cowes Week fireworks",
        caption: "Cowes Week",
      },
      {
        type: "heading",
        text: "Why it still matters",
      },
      {
        type: "paragraph",
        text: "Sailing has changed beyond recognition over the last 200 years.",
      },
      {
        type: "paragraph",
        text: "Foiling boats now fly above the water. SailGP races at motorway speeds. The America's Cup has become unrecognisable from its origins.",
      },
      {
        type: "paragraph",
        text: "Yet Cowes Week continues to thrive because it has never forgotten what makes sailing enjoyable.",
      },
      {
        type: "paragraph",
        text: "It remains a celebration of every level of the sport. Professionals still want to win it. Club sailors still dream of competing in it. Families continue returning generation after generation.",
      },
      {
        type: "paragraph",
        text: "Few regattas anywhere in the world can claim to have survived for two centuries while remaining relevant to both elite sailors and weekend racers alike.",
      },
      {
        type: "paragraph",
        text: "Cowes Week can.",
      },
      {
        type: "paragraph",
        text: "As the fleet heads out onto the Solent once again this August, Britain's most famous sailing event won't simply be celebrating its past. It will be reminding the sailing world why it still has such an important place in its future.",
      },
      {
        type: "paragraph",
        text: "Two hundred years after the first yachts crossed the start line off Cowes, the challenge remains exactly the same: master the tides, read the breeze, beat your rivals and, if you're lucky enough, become part of one of sailing's greatest traditions.",
      },
      {
        type: "paragraph",
        text: "As I get older, I want to race professionally at the highest level I can for as long as possible. Sailing is in my blood and racing is simply what I do. But there is no escaping the fact that Father Time catches us all. I'll slow down, the boats I race will inevitably get a little slower, and my career will evolve.",
      },
      {
        type: "paragraph",
        text: "One thing, however, will never change.",
      },
      {
        type: "paragraph",
        text: "I hope I'm still racing Cowes Week in my eighties, maybe even my nineties. Long after the America's Cups, the TP52s and all the professional campaigns have passed, this is the regatta I'll keep coming back to.",
      },
      {
        type: "paragraph",
        text: "Because, as a British yacht sailor, Cowes Week is more than just another event on the calendar.",
      },
      {
        type: "paragraph",
        text: "It's a rite of passage.",
      },
      {
        type: "image",
        src: "https://thefoil.com/media/DYig0809HlnHkocLYX1r-QPuKLMXjGR2DG-2b8e5xpA/resize:fit:1200:800/gravity:ce/quality:60/dpr:1/2026/07/cowes5.png",
        alt: "Cowes Week 2025",
        caption: "Cowes Week 2025",
      },
    ],
    source: {
      name: "The Foil",
      url: "https://thefoil.com/news/freddie-carr-cowes-week-turns-200-why-britain-s-greatest-regatta-still-means-everything/",
    },
  },
  "full-steam-ahead-and-scrambling-to-keep-our-heads-above-water-grant-simmer-on-australia-s-cup-comeback": {
    slug: "full-steam-ahead-and-scrambling-to-keep-our-heads-above-water-grant-simmer-on-australia-s-cup-comeback",
    kind: "news",
    title: "'Full steam ahead and scrambling to keep our heads above water': Grant Simmer on Australia's Cup comeback",
    author: "Benedict Donovan, Deputy Editor",
    publishedAt: "28th June 2026 8:50am",
    heroImage: {
      src: "https://thefoil.com/media/z-_qGL_VZ2sNwkRNrpGTzTelipenn3i5yoE5mQgniUc/resize:fill-down:1500:500/gravity:fp:0.5:0.5/quality:60/dpr:1/2026/06/grant-auacannouncement-imageteamauac.jpg",
      alt: "'Full steam ahead and scrambling to keep our heads above water': Grant Simmer on Australia's Cup comeback",
    },
    body: [
      {
        type: "paragraph",
        text: "Few people are more bound up in Australia's America's Cup story than Grant Simmer. He was the young navigator aboard Australia II in 1983 – the boat with the wing keel that ended the New York Yacht Club's stranglehold and lodged itself permanently in the national memory. Skipper John Bertrand and backer Alan Bond pushed for him despite his inexperience, and he's been at it ever since: by his own count, thirteen campaigns, a number he reckons might be a record.",
      },
      {
        type: "paragraph",
        text: "So you'd assume Australia's first challenge since 2000, with Simmer in place as CEO, was the product of years of quiet plotting. Not quite.",
      },
      {
        type: "paragraph",
        text: '"I didn\'t really dream about it, it just happened and happened pretty quickly," Simmer tells The Foil. "Actually, Glenny asked me would I like to get involved, and obviously I knew all the players, so it was a pretty simple answer. Yes."',
      },
      {
        type: "paragraph",
        text: 'Glenny is Glenn Ashby, the three-time Cup winner and Emirates Team New Zealand mainstay now signed on as Team Australia\'s head of performance and design – and the link man who made a short-notice challenge possible. Simmer plays it down with a grin. "We don\'t want to make too much of a fuss about that!" he says. "But he was important. He is important. He remains very important." Jokes aside, he adds, Ashby is "very, very much" one of the people who got this thing off the ground.',
      },
      {
        type: "heading",
        text: "Bringing the green and gold home",
      },
      {
        type: "paragraph",
        text: "For Simmer, the pull of this one is obvious. He's a four-time Cup winner, and three of those came in other people's colours: managing director and design coordinator for the Swiss-flagged Alinghi when they took the Cup in 2003, returning for their 2007 defence, then general manager at Oracle Team USA for the 2013 win. This time the challenge is lodged through the Royal Prince Edward Yacht Club, backed by the Winning family.",
      },
      {
        type: "paragraph",
        text: "\"As a country, we're really good at sailing, and we have people spread through all these America's Cup teams that are Australian sailors steering the Kiwi boat, steering the Italian boat, steering the American boat. Now we've got an opportunity, really thanks to the Winning family, to pull all these people back and put them all on a boat.\"",
      },
      {
        type: "paragraph",
        text: "That scattering of Australian talent across rival camps has been the story of Australian sailing for two decades. Getting the band back together, towards the end of his own career, clearly means a lot. \"It's about time!\" as he put it at the team's launch in May.",
      },
      {
        type: "image",
        src: "https://thefoil.com/media/XFXzX4ZppOCVz-dticQCCn_GQK9uVuMx3mJK5BXV2eE/resize:fit:1200:800/gravity:ce/quality:60/dpr:1/2026/06/image-3-C-team-australia-artist-impression.jpg",
        alt: "Team Australia Artist Impression",
        caption: "Team Australia Artist Impression",
      },
      {
        type: "heading",
        text: "Late, lean and leaning on the Kiwis",
      },
      {
        type: "paragraph",
        text: "There's no getting around the timeline: Australia are late. The Louis Vuitton Cup starts on 21 May 2027 in Naples, and they won't have a boat in the water until around the beginning of March. With the Kiwis and Italians having already rolled out their AC75s, it's clear the Aussies have a big task ahead of them. Will they even use their full allocation of sailing days? \"Probably not.\"",
      },
      {
        type: "paragraph",
        text: 'It leaves no doubt about the team\'s biggest constraint. "Time," he says. "We\'ve got a reasonable budget, but time normally gets you in the Cup anyway." He refuses to see the short runway as a handicap, however.',
      },
      {
        type: "paragraph",
        text: "\"The nice thing about starting late and being short on time is we can discard any science project, anything that doesn't look like it's going to deliver performance. We're really quite focused on just doing the important things right, efficiently, and that's a nice tight program, so I like that aspect of it.\"",
      },
      {
        type: "paragraph",
        text: 'That ruthlessness rules out any temptation to swing for the fences. "In the Cup world you always need to be innovative, but are we going to try and hit it out of the park by doing something radical? No, definitely not," he says. "We\'re going to try and win a lot of races, and we\'re going to do that by having a fast boat, a good crew and reliability."',
      },
      {
        type: "paragraph",
        text: "The fast boat comes courtesy of the Kiwis. The deal Ashby brokered with Emirates Team New Zealand hands Australia design resources and the Kiwi boat from the 2021 Cup – a second-iteration hull to be fitted with a new rig, new sails and new foils – which raises the small matter of the constructed-in-country rule, since the Cup doesn't typically allow you to turn up in someone else's boat. But as the Hall of Famer points out, in Bermuda, plenty of boats were built in New Zealand with the teams only obliged to build the bows themselves. \"So we're building a bow at the moment for our boat,\" he says. \"That's a criterion under the protocol.\" Box ticked.",
      },
      {
        type: "heading",
        text: "What still wins the Cup",
      },
      {
        type: "paragraph",
        text: 'Pressed for his favourite campaign, unsurprisingly he goes straight back to the beginning. Australia II, he says, "because it changed the direction of the Cup." That it did. Breaking the New York Yacht Club\'s 132-year grip – the longest winning streak in the history of sport – tipped Australia into national delirium, the moment Prime Minister Bob Hawke told the country that any boss who sacked a worker for not turning up that day was a bum. It remains one of the great days in Australian sport. Simmer was in the thick of it, part of a tight little group of thirty-odd who nearly threw it away at 3–1 down before hauling it back. Thirteen campaigns in, he\'s anything but misty-eyed about it: "It\'s a ridiculous record," he says, "because it goes on for so long."',
      },
      {
        type: "image",
        src: "https://thefoil.com/media/JG1d5rCB6mKVIenQWG7Uj--_I_xRo9388E6bEXc9mCE/resize:fit:1200:800/gravity:ce/quality:60/dpr:1/2026/06/image-1-C-gilles-martin-raget.jpg",
        alt: "Gilles Martin-Raget",
        caption: "Gilles Martin-Raget",
      },
      {
        type: "paragraph",
        text: "Ask Simmer what actually decides the America's Cup, though, and the answer is much the one he'd have given forty years ago, even as the boats have gone from heavy-displacement 12 Metre monohulls to AC75s capable of more than 55 knots.",
      },
      {
        type: "paragraph",
        text: "\"The thing that I've always loved about the Cup is that it's a contest that has sport and technology. You've got to put your resources in the right spot to have a fast boat. You've got to get the technology right, and then the sailors have got to deliver on the day. That's the bit that hasn't changed. It was the same in 1983, and it'll be the same in 2027.\"",
      },
      {
        type: "paragraph",
        text: 'With the AC75 now into its third generation and the class maturing, Simmer believes the boats are converging and the margins are shifting back to the crews. The sailing team is led by Tom Slingsby, who Simmer rates without hesitation as "at the top of his game." He calls the wider squad "fantastic," though for now Tash Bryant is the only other name confirmed. The 25-year-old has been Slingsby\'s strategist in SailGP since season 3, so the pair already know each other\'s instincts inside out.',
      },
      {
        type: "paragraph",
        text: "As for Ashby, whose work spans other high-tech projects such as Ferrari's Hypersail, the design brief comes first. But Simmer isn't ruling out a run on the water: \"I think we'll have a spare wetsuit for him now and then he'll go for a yacht. He's the head of our technology and design, and hopefully, he'll be focused on that. But for sure he'll spend some time sailing.\"",
      },
      {
        type: "image",
        src: "https://thefoil.com/media/kOH5lzCrMEWKahRO-gE3zu73wV7EheGOtNk0dYbo-74/resize:fit:1200:800/gravity:ce/quality:60/dpr:1/2026/06/team2-auacannouncement-imageteamauac.jpg",
        alt: "Team Australia",
        caption: "Team Australia",
      },
      {
        type: "heading",
        text: "A seat at the table, and the longer game",
      },
      {
        type: "paragraph",
        text: "Under the new America's Cup Partnership model, Team Australia takes a seat on the ACP board, which makes them not just a challenger but a part-owner of the event's future.",
      },
      {
        type: "paragraph",
        text: "\"I think the Winning family are engaged in this new structure and having now a level of ownership in the Cup going forward. It really has engaged them for the future of the Cup, and they're part of the decision-making process going forward. For all participants, this model will keep people in the game longer, and that's the goal of the model.\"",
      },
      {
        type: "paragraph",
        text: "It feeds, too, into the team's biggest ambition this cycle. \"It's important that we win races,\" he says. \"If you were a dud, your chances of doing the next Cup are low. But if we put in a really good, credible performance, i.e. win a lot of races, we're probably doing the next Cup as well.\" He's already looking past Naples – there's a plan to do AC39, and he reckons Australia have a better shot at that one.",
      },
      {
        type: "heading",
        text: "Getting the humans back in shot",
      },
      {
        type: "paragraph",
        text: "A board seat also drags Simmer into a debate nagging at the whole sport: how do you make a flying monohull watchable? A helmet peeping out of a cockpit, after all, doesn't give spectators a whole lot to latch onto.",
      },
      {
        type: "paragraph",
        text: '"There\'s quite a heated discussion about the fact that sailors are hidden aerodynamically," he says of the rule-writing already under way for AC39. "The spectators are really interested in who are the sailors, what are they doing, what are their skills, and can I see them doing their job on the boat?" The grinding and the muscle, he reckons, has had its day – "I don\'t think we\'re going to turn that wheel back in the Cup" – but there\'s scope to write rules that stop the crew being "so buried in the bowels of the boat."',
      },
      {
        type: "paragraph",
        text: 'He\'s not pining for the chaos of the old days, even if he remembers the entertainment value. The last race of the 2007 series in Valencia, on the Version 5 monohulls, had "broken spinnaker poles and chutes going over the side. There was plenty of drama. That made good TV." But the sport has moved on, and Simmer thinks the modern story has to be told from inside the boat: "The images taken from within the sailors\' cockpits and explaining what the sailors are doing, that\'s the modern message about these boats."',
      },
      {
        type: "paragraph",
        text: 'It all ties back to whether the Cup can finally become commercially viable. "That\'s why all the participants are talking about what the event format should look like," he says. "What do the boats look like? How much automation do we have? How do we make the sailors more visible and more interesting to the spectators? We\'ve got a reason to be engaged in that discussion because we\'re all owners of the future of the Cup."',
      },
      {
        type: "paragraph",
        text: 'For now, the goal is straightforward: build the boat, get it sailing, lean on the Kiwi package and point Slingsby\'s crew at the Naples start line trusting them to deliver on the day. "Full steam ahead," he says of the day-to-day, "and scrambling to keep our heads above water, really."',
      },
      {
        type: "paragraph",
        text: "As for Simmer himself, he's got his eye on the guest racer's seat and reckons this one will be his last campaign. He's said that before, though.",
      },
    ],
    source: {
      name: "The Foil",
      url: "https://thefoil.com/news/full-steam-ahead-and-scrambling-to-keep-our-heads-above-water-grant-simmer-on-australia-s-cup-comeback/",
    },
  },
  "how-pace-took-line-honours-in-the-2026-round-britain-and-ireland-race-one-chapter-at-a-time": {
    slug: "how-pace-took-line-honours-in-the-2026-round-britain-and-ireland-race-one-chapter-at-a-time",
    kind: "news",
    title: "How Pace took line honours in the 2026 Round Britain and Ireland Race, one chapter at a time",
    standfirst:
      "Johnny Vincent's Volvo 70 Pace crossed the Royal Yacht Squadron line off Cowes at 04:17:31 BST on Sunday 16 August, taking monohull line honours in the 2026 RORC Round Britain and Ireland Race. Six days, 14 hours, 47 minutes and 31 seconds after the cannon fired, Vincent - an owner rather than a professional sailor - had sailed the 1,805 nautical miles around Britain and Ireland and come home first, in the 50th anniversary edition of one of offshore racing's most unrelenting challenges.",
    author: "Benedict Donovan, Deputy Editor",
    publishedAt: "17th August 2026 1:38pm",
    heroImage: {
      src: "https://thefoil.com/media/PzEVl35_-WJnP9AbUFUS8zykmJMvc3I1TsHqYn8X1yU/resize:fill-down:1500:500/gravity:fp:0.54:0.525974026/quality:60/dpr:1/2026/08/pace-line-honours-craig-nutter-pace.jpeg",
      alt: "How Pace took line honours in the 2026 Round Britain and Ireland Race",
    },
    body: [
      {
        type: "paragraph",
        text: "Pace carried a crew stacked with offshore pedigree, among them 2008-09 Volvo Ocean Race-winning navigator Jules Salter and fellow round-the-world veterans Neal McDonald and Stu Bannatyne.",
      },
      {
        type: "paragraph",
        text: '"The Round Britain and Ireland Race is not one yacht race," Vincent reflected after. "It is a series of four races joined together. You do it chapter by chapter and then reach the end of the book when you come back to Cowes. That makes it totally unique. The first chapter takes you through familiar Fastnet waters. Chapter two runs from south-west Ireland to Muckle Flugga in a completely different ocean environment. Chapter three begins when you turn at Muckle Flugga. There is this extraordinary emotion that you are going home, but you are further north than Cape Horn is south. Then comes the North Sea, with oil platforms and gas rigs. The final chapter is probably the most challenging navigationally, with obstructions, separation zones, depth, sand and a very narrow passage through Dover. It arrives when everybody is beaten up and tired, but there is still a lot more to do."',
      },
      {
        type: "paragraph",
        text: "From Cowes back to Cowes, here's how each chapter was won.",
      },
      {
        type: "heading",
        text: "First blood at Land's End",
      },
      {
        type: "paragraph",
        text: "Sunday 9 August began with cannon fire and clear skies over Cowes, as 32 boats and 182 sailors from five continents beat cleanly out of the Solent. By the two-hour mark, Pace had already moved to the front, clearing Bembridge Ledge at over ten knots with Jens Kellinghusen's Ker 56 Varuna 6 barely a mile back.",
      },
      {
        type: "paragraph",
        text: "The first real fork came at Land's End and the Isles of Scilly. Pace held the water lead on an inshore line, committing to thread the traffic separation scheme around the Scillies, while Varuna 6 and Antoine Magre's Mach 50 Palanad 4 went further offshore looking to gain. For Palanad, the opening night had been a punishing introduction before the wind finally offered a way out.",
      },
      {
        type: "paragraph",
        text: '"The first six hours of VMG upwind and short tacking in short choppy sea state was not ideal for the \'big spoon\' we call home," reported Joss Creswell aboard Palanad. "As darkness fell the wind veered and we were able to ease sheets and put up a Code Zero. Suddenly we were doing 13 knots in 14 knots of windspeed. A big morale boost having done a wobbly six or seven knots for hours."',
      },
      {
        type: "paragraph",
        text: 'For Pace, staying at the front through that tricky opening was less about one clever move than a habit of squeezing every mile. "There were opportunities to push hard when it was easy to push hard and to gain from a wind shift, a wind bend or something in the forecast," Salter said. "We tried to do that all the way around the course." That approach was about to be handsomely rewarded.',
      },
      {
        type: "image",
        src: "https://thefoil.com/media/_zFatBSBuZzpGHve9XfvVGdjSyOSGGd-0whCfyLC4s/resize:fit:1200:800/gravity:ce/quality:60/dpr:1/2026/08/pace-day-2-james-tomlinson-rorc.webp",
        alt: "Pace on day two",
        caption: "James Tomlinson / RORC",
      },
      {
        type: "heading",
        text: "The low-pressure express",
      },
      {
        type: "paragraph",
        text: "South-west of Ireland, the race changed character entirely. A big Atlantic low, sitting around 999 hPa, took control of the weather and pointed Pace's bow due north, feeding her a fast lane of southerly breeze up the Irish and Scottish coasts. By Wednesday, she had reeled off 428 nautical miles in a single 24-hour run, averaging close to 18 knots. By the time she was off the Hebrides, the team's lead over Varuna 6 had become a commanding one, with Palanad 4 holding third.",
      },
      {
        type: "paragraph",
        text: "From the deck, boat captain Anthony Haines described what that kind of speed actually feels like: \"Out here off the Hebrides, Pace is thundering along in a solid 25 knots of breeze from the south. We spent the night in 20-25 knots downwind, the boat averaging 17 to 25 knots, with plenty of water sweeping the deck and keeping everyone honest. It's wet, it's noisy, and it's physical, but the crew is settling into life at sea - finding their own ways to stay comfortable, grabbing rest when they can, and even starting to enjoy the freeze-dried meals. The frantic sail changes of the opening days have eased into a more settled rhythm, and with that comes a quiet confidence on board.\"",
      },
      {
        type: "paragraph",
        text: 'None of that speed comes for free on a Volvo 70. "The crew were incredibly sharp at getting the right sails up and down, then making the small angle changes needed to keep the boat fully on pace," Salter explained. "You are looking at the sea state, wave angles and which little shifts to take. If you keep doing that, suddenly the boat covers hundreds of miles relatively easily."',
      },
      {
        type: "paragraph",
        text: 'Behind, Palanad 4 had worked clear of the light stuff and Magre was weighing up what came next. "Pace and Varuna have taken advantage of their larger size and sail area to get away," he said. "But we are doing all we can to keep up and stay within reach for when the breeze comes in."',
      },
      {
        type: "heading",
        text: "The turn for home",
      },
      {
        type: "paragraph",
        text: "Pace's charge carried her past Bull Rock still holding an hour and 34 minutes over Varuna 6 and five and a half hours over Palanad 4, then stretched further still on the run to St Kilda, where the gap over Varuna 6 grew to seven hours 40 minutes. Palanad was quietly finding another gear of her own - faster than Varuna 6 on the same stretch, clawing back the best part of ninety minutes to close to within three hours 36 minutes of the Ker 56 by the time Pace rounded Muckle Flugga.",
      },
      {
        type: "paragraph",
        text: "Meanwhile, Pace had covered the section from St Kilda in just over 18 hours, pushing her advantage over Varuna 6 to almost 18 hours. For Salter - completing his first full lap of Britain and Ireland despite four round-the-world races - it came down to reading the coastline as much as the weather.",
      },
      {
        type: "paragraph",
        text: '"When you are racing around Britain, you are effectively turning right at every corner. You combine that with the weather and keep the boat at its fastest and most efficient angle. If you minimise the distance and sail faster for a shorter distance, you will do better."',
      },
      {
        type: "paragraph",
        text: "That approach was reflected by the numbers. By the finish, Pace's tracker had logged 2,113 nautical miles against a course of 1,805 - strikingly close to the theoretical shortest route, with only two deliberate deviations, after Black Rock and again in the northern North Sea.",
      },
      {
        type: "heading",
        text: "Gybing through the minefield",
      },
      {
        type: "paragraph",
        text: "The run home is the chapter Vincent rates as the toughest, and it's easy to see why. The southern North Sea is a maze of gas and oil fields, shipping separation zones, wind farms and sandbanks, all with hard, invisible edges.",
      },
      {
        type: "paragraph",
        text: '"There were a lot of gybes, sometimes waking people 30 minutes into what was supposed to be a four-hour off-watch because we had to gybe again," said Salter. "That trust between the navigator and the crew is incredibly important."',
      },
      {
        type: "paragraph",
        text: 'Pace ran VMG downwind past Norfolk, Suffolk, Kent, Sussex and Hampshire, gybing through the dark until a favourable tide finally carried her back through the Solent. Pushing this hard, this late in the race, was only possible because of the groundwork laid before. "Preparation gives you the confidence to push the boat really hard," Vincent said. "Not recklessly hard, because there is always a margin, but really hard. My understanding of what this boat can cope with has moved up massively. She is part of the team." Stepping ashore just after four in the morning, it took a moment before anything like celebration set in.',
      },
      {
        type: "paragraph",
        text: '"A big sense of completion is how I would describe it. It has been a long journey and a tremendous adventure. What an amazing race and what an amazing event. We had all sorts of conditions: no wind, lots of wind, flat sea, big waves and some great scenery."',
      },
      {
        type: "heading",
        text: "The races still being written",
      },
      {
        type: "paragraph",
        text: "Pace has her line honours, but she's only one story in a fleet still racing across half a dozen classes.",
      },
      {
        type: "paragraph",
        text: "Over the weekend, Palanad 4 was leading the projected standings for IRC Overall, with Pata Negra out front in IRC One, GameOn edging Bellino by minutes in IRC Two, Mzungu! holding IRC Two-Handed from Kestrel, and Jetpack under pressure from Zanzibar in IRC Three. Further back, Penfret, Gambit and Swift were locked in their own Class40 battle. Two retirements aside - the Class40 Tjoba and the maxi Venomous, both crews safe and well - the rest of the fleet is still on their way back home.",
      },
      {
        type: "paragraph",
        text: "Pace's four chapters are done, but the overall result is still open. Track the fleet via the RORC tracker with live rankings.",
      },
      {
        type: "image",
        src: "https://thefoil.com/media/4rLyOlw-HSbat8_JKJsxcvWsq5IRE_IChrQBD0fPU3A/resize:fit:1200:800/gravity:ce/quality:60/dpr:1/2026/08/pace-finish-26-rbir-credit-haines-films-pch-ch-0547.jpeg",
        alt: "Pace finishing the Round Britain and Ireland Race",
        caption: "Haines Films",
      },
    ],
    source: {
      name: "The Foil",
      url: "https://thefoil.com/news/how-pace-took-line-honours-in-the-2026-round-britain-and-ireland-race-one-chapter-at-a-time/",
    },
  },
  "luca-rizzotti-bought-a-moth-in-2007-and-accidentally-started-a-movement": {
    slug: "luca-rizzotti-bought-a-moth-in-2007-and-accidentally-started-a-movement",
    kind: "news",
    title: "Luca Rizzotti bought a Moth in 2007 and accidentally started a movement",
    author: "Andy Rice, Senior Contributor",
    publishedAt: "21st March 2026 2:40pm",
    heroImage: {
      src: "https://thefoil.com/media/qvLe0fQuURzX9cYJo3PDFGhXkj9a-EoxcAsxs5DScR8/resize:fill-down:1500:500/gravity:fp:0.5:0.5/quality:60/dpr:1/2026/03/54620591537-354128013c-k.jpg",
      alt: "Luca Rizzotti bought a Moth in 2007 and accidentally started a movement",
    },
    body: [
      {
        type: "paragraph",
        text: "When we launched The Foil at the start of this year, it was understandable that quite a few people incorrectly jumped to the conclusion that it must be a Luca Rizzotti project. After all, this passionate Italian has become synonymous with foiling and the whole world around it.",
      },
      {
        type: "paragraph",
        text: "Rizzotti is the founder of the Foiling Organization, founder and president at the Foiling Week and WeAreFoiling, AC40 Class Manager, and a vice president of the International Moth class.",
      },
      {
        type: "paragraph",
        text: "Such is his influence in this cutting edge part of the sport, he even finds himself negotiating health & safety regulations with civil servants and politicians at the European Union in Brussels. It's all a far cry from his first encounter with the wonderful world of foiling.",
      },
      {
        type: "paragraph",
        text: '"I was living in Sydney back in 2007, sailing in 18ft skiffs, and [Australian sailor] Scott Babbage was also in the 18s, but he had a foiling Moth too. Long story short, when I was going back to live in Italy I decided to buy his Moth and bring it back with me. It was the first foiling Moth on Lake Garda, and probably all of Italy, although I\'m not sure. But certainly I was one of the early ones so of course I wanted to help with getting more Moths on the water in Italy."',
      },
      {
        type: "image",
        src: "https://thefoil.com/media/1wPaCqr3CVO9gwTeweD26NNYuO07nr6Ii9XV10RGDMM/resize:fit:1200:800/gravity:ce/quality:60/dpr:1/2026/03/moth.webp",
        alt: "Tom Slingsby at the 2025 Moth Worlds. Lake Garda",
        caption: "Tom Slingsby at the 2025 Moth Worlds. Lake Garda",
      },
      {
        type: "paragraph",
        text: "Rizzotti soon got involved with the Italian class association and then became president, during which time he brought the Moth fleet to Lake Garda to hold the World Championship in 2012. Then in 2013, at the end of the America's Cup in San Francisco - where the world had just witnessed 72ft foiling catamarans flying around the Bay - a lightbulb went off in Rizzotti's head. \"Well, if catamarans of 72 feet are foiling in San Francisco and we are here foiling with 11-foot Moths, we must be able to connect these dots, right?",
      },
      {
        type: "paragraph",
        text: '"This had to happen. So, what could we do to help this succeed? We were not really event organisers, so we had a blank sheet of paper. We thought if you want to help a new branch of sailing or a new industry grow, you organise racing." So Foiling Week was born, a fledgling idea that first took place in 2014 and has turned into an annual behemoth on Lake Garda.',
      },
      {
        type: "paragraph",
        text: "\"A lot of people who were fans of foiling were all in email contact with each other, sort of 'pen friends', but they had never met in person. I remember Andrew McDougall, of Mach 2 and Waszp fame, met with Tom Speer, who was the wing designer of the big Oracle trimaran. They had been exchanging ideas for a long time but had never met in person. We became the hub of this, and it just grew with Foiling Week. The first event in 2014 was made of, I would say, 60 to 80 boats, and now we are in the range of 500 entries for Foiling Week. It is incredible.\"",
      },
      {
        type: "paragraph",
        text: 'Most sailing events would be very happy with those first year figures, let alone the multi-hundred numbers now. Rizzotti had clearly struck oil. There was a pent-up demand for foiling enthusiasts around the world all to club together and share this pioneering adventure of rapid technical development and high-speed sailing. "We gave the community a home to come back to every year," he says. "I would say even the whole town of Malcesine and Lake Garda eventually benefited from that. Although at the beginning, I remember the yacht club in year one basically told us, \'Do not do this crazy thing again.\' They had a lot of doubts.',
      },
      {
        type: "paragraph",
        text: "\"For a normal yacht club that was running Olympic classes and traditional regattas, this bunch of new boats - all foiling, most of them garage-built back then, with the characters that go together with garage-building - was a unique demographic. They were like-minded, passionate people, but they stood out from the normal sailing demographic you would expect in a yacht club. Especially back then. So the club asked, 'Do you really want to do this again?' and we went, 'Yeah, let's give it one more try.'\" 'One more try' has now turned into an annual event that just continues to grow in size and gather momentum.",
      },
      {
        type: "image",
        src: "https://thefoil.com/media/6uAmoDowmt2VnBEBFllPaSVgtu4Tz8XrHmp7MPnPNtM/resize:fit:1200:800/gravity:ce/quality:60/dpr:1/2026/03/54621468796-f207b4d016-k.jpg",
        alt: "2025 Foiling Week",
        caption: "2025 Foiling Week",
      },
      {
        type: "paragraph",
        text: "While Malcesine on Lake Garda has become the consistent annual focal point, other editions of the Foiling Week have popped around the world including in Sydney and Pensacola in Florida, the same place that was recently announced as American Magic's training base for the SailGP league.",
      },
      {
        type: "paragraph",
        text: 'The Foiling Awards in Genoa, north Italy, have just completed their ninth edition and along with that goes the Foiling Congress. "The awards are like the Oscars; they are a prize for everything that happened in the previous year. We brought in the Congress to make it more worthwhile for people travelling from everywhere around the globe. Instead of coming for just one evening, we gave them a reason to come beyond the gala dinner.',
      },
      {
        type: "paragraph",
        text: "\"It is a great opportunity to discuss ideas and for networking, but we have a lot of practical topics. At the moment, one of the key bottlenecks for the growth of foiling is that according to European law, foiling is not permitted for recreational crafts. It's not that it is strictly forbidden, but instead of being allowed to use a CE mark, which is the easy way, you need to rate every vessel yourself. This means extra cost for the manufacturer and extra cost for the customer in insurance. We are trying to work with the European Commission to make foiling allowed in four years' time, which is when they update the law.\"",
      },
      {
        type: "paragraph",
        text: 'So does that mean that every time a Moth sailor goes out on Lake Garda or somewhere in Europe, they\'re breaking the law? Fortunately not, according to Rizzotti. "To be clear, this is only for recreational crafts. Sports dinghies and sailing boards are under World Sailing certification, which is a different system that allows those boats to go sailing with no problem. But for full flying, where the hulls are clear of the water, you would need CE marking, which at the moment is impossible to get. I am discussing with people in Brussels how to change the law in Europe."',
      },
      {
        type: "image",
        src: "https://thefoil.com/media/w9AE5E4RrVAKij7boQt1qxh-25Ag9Eioi6UawaudhtA/resize:fit:1200:800/gravity:ce/quality:60/dpr:1/2026/03/55153761886-9ec50c0cd8-k.jpg",
        alt: "Rizzotti onstage at the 2026 Foiling Awards - IX Edition",
        caption: "Rizzotti onstage at the 2026 Foiling Awards - IX Edition",
      },
      {
        type: "paragraph",
        text: 'Rizzotti can\'t quite believe how he spends his days. From that initial purchase of a second Moth from his Aussie mate Scott Babbage almost 20 years ago, now the passionate Italian is working at every level to promote foiling, from the fun stuff at Lake Garda to wading through the red tape and administrative minefield of Brussels. "It has been a learning experience; I come from organising events and now I am a lobbyist," he half-laughs.',
      },
      {
        type: "paragraph",
        text: 'Not that he\'s complaining. Four years ago, from running the Foiling Organization part time while holding down a job with Italian boatbuilder Persico, now Rizzotti is full time. "I am grateful for the opportunity because, while it is work, it is passion. This idea of foiling can bring so much to the sport and the industry - extra comfort [due to a smoother ride above the waves], reduced emissions, and bringing technology into a world that has been very conservative for a long time... it is a breath of fresh air."',
      },
    ],
    source: {
      name: "The Foil",
      url: "https://thefoil.com/news/luca-rizzotti-bought-a-moth-in-2007-and-accidentally-started-a-movement/",
    },
  },
  "rate-the-fleet-andy-rice-s-verdict-on-sailgp-new-york": {
    slug: "rate-the-fleet-andy-rice-s-verdict-on-sailgp-new-york",
    kind: "news",
    title: "Rate the fleet: Andy Rice's verdict on SailGP New York",
    author: "Andy Rice, Senior Contributor",
    publishedAt: "5th June 2026 8:00am",
    heroImage: {
      src: "https://thefoil.com/media/MzGn-S68hd8DlKixNMC2PH1z8Uj7hHEgqEWaGyk2il4/resize:fill-down:1500:500/gravity:fp:0.5:0.5/quality:60/dpr:1/2026/06/ml3-7515.jpg",
      alt: "Rate the fleet: Andy Rice's verdict on SailGP New York",
    },
    body: [
      {
        type: "heading",
        text: "1. Australia",
      },
      {
        type: "paragraph",
        text: "Finished: 1st Of Australia's three back-to-back victories, the win in New York was by far the messiest and most surprising. For surviving the technical curveballs thrown their way both on Saturday and before the start on Sunday, then to rediscover their composure to get racing and do just enough to scrape through into the final... This, plus their victory in the final after fighting off those valiant attacks from the British, makes them my top performers in the battle for New York. This has been a bogey venue for Tom Slingsby; he sounded not so much triumphant as relieved at having survived an extraordinary weekend of rollercoaster emotions, and delighted to have got that New York monkey off his back. Add to that the announcement by co-owners Hugh Jackman and Ryan Reynolds of a Disney+ docuseries taking a behind-the-scenes look at the Bonds Flying Roos, this could be massive for all of SailGP. If this proves to be the league's 'Drive To Survive' opportunity, then all F50s can be truly grateful for floating on a rising tide.",
      },
      {
        type: "image",
        src: "https://thefoil.com/media/05ES5wlxz2x8RZofDUs6DdIKAm-_AteS0MFbW8rvonY/resize:fit:1200:800/gravity:ce/quality:60/dpr:1/2026/06/ml3-7515.jpg",
        alt: "Mike Lawrence/SailGP",
        caption: "Mike Lawrence/SailGP",
      },
      {
        type: "paragraph",
        text: "Canada made it to the three-boat final for the first time in 2026",
      },
      {
        type: "heading",
        text: "2. Canada",
      },
      {
        type: "paragraph",
        text: "Finished: 3rd There were signs of NorthStar SailGP team making progress in Bermuda. Giles Scott's progress towards the three-boat final was scuppered by that port/starboard incident where Sweden ruined one of their races on Sunday. Even so, the Canadian boat looked to be dragging its arse in the marginal foiling moments on the Great Sound. By the looks of Sunday in New York, the Canadian boat has got its mojo back - windward bow aggressively close to kissing the water, leeward rudder riding coquettishly high. This is the mode that Australia and Spain seem able to achieve with ease compared with the rest of the pack. This boatspeed - along with some smart tactical placement around the congested race track - rewarded Giles Scott with the highest number of overtakes for the weekend - a grand total of nine. The next best in this vital category scored just six, with the majority of teams hovering around zero. While Scott will be disappointed not to have featured in the three-boat final, coming in a distant third, this is a minor blip compared with an overall good-news story. After a sorry start to the season, Canada is rediscovering some momentum in the build-up to its home event in Halifax.",
      },
      {
        type: "image",
        src: "https://thefoil.com/media/wpcQHFo2n2IJ4k2tdB5U6W37K3fmLgOq8jPimO3mQ_s/resize:fit:1200:800/gravity:ce/quality:60/dpr:1/2026/06/sb2-7000.jpg",
        alt: "Simon Bruty/SailGP",
        caption: "Simon Bruty/SailGP",
      },
      {
        type: "heading",
        text: "3. Spain",
      },
      {
        type: "paragraph",
        text: "Finished: 12th Why Spain, you ask? Well, when Diego Botin had an operational boat, Los Gallos dominated the small-fleet contest on an ultra-breezy Saturday that would end up counting for nothing other than bragging rights. Not that the ever-smiling, always-humble Botin is one to brag. He probably doesn't complain loudly enough about his frequently malfunctioning boat. When it's working, the oldest boat in the fleet is as fast as any other, possibly faster. But when you ask him, Botin says he's looking forward to taking delivery of a new F50 later this season because he hopes to banish the ongoing technical gremlins that beset his ageing catamaran. With hydraulic problems putting the Spanish out of action for all of Sunday's racing, where to place them in these rankings? This might be a woulda, shoulda kind of thing to place them this high in the order, but like I said, they were on fire on Saturday, and they've been on fire all season - when the boat has not been breaking on them.",
      },
      {
        type: "image",
        src: "https://thefoil.com/media/xYTOjFaKRrPBS6YQ5RSkM89iiOZ7bYNBkQEM--SB4Eg/resize:fit:1200:800/gravity:ce/quality:60/dpr:1/2026/06/km2-7051.jpg",
        alt: "Katelyn Mulcahy/SailGP",
        caption: "Katelyn Mulcahy/SailGP",
      },
      {
        type: "heading",
        text: "4. Great Britain",
      },
      {
        type: "paragraph",
        text: "Finished: 2nd This looked like an Emirates GBR getting back to close to its best. In Saturday's windy races, Dylan Fletcher ruled the starts even if Spain were the better package around the race course. They were fast out of the blocks on Saturday, launching the day with a race win and bouncing back nicely in the next - from dead last off the start line to sixth by the finish. The British overtaking the Aussies in that stellar match race - even if they were subsequently overtaken - showed good speed and tactical decision-making. While Fletcher felt some pangs of regret about missing out on the overall win, coming second in New York should really help banish the demons of that inexplicable last place finish in Rio de Janeiro less than two months ago.",
      },
      {
        type: "image",
        src: "https://thefoil.com/media/G3mX0t2QUQWtK4Y6vOl_4KjZpP4EYbjQzBHNHdw9mR8/resize:fit:1200:800/gravity:ce/quality:60/dpr:1/2026/06/jj054692.jpg",
        alt: "Jed Jacobsohn/SailGP",
        caption: "Jed Jacobsohn/SailGP",
      },
      {
        type: "heading",
        text: "5. United States",
      },
      {
        type: "paragraph",
        text: "Finished: 6th The USA had been my pick to win this event. In fact they've been my pick ever since they took victory in Sydney. When am I going to wake up to the idea of backing Australia instead! But my belief in Taylor Canfield's team was backed up by their performance in the first two races of Sunday when they scored a second and a first. The stats support that notion that the Americans have been the fastest finger first out of the starts and the all-important race to Mark One. Canfield's late charge out of the leeward end of the start line of Race 2 was beautifully judged and gave them the slingshot out into an early lead that they held easily to the finish. But then it was the start of the next race where an impressive weekend unravelled for the home team. The Americans were the sole boat from that three boat pile-up from the Race 3 start to be DSQ'ed. Just DNFs for Brazil and Italy. Even Canfield was holding his hands up to his culpability in the crash. From now on, will the Americans - and other teams - make sure there is at least one person in the leeward cockpit in those conditions, to keep a watchful eye out for any boat that makes a sudden and unexpected hand-brake turn to the right? So, lessons to be learned, but the Americans continue to make an impact for good reasons, as well as that bad one.",
      },
      {
        type: "heading",
        text: "6. France",
      },
      {
        type: "paragraph",
        text: "Finished: 4th It was surely a blessing for France – and Enzo Belanger in particular – that they didn't have to go into battle on Saturday with the wind gusting up to 36 knots. Quentin Delapierre's new wing trimmer, following those severe injuries to Leigh McMillan and Glenn Ashby this season, at least had a softer start to his first day of competition in SailGP. Not only that, but to come out of the weekend with a fourth place was a really good result of which Delapierre was rightly proud.",
      },
      {
        type: "image",
        src: "https://thefoil.com/media/tSboQlsQPDImtg0Ou7utdyRo1tl6Q4O837ZfcGoDgs0/resize:fit:1200:800/gravity:ce/quality:60/dpr:1/2026/06/jj055729.jpg",
        alt: "Jed Jacobsohn/SailGP",
        caption: "Jed Jacobsohn/SailGP",
      },
      {
        type: "heading",
        text: "7. Brazil",
      },
      {
        type: "paragraph",
        text: "Finished: 10th Placings of 5th and 8th in the first two races point towards some kind of progress for Brazil. Then again, New York a year earlier was where Martine Grael steered the Brazilian boat to its first race victory and only narrowly missed the podium when the team finished 4th in 2025. A really good start in Sunday's second fleet race saw Brazil fighting for the lead at Mark One, closely following USA around the bear away. That was a good sign for a team that has really struggled in the pre-starts. It has been slim pickings for Brazil this season, so were we seeing glimmers of improvement on Sunday? Alas, just as the Brazilians were building up a head of steam - that three-way collision at the start of Race 3. The only one of the three teams in the pile-up not to be given penalty points, so an innocent party. But small consolation for such a rude ending to an otherwise good day.",
      },
      {
        type: "heading",
        text: "8. Sweden",
      },
      {
        type: "paragraph",
        text: "Finished: 5th There's a feeling that the season is beginning to slip away from Artemis SailGP. Nathan Outteridge was clearly frustrated at not being able to race on Saturday; and on Sunday the Swedish team was engaged in some co-ordinated practice starts and reaching to Mark One with some of the other teams from northern Europe - Denmark, Germany and Switzerland. Outteridge seemed quite taken aback that The Foil had noticed the formation practice starts, but he explained it was Sweden who had initiated the idea. It seems like Sweden is pulling out all the stops to close the gap to the front pack. A 3rd place in Sunday's opening race was the one bright spot for Sweden in New York, although they still finished in fifth overall. This puts Sweden in sixth in the season standings, bottom of the first division. No need for panic yet, but Artemis needs to step up a level if it's to challenge for the top three in Abu Dhabi by the end of the year.",
      },
      {
        type: "image",
        src: "https://thefoil.com/media/5gl269Oi1UNop-cgyp_-7KeiSOececaLC7sTzGwf75g/resize:fit:1200:800/gravity:ce/quality:60/dpr:1/2026/06/sb1-8366.jpg",
        alt: "Simon Bruty/SailGP",
        caption: "Simon Bruty/SailGP",
      },
      {
        type: "heading",
        text: "9. Switzerland",
      },
      {
        type: "paragraph",
        text: "Finished: 10th A middle-of-the-road performance for Switzerland in New York but Sebastien Schneiter can take encouragement from some good rounding positions at Mark One. The Swiss launched the boat nicely off the top end of the start line in Sunday's first race. Fourth down to the bottom gate but with Italy close to leeward on the outside of the rounding, Schneiter was unfortunate to cop a penalty from the umpires as Phil Robertson slowly luffed the Swiss. Coming off worse in these kinds of marginal situations is preventing the Swiss from capitalising on their good moments. After a fifth place in Bermuda, Schneiter will have been hoping for better than eighth in New York.",
      },
      {
        type: "heading",
        text: "10. Denmark",
      },
      {
        type: "paragraph",
        text: "Finished: 7th What has the ocean given you? \"Lots of money,\" was Nicolai Sehested's cheeky, quick-as-a-flash reply to SailGP's upbeat influencer Alex Hobern in the mixed zone after Sunday's racing. The Danish driver was in equally, funny, feisty mood when he spoke to me next. He's sounding increasingly cross about the lack of practice time available in the F50s. So to miss Saturday's racing after no practice racing on Friday was too frustrating for him to take without some kind of comment. After two poor opening races, Denmark finally made amends in Race 3 with a second place behind Canada. So, good to finish on a better note, but the sense of dissatisfaction still prevails. If I could give the Danes extra points for their naughty memes on Instagram, then they'd be the winners of the weekend. When you're frustrated that crane stops play on a stormy Saturday, do you sit around and mope about it? No! You turn to Photoshop and your favourite AI weapon of choice. And you tell the league what you think through the medium of spiky, sardonic humour.",
      },
      {
        type: "image",
        src: "https://thefoil.com/media/OO_nUK9kDu8o2NRUF58qpk8zpfqwbuY0WuGabb-Qrm0/resize:fit:1200:800/gravity:ce/quality:60/dpr:1/2026/08/jj055841.jpg",
        alt: "Jed Jacobsohn/SailGP",
        caption: "Jed Jacobsohn/SailGP",
      },
      {
        type: "heading",
        text: "11. Italy",
      },
      {
        type: "paragraph",
        text: "Finished: 9th Red Bull Italy were well in contention for making the three-boat final after solid performances in the first two fleet races with scores of 6th and 3rd. But then that poorly judged approach to the start line of Race 3, with Italy underestimating the strength of that Hudson River conveyor belt dragging the Red Bull boat too quickly towards the line. With Phil Robertson's priority being to keep the boat from starting early and copping a penalty, he paid a much higher price as he turned the boat 90 degrees away from Mark One and parallel to the start line. With so many blind spots created by the wingsails and jibs in such a hectic, high-traffic zone, it's not that surprising that the US team failed to spot the Italian boat in its path. The subsequent collision from the US team, compounded by a smack in the stern from Brazil, brought Italian hopes to a carbon-splintering end. The collision also raises questions about what the league needs to do to prevent this kind of carnage. Under the current rules, Italy would have been within its rights to steer all the way up to head to wind.",
      },
      {
        type: "heading",
        text: "12. Germany",
      },
      {
        type: "paragraph",
        text: "Finished: 11th Poor starting has been Erik Heil's self-confessed biggest problem on board the German boat. The Germans were marginally over the start line in Sunday's first race, immediately putting them to the back. However, with all the attention on that three-way collision at the start of Race 3, it was easy to overlook the excellent launch out of the line by the Germans who led around Mark One and down to the bottom gate. They were unable to hold the lead, although a fourth place was not too shabby. A lot less shabby than finishing back of the fleet in the two previous races, which relegated Germany to last place in New York (with the exception of Spain of course).",
      },
      {
        type: "image",
        src: "https://thefoil.com/media/a8gmBwhvw6WrCy_Uer1hGfXIMrvD4D8NHfvhFJlkQ6I/resize:fit:1200:800/gravity:ce/quality:60/dpr:1/2026/07/rp2-6524.jpg",
        alt: "Simon Bruty/SailGP",
        caption: "Simon Bruty/SailGP",
      },
    ],
    source: {
      name: "The Foil",
      url: "https://thefoil.com/news/rate-the-fleet-andy-rice-s-verdict-on-sailgp-new-york/",
    },
  },
  "the-questions-that-remain-following-new-york-sailgp": {
    slug: "the-questions-that-remain-following-new-york-sailgp",
    kind: "news",
    title: "The questions that remain following New York SailGP",
    standfirst:
      "The New York SailGP left us with more questions than answers. From a dramatic three-boat collision to a grand final that divided opinion, the sixth round of the season gave the league plenty to reflect on ahead of Halifax.",
    author: "Lewis Smith, Multimedia Editor",
    publishedAt: "6th June 2026 1:03pm",
    heroImage: {
      src: "https://thefoil.com/media/Wqft6xmJNvpT7eImpbnmmODclDsHiK06M7P4ane4DRE/resize:fill-down:1500:500/gravity:fp:0.4787792084:0.701049749/quality:60/dpr:1/2026/06/new-york-sailgp-statue-of-liberty-2026.jpg",
      alt: "The questions that remain following New York SailGP",
    },
    body: [
      {
        type: "heading",
        text: "1. Is it time for new starting rules?",
      },
      {
        type: "paragraph",
        text: "The three-boat collision in race three on Sunday was the defining moment of the weekend, and not for the right reasons. The USA received seven penalty points and Italy four, the correct decisions in accordance with the rules, in my opinion. USA failed to keep clear as a windward boat, and Italy did not do enough to avoid contact.",
      },
      {
        type: "paragraph",
        text: "What I do question, however, is whether the current rules are fit for purpose in the modern context of SailGP. Italy's manoeuvre was not unsportsmanlike under the current rule set, but it was dangerous.",
      },
      {
        type: "paragraph",
        text: "Italy turned almost 90 degrees to the start line, presenting their boat side-on to the oncoming fleet. As Mozzy highlighted to me, the configuration of the start line allowed Italy to sail along it to a degree we rarely see during other SailGP starts. The rules and course configuration permitted it, but should those rules allow it in the first place?",
      },
      {
        type: "paragraph",
        text: "My proposal would be a change to rule 17, aligned with the approach used in Appendix B for windsurfing fleet racing, where at 30 seconds to the gun, all competitors are required to sail their shortest course towards the start line.",
      },
      {
        type: "paragraph",
        text: "Appendix B Windsurfing Fleet Racing Rules",
      },
      {
        type: "paragraph",
        text: "17: On the same tack before a reaching start",
      },
      {
        type: "paragraph",
        text: "Rule 17 is changed to:",
      },
      {
        type: "paragraph",
        text: "When, at the warning signal, the course to the first mark is approximately 90 degrees from the true wind, a board overlapped to leeward of another board on the same tack during the last 30 seconds before her starting signal shall not sail above her shortest course through the starting line to the first mark while they remain overlapped if as a result the other board would need to take action to avoid contact, unless in doing so she promptly sails astern of the other board.",
      },
      {
        type: "paragraph",
        text: "In practice, you would essentially have two phases: the jostle for position before 30 seconds, and then a clean, directional run to the line. Once a team has a lane, they sail it. Any changes in course in the last 30 seconds, and it's the duty of the boat changing course to keep clear.",
      },
      {
        type: "paragraph",
        text: "Whether 30 seconds is the right threshold or whether 10 or 20 seconds might be more appropriate, I'm not certain, but the principle feels right. I think it would go a long way to prevent incidents like the one we saw in New York.",
      },
      {
        type: "heading",
        text: "2. Will we see the USA boat sacrificed for repairs to the Italian's?",
      },
      {
        type: "paragraph",
        text: "This is not without precedent. Cast your mind back to Sassnitz in 2025, when the British and USA boats collided. The USA were deemed to be at fault, and the British boat was too damaged to race on Sunday.",
      },
      {
        type: "paragraph",
        text: "The response? A section of hull from the USA F50 was cut out and donated to Great Britain so they could take to the water. The question now is whether something similar could happen ahead of Halifax.",
      },
      {
        type: "paragraph",
        text: "Italy's boat appears to need the most significant repairs from the New York collision. If there is a genuine risk that the Italian team cannot get their boat ready in time, would SailGP look to the USA to provide a solution? Could we see a sacrifice of the American platform to get Italy back on the start line?",
      },
      {
        type: "paragraph",
        text: "Sources told me that the spare hull sections remaining after the repairs to the French and Kiwi platforms after the Auckland crash have already been air freighted to Halifax to help with the salvage efforts.",
      },
      {
        type: "paragraph",
        text: "A slightly more left-field theory concerns brand new boat 14, which was announced in New York as being the hull that the Black Foils are set to make their return to racing on in Halifax.",
      },
      {
        type: "paragraph",
        text: "As the only team left in SailGP still to source private backing, the Black Foils remain centrally controlled by SailGP. With the Italian boat having commercial interests that may outweigh the Kiwis, could we see boat 14 temporarily handed over to the Italians? Likely not, but I thought I would throw it in there.",
      },
      {
        type: "paragraph",
        text: "As far as I understand, SailGP Technologies plan to have all three boats on the start line in Halifax, but repairs to the Italian boat will be the tightest to complete in time. There's still every chance that we could see one of these solutions deployed by SailGP if the deadlines are too tight.",
      },
      {
        type: "paragraph",
        text: "It is worth watching this one closely.",
      },
      {
        type: "image",
        src: "https://thefoil.com/media/bUdsNnkI6Dz3emjslxat7Y-KzJrYBxzgdkSu1AE5T8/resize:fit:1200:800/gravity:ce/quality:60/dpr:1/2026/06/gbr-sailgp-repair-to-hull-after-crash-with-usa-sassnitz-2025.jpg",
        alt: "USA hull section used to repair GBR in Sassnitz 2025",
        caption: "A section of USA's hull used to repair the damage caused to GBR in Sassnitz 2025",
      },
      {
        type: "heading",
        text: "3. Have Spain been hard done by?",
      },
      {
        type: "paragraph",
        text: "Buried within the boat logistics story is a subplot that deserves its own spotlight: the fate of boat 14 and whether Spain, and the rest of the fleet, have been left short-changed.",
      },
      {
        type: "paragraph",
        text: "Los Gallos have the oldest F50 in the fleet, and it has shown. Diego Botin has always been clear that the boat is not slow, and the team's results show that. When Spain race, they race fast.",
      },
      {
        type: "paragraph",
        text: "The problem is getting to the start line in the first place. Reliability gremlins have plagued the team throughout the season, forcing them out of races through no fault of their own. New York is the most recent example with the team missing out on the point-scoring races on Sunday.",
      },
      {
        type: "paragraph",
        text: "The arrival of boat 14 felt like the natural remedy. The widely held expectation was that the new platform would go to Spain, with the Spanish hull then passing to the Black Foils to get Burling's team back on the water following their devastating crash in Auckland with the French.",
      },
      {
        type: "paragraph",
        text: "That felt fair. The Kiwis crashed out, destroying their boat, whereas Spain have suffered technical issues through no fault of their own. The logic of rewarding the victims of reliability over the Kiwis, who were deemed at fault for their crash, seemed sound.",
      },
      {
        type: "paragraph",
        text: "Then it all changed. It was announced at the New York SailGP press conference that boat 14 would go directly to the Black Foils, with Spain continuing with their ageing hull.",
      },
      {
        type: "paragraph",
        text: "Sources told me that the driving factor behind the decision was time. Repainting the Spanish hull to the Kiwi livery may have pushed the Black Foils' return beyond Halifax, and that is a delay the league is clearly not willing to accept. It seems a few tins of paint may have ultimately decided who receives the new boat.",
      },
      {
        type: "paragraph",
        text: "A deeper point relates to the Pensacola training base, still without its resident F50. Along with the original expectation that Spain would receive boat 14, it was thought that the unreliable Spanish hull would find its new home in Pensacola. Crucially, allowing teams to train - something that is becoming an impossible task in the league. It is easy to underestimate just how deep the knock-on effect of the Auckland crash has had on SailGP.",
      },
      {
        type: "paragraph",
        text: "Giving the Black Foils boat 14 may well be the right call commercially, given the pressure the league faces to get one of its most high-profile teams back on the water. Whether it is the right call for Spain or athletes in need of training time is a harder question to answer.",
      },
      {
        type: "image",
        src: "https://thefoil.com/media/0GyhabQKPll11xdzTpYslISNnIIgpTTIuVQNjY0qP4E/resize:fit:1200:800/gravity:ce/quality:60/dpr:1/2026/06/jl204375.jpg",
        alt: "New Zealand boat 14 platform completed at SailGP Technologies, Southampton",
        caption: "New Zealand's boat 14 platform completed at SailGP Technologies, Southampton",
      },
      {
        type: "heading",
        text: "4. How many boats need to be craned in for scores to count?",
      },
      {
        type: "paragraph",
        text: "Saturday in New York threw up a question that the rulebook has not yet answered cleanly.",
      },
      {
        type: "paragraph",
        text: "Strong wind conditions meant only four boats were successfully craned in. The following morning, SailGP publicly made the call not to count Saturday's results in order to uphold the integrity of the competition.",
      },
      {
        type: "paragraph",
        text: '"In the interest of maintaining the integrity and fairness of competition, the Race Committee has determined that racing sailed on Day 1 will not be scored. Scoring for the Mubadala New York Sail Grand Prix will commence from Day 2, with all results counting towards the 2026 Season Rolex SailGP Championship standings."',
      },
      {
        type: "paragraph",
        text: "That decision was understandable, and one I agree with, but it sits awkwardly alongside what happened in Halifax last year, when two boats were unable to be craned in, and scores counted.",
      },
      {
        type: "paragraph",
        text: "So we now have a spectrum: two boats absent and results stand; eight boats absent and they do not. Somewhere between those two points is presumably a threshold, but it has never been defined.",
      },
      {
        type: "paragraph",
        text: "If a similar situation arises again, the league should not have to make an on-the-spot judgment call. A clear written threshold, determining at what point reduced fleet numbers compromise the validity of racing, would bring consistency and clarity.",
      },
      {
        type: "heading",
        text: "5. Will we ever see VAR in sailing?",
      },
      {
        type: "paragraph",
        text: "I had a great conversation with Freddie on the podcast about the two incidents in the closing 30 seconds of the grand final between Great Britain and Australia. It got me thinking about the broader question of officiating in SailGP.",
      },
      {
        type: "paragraph",
        text: "There was a close rule 10 and rule 11 call in quick succession, and in my view, Great Britain were hard done by on the latter. Based on my review of the footage, I believe Australia should have received a penalty for not keeping clear as a windward boat, which likely would have flipped the result.",
      },
      {
        type: "paragraph",
        text: "Now, I do not envy the umpires. Making those calls at the speed they do, with the pressure they have on them, is genuinely one of the hardest jobs in the sport. I have enormous respect for what they do, and I probably would have made the same decision given the same time frame.",
      },
      {
        type: "paragraph",
        text: "But it does raise the question: would they feel more empowered to make their decisions if they had more time to do so? In a grand final situation, would there ever be a case for placing the winning moment on hold while a brief review takes place? Just like a VAR check in football?",
      },
      {
        type: "paragraph",
        text: "I am not suggesting umpires are getting decisions wrong routinely, far from it. But if the tools exist to get more decisions right, the sport should at least be having the conversation.",
      },
      {
        type: "image",
        src: "https://thefoil.com/media/sI50DcfKkcmy_qjDCtxeA6LWTPsNz-nBL1uIGrnk2U/resize:fit:1200:800/gravity:ce/quality:60/dpr:1/2026/06/rp2-4561.jpg",
        alt: "AUS and GBR before the final mark rounding in New York",
        caption: "AUS and GBR before rounding the final mark to the finish of the event final in New York",
      },
      {
        type: "heading",
        text: "The questions are part of the story",
      },
      {
        type: "paragraph",
        text: "Not all of these questions will be answered publicly. Some may well be resolved behind closed doors, and we may never learn the full picture.",
      },
      {
        type: "paragraph",
        text: "SailGP is one of the best things to happen to sailing in a generation, so these questions are worth asking for athlete safety, the integrity of the competition, and the long-term commercial health of the league.",
      },
    ],
    source: {
      name: "The Foil",
      url: "https://thefoil.com/news/the-questions-that-remain-following-new-york-sailgp/",
    },
  },
  "the-real-story-behind-the-black-foils-new-sailgp-recruits": {
    slug: "the-real-story-behind-the-black-foils-new-sailgp-recruits",
    kind: "news",
    title: "The real story behind the Black Foils' new SailGP recruits",
    standfirst:
      "New Zealand's Black Foils have added two sailors to their crew roster, but only one has officially been announced.",
    author: "Lewis Smith, Multimedia Editor",
    publishedAt: "17th August 2026 3:14pm",
    heroImage: {
      src: "https://thefoil.com/media/6JZMMpbTZfxO1hOuGduvl-mWfum0s0V6Cfxb4zPP-TY/resize:fill-down:1500:500/gravity:fp:0.6278381625:0.3250833809/quality:60/dpr:1/2026/08/black-foils-auckland-2026-brett-phibbs.jpg",
      alt: "The real story behind the Black Foils' new SailGP recruits",
    },
    body: [
      {
        type: "paragraph",
        text: "Announced is Olympic multihull hopeful Kate Stewart, who joins the team as reserve strategist, working alongside Liv Mackay. Not yet announced is the addition of Paris 2024 49er silver medallist William McKenzie to the very same crew roster. The details of the role that McKenzie may or may not play remain unknown.",
      },
      {
        type: "paragraph",
        text: "What is apparent, however, is that the Black Foils may well be using the rest of their season to train up fresh talent. Their absence for the majority of the season has been a devastating blow to their overall result, yet it proves an ideal opportunity to bed in new sailors with little to no risk.",
      },
      {
        type: "image",
        src: "https://thefoil.com/media/iCqF7hupxe5PXHFU28HZXdKO2GI-LrxJkwb_LoBBHWo/resize:fit:1200:800/gravity:ce/quality:60/dpr:1/2026/08/kate-stewart-black-foils.jpg",
        alt: "Black Foils / SailGP - Stewart donning her new Black Foils uniform",
        caption:
          "Black Foils / SailGP - Stewart donning her new Black Foils uniform for a photoshoot ahead of the annoucnement at SailGP Technologies",
      },
      {
        type: "heading",
        text: "Stewart named as reserve strategist",
      },
      {
        type: "paragraph",
        text: "Stewart, 27, joins the team in Sassnitz fresh from the San Pedro Olympic Class Regatta, the first event held on the waters that will host the Los Angeles 2028 Olympic Games. She and crew Micah Wilkinson finished 11th in the Nacra 17 class, one place shy of the finals, but the result does little to mask the intent behind Stewart's Olympic campaign.",
      },
      {
        type: "paragraph",
        text: "The pair had earlier finished fifth at the Nacra 17 European Championship together, and will continue their LA 2028 campaign alongside Stewart's new role with the Black Foils.",
      },
      {
        type: "image",
        src: "https://thefoil.com/media/Sn7wLASg2k5-Ppc0caaC36K8zD0rspPVOlmRmprnzfY/resize:fit:1200:800/gravity:ce/quality:60/dpr:1/2026/08/wilkinson-and-stewart-san-pedro-la28-build-up-regatta-lexi-pline.jpg",
        alt: "Lexi Pline",
        caption: "Lexi Pline",
      },
      {
        type: "paragraph",
        text: "A two-time Youth World Championship medallist, Stewart learned her trade at Wakatere Boating Club in Devonport. She won the Tauranga Cup in 2014 and was only the second girl to have her name engraved on the iconic New Zealand P-Class trophy, the first since Leslie Egnot in 1979.",
      },
      {
        type: "paragraph",
        text: "Her journey to the Black Foils has not been a straightforward one. Stewart stepped away from the Olympic pathway to complete a university degree before returning to the water in 2025, and already appears to be making up for lost time.",
      },
      {
        type: "paragraph",
        text: '"When I left the Olympic pathway, there wasn\'t a long-term pathway for women like the one we have now," Stewart said. "Finishing my degree and seeing the fantastic roles and opportunities available to women today drew me back in. "It\'s an incredible honour to be part of the Black Foils and involved with people who\'ve done amazing things in sailing. They\'re a strong, tight-knit group with real values and mana, and I want to learn as much as I can from Liv."',
      },
      {
        type: "paragraph",
        text: "Her first event with the team will be the Germany Sail Grand Prix on 22-23 August. When she is not on the water, she will support the team from the coaches' booth - a small detail that may point us to McKenzie's role change.",
      },
      {
        type: "image",
        src: "https://thefoil.com/media/uBmHO3Jf8gs9CgYysVlFZb2kh-u2UetE1wg_jvlvzak/resize:fit:1200:800/gravity:ce/quality:60/dpr:1/2026/08/black-foils-portsmouth-ricardo-pintp.jpg",
        alt: "Ricardo Pinto / SailGP - The Black Foils heading for the fans in Portsmouth",
        caption: "Ricardo Pinto / SailGP - The Black Foils heading for the fans in Portsmouth",
      },
      {
        type: "heading",
        text: "McKenzie making moves",
      },
      {
        type: "paragraph",
        text: "McKenzie's path onto the Black Foils' crew roster has been a swift one. The Auckland-born sailor, 29, first appeared on the official team sheet as a coach at the Auckland event earlier this season. He was then named in a similar role as 'coach booth operator' when the team returned to competition in Halifax, and again for Portsmouth. McKenzie's addition to the athlete roster on the tenth of July suggests his role within the setup is evolving into something more than just a coach.",
      },
      {
        type: "image",
        src: "https://thefoil.com/media/8oyf6XfxQNdW78JkrDBmQNThpduIdzuKToGvAxzhqiU/resize:fit:1200:800/gravity:ce/quality:60/dpr:1/2026/08/matt-steven-and-will-mckenzie-black-foils-coaches.jpg",
        alt: "Black Foils / SailGP - Coach booth operator Will McKenzie alongside head coach Matt Steven",
        caption:
          "Black Foils / SailGP - Coach booth operator Will McKenzie (right) alongside head coach Matt Steven (left)",
      },
      {
        type: "paragraph",
        text: "It seems apparent that Stewart will step into the coaching role that McKenzie may well be vacating. McKenzie is a significant coup for the Black Foils. A Paris 2024 Olympic silver medallist who finished second in the men's skiff event alongside helm Isaac McHardie. The New Zealand pair pushed hard all the way to the final and finished behind Spain's Diego Botín and Florian Trittel - who took gold in the same month they won the SailGP Season Four Championship - with Ian Barrows and Hans Henken claiming bronze for the United States.",
      },
      {
        type: "paragraph",
        text: "That podium has since produced some notable SailGP talent. Botín is now co-helmsman of the French America's Cup team, and Henken serves as flight controller for the US SailGP Team. Whether McKenzie follows a similar path on to the Black Foils' F50 in a racing capacity remains to be seen, but his presence on the athlete roster opens the door.",
      },
      {
        type: "image",
        src: "https://thefoil.com/media/abjlufYmF79uovOxtpUzXNA9iY0j2GMRIV_2Z_J36Ek/resize:fit:1200:800/gravity:ce/quality:60/dpr:1/2026/08/isaac-mchardie-will-mckenzie-paris-024-silver-medal-49er-mens-skiff-jean-louis-carli.jpg",
        alt: "Jean-Louis Carli / World Sailing - McHardie and McKenzie pick up their silver medals in Marseille",
        caption: "Jean-Louis Carli / World Sailing - McHardie and McKenzie pick up their silver medals in Marseille",
      },
      {
        type: "heading",
        text: "A change in attitude for the Black Foils",
      },
      {
        type: "paragraph",
        text: "The pair represent a significant strengthening of the team's depth. With Stewart joining as a reserve strategist, the team will be developing a safe pair of hands in that seat. McKenzie's addition to the roster marks a rapid ascension from his role as a coach and could likely see him named as a reserve sailor.",
      },
      {
        type: "paragraph",
        text: "It will be interesting to see whether either of these hires get any race time onboard before the close of the season. If I were among the higher-ups of Black Foils' leadership, with the unsalvageable season result the team finds itself with, I would be seriously considering ensuring both Stewart and McKenzie get race time on board the team's new F50 Manawatītī ahead of 2027. Bedding these sailors in could jeopardise event-winning potential, but that is worth it in my eyes considering the need for SailGP to bring through younger talent. A worthy investment for a Kiwi team needing an impactful resurgence come next season.",
      },
    ],
    source: {
      name: "The Foil",
      url: "https://thefoil.com/news/the-real-story-behind-the-black-foils-new-sailgp-recruits/",
    },
  },
  "the-safest-is-when-you-re-pushing-hard-billy-gooderham-explains-flight-control": {
    slug: "the-safest-is-when-you-re-pushing-hard-billy-gooderham-explains-flight-control",
    kind: "news",
    title: "'The safest is when you're pushing hard' - Billy Gooderham explains flight control",
    author: "Andy Rice, Senior Contributor",
    publishedAt: "26th February 2026 8:07am",
    heroImage: {
      src: "https://thefoil.com/media/0EFxZVDTHUXcC_UfkIMZmj5u_u_mK-qnHR_RB1aVSVA/resize:fill-down:1500:500/gravity:fp:0.4804597701:0.5023331499/quality:60/dpr:1/2026/02/northstar1.jpeg",
      alt: "Billy Gooderham explains flight control",
    },
    body: [
      {
        type: "paragraph",
        text: "Last season, NorthStar SailGP Team's flight controller Billy Gooderham spent most of his race time focused on a piece of PVC tape on the bow of the F50. \"It is now painted on the boat for us with a new paint job this year, so that is a huge upgrade,\" laughs Gooderham, who admits he has little clue what's going on in the race around him. He can't afford to look away from the magic mark on the bow. \"As a flight controller, I have no idea what is going on in the racing. I don't know how we are doing; I don't know if we are doing well or poorly. I know if we are going upwind or downwind, and I know if we are about to manoeuvre. That's about it.",
      },
      {
        type: "paragraph",
        text: '"To be a flight controller and do your job well, you have to be so intensely focused on what you are doing that you don\'t really have knowledge of the external surroundings. You just tune out the external noise."',
      },
      {
        type: "heading",
        text: "A harsh call?",
      },
      {
        type: "paragraph",
        text: 'The tricky job of flight control has been in the news lately since that Auckland crunch between New Zealand and France. As The Foil reported yesterday, a jury hearing found that the Black Foils could have sailed differently. The statement said: "Since all the teams, including NZL, were aware of the consequences of reaching the board protection limit, it was possible for NZL to have avoided passing that threshold by choosing a lower ride height and with less foil cant angle. The choice of ride height and foil cant angle is under the control of a boat and so it was reasonably possible for NZL to avoid the loss of control."',
      },
      {
        type: "paragraph",
        text: 'Asked what he thought about that finding, Gooderham commented: "It sounds a bit harsh. When we are sailing along a reach like that, you have so much going on and you are doing damn close to a hundred kilometres an hour. At the end of the day, you are trying to push as hard as you can, but you are also trying to make sure the five other people on the boat are safe.',
      },
      {
        type: "paragraph",
        text: '"There are so many variables. If the boat accelerates five kilometres an hour all of a sudden, the amount of lift you get out of a daggerboard is significantly more. That acceleration and deceleration can happen so quickly. To me, it sounds a bit harsh, but at the end of the day, it is on us to perform.',
      },
      {
        type: "paragraph",
        text: '"Every once in a while, somebody gets it wrong. They have to try and point a finger somewhere, and I guess that is where they have come to with that conclusion. You hate to see it, but unfortunately, it is part of the sport."',
      },
      {
        type: "image",
        src: "https://thefoil.com/media/uvmGDbpE8mfuYo1m0yqOS5qtIXNdTaXq_gFPwieJtjg/resize:fit:1200:800/gravity:ce/quality:60/dpr:1/2026/02/rp33387.jpg",
        alt: "Flight controller at work",
        caption:
          "Ricardo Pinto / SailGP. The most isolated job on board: flight controllers operate in a narrow window where every input directly shapes lift, speed, and safety. Leo Takahashi, Japan SailGP Team, Season 2",
      },
      {
        type: "heading",
        text: "An ever-changing machine",
      },
      {
        type: "paragraph",
        text: "Gooderham says that while the fundamental controls remain the same, he and his fellow flight controllers are always having to adapt to changes with the software, and occasionally when there are big hardware upgrades. \"From a control perspective, we have the major controls: daggerboard rake, rudder rake, and daggerboard cant. At any given time, you are adjusting all of those. But then there is also software in the boat, which is called the daggerboard protection software, but it is really more platform load protection to make it so that we don't have issues with platform structure.",
      },
      {
        type: "paragraph",
        text: "\"With the old HSB [High Speed Board] J-foil setup, there was a daggerboard load protection system. There was basically only so much negative rake you could get on the daggerboard to protect it from negative loading and snapping. That software basically carried over into the new HSB2 T-foil setup, but it is more of a platform load protection software to make sure we don't break components in the platform.",
      },
      {
        type: "paragraph",
        text: '"With the boards changing, that software is almost a live piece of software. Every time we go out on the water, the data team takes a look at it to see where the pitfalls are and where it is actually working properly. We adjust that from day to day or event to event. When we have an issue like we had in Auckland, we step back and take a huge look at it. We make adjustments to make sure it is doing what it needs to do to protect the structure of the boat, but also allowing the athletes to have control of the boat."',
      },
      {
        type: "image",
        src: "https://thefoil.com/media/-MtcDe_8uYi7mLI0bRP6Dh8jUDygN2zMi0AAv4Hvqo8/resize:fit:1200:800/gravity:ce/quality:60/dpr:1/2026/02/northstar2.jpeg",
        alt: "NorthStar SailGP Team",
        caption: "NorthStar",
      },
      {
        type: "heading",
        text: "F1 parallels",
      },
      {
        type: "paragraph",
        text: 'While the sailors are having to adapt to an ever-changing platform, Gooderham accepts this as being part of a fast-developing technical sport. "If you look at any top-end racing sport, that is usually the key. You look at Formula One and they are putting different setups in the car every day. It is nothing new for high-end racing, but you do have a little bit of a different piece of machinery every day you go out.',
      },
      {
        type: "paragraph",
        text: '"The boats are quite identical, but we do have quite a lot of settings that we can change for personal preferences. We can change the gain rates with respect to how quickly the rake will move back and forth given the human input. We can change a whole host of settings. When you go through the data and look at the settings that each flight controller and each driver puts into their boat, they are different. The boats are one-design, but we have a ton of things we can change the same way that car one and car two in F1 might not be set up the same."',
      },
      {
        type: "paragraph",
        text: "Last season in Saint-Tropez, some teams including the Canadians experienced a loss of control that caused some concern at the time. \"After the events in Saint-Tropez, they [SailGP] had gotten quite concerned with the structural loads in the boat, so they dialled up this structural load limiter. On two occasions, we ran into the rake limiters. When the system calculates that the load in the platform is too much, it basically adds positive rake onto the daggerboard and takes control out of the flight controller's hands.",
      },
      {
        type: "paragraph",
        text: '"We ran into it twice on the Saturday in Saint-Tropez. Every day when we have an incident, we go back and study it, and then the software gets changed. We have had a number of iterations of the load protection software since that happened, but obviously, we found a new case in Auckland where it was going to kick in."',
      },
      {
        type: "image",
        src: "https://thefoil.com/media/dD7wB8WPHacR6BkwoXN-mZp8Le2mDkDDfraeUA3TtVk/resize:fit:1200:800/gravity:ce/quality:60/dpr:1/2026/02/rp2-3532.jpg",
        alt: "F50 at full speed",
        caption:
          "Ricardo Pinto / SailGP. Flat-out flight: at these speeds, the flight controller constantly balances maximum performance with the structural limits of the platform. Perth, Season 6",
      },
      {
        type: "heading",
        text: "Foot on the pedal",
      },
      {
        type: "paragraph",
        text: 'So does that mean there inevitably has to be a compromise between protecting the boat versus providing the sailor with enough range of control? "It is a delicate balance because the boat being in one piece is pretty critical to the safety of the sailors," says Gooderham. "I understand a lot about how these boats work, but I don\'t have the knowledge that the designers and engineers have. It is really hard for me to say where that fine line is on the edge. As an athlete, I want to have as much control as humanly possible; the word \'control\' is in the job description. But you have to weigh the engineering of the boat as well."',
      },
      {
        type: "paragraph",
        text: "Meanwhile, Gooderham knows he has to keep his head down and stay focused on that painted 'piece of tape'. But surely that big crash must have some effect on mindset? \"For me personally, I don't think it changed at all. You don't bear away and hit 102 kmh around the top mark [as Canada did during Auckland] if you are throttling back. The way these boats are, the safest you are is when you are pushing the boat hard. When you try and dial it back, that is when you really see yourself getting into trouble a lot of the time. My mentality is always foot on the gas pedal.\"",
      },
    ],
    source: {
      name: "The Foil",
      url: "https://thefoil.com/news/the-safest-is-when-you-re-pushing-hard-billy-gooderham-explains-flight-control/",
    },
  },
  "the-week-in-racing-10-august-26": {
    slug: "the-week-in-racing-10-august-26",
    kind: "news",
    title: "The week in racing - 10 August '26",
    standfirst:
      "This week saw the Olympic fleets sign off a globe-trotting season on LA's 2028 waters, both New Zealand and France back in their AC75s, plus the start of a 1,805-mile epic around Britain and Ireland. Let's get into it!",
    author: "Benedict Donovan, Deputy Editor",
    publishedAt: "10th August 2026 8:07pm",
    heroImage: {
      src: "https://thefoil.com/media/nHs32--yoraiaCEkMa8gq2a3P3YgNqcDcpzM3AZvODI/resize:fill-down:1500:500/gravity:fp:0.501010101:0.7302059011/quality:60/dpr:1/2026/08/ac75s-pierre-bouras-sam-thom-america-s-cup-png.png",
      alt: "The week in racing - 10 August '26",
    },
    body: [
      {
        type: "heading",
        text: "49er, FX & Nacra 17 fleets close out San Pedro OCR",
      },
      {
        type: "paragraph",
        text: "The San Pedro OCR concluded on Saturday, the skiffs and Nacras scrapping on the same patch of LA water they'll be back on come 2028. Six medal races in flat water and a puffy 16–20 knots, and everyone with a yellow bib on the final day held their nerve to convert it.",
      },
      {
        type: "paragraph",
        text: "In the 49er, Germany's Richard Schultheis and Fabian Rieger sealed gold, ahead of Britain's James Grummett and Rhos Hawes, with Uruguay's Hernán Umpierre and Fernando Diz third. Sweden's Vilma Bobeck and Ebba Berntsson had the 49erFX sewn up by a comfortable 17 points, well ahead of Paula Barcelo and Maria Cantero taking silver for Spain and Britain's Freya Black and Saskia Tidey. Meanwhile the Nacra 17 went right down to the wire: Swedes Emil Järudd and Hanna Jonsson clung on by a single point from the relentless British pair of John Gimson and Anna Burnet, with Dutch duo Willemijn Offerman and Scipio Houtman in third.",
      },
      {
        type: "paragraph",
        text: "That's it for the 2026 Sailing Grand Slam – keep an eye out for our full season wrap coming soon. Full results here.",
      },
      {
        type: "heading",
        text: "Cowes Week wraps up its bicentenary",
      },
      {
        type: "paragraph",
        text: "Cowes Week celebrated its 200th birthday last week, and the Solent laid on a bit of everything across seven days – a 20-knot opener, a rained-on Wednesday, near-30-knot gusts that sent the smaller boats home early, and a glassy, tactical finale. All told, the week featured 641 boats, more than 5,000 sailors, across 43 classes.",
      },
      {
        type: "paragraph",
        text: 'In X One Design, overall honours went to Lone Star, sailed by Phil Lawrence, David King and Nick Froud, who found the near-impossible consistency to win the biggest and most cut-throat class in the fleet – no mean feat against 59 rivals. "We were just blisteringly fast all week," Lawrence said of how they did it. Hong Kong\'s Karl Kwok took the big-boat silverware, his TP52 Beau Geste reeling off six straight bullets to sweep IRC Class Zero and pocket both the Britannia Cup and the New York Yacht Club Challenge Cup.',
      },
      {
        type: "paragraph",
        text: "The bicentenary threw up a brand-new prize, the Bicentenary Gold Cup, claimed by Andy Maskell's Contessa 33 High Spirit. The Black Group went to the last race, Ben Rogers' Contessa 32 Solan Goose just pipping Sam Laidlaw's Quarter Tonner BLT. And after a 50-year absence, the Folkboats were back as a class, Gybe N' taking the win for Cy Grisley and Simon Evans. Check results across all classes here.",
      },
      {
        type: "heading",
        text: "AC recon: ETNZ and La Roche-Posay back in the AC75",
      },
      {
        type: "paragraph",
        text: "Last week Emirates Team New Zealand rolled out their AC75 in Auckland for the first time in two months, kicking off a fortnight of mid-winter testing. With Nathan Outteridge, Andy Maloney, Iain Jensen and Jo Aleh in their usual slots – and Chris Draper back on second helm while Seb Menzies was off racing the 49er in LA – the opening day appeared to be all about straight-line speed rather than manoeuvres. The boat looked quick and settled, up on the foils without much fuss, the sense being of a team fine-tuning what they've got rather than chasing anything flashy.",
      },
      {
        type: "paragraph",
        text: "The French, meanwhile, will be breathing a lot easier than they were a month ago. That low-speed capsize, which flooded key electrical systems and sent up a worrying cloud of smoke, had threatened to stall the whole campaign, so getting back on the water and stringing together a proper, clean day on the foils is exactly what was needed. It seems they've made the most of being back: a cautious re-commissioning sail was followed by their longest session spent foiling of the campaign yet, including an opening run of around 35 minutes up and flying. On this evidence, the wobble of a month ago looks well behind them.",
      },
      {
        type: "paragraph",
        text: "Newcomer Maelenn Lemaitre – a multiple women's match-racing world champion drafted in barely a month ago – was still buzzing (and, by her own admission, slightly fried) after a day soaking up data, while 2025 Moth world champion Enzo Balanger added more firepower to a strong mixed crew. The team reckon the enforced downtime has let them settle into a slower, more deliberate rhythm, and while they trail the Kiwis and Italians on water time, they're comfortably ahead of the other three challengers, who have yet to launch their AC75s.",
      },
      {
        type: "heading",
        text: "Triantou and Gosling crowned at the ILCA 4 Youth Worlds",
      },
      {
        type: "paragraph",
        text: "In Aarhus, Denmark 448 young sailors from more than 50 nations took part in the ILCA 4 Youth World Championship for a windy, sun-soaked week on the bay. Greece's Eleni Triantou took the girls' title on her Worlds debut, holding it together on a nervy last day to seal the win. In the boys' fleet, Switzerland's Leo Gosling was a clear winner – the biggest result of his young career. \"I'm lost for words. It's not my first title, but this is definitely the biggest moment in my sailing career so far,\" the 15-year-old said after. And he's not done yet, sticking around to line up in next week's ILCA 6 Youth Worlds at the same venue. Full results here.",
      },
      {
        type: "heading",
        text: "TO WATCH THIS WEEK:",
      },
      {
        type: "heading",
        text: "74 boats line up for 470 Worlds in Japan",
      },
      {
        type: "paragraph",
        text: "Starting today, the 470s convene in Enoshima, Japan – the Tokyo 2020 venue, all thermal breeze and tricky tides – for a record 74-boat fleet drawn from 28 nations. Spain's Jordi Xammar arrives chasing a hat-trick of world titles alongside Marta Cardona, but he'll have his work cut out. Britain's Martin Wrigley and Bettine Harris are the form crew of the year, having swept the Europeans, World Cup wins in Palma and Hyères and, just a couple of weeks ago, the San Pedro OCR on the LA 2028 waters. Germany's Simon Diesch and Anna Markfort, last year's runners-up, and Sweden's returning Paris 2024 bronze medallists Anton Dahlberg and Lovisa Lindner round out a fearsome shortlist. \"It's really nice to be back in Japan,\" said Wrigley. \"We're really excited to try and put everything together for the biggest event of the year.\"",
      },
      {
        type: "paragraph",
        text: "Qualifying runs from 12–13 August, the fleet splits into Gold and Silver from the 14th, and the top ten settle it in the medal race on the 17th.",
      },
      {
        type: "heading",
        text: "Open Team Racing World Championships make their European debut",
      },
      {
        type: "paragraph",
        text: "Stockholm hosts the Team Racing World Championship from 12–16 August, the first time the competition has come to Europe. It'll take place right in the heart of the city on Riddarfjärden, in the shadow of City Hall, on a course barely 380 metres across. Twelve nations and 96 sailors will go at it in matched J/80s, two boats a side, in a mixed-crew format built on close-quarters manoeuvring, clever use of dirty air and the right-of-way rules, with umpires policing it all in real time. There'll be well over a hundred short, sharp races across the week, all free to watch from the quaysides.",
      },
      {
        type: "paragraph",
        text: 'Defending champions Tim Wadlow and Will Bailey, sailing for the USA, are the crew everyone will have their eyes on. "Racing in J/80s is new for us, so there\'s been a steep learning curve," says Bailey. "The races are short, intense and incredibly close. Anyone can win any race, which makes it exciting for sailors and spectators alike."',
      },
      {
        type: "heading",
        text: "Pace leads early as Round Britain and Ireland Race turns 50",
      },
      {
        type: "paragraph",
        text: "The RORC's Round Britain and Ireland Race set off from Cowes on Sunday for its 50th running, 32 boats and 182 sailors heading east into a light Solent breeze. Two hours in, Johnny Vincent's Volvo 70 Pace had nosed to the front, the German Ker 56 Varuna VI a mile back, while in the Class40s there was nothing between Pierre LeBoucher's Penfret and Greg Leonard's Swift. Early days, though – 1,800-odd miles is a very long time to stay in front.",
      },
      {
        type: "paragraph",
        text: 'Keep an eye on the IRC Zero heavyweights – Pace, Varuna VI and Antoine Magre\'s radical scow-bowed Palanad 4 – as they trade blows for line honours and the overall corrected-time prize. "This is probably one of the hardest races out there," says Magre. The Class40s settle it on elapsed time alone, and the newest scow-bowed designs from Britain, America and France might just threaten the record should the weather oblige. Track the fleet and check live rankings.',
      },
      {
        type: "image",
        src: "https://thefoil.com/media/00zStfAC_EckhpiN1NuYbf9GrC4LNNwI-X_JkBfAS44/resize:fit:1200:800/gravity:ce/quality:60/dpr:1/2026/08/rbi-james-tomlinson-rorc-1.jpeg",
        alt: "Start of 2026 RORC Round Britain and Ireland, Cowes",
        caption: "Start of 2026 RORC Round Britain and Ireland, Cowes",
      },
    ],
    source: {
      name: "The Foil",
      url: "https://thefoil.com/news/the-week-in-racing-10-august-26/",
    },
  },
  "podcast-america-s-cup-is-back-the-full-cagliari-debrief": {
    slug: "podcast-america-s-cup-is-back-the-full-cagliari-debrief",
    kind: "podcast",
    title: "Podcast: America's Cup is back! The full Cagliari debrief",
    publishedAt: "28th May 2026 3:00pm",
    heroImage: {
      src: "https://thefoil.com/media/QC63HrRW6EbWcsJUKFTuRGnQi13s8A0ewfrCmh2Y5vc/resize:fill-down:1500:500/gravity:fp:0.3041738136:0.4733671339/quality:60/dpr:1/2026/05/e8tkvl1yBE4.jpg",
      alt: "America's Cup is back! The full Cagliari debrief",
    },
    body: [
      {
        type: "paragraph",
        text: "The America's Cup is finally back, and after eighteen months of SailGP we'd almost forgotten how different it feels. So Neil Cole sits down with Freddie Carr and Lewis Smith – The Foil's new reporter and multimedia editor, just back from Cagliari – to dive into our very first taste of AC38 fleet racing.",
      },
      {
        type: "paragraph",
        text: 'Lewis was on the ground for (nearly) the whole weekend, and shares his hot take: he prefers the AC40s to the AC75s, seeing the smaller boats as more playful and fun to chuck about. He and Freddie dig into how all the racing unfolded, from the chop of day one to the great leveller of flat water on day three, and the autopilot "superpower" that had the Luna Rossa Women & Youth crew outclassing everyone – right up until it all unravelled.',
      },
      {
        type: "paragraph",
        text: "The guys discuss what it's like to come back to the Cup after living in SailGP – the longer races, the space on the course, the upwind starts, the joy of actually being able to hear the calls on board – and then run a quickfire vibe check on all eight teams.",
      },
      {
        type: "paragraph",
        text: "We've also got the news of a second prelim in Naples at the end of September, Freddie on the legal cloud hanging over Athena Racing, then it's a switch to SailGP and what's brewing in New York this weekend, where the question remains: who, if anyone, can stop the Aussies?",
      },
    ],
    source: {
      name: "The Foil",
      url: "https://thefoil.com/news/podcast-america-s-cup-is-back-the-full-cagliari-debrief/",
    },
  },
  "podcast-can-anyone-beat-new-zealand-to-win-the-38th-america-s-cup": {
    slug: "podcast-can-anyone-beat-new-zealand-to-win-the-38th-america-s-cup",
    kind: "podcast",
    title: "Podcast: Can anyone beat New Zealand to win the 38th America's Cup?",
    publishedAt: "8th July 2026 6:11pm",
    heroImage: {
      src: "https://thefoil.com/media/yPhTQLNPYDhh1larcpaxD9E8my3E2TAWDKOF6MS44zU/resize:fill-down:1500:500/gravity:fp:0.5:0.5/quality:60/dpr:1/2026/07/foil-podcast-ep27.jpg",
      alt: "Can anyone beat New Zealand to win the 38th America's Cup?",
    },
    body: [
      {
        type: "paragraph",
        text: "A year out, The Foil's podcast team ask the key question: can any of the six teams lining up against the Defender really take on and beat Emirates Team New Zealand in Naples at the 38th America's Cup next July? We run through the teams to assess what we know so far.",
      },
      {
        type: "paragraph",
        text: 'ETNZ has Defender privilege – but under the rules of the new partnership arrangement, AC veteran Freddie Carr and Lewis Smith ask whether they have "depowered their advantage" by accepting Naples as the venue rather than racing on their own home waters.',
      },
      {
        type: "paragraph",
        text: 'On the point of home advantage, Freddie refers back to his own experience sailing with Luna Rossa in the AC World Series in Naples in 2012 and \'13, when he experienced his "rock star moment" in sailing firsthand. Racing at home really can make a difference.',
      },
      {
        type: "paragraph",
        text: 'As Lewis says, Luna Rossa was "a league ahead" in the recent Cagliari Prelim, and asks whether there might also be an operational advantage working from home.',
      },
      {
        type: "paragraph",
        text: "Meanwhile, The French La Roche-Posay team have hit the water in the past week and can make the most of 10 extra sailing days – even if they have capsized this week. Working out of same design stable as ETNZ, Lewis and Freddie weigh up their challenge.",
      },
      {
        type: "paragraph",
        text: "As for the Swiss Alinghi squad, question marks remain over their hardware following the huge capsize last time out in Barcelona, and they are pinned as a late starter too.",
      },
      {
        type: "paragraph",
        text: 'As for the official Challenger of Record, unashamed patriot Freddie labels GB1 as the "dark horse for this Cup", acknowledging the distracting context of the legal battle between Athena Racing and Ineos over the ownership of the British AC75.',
      },
      {
        type: "paragraph",
        text: 'The return of Australia is an exciting moment for the Cup, but the team has been up front and honest about their biggest challenge: a lack of time. Freddie describes them as "underdogs".',
      },
      {
        type: "paragraph",
        text: 'Finally, the USA. As Freddie puts it, they are "super under the radar" given the little amount of information that has been confirmed about the American effort. Lewis and Freddie then summarise the fleet and come up with the answers to that big leading question…',
      },
      {
        type: "paragraph",
        text: "Lewis also brings us news of The Foil Live, our first public event taking place on the morning of Sunday 26 July. We're taking over Musto's flagship Lighthouse store in Portsmouth ahead of the final day of racing at Emirates Great Britain SailGP for a live podcast – and it's free to attend. Get your free tickets here.",
      },
    ],
    source: {
      name: "The Foil",
      url: "https://thefoil.com/news/podcast-can-anyone-beat-new-zealand-to-win-the-38th-america-s-cup/",
    },
  },
  "podcast-ep-8-sydney-sailgp-preview-and-quentin-delapierre-on-safety": {
    slug: "podcast-ep-8-sydney-sailgp-preview-and-quentin-delapierre-on-safety",
    kind: "podcast",
    title: "Podcast Ep. 8 - Sydney SailGP preview + Quentin Delapierre on safety",
    standfirst: "Sydney SailGP is almost here, but the Auckland collision casts a long shadow.",
    publishedAt: "25th February 2026 2:45pm",
    heroImage: {
      src: "https://thefoil.com/media/pf7Dl2EgbwypjxsUHwypXk4D79FhfHC2socID5hBH3A/resize:fill-down:1500:500/gravity:fp:0.4045977011:0.1304243587/quality:60/dpr:1/2026/02/S6ComfUT55I.jpg",
      alt: "Sydney SailGP preview + Quentin Delapierre on safety",
    },
    body: [
      {
        type: "paragraph",
        text: "In this week's episode, the team digs into one of the most consequential weekends in SailGP's seven-year history. France skipper Quentin Delapierre joins to fill us in about what happened in Auckland and what comes next. Manon Audinet spent over a week in hospital, and the French team has brought in a psychologist to support their athletes.",
      },
      {
        type: "paragraph",
        text: "Quentin's message is clear: injuries will happen in extreme sport. The question is how the league responds. Split fleets? Halos? Stronger pods? He believes the answers will come through collaboration – and he won't be walking away. \"I will not quit the league,\" he says. \"I'm fully into it, and I'm focused to win this championship one day. But some of the athletes have concerns, and that's normal.\"",
      },
      {
        type: "paragraph",
        text: "The podcast also previews Sydney's twilight racing, where shifty harbour breeze and the tactical puzzle of Shark Island await. With France and New Zealand sidelined, the championship door is open for teams who can seize the moment. Australia and Great Britain are the boats to beat on equal points at the top of the season leaderboard. But lighter winds could create opportunities nobody saw coming.",
      },
    ],
    source: {
      name: "The Foil",
      url: "https://thefoil.com/news/podcast-ep-8-sydney-sailgp-preview-and-quentin-delapierre-on-safety/",
    },
  },
  "podcast-extra-mozzy-and-freddie-preview-the-ac38-cagliari-prelim": {
    slug: "podcast-extra-mozzy-and-freddie-preview-the-ac38-cagliari-prelim",
    kind: "podcast",
    title: "Podcast Extra: Mozzy and Freddie preview the AC38 Cagliari prelim",
    author: "Benedict Donovan",
    publishedAt: "21st May 2026 11:20am",
    heroImage: {
      src: "https://thefoil.com/media/UeWPuJPQDhw_-gljypBbZ6nw9GehhvubDGSE222Hq9A/resize:fill-down:1500:500/gravity:fp:0.1914893617:0.4600980829/quality:60/dpr:1/2026/05/A8I5xxHXMuY.jpg",
      alt: "Mozzy and Freddie preview the AC38 Cagliari prelim",
    },
    body: [
      {
        type: "paragraph",
        text: "Mozzy and Freddie are back with a bonus podcast, previewing the AC38 Cagliari preliminary regatta, the curtain-raiser on the road to Naples.",
      },
      {
        type: "paragraph",
        text: "With only 11 of last Cup's AC75 sailors returning to the racecourse, and a fresh wave of names making their debuts, this opening regatta in Sardinia feels less like a tune-up and more like the moment the next America's Cup cycle properly begins.",
      },
      {
        type: "paragraph",
        text: "Mozzy and Freddie work through every announced crew list – from Emirates Team New Zealand's Outteridge–Menzies pairing and the lingering Blair Tuke question, to GB1's surprising helm call, Athena Racing's two-female-helm setup, Luna Rossa's almost-too-stacked talent pool, Alinghi's freshly assembled lineup, and the French team's combination that could yet emerge as the dark horse of the weekend.",
      },
      {
        type: "paragraph",
        text: "The Cagliari prelim also marks the first time we'll see B-boat sailors racing for seats on the AC75 itself – a significant format change that could reshape squad dynamics across every syndicate as the fleet builds towards Naples 2027.",
      },
    ],
    source: {
      name: "The Foil",
      url: "https://thefoil.com/news/podcast-extra-mozzy-and-freddie-preview-the-ac38-cagliari-prelim/",
    },
  },
  "podcast-it-starts-with-a-dream-glenn-ashby-on-australia-s-ac38-challenge-the-foil-podcast-ep-20": {
    slug: "podcast-it-starts-with-a-dream-glenn-ashby-on-australia-s-ac38-challenge-the-foil-podcast-ep-20",
    kind: "podcast",
    title: 'Podcast: "It starts with a dream": Glenn Ashby on Australia\'s AC38 challenge - The Foil Podcast - Ep 20',
    standfirst:
      "\"The time is now,\" decorated sailor Glenn Ashby tells The Foil's Freddie Carr in an exclusive interview on Team Australia's newly-minted challenge for the 38th America's Cup.",
    publishedAt: "21st May 2026 8:10am",
    heroImage: {
      src: "https://thefoil.com/media/A38UovWqdi6h-hsoVQI85zueeFhIOqCmeU0LsevVTMY/resize:fill-down:1500:500/gravity:fp:0.4638297872:0.294248774/quality:60/dpr:1/2026/05/SUASYivtly8.jpg",
      alt: "Glenn Ashby on Australia's AC38 challenge",
    },
    body: [
      {
        type: "paragraph",
        text: 'In a long-promised one-on-one with The Foil, Ashby tells his old friend about how Australia\'s return to the Cup for the first time since 2000 came together, and how by the end of this year an expansion to "80-100 people" must be complete.',
      },
      {
        type: "paragraph",
        text: "The feeling and process of building up a team from scratch carries echoes for Ashby of his part in Emirates Team New Zealand's victory in the 2017 Cup in Bermuda. He also reflects on the technical support from the Kiwi effort this time via the shared design philosophy. \"We wouldn't be in Naples next year without the support of ETNZ,\" he admits.",
      },
      {
        type: "paragraph",
        text: "Ashby predicts much tighter performance between the teams than we saw in the 2024 AC37 in Barcelona, and explains what success will look like for the Australians following their relatively late entry for Naples.",
      },
      {
        type: "paragraph",
        text: "Before the Ashby interview, The Foil's team discuss other matters of the moment, including the 49er, 49FX and Nacra 17 World Championships in France. Andy Rice, who was part of the live stream commentary team in Quiberon Bay, gives us the lowdown and presents a pair of interviews: one with new 49er World Champions Seb Menzies and George Lee Rush, the other with Gianluigi Ugolini and Maria Giubilei who clinched the Nacra 17 crown.",
      },
      {
        type: "paragraph",
        text: "NEXT UP: PODCAST EXTRA Keep an eye on the channel this week for an extra show, as Tom 'Mozzy' Morris and Freddie Carr preview the AC38 Preliminary Regatta which takes place in Cagliari this weekend. The duo dissect the teams and crew line-ups as the build-up to Naples in 2027 properly begins.",
      },
    ],
    source: {
      name: "The Foil",
      url: "https://thefoil.com/news/podcast-it-starts-with-a-dream-glenn-ashby-on-australia-s-ac38-challenge-the-foil-podcast-ep-20/",
    },
  },
  "podcast-sailgp-vs-america-s-cup-can-they-coexist": {
    slug: "podcast-sailgp-vs-america-s-cup-can-they-coexist",
    kind: "podcast",
    title: "Podcast: SailGP vs America's Cup: Can they coexist?",
    standfirst: "Sailing has never been healthier – and on this week's pod, that's exactly the problem.",
    publishedAt: "2nd July 2026 11:18am",
    heroImage: {
      src: "https://thefoil.com/media/tOANz4G66QsEXxzLuN5fNrcEQq6r6_9UNtcYMdlq1dI/resize:fill-down:1500:500/gravity:fp:0.4962835906:0.6871458395/quality:60/dpr:1/2026/07/pod26thumb.jpg",
      alt: "SailGP vs America's Cup: Can they coexist?",
    },
    body: [
      {
        type: "paragraph",
        text: "Episode 26 sees Neil Cole, Andy Rice, Lewis Smith and Freddie Carr wrestle with a question that's been sitting uncomfortably in the background: with SailGP, AmericasCup and the Olympics all booming at once, can they share a calendar – or will they start eating each other alive?",
      },
      {
        type: "paragraph",
        text: "The team trace the rivalry back to Bermuda 2017 and the framework agreement Grant Dalton never signed, then lay out just how tight the 2027 calendar really is – nine SailGP weekends, new AC75s splashing and a Cup to be won, plus an Olympic qualification cycle all fighting for the same patch of summer.",
      },
      {
        type: "paragraph",
        text: "Freddie, who knows the Cup's demands better than most, weighs life-changing SailGP prize money against the historical pull of helming a Cup boat, while Lewis – a former World Sailing insider – explains why the governing body faces an almost impossible juggling act. There's a hard look at the cautionary tale of golf's PGA–LIV war, a debate over who actually has the clout to knock heads together, and a real worry that the Olympics, and the women and youth coming through, could be the ones squeezed out.",
      },
      {
        type: "paragraph",
        text: "There's also offshore news, a look at Foiling Week, and a closing poll that has the panel split. Which one would you go for: SailGP riches, an Olympic gold, or the Auld Mug?",
      },
    ],
    source: {
      name: "The Foil",
      url: "https://thefoil.com/news/podcast-sailgp-vs-america-s-cup-can-they-coexist/",
    },
  },
  "podcast-the-six-american-sailors-chosen-to-take-back-the-cup": {
    slug: "podcast-the-six-american-sailors-chosen-to-take-back-the-cup",
    kind: "podcast",
    title: "Podcast: The six American sailors chosen to take back the Cup",
    publishedAt: "12th August 2026 9:45am",
    heroImage: {
      src: "https://thefoil.com/media/sQjWE4fE-gq9mwrgjJduvJZsZt0ybiUE0r7bgP0IvYk/resize:fill-down:1500:500/gravity:fp:0.52:0.4050162564/quality:60/dpr:1/2026/08/foil-podcast-ep33-thumb.png",
      alt: "The six American sailors chosen to take back the Cup",
    },
    body: [
      {
        type: "paragraph",
        text: "The America's Cup teams are taking shape, and this week there are some fascinating new names entering the picture.",
      },
      {
        type: "paragraph",
        text: "Lewis Smith, Andy Rice and Neil Cole look at the newly announced United States America's Cup crew, the strong crossover with the US SailGP Team and one particularly notable omission: Taylor Canfield. Could he still join the campaign, and how much catching up does the new American challenger have to do before Naples?",
      },
      {
        type: "paragraph",
        text: "There's also a major development for GB1 with Jemima Lines confirmed as the fifth sailor aboard the AC75, before attention turns to LA 2028. With Olympic sailors getting their first proper taste of the waters off Los Angeles, we look at what they're already learning about the venue, some impressive early performances and the sailors attempting to balance Olympic campaigns with SailGP and America's Cup commitments.",
      },
      {
        type: "paragraph",
        text: "Plus, Andy pays tribute to legendary sailing photographer Carlo Borlenghi, and we catch up on the latest from the 470 Worlds and the Round Britain and Ireland Race.",
      },
      {
        type: "paragraph",
        text: "This episode is brought to you by Saily, the eSIM built by the team behind NordVPN. Available across more than 200 destinations, with plans flexible enough for a weekend away or a full season chasing the SailGP circuit – no SIM swap, no roaming bill shock, no wandering foreign airports hunting for Wi-Fi. We use Saily ourselves when travelling to events, like we'll be doing in Sassnitz next week. Download Saily from the app store and use code FOIL15 at checkout for 15% off your first purchase.",
      },
    ],
    source: {
      name: "The Foil",
      url: "https://thefoil.com/news/podcast-the-six-american-sailors-chosen-to-take-back-the-cup/",
    },
  },
  "emirates-dubai-sail-grand-prix-presented-by-dp-world": {
    slug: "emirates-dubai-sail-grand-prix-presented-by-dp-world",
    kind: "event",
    title: "Emirates Dubai Sail Grand Prix, presented by DP World",
    standfirst:
      "Dubai has been a calendar fixture since Season 3, maintaining its presence through commercial considerations alongside varying wind conditions.",
    heroImage: {
      src: "https://thefoil.com/media/0-4ZPRNgFckWAz7FKyqDYFOfQx7JUCwAVYrpYm2CtgM/resize:fill-down:1500:500/gravity:fp:0.5:0.5/quality:60/dpr:1/2025/12/felix-diemer-sailgp-1.png",
      alt: "Emirates Dubai Sail Grand Prix, presented by DP World",
    },
    body: [
      {
        type: "paragraph",
        text: "Dubai has been a calendar fixture since Season 3, maintaining its presence through commercial considerations alongside varying wind conditions.",
      },
      {
        type: "paragraph",
        text: "The venue is characterized by slow, tactical racing requiring a distinct skill set. New Zealand dominated the past two seasons with consecutive event wins, utilizing patient sailing strategies. Combined with Abu Dhabi, this represents a late-season stretch where light-air proficiency significantly influences championship outcomes. November weather provides warm conditions and evening cultural activities for spectators, though on-water action may lack dramatic moments.",
      },
      {
        type: "paragraph",
        text: "Past Winners: Australia (Season 3), New Zealand (Seasons 4 + 5).",
      },
    ],
    eventDate: "21 - 22 Nov 2026",
    location: "Dubai, United Arab Emirates",
    source: {
      name: "The Foil",
      url: "https://thefoil.com/series/sailgp/events/emirates-dubai-sail-grand-prix-presented-by-dp-world/",
    },
  },
  "france-sail-grand-prix-saint-tropez": {
    slug: "france-sail-grand-prix-saint-tropez",
    kind: "event",
    title: "France Sail Grand Prix | Saint-Tropez",
    standfirst: "SailGP returns to the French Riviera as the fleet lines up off Saint-Tropez.",
    heroImage: {
      src: "https://thefoil.com/media/AkEim6m0U1cJz2068elEZnJEdGZzKG6_RMvmMZ0HojI/resize:fill-down:690:388/gravity:fp:0.5127659574:0.5173727167/quality:60/dpr:2/2026/06/sv3-3959-samo-vidic-for-sailgp.jpg",
      alt: "France Sail Grand Prix, Saint-Tropez",
    },
    eventDate: "26 - 27 Sept 2026",
    location: "Saint-Tropez, France",
    body: [
      {
        type: "paragraph",
        text: "The SailGP circuit heads to the Cote d'Azur for the France Sail Grand Prix, with the F50 fleet racing in the bay off Saint-Tropez across a two-day weekend of fleet racing and a podium final.",
      },
      {
        type: "paragraph",
        text: "Expect close, high-speed action in the Mediterranean breeze as the season's title contenders trade places on the leaderboard ahead of the Grand Final.",
      },
    ],
    source: {
      name: "The Foil",
      url: "https://thefoil.com/series/",
    },
  },
  "mubadala-abu-dhabi-sail-grand-prix-2026-season-grand-final-presented-by-abu-dhabi-sports-council": {
    slug: "mubadala-abu-dhabi-sail-grand-prix-2026-season-grand-final-presented-by-abu-dhabi-sports-council",
    kind: "event",
    title: "Mubadala Abu Dhabi Sail Grand Prix 2026 Season Grand Final, presented by Abu Dhabi Sports Council",
    standfirst:
      "The season culminates in Abu Dhabi with predictable conditions of flat water and fickle breezes, where light-wind racing determines the championship outcome.",
    heroImage: {
      src: "https://thefoil.com/media/u_3RZoIvGq64-515eZqIMQqFZqGzchgeK_K1ltOQmRo/resize:fill-down:1500:500/gravity:fp:0.5:0.5/quality:60/dpr:1/2025/12/ricardo-pinto-sailgp-5-1.png",
      alt: "Mubadala Abu Dhabi Sail Grand Prix 2026 Season Grand Final",
    },
    body: [
      {
        type: "paragraph",
        text: "The season culminates in Abu Dhabi with predictable conditions of flat water and fickle breezes, where light-wind racing determines the championship outcome.",
      },
      {
        type: "paragraph",
        text: "Abu Dhabi has hosted the Grand Final since Season 5, inheriting duties from San Francisco. Expected conditions include flat water and unpredictable wind patterns, with boats frequently off the foils. While critics argue a championship shouldn't depend on fortunate wind shifts, Season 5 demonstrated competitive merit. Denmark achieved their first event victory, and the final featured sustained lead changes among Great Britain, Australia, and New Zealand before Great Britain secured the title.",
      },
      {
        type: "paragraph",
        text: "Light-air racing compresses the field and amplifies tactical errors, maintaining overtaking opportunities throughout races. Though less visually dramatic than previous venues, the conditions create volatile racing scenarios. Past Winners: New Zealand (Season 4), Denmark (Season 5).",
      },
    ],
    eventDate: "28 - 29 Nov 2026",
    location: "Abu Dhabi, United Arab Emirates",
    source: {
      name: "The Foil",
      url: "https://thefoil.com/series/sailgp/events/mubadala-abu-dhabi-sail-grand-prix-2026-season-grand-final-presented-by-abu-dhabi-sports-council/",
    },
  },
  "rockwool-germany-sail-grand-prix-sassnitz": {
    slug: "rockwool-germany-sail-grand-prix-sassnitz",
    kind: "event",
    title: "Rockwool Germany Sail Grand Prix | Sassnitz",
    standfirst:
      "The Season 5 debut venue proved exceptional despite its remote location, featuring flat water and reliable wind conditions where Denmark set a new SailGP speed record of 103.93 km/h.",
    heroImage: {
      src: "https://thefoil.com/media/XX6QIScWVaKxTXPixNeZYYS4qKY5vjp5_F7nc5CEq2E/resize:fill-down:1500:500/gravity:fp:0.5:0.5/quality:60/dpr:1/2025/12/ricardo-pinto-sailgp-1-1.png",
      alt: "Rockwool Germany Sail Grand Prix | Sassnitz",
    },
    body: [
      {
        type: "paragraph",
        text: "The Season 5 debut venue proved exceptional despite its remote location. The event featured flat water and reliable wind conditions, with Denmark setting a new SailGP speed record of 103.93 km/h. France won the final after overcoming significant drama during training when their rudder failed and helm Quentin Delapierre was hospitalized.",
      },
      {
        type: "paragraph",
        text: "A small town on Rügen Island, Sassnitz emerged as \"one of the best events on the calendar.\" Spectators enjoyed clifftop viewing with exceptional sightlines. Beyond the record-breaking speed, the weekend included structural damage to Brazil's boat and France's dramatic overnight rebuild, culminating in their victory over Australia and Great Britain.",
      },
      {
        type: "paragraph",
        text: "Past Winners: France (Season 5).",
      },
      {
        type: "image",
        src: "https://thefoil.com/media/DM82DNXZ1lF7feoOTnLuM5oggQFj5FXqry1KL0hnlUQ/resize:fill-down:460:240/gravity:fp:0.5:0.5/quality:60/dpr:1/2026/08/jl108682-1.jpg",
        alt: "Rockwool Germany Sail Grand Prix | Sassnitz",
      },
      {
        type: "image",
        src: "https://thefoil.com/media/gUlndc801kA1Z-tweul-3LxIh_CtJC3te21BM-8cTjg/resize:fill-down:460:240/gravity:fp:0.3326984127:0.3358586792/quality:60/dpr:1/2026/08/formulawingworlds-iwsa-media-robert-hajduk.jpg",
        alt: "Rockwool Germany Sail Grand Prix | Sassnitz",
      },
      {
        type: "image",
        src: "https://thefoil.com/media/3hjjWpZEmRAi9R_bOCS88lWsXMkTy3SQ5Sd6e8m8/resize:fill-down:460:240/gravity:fp:0.5:0.5/quality:60/dpr:1/2026/02/rp2-4109.jpg",
        alt: "Rockwool Germany Sail Grand Prix | Sassnitz",
      },
    ],
    eventDate: "22 - 23 Aug 2026",
    location: "Sassnitz, Rügen Island, Germany",
    source: {
      name: "The Foil",
      url: "https://thefoil.com/series/sailgp/events/rockwool-germany-sail-grand-prix-sassnitz/",
    },
  },
  "rolex-switzerland-sail-grand-prix-geneva": {
    slug: "rolex-switzerland-sail-grand-prix-geneva",
    kind: "event",
    title: "Rolex Switzerland Sail Grand Prix | Geneva",
    standfirst:
      "SailGP has raced at some stunning locations, but Geneva might just top the lot. A vast freshwater lake ringed by snow-capped Alps, with the city's elegant waterfront providing a postcard-perfect backdrop.",
    heroImage: {
      src: "https://thefoil.com/media/JGHXPT1Mc8OEpoT9eNAlSIbi-94ud0Ff6dIegvAcxxM/resize:fill-down:1500:500/gravity:fp:0.5:0.5/quality:60/dpr:1/2026/01/sailgp-geneva-event.png",
      alt: "Rolex Switzerland Sail Grand Prix | Geneva",
    },
    body: [
      {
        type: "paragraph",
        text: "SailGP has raced at some stunning locations, but Geneva might just top the lot. A vast freshwater lake ringed by snow-capped Alps, with the city's elegant waterfront providing a postcard-perfect backdrop.",
      },
      {
        type: "paragraph",
        text: "The venue offers exceptional conditions with its scenic alpine setting. The inaugural 2025 event featured challenging light-air racing, with 6-8 knots on Day 1 and dropping to 5 knots or less on Day 2, requiring minimal crew to maintain foiling performance.",
      },
      {
        type: "paragraph",
        text: "As the final European stop before the season moves to the UAE, Geneva's conditions serve as preparation for Middle Eastern racing. While 2026 conditions may prove less marginal, teams should anticipate another test of precision sailing in minimal breeze.",
      },
      {
        type: "paragraph",
        text: "Germany won the maiden event, securing their first SailGP victory ahead of Australia, with Switzerland finishing third despite home advantage. The championship returns to Geneva with high expectations for strong local performances. Past Winners: Germany (Season 5).",
      },
    ],
    eventDate: "19 - 20 Sep 2026",
    location: "Geneva, Switzerland",
    source: {
      name: "The Foil",
      url: "https://thefoil.com/series/sailgp/events/rolex-switzerland-sail-grand-prix-geneva/",
    },
  },
  "spain-sail-grand-prix-valencia": {
    slug: "spain-sail-grand-prix-valencia",
    kind: "event",
    title: "Spain Sail Grand Prix | Valencia",
    standfirst:
      "Valencia is back on sailing's grand stage. Nearly two decades after hosting the America's Cup, the Spanish city returns to top-flight racing with a three-year SailGP commitment running through 2028.",
    heroImage: {
      src: "https://thefoil.com/media/E3m7XLG2Vu4VyAUBq-bE-Vypm0w4zciUOvas0JSOtwc/resize:fill-down:1500:500/gravity:fp:0.5:0.5/quality:60/dpr:1/2026/01/nochesanjuan-valencia-4-1.jpg",
      alt: "Spain Sail Grand Prix | Valencia",
    },
    body: [
      {
        type: "paragraph",
        text: "Valencia is back on sailing's grand stage. Nearly two decades after hosting the America's Cup, the Spanish city returns to top-flight racing with a three-year SailGP commitment running through 2028.",
      },
      {
        type: "paragraph",
        text: "The venue carries significant heritage, having hosted the America's Cup in 2007 and 2010. Infrastructure including the Veles e Vents building and Marina Real remain operational from those campaigns.",
      },
      {
        type: "paragraph",
        text: 'The move from Cádiz to Valencia exchanges Atlantic swell for Mediterranean conditions. September typically features thermal breezes—the Garbí and Llebeig winds—alongside flat water and temperatures around 30°C, though "light-wind configurations" may occasionally be necessary.',
      },
      {
        type: "paragraph",
        text: 'As the 10th event of 13 in the season, the championship standings will be "crystallising, pressure mounting," with Spain facing expectations for a home victory. Historically, Spain\'s performance on home water has proven underwhelming despite strong global results.',
      },
    ],
    eventDate: "5 - 6 Sep 2026",
    location: "Valencia, Spain",
    source: {
      name: "The Foil",
      url: "https://thefoil.com/series/sailgp/events/spain-sail-grand-prix-valencia/",
    },
  },
};

/**
 * Look up an article by its slug.
 *
 * This is the single seam between the article pages and their content source.
 * It currently reads the static snapshot in `article-content.ts`; swap the body
 * for a DB/API call (the snapshot was captured from that same source) and every
 * consumer keeps working unchanged.
 */
export function getArticleBySlug(slug: string): Article | undefined {
  return ARTICLE_CONTENT[slug];
}

/**
 * Resolve an on-domain article link (relative or absolute) to local article data.
 * Returns `undefined` for external/unrecognised paths so callers can preserve the
 * link's normal navigation instead of opening an empty inline reader.
 */
export function getArticleByHref(href: string, expectedOrigin?: string): Article | undefined {
  try {
    const base = expectedOrigin ?? "https://genuin.invalid";
    const url = new URL(href, base);
    if (expectedOrigin && url.origin !== new URL(expectedOrigin).origin) return undefined;
    const { pathname } = url;
    const match = pathname.match(/^\/article\/([^/]+)\/?$/);
    if (!match?.[1]) return undefined;
    return getArticleBySlug(decodeURIComponent(match[1]));
  } catch {
    return undefined;
  }
}

/** Every known article slug — used by the route's `generateStaticParams`. */
export function getAllArticleSlugs(): string[] {
  return Object.keys(ARTICLE_CONTENT);
}

/**
 * The on-domain route for an article slug. Home-page cards link here instead of
 * the external thefoil.com URL, so clicks stay on the current domain.
 */
export function articleHref(slug: string): string {
  return `/article/${slug}`;
}
