import { createContext, useContext } from 'react';

import type { SessionContextType } from '@/modules/session/types';

/** React context for the session domain. */
export const SessionContext = createContext<SessionContextType | undefined>(undefined);

/**
 * Returns the nearest `SessionProvider` context value.
 * Throws if called outside of a `SessionProvider`.
 */
export function useSessionContext(): SessionContextType {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSessionContext must be used within SessionProvider');
  return ctx;
}
