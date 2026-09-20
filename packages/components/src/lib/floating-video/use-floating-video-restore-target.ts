"use client";
import { useEffect, useRef } from "react";

import { clearFloatingVideo } from "./events";
import { consumePendingFloatingVideoRestore } from "./session-store";
import type { FloatingVideoRestoreRequest } from "./types";

const FLOATING_HOST_SELECTOR = '[data-genuin-floating-video="true"]';

type FloatingVideoRestoreTargetOptions = {
  /** This placement's container id. */
  domId: string;
  /** Stable placement id — what a restore request is matched on. */
  placementId?: string;
  /** False while the container is not rendered yet. */
  enabled?: boolean;
  /**
   * Presents the handed-back player as the bounded Feed View. `excludeHost` is the retained
   * floating host: leaving it out of the overlay's "hosts that already existed" snapshot is
   * what makes the overlay adopt that host instead of waiting for a new one to appear.
   */
  onPrepareFeedView: (options?: { excludeHost?: HTMLElement | null }) => void;
};

/**
 * Takes a floating card back and shows it full size again, when the user sends it home.
 *
 * The counterpart to the card's expand control: that control parks a request and navigates
 * here, and this claims it on arrival.
 *
 * The card is the same player the user was already watching, so it is re-framed rather than
 * rebuilt. Building a fresh embed instead would mean waiting for the placement to mount, the
 * SDK to become ready and the expand portal to commit — seconds during which this route sits
 * on screen, which is exactly what the hand-off exists to avoid.
 *
 * Mount it on any placement that can be a hand-off source.
 */
export function useFloatingVideoRestoreTarget({
  domId,
  placementId,
  enabled = true,
  onPrepareFeedView,
}: FloatingVideoRestoreTargetOptions): void {
  const prepareRef = useRef(onPrepareFeedView);
  prepareRef.current = onPrepareFeedView;
  const claimedRef = useRef<FloatingVideoRestoreRequest | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !enabled) return;

    // Claim once, then hold it: this effect re-runs while the placement settles, and a request
    // consumed by an earlier run would be gone by the time the card can be adopted.
    const articleSlug = document.getElementById(domId)?.closest<HTMLElement>("[data-floating-video-article-slug]")
      ?.dataset.floatingVideoArticleSlug;
    claimedRef.current ??= consumePendingFloatingVideoRestore({ domId, placementId, articleSlug });
    const restore = claimedRef.current;
    if (!restore) return;

    const retained = document.querySelector<HTMLElement>(FLOATING_HOST_SELECTOR);
    // No card left to take back. The only things that remove one are the session ending —
    // the video finished, errored, or was superseded — and in every one of those cases the
    // video the user asked to return to is no longer playing, so this route is the right
    // place to leave them.
    if (!retained) {
      claimedRef.current = null;
      return;
    }

    prepareRef.current({ excludeHost: retained });
    // "adopted", not a plain close: this tells the SDK runtime to keep the retained React root
    // alive, because it is the player now being shown full size.
    clearFloatingVideo(restore.sessionId, "adopted");
    claimedRef.current = null;
  }, [domId, enabled, placementId]);
}
