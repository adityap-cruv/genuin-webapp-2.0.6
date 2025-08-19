"use client";
import { Skeleton } from "@genuin/ui/components/skeleton";
import { cn } from "@genuin/ui/lib/utils";
import { ComponentProps } from "react";
import { cva, VariantProps } from "class-variance-authority";
import { useEmbedConfigs } from "@genuin/components/hooks/embed/use-embed-config";
import { SwiperSlide } from "swiper/react";
import "swiper/css";
import { EmbedSwiper } from "@genuin/components/molecules/embed-swiper";
import { Button } from "@genuin/ui/components";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
} from "lucide-react";
import { useEmbedContext } from "@genuin/components/context/embed";

const carouselSkeletonVariant = cva("gencl:bg-secondary-200 gencl:rounded-md", {
  variants: {
    variant: {
      carousel: "",
      feed: "gencl:flex gencl:flex-col",
      grid: "",
    },
    defaultVariants: {
      variant: "carousel",
    },
  },
});

type CarouselSkeletonProps = VariantProps<typeof carouselSkeletonVariant> &
  ComponentProps<"div">;

export function SdkSkeleton({
  className,
  variant,
  containerHeight,
  containerWidth,
  statsHeight,
  linkoutHeight,
  spaceBetweenVideos,
  availableHeight,
  ...restProps
}: CarouselSkeletonProps & {
  containerHeight?: number;
  containerWidth?: number;
  statsHeight: number;
  linkoutHeight: number;
  spaceBetweenVideos: number;
  availableHeight: number;
}) {
  const { embedData } = useEmbedContext();
  const config = useEmbedConfigs();
  const isWalmart = embedData.card_layout_id === 6;
  const embedVariant: "carousel" | "feed" =
    config.view.embedStyle === "feed" ? "feed" : "carousel";
  const skeletonItems = Array(6).fill(null);

  // If variant is grid, render grid skeleton layout
  if (isWalmart) {
    return (
      <div
        className="gencl:bg-secondary-200 gencl:rounded-md"
        style={{
          height: containerHeight,
          width: containerWidth,
        }}
        {...restProps}
      >
        <div className="gencl:h-full gencl:w-full gencl:overflow-auto">
          <div className="gencl:grid gencl:grid-cols-2 gencl:w-full gencl:gap-2">
            {Array(6)
              .fill(0)
              .map((_, index) => (
                <div
                  key={index}
                  className={cn(
                    "gencl:aspect-reel gencl:relative gencl:overflow-hidden gencl:rounded-md",
                    "gencl:transition-all gencl:duration-300 gencl:ease-in-out"
                  )}
                >
                  <Skeleton className="gencl:h-full gencl:w-full" />
                </div>
              ))}
          </div>
        </div>
      </div>
    );
  }

  // Otherwise render carousel/feed skeleton layout
  return (
    <div
      className={cn(
        carouselSkeletonVariant({ variant: variant || embedVariant }),
        className
      )}
      style={{
        height: containerHeight,
        width: containerWidth,
      }}
      {...restProps}
    >
      <EmbedHeaderSkeleton
        variant={
          variant === "carousel" || variant === "feed" ? variant : embedVariant
        }
      />
      <div className="gencl:relative">
        <EmbedSwiper
          forFeed={config.view.isFeed}
          aspectRation={embedData.aspect_ratio}
          spaceBetweenVideos={spaceBetweenVideos}
          containerDimensions={{
            height: config.view.isFeed
              ? availableHeight - spaceBetweenVideos
              : availableHeight + spaceBetweenVideos,
            width: containerWidth || 0,
          }}
          style={{
            height: availableHeight + linkoutHeight + statsHeight,
          }}
        >
          {skeletonItems.map((_, idx) => {
            return (
              <SwiperSlide className="gencl:h-full gencl:w-full" key={idx}>
                <Skeleton className="gencl:h-full gencl:w-full" />
              </SwiperSlide>
            );
          })}
        </EmbedSwiper>
        <NavigationButtons embedVariant={embedVariant} />
      </div>
    </div>
  );
}

function NavigationButtons({
  embedVariant,
}: {
  embedVariant: "feed" | "carousel";
}) {
  const config = useEmbedConfigs();

  // Only render navigation buttons if they're enabled in config
  if (!config.view.showNavigation) {
    return null;
  }

  if (embedVariant === "carousel") {
    // Only show carousel navigation if carousel icons are enabled
    if (!config.view.showCarouselIcon) return null;

    // Carousel layout - buttons on left and right sides
    return (
      <div className="gencl:absolute gencl:z-20 gencl:inset-y-0 gencl:left-0 gencl:right-0 gencl:pointer-events-none">
        <div className="gencl:h-full gencl:w-full gencl:flex gencl:justify-between gencl:items-center">
          <div className="gencl:ml-2">
            <Button
              theme="overlay"
              variant="icon"
              size="sm"
              className="gencl:pointer-events-auto gencl:rounded-full gencl:bg-white gencl:hover:bg-secondary-150"
            >
              <ChevronLeft className="gencl:h-5 gencl:w-5 gencl:stroke-secondary-600" />
              <span className="gencl:sr-only">Previous</span>
            </Button>
          </div>

          <div className="gencl:mr-2">
            <Button
              theme="overlay"
              variant="icon"
              size="sm"
              className="gencl:pointer-events-auto gencl:rounded-full gencl:bg-white gencl:hover:bg-secondary-150"
            >
              <ChevronRight className="gencl:h-5 gencl:w-5 gencl:stroke-secondary-600" />
              <span className="gencl:sr-only">Next</span>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Feed layout - buttons on right side with up/down arrows
  return (
    <div className="gencl:absolute gencl:z-20 gencl:right-2 gencl:top-1/2 gencl:transform gencl:-translate-y-1/2 gencl:flex gencl:flex-col gencl:gap-2">
      <Button
        theme="overlay"
        variant="icon"
        size="sm"
        className="gencl:rounded-full gencl:bg-white gencl:hover:bg-secondary-150"
      >
        <ChevronUp className="gencl:h-5 gencl:w-5 gencl:stroke-secondary-600" />
        <span className="gencl:sr-only">Previous</span>
      </Button>

      <Button
        theme="overlay"
        variant="icon"
        size="sm"
        className="gencl:rounded-full gencl:bg-white gencl:hover:bg-secondary-150"
      >
        <ChevronDown className="gencl:h-5 gencl:w-5 gencl:stroke-secondary-600" />
        <span className="gencl:sr-only">Next</span>
      </Button>
    </div>
  );
}

const embedHeaderSkeletonVariants = cva(
  "gencl:flex gencl:shrink-0 gencl:gap-2 gencl:w-full gencl:p-2",
  {
    variants: {
      variant: {
        feed: "gencl:justify-center gencl:items-start gencl:flex-col",
        carousel: "gencl:justify-between gencl:items-center gencl:flex-row",
      },
    },
    defaultVariants: {
      variant: "carousel",
    },
  }
);

function EmbedHeaderSkeleton({
  variant,
}: VariantProps<typeof embedHeaderSkeletonVariants>) {
  const { header } = useEmbedConfigs();
  const config = useEmbedConfigs();
  const { headerHeight } = useEmbedDimensions(config);
  if (!header.showHeader) return null;

  return (
    <div
      style={{
        height: headerHeight,
      }}
      className={cn(embedHeaderSkeletonVariants({ variant }))}
    >
      <div className="gencl:flex gencl:flex-col gencl:items-center gencl:gap-2">
        {header.heading && <Skeleton className="gencl:h-5 gencl:w-32" />}
        {header.subHeading && <Skeleton className="gencl:h-3 gencl:w-24" />}
      </div>
      {header.ctaButton?.url && (
        <Skeleton className="gencl:h-10 gencl:w-24 gencl:rounded-md" />
      )}
    </div>
  );
}
