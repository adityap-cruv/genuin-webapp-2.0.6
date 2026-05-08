import { useCallback, useEffect, useRef, useState } from 'react';

import { useOctoAnalytics } from '@/context/analytics';
import { useAgentsContext } from '@/context/app/context';
import { useInputContext } from '@/context/input/context';
import { getCachedRemoteLottie, loadRemoteLottie } from '@/lib/lottie/load-remote-lottie';

import Chat from '../Chat';
import { CompactSkeleton } from '../ui/compact-skeleton';
import { Skeleton } from '../ui/skeleton';

import { WebSDKInput } from './WebSDKInput';

// Duration constants for the auto-prompt cycle (in milliseconds)
const FULL_VIEW_IDLE_TIMEOUT_MS = 5_000; // Wait 5s after response before closing chat
const VIDEO_PLAY_DURATION_MS = 30_000; // Play video for 30s before triggering next prompt

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
        handleNewChat,
        isLoadingSuggestedPrompts,
        textAreaRef,
        setIsSuggestionsOpen,
        webSdkRenderMode,
        setWebSdkRenderMode,
        parentOctoPanelId,
        allowAutoPrompt,
        globalAllowAutoPrompt,
    } = useAgentsContext();
    const { setInput } = useInputContext();
    const { analytics } = useOctoAnalytics();

    const scrollContainerRef = useRef<HTMLDivElement>(null);
    // Root container ref used to scope user-interaction detection to this component only
    const rootContainerRef = useRef<HTMLDivElement>(null);
    const [hasSetInitialAgent, setHasSetInitialAgent] = useState(false);
    const [showDummyMessage, setShowDummyMessage] = useState(false);
    const [countdown, setCountdown] = useState<number | null>(null);
    const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const [panelViewCountdown, setPanelViewCountdown] = useState<number | null>(null);
    const panelViewCountdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const expandRequestedMessageRef = useRef<string | null>(null);
    const thinkingFiredForSessionRef = useRef<string | null>(null);
    const errorFiredForSessionRef = useRef<string | null>(null);
    // After a close event, show normal chat input instead of suggestion/auto-prompt
    const [isPostCloseMode, setIsPostCloseMode] = useState(false);
    const [showPresetPrompts, setShowPresetPrompts] = useState(false);

    // --- Full-view auto-prompt cycle state ---
    // Tracks whether the user has interacted since the response completed.
    const userInteractedRef = useRef(false);
    // Holds the ID of the last agent message we've already started a cycle for,
    // so we don't re-trigger the same cycle if the component re-renders.
    const cycleStartedForMessageRef = useRef<string | null>(null);
    // setTimeout handles for the idle wait and video-play wait — stored in refs
    // so we can cancel them on user interaction or unmount.
    const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const videoPlayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const countdownSignalTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    // Index into suggestedPrompts for the next prompt in the cycle.
    // We keep it in a ref so it persists across renders without causing re-renders.
    const nextPromptIndexRef = useRef(1); // index 0 is sent first automatically
    const [compactOctoLottie, setCompactOctoLottie] = useState<object | null>(() =>
        getCachedRemoteLottie(OCTO_IDLE_ANIMATION_PATH, OCTO_IDLE_IMAGES_PATH)
    );
    const [compactLottieError, setCompactLottieError] = useState(false);

    // --- Full-view auto-prompt cycle ---
    // Helper: cancel both timers and mark user as having interacted.
    const cancelFullViewCycle = useCallback(() => {
        userInteractedRef.current = true;
        if (idleTimerRef.current) {
            clearTimeout(idleTimerRef.current);
            idleTimerRef.current = null;
        }
        if (videoPlayTimerRef.current) {
            clearTimeout(videoPlayTimerRef.current);
            videoPlayTimerRef.current = null;
        }
        if (countdownSignalTimerRef.current) {
            clearTimeout(countdownSignalTimerRef.current);
            countdownSignalTimerRef.current = null;
        }
    }, []);

    // Detect when the current session's last agent message completes while in full-view mode.
    // When that happens, wait FULL_VIEW_IDLE_TIMEOUT_MS. If the user doesn't interact:
    //   1. Close the chat (reset sheet + switch to compact mode).
    //   2. Wait VIDEO_PLAY_DURATION_MS (video plays naturally during this gap).
    //   3. Send the next suggested prompt to restart the cycle.
    useEffect(() => {
        if (!globalAllowAutoPrompt) return;
        // Only run this cycle in full-screen chat mode
        if (webSdkRenderMode !== 'full') return;
        if (!currentSessionId) return;

        const currentSession = sessions.find(s => s.id === currentSessionId);
        if (!currentSession) return;

        // Find the last agent event in the chat
        const lastAgentEvent = [...(currentSession.chat || [])].reverse().find(e => e.role === 'agent');
        if (!lastAgentEvent?.isCompleted) return;

        // Guard: only start a new cycle once per unique agent message
        const messageId = lastAgentEvent.id ?? null;
        if (!messageId || cycleStartedForMessageRef.current === messageId) return;
        cycleStartedForMessageRef.current = messageId;
        userInteractedRef.current = false; // reset interaction flag for this cycle

        // Step 1: Wait FULL_VIEW_IDLE_TIMEOUT_MS of inactivity before closing the chat.
        // NOTE: setWebSdkRenderMode('compact') inside this callback will change the
        // webSdkRenderMode dep and re-trigger the effect, firing the cleanup. To prevent
        // that cleanup from killing the video-play timer (Step 2) before it fires, we
        // snapshot the captured refs/closures we need and schedule Step 2 BEFORE calling
        // setWebSdkRenderMode, so the timer is already running when the effect cleans up.
        idleTimerRef.current = setTimeout(() => {
            idleTimerRef.current = null;

            // Abort if the user interacted during the idle window
            if (userInteractedRef.current) return;

            // Capture the prompts array now (before any state updates invalidate the closure)
            const promptsSnapshot = suggestedPrompts.slice();

            // Clear session state immediately so the chat UI is blank when the sheet closes.
            // This must happen before setWebSdkRenderMode so no stale content flashes.
            handleNewChat();
            setInput('');

            // Step 2: Schedule the next-prompt trigger BEFORE calling setWebSdkRenderMode
            // so the cleanup triggered by the mode change cannot cancel this timer.

            // Signal 1 second before handleSendMessage fires that the countdown is active.
            countdownSignalTimerRef.current = setTimeout(() => {
                countdownSignalTimerRef.current = null;
                if (userInteractedRef.current) return;
                if (parentOctoPanelId) {
                    window.dispatchEvent(
                        new CustomEvent('genai:webSdkCountdownActive', {
                            detail: {
                                parentOctoPanelId,
                                isActive: true,
                                source: 'auto_prompt_restart',
                            },
                        })
                    );
                }
            }, VIDEO_PLAY_DURATION_MS - 1000);

            videoPlayTimerRef.current = setTimeout(() => {
                videoPlayTimerRef.current = null;

                // Abort if the user interacted during the video-play window
                if (userInteractedRef.current) return;

                // Pick the next prompt in round-robin order; wrap around if needed
                if (promptsSnapshot.length === 0) return;
                const index = nextPromptIndexRef.current % promptsSnapshot.length;
                nextPromptIndexRef.current = index + 1;
                const nextPrompt = promptsSnapshot[index];

                // Send the next prompt to restart the cycle
                handleSendMessage({
                    targetSessionId: null,
                    messageInput: nextPrompt,
                });
            }, VIDEO_PLAY_DURATION_MS);

            // Collapse the sheet and signal the sheet layer to reset its state.
            // Changing the render mode will re-run this effect and fire its cleanup,
            // but videoPlayTimerRef.current is already set above so cancelFullViewCycle
            // (called by user interaction) can still cancel it — while the effect cleanup
            // will NOT clear it (see return block below).
            setWebSdkRenderMode('compact');
            if (parentOctoPanelId) {
                window.dispatchEvent(
                    new CustomEvent('genai:webSdkAutoClose', {
                        detail: { parentOctoPanelId },
                    })
                );
            }
        }, FULL_VIEW_IDLE_TIMEOUT_MS);

        return () => {
            // Only cancel the IDLE timer here (the video-play timer is intentionally
            // allowed to survive a mode-change re-run; cancelFullViewCycle handles it
            // when the user actually interacts).
            console.log('[AutoCycle] cleanup, idleTimerRef=', !!idleTimerRef.current);
            if (idleTimerRef.current) {
                clearTimeout(idleTimerRef.current);
                idleTimerRef.current = null;
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentSessionId, sessions, webSdkRenderMode]);

    // Cancel the full-view cycle on any user interaction (click, key, scroll, touch).
    // Attach to the genai root container (not window/document) so we only react to
    // genuine gestures inside this component, never to synthetic React events or
    // interactions happening outside the chat panel.
    useEffect(() => {
        if (webSdkRenderMode !== 'full') return;

        const rootEl = rootContainerRef.current;
        if (!rootEl) return;

        const onInteraction = (e: Event) => {
            console.log('[AutoCycle] user interaction detected:', e.type, 'cancelling cycle');
            cancelFullViewCycle();
        };

        // pointerdown and keydown bubble up through the root container.
        // We intentionally exclude 'scroll' because auto-scroll on new messages
        // (programmatic scrollTop assignment) fires the same event and would
        // falsely cancel the cycle.
        rootEl.addEventListener('pointerdown', onInteraction);
        rootEl.addEventListener('keydown', onInteraction);
        rootEl.addEventListener('touchstart', onInteraction);

        return () => {
            rootEl.removeEventListener('pointerdown', onInteraction);
            rootEl.removeEventListener('keydown', onInteraction);
            rootEl.removeEventListener('touchstart', onInteraction);
        };
    }, [webSdkRenderMode, cancelFullViewCycle]);

    // Cancel the video-play / countdown timers when the player signals user interaction.
    // This runs regardless of webSdkRenderMode because the timers survive the mode change
    // from 'full' → 'compact' and must be cancellable during the video-play window.
    useEffect(() => {
        const onPlayerInteraction = () => cancelFullViewCycle();
        window.addEventListener('sdk:userInteracted', onPlayerInteraction);
        return () => {
            window.removeEventListener('sdk:userInteracted', onPlayerInteraction);
        };
    }, [cancelFullViewCycle]);

    // Reset the prompt-cycle index and cycle guard whenever suggestedPrompts refresh
    // so we always start from the first prompt of the new set
    useEffect(() => {
        nextPromptIndexRef.current = 1;
        cycleStartedForMessageRef.current = null;
    }, [suggestedPrompts]);

    // Handle click on auto-prompt message - cancel countdown and copy to input
    const handleAutoPromptClick = () => {
        if (suggestedPrompts.length === 0) return;

        const firstPrompt = suggestedPrompts[0];
        if (!firstPrompt) return;

        // Cancel both compact and panel-view countdowns
        if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current);
            countdownIntervalRef.current = null;
        }
        if (panelViewCountdownIntervalRef.current) {
            clearInterval(panelViewCountdownIntervalRef.current);
            panelViewCountdownIntervalRef.current = null;
        }
        setCountdown(null);
        setPanelViewCountdown(null);

        // Track auto-prompt cancelled
        analytics.trackAutoPromptCancelled({
            prompt: firstPrompt,
            seconds_remaining: countdown || 0,
        });

        // Hide dummy message
        setShowDummyMessage(false);

        // Dispatch event to deactivate countdown state
        if (parentOctoPanelId && webSdkRenderMode === 'compact') {
            window.dispatchEvent(
                new CustomEvent('genai:webSdkCountdownActive', {
                    detail: {
                        parentOctoPanelId,
                        isActive: false,
                        source: 'auto_prompt_click',
                    },
                })
            );
        }

        // Only show preset prompts dropdown if no user message has been sent yet
        const session = sessions.find(s => s.id === currentSessionId);
        const hasUserMessages = session?.chat?.some(message => message.role === 'user') ?? false;

        if (!hasUserMessages) {
            setShowPresetPrompts(true);
            setIsSuggestionsOpen(true);
        }

        // Copy message to input
        setInput(firstPrompt);

        // Focus the textarea
        if (textAreaRef) {
            textAreaRef.focus();
        }
    };

    // Handle when user interacts with input (focus or typing) - cancel countdown and show suggested prompt
    const handleInputStart = useCallback(() => {
        // Also cancel the full-view auto-prompt cycle if it's running
        cancelFullViewCycle();

        // Cancel both compact and panel-view countdowns
        if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current);
            countdownIntervalRef.current = null;
        }
        if (panelViewCountdownIntervalRef.current) {
            clearInterval(panelViewCountdownIntervalRef.current);
            panelViewCountdownIntervalRef.current = null;
        }
        setCountdown(null);
        setPanelViewCountdown(null);

        // Hide dummy message
        setShowDummyMessage(false);

        // Dispatch event to deactivate countdown state
        if (parentOctoPanelId && webSdkRenderMode === 'compact') {
            window.dispatchEvent(
                new CustomEvent('genai:webSdkCountdownActive', {
                    detail: {
                        parentOctoPanelId,
                        isActive: false,
                        source: 'input_start',
                    },
                })
            );
        }

        // Only show preset prompts dropdown if no user message has been sent yet
        const session = sessions.find(s => s.id === currentSessionId);
        const hasUserMessages = session?.chat?.some(message => message.role === 'user') ?? false;

        if (!hasUserMessages) {
            setShowPresetPrompts(true);
            setIsSuggestionsOpen(true);
        }
    }, [parentOctoPanelId, webSdkRenderMode, setIsSuggestionsOpen, sessions, currentSessionId, cancelFullViewCycle]);

    const handleCompactPromptSend = () => {
        if (suggestedPrompts.length === 0) return;

        const firstPrompt = suggestedPrompts[0];
        if (!firstPrompt) return;

        // Clear both compact and panel-view countdowns
        if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current);
            countdownIntervalRef.current = null;
        }
        if (panelViewCountdownIntervalRef.current) {
            clearInterval(panelViewCountdownIntervalRef.current);
            panelViewCountdownIntervalRef.current = null;
        }

        setCountdown(null);
        setPanelViewCountdown(null);
        setShowDummyMessage(false);

        // Dispatch event to deactivate countdown state
        if (parentOctoPanelId && webSdkRenderMode === 'compact') {
            window.dispatchEvent(
                new CustomEvent('genai:webSdkCountdownActive', {
                    detail: {
                        parentOctoPanelId,
                        isActive: false,
                        source: 'compact_prompt_send',
                    },
                })
            );
        }

        handleSendMessage({
            targetSessionId: currentSessionId,
            messageInput: firstPrompt,
            onMessageQueued: () => {
                setCountdown(null);
                setPanelViewCountdown(null);
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
        // After a close event, skip auto-prompt — user should see normal chat input
        if (isPostCloseMode || !allowAutoPrompt) {
            return;
        }

        // Only trigger if there's no session and we have prompts
        if (!currentSessionId && suggestedPrompts.length > 0) {
            const firstPrompt = suggestedPrompts[0];
            if (!firstPrompt) return;
            setShowDummyMessage(true);
            setCountdown(3);
            setShowPresetPrompts(false);
            setIsSuggestionsOpen(false);

            // Dispatch event to transition to default-active state when countdown starts
            if (parentOctoPanelId && webSdkRenderMode === 'compact') {
                window.dispatchEvent(
                    new CustomEvent('genai:webSdkCountdownActive', {
                        detail: {
                            parentOctoPanelId,
                            isActive: true,
                            source: 'countdown_started',
                        },
                    })
                );
            }

            // Track countdown started
            analytics.trackAutoPromptCountdownStarted({
                prompt: firstPrompt,
                countdown_duration: 5,
            });

            // Start countdown timer
            let timeLeft = 3;
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

                    // Track auto-prompt executed
                    analytics.trackAutoPromptExecuted({
                        prompt: firstPrompt,
                    });

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
                window.dispatchEvent(
                    new CustomEvent('genai:webSdkCountdownActive', {
                        detail: {
                            parentOctoPanelId,
                            isActive: false,
                            source: 'session_exists',
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
    }, [currentSessionId, suggestedPrompts, parentOctoPanelId, webSdkRenderMode, isPostCloseMode]);

    // Start panel-view countdown when transitioning from compact to full mode
    const prevRenderModeRef = useRef(webSdkRenderMode);
    const countdownValueRef = useRef(countdown);

    // Keep countdown value in ref to avoid re-running effect when countdown changes
    useEffect(() => {
        countdownValueRef.current = countdown;
    }, [countdown]);

    useEffect(() => {
        const prevMode = prevRenderModeRef.current;
        prevRenderModeRef.current = webSdkRenderMode;

        // Only start panel-view countdown when transitioning from compact to full
        // and when there's an active countdown in compact mode (interval still running)
        if (
            prevMode === 'compact' &&
            webSdkRenderMode === 'full' &&
            countdownValueRef.current !== null &&
            countdownValueRef.current > 0 &&
            countdownIntervalRef.current !== null
        ) {
            // Clear the compact countdown
            clearInterval(countdownIntervalRef.current);
            countdownIntervalRef.current = null;

            // Continue countdown from where it left off in compact mode
            const remainingTime = countdownValueRef.current;
            setCountdown(null);
            setPanelViewCountdown(remainingTime);
            let timeLeft = remainingTime;
            panelViewCountdownIntervalRef.current = setInterval(() => {
                timeLeft -= 1;
                setPanelViewCountdown(timeLeft);

                if (timeLeft <= 0) {
                    if (panelViewCountdownIntervalRef.current) {
                        clearInterval(panelViewCountdownIntervalRef.current);
                        panelViewCountdownIntervalRef.current = null;
                    }
                    setPanelViewCountdown(null);
                    // Auto-send the message
                    if (suggestedPrompts.length > 0) {
                        const firstPrompt = suggestedPrompts[0];
                        handleSendMessage({
                            targetSessionId: currentSessionId,
                            messageInput: firstPrompt,
                            onMessageQueued: () => {
                                setPanelViewCountdown(null);
                            },
                        });
                    }
                }
            }, 1000);
        }

        // Cleanup panel-view countdown when going back to compact or when session is created
        if (webSdkRenderMode === 'compact' || currentSessionId) {
            if (panelViewCountdownIntervalRef.current) {
                clearInterval(panelViewCountdownIntervalRef.current);
                panelViewCountdownIntervalRef.current = null;
            }
            setPanelViewCountdown(null);
        }

        return () => {
            // Only clear if we're actually changing mode or unmounting
            // Don't clear if we're just re-running due to other state changes
        };
    }, [webSdkRenderMode, currentSessionId, suggestedPrompts, handleSendMessage]);

    // Auto-scroll disabled — keep the view fixed at the top during streaming and on completion.

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
        if (!allowAutoPrompt) {
            // Do not allow auto prompting
            return;
        }
        if (!currentSessionId) {
            expandRequestedMessageRef.current = null;
            return;
        }

        const currentSession = sessions.find(session => session.id === currentSessionId);
        if (!currentSession) {
            expandRequestedMessageRef.current = null;
            return;
        }

        const latestAgentMessage = [...(currentSession.chat || [])].reverse().find(
            event =>
                event.role === 'agent' &&
                (event.message?.content?.trim() || // Has text content
                    event.carousel_metadata || // Has carousel/videos
                    event.metadata?.toolMetadata || // Has inventory data
                    (event.contentSequence && event.contentSequence.length > 0)) // Has any content sequence
        );

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
    // After a close event, treat as full mode so the normal input box shows
    const isCompactMode = webSdkRenderMode === 'compact';
    const backgroundClass = isCompactMode ? 'gai:bg-transparent' : 'gai:bg-utility-white';
    // Guard on currentSessionId explicitly: if it's null, treat the session as absent
    // even if the sessions array hasn't flushed its state update yet (batching race between
    // setSessions and setCurrentSessionIdState in handleNewChat).
    const currentSession = currentSessionId ? sessions.find(session => session.id === currentSessionId) : undefined;
    const primaryPrompt = suggestedPrompts[0];

    const handleCompactInputActivate = useCallback(() => {
        if (webSdkRenderMode !== 'compact' || !globalAllowAutoPrompt) {
            return;
        }

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
    }, [webSdkRenderMode, setWebSdkRenderMode, parentOctoPanelId, currentSessionId]);

    const isCurrentSessionThinking = currentSession?.thinking ?? false;
    const currentSessionStatus = currentSession?.status;

    // Fire genai:webSdkThinkingStarted exactly once per session when thinking begins.
    // Replaces the old genai:webSdkCompactExpand which could fire multiple times.
    useEffect(() => {
        if (!parentOctoPanelId || !currentSessionId) {
            return;
        }

        // Only fire once per session
        if (thinkingFiredForSessionRef.current === currentSessionId) {
            return;
        }

        if (isCurrentSessionThinking) {
            thinkingFiredForSessionRef.current = currentSessionId;
            window.dispatchEvent(
                new CustomEvent('genai:webSdkThinkingStarted', {
                    detail: { parentOctoPanelId },
                })
            );
        }
    }, [currentSessionId, isCurrentSessionThinking, parentOctoPanelId]);

    // Fire genai:webSdkError exactly once per session when an error occurs.
    useEffect(() => {
        if (!parentOctoPanelId || !currentSessionId) {
            return;
        }

        if (errorFiredForSessionRef.current === currentSessionId) {
            return;
        }

        if (currentSessionStatus === 'error') {
            errorFiredForSessionRef.current = currentSessionId;
            window.dispatchEvent(
                new CustomEvent('genai:webSdkError', {
                    detail: { parentOctoPanelId },
                })
            );
        }
    }, [currentSessionId, currentSessionStatus, parentOctoPanelId]);

    // Reset per-session refs when session changes
    useEffect(() => {
        if (!currentSessionId) {
            thinkingFiredForSessionRef.current = null;
            errorFiredForSessionRef.current = null;
            expandRequestedMessageRef.current = null;
        } else {
            // New session created (user sent a message) — exit post-close mode
            setIsPostCloseMode(false);
        }
    }, [currentSessionId]);

    useEffect(() => {
        const handleAutoClose = () => {
            setIsPostCloseMode(true);
        };

        window.addEventListener('genai:webSdkAutoClose', handleAutoClose);
        return () => {
            window.removeEventListener('genai:webSdkAutoClose', handleAutoClose);
        };
    }, []);

    // Show loader when: no session AND (loading prompts OR haven't shown dummy message yet)
    const shouldShowLoader =
        !currentSessionId && (isLoadingSuggestedPrompts || (!showDummyMessage && suggestedPrompts.length === 0));
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
    // const inputSectionClasses = hasCompactContent ? 'gai:py-1' : 'gai:py-2 gai:mt-2';

    // Guard: Don't show content in default/default-active states (compact mode without session)
    const shouldHideContent = isCompactMode && !currentSessionId;

    return (
        <div ref={rootContainerRef} className={`gai:flex gai:h-full gai:flex-col ${backgroundClass}`}>
            {allowAutoPrompt && (
                <div ref={scrollContainerRef} className={scrollContainerClasses}>
                    <div className={contentWrapperClasses}>
                        {!shouldHideContent && currentSession ? (
                            <Chat />
                        ) : !shouldHideContent && shouldShowLoader ? (
                            isCompactMode ? (
                                <div className='gai:flex gai:w-full gai:justify-end'>
                                    <div className='gai:flex gai:w-[80%] gai:flex-col gai:items-end gai:gap-2'>
                                        <div className='gai:flex gai:w-full gai:max-w-[70%] gai:flex-col gai:gap-2 gai:rounded-3xl gai:rounded-br-none gai:bg-primary-50 gai:px-4 gai:py-3'>
                                            <CompactSkeleton width='55%' />
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className='gai:mx-auto gai:flex gai:w-full gai:flex-col gai:gap-6 gai:pb-6'>
                                    <div className='gai:flex gai:w-full gai:justify-end'>
                                        <div className='gai:flex gai:w-[80%] gai:flex-col gai:items-end gai:gap-2'>
                                            <div className='gai:flex gai:w-full gai:max-w-[80%] gai:flex-col gai:gap-2 gai:rounded-3xl gai:rounded-br-none gai:bg-primary-50 gai:px-4 gai:py-3'>
                                                <Skeleton className='gai:h-4 gai:w-full gai:max-w-[16rem] gai:bg-primary-200' />
                                                <Skeleton className='gai:h-4 gai:w-3/4 gai:bg-primary-200' />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        ) : !shouldHideContent && !isCompactMode && showDummyMessage && primaryPrompt ? (
                            <div className='gai:mx-auto gai:flex gai:w-full gai:flex-col gai:gap-6 gai:pb-6'>
                                {/* Dummy user message - clickable to copy to input */}
                                <div className='gai:flex gai:w-full gai:justify-end'>
                                    <div className='gai:flex gai:w-[80%] gai:flex-col gai:items-end gai:gap-2'>
                                        <div
                                            className='hover:gai:bg-primary-100 gai:max-w-[80%] gai:cursor-pointer gai:rounded-3xl gai:rounded-br-none gai:bg-primary-50 gai:px-4 gai:py-3 gai:font-body-1-med gai:text-secondary-gray-900 gai:transition-colors'
                                            onClick={handleAutoPromptClick}
                                        >
                                            {primaryPrompt}
                                        </div>
                                        {/* Countdown timer - blue badge with white background for number */}
                                        {((countdown !== null && countdown > 0) ||
                                            (panelViewCountdown !== null && panelViewCountdown > 0)) && (
                                            <div className='gai:flex gai:items-center gai:gap-1.5 gai:px-1'>
                                                <div className='gai:flex gai:h-4 gai:w-4 gai:items-center gai:justify-center gai:rounded-full gai:bg-primary-500'>
                                                    <span className='gai:text-[10px] gai:leading-none gai:font-bold gai:text-white'>
                                                        {panelViewCountdown !== null && panelViewCountdown > 0
                                                            ? panelViewCountdown
                                                            : countdown}
                                                    </span>
                                                </div>
                                                <span className='gai:text-[10px] gai:text-secondary-gray-500'>
                                                    Prompting in...
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : !isCompactMode ? (
                            <div className='gai:flex gai:w-full gai:items-center gai:justify-center' />
                        ) : null}
                    </div>
                </div>
            )}
            <div className={`${inputSectionBackground}`}>
                <div className='gai:mx-auto gai:w-full'>
                    <WebSDKInput
                        hideBackground={shouldShowLoader}
                        mode={webSdkRenderMode}
                        suggestedPrompt={isCompactMode && !isPostCloseMode ? (primaryPrompt ?? '') : undefined}
                        countdown={countdownForInput}
                        onCompactPromptSend={isCompactMode ? handleCompactPromptSend : undefined}
                        isLoadingPrompt={isLoadingCompactPrompt}
                        showPresetPrompts={showPresetPrompts}
                        onClosePresetPrompts={handleClosePresetPrompts}
                        setIsSuggestionsOpen={setIsSuggestionsOpen}
                        onActivate={isCompactMode ? handleCompactInputActivate : undefined}
                        onInputStart={!isCompactMode ? handleInputStart : undefined}
                    />
                </div>
            </div>
        </div>
    );
}
