import { createContext, useContext } from 'react';

import type { AgentContextType } from '@/modules/agent/types';

/** React context for the agent domain. */
export const AgentContext = createContext<AgentContextType | undefined>(undefined);

/**
 * Returns the nearest `AgentProvider` context value.
 * Throws if called outside of an `AgentProvider`.
 */
export function useAgentContext(): AgentContextType {
    const ctx = useContext(AgentContext);
    if (!ctx) throw new Error('useAgentContext must be used within AgentProvider');
    return ctx;
}
