import { PlayingState as PlayingStateOld } from "./playing-state-old";
import { PlayingState as PlayingStateV2 } from "./playing-state-v2";
import type { PlayingStateProps } from "./playing-state-v2";
import { useNewPlayerControls } from "./use-new-player-controls";

export type { PlayingStateProps };

/**
 * Center play/pause/buffering indicator — V2 when `web_configs.player_ui_v2` is
 * on, else old. Both implementations share the same `PlayingStateProps`.
 */
export function PlayingState(props: PlayingStateProps) {
  const newUI = useNewPlayerControls();
  return newUI ? <PlayingStateV2 {...props} /> : <PlayingStateOld {...props} />;
}
