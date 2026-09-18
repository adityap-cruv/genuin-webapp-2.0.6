import { cva, type VariantProps } from "class-variance-authority";
import { type ComponentProps } from "react";

import { cn, defaultSizesForIcons } from "@genuin/ui/lib/utils";

// Define the iconVariant function using cva to handle different styles based on props
const iconVariant = cva("", {
  variants: {
    theme: {
      dark: "gencl:stroke-white", // Dark variant style
      light: "gencl:stroke-black", // Light variant style
    },
    size: defaultSizesForIcons(),
  },
  defaultVariants: {
    theme: "dark",
    size: "md",
  },
});

// Define the Props type for the ExpandIcon component
type ExpandIconPropsType = ComponentProps<"svg"> & VariantProps<typeof iconVariant>;

// Corner-bracket expand glyph — STROKED, not filled. The design system sizes the
// bracket line by a per-size, NON-SCALING token (`PLAYER_CONTROL_SIZE.stroke`:
// 0.75 / 1 / 1.25 / 2 / 3.75 px), which `IconCircleButton` sets as
// `style.strokeWidth`. `vectorEffect="non-scaling-stroke"` keeps that width as
// literal device px at every glyph size, matching Figma exactly — a filled glyph
// can't (its thickness is baked in and scales with the icon). `strokeWidth` here
// (default 2) is only the fallback for non-button callers; the button's inline
// style wins. Round caps + joins per the current Figma glyph (node 18124:317760).
export function ExpandIcon({ theme, size, className, strokeWidth = 2, ...restProps }: ExpandIconPropsType) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 8 8"
      fill="none"
      strokeWidth={strokeWidth}
      className={cn(iconVariant({ theme, size }), className)}
      {...restProps}>
      <path
        d="M1.333 3V1.75C1.333 1.52 1.52 1.333 1.75 1.333H3"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      <path
        d="M5 1.333H6.25C6.48 1.333 6.667 1.52 6.667 1.75V3"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      <path
        d="M6.667 5V6.25C6.667 6.48 6.48 6.667 6.25 6.667H5"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      <path
        d="M3 6.667H1.75C1.52 6.667 1.333 6.48 1.333 6.25V5"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
