import { OctoIconAnimated } from "@genuin/ui/icons";
import { cn } from "@genuin/ui/utils";
import type { OctoActionIconProps } from "./octo-action-icon.types";
import { useCallback, type CSSProperties, type MouseEvent } from "react";
import { useOctoAnimation } from "./use-octo-animation";

/**
 * OctoActionIcon - Animated Octo icon component with loading states
 *
 * A simplified wrapper around OctoIconAnimated that handles:
 * - Lazy loading of animation data
 * - Loading and error states with fallbacks
 * - Click interactions
 * - Animation lifecycle callbacks
 *
 * Architecture:
 * - OctoActionIcon (this component) - UI wrapper with interaction handlers
 * - useOctoAnimation hook - Animation data loading and caching
 * - OctoIconAnimated - Lottie rendering layer
 *
 * @example
 * ```tsx
 * <OctoActionIcon
 *   size={32}
 *   isActive={false}
 *   onClick={handleClick}
 * />
 * ```
 */
export function OctoActionIcon({
  className,
  size = 48,
  isActive = false,
  onAnimationComplete,
  onClick,
  ...restProps
}: OctoActionIconProps) {
  const { animationData, isLoading, hasError } = useOctoAnimation();

  const dimensionStyle: CSSProperties | undefined =
    size !== undefined ? { width: size, height: size } : undefined;

  const handleClick = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      onClick?.(e);
    },
    [onClick]
  );

  const handleComplete = useCallback(() => {
    onAnimationComplete?.();
  }, [onAnimationComplete]);

  // Loading or error state - show minimal placeholder
  if (isLoading || hasError) {
    return (
      <div
        className={cn(
          "gencl:flex gencl:items-center gencl:justify-center gencl:rounded-full gencl:bg-secondary-100",
          className
        )}
        style={dimensionStyle}
        data-active={isActive ? true : undefined}
        onClick={handleClick}
        {...restProps}
      >
        <div className="gencl:text-xs gencl:text-center gencl:text-secondary-500" />
      </div>
    );
  }

  // Render Lottie animation
  return (
    <div
      className={cn(
        "gencl:flex gencl:items-center gencl:justify-center gencl:cursor-pointer",
        className
      )}
      style={dimensionStyle}
      data-active={isActive ? true : undefined}
      onClick={handleClick}
      {...restProps}
    >
      <OctoIconAnimated
        src={animationData}
        width={size}
        height={size}
        loop
        autoplay
        playing
        onComplete={handleComplete}
      />
    </div>
  );
}
