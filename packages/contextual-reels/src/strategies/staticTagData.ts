/**
 * Per-tag static AD-only data registry.
 *
 * Each `servedStatically` tag (see strategyConfig.ts) MUST have an entry here. A tag
 * is served from its own committed fixtures — tag config, feed, and the visit_id
 * the analytics buffer needs — skipping `/ad_creative` and `/feed`. (`/ip_info`
 * still fires: geoip stays on analytics and supplies the real client IP for the
 * ad-URL rewrite.)
 *
 * The fixtures are loaded **lazily, per tag**: each registry value is a thunk
 * that dynamic-`import()`s only that tag's two JSON files, so a non-static tag
 * pulls ZERO fixture bytes and a static tag fetches only its own. Vite emits one
 * async chunk per tag, fetched on demand when {@link getStaticTagData} is awaited.
 *
 * Add a new static tag: drop its two JSON files under providers/static-tag/, add a
 * loader thunk below, and set `preset: "servedStatically"` in strategyConfig. No
 * consumer change.
 */
import type { Reel, TagResponse } from "@cxr/types";

/** Static tag-config + feed served for one servedStatically tag. */
export interface StaticTagEntry {
  /** Unwrapped `TagResponse` (the fixture's `data`, envelope stripped). */
  tagConfig: TagResponse;
  /** Raw reels — the `data.reels` array of the /feed fixture. */
  feed: Reel[];
}

/** Shape of a raw imported `/ad_creative` envelope. */
interface TagEnvelope {
  data: TagResponse;
}

/** Shape of a raw imported `/feed` envelope. */
interface FeedEnvelope {
  data: { reels: Reel[] };
}

/**
 * Assemble a {@link StaticTagEntry} from imported tag + feed envelopes.
 *
 * Both fixtures are stored as the **full** gateway envelope (`{ code, message,
 * data }`), exactly as the real endpoints respond — paste a response in
 * verbatim. This helper unwraps `.data` from each.
 *
 * The feed fixture's `data.visit_id` is intentionally ignored: a fresh visit_id
 * is generated per load in {@link FeedProvider} (a baked-in id would repeat
 * across every session and pollute analytics).
 *
 * Returns `undefined` for a malformed fixture (missing `tag.data` or a
 * non-array `feed.data.reels`) so the caller falls back to the live API rather
 * than serving a half-built entry whose `feed` is `undefined` — which would
 * throw downstream instead of triggering the "no static data → hit the API"
 * fallback. The committed fixtures are well-formed; this guards config drift.
 */
export function toEntry(tag: unknown, feed: unknown): StaticTagEntry | undefined {
  const tagEnvelope = tag as TagEnvelope | null | undefined;
  const feedEnvelope = feed as FeedEnvelope | null | undefined;
  const tagConfig = tagEnvelope?.data;
  const reels = feedEnvelope?.data?.reels;
  if (!tagConfig || !Array.isArray(reels)) return undefined;
  return { tagConfig, feed: reels };
}

/**
 * Lazy per-tag loaders. The dynamic `import()`s split each tag's fixtures into
 * their own async chunk — nothing is fetched until a loader is called.
 */
const STATIC_TAG_LOADERS: Record<string, () => Promise<StaticTagEntry | undefined>> = {
  "6a39163e92929ebec64d78ab": async () => {
    const [tag, feed] = await Promise.all([
      import("@cxr/providers/static-tag/6a39163e92929ebec64d78ab.tag.json"),
      import("@cxr/providers/static-tag/6a39163e92929ebec64d78ab.feed.json"),
    ]);
    return toEntry(tag.default, feed.default);
  },
  "6a3915b692929ebec64d785e": async () => {
    const [tag, feed] = await Promise.all([
      import("@cxr/providers/static-tag/6a3915b692929ebec64d785e.tag.json"),
      import("@cxr/providers/static-tag/6a3915b692929ebec64d785e.feed.json"),
    ]);
    return toEntry(tag.default, feed.default);
  },
  "6a6892e52ca77d200369fb9e": async () => {
    const [tag, feed] = await Promise.all([
      import("@cxr/providers/static-tag/6a6892e52ca77d200369fb9e.tag.json"),
      import("@cxr/providers/static-tag/320x480-ads-5.feed.json"),
    ]);
    return toEntry(tag.default, feed.default);
  },
  // QA-testing tag (see strategyConfig.ts). Served statically like the prod tags.
  "6a3aa78ba0daccfd439648b8": async () => {
    const [tag, feed] = await Promise.all([
      import("@cxr/providers/static-tag/6a3aa78ba0daccfd439648b8.tag.json"),
      import("@cxr/providers/static-tag/6a3aa78ba0daccfd439648b8.feed.json"),
    ]);
    return toEntry(tag.default, feed.default);
  },
  "6a3916de30e1406c10507518": async () => {
    const [tag, feed] = await Promise.all([
      import("@cxr/providers/static-tag/6a3916de30e1406c10507518.tag.json"),
      import("@cxr/providers/static-tag/6a3916de30e1406c10507518.feed.json"),
    ]);
    return toEntry(tag.default, feed.default);
  },
  // Demo-only static tags (no DB entry) — one Triton ad reel each. 320x50.
  "6a3aa78ba0daccfd439648b81": async () => {
    const [tag, feed] = await Promise.all([
      import("@cxr/providers/static-tag/6a3aa78ba0daccfd439648b81.tag.json"),
      import("@cxr/providers/static-tag/6a3aa78ba0daccfd439648b81.feed.json"),
    ]);
    return toEntry(tag.default, feed.default);
  },
  // 320x100
  "6a3aa78ba0daccfd439648b82": async () => {
    const [tag, feed] = await Promise.all([
      import("@cxr/providers/static-tag/6a3aa78ba0daccfd439648b82.tag.json"),
      import("@cxr/providers/static-tag/6a3aa78ba0daccfd439648b82.feed.json"),
    ]);
    return toEntry(tag.default, feed.default);
  },
  // 300x250
  "6a3aa78ba0daccfd439648b83": async () => {
    const [tag, feed] = await Promise.all([
      import("@cxr/providers/static-tag/6a3aa78ba0daccfd439648b83.tag.json"),
      import("@cxr/providers/static-tag/6a3aa78ba0daccfd439648b83.feed.json"),
    ]);
    return toEntry(tag.default, feed.default);
  },
  // 300x600
  "6a3aa78ba0daccfd439648b84": async () => {
    const [tag, feed] = await Promise.all([
      import("@cxr/providers/static-tag/6a3aa78ba0daccfd439648b84.tag.json"),
      import("@cxr/providers/static-tag/6a3aa78ba0daccfd439648b84.feed.json"),
    ]);
    return toEntry(tag.default, feed.default);
  },
  // 320x480
  "6a3aa78ba0daccfd439648b85": async () => {
    const [tag, feed] = await Promise.all([
      import("@cxr/providers/static-tag/6a3aa78ba0daccfd439648b85.tag.json"),
      import("@cxr/providers/static-tag/6a3aa78ba0daccfd439648b85.feed.json"),
    ]);
    return toEntry(tag.default, feed.default);
  },

  // -------------------------------------------------------------------------
  // LIVE PRODUCTION ads-only tags (brand 3252) — Infolinks size×tag sheet.
  // Real DB tags in live traffic. Each reuses the brand-level Triton ad feed
  // of the 320x50 anchor (6a39163e92929ebec64d78ab) — the ads_url is
  // brand-level, so the slots are identical (see cxr-static-tag-fixture-recipe).
  // DO NOT render/request these anywhere on local or in automation — a live
  // request inflates the real tag's analytics. Only 6a1fd43b45aec54862ed235d
  // is the network-safe test tag.
  // -------------------------------------------------------------------------
  // 320x50-ads-only-2 / -3
  "6a7c45fcf3f875e5e06dadab": async () => {
    const [tag, feed] = await Promise.all([
      import("@cxr/providers/static-tag/6a7c45fcf3f875e5e06dadab.tag.json"),
      import("@cxr/providers/static-tag/6a39163e92929ebec64d78ab.feed.json"),
    ]);
    return toEntry(tag.default, feed.default);
  },
  "6a7c465586d060bd42fb5ab7": async () => {
    const [tag, feed] = await Promise.all([
      import("@cxr/providers/static-tag/6a7c465586d060bd42fb5ab7.tag.json"),
      import("@cxr/providers/static-tag/6a39163e92929ebec64d78ab.feed.json"),
    ]);
    return toEntry(tag.default, feed.default);
  },
  // 320x100-ads-only-2 / -3
  "6a7c46dcf3f875e5e06daef0": async () => {
    const [tag, feed] = await Promise.all([
      import("@cxr/providers/static-tag/6a7c46dcf3f875e5e06daef0.tag.json"),
      import("@cxr/providers/static-tag/6a39163e92929ebec64d78ab.feed.json"),
    ]);
    return toEntry(tag.default, feed.default);
  },
  "6a7c46fef3f875e5e06daf19": async () => {
    const [tag, feed] = await Promise.all([
      import("@cxr/providers/static-tag/6a7c46fef3f875e5e06daf19.tag.json"),
      import("@cxr/providers/static-tag/6a39163e92929ebec64d78ab.feed.json"),
    ]);
    return toEntry(tag.default, feed.default);
  },
  // 300x250-ads-only-2 / -3
  "6a7c4727fa1b811d815aa00f": async () => {
    const [tag, feed] = await Promise.all([
      import("@cxr/providers/static-tag/6a7c4727fa1b811d815aa00f.tag.json"),
      import("@cxr/providers/static-tag/6a39163e92929ebec64d78ab.feed.json"),
    ]);
    return toEntry(tag.default, feed.default);
  },
  "6a7c473df3f875e5e06daf87": async () => {
    const [tag, feed] = await Promise.all([
      import("@cxr/providers/static-tag/6a7c473df3f875e5e06daf87.tag.json"),
      import("@cxr/providers/static-tag/6a39163e92929ebec64d78ab.feed.json"),
    ]);
    return toEntry(tag.default, feed.default);
  },
  // 300x600-ads-only / -2 / -3
  "6a391708a7d9f8da7f6e56ad": async () => {
    const [tag, feed] = await Promise.all([
      import("@cxr/providers/static-tag/6a391708a7d9f8da7f6e56ad.tag.json"),
      import("@cxr/providers/static-tag/6a39163e92929ebec64d78ab.feed.json"),
    ]);
    return toEntry(tag.default, feed.default);
  },
  "6a7c476af3f875e5e06dafc1": async () => {
    const [tag, feed] = await Promise.all([
      import("@cxr/providers/static-tag/6a7c476af3f875e5e06dafc1.tag.json"),
      import("@cxr/providers/static-tag/6a39163e92929ebec64d78ab.feed.json"),
    ]);
    return toEntry(tag.default, feed.default);
  },
  "6a7c479586d060bd42fb5c3c": async () => {
    const [tag, feed] = await Promise.all([
      import("@cxr/providers/static-tag/6a7c479586d060bd42fb5c3c.tag.json"),
      import("@cxr/providers/static-tag/6a39163e92929ebec64d78ab.feed.json"),
    ]);
    return toEntry(tag.default, feed.default);
  },
  // 320x480-ads-only-2 / -3. Unlike the other sizes, the 320x480 tags serve the
  // full 5-ad feed (320x480-ads-5.feed.json) rather than the 1-ad brand feed —
  // the extra ad reels drive the interstitial full-player experience.
  "6a7c47bf86d060bd42fb5c95": async () => {
    const [tag, feed] = await Promise.all([
      import("@cxr/providers/static-tag/6a7c47bf86d060bd42fb5c95.tag.json"),
      import("@cxr/providers/static-tag/320x480-ads-5.feed.json"),
    ]);
    return toEntry(tag.default, feed.default);
  },
  "6a7c47d8f3f875e5e06db080": async () => {
    const [tag, feed] = await Promise.all([
      import("@cxr/providers/static-tag/6a7c47d8f3f875e5e06db080.tag.json"),
      import("@cxr/providers/static-tag/320x480-ads-5.feed.json"),
    ]);
    return toEntry(tag.default, feed.default);
  },

  // -------------------------------------------------------------------------
  // Managed-service ads-only tags (brand 3252) — one per size. Same live-traffic
  // warning as the block above. Unlike the -2/-3 siblings these ship their OWN
  // feed fixture (identical brand-level Triton slots as the 320x50 anchor), so a
  // future managed-service-only feed change cannot leak into the Infolinks tags.
  // -------------------------------------------------------------------------
  // 320x50-manage-service
  "6a9af76f18beaf88d7614154": async () => {
    const [tag, feed] = await Promise.all([
      import("@cxr/providers/static-tag/6a9af76f18beaf88d7614154.tag.json"),
      import("@cxr/providers/static-tag/6a9af76f18beaf88d7614154.feed.json"),
    ]);
    return toEntry(tag.default, feed.default);
  },
  // 320x100-manage-service
  "6a9af84893b2d00fe7914d56": async () => {
    const [tag, feed] = await Promise.all([
      import("@cxr/providers/static-tag/6a9af84893b2d00fe7914d56.tag.json"),
      import("@cxr/providers/static-tag/6a9af84893b2d00fe7914d56.feed.json"),
    ]);
    return toEntry(tag.default, feed.default);
  },
  // 300x250-manage-service
  "6a9af8c45a0b2b9ea748e66b": async () => {
    const [tag, feed] = await Promise.all([
      import("@cxr/providers/static-tag/6a9af8c45a0b2b9ea748e66b.tag.json"),
      import("@cxr/providers/static-tag/6a9af8c45a0b2b9ea748e66b.feed.json"),
    ]);
    return toEntry(tag.default, feed.default);
  },
  // 300x600-manage-service
  "6a9af90f93b2d00fe7914e35": async () => {
    const [tag, feed] = await Promise.all([
      import("@cxr/providers/static-tag/6a9af90f93b2d00fe7914e35.tag.json"),
      import("@cxr/providers/static-tag/6a9af90f93b2d00fe7914e35.feed.json"),
    ]);
    return toEntry(tag.default, feed.default);
  },
  // 320x480-manage-service
  "6a9afc455a0b2b9ea748e72b": async () => {
    const [tag, feed] = await Promise.all([
      import("@cxr/providers/static-tag/6a9afc455a0b2b9ea748e72b.tag.json"),
      import("@cxr/providers/static-tag/6a9afc455a0b2b9ea748e72b.feed.json"),
    ]);
    return toEntry(tag.default, feed.default);
  },

  // -------------------------------------------------------------------------
  // Direct IO iHM/Infolinks Audio (Sep) — DMA + National + DMA v1. Not
  // size-scoped: the name carries the buy, not a banner size (layout comes from
  // the container px). Own tag + feed fixture each — the feed's DSP VAST url is
  // keyed by brand_id/tag_id, so each tag must serve its own id. Same
  // live-traffic warning as the blocks above.
  // -------------------------------------------------------------------------
  // Direct IO iHM/Infolinks Audio for Sep - DMA
  "6a9ba985ee6dc7773d0c42a6": async () => {
    const [tag, feed] = await Promise.all([
      import("@cxr/providers/static-tag/6a9ba985ee6dc7773d0c42a6.tag.json"),
      import("@cxr/providers/static-tag/6a9ba985ee6dc7773d0c42a6.feed.json"),
    ]);
    return toEntry(tag.default, feed.default);
  },
  // Direct IO iHM/Infolinks Audio for Sep - National
  "6a9ba9b8ee6dc7773d0c42f4": async () => {
    const [tag, feed] = await Promise.all([
      import("@cxr/providers/static-tag/6a9ba9b8ee6dc7773d0c42f4.tag.json"),
      import("@cxr/providers/static-tag/6a9ba9b8ee6dc7773d0c42f4.feed.json"),
    ]);
    return toEntry(tag.default, feed.default);
  },
  // Direct IO iHM/Infolinks Audio for Sep - DMA v1 (second DMA tag). Own tag +
  // feed fixture: the feed's DSP VAST url is keyed by brand_id/tag_id, so it must
  // carry THIS tag's id (…/vast/3252/6a9eaf2dee6dc7773d0c5f87), not the first
  // DMA tag's — otherwise its ad requests would resolve against the wrong tag.
  "6a9eaf2dee6dc7773d0c5f87": async () => {
    const [tag, feed] = await Promise.all([
      import("@cxr/providers/static-tag/6a9eaf2dee6dc7773d0c5f87.tag.json"),
      import("@cxr/providers/static-tag/6a9eaf2dee6dc7773d0c5f87.feed.json"),
    ]);
    return toEntry(tag.default, feed.default);
  },
};

/**
 * The set of tag ids served from static data. Sync + fixture-free, so the
 * drift guard and any "is this tag static?" check never pull a fixture chunk.
 */
export const STATIC_TAG_IDS: ReadonlySet<string> = new Set(Object.keys(STATIC_TAG_LOADERS));

/**
 * The single source of truth for "is this tag actually served statically?" —
 * the flag AND registry-membership invariant. A tag flagged `servedStatically`
 * but absent from the registry (config drift, or a half-static state) is NOT
 * static: it must behave like a normal tag and hit the live API, so its live ad
 * URL is never rewritten. Every consumer (useTagLoader, FeedProvider, genAdSdk)
 * MUST gate on this rather than re-deriving the invariant inline.
 *
 * @param tagId             Active tag id (nullable — an unresolved tag is not static).
 * @param servedStatically  The tag's resolved `servedStatically` strategy flag.
 */
export function isStaticTag(tagId: string | null | undefined, servedStatically: boolean): boolean {
  return servedStatically && tagId != null && STATIC_TAG_IDS.has(tagId);
}

/**
 * Resolve a tag's static data, lazily loading only that tag's fixtures, or
 * `undefined` when it is not a static tag (no fixture chunk is fetched) or its
 * fixtures are malformed (see {@link toEntry}) — either way the caller falls
 * back to the live API.
 *
 * @param tagId  Active tag id.
 */
export async function getStaticTagData(tagId: string): Promise<StaticTagEntry | undefined> {
  const loader = STATIC_TAG_LOADERS[tagId];
  return loader ? loader() : undefined;
}
