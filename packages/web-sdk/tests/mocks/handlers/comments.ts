/**
 * @fileoverview MSW handler for `GET /api/v3/comments?conversation_id=...`.
 *
 * Opening comments on any video returns this synthetic list — never hits the
 * real backend (which would surface real `@usernames` and comment text in
 * screenshots). The `sanitize()` wrapper scrubs PII/UUIDs/images.
 */
import { http, HttpResponse } from 'msw'

import commentsData from '../data/shared/comments.json'
import { sanitize } from '../sanitize'

export const commentsHandlers = [
  http.get('*/api/v3/comments*', () =>
    HttpResponse.json(sanitize(commentsData) as Record<string, unknown>),
  ),
]
