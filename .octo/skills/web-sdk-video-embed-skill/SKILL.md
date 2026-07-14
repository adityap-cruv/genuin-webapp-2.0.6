---
name: web-sdk-video-embed-skill
description: MANDATORY - whenever generated code must display video ANYWHERE, resolve a Genuin Placement from the configured data MCP, then mount a Genuin Web SDK placement. Preserve MCP/web_code ids, script URL, dimensions, and layout. Never use embeds, env fallback, guessed ids, guessed dimensions, raw video, iframe video, or plain video components.
mandatory: true
---

# Genuin Web SDK Video Embed With MCP Placement Resolution

> **MANDATORY SKILL.** Any time generated output needs to show video, you MUST resolve a Placement from the configured MCP server named `data` and render through the Genuin Web SDK.

## Non-Negotiable Rule

When a generated page/component needs video anywhere, never emit:

- raw `<video>`
- video iframe
- `VideoPlayer`
- `VideoPlayerV2`
- `VideoPoster`
- `VideoPage`
- `PlayerSwiper`
- custom video player components
- Genuin embed flow

Instead emit:

- a stable container element
- a guarded `window.genuin.init(...)`
- Placement values resolved from MCP
- SDK script URL/version from MCP `web_code`
- container dimensions from MCP placement data or MCP `web_code`

The MCP is the source of truth. Do not use `process.env`, `import.meta.env`, hardcoded defaults, guessed SDK ids, guessed script URLs, or guessed dimensions.

---

## When To Activate

Activate whenever the user asks for:

- video
- videos
- reel
- reels
- clip
- clips
- feed
- carousel
- video cards
- horizontally scrollable video cards
- placement
- contextual video
- specific Genuin video surface

Do not activate for:

- images
- audio-only
- non-video UI

---

## Source Priority

Resolve values field-by-field in this order:

1. Explicit fields on the MCP-selected placement record.
2. MCP-returned placement `web_code`.
3. User clarification if a required value is missing.

`web_code` is the canonical source for SDK script URL/version and any container dimensions or data attributes it includes. Preserve the environment implied by the script URL, for example QA stays QA and prod stays prod.

Do **not** use env values.

Do **not** use default placement/style/api key values.

Do **not** use default SDK script URLs or hardcoded SDK versions.

Do **not** use embed values.

Do **not** invent:

- `placement_id`
- `style_id`
- `api_key`
- SDK script URL
- SDK version
- width
- height
- dimensions
- layout
- `web_code`

---

## MCP Resolution Workflow

The configured MCP server is named `data`.

MCP tools will appear with names like:

- `mcp__data__list_placements`
- `mcp__data__get_placement`

Use the actual available MCP tool names. If exact tool names differ, pick the matching `data` MCP tool that lists or fetches placements.

Do not use embed tools.

Do not ask the user to choose Placement or Embed. Always use Placement.

### Step 1 - Resolve Placement

For every video request, choose **Placement** automatically.

Do not ask:

> Do you want Placement or Embed?

For carousel, feed, contextual video surface, dynamic video section, video cards, horizontally scrollable video cards, or "4 to 5 video cards," use Placement.

Do not generate video code before placement values are resolved from MCP.

### Step 2 - Fetch Placement Options From MCP

Call the MCP to fetch available placements.

Show placement options with:

- name
- placement_type
- dimension
- grid_layout

Keep the list concise. Do not expose raw MCP JSON unless the user asks.

### Step 3 - Fetch Full Selected Placement

After the user selects a placement, call the MCP again if needed to fetch the full selected placement record.

The selected placement record must include enough data to render SDK video.

Required identity values:

- `placement_id`
- `style_id`
- `api_key`

Required runtime/loading value:

- SDK script URL from placement `web_code`

Required layout values:

- `width` and `height`, OR
- a `dimension` value that can be translated into width/height or aspect ratio, OR
- complete placement `web_code` that contains container dimensions/style/layout

Useful additional values:

- placement name
- placement type
- grid layout
- data attributes from `web_code`

### Step 4 - Missing Data

If MCP does not return any required identity, script, or layout value, stop and ask the user for the missing value.

Ask the user for missing dimensions the same way you ask for a missing placement value. Example:

> MCP returned placement_id/style_id/api_key, but no width/height or usable dimension. What width and height should this placement use?

Never fall back to:

- env values
- default values
- hardcoded prod or QA SDK URLs
- embed values
- raw video
- guessed ids
- guessed dimensions

### Step 5 - Generate Code

Generate Genuin Web SDK code using only MCP-resolved or user-provided values.

If MCP returns complete placement `web_code`, adapt it into the target framework while preserving all SDK ids, dimensions, data attributes, and script version.

```ts
window.genuin?.init({
  container_id: containerRef.current.id,
  placement_id: '<MCP_PLACEMENT_ID>',
  style_id: '<MCP_STYLE_ID>',
  api_key: '<MCP_API_KEY>',
});
```

---

## Project MCP Context

Octo Canvas may provide project-specific MCP context from project env keys like:

- GENUIN_MCP_CONTEXT_BRAND_ID
- GENUIN_MCP_CONTEXT_WORKSPACE_ID
- GENUIN_MCP_CONTEXT_SHOP_ID

These values are supplied to the agent as hidden context, not to browser code.

When an `mcp__data__...` tool requires one of these fields, pass the known value automatically.

Examples:

- If a tool requires brand_id and known context includes brand_id, pass it.
- If a tool requires workspace_id and known context includes workspace_id, pass it.
- If a required value is missing from known context and not present in the user request, ask the user.

Do not expose MCP URLs, auth tokens, or secret env values in generated code or chat responses.

Do not make browser code call the MCP directly.

---

## SDK Script Loading

The Genuin SDK script must be loaded before `window.genuin.init(...)` can run.

Use the SDK script URL returned by MCP `web_code`.

If MCP does not return a script URL, stop and ask the user for the SDK script URL/version or ask them to select a placement whose `web_code` includes it.

Do not use a fallback SDK CDN URL or version.

Do not hardcode QA because an example placement used QA.

Do not hardcode prod because the current app defaults to prod.

Guard every SDK init on `window.genuin` or the platform's `isSdkLoaded` signal.

---

## Dimension Rules

Use dimensions returned by MCP when available.

If MCP returns any of these values, preserve or translate them directly into the generated container:

- width
- height
- aspect ratio
- dimension string
- grid layout metadata
- inline `style` from `web_code`
- container attributes from `web_code`

If MCP only gives one dimension value, do **not** invent the other dimension. Ask the user for the missing width or height.

If MCP gives no dimension/layout/web_code, ask the user for width and height before generating code.

Do not leave the SDK container with zero height.

Do not add guessed example dimensions.

Only emit `width: '100%'`, fixed pixel height, aspect ratio, or Tailwind sizing if that value came from MCP or the user.

---

## Adapting MCP web_code

If MCP returns placement `web_code`, use it as the canonical source for script loading and container shape.

When adapting `web_code` into React:

- keep SDK script URL/version unchanged
- keep `placement_id`
- keep `style_id`
- keep `api_key`
- keep `data-placement-id`
- keep `data-style-id`
- keep `data-api-key`
- keep width/height/dimensions
- keep placement layout attributes
- convert inline HTML attributes to React-safe props
- preserve placement source path

Do not copy unsafe unrelated scripts beyond the Genuin SDK script.

Do not include MCP calls in the generated browser code.

Do not preserve or introduce embed fields.

---

## React Global Typing

Use this once per React file that calls the SDK:

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
      initialize?: (config: Record<string, unknown>) => void;
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

---

## React Recipe - MCP Resolved Placement

Use this pattern when MCP selected a placement and MCP or the user supplied all required values.

Use Next.js `<Script>` when the route/layout does not already guarantee the same MCP script URL is loaded.

```tsx
'use client';

import Script from 'next/script';
import { useLayoutEffect, useRef, useState } from 'react';

interface GenuinPlacementVideoProps {
  scriptUrl: string; // MCP web_code value
  placementId: string; // MCP value
  styleId: string; // MCP value
  apiKey: string; // MCP value
  containerStyle: React.CSSProperties; // MCP/user dimensions only
}

export function GenuinPlacementVideo({
  scriptUrl,
  placementId,
  styleId,
  apiKey,
  containerStyle,
}: GenuinPlacementVideoProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInitializedRef = useRef(false);
  const [isSdkLoaded, setIsSdkLoaded] = useState(false);
  const sdkId = useRef(`gen-sdk-${crypto.randomUUID()}`).current;

  useLayoutEffect(() => {
    if (isInitializedRef.current || !containerRef.current || !window.genuin) return;
    if (!isSdkLoaded) return;

    window.genuin.init({
      container_id: containerRef.current.id,
      placement_id: placementId,
      style_id: styleId,
      api_key: apiKey,
    });

    isInitializedRef.current = true;
  }, [apiKey, isSdkLoaded, placementId, styleId]);

  return (
    <>
      <Script src={scriptUrl} strategy="afterInteractive" onLoad={() => setIsSdkLoaded(true)} />
      <div ref={containerRef} id={sdkId} className="gen-sdk-class" style={containerStyle} />
    </>
  );
}
```

Do not pass guessed values into this recipe. `scriptUrl`, `placementId`, `styleId`, `apiKey`, and `containerStyle` must come from MCP or user clarification.

---

## Plain HTML Recipe - MCP Resolved Placement

Only use this when generating plain HTML and MCP selected a placement.

```html
<div
  id="<MCP_OR_USER_CONTAINER_ID>"
  class="gen-sdk-class"
  data-placement-id="<MCP_PLACEMENT_ID>"
  data-style-id="<MCP_STYLE_ID>"
  data-api-key="<MCP_API_KEY>"
  style="<MCP_OR_USER_DIMENSIONS>"
></div>

<script src="<MCP_WEB_CODE_SDK_SCRIPT_URL>" async></script>
<script>
  window.genuin?.init({
    container_id: '<MCP_OR_USER_CONTAINER_ID>',
    placement_id: '<MCP_PLACEMENT_ID>',
    style_id: '<MCP_STYLE_ID>',
    api_key: '<MCP_API_KEY>',
  });
</script>
```

Do not hardcode script URLs or dimensions in generated HTML.

---

## Specific Videos

If the user asks for specific videos and the selected MCP placement supports specific video IDs, pass them as CSV.

```ts
window.genuin?.init({
  container_id: containerRef.current.id,
  placement_id: '<MCP_PLACEMENT_ID>',
  style_id: '<MCP_STYLE_ID>',
  api_key: '<MCP_API_KEY>',
  video_ids: videoIds.join(','),
  start_video_slug: videoIds[0],
});
```

`video_ids` must be a CSV string, not an array.

---

## Contextual Feed

If the user asks for videos about a topic/location/page context, use the selected placement and pass contextual params if supported by that placement.

```ts
window.genuin?.init({
  container_id: containerRef.current.id,
  placement_id: '<MCP_PLACEMENT_ID>',
  style_id: '<MCP_STYLE_ID>',
  api_key: '<MCP_API_KEY>',
  contextual_params: {
    page_context: '<TOPIC_OR_PAGE_CONTEXT>',
    url: window.location.href,
  },
});
```

---

## Multiple Video Surfaces

For multiple video surfaces on one page, each surface must use a unique container id.

Each surface must use MCP-resolved placement values.

Do not reuse the same container id.

Do not call `destroy()` per surface.

---

## Lifecycle Rules

Every generated React implementation must follow these rules:

1. Load the MCP `web_code` SDK script URL or use an existing loader only if it loads that exact URL.
2. Init exactly once with `useRef(false)`.
3. Guard on SDK availability.
4. Use `useLayoutEffect`.
5. Use a unique container id.
6. Reserve width and height from MCP or user clarification.
7. Do not call `window.genuin.destroy()` on component unmount.
8. Do not initialize embed values.

---

## Placement Rules

Use placement when the user wants:

- dynamic video surface
- feed
- carousel
- contextual videos
- placement-controlled layout
- horizontally scrollable video cards
- "4 to 5 video cards"
- any video surface

Never supply embed identity fields.

Invalid:

```ts
window.genuin?.init({
  container_id: 'gen-sdk',
  embed_id: '...',
  api_key: '...',
});
```

Valid:

```ts
window.genuin?.init({
  container_id: '<UNIQUE_CONTAINER_ID>',
  placement_id: '<MCP_PLACEMENT_ID>',
  style_id: '<MCP_STYLE_ID>',
  api_key: '<MCP_API_KEY>',
});
```

---

## Auth And User Data

Only include SDK auth fields if MCP returns them or the user explicitly provides them.

Supported fields include:

- token
- params
- auth_info

Do not invent auth tokens.

Do not expose MCP credentials.

---

## Events And Controls

Use SDK methods only when the requested UI needs them.

Available methods:

- init(config)
- initialize(config)
- update(config)
- expand(id)
- collapse(id)
- on(eventType, listener)
- off(eventType, listener)
- onInternal(eventName, listener)
- offInternal(eventName, listener)

Do not call `destroy()` for a single generated component.

---

## Failure Path

If video is requested but MCP cannot provide a usable placement, return a structured error and stop.

```ts
export const error = {
  type: 'cannot_satisfy',
  code: 'MCP_NO_VIDEO_PLACEMENT',
  message: 'The data MCP did not return a usable placement for this video request.',
} as const;
```

If MCP selected a placement but required fields are missing, ask the user for the missing values instead of generating code. Missing values can include:

- `placement_id`
- `style_id`
- `api_key`
- SDK script URL/version
- width
- height
- dimensions
- layout

If the user asks for a raw non-Genuin video URL, return:

```ts
export const error = {
  type: 'cannot_satisfy',
  code: 'NON_GENUIN_VIDEO',
  message: 'Video must be rendered through a Genuin Web SDK placement resolved from MCP.',
} as const;
```

Never fall back to raw video, embed, env values, guessed ids, guessed script URLs, or guessed dimensions.

---

## Self Check

Before returning generated code, verify:

- [ ] The skill activated for a video request.
- [ ] MCP was used to resolve placement values.
- [ ] Known MCP context values were passed to MCP tools when required.
- [ ] User selected one MCP placement option when multiple placements were available.
- [ ] No env values were used.
- [ ] No default SDK ids were used.
- [ ] No hardcoded SDK script URL/version was used.
- [ ] No raw `<video>` was generated.
- [ ] No iframe video was generated.
- [ ] No embed flow or `embed_id` was used.
- [ ] Placement uses `placement_id`, `style_id`, and `api_key`.
- [ ] SDK script URL came from MCP `web_code` or user clarification.
- [ ] SDK init is guarded and runs once.
- [ ] Container id is unique.
- [ ] Container has stable dimensions from MCP or user clarification.
- [ ] No width or height was guessed.
- [ ] `video_ids` is CSV if used.
- [ ] Browser code does not call MCP directly.
- [ ] No MCP URL/auth token/secret value appears in generated code.
