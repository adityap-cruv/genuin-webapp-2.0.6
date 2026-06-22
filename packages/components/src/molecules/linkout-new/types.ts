/**
 * Public types shared across the `linkout-new` module — kept in a
 * dedicated file so consumers can import them without pulling in
 * the runtime code of `<DynamicLinkouts>` / `<LinkoutItem>` / etc.
 */

import type { GenAdBannerConfig } from "@genuin/components/molecules/feed-player/gen-ad-container/gen-ad.types";
import type { LinkData } from "@genuin/components/react-query/api/linkouts/schema";

/**
 * What the linkout slot currently hosts. Discriminated union so the
 * picker and the renderer branch exhaustively on `kind` — no
 * "both `links` and `bannerConfig` are set, which wins?" ambiguity
 * at call sites.
 *
 * - `link` is the primary path — the slot displays one or more brand
 *   linkouts and drives the host's CTA.
 * - `banner-ad` is the IAB ad fallback — when no linkout is eligible
 *   for the viewer, the same slot hosts a banner ad inside the
 *   linkout panel chrome (Figma `Component 3` at node 9563:113378).
 *
 * Display and video ads do NOT live in this slot. Display ads are a
 * sibling overlay (centred MPU / half-page); video ads run through
 * `<FeedPlayer>`'s existing `<GenAdContainer>` overlay. The linkout
 * slot's job is bounded to the bottom-pinned panel.
 */
export type LinkoutSlotContent =
  | {
      kind: "link";
      /** Linkouts ordered by `position`. The slot picks an active
       *  entry from this list and rotates through them via the
       *  existing carousel logic. */
      links: LinkData[];
      /** Page-level CTA copy. Falls back to the active link's title
       *  when the host doesn't override. */
      ctaText: string;
      /** Page-level CTA href. Falls back to the active link's URL. */
      ctaLink: string;
    }
  | {
      kind: "banner-ad";
      /** Banner-only ad config — produced upstream by
       *  `buildGenAdConfigFromAdTagObject` (`display_ad` branch) and
       *  funnelled into the linkout slot when the link waterfall
       *  has no fill. Can be a single entry or a list — the
       *  in-component picker resolves to the entry whose
       *  `size` fits the live linkout container. */
      banner: GenAdBannerConfig | GenAdBannerConfig[];
      /** Optional brand id, forwarded into `<GenAdContainer>`'s
       *  `brandDetails.brandId` so the SDK can target. */
      brandId?: string;
    };
