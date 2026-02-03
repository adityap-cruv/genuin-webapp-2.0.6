import {
  ArrowLeftIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronUpIcon,
  XIcon,
} from "@genuin/ui/icons";
import { Button, ButtonProps } from "@genuin/ui/button";
import { cn } from "@genuin/ui/lib/utils";
import { useEffect, useState } from "react";
import { Swiper } from "swiper/types";

export function CloseButton({
  theme,
  className,
  onCloseClick,
}: {
  className?: string;
  theme?: "light" | "dark";
  onCloseClick?: () => void;
}) {
  return (
    <Button
      variant="icon"
      className={cn(
        "gencl:text-white gencl:flex gencl:flex-col",
        "gencl:absolute gencl:right-7.5 gencl:top-6 gencl:rounded-full",
        theme === "dark"
          ? "gencl:bg-secondary-800"
          : "gencl:bg-secondary-50 gencl:border-secondary-50",
        className
      )}
      onClick={onCloseClick}
      theme="custom"
    >
      <XIcon theme={theme} size="md" />
    </Button>
  );
}

export function BackButton({
  onBackClick,
  theme,
  websiteType,
}: {
  onBackClick?: () => void;
  theme?: "light" | "dark";
  websiteType?: "legacy" | "polaris" | undefined;
}) {
  return (
    <>
      {websiteType === "polaris" && (
        <Button
          variant="icon"
          shape="circle"
          size="lg"
          theme="custom"
          aria-label="Back"
          role="button"
          onClick={onBackClick}
          className={cn(
            "gencl:hidden! gencl:lg:flex!",
            theme === "dark"
              ? "gencl:bg-white gencl:hover:bg-white/90"
              : "gencl:bg-[#D9D9D9] gencl:hover:bg-[#D9D9D9]/90"
          )}
        >
          <ArrowLeftIcon
            theme={theme === "dark" ? "light" : "light"}
            size="md"
          />
        </Button>
      )}

      <Button
        id="player-header-back-button"
        variant="icon"
        theme="overlay"
        onClick={(e) => {
          e.stopPropagation();
          onBackClick?.();
        }}
        className={cn(
          "gencl:flex!",
          websiteType === "polaris" && "gencl:lg:hidden!"
        )}
        aria-label="Back"
        role="button"
        tabIndex={0}
      >
        <ChevronLeftIcon
          theme={theme === "dark" ? "dark" : "light"}
          size="lg"
          aria-hidden="true"
        />
      </Button>
    </>
  );
}

export function NavigationButton({
  swiper,
  postsLength,
  position = "fixed",
  className,
  theme,
  size,
  disable = false,
}: {
  swiper?: Swiper;
  postsLength?: number;
  position?: "fixed" | "absolute" | "relative";
  className?: string;
  theme?: "light" | "dark";
  size: ButtonProps["size"];
  disable?: boolean;
}) {
  // State to force re-render when swiper state changes
  const [, forceUpdate] = useState({});
  const [prevHovered, setPrevHovered] = useState(false);
  const [nextHovered, setNextHovered] = useState(false);

  useEffect(() => {
    if (swiper && swiper.update) {
      swiper.update();
      forceUpdate({});
    }
  }, [postsLength, swiper]);

  if (!swiper) return null;

  const currentSlide = swiper.activeIndex + 1;
  const totalSlides = postsLength ?? swiper.slides.length;

  // Define theme colors consistent with navigation-buttons.tsx
  const isDarkTheme = theme === "dark";

  // Dark theme colors
  const darkTheme = {
    disabled: { button: "#3F4447", icon: "#717277" },
    default: { button: "#F6F8F9", icon: "#27292D" },
    hover: { button: "#A9AFB2", icon: "#27292D" },
  };

  // Light theme colors
  const lightTheme = {
    disabled: { button: "#E6EAED", icon: "#A9AFB2" },
    default: { button: "#27292D", icon: "#FFFFFF" },
    hover: { button: "#717277", icon: "#FFFFFF" },
  };

  const colors = isDarkTheme ? darkTheme : lightTheme;

  // Helper function to get button styles
  const getButtonStyles = (disabled: boolean, isHovered: boolean) => {
    const buttonBg = disabled
      ? colors.disabled.button
      : isHovered
        ? colors.hover.button
        : colors.default.button;

    const iconFill = disabled
      ? colors.disabled.icon
      : isHovered
        ? colors.hover.icon
        : colors.default.icon;

    return { buttonBg, iconFill };
  };

  const prevStyles = getButtonStyles(
    swiper.isBeginning || disable,
    prevHovered
  );
  const nextStyles = getButtonStyles(swiper.isEnd || disable, nextHovered);

  return (
    <div
      className={cn(
        "gencl:z-50 gencl:text-white gencl:flex gencl:flex-col gencl:gap-4",
        position === "fixed" &&
          "gencl:fixed gencl:right-7.5 gencl:top-1/2 gencl:-translate-y-1/2",
        position === "absolute" &&
          "gencl:absolute gencl:right-7.5 gencl:top-1/2 gencl:-translate-y-1/2",
        position === "relative" && "gencl:relative",
        className
      )}
      role="navigation"
      aria-label="Video navigation"
    >
      <div
        onMouseEnter={() =>
          !(swiper.isBeginning || disable) && setPrevHovered(true)
        }
        onMouseLeave={() => setPrevHovered(false)}
      >
        <Button
          variant="icon"
          shape="circle"
          size={size}
          theme="custom"
          className={cn(
            "gencl:transition-all gencl:duration-200",
            (swiper.isBeginning || disable) && "gencl:cursor-not-allowed!"
          )}
          style={{
            background: prevStyles.buttonBg,
          }}
          disabled={swiper.isBeginning || disable}
          onClick={() => {
            if (!disable) {
              setPrevHovered(false);
              swiper.slidePrev();
            }
          }}
          aria-label={`Previous video (${currentSlide - 1} of ${totalSlides})`}
          aria-disabled={swiper.isBeginning || disable}
          tabIndex={0}
        >
          <ChevronUpIcon
            theme={theme === "light" ? "dark" : "light"}
            size="lg"
            aria-hidden="true"
            className="gencl:transition-colors gencl:duration-200"
            style={{ fill: prevStyles.iconFill }}
          />
        </Button>
      </div>
      <div
        onMouseEnter={() => !(swiper.isEnd || disable) && setNextHovered(true)}
        onMouseLeave={() => setNextHovered(false)}
      >
        <Button
          variant="icon"
          shape="circle"
          size={size}
          theme="custom"
          className={cn(
            "gencl:transition-all gencl:duration-200",
            (swiper.isEnd || disable) && "gencl:cursor-not-allowed!"
          )}
          style={{
            background: nextStyles.buttonBg,
          }}
          disabled={swiper.isEnd || disable}
          onClick={() => {
            if (!disable) {
              setNextHovered(false);
              swiper.slideNext();
            }
          }}
          aria-label={`Next video (${currentSlide + 1} of ${totalSlides})`}
          aria-disabled={swiper.isEnd || disable}
          tabIndex={0}
        >
          <ChevronDownIcon
            theme={theme === "light" ? "dark" : "light"}
            size="lg"
            aria-hidden="true"
            className="gencl:transition-colors gencl:duration-200"
            style={{ fill: nextStyles.iconFill }}
          />
        </Button>
      </div>
    </div>
  );
}
