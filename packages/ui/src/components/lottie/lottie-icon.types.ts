import type { ComponentProps } from "react";
import type { IPlayerProps } from "@lottiefiles/react-lottie-player";

export type LottieIconProps = {
  /**
   * Lottie animation source - can be:
   * - URL string to .lottie file
   * - Imported .lottie file (e.g., import animation from './file.lottie')
   */
  src: string | object;
  /**
   * Whether to loop the animation
   * @default true
   */
  loop?: boolean;
  /**
   * Whether to autoplay the animation
   * @default true
   */
  autoplay?: boolean;
  /**
   * Animation speed (1 = normal speed)
   * @default 1
   */
  speed?: number;
  /**
   * Custom className for styling
   */
  className?: string;
  /**
   * Width of the Lottie animation
   */
  width?: number | string;
  /**
   * Height of the Lottie animation
   */
  height?: number | string;
  /**
   * Callback when animation completes
   */
  onComplete?: () => void;
  /**
   * Control animation playing state externally
   */
  playing?: boolean;
  /**
   * Additional renderer configuration passed to the underlying Lottie player
   */
  rendererSettings?: IPlayerProps["rendererSettings"];
} & ComponentProps<"div">;
