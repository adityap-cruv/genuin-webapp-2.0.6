"use client";

import { cn } from "@genuin/ui/lib/utils";

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

  return (
    <article
      data-slot="event-card"
      className={cn(
        "gencl:box-border gencl:flex-none gencl:overflow-hidden gencl:rounded-lg",
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
        onCtaClick={() => onCtaClick?.(event)}
      />
    </article>
  );
}

/** Horizontally scrollable row of compact event cards. */
export function EventCarousel({
  events,
  cardWidth = 332,
  cardHeight = 120,
  imageWidth = 76,
  imageHeight = 76,
  gap = 8,
  ariaLabel = "Events",
  onCtaClick,
  className,
  ...props
}: EventCarouselProps) {
  if (events.length === 0) return null;

  return (
    <section aria-label={ariaLabel} className={cn("gencl:w-full", className)} {...props}>
      <div
        data-slot="event-carousel-track"
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
    </section>
  );
}
