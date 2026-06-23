import { cn } from "@genuin/ui/lib/utils";
import {
  NAV_BUTTON_COLORS,
  NavChevron,
  IconCircleButton,
  type NavChevronDirection,
  type PlayerControlSize,
} from "@genuin/ui/player-controls";
import type { CSSProperties } from "react";

import { useDeviceDetection } from "@genuin/components/hooks/use-device-detection";

type EmbedVariant = "grid" | "carousel" | "feed" | "dynamic" | "standard_wall" | "expand_only" | undefined;
type ButtonClickHandler = (e: React.MouseEvent<HTMLButtonElement>) => void;

interface NavigationButtonsV2Props {
  embedVariant?: EmbedVariant;
  onPrev: ButtonClickHandler;
  onNext: ButtonClickHandler;
  isPrevDisabled?: boolean;
  isNextDisabled?: boolean;
  /** Double-circle size token. @default "lg" */
  size?: PlayerControlSize;
  /** Colour theme for the solid double-circle fill. @default "dark" */
  theme?: "light" | "dark";
}

/**
 * Design System V2 embed navigation arrows (double-circle `IconCircleButton`).
 * Carousel renders left/right; every other variant renders the vertical up/down
 * pair. iHeart is handled by the legacy buttons, not here. Solid fill + glyph
 * colours mirror the legacy V1 palette so the arrows stay visible on dark
 * backdrops. Defaults to `lg` but the caller can override per view via `size`.
 */
export function NavigationButtonsV2({
  embedVariant,
  onPrev,
  onNext,
  isPrevDisabled = false,
  isNextDisabled = false,
  size = "lg",
  theme = "dark",
}: NavigationButtonsV2Props) {
  const { isIOS, isMac } = useDeviceDetection();
  const isCarousel = embedVariant === "carousel";
  const colors = NAV_BUTTON_COLORS[theme];

  // Safari-specific optimization styles to prevent flickering during swiper transitions
  const safariOptimizationStyles: CSSProperties =
    isIOS || isMac
      ? {
          transform: "translateZ(0)",
          backfaceVisibility: "hidden",
          WebkitBackfaceVisibility: "hidden",
          WebkitTransform: "translateZ(0)",
          willChange: "transform",
        }
      : {};

  const navButton = (direction: NavChevronDirection, disabled: boolean, onClick: ButtonClickHandler, label: string) => (
    <button
      type="button"
      onClick={(e) => {
        if (!disabled) onClick(e);
      }}
      disabled={disabled}
      aria-label={label}
      className={cn(
        "gencl:rounded-full gencl:transition-opacity gencl:duration-200",
        disabled && "gencl:opacity-40 gencl:cursor-not-allowed"
      )}
      style={safariOptimizationStyles}>
      <IconCircleButton
        size={size}
        outerBg={colors.outer}
        innerBg={colors.inner}
        icon={<NavChevron direction={direction} color={colors.glyph} />}
      />
    </button>
  );

  // Carousel layout - side navigation buttons
  if (isCarousel) {
    return (
      <div className="gencl:absolute gencl:z-20 gencl:inset-y-0 gencl:left-0 gencl:right-0 gencl:pointer-events-none">
        <div className="gencl:h-full gencl:w-full gencl:flex gencl:justify-between gencl:items-center">
          <div className="gencl:ml-2 gencl:pointer-events-auto">
            {navButton("left", isPrevDisabled, onPrev, "Previous")}
          </div>
          <div className="gencl:mr-2 gencl:pointer-events-auto">
            {navButton("right", isNextDisabled, onNext, "Next")}
          </div>
        </div>
      </div>
    );
  }

  // Feed / grid layout - vertical buttons on right side
  return (
    <div className="gencl:absolute gencl:z-20 gencl:right-2 gencl:top-1/2 gencl:transform gencl:-translate-y-1/2 gencl:flex gencl:flex-col gencl:gap-2">
      {navButton("up", isPrevDisabled, onPrev, "Previous")}
      {navButton("down", isNextDisabled, onNext, "Next")}
    </div>
  );
}
