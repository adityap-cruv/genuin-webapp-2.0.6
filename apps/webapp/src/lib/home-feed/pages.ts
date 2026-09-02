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
  weekInRacing31August:
    "https://thefoil.com/media/mEob3-vvRywjK5WGiYDMwmaHASqp4I5G721zCToGbHI/resize:fill-down:1200:630/g:ce/quality:60/dpr:1/2026/08/ilca-mens-medal-race76900-jordan-roberts-down-under-sail.jpg",
  rateFleetSassnitz:
    "https://thefoil.com/media/gMKzLo51XG0f-bdYGtYcg5tK2rAaq94rI6wy0sm5D3M/resize:fill-down:1200:630/g:ce/quality:60/dpr:1/2026/08/rp3-3823.jpg",
  lunaRossaRudder:
    "https://thefoil.com/media/HLzTMMiNRo7BBMxBRINZ4GDsNvtbw_N44jsl-aufD-I/resize:fill-down:1200:630/g:ce/quality:60/dpr:1/2026/08/260826-lr-b3-d20-207.jpg",
  sailgpStickOrTwist:
    "https://thefoil.com/media/Nke01VR-k1qZL82Rwri60kjT7jiawrqQiiHUclRRRr0/resize:fill-down:1200:630/g:ce/quality:60/dpr:1/2026/08/fd2-2946.jpg",
  weekInRacing24August:
    "https://thefoil.com/media/fyOQZBfU_g5YeedI347I43cwARP09ukJ1dRDdN3XF0I/resize:fill-down:850:500/gravity:fp:0.3595744681:0.3743615093/quality:60/dpr:1/2026/08/138a2341-peter-brogger-ilca.jpg",
  flyingRoosSassnitz:
    "https://thefoil.com/media/BdlC5UIxTylK26eNkVoAfU388-gOxuqKz8CSsX-Y6Nk/resize:fill-down:690:388/gravity:fp:0.4787472036:0.6386820846/quality:60/dpr:1/2026/08/jl206387.jpg",
  oceanRaceAtlantic:
    "https://thefoil.com/media/0IFpwb4HJabWEJukldoszeTslP9-KwJiWsr1dItg4qM/resize:fill-down:460:240/gravity:fp:0.4787792084:0.701049749/quality:60/dpr:1/2026/08/tora1.webp",
  nathanBerger:
    "https://thefoil.com/media/6jqFsZkVz92e9pViFIC9cvcOgfOK1JayU4J0n2Ya0i8/resize:fill-down:690:388/gravity:fp:0.5757575758:0.4289940828/quality:60/dpr:1/2026/05/nathan-berger8.jpg",
  graeMorris:
    "https://thefoil.com/media/U8j6sq1yq50MNqneZqWV-fKQwvMWiJ23hK4IqlF_wBM/resize:fill-down:690:388/gravity:fp:0.5:0.5/quality:60/dpr:1/2026/02/grae-morris-2.jpeg",
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
  eventPerth:
    "https://thefoil.com/media/vdaagjaY5N6YhzcsIHwAWoDb6jEyslwnfQyN9-nSqVs/resize:fill-down:1200:630/g:ce/quality:60/dpr:1/2025/12/perth-harbour-hero-shutterstock-660544684.png",
  eventAuckland:
    "https://thefoil.com/media/OND6DTrjj3M2L5iEzdyEEFGpikhqxIZSeE9rsXvfdtU/resize:fill-down:1200:630/g:ce/quality:60/dpr:1/2025/12/copyright-sailgp.png",
  eventSydney:
    "https://thefoil.com/media/Wzd3yS0S_S3R4Zd49uZ7PQMHUwAnME4R3YktMxoObiE/resize:fill-down:1200:630/g:ce/quality:60/dpr:1/2025/12/patrick-hamilton-sailgp.png",
  eventRio:
    "https://thefoil.com/media/2zB9aGdxzA8DVlOWsbm5uxfaVTXu1HIKWInEc14b1Ao/resize:fill-down:1200:630/g:ce/quality:60/dpr:1/2025/12/hero-image-shutterstock-2192018835.png",
  eventBermuda:
    "https://thefoil.com/media/NMgPnZH9fJLIGKGRSVtxxMOwDo10hloAdksdiY-s2Bs/resize:fill-down:1200:630/g:ce/quality:60/dpr:1/2025/12/bob-martin-sailgp.png",
  eventNewYork:
    "https://thefoil.com/media/6ulqMhJ4H5xjxfJfRxkeZtOnEaeOJoh8cCDjDMjt5PQ/resize:fill-down:1200:630/g:ce/quality:60/dpr:1/2025/12/ricardo-pinto-sailgp-3.png",
  eventHalifax:
    "https://thefoil.com/media/x-w03TKA1Z5mtrhXF_3H_ZZ7isZ0WeLSy2L439YlO5M/resize:fill-down:1200:630/g:ce/quality:60/dpr:1/2026/06/sailgp-halifax-crop.jpg",
  eventPortsmouth:
    "https://thefoil.com/media/u1XF-gUvDLRx7EBzMoJ-_RVf-hbPVl-eTLXT72I56fE/resize:fill-down:1200:630/g:ce/quality:60/dpr:1/2025/12/ricardo-pinto-sailgp-5.png",
  eventGermany:
    "https://thefoil.com/media/K3vxlyg9Yat80nsUs8P5OoyhjxP3_tjSnKF1kEcYa-g/resize:fill-down:1200:630/g:ce/quality:60/dpr:1/2025/12/ricardo-pinto-sailgp-1-1.png",
  eventCagliari:
    "https://thefoil.com/media/rRr0UlSejCKYrs1mlU2WfnN1GtnCUwi2Gc_1Ra_F4Fc/resize:fill-down:1200:630/g:ce/quality:60/dpr:1/2026/05/gc-7202edit-2048x2048.jpg",
};

const FOIL_LOGO = "/images/home/the-foil-logo.jpg";
const MUSTO_LOGO = "/images/home/musto-logo.png";

// Real ids currently returned by the "Latest Video" QA placement. This is mock response data:
// production brands supply their own `video_id` on each article item through the same contract.
// The component never contains brand-specific ids or article assignments.
const LATEST_VIDEO_IDS = [
  "fbcded82-eaee-463e-b55b-420fab97cecc",
  "5ad649b6-643f-47b3-92ed-79e838eed35d",
  "01e2b86a-2e1c-4632-adaf-ad5f9a84fe84",
  "77b5ecd0-4515-455a-a62b-daa1ac9faa0a",
  "b25aa012-ef94-4516-9820-2184636e9854",
  "dd8de87c-ae65-4799-9038-5b67d96e411a",
  "b71ae2e2-8ac8-4d07-95a2-6ac41b573309",
  "d88ffffd-105f-49d6-bff3-83bc7feb9792",
  "6448766f-78b2-4132-ac91-1c44f5f0ad6c",
  "83498e6b-a6b8-4e9d-a9f9-9071d5b66281",
  "dcccd164-cea2-418b-93f9-ed76cd9b2fd6",
  "3760f089-b345-4112-9d0c-969b1ca12da1",
  "0210081e-2266-4c81-9764-0cd6cc56c18e",
  "4e99d2bd-cffd-462a-95ed-1a2380deba76",
  "b211c258-bfa5-4546-828f-fd17f5d75c39",
  "b528af60-ec77-4c1e-806c-1d8d87bf1149",
  "f99bcc45-ad7b-4445-9054-17bc92f059bb",
  "0e4078c7-b0d8-4a6c-8a28-39b719d3fcfc",
  "ed49f624-1e1e-4128-97f3-fe9ab330bd8a",
  "c53825e0-23a0-49b3-af81-dcb467837a29",
] as const;

// Mock editorial assignment for the ids above, in the same order. This belongs to the response
// fixture, not the renderer; production returns the final article + `video_id` association.
const LATEST_VIDEO_ARTICLE_SLUGS = [
  "the-week-in-racing-24-august-26",
  "podcast-can-anyone-beat-new-zealand-to-win-the-38th-america-s-cup",
  "luca-rizzotti-bought-a-moth-in-2007-and-accidentally-started-a-movement",
  "podcast-sailgp-vs-america-s-cup-can-they-coexist",
  "flying-roos-hit-high-five-with-victory-in-sassnitz",
  "luna-rossa-test-new-rudder-and-take-a-knock",
  "plans-uncovered-to-reinvent-sailgp-s-race-weekend-news-even-to-the-sailors",
  "rising-stars-nathan-berger-the-17-year-old-wingfoiler-beating-his-heroes",
  "podcast-america-s-cup-is-back-the-full-cagliari-debrief",
  "rate-the-fleet-andy-rice-on-sassnitz-sailgp",
  "the-questions-that-remain-following-new-york-sailgp",
  "andy-rice-rates-the-fleet-after-canada-sailgp",
  "the-week-in-racing-31-august-26",
  "podcast-ep-8-sydney-sailgp-preview-and-quentin-delapierre-on-safety",
  "freddie-carr-cowes-week-turns-200-why-britain-s-greatest-regatta-still-means-everything",
  "the-safest-is-when-you-re-pushing-hard-billy-gooderham-explains-flight-control",
  "freddie-carr-winging-it-at-half-time-in-sailgp",
  "like-watching-jet-fighters-dance-on-water-how-luna-rossa-lit-up-the-ac38-opener",
  "podcast-extra-mozzy-and-freddie-preview-the-ac38-cagliari-prelim",
  "podcast-it-starts-with-a-dream-glenn-ashby-on-australia-s-ac38-challenge-the-foil-podcast-ep-20",
] as const;

// ─── Editorial pool — real stories from thefoil.com (2026-09-01) ──────────────────────────────────
// Page 1 uses the hand-curated content in basePageData(); pages 2+ pull DIFFERENT articles from this
// pool via varyWidget(), so each infinite-scroll iteration shows fresh editorial. Only titles / hero
// images / links are used. SEAM: when the real backend lands, varyWidget maps its response instead.
type PoolArticle = { slug: string; title: string; image: string; desc: string };

const ARTICLE_POOL: PoolArticle[] = [
  {
    slug: "the-week-in-racing-31-august-26",
    title: "The week in racing – 31 August '26",
    image: IMG.weekInRacing31August,
    desc: "A first Hungarian ILCA 7 world title, a reshaped 52 Super Series fight and a fast Atlantic crossing headline the week.",
  },
  {
    slug: "rate-the-fleet-andy-rice-on-sassnitz-sailgp",
    title: "Rate the fleet: Andy Rice on Sassnitz SailGP",
    image: IMG.rateFleetSassnitz,
    desc: "Andy Rice ranks the fleet after a Germany Sail Grand Prix shaped by split groups, extreme speed and unstable breeze.",
  },
  {
    slug: "luna-rossa-test-new-rudder-and-take-a-knock",
    title: "Luna Rossa test new rudder – and take a knock",
    image: IMG.lunaRossaRudder,
    desc: "A revised rudder supplied useful AC75 data before an afternoon loss of control exposed its limits.",
  },
  {
    slug: "freddie-carr-the-sailgp-teams-that-must-decide-to-stick-or-twist",
    title: "Freddie Carr: The SailGP teams that must decide to stick or twist",
    image: IMG.sailgpStickOrTwist,
    desc: "SailGP teams weigh roster changes against trusting their current athletes as Season 6 reaches its decisive phase.",
  },
  {
    slug: "the-week-in-racing-24-august-26",
    title: "The week in racing – 24 August '26",
    image: IMG.weekInRacing24August,
    desc: "A SailGP speed record, an America's Cup legal dispute and two new youth world champions lead the review.",
  },
  {
    slug: "flying-roos-hit-high-five-with-victory-in-sassnitz",
    title: "Flying Roos hit high five with victory in Sassnitz",
    image: IMG.flyingRoosSassnitz,
    desc: "Australia mastered a weather-disrupted final to claim a fifth SailGP event win and extend their championship lead.",
  },
  {
    slug: "plans-uncovered-to-reinvent-sailgp-s-race-weekend-news-even-to-the-sailors",
    title: "Plans uncovered to reinvent SailGP's race weekend",
    image:
      "https://thefoil.com/media/4VuyF-wFzDEjovsQXItmgj349qoEU1bP95n2xJbldIM/resize:fill-down:690:388/gravity:fp:0.5:0.5/quality:60/dpr:1/2026/08/jl108682-1.jpg",
    desc: "A fan survey revealed possible group draws, tiered racing and scoring changes for a future SailGP format.",
  },
  {
    slug: "full-steam-ahead-and-scrambling-to-keep-our-heads-above-water-grant-simmer-on-australia-s-cup-comeback",
    title: "'Full steam ahead': Grant Simmer on Australia's Cup comeback",
    image:
      "https://thefoil.com/media/Z4trZSW3ehVrVFS3qWOILawnTQl_Pv_9-z_lS_AD6qY/resize:fill-down:690:388/gravity:fp:0.5:0.5/quality:60/dpr:1/2026/06/grant-auacannouncement-imageteamauac.jpg",
    desc: "The Australia II navigator on the effort behind the current America's Cup comeback.",
  },
  {
    slug: "rising-stars-nathan-berger-the-17-year-old-wingfoiler-beating-his-heroes",
    title: "Rising Stars: Nathan Berger, the 17-year-old wingfoiler",
    image:
      "https://thefoil.com/media/6jqFsZkVz92e9pViFIC9cvcOgfOK1JayU4J0n2Ya0i8/resize:fill-down:690:388/gravity:fp:0.5757575758:0.4289940828/quality:60/dpr:1/2026/05/nathan-berger8.jpg",
    desc: "The first Rising Stars feature profiles a young athlete already competing internationally.",
  },
  {
    slug: "luca-rizzotti-bought-a-moth-in-2007-and-accidentally-started-a-movement",
    title: "Luca Rizzotti bought a Moth and accidentally started a movement",
    image:
      "https://thefoil.com/media/E3aCJ86SfKfu9q-SMKv2amCZNdndXRn09tP4ign_y9g/resize:fill-down:690:388/gravity:fp:0.5:0.5/quality:60/dpr:1/2026/03/54620591537-354128013c-k.jpg",
    desc: "The Italian sailor whose Moth purchase influenced a broader foiling movement.",
  },
  {
    slug: "the-safest-is-when-you-re-pushing-hard-billy-gooderham-explains-flight-control",
    title: "'The safest is when you're pushing hard' – Billy Gooderham on flight control",
    image:
      "https://thefoil.com/media/88hujdjXkimh2hjECgSbi8G11dmmrQgPo1mSEJHk3mg/resize:fill-down:690:388/gravity:fp:0.4804597701:0.5023331499/quality:60/dpr:1/2026/02/northstar1.jpeg",
    desc: "The NorthStar SailGP flight controller on F50 foil-control techniques and safety.",
  },
  {
    slug: "podcast-ep-8-sydney-sailgp-preview-and-quentin-delapierre-on-safety",
    title: "Podcast Ep. 8 – Sydney SailGP preview + Quentin Delapierre",
    image:
      "https://thefoil.com/media/OklF53Inp_snGNaLlSc_Z7oc8gG_XysfQ3vfUfQQsOk/resize:fill-down:690:388/gravity:fp:0.4962835906:0.6871458395/quality:60/dpr:1/2026/07/pod26thumb.jpg",
    desc: "A podcast episode addressing safety concerns following the Auckland collision.",
  },
  {
    slug: "the-olympian-windsurfer-with-a-golden-future-far-beyond-la-2028",
    title: "The Olympian windsurfer with a golden future beyond LA 2028",
    image:
      "https://thefoil.com/media/U8j6sq1yq50MNqneZqWV-fKQwvMWiJ23hK4IqlF_wBM/resize:fill-down:690:388/gravity:fp:0.5:0.5/quality:60/dpr:1/2026/02/grae-morris-2.jpeg",
    desc: "A profile of Australian windsurfer Grae Morris and his prospects beyond the Olympics.",
  },
  {
    slug: "podcast-can-anyone-beat-new-zealand-to-win-the-38th-america-s-cup",
    title: "Podcast: Can anyone beat New Zealand to win the 38th America's Cup?",
    image:
      "https://thefoil.com/media/DKNOTHYBJW-95Y9EeOQwx462bvV0HJVYFbaIEkadvhQ/resize:fill-down:690:388/gravity:fp:0.5:0.5/quality:60/dpr:1/2026/07/foil-podcast-ep27.jpg",
    desc: "Can any of the six challengers really take on and beat Emirates Team New Zealand?",
  },
  {
    slug: "podcast-sailgp-vs-america-s-cup-can-they-coexist",
    title: "Podcast: SailGP vs America's Cup – can they coexist?",
    image:
      "https://thefoil.com/media/OklF53Inp_snGNaLlSc_Z7oc8gG_XysfQ3vfUfQQsOk/resize:fill-down:690:388/gravity:fp:0.4962835906:0.6871458395/quality:60/dpr:1/2026/07/pod26thumb.jpg",
    desc: "A discussion of the competitive dynamics between the two major sailing formats.",
  },
  {
    slug: "podcast-america-s-cup-is-back-the-full-cagliari-debrief",
    title: "Podcast: America's Cup is back! The full Cagliari debrief",
    image:
      "https://thefoil.com/media/dtwoxDuA6lLEBMIsdFmKtcF-fieju814c7HeIuHU0mo/resize:fill-down:532:300/gravity:fp:0.1914893617:0.4600980829/quality:60/dpr:1/2026/05/A8I5xxHXMuY.jpg",
    desc: "The episode analysing the preliminary America's Cup regatta results in Cagliari.",
  },
  {
    slug: "like-watching-jet-fighters-dance-on-water-how-luna-rossa-lit-up-the-ac38-opener",
    title: "'Like watching jet fighters dance on water': Luna Rossa lights up the AC38 opener",
    image:
      "https://thefoil.com/media/dBTTONdJFQWIf2atg27IKK_tQtdgVuHqlJ6eIv7jACU/resize:fill-down:540:295/gravity:fp:0.5:0.5/quality:60/dpr:1/2026/01/nochesanjuan-valencia-4-1.jpg",
    desc: "Coverage of Luna Rossa's strong performance at the AC38 Cagliari opener.",
  },
  {
    slug: "podcast-extra-mozzy-and-freddie-preview-the-ac38-cagliari-prelim",
    title: "Podcast Extra: Mozzy and Freddie preview the AC38 Cagliari prelim",
    image:
      "https://thefoil.com/media/Pdz6pWSetC2coPjMqbNjYUjLhhRZ52S_gxCpmwiGVSk/resize:fill-down:690:388/gravity:fp:0.1914893617:0.4600980829/quality:60/dpr:1/2026/05/A8I5xxHXMuY.jpg",
    desc: "A bonus episode previewing the AC38 preliminary regatta.",
  },
  {
    slug: "podcast-it-starts-with-a-dream-glenn-ashby-on-australia-s-ac38-challenge-the-foil-podcast-ep-20",
    title: "Podcast: 'It starts with a dream' – Glenn Ashby on Australia's AC38 challenge",
    image:
      "https://thefoil.com/media/cEU2dqX2riTz_QNbWdMf2JFR4GUC9CxGFkxKPebEY2I/resize:fill-down:532:300/gravity:fp:0.6278381625:0.3250833809/quality:60/dpr:2/2026/08/black-foils-auckland-2026-brett-phibbs.jpg",
    desc: "'The time is now,' says Glenn Ashby on Team Australia's newly-minted Cup challenge.",
  },
  {
    slug: "freddie-carr-cowes-week-turns-200-why-britain-s-greatest-regatta-still-means-everything",
    title: "Freddie Carr: Cowes Week turns 200 – why it still means everything",
    image:
      "https://thefoil.com/media/D9-BwEUpx2zkordmXhfkesEf3umA15CkbUq_0hVLUFk/resize:fill-down:690:388/gravity:fp:0.3212765957:0.4967784486/quality:60/dpr:1/2026/07/cowes-week-2018.jpg",
    desc: "Why the historic British regatta still matters in the modern sailing calendar.",
  },
  {
    slug: "freddie-carr-winging-it-at-half-time-in-sailgp",
    title: "Freddie Carr: winging it at half-time in SailGP",
    image:
      "https://thefoil.com/media/1iyA3HxN0dBlrtWrFrClGhvEmC088eDTOXoEX2XqirA/resize:fill-down:690:388/gravity:fp:0.3738738739:0.7896640827/quality:60/dpr:1/2026/06/ab305255.jpg",
    desc: "A mid-season performance analysis of the SailGP teams, backed by the numbers.",
  },
  {
    slug: "andy-rice-rates-the-fleet-after-canada-sailgp",
    title: "Andy Rice rates the fleet after Canada SailGP",
    image:
      "https://thefoil.com/media/qKjnrDjyAPpM3cBcH277RkMeUBqSXdeGFzwHNmpN4rY/resize:fill-down:690:388/gravity:fp:0.5127659574:0.5173727167/quality:60/dpr:1/2026/06/sv3-3959-samo-vidic-for-sailgp.jpg",
    desc: "Post-race analysis, with Los Gallos' strategic move the season's standout moment.",
  },
  {
    slug: "after-the-new-york-crash-what-should-sailgp-actually-do-the-foil-community-weighs-in",
    title: "After the New York crash, what should SailGP actually do?",
    image:
      "https://thefoil.com/media/EDze0rwkrUx65k8kq9Lwu9oSHPCEuRO6nTICXHbiUnE/resize:fill-down:690:388/gravity:fp:0.5:0.5/quality:60/dpr:1/2026/06/sb1-9984-simon-bruty-sailgp.jpg",
    desc: "A community discussion sparked by the collision at the New York SailGP.",
  },
  {
    slug: "the-questions-that-remain-following-new-york-sailgp",
    title: "The questions that remain following New York SailGP",
    image:
      "https://thefoil.com/media/Um8anF-sXKcm8j780JjLYBS9DIkHC8GfcXQjrug28Xs/resize:fill-down:690:388/gravity:fp:0.4787792084:0.701049749/quality:60/dpr:1/2026/06/new-york-sailgp-statue-of-liberty-2026.jpg",
    desc: "From a three-boat collision to a grand final that divided opinion.",
  },
];

type PoolEvent = { slug: string; heading: string; image: string; startDate: string; endDate: string; location: string };

const EVENT_POOL: PoolEvent[] = [
  {
    slug: "the-ocean-race-atlantic",
    heading: "The Ocean Race Atlantic",
    image:
      "https://thefoil.com/media/0IFpwb4HJabWEJukldoszeTslP9-KwJiWsr1dItg4qM/resize:fill-down:460:240/gravity:fp:0.4787792084:0.701049749/quality:60/dpr:1/2026/08/tora1.webp",
    startDate: "2026-09-01",
    endDate: "2026-09-01",
    location: "Atlantic Ocean",
  },
  {
    slug: "spain-sail-grand-prix-valencia",
    heading: "Spain Sail Grand Prix | Valencia",
    image:
      "https://thefoil.com/media/iPBCq3_vvcFn6JcR7RXGUjAUYxDugVCydAXGxRUu5hI/resize:fill-down:460:240/gravity:fp:0.4787792084:0.701049749/quality:60/dpr:1/2026/01/nochesanjuan-valencia-4-1.jpg",
    startDate: "2026-09-05",
    endDate: "2026-09-06",
    location: "Valencia, Spain",
  },
  {
    slug: "rolex-switzerland-sail-grand-prix-geneva",
    heading: "Rolex Switzerland Sail Grand Prix | Geneva",
    image:
      "https://thefoil.com/media/dakrdWO1K6E-9HkB-ty70MpQpJZphrX0yOUwtJVMzW4/resize:fill-down:460:240/gravity:fp:0.4787792084:0.701049749/quality:60/dpr:1/2026/01/sailgp-geneva-event.png",
    startDate: "2026-09-19",
    endDate: "2026-09-20",
    location: "Geneva, Switzerland",
  },
  {
    slug: "emirates-dubai-sail-grand-prix-presented-by-dp-world",
    heading: "Emirates Dubai Sail Grand Prix",
    image:
      "https://thefoil.com/media/Xu7BYqNK4JOlhDFN95CM5vkEx1z5Tz816mIqhhnPdJo/resize:fill-down:460:240/gravity:fp:0.4787792084:0.701049749/quality:60/dpr:1/2025/12/felix-diemer-sailgp-1.png",
    startDate: "2026-11-21",
    endDate: "2026-11-22",
    location: "Dubai, United Arab Emirates",
  },
  {
    slug: "mubadala-abu-dhabi-sail-grand-prix-2026-season-grand-final-presented-by-abu-dhabi-sports-council",
    heading: "Mubadala Abu Dhabi Sail Grand Prix | Grand Final",
    image:
      "https://thefoil.com/media/xjPn5tb1VybfsEuZ4Y9J9RiSHePy3sFR2qDTv3tu7Ic/resize:fill-down:336:258/gravity:ce/quality:60/dpr:1/2025/12/ricardo-pinto-sailgp-1-1.png",
    startDate: "2026-11-28",
    endDate: "2026-11-29",
    location: "Abu Dhabi, United Arab Emirates",
  },
  {
    slug: "oracle-perth-sail-grand-prix-presented-by-kpmg",
    heading: "Oracle Perth Sail Grand Prix | KPMG",
    image: IMG.eventPerth,
    startDate: "2026-01-17",
    endDate: "2026-01-18",
    location: "Perth, Australia",
  },
  {
    slug: "itm-new-zealand-sail-grand-prix-auckland",
    heading: "ITM New Zealand Sail Grand Prix | Auckland",
    image: IMG.eventAuckland,
    startDate: "2026-02-14",
    endDate: "2026-02-15",
    location: "Auckland, New Zealand",
  },
  {
    slug: "kpmg-sydney-sail-grand-prix",
    heading: "KPMG Sydney Sail Grand Prix",
    image: IMG.eventSydney,
    startDate: "2026-02-28",
    endDate: "2026-03-01",
    location: "Sydney, Australia",
  },
  {
    slug: "enel-rio-sail-grand-prix",
    heading: "Enel Rio Sail Grand Prix",
    image: IMG.eventRio,
    startDate: "2026-04-11",
    endDate: "2026-04-12",
    location: "Rio de Janeiro, Brazil",
  },
  {
    slug: "apex-group-bermuda-sail-grand-prix",
    heading: "Apex Group Bermuda Sail Grand Prix",
    image: IMG.eventBermuda,
    startDate: "2026-05-09",
    endDate: "2026-05-10",
    location: "Great Sound, Bermuda",
  },
  {
    slug: "mubadala-new-york-sail-grand-prix",
    heading: "Mubadala New York Sail Grand Prix",
    image: IMG.eventNewYork,
    startDate: "2026-05-30",
    endDate: "2026-05-31",
    location: "New York, USA",
  },
  {
    slug: "canada-sail-grand-prix-halifax",
    heading: "Canada Sail Grand Prix | Halifax",
    image: IMG.eventHalifax,
    startDate: "2026-06-20",
    endDate: "2026-06-21",
    location: "Halifax, Canada",
  },
  {
    slug: "emirates-great-britain-sail-grand-prix-portsmouth",
    heading: "Emirates Great Britain Sail Grand Prix | Portsmouth",
    image: IMG.eventPortsmouth,
    startDate: "2026-07-25",
    endDate: "2026-07-26",
    location: "Portsmouth, United Kingdom",
  },
  {
    slug: "rockwool-germany-sail-grand-prix-sassnitz",
    heading: "Rockwool Germany Sail Grand Prix | Sassnitz",
    image: IMG.eventGermany,
    startDate: "2026-08-22",
    endDate: "2026-08-23",
    location: "Sassnitz, Germany",
  },
  {
    slug: "ac38-preliminary-regatta-1-ac40s",
    heading: "America's Cup AC38 Preliminary Regatta | Cagliari",
    image: IMG.eventCagliari,
    startDate: "2026-05-22",
    endDate: "2026-05-22",
    location: "Cagliari, Italy",
  },
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

/** Mock contextual links with stable, explicit video-to-article assignments. */
function contextualLinks(idPrefix: string): LinkItemData[] {
  return LATEST_VIDEO_IDS.map((video_id, i) => {
    const articleSlug = LATEST_VIDEO_ARTICLE_SLUGS[i]!;
    const article = ARTICLE_POOL.find(({ slug }) => slug === articleSlug) ?? poolAt(ARTICLE_POOL, i);
    return {
      id: `${idPrefix}-${i}`,
      video_id,
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
        title: "The week in racing – 31 August '26",
        href: "/article/the-week-in-racing-31-august-26",
        image: { src: IMG.weekInRacing31August, alt: "ILCA 7 fleet racing in Dublin Bay" },
      },
      upNextArticles: [
        {
          id: "sailgp-news-2",
          title: "Rate the fleet: Andy Rice on Sassnitz SailGP",
          href: "/article/rate-the-fleet-andy-rice-on-sassnitz-sailgp",
          image: { src: IMG.rateFleetSassnitz, alt: "SailGP fleet racing at Sassnitz" },
        },
        {
          id: "sailgp-news-3",
          title: "Luna Rossa test new rudder – and take a knock",
          href: "/article/luna-rossa-test-new-rudder-and-take-a-knock",
          image: { src: IMG.lunaRossaRudder, alt: "Luna Rossa testing its AC75 off Cagliari" },
        },
        {
          id: "sailgp-news-4",
          title: "Freddie Carr: The SailGP teams that must decide to stick or twist",
          href: "/article/freddie-carr-the-sailgp-teams-that-must-decide-to-stick-or-twist",
          image: { src: IMG.sailgpStickOrTwist, alt: "SailGP teams racing at Sassnitz" },
        },
        {
          id: "sailgp-news-5",
          title: "The week in racing – 24 August '26",
          href: "/article/the-week-in-racing-24-august-26",
          image: { src: IMG.weekInRacing24August, alt: "ILCA racing photographed by Peter Brøgger" },
        },
        {
          id: "sailgp-news-6",
          title: "Flying Roos hit high five with victory in Sassnitz",
          href: "/article/flying-roos-hit-high-five-with-victory-in-sassnitz",
          image: { src: IMG.flyingRoosSassnitz, alt: "Flying Roos racing at the Germany Sail Grand Prix" },
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
          id: "the-ocean-race-atlantic-2026",
          heading: "The Ocean Race Atlantic",
          image: { src: IMG.oceanRaceAtlantic },
          startDate: "2026-09-01",
          endDate: "2026-09-01",
          location: "New York to Lorient",
          cta: { label: "Read More", href: "/article/the-ocean-race-atlantic" },
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
          id: "emirates-dubai-sail-gp-2026",
          heading: "Emirates Dubai Sail Grand Prix | Dubai",
          image: { src: IMG.sailgpLosAngeles },
          startDate: "2026-11-21",
          endDate: "2026-11-22",
          location: "Dubai, United Arab Emirates",
          cta: { label: "Read More", href: "/article/emirates-dubai-sail-grand-prix-presented-by-dp-world" },
        },
        {
          id: "mubadala-abu-dhabi-sail-gp-2026",
          heading: "Mubadala Abu Dhabi Sail Grand Prix | Grand Final",
          image: { src: IMG.ricardo },
          startDate: "2026-11-28",
          endDate: "2026-11-29",
          location: "Abu Dhabi, United Arab Emirates",
          cta: {
            label: "Read More",
            href: "/article/mubadala-abu-dhabi-sail-grand-prix-2026-season-grand-final-presented-by-abu-dhabi-sports-council",
          },
        },
        {
          id: "oracle-perth-sail-gp-2026",
          heading: "Oracle Perth Sail Grand Prix | KPMG",
          image: { src: IMG.eventPerth },
          startDate: "2026-01-17",
          endDate: "2026-01-18",
          location: "Perth, Australia",
          cta: {
            label: "Read More",
            href: "https://thefoil.com/events/oracle-perth-sail-grand-prix-presented-by-kpmg/",
          },
        },
        {
          id: "itm-new-zealand-sail-gp-2026",
          heading: "ITM New Zealand Sail Grand Prix | Auckland",
          image: { src: IMG.eventAuckland },
          startDate: "2026-02-14",
          endDate: "2026-02-15",
          location: "Auckland, New Zealand",
          cta: {
            label: "Read More",
            href: "https://thefoil.com/events/itm-new-zealand-sail-grand-prix-auckland/",
          },
        },
        {
          id: "kpmg-sydney-sail-gp-2026",
          heading: "KPMG Sydney Sail Grand Prix",
          image: { src: IMG.eventSydney },
          startDate: "2026-02-28",
          endDate: "2026-03-01",
          location: "Sydney, Australia",
          cta: {
            label: "Read More",
            href: "https://thefoil.com/events/kpmg-sydney-sail-grand-prix/",
          },
        },
        {
          id: "enel-rio-sail-gp-2026",
          heading: "Enel Rio Sail Grand Prix",
          image: { src: IMG.eventRio },
          startDate: "2026-04-11",
          endDate: "2026-04-12",
          location: "Rio de Janeiro, Brazil",
          cta: {
            label: "Read More",
            href: "https://thefoil.com/events/enel-rio-sail-grand-prix/",
          },
        },
        {
          id: "apex-group-bermuda-sail-gp-2026",
          heading: "Apex Group Bermuda Sail Grand Prix",
          image: { src: IMG.eventBermuda },
          startDate: "2026-05-09",
          endDate: "2026-05-10",
          location: "Great Sound, Bermuda",
          cta: {
            label: "Read More",
            href: "https://thefoil.com/events/apex-group-bermuda-sail-grand-prix/",
          },
        },
        {
          id: "mubadala-new-york-sail-gp-2026",
          heading: "Mubadala New York Sail Grand Prix",
          image: { src: IMG.eventNewYork },
          startDate: "2026-05-30",
          endDate: "2026-05-31",
          location: "New York, USA",
          cta: {
            label: "Read More",
            href: "https://thefoil.com/events/mubadala-new-york-sail-grand-prix/",
          },
        },
        {
          id: "canada-sail-gp-halifax-2026",
          heading: "Canada Sail Grand Prix | Halifax",
          image: { src: IMG.eventHalifax },
          startDate: "2026-06-20",
          endDate: "2026-06-21",
          location: "Halifax, Canada",
          cta: {
            label: "Read More",
            href: "https://thefoil.com/events/canada-sail-grand-prix-halifax/",
          },
        },
        {
          id: "emirates-gb-sail-gp-portsmouth-2026",
          heading: "Emirates Great Britain Sail Grand Prix | Portsmouth",
          image: { src: IMG.eventPortsmouth },
          startDate: "2026-07-25",
          endDate: "2026-07-26",
          location: "Portsmouth, United Kingdom",
          cta: {
            label: "Read More",
            href: "https://thefoil.com/events/emirates-great-britain-sail-grand-prix-portsmouth/",
          },
        },
        {
          id: "rockwool-germany-sail-gp-sassnitz-2026",
          heading: "Rockwool Germany Sail Grand Prix | Sassnitz",
          image: { src: IMG.eventGermany },
          startDate: "2026-08-22",
          endDate: "2026-08-23",
          location: "Sassnitz, Germany",
          cta: {
            label: "Read More",
            href: "https://thefoil.com/events/rockwool-germany-sail-grand-prix-sassnitz/",
          },
        },
        {
          id: "ac38-preliminary-regatta-cagliari-2026",
          heading: "America's Cup AC38 Preliminary Regatta | Cagliari",
          image: { src: IMG.eventCagliari },
          startDate: "2026-05-22",
          endDate: "2026-05-22",
          location: "Cagliari, Italy",
          cta: {
            label: "Read More",
            href: "https://thefoil.com/events/ac38-preliminary-regatta-1-ac40s/",
          },
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
      items: contextualLinks("interview-link"),
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
          title: "Rising Stars: Nathan Berger, the 17-year-old wingfoiler beating his heroes",
          href: "/article/rising-stars-nathan-berger-the-17-year-old-wingfoiler-beating-his-heroes",
          image: { src: IMG.nathanBerger, alt: "Wingfoiler Nathan Berger competing on the World Tour" },
        },
        {
          id: "interview-3",
          title: "Luca Rizzotti bought a Moth in 2007 and accidentally started a movement",
          href: "/article/luca-rizzotti-bought-a-moth-in-2007-and-accidentally-started-a-movement",
          image: { src: IMG.offshoreGeneric, alt: "Luca Rizzotti and the Moth sailing movement" },
        },
        {
          id: "interview-4",
          title: "'The safest is when you're pushing hard' – Billy Gooderham explains flight control",
          href: "/article/the-safest-is-when-you-re-pushing-hard-billy-gooderham-explains-flight-control",
          image: { src: IMG.offshoreNorthstar, alt: "Billy Gooderham on SailGP flight control" },
        },
        {
          id: "interview-5",
          title: "The Olympian windsurfer with a golden future far beyond LA 2028",
          href: "/article/the-olympian-windsurfer-with-a-golden-future-far-beyond-la-2028",
          image: { src: IMG.graeMorris, alt: "Australian Olympic windsurfer Grae Morris" },
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
    items: widget.items ? contextualLinks(`${idBase}-link`) : undefined,
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
