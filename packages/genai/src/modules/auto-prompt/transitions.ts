import type { CountdownActiveSource } from '@/core/events/eventRegistry';

import type { CycleState, MachineContext, Snapshot } from './context';
import { INITIAL_CYCLE } from './context';
import { State, EventKind, type Event, type CancelSource, cancelSourceToCountdownSource } from './states';

/** Step kinds — one timer-owning module each. */
export type StepKind = 'countdown' | 'chatCloseDelay' | 'nextPromptDelay' | 'panelCarryOver';

/** Side-effects requested by a transition. Executed by the machine runner in order. */
export type Effect =
    | { kind: 'emitCountdownActive'; isActive: boolean; source: CountdownActiveSource }
    | { kind: 'setRenderMode'; mode: 'compact' | 'full' }
    | { kind: 'setInput'; value: string }
    | { kind: 'clearSession' }
    | { kind: 'invokeSend' }
    | { kind: 'trackCountdownStarted'; prompt: string; countdown_duration: number }
    | { kind: 'trackExecuted'; prompt: string }
    | { kind: 'trackCancelled'; prompt: string; seconds_remaining: number };

/** Result of `transition(ctx, event)`. */
export interface Transition {
    next: State;
    /** Partial snapshot patch. Merged onto current snapshot; only listed fields change. */
    snapshotPatch: Partial<Snapshot>;
    /** Partial cycle patch. Merged onto current cycle state. */
    cyclePatch: Partial<CycleState>;
    /** Step kinds to tear down (exit). */
    exit: StepKind[];
    /** Step kinds to start (enter). */
    enter: StepKind[];
    /** Side-effects requested in order. */
    effects: Effect[];
    /** True if the event should be silently dropped (no transition, no patches). */
    drop?: boolean;
}

/** Fields a transition can override; the rest default to empty. */
type TransitionPatch = Partial<Omit<Transition, 'next' | 'drop'>>;

/** Build a transition, defaulting the empty collections so each case lists only what differs. */
function to(next: State, patch: TransitionPatch = {}): Transition {
    return {
        next,
        snapshotPatch: patch.snapshotPatch ?? {},
        cyclePatch: patch.cyclePatch ?? {},
        exit: patch.exit ?? [],
        enter: patch.enter ?? [],
        effects: patch.effects ?? [],
    };
}

/** Drop the event — stay in `state`, apply nothing. */
function noop(state: State): Transition {
    return { ...to(state), drop: true };
}

/** Decrement the active countdown field by one, staying in the same state. */
function tick(
    state: State,
    field: 'countdown' | 'panelViewCountdown',
    snapshot: Snapshot,
): Transition {
    return to(state, { snapshotPatch: { [field]: (snapshot[field] ?? 0) - 1 } });
}

function getCountdownSeconds(ctx: MachineContext): number {
    return Math.round(ctx.deps.getConfig().timings.countdownMs / 1000);
}

/** Pick the next prompt from the rotation; returns null if list empty. */
function selectPrompt(ctx: MachineContext, index: number): string | null {
    const prompts = ctx.deps.getSuggestedPrompts();
    if (prompts.length === 0) return null;
    return prompts[index % prompts.length] ?? null;
}

/** Build a transition that starts a countdown for `prompt` using `timerKey`. */
function startCountdown(
    ctx: MachineContext,
    prompt: string,
    timerKey: CycleState['countdownTimerKey'],
    source: CountdownActiveSource,
): Transition {
    const seconds = getCountdownSeconds(ctx);
    return to(State.COUNTDOWN, {
        snapshotPatch: {
            showDummyMessage: true,
            countdown: seconds,
            panelViewCountdown: null,
            activePrompt: prompt,
        },
        cyclePatch: { activePrompt: prompt, countdownTimerKey: timerKey, nextCountdownSource: source },
        enter: ['countdown'],
        effects: [
            { kind: 'emitCountdownActive', isActive: true, source },
            { kind: 'trackCountdownStarted', prompt, countdown_duration: seconds },
        ],
    });
}

/**
 * Transition fired when a countdown completes and the prompt should be sent.
 * `targetSessionId` distinguishes the first send (null → new session) from a
 * post-close continuation (live session id → append to current chat).
 */
function sendOnComplete(
    ctx: MachineContext,
    prompt: string,
    targetSessionId: string | null,
    exit: StepKind[],
): Transition {
    const renderMode = ctx.deps.getRenderMode();
    return to(State.SENDING, {
        snapshotPatch: { showDummyMessage: false, countdown: null },
        cyclePatch: {
            targetSessionId,
            needsExpandOnQueue: ctx.snapshot.isPostCloseMode && renderMode === 'compact',
        },
        exit,
        effects: [
            { kind: 'trackExecuted', prompt },
            { kind: 'invokeSend' },
        ],
    });
}

/**
 * User-initiated takeover of a counting-down prompt: skip the remaining
 * countdown, ensure full-view, and send the active prompt now. Distinct from
 * cancellation — the cycle proceeds through SENDING → AWAITING_RESPONSE so the
 * response is shown, then continues per config. `targetSessionId` is null for
 * the first send (new session) and the live id for a post-close continuation.
 */
function takeoverAndSend(
    prompt: string,
    targetSessionId: string | null,
    exit: StepKind[],
): Transition {
    return to(State.SENDING, {
        snapshotPatch: {
            showDummyMessage: false,
            countdown: null,
            panelViewCountdown: null,
        },
        cyclePatch: { targetSessionId, needsExpandOnQueue: false },
        exit,
        effects: [
            { kind: 'emitCountdownActive', isActive: false, source: 'input_start' },
            { kind: 'setRenderMode', mode: 'full' },
            { kind: 'trackExecuted', prompt },
            { kind: 'invokeSend' },
        ],
    });
}

/** Transition into AWAITING_RESPONSE from an active countdown — clears the badge. */
function awaitFromCountdown(extraSnapshot: Partial<Snapshot>): Transition {
    return to(State.AWAITING_RESPONSE, {
        snapshotPatch: { showDummyMessage: false, countdown: null, ...extraSnapshot },
        exit: ['countdown'],
        effects: [{ kind: 'emitCountdownActive', isActive: false, source: 'input_start' }],
    });
}

/** Cancellation builder — explicit user interaction permanently terminates the cycle. */
function cancel(ctx: MachineContext, source: CancelSource, exit: StepKind[]): Transition {
    const prompt = ctx.cycle.activePrompt;
    const secondsRemaining = ctx.snapshot.countdown ?? ctx.snapshot.panelViewCountdown ?? 0;
    const effects: Effect[] = [
        { kind: 'emitCountdownActive', isActive: false, source: cancelSourceToCountdownSource(source) },
    ];
    if (prompt) {
        effects.push({ kind: 'trackCancelled', prompt, seconds_remaining: secondsRemaining });
    }
    return to(State.TERMINATED, {
        snapshotPatch: { countdown: null, panelViewCountdown: null, showDummyMessage: false, activePrompt: null },
        exit,
        effects,
    });
}

/** Transition that begins (or resets) the AGENT_RESPONSE_DONE → close delay, guarding re-arm. */
function startCloseDelay(ctx: MachineContext, messageId: string): Transition | null {
    if (ctx.cycle.cycleStartedForMessageId === messageId) return null;
    return to(State.CHAT_CLOSE_DELAY, {
        cyclePatch: { cycleStartedForMessageId: messageId },
        enter: ['chatCloseDelay'],
    });
}

/** Reset to a clean state — used by SESSION_STARTED/CLEARED out of CANCELLED/AWAITING. */
function reset(next: State): Transition {
    return to(next, { snapshotPatch: { isPostCloseMode: false }, cyclePatch: { ...INITIAL_CYCLE } });
}

/**
 * Pure transition function. No I/O, no React.
 * Returns the next state plus the patches and effects the machine runner should apply.
 */
export function transition(ctx: MachineContext, event: Event): Transition {
    const { state, cycle, snapshot } = ctx;
    const config = ctx.deps.getConfig();
    // Legacy `mode` projection so the existing switch logic is untouched.
    const mode: 'disabled' | 'countdown-only' | 'full' = !config.enabled
        ? 'disabled'
        : config.autoSend
          ? 'full'
          : 'countdown-only';

    // PROMPTS_REFRESHED resets rotation in every live state, but not once terminated.
    if (event.kind === EventKind.PROMPTS_REFRESHED) {
        if (state === State.TERMINATED || state === State.CANCELLED) return noop(state);
        return to(state, { cyclePatch: { promptIndex: 1, cycleStartedForMessageId: null } });
    }

    switch (state) {
        case State.IDLE: {
            if (event.kind === EventKind.CONFIG_READY) {
                if (mode === 'disabled') return noop(state);
                const prompt = selectPrompt(ctx, 0);
                if (!prompt) return noop(state);
                return startCountdown(ctx, prompt, 'countdown', 'countdown_started');
            }
            if (event.kind === EventKind.EXTERNAL_AUTO_CLOSE) {
                return to(State.POST_CLOSE_IDLE, {
                    snapshotPatch: { isPostCloseMode: true },
                    enter: ['nextPromptDelay'],
                });
            }
            if (event.kind === EventKind.AGENT_RESPONSE_DONE && mode === 'full') {
                return startCloseDelay(ctx, event.messageId) ?? noop(state);
            }
            if (event.kind === EventKind.SESSION_STARTED) {
                return to(State.AWAITING_RESPONSE);
            }
            return noop(state);
        }

        case State.COUNTDOWN: {
            if (event.kind === EventKind.COUNTDOWN_TICK) {
                return tick(state, 'countdown', snapshot);
            }
            if (event.kind === EventKind.COUNTDOWN_COMPLETE) {
                const prompt = cycle.activePrompt ?? '';
                if (mode === 'countdown-only') {
                    return to(State.IDLE, {
                        snapshotPatch: { showDummyMessage: false, countdown: null, activePrompt: null },
                        exit: ['countdown'],
                        effects: [{ kind: 'setInput', value: prompt }],
                    });
                }
                return sendOnComplete(ctx, prompt, null, ['countdown']);
            }
            if (event.kind === EventKind.COUNTDOWN_TAKEOVER) {
                if (mode === 'countdown-only') return noop(state);
                return takeoverAndSend(cycle.activePrompt ?? '', null, ['countdown']);
            }
            if (event.kind === EventKind.USER_INTERACTED) {
                return cancel(ctx, event.source, ['countdown']);
            }
            if (event.kind === EventKind.BUSY_CHANGED && event.isBusy) {
                return to(State.IDLE, {
                    snapshotPatch: { showDummyMessage: false, countdown: null },
                    exit: ['countdown'],
                });
            }
            if (event.kind === EventKind.RENDER_MODE_CHANGED && event.mode === 'full') {
                const remaining = snapshot.countdown ?? 0;
                if (remaining <= 0) return noop(state);
                return to(State.PANEL_CARRY_OVER, {
                    snapshotPatch: { countdown: null, panelViewCountdown: remaining },
                    cyclePatch: {
                        countdownTimerKey: 'panelCountdown',
                        targetSessionId: ctx.deps.getCurrentSessionId(),
                    },
                    exit: ['countdown'],
                    enter: ['panelCarryOver'],
                });
            }
            if (event.kind === EventKind.SESSION_STARTED) {
                return awaitFromCountdown({});
            }
            return noop(state);
        }

        case State.SENDING: {
            if (event.kind === EventKind.SEND_QUEUED) {
                const effects: Effect[] = cycle.needsExpandOnQueue
                    ? [{ kind: 'setRenderMode', mode: 'full' }]
                    : [];
                return to(State.AWAITING_RESPONSE, {
                    snapshotPatch: { countdown: null, panelViewCountdown: null, activePrompt: null },
                    cyclePatch: { needsExpandOnQueue: false },
                    effects,
                });
            }
            if (event.kind === EventKind.SESSION_STARTED) {
                return to(State.AWAITING_RESPONSE);
            }
            if (event.kind === EventKind.USER_INTERACTED) {
                return cancel(ctx, event.source, []);
            }
            return noop(state);
        }

        case State.AWAITING_RESPONSE: {
            if (event.kind === EventKind.AGENT_RESPONSE_DONE) {
                if (mode !== 'full') return noop(state);
                return startCloseDelay(ctx, event.messageId) ?? noop(state);
            }
            if (event.kind === EventKind.USER_INTERACTED) {
                return cancel(ctx, event.source, []);
            }
            if (event.kind === EventKind.SESSION_CLEARED) {
                return reset(State.IDLE);
            }
            return noop(state);
        }

        case State.CHAT_CLOSE_DELAY: {
            if (event.kind === EventKind.CHAT_CLOSE_DUE) {
                const after = ctx.deps.getConfig().afterResponse;
                if (after === 'stop') {
                    return to(State.TERMINATED, {
                        snapshotPatch: { isPostCloseMode: false, showDummyMessage: false, countdown: null },
                        exit: ['chatCloseDelay'],
                    });
                }
                // `hold-loop` stays full; `collapse-loop` resets input and collapses to compact.
                // The lifecycle phase drives the sheet transition — no separate auto-close emit needed.
                // Session is intentionally NOT cleared — the next prompt appends to the same chat.
                const closeEffects: Effect[] = after === 'hold-loop'
                    ? []
                    : [
                          { kind: 'setInput', value: '' },
                          { kind: 'setRenderMode', mode: 'compact' },
                      ];
                return to(State.POST_CLOSE_IDLE, {
                    snapshotPatch: { isPostCloseMode: true },
                    exit: ['chatCloseDelay'],
                    enter: ['nextPromptDelay'],
                    effects: closeEffects,
                });
            }
            if (event.kind === EventKind.USER_INTERACTED) {
                return cancel(ctx, event.source, ['chatCloseDelay']);
            }
            return noop(state);
        }

        case State.POST_CLOSE_IDLE: {
            if (event.kind === EventKind.NEXT_PROMPT_DUE) {
                const idx = cycle.promptIndex;
                const prompt = selectPrompt(ctx, idx);
                if (!prompt) return noop(state);
                const seconds = getCountdownSeconds(ctx);
                return to(State.NEXT_PROMPT_COUNTDOWN, {
                    snapshotPatch: { showDummyMessage: true, countdown: seconds, activePrompt: prompt },
                    cyclePatch: {
                        activePrompt: prompt,
                        promptIndex: idx + 1,
                        countdownTimerKey: 'nextPromptCountdown',
                        nextCountdownSource: 'countdown_started',
                    },
                    exit: ['nextPromptDelay'],
                    enter: ['countdown'],
                    effects: [
                        { kind: 'emitCountdownActive', isActive: true, source: 'countdown_started' },
                        { kind: 'trackCountdownStarted', prompt, countdown_duration: seconds },
                    ],
                });
            }
            if (event.kind === EventKind.SESSION_STARTED) {
                return to(State.AWAITING_RESPONSE, {
                    snapshotPatch: { isPostCloseMode: false },
                    exit: ['nextPromptDelay'],
                });
            }
            if (event.kind === EventKind.USER_INTERACTED) {
                return cancel(ctx, event.source, ['nextPromptDelay']);
            }
            return noop(state);
        }

        case State.NEXT_PROMPT_COUNTDOWN: {
            if (event.kind === EventKind.COUNTDOWN_TICK) {
                return tick(state, 'countdown', snapshot);
            }
            if (event.kind === EventKind.COUNTDOWN_COMPLETE) {
                // Continue in the same session so the next prompt appends to the
                // current chat instead of spawning a new conversation.
                return sendOnComplete(ctx, cycle.activePrompt ?? '', ctx.deps.getCurrentSessionId(), [
                    'countdown',
                ]);
            }
            if (event.kind === EventKind.COUNTDOWN_TAKEOVER) {
                return takeoverAndSend(cycle.activePrompt ?? '', ctx.deps.getCurrentSessionId(), [
                    'countdown',
                ]);
            }
            if (event.kind === EventKind.USER_INTERACTED) {
                return cancel(ctx, event.source, ['countdown']);
            }
            if (event.kind === EventKind.SESSION_STARTED) {
                return awaitFromCountdown({ isPostCloseMode: false });
            }
            // BUSY_CHANGED is *deliberately* not handled here — the previous
            // session's residual busy state must not kill the post-close cycle.
            return noop(state);
        }

        case State.PANEL_CARRY_OVER: {
            if (event.kind === EventKind.COUNTDOWN_TICK) {
                return tick(state, 'panelViewCountdown', snapshot);
            }
            if (event.kind === EventKind.COUNTDOWN_COMPLETE) {
                return to(State.SENDING, {
                    snapshotPatch: { panelViewCountdown: null },
                    cyclePatch: { needsExpandOnQueue: false },
                    exit: ['panelCarryOver'],
                    effects: [
                        { kind: 'trackExecuted', prompt: cycle.activePrompt ?? '' },
                        { kind: 'invokeSend' },
                    ],
                });
            }
            if (event.kind === EventKind.COUNTDOWN_TAKEOVER) {
                return takeoverAndSend(cycle.activePrompt ?? '', cycle.targetSessionId, [
                    'panelCarryOver',
                ]);
            }
            if (event.kind === EventKind.USER_INTERACTED) {
                return cancel(ctx, event.source, ['panelCarryOver']);
            }
            if (event.kind === EventKind.RENDER_MODE_CHANGED && event.mode === 'compact') {
                return cancel(ctx, 'local', ['panelCarryOver']);
            }
            return noop(state);
        }

        case State.CANCELLED: {
            // CANCELLED is a transient state — USER_INTERACTED moves directly to TERMINATED now,
            // so this case is only reached by legacy paths. Treat it the same as TERMINATED.
            return noop(state);
        }

        case State.TERMINATED: {
            // User explicitly interacted — cycle is dead for this component lifetime.
            // Drop every event including session changes and config-ready signals.
            return noop(state);
        }

        default:
            return noop(state);
    }
}
