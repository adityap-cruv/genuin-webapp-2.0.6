/**
 * @fileoverview MSW handler for `GET /goservices/brand/details?api_key=...`.
 *
 * `APIService.fetchBrandDetails` is called on every SDK init. The real
 * backend returns different `card_layout_id` / `video_layout_id` per brand
 * (TED=3, iHeart=2, default=1) which is the SDK's primary signal for which
 * brand-specific UI to render (TedEmbed / IHeartControlLayer / DefaultEmbed).
 *
 * We dispatch on `api_key` query param. Base response comes from a raw JSON
 * fixture and passes through `sanitize()`; per-brand layout IDs override.
 * `web_configs.video_autoplay.type` is also forced to 2 (= "never autoplay"
 * per `feed-player/utils.ts`) so videos don't play during snapshot capture.
 */
import { http, HttpResponse } from 'msw'

import { VISUAL_LAYOUT_DATA, EMBED_LAYOUT_DATA } from '../../data/init'
import brandDetailsData from '../data/shared/brand-details.json'
import { sanitize } from '../sanitize'

const TED_API_KEY = EMBED_LAYOUT_DATA.ted.api_key
const IHEART_API_KEY = VISUAL_LAYOUT_DATA.iheart.api_key

/** SDK's `feed-player/utils.ts` reads this as the autoplay switch — `2` = off. */
const AUTOPLAY_OFF = 2

interface BrandVariant {
  cardLayoutId: number
  videoLayoutId: number
  name: string
}

type BrandResponse = {
  data: Record<string, unknown> & {
    web_configs?: Record<string, unknown> & {
      video_autoplay?: Record<string, unknown>
    }
  }
} & Record<string, unknown>

function variantFor(apiKey: string | null): BrandVariant {
  if (apiKey === TED_API_KEY) {
    return { cardLayoutId: 3, videoLayoutId: 3, name: 'Test TED' }
  }
  if (apiKey === IHEART_API_KEY) {
    return { cardLayoutId: 2, videoLayoutId: 2, name: 'Test iHeart' }
  }
  return { cardLayoutId: 1, videoLayoutId: 1, name: 'Test Brand' }
}

export const brandHandlers = [
  http.get('*/goservices/brand/details*', ({ request }) => {
    const apiKey = new URL(request.url).searchParams.get('api_key')
    const variant = variantFor(apiKey)
    const base = sanitize(brandDetailsData) as BrandResponse
    const webConfigs = base.data.web_configs ?? {}
    return HttpResponse.json({
      ...base,
      data: {
        ...base.data,
        card_layout_id: variant.cardLayoutId,
        video_layout_id: variant.videoLayoutId,
        name: variant.name,
        web_configs: {
          ...webConfigs,
          video_autoplay: { ...(webConfigs.video_autoplay ?? {}), type: AUTOPLAY_OFF },
        },
      },
    })
  }),
]
