import { describe, expect, it } from 'vitest';

import { deriveComposerStatus, isCountingStatus, type DeriveComposerStatusArgs } from './composer-status';

const base: DeriveComposerStatusArgs = {
    isDisabled: false,
    isCountdownOnly: false,
    isCompactMode: false,
    hasUserMessages: false,
    suggestedPrompt: undefined,
    countdown: null,
    input: '',
};

describe('deriveComposerStatus', () => {
    it('defaults to editable', () => {
        expect(deriveComposerStatus(base)).toEqual({ kind: 'editable' });
    });

    it('returns countdownInline for countdown-only mode while a prompt is counting', () => {
        const status = deriveComposerStatus({
            ...base,
            isCountdownOnly: true,
            suggestedPrompt: 'Pick a gift',
            countdown: 5,
        });
        expect(status).toEqual({ kind: 'countdownInline', prompt: 'Pick a gift', seconds: 5 });
    });

    it('returns countdownFull for full auto-prompt while counting', () => {
        const status = deriveComposerStatus({
            ...base,
            suggestedPrompt: 'Pick a gift',
            countdown: 3,
        });
        expect(status).toEqual({ kind: 'countdownFull', prompt: 'Pick a gift', seconds: 3 });
    });

    it('returns suggested in compact mode with a prompt and no user messages', () => {
        const status = deriveComposerStatus({
            ...base,
            isCompactMode: true,
            suggestedPrompt: 'Pick a gift',
        });
        expect(status).toEqual({ kind: 'suggested', prompt: 'Pick a gift' });
    });

    it('falls back to editable once the user has typed', () => {
        expect(
            deriveComposerStatus({ ...base, suggestedPrompt: 'Pick a gift', countdown: 5, input: 'hi' })
        ).toEqual({ kind: 'editable' });
    });

    it('falls back to editable when auto-prompt is disabled', () => {
        expect(
            deriveComposerStatus({ ...base, isDisabled: true, isCompactMode: true, suggestedPrompt: 'x' })
        ).toEqual({ kind: 'editable' });
    });

    it('does not count down when the timer is zero', () => {
        expect(
            deriveComposerStatus({ ...base, isCountdownOnly: true, suggestedPrompt: 'x', countdown: 0 })
        ).toEqual({ kind: 'editable' });
    });

    it('flags counting statuses', () => {
        expect(isCountingStatus({ kind: 'countdownInline', prompt: 'x', seconds: 1 })).toBe(true);
        expect(isCountingStatus({ kind: 'countdownFull', prompt: 'x', seconds: 1 })).toBe(true);
        expect(isCountingStatus({ kind: 'suggested', prompt: 'x' })).toBe(false);
        expect(isCountingStatus({ kind: 'editable' })).toBe(false);
    });
});
