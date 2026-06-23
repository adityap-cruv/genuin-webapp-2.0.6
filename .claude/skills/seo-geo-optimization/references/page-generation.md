# Generating a new SEO/GEO-ready page

Use this when the task is to **create** a page (blog post, video page, entity page) rather than
audit an existing one. The principle: bake crawlable body text + valid JSON-LD + correct metadata
in **from the first commit** — never ship a client-only shell and "add SEO later." It still ends at
**Verify**; this skill does not open a PR.

## Flow

1. **Pick the entity type** → use the matrix in `SKILL.md` and read the matching reference:
   - article/blog → `blog-article-seo.md`
   - video → `video-seo.md`
   - community/brand/creator/product → `entity-page-seo.md`
2. **Check for a project binding.** If a `codebase-map.md`-style binding exists (genuin-webapp ships
   one), follow its exact paths/helpers/schemas and load-bearing caveats. Otherwise, follow the
   project's existing conventions for routing, data fetching, and metadata (e.g. Next.js
   `generateMetadata`, Astro frontmatter, Hugo/Jekyll front matter, WordPress template).
3. **Decide rendering.** Prefer SSR/SSG so the body is crawlable by default. Only fall back to the
   additive server SEO block (`video-seo.md §1`) if the page must stay client-rendered.
4. **Wire the data, honoring the universal rules** (`SKILL.md`):
   - request-scoped server fetch (no shared auth-bearing client),
   - normalize `duration` and all dates to ISO-8601,
   - param-free self-referencing canonical,
   - real media file + pixel dims for `og:video`, `twitter:card=player` for video,
   - complete robots meta.
5. **Emit the body + JSON-LD** from `assets/json-ld-templates.md`, applying the **missing-data rule**
   — placeholders are labeled with `TODO(seo)` and reported, never fabricated.
6. **Generate copy responsibly.** If you draft user-facing prose (headline, description, FAQ),
   present it as a **proposal** for the human to accept/edit — don't silently invent brand claims,
   stats, prices, or quotes. Mark any assumed fact for review.
7. **Verify** the rendered output (`verification.md`): run the server (or ask the user to), fetch as
   a bot, confirm the body text + JSON-LD + canonical + OG/Twitter + robots are all in the served
   HTML, then hand the diff back.

## Checklist for the generated page

- [ ] One `<h1>`, logical heading order, full body text present in served HTML.
- [ ] Valid JSON-LD for the entity type (parses, ISO-8601 dates/duration, no empty strings).
- [ ] Unique `<title>` + meta description; `canonical` param-free, self-referencing.
- [ ] Open Graph + Twitter tags correct for the type (article vs video card).
- [ ] Complete robots meta (`max-snippet:-1`).
- [ ] Images have `alt` + width/height; LCP image eager, rest lazy.
- [ ] Added to the relevant sitemap (article/video) with accurate `lastmod`.
- [ ] Any drafted copy or assumed fact flagged for human review.
- [ ] Verified against the served HTML before handing off.
