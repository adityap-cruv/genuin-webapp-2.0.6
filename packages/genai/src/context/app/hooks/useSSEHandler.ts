import { useCallback, useRef } from 'react';
import type { AgentType, HandleSSEMessageData } from '@/types';
import { getChatStreamUrl, startChatSession, type StartChatPayload } from '@/lib/api';

export interface SSEMessagePayload {
    brand_id: number;
    message: string;
    agent_id: string | null;
    agent_type: AgentType;
    session_id: string | null;
    user_id: string;
    s3_keys: string[];
    video_id?: string;
    temp_session_id?: string; // Used to track the temporary session ID for new sessions
    previous_context?: {
        message: string;
        agent_response: string;
        session_name: string;
    };
    // Integration fields for embed/placement context
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

export const useSSEHandler = ({
    onMessage,
    onError,
    onSessionCreated,
}: UseSSEHandlerParams): UseSSEHandlerResult => {

    // One AbortController per session
    const abortControllersRef = useRef<Map<string, AbortController>>(new Map());

    // Track sessions with pending cached responses (cleared after each response completes)
    const pendingCachedResponsesRef = useRef<Set<string>>(new Set());

    const splitConcatenatedJson = (chunk: string): string[] => {
        const results: string[] = [];
        let depth = 0;
        let start = 0;

        for (let i = 0; i < chunk.length; i++) {
            if (chunk[i] === '{') {
                if (depth === 0) start = i;
                depth++;
            } else if (chunk[i] === '}') {
                depth--;
                if (depth === 0) {
                    results.push(chunk.slice(start, i + 1));
                }
            }
        }

        return results;
    };

    const createChunkProcessor = (sessionId: string) => {
        let pendingSessionName: string | null = null;
        const isCachedSession = pendingCachedResponsesRef.current.has(sessionId);

        const processSingleJson = (jsonStr: string): { isCompleted: boolean; isError: boolean } => {
            if (!jsonStr.trim()) return { isCompleted: false, isError: false };

            try {
                const parsed = JSON.parse(jsonStr) as Partial<HandleSSEMessageData> & { error?: string };

                // Check for error response (e.g., "Stream not found")
                if (parsed.error) {
                    return { isCompleted: false, isError: true };
                }

                const messageData: HandleSSEMessageData = {
                    session_id: sessionId,
                };

                let hasData = false;

                if (parsed.user_message_id !== undefined) {
                    messageData.user_message_id = parsed.user_message_id;
                    hasData = true;
                }

                if (parsed.message !== undefined) {
                    messageData.message = parsed.message;
                    // Mark message as cached if this session is from cached response
                    if (isCachedSession) {
                        messageData.is_cached = true;
                    }
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
                    // Clear cached flag when response completes
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
                    if (isCachedSession) {
                        messageData.is_cached = true;
                    }
                    hasData = true;
                }

                const fnName = parsed.function_name ?? (parsed as any)["function_name:"];
                if (fnName !== undefined) {
                    messageData.function_name = fnName;
                    hasData = true;
                }

                const fnResponse = parsed.function_response ?? (parsed as any)["function_response:"];
                if (fnResponse !== undefined) {
                    messageData.function_response = fnResponse;
                    hasData = true;
                }

                const carousel_metadata = parsed.carousel_metadata ?? (parsed as any)["carousel_metadata:"];
                if (carousel_metadata !== undefined) {
                    messageData.carousel_metadata = carousel_metadata;
                    if (isCachedSession) {
                        messageData.is_cached = true;
                    }
                    hasData = true;
                }

                if (hasData) {
                    onMessage(messageData);
                }

                return { isCompleted: parsed.response_completed === true, isError: false };

            } catch (err) {
                console.error("[SSE] JSON parse error", err, jsonStr);
                return { isCompleted: false, isError: false };
            }
        };

        const processChunk = (chunk: string): { isCompleted: boolean; isError: boolean } => {
            const jsons = splitConcatenatedJson(chunk);
            let result = { isCompleted: false, isError: false };
            for (const j of jsons) {
                const chunkResult = processSingleJson(j);
                if (chunkResult.isCompleted) result.isCompleted = true;
                if (chunkResult.isError) result.isError = true;
            }
            return result;
        };

        return { processChunk };
    };

    /**
     * Connect to an existing stream for a session.
     * Used for reconnecting after browser refresh or when loading chat history.
     * Returns whether the stream is completed or not.
     */
    const connectToStream = useCallback(async (sessionId: string): Promise<{ isCompleted: boolean }> => {
        // Abort any existing stream for this session
        const existingController = abortControllersRef.current.get(sessionId);
        if (existingController) {
            existingController.abort();
        }

        const abortController = new AbortController();
        abortControllersRef.current.set(sessionId, abortController);

        try {
            const streamUrl = getChatStreamUrl(sessionId);

            const response = await fetch(streamUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                signal: abortController.signal,
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            if (!response.body) {
                throw new Error('Response body is null');
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            const { processChunk } = createChunkProcessor(sessionId);

            let buffer = '';
            let streamCompleted = false;

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const parts = buffer.split('\n');
                buffer = parts.pop() || '';

                for (const p of parts) {
                    const result = processChunk(p);
                    if (result.isCompleted) streamCompleted = true;
                    if (result.isError) {
                        // Stream not found or other error - session has no active stream
                        return { isCompleted: true };
                    }
                }
            }

            // Process any remaining data in buffer
            if (buffer.trim()) {
                const result = processChunk(buffer);
                if (result.isCompleted) streamCompleted = true;
                if (result.isError) {
                    return { isCompleted: true };
                }
            }

            return { isCompleted: streamCompleted };

        } catch (error: any) {
            if (error.name !== "AbortError") {
                // Don't call onError for stream reconnection failures - just return completed
                console.error("[SSE] Stream connection error:", error.message);
            }
            return { isCompleted: true };
        } finally {
            const current = abortControllersRef.current.get(sessionId);
            if (current === abortController) {
                abortControllersRef.current.delete(sessionId);
            }
        }
    }, [onMessage]);

    /**
     * Send a new message using the two-step flow:
     * 1. POST /api/v1/maya/chat/start to create/start the chat session
     * 2. GET /api/v1/maya/chat/stream/{session_id} to receive streaming response
     */
    const sendSSEMessage = useCallback(async (payload: SSEMessagePayload) => {
        const sessionKey = payload.session_id || payload.temp_session_id;

        if (!sessionKey) {
            throw new Error("session_id or temp_session_id required");
        }

        // Abort only previous stream for THIS session
        const existingController = abortControllersRef.current.get(sessionKey);
        if (existingController) {
            existingController.abort();
        }

        const abortController = new AbortController();
        abortControllersRef.current.set(sessionKey, abortController);

        try {
            // Step 1: Call POST /api/v1/maya/chat/start to create session
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

            console.log('[SSE Handler] Sending to backend:', {
                integration_type: startPayload.integration_type,
                integration_id: startPayload.integration_id,
                content_order: startPayload.content_order,
                video_id: startPayload.video_id,
            });

            const startResponse = await startChatSession(startPayload);
            const { session_id: realSessionId, user_message_id } = startResponse.data;

            // Check if response is cached based on the message field
            const isCached = startResponse.message?.includes('(cached)') || false;
            if (isCached) {
                pendingCachedResponsesRef.current.add(realSessionId);
            }

            // If this was a new session (temp_session_id), notify about the real session ID
            if (payload.temp_session_id && realSessionId) {
                onSessionCreated(payload.temp_session_id, realSessionId);

                // Move abort controller to real session id
                const ctrl = abortControllersRef.current.get(payload.temp_session_id);
                if (ctrl) {
                    abortControllersRef.current.set(realSessionId, ctrl);
                    abortControllersRef.current.delete(payload.temp_session_id);
                }
            }

            // Send initial session info to update UI
            onMessage({
                session_id: realSessionId,
                user_message_id: user_message_id,
            });

            // Step 2: Connect to GET /api/v1/maya/chat/stream/{session_id} for streaming
            const streamUrl = getChatStreamUrl(realSessionId);

            const response = await fetch(streamUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                signal: abortController.signal,
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            if (!response.body) {
                throw new Error('Response body is null');
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            const { processChunk } = createChunkProcessor(realSessionId);

            let buffer = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const parts = buffer.split('\n');
                buffer = parts.pop() || '';

                for (const p of parts) {
                    processChunk(p);
                }
            }

            // Process any remaining data in buffer
            if (buffer.trim()) {
                processChunk(buffer);
            }

        } catch (error: any) {
            if (error.name !== "AbortError") {
                onError(sessionKey, error.message || "SSE failed");
            }
        } finally {
            const current = abortControllersRef.current.get(sessionKey);
            if (current === abortController) {
                abortControllersRef.current.delete(sessionKey);
            }
        }
    }, [onMessage, onError, onSessionCreated]);

    const cancelStream = useCallback((sessionId: string | null | undefined) => {
        if (!sessionId) return;
        const controller = abortControllersRef.current.get(sessionId);
        if (controller) {
            controller.abort();
            abortControllersRef.current.delete(sessionId);
        }
    }, []);

    return {
        sendSSEMessage,
        connectToStream,
        cancelStream,
    };
};
