/**
 * ShadowDomContext — distributes the active ShadowDomConfig (if any) to the
 * React component tree for a widget instance.
 *
 * Import from "@cxr/shadow-dom-context".
 */
import { createContext, useContext, type ReactNode } from 'react';

import type { ShadowDomConfig } from '@cxr/shadow-dom-config';

export type { ShadowDomConfig };

const ShadowDomContext = createContext<ShadowDomConfig | null>(null);

interface ShadowDomProviderProps {
  children: ReactNode;
  /** Pass null when the widget is mounted in direct (non-shadow) mode. */
  config: ShadowDomConfig | null;
}

/**
 * Wrap the React tree root with this provider so any component can call
 * useShadowDom() to retrieve the active shadow configuration.
 *
 * @example
 * ```tsx
 * <ShadowDomProvider config={shadowConfig}>
 *   <App ... />
 * </ShadowDomProvider>
 * ```
 */
export function ShadowDomProvider({ children, config }: ShadowDomProviderProps): ReactNode {
  return <ShadowDomContext.Provider value={config}>{children}</ShadowDomContext.Provider>;
}

/**
 * Returns the ShadowDomConfig for the current widget instance, or null when
 * the widget is running in direct (non-shadow-DOM) mode.
 *
 * Safe to call from any component — returns null rather than throwing when
 * no provider is present (widgets may run without shadow DOM).
 */
export function useShadowDom(): ShadowDomConfig | null {
  return useContext(ShadowDomContext);
}
