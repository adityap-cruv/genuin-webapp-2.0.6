import type { Timers } from './Timers';
import type { MachineContext, TimerKey } from './context';
import { EventKind, type Event } from './states';
import type { StepKind } from './transitions';

/** Synchronous event dispatch back into the machine. */
export type SendFn = (event: Event) => void;

/** Each step owns ≤1 timer key. Enter starts the timer; exit clears it. */
export interface Step {
    readonly kind: StepKind;
    enter(ctx: MachineContext, timers: Timers, send: SendFn): void;
    exit(ctx: MachineContext, timers: Timers): void;
}

/**
 * Builds an interval step that ticks every second, emitting `COUNTDOWN_TICK`
 * while >1 remains and `COUNTDOWN_COMPLETE` on the final tick.
 *
 * The generation-token guard makes a late tick after `clear()` a no-op,
 * closing the `clearInterval` race.
 */
function intervalStep(
    kind: StepKind,
    timerKey: (ctx: MachineContext) => TimerKey,
    remaining: (ctx: MachineContext) => number | null,
): Step {
    return {
        kind,
        enter(ctx, timers, send) {
            const key = timerKey(ctx);
            const gen = timers.generation();
            timers.setInterval(
                key,
                () => {
                    if (timers.generation() !== gen) return;
                    const value = remaining(ctx);
                    send({
                        kind:
                            value !== null && value > 1
                                ? EventKind.COUNTDOWN_TICK
                                : EventKind.COUNTDOWN_COMPLETE,
                    });
                },
                1000,
            );
        },
        exit(ctx, timers) {
            timers.clear(timerKey(ctx));
        },
    };
}

/**
 * Builds a one-shot timeout step. `delayMs` returning `undefined` (or `guard`
 * returning false) skips scheduling. Fires `dueEvent` when the timer elapses.
 */
function timeoutStep(
    kind: StepKind,
    timerKey: TimerKey,
    dueEvent: EventKind.CHAT_CLOSE_DUE | EventKind.NEXT_PROMPT_DUE,
    delayMs: (ctx: MachineContext) => number | undefined,
    guard?: (ctx: MachineContext) => boolean,
): Step {
    return {
        kind,
        enter(ctx, timers, send) {
            if (guard && !guard(ctx)) return;
            const ms = delayMs(ctx);
            if (ms === undefined) return;
            const gen = timers.generation();
            timers.setTimeout(
                timerKey,
                () => {
                    if (timers.generation() !== gen) return;
                    send({ kind: dueEvent });
                },
                ms,
            );
        },
        exit(_ctx, timers) {
            timers.clear(timerKey);
        },
    };
}

// Drives 'countdown' / 'nextPromptCountdown' / 'panelCountdown' — active key read
// from ctx.cycle.countdownTimerKey, which also decides whether the value comes
// from the panel-view countdown or the compact countdown.
const countdownStep = intervalStep(
    'countdown',
    ctx => ctx.cycle.countdownTimerKey,
    ctx =>
        ctx.cycle.countdownTimerKey === 'panelCountdown'
            ? ctx.snapshot.panelViewCountdown
            : ctx.snapshot.countdown,
);

// Carry-over countdown after a compact→full switch — always the panelCountdown timer.
const panelCarryOverStep = intervalStep(
    'panelCarryOver',
    () => 'panelCountdown',
    ctx => ctx.snapshot.panelViewCountdown,
);

// responseHoldMs wait after the agent response completes, before auto-closing the panel.
const chatCloseDelayStep = timeoutStep(
    'chatCloseDelay',
    'idle',
    EventKind.CHAT_CLOSE_DUE,
    ctx => ctx.deps.getConfig().timings.responseHoldMs,
);

// loopGapMs wait in POST_CLOSE_IDLE — skipped when no prompts are available.
const nextPromptDelayStep = timeoutStep(
    'nextPromptDelay',
    'videoPlay',
    EventKind.NEXT_PROMPT_DUE,
    ctx => ctx.deps.getConfig().timings.loopGapMs,
    ctx => ctx.deps.getSuggestedPrompts().length > 0,
);

/** Step registry keyed by `Step.kind`. */
export const STEPS: Readonly<Record<StepKind, Step>> = {
    countdown: countdownStep,
    chatCloseDelay: chatCloseDelayStep,
    nextPromptDelay: nextPromptDelayStep,
    panelCarryOver: panelCarryOverStep,
};
