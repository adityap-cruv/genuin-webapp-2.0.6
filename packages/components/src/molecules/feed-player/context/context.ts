import { createContext, useContext } from "react";
import OpenPlayerJS from "openplayerjs";
import { getVideoPlayerConfigs } from "../utils";
import type {
  ButtonActionType,
  ExpandViewProps,
  PlayingStateType,
  SetVideoTimeStateType,
  VideoTimeStateType,
} from "./types";

// import { usePlayerControlStore } from "./player-control-store";
// import { getVideoPlayerConfigs } from "./utils";

// import { type WebConfigs } from "@genuin/components/lib/stores/genuin-options";
// import Analytics from "@/services/analytics";

// Helper functions for analytics
// function triggerAnalyticsForVideoStart(videoId: string, latency: number) {
//   void Analytics.track({
//     eventName: "Video Started",
//     properties: {
//       content_category: "loop",
//       content_id: videoId,
//       event_record_screen: "feed",
//       event_target_screen: "none",
//       latency,
//     },
//   });
// }

// Create a type using the return type of getVideoPlayerConfigs plus hasStarted
// type PlayerConfig = ReturnType<typeof getVideoPlayerConfigs> & {
//   hasStarted: boolean;
// };

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

  muted: boolean;
  /**
   * Function to toggle the mute state of the video player.
   * @param byUser - Whether the mute action was triggered by the user or not.
   * @returns
   */
  toggleMuted: (byUser: boolean) => void;
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
} & ExpandViewProps;

export const PlayerContext = createContext<PlayerContextType>({
  setPlayerRef: () => {},
  setVideoTimeState: () => {},
  onVideoTimeStateChange: () => () => {},
  showSeeker: false,
  setShowSeeker: () => {},
  playingState: "PAUSED",
  setPlayingState: () => {},
  feedPlayerShouldPlay: false,
  togglePlay: () => {},
  play: () => {},
  pause: () => {},
  muted: false,
  toggleMuted: () => {},
  mute: () => {},
  unmute: () => {},
  buttonAction: undefined,
  videoId: "",
  playerConfigRef: { current: getVideoPlayerConfigs() },
  handleEnded: () => {},
  showExpandView: false,
});

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
