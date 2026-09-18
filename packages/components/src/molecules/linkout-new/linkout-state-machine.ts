/**
 * Pure transition logic for the linkout sheet's two programmatic state changes.
 *
 * The linkout sheet state is shared page-wide on the base event bus under the
 * `"linkouts"` content type. Most transitions are driven elsewhere: the timed
 * reveal (chip → default → expand-view) by the scenario's `autoAdvance` config,
 * and every drag/snap move by the SnapSheet itself. Only two transitions are
 * decided here, so the host can share one deterministic, unit-testable rule for
 * each:
 *
 *  - USER_ACTION    tap/hover advancing `default` → `default-active`
 *  - ACTIVATE_VIDEO restart the reveal for a new video; carry for the same one
 *
 * Pure (no DOM, no React, no timers) so both rules are testable in isolation.
 */

/** The full ordered set of linkout sheet states, weakest → strongest. */
export type LinkoutState =
  | "pl-xs"
  | "pl-sml"
  | "default"
  | "default-active"
  | "expand-view"
  | "panel-view"
  | "full-view";

/** Events the host feeds the machine. Both view-agnostic. */
export type LinkoutEvent = { type: "USER_ACTION" } | { type: "ACTIVATE_VIDEO"; videoId: string };

export interface LinkoutMachine {
  state: LinkoutState;
  /** Last video id we reset for — so re-activating the SAME video (e.g. returning
   *  from expand) never restarts the reveal. */
  lastVideoId: string | null;
}

/**
 * Pure transition. `enabledStates` is the current scenario's allowed set, so the
 * machine never advances into a state the active layout doesn't support.
 */
export function linkoutTransition(
  machine: LinkoutMachine,
  event: LinkoutEvent,
  enabledStates: LinkoutState[]
): LinkoutMachine {
  const { state } = machine;
  switch (event.type) {
    case "USER_ACTION":
      // default → default-active, forward-only, only if the scenario enables it.
      if (state === "default" && enabledStates.includes("default-active")) {
        return { ...machine, state: "default-active" };
      }
      return machine;

    case "ACTIVATE_VIDEO":
      // Reset the reveal to the chip ONLY for a genuinely new video. The same id
      // re-activating (return from expand, ad finishing, re-render) is preserved.
      if (machine.lastVideoId === event.videoId) return machine;
      return { state: "pl-sml", lastVideoId: event.videoId };

    default:
      return machine;
  }
}
