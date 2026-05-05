// lib/utils/observability-tracker.ts
import type { ResourceTimingDetail, EventPayload } from "../../../context/analytics/types";

/**
 * Configuration options for the ObservabilityTracker
 */
interface TrackerConfig {
  apiPatterns?: string;
  includeJS?: boolean;
  includeCSS?: boolean;
  allowedDomains?: string[];
}

/**
 * ObservabilityTracker - Centralized performance and resource tracking
 *
 * This class manages API status tracking and performance metric collection
 * for various resource types including APIs, scripts, stylesheets, images, and videos.
 */
class ObservabilityTracker {
  private statusCodeMap = new Map<string, number>();
  private errorMessageMap = new Map<string, string>();
  private sdkRenderedTime: number | null = null; // Track SDK init() call time
  // Tracks whether the SDK render event has already been fired.
  // This ensures the render logic executes only once, even when multiple embeds are present.
  private isRenderFired: boolean = false;

  private readonly config: Required<TrackerConfig>;

  private static readonly DEFAULT_CONFIG: Required<TrackerConfig> = {
    apiPatterns: "^https:\\/\\/api(\\.qa)?\\.begenuin\\.com",
    includeJS: true,
    includeCSS: true,
    allowedDomains: [
      process.env.NODE_ENV !== "production" ? "localhost" : "",
      "media.begenuin.com",
      "media.qa.begenuin.com",
      // prod cdn domain
      "vz-8bbc7bbf-a1e.b-cdn.net",
      // qa cdn domain
      "vz-eee5e913-a30.b-cdn.net",
    ],
  };

  private static readonly IMAGE_EXTENSIONS = /\.(jpg|jpeg|png|gif|webp|svg)$/i;
  private static readonly VIDEO_EXTENSIONS = /\.(m3u8|mp4)$/i;
  private static readonly THUMBNAIL_KEYWORD = "thumbnail";
  private static readonly HASH_PATTERN = /-[A-Z][A-Za-z0-9-]*(?=\.)/;

  constructor(config?: TrackerConfig) {
    this.config = { ...ObservabilityTracker.DEFAULT_CONFIG, ...config };
  }

  /**
   * Set the SDK init() call timestamp
   */
  public setSdkRenderedTime(timestamp: number): void {
    this.sdkRenderedTime = timestamp;
  }

  /**
   * Get the SDK init timestamp and calculate time from SDK init to embed ready
   * Returns null if SDK hasn't been initialized yet
   */
  public getSdkToEmbedTime(): number {
    if (this.sdkRenderedTime === null) {
      return 0;
    }
    const currentTime = performance.now();
    const sdkToEmbedTime = currentTime - this.sdkRenderedTime;
    return Math.floor(sdkToEmbedTime);
  }

  // Returns whether the SDK render event has already been triggered.
  public getIsRenderFired(): boolean {
    return this.isRenderFired;
  }

  // Marks the SDK render event as fired or not fired.
  // Prevents redundant state updates if the value is unchanged.
  public setIsRenderFired(isFired: boolean): void {
    if (this.isRenderFired === isFired) return;
    this.isRenderFired = isFired;
  }

  /**
   * Records HTTP status code for an API request
   */
  setApiStatusCode(url: string, statusCode: number): void {
    this.statusCodeMap.set(url, statusCode);
    this.errorMessageMap.delete(url);
  }

  /**
   * Records error message for a failed API request
   */
  setApiErrorMessage(url: string, message: string): void {
    this.errorMessageMap.set(url, message);
  }

  /**
   * Retrieves HTTP status code for a given URL
   */
  getApiStatusCode(url: string): number | null {
    return this.statusCodeMap.get(url) ?? null;
  }

  /**
   * Retrieves error message for a given URL
   */
  getApiErrorMessage(url: string): string | null {
    return this.errorMessageMap.get(url) ?? null;
  }

  /**
   * Checks if URL belongs to an allowed domain
   */
  public isAllowedDomain(url: string): boolean {
    try {
      const { hostname } = new URL(url);
      return this.config.allowedDomains.includes(hostname);
    } catch {
      return false;
    }
  }

  /**
   * Checks if URL is an image resource
   */
  public isImageResource(url: string): boolean {
    return ObservabilityTracker.IMAGE_EXTENSIONS.test(url) || url.includes(ObservabilityTracker.THUMBNAIL_KEYWORD);
  }

  /**
   * Checks if URL is a video resource
   */
  public isVideoResource(url: string): boolean {
    return ObservabilityTracker.VIDEO_EXTENSIONS.test(url);
  }

  /**
   * Checks if URL matches API patterns
   */
  private isApiResource(url: string): boolean {
    const apiRegex = new RegExp(this.config.apiPatterns);
    return apiRegex.test(url);
  }

  /**
   * Generates a clean display name from a URL pathname
   */
  private createDisplayName(url: string, isApi: boolean): string {
    const { pathname } = new URL(url);

    if (isApi) {
      return pathname.replace(/[/-]/g, "_").replace(/^_+/, "");
    }

    const filename = pathname.split("/").pop() || "";
    const cleanedName = filename.replace(ObservabilityTracker.HASH_PATTERN, "");
    return cleanedName.replace(/[.-]/g, "_").replace(/^_+/, "");
  }

  /**
   * Calculates resource size in KB
   */
  private calculateResourceSize(resource: PerformanceResourceTiming): number {
    const transferSize = resource.transferSize || 0;
    const encodedBodySize = resource.encodedBodySize || 0;
    const sizeInBytes = transferSize || encodedBodySize;
    return parseFloat((sizeInBytes / 1024).toFixed(2));
  }

  /**
   * Creates a structured timing object for a resource
   */
  private createResourceTiming(resource: PerformanceResourceTiming, isApi: boolean): ResourceTimingDetail {
    const url = resource.name || "";
    const { pathname } = new URL(url);
    const startTime = performance.timeOrigin + resource.startTime;
    const endTime = performance.timeOrigin + resource.responseEnd;

    return {
      name: this.createDisplayName(url, isApi),
      url,
      path: pathname,
      status_code: (resource as any).responseStatus || this.getApiStatusCode(url) || null,
      error: this.getApiErrorMessage(url) || null,
      network_latency: resource.connectEnd > 0 ? Math.floor(resource.connectEnd - resource.fetchStart) : 0,
      processing_latency: resource.requestStart > 0 ? Math.floor(resource.responseStart - resource.requestStart) : 0,
      response_latency: resource.responseStart > 0 ? Math.floor(resource.responseEnd - resource.responseStart) : 0,
      latency: Math.floor(resource.duration),
      start_time: Math.floor(startTime),
      end_time: Math.floor(endTime),
      size: this.calculateResourceSize(resource),
      cached: resource.transferSize === 0 && resource.encodedBodySize === 0,
    };
  }

  /**
   * Filters resources based on timestamp and domain/pattern criteria
   */
  private filterResourcesSince(sinceTimestamp: number): PerformanceResourceTiming[] {
    const resources = performance.getEntriesByType("resource") as PerformanceResourceTiming[];

    return resources.filter((r) => {
      if (r.startTime <= sinceTimestamp) return false;
      return this.isAllowedDomain(r.name) || this.isApiResource(r.name);
    });
  }

  /**
   * Categorizes resources by type
   */
  private categorizeResources(resources: PerformanceResourceTiming[]): {
    api: PerformanceResourceTiming[];
    js: PerformanceResourceTiming[];
    css: PerformanceResourceTiming[];
  } {
    const api: PerformanceResourceTiming[] = [];
    const js: PerformanceResourceTiming[] = [];
    const css: PerformanceResourceTiming[] = [];

    for (const resource of resources) {
      if (this.isApiResource(resource.name)) {
        api.push(resource);
      } else if (this.config.includeJS && resource.initiatorType === "script") {
        js.push(resource);
      } else if (
        this.config.includeCSS &&
        !this.isImageResource(resource.name) &&
        (resource.initiatorType === "link" || resource.initiatorType === "css")
      ) {
        css.push(resource);
      }
    }

    return { api, js, css };
  }

  /**
   * Captures performance metrics for resources loaded since a timestamp
   */
  capturePerformanceMetricsSince(sinceTimestamp: number, configOverrides?: Partial<TrackerConfig>): EventPayload {
    // Temporarily apply config overrides if provided
    const originalConfig = { ...this.config };
    if (configOverrides) {
      Object.assign(this.config, configOverrides);
    }

    const recentResources = this.filterResourcesSince(sinceTimestamp);
    const { api, js, css } = this.categorizeResources(recentResources);

    const apiTimings = api.map((r) => this.createResourceTiming(r, true));
    const resourceTimings: ResourceTimingDetail[] = [
      ...js.map((r) => ({
        ...this.createResourceTiming(r, false),
        type: "js" as const,
      })),
      ...css.map((r) => ({
        ...this.createResourceTiming(r, false),
        type: "css" as const,
      })),
    ];

    // Restore original config
    Object.assign(this.config, originalConfig);

    return {
      api_details: apiTimings,
      resource_details: resourceTimings,
    };
  }

  /**
   * Finds performance timing for a specific URL
   */
  private findResourceTiming(url: string): PerformanceResourceTiming | null {
    const resources = performance.getEntriesByType("resource") as PerformanceResourceTiming[];
    return resources.find((r) => r.name === url) || null;
  }

  /**
   * Processes tracked resources and creates timing details
   */
  private processTrackedResources(
    urls: string[],
    type: "image" | "video"
  ): Array<ResourceTimingDetail & { type: "image" | "video" }> {
    return urls
      .map((url) => {
        const resourceTiming = this.findResourceTiming(url);
        if (!resourceTiming) return null;

        const baseDetail = this.createResourceTiming(resourceTiming, false);
        const { pathname } = new URL(url);
        const name = pathname.replace(/[/\-.]/g, "_").replace(/^_+/, "");

        return { ...baseDetail, name, type };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);
  }

  /**
   * Calculates total latency from resource details
   */
  private calculateTotalLatency(resources: ResourceTimingDetail[]): number {
    return resources.reduce((total, resource) => total + resource.latency, 0);
  }

  /**
   * Builds complete payload for EMBED_RENDERED event
   */
  public buildEmbedRenderedPayload(
    performanceMetrics: EventPayload,
    trackedImageUrls: string[],
    trackedVideoUrls: string[]
  ): {
    api_details: ResourceTimingDetail[];
    resource_details: ResourceTimingDetail[];
    api_latency: number;
    resource_latency: number;
  } {
    const imageDetails = this.processTrackedResources(trackedImageUrls, "image");
    const videoDetails = this.processTrackedResources(trackedVideoUrls, "video");
    const uniqueByName = (arr: ResourceTimingDetail[]): ResourceTimingDetail[] => {
      const map = new Map<string, ResourceTimingDetail>();
      for (const item of arr) {
        if (!map.has(item.name)) {
          map.set(item.name, item);
        }
      }
      return Array.from(map.values());
    };

    const apiDetails: ResourceTimingDetail[] = uniqueByName(
      performanceMetrics.api_details ?? ([] as ResourceTimingDetail[])
    );

    const apiLatency = this.calculateTotalLatency(apiDetails || []);
    const baseResourceLatency = this.calculateTotalLatency(performanceMetrics.resource_details || []);
    const imageLatency = this.calculateTotalLatency(imageDetails);
    const videoLatency = this.calculateTotalLatency(videoDetails);

    return {
      api_details: apiDetails,
      api_latency: apiLatency,
      resource_latency: baseResourceLatency + imageLatency + videoLatency,
      resource_details: [...(performanceMetrics.resource_details || []), ...imageDetails, ...videoDetails],
    };
  }
}

/**
 * Default singleton instance for convenience
 */
export const observabilityTracker = new ObservabilityTracker();
