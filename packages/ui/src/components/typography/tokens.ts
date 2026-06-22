/**
 * Shared design-system token maps for the typography primitives.
 *
 * Single source of truth that turns DS-named typography levels
 * (`h1` / `headline-0` / `body-1` / …) and weights into Tailwind
 * class strings. Every typography primitive imports from this module —
 * if the DS scale shifts, only this file changes.
 *
 * Pixel values mirror the Genuin Master Design System V2 typography
 * scale (Figma node `1821:46389`). Sizes and line-heights are baked
 * in as Tailwind arbitrary classes so the AI layout generator and
 * call-site authors get pixel-accurate output without any extra
 * config drift.
 */

/**
 * Heading levels — display + headline scale. Each level fixes a
 * `font-size`, `line-height`, and `letter-spacing` triple per Figma
 * (node `1821:46389`):
 *
 * - `h1` — Display-1 (100/100, -0.2)
 * - `h2` — Display-2 (64/72, -0.2)
 * - `h3` — Display-3 (48/56, -0.2)
 * - `headline-0` — Headline 0 (72/76, 0)
 * - `headline-1` — Headline 1 (36/44, -0.2)
 * - `headline-2` — Headline 2 (32/36, -0.2)
 * - `headline-3` — Headline 3 (24/28, -0.1)
 * - `headline-4` — Headline 4 (20/24, 0)
 */
export type HeadingLevel =
  | "h1"
  | "h2"
  | "h3"
  | "headline-0"
  | "headline-1"
  | "headline-2"
  | "headline-3"
  | "headline-4";

/**
 * Body text sizes — paragraph + label scale. Each size fixes a
 * `font-size` + `line-height` pair per Figma (node `1821:46389`).
 * Letter-spacing is 0 for every body size.
 *
 * - `body-0` — Body 0 (16/22)
 * - `body-1` — Body 1 (14/20)
 * - `body-2` — Body 2 (12/16)
 * - `body-3` — Body 3 (10/14)
 * - `body-4` — Body 4 (8/12)
 */
export type TextSize = "body-0" | "body-1" | "body-2" | "body-3" | "body-4";

/**
 * Shared typography weight scale used by both `Heading` and `Text`.
 * Maps 1:1 to Tailwind's `font-medium` / `font-semibold` / `font-bold`
 * (500 / 600 / 700).
 */
export type TypographyWeight = "medium" | "semibold" | "bold";

/**
 * Heading level → Tailwind classes for font-size + line-height +
 * letter-spacing. Values are static strings so Tailwind discovers
 * them statically at build time.
 */
export const HEADING_LEVEL_CLASS: Record<HeadingLevel, string> = {
  h1: "gencl:text-[100px] gencl:leading-[100px] gencl:tracking-[-0.2px]",
  h2: "gencl:text-[64px] gencl:leading-[72px] gencl:tracking-[-0.2px]",
  h3: "gencl:text-[48px] gencl:leading-[56px] gencl:tracking-[-0.2px]",
  "headline-0": "gencl:text-[72px] gencl:leading-[76px]",
  "headline-1": "gencl:text-[36px] gencl:leading-[44px] gencl:tracking-[-0.2px]",
  "headline-2": "gencl:text-[32px] gencl:leading-[36px] gencl:tracking-[-0.2px]",
  "headline-3": "gencl:text-[24px] gencl:leading-[28px] gencl:tracking-[-0.1px]",
  "headline-4": "gencl:text-[20px] gencl:leading-[24px]",
};

/**
 * Text size → Tailwind classes for font-size + line-height. Body
 * sizes have no letter-spacing adjustment.
 */
export const TEXT_SIZE_CLASS: Record<TextSize, string> = {
  "body-0": "gencl:text-[16px] gencl:leading-[22px]",
  "body-1": "gencl:text-[14px] gencl:leading-[20px]",
  "body-2": "gencl:text-[12px] gencl:leading-[16px]",
  "body-3": "gencl:text-[10px] gencl:leading-[14px]",
  "body-4": "gencl:text-[8px] gencl:leading-[12px]",
};

/**
 * Typography weight token → Tailwind `font-*` class. Shared by both
 * `Heading` and `Text`.
 */
export const WEIGHT_CLASS: Record<TypographyWeight, string> = {
  medium: "gencl:font-medium",
  semibold: "gencl:font-semibold",
  bold: "gencl:font-bold",
};

/**
 * Canonical default weight per heading level. Matches the Figma DS
 * (node `1821:46389`): h1 / headline-0 default to bold; every other
 * level defaults to semibold.
 */
export const HEADING_DEFAULT_WEIGHT: Record<HeadingLevel, TypographyWeight> = {
  h1: "bold",
  h2: "semibold",
  h3: "semibold",
  "headline-0": "bold",
  "headline-1": "semibold",
  "headline-2": "semibold",
  "headline-3": "semibold",
  "headline-4": "semibold",
};

/**
 * Canonical default weight per text size. Per Figma: `body-0` ships
 * as semibold (it's a quasi-label scale); every other body size
 * defaults to medium for paragraph use.
 */
export const TEXT_DEFAULT_WEIGHT: Record<TextSize, TypographyWeight> = {
  "body-0": "semibold",
  "body-1": "medium",
  "body-2": "medium",
  "body-3": "medium",
  "body-4": "medium",
};

/**
 * Default semantic HTML element per heading level. Used by `Heading`
 * when the consumer omits the explicit `as` prop — preserves a
 * sensible document outline without making the consumer think about
 * heading semantics at every call site.
 *
 * - `h1` / `headline-0` → `<h1>`
 * - `h2` / `headline-1` → `<h2>`
 * - `h3` / `headline-2` → `<h3>`
 * - `headline-3` → `<h4>`
 * - `headline-4` → `<h5>`
 */
export const HEADING_DEFAULT_AS: Record<HeadingLevel, "h1" | "h2" | "h3" | "h4" | "h5"> = {
  h1: "h1",
  "headline-0": "h1",
  h2: "h2",
  "headline-1": "h2",
  h3: "h3",
  "headline-2": "h3",
  "headline-3": "h4",
  "headline-4": "h5",
};

/**
 * Text alignment token → Tailwind class. `left` resolves to no class
 * (default LTR rendering) — included for prop-shape symmetry. Shared
 * by both `Heading` and `Text`.
 */
export const ALIGN_CLASS: Record<"left" | "center" | "right", string> = {
  left: "",
  center: "gencl:text-center",
  right: "gencl:text-right",
};
