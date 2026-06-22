import { useCallback, useEffect, useRef, useState } from 'react';

import { useInputContext } from '@/stores/input/context';

import { WebSdkPresetPrompts } from './WebSdkPresetPrompts';
import { PromptComposer } from './composer/PromptComposer';

const SEND_COOLDOWN_MS = 2000;

type WebSdkInputProps = {
    hideBackground?: boolean;
    showPresetPrompts: boolean;
    mode?: 'compact' | 'full';
    suggestedPrompt?: string | null;
    countdown?: number | null;
    autoPromptMode?: 'disabled' | 'countdown-only' | 'full';
    isLoadingPrompt?: boolean;
    onActivate?: () => void;
    onInputStart?: () => void;
    onCompactPromptSend?: () => void;
    /** Take over a counting-down prompt → expand + send now (single intent). */
    onTakeoverSend?: () => void;
    /** Cancel a counting-down prompt and make it editable instead of sending. */
    onCancelCountdown?: () => void;
    onClosePresetPrompts: () => void;
    setIsSuggestionsOpen: (isSuggestionsOpen: boolean) => void;
    /** UI density level derived from `webSdkViewSize`. Controls element scaling. */
    uiDensity?: 'xs' | 'sm' | 'base';
    /** Whether to show the suggested prompts popup at all. False for placement views. */
    enableSuggestedPrompts?: boolean;
};

/** Suggested prompts are only shown at base density in full mode. */
function canShowSuggestions(mode: 'compact' | 'full', uiDensity?: 'xs' | 'sm' | 'base'): boolean {
    return mode !== 'compact' && uiDensity !== 'xs' && uiDensity !== 'sm';
}

export function WebSdkInput({
    hideBackground = false,
    showPresetPrompts,
    onClosePresetPrompts,
    setIsSuggestionsOpen,
    mode = 'full',
    suggestedPrompt,
    countdown,
    autoPromptMode,
    onCompactPromptSend,
    onTakeoverSend,
    onCancelCountdown,
    isLoadingPrompt,
    onActivate,
    onInputStart,
    uiDensity,
    enableSuggestedPrompts = true,
}: WebSdkInputProps) {
    const { input } = useInputContext();
    const [focusOpen, setFocusOpen] = useState(false);
    const suppressUntilRef = useRef<number>(0);
    // Pending rAF handle — cancelled if blur fires before the frame executes.
    const focusPendingRef = useRef<number | null>(null);

    const isSuppressed = () => Date.now() < suppressUntilRef.current;

    const closePopup = useCallback(() => {
        setFocusOpen(false);
        setIsSuggestionsOpen(false);
    }, [setIsSuggestionsOpen]);

    const startCooldown = useCallback(() => {
        suppressUntilRef.current = Date.now() + SEND_COOLDOWN_MS;
        closePopup();
        onClosePresetPrompts();
        // After cooldown expires, also clear cycle-driven state so it can't reopen automatically.
        setTimeout(() => onClosePresetPrompts(), SEND_COOLDOWN_MS);
    }, [closePopup, onClosePresetPrompts]);

    // When cycle drives showPresetPrompts to false, mirror it locally.
    useEffect(() => {
        if (!showPresetPrompts) setFocusOpen(false);
    }, [showPresetPrompts]);

    const handleFocusEmpty = useCallback(() => {
        if (isSuppressed()) return;
        // Defer open by one frame — cancellable if blur fires first (mobile tap-outside).
        focusPendingRef.current = requestAnimationFrame(() => {
            focusPendingRef.current = null;
            setFocusOpen(true);
            setIsSuggestionsOpen(true);
        });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [setIsSuggestionsOpen]);

    const handleBlur = useCallback(() => {
        // Cancel pending open if blur fires before the rAF executes.
        if (focusPendingRef.current !== null) {
            cancelAnimationFrame(focusPendingRef.current);
            focusPendingRef.current = null;
        }
        closePopup();
    }, [closePopup]);

    const handleClose = useCallback(() => {
        closePopup();
        onClosePresetPrompts();
    }, [closePopup, onClosePresetPrompts]);

    // Popup only opens on explicit user focus — cycle (showPresetPrompts) never forces it open.
    const isOpen = enableSuggestedPrompts && !input && !isSuppressed() && focusOpen && canShowSuggestions(mode, uiDensity);

    return (
        <div className='gai:relative gai:w-full'>
            <PromptComposer
                hideBackground={hideBackground}
                mode={mode}
                suggestedPrompt={suggestedPrompt ?? undefined}
                countdown={countdown}
                autoPromptMode={autoPromptMode}
                onSuggestedPromptSend={onCompactPromptSend}
                onTakeoverSend={onTakeoverSend}
                onCancelCountdown={onCancelCountdown}
                isLoading={isLoadingPrompt}
                onExpandToFull={onActivate}
                onInputStart={onInputStart}
                onFocusEmpty={handleFocusEmpty}
                onBlur={handleBlur}
                onSendComplete={startCooldown}
                uiDensity={uiDensity}
            />
            {isOpen && <WebSdkPresetPrompts setIsSuggestionsOpen={setIsSuggestionsOpen} onClose={handleClose} />}
        </div>
    );
}
