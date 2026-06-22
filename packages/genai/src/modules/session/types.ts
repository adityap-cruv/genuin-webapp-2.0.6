import type React from 'react';

import type { SessionV2 } from '@/services/apiTypes';
import type { IpInfo, Session } from '@/types';

/** Context value exposed by `SessionProvider`. */
export interface SessionContextType {
    /**
     * Ref for the `getInitialAgentId` function, populated by `AgentProvider`
     * on mount. Used by `useSessionManager` to reset to the correct agent.
     * @internal
     */
    getInitialAgentIdRef: React.RefObject<(() => string) | null>;
    /**
     * Ref for the `setCurrentAgentState` function, populated by `AgentProvider`
     * on mount. Used by `useSessionManager` to sync the agent on session change.
     * @internal
     */
    setCurrentAgentStateRef: React.RefObject<((id: string) => void) | null>;
    /** Full list of sessions for this brand. */
    sessions: Session[];
    /** Raw sessions state setter — prefer domain methods where possible. */
    setSessions: React.Dispatch<React.SetStateAction<Session[]>>;
    /** ID of the currently active session, or `null` when none is selected. */
    currentSessionId: string | null;
    /** Low-level setter for `currentSessionId`. Prefer `setCurrentSessionId` for full side-effects. */
    setCurrentSessionIdState: (id: string | null) => void;
    /** Whether the user has entered chat mode at least once. */
    enteredInChatMode: boolean;
    /** Updates the `enteredInChatMode` flag. */
    setEnteredInChatMode: (v: boolean) => void;
    /** Whether the initial session list has been fetched from the backend. */
    sessionsFetched: boolean;
    /** Updates the `sessionsFetched` flag. */
    setSessionsFetched: (v: boolean) => void;
    /** IP geolocation info for the current user, or `null` when unavailable. */
    ipInfo: IpInfo | null;
    /** Updates the `ipInfo` value. */
    setIpInfo: (info: IpInfo | null) => void;
    // From useSessionManager
    /**
     * Selects a session by ID, fetching its chat history if needed.
     * @param id - Session ID to activate, or `null` to deselect.
     * @param force - Skip the "already fetched" guard when `true`.
     * @param fetched - Override the sessions list for the lookup.
     */
    setCurrentSessionId: (id: string | null, force?: boolean, fetched?: Session[]) => Promise<void>;
    /** Removes a session and clears current selection if it matches. */
    removeSession: (id: string) => void;
    /** Persists a new name for the given session. */
    updateSessionName: (id: string, name: string) => Promise<void>;
    /** Records user feedback (like/dislike) for an agent response. */
    setFeedback: (sessionId: string, responseId: string, liked: boolean) => Promise<void>;
    /** Replaces the content of a specific agent message in a session's chat. */
    updateAgentMessageContent: (sessionId: string, messageId: string, content: string) => void;
    /** Ref holding the `connectToStream` function, set by `ChatProvider` after mount. */
    connectToStreamRef: React.RefObject<((sessionId: string) => Promise<{ isCompleted: boolean }>) | null>;
    /** Triggers a full data refresh (sessions + dependent data). */
    refreshData: () => Promise<unknown[]>;
    /**
     * Ingests the initial session list from bootstrap. Maps raw API sessions,
     * merges with existing, optionally selects `initialSessionId`, marks fetched.
     */
    initSessions: (
        rawSessions: SessionV2[],
        opts?: { initialSessionId?: string; localFallback?: Session; ipInfo?: IpInfo | null }
    ) => void;
    /** Resets to no-session state (clears current session, resets agent, clears chat mode). */
    startNewChat: () => void;
    /** Clears current session on agent switch. Pass `true` to keep chat mode active. */
    clearSessionForAgentSwitch: (keepInChatMode: boolean) => void;
}
