/**
 * CXR gate for the Design System V2 player controls.
 *
 * Mirrors the webapp/web-sdk `useNewPlayerControls()` contract (returns a plain
 * boolean). The V2 controls are currently force-enabled for all CXR tags.
 *
 * TODO(dev): gate on the merged tag config (`TagResponse.config.design_system
 * === "v2"`) once `tagDetails` is threaded to the control layer (prop or
 * context). Publishers can then flip it server-side per tag, or override
 * locally via `customizationDetails` (merged into `tagDetails` in App.tsx).
 *
 * @returns `true` when V2 controls should render for the active tag.
 */
export function useNewPlayerControls(): boolean {
  return true;
}
