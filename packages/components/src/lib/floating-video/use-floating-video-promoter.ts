"use client";
import { useEffect, useRef } from "react";

import { useSafeEmbedContext } from "@genuin/components/context/embed/context";
import {
  getActiveExpandViewSourceId,
  getParentExpandViewSourceIds,
  isFeedViewPresentation,
} from "@genuin/components/lib/feed-view/presentation";
import type { PostDetailsType } from "@genuin/components/react-query/api/feed/schema";

import {
  onFloatingVideoClear,
  onFloatingVideoPresented,
  onFloatingVideoPromotionIntent,
  promoteFloatingVideo,
} from "./events";
import { resolveInternalPathname } from "./navigation-intent";
import { retainPlacementContainer } from "./placement-retention";
import { createFloatingVideoSessionId } from "./session-store";

type FloatingVideoPromoterOptions = {
  /** The feed this player is showing, used to identify the video being handed off. */
  posts: PostDetailsType[];
  /** Index of the slide currently on screen. */
  activeIndex: number;
};

/**
 * Answers navigation intents on behalf of the player that owns the video.
 *
 * This is the half of the hand-off that knows what is playing. A navigating surface only says
 * where it is going; which placement and which video it is are filled in here.
 *
 * Note what is deliberately *not* captured: playback position, mute and play state. The player
 * is never re-created — it is re-framed — so it carries all of that itself.
 *
 * Mount it once per player. Only a player currently presented as the bounded Feed View accepts,
 * which is what keeps a page with several placements unambiguous and leaves every other
 * surface's links behaving exactly as before.
 */
export function useFloatingVideoPromoter({ posts, activeIndex }: FloatingVideoPromoterOptions): void {
  const embedDetails = useSafeEmbedContext();
  // The listener is registered once; these refs keep it reading current values without
  // re-subscribing on every slide change.
  const postsRef = useRef(posts);
  postsRef.current = posts;
  const activeIndexRef = useRef(activeIndex);
  activeIndexRef.current = activeIndex;
  const retentionRef = useRef<ReturnType<typeof retainPlacementContainer> | null>(null);

  const rootElement = embedDetails?.rootElement ?? null;
  const placementId = embedDetails?.embedData.placement_id ?? "";
  const eventBus = embedDetails?.embedEventBus ?? null;

  useEffect(() => {
    if (!rootElement?.id || !eventBus) return;

    return onFloatingVideoPromotionIntent((intent) => {
      // First acceptor wins; a second player must not overwrite the session.
      if (intent.accepted) return;
      // Re-checked per click, not per render: the same placement moves between Feed View and
      // Full View while mounted.
      if (!isFeedViewPresentation(rootElement)) return;
      // A retained parent still has its Feed View marker while an article video
      // is on top. Only that foreground player may accept the navigation.
      const activeSourceId = getActiveExpandViewSourceId();
      if (activeSourceId !== rootElement.id) return;

      const targetPathname = resolveInternalPathname(intent.targetHref);
      if (!targetPathname) return;
      // Already there: navigating is a no-op, so promoting would strand a floating card that
      // never gets a route change to clear it.
      if (targetPathname === window.location.pathname) return;

      const video = postsRef.current[activeIndexRef.current]?.video;
      if (!video?.id) return;

      // Article identity is presentation state, separate from the browser route.
      // Keep it on the retained placement after its article ancestor unmounts.
      const sourceArticleSlug = rootElement.closest<HTMLElement>("[data-floating-video-article-slug]")?.dataset
        .floatingVideoArticleSlug;
      if (sourceArticleSlug) rootElement.dataset.floatingVideoArticleSlug = sourceArticleSlug;

      promoteFloatingVideo({
        sessionId: createFloatingVideoSessionId(),
        sourceInstanceId: rootElement.getAttribute("data-instance-id") ?? "",
        sourceDomId: rootElement.id,
        sourcePlacementId: placementId,
        videoId: video.id,
        targetHref: intent.targetHref,
        targetPathname,
        sourcePathname: window.location.pathname,
        sourceArticleSlug,
        sourceParentDomIds: getParentExpandViewSourceIds(rootElement),
        trigger: intent.trigger,
      });

      // Snapshot the container now, while it is still laid out. It gets re-homed once the
      // framing is applied — by then the page has taken it away, and a detached placement
      // measures 0×0, which every responsive decision in the card reads as the smallest
      // variant (that is what dropped the card's description).
      // Reuse an existing retention rather than replacing it. After a card has been handed
      // back, this container is already parked; releasing it first would detach it, and the
      // fresh snapshot would then measure 0×0 — losing the card's description on every
      // hand-off after the first.
      retentionRef.current ??= retainPlacementContainer(rootElement);

      intent.accepted = true;
    });
  }, [eventBus, placementId, rootElement]);

  useEffect(() => {
    // Park when the card framing actually goes on, which is when the source route is gone.
    const offPresented = onFloatingVideoPresented(() => retentionRef.current?.park());
    const offClear = onFloatingVideoClear(({ reason, sourceDomId }) => {
      if (sourceDomId !== rootElement?.id) return;
      // "adopted" means this root is now the full-size Feed View. It still needs a measurable
      // container — dropping it would make the next hand-off park a 0×0 box and lose the
      // card's description all over again.
      if (reason === "adopted") return;
      retentionRef.current?.release();
      retentionRef.current = null;
    });
    return () => {
      offPresented();
      offClear();
    };
  }, [rootElement]);

  // Releasing on unmount too: a placement that goes away without its session being cleared
  // must not leave a parked container behind.
  useEffect(
    () => () => {
      retentionRef.current?.release();
      retentionRef.current = null;
    },
    []
  );
}
