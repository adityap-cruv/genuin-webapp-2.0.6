import { Button } from "@genuin/ui/components/button";
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, ChevronUpIcon } from "@genuin/ui/icons";
import type { CSSProperties } from "react";
import { useCallback, useState, useEffect } from "react";

import { useEmbedConfigs } from "@genuin/components/hooks/embed/use-embed-config";
import { useDeviceDetection } from "@genuin/components/hooks/use-device-detection";
import { useSheetState } from "@genuin/components/hooks/use-sheet-state";
import type { PlayerControlSize } from "@genuin/components/molecules/feed-player/control-layer/player-control-size";
import { useNewPlayerControls } from "@genuin/components/molecules/feed-player/control-layer/use-new-player-controls";

import { useEmbedManagerContext } from "./context";
import { NavigationButtonsV2 } from "./navigation-buttons-v2";

// Common types
type Theme = "light" | "dark";
type EmbedVariant = "grid" | "carousel" | "feed" | "dynamic" | "standard_wall" | "expand_only" | undefined;
type ButtonSize = "sm" | "md";
type ButtonTheme =
  | "custom"
  | "overlay"
  | "text"
  | "primary"
  | "secondary"
  | "secondaryDark"
  | "outline"
  | "navigation"
  | null
  | undefined;
type ButtonClickHandler = (e: React.MouseEvent<HTMLButtonElement>) => void;

// Icon component type
type IconComponent = React.ComponentType<any>;

// Navigation button creation parameters
interface NavButtonConfig {
  Icon: IconComponent;
  disabled: boolean;
  onClick: ButtonClickHandler;
  label: string;
  size?: ButtonSize;
  className?: string;
  style?: React.CSSProperties;
  iconClassName?: string;
  iconStyle?: React.CSSProperties;
  theme?: ButtonTheme;
}

// iHeart navigation button props
interface IHeartNavButtonProps {
  Icon: IconComponent;
  disabled: boolean;
  onClick: ButtonClickHandler;
  label: string;
}

interface NavigationButtonsProps {
  isIheartLayout?: boolean;
  theme?: Theme;
  embedVariant?: EmbedVariant;
  onPrev: ButtonClickHandler;
  onNext: ButtonClickHandler;
  isNavigationControlEnabled: boolean;
  isPrevDisabled?: boolean;
  isNextDisabled?: boolean;
  hideNavButtons?: boolean;
  /** V2-only: double-circle size token for the design-system arrows. @default "md" */
  v2Size?: PlayerControlSize;
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
  hideNavButtons,
  v2Size,
}: NavigationButtonsProps) {
  const { isIOS, isMac } = useDeviceDetection();
  const isV2 = useNewPlayerControls();
  const {
    dimensions: { aspectRatio },
  } = useEmbedConfigs();

  // Early return if navigation is disabled
  if (!isNavigationControlEnabled || hideNavButtons) return null;

  // Determine layout and states
  const embedVariant = providedEmbedVariant;
  const isCarousel = embedVariant === "carousel";

  // Design System V2: double-circle arrows for every variant except iHeart,
  // which keeps its bespoke coloured buttons below. These buttons always overlay
  // the dark video, so they force the "dark" palette (white circle, dark glyph)
  // regardless of the page theme — matching the legacy V1 embed arrows.
  if (isV2 && !isIheartLayout) {
    return (
      <NavigationButtonsV2
        embedVariant={embedVariant}
        onPrev={onPrev}
        onNext={onNext}
        isPrevDisabled={isPrevDisabled}
        isNextDisabled={isNextDisabled}
        size={v2Size}
        theme="dark"
      />
    );
  }

  // Theme configuration
  const iconTheme = theme === "dark" ? "dark" : "light";

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
    theme = "custom",
  }: NavButtonConfig) => (
    <Button
      variant="icon"
      shape="circle"
      size={size}
      theme={theme}
      disabled={disabled}
      onClick={onClick}
      aria-label={label}
      className={className}
      style={{ ...style, ...safariOptimizationStyles }}>
      <Icon
        theme={iconTheme}
        className={iconClassName}
        style={{ ...iconStyle, ...safariOptimizationStyles }}
        size="lg"
      />
    </Button>
  );

  // iHeart layout - feed only; carousel falls through to standard left/right block
  if (isIheartLayout && !isCarousel) {
    // Define styles based on theme
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

    const iheartNavigationDivClasses = isCarousel
      ? "gencl:absolute gencl:left-1/2 gencl:flex gencl:justify-center gencl:items-center gencl:gap-2 gencl:my-4"
      : "gencl:absolute gencl:right-[-15%] gencl:bottom-1/2 gencl:flex gencl:justify-center gencl:items-center gencl:gap-2 gencl:my-4 gencl:z-1 gencl:flex-col gencl:translate-y-1/2";

    const colors = isDarkTheme ? darkTheme : lightTheme;

    // Component with hover and focus state
    const IHeartNavButton = ({ Icon, disabled, onClick, label }: IHeartNavButtonProps) => {
      const [isHovered, setIsHovered] = useState(false);

      const buttonBg = disabled ? colors.disabled.button : isHovered ? colors.hover.button : colors.default.button;

      const iconFill = disabled ? colors.disabled.icon : isHovered ? colors.hover.icon : colors.default.icon;

      return (
        <div onMouseEnter={() => !disabled && setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
          {createNavButton({
            Icon,
            disabled,
            onClick: (e) => {
              setIsHovered(false);
              onClick(e);
            },
            label,
            size: "sm",
            className: `gencl:transition-all gencl:duration-200 ${disabled ? "gencl:cursor-not-allowed!" : ""}`,
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
      <div className={iheartNavigationDivClasses}>
        <IHeartNavButton
          Icon={isCarousel ? ChevronLeftIcon : ChevronUpIcon}
          disabled={isPrevDisabled}
          onClick={handlePrevClick}
          label="Previous"
        />
        <IHeartNavButton
          Icon={isCarousel ? ChevronRightIcon : ChevronDownIcon}
          disabled={isNextDisabled}
          onClick={handleNextClick}
          label="Next"
        />
      </div>
    );
  }

  // iHeart layout - horizontal buttons below embed
  if (isIheartLayout && aspectRatio && aspectRatio === "16:9") {
    // Define styles based on theme
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

    // Carousel nav is absolutely positioned at left-1/2; the -translate-x-1/2
    // shifts it back by half its own width so it stays truly centered.
    const iheartNavigationDivClasses = isCarousel
      ? "gencl:absolute gencl:-translate-x-1/2 gencl:left-1/2 gencl:flex gencl:justify-center gencl:items-center gencl:gap-2 gencl:my-4"
      : "gencl:absolute gencl:right-[-15%] gencl:bottom-1/2 gencl:flex gencl:justify-center gencl:items-center gencl:gap-2 gencl:my-4 gencl:z-1 gencl:flex-col gencl:translate-y-1/2";

    const colors = isDarkTheme ? darkTheme : lightTheme;

    // Component with hover and focus state
    const IHeartNavButton = ({ Icon, disabled, onClick, label }: IHeartNavButtonProps) => {
      const [isHovered, setIsHovered] = useState(false);

      const buttonBg = disabled ? colors.disabled.button : isHovered ? colors.hover.button : colors.default.button;

      const iconFill = disabled ? colors.disabled.icon : isHovered ? colors.hover.icon : colors.default.icon;

      return (
        <div onMouseEnter={() => !disabled && setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
          {createNavButton({
            Icon,
            disabled,
            onClick: (e) => {
              setIsHovered(false);
              onClick(e);
            },
            label,
            size: "sm",
            className: `gencl:transition-all gencl:duration-200 ${disabled ? "gencl:cursor-not-allowed!" : ""}`,
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
      <div className={iheartNavigationDivClasses}>
        <IHeartNavButton
          Icon={isCarousel ? ChevronLeftIcon : ChevronUpIcon}
          disabled={isPrevDisabled}
          onClick={handlePrevClick}
          label="Previous"
        />
        <IHeartNavButton
          Icon={isCarousel ? ChevronRightIcon : ChevronDownIcon}
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
              theme: "secondary",
            })}
          </div>
          <div className="gencl:mr-2 gencl:pointer-events-auto">
            {createNavButton({
              Icon: ChevronRightIcon,
              disabled: isNextDisabled,
              onClick: handleNextClick,
              label: "Next",
              theme: "secondary",
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
        theme: "secondary",
      })}
      {createNavButton({
        Icon: ChevronDownIcon,
        disabled: isNextDisabled,
        onClick: handleNextClick,
        label: "Next",
        theme: "secondary",
      })}
    </div>
  );
}

export function NavigationButtonsWithContext({
  totalSlides,
  isIheartLayout = false,
  theme,
  setSlidesOffsetBefore,
  embedVariant,
  v2Size,
}: {
  totalSlides: number;
  isIheartLayout?: boolean;
  theme?: "light" | "dark";
  setSlidesOffsetBefore?: (value: number) => void;
  embedVariant?: EmbedVariant;
  /** V2-only: double-circle size token for the design-system arrows. @default "md" */
  v2Size?: PlayerControlSize;
}) {
  const { goToNextVideo, goToPreviousVideo, activeIndex, getSlideVisibilityPercentage, swiper } =
    useEmbedManagerContext();
  const config = useEmbedConfigs();

  // When the in-slide Octo sheet expands to panel/full view it covers the slide,
  // so the carousel arrows must not float on top of it. Hide them while Octo is
  // visible and in an expanded state (default/compact Octo keeps the arrows).
  const { octoVisible, getContentTypeState } = useSheetState();
  const octoSheetState = getContentTypeState("octo");
  const isOctoSheetExpanded = octoVisible && (octoSheetState === "panel-view" || octoSheetState === "full-view");

  const [isPrevDisabled, setIsPrevDisabled] = useState(false);
  const [isNextDisabled, setIsNextDisabled] = useState(false);
  const [hideNavButtons, setHideNavButtons] = useState(false);
  const [isAdPlaying, setIsAdPlaying] = useState(false);

  // Mirror the `gen-ad-playing` flag the feed-player provider sets on
  // <html>. Used to hide the carousel arrows during an ad break so the
  // ad's own controls (skip, click-through) aren't obscured.
  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    setIsAdPlaying(root.classList.contains("gen-ad-playing"));
    const observer = new MutationObserver(() => {
      setIsAdPlaying(root.classList.contains("gen-ad-playing"));
    });
    observer.observe(root, { attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

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
      setSlidesOffsetBefore?.(48);
      setTimeout(
        () => {
          goToNextVideo(false, true);
        },
        activeIndex > 0 ? 0 : 50
      );
    },
    [goToNextVideo, activeIndex, setSlidesOffsetBefore]
  );

  // Function to update disabled state based on current swiper state
  const updateDisabledState = useCallback(() => {
    if (isIheartLayout && config.embedSwiperConfigs.useWindowSwiperMode) {
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
    setHideNavButtons(swiper.isLocked ?? false);

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
    swiper.on("lock", () => setHideNavButtons(true));
    swiper.on("unlock", () => setHideNavButtons(false));

    return () => {
      swiper.off("progress", handleProgress);
      swiper.off("transitionEnd", handleTransitionEnd);
      swiper.off("lock", () => setHideNavButtons(true));
      swiper.off("unlock", () => setHideNavButtons(false));
    };
  }, [swiper, updateDisabledState]);

  return (
    <NavigationButtons
      isIheartLayout={isIheartLayout}
      onPrev={handlePrev}
      onNext={handleNext}
      isNavigationControlEnabled={config.view.isNavigationControlEnabled ?? false}
      isPrevDisabled={isPrevDisabled}
      isNextDisabled={isNextDisabled}
      theme={theme}
      embedVariant={embedVariant}
      hideNavButtons={hideNavButtons || isAdPlaying || isOctoSheetExpanded}
      v2Size={v2Size}
    />
  );
}
