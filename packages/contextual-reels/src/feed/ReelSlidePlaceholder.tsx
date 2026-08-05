/**
 * Zero-fetch stand-in for a feed slide that is not in the mount window.
 *
 * Keeps the Embla slide wrapper at full viewport height (so the carousel's loop
 * math stays intact) without mounting a player, `<video>` poster, `<img>`, or ad
 * slot — nothing here issues a network request.
 *
 * Background selection:
 * - **Video slides** derive the background from the tag's `brand_color` (dark
 *   fallback) so the swap to real reel content is not jarring.
 * - **Ad slides** (`isAd`) use the neutral shimmer base instead. The ad slot
 *   overlays a `#1a1a1a`-based shimmer while GenAd loads, so matching it keeps
 *   the placeholder → shimmer → ad transition seamless. A saturated `brand_color`
 *   (e.g. a full-bleed red) reads as an error screen during the cold-start window
 *   before the shimmer/video covers it — hence brand color is skipped for ads.
 *
 * Intentionally provider-free (reads only `tagDetails.brand_color`, not the
 * `useStrategy` compact-background override) so it stays a pure presentational
 * unit — it is on screen for under a second before the active slide's content
 * replaces it.
 */
import type { TagResponse } from "@cxr/types";

/**
 * Neutral dark backdrop: the tag `brand_color` fallback, and the fixed
 * background for ad slots. Matches the ad-slot shimmer base (see `GenAdSlot`).
 */
const DEFAULT_PLACEHOLDER_BACKGROUND = "#1a1a1a";

/** Props for {@link ReelSlidePlaceholder}. */
export interface ReelSlidePlaceholderProps {
  tagDetails?: TagResponse;
  /**
   * Whether this placeholder stands in for an ad slide. Ad slots use the
   * neutral shimmer-base background rather than the tag `brand_color`.
   */
  isAd?: boolean;
}

/**
 * Full-height placeholder shown for slides outside the mount window.
 *
 * @param props  Optional tag details (`brand_color` drives the background for
 *   video slides) and `isAd` (ad slides use the neutral shimmer base).
 */
export function ReelSlidePlaceholder({ tagDetails, isAd = false }: ReelSlidePlaceholderProps): React.JSX.Element {
  const background = isAd
    ? DEFAULT_PLACEHOLDER_BACKGROUND
    : (tagDetails?.brand_color ?? DEFAULT_PLACEHOLDER_BACKGROUND);
  return (
    <div
      aria-hidden="true"
      data-testid="reel-slide-placeholder"
      className="gencl:h-full gencl:w-full"
      style={{ background }}
    />
  );
}
