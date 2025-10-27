import { Button } from "@genuin/ui/components";
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
} from "@genuin/ui";
import { useEmbedManagerContext } from "./context";
import { useEmbedConfigs } from "@genuin/components/hooks/embed/use-embed-config";
import { useCallback } from "react";

interface NavigationButtonsProps {
  totalSlides: number;
  isIheartLayout?: boolean;
  theme?: "light" | "dark";
  embedVariant?: "carousel" | "feed";
  activeIndex: number;
  onPrev: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onNext: (e: React.MouseEvent<HTMLButtonElement>) => void;
  isNavigationControlEnabled: boolean;
}

export function NavigationButtons({
  totalSlides,
  isIheartLayout = false,
  theme = "light",
  embedVariant: providedEmbedVariant,
  activeIndex,
  onPrev,
  onNext,
  isNavigationControlEnabled,
}: NavigationButtonsProps) {
  // Early return if navigation is disabled
  if (!isNavigationControlEnabled) return null;

  // Determine layout and states
  const embedVariant = providedEmbedVariant;
  const isCarousel = embedVariant === "carousel";
  const isFirstSlide = activeIndex === 0;
  const isLastSlide = activeIndex === totalSlides - 1;

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
          isFirstSlide,
          handlePrevClick,
          "Previous",
          "sm"
        )}
        {createNavButton(
          ChevronRightIcon,
          isLastSlide,
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
              isFirstSlide,
              handlePrevClick,
              "Previous"
            )}
          </div>
          <div className="gencl:mr-2 gencl:pointer-events-auto">
            {createNavButton(
              ChevronRightIcon,
              isLastSlide,
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
        isFirstSlide,
        handlePrevClick,
        "Previous"
      )}
      {createNavButton(ChevronDownIcon, isLastSlide, handleNextClick, "Next")}
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
  const { goToNextVideo, goToPreviousVideo, activeIndex } =
    useEmbedManagerContext();
  const config = useEmbedConfigs();

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

  return (
    <NavigationButtons
      totalSlides={totalSlides}
      isIheartLayout={isIheartLayout}
      activeIndex={activeIndex}
      onPrev={handlePrev}
      onNext={handleNext}
      isNavigationControlEnabled={
        config.view.isNavigationControlEnabled ?? false
      }
    />
  );
}
