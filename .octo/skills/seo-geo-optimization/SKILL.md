---
name: seo-geo-optimization
description: Audit, fix, and generate SEO / GEO (generative-engine, AI-citation) / AIO-optimized web pages on any framework, repo, or CMS — blog/article, video, and entity pages (creator, community, brand, product). Ships framework-agnostic principles, ready-to-paste JSON-LD, checklists, and scripts that audit source and verify the served (JS-free) HTML against what Google, Meta and X/LinkedIn enforce. Does not open PRs or commit. Use when asked to "optimize for search/SEO", "GEO", "AIO", "show up in ChatGPT/Perplexity/Gemini", "add structured data / JSON-LD / schema", "fix canonical / og:video / meta tags", or "verify SEO renders for crawlers". Proactively invoke this skill — even when the user never says "SEO" — whenever generating or editing user-facing web pages or their search surface: page routes/components, metadata, JSON-LD/structured data, Open Graph/Twitter tags, sitemaps, robots, or blog/video/community/brand/profile pages. Skip it for non-page code (APIs, build config, tests, internal utilities).
---

# SEO, GEO & AIO Optimization for Web Pages

One skill to **audit, fix, and generate** the **technical + structural** surface of three overlapping goals, on any stack:
- **SEO** - rank as a clickable link in Google/Bing. Signals: keywords, links, crawlable content, technical health.
- **GEO** (Generative Engine Optimization) / **AIO** - get **cited inside** an AI answer (ChatGPT, Claude, Gemini, Perplexity), often with zero click. Signals: structure, entity trust, fact density, machine-readable text.

It owns the **code/page surface only**. It does **not** do off-site PR/backlinks, keyword strategy, or guarantee rankings/citations, and it does **not** open pull requests or land code - it stops after **verifying** the output against the same standards Google, Meta/Instagram, and other large platforms enforce, and hands the diff back to the user. User-facing copy edits are **proposed, never silently applied**.

## Core premise (read first - true on every stack)

Crawlers and LLMs read the **initial server HTML**, not the post-hydration DOM, and **LLMs cannot watch video or run your app** - they can only cite **text that is in the served HTML**. So:

- If a page body is **client-rendered** (SPA / CSR / client components), crawlers and AI engines see only what `<head>` ships - usually nothing citable in the body. **Fix:** an **additive server-rendered SEO block** - a server-rendered region in the initial HTML *alongside* the client app that emits crawlable body text + JSON-LD; the client hydrates on top, unchanged. Avoids a risky full SSR rewrite while giving crawlers the substance.
- Where SSR/SSG/a CMS already renders the body (most blogs, Next.js metadata routes, Astro/Hugo/WordPress), you only need to **add structured data and fix metadata** - the body is already crawlable.
- When **generating a new page** from scratch, bake the body text + JSON-LD + correct metadata in from the start; never ship a client-only shell.

## Two ways to use this skill

- **Audit & fix** existing pages → the **Workflow** below.
- **Generate** a new SEO/GEO-ready page (blog post, video page, entity page) → see [references/page-generation.md](references/page-generation.md). It still ends at **Verify**, and reuses the same rules, templates, and entity matrix.

## Project bindings (how the generic stays correct per repo)

The rules here are framework-agnostic. A specific repo can carry a **binding file** that maps these rules to that project's exact paths, schemas, data sources, live bugs, and load-bearing caveats. A code-verified binding for the **genuin-webapp** Next.js App Router monorepo ships at [references/codebase-map.md](references/codebase-map.md) - read it **only** when working in that repo. In any other project, ignore it and apply the generic rules; optionally create a `codebase-map.md`-style binding for that repo first (the genuin one is the template).

## Workflow (audit → fix → verify)

1. **Scope** - confirm the entity type(s)/route(s): article/blog, video, community/collection, brand/creator/org, product, profile, or a repo-wide sweep. Check for a project binding (above).
2. **Audit** - run `node .octo/skills/seo-geo-optimization/scripts/audit-seo.mjs [path]` (static source checks; generic by default, auto-loads repo-tuned checks when a known project is detected). Then walk the matching checklists in `references/seo-checklist.md` + `references/geo-checklist.md` and the per-entity reference.
3. **Report** - list findings prioritized by impact, each tagged `[READY]` (data exists, frontend-only) / `[BLOCKED]` (needs backend) / `[FIX]` (live bug) / `[DEFERRED]` / `[DROPPED]`.
4. **Fix** - apply `[READY]`/`[FIX]` items, honoring the **universal rules** and **missing-data rule** below (plus any project binding caveats).
5. **Verify** - prove the change works in the **served (JS-free) HTML**, not just the source. This skill never opens a PR or commits; it ends here, with evidence. Run `node .octo/skills/seo-geo-optimization/scripts/verify-live.mjs <url>` against a running server (or ask the user to start one / give you a URL), then escalate flags to the external validators. Full procedure: `references/verification.md`.

## Universal rules (apply to any project)

- **Request-scoped server fetch.** Don't share a mutable, auth-bearing HTTP client across concurrent server requests (token/tenant leak). Use a fresh request-scoped fetch for each SEO block.
- **`duration` must be ISO-8601** (`PT2M14S`), never `"2:14"` - the #1 structured-data validation error. Normalize regardless of the source type. (Dates: ISO-8601 too - `datePublished`/`dateModified`/`uploadDate`.)
- **`og:video` points at the real media file** (the `.mp4`), not the page URL; use **real pixel** width/height (not the aspect ratio); set `twitter:card=player` with fixed-pixel player size. A page-URL/aspect-ratio/`summary` combo means clips don't play in unfurls.
- **Canonical / `og:url` / sitemap `<loc>` / crawlable `<a href>` are always param-free.** Tracking params (utm/community/group/etc.) survive only for click-time analytics, never in indexable URLs. Self-reference the canonical per host (a whitelabel/alternate domain ranks for itself).
- **Complete `robots` meta:** `index, follow, max-image-preview:large, max-video-preview:-1, max-snippet:-1`. `max-snippet:-1` is what lets AI pull a full citable answer.
- **One `<h1>`, logical heading order, descriptive crawlable link text, `alt` + sized images.**
- **Structured data must validate** - omit an optional field rather than emit an empty string.
- **No cloaking** - the server-rendered body must match what users see; don't gate it from bots.

## Missing-data rule (never emit silent/empty metadata)

Before generating metadata or JSON-LD, **check the fetch actually returned the fields.** Three cases:

- **Entity not found / fetch failed** (empty `{}`, 404, throws) → do **not** emit empty tags or a hollow JSON-LD object. Skip structured data and report it: *"No metadata returned for `<entity>` - skipped JSON-LD; likely a soft-404."*
- **Entity exists but a required field is missing** (e.g. no description, duration, author, or thumbnail) → insert a **clearly-marked placeholder**, never a fabricated value, and **tell the user explicitly** which field was missing and what placeholder you used. Mark it in code with a greppable `TODO(seo): placeholder - field "<x>" missing` comment so it surfaces in the diff. Prefer omitting an optional field over an empty string.
- **Field is known-unavailable by design** (e.g. transcript / key-moments not exposed by any API) → render conditionally and tag `[BLOCKED]`/`[DEFERRED]`; do not placeholder these.

Always surface a one-line summary, e.g. *"Added 2 placeholders (duration, thumbnail) for `<entity>` - confirm or supply real values before merge."* Placeholders are a flag for the human, not a silent fill.

## What to implement, per entity type

| Entity | Structured data | Crawlable body | GEO extras |
|---|---|---|---|
| **Article / blog post** | `Article` / `BlogPosting` / `NewsArticle` (headline, description, image, author, datePublished, dateModified, publisher, mainEntityOfPage) | `<h1>` headline, full article prose, author, publish/updated date | `BreadcrumbList`, `FAQPage` / `HowTo` blocks, TOC, quotable Q&A chunks |
| **Video / clip** | `VideoObject` (name, description, thumbnailUrl, uploadDate, ISO-8601 duration, contentUrl=mp4, embedUrl, author, publisher, interactionStatistic) | title `<h1>`, visible description, author, view/like counts as text | transcript (if available), author attribution, key-moments `Clip` |
| **Community / collection** | `Collection` (name, description, url, sameAs) | name, description, counts, recent-item links | recent-item titles as crawlable links |
| **Brand / creator / org** | `Organization` or `Person` (name, url, description, sameAs) | name, bio, social links | entity consistency across pages |
| **Product** *(only if real commerce data exists)* | `Product` + `Offer` (name, image, description, price, availability, aggregateRating) | name, description, price, availability as text | review/rating markup |

Ready-to-paste snippets: `assets/json-ld-templates.md`. Reshape walls of prose into self-contained, quotable Q&A/fact chunks for GEO - **human-approved only**.

## Routing the work - load only what's relevant

| Task | Read |
|---|---|
| Generate a new SEO/GEO-ready page (blog, video, entity) from scratch | `references/page-generation.md` |
| Article / blog post: Article/BlogPosting JSON-LD, dates, FAQ/breadcrumb, content shaping | `references/blog-article-seo.md` |
| Video page: VideoObject JSON-LD, og:video/canonical/robots fixes, transcript slot | `references/video-seo.md` |
| Entity pages (community/collection, brand/creator/org, product): Collection/Organization/Person, sameAs | `references/entity-page-seo.md` |
| Canonical, robots meta, sitemap, thin-page noindex, soft-404 | `references/seo-checklist.md` |
| GEO/AIO: transcripts, author attribution, content shaping, entity consistency | `references/geo-checklist.md` |
| robots.txt bot policy (retrieval vs training bots) | `references/bot-policy.md` |
| Verifying a fix against served HTML + the standard MNC checks (Google/Meta/X/LinkedIn validators) | `references/verification.md` |
| Ready-to-paste JSON-LD snippets (all entity types) | `assets/json-ld-templates.md` |
| **genuin-webapp only:** exact paths, schemas, recorded decisions, project caveats | `references/codebase-map.md` |

## Priority order (general)

1. **Crawlable body + JSON-LD** for each entity type - for SSR/CMS pages just add JSON-LD; for client-rendered pages add a server-rendered SEO block (without it GEO is impossible).
2. **Canonicalize** all routes - param-free, self-referencing per host.
3. **Fix live metadata bugs** - `og:video`→media file, real duration, strip params, player card, correct article dates/author.
4. **Quick wins** - complete `robots` meta, robots.txt bot policy, thin-page `noindex`, block internal-search URLs.
5. **Later** - sitemaps (video/article), LCP/poster perf, transcript (when backend exposes it), key-moments `Clip`.

For genuin-webapp, the project-specific deliverable plan and out-of-scope decisions (ISR, `Product`/`Offer`, server-side 404s) are in `references/codebase-map.md`.
