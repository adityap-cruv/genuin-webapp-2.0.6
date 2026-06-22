/**
 * The Octo composer's single source of truth: one status drives which surface + action button
 * the composer renders.
 *
 * Precedence: countdown-only → full auto-prompt → suggested → editable
 */

export type ComposerStatus =
    | { kind: 'editable' }
    /** Compact idea: read-only suggested prompt with a send button. */
    | { kind: 'suggested'; prompt: string }
    /** Countdown-only mode: single-line read-only prompt with an inline counter. */
    | { kind: 'countdownInline'; prompt: string; seconds: number }
    /** Full auto-prompt counting: two-row "Prompting in…" layout with a counter. */
    | { kind: 'countdownFull'; prompt: string; seconds: number };

export interface DeriveComposerStatusArgs {
    /** `autoPromptMode === 'disabled'`. */
    isDisabled: boolean;
    /** `autoPromptMode === 'countdown-only'`. */
    isCountdownOnly: boolean;
    /** Render mode is the compact pill. */
    isCompactMode: boolean;
    /** The active session already has user messages. */
    hasUserMessages: boolean;
    suggestedPrompt: string | undefined;
    countdown: number | null;
    /** Current typed input — any text suppresses the auto-prompt surfaces. */
    input: string;
}

/** Pure mapping from auto-prompt/session signals to the composer status. */
export function deriveComposerStatus(args: DeriveComposerStatusArgs): ComposerStatus {
    const { isDisabled, isCountdownOnly, isCompactMode, hasUserMessages, suggestedPrompt, countdown, input } = args;

    const showCountdownTimer = countdown !== null && countdown > 0;
    const hasPrompt = !!suggestedPrompt && !input;

    if (isCountdownOnly && showCountdownTimer && hasPrompt) {
        return { kind: 'countdownInline', prompt: suggestedPrompt!, seconds: countdown! };
    }
    if (!isDisabled && !isCountdownOnly && showCountdownTimer && hasPrompt) {
        return { kind: 'countdownFull', prompt: suggestedPrompt!, seconds: countdown! };
    }
    if (!isDisabled && isCompactMode && !hasUserMessages && suggestedPrompt !== undefined) {
        return { kind: 'suggested', prompt: suggestedPrompt };
    }
    return { kind: 'editable' };
}

/** True while an auto-prompt is counting down (inline or full). */
export function isCountingStatus(status: ComposerStatus): boolean {
    return status.kind === 'countdownInline' || status.kind === 'countdownFull';
}
