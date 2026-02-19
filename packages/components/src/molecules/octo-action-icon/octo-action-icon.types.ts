import type { ComponentProps } from "react";

export type OctoActionIconProps = ComponentProps<"div"> & {
  /**
   * Size of the icon in pixels
   * @default 32
   */
  size?: number | string;
  /**
   * Whether the icon is in an active/clicked state
   */
  isActive?: boolean;
  /**
   * Callback when the animation completes
   */
  onAnimationComplete?: () => void;
};
