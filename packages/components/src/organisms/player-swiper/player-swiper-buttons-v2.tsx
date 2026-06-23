import { cn } from "@genuin/ui/lib/utils";
import { NAV_BUTTON_COLORS, NavChevron, IconCircleButton, type PlayerControlSize } from "@genuin/ui/player-controls";
import { useEffect, useState } from "react";
import type { Swiper } from "swiper/types";

/**
 * Design System V2 expand-view navigation arrows (double-circle
 * `IconCircleButton`). Drop-in v2 visual for `NavigationButton`; iHeart keeps
 * the legacy buttons and never reaches here. Solid fill + glyph colours mirror
 * the legacy V1 palette so the arrows stay visible on dark backdrops. Defaults
 * to `lg`, overridable via `size`.
 */
export function NavigationButtonV2({
  swiper,
  postsLength,
  position = "fixed",
  className,
  disable = false,
  size = "lg",
  theme = "light",
}: {
  swiper?: Swiper;
  postsLength?: number;
  position?: "fixed" | "absolute" | "relative";
  className?: string;
  disable?: boolean;
  size?: PlayerControlSize;
  theme?: "light" | "dark";
}) {
  const colors = NAV_BUTTON_COLORS[theme];
  // Re-render on slide movement so the begin/end disabled state stays fresh
  // (there is no hover state driving re-renders like the legacy button had).
  const [, forceUpdate] = useState({});
  useEffect(() => {
    if (!swiper) return;
    const update = () => forceUpdate({});
    swiper.on("slideChange", update);
    swiper.on("transitionEnd", update);
    swiper.on("update", update);
    return () => {
      swiper.off("slideChange", update);
      swiper.off("transitionEnd", update);
      swiper.off("update", update);
    };
  }, [swiper]);

  if (!swiper) return null;

  const currentSlide = swiper.activeIndex + 1;
  const totalSlides = postsLength ?? swiper.slides.length;
  const prevDisabled = swiper.isBeginning || disable;
  const nextDisabled = swiper.isEnd || disable;

  return (
    <div
      className={cn(
        "gencl:z-50 gencl:flex gencl:flex-col gencl:gap-4",
        position === "fixed" && "gencl:fixed gencl:right-7.5 gencl:top-1/2 gencl:-translate-y-1/2",
        position === "absolute" && "gencl:absolute gencl:right-7.5 gencl:top-1/2 gencl:-translate-y-1/2",
        position === "relative" && "gencl:relative",
        className
      )}
      role="navigation"
      aria-label="Video navigation">
      <button
        type="button"
        disabled={prevDisabled}
        onClick={() => {
          if (!prevDisabled) swiper.slidePrev();
        }}
        aria-label={`Previous video (${currentSlide - 1} of ${totalSlides})`}
        aria-disabled={prevDisabled}
        tabIndex={0}
        className={cn(
          "gencl:rounded-full gencl:transition-opacity gencl:duration-200",
          prevDisabled && "gencl:opacity-40 gencl:cursor-not-allowed"
        )}>
        <IconCircleButton
          size={size}
          outerBg={colors.outer}
          innerBg={colors.inner}
          icon={<NavChevron direction="up" color={colors.glyph} />}
        />
      </button>
      <button
        type="button"
        disabled={nextDisabled}
        onClick={() => {
          if (!nextDisabled) swiper.slideNext();
        }}
        aria-label={`Next video (${currentSlide + 1} of ${totalSlides})`}
        aria-disabled={nextDisabled}
        tabIndex={0}
        className={cn(
          "gencl:rounded-full gencl:transition-opacity gencl:duration-200",
          nextDisabled && "gencl:opacity-40 gencl:cursor-not-allowed"
        )}>
        <IconCircleButton
          size={size}
          outerBg={colors.outer}
          innerBg={colors.inner}
          icon={<NavChevron direction="down" color={colors.glyph} />}
        />
      </button>
    </div>
  );
}
