---
name: web-sdk-video-embed-skill
description: MANDATORY — whenever generated code must display video ANYWHERE (clip, reel, feed, carousel, contextual feed), mount a Genuin Web SDK placement/embed (a container div + window.genuin.init) instead of any plain video component. Do NOT use for non-video UI, images, or audio-only surfaces.
mandatory: true
---

# Genuin Web SDK Video Embed (MUST USE)

> **MANDATORY SKILL.** This is a user-mandated must-use skill. Any time generated output needs
> to show video in any form, you MUST follow this skill. There is no exception for content video.

**When to use:** any "put a video / clip / reel / feed / carousel here" requirement in generated
code — including "show videos about `<topic>`" (contextual feed), "show these specific videos:
`<ids>`", or wiring a `hierarchical-tree` `video` Slot (resolved props `placementId` / `styleId` /
`apiKey` / `elementId`) to real data.

**Do NOT use for:** non-video UI, images (use an `image`/`Image`), or audio-only surfaces.

You are generating the wiring that renders **video** on a page produced by the vibe-coding platform.
**The single non-negotiable rule:** when a generated page needs video *anywhere*, you mount a Genuin
Web SDK **placement** (default) or **embed** — never a plain video component.

Video on a Genuin page is **SDK-served**, not a raw `<video>`. The SDK (`packages/web-sdk`) renders a
full feed/carousel/expand experience (player, comments, reactions, share, ads, analytics) into a
container element you provide, via `window.genuin.init(config)`. A bare `<video>` or `<VideoPlayer>`
gets none of that and is wrong for this product.

Canonical working reference: `packages/genai/src/components/Chat/CarousalEmbed.tsx`. Config contract:
`packages/web-sdk/src/type.ts` (`ConfigByUser`) and `packages/web-sdk/src/index.ts` (the
`window.genuin` global).

---

## The one hard rule

When a generated page/component needs to display video, you **MUST NOT** emit any of these for
content video:

- `VideoPlayer`, `VideoPlayerV2`, `VideoPoster` (`@genuin/ui` — `packages/ui/src/components/video-player/*`)
- `VideoPage` (`packages/components/src/page/video/video.tsx`)
- `PlayerSwiper`, `Player` (`packages/components/src/organisms/player-swiper/*`)
- a raw `<video>` element, or any `<iframe>` pointed at a video URL

Instead emit: **a container `<div>` + a guarded `window.genuin.init(...)` call** targeting it. These
plain components are internal building blocks the SDK uses; a generated page never reaches for them
directly.

> Exception: none for content video. If the prompt asks for a non-Genuin video (e.g. a raw MP4 the
> user supplied with no Genuin content id), surface the **failure path** (below) — do not silently
> fall back to `<video>`.

---

## When to activate

Activate whenever generated output needs to show video in any form:

- "Put a video / clip / reel here", "show a feed of videos", "add a carousel of clips".
- "Show videos about `<topic>`" / "a contextual feed for this page".
- "Show these specific videos: `<ids>`".
- A `hierarchical-tree` `video` Slot being wired to real data (resolved props are
  `placementId`/`styleId`/`apiKey`/`elementId` — the **same** contract; see Cross-reference).

Do **not** activate for: non-video UI, images (use an `image`/`Image`), or audio-only surfaces.

---

## Decision tree — which source path

Everything goes through `window.genuin.init(config)`. Pick the source path first, then the container
API, then layer content/theme/auth options.

### 1. Source identity (pick exactly one)

| Path | Required fields | Use when |
|---|---|---|
| **Placement** (default) | `placement_id` + `style_id` + `api_key` | Default for generated pages. One placement renders in a chosen style; content can be **dynamic** (specific videos or contextual). Matches `CarousalEmbed`. |
| **Embed** | `embed_id` + `api_key` | A specific, pre-built feed the publisher already configured. Fixed — no style choice. |
| **Live** | `live: { api_key, embed_id?/placement_id?+style_id?, live_customization_data? }` | Live/streamed embeds with runtime customization. Rare in generated pages. |

**Precedence (from `genuin-sdk.ts`): placement wins over embed.** If both a placement
(`placement_id`+`style_id`) and an `embed_id` are resolvable — via data-attributes or config — the SDK
uses the placement and drops the embed id. Never supply both for one container.

### 2. Container API (pick one)

- **Programmatic** (default for React): a `<div id>` + `init({ container_id: <that id>, ... })`.
- **Declarative** (good for static/multi): put `data-*` attributes on the div(s) and call `init({})` —
  the SDK discovers every matching element. Use for multiple embeds on one page.
- **Hybrid** (common in plain HTML): source (`placement_id`/`style_id`/`api_key`) in `init()`, content
  + display (`data-video-ids`, `data-theme`, `data-page-context`, …) as **data-attributes on the div**,
  and `init()` with **no `container_id`** — the SDK auto-discovers the single div and merges both. See
  R8. For a single embed, `container_id` is optional; for multiple, give each div distinct data-attrs
  and call `init({})`.

### 3. Content selection (layer onto either path)

| Want | Field(s) |
|---|---|
| Whatever the placement/embed is configured to show | _(nothing — omit content fields)_ |
| A specific, ordered set of videos | `video_ids` (CSV string) or `data-video-ids`; `initial_video_ids` for the first batch |
| Start on a particular video | `start_video_slug` |
| A contextual / personalized feed | `contextual_params` (see reference) or `data-page-context`/`data-lat`/`data-long`/`data-url` |
| Override sponsorship | `sponsorship_id: string[]` |

---

## `window.genuin` global typing

Every React recipe needs this declaration once per file (lift verbatim — it mirrors
`packages/web-sdk/src/index.ts` and `CarousalEmbed.tsx`):

```ts
interface GenuinInternalEvent {
  payload?: { videoId?: string; [key: string]: unknown };
  [key: string]: unknown;
}
type GenuinEventListener = (event: GenuinInternalEvent) => void;

declare global {
  interface Window {
    genuin?: {
      init: (config: Record<string, unknown>) => void;
      update?: (config: Record<string, unknown>) => Promise<void> | void;
      expand?: (id: string) => void;
      collapse?: (id: string) => void;
      destroy?: () => void;
      on?: (eventType: string, listener: (payload: unknown) => void) => () => void;
      off?: (eventType: string, listener: (payload: unknown) => void) => void;
      onInternal?: (eventName: string, listener: GenuinEventListener) => (() => void) | void;
      offInternal?: (eventName: string, listener: GenuinEventListener) => void;
    };
    onGenuinReady?: (genuin: NonNullable<Window['genuin']>) => void;
  }
}
```

The SDK script must already be loaded on the page. Guard every init on it (`!window.genuin` → bail),
or wire `window.onGenuinReady`. Generated components receive an `isSdkLoaded` signal from the
platform; honor it.

---

## Lifecycle hard-rules

Lifted from the working `CarousalEmbed` and mandatory in every React recipe:

1. **Init exactly once.** Guard with a `useRef(false)` (`isInitializedRef`); set it true after `init`.
   Re-running `init` on the same container double-mounts.
2. **Guard on SDK availability.** Bail if `!isSdkLoaded && !window.genuin`.
3. **Do NOT call `destroy()` on unmount.** The SDK owns its own React-root teardown. Manual cleanup on
   dependency changes causes a cascade-destroy. Let React unmount the container naturally. `destroy()`
   is only for tearing down *all* embeds globally (e.g. a full page teardown), never per-card.
4. **Unique container id per embed.** Multiple embeds on one page need distinct ids. Derive a stable id
   (e.g. `gen-sdk-${slotName}`); do not collide.
5. **Reserve space.** Give the container an explicit width/height (or min-height) so layout doesn't
   collapse while the SDK loads.
6. **Use `useLayoutEffect` for the init** so the container exists before the SDK measures it.

---

## Environment variables

The platform exposes SDK ids via env (same names as the `genai` app / `CarousalEmbed`). Never
hardcode ids:

- `VITE_GEN_SDK_PLACEMENT_ID` — default placement id
- `VITE_GEN_SDK_STYLE_ID` — default style id
- `VITE_API_KEY` — API key

If the target app uses different env names, match that app's convention — but always read from env,
never inline a literal id/key.

---

## Recipes

Each recipe is a complete, copy-paste React component. Prepend the global typing block once per file.

### R1 — Placement carousel (DEFAULT)

The go-to. Use this unless the prompt specifically needs another path.

```tsx
import { useLayoutEffect, useRef } from 'react';

export function GenuinVideo({ isSdkLoaded }: { isSdkLoaded: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInitializedRef = useRef(false);
  const sdkId = useRef(`gen-sdk-${Math.random().toString(36).slice(2)}`).current;

  useLayoutEffect(() => {
    if (isInitializedRef.current || !containerRef.current) return;
    if (!isSdkLoaded && !window.genuin) return;

    window.genuin?.init({
      container_id: containerRef.current.id,
      placement_id: import.meta.env.VITE_GEN_SDK_PLACEMENT_ID,
      style_id: import.meta.env.VITE_GEN_SDK_STYLE_ID,
      api_key: import.meta.env.VITE_API_KEY,
    });
    isInitializedRef.current = true;
    // No cleanup — the SDK owns React-root teardown (see lifecycle rule 3).
  }, [isSdkLoaded, sdkId]);

  return (
    <div
      ref={containerRef}
      id={sdkId}
      className="gen-sdk-class"
      style={{ width: '100%', height: 300 }}
    />
  );
}
```

### R2 — Specific videos (ordered set)

When the prompt names exact videos. `video_ids` is a **CSV string**, not an array.

```tsx
// inside the same init guard as R1:
window.genuin?.init({
  container_id: containerRef.current.id,
  placement_id: import.meta.env.VITE_GEN_SDK_PLACEMENT_ID,
  style_id: import.meta.env.VITE_GEN_SDK_STYLE_ID,
  api_key: import.meta.env.VITE_API_KEY,
  video_ids: videoIds.join(','),     // e.g. ['abc','def'] -> 'abc,def'
  start_video_slug: videoIds[0],     // optional: open on the first
});
```

Declarative equivalent: put `data-video-ids="abc,def"` on the div and call `init({})`.

### R3 — Contextual / personalized feed

When the page wants videos relevant to its topic/location rather than a fixed list.

```tsx
window.genuin?.init({
  container_id: containerRef.current.id,
  placement_id: import.meta.env.VITE_GEN_SDK_PLACEMENT_ID,
  style_id: import.meta.env.VITE_GEN_SDK_STYLE_ID,
  api_key: import.meta.env.VITE_API_KEY,
  contextual_params: {
    page_context: 'lakers-game-recap',
    url: window.location.href,
    geo: { lat: 37.7749, long: -122.4194 },
  },
});
```

### R4 — Fixed embed by id

Only when the prompt references a concrete pre-built embed. No `style_id`.

```tsx
window.genuin?.init({
  container_id: containerRef.current.id,
  embed_id: import.meta.env.VITE_GEN_SDK_EMBED_ID,
  api_key: import.meta.env.VITE_API_KEY,
});
```

### R5 — Multiple embeds on one page (declarative)

For N video surfaces, render N divs with data-attributes and call `init({})` **once**. Each id must be
unique. Placement attrs (`data-placement-id`+`data-style-id`) take precedence over `data-embed-id`.

```tsx
useLayoutEffect(() => {
  if (isInitializedRef.current) return;
  if (!isSdkLoaded && !window.genuin) return;
  window.genuin?.init({}); // discovers every data-* container on the page
  isInitializedRef.current = true;
}, [isSdkLoaded]);

// render:
<div
  id="gen-sdk-1"
  className="gen-sdk-class"
  data-placement-id={import.meta.env.VITE_GEN_SDK_PLACEMENT_ID}
  data-style-id={import.meta.env.VITE_GEN_SDK_STYLE_ID}
  data-api-key={import.meta.env.VITE_API_KEY}
  data-page-context="sports"
  style={{ width: '100%', height: 500 }}
/>
<div
  id="gen-sdk-2"
  className="gen-sdk-class"
  data-embed-id="6824304055db06e58e479de4"
  data-api-key={import.meta.env.VITE_API_KEY}
  data-video-ids="abc,def"
  style={{ width: '100%', height: 300 }}
/>
```

### R6 — Nested inside a host web-sdk instance

When the generated surface itself renders *inside* a parent Genuin web-sdk (the platform signals this,
e.g. `view === 'web-sdk'`). Pass `parent_instance_id`, disable shadow DOM, mark the div, and forward
clicks to the parent. Mirror `CarousalEmbed` exactly.

```tsx
window.genuin?.init({
  container_id: containerRef.current.id,
  placement_id: import.meta.env.VITE_GEN_SDK_PLACEMENT_ID,
  style_id: import.meta.env.VITE_GEN_SDK_STYLE_ID,
  api_key: import.meta.env.VITE_API_KEY,
  parent_instance_id: parentWebSdkInstanceId, // from platform context
  useShadowDOM: false,                        // avoid nested shadow-DOM conflicts
});

// forward a clicked video up to the parent feed:
const unsubscribe = window.genuin?.onInternal?.('onVideoClicked', (event) => {
  const videoId = event?.payload?.videoId;
  if (!videoId) return;
  window.genuin?.update?.({
    container_id: parentWebSdkContainerId,
    start_video_slug: videoId,
    action: 'play',
    source_instance_id: sourceInstanceId,
  });
});
// call unsubscribe() in the effect cleanup (this listener IS yours to remove —
// the no-destroy rule is about init/teardown of the embed, not event listeners)

// host div also needs: data-web-sdk-nested="true"
```

### R7 — Theme, expand/collapse, and events

Layer display + control + observability onto any recipe.

```tsx
window.genuin?.init({
  container_id: containerRef.current.id,
  placement_id: import.meta.env.VITE_GEN_SDK_PLACEMENT_ID,
  style_id: import.meta.env.VITE_GEN_SDK_STYLE_ID,
  api_key: import.meta.env.VITE_API_KEY,
  theme: 'dark',                 // 'dark' | 'light'
  allow_gesture_scroll: true,
});

// open / close the fullscreen expand view for a container:
window.genuin?.expand(containerRef.current!.id);
window.genuin?.collapse(containerRef.current!.id);

// react to SDK lifecycle (remove skeletons when content mounts):
const off = window.genuin?.on?.('sdk:embedContentReady', () => setReady(true));
// later: off?.()
```

### R8 — Hybrid: source in `init()` + content on the div

The common plain-HTML pattern (matches the SDK's own `index.html.example` and real QA embeds).
`init()` carries **only the source**; the div carries content + theme via data-attributes; **no
`container_id`** — the SDK auto-discovers the single div and merges both.

```html
<div
  id="gen-sdk"
  class="gen-sdk-class"
  data-theme="light"
  data-video-ids="d3b8c3bd-9209-4b88-be03-040e48e71fa7,f6f5e912-1724-4d7b-801b-77521633e869"
  style="width: 500px; height: 400px"
></div>

<!-- SDK loaded from CDN: https://media.<env>.begenuin.com/sdk/<version>/gen_sdk.min.js -->
<script src="https://media.qa.begenuin.com/sdk/2.0.3/gen_sdk.min.js"></script>
<script>
  genuin.init({
    placement_id: "6931337dac729a99103c145e",
    style_id: "6931337dac729a99103c145f",
    api_key: "a37e46f99d012c2e5216835a8ce5e108e32872171b7eac2a",
  });
</script>
```

Notes:
- `genuin.init` and `window.genuin.init` are the same global — either works.
- `data-video-ids` is a **CSV string of video UUIDs**. Per-container content belongs on the div (so
  multiple divs each get their own set); only put `video_ids` *inside* `init()` when there's exactly
  one container and you prefer the programmatic form.
- The React equivalent: render the div with these data-attributes and run the R1 init guard (you may
  drop `container_id` for a single auto-discovered div, but keeping it is safer when several embeds
  share a page).

---

## SDK script loading

The recipes assume the `genuin` global already exists. It is delivered as a `<script>` from the Genuin
CDN — `https://media.<env>.begenuin.com/sdk/<version>/gen_sdk.min.js` (`<env>` = `qa` for QA, omitted
for prod; pin the `<version>` the platform targets). The platform injects this and signals readiness
(`isSdkLoaded` / `window.onGenuinReady`); always guard `init()` on it.

---

## Config reference

The full `init` surface (`ConfigByUser` in `packages/web-sdk/src/type.ts`). Pick from these; do not
invent fields.

### Identity & container
| Field | Type | Notes |
|---|---|---|
| `container_id` | string | Target div id (programmatic API). |
| `placement_id` + `style_id` | string | Placement path. **Takes precedence over `embed_id`.** |
| `embed_id` | string | Embed path. Fixed feed. |
| `api_key` | string | Required for all paths. |
| `live` | object | Live embed config (`api_key`, `embed_id?`/`placement_id?`+`style_id?`, `live_customization_data?`). |
| `comment_id` | string | Deep-link into a comment thread. |

### Data-attribute equivalents (declarative)
`data-embed-id`, `data-api-key`, `data-placement-id`, `data-style-id`, `data-video-ids` (CSV),
`data-theme` (`light`/`dark`), `data-brand-ids` (space-separated), `data-page-context`, `data-lat`,
`data-long`, `data-url`, `data-web-sdk-nested`. These can be combined with an `init()` that carries
only the source (`placement_id`/`style_id`/`api_key`) — see R8.

### Content
| Field | Type | Notes |
|---|---|---|
| `video_ids` | string (CSV) | Explicit videos. **String, not array** (the React `EmbedDataType.videoIds` is `string[]` internally — at the `init` boundary it is CSV). |
| `initial_video_ids` | string (CSV) | First batch. |
| `start_video_slug` | string | Open on this video. |
| `contextual_params` | object | See below. |
| `sponsorship_id` | string[] | Override sponsorship; empty array = no override. |
| `brand_context` | array | Brand/station playing-state context. |

#### `contextual_params`
`page_context`, `geo { lat, long, radius_limit }`, `url`, `previous_page_context`, `user_context`,
`place { country, state, city, zipcode }`, `time`, `user_segments { age, min_age, max_age, segment,
gender, race }`, `brands_ids: number[]`, `user_interests: string[]`, `posted_by_user_ids: string[]`,
`community_ids: string[]`, `loop_ids: string[]`.

### Theme / display
| Field | Values |
|---|---|
| `theme` | `'dark'` \| `'light'` |
| `website_type` | `'legacy'` \| `'polaris'` |
| `useShadowDOM` | boolean (set `false` when nested) |
| `allow_gesture_scroll` | boolean |

### Styles (`EmbedStyle` / `ViewType`)
`feed`, `carousel`, `floating`, `standard_wall`, `grid`, `dynamic`, `expand_only`. Style is normally
resolved server-side from the embed/placement+`style_id`; `expand_only`/`expandOnLoad` open directly
into the expand view.

### Auth / user
| Field | Notes |
|---|---|
| `token` | Brand auth token. |
| `params` | `{ name, mobile, email, nickname, profileImage, brandUserIdentity }`. |
| `auth_info` | `{ signInUrl, signUpUrl }`. |
| `error_handler` | `({ isError, isNoContent }) => void`. |

### Auto-action (`action: ActionType`)
`spark`, `comment-spark`, `repost`, `comment`, `report`, `join-community`, `join-group`,
`subscribe-group`, `become-a-creator`, `iheart-follow`, `octo`.

### Nesting
`parent_instance_id` (+ `useShadowDOM: false` + `data-web-sdk-nested` on the host div).

### Methods & events
- **Methods:** `init(config)`, `update({ token, user_params, contextual_params, container_id, action,
  start_video_slug, comment_id, source_instance_id })`, `expand(id)`, `collapse(id)`, `destroy()`
  (global only), `on/off/onAll/emit`, `onInternal/offInternal/emitInternal`.
- **Events (`SDKEventType`):** `embed:loaded`, `embed:error`, `embed:resize`, `user:interaction`,
  `content:updated`, `auth:required`, `auth:success`, `navigation`, `onExpandViewChanged`,
  `sdk:expandEmbed`, `sdk:collapseEmbed`, `sdk:embedContentReady`, `sdk:noContent`.

---

## Self-check before returning

- [ ] No `VideoPlayer`/`VideoPlayerV2`/`VideoPoster`/`VideoPage`/`PlayerSwiper`/`<video>` emitted for content video.
- [ ] Exactly one source path per container (placement **or** embed, never both).
- [ ] `api_key` present; ids read from env, never hardcoded.
- [ ] Init guarded by `isInitializedRef` and an SDK-availability check; runs in `useLayoutEffect`.
- [ ] No per-card `destroy()` on unmount.
- [ ] Each container id is unique; container has reserved width/height.
- [ ] `video_ids` passed as a CSV string, not an array.
- [ ] If nested: `parent_instance_id` + `useShadowDOM: false` + `data-web-sdk-nested`.

---

## Failure path

If a video is requested but no Genuin source can be resolved (no `placement_id`/`embed_id`, no
`api_key`, or only a raw non-Genuin URL), emit a structured error and stop — **never** fall back to a
plain `<video>`:

```ts
export const error = {
  type: 'cannot_satisfy',
  code: 'NO_GENUIN_SOURCE' | 'MISSING_API_KEY' | 'NON_GENUIN_VIDEO',
  message: string, // name what's missing: a placement_id+style_id, an embed_id, or an api_key
} as const;
```

---

## Cross-reference

This skill is paired with `hierarchical-tree`. That skill's `video` Slot resolves to exactly this SDK
contract — its resolved props are `placementId` / `styleId` / `apiKey` / `elementId`
(`packages/hierarchical-tree/.../default-slot-renderers.tsx`). When a `hierarchical-tree` Page's
`video` Slot is wired to real data, use the recipes here to mount it. The two skills describe the
**same** SDK; keep field names consistent across both.

Reference implementation in-repo: `packages/genai/src/components/Chat/CarousalEmbed.tsx`. Config
contract: `packages/web-sdk/src/type.ts` (`ConfigByUser`), `packages/web-sdk/src/index.ts`
(`window.genuin`).
