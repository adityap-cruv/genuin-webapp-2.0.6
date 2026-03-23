"use client";
import { createContext, useContext } from "react";
import OpenPlayerJS from "openplayerjs";
import { getVideoPlayerConfigs } from "../utils";
import type {
  ButtonActionType,
  ExpandViewProps,
  PlaybackSpeedType,
  PlayingStateType,
  SetVideoTimeStateType,
  VideoTimeStateType,
} from "./types";

export type AdInfoType = {
  adId: string | null;
  url: string | null;
  title: string | null;
  totalAds: number;
  currentAdIndex: number;
};

export type PlayerContextType = {
  /**
   * This is used to set openplayerjs instance.
   */
  setPlayerRef: (player: OpenPlayerJS | null) => void;

  setVideoTimeState: SetVideoTimeStateType;
  onVideoTimeStateChange: (
    callback: (state: VideoTimeStateType) => void
  ) => () => void;

  /**
   * Whether to show seeker for player or not.
   */
  showSeeker: boolean;
  setShowSeeker: React.Dispatch<React.SetStateAction<boolean>>;

  /**
   * Whether the user is actively scrubbing/seeking through the video.
   */
  showScrubber: boolean;
  setShowScrubber: React.Dispatch<React.SetStateAction<boolean>>;

  /**
   * This is the state of the video player.
   * It can be "PLAYING", "PAUSED", or "LOADING".
   */
  playingState: PlayingStateType;
  setPlayingState: React.Dispatch<React.SetStateAction<PlayingStateType>>;

  /**
   * This is a local state to manage to manage if video should player or not.
   * in case of custom configuration we have to manage this state.
   */
  feedPlayerShouldPlay: boolean;
  /**
   * Function to toggle the play state of the video player.
   * @param byUser - Whether the play action was triggered by the user or not.
   * @returns
   */
  togglePlay: (byUser: boolean) => void;
  /**
   * Function to play the video.
   * @param byUser - Whether the play action was triggered by the user or not.
   * @param seekTime - The time in seconds to seek the video to before playing.
   * @returns
   */
  play: (byUser: boolean, seekTime?: number) => void;
  pause: (byUser: boolean) => void;
  /**
   * Function to seek the video to a specific time.
   * @param seekTime - The target time (in seconds) to which the video should be moved.
   * @returns void
   */
  seek: (seekTime: number) => void;
  muted: boolean;
  /**
   * Function to toggle the mute state of the video player.
   * @param byUser - Whether the mute action was triggered by the user or not.
   * @param bypassMuteChange - Optional parameter to bypass the actual mute state change.
   *                          When true, prevents toggling the muted state while still
   *                          executing other mute-related logic (e.g., triggering play during preview mode).
   *                          Used in video-hover feature to handle custom mute UI states without
   *                          affecting the underlying player mute state.
   * @returns
   */
  toggleMuted: (byUser: boolean, bypassMuteChange?: boolean) => void;
  mute: (byUser: boolean) => void;
  unmute: (byUser: boolean) => void;

  /**
   * This is used when user clicks the player and we need to show the playing state button.
   */
  buttonAction?: ButtonActionType;

  videoId: string;
  playerConfigRef: React.MutableRefObject<
    ReturnType<typeof getVideoPlayerConfigs>
  >;

  /**
   * Function to be called when the player completes it's iteration.
   */
  handleEnded: () => void;

  isAdPlaying: boolean;
  adInfo?: AdInfoType;
  /**
   * Updates the ad information.
   * @param isAdPlaying - Whether an ad is currently playing.
   * @param adInfo - Information about the ad, including id, url, and title.
   * @returns
   */
  updateAdInfo: (isAdPlaying: boolean, adInfo: AdInfoType) => void;
  /**
   * Total number of videos in feed.
   */
  totalVideos?: number;
  /**
   * Index position of video in feed.
   */
  positionIndex?: number;
  /**
   * To update is loading state of the video
   */
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  /**
   * A function to move to the next video.
   */
  moveToNextVideo: () => void;
} & ExpandViewProps;

export const PlayerContext = createContext<PlayerContextType | null>(null);

/**
 * Custom hook to access the feed player context.
 * @returns The feed player context.
 */
export const usePlayerContext = (): PlayerContextType => {
  const context = useContext(PlayerContext);
  if (context === null) {
    throw new Error("usePlayerContext must be used within a VideoProvider");
  }
  return context;
};
