import type { ComponentPropsWithoutRef, ReactNode } from "react";

/** JSON-safe CSS length accepted from an Intelligence API response. */
export type IntelligenceCssLength = number | string;

/** Dimensions owned by the shared Intelligence panel frame. */
export type IntelligencePanelSize = {
  width: IntelligenceCssLength;
  height: IntelligenceCssLength;
};

/** Backend-driven presentation values for the featured article. */
export type IntelligenceFeaturedArticleLayout = {
  height: IntelligenceCssLength;
  clipPath: string;
  ctaFontSize: IntelligenceCssLength;
  ctaClipPath: string;
};

/** Backend-driven presentation values shared by article-card layouts. */
export type IntelligenceArticleCardLayout = {
  height: IntelligenceCssLength;
  imageAspectRatio: string;
};

/** Backend-driven presentation values for the Up Next grid. */
export type IntelligenceUpNextGridLayout = {
  minimumCardWidth: IntelligenceCssLength;
};

/** Complete layout contract expected from an Intelligence response. */
export type IntelligencePanelLayout = {
  panel: IntelligencePanelSize;
  featuredArticle: IntelligenceFeaturedArticleLayout;
  articleCard: IntelligenceArticleCardLayout;
  upNextGrid: IntelligenceUpNextGridLayout;
};

/** Image metadata rendered for an Intelligence article. */
export type IntelligenceArticleImage = {
  /** Source URL passed to the shared image primitive. */
  src: string;
  /** Meaningful alternative text for the article image. */
  alt: string;
};

/** Data boundary shared by featured and Up Next Intelligence articles. */
export type IntelligenceArticle = {
  /** Stable identity used when rendering article collections. */
  id: string;
  /** User-visible article headline. */
  title: string;
  /** Internal or external article destination. */
  href: string;
  /** Article artwork and its accessible description. */
  image: IntelligenceArticleImage;
};

/** Supported image placement within a reusable Intelligence article card. */
export type IntelligenceArticleCardImagePosition = "top" | "bottom";

/** Props for an article card shared by grid and feed layouts. */
export interface IntelligenceArticleCardProps
  extends Omit<ComponentPropsWithoutRef<"article">, "children" | "onSelect"> {
  /** Article content and destination. */
  article: IntelligenceArticle;
  /** Presentation values supplied by the consuming response. */
  layout: IntelligenceArticleCardLayout;
  /** Optional contextual label, such as "Up Next". */
  label?: string;
  /** Whether artwork appears before or after the headline. @default "bottom" */
  imagePosition?: IntelligenceArticleCardImagePosition;
  /**
   * Called when the card is activated. When provided, the card's default link
   * navigation is prevented so the consumer can react (e.g. drive a paired video)
   * instead of navigating away.
   */
  onSelect?: (article: IntelligenceArticle) => void;
}

type IntelligencePanelSectionProps = Omit<ComponentPropsWithoutRef<"section">, "children">;

/** Props for the shared Intelligence frame, header, controls, and scroll area. */
export interface IntelligencePanelShellProps extends IntelligencePanelSectionProps {
  /** Content rendered beneath the shared Intelligence header. */
  children: ReactNode;
  /**
   * Panel dimensions supplied by the consuming response. When omitted the
   * panel fills its parent (100% × 100%), which is the right default for
   * full-screen mobile sheets and flex/grid slots.
   */
  size?: IntelligencePanelSize;
  /** Called when the user activates the close control. */
  onClose: () => void;
  /** Optional content pinned beneath the scroll area (e.g. a chat composer). */
  footer?: ReactNode;
}

/** Props for the data-driven Intelligence panel. */
export interface IntelligencePanelProps extends Omit<IntelligencePanelShellProps, "children" | "size"> {
  /** Primary article rendered in the hero region. */
  featuredArticle: IntelligenceArticle;
  /** Articles rendered in the responsive Up Next grid. */
  upNextArticles: readonly IntelligenceArticle[];
  /** Presentation values supplied alongside the article response. */
  layout: IntelligencePanelLayout;
  /** Featured-article CTA text. @default "Read more" */
  readMoreLabel?: string;
  /** Label rendered above every secondary article. @default "Up Next" */
  upNextLabel?: string;
  /**
   * Called when the user activates an article (featured headline or an Up Next
   * card). When provided, the article's default link navigation is prevented so
   * the consumer can react — e.g. play the matching video on a paired surface.
   */
  onArticleSelect?: (article: IntelligenceArticle) => void;
}

/** Props for the matching loading placeholder. */
export interface IntelligencePanelSkeletonProps extends Omit<IntelligencePanelShellProps, "children" | "size"> {
  /** Presentation values supplied alongside the loading response. */
  layout: IntelligencePanelLayout;
  /** Number of Up Next card placeholders. @default 4 */
  cardCount?: number;
}

/** A single ranked participant shown in an Intelligence leaderboard. */
export type IntelligenceLeaderboardEntry = {
  /** Stable identity used when switching between leaderboard views. */
  id: string;
  /** Rank supplied by the standings source. */
  position: number;
  /** Primary team or participant name. */
  team: string;
  /** Supporting participant name, such as a driver or captain. */
  participant: string;
  /** Short visual identifier, such as AUS or ESP. */
  code: string;
  /** Score displayed in the points column. */
  points: number;
  /** Optional team colour used as a restrained visual accent. */
  accentColor?: string;
};

/** One selectable set of standings, such as season or event results. */
export type IntelligenceLeaderboardView = {
  id: string;
  tabLabel: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  /** Optional visual context identifying the championship or event. */
  hero?: {
    label: string;
    title: string;
    meta: string;
    badge: string;
    image: IntelligenceArticleImage;
  };
  entries: readonly IntelligenceLeaderboardEntry[];
};

/** Data props for the shell-less leaderboard body. */
export interface IntelligenceLeaderboardContentProps {
  /** Standings views presented in the compact tab switcher. */
  views: readonly IntelligenceLeaderboardView[];
  /** Initially selected view. Falls back to the first view. */
  defaultViewId?: string;
  /** Destination for the complete standings on the source site. */
  fullStandingsHref: string;
  /** Visible source name in the panel footer. */
  sourceLabel: string;
}

/** Props for a leaderboard composed inside the shared Intelligence shell. */
export interface IntelligenceLeaderboardPanelProps
  extends Omit<IntelligencePanelShellProps, "children">,
    IntelligenceLeaderboardContentProps {}

/** Lifecycle state used to distinguish past and upcoming calendar events. */
export type IntelligenceCalendarEventStatus = "complete" | "next" | "upcoming";

/** An event displayed in the compact Intelligence calendar. */
export type IntelligenceCalendarEvent = {
  id: string;
  title: string;
  location: string;
  /** Human-readable range, for example "22 – 23 Aug 2026". */
  dateLabel: string;
  /** ISO calendar date used for month grouping. */
  startDate: string;
  /** ISO calendar date used to highlight multi-day events. */
  endDate: string;
  href: string;
  status: IntelligenceCalendarEventStatus;
  image?: IntelligenceArticleImage;
};

/** Data props for the shell-less calendar body. */
export interface IntelligenceCalendarContentProps {
  title: string;
  year: number;
  events: readonly IntelligenceCalendarEvent[];
  fullCalendarHref: string;
  sourceLabel: string;
}

/** Props for The Foil-inspired event calendar inside Intelligence. */
export interface IntelligenceCalendarPanelProps
  extends Omit<IntelligencePanelShellProps, "children" | "title">,
    IntelligenceCalendarContentProps {}
