import {
  RUDDERSTACK_DATAPLANE_URL,
  RUDDERSTACK_WRITE_KEY,
} from "@genuin/components/lib/utils/env";
import { EventNameType, EventPayload, QueuedEvent } from "./types";
import { RudderAnalytics } from "@rudderstack/analytics-js";

// Define an interface for the default payload.
// You can customize this based on your specific default payload structure.
type DefaultAnalyticsPayload = {
  user_id: string | undefined;
  gen_user_id: string | undefined;
  brand_id: number | undefined;
  channel: string;
  environment: string;
  url?: string;
  path: string;
  query_params: Record<string, string | string[]>;
  title: string;
};

class AnalyticsServiceSingleton {
  private static instance: AnalyticsServiceSingleton;
  private isInitialized = false;
  private eventQueue: QueuedEvent[] = [];
  private initializationPromise: Promise<void> | null = null;
  private defaultPayload: DefaultAnalyticsPayload | null = null;
  private rudderAnalyticsInstance: RudderAnalytics | null = null; // Added RudderAnalytics instance

  private constructor() {
    // Private constructor to prevent direct instantiation
  }

  public static getInstance(): AnalyticsServiceSingleton {
    if (!AnalyticsServiceSingleton.instance) {
      AnalyticsServiceSingleton.instance = new AnalyticsServiceSingleton();
    }
    return AnalyticsServiceSingleton.instance;
  }

  public initialize(defaultPayload: DefaultAnalyticsPayload): Promise<void> {
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    if (!defaultPayload) {
      console.warn(
        "[AnalyticsService] initialize called without defaultPayload. Analytics events may be missing required fields."
      );
      // Optionally, throw an error here if you want to enforce it strictly
      // throw new Error("defaultPayload is required for AnalyticsService.initialize");
    }
    this.defaultPayload = defaultPayload;

    this.initializationPromise = new Promise<void>((resolve, reject) => {
      if (this.isInitialized) {
        // console.log("[AnalyticsService] Already initialized.");
        resolve();
        return;
      }

      // console.log(
      //   "[AnalyticsService] Attempting low-priority initialization with imported SDK..."
      // );

      const doInitialize = () => {
        try {
          if (typeof window !== "undefined") {
            this.rudderAnalyticsInstance = new RudderAnalytics();
            this.rudderAnalyticsInstance.load(
              RUDDERSTACK_WRITE_KEY,
              RUDDERSTACK_DATAPLANE_URL,
              {
                storage: {
                  type: "localStorage",
                  cookie: {},
                  entries: {
                    userId: { type: "localStorage" },
                    anonymousId: { type: "localStorage" },
                    sessionInfo: { type: "localStorage" },
                    userTraits: { type: "localStorage" }, // Optional: For user traits
                    initialReferrer: { type: "localStorage" }, // Optional: For referrer tracking
                    groupId: { type: "localStorage" }, // Optional: For group tracking
                    groupTraits: { type: "localStorage" }, // Optional: For group traits
                    initialReferringDomain: { type: "localStorage" }, // Optional: For referrer tracking
                    authToken: { type: "localStorage" }, // Optional: For auth token
                  },
                },
                plugins: ["DeviceModeDestinations"],
                integrations: {
                  All: false, // Disables all third-party integrations
                  "Google Analytics": false,
                },
              }
              // Optional: add load options if any, e.g. { configUrl: "YOUR_CONFIG_URL" }
            );

            this.rudderAnalyticsInstance.ready(() => {
              // console.log(
              //   "[AnalyticsService] RudderStack SDK initialized via import."
              // );
              this.isInitialized = true;
              this.processEventQueue();
              resolve();
            });
          } else {
            // Non-browser environment
            // console.warn(
            //   "[AnalyticsService] Non-browser environment, skipping client-side initialization."
            // );
            resolve(); // Resolve to not block, but it won't be truly initialized for client events
          }
        } catch (error) {
          // console.error(
          //   "[AnalyticsService] Error during RudderAnalytics initialization via import:",
          //   error
          // );
          // Fallback to simulated initialization if the imported SDK fails in a browser environment
          if (typeof window !== "undefined") {
            // console.warn(
            //   "[AnalyticsService] RudderAnalytics initialization via import failed. Simulating initialization as fallback."
            // );
            // Simulate initialization for environments where the SDK failed
            setTimeout(() => {
              // console.log(
              //   "[AnalyticsService] Simulated SDK initialization complete (fallback)."
              // );
              this.isInitialized = true; // Mark as initialized for simulation
              this.processEventQueue(); // Process queue with simulated tracking
              resolve();
            }, 1000); // Simulate delay
          } else {
            this.initializationPromise = null; // Allow re-attempting initialization
            reject(error);
          }
        }
      };

      // Defer initialization to be low priority
      if (typeof window !== "undefined" && "requestIdleCallback" in window) {
        window.requestIdleCallback(doInitialize, { timeout: 2000 });
      } else if (typeof window !== "undefined") {
        setTimeout(doInitialize, 500); // Fallback for environments without requestIdleCallback, mostly iOS.
      } else {
        // Non-browser environment, resolve immediately as uninitialized or handle as error
        // console.warn(
        //   "[AnalyticsService] Non-browser environment, skipping client-side initialization."
        // );
        // this.isInitialized = false; // Or true if server-side tracking is set up differently
        resolve(); // Resolve to not block, but it won't be truly initialized for client events
      }
    });
    return this.initializationPromise;
  }

  public async track(
    eventName: EventNameType,
    payload?: EventPayload
  ): Promise<void> {
    const mergedPayload = {
      ...(this.defaultPayload || {}),
      ...(payload || {}),
    };

    const eventData: QueuedEvent = {
      eventName,

      payload: mergedPayload,
      timestamp: Date.now(),
    };
    // console.log(
    //   `[AnalyticsService Track] Event: ${eventName}`,
    //   mergedPayload
    // );
    if (
      this.isInitialized &&
      this.rudderAnalyticsInstance // Use the instance here
    ) {
      // console.log(
      //   `[AnalyticsService Track] Event: ${eventName}`,
      //   mergedPayload
      // );
      this.rudderAnalyticsInstance.track(eventName, mergedPayload);
    } else if (this.isInitialized) {
      // SDK initialized (possibly simulated after error) but rudderAnalyticsInstance is not available
      // console.log(
      //   `[AnalyticsService Track (Simulated or SDK instance error)] Event: ${eventName}`,
      //   mergedPayload
      // );
    } else {
      // console.log(
      //   `[AnalyticsService Queued] Event: ${eventName}. Waiting for initialization.`,
      //   mergedPayload
      // );
      this.eventQueue.push(eventData);
      // Ensure initialization is triggered if not already in progress
      if (!this.initializationPromise) {
        if (this.defaultPayload) {
          this.initialize(this.defaultPayload).catch((error) => {
            // console.error(
            //   "[AnalyticsService] Error during initialization after event track:",
            //   error
            // );
          });
        } else {
          console.warn(
            "[AnalyticsService] Cannot auto-initialize: defaultPayload is not set."
          );
        }
      }
    }
  }

  private processEventQueue(): void {
    if (!this.isInitialized) return;

    // console.log(
    //   `[AnalyticsService] Processing event queue (${this.eventQueue.length} events)...`
    // );
    while (this.eventQueue.length > 0) {
      const event = this.eventQueue.shift();
      if (event) {
        // When processing the queue, the payload is already merged
        this.track(event.eventName, event.payload);
      }
    }
    // console.log("[AnalyticsService] Event queue processed.");
  }

  public getIsInitialized(): boolean {
    return this.isInitialized;
  }

  public setDefaultPayload(payload: DefaultAnalyticsPayload): void {
    this.defaultPayload = payload;
    // console.log(
    //   "[AnalyticsService] Default payload updated:",
    //   this.defaultPayload
    // );
  }
}

export const AnalyticsService = AnalyticsServiceSingleton.getInstance();
