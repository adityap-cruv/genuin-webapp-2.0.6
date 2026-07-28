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
import { OctopusIcon } from "@genuin/ui/icons";
import { ArrowRight, Play, Radio } from "lucide-react";
import Image from "next/image";
import { type FormEvent, useState } from "react";

import { GenuinEmbedCarousel } from "@genuin/components/legacy/websitev5/genuin-embed-carousel";
import { OctoPanel } from "@genuin/components/molecules/octo-panel";

import styles from "./home.module.css";

const ASSET_ROOT =
  "https://octocanvas-artifacts.s3.ap-south-1.amazonaws.com/sessions/b6695b6a8a0b444699c9337f0723d88e/generated";
const OCTO_VIDEO_ID = "462cc7b6-5166-45e4-86ef-21550eb7601e";
const OCTO_VIDEO_SLUG = "22ff12e2e3801400";

const placements = {
  carousel: {
    containerId: "foil-hero-video-carousel",
    styleId: "6a2660f445aec54862ee2f59",
    placementId: "6a2660f445aec54862ee2f58",
    apiKey: "8a5582af807e98dbad239b749a1cd7fb026831eec1a95d00",
    sdkSrc: "https://media.begenuin.com/sdk/2.0.5/gen_sdk.min.js",
    isolated: true,
    title: "The Foil fan video carousel",
    width: "100%",
    maxWidth: "100%",
    height: "440px",
  },
  feed: {
    containerId: "foil-hero-video-feed",
    styleId: "6a032db60ae65ee82495dd73",
    placementId: "6a032db60ae65ee82495dd72",
    apiKey: "8a5582af807e98dbad239b749a1cd7fb026831eec1a95d00",
    sdkSrc: "https://media.begenuin.com/sdk/2.0.5/gen_sdk.min.js",
    isolated: true,
    title: "The Foil live fan video feed",
    configuration: {
      sections: [{ title: "{{brand_context}}" }],
    },
    width: "100%",
    maxWidth: "100%",
    height: "640px",
  },
  grid: {
    containerId: "foil-fleet-fan-zone-grid",
    styleId: "69f85cd54e1859a88008a834",
    placementId: "69f85cd54e1859a88008a833",
    apiKey: "8a5582af807e98dbad239b749a1cd7fb026831eec1a95d00",
    sdkSrc: "https://media.begenuin.com/sdk/2.0.5/gen_sdk.min.js",
    isolated: true,
    title: "The Foil fleet fan zone grid",
    width: "800px",
    maxWidth: "100%",
    height: "760px",
  },
} as const;

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
] as const;

const standings = [
  ["01", "AUS", "Australia SailGP Team", "Slingsby", "74", "SYD · 1", "● STEADY"],
  ["02", "NZL", "New Zealand SailGP Team", "Outteridge", "62", "SYD · 2", "▲ CLIMBING"],
  ["03", "FRA", "France SailGP Team", "Delapierre", "58", "SYD · 3", "▲ LURKING"],
  ["04", "GBR", "Emirates GBR SailGP Team", "Mills", "54", "SYD · 5", "▼ STALLING"],
  ["05", "ESP", "Spain SailGP Team", "Barceló", "47", "SYD · 4", "● STEADY"],
  ["06", "DEN", "ROCKWOOL Denmark SailGP Team", "Høgh-Christensen", "42", "SYD · 7", "▼ FADING"],
  ["07", "USA", "United States SailGP Team", "Buchan", "39", "SYD · 6", "▲ CLIMBING"],
  ["08", "SUI", "Switzerland SailGP Team", "Bjorn", "33", "SYD · 8", "● STEADY"],
  ["09", "CAN", "Canada SailGP Team", "Saunders", "28", "SYD · 9", "▼ FREEFALL"],
  ["10", "GER", "Germany SailGP Team", "Ehman", "24", "SYD · 10", "● LURKING"],
] as const;

const deskStories = [
  {
    image: "foil-desk-card-1_v0.png",
    tag: "★ Editor's Pick · Tactical Breakdown",
    title: "Slingsby's start-line gamble was brilliant. It was also wrong.",
    byline: "By T. Harding · 6 min read",
  },
  {
    image: "foil-desk-card-2_v0.png",
    tag: "Interview",
    title: 'Outteridge on home water: "We have been waiting three years for this weekend."',
    byline: "By R. Kawhena · 9 min read",
  },
  {
    image: "foil-desk-card-3_v0.png",
    tag: "Data Dive",
    title: "Why wing trim is where the Aussies are losing half a knot.",
    byline: "By M. Cole · 8 min read",
  },
  {
    image: "foil-desk-card-4_v0.png",
    tag: "Tactical Breakdown",
    title: "Inside the grinder's race: seven minutes of flat-out sprint.",
    byline: "By L. Dubois · 7 min read",
  },
] as const;

const calendar = [
  { venue: "Sydney", dates: "14–16 FEB · AUS", status: "Done", image: "calendar-done-thumb_v0.png" },
  { venue: "Auckland", dates: "20–22 MAR · NZL", status: "Next up", image: "countdown-hero-bg_v0.png" },
  { venue: "Saint-Tropez", dates: "17–19 APR · FRA", status: "Upcoming", image: "calendar-upcoming-thumb_v0.png" },
  { venue: "Plymouth", dates: "15–17 MAY · GBR", status: "Upcoming", image: "calendar-upcoming-thumb_v0.png" },
  { venue: "Halifax", dates: "12–14 JUN · CAN", status: "Upcoming", image: "calendar-upcoming-thumb_v0.png" },
] as const;

const athletes = [
  ["1", "Slingsby", "Tom Slingsby", "AUS · Australia", "Top speed · 53.8 kn"],
  ["2", "Outteridge", "Nathan Outteridge", "NZL · New Zealand", "Start-line wins · 7 of 11"],
  ["3", "Delapierre", "Quentin Delapierre", "FRA · France", "Average finish · 3.4"],
  ["4", "Mills", "Dylan Mills", "GBR · Great Britain", "Mark first · 12 of 33"],
  ["11", "Grael", "Martine Grael", "BRA · Brazil", "First-gate conversion · 68%"],
  ["5", "Barceló", "Diego Barceló", "ESP · Spain", "Top speed · 50.1 kn"],
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

function FoilOctoChat() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <OctoPanel
      videoId={OCTO_VIDEO_ID}
      videoSlug={OCTO_VIDEO_SLUG}
      integrationType="placement"
      integrationId={placements.feed.placementId}
      renderMode="compact"
      containLegacyDialog
      open={isOpen}
      onOpenChange={setIsOpen}
      panelClassName={styles.octoPanel}
      className={styles.octoLauncher}
      aria-label={isOpen ? "Close Octo chat" : "Open Octo chat"}
      aria-expanded={isOpen}>
      <OctopusIcon variant="light" className={styles.octoLauncherIcon} aria-hidden="true" />
    </OctoPanel>
  );
}

export function Home() {
  const [isSubscribed, setIsSubscribed] = useState(false);

  function handleSubscribe(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubscribed(true);
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
        <Placement {...placements.carousel} label="iHeart fan video carousel" />
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
        {/* <p className={styles.scrollHint}>
          <ArrowDown size={14} /> Swipe or scroll inside to browse
        </p> */}
      </section>

      <div className={styles.ticker} aria-label="Race speed ticker">
        Slingsby · 53.8 kn · Sydney SGP &nbsp; /// &nbsp; Outteridge · 52.4 kn · Halifax SGP &nbsp; /// &nbsp;
        Delapierre · 51.9 kn · Saint-Tropez
      </div>

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
                <Button theme="secondaryDark" size="sm">
                  Join
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
        <div className={styles.podium}>
          {[
            ["02 · Silver", "NZL", "Outteridge", "New Zealand SailGP Team", "62"],
            ["01 · Leader", "AUS", "Slingsby", "Australia SailGP Team", "74"],
            ["03 · Bronze", "FRA", "Delapierre", "France SailGP Team", "58"],
          ].map(([rank, flag, driver, team, points], index) => (
            <article className={index === 1 ? styles.podiumWinner : styles.podiumCard} key={driver}>
              <span>{rank}</span>
              <small>{flag}</small>
              <h3>{driver}</h3>
              <p>{team}</p>
              <strong>{points} pts</strong>
            </article>
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
              {standings.map(([rank, flag, team, driver, points, last, trend]) => (
                <TableRow key={team}>
                  <TableCell>{rank}</TableCell>
                  <TableCell>
                    <span className={styles.flag}>{flag}</span> {team}
                  </TableCell>
                  <TableCell>{driver}</TableCell>
                  <TableCell>{points}</TableCell>
                  <TableCell>{last}</TableCell>
                  <TableCell
                    className={trend.includes("▲") ? styles.trendUp : trend.includes("▼") ? styles.trendDown : ""}>
                    {trend}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>

      <section className={styles.contentSection}>
        <SectionHeader title="From the SailGP Desk" meta="Latest · 4 stories" />
        <div className={styles.storyGrid}>
          {deskStories.map((story) => (
            <article className={styles.storyCard} key={story.title}>
              <div className={styles.storyImage}>
                <Image src={`${ASSET_ROOT}/${story.image}`} alt="" fill sizes="(max-width: 768px) 80vw, 22vw" />
              </div>
              <span>{story.tag}</span>
              <h3>{story.title}</h3>
              <p>{story.byline}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.sdkSection} id="foil-video-feed">
        <SectionHeader title="Live from the Fleet" meta="Fan feed · Live" />
        <div className={styles.feedLayout}>
          <aside className={styles.feedInsight}>
            <span>Race control</span>
            <h3>Auckland form guide</h3>
            <p>The championship picture heading into the next start.</p>
            <dl>
              <div>
                <dt>Leader</dt>
                <dd>Slingsby · 74 pts</dd>
              </div>
              <div>
                <dt>Chasing</dt>
                <dd>Outteridge · 62 pts</dd>
              </div>
              <div>
                <dt>Forecast</dt>
                <dd>18–22 kn SW</dd>
              </div>
            </dl>
          </aside>
          <div className={styles.feedFrame}>
            <Placement {...placements.feed} label="Live fan video feed" />
          </div>
          <aside className={`${styles.feedInsight} ${styles.feedInsightDark}`}>
            <span>On the water</span>
            <h3>What the fleet is talking about</h3>
            <p>Live reactions, onboard moments and race-week analysis from across the SailGP community.</p>
            <div className={styles.feedPulse}>
              <Radio size={16} />
              Community feed is live
            </div>
          </aside>
        </div>
      </section>

      <section className={styles.contentSection}>
        <SectionHeader title="Season Calendar" meta="2025 · 13 Grand Prix" />
        <div className={styles.calendarRail}>
          {calendar.map((event) => (
            <article
              className={event.status === "Next up" ? styles.calendarNext : styles.calendarCard}
              key={event.venue}>
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
            </article>
          ))}
        </div>
      </section>

      <section className={styles.contentSection}>
        <SectionHeader title="The Fleet" meta="Featured drivers · Season stats" />
        <div className={styles.athleteGrid}>
          {athletes.map(([rank, surname, name, nation, stat], index) => (
            <article className={styles.athleteCard} key={name}>
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
            </article>
          ))}
        </div>
      </section>

      <section className={styles.contentSection}>
        <SectionHeader title="Listen & Watch" meta="New this week" />
        <div className={styles.mediaGrid}>
          {[
            [
              "podcast-artwork_v0.png",
              "EP 47 · Podcast",
              "The Auckland Preview: Can the Kiwis Finally Hold Home Water?",
              "48 min",
            ],
            [
              "video-breakdown-thumbnail_v0.png",
              "Tactical Breakdown",
              "Slingsby's Start-Line Gamble, Frame by Frame",
              "12 min",
            ],
          ].map(([image, kicker, title, runtime]) => (
            <article className={styles.mediaCard} key={title}>
              <div className={styles.mediaImage}>
                <Image src={`${ASSET_ROOT}/${image}`} alt="" fill sizes="(max-width: 768px) 100vw, 40vw" />
                <Button variant="icon" shape="circle" theme="outline" aria-label={`Open ${title}`}>
                  <Play size={18} fill="currentColor" />
                </Button>
              </div>
              <div>
                <span>
                  {kicker} · {runtime}
                </span>
                <h3>{title}</h3>
                <p>Unfiltered race-week analysis from the SailGP desk.</p>
              </div>
            </article>
          ))}
        </div>
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

      <section className={styles.contentSection}>
        <SectionHeader title="Beyond SailGP" meta="Other circuits · This week" />
        <div className={styles.beyondGrid}>
          {[
            [
              "America's Cup",
              "Team New Zealand unveils the first AC75 of the next cycle — and it is smaller than anyone expected.",
            ],
            ["Olympic 49er", "Italy stamped their authority all over the Bay of Hyères this week. Here is how."],
            ["Ocean Race", "Offshore at inshore intensity — that is the new reality of ocean racing."],
          ].map(([tag, title]) => (
            <article key={title}>
              <span>{tag}</span>
              <h3>{title}</h3>
              <p>6 min read</p>
            </article>
          ))}
        </div>
      </section>

      <footer className={styles.footer}>
        <div className={styles.wordmark}>
          <span>The</span> Foil
        </div>
        <p>A new wave in racing media.</p>
        <nav aria-label="Foil footer">
          <a href="#foil-hero-title">SailGP</a>
          <a href="#fleet-fan-zone-heading">Fan zone</a>
          <a href="#foil-video-feed">The fleet</a>
          <a href="mailto:tips@thefoil.media">Tip the desk</a>
        </nav>
        <small>© 2026 The Foil · Independent sailing media · Auckland · London · Sydney</small>
      </footer>
      <FoilOctoChat />
    </ThemeProvider>
  );
}
