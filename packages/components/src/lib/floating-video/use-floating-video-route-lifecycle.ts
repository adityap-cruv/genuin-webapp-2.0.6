"use client";
import { useEffect } from "react";

import { clearFloatingVideo } from "./events";
import { getFloatingVideoSession, hasPendingFloatingVideoRestore } from "./session-store";

/**
 * Ends a floating session once the destination route has been left.
 *
 * A promoted video is allowed to outlive exactly one navigation — the one the user's click
 * caused. Any subsequent route change, including Back, clears it. A full page reload clears
 * it implicitly, because the session lives on `window`.
 *
 * Mount this once, high in the route tree that owns navigation (the route-group layout), and
 * pass the current pathname from the host router.
 */
export function useFloatingVideoRouteLifecycle(pathname: string): void {
  useEffect(() => {
    const session = getFloatingVideoSession();
    if (!session) return;
    // Arriving at the destination is the navigation the session was created for.
    if (pathname === session.targetPathname) return;
    // A restore is the one navigation the card is meant to survive: it is carrying the video
    // back to where it was full size, and the placement there ends the session once it has
    // taken over. Clearing here would blank the screen for the length of that remount.
    if (hasPendingFloatingVideoRestore()) return;
    clearFloatingVideo(session.sessionId, "route-change");
  }, [pathname]);
}
