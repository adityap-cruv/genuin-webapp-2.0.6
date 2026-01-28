import { EventName } from "./context";

/**
 * Type for the payload that can be sent with a tracking event.
 */
export type EventPayload = Record<string, any>;

/**
 * Rudderstack Analytics SDK loaded from CDN
 * Documentation: https://www.rudderstack.com/docs/sources/event-streams/sdks/rudderstack-javascript-sdk/
 */
type RudderstackSDK = {
  load: (writeKey: string, dataPlaneUrl: string, options?: any) => void;
  ready: (callback: () => void) => void;
  track: (
    eventName: string,
    payload?: Record<string, any>,
    options?: any,
    callback?: () => void
  ) => void;
  page: (
    category?: string,
    name?: string,
    properties?: Record<string, any>,
    options?: any,
    callback?: () => void
  ) => void;
  identify: (
    userId?: string,
    traits?: Record<string, any>,
    options?: any,
    callback?: () => void
  ) => void;
  alias: (
    to: string,
    from?: string,
    options?: any,
    callback?: () => void
  ) => void;
  group: (
    groupId: string,
    traits?: Record<string, any>,
    options?: any,
    callback?: () => void
  ) => void;
  reset: (resetAnonymousId?: boolean) => void;
  getAnonymousId: (options?: any) => string;
  setAnonymousId: (anonymousId: string, rudderAmpLinkerParam?: string) => void;
};

declare global {
  interface Window {
    rudderanalytics: RudderstackSDK;
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
