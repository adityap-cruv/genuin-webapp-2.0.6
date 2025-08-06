import { Button } from "@genuin/ui/components";
import { useEmbedManagerContext } from "./context";
import { cn } from "@genuin/ui/lib/utils";
import {
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { getEmbedVariant } from "@genuin/components/hooks/embed/use-embed-dimensions";
import { useEmbedConfigs } from "@genuin/components/hooks/embed/use-embed-config";

interface NavigationButtonsProps {
  totalSlides: number;
}

export function NavigationButtons({ totalSlides }: NavigationButtonsProps) {
  const { goToNextVideo, goToPreviousVideo, activeIndex } =
    useEmbedManagerContext();
  const config = useEmbedConfigs();

  // Use the shared utility for embed variant
  const embedVariant = getEmbedVariant(config);
  const isCarousel = embedVariant === "carousel";

  // To determine first/last slide, we need to pass the total videos count as a prop
  // or access it from a parent context. For now, we'll access it from a prop.
  // We'll add a total count prop to the component.

  // Check if we're at the first or last slide
  const isFirstSlide = activeIndex === 0;
  const isLastSlide = activeIndex === totalSlides - 1;

  if (isCarousel) {
    // Carousel layout - buttons on left and right sides
    return (
      <div className="gencl:absolute gencl:z-20 gencl:inset-y-0 gencl:left-0 gencl:right-0 gencl:pointer-events-none">
        <div className="gencl:h-full gencl:w-full gencl:flex gencl:justify-between gencl:items-center">
          <div className="gencl:ml-2">
            {!isFirstSlide && (
              <Button
                theme="overlay"
                variant="icon"
                size="sm"
                onClick={goToPreviousVideo}
                className="gencl:pointer-events-auto gencl:rounded-full gencl:bg-white gencl:hover:bg-secondary-150"
              >
                <ChevronLeft className="gencl:h-5 gencl:w-5 gencl:stroke-secondary-600" />
                <span className="gencl:sr-only">Previous</span>
              </Button>
            )}
          </div>

          <div className="gencl:mr-2">
            {!isLastSlide && (
              <Button
                theme="overlay"
                variant="icon"
                size="sm"
                onClick={goToNextVideo}
                className="gencl:pointer-events-auto gencl:rounded-full gencl:bg-white gencl:hover:bg-secondary-150"
              >
                <ChevronRight className="gencl:h-5 gencl:w-5 gencl:stroke-secondary-600" />
                <span className="gencl:sr-only">Next</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Feed layout - buttons on right side with up/down arrows
  return (
    <div className="gencl:absolute gencl:z-20 gencl:right-2 gencl:top-1/2 gencl:transform gencl:-translate-y-1/2 gencl:flex gencl:flex-col gencl:gap-2">
      {!isFirstSlide && (
        <Button
          theme="overlay"
          variant="icon"
          size="sm"
          onClick={goToPreviousVideo}
          className="gencl:rounded-full gencl:bg-white gencl:hover:bg-secondary-150"
        >
          <ChevronUp className="gencl:h-5 gencl:w-5 gencl:stroke-secondary-600" />
          <span className="gencl:sr-only">Previous</span>
        </Button>
      )}
      {!isLastSlide && (
        <Button
          theme="overlay"
          variant="icon"
          size="sm"
          onClick={goToNextVideo}
          className="gencl:rounded-full gencl:bg-white gencl:hover:bg-secondary-150"
        >
          <ChevronDown className="gencl:h-5 gencl:w-5 gencl:stroke-secondary-600" />
          <span className="gencl:sr-only">Next</span>
        </Button>
      )}
    </div>
  );
}
