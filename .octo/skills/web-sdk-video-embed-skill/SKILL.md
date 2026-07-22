---
name: web-sdk-video-embed-skill
description: MANDATORY - whenever generated code must display video ANYWHERE, resolve a Genuin Placement with `mcp__data__get_embed_placement_details` using an integer brand ID, then mount a Genuin Web SDK placement. Use the fixed Genuin SDK 2.0.5 QA script and preserve MCP placement/style/API-key values, dimensions, and layout. Never use embeds, env fallback, guessed ids, guessed dimensions, raw video, iframe video, or plain video components.
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
- Placement identity and layout values resolved from MCP
- the fixed Genuin SDK 2.0.5 QA script URL
- container dimensions from the selected MCP placement

The MCP response is the source of truth for placement identity and layout. The fixed SDK URL in this skill is the only script source. Do not use `process.env`, `import.meta.env`, default SDK ids, guessed SDK ids, alternate script URLs, or guessed dimensions.

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

1. The selected record in the MCP response `placements` array.
2. The selected record's `styles` array for one `style_id`.
3. The MCP response's top-level `api_key`.
4. The user's placement-record selection when the response has multiple placements.
5. User clarification only for a missing brand ID or missing dimensions.
6. The fixed SDK script URL declared in this skill.

Do **not** use env values.

Do **not** use default placement/style/api key values.

Do **not** use embed values.

Do **not** use `web_code`; the new MCP response does not require or return it.

Do **not** invent:

- `placement_id`
- `style_id`
- `api_key`
- width
- height
- dimensions
- layout

---

## MCP Resolution Workflow

The configured MCP server is named `data`.

Use exactly this tool for video placement resolution:

- `mcp__data__get_embed_placement_details`

Despite `embed` appearing in the tool name, use only the response's `placements` data. Ignore its `embeds` data completely.

Do not ask whether to use a Placement or an Embed. Always use Placement. This is separate from asking which placement record to use when the `placements` array contains multiple records.

### Step 1 - Resolve Brand ID

Before calling MCP, resolve a valid integer `brand_id`:

- Use a valid integer already present in the user request.
- Use a valid integer from known hidden MCP context when available.
- Convert a digits-only brand ID string to an integer before the tool call.
- If the brand ID is missing or is not an integer, ask the user for it and stop until they answer.

Do not guess a brand ID. Do not include the brand ID in generated browser code.

### Step 2 - Fetch Placement Details From MCP

Call the tool with this argument shape:

```json
{
  "brand_id": 123
}
```

`brand_id` must be a JSON integer, not a quoted string. Do not pass the MCP URL, auth token, API key, placement ID, or any browser value in this payload.

One response contains the available placements, their styles and dimensions, and the shared API key. Do not call another placement-list or placement-detail tool.

### Step 3 - Select Placement

Ignore `total_embeds` and `embeds` even when they are populated.

Use the `placements` array:

- If it is empty, return `MCP_NO_VIDEO_PLACEMENT` and stop.
- If it contains one placement, select it automatically.
- If it contains multiple placements, show concise options and ask the user to select one.

Show each placement option with:

- name
- placement_type
- `dimensions.width` x `dimensions.height`
- `grid_layout.row` x `grid_layout.column`

Keep the list concise. Do not expose raw MCP JSON unless the user asks.

### Step 4 - Select Style And Map Values

Map the selected placement without renaming or guessing its values:

- selected placement `id` -> SDK `placement_id`
- one selected `styles[].id` -> SDK `style_id`
- response top-level `api_key` -> SDK `api_key`
- selected placement `dimensions.width` and `dimensions.height` -> container dimensions

When the selected placement has multiple styles, choose the style whose `title` best matches the user's requested surface or layout. If there is no clear semantic match, choose the first style in response order. Do not interrupt the user to choose a style.

If the selected placement has no `id`, no usable style, or the response has no top-level `api_key`, return `MCP_INCOMPLETE_VIDEO_PLACEMENT` and stop. Do not ask the user to provide these server-owned values.

### Step 5 - Handle Missing Dimensions And Generate Code

Ask the user for missing dimensions before generating code. Example:

> MCP returned placement_id/style_id/api_key, but no width/height or usable dimension. What width and height should this placement use?

Never fall back to:

- env values
- default values
- embed values
- raw video
- guessed ids
- guessed dimensions

Generate Genuin Web SDK code with identity values resolved from MCP, dimensions resolved from MCP or the user, and the fixed SDK script URL from this skill.

```ts
window.genuin?.init({
  container_id: containerRef.current.id,
  placement_id: "<MCP_PLACEMENT_ID>",
  style_id: "<MCP_STYLE_ID>",
  api_key: "<MCP_API_KEY>",
});
```

---

## Project MCP Context

Octo Canvas may provide `brand_id` as hidden MCP context. If it is a valid integer, pass it automatically. Otherwise use a valid brand ID from the user request or ask the user for one before calling MCP.

Do not expose MCP URLs, auth tokens, or secret env values in generated code or chat responses.

Do not make browser code call the MCP directly.

---

## SDK Script Loading

The Genuin SDK script must be loaded before `window.genuin.init(...)` can run.

Always use this exact script URL:

```html
<script src="https://media.qa.begenuin.com/sdk/2.0.5/gen_sdk.min.js"></script>
```

This fixed QA URL is an explicit exception to the repository's generic rule against hardcoded environment-specific URLs. Do not read the script URL from MCP, `web_code`, env, project defaults, or user input. Do not substitute another environment or SDK version.

Guard every SDK init on `window.genuin` or the platform's `isSdkLoaded` signal.

---

## Dimension Rules

Use `dimensions` from the selected MCP placement when available.

Preserve these values directly in the generated container or placement summary:

- `dimensions.width`
- `dimensions.height`
- `dimensions.auto_fit_height`
- `grid_layout.row`
- `grid_layout.column`
- `grid_layout.auto_adjust`

If MCP only gives one dimension value, do **not** invent the other dimension. Ask the user for the missing width or height.

If MCP gives no usable width and height, ask the user for both before generating code.

Do not leave the SDK container with zero height.

Do not add guessed example dimensions.

Only emit `width: '100%'`, fixed pixel height, aspect ratio, or Tailwind sizing if that value came from MCP or the user.

---

## Mapping MCP Placement Data

The response's `placement_type` and `grid_layout` describe the placement and help the user choose among options. Do not invent SDK init fields for them unless the SDK contract explicitly supports those fields for the requested surface.

The response's top-level `api_key` applies to every placement in that response. Do not look for a per-placement API key.

Do not include MCP calls in the generated browser code.

Do not copy `total_embeds`, `embeds`, embed IDs, or embed names into SDK config or generated code.

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
    onGenuinReady?: (genuin: NonNullable<Window["genuin"]>) => void;
  }
}
```

---

## React/Next.js Recipe - MCP Resolved Placement

This repository's React surfaces use Next.js. Use this pattern after MCP supplied the required identity values and MCP or the user supplied complete dimensions.

Use Next.js `<Script>` when the route/layout does not already guarantee that the fixed SDK URL is loaded.

```tsx
"use client";

import Script from "next/script";
import { useLayoutEffect, useRef, useState } from "react";

const GENUIN_SDK_SCRIPT_URL = "https://media.qa.begenuin.com/sdk/2.0.5/gen_sdk.min.js";

interface GenuinPlacementVideoProps {
  placementId: string; // MCP value
  styleId: string; // MCP value
  apiKey: string; // MCP value
  containerStyle: React.CSSProperties; // MCP/user dimensions only
}

export function GenuinPlacementVideo({ placementId, styleId, apiKey, containerStyle }: GenuinPlacementVideoProps) {
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
      <Script src={GENUIN_SDK_SCRIPT_URL} strategy="afterInteractive" onLoad={() => setIsSdkLoaded(true)} />
      <div ref={containerRef} id={sdkId} className="gen-sdk-class" style={containerStyle} />
    </>
  );
}
```

Do not pass guessed values into this recipe. `placementId`, `styleId`, and `apiKey` must come from MCP. `containerStyle` must use MCP dimensions or dimensions supplied by the user. The script URL must remain the fixed URL shown above.

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
  style="<MCP_OR_USER_DIMENSIONS>"></div>

<script src="https://media.qa.begenuin.com/sdk/2.0.5/gen_sdk.min.js"></script>
<script>
  window.genuin?.init({
    container_id: "<MCP_OR_USER_CONTAINER_ID>",
    placement_id: "<MCP_PLACEMENT_ID>",
    style_id: "<MCP_STYLE_ID>",
    api_key: "<MCP_API_KEY>",
  });
</script>
```

Use the exact fixed script URL shown above. Do not substitute an MCP, env, user-provided, or alternate URL. Do not hardcode dimensions; use the selected MCP placement dimensions or user clarification.

---

## Specific Videos

If the user asks for specific videos and the selected MCP placement supports specific video IDs, pass them as CSV.

```ts
window.genuin?.init({
  container_id: containerRef.current.id,
  placement_id: "<MCP_PLACEMENT_ID>",
  style_id: "<MCP_STYLE_ID>",
  api_key: "<MCP_API_KEY>",
  video_ids: videoIds.join(","),
  start_video_slug: videoIds[0],
});
```

`video_ids` must be a CSV string, not an array.

---

## Contextual Feed

If the user asks for videos about a topic, location, or page context, include contextual params only when the selected placement record or MCP response explicitly reports that the placement supports them. If the response has no contextual capability metadata, omit `contextual_params` and render the resolved placement. Do not infer support from placement name, style title, or `placement_type`.

```ts
window.genuin?.init({
  container_id: containerRef.current.id,
  placement_id: "<MCP_PLACEMENT_ID>",
  style_id: "<MCP_STYLE_ID>",
  api_key: "<MCP_API_KEY>",
  contextual_params: {
    page_context: "<TOPIC_OR_PAGE_CONTEXT>",
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

1. Load `https://media.qa.begenuin.com/sdk/2.0.5/gen_sdk.min.js` or use an existing loader only if it loads that exact URL.
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
  container_id: "gen-sdk",
  embed_id: "...",
  api_key: "...",
});
```

Valid:

```ts
window.genuin?.init({
  container_id: "<UNIQUE_CONTAINER_ID>",
  placement_id: "<MCP_PLACEMENT_ID>",
  style_id: "<MCP_STYLE_ID>",
  api_key: "<MCP_API_KEY>",
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
  type: "cannot_satisfy",
  code: "MCP_NO_VIDEO_PLACEMENT",
  message: "The data MCP did not return a usable placement for this video request.",
} as const;
```

If the selected placement has no `id`, has no usable `styles[].id`, or the response has no top-level `api_key`, return a structured error and stop:

```ts
export const error = {
  type: "cannot_satisfy",
  code: "MCP_INCOMPLETE_VIDEO_PLACEMENT",
  message: "The data MCP returned an incomplete video placement.",
} as const;
```

If only width or height is missing, ask the user for the missing dimension before generating code. Do not ask the user to supply server-owned placement, style, or API-key values.

If the user asks for a raw non-Genuin video URL, return:

```ts
export const error = {
  type: "cannot_satisfy",
  code: "NON_GENUIN_VIDEO",
  message: "Video must be rendered through a Genuin Web SDK placement resolved from MCP.",
} as const;
```

Never fall back to raw video, embed, env values, guessed ids, alternate script URLs, or guessed dimensions.

---

## Self Check

Before returning generated code, verify:

- [ ] The skill activated for a video request.
- [ ] `mcp__data__get_embed_placement_details` was used to resolve placement values.
- [ ] The tool payload contained only a valid integer `brand_id`.
- [ ] A missing or invalid brand ID was requested from the user instead of guessed.
- [ ] Response `embeds` data was ignored completely.
- [ ] The user selected one placement record when multiple were available; a single placement was selected automatically.
- [ ] One style was chosen by semantic `title` match, or the first style was used when no title clearly matched.
- [ ] No env values were used.
- [ ] No default SDK ids were used.
- [ ] The SDK URL is exactly `https://media.qa.begenuin.com/sdk/2.0.5/gen_sdk.min.js`.
- [ ] No raw `<video>` was generated.
- [ ] No iframe video was generated.
- [ ] No embed flow or `embed_id` was used.
- [ ] `placement_id` came from the selected `placements[].id`.
- [ ] `style_id` came from the selected placement's chosen `styles[].id`.
- [ ] `api_key` came from the MCP response's top-level `api_key`.
- [ ] No `web_code` value was expected or used.
- [ ] SDK init is guarded and runs once.
- [ ] Container id is unique.
- [ ] Container has stable dimensions from MCP or user clarification.
- [ ] No width or height was guessed.
- [ ] `video_ids` is CSV if used.
- [ ] Only the agent called MCP; generated browser/runtime code does not call MCP.
- [ ] No MCP URL/auth token/secret value appears in generated code.
