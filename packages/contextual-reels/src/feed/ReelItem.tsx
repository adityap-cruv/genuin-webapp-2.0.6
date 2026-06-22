/**
 * Routes a feed entry to the correct layout based on `entry.kind`.
 *
 * Routing table:
 * - entry.kind === 'ad'   → AdLayout  (GenAdSlot + AdControlLayer)
 * - entry.kind === 'reel' → VideoLayout (LightPlayer + VideoControlLayer)
 *
 * All adLayout-specific branching is handled inside the layout components and
 * their control layers — ReelItem is a pure 2-branch router.
 */
import type { ControlLayerVariant } from "@cxr/controls/control-layer.types";
import { VideoLayout, AdLayout } from "@cxr/feed/layouts";
import type { FeedEntry, TagResponse } from "@cxr/types";

/** Props for {@link ReelItem}. */
interface ReelItemProps {
  entry: FeedEntry;
  isActive: boolean;
  tagDetails: TagResponse;
  variant?: ControlLayerVariant;
  onTimeUpdate: (index: number, currentTime: number, duration: number) => void;
  /** Advance the carousel one slide — called on ad fail/complete or video end. */
  onAutoAdvance?: () => void;
}

/**
 * Route a single feed entry to its layout component.
 *
 * @param props  entry, isActive flag, tagDetails, onTimeUpdate, and onAutoAdvance callback.
 */
export function ReelItem({
  entry,
  isActive,
  tagDetails,
  variant,
  onTimeUpdate,
  onAutoAdvance,
}: ReelItemProps): React.JSX.Element {
  if (entry.kind === "ad") {
    return <AdLayout ad={entry.data} isActive={isActive} onAutoAdvance={onAutoAdvance} />;
  }

  if (entry.kind === "reel") {
    return (
      <VideoLayout
        reel={entry.data}
        isActive={isActive}
        tagDetails={tagDetails}
        variant={variant}
        onTimeUpdate={onTimeUpdate}
        onAutoAdvance={onAutoAdvance}
      />
    );
  }

  return <></>;
}
