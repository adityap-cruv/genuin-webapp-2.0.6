# CXR Host Macro Resolution — Design

**Date:** 2026-07-09
**Package:** `packages/contextual-reels`
**Status:** Approved — ready for implementation planning

## Problem

CXR runs inside an app webview and cannot resolve app / user / geo / privacy
context on its own. The host app resolves these values and passes them on the
loader `<script src>` query string. CXR must capture them and propagate them
downstream to the two consumers that need them:

1. **Ad URL macro substitution** — placeholder tokens in feed-provided ad URLs.
2. **Analytics events** — app / geo / identity / privacy context on every event.

Plus: use the loader-src `tagId` as the tag source of truth when present.

### Host macros (from the production tag)

Passed on the loader URL, all pre-resolved by the host:

```
tagId, appn, appv, appb, appsu, ifa, appidfa, appaid, appsi, appc,
country, loc, loclong, loclat, deviceid, dnt, gdpr, gdpr_consent,
us_privacy, w, h, ho, d
```

Example values:

```
appn=Handcent Next SMS messenger
appb=com.handcent.app.nextsms
appsu=https://play.google.com/store/apps/details?id=com.handcent.app.nextsms
ifa=15dfea86-a77a-47ac-af2e-8fec150c78b1
appsi=315697
appc=IAB3
country=USA
loc=New York
loclong=-73.95251
loclat=40.77391
dnt=0
gdpr=0
gdpr_consent=
us_privacy=1---
```

## Key decisions (locked)

- **Capture all params** on the loader URL generically — future-proof; new
  macros need no code change.
- **GenAd needs no separate macros object.** The ad URLs from the feed already
  carry macros (e.g. Triton's `site-url=[PAGE_URL]`); CXR resolves those tokens
  **before** handing the URL to `GenAd.init`, exactly as it does for
  `[PAGE_URL]` today. Host macros extend the existing `adUrlMacros.ts`
  substitution path — **not** `GenAd.init`.
- **Consumers:** ad URL substitution + analytics. (Feed API request is out of
  scope.)
- **Empty AND unresolved dropped.** An empty value (`appv=`) and an unresolved
  braced literal (`appv={appv}`) are both treated as absent — never forwarded.
- **Singleton capture** via the existing `window.__CXR_SCRIPT_PARAMS__` /
  `getScriptParam` channel — no loader change needed for capture.
- **tagId:** assume single widget per page. If the loader src carries `tagId`,
  it is the tag source of truth; otherwise fall back to `data-tag-id` on the div.

## Conflict analysis — no collisions

No host macro name collides with an existing loader param (`gen_variant`,
`purl`) or with any resolved value. The only semantic overlap is geo, resolved
below.

| Existing resolution | Host macro | Reconciliation |
| --- | --- | --- |
| `getScriptParam` bag (`gen_variant`, `purl`) | all macros | Additive; distinct names. No conflict. |
| `device_details.geoip` from `getIpInfo()` (IP lookup) | `country`, `loc`, `loclat`, `loclong` | **Keep separate.** Host geo goes to its own analytics fields; IP geoip untouched. |
| `[PAGE_URL]` via `resolvePageUrl()` | `appsu`, `appb` | No change to `[PAGE_URL]`; host macros only add new tokens. |
| `userId` (first-party id), `x-user-id` | `ifa`, `deviceid` | Distinct identifiers; keep both, no override. |

**Geo decision:** host geo (`country`/`loc`/`loclat`/`loclong`) and CXR's
IP-based `device_details.geoip` are kept **side by side** — host geo lands in
its own analytics fields, and CXR's `getIpInfo()` enrichment is untouched. No
override, no lost data, lowest risk. `getIpInfo()` still runs on every embed.

## Architecture

### 1. Capture — `src/hostMacros.ts` (new)

A module singleton, parsed once from `window.__CXR_SCRIPT_PARAMS__`:

```ts
export interface HostMacros { readonly [key: string]: string }

/** Captured once. Empty ('appv=') and unresolved braced literals
 *  ('appv={appv}') are dropped so downstream payloads stay clean. */
export const hostMacros: HostMacros;
export function getHostMacro(name: string): string | undefined;
```

- Reuses the loader's existing `__CXR_SCRIPT_PARAMS__` capture — no loader edit.
- Cleaning rule: drop empty and drop values matching `/^\{.*\}$/` (unresolved).

### 2. Ad URL macro substitution — extend `src/ads/adUrlMacros.ts`

The existing `resolveAdUrlMacros` / `resolveVideoAdMacros` gain a host-macro
substitution pass alongside the current `[PAGE_URL]` handling. Ad URLs from the
feed carry placeholder tokens; captured host values are substituted before the
URL reaches `GenAd.init`.

- `[PAGE_URL]` behavior unchanged.
- **DEFERRED — token map:** the exact placeholder tokens the feed's ad URLs use
  (e.g. `[IFA]` vs `{ifa}`, `[US_PRIVACY]` vs `[CCPA]`) must be confirmed with
  backend / ad-ops. Build the resolver generically now; lock the token↔macro map
  once confirmed. Values are URL-encoded on substitution (as `[PAGE_URL]` is).

### 3. Analytics — split by meaning across existing blocks

Events already send `{ event_details, device_details, user_details }`. Merge
host macros into the semantically correct block:

- `device_details`: `app_name`(appn), `app_version`(appv), `app_bundle`(appb),
  and host geo as its **own** fields (`app_country`, `app_loc`, `app_lat`,
  `app_long`) — **not** merged into the IP `geoip` block.
- `user_details`: `ifa`, `deviceid`, `appsi`.
- `event_details` consent sub-block: `gdpr`, `gdpr_consent`, `us_privacy`, `dnt`.
- **DEFERRED — field names:** exact target field names to be confirmed with
  analytics consumers. Build the merge seam generically now.

### 4. tagId source — `src/index.jsx`

Assume single widget per page: prefer the loader-src `tagId` when present, else
`data-tag-id` on the `.gen-ext` div. Existing multi-widget precedence is
unaffected in practice because the webview embed always mounts one widget.

### 5. App-bundle-as-page + Triton app params — addendum (2026-07-09)

In a webview there is no meaningful web "page" — the host app **is** the
context. Two separate consequences, corrected after checking the Triton
On-Demand / Advertising Specification (help.tritondigital.com):

**5a. Analytics `page` = `appb` (kept).** `sendEventLog` sets `page` to the
`appb` host macro when present, else the existing `windowLink`. This is our own
internal analytics field, so the app bundle is a fine page identifier in the
webview. Locked: raw `appb` string; overrides `windowLink` when present.

**5b. Ad-URL `[PAGE_URL]` stays the REAL page URL (corrected).** An earlier draft
routed `appb` into `[PAGE_URL]`, but Triton's spec is explicit: `site-url` is a
**web-only** parameter, and in-app requests must instead send dedicated app
parameters. Putting a bundle id into `site-url` is invalid. So
`resolvePageUrlForAds()` resolves to the real `resolvePageUrl()` (no appb
override) — `site-url=[PAGE_URL]` keeps getting the real page/referrer.

**5c. App identity flows through dedicated Triton app tokens.** Per the Triton
spec, in-app inventory uses `bundle-id` (required for apps), `store-id`, and
`store-url` (URL-encoded) *instead of* `site-url`. We add these to
`HOST_URL_MACRO_TOKENS` so that when the backend's ad-URL template carries the
tokens, CXR fills them from the loader macros:

- `[APP_BUNDLE]` → `appb`   (Triton `bundle-id`)
- `[STORE_ID]`   → `appsi`  (Triton `store-id`)
- `[STORE_URL]`  → `appsu`  (Triton `store-url`; auto URL-encoded by the resolver)

The static `REEL_AD_BREAK_TRITON_URL` stand-in in `feedTransforms.ts` is NOT
hand-edited — the backend owns the eventual ad-URL shape (it will add
`bundle-id=[APP_BUNDLE]&store-id=[STORE_ID]&store-url=[STORE_URL]` and drop
`site-url` for the app case). CXR's job is only to resolve tokens when present.

**DEFERRED / hand-off to backend + ad-ops:** the Triton (and Infy) ad-URL
templates need `bundle-id`/`store-id`/`store-url` tokens added for in-app, and
`site-url` dropped for the app case. `us_privacy`/`country_code` are still
hardcoded in the current Infy URL and also need tokenizing.

### 6. Interim Triton app-request rewrite — addendum (2026-07-09)

The backend will take time to expose app params in its Triton templates. As an
INTERIM measure, for an allowlisted set of tag ids CXR rewrites the Triton ad
URL at resolution time so in-app requests are spec-correct now.

- **Where:** in `resolveVideoAdMacros` / `resolveAdUrlMacros` (the existing
  resolution path every `videoAd` flows through before GenAd — including the
  backend-served ads-only `type:"ads"` reels, which do NOT use the static
  `REEL_AD_BREAK_TRITON_URL`). Gated per-entry on `platform === "tritondigital"`
  AND the entry belonging to an allowlisted tag id.
- **Allowlist (`TRITON_APP_PARAM_TAG_IDS`):**
  - `6a3915b692929ebec64d785e` — 320×100 ads-only (app)
  - `6a39163e92929ebec64d78ab` — 320×50 ads-only (app)
- **Rewrite (Triton URL, allowlisted tag only):**
  1. Remove the `site-url=…` param entirely (web-only per Triton spec).
  2. `dist=[PAGE_URL]` (or an already-substituted `dist=<page>`) → `dist=<appb>`.
  3. Append `bundle-id=<appb>&store-id=<appsi>&store-url=<encoded appsu>`.
  4. Leave `stid`, `ip`, `ua`, `ttag`, `type`, `delivery-method` untouched.
- **Absent macros:** if a macro is missing, its token/value is left as the
  default (unresolved) — consistent with `resolveHostMacroTokens`. (Locked.)
- **Threading:** `resolveVideoAdMacros`/`resolveAdUrlMacros` gain an optional
  `tagId`; `genAdSdk` passes `tagDetails.tag_id`.
- **Sunset:** remove this interim rewrite once the backend serves app params in
  its Triton template (the tokens in §5c then fill it directly).

### 7. Log `ad_url` on every ad event — addendum (2026-07-09)

For debugging/analysis, every ad event carries the resolved ad URL alongside the
existing `ad_source`/`platform`.

- **Value:** the FIRST (primary / highest-CPM) resolved video-ad URL, extracted
  from `resolvedVideoAd` (after macro substitution + Triton rewrite). Handles the
  string / object (`url` ?? `ads_url` ?? `vastUrl`) / array shapes.
- **Known limitation (documented):** the GenAd SDK's event `provider` is the ad
  TYPE (`video`/`banner`/`native`), not the waterfall vendor (Triton/Infy), and
  the SDK does not expose which vendor entry actually filled. So `ad_url` reflects
  the URL we SENT (primary entry), not necessarily the vendor that served. This
  is accepted.
- **Mechanism:** set once via `setBaseEventContext({ ad_url })` right after the
  video ad is resolved (before `GenAd.init`), so it rides on every event this
  slot emits — mirroring the existing `unmute_blocked` base-context pattern. No
  per-call-site edits.

## Testing

- `hostMacros` unit tests: empty + unresolved dropping, presence/absence.
- Extended ad URL resolver: token substitution + encoding + `[PAGE_URL]`
  regression.
- Analytics split: each macro lands in the correct block; absent macros omitted.
- No E2E required.

## Deferred items (need external confirmation before final wiring)

1. **Ad URL placeholder token map** — backend / ad-ops.
2. **Exact analytics field names** — analytics consumers.

Both seams are built generically so the code lands now and only a small
map / constant changes once confirmed.

## Out of scope

- Feed API request parameters.
- A separate `GenAd.init` macros object (GenAd consumes resolved ad URLs only).
- Overriding CXR's IP-based geoip or first-party `userId`.
