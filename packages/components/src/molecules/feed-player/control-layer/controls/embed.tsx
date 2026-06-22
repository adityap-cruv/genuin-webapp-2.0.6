import type { ComponentProps } from "react";

import { useNewPlayerControls } from "../use-new-player-controls";

import { EmbedControls as EmbedControlsOld, EmbedMuteButton as EmbedMuteButtonOld } from "./embed-old";
import { EmbedControls as EmbedControlsV2, EmbedMuteButton as EmbedMuteButtonV2 } from "./embed-v2";

// EmbedPlayButton/EmbedExpandButton are consumed only internally by EmbedControls;
// re-export the V2 versions to preserve this module's public surface.
export { EmbedPlayButton, EmbedExpandButton } from "./embed-v2";

/**
 * Embed control bar — V2 when `web_configs.player_ui_v2` is on, else old.
 *
 * @remarks The old component's size union lacks the V2-only "xl" token; the cast
 * bridges that gap (no real call site passes "xl" to embed controls).
 */
export function EmbedControls(props: ComponentProps<typeof EmbedControlsV2>) {
  const newUI = useNewPlayerControls();
  if (newUI) return <EmbedControlsV2 {...props} />;
  return <EmbedControlsOld {...(props as ComponentProps<typeof EmbedControlsOld>)} />;
}

/** Mute/unmute button styled for embed control bars — V2 or old per the flag. */
export function EmbedMuteButton(props: ComponentProps<typeof EmbedMuteButtonV2>) {
  const newUI = useNewPlayerControls();
  if (newUI) return <EmbedMuteButtonV2 {...props} />;
  return <EmbedMuteButtonOld {...(props as ComponentProps<typeof EmbedMuteButtonOld>)} />;
}
