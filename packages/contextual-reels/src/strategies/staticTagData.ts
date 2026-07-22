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
  // QA-testing tag (see strategyConfig.ts). Served statically like the prod tags.
  "6a3aa78ba0daccfd439648b8": async () => {
    const [tag, feed] = await Promise.all([
      import("@cxr/providers/static-tag/6a3aa78ba0daccfd439648b8.tag.json"),
      import("@cxr/providers/static-tag/6a3aa78ba0daccfd439648b8.feed.json"),
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
