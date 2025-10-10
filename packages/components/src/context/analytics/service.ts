import {
  RUDDERSTACK_DATAPLANE_URL,
  RUDDERSTACK_WRITE_KEY,
} from "@genuin/components/lib/utils/env";
import { EventNameType, EventPayload, QueuedEvent } from "./types";
import { RudderAnalytics } from "@rudderstack/analytics-js";
import { UAParser } from "ua-parser-js";
import {
  getLinkDelay,
  getTapBehaviour,
  getVideoAutoplay,
  getVideoPlayInFeed,
} from "./utils";
import { BrandDetailsConfigType } from "@genuin/components/types/brand";
import { EmbedDataType } from "../embed/embed.types";

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
  // SDK-specific fields - optional
  embed_id?: string;
  embed_type?: string;
  embed_style?: string;
  content_category?: string;
  phone_no?: string;
  sdk_version?: string;
  user_name?: string;
  gen_user_name?: string;
  browser_name?: string;
  browser_version?: string;
  device_name?: string;
};

type DefaultVideoEventPayload = {
  tap_behaviour: string;
  video_autoplay: string;
  autoplay_config: number;
  video_starts_with_sound_on: boolean;
  video_play_in_feed: string;
  in_feed_reaction: string;
  link_delay: string;
  should_card_autoplay?: boolean;
  should_card_video_loop?: boolean;
};

class AnalyticsServiceSingleton {
  private static instance: AnalyticsServiceSingleton;
  private isInitialized = false;
  private eventQueue: QueuedEvent[] = [];
  private initializationPromise: Promise<void> | null = null;
  private defaultPayload: DefaultAnalyticsPayload | null = null;
  private defaultVideoEventPayload: DefaultVideoEventPayload | null = null;
  private rudderAnalyticsInstance: RudderAnalytics | null = null; // Added RudderAnalytics instance
  private uaParser = new UAParser().getResult();
  private constructor() {
    // Private constructor to prevent direct instantiation
  }

  public static getInstance(): AnalyticsServiceSingleton {
    if (!AnalyticsServiceSingleton.instance) {
      AnalyticsServiceSingleton.instance = new AnalyticsServiceSingleton();
    }
    return AnalyticsServiceSingleton.instance;
  }

  public initialize(
    defaultPayload: DefaultAnalyticsPayload,
    brandDetails?: BrandDetailsConfigType,
    embedData?: EmbedDataType
  ): Promise<void> {
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
    this.defaultPayload = {
      ...defaultPayload,
      browser_name: this.uaParser.browser.name,
      browser_version: this.uaParser.browser.version,
      device_name: this.uaParser.device.model,
    };

    this.setVideoEventsPayload(brandDetails, embedData);

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
            if (!RUDDERSTACK_WRITE_KEY || !RUDDERSTACK_DATAPLANE_URL) {
              throw new Error(
                "[AnalyticsService] RudderStack WRITE_KEY or DATAPLANE_URL is undefined. Please check your environment variables."
              );
            }
            this.rudderAnalyticsInstance.load(
              RUDDERSTACK_WRITE_KEY,
              RUDDERSTACK_DATAPLANE_URL,
              {
                storage: {
                  type: "localStorage",
                  cookie: {},
                  entries: {
                    // TODO check form where it comes
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

  private setVideoEventsPayload(
    brandDetails?: BrandDetailsConfigType,
    embedData?: EmbedDataType
  ) {
    if (this.defaultVideoEventPayload || !brandDetails) return;
    const { web_configs, reactions } = brandDetails;
    const isCarousel = embedData?.style === "carousel";
    this.defaultVideoEventPayload = {
      tap_behaviour: getTapBehaviour(web_configs),
      video_autoplay: getVideoAutoplay(web_configs),
      autoplay_config: web_configs.video_autoplay.auto_play_after,
      video_starts_with_sound_on: web_configs.is_start_with_sound,
      video_play_in_feed: getVideoPlayInFeed(web_configs),
      in_feed_reaction: reactions.type,
      link_delay: getLinkDelay(web_configs),
      ...(isCarousel && {
        should_card_autoplay: embedData.media_play?.enable_autoplay,
        should_card_video_loop: embedData.media_play?.enable_loop_video,
      }),
    };
  }

  public updatePayload(
    keyOrObject: string | Partial<DefaultAnalyticsPayload>,
    value?: any
  ) {
    // Ensure base structure exists
    const basePayload: DefaultAnalyticsPayload = {
      user_id: undefined,
      gen_user_id: undefined,
      brand_id: undefined,
      channel: "",
      environment: "",
      path: "",
      query_params: {},
      title: "",
      ...(this.defaultPayload ?? {}),
    };

    if (typeof keyOrObject === "string") {
      // Updating a single key-value pair
      this.defaultPayload = {
        ...basePayload,
        [keyOrObject]: value,
      };
    } else if (typeof keyOrObject === "object" && keyOrObject !== null) {
      // Updating multiple fields via an object
      this.defaultPayload = {
        ...basePayload,
        ...keyOrObject,
      };
    } else {
      // Optional: Handle unexpected input
      console.warn("Invalid input to updatePayload");
    }
  }

  public async track(
    eventName: EventNameType,
    payload?: EventPayload
  ): Promise<void> {
    const remainingVideoEvents = ["Muted", "Unmuted", "Midpoint"];
    const mergedPayload = {
      ...(this.defaultPayload || {}),
      ...(payload || {}),
      ...(eventName.startsWith("Video") ||
      remainingVideoEvents.includes(eventName)
        ? this.defaultVideoEventPayload
        : {}),
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
      this.rudderAnalyticsInstance.track(eventName, mergedPayload, {
        os: { name: this.uaParser.os.name, version: this.uaParser.os.version },
      });
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
