import { v4 as uuidv4 } from 'uuid';

import {
    extractToolMetadataSummary,
    humanizeIdentifier,
    normalizeCarouselMetadata,
    normalizeToolMetadata,
    normalizeWhitespace,
    parseFunctionResponse,
    truncateText,
} from '@/services/stream/providerUtils';
import type { ChatHistoryEvent, HandleSSEMessageData, Session, ThinkingStep } from '@/types';

const MAX_THINKING_STEPS = 4;

export interface AssembleMessageParams {
    /** The session being updated. Must match `data.session_id` or the tempSessionId. */
    session: Session;
    /** The resolved real session ID (may differ from session.id if still a temp). */
    realSessionId: string;
    /** The SSE event data. */
    data: HandleSSEMessageData;
    /** Whether the sidebar is collapsed (drives `hasNewName` logic). */
    isSidebarCollapsed: boolean;
    /** The ID of the currently selected session (drives `hasNewMessage`). */
    currentSessionId: string | null;
}

export interface AssembleMessageResult {
    /** Updated session. May have new chat events, thinking steps, or completed state. */
    session: Session;
    /** True when `data.response_completed === true`. */
    responseCompleted: boolean;
}

/**
 * Pure function. Given a session and an SSE event, returns the updated session.
 * No React, no side effects — safe to unit test directly.
 */
export function assembleSSEMessage({
    session: s,
    realSessionId,
    data,
    isSidebarCollapsed,
    currentSessionId,
}: AssembleMessageParams): AssembleMessageResult {
    const isMatchedByTempId = s.id !== realSessionId;
    const chat = [...s.chat];
    const wasThinking = s.thinking;
    let hasStreamingUpdate = wasThinking;
    const lastEvent = chat[chat.length - 1];

    const existingSteps = s.thinkingSteps ?? [];
    let thinkingSteps: ThinkingStep[] = existingSteps;
    let stepsMutated = false;

    const ensureStepsClone = () => {
        if (!stepsMutated) {
            thinkingSteps = [...thinkingSteps];
            stepsMutated = true;
        }
    };

    const resetThinkingSteps = () => {
        thinkingSteps = [];
        stepsMutated = true;
    };

    const addThinkingStep = (step: ThinkingStep) => {
        ensureStepsClone();
        thinkingSteps = [...thinkingSteps, step];
        if (thinkingSteps.length > MAX_THINKING_STEPS) {
            thinkingSteps = thinkingSteps.slice(-MAX_THINKING_STEPS);
        }
    };

    const updateThinkingStepAtIndex = (index: number, updater: (current: ThinkingStep) => ThinkingStep) => {
        if (index < 0 || index >= thinkingSteps.length) return;
        ensureStepsClone();
        const currentStep = thinkingSteps[index];
        if (currentStep) {
            thinkingSteps[index] = updater(currentStep);
        }
    };

    const addToContentSequence = (contentType: 'koah_ads' | 'inventory' | 'agent_text' | 'videos') => {
        let agentEvent = chat
            .slice()
            .reverse()
            .find(e => e.role === 'agent');
        if (!agentEvent) {
            const previousEventId = lastEvent?.id || '';
            agentEvent = {
                id: `pending-agent-${realSessionId}`,
                message: { content: '' },
                role: 'agent',
                parent_id: previousEventId || null,
                feedback: null,
                created_at: new Date().toISOString(),
                contentSequence: [],
                isCompleted: false,
            };
            chat.push(agentEvent);
        }
        const existingSequence = agentEvent.contentSequence || [];
        if (!existingSequence.includes(contentType)) {
            const index = chat.findIndex(e => e.id === agentEvent!.id);
            const chatAtIndex = chat[index];
            if (index >= 0 && chatAtIndex) {
                chat[index] = { ...chatAtIndex, contentSequence: [...existingSequence, contentType] };
            }
        }
    };

    const newCycleTriggered =
        !wasThinking &&
        (data.type === 'function_call' ||
            data.type === 'function_response' ||
            data.type === 'message' ||
            data.function_name !== undefined ||
            data.function_response !== undefined ||
            data.agent_message_id !== undefined);

    if (newCycleTriggered) {
        resetThinkingSteps();
    }

    // --- metadata (session name) ---
    if (data.type === 'metadata' && typeof data.session_name === 'string' && data.session_name.trim()) {
        const stepId = `session-name-${realSessionId}`;
        const summary = truncateText(normalizeWhitespace(data.session_name), 80);
        const existingIndex = thinkingSteps.findIndex(step => step.id === stepId);
        const payload: ThinkingStep = {
            id: stepId,
            type: 'metadata',
            title: 'Naming conversation',
            detail: summary,
        };
        if (existingIndex >= 0) {
            updateThinkingStepAtIndex(existingIndex, current => ({ ...current, ...payload }));
        } else {
            addThinkingStep(payload);
        }
    }

    // --- koah_ads ---
    if (data.type === 'koah_ads') {
        addToContentSequence('koah_ads');
    }

    // --- tool_metadata ---
    if (data.type === 'tool_metadata' && data.tool_metadata) {
        const toolMetadataPayload = normalizeToolMetadata(data.tool_metadata);
        if (toolMetadataPayload) {
            const requestId = toolMetadataPayload._meta?.request_id;
            const toolEventId = requestId ? `tool-${requestId}` : `tool-${Date.now()}`;
            const existingIndex = chat.findIndex(event => event.id === toolEventId);
            const baseEvent: ChatHistoryEvent = (existingIndex >= 0 ? chat[existingIndex] : undefined) ?? {
                id: toolEventId,
                message: { content: '' },
                role: 'agent',
                parent_id: lastEvent?.id || null,
                feedback: null,
                created_at: new Date().toISOString(),
            };
            const updatedEvent: ChatHistoryEvent = {
                ...baseEvent,
                message: { ...baseEvent.message, content: '' },
                metadata: { ...baseEvent.metadata, toolMetadata: toolMetadataPayload },
                isCompleted: true,
                is_cached: data.is_cached,
            };
            if (existingIndex >= 0) {
                chat[existingIndex] = updatedEvent;
            } else {
                chat.push(updatedEvent);
            }
            addToContentSequence('inventory');
            const summary = extractToolMetadataSummary(toolMetadataPayload);
            if (summary) {
                addThinkingStep({
                    id: uuidv4(),
                    type: 'tool',
                    title: 'Tool results ready',
                    detail: truncateText(normalizeWhitespace(summary), 160),
                });
            }
        }
    }

    // --- function_name ---
    if (data.function_name !== undefined) {
        hasStreamingUpdate = true;
        if (typeof data.function_name === 'string' && data.function_name.trim()) {
            const functionName = data.function_name.trim();
            const existingFunctionStep = thinkingSteps.find(step => step.functionName === functionName);
            if (!existingFunctionStep && data.type === 'function_call') {
                addThinkingStep({
                    id: uuidv4(),
                    type: 'function_call',
                    title: `Calling ${humanizeIdentifier(functionName)}`,
                    functionName,
                });
            }
        }
        if (lastEvent) {
            chat[chat.length - 1] = {
                ...lastEvent,
                message: { ...lastEvent.message, function_name: data.function_name },
            };
        }
    }

    // --- function_response ---
    if (data.function_response !== undefined) {
        hasStreamingUpdate = true;
        if (lastEvent) {
            let parsedResponse: unknown = data.function_response;
            if (typeof data.function_response === 'string') {
                try {
                    parsedResponse = JSON.parse(data.function_response);
                } catch {
                    parsedResponse = data.function_response;
                }
            }
            chat[chat.length - 1] = {
                ...lastEvent,
                message: { ...lastEvent.message, function_response: parsedResponse },
            };
        }
        const responseSummary = truncateText(normalizeWhitespace(parseFunctionResponse(data.function_response)), 160);
        let targetIndex = -1;
        for (let i = thinkingSteps.length - 1; i >= 0; i--) {
            const step = thinkingSteps[i];
            if (step && (step.type === 'function_call' || step.type === 'function_response') && step.functionName) {
                targetIndex = i;
                break;
            }
        }
        if (targetIndex >= 0) {
            // Always transition the matching "Calling X" step to "X responded",
            // even when the response payload carries no human-readable detail.
            const step = thinkingSteps[targetIndex];
            const friendlyName = humanizeIdentifier(step?.functionName ?? 'Function');
            updateThinkingStepAtIndex(targetIndex, current => ({
                ...current,
                type: 'function_response',
                title: `${friendlyName} responded`,
                ...(responseSummary ? { detail: responseSummary } : {}),
            }));
        } else if (responseSummary) {
            // No prior call step found — only add a new step if there's something to show.
            addThinkingStep({
                id: uuidv4(),
                type: 'function_response',
                title: 'Function responded',
                detail: responseSummary,
            });
        }
    }

    // --- carousel_metadata ---
    if (data.carousel_metadata !== undefined) {
        const normalizedCarousel = normalizeCarouselMetadata(data.carousel_metadata);
        if (normalizedCarousel && lastEvent) {
            chat[chat.length - 1] = { ...lastEvent, carousel_metadata: normalizedCarousel };
            addToContentSequence('videos');
        }
    }

    // --- message chunks ---
    if (data.message !== undefined) {
        hasStreamingUpdate = true;
        if (lastEvent && !lastEvent.contentSequence?.includes('agent_text')) {
            addToContentSequence('agent_text');
        }
        if (typeof data.message === 'string' && data.message.trim()) {
            const chunk = normalizeWhitespace(data.message);
            const responseStepId = 'agent-response';
            const existingIndex = thinkingSteps.findIndex(step => step.id === responseStepId);
            if (existingIndex >= 0) {
                updateThinkingStepAtIndex(existingIndex, current => {
                    const base = current.detail ? `${current.detail} ${chunk}` : chunk;
                    return {
                        ...current,
                        title: 'Drafting response',
                        detail: truncateText(normalizeWhitespace(base), 160),
                    };
                });
            } else {
                addThinkingStep({
                    id: responseStepId,
                    type: 'message',
                    title: 'Drafting response',
                    detail: truncateText(chunk, 160),
                });
            }
        }
        if (data.agent_message_id) {
            const existingAgentEvent = chat.find(e => e.role === 'agent' && e.id === data.agent_message_id);
            if (existingAgentEvent) {
                const index = chat.findIndex(e => e.id === data.agent_message_id);
                chat[index] = {
                    ...existingAgentEvent,
                    message: {
                        ...existingAgentEvent.message,
                        content: (existingAgentEvent.message?.content || '') + (data.message || ''),
                    },
                    is_cached: data.is_cached || existingAgentEvent.is_cached,
                };
            } else {
                const lastAgentEvent = chat
                    .slice()
                    .reverse()
                    .find(e => e.role === 'agent' && !e.message?.content?.trim());
                if (lastAgentEvent) {
                    const index = chat.findIndex(e => e.id === lastAgentEvent.id);
                    chat[index] = {
                        ...lastAgentEvent,
                        id: data.agent_message_id,
                        message: { ...lastAgentEvent.message, content: data.message || '' },
                        is_cached: data.is_cached,
                        isCompleted: false,
                    };
                } else {
                    const previousEventId = lastEvent?.id || '';
                    chat.push({
                        id: data.agent_message_id,
                        message: { content: data.message || '' },
                        role: 'agent',
                        parent_id: previousEventId || null,
                        feedback: null,
                        created_at: new Date().toISOString(),
                        is_cached: data.is_cached,
                        isCompleted: false,
                    });
                }
            }
        } else {
            const lastAgentEvent = chat
                .slice()
                .reverse()
                .find(e => e.role === 'agent');
            if (lastAgentEvent) {
                const index = chat.findIndex(e => e.id === lastAgentEvent.id);
                chat[index] = {
                    ...lastAgentEvent,
                    message: {
                        ...lastAgentEvent.message,
                        content: (lastAgentEvent.message?.content || '') + (data.message || ''),
                    },
                    is_cached: data.is_cached || lastAgentEvent.is_cached,
                };
            } else {
                const previousEventId = lastEvent?.id || '';
                chat.push({
                    id: `agent-${Date.now()}`,
                    message: { content: data.message || '' },
                    role: 'agent',
                    parent_id: previousEventId || null,
                    feedback: null,
                    created_at: new Date().toISOString(),
                    is_cached: data.is_cached,
                    isCompleted: false,
                });
            }
        }
    }

    // --- agent_message_id without message (placeholder event) ---
    if (data.agent_message_id !== undefined && data.message === undefined) {
        if (wasThinking) {
            hasStreamingUpdate = true;
        }
        const existingAgentEvent = chat.find(e => e.role === 'agent' && e.id === data.agent_message_id);
        if (!existingAgentEvent) {
            const lastTempAgentEvent = chat
                .slice()
                .reverse()
                .find(e => e.role === 'agent' && e.id.startsWith('agent-'));
            if (lastTempAgentEvent) {
                const index = chat.findIndex(e => e.id === lastTempAgentEvent.id);
                chat[index] = { ...lastTempAgentEvent, id: data.agent_message_id };
            } else {
                const lastAgentEvent = chat
                    .slice()
                    .reverse()
                    .find(e => e.role === 'agent');
                if (!lastAgentEvent) {
                    const lastChatEvent = chat[chat.length - 1];
                    chat.push({
                        id: data.agent_message_id,
                        message: { content: '' },
                        role: 'agent',
                        parent_id: lastChatEvent?.id || null,
                        feedback: null,
                        created_at: new Date().toISOString(),
                        isCompleted: false,
                    });
                }
            }
        }
    }

    const sessionNameUpdated =
        data.session_name !== undefined && data.session_name !== null && data.session_name !== s.name;

    const responseCompleted = data.response_completed === true;

    if (responseCompleted) {
        const lastChatEvent = chat[chat.length - 1];
        if (lastChatEvent && lastChatEvent.role === 'agent') {
            chat[chat.length - 1] = { ...lastChatEvent, isCompleted: true };
        }
    }

    let thinking = s.thinking;
    if (responseCompleted) {
        thinking = false;
    } else if (hasStreamingUpdate) {
        thinking = true;
    }

    return {
        session: {
            ...s,
            id: isMatchedByTempId ? realSessionId : s.id,
            chat,
            updatedAt: responseCompleted ? new Date().toISOString() : s.updatedAt,
            name: sessionNameUpdated && data.session_name ? data.session_name : s.name,
            hasNewName: sessionNameUpdated ? isSidebarCollapsed : s.hasNewName,
            thinking,
            hasNewMessage: currentSessionId !== realSessionId,
            thinkingSteps: thinking ? thinkingSteps : [],
        },
        responseCompleted,
    };
}
