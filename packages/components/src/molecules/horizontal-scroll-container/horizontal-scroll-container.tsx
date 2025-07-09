import { ComponentProps, useRef, useState, useEffect, ReactNode } from "react";
import { useResizeObserver } from "usehooks-ts";
import { cn } from "@genuin/ui/lib/utils";
import { Button } from "@genuin/ui/components/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

type HorizontalScrollContainerProps = {
  children: ReactNode;
  gap?: "sm" | "md" | "lg";
  scrollAmount?: number;
} & ComponentProps<"div">;

export function HorizontalScrollContainer({
  children,
  gap = "md",
  scrollAmount = 300,
  className,
  ...restProps
}: HorizontalScrollContainerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // State to track scroll availability
  const [scrollState, setScrollState] = useState({
    canScrollLeft: false,
    canScrollRight: false,
  });

  // Check if scrolling is possible
  const checkScrollability = () => {
    if (!scrollRef.current) return;

    const element = scrollRef.current;
    const canScrollLeft = element.scrollLeft > 0;
    const canScrollRight =
      element.scrollLeft < element.scrollWidth - element.clientWidth;

    setScrollState({ canScrollLeft, canScrollRight });
  };

  // Use resize observer hook to recheck scrollability on size changes
  useResizeObserver({
    ref: scrollRef as React.RefObject<HTMLElement>,
    onResize: checkScrollability,
  });

  // Update scroll state on mount and when content changes
  useEffect(() => {
    checkScrollability();
  }, [children]);

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -scrollAmount, behavior: "smooth" });
      // Update scroll state after animation
      setTimeout(() => checkScrollability(), 300);
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
      // Update scroll state after animation
      setTimeout(() => checkScrollability(), 300);
    }
  };

  // Handle scroll events to update button visibility
  const handleScroll = () => {
    checkScrollability();
  };

  // Gap classes mapping
  const gapClasses = {
    sm: "gencl:gap-2",
    md: "gencl:gap-3",
    lg: "gencl:gap-4",
  };

  return (
    <div className={cn("gencl:relative", className)} {...restProps}>
      {/* Left navigation button */}
      {scrollState.canScrollLeft && (
        <Button
          variant="icon"
          size="sm"
          theme="secondary"
          className="gencl:absolute gencl:left-2 gencl:top-1/2 gencl:-translate-y-1/2 gencl:z-10 gencl:w-8 gencl:h-8 gencl:shadow-md gencl:rounded-full! gencl:bg-white"
          onClick={scrollLeft}
        >
          <ChevronLeft className="gencl:w-4 gencl:h-4" />
        </Button>
      )}

      {/* Right navigation button */}
      {scrollState.canScrollRight && (
        <Button
          variant="icon"
          size="sm"
          theme="secondary"
          className="gencl:absolute gencl:right-2 gencl:top-1/2 gencl:-translate-y-1/2 gencl:z-10 gencl:w-8 gencl:h-8 gencl:shadow-md gencl:rounded-full! gencl:bg-white"
          onClick={scrollRight}
        >
          <ChevronRight className="gencl:w-4 gencl:h-4" />
        </Button>
      )}

      <div
        ref={scrollRef}
        className={cn(
          "gencl:flex gencl:overflow-x-auto gencl:scrollbar-hide gencl:pb-2",
          gapClasses[gap]
        )}
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        onScroll={handleScroll}
      >
        {children}
      </div>
    </div>
  );
}
