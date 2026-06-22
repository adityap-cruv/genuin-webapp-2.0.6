import type React from "react";

/** Visual style variants for all button atoms. */
export type ButtonVariant = "ghost" | "solid" | "outline";

/** Icon size variants: sm=14px icon/16px shell, md=16px icon/24px shell, lg=20px icon/32px shell, xl=24px icon/40px shell. */
export type ButtonSize = "sm" | "md" | "lg" | "xl";

/** Props shared by every button atom. */
export interface ButtonBaseProps {
  /** Visual style. Defaults to 'ghost'. */
  variant?: ButtonVariant;
  /** Controls both icon size and ghost shell size. Defaults to 'md'. */
  size?: ButtonSize;
  /** Merged onto the outer element's inline style. */
  style?: React.CSSProperties;
  /** Click handler. */
  onClick: () => void;
}

/** Maps ButtonSize to pixel dimensions for the icon image. */
export const SIZE_MAP: Record<ButtonSize, { width: string; height: string }> = {
  sm: { width: "14px", height: "14px" },
  md: { width: "16px", height: "16px" },
  lg: { width: "20px", height: "20px" },
  xl: { width: "24px", height: "24px" },
};

/**
 * Ghost shell Tailwind classes per size — applied when variant='ghost'.
 * Sets the square shell dimensions and padding so callers don't need an explicit style prop.
 */
export const GHOST_SHELL_CLASSES: Record<ButtonSize, string> = {
  sm: "gencl:w-4 gencl:h-4 gencl:p-[3px]",
  md: "gencl:w-6 gencl:h-6 gencl:p-1",
  lg: "gencl:w-8 gencl:h-8 gencl:p-2",
  xl: "gencl:w-10 gencl:h-10 gencl:p-2.5",
};

/** Tailwind classes per ButtonVariant applied to the outer <button>. */
export const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  ghost: "gencl:bg-[#00000066] gencl:backdrop-blur-[10px]",
  solid: "gencl:bg-black",
  outline: "gencl:bg-transparent gencl:border gencl:border-white",
};
