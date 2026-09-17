"use client";
import { useCallback, type MouseEvent } from "react";

import { requestFloatingVideoPromotion } from "./events";
import { isPrimaryNavigationClick, resolveInternalPathname } from "./navigation-intent";
import { isFloatingVideoHostAvailable } from "./session-store";
import type { FloatingVideoTrigger } from "./types";

/**
 * Makes any link carry the currently playing video with it.
 *
 * This is the whole public surface for a navigating surface: attach the returned handler to a
 * link's `onClick` and tag it with a `trigger`. The caller needs to know nothing about
 * players, placements or sessions — if a player is eligible it takes the hand-off, and if none
 * is, the link behaves exactly as it did before.
 *
 * Works from either root. Inside an SDK placement the links are plain anchors whose default
 * would reload the document, and on the page they are router links; in both cases the default
 * is cancelled and the host bridge performs one client-side navigation, which is what keeps
 * the document — and the video — alive.
 *
 * @example
 * const handleNavigate = useFloatingVideoLink("sidebar");
 * <Link href={href} onClick={(event) => handleNavigate(href, event)} />
 */
export function useFloatingVideoLink(
  trigger: FloatingVideoTrigger
): (href: string, event: MouseEvent<HTMLElement>) => void {
  return useCallback(
    (href: string, event: MouseEvent<HTMLElement>) => {
      // Without a host router the click is a full document load, which nothing survives.
      // Leave the link alone rather than promoting a video that is about to be destroyed.
      if (!isFloatingVideoHostAvailable()) return;
      if (!isPrimaryNavigationClick(event)) return;
      if (!resolveInternalPathname(href)) return;

      if (!requestFloatingVideoPromotion({ targetHref: href, trigger })) return;

      // A player took it. Hand the navigation to the host bridge, which performs it
      // client-side so this document survives.
      event.preventDefault();
    },
    [trigger]
  );
}
