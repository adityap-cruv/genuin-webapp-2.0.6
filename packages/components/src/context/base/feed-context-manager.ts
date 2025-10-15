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

export type GenericData = {
  isVideoWatched: boolean;
  videoId: string;
};

export type GenericEventNames = "onVideoWatchedChanged";

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
      this.emit("onVideoWatchedChanged", { videoId, isVideoWatched: isWatched });
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
}
