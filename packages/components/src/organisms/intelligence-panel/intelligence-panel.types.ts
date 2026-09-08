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
  /** Optional card width. Defaults to the width of its container. */
  width?: IntelligenceCssLength;
  height: IntelligenceCssLength;
  clipPath: string;
  /** Optional headline size. Defaults to 16 px. */
  headingFontSize?: IntelligenceCssLength;
  /** Optional headline color. Defaults to white. */
  headingTextColor?: string;
  ctaFontSize: IntelligenceCssLength;
  ctaClipPath: string;
  /** Optional CTA surface color. Defaults to the current gold surface. */
  ctaBackgroundColor?: string;
  /** Optional CTA text color. Defaults to black. */
  ctaTextColor?: string;
};

/** Backend-driven presentation values shared by article-card layouts. */
export type IntelligenceArticleCardLayout = {
  /** Optional card width. The surrounding layout controls it when omitted. */
  width?: IntelligenceCssLength;
  /** Minimum card height. The card grows when its content needs more room. */
  height: IntelligenceCssLength;
  imageAspectRatio: string;
  /** Optional card surface color. Defaults to the current dark surface. */
  backgroundColor?: string;
  /** Optional label and headline color. Defaults to white. */
  textColor?: string;
  /** Optional image-first headline size. Defaults to 16 px. */
  imageFirstTitleFontSize?: IntelligenceCssLength;
  /** Optional space between the card label and its content. Defaults to none. */
  labelGap?: IntelligenceCssLength;
};

/** Backend-driven presentation values for the Up Next grid. */
export type IntelligenceUpNextGridLayout = {
  minimumCardWidth: IntelligenceCssLength;
  /** Optional card width below `sm`; desktop continues to use `minimumCardWidth`. */
  mobileCardWidth?: IntelligenceCssLength;
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

/**
 * Runtime article-selection action. Returning `false` leaves the anchor's
 * default navigation intact; every other return value marks the selection as
 * handled by the consumer.
 */
export type IntelligenceArticleSelectHandler = (article: IntelligenceArticle) => boolean | void;

/** Props for the reusable image-backed featured article card. */
export interface IntelligenceFeaturedArticleProps
  extends Omit<ComponentPropsWithoutRef<"article">, "children" | "onSelect"> {
  article: IntelligenceArticle;
  layout: IntelligenceFeaturedArticleLayout;
  /** CTA text. @default "Read more" */
  readMoreLabel?: string;
  onSelect?: IntelligenceArticleSelectHandler;
}

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
   * Called when the card is activated. Return `false` to retain normal link
   * navigation when the consumer cannot handle this article.
   */
  onSelect?: IntelligenceArticleSelectHandler;
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
  /**
   * Renders a close control at the end of the header row, opposite the
   * "Intelligence" heading. Off by default so hosts that own their own dismiss
   * affordance (the desktop rail's sparkle toggle, the article composer's
   * minimise button) are unchanged. @default false
   */
  showClose?: boolean;
  /** Optional classes applied to the shell's internally scrolling content region. */
  scrollContentClassName?: string;
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
   * card). Return `false` when the consumer cannot handle the article and the
   * anchor should retain its normal navigation.
   */
  onArticleSelect?: IntelligenceArticleSelectHandler;
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
