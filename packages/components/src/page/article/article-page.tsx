"use client";

import { Text } from "@genuin/ui/components/typography";
import { cn } from "@genuin/ui/lib/utils";
import { NavArrowButton } from "@genuin/ui/player-controls";
import { ChevronRight, Sparkle } from "lucide-react";
import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from "react";

import {
  FeedViewOverlay,
  FeedViewOverlayProvider,
  prepareFeedView,
  useOpenFeedViewOverlay,
  usePlacementFeedViewIntent,
  type FeedViewOverlayRequest,
} from "@genuin/components/lib/feed-view/feed-view-overlay";
import { Link } from "@genuin/components/molecules/link";

import { type Article, getArticleByHref } from "./article-data";
import { ArticleIntelligenceAssistant } from "./article-intelligence-assistant";
import {
  ARTICLE_READER_MOTION_CSS,
  ARTICLE_READER_TYPOGRAPHY_CSS,
  ArticleReaderBody,
  ArticleReaderHeader,
} from "./article-reader";

/* -------------------------------------------------------------------------- */
/* Genuin SDK placements — real backend-configured embeds (`data-placement-id`),   */
/* NOT the internal video components. Same mechanism as the home-dynamic page:     */
/* load `gen_sdk.min.js` once, then `window.genuin.init({})` scans every            */
/* `.gen-sdk-class` container and mounts its placement from the data-* attributes.  */
/* -------------------------------------------------------------------------- */

type PlacementConfig = { placementId: string; styleId: string; apiKey: string };

/**
 * The three real Genuin placements woven into every article (QA env). Each renders its
 * own layout server-side from its `styleId`: a wide carousel (lead), a vertical feed
 * (right rail) and a grid (in-body). Swap these ids to re-target to other placements.
 */
const PLACEMENTS = {
  carousel: {
    placementId: "6a7c724e9a800f68344db4a1",
    styleId: "6a7c724e9a800f68344db4a2",
    apiKey: "018b5a9408d982482ee586511456679c1cc1f4bc4adc5dc2",
  },
  feed: {
    placementId: "6a884fdbd9efa1218d9a3e61",
    styleId: "6a884fdbd9efa1218d9a3e62",
    apiKey: "018b5a9408d982482ee586511456679c1cc1f4bc4adc5dc2",
  },
  grid: {
    placementId: "6a897c07cfdd53cec79af6a9",
    styleId: "6a897c07cfdd53cec79af6aa",
    apiKey: "018b5a9408d982482ee586511456679c1cc1f4bc4adc5dc2",
  },
} as const satisfies Record<string, PlacementConfig>;

/** Web SDK bundle — QA CDN by default, matching the webapp's `GenuinSdkLoader`. */
const SDK_SCRIPT_SRC =
  (typeof process !== "undefined" && process.env ? process.env.NEXT_PUBLIC_GENUIN_SDK_URL : undefined) ??
  "https://media.qa.begenuin.com/sdk/2.0.5/gen_sdk.min.js";

type GenuinWindow = Window & {
  genuin?: {
    init?: (config: Record<string, unknown>) => unknown;
    onInternal?: (event: string, listener: (payload: unknown) => void) => (() => void) | void;
  };
};

let sdkLoadPromise: Promise<void> | null = null;

/** Load `gen_sdk.min.js` exactly once — shared across every placement on the page. */
function loadGenuinSdk(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if ((window as GenuinWindow).genuin?.init) return Promise.resolve();
  if (sdkLoadPromise) return sdkLoadPromise;

  sdkLoadPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${SDK_SCRIPT_SRC}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Genuin SDK failed to load")));
      return;
    }
    const script = document.createElement("script");
    script.src = SDK_SCRIPT_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Genuin SDK failed to load"));
    document.body.appendChild(script);
  });
  return sdkLoadPromise;
}

// Batch init: several placements mounting in one frame trigger a single DOM scan.
let initHandle: number | null = null;
function scheduleGenuinInit() {
  if (typeof window === "undefined" || initHandle !== null) return;
  initHandle = window.requestAnimationFrame(() => {
    initHandle = null;
    (window as GenuinWindow).genuin?.init?.({
      // Article placements are nested first-party WebApp roots, just like Home placements.
      // Keep them in light DOM so global WebApp dialogs are not portalled into the first
      // placement's shadow root and clipped to that placement's bounds.
      useShadowDOM: false,
      configuration: { player_controls: "v2" },
    });
  });
}

/**
 * One real Genuin SDK placement. Renders a `.gen-sdk-class` container carrying the
 * placement's `data-*` config and fills its parent; the SDK mounts the embed into it
 * on `init()`. Already-initialised containers are skipped, so re-`init()` is safe.
 */
function GenuinPlacement({ placement }: { placement: PlacementConfig }) {
  // Unique, selector-safe container id (React's useId contains colons).
  const domId = `gen-sdk-${useId().replace(/:/g, "")}`;
  const openFeedViewOverlay = useOpenFeedViewOverlay();

  useEffect(() => {
    let cancelled = false;
    loadGenuinSdk()
      .then(() => {
        if (!cancelled) scheduleGenuinInit();
      })
      .catch(() => {
        /* SDK unavailable — the container just stays empty. */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleExpandRequest = useCallback(() => {
    // Match Home exactly: desktop opens the bounded Feed View; mobile keeps the SDK's native
    // direct-fullscreen behavior. Explicit player controls are never intercepted by this path.
    if (!openFeedViewOverlay || !window.matchMedia("(min-width: 1024px)").matches) return;
    prepareFeedView(domId);
    openFeedViewOverlay({ sourceDomId: domId });
  }, [domId, openFeedViewOverlay]);

  const captureFeedViewIntent = usePlacementFeedViewIntent({
    onExpandRequest: openFeedViewOverlay ? handleExpandRequest : undefined,
    waitForSdk: loadGenuinSdk,
  });

  return (
    <div
      id={domId}
      className="gen-sdk-class"
      data-style-id={placement.styleId}
      data-placement-id={placement.placementId}
      data-api-key={placement.apiKey}
      onClickCapture={captureFeedViewIntent}
      style={{ width: "100%", height: "100%" }}
    />
  );
}

/** Right-rail placement: the vertical "feed" placement (the page wraps it sticky). */
function ArticleFeedPlacement() {
  return (
    <div
      className="gen-article-reveal gen-article-reveal-delay-3 gencl:overflow-hidden gencl:rounded-xl"
      style={{ width: "100%", height: 640 }}>
      <GenuinPlacement placement={PLACEMENTS.feed} />
    </div>
  );
}

/** Hero placement: the wide "carousel" placement, full-width right under the headline. */
function ArticleCarouselPlacement() {
  return (
    <div
      className="gen-article-reveal gen-article-reveal-delay-1 gencl:my-8 gencl:overflow-hidden gencl:rounded-xl"
      style={{ width: "100%", height: 400 }}>
      <GenuinPlacement placement={PLACEMENTS.carousel} />
    </div>
  );
}

/**
 * Finale placement: a full-width "grid" placement after the article. Unlike the feed/carousel
 * (which scroll by design), the grid must show ALL its tiles at once with NO internal scrollbar.
 *
 * The SDK renders the grid inside a shadow root / iframe and sizes its scroll viewport to the
 * container height AT `init()` time — so the container must have the placement's configured
 * ratio on the first render. The placement is configured as 1000 × 890 with 3:4 tiles in a
 * 3-column × 2-row grid: two rows of 3:4 thirds need ~0.89 x the width, and the rest covers the
 * grid's gaps. The 3:4 tiles are deliberately taller than the 16:9 sources — the resulting
 * letterboxing is accepted in exchange for a larger tile.
 */
function ArticleGridPlacement() {
  return (
    <div
      className="gen-article-reveal gencl:overflow-hidden gencl:rounded-xl"
      style={{ width: "100%", aspectRatio: "1000 / 890" }}>
      <GenuinPlacement placement={PLACEMENTS.grid} />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Article reader                                                              */
/* -------------------------------------------------------------------------- */

/**
 * Two-column layout driven by a REAL CSS media query, not the `useDeviceDetectMediaQuery` JS
 * hook. `usehooks-ts` `useMediaQuery` returns `false` during SSR (no `window`), so gating the
 * column structure on it made the server render single-column — on a hard refresh the feed
 * dropped to the bottom and only a soft-nav (already-hydrated) showed two columns. A CSS
 * CSS query is evaluated by the browser identically on the SSR HTML and after hydration, so the
 * layout is correct on first paint every time. It is a `@container` (not `@media`) query so the
 * reader also lays out correctly inside the narrow inline Feed View panel, where the viewport is
 * wide but the article's own column is not. Shipped as a literal `<style>` (NOT a
 * `gencl:` utility) because the webapp consumes `@genuin/components` styles as a prebuilt
 * bundle where brand-new utility classes wouldn't be compiled in. Desktop breakpoint = 1024px,
 * matching `BREAKPOINTS.DESKTOP`.
 */
const ARTICLE_LAYOUT_CSS = `
${ARTICLE_READER_MOTION_CSS}
${ARTICLE_READER_TYPOGRAPHY_CSS}
/* The scroller is the query container for the whole reader: every breakpoint below reacts to
   the article's OWN width, so the narrow inline Feed View panel stacks and scales correctly even
   though the viewport behind it is wide. Pure CSS, so it is right on the first SSR paint. */
.gen-article-page { scroll-behavior: smooth; container-type: inline-size; container-name: gen-article; }
/* Centred reading shell — the page background stays full-bleed, the content does not. */
.gen-article-prose.gen-article-page .gen-article-shell { width: 100%; max-width: 1224px; margin: 0 auto; padding: 24px 20px 96px; }
.gen-article-prose.gen-article-page .gen-article-breadcrumb { display: flex; align-items: center; min-height: 40px; margin-bottom: 24px; }
.gen-article-prose.gen-article-page .gen-article-cols { margin-top: 40px; display: flex; flex-direction: column; gap: 32px; align-items: stretch; }
.gen-article-prose.gen-article-page .gen-article-main { min-width: 0; }
.gen-article-prose.gen-article-page .gen-article-rail { width: 100%; min-width: 0; flex-shrink: 0; }
.gen-article-prose.gen-article-page .gen-article-finale { width: 100%; margin-top: 56px; }
.gen-article-nested-view { animation: gen-article-nested-enter 240ms ease-out both; }
@keyframes gen-article-nested-enter {
  from { opacity: 0; }
  to { opacity: 1; }
}
.gen-article-progress {
  position: absolute; top: 0; left: 0; right: 0; height: 3px; z-index: 30;
  background: transparent; pointer-events: none;
}
.gen-article-progress-fill {
  height: 100%; width: 100%; transform-origin: 0 50%;
  background: var(--color-primary, #1a1a1a);
  transition: transform 90ms linear;
}
/* Reading comfort comes first: the generous gutters and rhythm kick in well before there is room
   for the rail, so the inline Feed View panel (roughly 260px narrower than the /article route,
   because the publisher sidebar takes that width) reads the same as the full page. */
@container gen-article (min-width: 700px) {
  .gen-article-prose.gen-article-page .gen-article-shell { padding: 32px 40px 128px; }
  .gen-article-prose.gen-article-page .gen-article-breadcrumb { margin-bottom: 32px; }
  .gen-article-prose.gen-article-page .gen-article-cols { margin-top: 48px; gap: 48px; }
  .gen-article-prose.gen-article-page .gen-article-finale { margin-top: 64px; }
}
/* Two columns only once the rail can sit beside a still-readable measure
   (1080 - 320 rail - 48 gap - 80 gutters = 632px of text). */
@container gen-article (min-width: 1080px) {
  .gen-article-prose.gen-article-page .gen-article-cols { flex-direction: row; }
  .gen-article-prose.gen-article-page .gen-article-main { flex: 1 1 0%; }
  .gen-article-prose.gen-article-page .gen-article-rail { width: 320px; }
  .gen-article-prose.gen-article-page .gen-article-rail-sticky { position: sticky; top: 24px; }
  /* Grid finale spans the article content column only (not the rail + gap), left-aligned so it
     sits exactly within the content's left and right borders. */
  .gen-article-prose.gen-article-page .gen-article-finale { width: calc(100% - 368px); }
}
@media (prefers-reduced-motion: reduce) {
  .gen-article-nested-view { animation: none; }
  .gen-article-page { scroll-behavior: auto; }
  .gen-article-progress-fill { transition: none; }
}
`;

/**
 * On-domain article reader built around all three Genuin SDK placements, full-width:
 *
 *  1. HERO   — a full-width CAROUSEL placement right under the headline, so the first thing a
 *              reader sees is a live placement (attention grab).
 *  2. BODY   — the article text + hero image on the left, with the FEED placement sticky in the
 *              right rail so an engagement unit stays on screen the whole read.
 *  3. FINALE — a full-width GRID placement after the article ("watch more"), to keep the reader
 *              on-site once they finish.
 *
 * The two-column body split is a real CSS `@container` query (see {@link ARTICLE_LAYOUT_CSS}), not
 * a JS media-query hook, so it's correct on the first paint of an SSR refresh (no column flip).
 */
/**
 * An article opened from this page's Intelligence assistant.
 *
 * Presentation is deliberately identical to the Feed View's inline article (`InlineArticleView`):
 * a full-bleed overlay that hosts a complete `ArticlePage`, entered with the same fade, with the
 * back control replacing the breadcrumb. The one thing it does NOT bring is the picture-in-picture
 * video — that belongs to the Feed View's player, and this route was never opened from a feed.
 *
 * Nesting is what gives Back its one-step-at-a-time behaviour: each level owns exactly one child.
 */
function NestedArticleOverlay({ article, onBack }: { article: Article; onBack: () => void }) {
  const viewRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      viewRef.current?.querySelector<HTMLButtonElement>('[data-slot="nested-article-back"] button')?.focus();
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  return (
    <section
      ref={viewRef}
      data-slot="nested-intelligence-article"
      className={cn(
        "gen-article-nested-view",
        "gencl:absolute gencl:inset-0 gencl:z-40 gencl:overflow-hidden gencl:bg-white gencl:text-secondary-900"
      )}
      aria-label={article.title}
      tabIndex={-1}>
      <ArticlePage
        article={article}
        backControl={
          <span data-slot="nested-article-back" className="gencl:inline-flex gencl:items-center gencl:gap-3">
            <NavArrowButton direction="left" size="lg" theme="dark" ariaLabel="Back to Intelligence" onClick={onBack} />
            <span
              data-slot="nested-article-intelligence-label"
              aria-hidden="true"
              className="gencl:inline-flex gencl:items-center gencl:gap-2 gencl:text-secondary-900">
              <Sparkle strokeWidth={1.75} className="gencl:size-5 gencl:shrink-0" />
              <span className="gencl:text-xs gencl:font-medium gencl:leading-4">Intelligence</span>
            </span>
          </span>
        }
      />
    </section>
  );
}

export function ArticlePage({ article, backControl }: { article: Article; backControl?: ReactNode }) {
  const overlayBoundsRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  /**
   * The article opened from this page's Intelligence assistant, presented exactly the way the Feed
   * View presents one — a full-bleed overlay hosting its own `ArticlePage` — instead of a route
   * push. Each level owns one child, so Back always steps exactly one article back.
   */
  const [nestedArticle, setNestedArticle] = useState<Article | null>(null);
  const closeNestedArticle = useCallback(() => setNestedArticle(null), []);

  // A slug the local article data does not know about is left to normal link navigation.
  const openArticleInPlace = useCallback((selection: { href: string }) => {
    const next =
      getArticleByHref(selection.href, typeof window === "undefined" ? undefined : window.location.origin) ??
      getArticleByHref(selection.href);
    if (!next) return false;
    setNestedArticle(next);
    return true;
  }, []);
  const [playerOverlay, setPlayerOverlay] = useState<FeedViewOverlayRequest | null>(null);
  const closePlayerOverlay = useCallback(() => setPlayerOverlay(null), []);
  const [isSdkExpandViewOpen, setIsSdkExpandViewOpen] = useState(false);
  // 0..1 read progress of the article scroller, driving the hairline bar at the top of the page.
  const [readProgress, setReadProgress] = useState(0);

  useEffect(() => {
    let cancelled = false;
    let unsubscribe: (() => void) | undefined;
    let retry: number | undefined;
    let attempts = 0;

    const register = () => {
      if (cancelled) return;
      const genuin = (window as GenuinWindow).genuin;
      if (!genuin?.onInternal) {
        // The SDK global can become ready just after the script's load event.
        if (attempts++ < 40) retry = window.setTimeout(register, 200);
        return;
      }

      const off = genuin.onInternal("onExpandViewChanged", (raw: unknown) => {
        // Internal SDK events arrive as `{ type, payload, ... }`; accept the direct boolean too
        // so this remains compatible with older bundles during a rolling SDK deployment.
        const expanded = typeof raw === "boolean" ? raw : (raw as { payload?: unknown } | null | undefined)?.payload;
        if (typeof expanded === "boolean") setIsSdkExpandViewOpen(expanded);
      });
      if (typeof off === "function") unsubscribe = off;
    };

    loadGenuinSdk()
      .then(register)
      .catch(() => undefined);

    return () => {
      cancelled = true;
      if (retry) window.clearTimeout(retry);
      unsubscribe?.();
    };
  }, []);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    let frame: number | null = null;
    const measure = () => {
      frame = null;
      const scrollable = scroller.scrollHeight - scroller.clientHeight;
      setReadProgress(scrollable > 0 ? Math.min(1, Math.max(0, scroller.scrollTop / scrollable)) : 0);
    };
    const onScroll = () => {
      if (frame === null) frame = window.requestAnimationFrame(measure);
    };

    measure();
    scroller.addEventListener("scroll", onScroll, { passive: true });
    const observer = new ResizeObserver(onScroll);
    observer.observe(scroller);
    return () => {
      if (frame !== null) window.cancelAnimationFrame(frame);
      scroller.removeEventListener("scroll", onScroll);
      observer.disconnect();
    };
  }, []);

  return (
    <FeedViewOverlayProvider onOpen={setPlayerOverlay}>
      <div
        ref={overlayBoundsRef}
        data-slot="article-feed-view-boundary"
        style={{ position: "relative", height: "100%", overflow: "hidden", background: "#ffffff" }}>
        <div className="gen-article-progress" aria-hidden="true">
          <div className="gen-article-progress-fill" style={{ transform: `scaleX(${readProgress})` }} />
        </div>
        <div
          ref={scrollerRef}
          className="gen-article-page gen-article-prose"
          aria-hidden={playerOverlay || nestedArticle ? true : undefined}
          inert={playerOverlay || nestedArticle ? true : undefined}
          style={{ height: "100%", overflow: playerOverlay ? "hidden" : "auto", background: "#ffffff" }}>
          <style>{ARTICLE_LAYOUT_CSS}</style>
          <div className="gen-article-shell">
            <div className="gen-article-breadcrumb">
              {backControl ?? (
                <nav aria-label="Breadcrumb" className="gencl:min-w-0">
                  <ol className="gencl:flex gencl:min-w-0 gencl:items-center gencl:gap-1.5">
                    <li className="gencl:shrink-0">
                      <Link
                        href="/home"
                        className={cn(
                          "gencl:text-secondary-500 gencl:no-underline gencl:transition-colors",
                          "gencl:hover:text-secondary-900 gencl:focus-visible:outline-none gencl:focus-visible:underline"
                        )}>
                        <Text as="span" size="body-2" weight="medium">
                          Home
                        </Text>
                      </Link>
                    </li>
                    <li aria-hidden="true" className="gencl:flex gencl:shrink-0 gencl:text-secondary-400">
                      <ChevronRight className="gencl:size-4" strokeWidth={1.75} />
                    </li>
                    <li aria-current="page" className="gencl:min-w-0 gencl:text-secondary-700">
                      <Text as="span" size="body-2" weight="medium" className="gencl:block gencl:truncate">
                        {article.title}
                      </Text>
                    </li>
                  </ol>
                </nav>
              )}
            </div>

            {/* Full-width headline block, above the hero placement. */}
            <ArticleReaderHeader article={article} />

            {/* 1. HERO — a full-width placement is the first media the reader sees. */}
            <ArticleCarouselPlacement />

            {/* 2. BODY — article text (LEFT) + sticky feed placement (RIGHT rail). Two columns on
                desktop, stacked on mobile, via CSS so it's correct on the first SSR paint. */}
            <div className="gen-article-cols">
              <ArticleReaderBody article={article} />

              <aside className="gen-article-rail">
                <div className="gen-article-rail-sticky gen-article-reveal gen-article-reveal-delay-3">
                  <ArticleFeedPlacement />
                </div>
              </aside>
            </div>

            {/* 3. FINALE — grid to keep the reader watching. Constrained to the article content
                column width (see `.gen-article-finale`), not the full container. */}
            <div className="gen-article-finale">
              <ArticleGridPlacement />
            </div>
          </div>
        </div>

        <ArticleIntelligenceAssistant
          article={article}
          hidden={Boolean(playerOverlay) || Boolean(nestedArticle) || isSdkExpandViewOpen}
          onArticleSelect={openArticleInPlace}
        />

        {nestedArticle ? (
          <NestedArticleOverlay key={nestedArticle.slug} article={nestedArticle} onBack={closeNestedArticle} />
        ) : null}

        {playerOverlay ? (
          <FeedViewOverlay request={playerOverlay} boundsRef={overlayBoundsRef} onClose={closePlayerOverlay} />
        ) : null}
      </div>
    </FeedViewOverlayProvider>
  );
}
