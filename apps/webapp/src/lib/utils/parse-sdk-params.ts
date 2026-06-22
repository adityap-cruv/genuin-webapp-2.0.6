/**
 * Parsed SDK load configuration derived from page query params.
 * Placement mode requires both placement_id and style_id; embed mode requires embed_id.
 */
export type SdkParams =
  | { mode: "placement"; placementId: string; styleId: string }
  | { mode: "embed"; embedId: string };

/**
 * Parse a URL search string into an {@link SdkParams} config.
 *
 * Placement wins: if placement_id and style_id are both present, placement mode is
 * returned and embed_id is ignored. A placement_id without style_id is not a valid
 * placement and falls through to the embed check. Returns null when neither mode is
 * satisfied.
 *
 * @param searchParamsStr raw search string, e.g. "?placement_id=...&style_id=..."
 */
export function parseSdkParams(searchParamsStr: string): SdkParams | null {
  const params = new URLSearchParams(searchParamsStr);

  const trimmed = (key: string): string => (params.get(key) ?? "").trim();

  const placementId = trimmed("placement_id");
  const styleId = trimmed("style_id");
  if (placementId && styleId) {
    return { mode: "placement", placementId, styleId };
  }

  const embedId = trimmed("embed_id");
  if (embedId) {
    return { mode: "embed", embedId };
  }

  return null;
}
