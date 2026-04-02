import { useEffect, useRef } from 'react';
import { useAgentsContext } from '@/context/app/context';
import { useInputContext } from '@/context/input/context';
import { useOctoAnalytics } from '@/context/analytics';
import { useRudderEvents } from '@/services/analytics/useRudderAnalytics';
import PresetPromptsSkeleton from '../MessageInput/PresetPrompts/skeleton';

interface WebSDKPresetPromptsProps {
    setIsSuggestionsOpen: (isSuggestionsOpen: boolean) => void;
    onClose?: () => void;
}

export function WebSDKPresetPrompts({ setIsSuggestionsOpen, onClose }: WebSDKPresetPromptsProps) {
    const { enteredInChatMode, showAllObjectives, textAreaRef, ipInfo, currentAgent, suggestedPrompts, isLoadingSuggestedPrompts } =
        useAgentsContext();
    const { setInput } = useInputContext();
    const { analytics } = useOctoAnalytics();
    const { track } = useRudderEvents();
    const suggestionsRef = useRef<HTMLDivElement>(null);
    const hasTrackedOpenRef = useRef(false);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
                onClose?.();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [onClose]);

    // Track preset prompts opened
    useEffect(() => {
        if (!hasTrackedOpenRef.current && suggestedPrompts.length > 0 && !isLoadingSuggestedPrompts) {
            analytics.trackPresetPromptOpened({
                prompt_count: suggestedPrompts.length,
            });
            hasTrackedOpenRef.current = true;
        }
    }, [suggestedPrompts, isLoadingSuggestedPrompts, analytics]);

    const focusInput = () => {
        if (textAreaRef) {
            textAreaRef.focus();
        }
    };

    const trackEvent = (prompt: string) => {
        if (!ipInfo) return;

        const payload = {
            ipInfo,
            prompt,
            agent_id: currentAgent,
        };
        track('genai:suggested_prompt', payload);
    };

    const containerClasses = `gai:absolute gai:z-21 gai:right-0 ${showAllObjectives ? 'gai:top-full gai:bottom-auto gai:mt-3' : 'gai:bottom-full gai:mb-3'} gai:left-0 ${enteredInChatMode ? 'gai:bg-utility-white' : 'gai:bg-primary-50'}`;
    const itemClasses = `gai:cursor-pointer gai:border-b gai:border-b-secondary-gray-150 gai:px-4 gai:py-3 gai:font-body-1-med gai:text-secondary-gray-700 gai:last:border-b-0 gai:first:rounded-t-xl gai:last:rounded-b-xl ${enteredInChatMode ? 'gai:hover:bg-primary-50' : 'gai:hover:bg-primary-100'}`;

    if (isLoadingSuggestedPrompts) {
        return (
            <div ref={suggestionsRef} className={containerClasses}>
                <PresetPromptsSkeleton />
            </div>
        );
    }

    if (suggestedPrompts.length === 0) {
        return null;
    }

    return (
        <div ref={suggestionsRef} className={containerClasses}>
            <div className="gai:px-4 gai:pt-3 gai:pb-2 gai:font-body-1-bold gai:text-secondary-gray-800">
                Suggested prompts
            </div>
            {suggestedPrompts.map((prompt, index) => (
                <div
                    key={index}
                    className={itemClasses}
                    onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        trackEvent(prompt);

                        // Track preset prompt selected
                        analytics.trackPresetPromptSelected({
                            prompt,
                            position: index,
                            total_prompts: suggestedPrompts.length,
                        });

                        setInput(prompt);
                        focusInput();
                        setIsSuggestionsOpen(true);
                        onClose?.();
                    }}
                >
                    {prompt}
                </div>
            ))}
        </div>
    );
}
