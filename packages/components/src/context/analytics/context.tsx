"use client";

import { createContext, useContext } from "react";
import { EventNameType, EventPayload } from "./types";

/**
 * Defines the names of trackable events.
 * Add more event names as your application requires.
 */
export const EventName = {
  VIDEO_STARTED: "Video Started",
  VIDEO_FIRST_QUARTILE: "Video First Quartile",
  VIDEO_MIDPOINT: "Midpoint",
  VIDEO_THIRD_QUARTILE: "Video Third Quartile",
  VIDEO_COMPLETED: "Video Completed",
  VIDEO_PAUSED: "Video Paused",
  VIDEO_MUTED: "Video Muted",
  VIDEO_UNMUTED: "Video Unmuted",
  VIDEO_WATCHED: "Video Watched",
  VIDEO_PLAY: "Video Play",
  PAGE_VIEW: "Page Viewed",
} as const;

type AnalyticsContextType = {
  /**
   * Tracks an event with an optional payload using the AnalyticsService.
   * @param eventName The name of the event to track.
   * @param payload Additional data associated with the event.
   */
  track: (eventName: EventNameType, payload?: EventPayload) => void; // track is now async
  EventName: typeof EventName; // Expose EventName for easy access
};

export const AnalyticsContext = createContext<AnalyticsContextType | undefined>(
  undefined
);

/**
 * Custom hook to access the AnalyticsContext.
 * Provides an easy way to use the `track` function.
 * @throws Error if used outside of an `AnalyticsProvider`.
 */
export function useAnalytics(): AnalyticsContextType {
  const context = useContext(AnalyticsContext);
  if (context === undefined) {
    throw new Error("useAnalytics must be used within an AnalyticsProvider");
  }
  return context;
}
