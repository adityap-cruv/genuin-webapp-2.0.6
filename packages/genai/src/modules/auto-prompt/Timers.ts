type TimerHandle = ReturnType<typeof setTimeout>;

interface TimerEntry {
    handle: TimerHandle;
    type: 'timeout' | 'interval';
}

/**
 * Plain-TS timer registry with a generation token for cancellation safety.
 *
 * Callers capture `generation()` at schedule time and bail in the callback
 * if the value has changed — closes the `clearTimeout` / `clearInterval`
 * race where a callback already on the event loop can fire after clear.
 */
export class Timers {
    private timers = new Map<string, TimerEntry>();
    private gen = 0;

    /** Monotonic counter. Increments on every clear/clearAll. */
    generation(): number {
        return this.gen;
    }

    /** Schedule a one-shot timer. Same key replaces any existing timer. */
    setTimeout(key: string, fn: () => void, ms: number): void {
        this.clear(key);
        const handle = setTimeout(() => {
            this.timers.delete(key);
            fn();
        }, ms);
        this.timers.set(key, { handle, type: 'timeout' });
    }

    /** Schedule a repeating timer. Same key replaces any existing timer. */
    setInterval(key: string, fn: () => void, ms: number): void {
        this.clear(key);
        const handle = setInterval(fn, ms);
        this.timers.set(key, { handle, type: 'interval' });
    }

    /** Cancel a timer by key. No-op if key doesn't exist. Bumps generation. */
    clear(key: string): void {
        const entry = this.timers.get(key);
        if (!entry) return;
        if (entry.type === 'interval') clearInterval(entry.handle);
        else clearTimeout(entry.handle);
        this.timers.delete(key);
        this.gen += 1;
    }

    /** Cancel all active timers. Bumps generation once. */
    clearAll(): void {
        if (this.timers.size === 0) return;
        this.timers.forEach(({ handle, type }) => {
            if (type === 'interval') clearInterval(handle);
            else clearTimeout(handle);
        });
        this.timers.clear();
        this.gen += 1;
    }
}
