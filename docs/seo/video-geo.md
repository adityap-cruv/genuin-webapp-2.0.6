# Video SEO & GEO

How Genuin video watch-pages (`/video/[slug]`) are made discoverable, indexable,
and citable by Google Search and AI answer engines (GEO — Generative Engine
Optimization). This is the reference for what the code does today and what still
depends on backend/ops work.

> Origin: PRs #556 (`release/genuin-sdk/2.0.6`) and #561 (`release/genuin-sdk/2.0.5`).

---

## The model

A video watch-page is a Server Component (`app/(site)/(new)/video/[slug]/page.tsx`)
that renders a **client-only** player (`VideoPage` → `VideoPlayerV2`). Because the
player is client-rendered, crawlers and AI engines rely on what the server emits
in the initial HTML:

- `VideoObject` JSON-LD — built by `buildVideoJsonLd()` in `lib/api/video-seo.ts`.
- OG / Twitter tags + canonical — `generateMetadata()` in the page.
- A server-rendered `sr-only` text block — `VideoSeoBlock` (h1, transcript, tags,
  author, counts) so there is crawlable/citable text.
- Server-rendered `sr-only` internal links to sibling videos — `VideoLinks` (same
  loop first, then community) so each watch page is a crawl hub, not a dead-end.
- The video sitemap + `og:video` (video discovery signals).

> Where these blocks render differs by release line: on **2.0.5** the JSON-LD,
> `VideoSeoBlock`, and `VideoLinks` render in the route `layout.tsx` — outside the
> `loading.tsx` Suspense boundary, so they land in the initial JS-free HTML; on
> **2.0.6** they render in `page.tsx`.

The single source of normalized data is `getVideoSeoData()` (`lib/api/video-seo.ts`),
which fetches `/goservices/feed/video` and maps it to `VideoSeoData`.

## Feed API → `VideoSeoData` field map

Confirmed against the live `/goservices/feed/video` response.

| `VideoSeoData`                                      | Feed field                                                                            | Notes                                                                                                                          |
| --------------------------------------------------- | ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `title`                                             | `attributes.video_title` → caption (`toTitle`)                                        | Real title preferred; else a concise headline derived from the caption's first sentence. `cleanText` collapses doubled quotes. |
| `description`                                       | `description_text` (`cleanText`)                                                      | Real caption; preferred over meta_data's generic description for `<meta name=description>`.                                    |
| `contentUrl`                                        | `media_url`                                                                           | Raw mp4 (never `media_url_m3u8`). Google's preferred source.                                                                   |
| `thumbnailUrl` + `thumbnailUrls`                    | `thumbnail_url` / `_l` / `_s`                                                         | Emitted as an array (all sizes, largest first).                                                                                |
| `duration`                                          | `duration` / `meta_data.duration`                                                     | ISO-8601 via `toIsoDuration()`.                                                                                                |
| `uploadDate`                                        | `conversation_at`                                                                     | ISO-8601 via `epochToIso()`.                                                                                                   |
| `width`/`height`                                    | `meta_data.resolution` (+ `aspect_ratio`)                                             | `resolveDimensions()` handles `"1080x1920"` and `"1080"`+`"9:16"`.                                                             |
| `viewCount`/`likeCount`/`commentCount`/`shareCount` | `no_of_views`/`_sparks`/`_comments`/`_shares`                                         | → `interactionStatistic` (Watch/Like/Comment/Share).                                                                           |
| `author`                                            | `owner.*` — name/url/`isBrand`; `bio`→`description`, `profile_image_l`→`image`/`logo` | Rich author entity for E-E-A-T / GEO.                                                                                          |
| `community` / `loop`                                | `community.*` / `loop.*`                                                              | Entity context for GEO.                                                                                                        |
| `tags`                                              | `attributes.video_keywords`                                                           | Internal entries (e.g. `mcc-vertical`) stripped via `INTERNAL_TAG_RE`.                                                         |
| `transcript`                                        | — (not yet in payload)                                                                | Feed exposes only `is_transcribed`; read is pre-wired for when text ships.                                                     |

No `embedUrl`: `contentUrl` is present and is Google's preferred source, so an
embed URL is not needed for `VideoObject`.

## Canonicalization

`getOgUrl()` (`lib/utils.ts`) builds canonical/`og:url`/share URLs. The
redirect-only `app` subdomain is **excluded** — `app.begenuin.com` 301-redirects
to the apex, so it must never appear in a canonical (a canonical pointing at a
redirect is not honored). Apex pages self-reference `NEXT_PUBLIC_HOST_URL`; real
subdomains (iheart, …) and whitelabel domains are unchanged. This governs canonical
for **all** apex content types (video, group, brand, profile, community).

Query params (`utm_source`, `community`, `group`, `share_image_id`) are stripped —
the canonical consolidates those variants to the clean URL.

---

## Status

### Done (in-code)

- Apex self-canonical (`getOgUrl`).
- `VideoObject` enrichment: real `video_title`, filtered `video_keywords`,
  dimensions (`resolveDimensions`), pre-wired `transcript`.
- Author as a rich entity (`bio`→`description`, `profile_image_l`→`image`/`logo`),
  multi-size `thumbnailUrl` array, and comment/share counts in
  `interactionStatistic`.
- Server-rendered on-page transcript + tags (`VideoSeoBlock`).
- Server-rendered internal links to sibling videos (`VideoLinks`), streamed
  `sr-only`, host-scoped and fail-safe (2.5s feed timeout, `afterVideoId` cursor so
  coverage chains across the catalog) — turns each watch page into a crawl hub.
- Feed hydration: the server-fetched `/goservices/feed/video` is seeded into the
  client `useFeed` cache (`HydrationBoundary`) so the client adopts it instead of
  re-fetching on mount. Perf/dedup, not an SEO signal.

### Needs backend (Go)

1. **Expose the transcript TEXT** (only `is_transcribed` flag today) — the #1 GEO
   lever. Frontend is already wired to consume it.
2. **Standardize `meta_data.resolution`** — `"1080"` vs `"1080x1920"`; provide
   `"WxH"` or explicit `width`/`height`.
3. **Clean public tags** — `video_keywords` mixes internal + public.
4. **Populate/expose `video_summary`** (null today).
5. **Video sitemap** (Go proxy): `video:title` uses the account name, not
   `attributes.video_title`; empty `restriction`/`player_loc`; missing
   `duration`/`tag`/`uploader`.
6. **Guarantee `thumbnailUrl` + `uploadDate`** — required `VideoObject` fields
   emitted empty when the API omits them.

### Needs ops / product

- **Discovery:** submit brand-subdomain sitemaps to GSC (e.g.
  `iheart.begenuin.com/sitemap/index.xml`, currently unsubmitted → pages
  "unknown to Google"). The other half of this — server-rendered internal links
  to individual video pages — is now shipped (see Done).
- **Brand identity is backend-owned:** the frontend deliberately synthesizes no
  brand name. On whitelabel domains the brand is the customer (iHeart, …), not
  Genuin, so `VideoObject` emits no `publisher` and title/description fall back to
  backend-supplied values — never a hardcoded "Genuin". (Pre-existing generic
  fallbacks like `og:site_name` remain; backend owns making those brand-aware.)
- **SSR-ing the client player:** deprioritized — video results already generate,
  so it is not the bottleneck. Revisit only if the GSC Video-indexing report lags.

## Measuring

Google Search Console:

- **Search Analytics** — compare `web` vs `video` search types; filter to
  `/video/` pages; watch impressions/CTR/position.
- **URL Inspection** — verdict + `googleCanonical` per page (used to diagnose the
  canonical bug above).
- **Video indexing report** — coverage; the signal that decides whether SSR-ing
  the player is worth doing.

---

## Diagnosis: discovery ≠ indexing (2026-08-20)

GSC data for `sc-domain:begenuin.com`, pulled via the URL Inspection + Search
Analytics APIs. This is the reference for *why* the video pages aren't ranking
despite a healthy sitemap — read it before assuming the sitemap or markup is
broken.

### robots.txt + sitemap are healthy — not the problem

- `robots.txt`: `Disallow:` (allows all) and declares `Sitemap:
  https://begenuin.com/sitemap/index.xml`.
- Sitemap index: 200, well-formed, 11 children incl. 8 paginated video sitemaps.
- GSC: `sitemap/index.xml` submitted, **0 errors / 0 warnings**, re-downloaded
  daily. Google is reading the sitemap fine.

### The funnel (90-day window)

The Sitemaps page's "7,672 videos" is a **discovery** count ("Google parsed these
URLs from your file"), *not* an indexed count. Indexing is three stages down:

| Stage                                             | Count | Where it shows        |
| ------------------------------------------------- | ----: | --------------------- |
| **Discovered** (URLs parsed from sitemap)         | 7,672 | Sitemaps page         |
| **Crawled + in web index** (any web impression)   |   829 | Search Analytics      |
| **Video-indexed** (surfaced in video results)     |    51 | Video indexing report |
| impressions / clicks (video surface, 90d)         | 155 / 2 |                     |

The Sitemaps count and the Video-indexing count measure different stages and were
never meant to match. Uncrawled URLs never appear in the Video-indexing report at
all, which is why it "looks like it's missing videos."

### Two leaks (both confirmed via URL Inspection)

1. **Most URLs are never crawled — the big leak.** Four URLs pulled straight from
   the sitemap all returned **"URL is unknown to Google"** (no `lastCrawlTime`, no
   canonical). Discovered ≠ crawled: Google won't spend crawl budget on 7.6k URLs
   from a sitemap alone without importance signals. Root cause: **no internal
   links** to watch pages (the feed is client-rendered → a crawl dead-end). Google
   deprioritizes URLs known *only* from a sitemap.
2. **The crawled ones were poisoned by the old canonical.** Pages crawled before
   the fix declared `canonical → app.begenuin.com` (a redirecting host) → filed as
   *"Alternate page with proper canonical tag"* → not indexed. The `getOgUrl` fix
   corrects this, but only takes effect **on re-crawl**.

### Levers, by impact

1. **Server-rendered internal links to watch pages (shipped)** — the decisive fix
   for the "unknown to Google" bulk. Turns discovered→crawled; lands on re-crawl.
   Sitemaps and Request Indexing cannot substitute for this at 7.6k scale.
2. **Canonical fix (shipped)** — unblocks leak #2; lands on re-crawl.
3. **Sitemap resubmit + genuine `<lastmod>`** — minor re-crawl nudge for the
   already-crawled set. (No bulk "recrawl domain" exists; the old
   `google.com/ping?sitemap=` endpoint was removed in 2023.)
4. **Request Indexing** (URL Inspection, UI-only, ~10–20/day) — force-crawl the
   top ~20 pages that matter now. Not viable at scale. There is **no** API for it
   (URL Inspection API is read-only; the Indexing API is only for `JobPosting` /
   `BroadcastEvent`).

### Sitemap content bugs found in passing (backend)

- **`<video:title>` is the account name** (`Genuin`) on every URL, not
  `attributes.video_title` — every video looks identically titled to Google.
- **`<lastmod>` is the request date** (today on all 1,000 URLs/page), not the
  video's real change time — trains Google to distrust the freshness signal.

### Also in GSC sitemaps (cleanup)

- `begenuin.com/sitemap/static/index.xml` submitted separately **and** as a child
  of the index (double submission), 17 warnings — drop the standalone submission.
- `media.begenuin.com/sitemap/sitemap.xml` — stale legacy sitemap (2024), 66,783
  web + 6,179 video URLs on the CDN host — being removed.
