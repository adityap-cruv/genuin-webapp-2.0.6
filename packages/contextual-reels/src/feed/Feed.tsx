/**
 * Vertical feed container.
 *
 * Strict virtualization: every entry keeps an in-flow, full-height slide wrapper
 * (Embla computes translate math from real per-slide height — required in loop
 * mode and still assumed when the `feedLoopEnabled` strategy turns looping off,
 * so all wrappers must exist), but only the slides in the mount window
 * ({@link computeSlideMountWindow}) mount their real `ReelItem` content. Every
 * other slide renders a zero-fetch {@link ReelSlidePlaceholder}, so no
 * off-screen slide fetches a manifest, thumbnail, or ad.
 */
import { SafeSuspense } from "@genuin/components/molecules/error/safe-suspense";
import { useCallback } from "react";

import { FullscreenActionRailHost } from "@cxr/controls/FullscreenActionRailHost";
import type { ControlLayerVariant } from "@cxr/controls/control-layer.types";
import { FeedNavButtons } from "@cxr/feed/FeedNavButtons";
import { ReelItem } from "@cxr/feed/ReelItem";
import { ReelSlidePlaceholder } from "@cxr/feed/ReelSlidePlaceholder";
import { useEmblaCarousel } from "@cxr/feed/hooks/useEmblaCarousel";
import { useSwipeGate } from "@cxr/feed/hooks/useSwipeGate";
import { computeSlideMountWindow } from "@cxr/feed/slideMountWindow";
import { useEmblaFeed } from "@cxr/feed/useFeedNavigation";
import { useFeed } from "@cxr/providers/FeedProvider";
import { useFullScreen } from "@cxr/providers/FullScreenProvider";
import { useGenAI } from "@cxr/providers/GenAIProvider";
import { useTagDetails } from "@cxr/providers/TagDetailsProvider";
import { useStrategy } from "@cxr/strategies/StrategyProvider";
import type { FeedEntry } from "@cxr/types";

/** 9:16 video-box width — kept in sync with the `fullscreen-video-box` style below. */
const FULLSCREEN_VIDEO_WIDTH = "min(100vw, calc(100vh * 9 / 16))";

/**
 * Persistent neighbours mounted on each side of the active slide.
 *  - 0 (default): strict active-only — a slide mounts/fetches only when it is
 *    active or physically scrolling into view. Minimal un-interacted HAI bytes.
 *  - 1: also keep the previous + next slide warm for instant swiping, at the cost
 *    of 3 slides' manifest+poster up front. Flip this single constant to switch;
 *    nothing else changes.
 */
const FEED_PRELOAD_RADIUS = 0;

/** Props for the Feed container. */
interface FeedProps {
  entries: FeedEntry[];
  variant?: ControlLayerVariant;
}

/**
 * Vertical carousel feed. In fullscreen mode, wraps the feed in a 9:16
 * centred box with a black backdrop. Fullscreen is exited only via the
 * collapse button or the Escape key — backdrop clicks do not exit fullscreen.
 */
export function Feed({ entries, variant }: FeedProps): React.JSX.Element | null {
  const { tagDetails } = useTagDetails();
  const { isFullScreen } = useFullScreen();
  const { activeIndex, setActiveIndex, isAdActive, activeReel } = useFeed();
  const { octoFraction } = useGenAI();
  const { feedLoopEnabled } = useStrategy();

  // ── Carousel + navigation ────────────────────────────────────────────────
  // `feedLoopEnabled` defaults to true (every tag loops unless it opts out), so
  // this is a no-op for existing tags.
  const { viewportRef, emblaApiRef, enable, disable } = useEmblaCarousel({ loop: feedLoopEnabled });
  const {
    visibleIndices,
    onTimeUpdate: emitTimeUpdate,
    goNext,
  } = useEmblaFeed(emblaApiRef, {
    itemCount: entries.length,
    onSlideAway: () => undefined,
    onSlideEnter: setActiveIndex,
    onTimeUpdate: () => undefined,
  });
  // Swipe freezes while an Octo sheet owns part of the player.
  useSwipeGate({ enable, disable }, [octoFraction > 0]);

  const handleAutoAdvance = useCallback(() => {
    goNext();
  }, [goNext]);

  // Radius-tunable mount window (see FEED_PRELOAD_RADIUS above).
  const mountedIndices = computeSlideMountWindow(activeIndex, visibleIndices, {
    radius: FEED_PRELOAD_RADIUS,
    itemCount: entries.length,
  });

  // Same DOM tree in both modes — only styles change — so Embla's viewport ref stays mounted.
  return (
    <div
      data-testid="fullscreen-backdrop"
      className={
        isFullScreen
          ? "gencl:fixed gencl:inset-0 gencl:flex gencl:items-center gencl:justify-center"
          : "gencl:relative gencl:h-full gencl:w-full"
      }
      style={isFullScreen ? { background: "#000" } : undefined}>
      <div
        data-testid="fullscreen-video-box"
        className={
          isFullScreen
            ? "gencl:relative gencl:h-full gencl:overflow-hidden"
            : "gencl:relative gencl:h-full gencl:w-full"
        }
        style={isFullScreen ? { width: FULLSCREEN_VIDEO_WIDTH, background: "#000" } : undefined}>
        <div ref={viewportRef} data-testid="feed-container" className="gencl:h-full gencl:w-full gencl:overflow-hidden">
          <div data-testid="reel-list" className="gencl:flex gencl:flex-col gencl:h-full">
            {entries.map((entry, idx) => {
              const isMounted = mountedIndices.has(idx);
              const isAd = entry.kind === "ad";
              return (
                // Wrapper always renders, even as a placeholder — Embla's loop
                // math needs every slide's real height.
                <div key={entry.data.id} className="gencl:relative gencl:min-h-0" style={{ flex: "0 0 100%" }}>
                  {isMounted ? (
                    <SafeSuspense fallback={<ReelSlidePlaceholder tagDetails={tagDetails} isAd={isAd} />}>
                      <ReelItem
                        entry={entry}
                        isActive={idx === activeIndex}
                        variant={variant}
                        onTimeUpdate={emitTimeUpdate}
                        onAutoAdvance={handleAutoAdvance}
                      />
                    </SafeSuspense>
                  ) : (
                    <ReelSlidePlaceholder tagDetails={tagDetails} isAd={isAd} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Outside the video box's overflow-hidden + Embla transform subtree on purpose. */}
      <FeedNavButtons emblaApiRef={emblaApiRef} variant={variant} isAdActive={isAdActive} />
      <FullscreenActionRailHost
        variant={variant}
        isFullScreen={isFullScreen}
        isAdActive={isAdActive}
        item={activeReel}
      />
    </div>
  );
}
