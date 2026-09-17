"use client";
import { useCallback, useRef } from "react";

import { clearFloatingVideo, requestFloatingVideoRestore } from "./events";
import { getFloatingVideoSession } from "./session-store";

type FloatingVideoExitOptions = {
  /** The session this player is presenting as a card, or null. */
  sessionId: string | null;
  /** Whether the card on screen belongs to an inline article rather than a hand-off. */
  isInlineArticleOpen: boolean;
  /** Restores the inline-article flow's full-size player, in place. */
  onCloseInlineArticle: () => void;
};

/**
 * The two ways a floating card stops being a card.
 *
 * One player renders the card for two different reasons — an inline article opened beside it,
 * or a navigation carried it to another route — and each has to be undone differently. Keeping
 * that decision here rather than in the player means the player only has to say which controls
 * exist, not what a hand-off is.
 */
export function useFloatingVideoExit({
  sessionId,
  isInlineArticleOpen,
  onCloseInlineArticle,
}: FloatingVideoExitOptions): {
  /** The card's expand control: put this video back full size. */
  restoreFullSize: () => void;
  /** Called when the card is dismissed, to end a hand-off that owns it. */
  endHandOff: () => void;
} {
  // Both handlers are handed to memoised children, so they stay stable and read through refs.
  const sessionIdRef = useRef(sessionId);
  sessionIdRef.current = sessionId;
  const isInlineArticleOpenRef = useRef(isInlineArticleOpen);
  isInlineArticleOpenRef.current = isInlineArticleOpen;
  const closeInlineArticleRef = useRef(onCloseInlineArticle);
  closeInlineArticleRef.current = onCloseInlineArticle;

  const restoreFullSize = useCallback(() => {
    // Whichever presentation is actually on screen wins. An inline article is a local state
    // change, so closing it is instant and correct; a stale hand-off session — one left behind
    // by an earlier navigation — must never turn that into a route restore, which would try to
    // navigate to a page the user is already on and leave the article stranded over the player.
    if (isInlineArticleOpenRef.current || !sessionIdRef.current) {
      closeInlineArticleRef.current();
      return;
    }

    // A handed-off card's full-size player lives on another route, so restoring it is a
    // navigation plus a re-open once we get there.
    const session = getFloatingVideoSession();
    requestFloatingVideoRestore({
      sessionId: sessionIdRef.current,
      sourceDomId: session?.sourceDomId ?? "",
      sourcePlacementId: session?.sourcePlacementId ?? "",
      sourcePathname: session?.sourcePathname ?? "/",
    });
  }, []);

  const endHandOff = useCallback(() => {
    // An inline article can simply hide its card because the page still owns the tree. A
    // hand-off card outlives its page, so dismissing it must also end the session — that is
    // what releases the retained React root.
    if (sessionIdRef.current) clearFloatingVideo(sessionIdRef.current, "manual-close");
  }, []);

  return { restoreFullSize, endHandOff };
}
