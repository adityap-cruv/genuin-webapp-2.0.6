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
export interface IntelligenceArticleCardProps extends Omit<ComponentPropsWithoutRef<"article">, "children"> {
  /** Article content and destination. */
  article: IntelligenceArticle;
  /** Presentation values supplied by the consuming response. */
  layout: IntelligenceArticleCardLayout;
  /** Optional contextual label, such as "Up Next". */
  label?: string;
  /** Whether artwork appears before or after the headline. @default "bottom" */
  imagePosition?: IntelligenceArticleCardImagePosition;
}

type IntelligencePanelSectionProps = Omit<ComponentPropsWithoutRef<"section">, "children">;

/** Props for the shared Intelligence frame, header, controls, and scroll area. */
export interface IntelligencePanelShellProps extends IntelligencePanelSectionProps {
  /** Content rendered beneath the shared Intelligence header. */
  children: ReactNode;
  /** Panel dimensions supplied by the consuming response. */
  size: IntelligencePanelSize;
  /** Called when the user activates the close control. */
  onClose: () => void;
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
}

/** Props for the matching loading placeholder. */
export interface IntelligencePanelSkeletonProps extends Omit<IntelligencePanelShellProps, "children" | "size"> {
  /** Presentation values supplied alongside the loading response. */
  layout: IntelligencePanelLayout;
  /** Number of Up Next card placeholders. @default 4 */
  cardCount?: number;
}
