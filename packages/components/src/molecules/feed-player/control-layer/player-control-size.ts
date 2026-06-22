/** Dark Overlay design tokens — outer circle (20%) and inner circle (40%). */
export const DARK_OVERLAY_20 = "rgba(19, 20, 21, 0.20)";
export const DARK_OVERLAY_40 = "rgba(19, 20, 21, 0.40)";

/**
 * Player-control button size scale (Design System V2). Each token pairs the
 * outer/inner circle diameters with the icon glyph size and per-circle backdrop
 * blur, in pixels. Maps to design tokens XSmall…XLarge.
 */
export const PLAYER_CONTROL_SIZE = {
  /** XSmall */
  xs: { outer: 16, inner: 12, glyph: 8, outerBlur: 2.5, innerBlur: 7.5 },
  /** Small */
  sm: { outer: 24, inner: 18, glyph: 12, outerBlur: 5.625, innerBlur: 8.333 },
  /** Medium */
  md: { outer: 32, inner: 24, glyph: 16, outerBlur: 5.625, innerBlur: 8.333 },
  /** Large */
  lg: { outer: 48, inner: 40, glyph: 24, outerBlur: 7.5, innerBlur: 7.5 },
  /** XLarge */
  xl: { outer: 64, inner: 56, glyph: 36, outerBlur: 7.5, innerBlur: 7.5 },
} as const;

export type PlayerControlSize = keyof typeof PLAYER_CONTROL_SIZE;

/** Container-width breakpoints: min px where each band starts. Read as `GEN_BP.sm`.
 *  Bands: <151→lg · 151-200→xs · 201-400→sm · 401-600→md · ≥601→lg */
export const GEN_BP = {
  xs: 151,
  sm: 201,
  md: 401,
  lg: 601,
} as const;

export type GenBreakpoint = keyof typeof GEN_BP;

/** Size token used when containerWidth ≥ 601 or is below the xs floor. */
export const PLAYER_CONTROL_FALLBACK_SIZE: PlayerControlSize = "lg";

/** Maps container width (px) → PlayerControlSize token. <151 and ≥601 fall back to lg. */
export function resolveControlSize(containerWidth: number): PlayerControlSize {
  if (containerWidth < GEN_BP.xs) return PLAYER_CONTROL_FALLBACK_SIZE;
  if (containerWidth < GEN_BP.sm) return "xs";
  if (containerWidth < GEN_BP.md) return "sm";
  if (containerWidth < GEN_BP.lg) return "md";
  return PLAYER_CONTROL_FALLBACK_SIZE;
}

/** Sponsored pill dimensions (px) per size token. xs/sm/md from Figma; lg/xl scaled up. */
export const SPONSORED_TAG_SIZE = {
  xs: { width: 50, height: 16, text: "gencl:text-[9px]" },
  sm: { width: 68, height: 22, text: "gencl:text-[10px]" },
  md: { width: 79, height: 24, text: "gencl:text-xs" },
  lg: { width: 90, height: 28, text: "gencl:text-[13px]" },
  xl: { width: 100, height: 32, text: "gencl:text-sm" },
} as const;
