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
  styleId: "69e4f1b665f44f6bb10cb685",
  placementId: "69e4f1b665f44f6bb10cb684",
  apiKey: "1c8c5caa7f9a6a081f713d17ecf82fd7798a95b87f423e3a",
} as const;

const IHEART_FEED_PLACEMENT = {
  styleId: "69a9752a313806dc008458c9",
  placementId: "69a9752a313806dc008458c8",
  apiKey: "1c8c5caa7f9a6a081f713d17ecf82fd7798a95b87f423e3a",
} as const;

const IHEART_GRID_PLACEMENT = {
  styleId: "6a27effa807006d6e6ad035e",
  placementId: "6a27effa807006d6e6ad035d",
  apiKey: "1c8c5caa7f9a6a081f713d17ecf82fd7798a95b87f423e3a",
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

const FEATURED_ARTICLE_IMAGES = {
  amyWinehouse: "/api/iheart-image/assets.getty/6a63d1bac0765b97e9e958ac",
  bonJovi: "/api/iheart-image/assets.getty/6a63bd647052bdb7eb74107d",
  jacobElordi: "/api/iheart-image/new_assets/6a61365af28868e1316089f7",
  undercoverActor: "/api/iheart-image/new_assets/6a63aa783ad8cc5c1a9528f0",
  chrisBrown: "/api/iheart-image/new_assets/6a63aa9799701b2d883cbb12",
  louisTomlinson: "/api/iheart-image/new_assets/6a639c9d4f686da3ab633c37",
} as const;

const FEATURED_STORIES: ContentCard[] = [
  {
    id: "amy-winehouse-mom-update",
    title: "Amy Winehouse’s Mom Shares Emotional Update 15 Years After Singer’s Death",
    href: "https://www.iheart.com/content/2026-07-24-amy-winehouses-mom-shares-emotional-update-15-years-after-singers-death/",
    image: FEATURED_ARTICLE_IMAGES.amyWinehouse,
  },
  {
    id: "bon-jovi-concert",
    title: "Bon Jovi Cuts Concert Short During Comeback Tour: 'Gonna Have To Cool It'",
    href: "https://www.iheart.com/content/2026-07-24-bon-jovi-cuts-concert-short-during-comeback-tour-gonna-have-to-cool-it/",
    image: FEATURED_ARTICLE_IMAGES.bonJovi,
  },
  {
    id: "jacob-elordi-euphoria",
    title: "Jacob Elordi Shares BTS Details Of Filming Horrifying ‘Euphoria’ Scene",
    href: "https://www.iheart.com/content/2026-07-24-jacob-elordi-shares-bts-details-of-filming-horrifying-euphoria-scene/",
    image: FEATURED_ARTICLE_IMAGES.jacobElordi,
  },
  {
    id: "undercover-actor",
    title: "Popular Actor Unrecognizable As He Goes Under Cover To Promote New Movie",
    href: "https://www.iheart.com/content/2026-07-24-popular-actor-unrecognizable-as-he-goes-under-cover-to-promote-new-movie/",
    image: FEATURED_ARTICLE_IMAGES.undercoverActor,
  },
  {
    id: "chris-brown-affray-charge",
    title: "Chris Brown Pleads Guilty To Affray Charge Over U.K. Nightclub Brawl",
    href: "https://www.iheart.com/content/2026-07-24-chris-brown-pleads-guilty-to-affray-charge-over-uk-nightclub-brawl/",
    image: FEATURED_ARTICLE_IMAGES.chrisBrown,
  },
  {
    id: "louis-tomlinson-memory-lane",
    title: "Louis Tomlinson Takes 'Trip Down Memory Lane' For One Direction Anniversary",
    href: "https://www.iheart.com/content/2026-07-24-louis-tomlinson-takes-trip-down-memory-lane-for-one-direction-anniversary/",
    image: FEATURED_ARTICLE_IMAGES.louisTomlinson,
  },
];

const ARTICLES: ContentCard[] = [
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
  {
    id: "hilary-duff",
    title: "Win Tickets To See Hilary Duff!",
    href: "https://ktu.iheart.com/rules/",
    image: "/api/iheart-image/new_assets/69dffa6136194a793bfcfca6",
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

function getIHeartContentHref(section: "articles" | "promotions", card: ContentCard) {
  const source = encodeURIComponent(card.href);
  const title = encodeURIComponent(card.title);
  return `/iheart/${section}/${card.id}?source=${source}&title=${title}`;
}

function ArticleCard({
  card,
  variant = "rail",
}: {
  card: ContentCard;
  variant?: "rail" | "hero" | "compact";
}) {
  if (variant !== "rail") {
    return (
      <a
        href={getIHeartContentHref("articles", card)}
        className="gencl:group gencl:relative gencl:block gencl:h-full gencl:w-full gencl:overflow-hidden gencl:rounded-lg gencl:bg-secondary-900 gencl:text-white gencl:no-underline">
        <Image
          src={card.image}
          alt=""
          width={880}
          height={540}
          useWebp={false}
          className="gencl:absolute gencl:inset-0 gencl:h-full gencl:w-full gencl:object-cover gencl:transition-transform gencl:duration-300 gencl:group-hover:scale-[1.02]"
        />
        <span
          aria-hidden="true"
          className="gencl:absolute gencl:inset-0 gencl:bg-gradient-to-t gencl:from-black/90 gencl:via-black/10 gencl:to-transparent"
        />
        <span className="gencl:absolute gencl:inset-x-0 gencl:bottom-0 gencl:z-10 gencl:block gencl:p-3">
          <span className="gencl:mb-1 gencl:block gencl:text-[9px] gencl:font-bold gencl:uppercase gencl:tracking-wide gencl:text-white/80">
            iHeart
          </span>
          <span
            className={
              variant === "hero"
                ? "gencl:line-clamp-3 gencl:block gencl:text-body-1-bold gencl:leading-snug"
                : "gencl:line-clamp-2 gencl:block gencl:text-body-3-bold gencl:leading-snug"
            }>
            {card.title}
          </span>
          <span className="gencl:mt-2 gencl:block gencl:text-[9px] gencl:font-medium gencl:uppercase gencl:text-white/75">
            1 min read
          </span>
        </span>
      </a>
    );
  }

  return (
    <a
      href={getIHeartContentHref("articles", card)}
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
    <span
      aria-hidden="true"
      className="gencl:flex gencl:h-8 gencl:min-w-0 gencl:flex-1 gencl:items-center gencl:justify-between">
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

            <section aria-labelledby="iheart-featured-stories">
              <SectionHeader
                id="iheart-featured-stories"
                title="Featured Stories"
                href="https://www.iheart.com/news/"
              />
              <div className="gencl:grid gencl:w-full gencl:max-w-[calc(100vw-24px)] gencl:gap-3 gencl:sm:max-w-[calc(100vw-88px)] gencl:xl:h-[460px] gencl:xl:max-w-[calc(100vw-264px)] gencl:xl:grid-cols-12">
                <div className="gencl:h-[360px] gencl:xl:col-span-5 gencl:xl:h-full">
                  {FEATURED_STORIES.slice(0, 1).map((card) => (
                    <ArticleCard key={card.id} card={card} variant="hero" />
                  ))}
                </div>

                <div className="gencl:grid gencl:grid-cols-1 gencl:gap-3 gencl:sm:grid-cols-2 gencl:xl:col-span-3 gencl:xl:grid-cols-1 gencl:xl:grid-rows-2">
                  {FEATURED_STORIES.slice(1, 3).map((card) => (
                    <div key={card.id} className="gencl:h-[220px] gencl:xl:h-full">
                      <ArticleCard card={card} variant="compact" />
                    </div>
                  ))}
                </div>

                <div
                  className="gencl:h-[600px] gencl:w-full gencl:overflow-hidden gencl:rounded-lg gencl:bg-secondary-50 gencl:xl:col-span-4 gencl:xl:h-full"
                  aria-label="iHeart recommended video feed">
                  <GenuinEmbedCarousel
                    {...IHEART_FEED_PLACEMENT}
                    containerId="iheart-recommended-feed"
                    testId="iheart-recommended-feed-placement"
                  />
                </div>
              </div>
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

            <section aria-labelledby="iheart-trending-grid">
              <SectionHeader id="iheart-trending-grid" title="Trending on iHeart" />
              <div className="gencl:flex gencl:w-full gencl:max-w-[calc(100vw-24px)] gencl:justify-center gencl:sm:max-w-[calc(100vw-88px)] gencl:xl:max-w-[calc(100vw-264px)]">
                <div
                  className="gencl:h-[1200px] gencl:w-full gencl:max-w-[1000px] gencl:overflow-hidden gencl:bg-secondary-50"
                  aria-label="Trending iHeart video grid">
                  <GenuinEmbedCarousel
                    {...IHEART_GRID_PLACEMENT}
                    containerId="iheart-trending-grid-placement-host"
                    testId="iheart-trending-grid-placement"
                  />
                </div>
              </div>
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
