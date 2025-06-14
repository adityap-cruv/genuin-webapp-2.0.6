"use client";

import * as React from "react";
import useEmblaCarousel, {
  type UseEmblaCarouselType,
} from "embla-carousel-react";
import { ArrowLeft, ArrowRight } from "lucide-react";

import {cn} from "@genuin/ui/lib/utils"
import { Button, type ButtonPropsType } from "@genuin/ui/components/button"

type CarouselApi = UseEmblaCarouselType[1];
type UseCarouselParameters = Parameters<typeof useEmblaCarousel>;
type CarouselOptions = UseCarouselParameters[0];
type CarouselPlugin = UseCarouselParameters[1];

type CarouselProps = {
  opts?: CarouselOptions;
  plugins?: CarouselPlugin;
  orientation?: "horizontal" | "vertical";
  setApi?: (api: CarouselApi) => void;
};

type CarouselContextProps = {
  carouselRef: ReturnType<typeof useEmblaCarousel>[0];
  api: ReturnType<typeof useEmblaCarousel>[1];
  scrollPrev: () => void;
  scrollNext: () => void;
  canScrollPrev: boolean;
  canScrollNext: boolean;
} & CarouselProps;

const CarouselContext = React.createContext<CarouselContextProps | null>(null);

function useCarousel() {
  const context = React.useContext(CarouselContext);

  if (!context) {
    throw new Error("useCarousel must be used within a <Carousel />");
  }

  return context;
}

function Carousel({
  orientation = "horizontal",
  opts,
  setApi,
  plugins,
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & CarouselProps) {
  const [carouselRef, api] = useEmblaCarousel(
    {
      ...opts,
      axis: orientation === "horizontal" ? "x" : "y",
    },
    plugins
  );
  const [canScrollPrev, setCanScrollPrev] = React.useState(false);
  const [canScrollNext, setCanScrollNext] = React.useState(false);

  const onSelect = React.useCallback((api: CarouselApi) => {
    if (!api) return;
    setCanScrollPrev(api.canScrollPrev());
    setCanScrollNext(api.canScrollNext());
  }, []);

  const scrollPrev = React.useCallback(() => {
    api?.scrollPrev();
  }, [api]);

  const scrollNext = React.useCallback(() => {
    api?.scrollNext();
  }, [api]);

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        scrollPrev();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        scrollNext();
      }
    },
    [scrollPrev, scrollNext]
  );

  React.useEffect(() => {
    if (!api || !setApi) return;
    setApi(api);
  }, [api, setApi]);

  React.useEffect(() => {
    if (!api) return;
    onSelect(api);
    api.on("reInit", onSelect);
    api.on("select", onSelect);

    return () => {
      api?.off("select", onSelect);
    };
  }, [api, onSelect]);

  return (
    <CarouselContext.Provider
      value={{
        carouselRef,
        api: api,
        opts,
        orientation:
          orientation || (opts?.axis === "y" ? "vertical" : "horizontal"),
        scrollPrev,
        scrollNext,
        canScrollPrev,
        canScrollNext,
      }}
    >
      <div
        onKeyDownCapture={handleKeyDown}
        className={cn("gencl:relative", className)}
        role="region"
        aria-roledescription="carousel"
        data-slot="carousel"
        {...props}
      >
        {children}
      </div>
    </CarouselContext.Provider>
  );
}

function CarouselContent({ className, ...props }: React.ComponentProps<"div">) {
  const { carouselRef, orientation } = useCarousel();

  return (
    <div
      ref={carouselRef}
      className="gencl:overflow-hidden"
      data-slot="carousel-content"
    >
      <div
        className={cn(
          "gencl:flex",
          orientation === "horizontal"
            ? "gencl:-ml-4"
            : "gencl:-mt-4 gencl:flex-col",
          className
        )}
        {...props}
      />
    </div>
  );
}

function CarouselItem({ className, ...props }: React.ComponentProps<"div">) {
  const { orientation } = useCarousel();

  return (
    <div
      role="group"
      aria-roledescription="slide"
      data-slot="carousel-item"
      className={cn(
        "gencl:min-w-0 gencl:shrink-0 gencl:grow-0 gencl:basis-full",
        orientation === "horizontal" ? "gencl:pl-4" : "gencl:pt-4",
        className
      )}
      {...props}
    />
  );
}

function CarouselPrevious({
  className,
  theme = "outline",
  size = "sm",
  ...props
}: ButtonPropsType) {
  const { orientation, scrollPrev, canScrollPrev } = useCarousel();

  return (
    <Button
      data-slot="carousel-previous"
      theme={theme}
      size={size}
      className={cn(
        "gencl:absolute gencl:size-8 gencl:rounded-full",
        orientation === "horizontal"
          ? "gencl:top-1/2 gencl:-left-12 gencl:-translate-y-1/2"
          : "gencl:-top-12 gencl:left-1/2 gencl:-translate-x-1/2 gencl:rotate-90",
        className
      )}
      disabled={!canScrollPrev}
      onClick={scrollPrev}
      {...props}
    >
      <ArrowLeft />
      <span className="gencl:sr-only">Previous slide</span>
    </Button>
  );
}

function CarouselNext({
  className,
  theme = "outline",
  size = "sm",
  ...props
}: ButtonPropsType) {
  const { orientation, scrollNext, canScrollNext } = useCarousel();

  return (
    <Button
      data-slot="carousel-next"
      theme={theme}
      size={size}
      className={cn(
        "gencl:absolute gencl:size-8 gencl:rounded-full",
        orientation === "horizontal"
          ? "gencl:top-1/2 gencl:-right-12 gencl:-translate-y-1/2"
          : "gencl:-bottom-12 gencl:left-1/2 gencl:-translate-x-1/2 gencl:rotate-90",
        className
      )}
      disabled={!canScrollNext}
      onClick={scrollNext}
      {...props}
    >
      <ArrowRight />
      <span className="gencl:sr-only">Next slide</span>
    </Button>
  );
}

function CarouselDots({
  className,
  dotClassName,
  activeDotClassName,
  ...props
}: React.ComponentProps<"div"> & {
  dotClassName?: string;
  activeDotClassName?: string;
}) {
  const { api } = useCarousel();
  const [current, setCurrent] = React.useState(0);
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    if (!api) return;

    const updateSelection = () => {
      setCurrent(api.selectedScrollSnap());
      setCount(api.scrollSnapList().length);
    };

    updateSelection();
    api.on("select", updateSelection);
    api.on("reInit", updateSelection);

    return () => {
      api?.off("select", updateSelection);
      api?.off("reInit", updateSelection);
    };
  }, [api]);

  const scrollTo = React.useCallback(
    (index: number) => {
      api?.scrollTo(index);
    },
    [api]
  );

  if (!api || count <= 1) return null;

  return (
    <div
      data-slot="carousel-dots"
      className={cn(
        "gencl:flex gencl:justify-center gencl:gap-2 gencl:mt-4",
        className
      )}
      {...props}
    >
      {Array.from({ length: count }).map((_, index) => (
        <button
          key={index}
          type="button"
          className={cn(
            "gencl:h-2 gencl:w-2 gencl:rounded-full gencl:transition-all gencl:duration-200",
            "gencl:border-0 gencl:p-0 gencl:cursor-pointer",
            "hover:gencl:scale-110 focus:gencl:outline-none focus:gencl:ring-2 focus:gencl:ring-offset-2",
            index === current
              ? cn("gencl:bg-primary gencl:scale-110", activeDotClassName)
              : cn(
                  "gencl:bg-primary/30 hover:gencl:bg-primary/50",
                  dotClassName
                )
          )}
          onClick={() => scrollTo(index)}
          aria-label={`Go to slide ${index + 1}`}
          aria-current={index === current ? "true" : "false"}
        />
      ))}
    </div>
  );
}

export {
  type CarouselApi,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  CarouselDots,
};
