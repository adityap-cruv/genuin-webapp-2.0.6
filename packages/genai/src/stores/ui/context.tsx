import { createContext, useContext } from 'react';

import type { UIContextType } from './types';

/** React context for the UI domain. */
export const UIContext = createContext<UIContextType | undefined>(undefined);

/**
 * Returns the nearest `UIProvider` context value.
 * Throws if called outside of a `UIProvider`.
 */
export function useUIContext(): UIContextType {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error('useUIContext must be used within UIProvider');
  return ctx;
}
