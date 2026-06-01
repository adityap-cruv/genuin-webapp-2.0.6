/**
 * @fileoverview Request-time response transformer.
 *
 * Handlers pipe raw fixture JSON through `sanitize()` before returning to the
 * SDK. Three jobs:
 *
 *   1. FILL fallback defaults when a known field is empty (`""`/`null`/
 *      `undefined`). Pasted non-empty values pass through verbatim.
 *   2. FORCE specific keys to a fixed test-only value regardless of pasted
 *      content (e.g. `autoplay: false` so snapshots don't catch frame drift).
 *   3. PROMOTE relative media URLs to absolute. SDK does `new URL(...)` on
 *      these strings — a relative input throws and triggers React error
 *      recovery, which races the snapshot.
 *
 * Trade-off: real names / URLs / UUIDs from pasted prod data end up in
 * snapshots. That's intentional — devs prefer captured real data over
 * heavy-handed scrubbing for layout fidelity.
 */
import { AVATAR_PNG_DATA_URI } from './data/image-placeholders'

// ---------------------------------------------------------------------------
// Fallback sets — fill in only when the pasted value is empty.
// ---------------------------------------------------------------------------

const PII_FALLBACK_KEYS = new Set([
  'email',
  'phone',
  'phone_number',
  'mobile_number',
  'country_code',
])

const PNG_FALLBACK_KEYS = new Set([
  'profile_image',
  'profile_image_s',
  'profile_image_m',
  'profile_image_l',
  'thumbnail_url',
  'thumbnail_url_s',
  'thumbnail_url_m',
  'thumbnail_url_l',
  'thumbnail_url_xs',
  'dp',
  'dp_s',
  'dp_m',
  'dp_l',
  'dp_xs',
  'brand_web_logo',
  'sprite_image_url',
  'video_layout_thumbnail',
  'category_image',
  'logo',
  'favicon',
])

const SHARE_URL_FALLBACK_KEYS = new Set([
  'share_url',
  'share_link',
  'short_link',
  'dynamic_link',
])

const TEXT_FALLBACKS: Record<string, string> = {
  name: 'Test Brand',
  username: 'testuser',
  bio: 'Test bio',
  brand_slug: 'test-brand',
  brand_handle: 'testbrand',
  group_name: 'Test Group',
  group_description: 'Test group description',
  group_handle: 'testgroup',
  handle: 'testhandle',
  description: 'Test description',
  description_text: 'Test description',
  description_data: '["Test description"]',
  subtitle: 'Test episode subtitle',
  title: 'Test Show',
  slug: 'test-slug',
  share_string: 'teststring00000000',
  page_session: 'plc_TestSessionId',
  podcast_id: '0',
  station_id: '0',
  cta_text: 'Go to Episodes',
}

// ---------------------------------------------------------------------------
// Force overrides — value is set regardless of pasted content.
// ---------------------------------------------------------------------------

const FORCE_VALUES: Record<string, unknown> = {
  autoplay: false,
  enable_autoplay: false,
}

// ---------------------------------------------------------------------------
// Relative → absolute URL promotion. Real API returns `temp_video/m3u8s/...`
// without scheme; the SDK's `new URL()` call throws on relative input.
// ---------------------------------------------------------------------------

const MEDIA_CDN_ORIGIN = 'https://media.begenuin.com/'
const ABSOLUTE_MEDIA_KEYS = new Set(['media_url_m3u8', 'media_url'])

// ---------------------------------------------------------------------------
// Misc constants.
// ---------------------------------------------------------------------------

/** Max feed items in a snapshot. Grid is 3x3 so 9 is enough. */
const FEED_LIMIT = 9

function isEmpty(value: unknown): boolean {
  return value === null || value === undefined || value === ''
}

function fillValue(value: unknown, key: string | null): unknown {
  if (Array.isArray(value)) {
    return value.map((v) => fillValue(v, null))
  }
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = fillValue(v, k)
    }
    return out
  }

  if (key === null) return value

  // Force overrides win over everything.
  if (Object.prototype.hasOwnProperty.call(FORCE_VALUES, key)) {
    return FORCE_VALUES[key]
  }

  // Promote relative media URLs before the not-empty check, otherwise a
  // non-empty relative value passes through unchanged and SDK throws.
  if (
    typeof value === 'string' &&
    value !== '' &&
    ABSOLUTE_MEDIA_KEYS.has(key) &&
    !value.startsWith('https://') &&
    !value.startsWith('http://')
  ) {
    return MEDIA_CDN_ORIGIN + value.replace(/^\/+/, '')
  }

  // Pasted value wins.
  if (!isEmpty(value)) return value

  // Empty value → fall back to a test default.
  if (PII_FALLBACK_KEYS.has(key)) return ''
  if (PNG_FALLBACK_KEYS.has(key)) return AVATAR_PNG_DATA_URI
  if (SHARE_URL_FALLBACK_KEYS.has(key)) return 'https://test.local/share'
  if (Object.prototype.hasOwnProperty.call(TEXT_FALLBACKS, key)) {
    return TEXT_FALLBACKS[key]
  }
  return value
}

/**
 * Apply all transforms to a raw response body and return a new object. The
 * input is never mutated. Also trims `data.feeds` to {@link FEED_LIMIT} items.
 */
export function sanitize(body: unknown): unknown {
  const cloned = JSON.parse(JSON.stringify(body)) as
    | { data?: { feeds?: unknown[] } }
    | null
  if (cloned && cloned.data && Array.isArray(cloned.data.feeds)) {
    cloned.data.feeds = cloned.data.feeds.slice(0, FEED_LIMIT)
  }
  return fillValue(cloned, null)
}
