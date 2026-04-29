import {
  RUDDERSTACK_DATAPLANE_URL,
  RUDDERSTACK_WRITE_KEY,
} from "@genuin/components/lib/utils/env";
import { EventNameType, EventPayload, QueuedEvent } from "./types";
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
export type DefaultAnalyticsPayload = {
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
  user_city?: string;
  user_country?: string;
  user_region?: string;
  user_location?: string;
  user_postal?: string;
  user_timezone?: string;
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
  private rudderAnalyticsInstance: any = null; // Will be window.rudderanalytics from CDN
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

  /**
   * Loads Rudderstack analytics from CDN with very low priority using official installation method
   * Based on: https://www.rudderstack.com/docs/sources/event-streams/sdks/rudderstack-javascript-sdk/installation/
   * @returns Promise that resolves when script is loaded and initialized
   */
  private loadRudderStackScript(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      // Check if already loaded
      if (typeof window !== "undefined" && (window as any).rudderanalytics) {
        resolve();
        return;
      }

      if (typeof window === "undefined") {
        reject(new Error("[AnalyticsService] Window object not available"));
        return;
      }

      try {
        // Stub pattern: assign rudderanalytics as an array so that method calls queue
        // as [methodName, ...args] entries until the real SDK replaces them on load.
        const rudderanalytics = ((window as any).rudderanalytics = [] as any);

        // Methods to stub
        const methods = [
          "load",
          "page",
          "track",
          "identify",
          "alias",
          "group",
          "ready",
          "reset",
          "getAnonymousId",
          "setAnonymousId",
          "getUserId",
          "getUserTraits",
          "getGroupId",
          "getGroupTraits",
          "startSession",
          "endSession",
          "getSessionId",
        ];

        // Create stub for each method to queue calls
        for (const method of methods) {
          rudderanalytics[method] = (function (methodName: string) {
            return function () {
              rudderanalytics.push(
                [methodName].concat(Array.prototype.slice.call(arguments)),
              );
            };
          })(method);
        }

        // Load the actual SDK script
        const script = document.createElement("script");
        script.type = "text/javascript";
        script.async = true;
        script.src = "https://cdn.rudderlabs.com/v3/modern/rsa.min.js";

        script.onload = () => {
          resolve();
        };

        script.onerror = () => {
          // Modern ES module bundle failed (older browsers); retry with the legacy IIFE bundle.
          const legacyScript = document.createElement("script");
          legacyScript.type = "text/javascript";
          legacyScript.async = true;
          legacyScript.src = "https://cdn.rudderlabs.com/v3/legacy/rsa.min.js";

          legacyScript.onload = () => {
            resolve();
          };

          legacyScript.onerror = () => {
            reject(
              new Error(
                "[AnalyticsService] Failed to load Rudderstack from CDN",
              ),
            );
          };

          document.head.appendChild(legacyScript);
        };

        document.head.appendChild(script);
      } catch (error) {
        reject(error);
      }
    });
  }

  public initialize(
    defaultPayload: DefaultAnalyticsPayload,
    brandDetails?: BrandDetailsConfigType,
    embedData?: EmbedDataType,
  ): Promise<void> {
    if (
      typeof window !== "undefined" &&
      (window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1")
    ) {
      return Promise.resolve();
    }

    if (this.initializationPromise) {
      return this.initializationPromise;
    }
    if (!defaultPayload) {
      console.warn(
        "[AnalyticsService] initialize called without defaultPayload. Analytics events may be missing required fields.",
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

    // Validate initial payload has critical fields
    this.validatePayload();

    this.setVideoEventsPayload(brandDetails, embedData);

    this.initializationPromise = new Promise<void>((resolve, reject) => {
      if (this.isInitialized) {
        resolve();
        return;
      }

      const doInitialize = async () => {
        try {
          if (typeof window !== "undefined") {
            // Load Rudderstack from CDN
            await this.loadRudderStackScript();

            // Use global rudderanalytics from CDN
            this.rudderAnalyticsInstance = (window as any).rudderanalytics;

            if (!this.rudderAnalyticsInstance) {
              throw new Error(
                "[AnalyticsService] Rudderstack failed to load from CDN",
              );
            }

            if (!RUDDERSTACK_WRITE_KEY || !RUDDERSTACK_DATAPLANE_URL) {
              throw new Error(
                "[AnalyticsService] RudderStack WRITE_KEY or DATAPLANE_URL is undefined. Please check your environment variables.",
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
                queueOptions: {
                  batch: {
                    enabled: true,
                    maxItems: 30,
                    flushInterval: 10000,
                  },
                },
              },
              // Optional: add load options if any, e.g. { configUrl: "YOUR_CONFIG_URL" }
            );

            this.rudderAnalyticsInstance.ready(() => {
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
          //   "[AnalyticsService] Error during RudderAnalytics initialization from CDN:",
          //   error
          // );
          // Fallback to simulated initialization if CDN load fails
          if (typeof window !== "undefined") {
            // console.warn(
            //   "[AnalyticsService] RudderAnalytics initialization from CDN failed. Simulating initialization as fallback."
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

      // Defer RudderStack init to idle time so it doesn't block first paint.
      // 500ms setTimeout is the iOS Safari fallback — it lacks requestIdleCallback.
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
    embedData?: EmbedDataType,
  ) {
    // Only build video payload once; re-running after first init would overwrite brand config values.
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
    value?: any,
  ) {
    // Start with existing payload or minimal base structure
    const currentPayload = this.defaultPayload ?? {
      user_id: undefined,
      gen_user_id: undefined,
      brand_id: undefined,
      channel: "",
      environment: "",
      path: "",
      query_params: {},
      title: "",
    };

    if (typeof keyOrObject === "string") {
      // Updating a single key-value pair - preserve all existing values
      this.defaultPayload = {
        ...currentPayload,
        [keyOrObject]: value,
      };
    } else if (typeof keyOrObject === "object" && keyOrObject !== null) {
      // Updating multiple fields via an object - preserve all existing values
      // Guard: IP-info updates and other partial merges arrive without brand_id.
      // Preserve the existing brand_id rather than wiping it with undefined/null.
      const incomingBrandId = keyOrObject.brand_id;
      const shouldPreserveBrandId =
        currentPayload.brand_id &&
        (incomingBrandId === undefined || incomingBrandId === null);

      this.defaultPayload = {
        ...currentPayload,
        ...keyOrObject,
        // Ensure brand_id is never lost if it was previously set
        ...(shouldPreserveBrandId && { brand_id: currentPayload.brand_id }),
      };
    } else {
      // Optional: Handle unexpected input
      console.warn(
        "[AnalyticsService] Invalid input to updatePayload:",
        keyOrObject,
      );
      return;
    }

    // Validate critical fields after update
    this.validatePayload();
  }

  /**
   * Validates that critical analytics fields are present and logs warnings if missing
   */
  private validatePayload(): void {
    if (!this.defaultPayload) {
      console.warn(
        "[AnalyticsService] defaultPayload is null after updatePayload",
      );
      return;
    }

    const criticalFields = ["brand_id", "channel", "environment"] as const;
    const missingFields: string[] = [];

    criticalFields.forEach((field) => {
      const value = this.defaultPayload?.[field];
      if (value === undefined || value === null || value === "") {
        missingFields.push(field);
      }
    });

    if (missingFields.length > 0) {
      console.warn(
        `[AnalyticsService] Critical analytics fields missing or empty: ${missingFields.join(", ")}. Events may not track correctly.`,
      );
    }
  }

  public async track(
    eventName: EventNameType,
    payload?: EventPayload,
  ): Promise<void> {
    // Early return if defaultPayload is not initialized
    if (!this.defaultPayload) {
      console.warn(
        `[AnalyticsService] Cannot track event "${eventName}": defaultPayload is not initialized. Call initialize() first.`,
      );
      const isEventQueued = this.eventQueue.some(
        (e) => e.eventName === eventName,
      );
      if (!isEventQueued) {
        this.eventQueue.push({
          eventName,
          payload: payload || {},
          timestamp: Date.now(),
        });
      }
      return;
    }

    // Video config fields (autoplay, tap behaviour, etc.) attach to all video-named events
    // plus a few that don't follow the "Video" prefix convention.
    const remainingVideoEvents = ["Muted", "Unmuted", "Midpoint"];
    const mergedPayload = {
      ...(this.defaultPayload || {}),
      ...(payload || {}),
      ...(eventName.startsWith("Video") ||
      remainingVideoEvents.includes(eventName)
        ? this.defaultVideoEventPayload
        : {}),
    };

    // Filter out undefined/null values from payload
    const sanitizedPayload = Object.entries(mergedPayload).reduce(
      (acc, [key, value]) => {
        if (value !== undefined && value !== null) {
          acc[key] = value;
        }
        return acc;
      },
      {} as Record<string, any>,
    );

    // Define critical fields that must be present
    const criticalFields = ["brand_id", "channel", "environment"] as const;
    const missingCriticalFields: string[] = [];

    // Force inject critical fields if missing from sanitizedPayload but present in defaultPayload
    criticalFields.forEach((field) => {
      if (
        !(field in sanitizedPayload) ||
        sanitizedPayload[field] === undefined ||
        sanitizedPayload[field] === null
      ) {
        // Check if the field exists in defaultPayload
        const defaultValue = this.defaultPayload?.[field];
        if (
          defaultValue !== undefined &&
          defaultValue !== null &&
          defaultValue !== ""
        ) {
          sanitizedPayload[field] = defaultValue;
        } else {
          // Track fields that are missing from both payload and defaultPayload
          missingCriticalFields.push(field);
        }
      }
    });

    // Warn if critical fields are still missing after injection attempt
    if (missingCriticalFields.length > 0) {
      console.warn(
        `[AnalyticsService] Event "${eventName}" is missing critical fields: ${missingCriticalFields.join(", ")}. These fields were not found in defaultPayload and could not be injected.`,
      );
    }

    const eventData: QueuedEvent = {
      eventName,
      payload: sanitizedPayload,
      timestamp: Date.now(),
    };
    // console.log(
    //   `[AnalyticsService Track] Event: ${eventName}`,
    //   sanitizedPayload
    // );
    if (
      this.isInitialized &&
      this.rudderAnalyticsInstance // Use the instance here
    ) {
      this.rudderAnalyticsInstance.track(eventName, sanitizedPayload, {
        os: { name: this.uaParser.os.name, version: this.uaParser.os.version },
      });
    } else if (this.isInitialized) {
      // SDK initialized (possibly simulated after error) but rudderAnalyticsInstance is not available
      // console.log(
      //   `[AnalyticsService Track (Simulated or SDK instance error)] Event: ${eventName}`,
      //   sanitizedPayload
      // );
    } else {
      // console.log(
      //   `[AnalyticsService Queued] Event: ${eventName}. Waiting for initialization.`,
      //   sanitizedPayload
      // );
      this.eventQueue.push(eventData);
      // Ensure initialization is triggered if not already in progress
      if (!this.initializationPromise) {
        if (this.defaultPayload) {
          this.initialize(this.defaultPayload).catch((_error) => {
            // console.error(
            //   "[AnalyticsService] Error during initialization after event track:",
            //   error
            // );
          });
        } else {
          console.warn(
            "[AnalyticsService] Cannot auto-initialize: defaultPayload is not set.",
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

  public flush(): void {
    try {
      if (!this.isInitialized) return;

      if (this.eventQueue.length > 0) {
        this.processEventQueue();
      }

      if (
        this.rudderAnalyticsInstance &&
        typeof this.rudderAnalyticsInstance.flush === "function"
      ) {
        this.rudderAnalyticsInstance.flush();
      }
    } catch (error) {
      console.warn(
        "[AnalyticsService] Failed to flush analytics events:",
        error,
      );
    }
  }

  public getIsInitialized(): boolean {
    return this.isInitialized;
  }

  public getDefaultPayload(): DefaultAnalyticsPayload | null {
    return this.defaultPayload;
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
