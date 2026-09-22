import type { ComponentPropsWithoutRef, ReactNode } from "react";

export type IHeartAudioAttributes = {
  type: "station" | "podcast";
  station_id?: string | null;
  podcast_id?: string | null;
};

export type IHeartAudioCarouselItem = {
  id: string;
  brand?: string;
  heading: string;
  subheading?: string;
  image: {
    src: string;
    alt?: string;
  };
  waveform?: readonly number[];
  durationLabel?: string;
  audioAttributes: IHeartAudioAttributes;
};

export interface IHeartAudioCarouselProps extends Omit<ComponentPropsWithoutRef<"section">, "children"> {
  stations: readonly IHeartAudioCarouselItem[];
  cardWidth?: number;
  cardHeight?: number;
  imageSize?: number;
  playButtonSize?: number;
  waveformBarCount?: number;
  gap?: number;
  ariaLabel?: string;
  badge?: ReactNode;
}
