"use client";

import { VideoPlayer } from "@genuin/ui/components/video-player";
import { useEffect, useRef, useState } from "react";

import { usePlayback } from "./playback-coordinator";

/**
 * Click-aware video wrapper that participates in the page-level
 * `<PlaybackCoordinator>`. The cell with `id === activeId` plays;
 * every other cell pauses. Clicking anywhere on the cell makes it
 * the active one.
 *
 * **Why we mutate `claimedRef` during render.** `<VideoPlayer>`
 * initializes its underlying OpenPlayerJS player asynchronously
 * (`await player.init(); await player.load()` inside
 * `initializePlayer`). When the wrapper mounts with `play={false}`
 * and only flips to `play={true}` after a state update, the play
 * prop change can land **before** init resolves; the play call
 * hits a `null` `playerRef` and is silently dropped, leaving the
 * player in an "inited but never played" state.
 *
 * Avoiding that race requires the **first** `<ManagedVideo>` to
 * render with `play={true}` from the very first frame. The only
 * mechanism that produces a different result for the first cell vs
 * the rest synchronously during render is to mutate a shared ref —
 * which is what `useState`'s lazy initializer does here. This is a
 * known render-time side-effect tradeoff:
 *
 * - **Strict mode (dev):** the lazy init runs twice; the second
 *   invocation sees `claimedRef.current === id` and returns the
 *   same `true` (idempotent).
 * - **Concurrent rendering:** if the first cell's render is
 *   discarded before commit, `claimedRef` stays set to a
 *   never-mounted id and no cell becomes active. The cleanup
 *   below resets the ref on unmount, so a remount of the same
 *   cell recovers; a hard suspend of the first cell + sibling
 *   takeover would need extra coordinator logic. Not pursued
 *   because the discard scenario doesn't arise in our setup
 *   (no Suspense boundaries inside the grid root).
 *
 * **Floater (sticky) auto-claim** — if the closest enclosing slot
 * carries `data-floater="true"`, this cell additionally watches
 * the slot's stuck state. The moment the slot pins to the top
 * (the user has scrolled past it), the cell calls `setActive(id)`
 * and takes over playback. The scroll listener is rAF-throttled
 * so the layout reads (`getBoundingClientRect()`) don't run more
 * than once per frame.
 */
export function ManagedVideo({ id, src, poster }: { id: string; src: string; poster?: string | null }) {
  const { activeId, setActive, release, claimedRef } = usePlayback();

  // See JSDoc above for the render-time mutation tradeoff.
  const [iClaimed] = useState(() => {
    if (claimedRef.current === null) {
      claimedRef.current = id;
      return true;
    }
    return claimedRef.current === id;
  });

  // Sync the coordinator state on mount for the claiming cell so
  // subsequent clicks on other cells properly compare against it.
  useEffect(() => {
    if (iClaimed) setActive(id);
    return () => {
      if (iClaimed) {
        if (claimedRef.current === id) claimedRef.current = null;
        release(id);
      }
    };
  }, [id, iClaimed, setActive, release, claimedRef]);

  // Floater stick detection. Walks up to the nearest slot section
  // tagged `data-floater="true"`, then watches its position vs the
  // scroll container to detect the moment it pins.
  const wrapperRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const cellEl = wrapperRef.current;
    if (!cellEl) return;
    const floaterEl = cellEl.closest<HTMLElement>('[data-floater="true"]');
    if (!floaterEl) return;
    const scrollRoot = findScrollContainer(floaterEl);
    if (!scrollRoot) return;

    // Read the sticky offset once at effect setup — it's driven by
    // the template's `--hg-floater-top` CSS variable, which only
    // changes when the consumer passes a new `floaterTop` prop
    // (which would re-run this effect via the parent re-render).
    const cssTop = parseFloat(getComputedStyle(floaterEl).top);
    const stickyOffset = Number.isFinite(cssTop) ? cssTop : 0;

    let wasStuck = false;
    let pendingFrame = 0;
    const measure = () => {
      pendingFrame = 0;
      const rect = floaterEl.getBoundingClientRect();
      const rootRect = scrollRoot.getBoundingClientRect();
      // 1 px tolerance for sub-pixel rounding.
      const stuck = rect.top - rootRect.top <= stickyOffset + 1;
      if (stuck && !wasStuck) {
        wasStuck = true;
        setActive(id);
      } else if (!stuck && wasStuck) {
        wasStuck = false;
      }
    };
    const onScroll = () => {
      // Coalesce bursts of scroll events into one layout read per
      // animation frame.
      if (pendingFrame !== 0) return;
      pendingFrame = window.requestAnimationFrame(measure);
    };

    measure();
    scrollRoot.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      scrollRoot.removeEventListener("scroll", onScroll);
      if (pendingFrame !== 0) window.cancelAnimationFrame(pendingFrame);
    };
  }, [id, setActive]);

  // While `activeId` is still null (haven't reached the post-mount
  // `setActive` yet), fall back to `iClaimed` so the claiming
  // cell's `<VideoPlayer>` mounts with `play={true}` and autoplays.
  const isActive = activeId === id || (activeId === null && iClaimed);

  return (
    <div
      ref={wrapperRef}
      onClick={() => {
        if (!isActive) setActive(id);
      }}
      style={{
        position: "absolute",
        inset: 0,
        cursor: isActive ? "default" : "pointer",
      }}>
      <VideoPlayer
        src={src}
        poster={poster ?? undefined}
        play={isActive}
        muted
        loop
        controls={false}
        playsInline
        preload="metadata"
        className="gencl:w-full gencl:h-full gencl:object-cover"
      />
    </div>
  );
}

/**
 * Walks up from `el` looking for the nearest scrollable ancestor
 * (an element whose computed `overflow-y` is `auto` or `scroll`).
 * Returns `null` if none — the page-level `window` is not used as
 * a fallback since the grid scroll lives inside the BaseLayout's
 * fixed-height main region.
 */
function findScrollContainer(el: Element): HTMLElement | null {
  let parent = el.parentElement;
  while (parent) {
    const overflowY = getComputedStyle(parent).overflowY;
    if (overflowY === "auto" || overflowY === "scroll") return parent;
    parent = parent.parentElement;
  }
  return null;
}
