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
  const buttonTheme = theme === "dark" ? "secondaryDark" : "secondary";
  const iconTheme = theme === "dark" ? "dark" : "light";

  // Click handlers
  const handlePrevClick = onPrev;
  const handleNextClick = onNext;

  // Helper to create navigation buttons
  const createNavButton = (
    Icon: React.ComponentType<any>,
    disabled: boolean,
    onClick: (e: React.MouseEvent<HTMLButtonElement>) => void,
    label: string,
    size: "sm" | "md" = "md"
  ) => (
    <Button
      variant="icon"
      shape="circle"
      size={size}
      theme={"custom"}
      disabled={disabled}
      onClick={onClick}
      aria-label={label}
      className={disabled ? "gencl:bg-[#E6EAED]!" : "gencl:bg-[#27292D]!"}
      style={{ background: disabled ? "#E6EAED" : "#27292D" }}
    >
      <Icon
        theme={iconTheme}
        className={disabled ? "gencl:fill-[#A9AFB2]!" : "gencl:fill-white!"}
        size="lg"
      />
    </Button>
  );

  // iHeart layout - horizontal buttons below embed
  if (isIheartLayout) {
    return (
      <div className="gencl:flex gencl:justify-center gencl:items-center gencl:gap-2 gencl:my-4">
        {createNavButton(
          ChevronLeftIcon,
          isPrevDisabled,
          handlePrevClick,
          "Previous",
          "sm"
        )}
        {createNavButton(
          ChevronRightIcon,
          isNextDisabled,
          handleNextClick,
          "Next",
          "sm"
        )}
      </div>
    );
  }

  // Carousel layout - side navigation buttons
  if (isCarousel) {
    return (
      <div className="gencl:absolute gencl:z-20 gencl:inset-y-0 gencl:left-0 gencl:right-0 gencl:pointer-events-none">
        <div className="gencl:h-full gencl:w-full gencl:flex gencl:justify-between gencl:items-center">
          <div className="gencl:ml-2 gencl:pointer-events-auto">
            {createNavButton(
              ChevronLeftIcon,
              isPrevDisabled,
              handlePrevClick,
              "Previous"
            )}
          </div>
          <div className="gencl:mr-2 gencl:pointer-events-auto">
            {createNavButton(
              ChevronRightIcon,
              isNextDisabled,
              handleNextClick,
              "Next"
            )}
          </div>
        </div>
      </div>
    );
  }

  // Feed layout - vertical buttons on right side
  return (
    <div className="gencl:absolute gencl:z-20 gencl:right-2 gencl:top-1/2 gencl:transform gencl:-translate-y-1/2 gencl:flex gencl:flex-col gencl:gap-2">
      {createNavButton(
        ChevronUpIcon,
        isPrevDisabled,
        handlePrevClick,
        "Previous"
      )}
      {createNavButton(
        ChevronDownIcon,
        isNextDisabled,
        handleNextClick,
        "Next"
      )}
    </div>
  );
}

export function NavigationButtonsWithContext({
  totalSlides,
  isIheartLayout = false,
}: {
  totalSlides: number;
  isIheartLayout?: boolean;
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
    />
  );
}
