"use client";

import { Button } from "@genuin/ui/components/button";
import { Image } from "@genuin/ui/components/image";
import { Container } from "@genuin/ui/components/layout/container";
import { Grid } from "@genuin/ui/components/layout/grid";
import { Stack } from "@genuin/ui/components/layout/stack";
import { useState } from "react";

import { GenuinEmbedCarousel } from "@genuin/components/legacy/websitev5/genuin-embed-carousel";
import { LinkoutCarouselDots, LinkoutNavButtons } from "@genuin/components/molecules/linkout-new/linkout-item";

type Article = {
  id: string;
  title: string;
  href: string;
  image: string;
  author: string;
  readTime: string;
};

type BrandPoll = {
  id: string;
  name: string;
  logo: string;
  question: string;
  options: string[];
};

const EXCLUSIVE_ARTICLES: Article[] = [
  {
    id: "iran-us-ships",
    title: "Iran Threatens To Sink US Ships, Says Ground Invasion Would Be 'Great'",
    href: "https://www.iheart.com/content/2026-04-16-iran-threatens-to-sink-us-ships-says-ground-invasion-would-be-great/",
    image: "/api/iheart-image/new_assets/69dcf86014350cfef78df981",
    author: "Jason Hall",
    readTime: "Daily Read",
  },
  {
    id: "powerball-winner",
    title: "Powerball Winner: Did Anyone Win Wednesday's $59 Million Jackpot?",
    href: "https://www.iheart.com/content/2026-04-15-powerball-winner-did-anyone-win-wednesdays-59-million-jackpot/",
    image: "/api/iheart-image/new_assets/633ec82c3d5e47632a736bd6",
    author: "Jason Hall",
    readTime: "Daily Read",
  },
  {
    id: "billy-crystal",
    title: "Billy Crystal Emotionally Recalls Final Conversation With Rob Reiner",
    href: "https://www.iheart.com/content/2026-04-15-billy-crystal-emotionally-recalls-final-conversation-with-rob-reiner/",
    image: "/api/iheart-image/new_assets/69e001c4e47e0cf0e16dc06d",
    author: "Sarah Tate",
    readTime: "Daily Read",
  },
  {
    id: "anne-hathaway",
    title: "Anne Hathaway Reveals How Beyoncé Influenced Her New Role As A Pop Star",
    href: "https://www.iheart.com/content/2026-04-15-anne-hathaway-reveals-how-beyonc-influenced-her-new-role-as-a-pop-star/",
    image: "/api/iheart-image/new_assets/69e003d6a6d4247cdc595dca",
    author: "Sarah Tate",
    readTime: "Daily Read",
  },
  {
    id: "nba-probe",
    title: "NBA Probing LaMelo Ball, Bam Adebayo Play-In Game Incident",
    href: "https://www.iheart.com/content/2026-04-15-nba-probing-lamelo-ball-bam-adebayo-play-in-game-incident/",
    image: "/api/iheart-image/new_assets/69e00258893f39c76bf23c12",
    author: "Jason Hall",
    readTime: "Daily Read",
  },
  {
    id: "practical-magic",
    title: "Sandra Bullock & Nicole Kidman Share New Details About 'Practical Magic 2'",
    href: "https://www.iheart.com/content/2026-04-15-sandra-bullock-nicole-kidman-share-new-details-about-practical-magic-2/",
    image: "/api/iheart-image/new_assets/69dfe7938a384b396399a676",
    author: "Sarah Tate",
    readTime: "Daily Read",
  },
];

const FEATURE_ARTICLES: Article[] = [
  {
    id: "joseline-hernandez",
    title: "Joseline Hernandez announced she is pregnant with her first child with producer Balistic Beats",
    href: "https://www.iheart.com/content/2026-04-15-joseline-hernandez-husband-balistic-beats-expecting-first-child-together/",
    image: "/api/iheart-image/new_assets/69dffa6136194a793bfcfca6",
    author: "Tony M. Centeno",
    readTime: "1 Min Read",
  },
  {
    id: "trash-company",
    title: "The situation escalated when scavengers rifled through the trash, spreading debris further",
    href: "https://www.iheart.com/content/2026-04-15-trash-company-empties-full-dumpster-on-lawn-of-customer-who-didnt-pay-bill/",
    image: "/api/iheart-image/assets.getty/69dffdb0fc05992b625c5f17",
    author: "iHeartRadio",
    readTime: "1 Min Read",
  },
  {
    id: "jack-harlow",
    title: "Jack Harlow had the most hilarious reaction to a 'SNL' sketch about him and his new album",
    href: "https://www.iheart.com/content/2026-04-15-jack-harlow-reacts-to-wild-snl-sketch-about-his-monica-album/",
    image: "/api/iheart-image/new_assets/69dfc4f2964a7ba3d99c3d8d",
    author: "Tony M. Centeno",
    readTime: "1 Min Read",
  },
];

const BRAND_POLLS: BrandPoll[] = [
  {
    id: "starbucks",
    name: "Starbucks",
    logo: "https://iheartvip.prototype.begenuin.com/assets/Thumbnail.webp",
    question: "What brand would you prefer for your morning coffee?",
    options: ["Starbucks", "Dunkin", "Grumpy"],
  },
  {
    id: "walmart",
    name: "Walmart",
    logo: "https://iheartvip.prototype.begenuin.com/assets/walmart.png",
    question: "What brand would you prefer for Shopping?",
    options: ["Walmart", "Target", "Grumpy"],
  },
  {
    id: "mcdonalds",
    name: "Mcdonald's",
    logo: "https://iheartvip.prototype.begenuin.com/assets/mcd.webp",
    question: "What brand would you prefer for your Brunch?",
    options: ["Starbucks", "Mcdonald's", "Subway"],
  },
  {
    id: "grubhub",
    name: "Grubhub",
    logo: "https://iheartvip.prototype.begenuin.com/assets/grubhub.png",
    question: "What brand would you prefer for your Lunch?",
    options: ["Mcdonald's", "Grubhub", "Grumpy"],
  },
];

const BOTTOM_FEATURES: Article[] = [
  {
    id: "arch-manning",
    title: "Arch Manning Addresses Injury Recovery",
    href: "https://www.iheart.com/content/2026-04-15-arch-manning-addresses-injury-recovery/",
    image: "/api/iheart-image/new_assets/69415741f33a36ad0513f421",
    author: "Jason Hall",
    readTime: "1 Min Read",
  },
  {
    id: "missing-teen",
    title: "Missing Teen Found Hiding In Sex Offender's Closet",
    href: "https://www.iheart.com/content/2026-04-15-missing-teen-found-hiding-in-sex-offenders-closet/",
    image: "/api/iheart-image/new_assets/69dff15e547ca1d0457d7d5c",
    author: "iHeartRadio",
    readTime: "2 Min Read",
  },
  {
    id: "jay-electronica",
    title: "Jay Electronica Advocates For Diddy's Freedom During Concert: 'Free Puff'",
    href: "https://www.iheart.com/content/2026-04-15-jay-electronica-advocates-for-diddys-freedom-during-concert-free-puff/",
    image: "/api/iheart-image/new_assets/69dfc9c4964a7ba3d99c3da4",
    author: "Tony M. Centeno",
    readTime: "2 Min Read",
  },
];

const LATEST_ARTICLES: Article[] = [
  {
    id: "hailey-bieber",
    title: "Hailey Bieber Shares Whether She Wants More Kids With Justin Bieber",
    href: "https://www.iheart.com/content/2026-04-15-hailey-bieber-shares-whether-she-wants-more-kids-with-justin-bieber/",
    image: "/api/iheart-image/new_assets/69dfae8f8323487dc6d6755d",
    author: "Sarah Tate",
    readTime: "1 Min Read",
  },
  {
    id: "adam-levine",
    title: "Adam Levine Makes Decision About Returning To 'The Voice' Next Season",
    href: "https://www.iheart.com/content/2026-04-15-adam-levine-makes-decision-about-returning-to-the-voice-next-season/",
    image: "/api/iheart-image/new_assets/69dfae80b5c62dd2997f623f",
    author: "Sarah Tate",
    readTime: "1 Min Read",
  },
  {
    id: "gas-station",
    title: "Gas Station Attendant Praised For Stopping Alleged Kidnapping",
    href: "https://www.iheart.com/content/2026-04-15-gas-station-attendant-praised-for-stopping-alleged-kidnapping/",
    image: "/api/iheart-image/assets.getty/69dfd84704fa9de88413e75c",
    author: "iHeartRadio",
    readTime: "1 Min Read",
  },
];

const FEATURED_COMMUNITIES = [
  {
    id: "ted-talent-hub-1",
    name: "TED Talent Hub",
    stats: "8.4M Members · 10 Groups",
    description:
      "Discover the heart and soul of NYC through our vibrant community. Join the conversations shaping culture.",
    href: "https://www.iheart.com/news/",
  },
  {
    id: "ted-talent-hub-2",
    name: "TED Talent Hub",
    stats: "8.4M Members · 10 Groups",
    description:
      "Discover the heart and soul of NYC through our vibrant community. Join the conversations shaping culture.",
    href: "https://www.iheart.com/news/",
  },
] as const;

const FIRST_PLACEMENT = {
  embedId: "68e7793caa81dc0fb90d6e6a",
  apiKey: "1c8c5caa7f9a6a081f713d17ecf82fd7798a95b87f423e3a",
} as const;

const FEED_PLACEMENT = {
  styleId: "69b7d2236bafa318fdf84319",
  placementId: "69b7d2236bafa318fdf84318",
  apiKey: "1c8c5caa7f9a6a081f713d17ecf82fd7798a95b87f423e3a",
  configuration: {
    sections: [{ title: "{{brand_context}}" }],
  },
} as const;

const GRID_PLACEMENT = {
  styleId: "6a27effa807006d6e6ad035e",
  placementId: "6a27effa807006d6e6ad035d",
  apiKey: "1c8c5caa7f9a6a081f713d17ecf82fd7798a95b87f423e3a",
} as const;

function CarouselControls({
  total,
  activeIndex,
  onChange,
}: {
  total: number;
  activeIndex: number;
  onChange: (index: number) => void;
}) {
  return (
    <LinkoutNavButtons
      onPrev={() => onChange((activeIndex - 1 + total) % total)}
      onNext={() => onChange((activeIndex + 1) % total)}
      isPrevDisabled={false}
      isNextDisabled={false}
      theme="light"
      middleSlot={
        <LinkoutCarouselDots total={total} activeIdx={activeIndex} onSelect={onChange} theme="light" widthMode="full" />
      }
    />
  );
}

function ExclusiveArticleList() {
  const pageSize = 2;
  const totalPages = Math.ceil(EXCLUSIVE_ARTICLES.length / pageSize);
  const [activePage, setActivePage] = useState(0);
  const visibleArticles = EXCLUSIVE_ARTICLES.slice(activePage * pageSize, activePage * pageSize + pageSize);

  return (
    <Stack gap="md" className="gencl:h-full gencl:justify-between">
      <Stack gap="sm">
        <span className="gencl:w-fit gencl:bg-primary gencl:px-2 gencl:py-1 gencl:text-body-3-bold gencl:text-white">
          EXCLUSIVE
        </span>
        <div aria-live="polite">
          {visibleArticles.map((article) => (
            <a
              key={article.id}
              href={article.href}
              target="_blank"
              rel="noopener noreferrer"
              className="gencl:flex gencl:gap-4 gencl:border-b gencl:border-secondary-150 gencl:py-4 gencl:text-secondary-900 gencl:no-underline last:gencl:border-b-0">
              <Image
                src={article.image}
                alt=""
                width={96}
                height={72}
                useWebp={false}
                className="gencl:h-[72px] gencl:w-24 gencl:shrink-0 gencl:rounded-md gencl:object-cover"
              />
              <span className="gencl:flex gencl:min-w-0 gencl:flex-1 gencl:flex-col gencl:gap-2">
                <span className="gencl:text-body-1-bold gencl:leading-snug">{article.title}</span>
                <span className="gencl:text-body-3-medium gencl:uppercase gencl:text-secondary-500">
                  {article.readTime}
                </span>
              </span>
            </a>
          ))}
        </div>
      </Stack>
      <div className="gencl:flex gencl:justify-center">
        <CarouselControls total={totalPages} activeIndex={activePage} onChange={setActivePage} />
      </div>
    </Stack>
  );
}

function EditorialStoryCard({ article, featured = false }: { article: Article; featured?: boolean }) {
  return (
    <article
      className={
        featured
          ? "gencl:relative gencl:min-h-[320px] gencl:overflow-hidden gencl:rounded-lg gencl:lg:row-span-2"
          : "gencl:relative gencl:min-h-[220px] gencl:overflow-hidden gencl:rounded-lg"
      }>
      <a
        href={article.href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={article.title}
        className="gencl:absolute gencl:inset-0">
        <Image
          src={article.image}
          alt=""
          width={featured ? 900 : 480}
          height={featured ? 620 : 320}
          useWebp={false}
          className="gencl:size-full gencl:object-cover"
        />
        <span className="gencl:absolute gencl:inset-0 gencl:bg-gradient-to-t gencl:from-black/80 gencl:via-black/20 gencl:to-transparent" />
        <span
          className={
            featured
              ? "gencl:absolute gencl:inset-x-0 gencl:bottom-0 gencl:p-5"
              : "gencl:absolute gencl:inset-x-0 gencl:bottom-0 gencl:p-3"
          }>
          <span className="gencl:block gencl:text-body-3-bold gencl:uppercase gencl:tracking-wide gencl:text-white/80">
            {article.author}
          </span>
          <span
            className={
              featured
                ? "gencl:mt-1 gencl:block gencl:font-serif gencl:text-headline-3-bold gencl:leading-tight gencl:text-white"
                : "gencl:mt-1 gencl:block gencl:font-serif gencl:text-body-1-bold gencl:leading-tight gencl:text-white"
            }>
            {article.title}
          </span>
          <span className="gencl:mt-2 gencl:block gencl:text-body-3-medium gencl:uppercase gencl:text-white/70">
            {article.readTime}
          </span>
        </span>
      </a>
    </article>
  );
}

function BrandPollCard({ poll }: { poll: BrandPoll }) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  return (
    <article className="gencl:flex gencl:h-full gencl:flex-col gencl:rounded-lg gencl:border gencl:border-secondary-150 gencl:bg-white gencl:p-4">
      <div className="gencl:flex gencl:items-center gencl:gap-3">
        <Image
          src={poll.logo}
          alt={`${poll.name} logo`}
          width={40}
          height={40}
          useWebp={false}
          className="gencl:size-10 gencl:rounded-md gencl:object-contain"
        />
        <div>
          <h3 className="gencl:text-body-1-bold gencl:text-secondary-900">{poll.name}</h3>
          <p className="gencl:text-body-3-medium gencl:text-secondary-500">Sponsored</p>
        </div>
      </div>
      <p className="gencl:my-4 gencl:text-body-1-bold gencl:text-secondary-900">{poll.question}</p>
      <Stack gap="xs" className="gencl:mt-auto">
        {poll.options.map((option) => {
          const isSelected = option === selectedOption;
          return (
            <Button
              key={option}
              type="button"
              theme={isSelected ? "primary" : "outline"}
              size="sm"
              aria-pressed={isSelected}
              onClick={() => setSelectedOption(option)}
              className="gencl:w-full gencl:justify-start gencl:font-normal">
              {option}
            </Button>
          );
        })}
      </Stack>
    </article>
  );
}

function BottomEditorialSection() {
  const [activeArticle, setActiveArticle] = useState(0);
  const article = BOTTOM_FEATURES[activeArticle];

  if (!article) return null;

  return (
    <Grid gap="lg" className="gencl:lg:grid-cols-3">
      <Stack gap="md">
        <EditorialStoryCard article={article} featured />
        <div className="gencl:flex gencl:justify-center">
          <CarouselControls total={BOTTOM_FEATURES.length} activeIndex={activeArticle} onChange={setActiveArticle} />
        </div>
      </Stack>

      <Stack gap="none">
        <p className="gencl:pb-3 gencl:text-body-3-bold gencl:uppercase gencl:tracking-wide gencl:text-secondary-900">
          Katie Notopoulos
        </p>
        {LATEST_ARTICLES.map((latestArticle) => (
          <a
            key={latestArticle.id}
            href={latestArticle.href}
            target="_blank"
            rel="noopener noreferrer"
            className="gencl:flex gencl:gap-3 gencl:border-b gencl:border-secondary-150 gencl:py-4 gencl:text-secondary-900 gencl:no-underline first:gencl:pt-0 last:gencl:border-b-0">
            <span className="gencl:flex gencl:min-w-0 gencl:flex-1 gencl:flex-col gencl:gap-2">
              <span className="gencl:font-serif gencl:text-body-0-bold gencl:leading-snug">{latestArticle.title}</span>
              <span className="gencl:text-body-3-medium gencl:uppercase gencl:text-secondary-500">
                {latestArticle.readTime}
              </span>
            </span>
            <Image
              src={latestArticle.image}
              alt=""
              width={80}
              height={80}
              useWebp={false}
              className="gencl:size-20 gencl:shrink-0 gencl:rounded-md gencl:object-cover"
            />
          </a>
        ))}
      </Stack>

      <Stack gap="sm">
        <h2 className="gencl:text-headline-4-bold gencl:text-secondary-900">Featured</h2>
        {FEATURED_COMMUNITIES.map((community) => (
          <article key={community.id} className="gencl:rounded-lg gencl:bg-secondary-50 gencl:p-4">
            <div className="gencl:flex gencl:items-start gencl:gap-3">
              <div
                aria-hidden="true"
                className="gencl:flex gencl:size-11 gencl:shrink-0 gencl:items-center gencl:justify-center gencl:rounded-full gencl:bg-primary gencl:text-body-0-bold gencl:text-white">
                T
              </div>
              <div className="gencl:min-w-0 gencl:flex-1">
                <h3 className="gencl:text-body-1-bold gencl:text-secondary-900">{community.name}</h3>
                <p className="gencl:text-body-3-medium gencl:text-secondary-500">{community.stats}</p>
              </div>
              <Button asChild size="sm" theme="primary">
                <a href={community.href} target="_blank" rel="noopener noreferrer">
                  Join
                </a>
              </Button>
            </div>
            <p className="gencl:mt-3 gencl:line-clamp-2 gencl:text-body-2-medium gencl:text-secondary-600">
              {community.description}
            </p>
          </article>
        ))}
      </Stack>
    </Grid>
  );
}

export function Home() {
  return (
    <div className="theme-iheart gencl:h-full gencl:overflow-x-hidden gencl:overflow-y-auto gencl:bg-white">
      <Container maxW="full" px="none" asChild>
        <main aria-label="iHeart home">
          <section
            aria-labelledby="home-featured-heading"
            className="gencl:border-b gencl:border-secondary-150 gencl:p-4">
            <h1 id="home-featured-heading" className="gencl:sr-only">
              Featured iHeart stories and videos
            </h1>
            <Grid gap="lg" className="gencl:lg:grid-cols-[minmax(0,3fr)_minmax(320px,2fr)]">
              <div
                className="gencl:relative gencl:h-[260px] gencl:min-w-0 gencl:overflow-hidden gencl:rounded-lg gencl:bg-secondary-900"
                aria-label="Featured video carousel">
                <GenuinEmbedCarousel
                  {...FIRST_PLACEMENT}
                  containerId="iheart-home-carousel"
                  testId="iheart-home-carousel-placement"
                  navigationLayout="side-overlay"
                />
              </div>
              <ExclusiveArticleList />
            </Grid>
          </section>

          <section aria-labelledby="home-daily-heading" className="gencl:border-b gencl:border-secondary-150 gencl:p-4">
            <h2 id="home-daily-heading" className="gencl:sr-only">
              Today&apos;s featured stories and video feed
            </h2>
            <Grid gap="lg" className="gencl:lg:grid-cols-[minmax(0,13fr)_minmax(420px,7fr)]">
              <div className="gencl:grid gencl:gap-2 gencl:lg:h-[460px] gencl:lg:grid-cols-[2fr_1fr] gencl:lg:grid-rows-2">
                {FEATURE_ARTICLES.map((article, index) => (
                  <EditorialStoryCard key={article.id} article={article} featured={index === 0} />
                ))}
              </div>
              <div
                className="gencl:relative gencl:h-[460px] gencl:min-w-0 gencl:overflow-hidden gencl:rounded-lg gencl:border gencl:border-secondary-150 gencl:bg-secondary-50"
                aria-label="iHeart video feed">
                <GenuinEmbedCarousel
                  {...FEED_PLACEMENT}
                  containerId="iheart-home-feed"
                  testId="iheart-home-feed-placement"
                />
              </div>
            </Grid>
          </section>

          <section
            aria-labelledby="home-sponsored-heading"
            className="gencl:border-b gencl:border-secondary-150 gencl:p-4">
            <h2 id="home-sponsored-heading" className="gencl:sr-only">
              Sponsored brand polls
            </h2>
            <Grid gap="md" className="gencl:md:grid-cols-2 gencl:xl:grid-cols-4">
              {BRAND_POLLS.map((poll) => (
                <BrandPollCard key={poll.id} poll={poll} />
              ))}
            </Grid>
          </section>

          <section aria-labelledby="home-grid-heading" className="gencl:border-b gencl:border-secondary-150 gencl:p-4">
            <h2 id="home-grid-heading" className="gencl:sr-only">
              Food and culture video grid
            </h2>
            <div
              className="gencl:relative gencl:mx-auto gencl:w-full gencl:max-w-[960px] gencl:overflow-hidden"
              style={{ aspectRatio: "27 / 32" }}
              aria-label="Six-reel video grid">
              <GenuinEmbedCarousel
                {...GRID_PLACEMENT}
                containerId="iheart-home-grid"
                testId="iheart-home-grid-placement"
              />
            </div>
          </section>

          <section aria-labelledby="home-more-heading" className="gencl:p-4">
            <h2 id="home-more-heading" className="gencl:sr-only">
              More from iHeart
            </h2>
            <BottomEditorialSection />
          </section>
        </main>
      </Container>
    </div>
  );
}
