import { useEffect, useRef, useState } from 'react';
import { WebSDKInput } from './WebSDKInput';
import { useAgentsContext } from '@/context/app/context';
import { useInputContext } from '@/context/input/context';
import Chat from '../Chat';
import { Skeleton } from '../ui/skeleton';

export function WebSDKContent() {
    const {
        agents,
        currentAgent,
        currentSessionId,
        sessions,
        setCurrentAgent,
        setEnteteredInChatMode,
        enteredInChatMode,
        suggestedPrompts,
        handleSendMessage,
        isLoadingSuggestedPrompts,
        textAreaRef,
        setIsSuggestionsOpen,
    } = useAgentsContext();
    const { setInput } = useInputContext();

    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [hasSetInitialAgent, setHasSetInitialAgent] = useState(false);
    const [showDummyMessage, setShowDummyMessage] = useState(false);
    const [countdown, setCountdown] = useState<number | null>(null);
    const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const [showPresetPrompts, setShowPresetPrompts] = useState(false);

    // Handle click on auto-prompt message - cancel countdown and copy to input
    const handleAutoPromptClick = () => {
        if (suggestedPrompts.length === 0) return;

        const firstPrompt = suggestedPrompts[0];

        // Cancel countdown
        if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current);
            countdownIntervalRef.current = null;
        }
        setCountdown(null);

        // Hide dummy message
        setShowDummyMessage(false);

        // Show preset prompts dropdown once user interacts with auto prompt
        setShowPresetPrompts(true);
        setIsSuggestionsOpen(true);

        // Copy message to input
        setInput(firstPrompt);

        // Focus the textarea
        if (textAreaRef) {
            textAreaRef.focus();
        }
    };

    const handleClosePresetPrompts = () => {
        setShowPresetPrompts(false);
        setIsSuggestionsOpen(false);
    };

    // Ensure chat mode is enabled for web-sdk and select first agent on initial load
    useEffect(() => {
        if (agents.length > 0 && !hasSetInitialAgent && agents[0]) {
            // Set to first agent for web-sdk (overriding any default from provider)
            setCurrentAgent(agents[0].id);
            setHasSetInitialAgent(true);
            // Set chat mode enabled at the same time to avoid triggering double fetch
            setEnteteredInChatMode(true);
        }
    }, [agents, hasSetInitialAgent, setCurrentAgent, setEnteteredInChatMode]);

    // Auto-prompt feature: show dummy message and start countdown
    useEffect(() => {
        // Only trigger if there's no session and we have prompts
        if (!currentSessionId && suggestedPrompts.length > 0) {
            const firstPrompt = suggestedPrompts[0];
            setShowDummyMessage(true);
            setCountdown(5);
            setShowPresetPrompts(false);
            setIsSuggestionsOpen(false);

            // Start countdown timer
            let timeLeft = 5;
            countdownIntervalRef.current = setInterval(() => {
                timeLeft -= 1;
                setCountdown(timeLeft);

                if (timeLeft <= 0) {
                    if (countdownIntervalRef.current) {
                        clearInterval(countdownIntervalRef.current);
                        countdownIntervalRef.current = null;
                    }
                    // Auto-send the message
                    setShowDummyMessage(false);
                    handleSendMessage({
                        targetSessionId: null,
                        messageInput: firstPrompt,
                        onMessageQueued: () => {
                            setCountdown(null);
                        },
                    });
                }
            }, 1000);
        } else {
            // Clear dummy message if session exists
            setShowDummyMessage(false);
            setCountdown(null);
            setShowPresetPrompts(false);
            setIsSuggestionsOpen(false);
            if (countdownIntervalRef.current) {
                clearInterval(countdownIntervalRef.current);
                countdownIntervalRef.current = null;
            }
        }

        // Cleanup interval on unmount
        return () => {
            if (countdownIntervalRef.current) {
                clearInterval(countdownIntervalRef.current);
                countdownIntervalRef.current = null;
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentSessionId, suggestedPrompts]);

    // Auto-scroll to the bottom when new messages arrive
    useEffect(() => {
        if (!scrollContainerRef.current) {
            return;
        }

        const container = scrollContainerRef.current;
        const currentSession = sessions.find(session => session.id === currentSessionId);
        const chatLength = currentSession?.chat?.length ?? 0;

        if (chatLength === 0) {
            return;
        }

        container.scrollTop = container.scrollHeight;
    }, [sessions, currentSessionId]);

    // Always use white background for web-sdk view
    const backgroundClass = 'gai:bg-utility-white';
    const currentSession = sessions.find(session => session.id === currentSessionId);

    // Show loader when: no session AND (loading prompts OR haven't shown dummy message yet)
    const shouldShowLoader = !currentSessionId && (isLoadingSuggestedPrompts || (!showDummyMessage && suggestedPrompts.length === 0));

    return (
        <div className={`gai:flex gai:h-full gai:flex-col ${backgroundClass}`}>
            <div ref={scrollContainerRef} className='gai:flex gai:flex-1 gai:overflow-y-auto gai:px-4 gai:py-6'>
                <div className='gai:mx-auto gai:flex gai:min-h-full gai:w-full gai:justify-center'>
                    {currentSession ? (
                        <Chat />
                    ) : shouldShowLoader ? (
                        <div className='gai:mx-auto gai:flex gai:w-full gai:flex-col gai:gap-6 gai:pb-6'>
                            {/* Shimmer user message while loading */}
                            <div className='gai:flex gai:w-full gai:justify-end'>
                                <div className='gai:flex gai:w-[80%] gai:flex-col gai:items-end gai:gap-2'>
                                    <div className='gai:flex gai:w-full gai:max-w-[80%] gai:flex-col gai:gap-2 gai:rounded-3xl gai:rounded-br-none gai:bg-primary-50 gai:px-4 gai:py-3'>
                                        <Skeleton className='gai:h-4 gai:w-full gai:max-w-[16rem] gai:bg-primary-200' />
                                        <Skeleton className='gai:h-4 gai:w-3/4 gai:bg-primary-200' />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : showDummyMessage && suggestedPrompts.length > 0 ? (
                        <div className='gai:mx-auto gai:flex gai:w-full gai:flex-col gai:gap-6 gai:pb-6'>
                            {/* Dummy user message - clickable to copy to input */}
                            <div className='gai:flex gai:w-full gai:justify-end'>
                                <div className='gai:flex gai:w-[80%] gai:flex-col gai:items-end gai:gap-2'>
                                    <div
                                        className='gai:max-w-[80%] gai:cursor-pointer gai:rounded-3xl gai:rounded-br-none gai:bg-primary-50 gai:px-4 gai:py-3 gai:font-body-1-med gai:text-secondary-gray-900 gai:transition-colors hover:gai:bg-primary-100'
                                        onClick={handleAutoPromptClick}
                                    >
                                        {suggestedPrompts[0]}
                                    </div>
                                    {/* Countdown timer - blue badge with white background for number */}
                                    {countdown !== null && countdown > 0 && (
                                        <div className='gai:flex gai:items-center gai:gap-1.5 gai:px-1'>
                                            <div className='gai:flex gai:h-4 gai:w-4 gai:items-center gai:justify-center gai:rounded-full gai:bg-primary-500'>
                                                <span className='gai:text-[10px] gai:font-bold gai:leading-none gai:text-white'>
                                                    {countdown}
                                                </span>
                                            </div>
                                            <span className='gai:text-[10px] gai:text-secondary-gray-500'>
                                                Auto-sending...
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className='gai:flex gai:w-full gai:items-center gai:justify-center' />
                    )}
                </div>
            </div>
            <div className={`${shouldShowLoader ? 'gai:bg-transparent' : 'gai:bg-white'} gai:px-4 gai:py-4`}>
                <div className='gai:mx-auto gai:w-full'>
                    <WebSDKInput
                        hideBackground={shouldShowLoader}
                        showPresetPrompts={showPresetPrompts}
                        onClosePresetPrompts={handleClosePresetPrompts}
                        setIsSuggestionsOpen={setIsSuggestionsOpen}
                    />
                </div>
            </div>
        </div>
    );
}
