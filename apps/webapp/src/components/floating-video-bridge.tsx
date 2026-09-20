"use client";

import { onFloatingVideoPromote, onFloatingVideoRestore } from "@genuin/components/lib/floating-video/events";
import {
  registerFloatingVideoHost,
  setPendingFloatingVideoRestore,
} from "@genuin/components/lib/floating-video/session-store";
import type { FloatingVideoRestoreRequest } from "@genuin/components/lib/floating-video/types";
import { useFloatingVideoAudioGuard } from "@genuin/components/lib/floating-video/use-floating-video-audio-guard";
import { useFloatingVideoRouteLifecycle } from "@genuin/components/lib/floating-video/use-floating-video-route-lifecycle";
import { getArticleBySlug } from "@genuin/components/page/article/article-data";
import { InlineArticleView } from "@genuin/components/page/article/inline-article-view";
import { usePathname, useRouter } from "next/navigation";
import { startTransition, useCallback, useEffect, useLayoutEffect, useState } from "react";
import { createPortal } from "react-dom";

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
 * Reopens inline article context on the source route when the video came from Intelligence.
 */
export function FloatingVideoBridge() {
  const pathname = usePathname();
  const router = useRouter();
  const [inlineRestore, setInlineRestore] = useState<{
    request: FloatingVideoRestoreRequest;
    pathname: string;
  } | null>(null);
  const closeInlineRestore = useCallback(() => setInlineRestore(null), []);

  useEffect(() => {
    setInlineRestore((current) => (current?.pathname === pathname ? current : null));
  }, [pathname]);

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
      // An article opened inside Intelligence is an overlay, not an article-route
      // navigation. Rebuild that context on the source page; its placement takes
      // back the retained player, and Back reveals the inline article underneath.
      if (
        request.sourceArticleSlug &&
        !request.sourceParentDomIds?.length &&
        request.sourcePathname !== `/article/${request.sourceArticleSlug}` &&
        getArticleBySlug(request.sourceArticleSlug) &&
        window.matchMedia("(min-width: 1024px)").matches
      ) {
        setInlineRestore({ request, pathname: request.sourcePathname });
      }
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

  if (!inlineRestore || inlineRestore.pathname !== pathname) return null;

  return (
    <RestoredInlineArticle
      key={inlineRestore.request.sessionId}
      request={inlineRestore.request}
      onBack={closeInlineRestore}
    />
  );
}

function RestoredInlineArticle({ request, onBack }: { request: FloatingVideoRestoreRequest; onBack: () => void }) {
  const [container, setContainer] = useState<HTMLElement | null>(null);
  // Resolve after the source route commits: before then this is the destination's
  // content node, which the router is about to detach.
  useLayoutEffect(() => {
    setContainer(document.querySelector<HTMLElement>('[data-slot="site-content"]'));
  }, []);
  const article = request.sourceArticleSlug ? getArticleBySlug(request.sourceArticleSlug) : null;
  if (!container || !article) return null;

  return createPortal(<InlineArticleView article={article} onBack={onBack} />, container);
}
