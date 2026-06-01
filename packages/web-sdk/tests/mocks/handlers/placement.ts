/**
 * @fileoverview MSW handler for `GET /goservices/placement?placement_id=...`.
 *
 * Called by the SDK during placement-mode init (feed / grid / iheart /
 * iheartPlacement). The response includes layout-specific config (dimensions,
 * scroll behaviour, grid_layout, etc.), so we dispatch per `placement_id` —
 * one captured fixture per layout, same pattern as feed.ts.
 *
 * An unknown placement_id falls through to the real network via
 * `onUnhandledRequest: 'bypass'`.
 */
import { http, HttpResponse } from 'msw'

import { VISUAL_LAYOUT_DATA } from '../../data/init'
import feedConfig from '../data/placement/feed/config.json'
import gridConfig from '../data/placement/grid/config.json'
import iheartConfig from '../data/placement/iheart/config.json'
import iheartPlacementConfig from '../data/placement/iheartPlacement/config.json'
import { sanitize } from '../sanitize'

const PLACEMENT_ID_TO_DATA: Record<string, unknown> = {
  [VISUAL_LAYOUT_DATA.feed.placement_id]: feedConfig,
  [VISUAL_LAYOUT_DATA.grid.placement_id]: gridConfig,
  [VISUAL_LAYOUT_DATA.iheart.placement_id]: iheartConfig,
  [VISUAL_LAYOUT_DATA.iheartPlacement.placement_id]: iheartPlacementConfig,
}

export const placementHandlers = [
  http.get('*/goservices/placement*', ({ request }) => {
    const placementId = new URL(request.url).searchParams.get('placement_id') ?? ''
    const data = PLACEMENT_ID_TO_DATA[placementId]
    if (!data) return undefined
    return HttpResponse.json(sanitize(data) as Record<string, unknown>)
  }),
]
