import { EventName } from "./context";

/**
 * Type for the payload that can be sent with a tracking event.
 */
export type EventPayload = Record<string, any>;

type AnalyticsSDK = {
  // Define methods for your actual analytics SDK, e.g., RudderStack
  load: (writeKey: string, dataPlaneUrl: string) => void;
  ready: (callback: () => void) => void;
  track: (eventName: EventNameType, payload?: Record<string, any>) => void;
  page: (name?: string, payload?: Record<string, any>) => void; // Example page tracking
};

declare global {
  interface Window {
    rudderanalytics?: AnalyticsSDK; // Example for RudderStack
  }
}

export type EventNameType = (typeof EventName)[keyof typeof EventName];

export type QueuedEvent = {
  eventName: EventNameType;
  payload?: EventPayload;
  timestamp: number;
};
