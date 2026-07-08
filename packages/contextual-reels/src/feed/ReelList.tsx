/**
 * Renders all feed entries as Embla slides stacked in a flex column.
 *
 * Virtualisation is intentionally removed: Embla handles which slide is visible,
 * so all entries must be in-flow DOM children for the carousel to have real scrollable
 * height. Each slide is `flex: 0 0 100%` so it fills exactly one viewport height.
 */
import type { EmblaCarouselType } from "embla-carousel";
import { type RefObject } from "react";

import type { ControlLayerVariant } from "@cxr/controls/control-layer.types";
import { ReelItem } from "@cxr/feed/ReelItem";
import { useEmblaFeed } from "@cxr/feed/useFeedNavigation";
import type { FeedEntry, TagResponse } from "@cxr/types";

/** Props for ReelList. */
interface ReelListProps {
  /** Stable ref to the Embla API — non-null as soon as the viewport mounts. */
  emblaApiRef: RefObject<EmblaCarouselType | null>;
  entries: FeedEntry[];
  tagDetails: TagResponse;
  variant?: ControlLayerVariant;
  onSlideAway?: (index: number, timerData: { currentTime: number; duration: number } | undefined) => void;
  onSlideEnter?: (index: number) => void;
  onTimeUpdate?: (index: number, currentTime: number, duration: number) => void;
}

/**
 * Full-list Embla slide renderer.
 *
 * All entries are rendered as in-flow flex children. Embla's internal transform moves
 * the container so that only the active slide is visible, while `activeIndex` from
 * `useEmblaFeed` drives the `isActive` prop on each `ReelItem`.
 *
 * @param props  emblaApi, entries, tagDetails, optional analytics/navigation callbacks.
 */
export function ReelList({
  emblaApiRef,
  entries,
  tagDetails,
  variant,
  onSlideAway,
  onSlideEnter,
  onTimeUpdate,
}: ReelListProps): React.JSX.Element | null {
  const {
    activeIndex,
    visibleIndices,
    autoAdvance,
    onTimeUpdate: emitTimeUpdate,
  } = useEmblaFeed(emblaApiRef, {
    itemCount: entries.length,
    onSlideAway: onSlideAway ?? (() => undefined),
    onSlideEnter: onSlideEnter ?? (() => undefined),
    onTimeUpdate: onTimeUpdate ?? (() => undefined),
  });

  return (
    // Embla container — must be a flex column so slides stack vertically.
    <div data-testid="reel-list" className="gencl:flex gencl:flex-col gencl:h-full">
      {entries.map((entry, idx) => {
        const isActive = idx === activeIndex;
        return (
          // Embla slide — flex: 0 0 100% fills exactly one viewport height.
          // opacity/visibility fade matches the previous 3-window experience.
          <div
            key={entry.data.id}
            className="gencl:relative gencl:min-h-0"
            style={{
              flex: "0 0 100%",
              opacity: visibleIndices.has(idx) ? 1 : 0,
              visibility: visibleIndices.has(idx) ? "visible" : "hidden",
              transition: "opacity 0.25s ease",
            }}>
            <ReelItem
              entry={entry}
              isActive={isActive}
              tagDetails={tagDetails}
              variant={variant}
              onTimeUpdate={emitTimeUpdate}
              onAutoAdvance={autoAdvance}
            />
          </div>
        );
      })}
    </div>
  );
}
