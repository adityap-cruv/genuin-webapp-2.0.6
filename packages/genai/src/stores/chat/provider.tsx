import { type ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

import { useOctoAnalytics } from '@/adapters/analytics/hooks';
import { convertCachedResponseToEvents } from '@/services/session/CachedResponseConverter';
import { assembleSSEMessage } from '@/services/stream/ChatMessageAssembler';
import { stopChatSession } from '@/services/api';
import type { CachedResponseItem } from '@/services/apiTypes';
import { ingestDataToBCC } from '@/services/ingestDataToBCC';
import { useRudderEvents } from '@/adapters/analytics/useRudderAnalytics';
import type { AgentType, ChatHistoryEvent, HandleSSEMessageData } from '@/types';

import { useAgentContext } from '@/stores/agent/context';
import { useSSEHandler, type SSEMessagePayload } from '@/modules/chat/useSSEHandler';
import { useSuggestedPrompts } from '@/modules/chat/useSuggestedPrompts';
import { useLifecycleContext } from '@/stores/lifecycle/context';
import { OctoState } from '@/core/state-machine/octo-state';
import { useSessionContext } from '@/stores/session/context';

import { ChatContext } from './context';
import type { HandleSendMessageParams } from '@/modules/chat/types';

interface ChatProviderProps {
    /** Brand ID forwarded to SSE payloads. */
    brandId: number;
    /** Authenticated user ID. */
    userId: string;
    /** Pre-loaded pending messages to dispatch once sessions are fetched. */
    pendingMessages?: Array<{ message: string; agent_id?: string; session_id?: string }>;
    /** Current render view. Affects SSE payload construction. */
    view: 'page' | 'floater' | 'dialog' | 'web-sdk';
    /** Video ID for web-sdk view. */
    videoId?: string;
    /** Integration type for embed/placement context (web-sdk only). */
    integrationType?: 'embed' | 'placement';
    /** Integration ID (web-sdk only). */
    integrationId?: string;
    /** Content ordering hint (web-sdk only). */
    contentOrder?: string[];
    children: ReactNode;
}

type HandleSendMessageFn = (params: HandleSendMessageParams) => Promise<void>;

/**
 * Owns pending-message state, s3-key attachments, and all chat interaction
 * logic: sending messages, handling SSE stream events, stopping responses,
 * and socket error handling. Reads session and agent state from sibling contexts.
 *
 * Internal structure:
 *   1. State & refs
 *   2. S3 attachments
 *   3. Suggested prompts
 *   4. SSE error handling
 *   5. SSE stream handlers (message assembly + session ID mapping)
 *   6. Send message
 *   7. Stop response
 *   8. Pending messages bootstrap effect
 */
export function ChatProvider({
    brandId,
    userId,
    pendingMessages: pendingMessagesProp,
    view,
    videoId,
    integrationType,
    integrationId,
    contentOrder,
    children,
}: ChatProviderProps) {
    const sessionContext = useSessionContext();
    const agentContext = useAgentContext();
    const { transitionOctoState } = useLifecycleContext();
    const { analytics } = useOctoAnalytics();
    const { track } = useRudderEvents();

    // -------------------------------------------------------------------------
    // 1. State & refs
    // -------------------------------------------------------------------------

    const [pendingMessages, setPendingMessages] = useState<
        Array<{ message: string; agent_id?: string; session_id?: string }>
    >(pendingMessagesProp ?? []);
    const [creatingSession] = useState<boolean>(false);
    // Sidebar flag set by UIProvider after mount — read here to drive hasNewName logic in SSE assembly.
    const [isSidebarCollapsedForSSE, setIsSidebarCollapsedForSSE] = useState<boolean>(false);

    const handleSendMessageRef = useRef<HandleSendMessageFn | null>(null);
    // Maps real session IDs → temp session IDs to handle async race conditions between
    // POST /start (which assigns the real ID) and in-flight SSE events.
    const sessionIdMapRef = useRef<Map<string, string>>(new Map());
    // Live ref for the pending temp ID — lets handleSessionCreated read the current value
    // even when it fires from a stale closure after the POST /start awaits.
    const pendingTempSessionIdRef = useRef<string | null>(null);
    // Per-instance dedup guard for pending messages — module-level would break multi-instance SDK.
    const lastProcessedPendingSignatureRef = useRef<string | null>(null);

    // -------------------------------------------------------------------------
    // 2. S3 attachments
    // -------------------------------------------------------------------------

    const [s3_keys, setS3KeysState] = useState<string[]>([]);

    function setS3Keys(keys: string[]) {
        setS3KeysState(prev => [...prev, ...keys]);
    }

    function clearS3Keys() {
        setS3KeysState([]);
    }

    // -------------------------------------------------------------------------
    // 3. Suggested prompts
    // -------------------------------------------------------------------------

    // Single source of truth for suggested prompts — UIProvider reads suggestedPrompts
    // and isLoadingSuggestedPrompts from ChatContext to avoid a duplicate hook instance.
    const { suggestedPrompts, isLoadingSuggestedPrompts, cachedPromptResponses, fetchSuggestedPrompts } =
        useSuggestedPrompts({
            brandId,
            currentAgent: agentContext.currentAgent,
            currentSessionId: sessionContext.currentSessionId,
            enteredInChatMode: sessionContext.enteredInChatMode,
            videoId,
            onSuggestedPromptsFetched: () => {
                try {
                    transitionOctoState(OctoState.READY);
                } catch {
                    /* ignore */
                }
            },
        });

    // -------------------------------------------------------------------------
    // 4. SSE error handling
    // -------------------------------------------------------------------------

    function handleOnSocketError(sessionId: string | null | undefined, error: unknown) {
        let errorMessage = 'Something went wrong. Please try again.';
        if (typeof error === 'string') {
            errorMessage = error || errorMessage;
        } else if (error && typeof error === 'object') {
            const errObj = error as Record<string, unknown>;
            errorMessage =
                (typeof errObj.message === 'string' ? errObj.message : null) ||
                (typeof errObj.error === 'string' ? errObj.error : null) ||
                errorMessage;
        }

        sessionContext.setSessions(prev =>
            prev.map(s => {
                if (s.id !== sessionId) return s;

                const chat = [...s.chat];
                const errorEvent: ChatHistoryEvent = {
                    id: `${new Date().toISOString()}-error`,
                    message: { content: 'Something went wrong. Please try again.' },
                    role: 'agent',
                    parent_id: null,
                    feedback: null,
                    created_at: new Date().toISOString(),
                    artifacts: [],
                    isCompleted: true,
                    error: errorMessage,
                };

                if (chat.length > 0) {
                    // Replace the last (in-progress) agent event with the error.
                    const lastIndex = chat.length - 1;
                    const last = chat[lastIndex];
                    if (last) {
                        chat[lastIndex] = { ...last, ...errorEvent };
                    }
                } else {
                    chat.push(errorEvent);
                }

                return { ...s, chat, thinking: false, status: 'error', thinkingSteps: [] };
            })
        );

        toast.error(errorMessage);
        try {
            transitionOctoState(OctoState.ERROR);
        } catch {
            /* ignore */
        }
    }

    // -------------------------------------------------------------------------
    // 5. SSE stream handlers
    // -------------------------------------------------------------------------

    /**
     * Processes each SSE chunk. Assembles the streamed message into session chat
     * and triggers analytics + suggested-prompts fetch on response completion.
     */
    const handleSSEMessage = useCallback(
        (data: HandleSSEMessageData) => {
            const sessionId = data.session_id;
            if (!sessionId) return;

            const tempSessionId = sessionIdMapRef.current.get(sessionId);

            if (data.message !== undefined || data.agent_message_id !== undefined) {
                try {
                    transitionOctoState(OctoState.STREAMING);
                } catch {
                    /* may already be STREAMING */
                }
            }

            sessionContext.setSessions(prev =>
                prev.map(s => {
                    if (s.id !== sessionId && s.id !== tempSessionId) return s;

                    const { session: updatedSession, responseCompleted } = assembleSSEMessage({
                        session: s,
                        realSessionId: sessionId,
                        data,
                        isSidebarCollapsed: isSidebarCollapsedForSSE,
                        currentSessionId: sessionContext.currentSessionId,
                    });

                    if (responseCompleted) {
                        onResponseCompleted(updatedSession, s, sessionId, tempSessionId);
                    }

                    return updatedSession;
                })
            );
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [
            sessionContext.currentSessionId,
            fetchSuggestedPrompts,
            analytics,
            transitionOctoState,
            isSidebarCollapsedForSSE,
        ]
    );

    /** Fires analytics, ingest, state transition, and suggested-prompts fetch on a completed response. */
    function onResponseCompleted(
        updatedSession: ReturnType<typeof assembleSSEMessage>['session'],
        originalSession: typeof updatedSession,
        sessionId: string,
        tempSessionId: string | undefined
    ) {
        const lastEvent = updatedSession.chat[updatedSession.chat.length - 1];

        if (lastEvent?.role === 'agent') {
            const responseTime = lastEvent.created_at ? Date.now() - new Date(lastEvent.created_at).getTime() : 0;
            const videoIds = lastEvent.carousel_metadata?.video_ids ?? [];

            analytics.trackResponseReceived({
                response_time: responseTime,
                includes_video_carousel: videoIds.length > 0,
                video_count: videoIds.length > 0 ? videoIds.length : undefined,
                response_length: lastEvent.message?.content?.length ?? 0,
                session_id: sessionId,
                agent_id: originalSession.agentId,
            });

            if (lastEvent.message?.function_name && lastEvent.message?.function_response) {
                try {
                    ingestDataToBCC(lastEvent.message.function_response, lastEvent.message.function_name).catch(err => {
                        console.error(err);
                    });
                } catch (err) {
                    console.error('Failed to parse function_response:', err);
                }
            }
        }

        try {
            transitionOctoState(OctoState.RESPONDING);
        } catch {
            /* ignore */
        }

        if (originalSession.agentId) {
            const lastUserMsg = updatedSession.chat
                .slice()
                .reverse()
                .find(e => e.role === 'user');
            fetchSuggestedPrompts(originalSession.agentId, {
                user_query: lastUserMsg?.message?.content ?? '',
                agent_response: lastEvent?.message?.content ?? '',
            });
        }

        if (tempSessionId) {
            sessionIdMapRef.current.delete(sessionId);
        }
    }

    /**
     * Called by useSSEHandler when the backend assigns a real session ID to a
     * temp session. Maps the IDs and promotes the temp session in state.
     */
    const handleSessionCreated = useCallback(
        (tempSessionId: string, realSessionId: string) => {
            sessionIdMapRef.current.set(realSessionId, tempSessionId);

            sessionContext.setSessions(prev => {
                const updated = prev.map(s =>
                    s.id === tempSessionId
                        ? {
                              ...s,
                              id: realSessionId,
                              isCachedContextSession: false,
                              cachedContext: undefined,
                              backendSessionId: realSessionId,
                          }
                        : s
                );
                analytics.trackSessionCreated({
                    session_id: realSessionId,
                    is_first_session_ever: updated.length === 1,
                });
                return updated;
            });

            // Use the live ref — sessionContext.currentSessionId in the closure may be stale
            // when this callback fires asynchronously after the POST /start awaits.
            if (pendingTempSessionIdRef.current === tempSessionId) {
                sessionContext.setCurrentSessionIdState(realSessionId);
                pendingTempSessionIdRef.current = null;
            } else if (sessionContext.currentSessionId === tempSessionId) {
                // Cached-context sessions go through appendToExistingSession (targetSessionId is set),
                // so pendingTempSessionIdRef is never written. But currentSessionId still points at the
                // old temp ID after the session is renamed — update it here so the UI stays in sync.
                sessionContext.setCurrentSessionIdState(realSessionId);
            }
        },
        [analytics, sessionContext]
    );

    const { sendSSEMessage, connectToStream, cancelStream } = useSSEHandler({
        onMessage: handleSSEMessage,
        onError: handleOnSocketError,
        onSessionCreated: handleSessionCreated,
    });

    // Wire connectToStream into SessionContext so SessionProvider can reconnect on history load.
    sessionContext.connectToStreamRef.current = connectToStream;

    // -------------------------------------------------------------------------
    // 6. Send message
    // -------------------------------------------------------------------------

    /** Resolves the parent_id for the new user event in an existing or edited session. */
    function resolveParentId(sessionId: string | undefined, editedChatId: string | null | undefined): string | null {
        const session = sessionContext.sessions.find(s => s.id === sessionId);
        if (!session) return null;
        if (editedChatId) return session.chat.find(e => e.id === editedChatId)?.parent_id ?? null;
        return session.chat[session.chat.length - 1]?.id ?? null;
    }

    /** Returns the current agent falling back to the initial agent. */
    function resolveAgent(agentId: string | undefined): { id: string; type: AgentType } | null {
        const pool = [...agentContext.agents, { type: 'maya' as AgentType, id: 'maya' }];
        return pool.find(a => a.id === agentId) ?? pool.find(a => a.id === agentContext.currentAgent) ?? null;
    }

    /**
     * Optimistically creates a new session entry in state before the POST /start
     * resolves, so the UI shows the session and thinking indicator immediately.
     */
    function openNewSessionOptimistically(
        tempSessionId: string,
        userEvent: ChatHistoryEvent,
        agentId: string,
        timestamp: string
    ) {
        const thinkingAgent: ChatHistoryEvent = {
            id: `agent-${Date.now()}`,
            message: { content: '' },
            role: 'agent',
            parent_id: userEvent.id,
            feedback: null,
            created_at: new Date().toISOString(),
        };

        sessionContext.setSessions(prev => [
            ...prev,
            {
                id: tempSessionId,
                name: 'New chat',
                chat: [userEvent, thinkingAgent],
                updatedAt: timestamp,
                thinking: true,
                agentId,
                hasNewName: false,
                status: 'fetched',
                hasNewMessage: false,
                thinkingSteps: [],
            },
        ]);
        sessionContext.setCurrentSessionIdState(tempSessionId);
        sessionContext.setEnteredInChatMode(true);
        agentContext.setCurrentAgentState(agentId);
    }

    /**
     * Optimistically appends user + thinking-agent events to an existing session
     * before the POST /start resolves.
     */
    function appendToExistingSession(sessionId: string, userEvent: ChatHistoryEvent, timestamp: string) {
        const thinkingAgent: ChatHistoryEvent = {
            id: `agent-${Date.now()}`,
            message: { content: '' },
            role: 'agent',
            parent_id: userEvent.id,
            feedback: null,
            created_at: new Date().toISOString(),
        };

        sessionContext.setSessions(prev =>
            prev.map(s =>
                s.id === sessionId
                    ? {
                          ...s,
                          chat: [...s.chat, userEvent, thinkingAgent],
                          updatedAt: timestamp,
                          thinking: true,
                          thinkingSteps: [],
                      }
                    : s
            )
        );
    }

    async function handleSendMessage(params: HandleSendMessageParams): Promise<void> {
        const { targetSessionId, messageInput, agent_id, editedChatId, onMessageQueued } = params;

        if (!messageInput?.trim()) return;

        const currentSession = sessionContext.sessions.find(s => s.id === targetSessionId);
        if (currentSession?.thinking || currentSession?.status === 'fetching') return;

        try {
            transitionOctoState(targetSessionId ? OctoState.LOADING : OctoState.CREATING_SESSION);
        } catch {
            /* ignore */
        }

        // -- Cached response path --
        // Skip SSE entirely for pre-fetched prompt responses; optimistically show result.
        const cachedResponse = cachedPromptResponses.get(messageInput.trim());
        if (cachedResponse) {
            if (targetSessionId) {
                // Append cached response to existing session without hitting the API.
                const timestamp = new Date().toISOString();
                const userEvent: ChatHistoryEvent = {
                    id: uuidv4(),
                    message: { content: messageInput },
                    role: 'user',
                    parent_id: resolveParentId(targetSessionId, editedChatId) ?? '',
                    feedback: null,
                    created_at: timestamp,
                    isCompleted: true,
                };
                const { agentEvent, sessionName } = convertCachedResponseToEvents(cachedResponse);
                agentEvent.parent_id = userEvent.id;
                agentEvent.created_at = new Date().toISOString();
                onMessageQueued?.();
                sessionContext.setSessions(prev =>
                    prev.map(s =>
                        s.id !== targetSessionId
                            ? s
                            : {
                                  ...s,
                                  chat: [...s.chat, userEvent, agentEvent],
                                  updatedAt: timestamp,
                                  thinking: false,
                                  status: 'fetched' as const,
                                  ...(sessionName ? { name: sessionName, hasNewName: true } : {}),
                              }
                    )
                );
                // Walk state machine to READY through the valid path: LOADING → STREAMING → RESPONDING → READY.
                try { transitionOctoState(OctoState.STREAMING); } catch { /* ignore */ }
                try { transitionOctoState(OctoState.RESPONDING); } catch { /* ignore */ }
                try { transitionOctoState(OctoState.READY); } catch { /* ignore */ }
            } else {
                await handleCachedResponse({ messageInput, agent_id, cachedResponse, onMessageQueued });
            }
            return;
        }

        // -- Normal SSE path --
        const timestamp = new Date().toISOString();
        const userEvent: ChatHistoryEvent = {
            id: uuidv4(),
            message: { content: messageInput },
            role: 'user',
            parent_id: resolveParentId(targetSessionId ?? undefined, editedChatId) ?? '',
            feedback: null,
            created_at: timestamp,
            isCompleted: true,
        };

        let tempSessionId: string | undefined;

        try {
            if (!targetSessionId) {
                tempSessionId = `temp-${uuidv4()}`;
                pendingTempSessionIdRef.current = tempSessionId;
                trackChatStarted(messageInput);

                const agentId = agent_id ?? agentContext.currentAgent ?? agentContext.getInitialAgentId();
                openNewSessionOptimistically(tempSessionId, userEvent, agentId, timestamp);
            } else {
                appendToExistingSession(targetSessionId, userEvent, timestamp);
            }

            const agent = resolveAgent(agent_id);
            if (!agent) {
                toast.error('Agent not found.');
                return;
            }

            onMessageQueued?.();
            clearS3Keys();

            await sendSSEMessage(
                buildSSEPayload({
                    userEvent,
                    targetSessionId,
                    tempSessionId,
                    agent,
                })
            );

            analytics.trackMessageSent({
                message_length: messageInput.length,
                is_first_message: !targetSessionId,
                is_auto_sent: false,
                used_suggested_prompt: false,
                session_id: targetSessionId ?? tempSessionId,
                agent_id: agent.id,
            });
        } catch (error) {
            handleOnSocketError(targetSessionId ?? tempSessionId ?? '', 'Failed to send message. Please try again.');
            analytics.trackMessageSendFailed({
                error_message: error instanceof Error ? error.message : 'Unknown error',
                message_preview: messageInput.slice(0, 100),
            });
        }
    }

    /** Handles the cached-prompt fast path: creates a temp session locally without SSE. */
    async function handleCachedResponse({
        messageInput,
        agent_id,
        cachedResponse,
        onMessageQueued,
    }: {
        messageInput: string;
        agent_id?: string;
        cachedResponse: CachedResponseItem[];
        onMessageQueued?: () => void;
    }) {
        const tempSessionId = `temp-${uuidv4()}`;
        const timestamp = new Date().toISOString();
        const agentId = agent_id ?? agentContext.currentAgent ?? agentContext.getInitialAgentId();

        const userEvent: ChatHistoryEvent = {
            id: uuidv4(),
            message: { content: messageInput },
            role: 'user',
            parent_id: '',
            feedback: null,
            created_at: timestamp,
            isCompleted: true,
        };

        const { agentEvent, sessionName } = convertCachedResponseToEvents(cachedResponse);
        agentEvent.parent_id = userEvent.id;
        agentEvent.created_at = new Date().toISOString();

        const agentResponseContent =
            typeof agentEvent.message === 'string' ? agentEvent.message : (agentEvent.message?.content ?? '');

        trackChatStarted(messageInput);

        // Defer to next tick so the caller's state transitions flush first.
        setTimeout(() => {
            sessionContext.setSessions(prev => [
                ...prev,
                {
                    id: tempSessionId,
                    name: sessionName ?? 'New chat',
                    chat: [userEvent, agentEvent],
                    updatedAt: timestamp,
                    thinking: false,
                    agentId,
                    hasNewName: false,
                    status: 'fetched' as const,
                    hasNewMessage: false,
                    thinkingSteps: [],
                    isCachedContextSession: true,
                    cachedContext: {
                        message: messageInput,
                        agent_response: agentResponseContent,
                        session_name: sessionName ?? 'New chat',
                    },
                },
            ]);
            sessionContext.setCurrentSessionIdState(tempSessionId);
            sessionContext.setEnteredInChatMode(true);
            agentContext.setCurrentAgentState(agentId);
        }, 100);

        onMessageQueued?.();
        clearS3Keys();
    }

    /** Builds the SSE payload for the normal send path. */
    function buildSSEPayload({
        userEvent,
        targetSessionId,
        tempSessionId,
        agent,
    }: {
        userEvent: ChatHistoryEvent;
        targetSessionId: string | null | undefined;
        tempSessionId: string | undefined;
        agent: { id: string; type: AgentType };
    }): SSEMessagePayload {
        const sessionForPayload = sessionContext.sessions.find(s => s.id === targetSessionId);
        const needsPreviousContext = sessionForPayload?.isCachedContextSession && !sessionForPayload?.backendSessionId;

        return {
            brand_id: brandId,
            message: userEvent.message?.content ?? '',
            agent_id: agent.id,
            agent_type: agent.type,
            session_id: needsPreviousContext ? null : (targetSessionId ?? null),
            user_id: userId,
            s3_keys,
            video_id: view === 'web-sdk' ? videoId : undefined,
            temp_session_id: (needsPreviousContext ? targetSessionId : tempSessionId) ?? undefined,
            previous_context: needsPreviousContext ? sessionForPayload?.cachedContext : undefined,
            integration_type: view === 'web-sdk' ? integrationType : undefined,
            integration_id: view === 'web-sdk' ? integrationId : undefined,
            content_order: view === 'web-sdk' ? contentOrder : undefined,
        };
    }

    // Keep ref current so external callbacks always call the latest version.
    useEffect(() => {
        handleSendMessageRef.current = handleSendMessage;
    });

    // -------------------------------------------------------------------------
    // 7. Stop response
    // -------------------------------------------------------------------------

    const stopSessionResponse = useCallback(
        async (sessionId: string | null) => {
            if (!sessionId) return;

            const session =
                sessionContext.sessions.find(s => s.id === sessionId) ??
                sessionContext.sessions.find(s => s.backendSessionId === sessionId);

            const backendSessionId = session?.backendSessionId ?? sessionId;
            const tempSessionId =
                sessionIdMapRef.current.get(sessionId) ??
                (backendSessionId ? sessionIdMapRef.current.get(backendSessionId) : undefined);

            // Walk the map to find the real (non-temp) session ID for the API call.
            const realSessionId = (() => {
                if (backendSessionId && !backendSessionId.startsWith('temp-')) return backendSessionId;
                for (const [realId, tempId] of sessionIdMapRef.current.entries()) {
                    if (tempId === sessionId || (backendSessionId && tempId === backendSessionId)) return realId;
                }
                return undefined;
            })();

            try {
                transitionOctoState(OctoState.CANCELLING);
            } catch {
                /* ignore */
            }

            cancelStream(backendSessionId);
            cancelStream(sessionId);
            if (tempSessionId) cancelStream(tempSessionId);

            try {
                if (realSessionId) await stopChatSession(realSessionId);
            } catch (error: unknown) {
                const status =
                    error && typeof error === 'object' && 'response' in error
                        ? (error as { response?: { status?: number } }).response?.status
                        : undefined;
                if (status !== 404) {
                    console.error('Failed to stop agent response', error);
                    toast.error('Failed to stop response. Please try again.');
                }
            } finally {
                const targetIds = new Set(
                    [sessionId, backendSessionId, realSessionId, tempSessionId].filter(Boolean) as string[]
                );

                sessionContext.setSessions(prev =>
                    prev.map(s => {
                        if (!targetIds.has(s.id) && !(s.backendSessionId && targetIds.has(s.backendSessionId)))
                            return s;

                        const chat = [...s.chat];
                        const last = chat[chat.length - 1];
                        if (last?.role === 'agent' && !last.isCompleted) {
                            chat[chat.length - 1] = {
                                ...last,
                                isCompleted: true,
                                metadata: { ...last.metadata, wasStopped: true },
                            };
                        }

                        return {
                            ...s,
                            chat,
                            thinking: false,
                            thinkingSteps: [],
                            status: s.status === 'fetching' ? 'idle' : s.status,
                        };
                    })
                );

                try {
                    transitionOctoState(OctoState.READY);
                } catch {
                    /* ignore */
                }
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [sessionContext.sessions, cancelStream, transitionOctoState]
    );

    // -------------------------------------------------------------------------
    // 8. Pending messages bootstrap
    // -------------------------------------------------------------------------

    // Once sessions are fetched, drain the pending-messages queue in order.
    useEffect(() => {
        if (!pendingMessages.length || !sessionContext.sessionsFetched) return;

        const signature = JSON.stringify(pendingMessages);
        if (signature === lastProcessedPendingSignatureRef.current) return;
        lastProcessedPendingSignatureRef.current = signature;

        for (const msg of pendingMessages) {
            handleSendMessage({ targetSessionId: msg.session_id, messageInput: msg.message, agent_id: msg.agent_id });
        }
        setPendingMessages([]);
    }, [pendingMessages, sessionContext.sessionsFetched]);

    // -------------------------------------------------------------------------
    // Analytics helpers
    // -------------------------------------------------------------------------

    function trackChatStarted(messageInput: string) {
        if (sessionContext.ipInfo) {
            track('genai:chat_started', {
                ipInfo: sessionContext.ipInfo,
                session_id: sessionContext.currentSessionId,
                message: messageInput,
            });
        }
    }

    // -------------------------------------------------------------------------
    // Context value
    // -------------------------------------------------------------------------

    return (
        <ChatContext.Provider
            value={{
                pendingMessages,
                setPendingMessages,
                creatingSession,
                handleSendMessage,
                stopSessionResponse,
                handleOnSocketError,
                cachedPromptResponses,
                suggestedPrompts,
                isLoadingSuggestedPrompts,
                handleSendMessageRef,
                s3_keys,
                setS3Keys,
                clearS3Keys,
                isSidebarCollapsedForSSE,
                setIsSidebarCollapsedForSSE,
            }}
        >
            {children}
        </ChatContext.Provider>
    );
}
