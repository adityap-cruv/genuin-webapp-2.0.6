import { Button } from "@genuin/ui/components";
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
} from "@genuin/ui";
import { useEmbedManagerContext } from "./context";
import { useEmbedConfigs } from "@genuin/components/hooks/embed/use-embed-config";
import { useCallback, useState, useEffect } from "react";

interface NavigationButtonsProps {
  isIheartLayout?: boolean;
  theme?: "light" | "dark";
  embedVariant?: "carousel" | "feed";
  onPrev: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onNext: (e: React.MouseEvent<HTMLButtonElement>) => void;
  isNavigationControlEnabled: boolean;
  isPrevDisabled?: boolean;
  isNextDisabled?: boolean;
}

export function NavigationButtons({
  isIheartLayout = false,
  theme = "light",
  embedVariant: providedEmbedVariant,
  onPrev,
  onNext,
  isNavigationControlEnabled,
  isPrevDisabled = false,
  isNextDisabled = false,
}: NavigationButtonsProps) {
  // Early return if navigation is disabled
  if (!isNavigationControlEnabled) return null;

  // Determine layout and states
  const embedVariant = providedEmbedVariant;
  const isCarousel = embedVariant === "carousel";

  // Theme configuration
  const iconTheme = theme === "dark" ? "dark" : "light";

  // Click handlers
  const handlePrevClick = onPrev;
  const handleNextClick = onNext;

  // Helper to create navigation buttons
  const createNavButton = ({
    Icon,
    disabled,
    onClick,
    label,
    size = "md",
    className,
    style,
    iconClassName,
    iconStyle,
  }: {
    Icon: React.ComponentType<any>;
    disabled: boolean;
    onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
    label: string;
    size?: "sm" | "md";
    className?: string;
    style?: React.CSSProperties;
    iconClassName?: string;
    iconStyle?: React.CSSProperties;
  }) => (
    <Button
      variant="icon"
      shape="circle"
      size={size}
      theme={"custom"}
      disabled={disabled}
      onClick={onClick}
      aria-label={label}
      className={className}
      style={style}
    >
      <Icon
        theme={iconTheme}
        className={iconClassName}
        style={iconStyle}
        size="lg"
      />
    </Button>
  );

  // iHeart layout - horizontal buttons below embed
  if (isIheartLayout) {
    // Define styles based on theme
    const isDarkTheme = theme === "dark";

    // Dark theme colors
    const darkTheme = {
      disabled: { button: "#3F4447", icon: "#717277" },
      default: { button: "white", icon: "#27292D" },
      hover: { button: "#A9AFB2", icon: "#27292D" },
    };

    // Light theme colors
    const lightTheme = {
      disabled: { button: "#E6EAED", icon: "#A9AFB2" },
      default: { button: "#27292D", icon: "white" },
      hover: { button: "#717277", icon: "white" },
    };

    const colors = isDarkTheme ? darkTheme : lightTheme;

    // Component with hover and focus state
    const IHeartNavButton = ({
      Icon,
      disabled,
      onClick,
      label,
    }: {
      Icon: React.ComponentType<any>;
      disabled: boolean;
      onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
      label: string;
    }) => {
      const [isHovered, setIsHovered] = useState(false);

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

      return (
        <div
          onMouseEnter={() => !disabled && setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {createNavButton({
            Icon,
            disabled,
            onClick: (e) => {
              setIsHovered(false);
              onClick(e);
            },
            label,
            size: "sm",
            className: `gencl:transition-all gencl:duration-200 gencl:outline-none gencl:focus:outline-1 ${disabled ? "gencl:cursor-not-allowed!" : ""}`,
            style: {
              background: buttonBg,
            },
            iconClassName: "gencl:transition-colors gencl:duration-200",
            iconStyle: { fill: iconFill },
          })}
        </div>
      );
    };

    return (
      <div className="gencl:flex gencl:justify-center gencl:items-center gencl:gap-2 gencl:my-4">
        <IHeartNavButton
          Icon={ChevronLeftIcon}
          disabled={isPrevDisabled}
          onClick={handlePrevClick}
          label="Previous"
        />
        <IHeartNavButton
          Icon={ChevronRightIcon}
          disabled={isNextDisabled}
          onClick={handleNextClick}
          label="Next"
        />
      </div>
    );
  }

  // Carousel layout - side navigation buttons
  if (isCarousel) {
    return (
      <div className="gencl:absolute gencl:z-20 gencl:inset-y-0 gencl:left-0 gencl:right-0 gencl:pointer-events-none">
        <div className="gencl:h-full gencl:w-full gencl:flex gencl:justify-between gencl:items-center">
          <div className="gencl:ml-2 gencl:pointer-events-auto">
            {createNavButton({
              Icon: ChevronLeftIcon,
              disabled: isPrevDisabled,
              onClick: handlePrevClick,
              label: "Previous",
            })}
          </div>
          <div className="gencl:mr-2 gencl:pointer-events-auto">
            {createNavButton({
              Icon: ChevronRightIcon,
              disabled: isNextDisabled,
              onClick: handleNextClick,
              label: "Next",
            })}
          </div>
        </div>
      </div>
    );
  }

  // Feed layout - vertical buttons on right side
  return (
    <div className="gencl:absolute gencl:z-20 gencl:right-2 gencl:top-1/2 gencl:transform gencl:-translate-y-1/2 gencl:flex gencl:flex-col gencl:gap-2">
      {createNavButton({
        Icon: ChevronUpIcon,
        disabled: isPrevDisabled,
        onClick: handlePrevClick,
        label: "Previous",
      })}
      {createNavButton({
        Icon: ChevronDownIcon,
        disabled: isNextDisabled,
        onClick: handleNextClick,
        label: "Next",
      })}
    </div>
  );
}

export function NavigationButtonsWithContext({
  totalSlides,
  isIheartLayout = false,
  theme,
}: {
  totalSlides: number;
  isIheartLayout?: boolean;
  theme?: "light" | "dark";
}) {
  const {
    goToNextVideo,
    goToPreviousVideo,
    activeIndex,
    getSlideVisibilityPercentage,
    swiper,
  } = useEmbedManagerContext();
  const config = useEmbedConfigs();

  const [isPrevDisabled, setIsPrevDisabled] = useState(false);
  const [isNextDisabled, setIsNextDisabled] = useState(false);

  const handlePrev = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      goToPreviousVideo();
    },
    [goToPreviousVideo]
  );

  const handleNext = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      goToNextVideo();
    },
    [goToNextVideo]
  );

  // Function to update disabled state based on current swiper state
  const updateDisabledState = useCallback(() => {
    if (isIheartLayout) {
      // For iHeart layout, use slide visibility percentage
      // Disable prev if slide at index 1 is fully visible
      const prevDisabled =
        getSlideVisibilityPercentage({
          index: 0,
          dir: "horizontal",
        }) === 100;

      // Disable next if last slide is fully visible
      const nextDisabled =
        getSlideVisibilityPercentage({
          index: totalSlides - 1,
          dir: "horizontal",
        }) === 100;

      setIsPrevDisabled(prevDisabled);
      setIsNextDisabled(nextDisabled);
    } else {
      // For standard layouts, use activeIndex
      setIsPrevDisabled(activeIndex === 0);
      setIsNextDisabled(activeIndex === totalSlides - 1);
    }
  }, [activeIndex, totalSlides, isIheartLayout, getSlideVisibilityPercentage]);

  // Update disabled state when dependencies change
  useEffect(() => {
    updateDisabledState();
  }, [updateDisabledState]);

  // Listen to swiper events to update disabled state when slides move
  useEffect(() => {
    if (!swiper) return;

    // Update on progress (for continuous updates during scrolling)
    const handleProgress = () => {
      updateDisabledState();
    };

    // Update on transitionEnd (when swiper transition completes)
    const handleTransitionEnd = () => {
      updateDisabledState();
    };

    swiper.on("progress", handleProgress);
    swiper.on("transitionEnd", handleTransitionEnd);

    return () => {
      swiper.off("progress", handleProgress);
      swiper.off("transitionEnd", handleTransitionEnd);
    };
  }, [swiper, updateDisabledState]);

  return (
    <NavigationButtons
      isIheartLayout={isIheartLayout}
      onPrev={handlePrev}
      onNext={handleNext}
      isNavigationControlEnabled={
        config.view.isNavigationControlEnabled ?? false
      }
      isPrevDisabled={isPrevDisabled}
      isNextDisabled={isNextDisabled}
      theme={theme}
    />
  );
}
