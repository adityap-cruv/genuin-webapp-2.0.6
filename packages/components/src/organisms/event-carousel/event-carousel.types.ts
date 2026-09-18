import type { ComponentPropsWithoutRef } from "react";

export type EventCarouselItem = {
  id: string;
  heading: string;
  image: {
    src: string;
  };
  start_date: string;
  end_date: string;
  location: string;
  cta: {
    label: string;
    href: string;
  };
};

export interface EventCarouselProps extends Omit<ComponentPropsWithoutRef<"section">, "children"> {
  events: readonly EventCarouselItem[];
  cardWidth?: number;
  cardHeight?: number;
  imageWidth?: number;
  imageHeight?: number;
  gap?: number;
  ariaLabel?: string;
  /** Show the left/right scroll arrows when the track overflows. @default true */
  showNavigation?: boolean;
  onCtaClick?: (event: EventCarouselItem) => void;
}
