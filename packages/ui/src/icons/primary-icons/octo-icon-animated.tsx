import { cn } from "@genuin/ui/lib/utils";

import { LottieIcon } from "../../components/lottie/lottie-icon";
import type { LottieIconProps } from "../../components/lottie/lottie-icon.types";

type OctoIconAnimatedProps = Omit<LottieIconProps, "width" | "height"> & {
  /**
   * Width of the icon
   * @default 32
   */
  width?: number | string;
  /**
   * Height of the icon
   * @default 32
   */
  height?: number | string;
};

export function OctoIconAnimated({
  className,
  src,
  width = 32,
  height = 32,
  loop = true,
  autoplay = true,
  speed = 1,
  playing,
  onComplete,
  rendererSettings,
  ...restProps
}: OctoIconAnimatedProps) {
  return (
    <LottieIcon
      src={src}
      width={width}
      height={height}
      loop={loop}
      autoplay={autoplay}
      speed={speed}
      playing={playing}
      onComplete={onComplete}
      rendererSettings={rendererSettings}
      className={cn(className)}
      {...restProps}
    />
  );
}
