/**
 * Vertical feed container.
 *
 * Thin shell — all carousel logic (Embla init, wheel, loop) lives in
 * `hooks/useEmblaCarousel`. In fullscreen mode renders a 9:16 centred
 * wrapper with a black backdrop.
 */
import { useCallback, useEffect } from "react";

import { FullscreenActionRailHost } from "@cxr/controls/FullscreenActionRailHost";
import type { ControlLayerVariant } from "@cxr/controls/control-layer.types";
import { FeedNavButtons } from "@cxr/feed/FeedNavButtons";
import { ReelList } from "@cxr/feed/ReelList";
import { useEmblaCarousel } from "@cxr/feed/hooks/useEmblaCarousel";
import { useFeed } from "@cxr/providers/FeedProvider";
import { useFullScreen } from "@cxr/providers/FullScreenProvider";
import { useGenAI } from "@cxr/providers/GenAIProvider";
import { usePlayer } from "@cxr/providers/PlayerProvider";
import type { FeedEntry, TagResponse } from "@cxr/types";

/** 9:16 video-box width — kept in sync with the `fullscreen-video-box` style below. */
const FULLSCREEN_VIDEO_WIDTH = "min(100vw, calc(100vh * 9 / 16))";

/** Props for the Feed container. */
interface FeedProps {
  entries: FeedEntry[];
  tagDetails: TagResponse;
  variant?: ControlLayerVariant;
}

/**
 * Vertical carousel feed.
 *
 * Delegates carousel behaviour to {@link useEmblaCarousel} and slide rendering
 * to {@link ReelList}. In fullscreen mode, wraps the feed in a 9:16 centred
 * box with a black backdrop. Fullscreen is exited only via the collapse button
 * or the Escape key — backdrop clicks do not exit fullscreen.
 *
 * @param props  entries, tagDetails, and optional navigation callbacks.
 */
export function Feed({ entries, tagDetails, variant }: FeedProps): React.JSX.Element | null {
  const { setPlaying, isAdBreakActive } = usePlayer();
  const onSlideSelect = useCallback(() => setPlaying(true), [setPlaying]);
  const { viewportRef, emblaApiRef, enable, disable } = useEmblaCarousel();
  const { isFullScreen } = useFullScreen();
  const { octoFraction } = useGenAI();
  const { activeIndex, setActiveIndex } = useFeed();

  // Hide the action rail while an ad slide or a fullscreen ad break is on
  // screen — ads own their own overlay/CTA chrome.
  const activeEntry = entries[activeIndex];
  const isAdActive = activeEntry?.kind === "ad" || isAdBreakActive;
  const activeReel =
    activeEntry?.kind === "video" || activeEntry?.kind === "video-with-ad" ? activeEntry.data : undefined;

  // Freeze the vertical feed swipe while an Octo sheet owns part of the player
  // (panel/full → octoFraction > 0); restore it the moment the sheet collapses.
  useEffect(() => {
    if (octoFraction > 0) {
      disable();
    } else {
      enable();
    }
  }, [octoFraction, enable, disable]);

  // TODO: can we move this into useEmblaCarousel and expose an onSelect callback? It feels weird to have carousel logic in the Feed component.
  useEffect(() => {
    const api = emblaApiRef.current;
    if (!api) return;
    api.on("select", onSlideSelect);
    return () => {
      api.off("select", onSlideSelect);
    };
  }, [emblaApiRef, onSlideSelect]);

  // Fullscreen: stable DOM tree — only styles change so Embla's viewport ref stays mounted.
  // The root div is already fixed+black via .cxr__v1.cxr__fullscreen CSS.
  // We constrain the inner container to 9:16 and centre it.
  // Backdrop clicks intentionally do NOT exit fullscreen — only the collapse button or Escape key do.
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
          <ReelList
            emblaApiRef={emblaApiRef}
            entries={entries}
            tagDetails={tagDetails}
            variant={variant}
            onSlideEnter={setActiveIndex}
          />
        </div>
      </div>
      {/*
        Nav arrows + action rail live at backdrop level (outside the video box's
        overflow-hidden + Embla transform subtree). In fullscreen they sit in the
        black margin beside the centred video; in collapse, inside the embed.
      */}
      <FeedNavButtons emblaApiRef={emblaApiRef} variant={variant} />
      <FullscreenActionRailHost
        tagDetails={tagDetails}
        variant={variant}
        isFullScreen={isFullScreen}
        isAdActive={isAdActive}
        item={activeReel}
      />
    </div>
  );
}
