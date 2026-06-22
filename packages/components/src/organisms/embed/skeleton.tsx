"use client";
import { Skeleton } from "@genuin/ui/components/skeleton";
import { cn, getAspectRatio } from "@genuin/ui/lib/utils";
import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import type { ComponentProps } from "react";
import { SwiperSlide } from "swiper/react";

import { useBaseContext } from "@genuin/components/context";
import { useEmbedContext } from "@genuin/components/context/embed";
import { useEmbedConfigs } from "@genuin/components/hooks/embed/use-embed-config";
import { useEmbedDimensions } from "@genuin/components/hooks/embed/use-embed-dimensions";
import { EmbedSwiper } from "@genuin/components/molecules/embed-swiper";

import { getSlidesPerView } from "../../molecules/embed-swiper/utils";

import { computeTileSize, ratioToAspect, resolveGridDimensions } from "./grid-view/grid-layout";
import { NavigationButtons } from "./navigation-buttons";

import "swiper/css";

const carouselSkeletonVariant = cva("gencl:rounded-md", {
  variants: {
    variant: {
      carousel: "",
      feed: "gencl:flex gencl:flex-col",
      grid: "",
    },
    theme: {
      light: "gencl:bg-secondary-200",
      dark: "gencl:bg-secondary-900",
    },
  },
  defaultVariants: {
    variant: "carousel",
    theme: "light",
  },
});

type CarouselSkeletonProps = VariantProps<typeof carouselSkeletonVariant> & ComponentProps<"div">;

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
  containerHeight: number;
  containerWidth: number;
  statsHeight: number;
  linkoutHeight: number;
  spaceBetweenVideos: number;
  availableHeight: number;
}) {
  const { embedData } = useEmbedContext();
  const config = useEmbedConfigs();
  const { headerHeight } = useEmbedDimensions();
  const isGridLayout = config.view.isGrid;
  const embedVariant: "carousel" | "feed" = config.view.embedStyle === "feed" ? "feed" : "carousel";
  const skeletonItems = Array(12).fill(null);
  const { theme } = useBaseContext();

  // If variant is grid, render grid skeleton layout
  if (isGridLayout) {
    const rawRows = config.view.gridLayout?.row ?? 2;
    const rawCols = config.view.gridLayout?.column ?? 2;
    const { width: widthRatio, height: heightRatio } = getAspectRatio(config.dimensions.aspectRatio);
    const aspect = ratioToAspect(widthRatio, heightRatio);
    // Mirror GridView exactly: usable height = container minus the grid header.
    const usableHeight = Math.max(containerHeight - headerHeight, 0);

    // During loading there is no real video count. For a dynamic dimension,
    // estimate enough placeholder tiles to fill the viewport along that axis so
    // the skeleton matches the eventual grid shape. Fixed mode is unchanged.
    let placeholderCount: number;
    if (rawRows === -1) {
      const { mode, rows, cols } = resolveGridDimensions(rawRows, rawCols, 1);
      const { tileHeight } = computeTileSize({ mode, rows, cols, containerWidth, usableHeight, aspect });
      const visibleRows = tileHeight > 0 ? Math.ceil(containerHeight / tileHeight) + 1 : 2;
      placeholderCount = cols * Math.max(visibleRows, 1);
    } else if (rawCols === -1) {
      const { mode, rows, cols } = resolveGridDimensions(rawRows, rawCols, 1);
      const { tileWidth } = computeTileSize({ mode, rows, cols, containerWidth, usableHeight, aspect });
      const visibleCols = tileWidth > 0 ? Math.ceil(containerWidth / tileWidth) + 1 : 2;
      placeholderCount = rows * Math.max(visibleCols, 1);
    } else {
      placeholderCount = Math.max(rawRows * rawCols, 1);
    }

    const { mode, rows, cols } = resolveGridDimensions(rawRows, rawCols, placeholderCount);
    // Identical sizing to the rendered GridView so the skeleton tiles match.
    const { tileWidth, tileHeight } = computeTileSize({
      mode,
      rows,
      cols,
      containerWidth,
      usableHeight,
      aspect,
    });

    const gridStyle: React.CSSProperties =
      mode === "dynamic-rows"
        ? {
            display: "grid",
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gridAutoRows: "max-content",
          }
        : mode === "dynamic-cols"
          ? {
              display: "grid",
              gridTemplateRows: `repeat(${rows}, 1fr)`,
              gridAutoFlow: "column",
              gridAutoColumns: `${Math.max(tileWidth, 0)}px`,
              height: "100%",
            }
          : {
              display: "grid",
              gridTemplateColumns: `repeat(${cols}, 1fr)`,
              gridTemplateRows: `repeat(${rows}, 1fr)`,
            };

    // Match GridView: fixed mode keeps the aspect-ratio box; dynamic modes size
    // the cell explicitly so the skeleton tiles equal the rendered tiles.
    const cellStyle: React.CSSProperties =
      mode === "fixed"
        ? { aspectRatio: `${widthRatio} / ${heightRatio}` }
        : { width: Math.max(tileWidth, 0), height: Math.max(tileHeight, 0) };

    const scrollClass =
      mode === "dynamic-cols"
        ? "gencl:overflow-x-auto gencl:overflow-y-hidden"
        : mode === "dynamic-rows"
          ? "gencl:overflow-y-auto"
          : "gencl:overflow-auto";

    // Mirror GridView's scroll wrapper: in dynamic modes the wrapper height is
    // bounded to usableHeight so the grid's 1fr row tracks resolve to the same
    // tile height as the rendered grid (a `h-full` wrapper would use the full
    // container height and make the skeleton tiles taller/wider than reality).
    const scrollWrapperStyle: React.CSSProperties =
      mode === "fixed" ? {} : { height: usableHeight };

    return (
      <div
        className={cn("gencl:rounded-md", theme === "dark" ? "gencl:bg-secondary-900" : "gencl:bg-secondary-200")}
        style={{
          height: Math.max(0, containerHeight || 0),
          width: Math.max(0, containerWidth || 0),
        }}
        {...restProps}>
        <EmbedHeaderSkeleton variant="grid" theme={theme} />
        <div className={cn("gencl:w-full", scrollClass)} style={scrollWrapperStyle}>
          <div className={cn("gencl:w-full gencl:gap-2")} style={gridStyle}>
            {Array(rows * cols)
              .fill(0)
              .map((_, index) => (
                <div
                  key={index}
                  className={cn(
                    "gencl:relative gencl:overflow-hidden gencl:rounded-md",
                    "gencl:transition-all gencl:duration-300 gencl:ease-in-out",
                    "gencl:cursor-pointer"
                  )}
                  style={cellStyle}>
                  <Skeleton
                    className={cn(
                      "gencl:h-full gencl:w-full",
                      theme === "dark" ? "gencl:bg-secondary-800" : "gencl:bg-secondary-100"
                    )}
                  />
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
        carouselSkeletonVariant({
          variant: variant || embedVariant,
          theme: theme,
        }),
        className
      )}
      style={{
        height: containerHeight,
        width: containerWidth,
      }}
      {...restProps}>
      <EmbedHeaderSkeleton
        variant={variant === "carousel" || variant === "feed" ? variant : embedVariant}
        theme={theme}
      />
      <div className="gencl:relative">
        <EmbedSwiper
          forFeed={config.view.isFeed}
          aspectRatio={config.dimensions.aspectRatio}
          spaceBetweenVideos={spaceBetweenVideos}
          slidesPerView={
            getSlidesPerView(
              config.view.isFeed ? availableHeight - spaceBetweenVideos : availableHeight + spaceBetweenVideos,
              containerWidth,
              config.view.isFeed,
              config.dimensions.aspectRatio,
              config.embedSwiperConfigs.useWindowSwiperMode
            ) ?? 1
          }
          containerDimensions={{
            height: config.view.isFeed ? availableHeight - spaceBetweenVideos : availableHeight + spaceBetweenVideos,
            width: containerWidth || 0,
          }}
          style={{
            height: availableHeight,
          }}>
          {skeletonItems.map((_, idx) => {
            return (
              <SwiperSlide className="gencl:h-full gencl:w-full" key={idx}>
                <Skeleton
                  className={cn(
                    "gencl:h-full gencl:w-full",
                    theme === "dark" ? "gencl:bg-secondary-800" : "gencl:bg-secondary-100"
                  )}
                />
              </SwiperSlide>
            );
          })}
        </EmbedSwiper>
      </div>
      <NavigationButtons
        theme={theme}
        embedVariant={embedVariant}
        onPrev={() => {}}
        onNext={() => {}}
        isIheartLayout={config.view.brandLayoutType === "iheart"}
        isNavigationControlEnabled={config.view.isNavigationControlEnabled ?? false}
        hideNavButtons={true}
      />
    </div>
  );
}

const embedHeaderSkeletonVariants = cva("gencl:flex gencl:shrink-0 gencl:gap-2 gencl:w-full gencl:p-2", {
  variants: {
    variant: {
      feed: "gencl:justify-center gencl:items-start gencl:flex-col",
      carousel: "gencl:justify-between gencl:items-center gencl:flex-row",
      grid: "gencl:justify-between gencl:items-center gencl:flex-row",
    },
  },
  defaultVariants: {
    variant: "carousel",
  },
});

function EmbedHeaderSkeleton({
  variant,
  theme = "light",
}: VariantProps<typeof embedHeaderSkeletonVariants> & {
  theme?: "light" | "dark";
}) {
  const { header, view, contentDisplay } = useEmbedConfigs();
  const { headerHeight } = useEmbedDimensions();

  if (!header.showHeader || (view.isPlacementView && (!contentDisplay.showStyleDetails || !header.heading))) return;

  return (
    <div
      style={{
        height: headerHeight,
      }}
      className={cn(embedHeaderSkeletonVariants({ variant }))}>
      <div className="gencl:flex gencl:flex-col gencl:items-start gencl:gap-2">
        {header.heading && (
          <Skeleton
            className={cn(
              "gencl:h-5 gencl:w-32",
              theme === "dark" ? "gencl:bg-secondary-800" : "gencl:bg-secondary-100"
            )}
          />
        )}
        {header.subHeading && (
          <Skeleton
            className={cn(
              "gencl:h-3 gencl:w-24",
              theme === "dark" ? "gencl:bg-secondary-800" : "gencl:bg-secondary-100"
            )}
          />
        )}
      </div>
      {header.ctaButton?.url && (
        <Skeleton
          className={cn(
            "gencl:h-10 gencl:w-24 gencl:rounded-md",
            theme === "dark" ? "gencl:bg-secondary-800" : "gencl:bg-secondary-100"
          )}
        />
      )}
    </div>
  );
}

export function ShimmerSlide({ className }: { className?: string }) {
  const { theme } = useBaseContext();

  return (
    <div className={cn("gencl:h-full gencl:w-full", className)}>
      <Skeleton
        className={cn(
          "gencl:h-full gencl:w-full gencl:rounded-lg",
          theme === "dark" ? "gencl:bg-secondary-800" : "gencl:bg-secondary-100"
        )}
      />
    </div>
  );
}
