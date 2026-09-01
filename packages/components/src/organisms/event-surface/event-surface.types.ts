/**
 * Public types for the EventSurface container.
 *
 * Kept framework-agnostic apart from the React prop shapes at the bottom, so
 * the event vocabulary can be imported by non-component code (analytics
 * adapters, SDK bridges) without pulling in the component.
 */

import type { DsSpace } from "@genuin/ui/layout";
import type { ComponentProps, ReactNode } from "react";

/**
 * Identity of a video as the surface broadcasts it.
 *
 * The three ids mirror what `ContextualVideoMetaData` already carries
 * (`video_id` / `community_id` / `group_id`), renamed to camelCase at the bus
 * boundary so the event vocabulary is independent of any single API schema.
 */
export interface VideoContext {
  /** The running video's id. */
  videoId: string;
  /** Community the video belongs to. */
  communityId: string;
  /** Group the video belongs to. */
  groupId: string;
  /** Position of the video within the emitting panel's list. */
  index: number;
}

/**
 * The event vocabulary every EventSurface understands out of the box.
 *
 * Extend it per-surface with the `TMap` generic rather than editing this
 * interface — see {@link EventSurfaceProps}.
 *
 * Declared as a `type` rather than an `interface` on purpose: an interface has
 * no implicit index signature, so it would not satisfy the
 * `Record<string, unknown>` constraint the bus and queue are generic over.
 */
export type EventSurfaceEventMap = {
  /**
   * A video mounted and is ready / has begun playing. Fires once per video, and
   * again if the same video remounts. Late-mounting panels read the latched
   * value of this event to answer "what is playing right now?".
   */
  "video:load": VideoContext;
  /**
   * The running video changed — user scroll, auto-advance, or a programmatic
   * jump driven by another panel.
   */
  "video:change": VideoContext & {
    /** The video being left, or `null` on the first change of the session. */
    previousVideoId: string | null;
  };
  /**
   * A contextual item panel registers the real video ids present in its response. A sibling SDK
   * placement can use this list to scope its feed, keeping both sides on the same exact boundary.
   */
  "items:register": {
    videoIds: string[];
  };
  /**
   * The user picked an item in a list panel (an article card, a tile, a row).
   * The consuming panel decides what to do with it — typically switch its video.
   */
  "item:select": {
    /**
     * Stable id for the selected item. Callers without a real id should pass a
     * naturally unique field (a URL) rather than an array index.
     */
    itemId: string;
    /** Position of the item within the emitting panel's list. */
    index: number;
    /** Video this item maps to, when the item carries such a link. */
    videoId?: string | null;
  };
};

/**
 * A consumer's event map: the built-ins plus whatever they add.
 *
 * @typeParam TExtra - Additional `{ eventName: payload }` entries.
 */
export type SurfaceEventMap<TExtra extends Record<string, unknown> = Record<never, never>> = EventSurfaceEventMap &
  TExtra;

/** Valid event names for a given map. */
export type SurfaceEventName<TMap extends Record<string, unknown>> = Extract<keyof TMap, string>;

/**
 * A CSS grid track definition.
 *
 * A number is expanded to `repeat(n, minmax(0, 1fr))` — the `minmax(0, …)` is
 * what stops an overflowing child (a long article title, a wide video) from
 * blowing the track out past the container. A string is passed through verbatim,
 * so `"2fr 1fr"` or `"repeat(auto-fill, minmax(180px, 1fr))"` all work.
 */
export type GridTracks = number | string;

/** Props for the outer {@link EventSurfaceProps} container. */
export interface EventSurfaceProps extends Omit<ComponentProps<"div">, "children" | "onSelect"> {
  /** Panels and any other markup. Panels may be nested at any depth. */
  children: ReactNode;
  /**
   * Container width — any CSS length. Numbers are treated as pixels.
   * @defaultValue "100%"
   */
  width?: string | number;
  /**
   * Container height — any CSS length. Numbers are treated as pixels.
   * @defaultValue "100%"
   */
  height?: string | number;
  /**
   * Column tracks. `2` gives two equal columns; `"2fr 1fr"` gives the classic
   * video-plus-sidebar split.
   * @defaultValue 1
   */
  columns?: GridTracks;
  /** Row tracks. Omit to let rows size to content. */
  rows?: GridTracks;
  /** Symmetric gap, as a DS spacing token or raw pixel number. */
  gap?: DsSpace | number;
  /** Column gap; overrides `gap` on the inline axis. */
  columnGap?: DsSpace | number;
  /** Row gap; overrides `gap` on the block axis. */
  rowGap?: DsSpace | number;
  /** CSS `grid-auto-flow`, for implicit tracks. */
  autoFlow?: "row" | "column" | "dense" | "row dense" | "column dense";
  /**
   * Named-area template, e.g. `'"video sidebar" "video log"'`. Pair with each
   * panel's `area` prop.
   */
  areas?: string;
  /**
   * Records retained in the capture queue before the oldest is evicted. The
   * per-type "latest value" latch is unaffected by this.
   * @defaultValue 50
   */
  queueCapacity?: number;
  /**
   * Set `false` to stop the bus dropping emits whose payload equals the current
   * latched value. Only disable for genuine repeatable signals — duplicate
   * suppression is what keeps two-way sync from looping.
   * @defaultValue true
   */
  suppressDuplicates?: boolean;
  /**
   * Called for every event that is captured, after echo suppression. Useful for
   * piping the surface into analytics without a dedicated listener panel.
   */
  onCapture?: <K extends SurfaceEventName<EventSurfaceEventMap>>(
    type: K,
    payload: EventSurfaceEventMap[K],
    sourceId: string
  ) => void;
  /** Accessible label for the surface region. */
  ariaLabel?: string;
}

/** Props for an {@link EventSurfacePanelProps} grid item. */
export interface EventSurfacePanelProps extends Omit<ComponentProps<"div">, "id"> {
  /**
   * Unique id within this surface. Becomes the `sourceId` on everything the
   * panel emits, and is what echo suppression matches on — two panels sharing
   * an id would silently swallow each other's events.
   */
  id: string;
  /** Columns this panel spans. */
  colSpan?: number;
  /** Rows this panel spans. */
  rowSpan?: number;
  /** Named grid area; pair with the surface's `areas` template. */
  area?: string;
  /** Explicit 1-based column start, when span alone is not enough. */
  colStart?: number;
  /** Explicit 1-based row start. */
  rowStart?: number;
}
