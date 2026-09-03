import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactNode } from "react";
import { expect, fn, userEvent, within } from "storybook/test";

import { IntelligenceArticleCard } from "./intelligence-article-card";
import { IntelligenceCalendarPanel } from "./intelligence-calendar-panel";
import { IntelligenceLeaderboardPanel } from "./intelligence-leaderboard-panel";
import { IntelligencePanel, IntelligencePanelSkeleton } from "./intelligence-panel";
import { IntelligencePanelShell } from "./intelligence-panel-shell";
import {
  FEATURED_ARTICLE,
  IMAGE_FIRST_CARD_LAYOUT,
  REFERENCE_LAYOUT,
  REFERENCE_UP_NEXT_ARTICLES,
  SAILGP_EVENTS,
  SAILGP_LEADERBOARD_VIEWS,
  STRESS_ARTICLES,
  UP_NEXT_ARTICLE,
} from "./intelligence-panel.fixtures";

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
    const firstCard = canvasElement.querySelector<HTMLElement>('[data-slot="intelligence-up-next-article"]');
    const firstImage = firstCard?.querySelector<HTMLElement>('[data-slot="intelligence-article-image"]');

    await expect(grid).not.toBeNull();
    await expect(firstCard).not.toBeNull();
    await expect(firstImage).not.toBeNull();
    await expect(getComputedStyle(grid!).gridTemplateColumns.split(" ")).toHaveLength(1);
    await expect(firstCard!.getBoundingClientRect().height).toBeGreaterThan(
      Number(REFERENCE_LAYOUT.articleCard.height)
    );
    await expect(firstCard!.scrollHeight).toBe(firstCard!.clientHeight);
    await expect(firstImage!.getBoundingClientRect().bottom).toBeLessThan(firstCard!.getBoundingClientRect().bottom);
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
        width: 320,
        height: 176,
        clipPath: "polygon(8% 0, 100% 0, 100% 100%, 0 100%, 0 14%)",
        headingFontSize: 18,
        headingTextColor: "#fef3c7",
        ctaFontSize: 11,
        ctaClipPath: "polygon(0 0, 100% 0, 88% 100%, 0 100%)",
        ctaBackgroundColor: "#0c4a6e",
        ctaTextColor: "#f0f9ff",
      },
      articleCard: {
        width: 160,
        height: 208,
        imageAspectRatio: "16 / 10",
        backgroundColor: "#e0f2fe",
        textColor: "#0c4a6e",
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
    const featuredHeading = canvas.getByRole("heading", { name: FEATURED_ARTICLE.title });
    const firstCard = canvasElement.querySelector<HTMLElement>('[data-slot="intelligence-up-next-article"]');
    const firstCardLink = firstCard?.querySelector<HTMLElement>("a:not([aria-hidden='true'])");
    const readMore = canvas.getByRole("link", { name: "Read more" });

    await expect(panel).toHaveStyle({ width: "360px", height: "480px" });
    await expect(featuredArticle).toHaveStyle({ width: "320px", height: "176px" });
    await expect(featuredHeading).toHaveStyle({ fontSize: "18px", color: "#fef3c7" });
    await expect(readMore).toHaveStyle({ backgroundColor: "#0c4a6e", color: "#f0f9ff" });
    await expect(firstCard).toHaveStyle({ width: "160px", minHeight: "208px", backgroundColor: "#e0f2fe" });
    await expect(firstCardLink).toHaveStyle({ color: "#0c4a6e" });
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
