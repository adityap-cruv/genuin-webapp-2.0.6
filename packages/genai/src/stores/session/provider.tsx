import { type ReactNode, useCallback, useRef, useState } from 'react';
import { toast } from 'sonner';

import { useOctoAnalytics } from '@/adapters/analytics/hooks';
import { getChatHistoryV2, getBrandSessions, updateSessionTitle } from '@/services/api';
import type { SessionV2 } from '@/services/apiTypes';
import { convertChatHistoryV2ToEvents } from '@/services/session/conversationUtils';
import type { IpInfo, Session } from '@/types';


import { SessionContext } from './context';

interface SessionProviderProps {
    /** Brand ID for session lookups. */
    brandId: number;
    /** Optional pre-selected session ID passed in from the parent shell. */
    currentSessionId?: string;
    /** Whether this instance operates in Maya (single-agent) mode. */
    isMaya?: boolean;
    /** Child elements. */
    children: ReactNode;
}

/**
 * Owns session list state, current session selection, `enteredInChatMode`,
 * `sessionsFetched`, and `ipInfo`. Exposes CRUD helpers and a `refreshData` utility.
 *
 * `getInitialAgentIdRef` and `setCurrentAgentStateRef` are forward refs that
 * `AgentProvider` populates after it mounts, allowing session callbacks to
 * call back into agent state without a circular context dependency.
 */
export function SessionProvider({
    brandId,
    currentSessionId: currentSessionIdProp,
    isMaya,
    children,
}: SessionProviderProps) {
    // --- State ---
    const [sessions, setSessions] = useState<Session[]>([]);
    const [currentSessionId, setCurrentSessionIdState] = useState<string | null>(currentSessionIdProp ?? null);
    const [enteredInChatMode, setEnteredInChatMode] = useState<boolean>(
        Boolean(currentSessionIdProp) || Boolean(isMaya)
    );
    const [sessionsFetched, setSessionsFetched] = useState<boolean>(false);
    const [ipInfo, setIpInfo] = useState<IpInfo | null>(null);
    const { analytics } = useOctoAnalytics();

    // --- Forward refs (populated by sibling providers after mount) ---
    const getInitialAgentIdRef = useRef<(() => string) | null>(null);
    const setCurrentAgentStateRef = useRef<((id: string) => void) | null>(null);

    // Ref holding the connectToStream function; set by ChatProvider after its own mount.
    const connectToStreamRef = useRef<((sessionId: string) => Promise<{ isCompleted: boolean }>) | null>(null);

    // --- Stable ref-delegate wrappers ---
    // These are safe to use on first render because AgentProvider mounts before
    // any interaction can trigger them.
    const getInitialAgentId = useCallback(() => getInitialAgentIdRef.current?.() ?? 'maya', []);
    const setCurrentAgentState = useCallback((id: string) => setCurrentAgentStateRef.current?.(id), []);

    // --- Session CRUD — simple mutations ---
    const removeSession = useCallback(
        (sessionId: string) => {
            setSessions(prev => prev.filter(s => s.id !== sessionId));
            if (currentSessionId === sessionId) {
                setCurrentSessionIdState(null);
                setCurrentAgentState(getInitialAgentId());
                setEnteredInChatMode(isMaya ? true : false);
            }
        },
        [
            currentSessionId,
            setSessions,
            setCurrentSessionIdState,
            setCurrentAgentState,
            getInitialAgentId,
            isMaya,
            setEnteredInChatMode,
        ]
    );

    const updateSessionName = useCallback(
        async (sessionId: string, newSessionName: string) => {
            const oldName = sessions.find(s => s.id === sessionId)?.name || '';
            try {
                setSessions(prev => prev.map(s => (s.id === sessionId ? { ...s, name: newSessionName } : s)));
                await updateSessionTitle({ session_id: sessionId, title: newSessionName });
            } catch {
                setSessions(prev => prev.map(s => (s.id === sessionId ? { ...s, name: oldName } : s)));
                toast.error('Failed to update session name.');
            }
        },
        [sessions, setSessions]
    );

    const setFeedback = useCallback(
        async (sessionId: string, responseId: string, liked: boolean) => {
            setSessions(prev =>
                prev.map(s =>
                    s.id === sessionId
                        ? { ...s, chat: s.chat.map(e => (e.id === responseId ? { ...e, feedback: liked } : e)) }
                        : s
                )
            );
        },
        [setSessions]
    );

    const updateAgentMessageContent = useCallback(
        (sessionId: string, messageId: string, newContent: string) => {
            setSessions(prev =>
                prev.map(s =>
                    s.id === sessionId
                        ? {
                              ...s,
                              chat: s.chat.map(e =>
                                  e.id === messageId ? { ...e, message: { content: newContent } } : e
                              ),
                          }
                        : s
                )
            );
        },
        [setSessions]
    );

    // --- Session CRUD — select / history fetch / stream reconnect ---
    // These two are kept together: setCurrentSessionId triggers checkAndReconnectStream
    // when the fetched history shows a response is still in flight.

    // connectToStreamRef and setSessions are stable (ref + state setter) — not reactive values.
    const checkAndReconnectStream = useCallback(async (sessionId: string) => {
        const connectToStream = connectToStreamRef.current;
        if (!connectToStream) {
            console.warn('connectToStream not yet available');
            return;
        }

        setSessions(prev =>
            prev.map(s => {
                if (s.id !== sessionId) return s;
                const lastEvent = s.chat[s.chat.length - 1];
                if (lastEvent && lastEvent.role === 'user') {
                    return {
                        ...s,
                        chat: [
                            ...s.chat,
                            {
                                id: `agent-${Date.now()}`,
                                message: { content: '' },
                                role: 'agent' as const,
                                parent_id: lastEvent.id,
                                feedback: null,
                                created_at: new Date().toISOString(),
                            },
                        ],
                        thinking: true,
                        thinkingSteps: [],
                    };
                }
                return { ...s, thinking: true, thinkingSteps: [] };
            })
        );

        try {
            const result = await connectToStream(sessionId);
            if (result.isCompleted) {
                setSessions(prev =>
                    prev.map(s => {
                        if (s.id !== sessionId) return s;
                        const chat = s.chat.filter(
                            e => !(e.role === 'agent' && !e.message?.content?.trim() && e.id.startsWith('agent-'))
                        );
                        return { ...s, chat, thinking: false, thinkingSteps: [] };
                    })
                );
            }
        } catch (error) {
            console.error('Failed to reconnect to stream:', error);
            setSessions(prev =>
                prev.map(s => {
                    if (s.id !== sessionId) return s;
                    const chat = s.chat.filter(
                        e => !(e.role === 'agent' && !e.message?.content?.trim() && e.id.startsWith('agent-'))
                    );
                    return { ...s, chat, thinking: false, thinkingSteps: [] };
                })
            );
        }
    }, []);

    const setCurrentSessionId = useCallback(
        async (sessionId: string | null, forceSessionsFetched = false, fetchedSessions?: Session[]) => {
            if (!sessionId) {
                setCurrentSessionIdState(null);
                setCurrentAgentState(getInitialAgentId());
                setEnteredInChatMode(isMaya ? true : false);
                return;
            }

            const sessionsToSearch = fetchedSessions || sessions;
            const targetSession = sessionsToSearch.find(s => s.id === sessionId);

            if (currentSessionId === sessionId && targetSession && targetSession.status === 'fetched') return;

            if (currentSessionId && currentSessionId !== sessionId) {
                analytics.trackSessionSwitched({ from_session_id: currentSessionId, to_session_id: sessionId });
            }

            if (targetSession && targetSession.thinking) {
                setCurrentSessionIdState(sessionId);
                setCurrentAgentState(targetSession.agentId || getInitialAgentId());
                setEnteredInChatMode(true);
                return;
            }

            try {
                if (forceSessionsFetched && fetchedSessions) {
                    setSessions(fetchedSessions.map(s => (s.id === sessionId ? { ...s, status: 'fetching' } : s)));
                } else {
                    setSessions(prev => prev.map(s => (s.id === sessionId ? { ...s, status: 'fetching' } : s)));
                }

                setCurrentSessionIdState(sessionId);
                setCurrentAgentState(targetSession?.agentId || getInitialAgentId());
                setEnteredInChatMode(true);

                const response = await getChatHistoryV2(sessionId);
                const chat = convertChatHistoryV2ToEvents(response.data.history);
                const agentId = response.data.agent_id;

                setSessions(prev =>
                    prev.map(s => {
                        if (s.id !== sessionId) return s;
                        return {
                            ...s,
                            chat,
                            status: 'fetched',
                            hasNewMessage: false,
                            // currentAgent is '' at provider init; agentId from response takes precedence
                            agentId: agentId || s.agentId || '',
                        };
                    })
                );

                // Only reconnect to a live stream if the history suggests one is in progress:
                // last event is a user message (agent hasn't responded yet) or an incomplete
                // agent event. Completed sessions have every event with isCompleted:true, so
                // calling connectToStream on them would spuriously trigger STREAMING state.
                const lastChatEvent = chat[chat.length - 1];
                const needsStreamReconnect =
                    lastChatEvent &&
                    (lastChatEvent.role === 'user' || (lastChatEvent.role === 'agent' && !lastChatEvent.isCompleted));
                if (needsStreamReconnect) {
                    checkAndReconnectStream(sessionId);
                }
            } catch {
                toast.error('Failed to load session history.');
            }
        },
        [
            currentSessionId,
            sessions,
            checkAndReconnectStream,
            analytics,
            setCurrentSessionIdState,
            setCurrentAgentState,
            setEnteredInChatMode,
            getInitialAgentId,
            isMaya,
            setSessions,
        ]
    );

    // --- Fetch / refresh ---

    const fetchAndSetSessions = useCallback(
        async (sessionIdOverride?: string, forceRefetch = false): Promise<Session[]> => {
            // brandId -1 signals a local/preview instance — synthesize a session without a network call.
            if (brandId === -1) {
                const localSessions: Session[] = [];
                if (sessionIdOverride) {
                    localSessions.push({
                        id: sessionIdOverride,
                        name: 'New chat',
                        updatedAt: new Date().toISOString(),
                        agentId: getInitialAgentId(),
                        status: 'idle',
                        hasNewName: false,
                        hasNewMessage: false,
                        thinking: false,
                        chat: [],
                        thinkingSteps: [],
                    });
                }
                return localSessions;
            }
            if (sessionsFetched && !forceRefetch) return sessions;
            const res = await getBrandSessions(brandId);

            const fetchedSessions: Session[] = res.data.sessions.map((s: any) => ({
                id: s.session_id,
                name: s.session_title,
                updatedAt: s.update_time,
                agentId: s.agent_id || getInitialAgentId(),
                status: 'idle',
                hasNewName: false,
                hasNewMessage: false,
                thinking: false,
                chat: [],
                thinkingSteps: [],
            }));
            const existingIds = sessions.map(s => s.id);
            const newSessions = fetchedSessions.filter((s: Session) => !existingIds.includes(s.id));
            const merged = [...sessions, ...newSessions];
            setSessions(merged);
            setSessionsFetched(true);
            return merged;
        },
        [brandId, sessions, sessionsFetched, setSessions, setSessionsFetched, getInitialAgentId]
    );

    const refreshData = useCallback(
        (): Promise<unknown[]> => Promise.all([fetchAndSetSessions(currentSessionIdProp, true)]),
        [fetchAndSetSessions, currentSessionIdProp]
    );

    /**
     * Called by bootstrap after the initial session list fetch. Maps raw API
     * sessions to the internal `Session` shape, merges with any existing sessions,
     * optionally selects `initialSessionId`, and marks `sessionsFetched`.
     *
     * Pass `localFallback` for `brandId === -1` when no network sessions exist.
     */
    const initSessions = useCallback(
        (
            rawSessions: SessionV2[],
            opts?: { initialSessionId?: string; localFallback?: Session; ipInfo?: IpInfo | null }
        ) => {
            const mapped: Session[] = rawSessions.map(s => ({
                id: s.id,
                name: s.session_name,
                updatedAt: s.last_update_time,
                agentId: s.agent_id,
                status: 'idle' as const,
                hasNewName: false,
                hasNewMessage: false,
                thinking: false,
                chat: [],
                thinkingSteps: [],
            }));

            if (mapped.length === 0 && opts?.localFallback) {
                setSessions([opts.localFallback]);
            } else {
                // Compute the merged list outside the updater — calling setCurrentSessionId
                // (an async domain method) inside a setState updater is unsafe under React 18
                // concurrent rendering where updaters may be invoked more than once.
                setSessions(prev => {
                    const existingIds = new Set(prev.map(s => s.id));
                    return [...prev, ...mapped.filter(s => !existingIds.has(s.id))];
                });
                setSessionsFetched(true);
                if (opts?.initialSessionId) {
                    // Pass the full merged list so setCurrentSessionId doesn't rely on stale state.
                    const existingIds = new Set(sessions.map(s => s.id));
                    const merged = [...sessions, ...mapped.filter(s => !existingIds.has(s.id))];
                    void setCurrentSessionId(opts.initialSessionId, true, merged);
                }
            }

            if (opts?.ipInfo !== undefined) {
                setIpInfo(opts.ipInfo);
            }
        },
        [sessions, setSessions, setSessionsFetched, setCurrentSessionId, setIpInfo]
    );

    /** Resets to the "no session selected" state — equivalent to starting a new chat. */
    const startNewChat = useCallback(() => {
        setCurrentSessionIdState(null);
        setCurrentAgentState(getInitialAgentId());
        setEnteredInChatMode(isMaya ? true : false);
    }, [setCurrentSessionIdState, setCurrentAgentState, getInitialAgentId, setEnteredInChatMode, isMaya]);

    /**
     * Clears the current session when the user switches agents.
     * `keepInChatMode` should be `true` when switching to a non-initial agent.
     */
    const clearSessionForAgentSwitch = useCallback(
        (keepInChatMode: boolean) => {
            setCurrentSessionIdState(null);
            setEnteredInChatMode(keepInChatMode);
        },
        [setCurrentSessionIdState, setEnteredInChatMode]
    );

    return (
        <SessionContext.Provider
            value={{
                sessions,
                setSessions,
                currentSessionId,
                setCurrentSessionIdState,
                enteredInChatMode,
                setEnteredInChatMode,
                sessionsFetched,
                setSessionsFetched,
                ipInfo,
                setIpInfo,
                setCurrentSessionId,
                removeSession,
                updateSessionName,
                setFeedback,
                updateAgentMessageContent,
                connectToStreamRef,
                refreshData,
                initSessions,
                startNewChat,
                clearSessionForAgentSwitch,
                getInitialAgentIdRef,
                setCurrentAgentStateRef,
            }}
        >
            {children}
        </SessionContext.Provider>
    );
}
