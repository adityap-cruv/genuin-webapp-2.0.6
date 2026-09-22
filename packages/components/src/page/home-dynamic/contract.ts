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
  | "iheart_audio_carousel"
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
  /**
   * The widget's own natural size — for an SDK placement, the `dimensions` configured on it
   * (e.g. a 2x2 16:9 grid authored at 1000 x 568). Only the RATIO is used. Stacked on mobile the
   * cell is sized by this instead of the row height, so an embed that draws at its own aspect
   * ratio never leaves dead space below itself.
   */
  intrinsicSize?: { width: number; height: number };
  /** Optional mobile placement size used below the phone breakpoint. */
  mobileIntrinsicSize?: { width: number; height: number };
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
  /** Optional stacked-cell height below the desktop breakpoint. Defaults to `height`. */
  mobileHeight?: number;
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

export type HeaderData = {
  heading?: string;
  subHeading?: string;
  logo?: string;
  /**
   * Brand nickname behind a sponsor header, e.g. `musto` → `/brand/musto`. Sponsor widgets have
   * no `source` (they are neither a community nor a group), so this is what makes their header
   * clickable. Omit it and the header stays inert, as before.
   */
  brandSlug?: string;
  /** Community slug to link the section header directly to `/community/<slug>`. */
  communitySlug?: string;
  /** Group slug to link the section header directly to `/group/<slug>`. */
  groupSlug?: string;
};
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
  /** Actual SDK video id this article belongs to. */
  video_id: string;
  link: string;
  title: string;
  description?: string;
  brand?: string;
  website?: string;
  image?: string;
};

export type IHeartAudioStationData = {
  id: string;
  brand?: string;
  heading: string;
  subheading?: string;
  image: ImageData;
  /** A finite, locally hosted recording. Live station streams are not supported here. */
  audioSrc: string;
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
  iheartStations?: IHeartAudioStationData[];
  items?: LinkItemData[];
};

export type HomeDataPage = {
  metadata: { page: string; schemaVersion: number; pageSession: string; pageIndex: number };
  pagination: { cursor: string | null; nextCursor: string | null; endOfFeed: boolean };
  data: Record<string, WidgetData>;
  /**
   * Optional per-page layout. When present, this page renders with its OWN layout instead of the
   * shared manifest from `/api/home/layout` — so the backend can vary the structure per infinite-
   * scroll iteration. Falls back to the shared manifest when omitted.
   */
  layout?: HomeLayoutManifest;
};
