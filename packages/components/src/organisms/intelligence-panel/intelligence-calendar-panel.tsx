"use client";

import { Image } from "@genuin/ui/components/image";
import { Heading, Text } from "@genuin/ui/components/typography";
import { cn } from "@genuin/ui/lib/utils";
import { ArrowUpRight, MapPin } from "lucide-react";
import * as React from "react";

import { Link } from "@genuin/components/molecules/link";

import { IntelligencePanelShell } from "./intelligence-panel-shell";
import type {
  IntelligenceCalendarContentProps,
  IntelligenceCalendarEvent,
  IntelligenceCalendarPanelProps,
} from "./intelligence-panel.types";

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

function NextEventCard({ event }: { event: IntelligenceCalendarEvent }) {
  return (
    <article
      className="gencl:relative gencl:h-40 gencl:overflow-hidden gencl:bg-black gencl:text-white"
      style={{ clipPath: "polygon(7% 0, 100% 0, 100% 100%, 0 100%, 0 14%)" }}>
      {event.image && (
        <Image
          src={event.image.src}
          alt={event.image.alt}
          handleError
          className="gencl:absolute gencl:inset-0 gencl:size-full gencl:object-cover gencl:grayscale"
        />
      )}
      <div
        aria-hidden="true"
        className="gencl:absolute gencl:inset-0 gencl:bg-linear-to-t gencl:from-black/95 gencl:via-black/40 gencl:to-black/10"
      />
      <div className="gencl:absolute gencl:inset-x-0 gencl:bottom-0 gencl:flex gencl:items-end gencl:justify-between gencl:gap-3 gencl:p-3">
        <div className="gencl:min-w-0">
          <Text
            as="p"
            size="body-4"
            weight="medium"
            className="gencl:mb-1 gencl:text-[9px]! gencl:tracking-[0.08em] gencl:text-[#e1bd20] gencl:uppercase">
            Up next · {event.dateLabel}
          </Text>
          <Link href={event.href} className="gencl:text-white gencl:no-underline gencl:hover:text-secondary-100">
            <Heading
              as="h4"
              level="headline-4"
              weight="bold"
              className="gencl:text-[15px]! gencl:leading-4.5! gencl:font-bold! gencl:text-white">
              {event.title}
            </Heading>
          </Link>
          <Text
            as="p"
            size="body-4"
            className="gencl:mt-1 gencl:flex gencl:items-center gencl:gap-1 gencl:text-[9px]! gencl:text-secondary-200">
            <MapPin aria-hidden="true" className="gencl:size-2.5" />
            {event.location}
          </Text>
        </div>
        <Link
          href={event.href}
          aria-label={`View ${event.title}`}
          className="gencl:flex gencl:size-8 gencl:shrink-0 gencl:items-center gencl:justify-center gencl:bg-[#d4ad00] gencl:text-black gencl:hover:brightness-95"
          style={{ clipPath: "polygon(0 0, 100% 0, 100% 70%, 70% 100%, 0 100%)" }}>
          <ArrowUpRight aria-hidden="true" className="gencl:size-3.5" />
        </Link>
      </div>
    </article>
  );
}

function EventRow({ event }: { event: IntelligenceCalendarEvent }) {
  const dateParts = event.dateLabel.split(" ");
  const monthIndex = dateParts.findIndex((part) => MONTH_NAMES.some((month) => month.startsWith(part)));
  const dayRange = dateParts.slice(0, monthIndex).join(" ");
  const monthAndYear = dateParts.slice(monthIndex).join(" ");

  return (
    <article className="gencl:grid gencl:grid-cols-[44px_minmax(0,1fr)_auto] gencl:items-center gencl:gap-2 gencl:border-b gencl:border-secondary-700 gencl:py-2.5">
      <div>
        <Text as="p" size="body-4" weight="bold" className="gencl:text-[12px]! gencl:leading-3! gencl:text-white">
          {dayRange}
        </Text>
        <Text
          as="p"
          size="body-4"
          className="gencl:mt-1 gencl:text-[8px]! gencl:leading-2.5! gencl:text-secondary-400 gencl:uppercase">
          {monthAndYear}
        </Text>
      </div>
      <div className="gencl:min-w-0">
        <Link
          href={event.href}
          className="gencl:block gencl:truncate gencl:text-[10px] gencl:font-medium gencl:text-white gencl:underline gencl:decoration-white/40 gencl:underline-offset-2">
          {event.title}
        </Link>
        <Text as="p" size="body-4" className="gencl:mt-0.5 gencl:truncate gencl:text-[8px]! gencl:text-secondary-400">
          {event.location}
        </Text>
      </div>
      <Text
        as="span"
        size="body-4"
        weight="medium"
        className={cn(
          "gencl:text-[8px]! gencl:uppercase",
          event.status === "complete" ? "gencl:text-secondary-500" : "gencl:text-[#ed1c24]"
        )}>
        {event.status === "complete" ? "Done" : event.status}
      </Text>
    </article>
  );
}

/**
 * Shell-less calendar body. Renders the header, next-event card, schedule,
 * and footer so it can be composed inside the Intelligence shell or as a
 * block in an Intelligence chat response.
 */
export function IntelligenceCalendarContent({
  title,
  year,
  events,
  fullCalendarHref,
  sourceLabel,
}: IntelligenceCalendarContentProps) {
  const nextEvent = events.find((event) => event.status === "next");

  return (
    <div className="gencl:mt-2 gencl:flex gencl:min-h-full gencl:flex-col gencl:gap-3 gencl:bg-secondary-900 gencl:p-3 gencl:text-white">
      <header>
        <Text as="p" size="body-4" weight="medium" className="gencl:mb-1 gencl:text-[10px]! gencl:text-[#ef2525]">
          SailGP Events
        </Text>
        <Heading
          as="h3"
          level="headline-3"
          weight="bold"
          className="gencl:text-[25px]! gencl:leading-[1.05]! gencl:font-bold! gencl:tracking-[-0.035em] gencl:text-white">
          {title}
        </Heading>
      </header>

      {nextEvent && <NextEventCard event={nextEvent} />}

      <section aria-label={`${year} full season schedule`}>
        <div className="gencl:flex gencl:h-9 gencl:items-center gencl:justify-between gencl:border-b gencl:border-white">
          <div>
            <Text as="p" size="body-4" weight="bold" className="gencl:text-[11px]! gencl:text-white">
              Full season view
            </Text>
            <Text as="p" size="body-4" className="gencl:text-[8px]! gencl:text-secondary-400">
              {year}
            </Text>
          </div>
          <Text as="p" size="body-4" className="gencl:text-[9px]! gencl:text-secondary-400">
            {events.length} events
          </Text>
        </div>

        <div>
          {events.map((event) => (
            <EventRow key={event.id} event={event} />
          ))}
        </div>
      </section>

      <footer className="gencl:flex gencl:items-center gencl:justify-between gencl:gap-3 gencl:pb-2">
        <Text as="p" size="body-4" className="gencl:text-[9px]! gencl:text-secondary-400">
          Source: {sourceLabel}
        </Text>
        <Link
          href={fullCalendarHref}
          className="gencl:inline-flex gencl:h-7 gencl:items-center gencl:gap-1 gencl:bg-[#ed1c24] gencl:px-3 gencl:text-[9px] gencl:font-medium gencl:text-white gencl:no-underline gencl:hover:brightness-95"
          style={{ clipPath: "polygon(0 0, 100% 0, 100% 70%, 88% 100%, 0 100%)" }}>
          Full calendar
          <ArrowUpRight aria-hidden="true" className="gencl:size-3" />
        </Link>
      </footer>
    </div>
  );
}

/** The Foil-inspired full-season event calendar for Intelligence. */
export const IntelligenceCalendarPanel = React.forwardRef<HTMLElement, IntelligenceCalendarPanelProps>(
  function IntelligenceCalendarPanel(
    { title, year, events, fullCalendarHref, sourceLabel, size, onClose, className, ...props },
    ref
  ) {
    return (
      <IntelligencePanelShell
        ref={ref}
        data-slot="intelligence-calendar-panel"
        size={size}
        onClose={onClose}
        className={className}
        {...props}>
        <IntelligenceCalendarContent
          title={title}
          year={year}
          events={events}
          fullCalendarHref={fullCalendarHref}
          sourceLabel={sourceLabel}
        />
      </IntelligencePanelShell>
    );
  }
);
