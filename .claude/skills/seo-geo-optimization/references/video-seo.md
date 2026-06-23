# Video page SEO/GEO

LLMs cannot watch video. When an AI engine answers a question about a clip, it can only cite
**text** it found on the page. Crawlable body text + `VideoObject` JSON-LD is how that text and
that machine-readable description get into the served HTML.

> **genuin-webapp binding:** exact route (`video/[slug]/page.tsx`), field-source table, schema
> field names, and the live bugs to fix are in `codebase-map.md`. The patterns below are generic;
> swap in your project's data source.

## 1. Make the body crawlable

Two cases:
- **SSR / SSG / CMS already renders the body** → skip to §2; just add the JSON-LD and fix metadata.
- **Client-rendered body** (SPA / client components) → add an **additive server-rendered SEO block**
  rendered into the initial HTML alongside the untouched client app. It does its own
  **request-scoped** server fetch (never a shared auth-bearing client singleton), and emits:
  1. Crawlable **body text**: an `<h1>` with the clip title, a visible `<p>` description, author
     name/link, and view/like counts as text.
  2. **`VideoObject` JSON-LD** (template in `assets/json-ld-templates.md`).
  3. A **conditional transcript section** (`if (transcript) { … }`) so it lights up with zero
     rework when the field becomes available.

Keep body content identical to the client experience (**no cloaking**).

## 2. VideoObject JSON-LD

> **Missing-data first** (SKILL.md rule): if the fetch returned no entity, skip the JSON-LD and
> report a likely soft-404. If the entity exists but a required field is missing (description,
> duration, thumbnail), insert a **labeled placeholder** with a `TODO(seo): placeholder — field
> "<x>" missing` comment and **tell the user** — never fabricate, and prefer omitting an optional
> field over an empty string.

Rules that prevent the common validation errors:
- `duration` **must** be ISO-8601 `PT#M#S` — normalize regardless of incoming number/string type.
- `contentUrl` / `embedUrl` use the **raw progressive media file (mp4)** — never an HLS/m3u8
  stream URL or the page URL.
- `thumbnailUrl` absolute, ~1280×720.
- `uploadDate` ISO-8601 (convert from epoch if needed).
- `author` = `Person` (or `Organization` for a brand/channel) built from the owner object.
- `interactionStatistic` from view/like counts — a real popularity signal you already have.
- `embedUrl` = the dedicated embed/player URL for the clip.

## 3. Fix live metadata bugs in the page `<head>`

Common bugs and the correct shape (replace page-URL / aspect-ratio / hardcoded values):

```html
<meta property="og:type" content="video.other" />
<meta property="og:video" content="https://media.example.com/.../clip.mp4" />        <!-- raw media file, NOT the page URL -->
<meta property="og:video:secure_url" content="https://media.example.com/.../clip.mp4" />
<meta property="og:video:type" content="video/mp4" />
<meta property="og:video:width" content="1080" />   <!-- real pixels, NOT the aspect ratio (9) -->
<meta property="og:video:height" content="1920" />  <!-- real pixels, NOT the aspect ratio (16) -->
<meta property="og:image" content="https://media.example.com/.../poster_1200x630.jpg" />
<meta name="twitter:card" content="player" />
<meta name="twitter:player" content="https://example.com/video/<id>/embed" />  <!-- embed page, fixed px width/height required -->
```

Never hardcode a fake duration (e.g. `PT60S` "assuming 60s") — emit the real normalized `duration`.

## 4. Canonical

Set `canonical` / `og:url` to the **param-free, per-host** URL of the clip. Strip tracking params
(`utm_*`, share/community/group ids) — those survive only for click-time analytics, never in
indexable URLs. Canonical, `og:url`, sitemap `<loc>`, and crawlable `<a href>` are **always** the
bare param-free URL, self-referencing per host (an alternate/whitelabel domain ranks for itself).

## 5. robots meta

Complete the directives (globally where possible, not just video):

```html
<meta name="robots" content="index, follow, max-image-preview:large, max-video-preview:-1, max-snippet:-1" />
```

`max-snippet:-1` (full citable snippet) + `max-image-preview:large` are what let AI engines pull a
full answer and a large card — highest effort-to-impact item in the playbook.

## 6. LCP poster [perf, separate]

The poster is usually the LCP element. Eager-load it, lazy-load everything below:
`<img src="poster.jpg" fetchpriority="high" width="1280" height="720" alt="…" />`.

## 7. Video sitemap

Crawlers often can't reach deep clips behind an infinite-scroll feed — the sitemap is how they're
found. `<loc>` = canonical param-free URL; include `video:thumbnail_loc`, `video:title`,
`video:description`, `video:content_loc` (mp4), `video:duration` (seconds),
`video:publication_date`. Shard at 50k URLs/file under a sitemap index. See `seo-checklist.md`.

## Deferred / blocked (typical)
- **On-page transcript** — highest-ROI GEO asset (it's the text AI quotes), but often not exposed
  by any API. Render the section conditionally now; when the backend exposes it, also revalidate
  the page.
- **Key moments / `Clip` `hasPart`** — needs a backend list of timestamped segments.
