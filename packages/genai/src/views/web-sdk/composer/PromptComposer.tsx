import { useCallback, useEffect, useRef, useState } from 'react';
import type React from 'react';

import { useChatContext } from '@/stores/chat/context';
import { useInputContext } from '@/stores/input/context';
import { useSessionContext } from '@/stores/session/context';
import { useUIContext } from '@/stores/ui/context';
import { cn } from '@/utils/cn';

import { DENSITY, type Density } from '../density';

import { ComposerActionButton } from './ComposerActionButton';
import { ComposerInput } from './ComposerInput';
import { PromptPreview } from './PromptPreview';
import { deriveComposerStatus, isCountingStatus } from './composer-status';

const OCTO_AVATAR_SRC = 'https://media.begenuin.com/webapp_assets/assets/genai/icon-genai-circle-white.svg';

interface PromptComposerProps {
    hideBackground?: boolean;
    mode?: 'compact' | 'full';
    suggestedPrompt?: string;
    countdown?: number | null;
    autoPromptMode?: 'disabled' | 'countdown-only' | 'full';
    onSuggestedPromptSend?: () => void;
    /**
     * Take over the counting-down prompt: expand to full-view and send now. A single intent so
     * the cycle isn't killed by a racing cancel event.
     */
    onTakeoverSend?: () => void;
    /** Cancel a counting-down prompt and make it editable instead of sending. */
    onCancelCountdown?: () => void;
    isLoading?: boolean;
    onExpandToFull?: () => void;
    onInputStart?: () => void;
    onFocusEmpty?: () => void;
    onBlur?: () => void;
    /** Called after any send completes — used to start the post-send suggestions cooldown. */
    onSendComplete?: () => void;
    uiDensity?: Density;
}

/**
 * The Octo composer (web-sdk). A single `ComposerStatus` chooses the surface (editable input /
 * suggested / countdown) and the action button (send / stop / countdown). Wraps the same
 * session/chat/auto-prompt wiring as before — only the UI is rebuilt from reusable atoms.
 */
export function PromptComposer({
    hideBackground = false,
    mode = 'full',
    suggestedPrompt,
    countdown = null,
    autoPromptMode,
    onSuggestedPromptSend,
    onTakeoverSend,
    onCancelCountdown,
    isLoading = false,
    onExpandToFull,
    onInputStart,
    onFocusEmpty,
    onBlur,
    onSendComplete,
    uiDensity = 'base',
}: PromptComposerProps) {
    const { creatingSession, handleSendMessage, stopSessionResponse } = useChatContext();
    const { currentSessionId, sessions, enteredInChatMode } = useSessionContext();
    const { setTextAreaRef } = useUIContext();
    const { input, setInput } = useInputContext();
    const [stopping, setStopping] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);

    // Clear stale input when the session is reset (e.g. new chat) so the countdown surface is not
    // suppressed by text from a previous session.
    useEffect(() => {
        if (!currentSessionId) setInput('');
    }, [currentSessionId, setInput]);

    const currentSession = sessions.find(s => s.id === currentSessionId);
    const thinking = currentSession?.thinking ?? false;
    const hasUserMessages = currentSession?.chat?.some(m => m.role === 'user') ?? false;

    const isCompactMode = mode === 'compact';
    const isDisabled = autoPromptMode === 'disabled';
    const isCountdownOnly = autoPromptMode === 'countdown-only';
    const showCountdownTimer = countdown !== null && countdown > 0;

    const status = deriveComposerStatus({
        isDisabled,
        isCountdownOnly,
        isCompactMode,
        hasUserMessages,
        suggestedPrompt,
        countdown,
        input,
    });
    const counting = isCountingStatus(status);

    // Re-point the host's textarea ref whenever the rendered surface changes (editable ↔
    // countdownFull use different textareas), so PresetPrompts focuses the live node, not a stale one.
    useEffect(() => {
        setTextAreaRef(textareaRef.current);
    }, [setTextAreaRef, status.kind]);

    // In expand-view state (compact + active session) prevent textarea focus to avoid the
    // keyboard opening during the transition to panel-view.
    const preventFocus = isCompactMode && !!currentSessionId;

    // Cancel the countdown and pre-fill the textarea for editing instead of sending.
    const handleCancelCountdown = useCallback(() => {
        const prompt = (status as { prompt?: string }).prompt ?? '';
        onCancelCountdown?.();
        setInput(prompt);
        requestAnimationFrame(() => textareaRef.current?.focus());
    }, [status, onCancelCountdown, setInput]);

    const handleExpand = useCallback(() => {
        if (isLoading) return;
        if (isCompactMode) onExpandToFull?.();
    }, [isLoading, isCompactMode, onExpandToFull]);

    // Compact: always expand to full on click — cancel any active countdown first.
    // Full: just focus (or ignore if a session is active and focus is prevented).
    const handleInputPillClick = useCallback(() => {
        if (isLoading) return;
        if (isCompactMode) {
            if (counting) handleCancelCountdown();
            onExpandToFull?.();
            return;
        }
        if (!preventFocus) textareaRef.current?.focus();
    }, [isLoading, isCompactMode, counting, handleCancelCountdown, onExpandToFull, preventFocus]);

    const dismissKeyboard = useCallback(() => {
        textareaRef.current?.blur();
        // Mobile keeps the keyboard tied to the focused element — blur whatever is focused.
        const active = typeof document !== 'undefined' ? (document.activeElement as HTMLElement | null) : null;
        active?.blur?.();
    }, []);

    const handleSubmit = async () => {
        // Blur on every submit so the virtual keyboard dismisses and doesn't reopen after send
        // (incl. the compact → full-view expand transition on mobile).
        dismissKeyboard();
        handleExpand();
        if (currentSession?.thinking) {
            setStopping(true);
            try {
                await stopSessionResponse(currentSessionId);
            } finally {
                setStopping(false);
            }
        } else {
            await handleSendMessage({
                targetSessionId: currentSessionId,
                messageInput: input,
                onMessageQueued: () => {
                    setInput('');
                    onSendComplete?.();
                    // Re-blur after the input-clear re-render so focus can't snap back.
                    requestAnimationFrame(dismissKeyboard);
                },
            });
        }
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            if (!creatingSession && (input || currentSession?.thinking)) {
                handleSubmit();
            }
        }
        // Prevent arrow keys from propagating to the parent player swiper.
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
            event.stopPropagation();
        }
    };

    const handleTextareaFocus = (event: React.FocusEvent<HTMLTextAreaElement>) => {
        if (preventFocus || isLoading) {
            event.target.blur();
            return;
        }
        // Focusing a counting-down prompt is a takeover intent: expand + send now via the single
        // takeover path (no cancel race).
        if (counting && onTakeoverSend) {
            onTakeoverSend();
            return;
        }
        // Do NOT expand on focus — expansion happens on submit only.
        onInputStart?.();
        if (!input) onFocusEmpty?.();
    };

    const handleTextareaChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        const prev = input;
        const next = event.target.value;
        if (!prev && next) {
            onInputStart?.();
            onBlur?.(); // hide suggestions when the user starts typing
        } else if (prev && !next) {
            onFocusEmpty?.(); // re-show suggestions when input cleared
        }
        setInput(next);
    };


    function renderStatus() {
        switch (status.kind) {
            case 'suggested':
                return (
                    <>
                        <PromptPreview
                            variant='suggested'
                            prompt={isLoading ? '' : (suggestedPrompt ?? '')}
                            isLoading={isLoading}
                            density={uiDensity}
                        />
                        <ComposerActionButton
                            action={isCountdownOnly && showCountdownTimer ? 'countdown' : 'send'}
                            seconds={countdown}
                            loading={creatingSession}
                            disabled={creatingSession || isLoading || !suggestedPrompt || !onSuggestedPromptSend}
                            onClick={() => {
                                handleExpand();
                                onSuggestedPromptSend?.();
                                onSendComplete?.();
                            }}
                            density={uiDensity}
                        />
                    </>
                );

            case 'countdownInline':
                return (
                    <>
                        {/* Clicking the prompt text cancels the countdown and makes it editable. */}
                        <PromptPreview
                            variant='inline'
                            prompt={status.prompt}
                            density={uiDensity}
                            onClick={handleCancelCountdown}
                        />
                        <ComposerActionButton
                            action='countdown'
                            seconds={status.seconds}
                            loading={creatingSession}
                            disabled={creatingSession}
                            onClick={handleCancelCountdown}
                            density={uiDensity}
                        />
                    </>
                );

            case 'countdownFull':
                return (
                    <>
                        {/* Read-only prompt — tapping cancels the countdown and makes it editable. */}
                        <div
                            onClick={handleCancelCountdown}
                            className={cn(
                                'gai:min-w-0 gai:flex-1 gai:cursor-pointer gai:truncate gai:pl-2 gai:text-left gai:font-medium gai:text-secondary-gray-900',
                                DENSITY[uiDensity].inputText
                            )}
                        >
                            {status.prompt}
                        </div>
                        <div className='gai:flex gai:items-center gai:justify-end gai:gap-2'>
                            <span className='gai:text-[10px] gai:font-medium gai:text-secondary-gray-500 gai:md:text-xs'>
                                {`Prompting ${uiDensity !== 'xs' ? 'in' : ''}...`}
                            </span>
                            <ComposerActionButton
                                action='countdown'
                                seconds={status.seconds}
                                loading={creatingSession}
                                disabled={creatingSession}
                                onClick={handleCancelCountdown}
                                density={uiDensity}
                                countdownTextClassName='gai:text-xs gai:md:text-sm'
                            />
                        </div>
                    </>
                );

            case 'editable':
            default:
                return (
                    <>
                        <ComposerInput
                            value={input}
                            inputRef={textareaRef}
                            density={uiDensity}
                            multiline={!isCompactMode}
                            readOnly={preventFocus}
                            onChange={handleTextareaChange}
                            onKeyDown={handleKeyDown}
                            onFocus={event => {
                                setIsFocused(true);
                                handleTextareaFocus(event);
                            }}
                            onBlur={() => {
                                setIsFocused(false);
                                onBlur?.();
                            }}
                        />
                        <ComposerActionButton
                            action={thinking ? 'stop' : 'send'}
                            loading={creatingSession}
                            disabled={creatingSession || stopping || (!input && !thinking)}
                            // Keep focus stable on tap; the explicit blur in handleSubmit is the only
                            // focus change, so the keyboard closes once and stays closed.
                            onMouseDown={event => event.preventDefault()}
                            onClick={handleSubmit}
                            density={uiDensity}
                        />
                    </>
                );
        }
    }

    return (
        <div
            className={cn(
                isCompactMode || hideBackground
                    ? 'gai:bg-transparent'
                    : enteredInChatMode
                      ? 'gai:bg-utility-white'
                      : 'gai:bg-primary-50'
            )}
        >
            <div className='gai:flex gai:w-full gai:justify-center'>
                <div
                    className={cn(
                        // xs density: no max-width cap — fill the narrow column fully.
                        uiDensity === 'xs'
                            ? 'gai:box-border gai:flex gai:h-fit! gai:w-full gai:items-end gai:gap-1'
                            : 'gai:box-border gai:flex gai:h-fit! gai:w-full gai:max-w-[472px] gai:items-end gai:gap-2 gai:p-2',
                        isCompactMode
                            ? cn(isLoading ? 'gai:cursor-default' : 'gai:cursor-pointer', 'gai:bg-transparent')
                            : 'gai:border-t gai:border-[#DFE1E3] gai:bg-white',
                        uiDensity === 'xs' && 'gai:p-1'
                    )}
                    onClick={handleInputPillClick}
                >
                    {/* Avatar */}
                    <div
                        className={cn(
                            'gai:flex gai:flex-shrink-0 gai:items-center gai:justify-center gai:overflow-hidden gai:rounded-[30px]',
                            DENSITY[uiDensity].avatar,
                            isCompactMode
                                ? cn(
                                      isLoading ? 'gai:cursor-default' : 'gai:cursor-pointer',
                                      'gai:border gai:border-[rgba(255,255,255,0.18)] gai:bg-[rgba(255,255,255,0.12)]'
                                  )
                                : 'gai:border-[1.25px] gai:border-[#DFE1E3] gai:bg-[#F7F9FF]'
                        )}
                        onClick={handleInputPillClick}
                    >
                        <img src={OCTO_AVATAR_SRC} alt='Octo' className='gai:h-full gai:w-full' />
                    </div>

                    {/* Input surface — swaps editable ↔ prompt preview by status */}
                    <div
                        className={cn(
                            'gai:box-border gai:flex gai:w-full gai:max-w-full gai:min-w-0 gai:overflow-hidden gai:rounded-[8px] gai:transition-shadow gai:duration-150',
                            isCompactMode ? 'gai:bg-white' : 'gai:bg-[#EFF3FF]',
                            status.kind === 'countdownFull'
                                ? 'gai:min-h-[64px] gai:flex-col gai:items-stretch gai:gap-2 gai:px-3 gai:py-2'
                                : cn(DENSITY[uiDensity].inputMinHeight, 'gai:items-end gai:gap-4 gai:px-2 gai:py-1'),
                            // Focus ring — only on the editable state, matching standard LLM inputs.
                            isFocused && !counting && 'gai:ring-2 gai:ring-primary-300 gai:ring-inset',
                            preventFocus && 'gai:cursor-pointer',
                            uiDensity === 'xs' && 'gai:gap-1 gai:p-1'
                        )}
                        onClick={preventFocus ? handleExpand : undefined}
                    >
                        {renderStatus()}
                    </div>
                </div>
            </div>
        </div>
    );
}
