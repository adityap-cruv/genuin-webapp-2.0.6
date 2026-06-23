# Article / blog post SEO/GEO

Articles are the easiest entity to win at GEO: the body **is** the citable text. The job is to make
that text crawlable, mark it up so engines know it's an article (with a real author and dates), and
shape it into chunks an AI can lift cleanly. Works the same whether the post comes from MDX, a
headless CMS, WordPress, or a database.

## 1. Crawlable body (usually already done)

Most blog stacks (SSG/SSR/CMS) already render the article body server-side — verify it
(`verification.md`) rather than assume. If the body is client-rendered, add the server SEO block
(`video-seo.md §1`). The body needs: one `<h1>` headline, the full prose, a visible author byline,
and a visible publish/updated date.

## 2. Article JSON-LD

Pick the type: **`BlogPosting`** for blog posts, **`NewsArticle`** for news, **`Article`** as the
generic fallback. Template in `assets/json-ld-templates.md`.

Required/high-value fields (omit an optional field rather than emit an empty string):
- `headline` — ≤110 chars, matches the visible `<h1>`.
- `description` — the meta description / dek.
- `image` — absolute URL, ideally 1200×630+ (and/or 16:9, 4:3, 1:1 variants).
- `author` — a real `Person` (or `Organization`) with `name` and ideally `url`. **Not** a bare
  string if you can avoid it; a named author is a strong GEO trust signal.
- `datePublished` **and** `dateModified` — **ISO-8601** (`2026-06-22T09:00:00-05:00`). Keeping
  `dateModified` accurate matters for both ranking and AI freshness.
- `publisher` — `Organization` with `logo` (`ImageObject`), stated **identically** site-wide.
- `mainEntityOfPage` — the canonical article URL.

## 3. Metadata & head

- Unique `<title>` and `meta description` per post (not templated-identical).
- `canonical` = the **param-free** post URL (strip `utm_*`, `?ref=`, session ids). Self-reference
  per host.
- Open Graph: `og:type=article`, `og:title`, `og:description`, `og:image` (absolute, ~1200×630),
  plus `article:published_time`, `article:modified_time`, `article:author`, `article:section`,
  `article:tag`.
- Twitter: `twitter:card=summary_large_image`.
- Complete robots meta: `index, follow, max-image-preview:large, max-snippet:-1` (`max-snippet:-1`
  lets AI quote the full answer).

## 4. GEO content shaping [human-approved, never silent]

This is where articles beat everything else for AI citation:
- **Lead with the answer.** Put a direct, self-contained answer near the top; AI lifts the first
  clear, quotable statement.
- **Q&A / FAQ blocks** — add a visible FAQ section and mark it up with `FAQPage` JSON-LD. Each
  question+answer is a ready-made citable chunk.
- **`HowTo`** for step-by-step posts; **`BreadcrumbList`** for the post's position in the site.
- **Self-contained chunks** — each section should make sense out of context; define terms inline;
  prefer fact-rich sentences over fluff.
- **Table of contents** with anchor links — gives engines (and key-moment-style answers) structure.
- These edits touch user-facing copy → **propose them, let the human accept/reject.** Never rewrite
  brand voice silently.

## 5. Sitemap & freshness

- Include every post in a sitemap with accurate `<lastmod>` = `dateModified`.
- On publish/update, ping/revalidate so the new `dateModified` propagates.
- Tag/category index pages: keep them crawlable but `noindex` thin ones (see `seo-checklist.md`).

## 6. Generating a new post

When creating a post from scratch, bake §1–§4 in from the start — body text, `BlogPosting` JSON-LD
with real author + dates, canonical, OG/Twitter, and at least one FAQ or breadcrumb block. See
`page-generation.md` for the end-to-end flow.
