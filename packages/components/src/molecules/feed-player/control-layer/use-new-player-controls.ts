import { useEmbedConfigs } from "@genuin/components/hooks/embed/use-embed-config";

/**
 * Returns `true` when the new (Design System V2) player controls are enabled
 * via the `design_system=v2` URL param. Defaults to `false` (old UI).
 */
export function useNewPlayerControls(): boolean {
  const { isDesignSystemV2 } = useEmbedConfigs();
  return isDesignSystemV2;
}
