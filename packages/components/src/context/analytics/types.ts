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
    rudderanalytics: AnalyticsSDK; // Example for RudderStack
  }
}

export type EventNameType = (typeof EventName)[keyof typeof EventName];

/**
 * Maps event names to their respective payload data types.
 * Define specific payload types for each event to ensure type safety.
 */
export type EventPayloadMap = {};

/**
 * Type-safe track function that maps event names to their respective payload types.
 * If an event is defined in EventPayloadMap, it uses that specific type.
 * Otherwise, it falls back to Record<string, any> for flexibility.
 */
export type TrackFunction = <T extends EventNameType>(
  eventName: T,
  payload?: T extends keyof EventPayloadMap
    ? EventPayloadMap[T]
    : Record<string, any>
) => void;

export type QueuedEvent = {
  eventName: EventNameType;
  payload?: EventPayload;
  timestamp: number;
};
