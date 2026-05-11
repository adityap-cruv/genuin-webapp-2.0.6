import type { ChatHistoryItem } from '@/lib/apiTypes';
import type { CarousalMetadata, ChatHistoryEvent } from '@/types';

/**
 * Parses agent message which comes as a JSON string from the API
 * Returns the parsed message object with content, function_name, and function_response
 */
function parseAgentMessage(message: string): {
    content: string;
    function_name?: string | null;
    function_response?: any | null;
    carousel_metadata?: CarousalMetadata | null;
} {
    try {
        const parsed = JSON.parse(message);
        return {
            content: parsed.content || '',
            function_name: parsed.function_name || null,
            function_response: parsed.function_response || null,
            carousel_metadata: parsed.carousel_metadata || null,
        };
    } catch {
        // If parsing fails, treat the message as plain text content
        return { content: message };
    }
}

/**
 * Converts the new V2 linear chat history format to ChatHistoryEvent[]
 * Creates separate events for user and agent messages (not paired)
 */
export function convertChatHistoryV2ToEvents(history: ChatHistoryItem[]): ChatHistoryEvent[] {
    const events: ChatHistoryEvent[] = [];
    let previousEventId: string | null = null;

    for (const item of history) {
        // Use empty string for first message instead of null so it passes the parent_id !== null check in Chat component
        const parentId = previousEventId !== null ? previousEventId : '';

        if (item.author === 'user') {
            // Create a separate event for user message
            events.push({
                id: item.id,
                message: { content: item.message },
                role: 'user',
                parent_id: parentId,
                feedback: null,
                created_at: item.timestamp,
                isCompleted: true,
            });
            previousEventId = item.id;
        } else if (item.author === 'agent') {
            // Parse agent message JSON string to extract content, function_name, function_response
            const parsedMessage = parseAgentMessage(item.message);
            console.log('parsedMessage', parsedMessage);
            console.log('parsedMessage.carousel_metadata', parsedMessage.carousel_metadata);
            // Create a separate event for agent message
            const agentEvent: ChatHistoryEvent = {
                id: item.id,
                message: parsedMessage,
                role: 'agent',
                parent_id: parentId,
                feedback: null,
                created_at: item.timestamp,
                isCompleted: true,
            };

            // Add carousel_metadata if kws is present
            if (parsedMessage.carousel_metadata) {
                agentEvent.carousel_metadata = {
                    keywords: parsedMessage.carousel_metadata.keywords,
                    brand_ids: parsedMessage.carousel_metadata.brand_ids,
                    cta: parsedMessage.carousel_metadata.cta,
                    url: parsedMessage.carousel_metadata.url,
                    h1: parsedMessage.carousel_metadata.h1,
                    h2: parsedMessage.carousel_metadata.h2,
                    video_ids: parsedMessage.carousel_metadata.video_ids,
                };
            }

            events.push(agentEvent);
            previousEventId = item.id;
        }
    }

    return events;
}
