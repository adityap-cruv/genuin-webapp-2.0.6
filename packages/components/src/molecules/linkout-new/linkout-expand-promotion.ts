/**
 * Pure rule for "should the linkout drag promote the whole player into its
 * fullscreen expand view?" Shared by the web-sdk tile (`embed-tile.tsx`,
 * `changeActivePlayerType`) and webapp's native player (`control-layer/default.tsx`,
 * `toggleExpandView`) — same drag intent, two different promotion mechanisms.
 *
 * True once the linkout lands on `panel-view` / `full-view` (dragged past the
 * tile's biggest in-place state), or when it jumps `default-active` →
 * `expand-view` directly — the iOS-Safari case where `panel-view`'s snap
 * point sits too far above `expand-view`'s for a normal upward swipe to
 * land on, so the drag settles back on `expand-view` and the user never
 * reaches the `panel-view` trigger by itself.
 */
import type { LinkoutState } from "./linkout-state-machine";

export function shouldPromoteToPlayerExpand(
  prevLinkoutState: LinkoutState | string,
  currentLinkoutState: LinkoutState | string
): boolean {
  const userDraggedToExpand = prevLinkoutState === "default-active" && currentLinkoutState === "expand-view";
  return currentLinkoutState === "panel-view" || currentLinkoutState === "full-view" || userDraggedToExpand;
}
