/**
 * @fileoverview MSW handler for `GET /goservices/ad_creative/feed?tag_id=...`.
 *
 * A single feed fixture (`providers/dummyFeed.json`) holds both reel kinds, just
 * like a real backend feed: `type:"ads"` reels (ad only) and organic `loop`
 * reels (video + ad). The story's Content control maps to a synthetic `tag_id`
 * (see init.ts); this handler filters the one fixture by reel type per id, so
 * the widget renders the matching view.
 *
 * An unknown `tag_id` returns `undefined` so the request falls through to the
 * real network via `onUnhandledRequest: 'bypass'`.
 */
import { http, HttpResponse } from "msw";

import DUMMY_FEED from "@cxr/providers/dummyFeed.json";

import { CONTENT, CONTENT_TAG_ID, type ContentMode } from "../init";

const TAG_ID_TO_CONTENT: Record<string, ContentMode> = {
  [CONTENT_TAG_ID[CONTENT.VideoAd]]: CONTENT.VideoAd,
  [CONTENT_TAG_ID[CONTENT.AdOnly]]: CONTENT.AdOnly,
  [CONTENT_TAG_ID[CONTENT.VideoOnly]]: CONTENT.VideoOnly,
};

/** A standalone ad reel (no organic video), rendered as the "ad only" view. */
const isAdsReel = (reel: { type?: string }): boolean => reel.type === "ads";

/** The dedicated plain-video reel (no ad_configs), rendered as the "video only" view. */
const isVideoOnlyReel = (reel: { _id?: string }): boolean => reel._id === "storybook-video-only-reel";

export const feedHandlers = [
  http.get("*/goservices/ad_creative/feed*", ({ request }) => {
    const tagId = new URL(request.url).searchParams.get("tag_id") ?? "";
    const content = TAG_ID_TO_CONTENT[tagId];
    if (!content) return undefined;

    const reels = DUMMY_FEED.data.reels.filter((reel) => {
      if (content === CONTENT.AdOnly) return isAdsReel(reel);
      if (content === CONTENT.VideoOnly) return isVideoOnlyReel(reel);
      return !isAdsReel(reel) && !isVideoOnlyReel(reel);
    });

    return HttpResponse.json({ ...DUMMY_FEED, data: { ...DUMMY_FEED.data, reels } });
  }),
];
