// ── Overlay color tokens ────────────────────────────────────────────────
/** Dark tint over video — outer ring (20%) / inner circle (40%) backgrounds. */
export const DARK_OVERLAY_20 = "rgba(19, 20, 21, 0.20)";
export const DARK_OVERLAY_40 = "rgba(19, 20, 21, 0.40)";
/** Light tint — the volume ring's idle color (see volume-ring.tsx). */
export const LIGHT_OVERLAY_40 = "rgba(244, 245, 246, 0.40)";
/** Light tint — expand-view nav button group's outer ring background. */
export const LIGHT_OVERLAY_20 = "rgba(244, 245, 246, 0.20)";

// ── Core double-circle size scale ───────────────────────────────────────
/**
 * Outer/inner circle diameters + glyph size + backdrop blur (px), per Design
 * System V2 token XSmall…XLarge. `stroke` = glyph outline width, applied with
 * `non-scaling-stroke` so it renders as literal device px at every size.
 */
export const PLAYER_CONTROL_SIZE = {
  xs: { outer: 16, inner: 12, glyph: 8, outerBlur: 2.5, innerBlur: 7.5, stroke: 0.75 },
  sm: { outer: 24, inner: 18, glyph: 12, outerBlur: 5.625, innerBlur: 8.333, stroke: 1 },
  md: { outer: 32, inner: 24, glyph: 16, outerBlur: 5.625, innerBlur: 8.333, stroke: 1.25 },
  lg: { outer: 48, inner: 40, glyph: 24, outerBlur: 7.5, innerBlur: 7.5, stroke: 2 },
  xl: { outer: 64, inner: 56, glyph: 36, outerBlur: 7.5, innerBlur: 7.5, stroke: 3.75 },
} as const;

export type PlayerControlSize = keyof typeof PLAYER_CONTROL_SIZE;

// ── Container-width → size-token resolver ───────────────────────────────
/** Min px where each band starts. <201→xs · 201-400→sm · 401-600→md · ≥601→lg. */
export const GEN_BP = {
  xs: 151,
  sm: 201,
  md: 401,
  lg: 601,
} as const;

export type GenBreakpoint = keyof typeof GEN_BP;

/** Size token for containerWidth ≥ 601 (the largest band). */
export const PLAYER_CONTROL_FALLBACK_SIZE: PlayerControlSize = "lg";

/** Maps container width (px) → PlayerControlSize token. */
export function resolveControlSize(containerWidth: number): PlayerControlSize {
  // <201 → xs. Below the 151 xs-floor the SPONSORED BADGE still renders (player
  // controls are hidden <150 in embed-tile.tsx), so return the smallest token —
  // NOT the lg fallback — to keep the badge monotonic across widths. Previously
  // sub-151 fell back to `lg`, making a 135px tile's badge bigger than a 168px
  // tile's (28px vs 16px).
  if (containerWidth < GEN_BP.sm) return "xs";
  if (containerWidth < GEN_BP.md) return "sm";
  if (containerWidth < GEN_BP.lg) return "md";
  return PLAYER_CONTROL_FALLBACK_SIZE;
}

// ── Per-component pixel-perfect size tables (from Figma) ────────────────
/** Sponsored pill height + text size per token. Width is `fit-content` — a fixed width left no room for padding at some tiers. */
export const SPONSORED_TAG_SIZE = {
  xs: { height: 16, text: "gencl:text-[9px]" },
  sm: { height: 22, text: "gencl:text-[10px]" },
  md: { height: 24, text: "gencl:text-[11px]" },
  lg: { height: 28, text: "gencl:text-[13px]" },
  xl: { height: 32, text: "gencl:text-[14px]" },
} as const;

/** Volume-slider track width per token. Height follows `token.outer`; xs falls back to sm. */
export const VOLUME_SLIDER_WIDTH: Record<PlayerControlSize, number> = {
  xs: 113,
  sm: 113,
  md: 120,
  lg: 160,
  xl: 188,
};

/**
 * "Tap to unmute" pill layout per token (Figma Audio-Volume set, node 8022:14851).
 * Icon is `PLAYER_CONTROL_SIZE[size].inner` with no outer ring — no separate size needed.
 */
export const TAP_TO_UNMUTE_SIZE: Record<
  PlayerControlSize,
  { padLeft: number; gap: number; padRight: number; text: { width: number; height: number; className: string } }
> = {
  xs: { padLeft: 3, gap: 4, padRight: 8, text: { width: 71, height: 14, className: "gencl:text-[10px]" } },
  sm: { padLeft: 3, gap: 4, padRight: 8, text: { width: 71, height: 14, className: "gencl:text-[10px]" } },
  md: { padLeft: 4, gap: 4, padRight: 8, text: { width: 71, height: 14, className: "gencl:text-[10px]" } },
  lg: { padLeft: 4, gap: 4, padRight: 12, text: { width: 99, height: 20, className: "gencl:text-[14px]" } },
  xl: { padLeft: 4, gap: 4, padRight: 12, text: { width: 113, height: 22, className: "gencl:text-[16px]" } },
};
