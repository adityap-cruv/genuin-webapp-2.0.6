/**
 * Shared design-system token maps for the layout primitives.
 *
 * Single source of truth for the lookups that turn DS-named spacing tokens
 * (`xxs` / `xs` / … / `xxl`) into Tailwind class strings. Every layout
 * primitive imports from this module — if the DS scale shifts, only this
 * file changes.
 *
 * Pixel values mirror the Genuin Master Design System V2 Padding scale
 * (Figma node `6162:726`). The scale tops at 40 px (`paddingXXL`). The
 * size scale's 48 px (`sizeXXL`) is intentionally NOT included — that's
 * element-sizing, not spacing.
 */

/**
 * DS-aligned spacing scale used by every layout primitive's `gap` /
 * `padding` props. Lowercase short form on the prop API; the Figma DS
 * names (`paddingXXS` … `paddingXXL`) live as JSDoc cross-references on
 * each map entry below.
 */
export type DsSpace = "none" | "xxs" | "xs" | "sm" | "md" | "ml" | "lg" | "xl" | "xxl";

/**
 * DS space token → Tailwind `gap-*` class. Used by every primitive that
 * accepts a symmetric `gap` prop (`Row`, `Column`, `Stack`, `Cluster`,
 * `Grid`, `SplitView`).
 *
 * Cross-references to the Figma DS Padding scale (node `6162:726`):
 * - `xxs` (4 px)  → `paddingXXS`
 * - `xs`  (8 px)  → `paddingXS`
 * - `sm`  (12 px) → `paddingSM`
 * - `md`  (16 px) → `padding`     (DS default, no suffix)
 * - `ml`  (20 px) → `paddingMD`   ("medium-large" — preserves the 8-step granularity)
 * - `lg`  (24 px) → `paddingLG`
 * - `xl`  (32 px) → `paddingXL`
 * - `xxl` (40 px) → `paddingXXL`  (top of the spacing scale)
 */
export const GAP_CLASS: Record<DsSpace, string> = {
  none: "gencl:gap-0",
  xxs: "gencl:gap-1",
  xs: "gencl:gap-2",
  sm: "gencl:gap-3",
  md: "gencl:gap-4",
  ml: "gencl:gap-5",
  lg: "gencl:gap-6",
  xl: "gencl:gap-8",
  xxl: "gencl:gap-10",
};

/**
 * DS space token → Tailwind `gap-x-*` class (column gap only). Used by
 * `Grid` when the consumer wants asymmetric column / row gaps.
 */
export const COL_GAP_CLASS: Record<DsSpace, string> = {
  none: "gencl:gap-x-0",
  xxs: "gencl:gap-x-1",
  xs: "gencl:gap-x-2",
  sm: "gencl:gap-x-3",
  md: "gencl:gap-x-4",
  ml: "gencl:gap-x-5",
  lg: "gencl:gap-x-6",
  xl: "gencl:gap-x-8",
  xxl: "gencl:gap-x-10",
};

/**
 * DS space token → Tailwind `gap-y-*` class (row gap only). Used by
 * `Grid` when the consumer wants asymmetric column / row gaps.
 */
export const ROW_GAP_CLASS: Record<DsSpace, string> = {
  none: "gencl:gap-y-0",
  xxs: "gencl:gap-y-1",
  xs: "gencl:gap-y-2",
  sm: "gencl:gap-y-3",
  md: "gencl:gap-y-4",
  ml: "gencl:gap-y-5",
  lg: "gencl:gap-y-6",
  xl: "gencl:gap-y-8",
  xxl: "gencl:gap-y-10",
};

/**
 * DS space token → Tailwind `px-*` class (horizontal padding). Used by
 * `Container.px`. The full `DsSpace` set is supported even though the
 * `Container.px` prop type narrows to a smaller subset — keeping the
 * map exhaustive matches the other maps' shape and protects against
 * silent token additions.
 */
export const PX_CLASS: Record<DsSpace, string> = {
  none: "gencl:px-0",
  xxs: "gencl:px-1",
  xs: "gencl:px-2",
  sm: "gencl:px-3",
  md: "gencl:px-4",
  ml: "gencl:px-5",
  lg: "gencl:px-6",
  xl: "gencl:px-8",
  xxl: "gencl:px-10",
};

/**
 * Container max-width tokens. Names align 1:1 with the Hierarchical
 * Tree canonical breakpoint set (HIERARCHICAL_TREE_SPEC.md §2.8) so a
 * `<Container maxW="desktop">` targets the exact Figma desktop frame
 * without committing to a px literal in the artifact.
 *
 * The `string` arm of this union is the raw escape hatch — passing a
 * value like `"960px"` falls through to inline `style.maxWidth`.
 */
export type ContainerMaxW = "mobile" | "tablet-sm" | "tablet" | "desktop" | "desktop-wide" | "full" | (string & {});

/**
 * Named-token `Container.maxW` → Tailwind class. Raw string values
 * (e.g. `"960px"`) are NOT in this map — they're applied via inline
 * `style.maxWidth` at the call site in `Container`.
 */
export const MAX_W_CLASS: Record<"mobile" | "tablet-sm" | "tablet" | "desktop" | "desktop-wide" | "full", string> = {
  mobile: "gencl:max-w-[420px]",
  "tablet-sm": "gencl:max-w-[748px]",
  tablet: "gencl:max-w-[1024px]",
  desktop: "gencl:max-w-[1280px]",
  "desktop-wide": "gencl:max-w-[1512px]",
  full: "gencl:max-w-full",
};

/**
 * Type guard: does the given `Container.maxW` value match a named
 * token (and therefore resolve via `MAX_W_CLASS`)? Returns `false` for
 * raw string escape-hatch values, which the caller should apply via
 * inline `style.maxWidth` instead.
 */
export function isNamedMaxW(
  value: ContainerMaxW
): value is "mobile" | "tablet-sm" | "tablet" | "desktop" | "desktop-wide" | "full" {
  return (
    value === "mobile" ||
    value === "tablet-sm" ||
    value === "tablet" ||
    value === "desktop" ||
    value === "desktop-wide" ||
    value === "full"
  );
}
