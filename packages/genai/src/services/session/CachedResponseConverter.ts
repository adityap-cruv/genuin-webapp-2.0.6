import type { CachedResponseItem } from '@/services/apiTypes';
import { normalizeCarouselMetadata, normalizeToolMetadata } from '@/services/stream/providerUtils';
import type { CarousalMetadata, ChatHistoryEvent, ToolMetadataPayload } from '@/types';

export interface ConvertCachedResponseResult {
    agentEvent: ChatHistoryEvent;
    sessionName: string | null;
}

/**
 * Converts a cached-response array (pre-computed suggested prompt reply)
 * into a single `ChatHistoryEvent` ready to insert into session chat.
 * Pure function — no React, no side effects.
 */
export function convertCachedResponseToEvents(cachedResponse: CachedResponseItem[]): ConvertCachedResponseResult {
    let agentMessageContent = '';
    let carouselMetadata: CarousalMetadata | null = null;
    let toolMetadata: ToolMetadataPayload | null = null;
    let sessionName: string | null = null;

    for (const item of cachedResponse) {
        if (item.type === 'metadata' && item.session_name) {
            sessionName = item.session_name;
        } else if (item.type === 'message' && item.message) {
            agentMessageContent = item.message;
        } else if (item.type === 'carousel_metadata' && item.carousel_metadata !== undefined) {
            carouselMetadata = normalizeCarouselMetadata(item.carousel_metadata);
        } else if (item.type === 'tool_metadata' && item.tool_metadata !== undefined) {
            toolMetadata = normalizeToolMetadata(item.tool_metadata) ?? null;
        }
    }

    const contentSequence: ChatHistoryEvent['contentSequence'] = ['koah_ads'];
    if (agentMessageContent) contentSequence.push('agent_text');
    if (toolMetadata) contentSequence.push('inventory');
    if (carouselMetadata) contentSequence.push('videos');

    const agentEvent: ChatHistoryEvent = {
        id: `agent-${Date.now()}`,
        message: { content: agentMessageContent },
        role: 'agent',
        is_cached: true,
        isCompleted: true,
        carousel_metadata: carouselMetadata ?? undefined,
        metadata: toolMetadata ? { toolMetadata } : undefined,
        parent_id: '',
        feedback: null,
        created_at: new Date().toISOString(),
        contentSequence,
    };

    return { agentEvent, sessionName };
}
