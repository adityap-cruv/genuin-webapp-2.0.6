import { type ReactNode, useCallback, useEffect, useMemo, useState } from 'react';

import { useRudderEvents } from '@/adapters/analytics/useRudderAnalytics';
import type { Agent } from '@/types';

import { useLifecycleContext } from '@/stores/lifecycle/context';
import { OctoState } from '@/core/state-machine/octo-state';
import { useSessionContext } from '@/stores/session/context';

import { AgentContext } from './context';

interface AgentProviderProps {
    /** Whether this instance operates in Maya (single-agent) mode. */
    isMaya?: boolean;
    children: ReactNode;
}

/** Onboarding-flow agent IDs. Stable across renders. */
const ON_BOARDING_AGENTS: string[] = [
    'brand_asset_agent',
    'brand_ctkws_agent',
    'brand_guidelines_agent',
    'brand_persona_agent',
    'industry_type_agent',
    'consumer_brands_agent',
    'social_handle_fetcher_agent',
];

/**
 * Owns `agents` and `currentAgent` state.
 *
 * Reads session state from `SessionContext` and lifecycle transitions from
 * `LifecycleContext`. Populates `sessionContext.getInitialAgentIdRef` and
 * `sessionContext.setCurrentAgentStateRef` on every render so that
 * `SessionProvider` can call back into agent state without a circular
 * context dependency.
 */
export function AgentProvider({ isMaya, children }: AgentProviderProps) {
    const sessionContext = useSessionContext();
    const { transitionOctoState } = useLifecycleContext();
    const { track } = useRudderEvents();

    const isMayaResolved = isMaya ?? false;
    const initialAgent = isMayaResolved ? 'maya' : '695cefa2c19e333c687787f7';

    const [agents, setAgentsState] = useState<Agent[]>([]);
    const [currentAgent, setCurrentAgentState] = useState<string>(initialAgent);

    // --- Derived state ---

    /** In Maya mode, only the `maya` agent is surfaced. */
    const filteredAgents = useMemo(
        () => (isMayaResolved ? agents.filter(a => a.id === 'maya') : agents),
        [agents, isMayaResolved]
    );

    // --- Agent helpers ---

    /** Resolves the initial agent ID once the agents list loads; falls back to the slug. */
    const getInitialAgentId = useCallback(
        () => agents.find(a => a.id === initialAgent)?.id ?? initialAgent,
        [agents, initialAgent]
    );

    /** Merges new agents into the list without duplicating existing entries. */
    const setAgents = useCallback((newAgents: Agent[]) => {
        setAgentsState(prev => [...prev, ...newAgents.filter(a => !prev.some(p => p.id === a.id))]);
    }, []);

    /** Replaces the full agents list — for use by bootstrap only. */
    const setAgentsFromBootstrap = useCallback((newAgents: Agent[]) => {
        setAgentsState(newAgents);
    }, []);

    /**
     * Switches to `agentId`, resets session state, and tracks the selection.
     * No-ops when the agent is already current.
     */
    const setCurrentAgent = useCallback(
        (agentId: string) => {
            if (currentAgent === agentId) return;

            if (sessionContext.ipInfo) {
                const agent = agents.find(a => a.id === agentId);
                track('genai:agent_selected', {
                    ipInfo: sessionContext.ipInfo,
                    id: agent?.id,
                    name: agent?.name,
                    session_id: sessionContext.currentSessionId,
                });
            }

            try {
                transitionOctoState(OctoState.SWITCHING);
            } catch {
                /* already transitioning */
            }
            setCurrentAgentState(agentId);
            // Keep chat mode active when switching away from the initial agent.
            const keepChatMode = agentId !== getInitialAgentId() || isMayaResolved;
            sessionContext.clearSessionForAgentSwitch(keepChatMode);
            try {
                transitionOctoState(OctoState.READY);
            } catch {
                /* already READY */
            }
        },
        [agents, currentAgent, isMayaResolved, sessionContext, track, transitionOctoState, getInitialAgentId]
    );

    // --- Forward refs for SessionProvider ---
    // No dep array — intentional: runs every render to keep refs pointing at
    // the latest closures so SessionProvider callbacks never go stale.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        sessionContext.getInitialAgentIdRef.current = getInitialAgentId;
        sessionContext.setCurrentAgentStateRef.current = setCurrentAgentState;
    });

    // Sync currentAgent to the resolved agent ID once the agents list loads.
    // The initial value may be a slug; replace it with the real ID once available.
    useEffect(() => {
        if (agents.length > 0 && currentAgent === initialAgent) {
            const agent = agents.find(a => a.id === initialAgent);
            if (agent && agent.id !== currentAgent) {
                setCurrentAgentState(agent.id);
            }
        }
    }, [agents, currentAgent, initialAgent]);

    return (
        <AgentContext.Provider
            value={{
                initialAgent,
                isMaya: isMayaResolved,
                currentAgent,
                setCurrentAgentState,
                agents,
                filteredAgents,
                onBoardingAgents: ON_BOARDING_AGENTS,
                setAgents,
                setCurrentAgent,
                getInitialAgentId,
                setAgentsFromBootstrap,
            }}
        >
            {children}
        </AgentContext.Provider>
    );
}
