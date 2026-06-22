import { useEffect, useState } from 'react';

import type { Agent } from '@/types';

interface UseInitialAgentSelectionParams {
    agents: Agent[];
    setCurrentAgent: (agentId: string) => void;
    setEnteredInChatMode: (v: boolean) => void;
}

/**
 * Selects the first available agent once on mount, then marks chat mode entered.
 */
export function useInitialAgentSelection({
    agents,
    setCurrentAgent,
    setEnteredInChatMode,
}: UseInitialAgentSelectionParams): void {
    const [hasSetInitialAgent, setHasSetInitialAgent] = useState(false);

    useEffect(() => {
        if (agents.length > 0 && !hasSetInitialAgent && agents[0]) {
            setCurrentAgent(agents[0].id);
            setHasSetInitialAgent(true);
            setEnteredInChatMode(true);
        }
    }, [agents, hasSetInitialAgent, setCurrentAgent, setEnteredInChatMode]);
}
