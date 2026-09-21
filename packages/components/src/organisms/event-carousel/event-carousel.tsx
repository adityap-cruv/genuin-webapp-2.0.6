"use client";

import { cn } from "@genuin/ui/lib/utils";
import { NavArrowButton } from "@genuin/ui/player-controls";
import { useCallback, useEffect, useRef, useState } from "react";

import { LinkCard } from "@genuin/components/molecules/linkout-new/link-card";

import type { EventCarouselItem, EventCarouselProps } from "./event-carousel.types";

const DATE_FORMATTER = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

const DAY_FORMATTER = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  timeZone: "UTC",
});

function parseDateOnly(value: string) {
  return new Date(`${value}T00:00:00Z`);
}

export function formatEventDateRange(startDate: string, endDate: string) {
  const start = parseDateOnly(startDate);
  const end = parseDateOnly(endDate);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return [startDate, endDate].filter(Boolean).join(" – ");
  }

  const sameMonth = start.getUTCMonth() === end.getUTCMonth();
  const sameYear = start.getUTCFullYear() === end.getUTCFullYear();

  if (sameMonth && sameYear) {
    return `${DAY_FORMATTER.format(start)} – ${DATE_FORMATTER.format(end)}`;
  }

  return `${DATE_FORMATTER.format(start)} – ${DATE_FORMATTER.format(end)}`;
}

type EventCardProps = {
  event: EventCarouselItem;
  cardWidth: number;
  cardHeight: number;
  imageWidth: number;
  imageHeight: number;
  onCtaClick?: (event: EventCarouselItem) => void;
};

function EventCard({ event, cardWidth, cardHeight, imageWidth, imageHeight, onCtaClick }: EventCardProps) {
  const description = `${formatEventDateRange(event.start_date, event.end_date)} | ${event.location}`;

  const activateCta = (clickEvent: React.MouseEvent<HTMLElement>) => {
    const target = clickEvent.target as HTMLElement;
    if (target.closest('[data-slot="link-card-cta"]')) return;

    clickEvent.currentTarget.querySelector<HTMLElement>('[data-slot="link-card-cta"]')?.click();
    clickEvent.preventDefault();
    clickEvent.stopPropagation();
  };

  return (
    <article
      data-slot="event-card"
      onClickCapture={activateCta}
      className={cn(
        "gencl:box-border gencl:flex-none gencl:cursor-pointer gencl:overflow-hidden gencl:rounded-lg",
        "gencl:bg-white gencl:text-black gencl:ring-1 gencl:ring-secondary-200 gencl:ring-inset"
      )}
      style={{ width: cardWidth, height: cardHeight }}>
      <LinkCard
        data={{
          link: event.cta.href,
          title: event.heading,
          image: event.image.src,
          description,
        }}
        sheetState="expand-view"
        density="compact"
        compactThumbnailSize={{ width: imageWidth, height: imageHeight }}
        theme="light"
        ctaText={event.cta.label}
        ctaLink={event.cta.href}
        descriptionClassName="gencl:h-8! gencl:text-body-2-medium! gencl:leading-4!"
        ctaClassName={cn(
          "gencl:h-9! gencl:gap-1.5 gencl:pl-2.5 gencl:pr-1.5",
          "gencl:[&>span]:text-body-2-semi-bold! gencl:[&>svg]:size-5!"
        )}
        onCtaClick={() => onCtaClick?.(event)}
      />
    </article>
  );
}

/** Tolerance (px) for sub-pixel scroll offsets when deciding if an end is reached. */
const SCROLL_EPSILON = 2;

/** Horizontally scrollable row of compact event cards. */
export function EventCarousel({
  events,
  cardWidth = 332,
  cardHeight = 120,
  imageWidth = 76,
  imageHeight = 76,
  gap = 8,
  ariaLabel = "Events",
  showNavigation = true,
  onCtaClick,
  className,
  ...props
}: EventCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [scrollState, setScrollState] = useState({ canScrollLeft: false, canScrollRight: false });

  const syncScrollState = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const maxScrollLeft = track.scrollWidth - track.clientWidth;
    setScrollState({
      canScrollLeft: track.scrollLeft > SCROLL_EPSILON,
      canScrollRight: track.scrollLeft < maxScrollLeft - SCROLL_EPSILON,
    });
  }, []);

  // The track's overflow depends on both the container width and the number of cards,
  // so the arrows have to be re-evaluated on resize, not just on scroll.
  useEffect(() => {
    syncScrollState();
    const track = trackRef.current;
    if (!track || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(syncScrollState);
    observer.observe(track);
    return () => observer.disconnect();
  }, [syncScrollState, events.length]);

  const scrollByPage = useCallback(
    (direction: 1 | -1) => {
      const track = trackRef.current;
      if (!track) return;
      const step = cardWidth + gap;
      // Advance by as many whole cards as currently fit, never less than one.
      const cardsPerPage = Math.max(1, Math.floor(track.clientWidth / step));
      track.scrollBy({ left: direction * cardsPerPage * step, behavior: "smooth" });
    },
    [cardWidth, gap]
  );

  if (events.length === 0) return null;

  const hasNavigation = showNavigation && (scrollState.canScrollLeft || scrollState.canScrollRight);

  return (
    <section aria-label={ariaLabel} className={cn("gencl:relative gencl:w-full", className)} {...props}>
      <div
        ref={trackRef}
        data-slot="event-carousel-track"
        onScroll={syncScrollState}
        className="gencl:flex gencl:w-full gencl:overflow-x-auto gencl:pb-2 gencl:[scrollbar-width:none] gencl:[&::-webkit-scrollbar]:hidden"
        style={{ gap, scrollSnapType: "x mandatory" }}>
        {events.map((event) => (
          <div key={event.id} style={{ scrollSnapAlign: "start" }}>
            <EventCard
              event={event}
              cardWidth={cardWidth}
              cardHeight={cardHeight}
              imageWidth={imageWidth}
              imageHeight={imageHeight}
              onCtaClick={onCtaClick}
            />
          </div>
        ))}
      </div>

      {hasNavigation ? (
        <>
          <NavArrowButton
            direction="left"
            theme="dark"
            size="md"
            testId="event-carousel-prev"
            ariaLabel="Previous events"
            disabled={!scrollState.canScrollLeft}
            onClick={() => scrollByPage(-1)}
            className="gencl:absolute gencl:left-2 gencl:top-1/2 gencl:z-10 gencl:-translate-y-1/2"
          />
          <NavArrowButton
            direction="right"
            theme="dark"
            size="md"
            testId="event-carousel-next"
            ariaLabel="Next events"
            disabled={!scrollState.canScrollRight}
            onClick={() => scrollByPage(1)}
            className="gencl:absolute gencl:right-2 gencl:top-1/2 gencl:z-10 gencl:-translate-y-1/2"
          />
        </>
      ) : null}
    </section>
  );
}
