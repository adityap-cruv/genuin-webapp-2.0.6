import { Timers } from './Timers';
import {
    INITIAL_CYCLE,
    INITIAL_SNAPSHOT,
    type MachineContext,
    type MachineDeps,
    type Snapshot,
} from './context';
import { runEffect } from './effects';
import { State, type Event } from './states';
import { STEPS } from './steps';
import { transition, type Effect, type StepKind } from './transitions';

type SnapshotListener = (snapshot: Snapshot) => void;

/**
 * Auto-prompt finite-state machine. Owns the snapshot, cycle state,
 * timers, and step lifecycle. Synchronous `send(event)` entry with
 * single-slot re-entrancy queue.
 */
export class AutoPromptMachine {
    private ctx: MachineContext;
    private timers: Timers;
    private listeners = new Set<SnapshotListener>();
    private inTransition = false;
    private queued: Event | null = null;
    private disposed = false;

    constructor(deps: MachineDeps) {
        this.timers = new Timers();
        this.ctx = {
            state: State.IDLE,
            snapshot: { ...INITIAL_SNAPSHOT },
            cycle: { ...INITIAL_CYCLE },
            deps,
        };
    }

    /** React subscription target. */
    subscribe = (listener: SnapshotListener): (() => void) => {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    };

    /** React snapshot read. Returns the same reference until a state-changing event arrives. */
    getSnapshot = (): Snapshot => this.ctx.snapshot;

    /** Current FSM state — for tests + debugging. */
    getState(): State {
        return this.ctx.state;
    }

    /** Synchronous dispatch. Single-slot re-entrancy queue absorbs nested calls. */
    send = (event: Event): void => {
        if (this.disposed) return;
        if (this.inTransition) {
            this.queued = event;
            return;
        }
        this.inTransition = true;
        try {
            this.process(event);
            while (this.queued) {
                const next = this.queued;
                this.queued = null;
                this.process(next);
            }
        } finally {
            this.inTransition = false;
        }
    };

    /** Tear down all timers, drop listeners. Idempotent. */
    dispose(): void {
        if (this.disposed) return;
        this.disposed = true;
        this.timers.clearAll();
        this.listeners.clear();
    }

    // ── Internal ─────────────────────────────────────────────────────────────

    private process(event: Event): void {
        const t = transition(this.ctx, event);
        if (t.drop) return;

        const prevSnapshot = this.ctx.snapshot;

        // 1. Run exits — clear timers first so no late tick races with new state.
        for (const kind of t.exit) {
            STEPS[kind].exit(this.ctx, this.timers);
        }

        // 2. Apply snapshot + cycle patches before effects run, so effects observe
        //    the new ctx (e.g. invokeSend reads ctx.cycle.activePrompt).
        const candidate: Snapshot = { ...prevSnapshot, ...t.snapshotPatch, state: t.next };
        const nextSnapshot: Snapshot = snapshotChanged(prevSnapshot, candidate) ? candidate : prevSnapshot;
        this.ctx.snapshot = nextSnapshot;
        this.ctx.cycle = { ...this.ctx.cycle, ...t.cyclePatch };
        this.ctx.state = t.next;

        // 3. Run effects in declaration order. Effects may call `send` for synthetic
        //    events — those queue into `this.queued` and process after this returns.
        for (const effect of t.effects) {
            runEffect(effect, this.ctx, this.send);
        }

        // 4. Run enters — start timers after effects so any state mutation from
        //    effects (e.g. setRenderMode → React re-render) doesn't tear down
        //    the new step prematurely.
        for (const kind of t.enter) {
            STEPS[kind as StepKind].enter(this.ctx, this.timers, this.send);
        }

        // 5. Notify React subscribers only if the snapshot actually changed.
        if (nextSnapshot !== prevSnapshot) {
            for (const listener of this.listeners) listener(nextSnapshot);
        }
    }
}

function snapshotChanged(prev: Snapshot, next: Snapshot): boolean {
    return (
        prev.state !== next.state ||
        prev.countdown !== next.countdown ||
        prev.panelViewCountdown !== next.panelViewCountdown ||
        prev.showDummyMessage !== next.showDummyMessage ||
        prev.showPresetPrompts !== next.showPresetPrompts ||
        prev.isPostCloseMode !== next.isPostCloseMode ||
        prev.isBusy !== next.isBusy ||
        prev.activePrompt !== next.activePrompt
    );
}

// Re-export Effect type for callers wanting to mock effects in tests.
export type { Effect };
