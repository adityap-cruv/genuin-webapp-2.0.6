/**
 * @fileoverview MSW handler for `POST /goservices/feed/v1/home`.
 *
 * All visual layouts (feed, grid, ted, carousel, iheart, iheartPlacement,
 * embed_floating) hit this single endpoint. Dispatch by `placement_id`
 * (placement layouts) or `embed_id` (embed layouts) in the request JSON body.
 * Anything not recognised falls through to the real network via
 * `onUnhandledRequest: 'bypass'` so unrelated tests are unaffected.
 *
 * Fixtures live under `../data/{embed,placement}/<layout>/home.json` — embed
 * mode for layouts initialised by `embed_id`, placement mode for layouts
 * initialised by `placement_id`. Devs paste real captured responses verbatim;
 * the `sanitize()` wrapper fills empties and forces test overrides.
 */
import { http, HttpResponse } from 'msw'

import { VISUAL_LAYOUT_DATA, EMBED_LAYOUT_DATA } from '../../data/init'
import carouselData from '../data/embed/carousel/home.json'
import floatingData from '../data/embed/floating/home.json'
import tedData from '../data/embed/ted/home.json'
import feedData from '../data/placement/feed/home.json'
import gridData from '../data/placement/grid/home.json'
import iheartData from '../data/placement/iheart/home.json'
import iheartPlacementData from '../data/placement/iheartPlacement/home.json'
import { sanitize } from '../sanitize'

const PLACEMENT_ID_TO_DATA: Record<string, unknown> = {
  [VISUAL_LAYOUT_DATA.feed.placement_id]: feedData,
  [VISUAL_LAYOUT_DATA.grid.placement_id]: gridData,
  [VISUAL_LAYOUT_DATA.iheart.placement_id]: iheartData,
  [VISUAL_LAYOUT_DATA.iheartPlacement.placement_id]: iheartPlacementData,
}

const EMBED_ID_TO_DATA: Record<string, unknown> = {
  [EMBED_LAYOUT_DATA.ted.embed_id]: tedData,
  [EMBED_LAYOUT_DATA.carousel.embed_id]: carouselData,
  [EMBED_LAYOUT_DATA.embed_floating.embed_id]: floatingData,
}

interface FeedHomeBody {
  placement_id?: string
  embed_id?: string
}

export const feedHandlers = [
  http.post('*/goservices/feed/v1/home*', async ({ request }) => {
    let body: FeedHomeBody = {}
    try {
      body = (await request.json()) as FeedHomeBody
    } catch {
      return undefined
    }

    if (body.placement_id && body.placement_id in PLACEMENT_ID_TO_DATA) {
      return HttpResponse.json(
        sanitize(PLACEMENT_ID_TO_DATA[body.placement_id]) as Record<string, unknown>,
      )
    }
    if (body.embed_id && body.embed_id in EMBED_ID_TO_DATA) {
      return HttpResponse.json(
        sanitize(EMBED_ID_TO_DATA[body.embed_id]) as Record<string, unknown>,
      )
    }
    return undefined
  }),
]
