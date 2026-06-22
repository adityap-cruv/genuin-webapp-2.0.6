import type { ComponentProps } from "react";

import { useNewPlayerControls } from "../use-new-player-controls";

import { Controls as ControlsOld } from "./controls-old";
import { Controls as ControlsV2 } from "./controls-v2";

type ControlsProps = ComponentProps<typeof ControlsV2>;

/**
 * Renders the new (Design System V2) player controls when the brand opts in via
 * `web_configs.player_ui_v2`, otherwise the old controls.
 *
 * @remarks The old component has no `size` prop (it ignores it) and its size
 * union lacks the V2-only "xl" token; the cast bridges that gap. No real call
 * site passes a size the old component cannot render.
 */
export function Controls(props: ControlsProps) {
  const newUI = useNewPlayerControls();
  if (newUI) return <ControlsV2 {...props} />;
  return <ControlsOld {...(props as ComponentProps<typeof ControlsOld>)} />;
}
