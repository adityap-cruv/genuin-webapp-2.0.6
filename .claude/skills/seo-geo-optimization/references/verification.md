# Verifying a fix against the served HTML + the standard MNC checks

This is the **last step** of the skill. Audit/fix is not done until the change is proven in the
**HTML the server actually ships** — the same bytes Googlebot, the Meta/Instagram/WhatsApp unfurl
crawler, the X/LinkedIn card bots, and AI retrieval bots read **before any JavaScript runs**.
This skill **stops here**: it does not open a PR, commit, or deploy. Produce a verdict + evidence
and hand the diff back to the user.

> The audit script (`scripts/audit-seo.mjs`) reads the **source**. Verification reads the **output**.
> A source that looks right can still ship empty tags (failed fetch, hydration-only body, wrong
> env). Always verify the output.

## Step 1 — get a running server

Read **production-shaped** HTML, because crawlers do. Prefer a real build over the dev server.

genuin-webapp:
```bash
npm run build            # apps/webapp — catches build/SSR errors a dev server hides
npm run start            # serves on http://localhost:4000
# dev fallback (faster, but less production-faithful): npm run dev → http://localhost:4005
```

Other projects: use that project's production build + start.

**If you cannot run it** (missing env/secrets, the host is bot-walled, no local toolchain) →
**ask the user** to start it (or point you at a staging/prod URL) and give you a concrete entity
URL per type you changed (e.g. one blog post, one video, one community, one brand). Do not guess
that it works — verify or report "unverified, blocked on a running URL."

## Step 2 — read the raw, JS-free HTML (what bots see)

The non-negotiable test: **disable JS / view raw source and confirm the content is there.** If a
fact only appears after hydration, crawlers and LLMs never see it.

```bash
# fetch as a bot — no JS execution, just the server's first response
node .claude/skills/seo-geo-optimization/scripts/verify-live.mjs http://localhost:4000/<entity-path>
# or by hand:
curl -sL -A "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)" <url> | less
```

The script asserts, on the **initial HTML only**, the checks below and prints a pass/fail per item.
Treat its output as the first pass; escalate any flagged item to the matching external validator.

## Step 3 — the checks (and which MNC enforces each)

These mirror what the big platforms publicly validate. Map every fix to the relevant rows.

### A. Crawlable / citable body — Google indexing + GEO/AIO
- [ ] The entity's **title, description, author, and counts appear as text in the raw HTML**
      (not just in `<head>`, not only post-hydration). This is the whole point of the server SEO
      block and the precondition for any AI citation.
- [ ] Exactly **one `<h1>`**, sensible heading order.
- [ ] Server HTML **matches what users see** — no cloaking, no bot-only body.

### B. Structured data — Google Rich Results + Schema.org (the JSON-LD)
- [ ] Each `application/ld+json` block is **valid JSON** and parses.
- [ ] Correct `@context` (`https://schema.org`) and `@type` (`VideoObject` / `Collection` /
      `Organization` / `Person`) with all required fields populated (no empty strings, no hollow
      objects — omit an optional field instead).
- [ ] **`duration` is ISO-8601** (`PT2M14S`), never `"2:14"` — the #1 rich-results error.
- [ ] `VideoObject.contentUrl` is the **real mp4**, `thumbnailUrl`/`uploadDate` present.
- [ ] **External validators** (user runs these on a public URL): Google **Rich Results Test**
      (`search.google.com/test/rich-results`) and the **Schema Markup Validator**
      (`validator.schema.org`). Expect zero errors; warnings are acceptable if intentional.

### C. Open Graph — Meta (Facebook / **Instagram** / WhatsApp / Messenger) + Slack/Discord unfurls
- [ ] `og:title`, `og:description`, `og:image` (≈1200×630, absolute URL), `og:type` present.
- [ ] **`og:url` is canonical and param-free** (no `utm`/`community`/`group`/`share_image_id`).
- [ ] For video: **`og:video` points at the real media file** (the `.mp4`), `og:video:type`
      set, and **`og:video:width`/`height` are real pixels** (e.g. `1080`/`1920`), not the aspect
      ratio (`9`/`16`). A page-URL + aspect-ratio combo means the clip won't play in an unfurl.
- [ ] **External validator** (user, public URL): Meta **Sharing Debugger**
      (`developers.facebook.com/tools/debug`) — this is what Instagram/WhatsApp/Messenger previews
      resolve through. "Scrape Again" after a fix; confirm no missing-property warnings.

### D. Twitter/X Cards — X
- [ ] When `twitter:player` is set, **`twitter:card` is `player`** (not `summary`) with a
      fixed-pixel `twitter:player:width`/`height`; otherwise `summary_large_image`.
- [ ] **External validator** (user, public URL): X **Card Validator** / the
      `cards-dev.twitter.com/validator` flow.

### E. Canonical, robots & indexability — Google
- [ ] `<link rel="canonical">` present, **param-free, self-referencing per host** (a whitelabel
      domain canonicalizes to itself, not to the main domain).
- [ ] **`robots` meta complete:** `index, follow, max-image-preview:large,
      max-video-preview:-1, max-snippet:-1`. `max-snippet:-1` is what lets AI pull a full citable
      answer. Confirm intentional `noindex,nofollow` (e.g. `profile/[nickname]`, embed layout) is
      still intact.
- [ ] `<title>` and `meta description` are present, non-empty, and **unique** to the entity.
- [ ] No accidental `noindex`, no soft-404 (a deleted entity should not serve a 200 with a hollow
      shell — see `seo-checklist.md`).
- [ ] **External validators** (user, public URL): Google **URL Inspection** (Search Console) shows
      the rendered HTML + "URL is on Google / can be indexed"; **Lighthouse SEO** audit ≈100.

### F. Bot access — precondition for everything
- [ ] The bot-UA fetch in Step 2 **returns 200 with the body**, not a WAF/login/JS challenge.
      A host that blocks Googlebot + AI bots is invisible before a single tag is read (a Kansas
      City whitelabel hard-blocked a test fetch). See `bot-policy.md`. Verify on **every** partner
      domain, not just the main one.

### G. LinkedIn (optional, same OG tags)
- [ ] **Post Inspector** (`www.linkedin.com/post-inspector`) on a public URL if LinkedIn sharing
      matters; it reads the same Open Graph tags as §C.

## Step 4 — report a verdict

For each fix, state **pass / fail / placeholder-pending** with the evidence (the raw-HTML snippet,
the script line, or the validator result). Call out explicitly:
- anything that needs a **public URL** the user must run through an external validator (Rich
  Results / Sharing Debugger / Card Validator), since `localhost` isn't reachable by those tools;
- any **placeholder** still in place (`grep TODO(seo)`) that must be replaced with a real value;
- any check left **unverified** because the server/host couldn't be reached.

Then stop — hand the verified diff back to the user to commit and PR. This skill does not do that step.
