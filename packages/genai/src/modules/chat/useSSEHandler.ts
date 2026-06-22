import { useCallback, useRef } from 'react';

import { readStream } from '@/services/stream/StreamReader';
import { getChatStreamUrl, startChatSession, type StartChatPayload } from '@/services/api';
import type { AgentType, HandleSSEMessageData } from '@/types';

export interface SSEMessagePayload {
    brand_id: number;
    message: string;
    agent_id: string | null;
    agent_type: AgentType;
    session_id: string | null;
    user_id: string;
    s3_keys: string[];
    video_id?: string;
    /** Tracks the temporary session ID for new sessions until a real ID is assigned. */
    temp_session_id?: string;
    previous_context?: {
        message: string;
        agent_response: string;
        session_name: string;
    };
    integration_type?: 'embed' | 'placement';
    integration_id?: string;
    content_order?: string[];
}

interface UseSSEHandlerParams {
    onMessage: (data: HandleSSEMessageData) => void;

    onError: (sessionId: string | null | undefined, error: string | any) => void;
    onSessionCreated: (tempSessionId: string, realSessionId: string) => void;
}

interface UseSSEHandlerResult {
    sendSSEMessage: (payload: SSEMessagePayload) => Promise<void>;
    connectToStream: (sessionId: string) => Promise<{ isCompleted: boolean }>;
    cancelStream: (sessionId: string | null | undefined) => void;
}

export function useSSEHandler({ onMessage, onError, onSessionCreated }: UseSSEHandlerParams): UseSSEHandlerResult {
    const abortControllersRef = useRef<Map<string, AbortController>>(new Map());
    const pendingCachedResponsesRef = useRef<Set<string>>(new Set());

    /**
     * Returns a function that processes a single JSON string from the SSE stream.
     * Preserves all field-alias handling (`function_name:` colon-key variant),
     * the `hasData` guard, and cached-session marking.
     */
    const createSingleJsonProcessor = (sessionId: string) => {
        let pendingSessionName: string | null = null;
        const isCachedSession = pendingCachedResponsesRef.current.has(sessionId);

        return (jsonStr: string): { isCompleted: boolean; isError: boolean } => {
            if (!jsonStr.trim()) return { isCompleted: false, isError: false };

            try {
                const parsed = JSON.parse(jsonStr) as Partial<HandleSSEMessageData> & {
                    error?: string;
                    [key: string]: any;
                };

                if (parsed.error) {
                    return { isCompleted: false, isError: true };
                }

                const messageData: HandleSSEMessageData = { session_id: sessionId };
                let hasData = false;

                if (parsed.user_message_id !== undefined) {
                    messageData.user_message_id = parsed.user_message_id;
                    hasData = true;
                }
                if (parsed.message !== undefined) {
                    messageData.message = parsed.message;
                    if (isCachedSession) messageData.is_cached = true;
                    hasData = true;
                }
                if (parsed.agent_message_id !== undefined) {
                    messageData.agent_message_id = parsed.agent_message_id;
                    hasData = true;
                }
                if (parsed.session_name !== undefined) {
                    messageData.session_name = parsed.session_name;
                    hasData = true;
                }
                if (pendingSessionName && messageData.session_name === undefined) {
                    messageData.session_name = pendingSessionName;
                    pendingSessionName = null;
                    hasData = true;
                }
                if (parsed.response_completed !== undefined) {
                    messageData.response_completed = parsed.response_completed;
                    if (parsed.response_completed === true) {
                        pendingCachedResponsesRef.current.delete(sessionId);
                    }
                    hasData = true;
                }
                if (parsed.type !== undefined) {
                    messageData.type = parsed.type as HandleSSEMessageData['type'];
                    hasData = true;
                }
                if (parsed.tool_metadata !== undefined) {
                    messageData.tool_metadata = parsed.tool_metadata as HandleSSEMessageData['tool_metadata'];
                    if (isCachedSession) messageData.is_cached = true;
                    hasData = true;
                }

                // Handle colon-key variants sent by some backend versions
                const fnName = parsed.function_name ?? parsed['function_name:'];
                if (fnName !== undefined) {
                    messageData.function_name = fnName;
                    hasData = true;
                }
                const fnResponse = parsed.function_response ?? parsed['function_response:'];
                if (fnResponse !== undefined) {
                    messageData.function_response = fnResponse;
                    hasData = true;
                }
                const carouselMeta = parsed.carousel_metadata ?? parsed['carousel_metadata:'];
                if (carouselMeta !== undefined) {
                    messageData.carousel_metadata = carouselMeta;
                    if (isCachedSession) messageData.is_cached = true;
                    hasData = true;
                }

                if (hasData) onMessage(messageData);

                return { isCompleted: parsed.response_completed === true, isError: false };
            } catch {
                return { isCompleted: false, isError: false };
            }
        };
    };

    /**
     * Connect to an existing stream for a session.
     * Used for reconnecting after browser refresh or when loading chat history.
     */
    const connectToStream = useCallback(
        async (sessionId: string): Promise<{ isCompleted: boolean }> => {
            const existingController = abortControllersRef.current.get(sessionId);
            if (existingController) existingController.abort();

            const abortController = new AbortController();
            abortControllersRef.current.set(sessionId, abortController);

            try {
                const response = await fetch(getChatStreamUrl(sessionId), {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                    signal: abortController.signal,
                });

                if (!response.ok) {
                    return { isCompleted: true };
                }

                return await readStream(response, createSingleJsonProcessor(sessionId), abortController.signal);
            } catch (error: unknown) {
                if (error instanceof Error && error.name === 'AbortError') {
                    return { isCompleted: false };
                }
                return { isCompleted: true };
            } finally {
                const current = abortControllersRef.current.get(sessionId);
                if (current === abortController) {
                    abortControllersRef.current.delete(sessionId);
                }
            }
        },
        [onMessage]
    );

    /**
     * Send a new message using the two-step flow:
     * 1. POST /start — creates session, returns real session_id + user_message_id
     * 2. GET /stream/{session_id} — streams response chunks
     */
    const sendSSEMessage = useCallback(
        async (payload: SSEMessagePayload): Promise<void> => {
            const sessionKey = payload.session_id || payload.temp_session_id;
            if (!sessionKey) throw new Error('session_id or temp_session_id required');

            const existingController = abortControllersRef.current.get(sessionKey);
            if (existingController) existingController.abort();

            const abortController = new AbortController();
            abortControllersRef.current.set(sessionKey, abortController);

            try {
                const startPayload: StartChatPayload = {
                    brand_id: payload.brand_id,
                    message: payload.message,
                    agent_id: payload.agent_id || '',
                    agent_type: payload.agent_type,
                    session_id: payload.session_id,
                    user_id: payload.user_id,
                    s3_keys: payload.s3_keys,
                    video_id: payload.video_id,
                    previous_context: payload.previous_context,
                    integration_type: payload.integration_type,
                    integration_id: payload.integration_id,
                    content_order: payload.content_order,
                };

                const startResponse = await startChatSession(startPayload);
                const { session_id: realSessionId, user_message_id } = startResponse.data;

                if (startResponse.message?.includes('(cached)')) {
                    pendingCachedResponsesRef.current.add(realSessionId);
                }

                if (payload.temp_session_id && realSessionId) {
                    onSessionCreated(payload.temp_session_id, realSessionId);
                    const ctrl = abortControllersRef.current.get(payload.temp_session_id);
                    if (ctrl) {
                        abortControllersRef.current.set(realSessionId, ctrl);
                        abortControllersRef.current.delete(payload.temp_session_id);
                    }
                }

                onMessage({ session_id: realSessionId, user_message_id });

                const response = await fetch(getChatStreamUrl(realSessionId), {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                    signal: abortController.signal,
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                await readStream(response, createSingleJsonProcessor(realSessionId), abortController.signal);
            } catch (error: unknown) {
                if (error instanceof Error && error.name !== 'AbortError') {
                    onError(sessionKey, error.message || 'SSE failed');
                }
            } finally {
                const current = abortControllersRef.current.get(sessionKey);
                if (current === abortController) {
                    abortControllersRef.current.delete(sessionKey);
                }
            }
        },
        [onMessage, onError, onSessionCreated]
    );

    const cancelStream = useCallback((sessionId: string | null | undefined) => {
        if (!sessionId) return;
        const controller = abortControllersRef.current.get(sessionId);
        if (controller) {
            controller.abort();
            abortControllersRef.current.delete(sessionId);
        }
    }, []);

    return { sendSSEMessage, connectToStream, cancelStream };
}
