"use client";

import { onFloatingVideoPromote, onFloatingVideoRestore } from "@genuin/components/lib/floating-video/events";
import { registerFloatingVideoHost, setPendingFloatingVideoRestore } from "@genuin/components/lib/floating-video/session-store";
import { useFloatingVideoAudioGuard } from "@genuin/components/lib/floating-video/use-floating-video-audio-guard";
import { useFloatingVideoRouteLifecycle } from "@genuin/components/lib/floating-video/use-floating-video-route-lifecycle";
import { usePathname, useRouter } from "next/navigation";
import { startTransition, useEffect } from "react";

/**
 * Host half of the floating-video hand-off.
 *
 * Three jobs, all of which only this side can do:
 *
 * 1. **Route the navigation.** SDK placements render their links as plain anchors, so a pill
 *    click would otherwise reload the document and destroy the player mid-hand-off. Mounting
 *    this bridge tells the SDK a router is available; the pill then cancels its anchor and
 *    this performs the navigation client-side, keeping the document — and the video — alive.
 * 2. **Take the card back.** Its expand control means "put the video back full size", which
 *    for a handed-off card is a navigation home plus a re-open once the placement is there.
 * 3. **End the session.** It is created on one route and has to be cleaned up on another, so
 *    nothing that unmounts with a page can own it.
 *
 * Renders nothing.
 */
export function FloatingVideoBridge() {
  const pathname = usePathname();
  const router = useRouter();

  useFloatingVideoRouteLifecycle(pathname);
  useFloatingVideoAudioGuard();

  useEffect(() => {
    /**
     * `startTransition` is the whole point: the App Router then keeps the page the user is
     * looking at on screen until the destination is ready, instead of tearing it down and
     * showing a route-level fallback. A hand-off must never put anything in between — the
     * floating card just carries on playing over whichever page is still up.
     */
    const navigate = (href: string) => startTransition(() => router.push(href));

    const unregister = registerFloatingVideoHost();
    const offPromote = onFloatingVideoPromote((request) => navigate(request.targetHref));
    const offRestore = onFloatingVideoRestore((request) => {
      // Park the request and navigate, but leave the session running. The card keeps playing
      // over the source route while its placement remounts; the placement ends the session
      // itself, at the moment it has the video full size again. Ending it here instead would
      // put a bare source page on screen for as long as the remount takes.
      setPendingFloatingVideoRestore(request);
      navigate(request.sourcePathname);
    });
    return () => {
      offPromote();
      offRestore();
      unregister();
    };
  }, [router]);

  return null;
}
