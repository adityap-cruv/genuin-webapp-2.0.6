# SEO checklist (technical + structural)

The traditional "rank a clickable link" surface. Most items are additive/mechanical (very low
risk). Audit a route, tag findings, fix `[READY]`/`[FIX]`, then **verify against the served HTML**
(`references/verification.md`). This skill stops at verification — it does not open a PR.

> **genuin-webapp binding:** the project's exact helpers (`getOgUrl`, `fetchMetadata`), the
> middleware-proxied robots/sitemap, the intentional `noindex` routes, and the recorded
> soft-404 decision are in `codebase-map.md`. Below is generic.

## Per-page metadata
- [ ] Unique `<title>` and `meta description` per page (not templated-identical).
- [ ] `canonical` present — **param-free, self-referencing per host**. (genuin-webapp: use
      `getOgUrl`; it's missing on all routes today — see `codebase-map.md`.) **[FIX]**
- [ ] Open Graph + Twitter cards correct for the type — `og:type=article` for posts (see
      `blog-article-seo.md`), the og:video/player fixes for video (`video-seo.md §3`).
- [ ] `og:url` has no tracking params (`utm_*`, share/community/group/session ids).

## robots meta directives
Complete globally where possible:
```
index, follow, max-image-preview:large, max-video-preview:-1, max-snippet:-1
```
Keep any intentional `noindex,nofollow` (private profiles, embed/player layouts, staging). **[FIX]**

## Semantic structure
- [ ] Exactly one `<h1>` per page; logical heading order (no skipped levels).
- [ ] Descriptive link text (not "click here"); crawlable `<a href>` to param-free URLs.
- [ ] `alt` on images; explicit `width`/`height` to avoid layout shift.

## Crawl hygiene
- [ ] **Thin pages [READY]** — `noindex` sparse entity/tag/category pages until they cross a content
      threshold (e.g. ≥ N items), then flip to `index`.
- [ ] **Internal search [READY]** — `Disallow /search?q=` (or `noindex`) so infinite thin search
      URLs aren't crawled.
- [ ] **Soft-404 [check]** — deleted/invalid pages should return a real HTTP 404, not a 200 with a
      client error state (a known deindexing risk). The SEO block's server fetch gives a free
      existence check. (genuin-webapp returns 200 today — a recorded `[DEFERRED]` decision; see
      `codebase-map.md`. Don't "fix" it silently.)

## Sitemap
For the **video sitemap**: `<loc>` = canonical param-free URL; include `video:thumbnail_loc`,
`video:title`, `video:description`, `video:content_loc` (mp4), `video:duration` (seconds),
`video:publication_date`; shard at 50k URLs/file under a sitemap index. Infinite-scroll feeds mean
crawlers can't reach deep items — the sitemap is how they're found. For **articles**, include every
post with accurate `<lastmod>` = `dateModified`.

> Where robots.txt / sitemaps are *generated* varies by project. genuin-webapp proxies both from a
> backend via `middleware.ts` — a frontend `robots.ts`/`sitemap.ts` won't override them; coordinate
> with backend (see `codebase-map.md`, `bot-policy.md`). Always confirm the live `/robots.txt` and
> sitemap output before recommending edits.

## Performance signals (flag, advise)
- [ ] Content exists in served HTML, not only after JS (the whole point — verify it).
- [ ] LCP image/poster eager-loaded with `fetchpriority="high"`; everything below lazy.
- [ ] No render-blocking resources / unsized images causing CLS.

## Multi-host / whitelabel consistency
If the project serves multiple or whitelabel domains, each is a separate property: fixes propagate,
but **verify crawler access on every domain**. A domain behind a WAF/bot wall that also blocks
Googlebot + AI bots is invisible before any tag is read (genuin-webapp hit exactly this on a
whitelabel — see `bot-policy.md`).
