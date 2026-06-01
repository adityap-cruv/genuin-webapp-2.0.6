/**
 * @fileoverview MSW handler for `GET /goservices/embed?id=...`.
 *
 * `APIService.fetchEmbedData` is called during embed-mode SDK init (carousel,
 * ted, floating). Each layout returns different customisation flags, so we
 * dispatch on the `id` query parameter. Unrecognised ids fall through to the
 * real network via `onUnhandledRequest: 'bypass'`.
 *
 * Fixtures live at `../data/embed/<layout>/config.json`. Devs paste raw API
 * responses; `sanitize()` fills empties and forces `autoplay: false`.
 */
import { http, HttpResponse } from 'msw'

import { EMBED_LAYOUT_DATA } from '../../data/init'
import carouselConfig from '../data/embed/carousel/config.json'
import floatingConfig from '../data/embed/floating/config.json'
import tedConfig from '../data/embed/ted/config.json'
import { sanitize } from '../sanitize'

const EMBED_ID_TO_DATA: Record<string, unknown> = {
  [EMBED_LAYOUT_DATA.ted.embed_id]: tedConfig,
  [EMBED_LAYOUT_DATA.carousel.embed_id]: carouselConfig,
  [EMBED_LAYOUT_DATA.embed_floating.embed_id]: floatingConfig,
}

export const embedHandlers = [
  http.get('*/goservices/embed', ({ request }) => {
    const id = new URL(request.url).searchParams.get('id') ?? ''
    const data = EMBED_ID_TO_DATA[id]
    if (!data) return undefined
    return HttpResponse.json(sanitize(data) as Record<string, unknown>)
  }),
]
