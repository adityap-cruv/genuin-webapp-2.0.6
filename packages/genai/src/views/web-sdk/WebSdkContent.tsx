import { useCallback, useEffect, useRef } from 'react';

import { eventBus } from '@/core/events/EventBus';
import { EVENTS } from '@/core/events/eventRegistry';
import { useAutoPromptCycle } from '@/modules/auto-prompt';
import { useAgentContext } from '@/stores/agent/context';
import { useChatContext } from '@/stores/chat/context';
import { useLifecycleContext } from '@/stores/lifecycle/context';
import { useSessionContext } from '@/stores/session/context';
import { useUIContext } from '@/stores/ui/context';
import { cn } from '@/utils/cn';

// PromptStatus is temporarily disabled — re-enable the import + the render line together.
// import { PromptStatus } from './PromptStatus';
import { ScrollContent } from './ScrollContent';
import { WebSdkInput } from './WebSdkInput';
import { useInitialAgentSelection } from './hooks/useInitialAgentSelection';
import { useOctoBridge } from './hooks/useOctoBridge';
import { useWebSdkBridge } from './hooks/useWebSdkBridge';

export function WebSdkContent() {
    const { octoState, autoPromptConfig } = useLifecycleContext();
    const { sessions, currentSessionId, setEnteredInChatMode, setSessions } = useSessionContext();
    const { filteredAgents: agents, setCurrentAgent } = useAgentContext();
    const { handleSendMessage, cachedPromptResponses } = useChatContext();
    const {
        suggestedPrompts,
        isLoadingSuggestedPrompts,
        webSdkRenderMode,
        setWebSdkRenderMode,
        uiDensity,
        parentOctoPanelId,
        integrationType,
        setIsSuggestionsOpen,
        handleNewChat,
    } = useUIContext();

    // When density is explicitly set (not base), suppress auto-collapse/expand —
    // the host's layout intent takes precedence.
    const isViewSizeLocked = uiDensity !== 'base';

    const scrollContainerRef = useRef<HTMLDivElement>(null);
    // Scopes user-interaction detection to this component only
    const rootContainerRef = useRef<HTMLDivElement>(null);

    const isCompactMode = webSdkRenderMode === 'compact';
    const isAutoPromptDisabled = !autoPromptConfig.enabled;
    const primaryPrompt = suggestedPrompts[0];

    const {
        showDummyMessage,
        countdown,
        panelViewCountdown,
        showPresetPrompts,
        isPostCloseMode,
        activePrompt,
        phase,
        isPostCloseModeRef,
        setShowPresetPrompts,
        handleAutoPromptClick,
        handleInputStart,
        handleCompactPromptSend,
        handleTakeoverAndSend,
        cancelFullViewCycle,
    } = useAutoPromptCycle({
        autoPromptConfig,
        octoState,
        currentSessionId,
        sessions,
        suggestedPrompts,
        cachedPromptResponses,
        setSessions,
        webSdkRenderMode,
        parentOctoPanelId,
        // When a size hint is locked, pass a no-op so the auto-prompt cycle
        // cannot flip the render mode away from the host's intent.
        setWebSdkRenderMode: isViewSizeLocked ? () => undefined : setWebSdkRenderMode,
        setIsSuggestionsOpen,
        handleSendMessage,
        handleNewChat,
    });

    useInitialAgentSelection({ agents, setCurrentAgent, setEnteredInChatMode });

    useOctoBridge({ parentOctoPanelId, phase });

    useWebSdkBridge({
        parentOctoPanelId,
        octoState,
        currentSessionId,
        webSdkRenderMode,
        onExternalCancelCycle: cancelFullViewCycle,
        // When a size hint is locked, suppress external render-mode changes so the
        // host's layout intent is never overridden by auto-collapse/expand events.
        onExternalRenderModeChange: isViewSizeLocked
            ? undefined
            : mode => {
                  setWebSdkRenderMode(mode);
                  // Guard: don't cancel when compact transition was self-initiated by auto-close cycle.
                  // isPostCloseModeRef.current is set synchronously before setWebSdkRenderMode in Step 1,
                  // so it reliably indicates self-originated transitions even before React state flushes.
                  if (mode === 'compact' && !isPostCloseModeRef.current) cancelFullViewCycle();
              },
    });

    // Cancel the full-view cycle on any user interaction — only when a chat response is visible
    useEffect(() => {
        if (webSdkRenderMode !== 'full') return;
        if (!currentSessionId) return;

        const rootEl = rootContainerRef.current;
        if (!rootEl) return;

        const onInteraction = () => cancelFullViewCycle();

        rootEl.addEventListener('pointerdown', onInteraction);
        rootEl.addEventListener('keydown', onInteraction);
        rootEl.addEventListener('touchstart', onInteraction);

        return () => {
            rootEl.removeEventListener('pointerdown', onInteraction);
            rootEl.removeEventListener('keydown', onInteraction);
            rootEl.removeEventListener('touchstart', onInteraction);
        };
    }, [webSdkRenderMode, currentSessionId, cancelFullViewCycle]);

    const handleExpandToFull = useCallback(() => {
        if (!isCompactMode) return;
        setWebSdkRenderMode('full');

        // Emit a lifecycle `response` phase so the components layer expands the sheet.
        // WEB_SDK_REQUEST_EXPAND is no longer consumed by the components listener.
        if (parentOctoPanelId) {
            eventBus.emit(EVENTS.OCTO_LIFECYCLE, { parentOctoPanelId, phase: 'response' });
        }
    }, [isCompactMode, setWebSdkRenderMode, parentOctoPanelId]);

    const handleClosePresetPrompts = useCallback(() => {
        setShowPresetPrompts(false);
        setIsSuggestionsOpen(false);
    }, [setShowPresetPrompts, setIsSuggestionsOpen]);

    // Guard on currentSessionId explicitly: if null, treat session as absent
    // even if the sessions array hasn't flushed its state update yet.
    const currentSession = currentSessionId ? sessions.find(s => s.id === currentSessionId) : undefined;

    const shouldShowLoader =
        !currentSessionId &&
        (isLoadingSuggestedPrompts || (!showDummyMessage && suggestedPrompts.length === 0));
    const isLoadingPrompt = isCompactMode && (isLoadingSuggestedPrompts || !primaryPrompt);
    const hasCompactContent = isCompactMode && !currentSessionId;

    const scrollContainerClasses = cn(
        'gai:flex gai:flex-1 gai:overflow-y-auto gai:transition-all gai:duration-300 gai:ease-in-out',
        isCompactMode ? cn('gai:px-3', hasCompactContent ? 'gai:py-1' : 'gai:py-3') : 'gai:px-4 gai:py-6',
        // Compact mode with no active session — collapse the scroll area smoothly
        hasCompactContent
            ? 'gai:max-h-0 gai:overflow-hidden gai:opacity-0 gai:py-0'
            : 'gai:max-h-[9999px] gai:opacity-100',
        uiDensity === 'xs' && 'gai:p-2',
        isCompactMode && 'gai:hidden'
    );

    const contentWrapperClasses = isCompactMode
        ? 'gai:flex gai:w-full gai:flex-col gai:gap-3'
        : 'gai:mx-auto gai:flex gai:min-h-full gai:w-full gai:justify-center';

    // Key changes when the rendered content type changes → triggers fade-in animation
    const contentKey = currentSession ? 'chat' : shouldShowLoader ? 'loader' : showDummyMessage ? 'dummy' : 'empty';

    // Show prompt + countdown in the input whenever the cycle is actively counting
    // down (either initial compact-idle or the post-close next-prompt loop), regardless
    // of compact vs full render mode — matches "initial behavior" for every iteration.
    const isAutoPromptCounting = !isAutoPromptDisabled && activePrompt !== null && countdown !== null;
    const suggestedPromptForInput = isAutoPromptCounting
        ? activePrompt!
        : isCompactMode && !isAutoPromptDisabled && (!isPostCloseMode || countdown !== null)
          ? (activePrompt ?? primaryPrompt ?? '')
          : undefined;
    const countdownForInput = isAutoPromptCounting ? countdown : isCompactMode ? countdown : null;

    return (
        <div
            ref={rootContainerRef}
            className={cn(
                'gai:flex gai:h-full gai:flex-col gai:transition-colors gai:duration-300',
                // No chat/session: pin the input to the bottom instead of centering.
                currentSession ? 'gai:justify-center' : 'gai:justify-end',
                isCompactMode ? 'gai:bg-transparent' : 'gai:bg-utility-white'
            )}
        >
            {/* Scroll area shows the chat. When auto-prompt is disabled we only suppress the
                auto-prompt idle UI (dummy message / countdown / pre-session loader) — a manual
                send still creates a session, so the chat response must always render. */}
            {(!isAutoPromptDisabled || currentSession) && (
                <div ref={scrollContainerRef} className={scrollContainerClasses}>
                    <div className={contentWrapperClasses}>
                        <div key={contentKey} className='gai:w-full gai:animate-fade-in'>
                            <ScrollContent
                                hasSession={!!currentSession}
                                scrollContainerRef={scrollContainerRef}
                                shouldShowLoader={shouldShowLoader}
                                isCompactMode={isCompactMode}
                                showDummyMessage={showDummyMessage}
                                primaryPrompt={primaryPrompt}
                                countdown={countdown}
                                panelViewCountdown={panelViewCountdown}
                                onDummyClick={handleAutoPromptClick}
                                uiDensity={uiDensity}
                            />
                        </div>
                    </div>
                </div>
            )}

            <div
                className={cn(
                    'gai:transition-colors gai:duration-300',
                    !isCompactMode && !shouldShowLoader && 'gai:bg-white'
                )}
            >
                {/* Non-countdown status line (Generating… / Prompted / Paused). Temporarily disabled;
                    countdown status lives in the input row. */}
                {/* {!isCompactMode && <PromptStatus phase={phase} />} */}
                <div className='gai:mx-auto gai:w-full'>
                    <WebSdkInput
                        hideBackground={shouldShowLoader}
                        mode={webSdkRenderMode}
                        suggestedPrompt={suggestedPromptForInput}
                        countdown={countdownForInput}
                        autoPromptMode={
                            !autoPromptConfig.enabled
                                ? 'disabled'
                                : autoPromptConfig.autoSend
                                  ? 'full'
                                  : 'countdown-only'
                        }
                        onCompactPromptSend={
                            isCompactMode || isAutoPromptCounting ? handleCompactPromptSend : undefined
                        }
                        onTakeoverSend={isAutoPromptCounting ? handleTakeoverAndSend : undefined}
                        onCancelCountdown={isAutoPromptCounting ? cancelFullViewCycle : undefined}
                        isLoadingPrompt={isLoadingPrompt}
                        showPresetPrompts={showPresetPrompts}
                        enableSuggestedPrompts={integrationType !== 'placement'}
                        onClosePresetPrompts={handleClosePresetPrompts}
                        setIsSuggestionsOpen={setIsSuggestionsOpen}
                        onActivate={isCompactMode ? handleExpandToFull : undefined}
                        onInputStart={!isCompactMode ? handleInputStart : undefined}
                        uiDensity={uiDensity}
                    />
                </div>
            </div>
        </div>
    );
}
