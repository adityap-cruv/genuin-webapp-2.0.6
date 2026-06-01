/**
 * @fileoverview MSW handler for `GET /goservices/feed/video?slug=...`.
 *
 * Called when `start_video_slug` is passed to `init()`. We return the
 * single-video fixture regardless of slug — tests exercise one slug and
 * matching exactly would cause pass-through (real-network leak) for any
 * unexpected value. The `sanitize()` wrapper scrubs PII/UUIDs/images.
 */
import { http, HttpResponse } from 'msw'

import feedVideoData from '../data/shared/feed-video.json'
import { sanitize } from '../sanitize'

export const videoHandlers = [
  http.get('*/goservices/feed/video*', () =>
    HttpResponse.json(sanitize(feedVideoData) as Record<string, unknown>),
  ),
]
