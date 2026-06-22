import { useEffect, useRef } from 'react';

import { useAgentContext } from '@/stores/agent/context';
import { useSessionContext } from '@/stores/session/context';
import { useUIContext } from '@/stores/ui/context';
import { useInputContext } from '@/stores/input/context';
import { useRudderEvents } from '@/adapters/analytics/useRudderAnalytics';

import PresetPromptsSkeleton from './skeleton';

const PresetPrompts = ({
    setIsSuggestionsOpen,
    onClose,
}: {
    setIsSuggestionsOpen: (isSuggestionsOpen: boolean) => void;
    onClose?: () => void;
}) => {
    const { enteredInChatMode, ipInfo } = useSessionContext();
    const { currentAgent } = useAgentContext();
    const { showAllObjectives, textAreaRef, suggestedPrompts, isLoadingSuggestedPrompts } = useUIContext();
    const { track } = useRudderEvents();
    const { setInput } = useInputContext();
    const suggestionsRef = useRef<HTMLDivElement>(null);

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

    const focusInput = () => {
        if (textAreaRef) {
            textAreaRef.focus();
        }
    };

    const trackEvent = (prompt: string) => {
        if (ipInfo) {
            const payload = {
                ipInfo,
                prompt,
                agent_id: currentAgent,
            };
            track('genai:suggested_prompt', payload);
        }
    };

    if (isLoadingSuggestedPrompts) {
        return (
            <div
                ref={suggestionsRef}
                className={`gai:absolute gai:right-0 gai:z-21 ${showAllObjectives ? 'gai:top-full gai:bottom-auto gai:mt-3' : 'gai:bottom-full gai:mb-3'} gai:left-0 ${enteredInChatMode ? 'gai:bg-utility-white' : 'gai:bg-primary-50'}`}
            >
                <PresetPromptsSkeleton />
            </div>
        );
    }

    if (suggestedPrompts.length === 0) {
        return null;
    }

    return (
        <div
            ref={suggestionsRef}
            className={`gai:absolute gai:right-0 gai:z-21 ${showAllObjectives ? 'gai:top-full gai:bottom-auto gai:mt-3' : 'gai:bottom-full gai:mb-3'} gai:left-0 ${enteredInChatMode ? 'gai:bg-utility-white' : 'gai:bg-primary-50'}`}
        >
            {suggestedPrompts.map((prompt, index) => (
                <div
                    key={index}
                    className={`gai:cursor-pointer gai:border-b gai:border-b-secondary-gray-150 gai:px-4 gai:py-3 gai:font-body-1-med gai:text-secondary-gray-700 gai:first:rounded-t-xl gai:last:rounded-b-xl gai:last:border-b-0 ${enteredInChatMode ? 'gai:hover:bg-primary-50' : 'gai:hover:bg-primary-100'}`}
                    onClick={() => {
                        trackEvent(prompt);
                        setInput(prompt);
                        setIsSuggestionsOpen(true);
                        focusInput();
                        onClose?.();
                    }}
                >
                    {prompt}
                </div>
            ))}
        </div>
    );
};

export default PresetPrompts;
