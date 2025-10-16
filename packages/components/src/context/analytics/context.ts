"use client";

import { createContext, useContext } from "react";
import { EventNameType, EventPayload } from "./types";

// TODO Change the type in case of SDK
/**
 * Defines the names of trackable events.
 * Add more event names as your application requires.
 */
export const EventName = {
  VIDEO_STARTED: "Video Started",
  VIDEO_IMPRESSION: "Video Impression",
  VIDEO_FIRST_QUARTILE: "Video First Quartile",
  VIDEO_MIDPOINT: "Midpoint",
  VIDEO_THIRD_QUARTILE: "Video Third Quartile",
  VIDEO_COMPLETED: "Video Complete",
  /**
   * this event should be sent to backend only.
   */
  VIDEO_MARK_COMPLETE: "Video Mark Complete",
  VIDEO_PAUSED: "Video Paused",
  VIDEO_MUTED: "Muted",
  VIDEO_UNMUTED: "Unmuted",
  VIDEO_WATCHED: "Video Watched",
  VIDEO_PLAY: "Video Play",
  PAGE_VIEW: "Page Viewed",
  BECOME_CREATOR: "Become CB Request Clicked",
  EMBED_INITIALIZED: "Embed Initialized",
  PLACEMENT_INITIALIZED: "Placement Initialized",
  PLACEMENT_VIEWED: "Placement Viewed",
  SECTION_CHANGES: "Section Changes",
  EMBED_VIEWED: "Embed Viewed",
  EMBED_MAXIMIZED: "Embed Maximized",
  EMBED_MINIMIZED: "Embed Minimized",
  PLACEMENT_MAXIMIZED: "Placement Maximized",
  PLACEMENT_MINIMIZED: "Placement Minimized",
  EMBED_CTA_CLICKED: "Embed CTA Clicked",
  FLOATING_EMBED: "Floating Embed",
  VIDEO_MAXIMIZED: "Video Maximized",
  VIDEO_MINIMIZED: "Video Minimized",
  VIDEO_INVIEW: "Video Inview",
  VIDEO_REPOST: "Repost Success",
  VIDEO_SPARK: "Video Sparked",
  VIDEO_UNSPARK: "Video Unsparked",
  COMMENT_SPARK: "Comment Sparked",
  COMMENT_UNSPARK: "Comment Unsparked",
  SWIPE_UP_GESTURE: "Swipe Up Gesture",
  PLAY_PAUSE_GESTURE: "Play/Pause Gesture",
  VIDEO_COMMENT: "RT Comment Clicked",
  VIDEO_COMMENTED: "Commented On Video",
  VIDEO_SHARED: "Video Shared",
  VIDEO_REPORT: "Video Reported",
  COMMENT_REPORT: "Comment Reported",
  COMMENT_DELETE: "Comment Deleted",
  COMMUNITY_SHARED: "Community Shared",
  LINKOUTS_VIEWED: "Link Viewed",
  LINKOUTS_CLICKED: "Link Clicked",
  LINKOUTS_CTA_CLICKED: "Link CTA Button Clicked",
  KS_USERNAME_SET: "Ks Username Set",
  // SETTINGS_CLOSED: "Settings Closed",
  SUBSCRIPTION_CLICKED: "Subscription Clicked",
  LOG_OUT: "Log Out",
  SETTINGS_CONTACT_US_FORM_SENT: "Settings Contact Us Form Sent",
  NOTIFICATION_SETTINGS_MODIFIED: "Notification Settings Modified",
  KEYWORD_SEARCHED: "Keyword Searched",
  CHECK_RECENT_SEARCH: "Check Recent Search",
  CLEAR_RECENT_SEARCH: "Clear Recent Search",
  KEYWORD_SEARCH_CANCEL: "Keyword Search Cancel",
  GET_APP_BUTTON_CLICKED: "Get App Button Clicked",
  DOWNLOAD_APP_CLICKED: "Download App Clicked",
  DOWNLOAD_APP_VIEWED: "Download App Viewed",
  GET_APP_LINK_SENT: "Get App Link Sent",
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
