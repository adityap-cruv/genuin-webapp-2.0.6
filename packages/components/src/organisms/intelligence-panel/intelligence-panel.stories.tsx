import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactNode } from "react";
import { expect, fn, userEvent, within } from "storybook/test";

import { IntelligenceArticleCard } from "./intelligence-article-card";
import { IntelligencePanel, IntelligencePanelSkeleton } from "./intelligence-panel";
import { IntelligencePanelShell } from "./intelligence-panel-shell";
import type { IntelligenceArticle, IntelligencePanelLayout } from "./intelligence-panel.types";

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
