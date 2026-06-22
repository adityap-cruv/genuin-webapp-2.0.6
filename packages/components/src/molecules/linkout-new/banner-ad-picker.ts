/**
 * Pure helpers for picking which IAB banner ad fits a given linkout
 * container, plus the canonical size catalogue.
 *
 * Decoupled from any React / video / embed context — callers pass
 * in the linkout's own measured width and height (typically via the
 * `useLinkoutContainerSize` hook in this module) and get back the
 * largest banner size that fits the slot, or `null` when no size
 * is admissible. The matching `GenAdBannerConfig` from the host's
 * supplied payload is resolved by `findBannerConfigForSize`.
 */

import type { GenAdBannerConfig } from "@genuin/components/molecules/feed-player/gen-ad-container/gen-ad.types";

/**
 * Supported banner ad sizes, listed in ascending area. The picker
 * walks this list and prefers the largest entry that fits the
 * container, so order here is informative only — `pickBannerAdSize`
 * computes the result deterministically regardless.
 *
 * Sources: Figma `DisplayMobile/300x50` (9541:28193),
 * `DisplayMobile/320x50` (9563:113380), `DisplayMobile/320x100`
 * (9537:100577).
 */
export const BANNER_AD_SIZES = [
  { w: 300, h: 50 },
  { w: 320, h: 50 },
  { w: 320, h: 100 },
] as const;

/**
 * Minimum linkout-container height required to show *any* banner.
 * Below this the slot is too cramped to host an ad without crowding
 * the surrounding chrome — the picker returns `null` and the slot
 * stays empty.
 */
export const BANNER_AD_MIN_CONTAINER_HEIGHT = 200;

/**
 * Maximum allowed banner height. Guardrail against future entries
 * in `BANNER_AD_SIZES` exceeding what the linkout panel can host —
 * the picker filters anything taller out before considering it.
 */
export const BANNER_AD_MAX_HEIGHT = 100;

/** Single entry from `BANNER_AD_SIZES`. */
export type BannerAdSize = (typeof BANNER_AD_SIZES)[number];

/**
 * Pick the largest banner size that fits the linkout's container,
 * or `null` when no entry qualifies. Rules:
 *
 * 1. `containerHeight >= BANNER_AD_MIN_CONTAINER_HEIGHT` — short
 *    containers suppress the ad entirely.
 * 2. `bannerWidth <= containerWidth` — the banner must fit
 *    horizontally without cropping.
 * 3. `bannerHeight <= BANNER_AD_MAX_HEIGHT` — guardrail; redundant
 *    today since all catalogue entries respect it, but enforced so
 *    a future entry that violates the rule is filtered out.
 *
 * Tiebreaker: greater area wins. When two candidates have equal
 * area, the one with greater height wins (so 320x100 beats 320x50
 * at equal width, etc.).
 *
 * @param containerWidth - Live width of the linkout's container, in pixels.
 * @param containerHeight - Live height of the linkout's container, in pixels.
 * @returns The banner size to render, or `null` to suppress the ad.
 */
export function pickBannerAdSize(containerWidth: number, containerHeight: number): BannerAdSize | null {
  if (containerHeight < BANNER_AD_MIN_CONTAINER_HEIGHT) return null;
  const candidates = BANNER_AD_SIZES.filter((s) => s.w <= containerWidth && s.h <= BANNER_AD_MAX_HEIGHT);
  if (candidates.length === 0) return null;
  return candidates.reduce((best, cur) => {
    const bestArea = best.w * best.h;
    const curArea = cur.w * cur.h;
    if (curArea !== bestArea) return curArea > bestArea ? cur : best;
    return cur.h > best.h ? cur : best;
  });
}

/**
 * Find the `GenAdBannerConfig` matching a picked size from a
 * caller-supplied banner payload. Accepts either a single config or
 * an array so it can be called directly with the union form on
 * `LinkoutSlotContent` (`banner: GenAdBannerConfig | GenAdBannerConfig[]`).
 *
 * Returns `null` when no entry has the matching `size` tuple — the
 * caller should treat that as a no-fill condition and skip
 * rendering the ad.
 *
 * @param banners - One or more banner configs from the host.
 * @param size - The size returned by `pickBannerAdSize`.
 */
export function findBannerConfigForSize(
  banners: GenAdBannerConfig | GenAdBannerConfig[],
  size: { w: number; h: number }
): GenAdBannerConfig | null {
  const list = Array.isArray(banners) ? banners : [banners];
  return (
    list.find((entry) => Array.isArray(entry.size) && entry.size[0] === size.w && entry.size[1] === size.h) ?? null
  );
}
