import type { Agent } from '@/types';

/** Context value exposed by `AgentProvider`. */
export interface AgentContextType {
    /** Slug or ID of the initial/default agent for this instance. */
    initialAgent: string;
    /** Whether this instance operates in Maya (single-agent) mode. */
    isMaya: boolean;
    /** ID of the currently active agent. */
    currentAgent: string;
    /** Low-level setter for `currentAgent`. Prefer `setCurrentAgent` for full side-effects. */
    setCurrentAgentState: (id: string) => void;
    /** Full list of agents loaded from the backend. */
    agents: Agent[];
    /**
     * Filtered agents list: in Maya mode only the `maya` agent is included;
     * otherwise identical to `agents`.
     */
    filteredAgents: Agent[];
    /** Agent IDs that belong to the onboarding flow. */
    onBoardingAgents: string[];
    /** Adds new agents to the agents list without duplicating existing entries. */
    setAgents: (agents: Agent[]) => void;
    /**
     * Switches to the given agent, resetting session state and tracking the
     * selection event.
     */
    setCurrentAgent: (agentId: string) => void;
    /**
     * Returns the resolved initial agent ID once agents are loaded, falling
     * back to the `initialAgent` slug.
     */
    getInitialAgentId: () => string;
    /** Replaces the full agents list — for use by bootstrap only. */
    setAgentsFromBootstrap: (agents: Agent[]) => void;
}
