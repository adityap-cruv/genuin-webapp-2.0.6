/**
 * Linkout fixture data sourced from the canonical Figma design at
 * https://www.figma.com/design/31vZmmekJ2UDRkvvv6EUIR?node-id=8244-19830.
 *
 * Stories import these instead of inlining mock arrays so the design
 * data has one source of truth. The TOEFL / ETS sample is the
 * design's reference content; we keep it verbatim so stories visually
 * match the Figma frame.
 *
 * Field shape matches the `LinkData` zod schema (which now accepts the
 * full set of optional rich fields). Stories that intentionally show
 * only a subset (e.g. thumbnail-only) project the fields they want.
 */

import type { LinkData } from "../../react-query/api/linkouts/schema";

/** Single linkout populated with every field Figma shows. Use for
 *  panel-view / full-view / expand-view stories where the meta row,
 *  description, and pricing all need to be visible. */
export const LINKOUT_FIGMA_FULL: LinkData = {
  position: 0,
  link: "https://www.ets.com/toefl",
  title: "Take the Online TOEFL Test Today and Sign Up Now at ETS!",
  image: "https://picsum.photos/seed/toefl/240/240",
  description:
    "The TOEFL test measures your English skills in reading, listening, speaking, and writing for academic and professional settings.",
  brand: "ETS",
  website: "www.ets.com",
  originalPrice: "$299.99",
  currentPrice: "$199.99",
  rating: "4.5",
  likes: "12.5K",
  downloads: "8.2K",
  phone: "(123) 456-789",
  address: "123 Address, NY, NY, 10000",
};

/** Three linkouts for carousel / multi-link stories. All carry the same
 *  rich shape so swiping demonstrates content rotation rather than just
 *  thumbnail rotation. */
export const LINKOUT_FIGMA_CAROUSEL: LinkData[] = [
  LINKOUT_FIGMA_FULL,
  {
    ...LINKOUT_FIGMA_FULL,
    position: 1,
    link: "https://www.ets.com/gre",
    title: "Prepare for the GRE General Test with Official ETS Resources",
    image: "https://picsum.photos/seed/gre/240/240",
    originalPrice: "$249.99",
    currentPrice: "$179.99",
    rating: "4.7",
    likes: "9.1K",
    downloads: "5.4K",
  },
  {
    ...LINKOUT_FIGMA_FULL,
    position: 2,
    link: "https://www.ets.com/praxis",
    title: "Pass the Praxis: Teacher Certification Made Simple",
    image: "https://picsum.photos/seed/praxis/240/240",
    originalPrice: "$199.99",
    currentPrice: "$129.99",
    rating: "4.6",
    likes: "6.3K",
    downloads: "3.8K",
  },
];

/** Subset projections used by stories that intentionally show only a
 *  few fields. Keeps the existing `LINKS_THUMBNAIL_ONLY`-style story
 *  intent while sharing the same source content. */
export const LINKOUT_FIGMA_THUMBNAIL_ONLY: LinkData[] = LINKOUT_FIGMA_CAROUSEL.map((l) => ({
  position: l.position,
  link: l.link,
  image: l.image,
}));

export const LINKOUT_FIGMA_THUMBNAIL_AND_TITLE: LinkData[] = LINKOUT_FIGMA_CAROUSEL.map((l) => ({
  position: l.position,
  link: l.link,
  image: l.image,
  title: l.title,
}));

/** CTA pair that mirrors the Figma "Sign Up Now" button — wire this
 *  into stories that show the linkout's CTA chip. */
export const LINKOUT_FIGMA_CTA = {
  ctaText: "Sign Up Now",
  ctaLink: LINKOUT_FIGMA_FULL.link,
} as const;
