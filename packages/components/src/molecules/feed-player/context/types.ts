export type PlayingStateType = "PLAYING" | "PAUSED" | "LOADING";

export type ButtonActionType = "MUTE" | "UNMUTE" | "PLAY" | "PAUSE" | undefined;

export type ExpandViewProps = {
  /**
   * Whether to show seeker for player or not.
   */
  showExpandView?: boolean;
  /**
   * Function to toggle the expand view.
   */
  toggleExpandView?: () => void;
};

export type VideoTimeStateType = {
  currentTime: number;
  duration: number;
};

export type SetVideoTimeStateType = (states: VideoTimeStateType) => void;

export type PlaybackSpeedType = {
  speed : number,
  isSpeedFromGesture : boolean
}