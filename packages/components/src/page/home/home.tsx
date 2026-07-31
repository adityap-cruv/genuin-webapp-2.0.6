"use client";

import {
  Button,
  Input,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  ThemeProvider,
} from "@genuin/ui";
import { ArrowRight, Play, Radio, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { type FormEvent, useState } from "react";
import { createPortal } from "react-dom";

import { GenuinEmbedCarousel } from "@genuin/components/legacy/websitev5/genuin-embed-carousel";

import styles from "./home.module.css";

const ASSET_ROOT =
  "https://octocanvas-artifacts.s3.ap-south-1.amazonaws.com/sessions/b6695b6a8a0b444699c9337f0723d88e/generated";

const placements = {
  carousel: {
    containerId: "foil-hero-video-carousel",
    styleId: "6a2660f445aec54862ee2f59",
    placementId: "6a2660f445aec54862ee2f58",
    apiKey: "8a5582af807e98dbad239b749a1cd7fb026831eec1a95d00",
    sdkSrc: "https://media.begenuin.com/sdk/2.0.5/gen_sdk.min.js",
    width: "100%",
    maxWidth: "100%",
    height: "400px",
  },
  feed: {
    containerId: "foil-hero-video-feed",
    styleId: "6a032db60ae65ee82495dd73",
    placementId: "6a032db60ae65ee82495dd72",
    apiKey: "8a5582af807e98dbad239b749a1cd7fb026831eec1a95d00",
    sdkSrc: "https://media.begenuin.com/sdk/2.0.5/gen_sdk.min.js",
    configuration: {
      sections: [{ title: "{{brand_context}}" }],
    },
    width: "100%",
    maxWidth: "100%",
    height: "540px",
  },
  championshipFeed: {
    containerId: "foil-championship-video-feed",
    styleId: "6a032db60ae65ee82495dd73",
    placementId: "6a032db60ae65ee82495dd72",
    apiKey: "8a5582af807e98dbad239b749a1cd7fb026831eec1a95d00",
    sdkSrc: "https://media.begenuin.com/sdk/2.0.5/gen_sdk.min.js",
    width: "100%",
    maxWidth: "100%",
    height: "746px",
  },
  grid: {
    containerId: "foil-fleet-fan-zone-grid",
    styleId: "69f85cd54e1859a88008a834",
    placementId: "69f85cd54e1859a88008a833",
    apiKey: "8a5582af807e98dbad239b749a1cd7fb026831eec1a95d00",
    sdkSrc: "https://media.begenuin.com/sdk/2.0.5/gen_sdk.min.js",
    width: "920px",
    maxWidth: "100%",
    height: "760px",
  },
} as const;

const beyondStories = [
  {
    slug: "americas-cup-next-ac75",
    tag: "America's Cup",
    title: "Team New Zealand unveils the first AC75 of the next cycle — and it's smaller than anyone expected.",
    byline: "By R. Kawhena · 5 min read",
  },
  {
    slug: "olympic-49er-hyeres",
    tag: "Olympic 49er",
    title: "Italy stamped their authority all over the Bay of Hyères this week. Here's how.",
    byline: "By F. Rossi · 6 min read",
  },
  {
    slug: "ocean-race-inshore-intensity",
    tag: "Ocean Race",
    title: "Offshore at inshore intensity — that is the new reality of ocean racing.",
    byline: "By S. Larsen · 8 min read",
  },
] as const;

const communities = [
  {
    name: "Racecraft Unlocked",
    image: "https://images.unsplash.com/photo-1590012314607-cda9d9b699ae?w=900&q=85",
    description: "Master competitive sailing — tactics, data and race insights from the pros.",
    stats: ["1 Members", "1 Groups", "10 Videos"],
  },
  {
    name: "Fleet Fan Zone",
    image: "https://images.unsplash.com/photo-1534430480872-3498386e7856?w=900&q=85",
    description: "Race reactions, hot takes and behind-the-scenes moments from the fleet.",
    stats: ["2.4K Members", "8 Groups", "134 Videos"],
  },
  {
    name: "Foil Tech Lab",
    image: "https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?w=900&q=85",
    description: "Foil engineering, velocity data and the science powering SailGP boats.",
    stats: ["1.1K Members", "5 Groups", "89 Videos"],
  },
  {
    name: "Wind & Tide Report",
    image: "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=900&q=85",
    description: "Weather strategy, tidal windows and course conditions decoded by experts.",
    stats: ["876 Members", "3 Groups", "47 Videos"],
  },
  {
    name: "Pit Lane Pass",
    image: "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=900&q=85",
    description: "Exclusive crew interviews, dock-out prep and day-of race build-up coverage.",
    stats: ["3.2K Members", "12 Groups", "201 Videos"],
  },
  {
    name: "Young Guns",
    image: "https://images.unsplash.com/photo-1520333789090-1afc82db536a?w=900&q=85",
    description: "Rising stars in SailGP — watch the next generation of champions take flight.",
    stats: ["654 Members", "4 Groups", "56 Videos"],
  },
  {
    name: "Championship HQ",
    image: "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=900&q=85",
    description: "Live standings, points breakdowns and title-race drama from every venue.",
    stats: ["5.7K Members", "16 Groups", "310 Videos"],
  },
  {
    name: "Ocean & Planet",
    image: "https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?w=900&q=85",
    description: "SailGP's sustainability mission — clean oceans, net-zero racing and climate action.",
    stats: ["988 Members", "6 Groups", "73 Videos"],
  },
] as const;

export type ChampionshipEntry = {
  rank: string;
  flag: string;
  team: string;
  driver: string;
  points: string;
  lastEvent: string;
  trend: string;
  athleteSlug?: string;
};

const standings: readonly ChampionshipEntry[] = [
  { rank: "01", flag: "AUS", team: "Australia SailGP Team", driver: "Slingsby", points: "74", lastEvent: "SYD · 1", trend: "● STEADY", athleteSlug: "slingsby" },
  { rank: "02", flag: "NZL", team: "New Zealand SailGP Team", driver: "Outteridge", points: "62", lastEvent: "SYD · 2", trend: "▲ CLIMBING", athleteSlug: "outteridge" },
  { rank: "03", flag: "FRA", team: "France SailGP Team", driver: "Delapierre", points: "58", lastEvent: "SYD · 3", trend: "▲ LURKING", athleteSlug: "delapierre" },
  { rank: "04", flag: "GBR", team: "Emirates GBR SailGP Team", driver: "Mills", points: "54", lastEvent: "SYD · 5", trend: "▼ STALLING", athleteSlug: "mills" },
  { rank: "05", flag: "ESP", team: "Spain SailGP Team", driver: "Barceló", points: "47", lastEvent: "SYD · 4", trend: "● STEADY", athleteSlug: "barcelo" },
  { rank: "06", flag: "DEN", team: "ROCKWOOL Denmark SailGP Team", driver: "Høgh-Christensen", points: "42", lastEvent: "SYD · 7", trend: "▼ FADING", athleteSlug: "hogh-christensen" },
  { rank: "07", flag: "USA", team: "United States SailGP Team", driver: "Buchan", points: "39", lastEvent: "SYD · 6", trend: "▲ CLIMBING", athleteSlug: "buchan" },
  { rank: "08", flag: "SUI", team: "Switzerland SailGP Team", driver: "Bjorn", points: "33", lastEvent: "SYD · 8", trend: "● STEADY", athleteSlug: "bjorn" },
  { rank: "09", flag: "CAN", team: "Canada SailGP Team", driver: "Saunders", points: "28", lastEvent: "SYD · 9", trend: "▼ FREEFALL", athleteSlug: "saunders" },
  { rank: "10", flag: "GER", team: "Germany SailGP Team", driver: "Ehman", points: "24", lastEvent: "SYD · 10", trend: "● LURKING", athleteSlug: "ehman" },
];

const deskStories = [
  {
    slug: "article-1",
    image: "foil-desk-card-1_v0.png",
    tag: "★ Editor's Pick · Tactical Breakdown",
    title: "Slingsby's start-line gamble was brilliant. It was also wrong.",
    byline: "By T. Harding · 6 min read",
  },
  {
    slug: "article-2",
    image: "foil-desk-card-2_v0.png",
    tag: "Interview",
    title: 'Outteridge on home water: "We have been waiting three years for this weekend."',
    byline: "By R. Kawhena · 9 min read",
  },
  {
    slug: "article-3",
    image: "foil-desk-card-3_v0.png",
    tag: "Data Dive",
    title: "Why wing trim is where the Aussies are losing half a knot.",
    byline: "By M. Cole · 8 min read",
  },
  {
    slug: "article-4",
    image: "foil-desk-card-4_v0.png",
    tag: "Tactical Breakdown",
    title: "Inside the grinder's race: seven minutes of flat-out sprint.",
    byline: "By L. Dubois · 7 min read",
  },
] as const;

const calendar = [
  { slug: "sydney", venue: "Sydney", dates: "14–16 FEB · AUS", status: "Done", image: "calendar-done-thumb_v0.png" },
  { slug: "auckland", venue: "Auckland", dates: "20–22 MAR · NZL", status: "Next up", image: "countdown-hero-bg_v0.png" },
  { slug: "saint-tropez", venue: "Saint-Tropez", dates: "17–19 APR · FRA", status: "Upcoming", image: "calendar-upcoming-thumb_v0.png" },
  { slug: "plymouth", venue: "Plymouth", dates: "15–17 MAY · GBR", status: "Upcoming", image: "calendar-upcoming-thumb_v0.png" },
  { slug: "halifax", venue: "Halifax", dates: "12–14 JUN · CAN", status: "Upcoming", image: "calendar-upcoming-thumb_v0.png" },
] as const;

const listenAndWatch = [
  {
    image: "podcast-artwork_v0.png",
    kicker: "EP 47 · Podcast",
    title: "The Auckland Preview: Can the Kiwis Finally Hold Home Water?",
    runtime: "48 min",
    description:
      "With Nathan Outteridge, driver NZ SailGP Team. 48 minutes of unfiltered race-week analysis before the gun.",
    action: "Play episode",
  },
  {
    image: "video-breakdown-thumbnail_v0.png",
    kicker: "Tactical Breakdown",
    title: "Slingsby's Start-Line Gamble, Frame by Frame",
    runtime: "12 min",
    description:
      "A frame-by-frame tactical breakdown of the start, the pressure shift and the decision that changed the race.",
    action: "Play breakdown",
  },
] as const;

type ListenAndWatchItem = (typeof listenAndWatch)[number];

const athletes = [
  ["1", "Slingsby", "Tom Slingsby", "AUS · Australia", "Top speed · 53.8 kn", "slingsby"],
  ["2", "Outteridge", "Nathan Outteridge", "NZL · New Zealand", "Start-line wins · 7 of 11", "outteridge"],
  ["3", "Delapierre", "Quentin Delapierre", "FRA · France", "Average finish · 3.4", "delapierre"],
  ["4", "Mills", "Dylan Mills", "GBR · Great Britain", "Mark first · 12 of 33", "mills"],
  ["11", "Grael", "Martine Grael", "BRA · Brazil", "First-gate conversion · 68%", "grael"],
  ["5", "Barceló", "Diego Barceló", "ESP · Spain", "Top speed · 50.1 kn", "barcelo"],
] as const;

const footerLinkGroups = [
  {
    title: "Circuits",
    links: [
      ["SailGP", "#foil-hero-title"],
      ["America's Cup", "#beyond-sailgp"],
      ["Olympics", "#beyond-sailgp"],
      ["Offshore", "#beyond-sailgp"],
    ],
  },
  {
    title: "The Foil",
    links: [
      ["About", "/home"],
      ["Writers", "#foil-desk"],
      ["Contact", "mailto:tips@thefoil.media"],
      ["Advertise", "mailto:tips@thefoil.media?subject=Advertising with The Foil"],
    ],
  },
  {
    title: "Follow",
    links: [
      ["YouTube", "#"],
      ["Instagram", "#"],
      ["X", "#"],
      ["RSS", "#"],
    ],
  },
] as const;

type PlacementProps = (typeof placements)[keyof typeof placements] & { label: string };

function Placement({ width, maxWidth, height, label, ...integration }: PlacementProps) {
  return (
    <div className={styles.sdkContainer} aria-label={label} style={{ width, maxWidth, height, minHeight: height }}>
      <GenuinEmbedCarousel {...integration} />
    </div>
  );
}

function SectionHeader({ title, meta, id }: { title: string; meta: string; id?: string }) {
  return (
    <div className={styles.sectionHeader}>
      <h2 id={id}>{title}</h2>
      <span>{meta}</span>
    </div>
  );
}

type HomeProps = {
  onOpenArticle?: (slug: string) => void;
  onOpenAthlete?: (slug: string) => void;
  onOpenChampionship?: (entry: ChampionshipEntry) => void;
  onOpenCalendar?: (slug: string) => void;
  onOpenBeyond?: (slug: string) => void;
};

export function Home({
  onOpenArticle,
  onOpenAthlete,
  onOpenChampionship,
  onOpenCalendar,
  onOpenBeyond,
}: HomeProps = {}) {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<ListenAndWatchItem | null>(null);

  function handleSubscribe(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubscribed(true);
  }

  function handlePlaySelectedMedia() {
    setSelectedMedia(null);

    const expandFeed = (attempt = 0) => {
      const sdkWindow = window as Window & {
        genuin?: {
          expand?: (containerId: string) => void | Promise<void>;
          SDK?: {
            expand?: (containerId: string) => void;
          };
        };
        cxr?: {
          expand?: (instanceId: string) => void;
        };
      };
      const placement = document.getElementById(placements.feed.containerId);
      const instanceId = placement?.getAttribute("data-instance-id");

      if (sdkWindow.genuin?.expand) {
        void Promise.resolve(sdkWindow.genuin.expand(placements.feed.containerId)).catch(() => {
          sdkWindow.cxr?.expand?.(instanceId ?? placements.feed.containerId);
        });
        return;
      }

      if (sdkWindow.genuin?.SDK?.expand) {
        sdkWindow.genuin.SDK.expand(placements.feed.containerId);
        return;
      }

      if (sdkWindow.cxr?.expand && (instanceId || placement)) {
        sdkWindow.cxr.expand(instanceId ?? placements.feed.containerId);
        return;
      }

      if (attempt < 20) {
        window.setTimeout(() => expandFeed(attempt + 1), 100);
      }
    };

    window.requestAnimationFrame(() => expandFeed());
  }

  function openChampionshipEntry(entry: ChampionshipEntry) {
    if (entry.athleteSlug && onOpenAthlete) {
      onOpenAthlete(entry.athleteSlug);
      return;
    }

    onOpenChampionship?.(entry);
  }

  return (
    <ThemeProvider theme="foil" className={styles.home}>
      <div className={styles.raceBar}>
        <span className={styles.liveDot} />
        Race week
        <span>·</span>
        Plymouth SGP
        <span>·</span>
        18–22 kn SW forecast Saturday
      </div>

      <section className={styles.heroCarousel} aria-labelledby="foil-hero-title">
        <h1 id="foil-hero-title" className={styles.srOnly}>
          Fan Highlights
        </h1>
        <div className={styles.heroCarouselGrid}>
          <Placement {...placements.carousel} label="Foil fan video carousel" />
        </div>
      </section>

      <section className={`${styles.contentSection} ${styles.deskSection}`} id="foil-desk">
        <SectionHeader title="From the SailGP Desk" meta="Featured stories · Live feed" />
        <div className={styles.deskFeatureLayout}>
          <Link
            href={`/foil/articles/${deskStories[0].slug}`}
            className={styles.deskLeadStory}
            aria-label={`Read ${deskStories[0].title}`}
            onClick={(event) => {
              if (!onOpenArticle) return;
              event.preventDefault();
              onOpenArticle(deskStories[0].slug);
            }}>
            <Image src={`${ASSET_ROOT}/${deskStories[0].image}`} alt="" fill sizes="(max-width: 1024px) 100vw, 38vw" />
            <div className={styles.deskStoryContent}>
              <span>{deskStories[0].tag}</span>
              <h3>{deskStories[0].title}</h3>
              <p>{deskStories[0].byline}</p>
            </div>
          </Link>
          <div className={styles.deskSupportingStories}>
            {deskStories.slice(1, 3).map((story) => (
              <Link
                href={`/foil/articles/${story.slug}`}
                className={styles.deskSupportingStory}
                aria-label={`Read ${story.title}`}
                onClick={(event) => {
                  if (!onOpenArticle) return;
                  event.preventDefault();
                  onOpenArticle(story.slug);
                }}
                key={story.title}>
                <Image src={`${ASSET_ROOT}/${story.image}`} alt="" fill sizes="(max-width: 1024px) 100vw, 20vw" />
                <div className={styles.deskStoryContent}>
                  <span>{story.tag}</span>
                  <h3>{story.title}</h3>
                  <p>{story.byline}</p>
                </div>
              </Link>
            ))}
          </div>
          <div className={styles.deskFeed} id="foil-video-feed">
            <Placement {...placements.feed} label="Live fan video feed" />
          </div>
        </div>
      </section>

      <section className={styles.contentSection} id="the-fleet">
        <SectionHeader title="The Fleet" meta="Featured drivers · Season stats" />
        <div className={styles.athleteGrid}>
          {athletes.map(([rank, surname, name, nation, stat, slug], index) => {
            const card = (
              <>
                <Image
                  src={`${ASSET_ROOT}/athlete-${index + 1}_v0.png`}
                  alt={`Editorial portrait of ${name}`}
                  fill
                  sizes="(max-width: 768px) 45vw, 14vw"
                />
                <span className={styles.athleteRank}>#{rank}</span>
                <div className={styles.athleteInfo}>
                  <small>{stat}</small>
                  <h3>{surname}</h3>
                  <p>{name}</p>
                  <span>{nation}</span>
                </div>
              </>
            );

            return (
              <Link
                href={`/foil/athletes/${slug}`}
                className={styles.athleteCard}
                aria-label={`View ${name}'s profile`}
                onClick={(event) => {
                  if (!onOpenAthlete) return;
                  event.preventDefault();
                  onOpenAthlete(slug);
                }}
                key={name}>
                {card}
              </Link>
            );
          })}
        </div>
      </section>

      <section className={styles.liveFeed} aria-labelledby="fleet-fan-zone-heading">
        <div className={styles.liveFeedHeading}>
          <span>
            <Radio size={15} />
            <strong id="fleet-fan-zone-heading">Fleet fan zone</strong>
          </span>
          Live community
        </div>
        <div className={styles.gridFrame}>
          <Placement {...placements.grid} label="iHeart six-video fleet fan zone grid" />
        </div>
      </section>

      <section className={styles.contentSection}>
        <SectionHeader title="Communities" meta="Explore all →" />
        <div className={styles.communityRail}>
          {communities.map((community) => (
            <article className={styles.communityCard} key={community.name}>
              <div className={styles.communityImage}>
                <Image src={community.image} alt="" fill sizes="340px" />
              </div>
              <div className={styles.communityTitle}>
                <h3>{community.name}</h3>
                <Button asChild theme="secondaryDark" size="sm">
                  <Link href="/explore">Join</Link>
                </Button>
              </div>
              <p>{community.description}</p>
              <div className={styles.communityStats}>
                {community.stats.map((stat) => (
                  <span key={stat}>{stat}</span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.contentSection}>
        <SectionHeader title="Season Championship" meta="2025 · Through 8 of 13 events" />
        <div className={styles.championshipLayout}>
          <div className={styles.championshipMain}>
            <div className={styles.podium}>
              {[
                { label: "02 · Silver", entry: standings[1]! },
                { label: "01 · Leader", entry: standings[0]! },
                { label: "03 · Bronze", entry: standings[2]! },
              ].map(({ label, entry }, index) => (
                <button
                  type="button"
                  className={index === 1 ? styles.podiumWinner : styles.podiumCard}
                  key={entry.driver}
                  aria-label={`View ${entry.driver} profile`}
                  onClick={() => openChampionshipEntry(entry)}>
                  <span>{label}</span>
                  <small>{entry.flag}</small>
                  <h3>{entry.driver}</h3>
                  <p>{entry.team}</p>
                  <strong>{entry.points} pts</strong>
                </button>
              ))}
            </div>
            <div className={styles.tableWrap}>
              <Table className={styles.standings}>
                <TableHeader>
                  <TableRow>
                    {["Rank", "Team", "Driver", "Points", "Last event", "Trend"].map((heading) => (
                      <TableHead key={heading}>{heading}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {standings.map((entry) => (
                    <TableRow
                      key={entry.team}
                      role="button"
                      tabIndex={0}
                      aria-label={`View ${entry.driver} championship details`}
                      onClick={() => openChampionshipEntry(entry)}
                      onKeyDown={(event) => {
                        if (event.key !== "Enter" && event.key !== " ") return;
                        event.preventDefault();
                        openChampionshipEntry(entry);
                      }}>
                      <TableCell>{entry.rank}</TableCell>
                      <TableCell>
                        <span className={styles.flag}>{entry.flag}</span> {entry.team}
                      </TableCell>
                      <TableCell>{entry.driver}</TableCell>
                      <TableCell>{entry.points}</TableCell>
                      <TableCell>{entry.lastEvent}</TableCell>
                      <TableCell
                        className={
                          entry.trend.includes("▲")
                            ? styles.trendUp
                            : entry.trend.includes("▼")
                              ? styles.trendDown
                              : ""
                        }>
                        {entry.trend}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
          <aside className={styles.championshipFeed} aria-label="Season championship live fan feed">
            <Placement {...placements.championshipFeed} label="Season championship live fan feed" />
          </aside>
        </div>
      </section>

      <section className={styles.contentSection}>
        <SectionHeader title="Season Calendar" meta="2025 · 13 Grand Prix" />
        <div className={styles.calendarRail}>
          {calendar.map((event) => (
            <button
              type="button"
              className={event.status === "Next up" ? styles.calendarNext : styles.calendarCard}
              key={event.venue}
              aria-label={`Open ${event.venue} event details`}
              onClick={() => onOpenCalendar?.(event.slug)}>
              <div className={styles.calendarTitle}>
                <div>
                  <h3>{event.venue}</h3>
                  <p>{event.dates}</p>
                </div>
                <span>{event.status}</span>
              </div>
              <div className={styles.calendarImage}>
                <Image src={`${ASSET_ROOT}/${event.image}`} alt="" fill sizes="300px" />
              </div>
              <p>Race intelligence, venue conditions and the storylines that matter.</p>
            </button>
          ))}
        </div>
      </section>

      <section className={styles.contentSection}>
        <SectionHeader title="Listen & Watch" meta="New this week" />
        <div className={styles.mediaGrid}>
          {listenAndWatch.map((item) => (
            <article
              className={styles.mediaCard}
              key={item.title}
              role="button"
              tabIndex={0}
              onClick={() => setSelectedMedia(item)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  setSelectedMedia(item);
                }
              }}>
              <div className={styles.mediaImage}>
                <Image src={`${ASSET_ROOT}/${item.image}`} alt="" fill sizes="(max-width: 768px) 100vw, 40vw" />
                <Button
                  variant="icon"
                  shape="circle"
                  theme="outline"
                  aria-label={`Open ${item.title}`}
                  onClick={(event) => {
                    event.stopPropagation();
                    setSelectedMedia(item);
                  }}>
                  <Play size={18} fill="currentColor" />
                </Button>
              </div>
              <div>
                <span>
                  {item.kicker} · {item.runtime}
                </span>
                <h3>{item.title}</h3>
                <p>Unfiltered race-week analysis from the SailGP desk.</p>
              </div>
            </article>
          ))}
        </div>

        {selectedMedia && typeof document !== "undefined"
          ? createPortal(
              <div
                className={styles.mediaDialogOverlay}
                onMouseDown={(event) => {
                  if (event.currentTarget === event.target) setSelectedMedia(null);
                }}>
                <div
                  className={styles.mediaDialog}
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="listen-watch-title"
                  aria-describedby="listen-watch-description">
              <button
                type="button"
                aria-label="Close"
                onClick={() => setSelectedMedia(null)}
                style={{
                  position: "absolute",
                  top: "20px",
                  right: "20px",
                  zIndex: 1,
                  display: "grid",
                  width: "28px",
                  height: "28px",
                  placeItems: "center",
                  padding: 0,
                  border: 0,
                  background: "transparent",
                  color: "#181b20",
                  cursor: "pointer",
                  opacity: 0.14,
                }}>
                <X size={18} />
              </button>
                  <div className={styles.mediaDialogBody}>
                <p
                  className={styles.mediaDialogKicker}
                  style={{
                    margin: "0 0 10px",
                    color: "#dc2638",
                    fontFamily: '"IBM Plex Mono", monospace',
                    fontSize: "11px",
                    fontWeight: 700,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                  }}>
                  {selectedMedia.kicker}
                </p>
                <h2
                  id="listen-watch-title"
                  className={styles.mediaDialogTitle}
                  style={{
                    maxWidth: "440px",
                    margin: 0,
                    fontFamily: "Montserrat, Arial, sans-serif",
                    fontSize: "24px",
                    fontWeight: 800,
                    lineHeight: 1.08,
                  }}>
                  {selectedMedia.title}
                </h2>
                <p
                  id="listen-watch-description"
                  className={styles.mediaDialogDescription}
                  style={{
                    margin: "17px 0 26px",
                    color: "#d9d9da",
                    fontSize: "14px",
                    lineHeight: 1.55,
                  }}>
                  {selectedMedia.description}
                </p>
                <button
                  type="button"
                  className={styles.mediaDialogAction}
                  onClick={handlePlaySelectedMedia}
                  style={{
                    display: "inline-flex",
                    width: "166px",
                    minHeight: "40px",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "0 22px",
                    border: "1px solid #f4f4f5",
                    borderRadius: "999px",
                    background: "#f4f4f5",
                    color: "white",
                    fontFamily: "Montserrat, Arial, sans-serif",
                    fontSize: "12px",
                    fontWeight: 700,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    cursor: "pointer",
                  }}>
                  {selectedMedia.action}
                </button>
                  </div>
                </div>
              </div>,
              document.body
            )
          : null}
      </section>

      <section className={styles.newsletter}>
        <div>
          <p>The Foil · Race Brief</p>
          <h2>{isSubscribed ? "You’re on the crew." : "The race-week brief — in your inbox before the gun."}</h2>
          {!isSubscribed && (
            <form onSubmit={handleSubscribe}>
              <Input type="email" required aria-label="Email address" placeholder="you@email.com" />
              <Button type="submit" theme="primary">
                Subscribe <ArrowRight size={16} />
              </Button>
            </form>
          )}
          <small>
            {isSubscribed ? "The next race brief lands Friday." : "No press-release filler. Unsubscribe anytime."}
          </small>
        </div>
      </section>

      <section className={styles.contentSection} id="beyond-sailgp">
        <SectionHeader title="Beyond SailGP" meta="Other circuits · This week" />
        <div className={styles.beyondGrid}>
          {beyondStories.map((story) => (
            <button
              type="button"
              className={styles.beyondCard}
              key={story.title}
              onClick={() => onOpenBeyond?.(story.slug)}>
              <span>{story.tag}</span>
              <h3>{story.title}</h3>
              <p>{story.byline}</p>
            </button>
          ))}
        </div>
      </section>

      <footer className={styles.footer} id="foil-footer">
        <div className={styles.footerGrid}>
          <div className={styles.footerBrand}>
            <Link href="/home" className={styles.wordmark} aria-label="The Foil home">
              <span>The</span> Foil
            </Link>
            <p>A new wave in racing media.</p>
          </div>

          <div className={styles.footerLinks}>
            {footerLinkGroups.map((group) => (
              <div className={styles.footerColumn} key={group.title}>
                <h3>{group.title}</h3>
                <nav aria-label={`${group.title} footer links`}>
                  {group.links.map(([label, href]) => (
                    <a href={href} key={label}>
                      {label}
                    </a>
                  ))}
                </nav>
              </div>
            ))}
          </div>

          <div className={`${styles.footerColumn} ${styles.footerTip}`}>
            <h3>Tip the Desk</h3>
            <p>
              Got a lead the league won&apos;t cover? <a href="mailto:tips@thefoil.media">tips@thefoil.media</a>
            </p>
          </div>
        </div>
        <small className={styles.footerCopyright}>
          © 2026 The Foil · Independent sailing media · Auckland · London · Sydney
        </small>
      </footer>
    </ThemeProvider>
  );
}
