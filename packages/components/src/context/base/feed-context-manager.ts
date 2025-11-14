import { EventManager } from "@genuin/components/lib/utils/event-manager";

export type VideoDetails = {
  currentTime: number;
  duration: number;
  isWatched: boolean;
  /**
   * To check, How many instances are there.
   * If it's zero it will unregistered.
   */
  instances: number;
  /**
   * Whether the video should be previewed (e.g., in a hover).
   */
  shouldPreview: boolean;
};

export type VideoEventData = {
  videoId: string;
  videoDetails: VideoDetails;
};

export type VideoEventNames = "onPlay" | "onPause";

export type VideoEventListener = (eventData: VideoEventData) => void;

export type PlayPauseTracker = {
  isPlaying: boolean;
  isFocused: boolean;
  isInView: boolean;
};

export type GenericData =
  | {
      isVideoWatched: boolean;
      videoId: string;
      /**
       * The index of the video being previewed (hover state).
       * Used to identify which video should show preview playback.
       */
      previewIndex?: number;
    }
  | ActiveIHeartContentType;

/**
 * Generic event names for video-related events.
 * - onVideoWatchedChanged: Fired when video watch status changes
 * - onPreviewIndexChanged: Fired when hover preview state changes (index set/cleared)
 * - playLastKnownIndex: Fired to resume playback after preview ends (debounced)
 * - onActiveIHeartContentChanged: Fired when active iHeart content changes
 */
export type GenericEventNames =
  | "onVideoWatchedChanged"
  | "onPreviewIndexChanged"
  | "playLastKnownIndex"
  | "onActiveIHeartContentChanged";

export type ActiveIHeartContentType = {
  podcastId: number;
  stationId: number;
  episodeId: number;
  type: "station" | "podcast" | null;
} | null;

export type GenericEventListener = (eventData: GenericData) => void;

type EventNames = VideoEventNames | GenericEventNames;

/**
 * This class is responsible for tracking which video is in which state.
 */
export class FeedContextManager {
  private videos: Record<string, VideoDetails> = {};
  private static instance: FeedContextManager | undefined;
  private playPauseTracker: PlayPauseTracker = {
    isFocused: true,
    isInView: true,
    isPlaying: false,
  };
  private eventManager: EventManager<{}, EventNames>;
  /** Current preview index (-1 means no preview active) */
  private previewIndex: number = -1;
  /** Debounce timer to delay "playLastKnownIndex" event after preview ends */
  private previewDebounceTimer: NodeJS.Timeout | null = null;
  /** Last active video index before preview started (for resuming playback) */
  private lastActiveIndex: number = -1;
  private activeIHeartContent: ActiveIHeartContentType = {
    podcastId: -1,
    episodeId: -1,
    stationId: -1,
    type: null,
  };

  private constructor() {
    // Initialize EventManager with empty context since we don't need context functionality
    this.eventManager = new EventManager({});
  }

  public static getInstance() {
    if (this.instance) {
      return this.instance;
    }

    this.instance = new FeedContextManager();
    return this.instance;
  }

  /**
   * Updates the play/pause tracking state and manages video playback events.
   *
   * This method handles three key state changes:
   * 1. Focus state - When the browser tab/window loses focus
   * 2. View state - When the video scrolls out of viewport
   * 3. Playing state - When the video play/pause state changes
   *
   * Auto-pause behavior: Videos are automatically paused when they lose focus or go out of view.
   * This ensures only visible, focused videos continue playing.
   *
   * @param playPauseTracker - Partial tracker state with properties to update
   */
  public setPlayPauseTracker(playPauseTracker: Partial<PlayPauseTracker>) {
    // Helper function to check if a tracker property has changed
    const hasPropertyChanged = <K extends keyof PlayPauseTracker>(
      key: K,
      newValue: PlayPauseTracker[K] | undefined
    ): boolean => {
      return (
        typeof newValue === "boolean" && this.playPauseTracker[key] !== newValue
      );
    };

    // Helper function to handle auto-pause when a condition becomes false (lost focus or out of view)
    const handleAutoPause = <K extends keyof PlayPauseTracker>(
      key: K,
      newValue: PlayPauseTracker[K]
    ): boolean => {
      this.playPauseTracker[key] = newValue;

      // If the condition is now false (lost focus/view) and video is currently playing
      if (!newValue && this.playPauseTracker.isPlaying) {
        // Emit pause event and update playing state
        this.eventManager.emit("onPause");
        this.playPauseTracker.isPlaying = false;
        return true; // Indicates early return needed
      }

      return false;
    };

    // Handle focus state change: pause video when browser tab/window loses focus
    if (hasPropertyChanged("isFocused", playPauseTracker.isFocused)) {
      if (handleAutoPause("isFocused", playPauseTracker.isFocused!)) {
        return;
      }
    }

    // Handle viewport state change: pause video when it scrolls out of view
    if (hasPropertyChanged("isInView", playPauseTracker.isInView)) {
      if (handleAutoPause("isInView", playPauseTracker.isInView!)) {
        return;
      }
    }

    // Handle explicit play/pause state change: emit appropriate events
    if (hasPropertyChanged("isPlaying", playPauseTracker.isPlaying)) {
      if (playPauseTracker.isPlaying) {
        // Video started playing
        this.eventManager.emit("onPlay");
      } else {
        // Video was paused
        this.eventManager.emit("onPause");
      }
    }

    // Merge the updated state into the tracker
    this.playPauseTracker = { ...this.playPauseTracker, ...playPauseTracker };
  }

  /**
   * Register a new video with initial state
   */
  public registerVideo({ videoId }: { videoId: string }) {
    if (!this.videos[videoId]) {
      this.videos[videoId] = {
        currentTime: 0,
        duration: 0,
        isWatched: false,
        instances: 1,
        shouldPreview: true,
      };
    } else {
      const videoDetails = this.videos[videoId];
      this.videos[videoId] = {
        ...videoDetails,
        instances: videoDetails.instances + 1,
      };
    }
  }

  /**
   * A function to update time info of the video.
   */
  public setTimeInfo({
    currentTime,
    duration,
    videoId,
  }: {
    currentTime: number;
    duration: number;
    videoId: string;
  }) {
    if (!this.videos[videoId]) return;
    const videoDetails = this.videos[videoId];
    this.videos[videoId] = {
      ...videoDetails,
      currentTime,
      duration,
    };
  }

  /**
   * A function to get the time info of the video.
   * @returns
   */
  public getTimeInfo(videoId: string) {
    const videoDetails = this.videos[videoId];
    return {
      currentTime: videoDetails?.currentTime ?? 0,
      duration: videoDetails?.duration ?? 0,
    };
  }

  /**
   * Mark a video as watched or unwatched
   */
  public setVideoWatched({
    videoId,
    isWatched,
  }: {
    videoId: string;
    isWatched: boolean;
  }) {
    const videoDetails = this.videos[videoId];
    if (videoDetails) {
      this.videos[videoId] = {
        ...videoDetails,
        isWatched,
        currentTime: isWatched ? 0 : videoDetails.currentTime,
      };
      this.emit("onVideoWatchedChanged", {
        videoId,
        isVideoWatched: isWatched,
      });
    }
  }

  /**
   * Get the complete state of a video
   */
  public getVideoState(videoId: string): VideoDetails | null {
    return this.videos[videoId] ?? null;
  }

  /**
   * Check if a video is registered
   */
  public isVideoRegistered(videoId: string): boolean {
    return !!this.videos[videoId];
  }

  /**
   * Remove a video from tracking
   */
  public unregisterVideo(videoId: string) {
    const videoDetails = this.videos[videoId];
    if (!videoDetails) return;

    // Decrement the instances count
    const updatedInstances = videoDetails.instances - 1;

    // Only delete the video if no instances remain
    if (updatedInstances <= 0) {
      delete this.videos[videoId];
    } else {
      this.videos[videoId] = {
        ...videoDetails,
        instances: updatedInstances,
      };
    }
  }

  /**
   * Get all registered video IDs
   */
  public getRegisteredVideoIds(): string[] {
    return Object.keys(this.videos);
  }

  /**
   * Subscribe to onPlay event (triggered when at least one video starts playing)
   * @param listener - The listener function to be called when event is triggered
   */
  public onPlay(listener: VideoEventListener): void {
    this.eventManager.on("onPlay", (eventData) => listener(eventData));
  }

  /**
   * Subscribe to onPause event (triggered when no videos are playing)
   * @param listener - The listener function to be called when event is triggered
   */
  public onPause(listener: VideoEventListener): void {
    this.eventManager.on("onPause", (eventData) => listener(eventData));
  }

  /**
   * Registers a listener for a specific event type.
   *
   * This method provides a generic way to attach event listeners that respond generic events
   *
   * @param eventName - The name of the event to listen for.
   *   It can be one of the values defined in `EventNames`.
   * @param listener - The callback function to execute when the event is triggered.
   */
  public on(
    eventName: GenericEventNames,
    listener: GenericEventListener
  ): void {
    this.eventManager.on(eventName, listener);
  }

  /**
   * Unsubscribe from onPlay event
   * @param listener - The listener function to remove
   */
  public offPlay(listener: VideoEventListener): void {
    this.eventManager.off("onPlay", listener);
  }

  /**
   * Unsubscribe from onPause event
   * @param listener - The listener function to remove
   */
  public offPause(listener: VideoEventListener): void {
    this.eventManager.off("onPause", listener);
  }

  /**
   * Triggers a specific event and notifies all registered listeners.
   *
   * This method emits an event of the given type, passing along any relevant
   * event data to the listeners that have been registered via `on()`.
   *
   * @param eventName - The name of the event to emit.
   *   It must be one of the values defined in `EventNames`.
   * @param eventData - The data payload associated with the event.
   *   This provides context to the listeners when the event is triggered.
   */
  public emit(eventName: GenericEventNames, eventData: GenericData): void {
    this.eventManager.emit(eventName, eventData);
  }

  /**
   * Removes a previously registered event listener.
   *
   * This method unregisters a listener from the specified event type,
   * ensuring it no longer responds when that event is triggered.
   *
   * @param eventName - The name of the event to stop listening for.
   *   It must be one of the values defined in `EventNames`.
   * @param listener - The listener function to remove.
   *   It must be the same reference used when calling `on()`.
   */
  public off(
    eventName: GenericEventNames,
    listener: GenericEventListener
  ): void {
    this.eventManager.off(eventName, listener);
  }

  /**
   * Prints all details of the FeedContextManager including video states and play/pause tracker.
   *
   * Useful for debugging and monitoring the current state of the feed context.
   */
  public printAllDetails(): void {
    console.log("[FeedContextManager]", {
      playPauseTracker: this.playPauseTracker,
      videos: this.videos,
    });
  }

  /**
   * Sets the preview index for hover-based video previews.
   *
   * When a user hovers over a video (index set), this triggers preview playback.
   * When hover ends (index null/-1), it stops preview and debounces for 300ms
   * before emitting "playLastKnownIndex" to resume the last active video.
   *
   * The debounce prevents interruption when quickly moving between videos.
   *
   * @param index - Video index to preview (null/-1 to stop preview)
   * @param videoId - ID of the video
   *
   * Events emitted:
   * - onPreviewIndexChanged: When preview starts/stops (if shouldPreview is true)
   * - playLastKnownIndex: After 300ms debounce when preview ends (to resume playback)
   */
  public setPreviewIndex({
    index,
    videoId,
    bypassTracking,
  }: {
    index: number | null;
    videoId: string;
    bypassTracking?: boolean;
  }) {
    // Clear existing debounce timer to reset the 300ms window
    if (this.previewDebounceTimer) {
      clearTimeout(this.previewDebounceTimer);
      this.previewDebounceTimer = null;
    }

    const currentVideo = this.videos[videoId];

    // Handle index becoming -1 (preview stopped - user moved mouse away)
    if (index === null || index === -1) {
      this.previewIndex = -1;

      // Capture the lastActiveIndex NOW to prevent it from changing during the debounce period
      const capturedLastActiveIndex = this.lastActiveIndex;

      // Start 300ms debounce timer before resuming last known video
      // This prevents interruption when quickly hovering between videos
      this.previewDebounceTimer = setTimeout(() => {
        // If still no preview after 300ms and we have a last active index, resume playback
        if (
          this.previewIndex === -1 &&
          capturedLastActiveIndex !== -1 &&
          !bypassTracking
        ) {
          this.emit("playLastKnownIndex", {
            videoId: videoId,
            isVideoWatched: currentVideo?.isWatched ?? false,
            previewIndex: capturedLastActiveIndex,
          });
        }
      }, 300);

      // Emit preview stopped event if video allows previews
      if (currentVideo?.shouldPreview) {
        this.emit("onPreviewIndexChanged", {
          videoId: videoId,
          isVideoWatched: currentVideo.isWatched,
          previewIndex: -1,
        });
      }
      return;
    }

    // Handle valid index (preview started/changed - user hovered over video)
    if (currentVideo?.shouldPreview) {
      this.previewIndex = index;

      // Emit preview started event with the new preview index
      this.emit("onPreviewIndexChanged", {
        videoId: videoId,
        isVideoWatched: currentVideo.isWatched,
        previewIndex: this.previewIndex,
      });
    }
  }

  /**
   * Controls whether a video should allow preview playback.
   *
   * When a user clicks play/pause controls, this disables preview mode (shouldPreview: false)
   * to give the user full control. It also tracks the last active index for resuming playback.
   *
   * If the video is currently being previewed when shouldPreview is set to false,
   * it automatically stops the preview.
   *
   * @param shouldPreview - Whether preview should be enabled for this video
   * @param videoId - ID of the video
   * @param index - Current video index (tracked as lastActiveIndex)
   */
  public setShouldPreview({
    shouldPreview,
    videoId,
    index,
    bypassEventTracking,
  }: {
    shouldPreview: boolean;
    videoId: string;
    index: number;
    bypassEventTracking?: boolean;
  }) {
    const currentVideo = this.videos[videoId];
    // Track this as the last active index for potential playback resumption
    this.lastActiveIndex = index;

    // Only update if the shouldPreview state is actually changing
    if (currentVideo && currentVideo.shouldPreview !== shouldPreview) {
      // If disabling preview and this video is currently being previewed, stop the preview
      if (this.previewIndex === index) {
        this.setPreviewIndex({
          index: null,
          videoId,
          bypassTracking: bypassEventTracking,
        });
      }
      // Update the video's preview permission
      this.videos[videoId] = {
        ...currentVideo,
        shouldPreview,
      };
    }
  }

  /**
   * Checks whether a video is allowed to show preview playback.
   *
   * Preview playback is the hover-triggered looping behavior that plays a video
   * when the user hovers over it. This method retrieves the current preview
   * permission state for the specified video.
   *
   * @param videoId - The unique identifier of the video to check
   * @returns The current shouldPreview state (true if preview is allowed, false if disabled),
   *          or undefined if the video hasn't been registered yet
   *
   * @example
   * ```ts
   * const canPreview = feedContextManager.checkIfVideoShouldPreview({ videoId: 'abc123' });
   * if (canPreview) {
   *   // Enable hover preview functionality
   * }
   * ```
   */
  public checkIfVideoShouldPreview({
    videoId,
  }: {
    videoId: string;
  }): boolean | undefined {
    return this.videos[videoId]?.shouldPreview;
  }

  /**
   * Checks if the video preview is currently active for the given index.
   *
   * This method determines whether a specific video (identified by its index)
   * is currently in preview/hover playback mode. Used to conditionally apply
   * preview-specific UI states or behaviors.
   *
   * @param index - The index of the video to check
   * @returns true if the video at the given index is currently being previewed, false otherwise
   *
   * @example
   * ```ts
   * const isPreviewActive = feedContextManager.checkIfVideoPreviewActive({ index: 2 });
   * if (isPreviewActive) {
   *   // Apply preview-specific styles or behavior
   * }
   * ```
   */
  public checkIfVideoPreviewActive({ index }: { index: number }) {
    return index === this.previewIndex;
  }

  /**
   * Updates the last active index in the feed.
   *
   * This method tracks which video was last actively playing (not previewing)
   * so it can be resumed after hover previews end. The last active index is used
   * by the setPreviewIndex method to restore playback after the 300ms debounce.
   *
   * @param index - The index of the currently active (playing) video in the feed
   */
  public updateLastActiveIndex({ index }: { index: number }) {
    this.lastActiveIndex = index;
  }

  /**
   * Sets the current active iHeartRadio content (station or podcast).
   *
   * This method tracks which iHeartRadio content is currently being played,
   * including podcasts, episodes, and radio stations.
   *
   * @param status - The iHeartRadio content status containing:
   *   - podcastId: ID of the podcast being played (-1 if not applicable)
   *   - episodeId: ID of the podcast episode being played (-1 if not applicable)
   *   - stationId: ID of the radio station being played (-1 if not applicable)
   *   - type: The type of content - "station" for radio, "podcast" for podcasts, or null if no iHeartRadio content is active
   */
  public setActiveIHeartContent(status: ActiveIHeartContentType) {
    this.activeIHeartContent = status;

    // Emit change event
    this.emit("onActiveIHeartContentChanged", this.activeIHeartContent);
  }

  /**
   * Retrieves the current iHeartRadio content status.
   *
   * Returns information about the currently active iHeartRadio content,
   * including whether it's a podcast episode or radio station, and their respective IDs.
   *
   * @returns The current iHeartRadio content status object containing podcastId, episodeId, stationId, and content type
   */
  public getCurrentActiveIHeartContent() {
    return this.activeIHeartContent;
  }

  /**
   * Destroys the singleton instance and cleans up all resources.
   *
   * This method:
   * - Clears all video tracking data
   * - Removes all event listeners
   * - Resets the play/pause tracker to default state
   * - Clears any pending debounce timers
   * - Resets the singleton instance
   *
   * After calling this method, the next call to getInstance() will create a new instance.
   */
  public static destroy(): void {
    if (this.instance) {
      // Clear any pending debounce timer
      if (this.instance.previewDebounceTimer) {
        clearTimeout(this.instance.previewDebounceTimer);
        this.instance.previewDebounceTimer = null;
      }
      // Reset the singleton instance
      this.instance = undefined;
    }
  }
}
