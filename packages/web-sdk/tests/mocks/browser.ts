/**
 * @fileoverview MSW browser worker registration for Playwright tests.
 *
 * Loaded only by index-test.html via a bundled IIFE (see global-setup.ts).
 *
 * Mocked endpoints (in `setupWorker` order):
 *   - feed       POST /feed/v1/home          (per layout)
 *   - video      GET  /feed/video            (single fixture)
 *   - comments   GET  /api/v3/comments       (single fixture)
 *   - brand      GET  /brand/details         (per api_key)
 *   - embed      GET  /embed                 (per embed_id, embed-mode layouts)
 *   - placement  GET  /placement             (per placement_id, placement-mode layouts)
 *   - media      media.begenuin.com/*        (CDN stubs + pass-throughs)
 *
 * Non-visible endpoints (ip_info, sso/autologin, analytics) pass through to
 * the real network via `onUnhandledRequest: 'bypass'`.
 */
import { setupWorker } from 'msw/browser'

import { brandHandlers } from './handlers/brand'
import { commentsHandlers } from './handlers/comments'
import { embedHandlers } from './handlers/embed'
import { feedHandlers } from './handlers/feed'
import { mediaHandlers } from './handlers/media'
import { placementHandlers } from './handlers/placement'
import { videoHandlers } from './handlers/video'

export const worker = setupWorker(
  ...feedHandlers,
  ...videoHandlers,
  ...commentsHandlers,
  ...brandHandlers,
  ...embedHandlers,
  ...placementHandlers,
  ...mediaHandlers,
)

export async function startWorker(): Promise<void> {
  await worker.start({
    onUnhandledRequest: 'bypass',
    serviceWorker: { url: '/mockServiceWorker.js' },
  })
  ;(window as unknown as { __MSW_READY__: boolean }).__MSW_READY__ = true
}
