# robots.txt bot policy

If AI citation is a goal, **retrieval bots should stay open** — blocking them is the most common
self-inflicted GEO wound. Decide separately about *training* bots (blocking training while keeping
retrieval open is legitimate and costs nothing in AI visibility).

> **Where robots.txt lives varies.** It may be a static file, a framework route (`robots.ts`), or
> proxied from a backend. genuin-webapp proxies `/robots.txt` from a Go API via `middleware.ts`, so
> editing it is a **backend change** — a frontend `robots.ts` won't win (see `codebase-map.md`).
> Always fetch the current `/robots.txt` output first.

## Recommended policy
- **Allow** retrieval/search bots (these drive GEO visibility):
  `OAI-SearchBot`, `ChatGPT-User`, `Claude-SearchBot`, `Claude-User`, `PerplexityBot`.
- **Allow** `Googlebot`, and explicitly `Googlebot-Video` and `Googlebot-Image`. (Also `Bingbot`.)
- **Decide** on training bots: `GPTBot`, `ClaudeBot`, `Google-Extended`, `CCBot` — block or allow
  as a policy choice; blocking these does not hurt AI *retrieval* visibility.
- **Confirm** robots.txt does **not** disallow your media/CDN host — thumbnails, images, and mp4s
  must be indexable, or you get zero previews / key moments.
- **Disallow** internal-search URLs (`/search?q=`, `/explore?q=`) to avoid infinite thin URLs.

## Per-property crawler access — verify on every host
Each domain (and each whitelabel/alternate domain) is a separate property. A domain behind a
WAF/bot wall that also blocks Googlebot + AI bots is **invisible before any tag is read**
(genuin-webapp hit this on a whitelabel domain that hard-blocked a test fetch). For every property:
- [ ] Confirm Googlebot / Googlebot-Video reach the page **and** the media file (image/mp4/m3u8).
- [ ] Confirm the AI retrieval bots above are not WAF-blocked.
- [ ] A blocked generic fetch isn't proof Googlebot is blocked — but it's a strong signal to verify.
