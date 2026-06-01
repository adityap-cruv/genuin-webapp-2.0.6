/**
 * @fileoverview MSW handlers for begenuin CDN asset requests.
 *
 * Most `media.begenuin.com/*` URLs return deterministic stub bytes so tests
 * don't depend on production assets:
 *
 *   - webapp_assets/reactions/*  → tiny SVG (spark icon stub)
 *   - webapp_assets/avatar/*     → 1×1 transparent GIF
 *   - webapp_assets/*            → 1×1 transparent PNG (catch-all)
 *   - temp_video/m3u8s/*         → empty HLS playlist (terminates immediately)
 *
 * Two paths are INTENTIONALLY NOT mocked so snapshots show real artwork:
 *
 *   - uploads/profile_images/*   → real CDN (community avatars)
 *   - uploads/thumbnails/*       → real CDN (video posters)
 *
 * The `<img>` `Content-Type` quirk for profile images (CDN sends bare
 * `image/`) is handled by `pinThumbnailPosters()` in `sdk-wait.helper.ts`,
 * which re-fetches the bytes and wraps them with `image/png`.
 */
import { http, HttpResponse } from 'msw'

import {
  EMPTY_HLS_PLAYLIST,
  SPARK_ICON_SVG,
  TRANSPARENT_GIF_DATA_URI,
  TRANSPARENT_PNG_DATA_URI,
} from '../data/image-placeholders'

function decodeDataUri(dataUri: string): Uint8Array {
  const commaIdx = dataUri.indexOf(',')
  const payload = commaIdx >= 0 ? dataUri.slice(commaIdx + 1) : dataUri
  const binary = atob(payload)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

const PNG_BYTES = decodeDataUri(TRANSPARENT_PNG_DATA_URI)
const GIF_BYTES = decodeDataUri(TRANSPARENT_GIF_DATA_URI)

const pngResponse = () =>
  new HttpResponse(PNG_BYTES, { headers: { 'content-type': 'image/png' } })

const gifResponse = () =>
  new HttpResponse(GIF_BYTES, { headers: { 'content-type': 'image/gif' } })

const svgResponse = () =>
  new HttpResponse(SPARK_ICON_SVG, { headers: { 'content-type': 'image/svg+xml' } })

const playlistResponse = () =>
  new HttpResponse(EMPTY_HLS_PLAYLIST, {
    headers: { 'content-type': 'application/vnd.apple.mpegurl' },
  })

export const mediaHandlers = [
  http.get('*://media.begenuin.com/webapp_assets/reactions/*', svgResponse),
  http.get('*://media.qa.begenuin.com/webapp_assets/reactions/*', svgResponse),
  http.get('*://media.begenuin.com/webapp_assets/avatar/*', gifResponse),
  http.get('*://media.qa.begenuin.com/webapp_assets/avatar/*', gifResponse),
  http.get('*://media.begenuin.com/temp_video/m3u8s/*', playlistResponse),
  http.get('*://media.qa.begenuin.com/temp_video/m3u8s/*', playlistResponse),
  http.get('*://media.begenuin.com/webapp_assets/*', pngResponse),
  http.get('*://media.qa.begenuin.com/webapp_assets/*', pngResponse),
]
