import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactNode } from "react";
import { expect, fn, userEvent, within } from "storybook/test";

import { IntelligenceArticleCard } from "./intelligence-article-card";
import { IntelligenceCalendarPanel } from "./intelligence-calendar-panel";
import { IntelligenceLeaderboardPanel } from "./intelligence-leaderboard-panel";
import { IntelligencePanel, IntelligencePanelSkeleton } from "./intelligence-panel";
import { IntelligencePanelShell } from "./intelligence-panel-shell";
import type {
  IntelligenceArticle,
  IntelligenceCalendarEvent,
  IntelligenceLeaderboardView,
  IntelligencePanelLayout,
} from "./intelligence-panel.types";

/** Example presentation metadata as it would arrive with the backend response. */
const REFERENCE_LAYOUT = {
  panel: {
    width: 382,
    height: 520,
  },
  featuredArticle: {
    height: 199,
    clipPath: "polygon(5% 0, 100% 0, 100% 100%, 0 100%, 0 10%)",
    ctaFontSize: 9,
    ctaClipPath: "polygon(0 0, 100% 0, 100% 45%, 82% 100%, 0 100%)",
  },
  articleCard: {
    height: 221,
    imageAspectRatio: "4 / 3",
  },
  upNextGrid: {
    minimumCardWidth: 172,
  },
} satisfies IntelligencePanelLayout;

const IMAGE_FIRST_CARD_LAYOUT = {
  ...REFERENCE_LAYOUT.articleCard,
  height: "auto",
};

const FEATURED_ARTICLE: IntelligenceArticle = {
  id: "carlo-borlenghi",
  title: "Farewell to Carlo Borlenghi, sailing’s defining eye",
  href: "https://thefoil.com/news/farewell-to-carlo-borlenghi-sailing-s-defining-eye/",
  image: {
    src: "https://thefoil.com/media/v14k3IM3BKozlawJrK0RN6Eajrqti5OzpO7lu2vR50g/resize:fill-down:1500:500/gravity:fp:0.5095057034:0.517010377/quality:60/dpr:1/2026/08/carlo-borlenghi-martina-orsini.jpg",
    alt: "Carlo Borlenghi holding a camera",
  },
};

const UP_NEXT_ARTICLE: IntelligenceArticle = {
  id: "rockwool-germany-sail-grand-prix",
  title: "Rockwool Germany Sail Grand Prix | Sassnitz",
  href: "https://thefoil.com/news/sailgp-on-its-split-fleet-future-and-co-existing-with-the-america-s-cup/",
  image: {
    src: "https://thefoil.com/media/TlBFbEsAcPIAVoep8012UCivVzX91fla3rAc42Lwtxs/resize:fill-down:460:240/gravity:fp:0.5448504983:0.2367653189/quality:60/dpr:1/2026/07/go1-0386.jpg",
    alt: "SailGP boats racing near Sassnitz",
  },
};

const REFERENCE_UP_NEXT_ARTICLES: readonly IntelligenceArticle[] = [
  UP_NEXT_ARTICLE,
  { ...UP_NEXT_ARTICLE, id: `${UP_NEXT_ARTICLE.id}-2` },
  { ...UP_NEXT_ARTICLE, id: `${UP_NEXT_ARTICLE.id}-3` },
  { ...UP_NEXT_ARTICLE, id: `${UP_NEXT_ARTICLE.id}-4` },
];

const STRESS_ARTICLES = Array.from(
  { length: 8 },
  (_, index): IntelligenceArticle => ({
    ...UP_NEXT_ARTICLE,
    id: `${UP_NEXT_ARTICLE.id}-${index + 1}`,
  })
);

const SAILGP_LEADERBOARD_VIEWS = [
  {
    id: "season",
    tabLabel: "Season standings",
    eyebrow: "Current ranks",
    title: "Season 6 leaderboard",
    subtitle: "2026 championship · after Portsmouth",
    hero: {
      label: "Season standings",
      title: "2026 SailGP Championship",
      meta: "After Portsmouth · 8 of 13 events complete",
      badge: "S6",
      image: {
        ...UP_NEXT_ARTICLE.image,
        alt: "SailGP fleet racing during the 2026 championship",
      },
    },
    entries: [
      {
        id: "aus",
        position: 1,
        team: "Australia",
        participant: "Tom Slingsby",
        code: "AUS",
        points: 66,
        accentColor: "#00843d",
      },
      {
        id: "esp",
        position: 2,
        team: "Spain",
        participant: "Diego Botin",
        code: "ESP",
        points: 54,
        accentColor: "#d71920",
      },
      {
        id: "swe",
        position: 3,
        team: "Sweden",
        participant: "Nathan Outteridge",
        code: "SWE",
        points: 47,
        accentColor: "#1261a0",
      },
      {
        id: "usa",
        position: 4,
        team: "United States",
        participant: "Taylor Canfield",
        code: "USA",
        points: 46,
        accentColor: "#1b365d",
      },
      {
        id: "gbr",
        position: 5,
        team: "Great Britain",
        participant: "Dylan Fletcher",
        code: "GBR",
        points: 44,
        accentColor: "#c8102e",
      },
      {
        id: "fra",
        position: 6,
        team: "France",
        participant: "Quentin Delapierre",
        code: "FRA",
        points: 36,
        accentColor: "#243c8f",
      },
      {
        id: "can",
        position: 7,
        team: "Canada",
        participant: "Giles Scott",
        code: "CAN",
        points: 31,
        accentColor: "#e31837",
      },
      {
        id: "ger",
        position: 8,
        team: "Germany",
        participant: "Erik Heil",
        code: "GER",
        points: 28,
        accentColor: "#202020",
      },
      {
        id: "sui",
        position: 9,
        team: "Switzerland",
        participant: "Sébastien Schneiter",
        code: "SUI",
        points: 25,
        accentColor: "#d52b1e",
      },
      {
        id: "den",
        position: 10,
        team: "Denmark",
        participant: "Nicolai Sehested",
        code: "DEN",
        points: 24,
        accentColor: "#c60c30",
      },
      {
        id: "ita",
        position: 11,
        team: "Italy",
        participant: "Phil Robertson",
        code: "ITA",
        points: 22,
        accentColor: "#008c45",
      },
      {
        id: "nzl",
        position: 12,
        team: "New Zealand",
        participant: "Peter Burling",
        code: "NZL",
        points: 14,
        accentColor: "#111111",
      },
      {
        id: "bra",
        position: 13,
        team: "Brazil",
        participant: "Paul Goodison",
        code: "BRA",
        points: 8,
        accentColor: "#009c3b",
      },
    ],
  },
  {
    id: "event",
    tabLabel: "Latest event",
    eyebrow: "Portsmouth results",
    title: "Spain take the win",
    subtitle: "Great Britain Sail Grand Prix · final",
    hero: {
      label: "Event results",
      title: "Great Britain Sail Grand Prix",
      meta: "Portsmouth · 25–26 July 2026",
      badge: "R8",
      image: {
        ...UP_NEXT_ARTICLE.image,
        alt: "SailGP boats competing in close racing",
      },
    },
    entries: [
      {
        id: "event-esp",
        position: 1,
        team: "Spain",
        participant: "Diego Botin",
        code: "ESP",
        points: 10,
        accentColor: "#d71920",
      },
      {
        id: "event-swe",
        position: 2,
        team: "Sweden",
        participant: "Nathan Outteridge",
        code: "SWE",
        points: 9,
        accentColor: "#1261a0",
      },
      {
        id: "event-can",
        position: 3,
        team: "Canada",
        participant: "Giles Scott",
        code: "CAN",
        points: 8,
        accentColor: "#e31837",
      },
      {
        id: "event-sui",
        position: 4,
        team: "Switzerland",
        participant: "Sébastien Schneiter",
        code: "SUI",
        points: 7,
        accentColor: "#d52b1e",
      },
      {
        id: "event-nzl",
        position: 5,
        team: "New Zealand",
        participant: "Peter Burling",
        code: "NZL",
        points: 6,
        accentColor: "#111111",
      },
      {
        id: "event-usa",
        position: 6,
        team: "United States",
        participant: "Taylor Canfield",
        code: "USA",
        points: 5,
        accentColor: "#1b365d",
      },
      {
        id: "event-aus",
        position: 7,
        team: "Australia",
        participant: "Tom Slingsby",
        code: "AUS",
        points: 4,
        accentColor: "#00843d",
      },
      {
        id: "event-fra",
        position: 8,
        team: "France",
        participant: "Quentin Delapierre",
        code: "FRA",
        points: 3,
        accentColor: "#243c8f",
      },
      {
        id: "event-den",
        position: 9,
        team: "Denmark",
        participant: "Nicolai Sehested",
        code: "DEN",
        points: 2,
        accentColor: "#c60c30",
      },
      {
        id: "event-ger",
        position: 10,
        team: "Germany",
        participant: "Erik Heil",
        code: "GER",
        points: 1,
        accentColor: "#202020",
      },
      {
        id: "event-gbr",
        position: 11,
        team: "Great Britain",
        participant: "Dylan Fletcher",
        code: "GBR",
        points: 0,
        accentColor: "#c8102e",
      },
      {
        id: "event-ita",
        position: 12,
        team: "Italy",
        participant: "Phil Robertson",
        code: "ITA",
        points: 0,
        accentColor: "#008c45",
      },
      {
        id: "event-bra",
        position: 13,
        team: "Brazil",
        participant: "Martine Grael",
        code: "BRA",
        points: 0,
        accentColor: "#009c3b",
      },
    ],
  },
] satisfies readonly IntelligenceLeaderboardView[];

const SAILGP_EVENTS = [
  {
    id: "perth",
    title: "Oracle Perth Sail Grand Prix",
    location: "Perth, Australia",
    dateLabel: "17 – 18 Jan 2026",
    startDate: "2026-01-17",
    endDate: "2026-01-18",
    href: "https://thefoil.com/series/sailgp/events/oracle-perth-sail-grand-prix-presented-by-kpmg/",
    status: "complete",
  },
  {
    id: "auckland",
    title: "ITM New Zealand Sail Grand Prix | Auckland",
    location: "Auckland, New Zealand",
    dateLabel: "14 – 15 Feb 2026",
    startDate: "2026-02-14",
    endDate: "2026-02-15",
    href: "https://thefoil.com/series/sailgp/events/itm-new-zealand-sail-grand-prix-auckland/",
    status: "complete",
  },
  {
    id: "sydney",
    title: "KPMG Sydney Sail Grand Prix",
    location: "Sydney, Australia",
    dateLabel: "28 Feb – 1 Mar 2026",
    startDate: "2026-02-28",
    endDate: "2026-03-01",
    href: "https://thefoil.com/series/sailgp/events/kpmg-sydney-sail-grand-prix/",
    status: "complete",
  },
  {
    id: "rio",
    title: "Enel Rio Sail Grand Prix",
    location: "Rio de Janeiro, Brazil",
    dateLabel: "11 – 12 Apr 2026",
    startDate: "2026-04-11",
    endDate: "2026-04-12",
    href: "https://thefoil.com/series/sailgp/events/enel-rio-sail-grand-prix/",
    status: "complete",
  },
  {
    id: "bermuda",
    title: "Apex Group Bermuda Sail Grand Prix",
    location: "Great Sound, Bermuda",
    dateLabel: "9 – 10 May 2026",
    startDate: "2026-05-09",
    endDate: "2026-05-10",
    href: "https://thefoil.com/series/sailgp/events/apex-group-bermuda-sail-grand-prix/",
    status: "complete",
  },
  {
    id: "new-york",
    title: "Mubadala New York Sail Grand Prix",
    location: "New York, USA",
    dateLabel: "30 – 31 May 2026",
    startDate: "2026-05-30",
    endDate: "2026-05-31",
    href: "https://thefoil.com/series/sailgp/events/mubadala-new-york-sail-grand-prix/",
    status: "complete",
  },
  {
    id: "halifax",
    title: "Canada Sail Grand Prix | Halifax",
    location: "Halifax, Canada",
    dateLabel: "20 – 21 Jun 2026",
    startDate: "2026-06-20",
    endDate: "2026-06-21",
    href: "https://thefoil.com/series/sailgp/events/canada-sail-grand-prix-halifax/",
    status: "complete",
  },
  {
    id: "portsmouth",
    title: "Emirates Great Britain Sail Grand Prix | Portsmouth",
    location: "Portsmouth, United Kingdom",
    dateLabel: "25 – 26 Jul 2026",
    startDate: "2026-07-25",
    endDate: "2026-07-26",
    href: "https://thefoil.com/series/sailgp/events/emirates-great-britain-sail-grand-prix-portsmouth/",
    status: "complete",
  },
  {
    id: "sassnitz",
    title: "Rockwool Germany Sail Grand Prix | Sassnitz",
    location: "Sassnitz, Rügen Island, Germany",
    dateLabel: "22 – 23 Aug 2026",
    startDate: "2026-08-22",
    endDate: "2026-08-23",
    href: "https://thefoil.com/series/sailgp/events/rockwool-germany-sail-grand-prix-sassnitz/",
    status: "next",
    image: UP_NEXT_ARTICLE.image,
  },
  {
    id: "valencia",
    title: "Spain Sail Grand Prix | Valencia",
    location: "Valencia, Spain",
    dateLabel: "5 – 6 Sep 2026",
    startDate: "2026-09-05",
    endDate: "2026-09-06",
    href: "https://thefoil.com/series/sailgp/events/spain-sail-grand-prix-valencia/",
    status: "upcoming",
  },
  {
    id: "geneva",
    title: "Rolex Switzerland Sail Grand Prix | Geneva",
    location: "Geneva, Switzerland",
    dateLabel: "19 – 20 Sep 2026",
    startDate: "2026-09-19",
    endDate: "2026-09-20",
    href: "https://thefoil.com/series/sailgp/events/rolex-switzerland-sail-grand-prix-geneva/",
    status: "upcoming",
  },
  {
    id: "dubai",
    title: "Emirates Dubai Sail Grand Prix",
    location: "Dubai, United Arab Emirates",
    dateLabel: "21 – 22 Nov 2026",
    startDate: "2026-11-21",
    endDate: "2026-11-22",
    href: "https://thefoil.com/series/sailgp/events/emirates-dubai-sail-grand-prix-presented-by-dp-world/",
    status: "upcoming",
  },
  {
    id: "abu-dhabi",
    title: "Mubadala Abu Dhabi Season Grand Final",
    location: "Abu Dhabi, United Arab Emirates",
    dateLabel: "28 – 29 Nov 2026",
    startDate: "2026-11-28",
    endDate: "2026-11-29",
    href: "https://thefoil.com/series/sailgp/events/mubadala-abu-dhabi-sail-grand-prix-2026-season-grand-final/",
    status: "upcoming",
  },
] satisfies readonly IntelligenceCalendarEvent[];

function StoryFrame({ children, width = 382, height = 520 }: { children: ReactNode; width?: number; height?: number }) {
  return (
    <div style={{ display: "flex", width, height, maxWidth: "calc(100vw - 16px)", justifyContent: "center" }}>
      {children}
    </div>
  );
}

const meta = {
  title: "Organisms/IntelligencePanel",
  component: IntelligencePanel,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  args: {
    featuredArticle: FEATURED_ARTICLE,
    upNextArticles: REFERENCE_UP_NEXT_ARTICLES,
    layout: REFERENCE_LAYOUT,
    onClose: fn(),
  },
  argTypes: {
    featuredArticle: { control: "object", description: "Article rendered in the hero region." },
    upNextArticles: { control: "object", description: "Articles rendered in the responsive grid." },
    layout: { control: "object", description: "Backend-driven panel presentation values." },
    readMoreLabel: { control: "text" },
    upNextLabel: { control: "text" },
    onClose: { action: "close" },
  },
} satisfies Meta<typeof IntelligencePanel>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Exact response-shaped fixture supplied for the initial integration. */
export const ReferenceResponse: Story = {
  args: {
    onClose: fn(),
  },
  render: (args) => (
    <StoryFrame>
      <IntelligencePanel {...args} />
    </StoryFrame>
  ),
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const panel = canvasElement.querySelector('[data-slot="intelligence-panel"]');
    const scrollContent = canvasElement.querySelector<HTMLElement>('[data-slot="intelligence-panel-scroll-content"]');
    const featuredTitleLink = canvas.getByRole("link", { name: FEATURED_ARTICLE.title });
    const readMoreLink = canvas.getByRole("link", { name: "Read more" });
    const featuredImage = canvas.getByAltText(FEATURED_ARTICLE.image.alt);
    const [upNextTitle] = canvas.getAllByText(UP_NEXT_ARTICLE.title);
    const upNextLink = upNextTitle.closest("a");
    const [upNextImage] = canvas.getAllByAltText(UP_NEXT_ARTICLE.image.alt);
    const expandButton = canvas.getByRole("button", { name: "Expand view unavailable" });

    await expect(panel).toHaveAttribute("aria-labelledby");
    await expect(scrollContent!.scrollHeight).toBeGreaterThan(scrollContent!.clientHeight);
    await expect(featuredTitleLink).toHaveAttribute("href", FEATURED_ARTICLE.href);
    await expect(featuredTitleLink).toHaveAttribute("target", "_blank");
    await expect(featuredTitleLink).toHaveAttribute("rel", "noopener noreferrer");
    await expect(readMoreLink).toHaveAttribute("href", FEATURED_ARTICLE.href);
    await expect(featuredImage.closest("a")).toBeNull();
    await expect(upNextLink).toHaveAttribute("href", UP_NEXT_ARTICLE.href);
    await expect(upNextImage.closest("a")).toBe(upNextLink);
    await expect(expandButton).toBeDisabled();
    await expect(expandButton).toHaveAttribute("title", "Expand view is not available yet");

    await userEvent.click(canvas.getByRole("button", { name: "Close Intelligence" }));
    await expect(args.onClose).toHaveBeenCalledTimes(1);
  },
};

/** Repeated response items exercise the two-column grid and full-panel scroll. */
export const ScrollAndGridStress: Story = {
  args: {
    upNextArticles: STRESS_ARTICLES,
  },
  render: (args) => (
    <StoryFrame>
      <IntelligencePanel {...args} />
    </StoryFrame>
  ),
  play: async ({ canvasElement }) => {
    const panel = canvasElement.querySelector<HTMLElement>('[data-slot="intelligence-panel"]');
    const scrollContent = canvasElement.querySelector<HTMLElement>('[data-slot="intelligence-panel-scroll-content"]');
    const grid = canvasElement.querySelector<HTMLElement>('[data-slot="intelligence-up-next-grid"]');

    await expect(panel).not.toBeNull();
    await expect(scrollContent).not.toBeNull();
    await expect(grid).not.toBeNull();
    await expect(scrollContent!.scrollHeight).toBeGreaterThan(scrollContent!.clientHeight);
    await expect(getComputedStyle(scrollContent!).overflowY).toBe("auto");
    await expect(getComputedStyle(panel!).overflow).toBe("hidden");
    await expect(getComputedStyle(grid!).gridTemplateColumns.split(" ")).toHaveLength(2);
  },
};

/** The auto-fit grid collapses when the parent cannot hold two 172 px cards. */
export const NarrowContainer: Story = {
  render: (args) => (
    <StoryFrame width={320}>
      <IntelligencePanel {...args} />
    </StoryFrame>
  ),
  play: async ({ canvasElement }) => {
    const grid = canvasElement.querySelector<HTMLElement>('[data-slot="intelligence-up-next-grid"]');
    await expect(grid).not.toBeNull();
    await expect(getComputedStyle(grid!).gridTemplateColumns.split(" ")).toHaveLength(1);
  },
};

/** A second response shape proves that presentation values are data-driven. */
export const BackendConfiguredLayout: Story = {
  args: {
    layout: {
      panel: {
        width: 360,
        height: 480,
      },
      featuredArticle: {
        height: 176,
        clipPath: "polygon(8% 0, 100% 0, 100% 100%, 0 100%, 0 14%)",
        ctaFontSize: 11,
        ctaClipPath: "polygon(0 0, 100% 0, 88% 100%, 0 100%)",
      },
      articleCard: {
        height: 208,
        imageAspectRatio: "16 / 10",
      },
      upNextGrid: {
        minimumCardWidth: 160,
      },
    },
  },
  render: (args) => (
    <StoryFrame width={360} height={480}>
      <IntelligencePanel {...args} />
    </StoryFrame>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const panel = canvasElement.querySelector<HTMLElement>('[data-slot="intelligence-panel"]');
    const featuredArticle = canvasElement.querySelector<HTMLElement>('[data-slot="intelligence-featured-article"]');
    const firstCard = canvasElement.querySelector<HTMLElement>('[data-slot="intelligence-up-next-article"]');
    const readMore = canvas.getByRole("link", { name: "Read more" });

    await expect(panel).toHaveStyle({ width: "360px", height: "480px" });
    await expect(featuredArticle).toHaveStyle({ height: "176px" });
    await expect(firstCard).toHaveStyle({ height: "208px" });
    await expect(readMore.firstElementChild).toHaveStyle({ fontSize: "11px" });
  },
};

export const EmptyUpNext: Story = {
  args: {
    upNextArticles: [],
  },
  render: (args) => (
    <StoryFrame>
      <IntelligencePanel {...args} />
    </StoryFrame>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByText("Up Next")).not.toBeInTheDocument();
    await expect(canvasElement.querySelector('[data-slot="intelligence-up-next-grid"]')).toBeNull();
  },
};

export const LongTitleAndMissingImage: Story = {
  args: {
    upNextArticles: [
      {
        ...UP_NEXT_ARTICLE,
        id: "long-title-missing-image",
        title:
          "Rockwool Germany Sail Grand Prix | Sassnitz and the changing future of international foiling competition",
        image: {
          src: "",
          alt: "SailGP artwork unavailable",
        },
      },
    ],
  },
  render: (args) => (
    <StoryFrame>
      <IntelligencePanel {...args} />
    </StoryFrame>
  ),
};

/** One card API supports optional labels and either content order. */
export const ReusableArticleCardLayouts: Story = {
  render: () => (
    <StoryFrame>
      <div
        style={{
          display: "grid",
          width: "100%",
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          alignItems: "start",
          gap: 8,
        }}>
        <IntelligenceArticleCard
          article={UP_NEXT_ARTICLE}
          layout={REFERENCE_LAYOUT.articleCard}
          label="Up Next"
          imagePosition="bottom"
        />
        <IntelligenceArticleCard article={UP_NEXT_ARTICLE} layout={IMAGE_FIRST_CARD_LAYOUT} imagePosition="top" />
      </div>
    </StoryFrame>
  ),
  play: async ({ canvasElement }) => {
    const cards = canvasElement.querySelectorAll('[data-slot="intelligence-article-card"]');
    const bottomLinkChildren = cards[0]?.querySelector("a")?.children;
    const topLinkChildren = cards[1]?.querySelector("a")?.children;

    await expect(cards).toHaveLength(2);
    await expect(within(cards[0] as HTMLElement).getByText("Up Next")).toBeInTheDocument();
    await expect(within(cards[1] as HTMLElement).queryByText("Up Next")).not.toBeInTheDocument();
    await expect(bottomLinkChildren?.[0]?.tagName).toBe("H3");
    await expect(topLinkChildren?.[0]?.tagName).toBe("DIV");
  },
};

/** The shared shell composes image-first cards without duplicating panel chrome. */
export const ReusablePanelShell: Story = {
  args: {
    onClose: fn(),
  },
  render: ({ onClose }) => (
    <StoryFrame>
      <IntelligencePanelShell size={REFERENCE_LAYOUT.panel} onClose={onClose}>
        <div className="gencl:mt-2 gencl:flex gencl:flex-col gencl:gap-2">
          {REFERENCE_UP_NEXT_ARTICLES.map((article) => (
            <IntelligenceArticleCard
              key={`feed-${article.id}`}
              article={article}
              layout={IMAGE_FIRST_CARD_LAYOUT}
              imagePosition="top"
            />
          ))}
        </div>
      </IntelligencePanelShell>
    </StoryFrame>
  ),
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const shell = canvasElement.querySelector<HTMLElement>('[data-slot="intelligence-panel-shell"]');
    const scrollContent = canvasElement.querySelector<HTMLElement>('[data-slot="intelligence-panel-scroll-content"]');
    const cards = canvasElement.querySelectorAll('[data-slot="intelligence-article-card"]');
    const firstLinkChildren = cards[0]?.querySelector("a")?.children;

    await expect(shell).not.toBeNull();
    await expect(scrollContent).not.toBeNull();
    await expect(scrollContent!.scrollHeight).toBeGreaterThan(scrollContent!.clientHeight);
    await expect(cards).toHaveLength(4);
    await expect(canvas.queryByText("Up Next")).not.toBeInTheDocument();
    await expect(firstLinkChildren?.[0]?.tagName).toBe("DIV");
    await expect(firstLinkChildren?.[1]?.tagName).toBe("H3");

    await userEvent.click(canvas.getByRole("button", { name: "Close Intelligence" }));
    await expect(args.onClose).toHaveBeenCalledTimes(1);
  },
};

export const Loading: Story = {
  args: {
    onClose: fn(),
  },
  render: ({ onClose }) => (
    <StoryFrame>
      <IntelligencePanelSkeleton layout={REFERENCE_LAYOUT} onClose={onClose} />
    </StoryFrame>
  ),
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const skeleton = canvasElement.querySelector('[data-slot="intelligence-panel-skeleton"]');

    await expect(skeleton).toHaveAttribute("aria-busy", "true");
    await expect(canvasElement.querySelectorAll('[data-slot="skeleton"]')).toHaveLength(20);
    await userEvent.click(canvas.getByRole("button", { name: "Close Intelligence" }));
    await expect(args.onClose).toHaveBeenCalledTimes(1);
  },
};

/** The Foil's SailGP standings adapted to the compact Intelligence surface. */
export const SailGpLeaderboard: Story = {
  args: {
    onClose: fn(),
  },
  render: ({ onClose }) => (
    <StoryFrame>
      <IntelligenceLeaderboardPanel
        size={REFERENCE_LAYOUT.panel}
        views={SAILGP_LEADERBOARD_VIEWS}
        defaultViewId="season"
        sourceLabel="The Foil"
        fullStandingsHref="https://thefoil.com/series/sailgp/results/"
        onClose={onClose}
      />
    </StoryFrame>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const panel = canvasElement.querySelector<HTMLElement>('[data-slot="intelligence-leaderboard-panel"]');
    const scrollContent = canvasElement.querySelector<HTMLElement>('[data-slot="intelligence-panel-scroll-content"]');
    const seasonTab = canvas.getByRole("tab", { name: "Season standings" });
    const eventTab = canvas.getByRole("tab", { name: "Latest event" });
    const fullStandings = canvas.getByRole("link", { name: "Full standings" });

    await expect(panel).not.toBeNull();
    await expect(scrollContent!.scrollHeight).toBeGreaterThan(scrollContent!.clientHeight);
    await expect(seasonTab).toHaveAttribute("aria-selected", "true");
    await expect(canvas.getByRole("heading", { name: "Season 6 leaderboard" })).toBeInTheDocument();
    await expect(canvas.getByRole("heading", { name: "2026 SailGP Championship" })).toBeInTheDocument();
    await expect(canvas.getAllByRole("row")).toHaveLength(14);
    await expect(fullStandings).toHaveAttribute("href", "https://thefoil.com/series/sailgp/results/");
    await expect(fullStandings).toHaveAttribute("target", "_blank");

    await userEvent.click(eventTab);
    await expect(eventTab).toHaveAttribute("aria-selected", "true");
    await expect(canvas.getByRole("heading", { name: "Spain take the win" })).toBeInTheDocument();
    await expect(canvas.getByRole("heading", { name: "Great Britain Sail Grand Prix" })).toBeInTheDocument();
    await expect(canvas.getByText("Great Britain Sail Grand Prix · final")).toBeInTheDocument();
    await expect(canvas.getByText("Portsmouth · 25–26 July 2026")).toBeInTheDocument();

    await userEvent.click(seasonTab);
    await expect(seasonTab).toHaveAttribute("aria-selected", "true");
  },
};

/** The Foil's SailGP calendar adapted to the compact Intelligence surface. */
export const SailGpCalendar: Story = {
  args: {
    onClose: fn(),
  },
  render: ({ onClose }) => (
    <StoryFrame>
      <IntelligenceCalendarPanel
        size={REFERENCE_LAYOUT.panel}
        title="Season 6 Event Calendar"
        year={2026}
        events={SAILGP_EVENTS}
        sourceLabel="The Foil"
        fullCalendarHref="https://thefoil.com/series/sailgp/events/"
        onClose={onClose}
      />
    </StoryFrame>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const panel = canvasElement.querySelector<HTMLElement>('[data-slot="intelligence-calendar-panel"]');

    await expect(panel).not.toBeNull();
    await expect(canvas.getByRole("heading", { name: "Season 6 Event Calendar" })).toBeInTheDocument();
    await expect(canvas.getByText("Full season view")).toBeInTheDocument();
    await expect(canvas.queryByText("Monthly view")).not.toBeInTheDocument();
    await expect(canvas.queryByRole("tablist", { name: "Calendar view" })).not.toBeInTheDocument();
    await expect(canvas.getByText("13 events")).toBeInTheDocument();
    await expect(canvas.getByRole("link", { name: "Full calendar" })).toHaveAttribute(
      "href",
      "https://thefoil.com/series/sailgp/events/"
    );
  },
};
