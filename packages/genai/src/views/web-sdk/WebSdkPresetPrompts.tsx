import { useEffect, useRef } from 'react';

import { useOctoAnalytics } from '@/adapters/analytics/hooks';
import { useRudderEvents } from '@/adapters/analytics/useRudderAnalytics';
import PresetPromptsSkeleton from '@/components/MessageInput/PresetPrompts/skeleton';
import { useAgentContext } from '@/stores/agent/context';
import { useInputContext } from '@/stores/input/context';
import { useSessionContext } from '@/stores/session/context';
import { useUIContext } from '@/stores/ui/context';
import { cn } from '@/utils/cn';

interface WebSdkPresetPromptsProps {
    setIsSuggestionsOpen: (isSuggestionsOpen: boolean) => void;
    onClose?: () => void;
}

export function WebSdkPresetPrompts({ setIsSuggestionsOpen, onClose }: WebSdkPresetPromptsProps) {
    const { ipInfo } = useSessionContext();
    const { currentAgent } = useAgentContext();
    const { showAllObjectives, textAreaRef, suggestedPrompts, isLoadingSuggestedPrompts } = useUIContext();
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

    // Opens flush against the composer so it reads as an extension of the input, not a detached
    // card: the edge touching the input loses its rounding + border, and the shadow lifts away
    // from the input. `showAllObjectives` flips the panel below the input instead of above it.
    const opensBelow = showAllObjectives;
    const containerClasses = cn(
        'gai:absolute gai:right-0 gai:left-0 gai:z-21 gai:overflow-hidden gai:bg-utility-white',
        'gai:border gai:border-secondary-gray-150 gai:animate-fade-in',
        opensBelow
            ? 'gai:top-full gai:origin-top gai:rounded-b-2xl gai:border-t-0 gai:shadow-[0_12px_28px_-8px_rgba(16,24,40,0.16)]'
            : 'gai:bottom-full gai:origin-bottom gai:rounded-t-2xl gai:border-b-0 gai:shadow-[0_-12px_28px_-8px_rgba(16,24,40,0.16)]'
    );
    const itemClasses =
        'gai:flex gai:cursor-pointer gai:items-center gai:px-4 gai:py-2.5 gai:font-body-1-med gai:text-secondary-gray-700 gai:transition-colors gai:hover:bg-primary-50';

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
            <div className='gai:px-4 gai:pt-3 gai:pb-1.5 gai:text-[11px] gai:font-semibold gai:tracking-wide gai:text-secondary-gray-500 gai:uppercase'>
                Suggested prompts
            </div>
            <div className='gai:max-h-[40vh] gai:overflow-y-auto gai:pb-1.5'>
                {suggestedPrompts.map((prompt, index) => (
                    <div
                        key={index}
                        className={itemClasses}
                        onMouseDown={e => {
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
        </div>
    );
}
