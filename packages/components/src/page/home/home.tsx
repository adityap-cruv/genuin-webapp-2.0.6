"use client";

import { Button } from "@genuin/ui/components/button";
import { Image } from "@genuin/ui/components/image";
import { Container } from "@genuin/ui/components/layout/container";
import { Stack } from "@genuin/ui/components/layout/stack";
import { PlayIcon } from "@genuin/ui/icons";
import type { ReactNode } from "react";

import { GenuinEmbedCarousel } from "@genuin/components/legacy/websitev5/genuin-embed-carousel";

type ContentCard = {
  id: string;
  title: string;
  href: string;
  image: string;
};

type AudioCard = {
  id: string;
  station: string;
  artist: string;
  description: string;
  href: string;
  image: string;
};

const BREAKFAST_CLUB_PLACEMENT = {
  styleId: "6a61d6c664ca16025598bd58",
  placementId: "6a61d6c664ca16025598bd57",
  apiKey: "e0c7340483c56098b00809c1d25df30e6d2a4c50351102a6",
} as const;

const BREAKFAST_CLUB_IMAGE =
  "/api/iheart-image/url/aHR0cHM6Ly93d3cub21ueWNvbnRlbnQuY29tL2QvcHJvZ3JhbXMvZTczYzk5OGUtNmU2MC00MzJmLTg2MTAtYWUyMTAxNDBjNWIxL2E2NjIwNDI4LTY4ZmEtNGI1ZC1hNWFmLWFlMzMwMDVmNjYwZi9pbWFnZS5qcGc_dD0xNzQ5NzYwNDYyJnNpemU9TGFyZ2U";

const PODCAST_IMAGES = {
  agenda:
    "/api/iheart-image/url/aHR0cHM6Ly93d3cub21ueWNvbnRlbnQuY29tL2QvcGxheWxpc3QvNzc4NGY4NDAtYzI5MS00MjJhLTkyNGItYWQ5MDAwYmJhZDcxL2Q4OTcyYTNmLWE0OWEtNDQ4My1hNWE4LWFlNmUwMTdmMTJmNC9lYzBmNTBkNy02Njk0LTQwZjctODIxMi1hZTZlMDE3ZjEzMDIvaW1hZ2UuanBnP3Q9MTc1NjUyOTExNCZzaXplPUxhcmdl",
  fletchVaughanHayley:
    "/api/iheart-image/url/aHR0cHM6Ly93d3cub21ueWNvbnRlbnQuY29tL2QvcHJvZ3JhbXMvNzc4NGY4NDAtYzI5MS00MjJhLTkyNGItYWQ5MDAwYmJhZDcxLzlhMzQ0NTlhLWFkMTEtNDhmOS1hYTI5LWFlYTQwMTg4YjcwYi9pbWFnZS5qcGc_dD0xNzQ5Njg2Nzk5JnNpemU9TGFyZ2U",
  paidToTalk:
    "/api/iheart-image/url/aHR0cHM6Ly93d3cub21ueWNvbnRlbnQuY29tL2QvcHJvZ3JhbXMvNzc4NGY4NDAtYzI5MS00MjJhLTkyNGItYWQ5MDAwYmJhZDcxLzUyYjdjOTQ0LTAwYzAtNDhmYi1iZTQzLWIyZjIwMDFhMjhmYy9pbWFnZS5qcGc_dD0xNzcyNTEzMDM2JnNpemU9TGFyZ2U",
  confronted:
    "/api/iheart-image/url/aHR0cHM6Ly93d3cub21ueWNvbnRlbnQuY29tL2QvcHJvZ3JhbXMvNzc4NGY4NDAtYzI5MS00MjJhLTkyNGItYWQ5MDAwYmJhZDcxLzY3ZmE2ZTJiLWMxZmYtNGQ0Mi04OTA4LWI0MTAwMDNiZjMxNC9pbWFnZS5qcGc_dD0xNzczODYwNDg2JnNpemU9TGFyZ2U",
  brainstorming:
    "/api/iheart-image/url/aHR0cHM6Ly93d3cub21ueWNvbnRlbnQuY29tL2QvcGxheWxpc3QvNzc4NGY4NDAtYzI5MS00MjJhLTkyNGItYWQ5MDAwYmJhZDcxLzBhYjU4ODcyLTE3ZjYtNDAzZS1iMGE4LWI0M2EwMDQxMDk4OC9hNTdjODU5NS04Y2U0LTRmOTQtYjdhNC1iNDNhMDA0MTBkYWIvaW1hZ2UuanBnP3Q9MTc3NzM0ODg1MCZzaXplPUxhcmdl",
  forksSake:
    "/api/iheart-image/url/aHR0cHM6Ly93d3cub21ueWNvbnRlbnQuY29tL2QvcHJvZ3JhbXMvNzc4NGY4NDAtYzI5MS00MjJhLTkyNGItYWQ5MDAwYmJhZDcxL2VjYWE0NmFjLTQ1MjYtNGYxZi1hNjVmLWIzN2QwMDFkMWFkZS9pbWFnZS5qcGc_dD0xNzYxMDExMTYzJnNpemU9TGFyZ2U",
} as const;

const CONTEST_IMAGES = {
  gasGiveaway:
    "/api/iheart-image/contest/eyJrZXkiOiJmaWxlc1wvYXBwX2dyYXBoaWNzXC8yNDQ0Njk2ODJfQ0xBU1NJQ0hJVFNPTERJRVNfMTc4Mjk0Mzc3MC5wbmciLCJidWNrZXQiOiJhcHRpdmFkYS1maWxlcyIsImVkaXRzIjp7InJlc2l6ZSI6eyJ3aWR0aCI6MTYwMCwiaGVpZ2h0IjozMjAwLCJmaXQiOiJpbnNpZGUiLCJ3aXRob3V0RW5sYXJnZW1lbnQiOnRydWV9LCJ0b0Zvcm1hdCI6IndlYnAiLCJ3ZWJwIjp7InF1YWxpdHkiOjEwMCwic21hcnRTdWJzYW1wbGUiOnRydWUsImVmZm9ydCI6NH0sIm9wZXJhdGlvbnMiOlt7Im9wZXJhdGlvbiI6InN0cmlwIn1dfX0=",
  kehlani:
    "/api/iheart-image/contest/eyJrZXkiOiJmaWxlc1wvYXBwX2dyYXBoaWNzXC8yNDQ0Njk2ODJfY29udGVzdF8xOTAzOTU5X3N0YW5kYXJkXzE3ODQ1NTcxNzUuanBnIiwiYnVja2V0IjoiYXB0aXZhZGEtZmlsZXMiLCJlZGl0cyI6eyJyZXNpemUiOnsid2lkdGgiOjE2MDAsImhlaWdodCI6MzIwMCwiZml0IjoiaW5zaWRlIiwid2l0aG91dEVubGFyZ2VtZW50Ijp0cnVlfSwidG9Gb3JtYXQiOiJ3ZWJwIiwid2VicCI6eyJxdWFsaXR5IjoxMDAsInNtYXJ0U3Vic2FtcGxlIjp0cnVlLCJlZmZvcnQiOjR9LCJvcGVyYXRpb25zIjpbeyJvcGVyYXRpb24iOiJzdHJpcCJ9XX19",
  backstreetBoys:
    "/api/iheart-image/contest/eyJrZXkiOiJmaWxlc1wvYXBwX2dyYXBoaWNzXC8yNDQ0Njk2ODJfY29udGVzdF8xOTA1MDMyX3N0YW5kYXJkXzE3ODQ4OTk2NTguanBnIiwiYnVja2V0IjoiYXB0aXZhZGEtZmlsZXMiLCJlZGl0cyI6eyJyZXNpemUiOnsid2lkdGgiOjE2MDAsImhlaWdodCI6MzIwMCwiZml0IjoiaW5zaWRlIiwid2l0aG91dEVubGFyZ2VtZW50Ijp0cnVlfSwidG9Gb3JtYXQiOiJ3ZWJwIiwid2VicCI6eyJxdWFsaXR5IjoxMDAsInNtYXJ0U3Vic2FtcGxlIjp0cnVlLCJlZmZvcnQiOjR9LCJvcGVyYXRpb25zIjpbeyJvcGVyYXRpb24iOiJzdHJpcCJ9XX19",
  maybelline:
    "/api/iheart-image/contest/eyJrZXkiOiJmaWxlc1wvYXBwX2dyYXBoaWNzXC8yNDQ0Njk2ODJfY29udGVzdF8xODUzNDQyX3N0YW5kYXJkXzE3NzAxNTk0MzQucG5nIiwiYnVja2V0IjoiYXB0aXZhZGEtZmlsZXMiLCJlZGl0cyI6eyJyZXNpemUiOnsid2lkdGgiOjE2MDAsImhlaWdodCI6MzIwMCwiZml0IjoiaW5zaWRlIiwid2l0aG91dEVubGFyZ2VtZW50Ijp0cnVlfSwidG9Gb3JtYXQiOiJ3ZWJwIiwid2VicCI6eyJxdWFsaXR5IjoxMDAsInNtYXJ0U3Vic2FtcGxlIjp0cnVlLCJlZmZvcnQiOjR9LCJvcGVyYXRpb25zIjpbeyJvcGVyYXRpb24iOiJzdHJpcCJ9XX19",
} as const;

const PROMOTIONS: ContentCard[] = [
  {
    id: "great-gas-giveaway",
    title: "$1,000 Great Gas Giveaway",
    href: "https://news.iheart.com/promotions/1000-great-gas-giveaway-1898639/",
    image: CONTEST_IMAGES.gasGiveaway,
  },
  {
    id: "burlington-ihrmf",
    title: "Burlington x iHeartRadio Music Festival Flyaway Sweepstakes",
    href: "https://news.iheart.com/promotions/burlington-x-ihrmf-flyaway-sweeps-1902526/",
    image: "/api/iheart-image/new_assets/6a4e99194a7dc9af1e8f2649",
  },
  {
    id: "kehlani-vip-trip",
    title: "Win An Unforgettable VIP Trip For Two To Los Angeles To See Kehlani Live!",
    href: "https://news.iheart.com/promotions/win-an-unforgettable-vip-trip-for-1903959/",
    image: CONTEST_IMAGES.kehlani,
  },
  {
    id: "backstreet-boys-sphere",
    title: "Win A VIP Trip To See Backstreet Boys Live At Sphere Las Vegas!",
    href: "https://news.iheart.com/promotions/win-a-vip-trip-to-see-1905032/",
    image: CONTEST_IMAGES.backstreetBoys,
  },
  {
    id: "maybelline-bundle",
    title: "Enter For Your Chance To Win An Exclusive Maybelline Gift Bundle!",
    href: "https://news.iheart.com/promotions/enter-for-your-chance-to-win-1853442/",
    image: CONTEST_IMAGES.maybelline,
  },
  {
    id: "coupon-hunt",
    title: "Bed Bath and Beyond Legendary Coupon Hunt",
    href: "https://www.iheart.com/promotions/",
    image: "/api/iheart-image/new_assets/69dfe7938a384b396399a676",
  },
  {
    id: "music-festival",
    title: "iHeartRadio Music Festival presented by Capital One Ultimate Fan Sweepstakes",
    href: "https://news.iheart.com/promotions/iheartradio-music-festival-presented-by-1900411/",
    image: "/api/iheart-image/new_assets/6a4e99194a7dc9af1e8f2649",
  },
  {
    id: "bryan-adams",
    title: "ROLL, WITH iHEART & BRYAN ADAMS NATIONAL FLYAWAY SWEEPSTAKES",
    href: "https://wnic.iheart.com/promotions/",
    image: "/api/iheart-image/new_assets/6408faade5c64b6987224c46",
  },
];

const ARTICLES: ContentCard[] = [
  {
    id: "hilary-duff",
    title: "Win Tickets To See Hilary Duff!",
    href: "https://ktu.iheart.com/rules/",
    image: "/api/iheart-image/new_assets/69dffa6136194a793bfcfca6",
  },
  {
    id: "travis-kelce",
    title: "Travis Kelce Makes Rare Comment About Taylor Swift Proposal: 'Pretty Epic'",
    href: "https://www.iheart.com/content/2026-07-08-travis-kelce-makes-rare-comment-about-taylor-swift-proposal-pretty-epic/",
    image: "/api/iheart-image/new_assets/6a4e99194a7dc9af1e8f2649",
  },
  {
    id: "airplane-window-1",
    title: "Judge Allows Lawsuit Over Airplane Window Seats Without Window To Continue",
    href: "https://khvhradio.iheart.com/content/2026-07-08-judge-allows-lawsuit-over-airplane-window-seats-without-window-to-continue/",
    image: "/api/iheart-image/assets.getty/62bbb9e4b4a70c1a7bf6bb6d",
  },
  {
    id: "the-agenda",
    title: 'The Agenda: "No F Bombs Please..."',
    href: "https://www.iheart.com/podcast/1049-the-agenda-30184388/",
    image: PODCAST_IMAGES.agenda,
  },
  {
    id: "fletch-vaughan-hayley",
    title: "Fletch, Vaughan & Hayley's Big Pod",
    href: "https://www.iheart.com/podcast/414-zms-fletch-vaughan-hayley-26666236/",
    image: PODCAST_IMAGES.fletchVaughanHayley,
  },
  {
    id: "paid-to-talk",
    title: "Paid To Talk: Which Fish Is Most Likely To Attract A Woman?",
    href: "https://www.iheart.com/podcast/1049-paid-to-talk-with-leigh-h-279009864/",
    image: PODCAST_IMAGES.paidToTalk,
  },
  {
    id: "confronted",
    title: "Confronted — Episode 1: The Day Everything Changed",
    href: "https://www.iheart.com/podcast/1049-confronted-330419822/",
    image: PODCAST_IMAGES.confronted,
  },
  {
    id: "brainstorming",
    title: "Brainstorming With Clare de Lore",
    href: "https://www.iheart.com/podcast/1049-brainstorming-with-clare-331888180/",
    image: PODCAST_IMAGES.brainstorming,
  },
  {
    id: "forks-sake",
    title: "Fork's Sake: Celebrity Stories, Food And Kiwi Humour",
    href: "https://www.iheart.com/podcast/1049-forks-sake-304356408/",
    image: PODCAST_IMAGES.forksSake,
  },
];

const AUDIO_PLAYERS: AudioCard[] = [
  {
    id: "z100",
    station: "Live Radio",
    artist: "Z100",
    description: "New York's #1 Hit Music Station",
    href: "https://www.iheart.com/live/z100-1469/",
    image: "/api/iheart-image/assets.images/1469.png",
  },
  {
    id: "ktu",
    station: "Live Radio",
    artist: "103.5 KTU",
    description: "The Beat of New York",
    href: "https://www.iheart.com/live/1035-ktu-1473/",
    image: "/api/iheart-image/assets.images/8eb2b83b-8490-47eb-bea1-f0309b1b9978.png",
  },
  {
    id: "kiis-fm",
    station: "Live Radio",
    artist: "102.7 KIIS FM",
    description: "LA's #1 Hit Music Station",
    href: "https://www.iheart.com/live/1027-kiis-fm-los-angeles-185/",
    image: "/api/iheart-image/assets.streams/6903ee2a2e523eccb69723ba",
  },
  {
    id: "kost",
    station: "Live Radio",
    artist: "KOST 103.5",
    description: "LA's Feel Good Station",
    href: "https://www.iheart.com/live/kost-1035-193/",
    image: "/api/iheart-image/assets.streams/6764519ee2935fe8f6d14ca2",
  },
  {
    id: "myfm",
    station: "Live Radio",
    artist: "104.3 MYfm",
    description: "LA's 90s to Now",
    href: "https://www.iheart.com/live/1043-myfm-173/",
    image: "/api/iheart-image/assets.streams/6626a339c12a7c23779cd687",
  },
  {
    id: "breakfast-club-audio",
    station: "Podcast",
    artist: "The Breakfast Club",
    description: "The World's Most Dangerous Morning Show",
    href: "https://www.iheart.com/podcast/51-the-breakfast-club-24992238/",
    image: BREAKFAST_CLUB_IMAGE,
  },
];

function SectionHeader({
  id,
  title,
  action = "Air You Live",
  href = "https://www.iheart.com/",
}: {
  id: string;
  title: string;
  action?: string;
  href?: string;
}) {
  return (
    <div className="gencl:flex gencl:items-center gencl:justify-between gencl:gap-4 gencl:pb-2">
      <div className="gencl:flex gencl:min-w-0 gencl:items-center gencl:gap-2">
        <Image
          src="https://iheartvip.prototype.begenuin.com/assets/Ellipse%20511.webp"
          alt=""
          width={24}
          height={24}
          useWebp={false}
          className="gencl:size-6 gencl:shrink-0 gencl:rounded"
        />
        <h2 id={id} className="gencl:truncate gencl:text-body-1-bold gencl:text-secondary-900">
          {title}
        </h2>
      </div>
      <Button
        asChild
        theme="secondary"
        size="sm"
        shape="pill"
        className="gencl:h-7 gencl:shrink-0 gencl:px-3 gencl:text-body-3-medium">
        <a href={href} target="_blank" rel="noopener noreferrer">
          {action}
        </a>
      </Button>
    </div>
  );
}

function HorizontalRail({ children, label }: { children: ReactNode; label: string }) {
  return (
    <div
      aria-label={label}
      className="gencl:flex gencl:snap-x gencl:snap-mandatory gencl:gap-3 gencl:overflow-x-auto gencl:pb-1 gencl:scrollbar-none">
      {children}
    </div>
  );
}

function PromotionCard({ card }: { card: ContentCard }) {
  return (
    <a
      href={card.href}
      target="_blank"
      rel="noopener noreferrer"
      className="gencl:w-[260px] gencl:shrink-0 gencl:snap-start gencl:overflow-hidden gencl:rounded-md gencl:border gencl:border-secondary-150 gencl:bg-white gencl:text-secondary-900 gencl:no-underline">
      <Image
        src={card.image}
        alt=""
        width={440}
        height={230}
        useWebp={false}
        className="gencl:h-[140px] gencl:w-full gencl:object-cover"
      />
      <p className="gencl:line-clamp-2 gencl:min-h-11 gencl:px-2 gencl:py-2 gencl:text-body-3-bold gencl:leading-snug">
        {card.title}
      </p>
    </a>
  );
}

function ArticleCard({ card }: { card: ContentCard }) {
  return (
    <a
      href={card.href}
      target="_blank"
      rel="noopener noreferrer"
      className="gencl:w-[260px] gencl:shrink-0 gencl:snap-start gencl:overflow-hidden gencl:rounded-md gencl:border gencl:border-secondary-150 gencl:bg-white gencl:text-secondary-900 gencl:no-underline">
      <Image
        src={card.image}
        alt=""
        width={440}
        height={270}
        useWebp={false}
        className="gencl:h-[150px] gencl:w-full gencl:object-cover"
      />
      <p className="gencl:line-clamp-2 gencl:min-h-12 gencl:px-2 gencl:py-2 gencl:text-body-3-bold gencl:leading-snug">
        {card.title}
      </p>
    </a>
  );
}

function Waveform() {
  const bars = [9, 14, 20, 12, 26, 17, 30, 13, 23, 16, 27, 11, 20, 14, 9, 18, 25, 12, 22, 15];

  return (
    <span aria-hidden="true" className="gencl:flex gencl:h-8 gencl:flex-1 gencl:items-center gencl:gap-px">
      {bars.map((height, index) => (
        <span
          key={`${height}-${index}`}
          className="gencl:w-px gencl:rounded-full gencl:bg-secondary-300"
          style={{ height }}
        />
      ))}
    </span>
  );
}

function AudioPlayerCard({ card }: { card: AudioCard }) {
  return (
    <article className="gencl:w-[260px] gencl:shrink-0 gencl:snap-start gencl:border-r gencl:border-secondary-150 gencl:px-3 gencl:py-2 last:gencl:border-r-0">
      <p className="gencl:text-[9px] gencl:font-medium gencl:text-secondary-500">{card.station}</p>
      <p className="gencl:truncate gencl:text-body-3-bold gencl:text-secondary-900">{card.artist}</p>
      <p className="gencl:truncate gencl:text-[10px] gencl:text-secondary-600">{card.description}</p>
      <div className="gencl:mt-2 gencl:flex gencl:items-center gencl:gap-2">
        <Button asChild variant="icon" theme="secondary" shape="circle" size="sm" aria-label={`Play ${card.artist}`}>
          <a href={card.href} target="_blank" rel="noopener noreferrer">
            <PlayIcon className="gencl:size-4" />
          </a>
        </Button>
        <Waveform />
        <Image
          src={card.image}
          alt={card.artist}
          width={36}
          height={36}
          useWebp={false}
          className="gencl:size-10 gencl:shrink-0 gencl:rounded-sm gencl:object-cover"
        />
      </div>
    </article>
  );
}

function RailDots() {
  return (
    <div aria-hidden="true" className="gencl:flex gencl:justify-center gencl:gap-1 gencl:pt-2">
      {[0, 1, 2, 3].map((dot) => (
        <span
          key={dot}
          className={
            dot === 0
              ? "gencl:size-1 gencl:rounded-full gencl:bg-secondary-600"
              : "gencl:size-1 gencl:rounded-full gencl:bg-secondary-250"
          }
        />
      ))}
    </div>
  );
}

export function Home() {
  return (
    <div className="theme-iheart gencl:h-full gencl:overflow-x-hidden gencl:overflow-y-auto gencl:bg-white">
      <Container maxW="full" px="none" asChild>
        <main
          aria-label="iHeart home"
          className="gencl:mx-auto gencl:w-full gencl:max-w-[1500px] gencl:px-3 gencl:py-3 gencl:sm:max-w-[calc(100vw-64px)] gencl:xl:max-w-[calc(100vw-240px)]">
          <Stack gap="md">
            <section aria-labelledby="latest-breakfast-club">
              <SectionHeader id="latest-breakfast-club" title="Latest from Breakfast Club" />
              <div
                className="gencl:h-[310px] gencl:w-full gencl:overflow-x-auto gencl:overflow-y-hidden gencl:rounded-lg gencl:bg-secondary-50 gencl:overscroll-x-contain"
                aria-label="Latest Breakfast Club video carousel">
                <GenuinEmbedCarousel
                  {...BREAKFAST_CLUB_PLACEMENT}
                  containerId="iheart-breakfast-club-carousel"
                  testId="iheart-breakfast-club-carousel-placement"
                  carouselItemWidth={260}
                  enableCarouselScroll
                  nativeHorizontalScroll
                />
              </div>
            </section>

            <section aria-labelledby="iheart-promotions">
              <SectionHeader
                id="iheart-promotions"
                title="iHeart Contests & Promotions"
                href="https://www.iheart.com/promotions/"
              />
              <HorizontalRail label="iHeart contests and promotions">
                {PROMOTIONS.map((card) => (
                  <PromotionCard key={card.id} card={card} />
                ))}
              </HorizontalRail>
            </section>

            <section aria-labelledby="iheart-articles">
              <SectionHeader id="iheart-articles" title="Articles" href="https://www.iheart.com/news/" />
              <HorizontalRail label="Latest iHeart articles">
                {ARTICLES.map((card) => (
                  <ArticleCard key={card.id} card={card} />
                ))}
              </HorizontalRail>
              <RailDots />
            </section>

            <section aria-labelledby="iheart-audio">
              <SectionHeader id="iheart-audio" title="Audio Players" href="https://www.iheart.com/music/" />
              <HorizontalRail label="iHeart audio players">
                {AUDIO_PLAYERS.map((card) => (
                  <AudioPlayerCard key={card.id} card={card} />
                ))}
              </HorizontalRail>
              <RailDots />
            </section>

            <section aria-labelledby="iheart-live-categories" className="gencl:pb-4">
              <SectionHeader
                id="iheart-live-categories"
                title="Top Live Categories in iHeart"
                action="View All"
                href="https://www.iheart.com/live/"
              />
              <div
                className="gencl:h-[320px] gencl:w-full gencl:overflow-hidden gencl:rounded-lg gencl:bg-secondary-50"
                aria-label="Top live iHeart video categories">
                <GenuinEmbedCarousel
                  {...BREAKFAST_CLUB_PLACEMENT}
                  containerId="iheart-live-categories-carousel"
                  testId="iheart-home-carousel-placement"
                />
              </div>
            </section>
          </Stack>
        </main>
      </Container>
    </div>
  );
}
