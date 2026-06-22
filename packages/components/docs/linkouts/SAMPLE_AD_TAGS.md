# Sample Ad Tags (IMA + GAM)

Reference for the sample ad tags this repo uses to exercise both ad paths
during local development and QA:

- **Video ads** (VAST / VPAID / VMAP) → Google IMA HTML5 SDK, used by the
  in-process IMA path in `packages/ui/src/components/video-player/ads.ts`
  and surfaced through `<VideoPlayerV2 adUrl=...>` / `<FeedPlayer adUrl=...>`.
- **Display (banner) ads** → Google Ad Manager via the external GenAd SDK at
  `media.begenuin.com`, surfaced through `<FeedPlayer adConfig=...>` /
  `<FeedPlayer adTagObject=...>` and `<GenAdContainer>`.

Sources:

- [IMA HTML5 sample tags](https://developers.google.com/interactive-media-ads/docs/sdks/html5/client-side/tags)
- [Google Publisher Tag samples](https://developers.google.com/publisher-tag/samples) (the GAM side)

Caveats:

- Every IMA tag URL below ends with `correlator=` — Google's cache-buster.
  The IMA SDK fills it for you when the tag is passed via
  `AdsRequest.adTagUrl`; if you ever hit one of these URLs directly, append
  a fresh value (e.g. `Date.now()`) or you'll get cached responses.
- `cust_params=sample_ct=…` selects the *creative type* — don't strip it,
  that's what differentiates the IMA variants below.
- Real GAM sample units (e.g. `/22639388115/example/banner`) frequently
  return no-fill from `localhost` referers; the FeedPlayer ad QA story
  mocks `window.GenAd` to keep banner QA deterministic. See
  [Display (banner) ads — different code path](#display-banner-ads--different-code-path)
  below.

## Format legend

| Acronym | Meaning |
| --- | --- |
| **VAST** | Video Ad Serving Template — the standard XML schema for a single linear/non-linear video ad. |
| **VPAID** | Video Player Ad-Serving Interface Definition — interactive ads (JS executed inside the player). |
| **VMAP** | Video Multiple Ad Playlist — ad-rule wrapper for scheduling pre/mid/post-rolls and pods. |
| **SIMID** | Secure Interactive Media Interface Definition — VPAID's successor for interactive ads. |
| **OM SDK** | Open Measurement SDK — viewability/verification compliance. |
| **Bumper** | A short non-skippable ad (≤ 6 s) bracketing a real ad break. |
| **Ad pod** | A sequence of two or more ads played back-to-back inside a single break. |

---

## Single VAST linear ads

Simple inline linear creatives — the baseline path the linkout's video fallback exercises first.

- **Single Inline Linear** — basic inline linear ad, no skip, no redirect.
  `https://pubads.g.doubleclick.net/gampad/ads?iu=/21775744923/external/single_ad_samples&sz=640x480&cust_params=sample_ct%3Dlinear&ciu_szs=300x250%2C728x90&gdfp_req=1&output=vast&unviewed_position_start=1&env=vp&correlator=`
- **Single Skippable Inline** — skip button after ~5 s; exercises skip CTA + tracking.
  `https://pubads.g.doubleclick.net/gampad/ads?iu=/21775744923/external/single_preroll_skippable&sz=640x480&ciu_szs=300x250%2C728x90&gdfp_req=1&output=vast&unviewed_position_start=1&env=vp&correlator=`
- **Single Redirect Linear** — VAST wrapper → wrapper → inline; tests redirect resolution.
  `https://pubads.g.doubleclick.net/gampad/ads?iu=/21775744923/external/single_ad_samples&sz=640x480&cust_params=sample_ct%3Dredirectlinear&ciu_szs=300x250%2C728x90&gdfp_req=1&output=vast&unviewed_position_start=1&env=vp&correlator=`
- **Single Redirect Error** — wrapper points at a broken VAST; verifies error events fire.
  `https://pubads.g.doubleclick.net/gampad/ads?iu=/21775744923/external/single_ad_samples&sz=640x480&cust_params=sample_ct%3Dredirecterror&ciu_szs=300x250%2C728x90&gdfp_req=1&output=vast&unviewed_position_start=1&env=vp&correlator=`
- **Single Redirect Broken (no fallback)** — same as above with `nofb=1`; checks the "no fallback" path so the slot must surface the error itself.
  `https://pubads.g.doubleclick.net/gampad/ads?iu=/21775744923/external/single_ad_samples&sz=640x480&cust_params=sample_ct%3Dredirecterror&ciu_szs=300x250%2C728x90&gdfp_req=1&output=vast&unviewed_position_start=1&env=vp&nofb=1&correlator=`

## VPAID 2.0

Interactive video ad formats — useful when verifying the player loads/runs ad-side JS.

- **Single VPAID 2.0 Linear** — full-frame interactive video ad.
  `https://pubads.g.doubleclick.net/gampad/ads?iu=/21775744923/external/single_ad_samples&sz=640x480&cust_params=sample_ct%3Dlinearvpaid2js&ciu_szs=300x250%2C728x90&gdfp_req=1&output=vast&unviewed_position_start=1&env=vp&correlator=`
- **Single VPAID 2.0 Non-Linear** — interactive overlay on top of content.
  `https://pubads.g.doubleclick.net/gampad/ads?iu=/21775744923/external/single_ad_samples&sz=640x480&cust_params=sample_ct%3Dnonlinearvpaid2js&ciu_szs=728x90%2C300x250&gdfp_req=1&output=vast&unviewed_position_start=1&env=vp&correlator=`

## Non-linear and vertical formats

- **Single Non-linear Inline** — overlay ad (480×70), doesn't pause content.
  `https://pubads.g.doubleclick.net/gampad/ads?iu=/21775744923/external/nonlinear_ad_samples&sz=480x70&cust_params=sample_ct%3Dnonlinear&ciu_szs=300x250%2C728x90&gdfp_req=1&output=vast&unviewed_position_start=1&env=vp&correlator=`
- **Single Vertical Inline Linear** — 9:16 vertical creative (360×640); useful when the linkout sits in a reel/portrait slot.
  `https://pubads.g.doubleclick.net/gampad/ads?iu=/21775744923/external/single_vertical_ad_samples&sz=360x640&gdfp_req=1&output=vast&unviewed_position_start=1&env=vp&correlator=`

## VMAP — simple pre/mid/post-roll

Single-ad VMAP wrappers; the cheapest way to verify cuepoint scheduling.

- **VMAP Session Ad Rule Pre-roll** — server-side ad rule, fires a pre-roll on session start.
  `https://pubads.g.doubleclick.net/gampad/ads?iu=/21775744923/external/vmap_ad_samples&sz=640x480&cust_params=sar%3Da0f2&ciu_szs=300x250&ad_rule=1&gdfp_req=1&output=vmap&unviewed_position_start=1&env=vp&correlator=`
- **VMAP Pre-roll** — one pre-roll, no mid/post.
  `https://pubads.g.doubleclick.net/gampad/ads?iu=/21775744923/external/vmap_ad_samples&sz=640x480&cust_params=sample_ar%3Dpreonly&ciu_szs=300x250%2C728x90&gdfp_req=1&ad_rule=1&output=vmap&unviewed_position_start=1&env=vp&correlator=`
- **VMAP Pre-roll + Bumper** — pre-roll bracketed by a bumper.
  `https://pubads.g.doubleclick.net/gampad/ads?iu=/21775744923/external/vmap_ad_samples&sz=640x480&cust_params=sample_ar%3Dpreonlybumper&ciu_szs=300x250&gdfp_req=1&ad_rule=1&output=vmap&unviewed_position_start=1&env=vp&correlator=`
- **VMAP Post-roll** — post-roll only.
  `https://pubads.g.doubleclick.net/gampad/ads?iu=/21775744923/external/vmap_ad_samples&sz=640x480&cust_params=sample_ar%3Dpostonly&ciu_szs=300x250&gdfp_req=1&ad_rule=1&output=vmap&unviewed_position_start=1&env=vp&correlator=`
- **VMAP Post-roll + Bumper** — post-roll bracketed by a bumper.
  `https://pubads.g.doubleclick.net/gampad/ads?iu=/21775744923/external/vmap_ad_samples&sz=640x480&cust_params=sample_ar%3Dpostonlybumper&ciu_szs=300x250&gdfp_req=1&ad_rule=1&output=vmap&unviewed_position_start=1&env=vp&correlator=`
- **VMAP Mid-roll ad pod, 2 skippable ads** — exercises pod sequencing + skip.
  `https://pubads.g.doubleclick.net/gampad/ads?iu=/21775744923/external/vmap_skip_ad_samples&sz=640x480&cust_params=sample_ar%3Dmidskiponly&ciu_szs=300x250&gdfp_req=1&ad_rule=1&output=vmap&unviewed_position_start=1&env=vp&cmsid=496&vid=short_onecue&correlator=`

## VMAP — multi-placement and ad-pod scenarios

The heavier integration tests — combining pre/mid/post with single ads and ad pods.

- **VMAP — Pre-, Mid-, and Post-rolls (single ads)** — one ad at each break.
  `https://pubads.g.doubleclick.net/gampad/ads?iu=/21775744923/external/vmap_ad_samples&sz=640x480&cust_params=sample_ar%3Dpremidpost&ciu_szs=300x250&gdfp_req=1&ad_rule=1&output=vmap&unviewed_position_start=1&env=vp&cmsid=496&vid=short_onecue&correlator=`
- **VMAP — Pre single / Mid standard pod ×3 / Post single** — standard ad pod in the middle break.
  `https://pubads.g.doubleclick.net/gampad/ads?iu=/21775744923/external/vmap_ad_samples&sz=640x480&cust_params=sample_ar%3Dpremidpostpod&ciu_szs=300x250&gdfp_req=1&ad_rule=1&output=vmap&unviewed_position_start=1&env=vp&cmsid=496&vid=short_onecue&correlator=`
- **VMAP — Pre single / Mid optimized pod ×3 / Post single** — pod with Google's optimized fill algorithm.
  `https://pubads.g.doubleclick.net/gampad/ads?iu=/21775744923/external/vmap_ad_samples&sz=640x480&cust_params=sample_ar%3Dpremidpostoptimizedpod&ciu_szs=300x250&gdfp_req=1&ad_rule=1&output=vmap&unviewed_position_start=1&env=vp&cmsid=496&vid=short_onecue&correlator=`
- **VMAP — Pre / Mid pod / Post, bumpers around every break** — standard pod variant with bumpers.
  `https://pubads.g.doubleclick.net/gampad/ads?iu=/21775744923/external/vmap_ad_samples&sz=640x480&cust_params=sample_ar%3Dpremidpostpodbumper&ciu_szs=300x250&gdfp_req=1&ad_rule=1&output=vmap&unviewed_position_start=1&env=vp&cmsid=496&vid=short_onecue&correlator=`
- **VMAP — Pre / Mid optimized pod / Post, bumpers around every break** — optimized pod variant with bumpers.
  `https://pubads.g.doubleclick.net/gampad/ads?iu=/21775744923/external/vmap_ad_samples&sz=640x480&cust_params=sample_ar%3Dpremidpostoptimizedpodbumper&ciu_szs=300x250&gdfp_req=1&ad_rule=1&output=vmap&unviewed_position_start=1&env=vp&cmsid=496&vid=short_onecue&correlator=`
- **VMAP — Pre / Mid standard pods (5 ads every 10 s) / Post** — stress test for frequent cuepoints + back-to-back pods.
  `https://pubads.g.doubleclick.net/gampad/ads?iu=/21775744923/external/vmap_ad_samples&sz=640x480&cust_params=sample_ar%3Dpremidpostlongpod&ciu_szs=300x250&gdfp_req=1&ad_rule=1&output=vmap&unviewed_position_start=1&env=vp&cmsid=496&vid=short_onecue&correlator=`

## Advanced formats

- **SIMID Survey Pre-roll** — interactive survey ad (VPAID's successor).
  `https://pubads.g.doubleclick.net/gampad/ads?iu=/21775744923/external/simid&description_url=https%3A%2F%2Fdevelopers.google.com%2Finteractive-media-ads&sz=640x480&gdfp_req=1&output=vast&unviewed_position_start=1&env=vp&correlator=`
- **OM SDK Sample Pre-roll** — Open Measurement viewability compliance.
  `https://pubads.g.doubleclick.net/gampad/ads?iu=/21775744923/external/omid_ad_samples&env=vp&gdfp_req=1&output=vast&sz=640x480&description_url=http%3A%2F%2Ftest_site.com%2Fhomepage&vpmute=0&vpa=0&vad_format=linear&url=http%3A%2F%2Ftest_site.com&vpos=preroll&unviewed_position_start=1&correlator=`

---

## Multi-aspect-ratio QA — beyond the sample tags

The tags above are great for *behavioral* QA (VAST resolution, skip, pods,
errors, VPAID, viewability). They're **not** sufficient for testing how the
player renders ads of arbitrary proportions — Google's sample inventory only
ships **4:3** (the default `sz=640x480` creatives) and **9:16** (the single
Vertical Inline Linear tag). Changing `sz=` on the other tags doesn't conjure
matching creatives; you'll get no-fill or the same 4:3 MP4 letterboxed into
your slot.

For UX testing the player chrome (controls / skip button / click-through CTA
/ overlay alignment) against ads of every shape — 9:16, 3:4, 1:1, 4:3, 16:9 —
roll your own VAST. VAST is just XML, the IMA SDK doesn't care where it came
from, and `<MediaFile>` is just a URL.

### Wired in Storybook

The five video-ad fixtures (XML + MP4) and the 9:16 content clip live
alongside the **FeedPlayer** in the `@genuin/components` Storybook, served at
the Storybook root via `staticDirs`. **Dev-only, never shipped to production**
(Storybook isn't part of any prod build). They sit under `packages/components`
because that's where the only consumer (the FeedPlayer ad QA story) lives.

```text
packages/components/.storybook/
├── main.ts                          # staticDirs: ['./qa-fixtures']
└── qa-fixtures/
    ├── ad-tags/
    │   ├── vast-16x9.xml            # 1920×1080
    │   ├── vast-9x16.xml            # 1080×1920
    │   ├── vast-1x1.xml             # 1080×1080
    │   ├── vast-3x4.xml             # 1080×1440
    │   └── vast-4x3.xml             # 1440×1080
    └── videos/
        ├── vast-16x9.mp4            # ffmpeg testsrc, 15s, ~300 KB
        ├── vast-9x16.mp4
        ├── vast-1x1.mp4
        ├── vast-3x4.mp4
        ├── vast-4x3.mp4
        └── content-9x16.mp4         # 720×1280 portrait content clip, ~2 MB
```

Companion harness story:
[`packages/components/src/molecules/feed-player/feed-player-ad-qa.stories.tsx`](../../../../packages/components/src/molecules/feed-player/feed-player-ad-qa.stories.tsx)
— mounts the real `<PlayerProvider>` → `<FeedPlayer>` → `<ControlLayer>` so
Genuin chrome paints alongside IMA's ad chrome. Toggle between **Video (IMA
VAST)** and **Display (GAM 300×250)** ads from the toolbar; pick an aspect
for video ads; drag the player corner to resize. Story title in Storybook:
**Molecules / FeedPlayer / Ad QA Harness → MultiAspectAdPlayback**.

> An earlier iteration also kept a bare-V2 (`<VideoPlayerV2>` with no
> FeedPlayer chrome) version of this harness under
> `packages/ui/src/components/video-player/video-player-ad-qa.stories.tsx`.
> That story was deleted once the FeedPlayer story landed because it tested
> the same IMA paths at strictly less fidelity. If you ever need an
> isolated-V2 surface again (e.g. when changing `registry.ts` / `ads.ts`
> internals), restoring it from git history is straightforward — the
> fixtures themselves are still served at the Storybook root.

Point the player at an **absolute** URL built from `window.location.origin`:

```ts
<VideoPlayerV2
  adUrl={`${window.location.origin}/ad-tags/vast-${aspect}.xml?v=${Date.now()}`}
  …
/>
```

> **Why absolute and not root-relative.** The IMA SDK runs inside its own
> iframe at `imasdk.googleapis.com`, so a root-relative URL resolves
> against the SDK's origin and 404s. Anchor on `window.location.origin`
> (the Storybook preview iframe's origin, which is also where `staticDirs`
> mounts the fixtures).

The `?v=<timestamp>` query string is what re-triggers V2's `apply` diff on
`adUrl` and forces a fresh ad request when the same aspect is replayed.

### One-time browser unblock

The Storybook page is **HTTP** (`http://localhost:6006`), so the IMA SDK
iframe loads over HTTP too, which makes Chrome's **Private Network Access**
policy block any cross-origin fetch from the SDK's iframe into the
`loopback` address space (your localhost static dir). The block is decided
client-side; server headers alone can't override it.

You have to flip this off in Chrome **once per machine**:

1. Visit `chrome://flags` and search for **"Local Network Access Checks"**.
2. Set it to **Disabled**.
3. Restart Chrome.

Reload the harness — the IMA pre-roll plays and follows the player as you
resize it.

> Note: on older Chrome the equivalent flag was
> `#block-insecure-private-network-requests`; on slightly newer Chrome it
> was `private-network-access-respect-preflight-results`. The current name
> ("Local Network Access Checks") is what worked at the time of writing.
> Whichever your Chrome surfaces, the goal is the same — turn the
> enforcement off for the dev profile.
>
> An earlier version of this setup also ran Storybook over HTTPS with a
> self-signed dev cert and a Vite middleware that answered the PNA
> preflight with `Access-Control-Allow-Private-Network: true`. That layer
> was redundant once the Chrome flag was off (Chrome stops checking PNA
> entirely, so the headers go unread), and was removed for simplicity. If
> Chrome ever drops the flag and starts enforcing PNA unconditionally, the
> reinstatement path is straightforward — restore the `adQaPnaHeaders`
> Vite plugin and the `--https --ssl-cert/--ssl-key` Storybook flags from
> git history.

Things that *don't* work and aren't worth retrying:

- **Skipping the Chrome flag and trying to fix it server-side instead.**
  Either HTTPS Storybook + `Access-Control-Allow-Private-Network: true` on
  the fixture responses ought to satisfy PNA on paper, but in current
  Chrome (124+) the permission gate still fires *after* the header check
  and the request fails with "Permission was denied for this request to
  access the `loopback` address space." Servers alone can't currently
  unblock it; the dev flag is the working escape hatch.
- **`data:` URL with the VAST inlined.** Chrome rejects the long
  cross-iframe `data:application/xml;…` URL with `net::ERR_INVALID_URL`
  inside the IMA SDK's fetch context, regardless of how the XML is
  encoded. Even if it loaded, the `<MediaFile>` MP4 still triggers PNA on
  the SDK's video-element load.
- **CORS-only fixes.** PNA isn't CORS — `Access-Control-Allow-Origin: *`
  alone doesn't unblock a loopback request.

**Why test patterns and not real footage:** `ffmpeg testsrc` produces an
SMPTE-style pattern that fills the frame to every edge with a moving counter.
That makes player-chrome bugs visible at a glance — a skip button drifting
over a 9:16 letterbox column, or the click-through CTA stranded outside a 1:1
fill, jumps out because the pattern's edge isn't where the player thinks it
is. Patterns are also tiny (~300 KB at 15 s × 1080p) and have no licensing
concerns. 15 s gives IMA enough headroom to render its skip countdown (with
`skipoffset="00:00:02"` in the VAST tag) without the creative ending before
the badge fully animates in.

### Regenerating the videos

If you change resolutions or want a longer clip:

```bash
cd packages/components/.storybook/qa-fixtures/videos
ffmpeg -y -f lavfi -i "testsrc=duration=15:size=1920x1080:rate=24" -c:v libx264 -pix_fmt yuv420p -movflags +faststart vast-16x9.mp4
ffmpeg -y -f lavfi -i "testsrc=duration=15:size=1080x1920:rate=24" -c:v libx264 -pix_fmt yuv420p -movflags +faststart vast-9x16.mp4
ffmpeg -y -f lavfi -i "testsrc=duration=15:size=1080x1080:rate=24" -c:v libx264 -pix_fmt yuv420p -movflags +faststart vast-1x1.mp4
ffmpeg -y -f lavfi -i "testsrc=duration=15:size=1080x1440:rate=24" -c:v libx264 -pix_fmt yuv420p -movflags +faststart vast-3x4.mp4
ffmpeg -y -f lavfi -i "testsrc=duration=15:size=1440x1080:rate=24" -c:v libx264 -pix_fmt yuv420p -movflags +faststart vast-4x3.mp4
```

`-pix_fmt yuv420p` is non-negotiable — Safari/iOS reject `yuv422p` (the
testsrc default). `-movflags +faststart` puts the MOOV atom at the head of
the file so playback can begin before the full download finishes (matters
for the seek-during-skip path).

### Hot-linking public MP4s if you don't want to commit anything

If you'd rather not commit the MP4s and don't need full aspect coverage,
public sample sources that pass both the CORS-open + range-request checks
the IMA SDK requires:

| Source | URL pattern | Aspect coverage | Duration |
| --- | --- | --- | --- |
| W3C (Blender's Sintel trailer) | `https://media.w3.org/2010/05/sintel/trailer.mp4` | **16:9 only** | ~52 s |
| test-videos.co.uk (Big Buck Bunny) | `https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/{360,720,1080}/Big_Buck_Bunny_{res}_10s_{1,2,5,10,20,30}MB.mp4` | **16:9 only** | 10 s |
| IAB Tech Lab VAST 4.x reference tags | [github.com/InteractiveAdvertisingBureau/vast-sample-tags](https://github.com/InteractiveAdvertisingBureau/vast-sample-tags) | Mostly 16:9 | varies |

> **2026 caveat:** Google's `commondatastorage.googleapis.com/gtv-videos-bucket/sample/` bucket (Big Buck Bunny, ForBiggerEscapes, etc.) — historically the go-to public sample — started returning **403** for direct MP4 hot-links. Don't use it.

Stable public CDN coverage at **3:4 / 1:1 / 9:16** is patchy in practice;
that's why the committed test-pattern fixtures are the recommended default.
For real footage at any aspect, **download from Pexels / Mixkit / Pixabay
(all CC0-friendly) and drop the MP4 into `videos/`** — don't hot-link their
CDNs, the URLs can rotate.

### One nuance worth remembering

VAST advertises a creative size on `<MediaFile width="…" height="…">`, but the
**IMA SDK doesn't force the player container's aspect** — your player chooses
how to fit the ad video inside whatever size the slot currently has. So this
harness lets you test *two layers at once*:

- The **ad container** the SDK injects (usually fills its parent and
  letterboxes the MP4).
- Your **player chrome** (controls, skip button, click-through CTA, overlay)
  over that container, at whatever player size you've resized to.

Resize the player wrapper *independently* of the ad's natural aspect — that's
where control-alignment bugs usually surface (skip button overlapping a 9:16
letterbox column, click CTA stranded outside a 1:1 fill, etc.).

---

## Banner overlay (stripe) vs. full-frame display — IAB size taxonomy

These two surfaces look similar but are different IAB unit families:

| Surface | Production code path | IAB sizes the FeedPlayer QA story covers |
| --- | --- | --- |
| **Banner overlay (stripe over playing video)** | `<DynamicLinkouts content={{ kind: "banner-ad" }}>` → `<LinkoutItem bannerAd>` → `<GenAdContainer>` (positioned, not full-bleed). Production overlays the bottom region while the content video keeps playing. | **300×50, 320×50, 320×100, 468×60** (the first three match `feature/GEN-7990/dynamic-linkout-component`; 468×60 Full Banner added for wider frames) |
| **Display banner (full-frame takeover)** | `<FeedPlayer adConfig / adTagObject>` → `<GenAdContainer>` (full-bleed, unmounts V2). The content video is replaced for the duration of the ad. | **300×250, 300×600, 336×280, 160×600** |

**Why there's no "tall stripe" in IAB.** The IAB Display & Mobile Creative
Guidelines define standard heights at 50, 60, 90, 100, then jump straight to
250+. There is no spec-compliant *stripe* unit between 100 and 250 px. So
for a 640 px player frame whose bottom 20 % is ~128 px:

- The largest fitting **stripe** is 320×100 (~78 % of the available band,
  ~28 px of unused space below)
- The largest fitting **full-display** unit is 336×280 (much taller than
  the band — stops being a stripe, becomes a partial takeover)

There's no IAB unit that fills the 100–250 px gap exactly. Common practical
choices when the design calls for a taller bottom band:

- Stick with the largest stripe (320×100) and accept the unused margin
- Move to a 300×250 *as* an overlay (technically off-spec for stripe
  placement, but some publishers ship this)
- Use a brand-custom creative size (no IAB cert)

The FeedPlayer ad QA story's banner-overlay toolbar runs
`pickBannerOverlaySize(frameW, frameH)` to auto-select the largest fitting
stripe; the picker result is marked with a ✓ in the toolbar. Reviewers can
override to any size to verify clipping and the "exceeds frame" warning.

---

## Display banner size guard (IAB compliance)

`<GenAdContainer>` enforces a slot-size minimum *before* requesting a banner
ad. If the container is smaller than the smallest size requested in
`config.banner` (e.g. 300×250 for the standard medium rectangle), the
container:

1. Logs `[GenAd] slot WxH smaller than required MWxMH; suppressing ad request.`
2. Calls `onAdFillFailed` instead of `window.GenAd.init`. The ad server is
   never hit, no impression risk.
3. Subscribes a `ResizeObserver` to the container. When the slot grows back
   to spec, the container retries the init path automatically. If a
   running banner's slot shrinks below spec mid-play, the container fires
   `GenAd.destroy(instanceId)` + `onAdFillFailed` so the off-spec creative
   is torn down rather than left clipped on screen.

Why this lives in the container and not in the SDK: the GenAd SDK at
`media.begenuin.com` (and the `googletag` it dispatches to) doesn't enforce
this — once it renders an ad, the impression beacon fires regardless of
slot size. The only place the publisher controls whether the request even
happens is *before* calling `window.GenAd.init`.

The guard applies to **banner** waterfalls only. Video and native creatives
are size-responsive and skip the check.

[`gen-ad.utils.ts` `getMinBannerSize`](../../packages/components/src/molecules/feed-player/gen-ad-container/gen-ad.utils.ts)
computes the smallest `[w, h]` across `config.banner` (handling both single
and array configs).

---

## Display (banner) ads — different code path

Everything above goes through Genuin's IMA-direct video-ad path
(`packages/ui/src/components/video-player/ads.ts`). **Display ads do not** —
they go through `FeedPlayer` → `<GenAdContainer>` → external
[`gen_ad.min.js`](https://media.begenuin.com/ad-sdk/in-feed/gen_ad.min.js) SDK
→ Google Publisher Tag (`googletag`). The container is a `<div>` overlay
positioned at `absolute inset-0 z-20` over the player frame; the SDK paints
the 300×250 GAM creative inside that container.

[`mapBannerAdItem` in gen-ad.utils.ts](../../packages/components/src/molecules/feed-player/gen-ad-container/gen-ad.utils.ts)
hardcodes `size: [300, 250]` — IAB medium rectangle. The GAM ad-unit `tag_id`
you supply must accept that size or the slot fills empty.

### Why the story mocks `window.GenAd`

We exercised the real path once — `tag_id: "/22639388115/example/banner"`,
`platform: "gam"` — and verified the SDK loads, `googletag` loads, the slot is
defined, GAM is requested. Then GAM returned **no fill** from
`localhost:6005` (logged as `[GenAd] stage fail (provider=banner): All banner
items failed`). That's an ad-serving condition (referer / domain rules), not
a code problem.

To keep QA deterministic, the story installs a `window.GenAd` stub in a
`useLayoutEffect` *before* `<GenAdContainer>`'s init poll runs. The stub
matches the real SDK surface (`init`, `destroy`, `mute`), paints a 300×250
SVG creative into the container, and fires the lifecycle callbacks the
container forwards to FeedPlayer (`onStageStart` → `onStageSuccess` →
`events.onAdStarted` → `onAdImpression` → `onAdRendered`). Clicking the
banner fires `events.onAdClicked` + `onAdCompleted("banner")` so the slot
unmounts and `<VideoPlayerV2>` re-mounts, mirroring how a real banner
dismissal flows back through the container.

What this verifies:

- ✅ `adTagObject` → `GenAdConfig` mapping ([gen-ad.utils.ts](../../packages/components/src/molecules/feed-player/gen-ad-container/gen-ad.utils.ts))
- ✅ FeedPlayer's `resolvedAdConfig` → `<GenAdContainer>` mount + V2 unmount
- ✅ Container's z-20 overlay sits over the player frame correctly
- ✅ Lifecycle callbacks: `onAdInit`, `onAdFilled`, `onAdCompleted`,
  `onAdFillFailed` (when waterfall returns nothing)

What it does *not* verify:

- ❌ The real `gen_ad.min.js` SDK's internal logic
- ❌ Actual GAM creative rendering (paint, click-through redirect, etc.)
- ❌ Real `googletag` slot define / refresh / refresh on resize
- ❌ Native ads + video ads through the GenAd SDK path (we only stubbed
  the banner branch; video and native fall through to `onWaterfallFail`)

When you want to exercise the real serving path: replace the mock with your
own real GAM `tag_id` (which fills from your dev/staging domain) by deleting
the `useLayoutEffect` install call and updating `QA_DISPLAY_TAG`.

---

## Quick QA matrix

| Scenario you want to exercise | Use this tag |
| --- | --- |
| Happy path — does the linkout's video-ad fallback render at all? | Single Inline Linear |
| Skip button + skip tracking | Single Skippable Inline |
| VAST redirect chain (wrapper resolution) | Single Redirect Linear |
| Error reporting (broken VAST, IMA fallback **on**) | Single Redirect Error |
| Error reporting (broken VAST, IMA fallback **off**) | Single Redirect Broken |
| VPAID linear (interactive JS in-player) | Single VPAID 2.0 Linear |
| VPAID non-linear (interactive overlay) | Single VPAID 2.0 Non-Linear |
| Non-linear overlay on top of content | Single Non-linear Inline |
| Vertical / 9:16 / reel-shaped slot | Single Vertical Inline Linear |
| Pre-roll only | VMAP Pre-roll |
| Pre-roll bookended by bumpers | VMAP Pre-roll + Bumper |
| Post-roll only | VMAP Post-roll |
| Mid-roll ad pod (and skip handling) | VMAP Mid-roll ad pod, 2 skippable ads |
| Pre + mid + post sequencing | VMAP — Pre-, Mid-, Post-rolls |
| Pre + mid pod + post sequencing | VMAP — Mid standard pod ×3 |
| Optimized-pod fill behavior | VMAP — Mid optimized pod ×3 |
| Stress test (frequent mid-roll pods) | VMAP — 5 ads every 10 s |
| Interactive survey format | SIMID Survey Pre-roll |
| Viewability verification | OM SDK Sample Pre-roll |
