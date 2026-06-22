import { useCallback, useEffect, useState } from 'react';

import { getSuggestedPrompts, getVideoSuggestedPrompts } from '@/services/api';
import type { CachedResponseItem } from '@/services/apiTypes';

interface UseSuggestedPromptsParams {
    brandId: number;
    currentAgent: string;
    currentSessionId: string | null;
    enteredInChatMode: boolean;
    videoId?: string;
    onSuggestedPromptsFetched?: () => void;
}

export interface UseSuggestedPromptsResult {
    suggestedPrompts: string[];
    isLoadingSuggestedPrompts: boolean;
    cachedPromptResponses: Map<string, CachedResponseItem[]>;
    fetchSuggestedPrompts: (agentId: string, params?: { user_query: string; agent_response: string }) => Promise<void>;
}

/** Manages fetching and caching of suggested prompts. */
export function useSuggestedPrompts({
    brandId,
    currentAgent,
    currentSessionId,
    enteredInChatMode,
    videoId,
    onSuggestedPromptsFetched,
}: UseSuggestedPromptsParams): UseSuggestedPromptsResult {
    const [suggestedPrompts, setSuggestedPrompts] = useState<string[]>([]);
    const [isLoadingSuggestedPrompts, setIsLoadingSuggestedPrompts] = useState(false);
    const [cachedPromptResponses, setCachedPromptResponses] = useState<Map<string, CachedResponseItem[]>>(new Map());

    // Auto-fetch when agent changes or session is cleared
    useEffect(() => {
        if (!currentAgent || !enteredInChatMode || currentSessionId) return;

        let isCancelled = false;

        const fetchPrompts = async () => {
            setSuggestedPrompts([]);
            setIsLoadingSuggestedPrompts(true);
            setCachedPromptResponses(new Map());

            let prompts: string[] | null = null;

            if (videoId) {
                try {
                    const response = await getVideoSuggestedPrompts({
                        video_id: videoId,
                        includeCarouselMetadata: false,
                        includeAgentResponse: true,
                    });

                    const cachedMap = new Map<string, CachedResponseItem[]>();
                    const videoPrompts = (response?.data || [])
                        .map(item => {
                            if (item.response && Array.isArray(item.response) && item.response.length > 0) {
                                cachedMap.set(item.prompt, item.response);
                            }
                            return item.prompt;
                        })
                        .filter((p): p is string => typeof p === 'string' && p.length > 0);

                    if (videoPrompts.length > 0) {
                        const randomIndex = Math.floor(Math.random() * videoPrompts.length);
                        const randomPrompt = videoPrompts[randomIndex];
                        const ordered = randomPrompt
                            ? [randomPrompt, ...videoPrompts.filter((_, i) => i !== randomIndex)]
                            : videoPrompts;
                        prompts = ordered;
                        setCachedPromptResponses(cachedMap);
                    } else {
                        prompts = [];
                    }
                } catch {
                    // Fall through to agent prompts
                }
            }

            if (prompts === null) {
                try {
                    const response = await getSuggestedPrompts(currentAgent);
                    const agentPrompts = response.data?.prompts ?? [];
                    if (agentPrompts.length > 0) {
                        const randomIndex = Math.floor(Math.random() * agentPrompts.length);
                        const randomPrompt = agentPrompts[randomIndex];
                        prompts = randomPrompt
                            ? [randomPrompt, ...agentPrompts.filter((_: string, i: number) => i !== randomIndex)]
                            : agentPrompts;
                    } else {
                        prompts = [];
                    }
                } catch {
                    prompts = [];
                }
            }

            if (!isCancelled) {
                setSuggestedPrompts(prompts ?? []);
                setIsLoadingSuggestedPrompts(false);
                onSuggestedPromptsFetched?.();
            }
        };

        void fetchPrompts();
        return () => {
            isCancelled = true;
        };
    }, [brandId, currentAgent, currentSessionId, enteredInChatMode, videoId]);

    const fetchSuggestedPrompts = useCallback(
        async (agentId: string, params?: { user_query: string; agent_response: string }) => {
            if (!agentId) return;
            setIsLoadingSuggestedPrompts(true);
            try {
                const response = await getSuggestedPrompts(agentId, params);
                if (response.data?.prompts) {
                    setSuggestedPrompts(response.data.prompts);
                }
            } catch {
                setSuggestedPrompts([]);
            } finally {
                setIsLoadingSuggestedPrompts(false);
                onSuggestedPromptsFetched?.();
            }
        },
        [onSuggestedPromptsFetched]
    );

    return { suggestedPrompts, isLoadingSuggestedPrompts, cachedPromptResponses, fetchSuggestedPrompts };
}
