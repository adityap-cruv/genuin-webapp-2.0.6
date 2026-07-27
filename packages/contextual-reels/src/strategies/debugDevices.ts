/**
 * Per-device debug feed registry.
 *
 * Infolinks device-targets our test handsets so the unit always renders, but the
 * Triton exchange behind it fills only intermittently — most loads end in a
 * passback, so the audible-ad path is hard to exercise on a real device in the
 * real app. Each debug device is served its own committed feed of static VAST
 * URLs instead, making every impression on those handsets a guaranteed fill.
 *
 * Mirrors {@link staticTagData} exactly: a device is served from its own fixture
 * via a lazy thunk, so a non-debug device pulls ZERO fixture bytes and Vite emits
 * one async chunk per device, fetched only on match.
 *
 * Add a debug device: drop `<device-id>.feed.json` under providers/debug-device/
 * (lowercase filename) and add a loader thunk below. No consumer change.
 *
 * Scope: this ONLY selects a different feed, and only for the tags listed in
 * {@link DEBUG_FEED_TAG_IDS}. It does not touch the waterfall, mute/volume
 * behaviour, or the ad request for any other device — fill on real traffic is
 * decided by the exchange and is not ours to force.
 *
 * **Impressions served here are synthetic.** They emit the same `Audio
 * Diagnostic` beacon as real fills, so they carry `forced_fill: true` into the
 * payload (see `genAdSdk.ts`) and field queries MUST filter on it. Without that
 * filter these handsets bias the audibility rate quoted to Infolinks — and they
 * are the heaviest-loading devices in the population precisely because they are
 * device-targeted.
 */
import { hostMacros } from "@cxr/hostMacros";
import type { Reel } from "@cxr/types";

/**
 * Host-macro keys that may carry the device advertising id. Real payloads send
 * the same value under all four (`ifa`, `appidfa`, `appaid`, `deviceid`), but
 * which ones are populated varies by platform and SSP, so all are checked.
 */
const DEVICE_ID_MACRO_KEYS = ["ifa", "appidfa", "appaid", "deviceid"] as const;

/**
 * Tags the debug feed may replace. Restricted to the 320x50 tag the audibility
 * bug is filed against, so a debug handset browsing any other tag sees ordinary
 * production behaviour.
 */
export const DEBUG_FEED_TAG_IDS: ReadonlySet<string> = new Set([
  "6a39163e92929ebec64d78ab", // 320x50 — the reported audio tag
]);

/**
 * The all-zero advertising id both platforms report when the user denies
 * tracking (iOS ATT) or resets their id. It is never a real device and must
 * never match — treating it as a debug device would serve the debug feed to
 * every opted-out user in the population.
 */
const ZERO_DEVICE_ID = "00000000-0000-0000-0000-000000000000";

/**
 * Shape of a raw imported `/feed` envelope — fixtures are stored as the FULL
 * gateway envelope (`{ code, message, data }`), exactly as the real endpoint
 * responds, so a real response can be pasted in verbatim.
 */
interface FeedEnvelope {
  data: { reels: Reel[] };
}

/**
 * Lazy per-device feed loaders, keyed by LOWERCASE advertising id. iOS reports
 * an uppercase IDFA and Android a lowercase GAID; lookups lowercase the incoming
 * id so a single lowercase key matches both.
 */
const DEBUG_FEED_LOADERS = new Map<string, () => Promise<unknown>>([
  // Android test device
  [
    "d92f58dd-b550-4e6b-8721-21255d967444",
    () => import("@cxr/providers/debug-device/d92f58dd-b550-4e6b-8721-21255d967444.feed.json"),
  ],
  // iOS test device (IDFA, reported uppercase upstream)
  [
    "4842110a-e9a9-4dce-82e0-d42838c39b51",
    () => import("@cxr/providers/debug-device/4842110a-e9a9-4dce-82e0-d42838c39b51.feed.json"),
  ],
]);

/**
 * Resolve this load's device advertising id, normalised for comparison, or
 * `undefined` when absent. Unresolved placeholders (`~ifa~`, `{ifa}`) and empty
 * values are already dropped upstream by `parseHostMacros`.
 */
function resolveDeviceId(): string | undefined {
  for (const key of DEVICE_ID_MACRO_KEYS) {
    const value = hostMacros[key]?.trim().toLowerCase();
    if (value) return value;
  }
  return undefined;
}

/**
 * True when this load is a registered debug device on a tag the debug feed
 * covers. Sync + fixture-free, so the check never pulls a fixture chunk.
 *
 * Both halves are required — same invariant style as `isStaticTag`: a debug
 * device on an unlisted tag, or an ordinary device on the debug tag, is NOT a
 * debug load and must behave like production.
 *
 * @param tagId Active tag id (nullable — an unresolved tag is never debug).
 */
export function isDebugDeviceFeed(tagId: string | null | undefined): boolean {
  if (tagId == null || !DEBUG_FEED_TAG_IDS.has(tagId)) return false;
  const deviceId = resolveDeviceId();
  if (!deviceId || deviceId === ZERO_DEVICE_ID) return false;
  // Map lookup, not `in` on an object literal: `in` walks the prototype chain,
  // so an id of "constructor" / "__proto__" would read as a registered device.
  return DEBUG_FEED_LOADERS.has(deviceId);
}

/**
 * Tags whose feed was ACTUALLY replaced by a debug fixture on this load.
 *
 * Eligibility ({@link isDebugDeviceFeed}) is not the same fact as "a synthetic
 * feed was served": the fixture can be missing or malformed, in which case the
 * caller falls back to the real static feed and the resulting impression is a
 * genuine fill. `forced_fill` must reflect what was served, not what was
 * eligible to be served — a `true` on a real fill silently drops that
 * impression from every audibility rate query (they all filter `not
 * forced_fill`), understating the rate quoted to Infolinks.
 *
 * Module-level because the producer (FeedProvider) and the consumer (the audio
 * beacon in genAdSdk) have no shared component ancestor. Keyed by tag so a
 * multi-instance page can't leak one slot's verdict into another's.
 */
const SERVED_DEBUG_FEED_TAG_IDS = new Set<string>();

/**
 * True when a debug fixture was actually served for this tag on this load.
 * Drives `forced_fill` on the audio beacon.
 *
 * @param tagId Active tag id (nullable — an unresolved tag is never debug).
 */
export function didServeDebugDeviceFeed(tagId: string | null | undefined): boolean {
  return tagId != null && SERVED_DEBUG_FEED_TAG_IDS.has(tagId);
}

/**
 * Resolve this device's debug feed, lazily loading only its own fixture, or
 * `undefined` when this is not a debug load or the fixture is malformed —
 * either way the caller falls back to the tag's normal static feed.
 *
 * Records the outcome for {@link didServeDebugDeviceFeed}, so `forced_fill`
 * tracks the feed that was really served.
 *
 * @param tagId Active tag id.
 */
export async function getDebugDeviceFeed(tagId: string | null | undefined): Promise<Reel[] | undefined> {
  // Guard proves both that a device id resolved and that it is registered, so
  // the lookup below cannot miss.
  if (!isDebugDeviceFeed(tagId)) return undefined;
  const loader = DEBUG_FEED_LOADERS.get(resolveDeviceId() as string) as () => Promise<unknown>;

  const imported = (await loader()) as { default?: FeedEnvelope } | undefined;
  const reels = imported?.default?.data?.reels;
  // Guard fixture drift: a malformed file must fall back to the real static
  // feed rather than serving an undefined `reels` that throws downstream.
  if (!Array.isArray(reels)) return undefined;
  // Only now is the fill synthetic. Set after the await so a fixture that
  // failed to load never marks the real feed it fell back to.
  SERVED_DEBUG_FEED_TAG_IDS.add(tagId as string);
  return reels;
}
