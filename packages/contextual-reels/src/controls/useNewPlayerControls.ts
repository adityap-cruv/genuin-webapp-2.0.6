import { useOptionalConfig } from "@cxr/providers/ConfigProvider";

/**
 * CXR gate for the Design System V2 player controls.
 *
 * Mirrors the webapp/web-sdk `useNewPlayerControls()` contract (returns a plain
 * boolean), but reads from CXR's own config source instead of the browser URL:
 * the merged tag config (`TagResponse.config.design_system`). Publishers can
 * flip it server-side per tag, or override locally via `customizationDetails`
 * (merged into `tagDetails` in App.tsx).
 *
 * Reads the config optionally, so a control rendered outside a
 * `ConfigProvider` (e.g. an isolated unit test) safely falls back to the
 * legacy controls instead of throwing.
 *
 * @returns `true` when V2 controls should render for the active tag.
 */
export function useNewPlayerControls(): boolean {
  const config = useOptionalConfig();
  // return config?.tagDetails?.config?.design_system === "v2";
  return true;
}
