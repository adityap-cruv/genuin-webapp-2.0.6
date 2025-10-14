/**
 * SDKEventEmitter - Centralized SDK event emission class
 *
 * This class provides static methods to emit events to the Genuin SDK (window.genuin).
 * All SDK events are centralized here to provide better visibility and maintainability
 * of SDK event emissions throughout the application.
 *
 * @remarks
 * Each static method corresponds to a specific SDK event type and provides
 * type-safe payloads for the events being emitted.
 */

/**
 * Enum for all SDK event names
 * This provides type-safe event name definitions
 */
export enum SDKEventName {
  ERROR = "sdk:error",
  NO_CONTENT = "sdk:noContent",
  EXPAND_VIEW_LOADED = "sdk:expand-view-loaded",
  EMBED_PROVIDER_READY = "sdk:embedProviderReady",
  AUTH_REFRESH_FAILED = "auth:refresh_failed",
  CACHED_USER_UPDATE = "auth:cached_user_update",
  PLAY = "onPlay",
  PAUSE = "onPause",
  MUTE_CHANGE = "onMuteChange",
  SHARE = "onShare",
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
}

/**
 * Type mapping for SDK event payloads
 * Maps each event name to its corresponding payload type
 */
export type SDKEventPayloadMap = {
  [SDKEventName.ERROR]: SDKErrorPayload;
  [SDKEventName.NO_CONTENT]: SDKNoContentPayload;
  [SDKEventName.EXPAND_VIEW_LOADED]: boolean;
  [SDKEventName.EMBED_PROVIDER_READY]: SDKEmbedProviderReadyPayload;
  [SDKEventName.AUTH_REFRESH_FAILED]: SDKAuthRefreshFailedPayload;
  [SDKEventName.CACHED_USER_UPDATE]: SDKCachedUserUpdatePayload;
  [SDKEventName.PLAY]: SDKPlayEventPayload;
  [SDKEventName.PAUSE]: SDKPauseEventPayload;
  [SDKEventName.MUTE_CHANGE]: SDKMuteChangePayload;
  [SDKEventName.SHARE]: SDKShareEventPayload;
};

/**
 * Event listener callback type
 */
export type SDKEventListener = (props: any) => void;

/**
 * SDKEventEmitter class for centralized SDK event emissions and listeners
 */
export class SDKEventEmitter {
  /**
   * Checks if the Genuin SDK is available on the window object
   */
  private static isSDKAvailable(): boolean {
    return typeof window !== "undefined" && !!window.genuin;
  }

  /**
   * Generalized type-safe emit method for all SDK events
   * @param eventName - The SDK event name from SDKEventName enum
   * @param payload - The payload for the event (type-safe based on event name)
   *
   * @example
   * ```ts
   * SDKEventEmitter.emit(SDKEventName.ERROR, { isError: true, isNoContent: false });
   * SDKEventEmitter.emit(SDKEventName.PLAY, { videoId: '123', timestamp: Date.now() });
   * ```
   */
  static emit<T extends SDKEventName>(
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
