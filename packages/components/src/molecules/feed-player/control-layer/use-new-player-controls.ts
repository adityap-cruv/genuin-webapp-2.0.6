import { useEmbedConfigs } from "@genuin/components/hooks/embed/use-embed-config";

/**
 * Returns `true` when the new (Design System V2) player controls are enabled.
 * Native webapp defaults to v2; SDK embeds default to v1 and opt in via the
 * `design_system=v2` URL param.
 */
export function useNewPlayerControls(): boolean {
  const { isDesignSystemV2 } = useEmbedConfigs();
  return isDesignSystemV2;
}
