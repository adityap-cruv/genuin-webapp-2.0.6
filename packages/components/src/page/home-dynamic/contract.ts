/**
 * Contract for the fully backend-driven home page. BOTH halves come from the BFF:
 *  - LAYOUT manifest ({@link HomeLayoutManifest}) — structure (rows → widgets), which
 *    component renders each slot, the grid template / height / gaps, and per-widget wrapper
 *    styling (header, border, spacer) so the render matches `/home` exactly.
 *  - DATA pages ({@link HomeDataPage}) — the content per `dataKey`, paginated for infinite
 *    scroll. The layout is reused for every data page.
 */

// ─── Layout manifest (from the BFF) ──────────────────────────────────────────────────

export type ComponentType =
  | "video_carousel"
  | "video_feed"
  | "video_grid"
  | "intelligence_panel"
  | "intelligence_card_list"
  | "event_carousel"
  | "hover_link_card_list";

export type DependsOn = { widgetId: string; event: string; param: string };

/** Per-widget frame styling, mirroring the hand-tuned wrappers in `home.tsx`. */
export type WidgetWrapper = {
  /** Show the section header above the content. @default true */
  showHeader?: boolean;
  /** Blank spacer (px) above the content — aligns a panel with a taller sibling. */
  topSpacerPx?: number;
  /** `ring-1 ring-secondary-200` border around the content. */
  border?: boolean;
  /** `rounded-xl` on the content wrapper. */
  rounded?: boolean;
  /** `overflow-hidden` on the content wrapper. */
  overflowHidden?: boolean;
};

export type WidgetNode = {
  type: "widget";
  id: string;
  component: ComponentType;
  dataKey: string;
  config?: Record<string, unknown>;
  dependsOn?: DependsOn;
  wrapper?: WidgetWrapper;
};

export type ColumnNode = {
  type: "column";
  id: string;
  children: LayoutNode[];
};

export type LayoutNode = WidgetNode | ColumnNode;

export type LayoutRow = {
  id: string;
  /** Explicit CSS grid columns matching /home (e.g. `"minmax(0, 2.5fr) minmax(0, 1fr)"`). */
  gridTemplateColumns: string;
  /** Row content height in px (the renderer adds the row's own padding around this). */
  height: number;
  /** Outer padding around the row content (px). Default 24 for older manifests. */
  padding?: number;
  /** Gap between cells (px). Default 16. */
  gap?: number;
  /** Column-gap override (px). */
  columnGap?: number;
  children: LayoutNode[];
};

export type HomeLayoutManifest = {
  metadata: { page: string; schemaVersion: number };
  rows: LayoutRow[];
};

// ─── Data page (from the BFF) ────────────────────────────────────────────────────────

export type FeedType = "HOME";

export type HeaderData = { heading?: string; subHeading?: string; logo?: string };
export type FeedSource = { feedType: FeedType; communityId: string; groupId?: string };
export type ImageData = { src: string; alt?: string };
export type ArticleData = { id: string; title: string; href: string; image: ImageData };
export type EventData = {
  id: string;
  heading: string;
  image: { src: string };
  startDate: string;
  endDate: string;
  location: string;
  cta: { label: string; href: string };
};
export type LinkItemData = {
  id: string;
  link: string;
  title: string;
  description?: string;
  brand?: string;
  website?: string;
  image?: string;
};

export type WidgetData = {
  id: string;
  header?: HeaderData;
  source?: FeedSource;
  ctaText?: string;
  sponsored?: boolean;
  featuredArticle?: ArticleData;
  upNextArticles?: ArticleData[];
  readMoreLabel?: string;
  upNextLabel?: string;
  articles?: ArticleData[];
  events?: EventData[];
  items?: LinkItemData[];
};

export type HomeDataPage = {
  metadata: { page: string; schemaVersion: number; pageSession: string; pageIndex: number };
  pagination: { cursor: string | null; nextCursor: string | null; endOfFeed: boolean };
  data: Record<string, WidgetData>;
};
