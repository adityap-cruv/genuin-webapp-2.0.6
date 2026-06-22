import { useCallback } from 'react';
import type React from 'react';

import type { CachedResponseItem } from '@/services/apiTypes';
import { convertCachedResponseToEvents } from '@/services/session/CachedResponseConverter';
import type { Session } from '@/types';

interface UseCachedResponsePlayerParams {
    setSessions: React.Dispatch<React.SetStateAction<Session[]>>;
}

export interface UseCachedResponsePlayerResult {
    playCachedResponse: (sessionId: string, cachedItems: CachedResponseItem[], prompt: string) => void;
}

/**
 * Injects a pre-fetched prompt response into the session as synthetic chat events,
 * bypassing the SSE stream entirely.
 */
export function useCachedResponsePlayer({
    setSessions,
}: UseCachedResponsePlayerParams): UseCachedResponsePlayerResult {
    const playCachedResponse = useCallback(
        (sessionId: string, cachedItems: CachedResponseItem[], prompt: string) => {
            const { agentEvent, sessionName } = convertCachedResponseToEvents(cachedItems);

            setSessions(prev =>
                prev.map(s => {
                    if (s.id !== sessionId) return s;

                    const userEvent = {
                        id: `${Date.now()}-user`,
                        message: { content: prompt },
                        role: 'user' as const,
                        parent_id: null,
                        feedback: null,
                        created_at: new Date().toISOString(),
                        artifacts: [],
                        isCompleted: true,
                    };

                    return {
                        ...s,
                        chat: [...s.chat, userEvent, agentEvent],
                        thinking: false,
                        status: 'fetched' as const,
                        ...(sessionName ? { name: sessionName, hasNewName: true } : {}),
                    };
                })
            );
        },
        [setSessions]
    );

    return { playCachedResponse };
}
