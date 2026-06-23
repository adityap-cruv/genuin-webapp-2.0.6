# Codebase map — exact paths, schemas, decisions

Verified against the `genuin-webapp` monorepo. Paths are relative to repo root. This file is the
**project-specific binding** for the generic patterns in `SKILL.md`. In another repo, replace this
file with that project's equivalents; the generic rules in SKILL.md still apply.

## Load-bearing caveats (genuin-webapp — violating these ships bugs)
These are the project-specific traps behind the generic rules in `SKILL.md`:
- **Dedicated request-scoped `axios.get` per server fetch.** Never reuse the `axiosInstance`
  singleton — its auth token / `x-brand-id` are set by runtime interceptors and shared across
  concurrent server requests (token/brand leak). Mirror `fetchMetadata`'s direct `axios.get`.
- **Match the typo: `descritptionText`** — that is the real schema field name. Don't "fix" it.
- **Preserve raw `media_url` (mp4)** for `contentUrl` / `og:video`. `parseFeed` collapses media to
  `source: media_url_m3u8 ?? media_url` — the m3u8, not the mp4 those tags need.
- **Normalize `duration` to ISO-8601** (`PT2M14S`) — typed as number in the feed schema, string in
  the video schema. Never `"2:14"`. #1 structured-data validation error.
- **Canonical / `og:url` / sitemap `<loc>` / crawlable `<a>` = always param-free.**
- **No cloaking** — server-rendered body must match what users see.

## Legend (tag every finding)
- **[READY]** — data exists server-side today; pure frontend work.
- **[BLOCKED]** — needs a backend/API change first.
- **[FIX]** — corrects a bug live in current code.
- **[DEFERRED]** — conscious decision to do later (do not commit to first delivery).
- **[DROPPED]** — no data source exists; out of scope until one does.

## Route pages (App Router)
All under `apps/webapp/src/app/(site)/(new)/`:

| Route | page.tsx | Body component | Renders |
|---|---|---|---|
| Video | `video/[slug]/page.tsx` | `<VideoPage>` → `<FeedView>` | `"use client"`, React Query `useFeed` |
| Community | `community/[slug]/page.tsx` | `<CommunityClientPage>` | client |
| Brand | `brand/[nickname]/page.tsx` | `<ProfileDetails>` | client |
| Group/loop | `group/[slug]/page.tsx` | client | client |
| Profile | `profile/[nickname]/page.tsx` | client | `robots: noindex,nofollow` already set |

Embed layout `(embed)/embed/(pages)/layout.tsx` — `noindex,nofollow` (correct; keep).

Only the **video** route declares `export const dynamic = 'force-dynamic'` / `export const revalidate = 0`.

## Key helpers & libs
- **`fetchMetadata`** → `apps/webapp/src/lib/api/meta-data.ts`. Reads `headers()` for host →
  `getConfig(host)` for whitelabel domain/subdomain, then a **direct `axios.get`** to
  `${NEXT_PUBLIC_API_URL}/api/v3/web/meta_data?type=…`. **Mirror this pattern** for SEO-block
  server fetches — direct axios, request-scoped, never the shared `axiosInstance` singleton.
  Metadata `type`: 1=profile, 2=community, 3=loop, 4=video, 5=home, 6=brand.
- **`getOgUrl(path, domain?, subdomain?)`** → `apps/webapp/src/lib/utils.ts` (~L745). Already
  computes the correct **per-host, param-free** base. Pass straight into `alternates.canonical`.
- **`checkWhiteLabelEnabled(integrations)`** → `apps/webapp/src/lib/utils.ts` (~L711). Returns
  first allowed whitelabel domain or null.
- **`getConfig(host)`** → `apps/webapp/src/middleware.ts` (~L201). Host → `{domain}|{subdomain}`.
- **`PATH_NAME`** → `apps/webapp/src/lib/utils/constants/path.ts`. `.video(id)`, `.community(id)`,
  `.brand(id)`, `.loop(id)`, `.profile(id)`.

## Schemas & parser (packages/components)
- **`PostDetailsSchema`** → `packages/components/src/react-query/api/feed/schema.ts` (~L131).
  Video sub-schema (~L29) has **`descritptionText: z.string().nullish()`** — the misspelling is
  the real field; match it. `duration` is typed differently across feed (number) vs video
  (string) schemas → normalize defensively.
- **`parseFeed`** → `packages/components/src/react-query/api/feed/parser.ts` (~L33). Maps
  `item.video.description_text` → `descritptionText`. **Collapses media:
  `source: media_url_m3u8 ?? media_url`** (prefers HLS, discards mp4). For `contentUrl`/`og:video`
  you must preserve the **raw `media_url`**, not reuse `source`.
- **`CommunityDetailsSchema`** → `packages/components/src/react-query/api/community/details/schema.ts`
  (~L102). Has `description`, `no_of_members`, `no_of_loops`, `no_of_videos`, `no_of_views`,
  `social_links` (twitter/linkedin/insta/discord/reddit/web → `sameAs`).

## Available video fields (from `/goservices/feed/video` via `PostDetailsSchema`)
| JSON-LD field | Source | Note |
|---|---|---|
| `name`/`description` | `video.descritptionText` | typo is intentional |
| `thumbnailUrl` | `video.thumbnail` / `thumbnailM` | absolute, ~1280×720 |
| `uploadDate` | `video.createdAt` (epoch) | → ISO-8601 |
| `duration` | `video.duration` | normalize → `PT#M#S` |
| `interactionStatistic` | `video.viewCount` (+ `sparkCount`) | already available |
| `contentUrl` | **raw `media_url` (mp4)** | not `source` |
| `author` | `owner.name ?? owner.userName`, `owner.shareUrl`, `owner.brand` | `Person`, or `Organization` if `owner.brand` |
| transcript | — | **[BLOCKED]** not returned by any API; only `share_transcript_enabled` flag exists |

## robots.txt / sitemap — current state
**No `robots.ts`/`sitemap.ts` in the app dir.** Both are proxied by `apps/webapp/src/middleware.ts`
(PATH_HANDLERS, ~L24-67) to the Go API:
- `/robots.txt` → `x-robots-api-url`
- `/sitemap/index.xml`, `/sitemap/{static,community,group,user,video}/index.xml` → respective headers
- Rewrites to `${NEXT_PUBLIC_GO_API_URL}/sitemap/{brand_id}/{host}/{path}`.

⇒ **robots.txt bot policy and video sitemap content are produced by the backend.** Frontend-only
changes can't fix them; coordinate with backend (see `bot-policy.md`, `seo-checklist.md §sitemap`).
Confirm current `/robots.txt` output before recommending edits.

## Live bugs to fix (video route `generateMetadata`, ~L93-115)
- `og:video` / `og:video:secure_url` / `twitter:player` = **`shareLink`** (page URL + tracking
  params), not the mp4. → use raw `media_url`. **[FIX]**
- `video_duration: 'PT60S'` hardcoded ("assuming 60s"). → real `duration`. **[FIX]**
- `og:video:width: '9'`, `og:video:height: '16'` = **aspect ratio**, not pixels (should be e.g.
  1080×1920). **[FIX]**
- `robots: 'index, follow, max-video-preview:-1'` — missing `max-image-preview:large`,
  `max-snippet:-1`. **[FIX]**
- `shareLink` (~L45-60) re-appends `community`/`group`/`utm_source`/`share_image_id` params and
  there is **no `alternates.canonical` on any route** → param-variant signal dilution. **[FIX]**

## Decisions on record (don't relitigate)
- **Keep `force-dynamic`** on video — `fetchMetadata` reads `headers()` (whitelabel host), which
  blocks ISR anyway; force-dynamic suits the SEO block (fresh body + JSON-LD per crawl). **ISR = out of scope.**
- **Self-referencing canonical per host, params always stripped** (whitelabel domains rank for themselves).
- **Soft-404s [DEFERRED]** — deleted/invalid pages currently return HTTP 200 (`ErrorState`).
  Known deindexing risk; if a template's rankings drop, look here first.
- **`Product`/`Offer` [DROPPED]** — no product/offer data in any profile schema.
- **Don't RSC-convert client pages** — they depend on `useBaseContext`, React Query,
  `useDeviceDetection`, auth modals; months of work, high regression risk, no incremental SEO
  benefit over the additive SEO block.
