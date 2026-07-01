/**
 * @fileoverview MSW handler for `GET /goservices/ad_creative?tag_id=...`.
 *
 * Returns the mock tag config (brand color, variant, etc.) for any of the
 * story's synthetic tag ids. The same config backs every content mode.
 *
 * The `/feed` sub-path is owned by the feed handler, guarded here so this
 * broader pattern does not swallow it. Unknown ids fall through to the real
 * network via `onUnhandledRequest: 'bypass'`.
 */
import { http, HttpResponse } from "msw";

import TAG from "../data/tag.json";
import { CONTENT_TAG_ID } from "../init";

const KNOWN_TAG_IDS = new Set(Object.values(CONTENT_TAG_ID));

export const tagHandlers = [
  http.get("*/goservices/ad_creative*", ({ request }) => {
    const url = new URL(request.url);
    if (url.pathname.endsWith("/feed")) return undefined;

    const tagId = url.searchParams.get("tag_id") ?? "";
    if (!KNOWN_TAG_IDS.has(tagId)) return undefined;

    // getTag unwraps `response.data.data ?? response.data`, so wrap once.
    return HttpResponse.json({ data: TAG });
  }),
];
