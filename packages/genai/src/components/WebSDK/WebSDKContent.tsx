import { useEffect, useRef, useState } from 'react';
import { WebSDKInput } from './WebSDKInput';
import { useAgentsContext } from '@/context/app/context';
import { useInputContext } from '@/context/input/context';
import Chat from '../Chat';
import { Skeleton } from '../ui/skeleton';
import { getCachedRemoteLottie, loadRemoteLottie } from '@/lib/lottie/load-remote-lottie';

const OCTO_IDLE_ANIMATION_PATH = 'sleeping/animations/51914e32-e62c-43d5-b17d-50369bbbf7d6.json';
const OCTO_IDLE_IMAGES_PATH = 'sleeping/';

export function WebSDKContent() {
    const {
        agents,
        currentSessionId,
        sessions,
        setCurrentAgent,
        setEnteteredInChatMode,
        suggestedPrompts,
        handleSendMessage,
        isLoadingSuggestedPrompts,
        textAreaRef,
        setIsSuggestionsOpen,
        webSdkRenderMode,
        setWebSdkRenderMode,
        parentOctoPanelId,
    } = useAgentsContext();
    const { setInput } = useInputContext();

    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [hasSetInitialAgent, setHasSetInitialAgent] = useState(false);
    const [showDummyMessage, setShowDummyMessage] = useState(false);
    const [countdown, setCountdown] = useState<number | null>(null);
    const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const expandRequestedMessageRef = useRef<string | null>(null);
    const [showPresetPrompts, setShowPresetPrompts] = useState(false);
    const [compactOctoLottie, setCompactOctoLottie] = useState<object | null>(() =>
        getCachedRemoteLottie(OCTO_IDLE_ANIMATION_PATH, OCTO_IDLE_IMAGES_PATH)
    );
    const [compactLottieError, setCompactLottieError] = useState(false);

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

        // Dispatch event to deactivate countdown state
        if (parentOctoPanelId && webSdkRenderMode === 'compact') {
            console.log('[WebSDKContent] User clicked auto-prompt, dispatching countdown inactive event', {
                parentOctoPanelId,
                isActive: false,
            });
            window.dispatchEvent(
                new CustomEvent('genai:webSdkCountdownActive', {
                    detail: {
                        parentOctoPanelId,
                        isActive: false,
                    },
                })
            );
        }

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

    const handleCompactPromptSend = () => {
        if (suggestedPrompts.length === 0) return;

        const firstPrompt = suggestedPrompts[0];

        if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current);
            countdownIntervalRef.current = null;
        }

        setCountdown(null);
        setShowDummyMessage(false);

        // Dispatch event to deactivate countdown state
        if (parentOctoPanelId && webSdkRenderMode === 'compact') {
            console.log('[WebSDKContent] User sent compact prompt, dispatching countdown inactive event', {
                parentOctoPanelId,
                isActive: false,
            });
            window.dispatchEvent(
                new CustomEvent('genai:webSdkCountdownActive', {
                    detail: {
                        parentOctoPanelId,
                        isActive: false,
                    },
                })
            );
        }

        handleSendMessage({
            targetSessionId: currentSessionId,
            messageInput: firstPrompt,
            onMessageQueued: () => {
                setCountdown(null);
            },
        });
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

            // Dispatch event to transition to default-active state when countdown starts
            if (parentOctoPanelId && webSdkRenderMode === 'compact') {
                console.log('[WebSDKContent] Dispatching countdown active event', {
                    parentOctoPanelId,
                    isActive: true,
                });
                window.dispatchEvent(
                    new CustomEvent('genai:webSdkCountdownActive', {
                        detail: {
                            parentOctoPanelId,
                            isActive: true,
                        },
                    })
                );
            }

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

            // Dispatch event to deactivate countdown state
            if (parentOctoPanelId && webSdkRenderMode === 'compact') {
                console.log('[WebSDKContent] Dispatching countdown inactive event', {
                    parentOctoPanelId,
                    isActive: false,
                });
                window.dispatchEvent(
                    new CustomEvent('genai:webSdkCountdownActive', {
                        detail: {
                            parentOctoPanelId,
                            isActive: false,
                        },
                    })
                );
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
    }, [currentSessionId, suggestedPrompts, parentOctoPanelId, webSdkRenderMode]);

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

    useEffect(() => {
        let cancelled = false;

        if (!compactOctoLottie && !compactLottieError) {
            loadRemoteLottie(OCTO_IDLE_ANIMATION_PATH, OCTO_IDLE_IMAGES_PATH)
                .then(data => {
                    if (!cancelled) {
                        setCompactOctoLottie(data);
                    }
                })
                .catch(() => {
                    if (!cancelled) {
                        setCompactLottieError(true);
                    }
                });
        }

        return () => {
            cancelled = true;
        };
    }, [compactOctoLottie, compactLottieError]);

    useEffect(() => {
        if (!currentSessionId) {
            expandRequestedMessageRef.current = null;
            return;
        }

        const currentSession = sessions.find(session => session.id === currentSessionId);
        if (!currentSession) {
            expandRequestedMessageRef.current = null;
            return;
        }

        const latestAgentMessage = [...(currentSession.chat || [])]
            .reverse()
            .find(event => event.role === 'agent' && event.message?.content?.trim());

        if (!latestAgentMessage) {
            expandRequestedMessageRef.current = null;
            return;
        }

        const latestAgentMessageId = latestAgentMessage.id ?? null;

        if (webSdkRenderMode !== 'compact') {
            expandRequestedMessageRef.current = latestAgentMessageId;
            return;
        }

        if (!latestAgentMessageId || expandRequestedMessageRef.current === latestAgentMessageId) {
            return;
        }

        expandRequestedMessageRef.current = latestAgentMessageId;

        setWebSdkRenderMode('full');

        if (parentOctoPanelId) {
            window.dispatchEvent(
                new CustomEvent('genai:webSdkRequestExpand', {
                    detail: {
                        parentOctoPanelId,
                        sessionId: currentSessionId,
                    },
                })
            );
        }
    }, [currentSessionId, sessions, parentOctoPanelId, webSdkRenderMode, setWebSdkRenderMode]);

    // Always use white background for web-sdk view
    const isCompactMode = webSdkRenderMode === 'compact';
    const backgroundClass = isCompactMode ? 'gai:bg-transparent' : 'gai:bg-utility-white';
    const currentSession = sessions.find(session => session.id === currentSessionId);
    const primaryPrompt = suggestedPrompts[0];

    // Handle sheet expansion when message is sent in compact mode
    useEffect(() => {
        if (webSdkRenderMode !== 'compact' || !parentOctoPanelId) {
            return;
        }

        const hasSession = !!currentSessionId && !!currentSession;
        const shouldExpand = hasSession && (
            currentSession?.thinking || // Agent is generating
            currentSession?.chat?.some(msg => msg.role === 'user') // Or user message exists
        );

        if (shouldExpand) {
            // Expand sheet to show message bubble and generation skeleton
            window.dispatchEvent(
                new CustomEvent('genai:webSdkCompactExpand', {
                    detail: {
                        parentOctoPanelId,
                    },
                })
            );
        }
    }, [currentSessionId, currentSession, webSdkRenderMode, parentOctoPanelId]);

    // Show loader when: no session AND (loading prompts OR haven't shown dummy message yet)
    const shouldShowLoader = !currentSessionId && (isLoadingSuggestedPrompts || (!showDummyMessage && suggestedPrompts.length === 0));
    const isLoadingCompactPrompt = isCompactMode && (isLoadingSuggestedPrompts || !primaryPrompt);
    const countdownForInput = isCompactMode ? countdown : null;

    // In compact mode with no session, reduce padding to avoid overflow when countdown is active
    const hasCompactContent = isCompactMode && !currentSessionId;
    const scrollContainerClasses = isCompactMode
        ? hasCompactContent
            ? 'gai:flex gai:flex-1 gai:overflow-y-auto gai:px-3 gai:py-1'
            : 'gai:flex gai:flex-1 gai:overflow-y-auto gai:px-3 gai:py-3'
        : 'gai:flex gai:flex-1 gai:overflow-y-auto gai:px-4 gai:py-6';

    const contentWrapperClasses = isCompactMode
        ? 'gai:flex gai:w-full gai:flex-col gai:gap-3'
        : 'gai:mx-auto gai:flex gai:min-h-full gai:w-full gai:justify-center';

    const inputSectionBackground = isCompactMode || shouldShowLoader ? 'gai:bg-transparent' : 'gai:bg-white';
    const inputSectionClasses = hasCompactContent ? 'gai:py-1' : 'gai:py-2 gai:mt-2';

    // Guard: Don't show content in default/default-active states (compact mode without session)
    const shouldHideContent = isCompactMode && !currentSessionId;

    console.log('[WebSDKContent] Render logic', {
        isCompactMode,
        hasCompactContent,
        hasSession: !!currentSessionId,
        shouldHideContent,
        thinking: currentSession?.thinking,
        hasUserMessage: currentSession?.chat?.some(msg => msg.role === 'user'),
        renderMode: webSdkRenderMode,
        countdown,
        scrollContainerClasses,
        inputSectionClasses,
    });

    return (
        <div className={`gai:flex gai:h-full gai:flex-col ${backgroundClass}`}>
            <div ref={scrollContainerRef} className={scrollContainerClasses}>
                <div className={contentWrapperClasses}>
                    {!shouldHideContent && currentSession ? (
                        <Chat />
                    ) : !shouldHideContent && shouldShowLoader && !isCompactMode ? (
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
                    ) : !shouldHideContent && !isCompactMode && showDummyMessage && primaryPrompt ? (
                        <div className='gai:mx-auto gai:flex gai:w-full gai:flex-col gai:gap-6 gai:pb-6'>
                            {/* Dummy user message - clickable to copy to input */}
                            <div className='gai:flex gai:w-full gai:justify-end'>
                                <div className='gai:flex gai:w-[80%] gai:flex-col gai:items-end gai:gap-2'>
                                    <div
                                        className='gai:max-w-[80%] gai:cursor-pointer gai:rounded-3xl gai:rounded-br-none gai:bg-primary-50 gai:px-4 gai:py-3 gai:font-body-1-med gai:text-secondary-gray-900 gai:transition-colors hover:gai:bg-primary-100'
                                        onClick={handleAutoPromptClick}
                                    >
                                        {primaryPrompt}
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
                    ) : !isCompactMode ? <div className='gai:flex gai:w-full gai:items-center gai:justify-center' /> : null}
                </div>
            </div>
            <div className={`${inputSectionBackground} ${inputSectionClasses}`}>
                <div className='gai:mx-auto gai:w-full'>
                    <WebSDKInput
                        hideBackground={shouldShowLoader}
                        mode={webSdkRenderMode}
                        suggestedPrompt={isCompactMode ? primaryPrompt ?? '' : undefined}
                        countdown={countdownForInput}
                        onCompactPromptSend={isCompactMode ? handleCompactPromptSend : undefined}
                        isLoadingPrompt={isLoadingCompactPrompt}
                        showPresetPrompts={showPresetPrompts}
                        onClosePresetPrompts={handleClosePresetPrompts}
                        setIsSuggestionsOpen={setIsSuggestionsOpen}
                    />
                </div>
            </div>
        </div>
    );
}
