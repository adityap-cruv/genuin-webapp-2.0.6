"use client";

import { Text } from "@genuin/ui/components/typography";
import * as React from "react";

import type {
  IntelligenceRegistryProviderProps,
  IntelligenceResponseComponent,
  IntelligenceResponseRegistry,
  IntelligenceResponseRendererProps,
} from "./intelligence-chat.types";

const RegistryContext = React.createContext<IntelligenceResponseRegistry | null>(null);

/** Exposes a block registry to every `IntelligenceResponseRenderer` beneath it. */
export function IntelligenceRegistryProvider({ registry, children }: IntelligenceRegistryProviderProps) {
  return <RegistryContext.Provider value={registry}>{children}</RegistryContext.Provider>;
}

/** Reads the nearest registry. Returns an empty registry outside a provider. */
export function useIntelligenceRegistry(): IntelligenceResponseRegistry {
  return React.useContext(RegistryContext) ?? EMPTY_REGISTRY;
}

const EMPTY_REGISTRY: IntelligenceResponseRegistry = Object.freeze({});

/**
 * Type helper for authoring registry entries: pins the component's props to the
 * block's `props` shape so a registry stays type-checked at the call site.
 */
export function defineIntelligenceBlock<TProps>(
  component: IntelligenceResponseComponent<TProps>
): IntelligenceResponseComponent<TProps> {
  return component;
}

/** Merge registries left-to-right; later entries win. */
export function mergeIntelligenceRegistries(
  ...registries: readonly IntelligenceResponseRegistry[]
): IntelligenceResponseRegistry {
  return Object.assign({}, ...registries);
}

function UnsupportedBlock({ type }: { type: string }) {
  return (
    <div
      role="note"
      data-slot="intelligence-unsupported-block"
      className="gencl:rounded-md gencl:border gencl:border-dashed gencl:border-secondary-200 gencl:px-2 gencl:py-1.5">
      <Text as="p" size="body-2" className="gencl:text-secondary-600">
        This response type (<code>{type}</code>) isn&apos;t supported here yet.
      </Text>
    </div>
  );
}

/**
 * Resolves `block.type` against the registry and renders the matching
 * component with `block.props` spread in. Unknown types render `fallback`
 * (default: a small notice) instead of throwing, so a newer backend never
 * breaks an older client.
 */
export function IntelligenceResponseRenderer({ block, message, fallback }: IntelligenceResponseRendererProps) {
  const registry = useIntelligenceRegistry();
  const Component = registry[block.type];

  if (!Component) {
    return <>{fallback ?? <UnsupportedBlock type={block.type} />}</>;
  }

  const props = (block.props ?? {}) as Record<string, unknown>;

  return (
    <div data-slot="intelligence-response-block" data-block-type={block.type}>
      <Component {...props} blockContext={{ block, message }} />
    </div>
  );
}
