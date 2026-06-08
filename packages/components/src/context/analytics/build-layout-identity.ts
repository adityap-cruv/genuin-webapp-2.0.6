import type { EmbedDataType } from "../embed/embed.types";

/**
 * Builds the layout-specific identity payload for an analytics event.
 *
 * Layout identity (embed_id / placement_id and their related metadata) must NOT
 * live in the singleton AnalyticsService's defaultPayload — on a page with both
 * an embed and a placement, the singleton can only hold one layout's identity,
 * causing events from the other layout to carry the wrong id. Instead, every
 * track call attaches its own layout's identity using this helper, derived
 * from the EmbedDataType in scope at the call site.
 *
 * @param embedData - The embed/placement data for the current layout. Pass
 * `undefined` for non-SDK contexts (webapp) where layout identity does not apply.
 * @returns A flat object of identity fields. Empty object when not applicable.
 */
export function buildLayoutIdentity(embedData: EmbedDataType | undefined): Record<string, string | number | undefined> {
  if (!embedData) return {};
  const id: Record<string, string | number | undefined> = {};

  if (embedData.brand_id) id.brand_id = embedData.brand_id;
  if (embedData.rudderstackSponsorshipId) id.sponsorship_id = embedData.rudderstackSponsorshipId;
  if (embedData.cpm_rate != null) id.cpm_rate = embedData.cpm_rate;

  if (embedData.embed_id) {
    id.embed_id = embedData.embed_id;
    if (embedData.type) id.embed_type = embedData.style;
    if (embedData.style) id.embed_style = embedData.style;
  }

  if (embedData.placement_id) {
    id.placement_id = embedData.placement_id;
    if (embedData.style_id) id.style_id = embedData.style_id;
    if (embedData.feed_type) id.feed_style = embedData.feed_type;
    if (embedData.style) id.placement_layout = embedData.style;
    if (embedData.type) id.feed_style = embedData.type.split("_")[0];
  }

  return id;
}
