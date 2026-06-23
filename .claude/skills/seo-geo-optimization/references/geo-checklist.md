# GEO / AIO checklist (get cited inside AI answers)

GEO competes to be a **source the AI trusts and names** — ChatGPT, Claude, Gemini, Perplexity —
often with zero click. Reward signals overlap with SEO but add: structure, entity trust, and fact
density. The AI can only cite **text in the server HTML**; it never runs the client app or watches
the video.

## The levers (highest impact first)

1. **Crawlable body text** — the foundation. Without server-rendered body text there is *nothing*
   for an engine to quote. For articles/blogs this is usually already done; for client-rendered
   video/entity pages it means the additive server SEO block (`video-seo.md §1`). Everything below
   sits on this.

2. **Structured data / JSON-LD** — the biggest lever available purely in code. `Article`/
   `BlogPosting` (posts), `VideoObject` (video), `Collection` (community), `Organization`/`Person`
   (brand), `FAQPage`/`HowTo`/`BreadcrumbList` (everywhere). Lets engines recognize the entity and
   attribute quotes. Templates in `assets/json-ld-templates.md`.

3. **Author attribution** — a real named `author` (`Person`/`Organization` with a URL) lets AI say
   "according to X…". Usually zero marginal cost — same fetch/frontmatter.

4. **Transcript (video)** — the single biggest video-GEO unlock (it's literally the text AI quotes),
   but often not exposed by any API. Render the section conditionally so it lights up with zero
   rework when the field lands; then revalidate the page.

5. **Content shaping** — lead with the answer, FAQ/Q&A blocks, self-contained chunks (see below).

6. **Entity consistency** — state the org name + one-line description **identically** across pages
   (footer, JSON-LD `publisher`, About). Inconsistent descriptions weaken the trust signal.

## Content shaping for GEO [human-approved, never silent]

Reshape walls of prose into **self-contained, quotable chunks** an AI can lift cleanly:
- Clear question → answer blocks; definitions; fact-rich statements.
- Each chunk should make sense out of context (AI lifts fragments).
- Lead with the direct answer near the top of the page.
- Back FAQ sections with `FAQPage` JSON-LD; step-by-steps with `HowTo`.
- **These edits touch user-facing copy → always propose as a suggestion for human accept/reject.**
  Never silently rewrite brand voice.

## publisher / Organization consistency snippet

Every `Article`/`VideoObject` should carry the **same** `publisher`:
```json
"publisher": {
  "@type": "Organization",
  "name": "<Your Org>",
  "logo": { "@type": "ImageObject", "url": "https://media.example.com/.../logo.png" }
}
```

## Forward-looking / low priority
- **`speakable`** — niche, low priority.
- **Key moments / `Clip`** — needs a backend list of timestamped segments (`video-seo.md`).

## Boundaries (set expectations)
The skill owns the on-site technical/structural surface only. It does **not**: do off-site GEO
(Reddit/forum/review mentions — that's marketing/PR), do keyword research or content strategy,
guarantee citations, silently re-architect rendering, or rewrite brand voice without review.
