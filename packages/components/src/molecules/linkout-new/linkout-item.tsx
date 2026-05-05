"use client";

import { cn } from "@genuin/ui/lib/utils";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Autoplay } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper/types";

import { useBaseContext } from "@genuin/components/context";
import type { SheetState } from "@genuin/components/context/base/event-bus";
import type { LinkData } from "@genuin/components/react-query/api/linkouts/schema";

import { LinkCard, type LinkMetaData } from "./link-card";

import "swiper/css";

function AutoCycleView({
  links,
  sheetState,
  theme = "dark",
  onLinkClick,
  onActiveIndexChange,
}: {
  links: LinkMetaData[];
  sheetState: SheetState;
  theme?: "light" | "dark";
  onLinkClick?: (link: string, title: string) => void;
  onActiveIndexChange?: (idx: number) => void;
}) {
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    onActiveIndexChange?.(activeIdx);
  }, [activeIdx, onActiveIndexChange]);

  // useEffect(() => {
  //   if (links.length <= 1) return;
  //   const id = setInterval(
  //     () => setActiveIdx((i) => (i + 1) % links.length),
  //     3000,
  //   );
  //   return () => clearInterval(id);
  // }, [links.length]);

  const current = links[activeIdx];
  if (!current) return null;

  return (
    <LinkCard
      data={current}
      sheetState={sheetState}
      theme={theme}
      onClick={() => onLinkClick?.(current.link, current.title ?? current.link)}
    />
  );
}

function DesktopNavButtons({
  onPrev,
  onNext,
  isPrevDisabled,
  isNextDisabled,
  theme = "dark",
}: {
  onPrev: () => void;
  onNext: () => void;
  isPrevDisabled: boolean;
  isNextDisabled: boolean;
  theme?: "light" | "dark";
}) {
  const isDark = theme === "dark";
  const btnBase =
    "gencl:flex gencl:cursor-pointer gencl:items-center gencl:justify-center gencl:rounded-full gencl:size-6 gencl:shrink-0 gencl:transition-opacity";
  const btnEnabled = isDark
    ? "gencl:bg-black/50 gencl:hover:bg-black/70"
    : "gencl:bg-white gencl:border gencl:border-[#DFE1E3]";
  const btnDisabled = "gencl:opacity-40 gencl:cursor-not-allowed";
  const iconColor = isDark ? "gencl:text-white" : "gencl:text-secondary-900";

  return (
    <div className="gencl:flex gencl:gap-2 gencl:items-center gencl:mb-2">
      <button
        type="button"
        aria-label="Previous"
        disabled={isPrevDisabled}
        onClick={onPrev}
        className={cn(btnBase, btnEnabled, isPrevDisabled && btnDisabled)}>
        <ChevronLeft className={cn("gencl:size-3", iconColor)} strokeWidth={2} />
      </button>
      <button
        type="button"
        aria-label="Next"
        disabled={isNextDisabled}
        onClick={onNext}
        className={cn(btnBase, btnEnabled, isNextDisabled && btnDisabled)}>
        <ChevronRight className={cn("gencl:size-3", iconColor)} strokeWidth={2} />
      </button>
    </div>
  );
}

export function LinkoutItem({
  links,
  linkoutsState,
  theme,
  view,
  isDesktop,
  onLinkClick,
  onActiveIndexChange,
}: {
  links: LinkData[];
  linkoutsState: SheetState;
  theme?: "light" | "dark";
  view?: "default" | "expand" | "embed" | null | undefined;
  isDesktop: boolean;
  onLinkClick?: (link: string, title: string) => void;
  onActiveIndexChange?: (idx: number) => void;
}) {
  const swiperInstanceRef = useRef<SwiperType | null>(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const { brandDetails } = useBaseContext();

  const linksWithMetadata: LinkMetaData[] = links.map((l) => ({
    link: l.link,
    title: l.title,
    image: l.image ?? brandDetails.logo,
    brand: brandDetails.name,
    website: brandDetails.website,
  }));
  const totalLinks = linksWithMetadata.length;

  if (linkoutsState === "default" || linkoutsState === "default-active") {
    return (
      <AutoCycleView
        links={linksWithMetadata}
        sheetState={linkoutsState}
        theme={theme}
        onLinkClick={onLinkClick}
        onActiveIndexChange={onActiveIndexChange}
      />
    );
  }

  return (
    <>
      <Swiper
        modules={[Autoplay]}
        spaceBetween={0}
        slidesPerView={1}
        loop={links.length > 1}
        autoplay={false}
        onSwiper={(swiper) => {
          swiperInstanceRef.current = swiper;
        }}
        onSlideChange={(swiper) => {
          setActiveIdx(swiper.realIndex);
          onActiveIndexChange?.(swiper.realIndex);
        }}>
        {linksWithMetadata.map((data, idx) => (
          <SwiperSlide key={data.link ?? `link-${idx}`}>
            <LinkCard
              data={data}
              sheetState={linkoutsState}
              theme={theme}
              onClick={() => onLinkClick?.(data.link, data.title ?? data.link)}
            />
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Bottom bar: desktop shows prev/next buttons, mobile (and desktop embed view) shows pagination dots */}
      <div className="gencl:flex gencl:items-center gencl:justify-center gencl:px-1 gencl:w-full">
        {isDesktop && view !== "embed"
          ? totalLinks > 1 && (
              <DesktopNavButtons
                theme={theme}
                onPrev={() => swiperInstanceRef.current?.slidePrev()}
                onNext={() => swiperInstanceRef.current?.slideNext()}
                isPrevDisabled={false}
                isNextDisabled={false}
              />
            )
          : totalLinks > 1 && (
              <div className="gencl:flex gencl:gap-2 gencl:flex-1 gencl:justify-center gencl:mb-2 gencl:items-center">
                {linksWithMetadata.map((_, idx) => (
                  <button
                    key={`linkout-dot-${idx}`}
                    type="button"
                    aria-label={`Go to slide ${idx + 1}`}
                    onClick={() => swiperInstanceRef.current?.slideToLoop(idx)}
                    className={cn(
                      "gencl:w-[6px] gencl:h-[6px] gencl:rounded-full gencl:transition-colors gencl:duration-200 gencl:focus-visible:gencl:outline gencl:focus-visible:gencl:outline-2 gencl:focus-visible:gencl:outline-offset-2 gencl:focus-visible:gencl:outline-secondary-500",
                      idx === activeIdx ? "gencl:bg-[#767B81]" : "gencl:bg-[#E9EBEC]"
                    )}
                  />
                ))}
              </div>
            )}
      </div>
    </>
  );
}
