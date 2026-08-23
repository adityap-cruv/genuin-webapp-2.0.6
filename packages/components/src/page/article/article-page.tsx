"use client";

import { Image } from "@genuin/ui/components/image";
import { Heading, Text } from "@genuin/ui/components/typography";
import { cn } from "@genuin/ui/lib/utils";
import { useEffect, useId } from "react";

import { Link } from "@genuin/components/molecules/link";

import type { Article, ArticleBlock } from "./article-data";

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
  process.env.NEXT_PUBLIC_GENUIN_SDK_URL ?? "https://media.qa.begenuin.com/sdk/2.0.5/gen_sdk.min.js";

type GenuinWindow = Window & { genuin?: { init?: (config: Record<string, unknown>) => unknown } };

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
    (window as GenuinWindow).genuin?.init?.({ configuration: { player_controls: "v2" } });
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

  return (
    <div
      id={domId}
      className="gen-sdk-class"
      data-style-id={placement.styleId}
      data-placement-id={placement.placementId}
      data-api-key={placement.apiKey}
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
      className="gen-article-reveal gencl:mt-8 gencl:overflow-hidden gencl:rounded-xl"
      style={{ width: "100%", aspectRatio: "1000 / 890" }}>
      <GenuinPlacement placement={PLACEMENTS.grid} />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Article reader                                                              */
/* -------------------------------------------------------------------------- */

const KIND_LABEL: Record<Article["kind"], string> = {
  news: "News",
  interview: "Interview",
  podcast: "Podcast",
  event: "Event",
};

/**
 * Two-column layout driven by a REAL CSS media query, not the `useDeviceDetectMediaQuery` JS
 * hook. `usehooks-ts` `useMediaQuery` returns `false` during SSR (no `window`), so gating the
 * column structure on it made the server render single-column — on a hard refresh the feed
 * dropped to the bottom and only a soft-nav (already-hydrated) showed two columns. A CSS
 * `@media` query is evaluated by the browser identically on the SSR HTML and after hydration,
 * so the layout is correct on first paint every time. Shipped as a literal `<style>` (NOT a
 * `gencl:` utility) because the webapp consumes `@genuin/components` styles as a prebuilt
 * bundle where brand-new utility classes wouldn't be compiled in. Desktop breakpoint = 1024px,
 * matching `BREAKPOINTS.DESKTOP`.
 */
const ARTICLE_LAYOUT_CSS = `
.gen-article-page { scroll-behavior: smooth; }
.gen-article-reveal {
  opacity: 0;
  animation: gen-article-rise 620ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
}
.gen-article-reveal-delay-1 { animation-delay: 80ms; }
.gen-article-reveal-delay-2 { animation-delay: 160ms; }
.gen-article-reveal-delay-3 { animation-delay: 240ms; }
@keyframes gen-article-rise {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
.gen-article-cols { margin-top: 24px; display: flex; flex-direction: column; gap: 32px; align-items: stretch; }
.gen-article-main { min-width: 0; }
.gen-article-rail { width: 100%; min-width: 0; flex-shrink: 0; }
.gen-article-finale { width: 100%; }
@media (min-width: 1024px) {
  .gen-article-cols { flex-direction: row; }
  .gen-article-main { flex: 1 1 0%; }
  .gen-article-rail { width: 340px; }
  .gen-article-rail-sticky { position: sticky; top: 16px; }
  /* Grid finale spans the article content column only (not the 340px rail + 32px gap),
     left-aligned so it sits exactly within the content's left and right borders. */
  .gen-article-finale { width: calc(100% - 372px); }
}
@media (prefers-reduced-motion: reduce) {
  .gen-article-page { scroll-behavior: auto; }
  .gen-article-reveal { opacity: 1; animation: none; }
}
`;

/** One body block — a section heading, a paragraph, or a captioned image. */
function BodyBlock({ block }: { block: ArticleBlock }) {
  if (block.type === "heading") {
    return (
      <Heading as="h2" level="headline-3" weight="bold" className="gencl:mt-8 gencl:mb-2 gencl:text-secondary-900">
        {block.text}
      </Heading>
    );
  }

  if (block.type === "image") {
    return (
      <figure className="gencl:my-6">
        <div className="gencl:overflow-hidden gencl:rounded-lg gencl:bg-secondary-100">
          <Image src={block.src} alt={block.alt ?? ""} handleError className="gencl:w-full gencl:object-cover" />
        </div>
        {block.caption ? (
          <figcaption className="gencl:mt-2">
            <Text as="span" size="body-3" className="gencl:text-secondary-500">
              {block.caption}
            </Text>
          </figcaption>
        ) : null}
      </figure>
    );
  }

  return (
    <Text as="p" size="body-1" className="gencl:my-4 gencl:leading-7 gencl:text-secondary-800">
      {block.text}
    </Text>
  );
}

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
 * The two-column body split is a real CSS `@media` query (see {@link ARTICLE_LAYOUT_CSS}), not a
 * JS media-query hook, so it's correct on the first paint of an SSR refresh (no column flip).
 */
export function ArticlePage({ article }: { article: Article }) {
  const isEvent = article.kind === "event";
  const bylineParts = [article.author, article.publishedAt].filter(Boolean);

  return (
    <div
      className="gen-article-page"
      style={{ height: "100%", overflow: "auto", background: "#ffffff" }}>
      <style>{ARTICLE_LAYOUT_CSS}</style>
      <div style={{ width: "100%", padding: "32px 20px" }}>
        <Link
          href="/home"
          className={cn(
            "gencl:inline-flex gencl:items-center gencl:gap-1 gencl:text-secondary-500",
            "gencl:no-underline gencl:hover:text-secondary-800"
          )}>
          <Text as="span" size="body-2" weight="medium">
            ← Back to home
          </Text>
        </Link>

        {/* Full-width headline block, above the hero placement. */}
        <header className="gen-article-reveal gencl:mt-4">
          <Text
            as="p"
            size="body-3"
            weight="semibold"
            className="gencl:mb-2 gencl:uppercase gencl:tracking-wider gencl:text-primary">
            {KIND_LABEL[article.kind]}
          </Text>

          <Heading as="h1" level="headline-1" weight="bold" className="gencl:text-secondary-900">
            {article.title}
          </Heading>

          {article.standfirst ? (
            <Text as="p" size="body-0" className="gencl:mt-3 gencl:leading-7 gencl:text-secondary-700">
              {article.standfirst}
            </Text>
          ) : null}

          {isEvent && (article.eventDate || article.location) ? (
            <div className="gencl:mt-4 gencl:flex gencl:flex-wrap gencl:items-center gencl:gap-x-2 gencl:gap-y-1">
              {article.eventDate ? (
                <Text as="span" size="body-1" weight="semibold" className="gencl:text-secondary-900">
                  {article.eventDate}
                </Text>
              ) : null}
              {article.eventDate && article.location ? (
                <span aria-hidden className="gencl:text-secondary-400">
                  |
                </span>
              ) : null}
              {article.location ? (
                <Text as="span" size="body-1" className="gencl:text-secondary-600">
                  {article.location}
                </Text>
              ) : null}
            </div>
          ) : null}

          {bylineParts.length > 0 ? (
            <Text as="p" size="body-2" className="gencl:mt-4 gencl:text-secondary-500">
              {bylineParts.join(" • ")}
            </Text>
          ) : null}
        </header>

        {/* 1. HERO — a full-width placement is the first media the reader sees. */}
        <ArticleCarouselPlacement />

        {/* 2. BODY — article text (LEFT) + sticky feed placement (RIGHT rail). Two columns on
            desktop, stacked on mobile, via CSS so it's correct on the first SSR paint. */}
        <div className="gen-article-cols">
          <article className="gen-article-main gen-article-reveal gen-article-reveal-delay-2">
            <div className="gencl:mb-6 gencl:overflow-hidden gencl:rounded-xl gencl:bg-secondary-100">
              <Image
                src={article.heroImage.src}
                alt={article.heroImage.alt}
                handleError
                className="gencl:w-full gencl:object-cover"
              />
            </div>

            <div data-slot="article-body">
              {article.body.map((block, index) => (
                <BodyBlock key={index} block={block} />
              ))}
            </div>
          </article>

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
  );
}
