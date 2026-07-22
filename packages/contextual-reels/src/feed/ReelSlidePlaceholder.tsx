/**
 * Zero-fetch stand-in for a feed slide that is not in the mount window.
 *
 * Keeps the Embla slide wrapper at full viewport height (so the carousel's loop
 * math stays intact) without mounting a player, `<video>` poster, `<img>`, or ad
 * slot — nothing here issues a network request. The background derives from the
 * tag's `brand_color` (dark fallback) so the swap to real content is not jarring.
 *
 * Intentionally provider-free (reads only `tagDetails.brand_color`, not the
 * `useStrategy` compact-background override) so it stays a pure presentational
 * unit — it is on screen for under a second before the active slide's content
 * replaces it.
 */
import type { TagResponse } from "@cxr/types";

/** Neutral dark backdrop when no `brand_color` is configured for the tag. */
const DEFAULT_PLACEHOLDER_BACKGROUND = "#1a1a1a";

/** Props for {@link ReelSlidePlaceholder}. */
export interface ReelSlidePlaceholderProps {
  tagDetails?: TagResponse;
}

/**
 * Full-height placeholder shown for slides outside the mount window.
 *
 * @param props  Optional tag details; `brand_color` drives the background.
 */
export function ReelSlidePlaceholder({ tagDetails }: ReelSlidePlaceholderProps): React.JSX.Element {
  const background = tagDetails?.brand_color ?? DEFAULT_PLACEHOLDER_BACKGROUND;
  return (
    <div
      aria-hidden="true"
      data-testid="reel-slide-placeholder"
      className="gencl:h-full gencl:w-full"
      style={{ background }}
    />
  );
}
