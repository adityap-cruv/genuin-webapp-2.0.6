/**
 * Routes a feed entry to the correct layout based on `entry.kind`.
 *
 * Routing table:
 * - entry.kind === 'ad'            → AdLayout  (GenAdSlot + AdControlLayer)
 * - entry.kind === 'video-with-ad' → VideoLayout (LightPlayer + ad break + VideoControlLayer)
 * - entry.kind === 'video'         → VideoLayout (LightPlayer + VideoControlLayer)
 *
 * Both video kinds use the unified VideoLayout — the adObject prop
 * gates the ad break overlay internally. ReelItem itself is a pure 3-branch router.
 *
 * VideoLayout and AdLayout are loaded via `React.lazy` so their JS (LightPlayer +
 * control layers + player pipeline, and GenAdSlot + ad SDK, respectively) splits
 * into separate chunks off the initial index bundle. ReelItem does not own a
 * Suspense boundary itself — the required one is the Suspense that Feed wraps
 * around each mounted ReelItem.
 */
import { lazy } from "react";

import type { ControlLayerVariant } from "@cxr/controls/control-layer.types";
import type { FeedEntry } from "@cxr/types";

// VideoLayout (LightPlayer + control layers + player pipeline) and AdLayout
// (GenAdSlot + ad SDK) load as separate chunks so their JS leaves the initial
// index bundle. Because Feed only renders ReelItem for the active slide, the
// chunk downloads exactly when the first slide of that kind activates. The
// required Suspense boundary is the Suspense in Feed.
const VideoLayout = lazy(() => import("@cxr/feed/layouts/VideoLayout").then((m) => ({ default: m.VideoLayout })));
const AdLayout = lazy(() => import("@cxr/feed/layouts/AdLayout").then((m) => ({ default: m.AdLayout })));

/** Props for {@link ReelItem}. */
interface ReelItemProps {
  entry: FeedEntry;
  isActive: boolean;
  variant?: ControlLayerVariant;
  onTimeUpdate: (index: number, currentTime: number, duration: number) => void;
  onAutoAdvance?: () => void;
}

/**
 * Route a single feed entry to its layout component.
 *
 * @param props  entry, isActive flag, onTimeUpdate, and onAutoAdvance callback.
 *   tagDetails is read from {@link useTagDetails} by VideoLayout directly.
 */
export function ReelItem({ entry, isActive, variant, onTimeUpdate, onAutoAdvance }: ReelItemProps): React.JSX.Element {
  if (entry.kind === "ad") {
    return <AdLayout ad={entry.data} isActive={isActive} onAutoAdvance={onAutoAdvance} />;
  }

  if (entry.kind === "video-with-ad") {
    return (
      <VideoLayout
        reel={entry.data}
        isActive={isActive}
        variant={variant}
        onTimeUpdate={onTimeUpdate}
        onAutoAdvance={onAutoAdvance}
        adObject={entry.data.adObject}
      />
    );
  }

  if (entry.kind === "video") {
    return (
      <VideoLayout
        reel={entry.data}
        isActive={isActive}
        variant={variant}
        onTimeUpdate={onTimeUpdate}
        onAutoAdvance={onAutoAdvance}
      />
    );
  }

  return <></>;
}
