/**
 * SDKEventEmitter - Centralized SDK event emission class with debouncing support
 *
 * This class provides static methods to emit events to the Genuin SDK (window.genuin).
 * All SDK events are centralized here to provide better visibility and maintainability
 * of SDK event emissions throughout the application.
 *
 * @remarks
 * Each static method corresponds to a specific SDK event type and provides
 * type-safe payloads for the events being emitted. Supports debouncing to prevent
 * rapid event emissions.
 */

/**
 * Enum for all SDK event names
 * This provides type-safe event name definitions
 */
export enum SDKEventName {
  ERROR = "sdk:error",
  NO_CONTENT = "sdk:noContent",
  EMBED_PROVIDER_READY = "sdk:embedProviderReady",
  AUTH_REFRESH_FAILED = "auth:refresh_failed",
  CACHED_USER_UPDATE = "auth:cached_user_update",
  PLAY = "onPlay",
  PAUSE = "onPause",
  MUTE_CHANGE = "onMuteChange",
  SHARE = "onShare",
  VIDEO_NOT_FOUND = "onVideoNotFound",
  SWIPED_FORWARD = "onSwipedForward",
  SWIPED_BACKWARD = "onSwipedBackward",
  EXPAND_VIEW_CHANGED = "onExpandViewChanged",
  ANALYTICS = "onAnalyticsTrack",
  FEED_LOADED = "onFeedLoaded",
  ON_FOLLOW_CHANGED = "onFollowChanged",
  CAUGHT_OVERLAY = "onCaughtOverlay",
  CHECK_FOLLOWING_STATUS = "checkFollowingStatus",
  PLAY_IHEART_CONTENT = "playIHeartContent",
}

/**
 * Enum for all SDK listener event names
 */
export enum SDKListenerEventName {
  AUTHENTICATE_USER = "sdk:authenticateUser",
  UPDATE_CONTEXTUAL_PARAMS = "sdk:updateContextualParams",
  UPDATE_START_VIDEO_SLUG = "sdk:updateStartVideoSlug",
  PLAYER_PLAY = "player:play",
  PLAYER_PAUSE = "player:pause",
  PLAYER_MUTE = "player:mute",
  PLAYER_UNMUTE = "player:unmute",
  PLAYER_ON_FOLLOW_CHANGED = "player:onFollowChanged",
  PLAY_CHANGE_IHEART_CONTENT = "player:onMiniPlayerPlayChange",
  THEME_CHANGE = "sdk:themeChange",
}

/**
 * Payload types for SDK events
 */
export interface SDKErrorPayload {
  isError: boolean;
  isNoContent: boolean;
}

export interface SDKNoContentPayload {
  isError: boolean;
  isNoContent: true;
}

export interface SDKEmbedProviderReadyPayload {
  embedId?: string;
  placementId?: string;
}

export interface SDKFeedLoadedPayload {
  videoCount: number;
  hasNextPage: boolean;
  isSectioned: boolean;
  feedType?: string;
}

export interface SDKAuthRefreshFailedPayload {
  error?: any;
  timestamp?: number;
  [key: string]: any;
}

export interface SDKCachedUserUpdatePayload {
  [key: string]: any;
}

export interface SDKPlayEventPayload {
  muted: boolean;
  isInView: boolean;
  isFocused: boolean;
  volume: number;
  autoplay?: boolean;
}

export interface SDKPauseEventPayload {
  muted: boolean;
  isInView: boolean;
  isFocused: boolean;
  volume: number;
}

export interface SDKMuteChangePayload {
  muted: boolean;
  volume: number;
}

export interface SDKShareEventPayload {
  shareUrl: string;
  type?: string;
  id?: string;
  clipTitle?: string;
  clipDescription?: string;
  clipThumbnailUrl?: string;
}

export interface SDKVideoNotFoundPayload {
  slug: string;
  errorCode: string;
}

export interface SDKSwipedForwardPayload {
  fromIndex: number;
  toIndex: number;
  timestamp?: number;
}

export interface SDKSwipedBackwardPayload {
  fromIndex: number;
  toIndex: number;
  timestamp?: number;
}

export interface SDKAnalyticsPayload {
  eventName: string;
  eventPayload: Record<string, any> | undefined;
}

export interface SDKFollowChangedPayload {
  /** Whether the user isFollowed (true) or unfollowed (false) */
  isFollowed: boolean;
  /** The ID of the podcast/station being isFollowed */
  id: string | number;
  /** Event type identifier */
  type: "podcast" | "station";
  /** The name of the podcast/station being isFollowed */
  name: string;
}

export interface SDKCheckFollowingPayload {
  /** The ID of the podcast/station to check following status */
  id: string | number;
  /** Event type identifier */
  type: "podcast" | "station";
}

export type PlayIheartContentPayload =
  | ({
      play: boolean;
      navigate?: false;
      slug?: string;
    } & (
      | {
          type: "station";
          stationId: number;
        }
      | {
          type: "podcast";
          podcastId: number;
          episodeId?: number;
        }
    ))
  | {
      play: boolean;
      navigate: true;
      slug?: string;
      type?: "station" | "podcast";
      stationId?: number;
      podcastId?: number;
      episodeId?: number;
    };

export type PlayChangeIHeartContentPayload = {
  payload:
    | {
        type: "station";
        stationId: number;
        playStatus: boolean;
      }
    | {
        type: "podcast";
        podcastId: number;
        episodeId: number;
        playStatus: boolean;
      };
};

/**
 * Type mapping for SDK event payloads
 * Maps each event name to its corresponding payload type
 */
export type SDKEventPayloadMap = {
  [SDKEventName.ERROR]: SDKErrorPayload;
  [SDKEventName.NO_CONTENT]: SDKNoContentPayload;
  [SDKEventName.EXPAND_VIEW_CHANGED]: boolean;
  [SDKEventName.EMBED_PROVIDER_READY]: SDKEmbedProviderReadyPayload;
  [SDKEventName.FEED_LOADED]: SDKFeedLoadedPayload;
  [SDKEventName.CAUGHT_OVERLAY]: boolean;
  [SDKEventName.AUTH_REFRESH_FAILED]: SDKAuthRefreshFailedPayload;
  [SDKEventName.CACHED_USER_UPDATE]: SDKCachedUserUpdatePayload;
  [SDKEventName.PLAY]: SDKPlayEventPayload;
  [SDKEventName.PAUSE]: SDKPauseEventPayload;
  [SDKEventName.MUTE_CHANGE]: SDKMuteChangePayload;
  [SDKEventName.SHARE]: SDKShareEventPayload;
  [SDKEventName.VIDEO_NOT_FOUND]: SDKVideoNotFoundPayload;
  [SDKEventName.SWIPED_FORWARD]: SDKSwipedForwardPayload;
  [SDKEventName.SWIPED_BACKWARD]: SDKSwipedBackwardPayload;
  [SDKEventName.ANALYTICS]: SDKAnalyticsPayload;
  [SDKEventName.ON_FOLLOW_CHANGED]: SDKFollowChangedPayload;
  [SDKEventName.CHECK_FOLLOWING_STATUS]: SDKCheckFollowingPayload;
  [SDKEventName.PLAY_IHEART_CONTENT]: PlayIheartContentPayload;
};

/**
 * Event listener callback type
 */
export type SDKEventListener = (props: any) => void;

/**
 * Options for emitting SDK events
 */
export interface SDKEmitOptions {
  /**
   * Debounce time in milliseconds. If provided, the event will be debounced
   * and only the last emission within the time window will be sent.
   * @default undefined (no debouncing)
   */
  debounceTime?: number;
}

/**
 * SDKEventEmitter class for centralized SDK event emissions and listeners
 */
export class SDKEventEmitter {
  /**
   * Map to store debounce timers for each event
   * Key format: `${eventName}`
   */
  private static debounceTimers: Map<string, NodeJS.Timeout> = new Map();

  /**
   * Checks if the Genuin SDK is available on the window object
   */
  private static isSDKAvailable(): boolean {
    return typeof window !== "undefined" && !!window.genuin;
  }

  /**
   * Internal method to actually emit the event
   */
  private static emitEvent<T extends SDKEventName>(
    eventName: T,
    payload: SDKEventPayloadMap[T]
  ): void {
    if (!this.isSDKAvailable()) {
      return;
    }

    try {
      window.genuin!.emitInternal(eventName, payload);
    } catch (error) {
      // Silent fail
    }
  }

  /**
   * Generalized type-safe emit method for all SDK events with debouncing support
   * @param eventName - The SDK event name from SDKEventName enum
   * @param payload - The payload for the event (type-safe based on event name)
   * @param options - Optional configuration including debounceTime
   *
   * @example
   * ```ts
   * // Immediate emission (no debounce)
   * SDKEventEmitter.emit(SDKEventName.ERROR, { isError: true, isNoContent: false });
   *
   * // Debounced emission (300ms)
   * SDKEventEmitter.emit(
   *   SDKEventName.PLAY,
   *   { muted: false, isInView: true, isFocused: true, volume: 100 },
   *   { debounceTime: 300 }
   * );
   * ```
   */
  static emit<T extends SDKEventName>(
    eventName: T,
    payload: SDKEventPayloadMap[T],
    options?: SDKEmitOptions
  ): void {
    const { debounceTime } = options || {};

    // If no debounce time provided, emit immediately
    if (!debounceTime || debounceTime <= 0) {
      this.emitEvent(eventName, payload);
      return;
    }

    // Clear existing timer for this event
    const existingTimer = this.debounceTimers.get(eventName);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // Set new timer
    const timer = setTimeout(() => {
      this.emitEvent(eventName, payload);
      this.debounceTimers.delete(eventName);
    }, debounceTime);

    this.debounceTimers.set(eventName, timer);
  }

  /**
   * Cancels any pending debounced emissions for a specific event
   * @param eventName - The SDK event name to cancel
   *
   * @example
   * ```ts
   * SDKEventEmitter.cancelDebounce(SDKEventName.PLAY);
   * ```
   */
  static cancelDebounce(eventName: SDKEventName): void {
    const timer = this.debounceTimers.get(eventName);
    if (timer) {
      clearTimeout(timer);
      this.debounceTimers.delete(eventName);
    }
  }

  /**
   * Cancels all pending debounced emissions
   *
   * @example
   * ```ts
   * SDKEventEmitter.cancelAllDebounce();
   * ```
   */
  static cancelAllDebounce(): void {
    this.debounceTimers.forEach((timer) => clearTimeout(timer));
    this.debounceTimers.clear();
  }

  /**
   * Generalized method to register a listener for any SDK event
   * @param eventName - The name of the event from SDKListenerEventName enum
   * @param listener - Callback function to handle the event
   *
   * @example
   * ```ts
   * const handler = (data) => console.log(data);
   * SDKEventEmitter.on(SDKListenerEventName.AUTHENTICATE_USER, handler);
   * ```
   */
  static on(eventName: SDKListenerEventName, listener: SDKEventListener): void {
    if (!this.isSDKAvailable()) {
      return;
    }

    try {
      window.genuin!.onInternal(eventName, listener);
    } catch (error) {
      // Silent fail
    }
  }

  /**
   * Generalized method to remove a listener for any SDK event
   * @param eventName - The name of the event from SDKListenerEventName enum
   * @param listener - Callback function to remove
   *
   * @example
   * ```ts
   * const handler = (data) => console.log(data);
   * SDKEventEmitter.off(SDKListenerEventName.AUTHENTICATE_USER, handler);
   * ```
   */
  static off(
    eventName: SDKListenerEventName,
    listener: SDKEventListener
  ): void {
    if (!this.isSDKAvailable()) {
      return;
    }

    try {
      window.genuin!.offInternal(eventName, listener);
    } catch (error) {
      // Silent fail
    }
  }
}
