// Home feed data source (the paginated "data.json"). SERVER-ONLY — read by the /api/home/feed route.
//
// This is the swappable SEAM for backend integration: today it GENERATES endless dummy pages; to use
// a real backend later, change ONLY `getHomeFeedPage()` to fetch the real API and map its response to
// `HomeDataPage` (the frontend + the API route never change). Types come from the frontend contract so
// the dummy and the real backend share ONE source of truth for the shape.

import { getArticleBySlug } from "@genuin/components/page/article/article-data";
import type {
  ArticleData,
  EventData,
  HomeDataPage,
  LinkItemData,
  WidgetData,
} from "@genuin/components/page/home-dynamic/contract";

import { getHomeLayoutForPage } from "./layout";

/**
 * Community pool (The Foil QA brand). The base page uses a fixed assignment; later pages rotate the
 * community per widget so each scroll page shows different content while reusing the SAME layout.
 */
const COMMUNITIES = [
  "48ebbb76-3213-4faf-b626-0ade6ceb256f", // SailGP
  "dde76c1a-9adb-4347-a44f-eae4b3d622ab", // America's Cup
  "90e35b26-32e0-4fa4-94fe-e0821f76948a", // Olympics
  "88f19de9-cda6-48fc-8896-7af03b62bea8", // Round-the-World
  "5e0a78dd-ff62-4c6a-a3cc-c6fc7dd36950", // Classic 600-Milers
  "24f3f015-2e3f-4f23-9d1a-0a7097830485", // Other Sailing
];

// Real The Foil imagery (imgproxy URLs), mirroring the hardcoded home.tsx content.
const IMG = {
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
  acGrant:
    "https://thefoil.com/media/Dbo6UstAFKh-9o6Qh0JyqXWJE8qsGooCci0O5ZqDGiM/resize:fill-down:532:300/gravity:fp:0.5:0.5/quality:60/dpr:2/2026/06/grant-auacannouncement-imageteamauac.jpg",
  acAc75:
    "https://thefoil.com/media/34W_UmIkJNtv9FDguxtAFJU4v84RwtefndIpAl3HA8Y/resize:fill-down:690:388/gravity:fp:0.501010101:0.7302059011/quality:60/dpr:1/2026/08/ac75s-pierre-bouras-sam-thom-america-s-cup-png.png",
  acValencia:
    "https://thefoil.com/media/dBTTONdJFQWIf2atg27IKK_tQtdgVuHqlJ6eIv7jACU/resize:fill-down:540:295/gravity:fp:0.5:0.5/quality:60/dpr:1/2026/01/nochesanjuan-valencia-4-1.jpg",
  acAuckland:
    "https://thefoil.com/media/cEU2dqX2riTz_QNbWdMf2JFR4GUC9CxGFkxKPebEY2I/resize:fill-down:532:300/gravity:fp:0.6278381625:0.3250833809/quality:60/dpr:2/2026/08/black-foils-auckland-2026-brett-phibbs.jpg",
  acDesign:
    "https://thefoil.com/media/dtwoxDuA6lLEBMIsdFmKtcF-fieju814c7HeIuHU0mo/resize:fill-down:532:300/gravity:fp:0.1914893617:0.4600980829/quality:60/dpr:1/2026/05/A8I5xxHXMuY.jpg",
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
  ricardo:
    "https://thefoil.com/media/xjPn5tb1VybfsEuZ4Y9J9RiSHePy3sFR2qDTv3tu7Ic/resize:fill-down:336:258/gravity:ce/quality:60/dpr:1/2025/12/ricardo-pinto-sailgp-1-1.png",
};

const FOIL_LOGO = "/images/home/the-foil-logo.jpg";
const MUSTO_LOGO = "/images/home/musto-logo.png";

const PODCAST_DESC =
  "Click here to listen on Spotify and other platforms. Sailing has never been healthier — on this week's pod, that's exactly the promise we dig into.";

// ─── Editorial pool — real stories from thefoil.com (2026-08-25) ──────────────────────────────────
// Page 1 uses the hand-curated content in basePageData(); pages 2+ pull DIFFERENT articles from this
// pool via varyWidget(), so each infinite-scroll iteration shows fresh editorial. Only titles / hero
// images / links are used. SEAM: when the real backend lands, varyWidget maps its response instead.
type PoolArticle = { slug: string; title: string; image: string; desc: string };

const ARTICLE_POOL: PoolArticle[] = [
  { slug: "the-week-in-racing-24-august-26", title: "The week in racing – 24 August '26", image: "https://thefoil.com/media/fyOQZBfU_g5YeedI347I43cwARP09ukJ1dRDdN3XF0I/resize:fill-down:850:500/gravity:fp:0.3595744681:0.3743615093/quality:60/dpr:1/2026/08/138a2341-peter-brogger-ilca.jpg", desc: "F50s found a new gear in Sassnitz, the America's Cup lawyers are still busy, and two junior world champions emerged." },
  { slug: "flying-roos-hit-high-five-with-victory-in-sassnitz", title: "Flying Roos hit high five with victory in Sassnitz", image: "https://thefoil.com/media/BdlC5UIxTylK26eNkVoAfU388-gOxuqKz8CSsX-Y6Nk/resize:fill-down:690:388/gravity:fp:0.4787472036:0.6386820846/quality:60/dpr:1/2026/08/jl206387.jpg", desc: "Bonds Flying Roos beat NorthStar Canada, Los Gallos and Black Foils for their fifth SailGP season win." },
  { slug: "flying-roos-and-black-foils-lead-the-way-in-germany", title: "Flying Roos and Black Foils lead the way in Germany", image: "https://thefoil.com/media/NNb4DtCTPtZShEt-6LdvgHQTi8SPkbNtcR99cIawY40/resize:fill-down:690:388/gravity:fp:0.758974359:0.8208106473/quality:60/dpr:1/2026/08/fd1-0713.jpg", desc: "Leading teams at the Germany Sail Grand Prix day one, with a new SailGP speed record set." },
  { slug: "black-foils-dominate-practice-day-in-sassnitz", title: "Black Foils dominate practice day in Sassnitz", image: "https://thefoil.com/media/sfEU1EC1ADnEWMSxAFjCV90hscMHSO0NrwQVvnxZrPY/resize:fill-down:690:388/gravity:fp:0.6787096774:0.5812742086/quality:60/dpr:1/2026/08/260821-sailgp-sassnitz-the-foil-ls1-3878.jpg", desc: "New Zealand's Black Foils set the benchmark in a three-race practice session." },
  { slug: "plans-uncovered-to-reinvent-sailgp-s-race-weekend-news-even-to-the-sailors", title: "Plans uncovered to reinvent SailGP's race weekend", image: "https://thefoil.com/media/4VuyF-wFzDEjovsQXItmgj349qoEU1bP95n2xJbldIM/resize:fill-down:690:388/gravity:fp:0.5:0.5/quality:60/dpr:1/2026/08/jl108682-1.jpg", desc: "SailGP is exploring new format concepts, reconsidering the current race-weekend structure." },
  { slug: "andy-rice-a-good-worlds-for-gbr-and-a-good-worlds-for-the-470-class", title: "Andy Rice: A good Worlds for GBR, and for the 470 Class", image: "https://thefoil.com/media/CxqVH27Gkk4cj5ZFmExBBvQ76uSmVy-6172HPyItfEE/resize:fill-down:690:388/gravity:fp:0.5010989011:0.3081960898/quality:60/dpr:1/2026/08/55457634027-d7ba2b7d10-o.jpg", desc: "Analysis of the Olympic class future, with a focus on age-related concerns in the 470." },
  { slug: "full-steam-ahead-and-scrambling-to-keep-our-heads-above-water-grant-simmer-on-australia-s-cup-comeback", title: "'Full steam ahead': Grant Simmer on Australia's Cup comeback", image: "https://thefoil.com/media/Z4trZSW3ehVrVFS3qWOILawnTQl_Pv_9-z_lS_AD6qY/resize:fill-down:690:388/gravity:fp:0.5:0.5/quality:60/dpr:1/2026/06/grant-auacannouncement-imageteamauac.jpg", desc: "The Australia II navigator on the effort behind the current America's Cup comeback." },
  { slug: "rising-stars-nathan-berger-the-17-year-old-wingfoiler-beating-his-heroes", title: "Rising Stars: Nathan Berger, the 17-year-old wingfoiler", image: "https://thefoil.com/media/6jqFsZkVz92e9pViFIC9cvcOgfOK1JayU4J0n2Ya0i8/resize:fill-down:690:388/gravity:fp:0.5757575758:0.4289940828/quality:60/dpr:1/2026/05/nathan-berger8.jpg", desc: "The first Rising Stars feature profiles a young athlete already competing internationally." },
  { slug: "luca-rizzotti-bought-a-moth-in-2007-and-accidentally-started-a-movement", title: "Luca Rizzotti bought a Moth and accidentally started a movement", image: "https://thefoil.com/media/E3aCJ86SfKfu9q-SMKv2amCZNdndXRn09tP4ign_y9g/resize:fill-down:690:388/gravity:fp:0.5:0.5/quality:60/dpr:1/2026/03/54620591537-354128013c-k.jpg", desc: "The Italian sailor whose Moth purchase influenced a broader foiling movement." },
  { slug: "the-safest-is-when-you-re-pushing-hard-billy-gooderham-explains-flight-control", title: "'The safest is when you're pushing hard' – Billy Gooderham on flight control", image: "https://thefoil.com/media/88hujdjXkimh2hjECgSbi8G11dmmRQgPo1mSEJHk3mg/resize:fill-down:690:388/gravity:fp:0.4804597701:0.5023331499/quality:60/dpr:1/2026/02/northstar1.jpeg", desc: "The NorthStar SailGP flight controller on F50 foil-control techniques and safety." },
  { slug: "podcast-ep-8-sydney-sailgp-preview-and-quentin-delapierre-on-safety", title: "Podcast Ep. 8 – Sydney SailGP preview + Quentin Delapierre", image: "https://thefoil.com/media/ihj1Pyj8LlC_gRNMb35ovuqM5c7DB4gr2gpZlpwfgE/resize:fill-down:690:388/gravity:fp:0.4045977011:0.1304243587/quality:60/dpr:1/2026/02/S6ComfUT55I.jpg", desc: "A podcast episode addressing safety concerns following the Auckland collision." },
  { slug: "the-olympian-windsurfer-with-a-golden-future-far-beyond-la-2028", title: "The Olympian windsurfer with a golden future beyond LA 2028", image: "https://thefoil.com/media/U8j6sq1yq50MNqneZqWV-fKQwvMWiJ23hK4IqlF_wBM/resize:fill-down:690:388/gravity:fp:0.5:0.5/quality:60/dpr:1/2026/02/grae-morris-2.jpeg", desc: "A profile of Australian windsurfer Grae Morris and his prospects beyond the Olympics." },
  { slug: "podcast-can-anyone-beat-new-zealand-to-win-the-38th-america-s-cup", title: "Podcast: Can anyone beat New Zealand to win the 38th America's Cup?", image: "https://thefoil.com/media/DKNOTHYBJW-95Y9EeOQwx462bvV0HJVYFbaIEkadvhQ/resize:fill-down:690:388/gravity:fp:0.5:0.5/quality:60/dpr:1/2026/07/foil-podcast-ep27.jpg", desc: "Can any of the six challengers really take on and beat Emirates Team New Zealand?" },
  { slug: "podcast-sailgp-vs-america-s-cup-can-they-coexist", title: "Podcast: SailGP vs America's Cup – can they coexist?", image: "https://thefoil.com/media/OklF53Inp_snGNaLlSc_Z7oc8gG_XysfQ3vfUfQQsOk/resize:fill-down:690:388/gravity:fp:0.4962835906:0.6871458395/quality:60/dpr:1/2026/07/pod26thumb.jpg", desc: "A discussion of the competitive dynamics between the two major sailing formats." },
  { slug: "podcast-america-s-cup-is-back-the-full-cagliari-debrief", title: "Podcast: America's Cup is back! The full Cagliari debrief", image: "https://thefoil.com/media/7yQYWbI8NieP3mVI3ibnGNpQjB4jVpQljfTe2PijaA/resize:fill-down:690:388/gravity:fp:0.3041738136:0.4733671339/quality:60/dpr:1/2026/05/e8tkvl1yBE4.jpg", desc: "The episode analysing the preliminary America's Cup regatta results in Cagliari." },
  { slug: "like-watching-jet-fighters-dance-on-water-how-luna-rossa-lit-up-the-ac38-opener", title: "'Like watching jet fighters dance on water': Luna Rossa lights up the AC38 opener", image: "https://thefoil.com/media/mCW3wLqDh3sqRtydzwNhMci-7EoafPBWtqZn5iZ8gQM/resize:fill-down:690:388/gravity:fp:0.5:0.5/quality:60/dpr:1/2026/05/2zBK_WJOXyM.jpg", desc: "Coverage of Luna Rossa's strong performance at the AC38 Cagliari opener." },
  { slug: "podcast-extra-mozzy-and-freddie-preview-the-ac38-cagliari-prelim", title: "Podcast Extra: Mozzy and Freddie preview the AC38 Cagliari prelim", image: "https://thefoil.com/media/Pdz6pWSetC2coPjMqbNjYUjLhhRZ52S_gxCpmwiGVSk/resize:fill-down:690:388/gravity:fp:0.1914893617:0.4600980829/quality:60/dpr:1/2026/05/A8I5xxHXMuY.jpg", desc: "A bonus episode previewing the AC38 preliminary regatta." },
  { slug: "podcast-it-starts-with-a-dream-glenn-ashby-on-australia-s-ac38-challenge-the-foil-podcast-ep-20", title: "Podcast: 'It starts with a dream' – Glenn Ashby on Australia's AC38 challenge", image: "https://thefoil.com/media/IV15mSl5M0bQKFpgnjbtf8NcXEb1Ur1YQBmCaI5br_w/resize:fill-down:690:388/gravity:fp:0.4638297872:0.294248774/quality:60/dpr:1/2026/05/SUASYivtly8.jpg", desc: "'The time is now,' says Glenn Ashby on Team Australia's newly-minted Cup challenge." },
  { slug: "freddie-carr-cowes-week-turns-200-why-britain-s-greatest-regatta-still-means-everything", title: "Freddie Carr: Cowes Week turns 200 – why it still means everything", image: "https://thefoil.com/media/D9-BwEUpx2zkordmXhfkesEf3umA15CkbUq_0hVLUFk/resize:fill-down:690:388/gravity:fp:0.3212765957:0.4967784486/quality:60/dpr:1/2026/07/cowes-week-2018.jpg", desc: "Why the historic British regatta still matters in the modern sailing calendar." },
  { slug: "freddie-carr-winging-it-at-half-time-in-sailgp", title: "Freddie Carr: winging it at half-time in SailGP", image: "https://thefoil.com/media/1iyA3HxN0dBlrtWrFrClGhvEmC088eDTOXoEX2XqirA/resize:fill-down:690:388/gravity:fp:0.3738738739:0.7896640827/quality:60/dpr:1/2026/06/ab305255.jpg", desc: "A mid-season performance analysis of the SailGP teams, backed by the numbers." },
  { slug: "andy-rice-rates-the-fleet-after-canada-sailgp", title: "Andy Rice rates the fleet after Canada SailGP", image: "https://thefoil.com/media/qKjnrDjyAPpM3cBcH277RkMeUBqSXdeGFzwHNmpN4rY/resize:fill-down:690:388/gravity:fp:0.5127659574:0.5173727167/quality:60/dpr:1/2026/06/sv3-3959-samo-vidic-for-sailgp.jpg", desc: "Post-race analysis, with Los Gallos' strategic move the season's standout moment." },
  { slug: "after-the-new-york-crash-what-should-sailgp-actually-do-the-foil-community-weighs-in", title: "After the New York crash, what should SailGP actually do?", image: "https://thefoil.com/media/EDze0rwkrUx65k8kq9Lwu9oSHPCEuRO6nTICXHbiUnE/resize:fill-down:690:388/gravity:fp:0.5:0.5/quality:60/dpr:1/2026/06/sb1-9984-simon-bruty-sailgp.jpg", desc: "A community discussion sparked by the collision at the New York SailGP." },
  { slug: "the-questions-that-remain-following-new-york-sailgp", title: "The questions that remain following New York SailGP", image: "https://thefoil.com/media/Um8anF-sXKcm8j780JjLYBS9DIkHC8GfcXQjrug28Xs/resize:fill-down:690:388/gravity:fp:0.4787792084:0.701049749/quality:60/dpr:1/2026/06/new-york-sailgp-statue-of-liberty-2026.jpg", desc: "From a three-boat collision to a grand final that divided opinion." },
];

type PoolEvent = { slug: string; heading: string; image: string; startDate: string; endDate: string; location: string };

const EVENT_POOL: PoolEvent[] = [
  { slug: "the-ocean-race-atlantic", heading: "The Ocean Race Atlantic", image: "https://thefoil.com/media/0IFpwb4HJabWEJukldoszeTslP9-KwJiWsr1dItg4qM/resize:fill-down:460:240/gravity:fp:0.4787792084:0.701049749/quality:60/dpr:1/2026/08/tora1.webp", startDate: "2026-09-01", endDate: "2026-09-01", location: "Atlantic Ocean" },
  { slug: "spain-sail-grand-prix-valencia", heading: "Spain Sail Grand Prix | Valencia", image: "https://thefoil.com/media/iPBCq3_vvcFn6JcR7RXGUjAUYxDugVCydAXGxRUu5hI/resize:fill-down:460:240/gravity:fp:0.4787792084:0.701049749/quality:60/dpr:1/2026/01/nochesanjuan-valencia-4-1.jpg", startDate: "2026-09-05", endDate: "2026-09-06", location: "Valencia, Spain" },
  { slug: "rolex-switzerland-sail-grand-prix-geneva", heading: "Rolex Switzerland Sail Grand Prix | Geneva", image: "https://thefoil.com/media/dakrdWO1K6E-9HkB-ty70MpQpJZphrX0yOUwtJVMzW4/resize:fill-down:460:240/gravity:fp:0.4787792084:0.701049749/quality:60/dpr:1/2026/01/sailgp-geneva-event.png", startDate: "2026-09-19", endDate: "2026-09-20", location: "Geneva, Switzerland" },
  { slug: "emirates-dubai-sail-grand-prix-presented-by-dp-world", heading: "Emirates Dubai Sail Grand Prix", image: "https://thefoil.com/media/Xu7BYqNK4JOlhDFN95CM5vkEx1z5Tz816mIqhhnPdJo/resize:fill-down:460:240/gravity:fp:0.4787792084:0.701049749/quality:60/dpr:1/2025/12/felix-diemer-sailgp-1.png", startDate: "2026-11-21", endDate: "2026-11-22", location: "Dubai, United Arab Emirates" },
  { slug: "mubadala-abu-dhabi-sail-grand-prix-2026-season-grand-final-presented-by-abu-dhabi-sports-council", heading: "Mubadala Abu Dhabi Sail Grand Prix | Grand Final", image: "https://thefoil.com/media/0JCAfHmgCbRgdzpa3E9qPnx0gbAcsLKZfYfHpml5698/resize:fill-down:460:240/gravity:fp:0.4787792084:0.701049749/quality:60/dpr:1/2025/12/ricardo-pinto-sailgp-5-1.png", startDate: "2026-11-28", endDate: "2026-11-29", location: "Abu Dhabi, United Arab Emirates" },
];

/** On-domain `/article/<slug>` when we have a demo page for it; else the real thefoil.com article. */
function poolHref(slug: string, base: "news" | "events"): string {
  return getArticleBySlug(slug) ? `/article/${slug}` : `https://thefoil.com/${base}/${slug}/`;
}

/** Wrap an index into a pool array (handles negatives). */
function poolAt<T>(arr: readonly T[], index: number): T {
  return arr[((index % arr.length) + arr.length) % arr.length]!;
}

/** `count` article cards from the pool starting at `offset`; ids prefixed for React-key uniqueness. */
function poolArticles(offset: number, count: number, idPrefix: string): ArticleData[] {
  return Array.from({ length: count }, (_, i) => {
    const article = poolAt(ARTICLE_POOL, offset + i);
    return {
      id: `${idPrefix}-${i}`,
      title: article.title,
      href: poolHref(article.slug, "news"),
      image: { src: article.image, alt: article.title },
    };
  });
}

/** `count` link cards for the related-links widget. */
function poolLinks(offset: number, count: number, idPrefix: string): LinkItemData[] {
  return Array.from({ length: count }, (_, i) => {
    const article = poolAt(ARTICLE_POOL, offset + i);
    return {
      id: `${idPrefix}-${i}`,
      link: poolHref(article.slug, "news"),
      title: article.title,
      description: article.desc,
      brand: "The Foil",
      website: "thefoil.com",
      image: article.image,
    };
  });
}

/** `count` event cards for the upcoming-races widget. */
function poolEvents(offset: number, count: number, idPrefix: string): EventData[] {
  return Array.from({ length: count }, (_, i) => {
    const event = poolAt(EVENT_POOL, offset + i);
    return {
      id: `${idPrefix}-${i}`,
      heading: event.heading,
      image: { src: event.image },
      startDate: event.startDate,
      endDate: event.endDate,
      location: event.location,
      cta: { label: "Read More", href: poolHref(event.slug, "events") },
    };
  });
}

/** Spread widgets across the pool so different panels on the same page don't repeat each other. */
function widgetSeed(id: string): number {
  const seeds: Record<string, number> = {
    "latest-news": 0,
    "latest-interviews": 6,
    "related-links": 12,
    "relevant-news": 3,
    "upcoming-races": 0,
  };
  return seeds[id] ?? 0;
}

/** Base (page-1) content for every widget, keyed by dataKey. Matches the layout manifest. */
function basePageData(): Record<string, WidgetData> {
  return {
    salegp_desk: {
      id: "salegp-desk",
      header: { heading: "SailGP", subHeading: "Insight, action and spotlight", logo: FOIL_LOGO },
      source: { feedType: "HOME", communityId: COMMUNITIES[0]! },
      ctaText: "Read More",
    },
    latest_news: {
      id: "latest-news",
      header: { heading: "Other Sailing", subHeading: "Latest News", logo: FOIL_LOGO },
      source: { feedType: "HOME", communityId: COMMUNITIES[5]! },
      readMoreLabel: "Read more",
      upNextLabel: "Up Next",
      featuredArticle: {
        id: "sailgp-news-1",
        title: "SailGP and America's Cup: can they coexist?",
        href: "/article/the-questions-that-remain-following-new-york-sailgp",
        image: { src: IMG.sailgpNewYork, alt: "SailGP and America's Cup" },
      },
      upNextArticles: [
        {
          id: "sailgp-news-2",
          title: "Inside the Rockwool Germany Sail Grand Prix",
          href: "/article/rockwool-germany-sail-grand-prix-sassnitz",
          image: { src: IMG.sailgpSimonBruty, alt: "Rockwool Germany Sail Grand Prix" },
        },
        {
          id: "sailgp-news-3",
          title: "Spain hit 99 km/h in the fleet's fastest run yet off Sassnitz",
          href: "/article/emirates-dubai-sail-grand-prix-presented-by-dp-world",
          image: { src: IMG.sailgpFelixDiemer, alt: "SailGP fastest run" },
        },
        {
          id: "sailgp-news-4",
          title: "Season 6 standings: three teams still in the title hunt",
          href: "/article/rolex-switzerland-sail-grand-prix-geneva",
          image: { src: IMG.sailgpGeneva, alt: "SailGP season standings" },
        },
        {
          id: "sailgp-news-5",
          title: "New Zealand vs Australia: the rivalry defining the season",
          href: "/article/andy-rice-rates-the-fleet-after-canada-sailgp",
          image: { src: IMG.sailgpSamoVidic, alt: "New Zealand vs Australia" },
        },
        {
          id: "sailgp-news-6",
          title: "Grand Final preview: everything on the line in Abu Dhabi",
          href: "/article/mubadala-abu-dhabi-sail-grand-prix-2026-season-grand-final-presented-by-abu-dhabi-sports-council",
          image: { src: IMG.sailgpLosAngeles, alt: "SailGP Grand Final" },
        },
      ],
    },
    upcoming_races: {
      id: "upcoming-races",
      header: {
        heading: "Upcoming races: leading edge in action",
        subHeading: "What's next?",
        logo: FOIL_LOGO,
      },
      events: [
        {
          id: "rockwool-germany-sail-gp-2026",
          heading: "Rockwool Germany Sail Grand Prix | Sassnitz",
          image: { src: IMG.sailgpSimonBruty },
          startDate: "2026-08-22",
          endDate: "2026-08-23",
          location: "Sassnitz, Rügen Island, Germany",
          cta: { label: "Read More", href: "/article/rockwool-germany-sail-grand-prix-sassnitz" },
        },
        {
          id: "spain-sail-gp-2026",
          heading: "Spain Sail Grand Prix | Valencia",
          image: { src: IMG.acValencia },
          startDate: "2026-09-05",
          endDate: "2026-09-06",
          location: "Valencia, Spain",
          cta: { label: "Read More", href: "/article/spain-sail-grand-prix-valencia" },
        },
        {
          id: "rolex-switzerland-sail-gp-2026",
          heading: "Rolex Switzerland Sail Grand Prix | Geneva",
          image: { src: IMG.sailgpGeneva },
          startDate: "2026-09-19",
          endDate: "2026-09-20",
          location: "Geneva, Switzerland",
          cta: { label: "Read More", href: "/article/rolex-switzerland-sail-grand-prix-geneva" },
        },
        {
          id: "france-sail-gp-2026",
          heading: "France Sail Grand Prix | Saint-Tropez",
          image: { src: IMG.sailgpSamoVidic },
          startDate: "2026-09-26",
          endDate: "2026-09-27",
          location: "Saint-Tropez, France",
          cta: { label: "Read More", href: "/article/the-week-in-racing-10-august-26" },
        },
        {
          id: "emirates-dubai-sail-gp-2026",
          heading: "Emirates Dubai Sail Grand Prix | Dubai",
          image: { src: IMG.sailgpLosAngeles },
          startDate: "2026-11-28",
          endDate: "2026-11-29",
          location: "Dubai, United Arab Emirates",
          cta: { label: "Read More", href: "/article/emirates-dubai-sail-grand-prix-presented-by-dp-world" },
        },
      ],
    },
    latest_videos: {
      id: "latest-videos",
      header: { heading: "Latest Videos", subHeading: "Fresh Insights", logo: FOIL_LOGO },
      source: { feedType: "HOME", communityId: COMMUNITIES[1]! },
    },
    related_links: {
      id: "related-links",
      ctaText: "Read More",
      items: [
        {
          id: "interview-link-1",
          link: "/article/podcast-sailgp-vs-america-s-cup-can-they-coexist",
          title: "Podcast: SailGP vs America's Cup — can they coexist?",
          description: PODCAST_DESC,
          brand: "The Foil",
          website: "thefoil.com",
          image: IMG.ricardo,
        },
        {
          id: "interview-link-2",
          link: "/article/podcast-can-anyone-beat-new-zealand-to-win-the-38th-america-s-cup",
          title: "Podcast: Can anyone beat New Zealand to win the 38th America's Cup?",
          description: PODCAST_DESC,
          brand: "The Foil",
          website: "thefoil.com",
          image: IMG.ricardo,
        },
        {
          id: "interview-link-3",
          link: "/article/podcast-america-s-cup-is-back-the-full-cagliari-debrief",
          title: "Podcast: America's Cup is back — the full Cagliari debrief",
          description: PODCAST_DESC,
          brand: "The Foil",
          website: "thefoil.com",
          image: IMG.ricardo,
        },
        {
          id: "interview-link-4",
          link: "/article/podcast-extra-mozzy-and-freddie-preview-the-ac38-cagliari-prelim",
          title: "Podcast extra: Mozzy and Freddie preview the AC38 Cagliari prelim",
          description: PODCAST_DESC,
          brand: "The Foil",
          website: "thefoil.com",
          image: IMG.ricardo,
        },
        {
          id: "interview-link-5",
          link: "/article/podcast-the-six-american-sailors-chosen-to-take-back-the-cup",
          title: "Podcast: The six American sailors chosen to take back the Cup",
          description: PODCAST_DESC,
          brand: "The Foil",
          website: "thefoil.com",
          image: IMG.ricardo,
        },
        {
          id: "interview-link-6",
          link: "/article/podcast-ep-8-sydney-sailgp-preview-and-quentin-delapierre-on-safety",
          title: "Podcast Ep 8: Sydney SailGP preview & Quentin Delapierre on safety",
          description: PODCAST_DESC,
          brand: "The Foil",
          website: "thefoil.com",
          image: IMG.ricardo,
        },
      ],
    },
    latest_interviews: {
      id: "latest-interviews",
      header: { heading: "Round-the-World", subHeading: "Latest Interviews", logo: FOIL_LOGO },
      source: { feedType: "HOME", communityId: COMMUNITIES[3]! },
      articles: [
        {
          id: "interview-featured",
          title:
            "'Full steam ahead and scrambling to keep our heads above water': Grant Simmer on Australia's Cup comeback",
          href: "/article/full-steam-ahead-and-scrambling-to-keep-our-heads-above-water-grant-simmer-on-australia-s-cup-comeback",
          image: { src: IMG.acGrant, alt: "Grant Simmer interview" },
        },
        {
          id: "interview-2",
          title: "The new AC75 class, explained: what changed and why",
          href: "/article/the-week-in-racing-10-august-26",
          image: { src: IMG.acAc75, alt: "AC75 class" },
        },
        {
          id: "interview-3",
          title: "Defenders vs challengers: who really has the edge?",
          href: "/article/spain-sail-grand-prix-valencia",
          image: { src: IMG.acValencia, alt: "Defenders vs challengers" },
        },
        {
          id: "interview-4",
          title: "From Auckland to Barcelona: the Cup finds a new home",
          href: "/article/the-real-story-behind-the-black-foils-new-sailgp-recruits",
          image: { src: IMG.acAuckland, alt: "Auckland to Barcelona" },
        },
        {
          id: "interview-5",
          title: "Inside the design war that's reshaping the fleet",
          href: "/article/podcast-extra-mozzy-and-freddie-preview-the-ac38-cagliari-prelim",
          image: { src: IMG.acDesign, alt: "Design war" },
        },
      ],
    },
    top_categories: {
      id: "top-categories",
      header: { heading: "Top Categories In The Foil", subHeading: "You might like", logo: FOIL_LOGO },
      source: { feedType: "HOME", communityId: COMMUNITIES[2]! },
      ctaText: "Read More",
    },
    tmobile: {
      id: "tmobile",
      header: { heading: "Musto", subHeading: "Sponsored · Performance sailing kit", logo: MUSTO_LOGO },
      source: { feedType: "HOME", communityId: COMMUNITIES[4]! },
      sponsored: true,
      ctaText: "Order Now",
    },
    relevant_news: {
      id: "relevant-news",
      header: { heading: "Classic 600-Milers", subHeading: "Relevant News", logo: FOIL_LOGO },
      source: { feedType: "HOME", communityId: COMMUNITIES[4]! },
      readMoreLabel: "Read more",
      upNextLabel: "Up Next",
      featuredArticle: {
        id: "classic-600-news-1",
        title: "Rolex China Sea Race: the fleet sets sail from Hong Kong",
        href: "/article/how-pace-took-line-honours-in-the-2026-round-britain-and-ireland-race-one-chapter-at-a-time",
        image: { src: IMG.offshorePace, alt: "Rolex China Sea Race" },
      },
      upNextArticles: [
        {
          id: "classic-600-news-2",
          title: "RORC Caribbean 600: records tumble in a breezy edition",
          href: "/article/the-safest-is-when-you-re-pushing-hard-billy-gooderham-explains-flight-control",
          image: { src: IMG.offshoreNorthstar, alt: "RORC Caribbean 600" },
        },
        {
          id: "classic-600-news-3",
          title: "Rolex Middle Sea Race: 606 miles around Sicily",
          href: "/article/freddie-carr-cowes-week-turns-200-why-britain-s-greatest-regatta-still-means-everything",
          image: { src: IMG.offshoreCowes, alt: "Rolex Middle Sea Race" },
        },
        {
          id: "classic-600-news-4",
          title: "Rolex Fastnet Race: the making of a modern classic",
          href: "/article/the-week-in-racing-10-august-26",
          image: { src: IMG.offshoreRp3, alt: "Rolex Fastnet Race" },
        },
        {
          id: "classic-600-news-5",
          title: "Rolex Sydney Hobart: 628 miles to Constitution Dock",
          href: "/article/rate-the-fleet-andy-rice-s-verdict-on-sailgp-new-york",
          image: { src: IMG.offshoreMl3, alt: "Rolex Sydney Hobart" },
        },
        {
          id: "classic-600-news-6",
          title: "The 600-milers every offshore sailor dreams of",
          href: "/article/luca-rizzotti-bought-a-moth-in-2007-and-accidentally-started-a-movement",
          image: { src: IMG.offshoreGeneric, alt: "Classic 600-milers" },
        },
      ],
    },
  };
}

/** Rotate a widget's feed community by `n` places so later pages show new content. */
function rotateCommunity(communityId: string, n: number): string {
  const idx = COMMUNITIES.indexOf(communityId);
  if (idx < 0 || n === 0) return communityId;
  return COMMUNITIES[(idx + n) % COMMUNITIES.length]!;
}

/**
 * Vary one widget for page N (N ≥ 1): rotate the video community AND swap the editorial content
 * (featured/up-next articles, interview cards, related links, events) for a DIFFERENT slice of the
 * thefoil.com pool, so each infinite-scroll iteration shows fresh articles instead of repeating
 * page 1. Page 0 (the first page) keeps its hand-curated content untouched.
 */
function varyWidget(widget: WidgetData, pageIndex: number): WidgetData {
  if (pageIndex === 0) return widget;
  const suffix = `-p${pageIndex + 1}`;
  const idBase = `${widget.id}${suffix}`;
  // Per-page, per-widget offset into the pool: each page steps forward; each widget starts at its own
  // seed so panels on the same page don't repeat each other.
  const offset = pageIndex * 7 + widgetSeed(widget.id);

  return {
    ...widget,
    id: idBase,
    source: widget.source
      ? { ...widget.source, communityId: rotateCommunity(widget.source.communityId, pageIndex) }
      : undefined,
    featuredArticle: widget.featuredArticle ? poolArticles(offset, 1, `${idBase}-feat`)[0] : undefined,
    upNextArticles: widget.upNextArticles
      ? poolArticles(offset + 1, widget.upNextArticles.length, `${idBase}-up`)
      : undefined,
    articles: widget.articles ? poolArticles(offset, widget.articles.length, `${idBase}-art`) : undefined,
    events: widget.events ? poolEvents(offset, widget.events.length, `${idBase}-evt`) : undefined,
    items: widget.items ? poolLinks(offset, widget.items.length, `${idBase}-link`) : undefined,
  };
}

/**
 * The feed is ENDLESS: every page returns a `nextCursor`, so `endOfFeed` is always false and the
 * user can scroll forever. Cursor encoding: page index 0 → cursor `null` (first page); index N
 * (N ≥ 1) → `cursor-page-${N + 1}` (so `cursor-page-2` = index 1).
 */
function cursorForIndex(pageIndex: number): string | null {
  return pageIndex === 0 ? null : `cursor-page-${pageIndex + 1}`;
}

function indexForCursor(cursor: string | null): number {
  if (!cursor) return 0;
  const match = /^cursor-page-(\d+)$/.exec(cursor);
  if (!match) return -1;
  return Number(match[1]) - 1;
}

function buildPage(pageIndex: number): HomeDataPage {
  const base = basePageData();
  const data: Record<string, WidgetData> = {};
  for (const [key, widget] of Object.entries(base)) {
    data[key] = varyWidget(widget, pageIndex);
  }

  return {
    metadata: {
      page: "home",
      schemaVersion: 1,
      pageSession: `home-session-${String(pageIndex + 1).padStart(3, "0")}`,
      pageIndex,
    },
    pagination: {
      cursor: cursorForIndex(pageIndex),
      nextCursor: cursorForIndex(pageIndex + 1),
      endOfFeed: false,
    },
    // Per-page layout: each iteration rotates through the layout variants so the feed doesn't
    // repeat the same structure. The frontend falls back to the shared manifest if this is absent.
    layout: getHomeLayoutForPage(pageIndex),
    data,
  };
}

/**
 * SEAM: resolve a `?cursor=` value to a page. `null`/absent → first page. A malformed cursor returns
 * `null` (the route responds 400). Swap this body to fetch+map a real backend later.
 */
export function getHomeFeedPage(cursor: string | null): HomeDataPage | null {
  const pageIndex = indexForCursor(cursor);
  if (pageIndex < 0) return null;
  return buildPage(pageIndex);
}
