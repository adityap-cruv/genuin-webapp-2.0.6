import { afterEach, describe, expect, it, vi } from 'vitest';

import { EventBus, eventBus } from './EventBus';
import { EVENTS } from './eventRegistry';

describe('EventBus', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('emit dispatches a CustomEvent with the correct name and detail', () => {
    const bus = new EventBus();
    const spy = vi.spyOn(window, 'dispatchEvent');

    bus.emit(EVENTS.WEB_SDK_ERROR, { parentOctoPanelId: 'panel-1' });

    expect(spy).toHaveBeenCalledTimes(1);
    const dispatched = spy.mock.calls[0]?.[0] as CustomEvent;
    expect(dispatched).toBeInstanceOf(CustomEvent);
    expect(dispatched.type).toBe(EVENTS.WEB_SDK_ERROR);
    expect(dispatched.detail).toEqual({ parentOctoPanelId: 'panel-1' });
  });

  it('on returns a working unsubscribe; handler stops firing after unsub', () => {
    const bus = new EventBus();
    const handler = vi.fn();

    const unsub = bus.on(EVENTS.SHARE_LINK, handler);
    bus.emit(EVENTS.SHARE_LINK, { sessionId: 'abc' });
    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith({ sessionId: 'abc' });

    unsub();
    bus.emit(EVENTS.SHARE_LINK, { sessionId: 'def' });
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('once fires exactly once and auto-unsubscribes', () => {
    const bus = new EventBus();
    const handler = vi.fn();

    bus.once(EVENTS.WEB_SDK_THINKING_STARTED, handler);
    bus.emit(EVENTS.WEB_SDK_THINKING_STARTED, { parentOctoPanelId: 'p' });
    bus.emit(EVENTS.WEB_SDK_THINKING_STARTED, { parentOctoPanelId: 'p' });

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('waitFor resolves with payload on the next emit', async () => {
    const bus = new EventBus();
    const promise = bus.waitFor(EVENTS.SESSION_ID_UPDATE);
    bus.emit(EVENTS.SESSION_ID_UPDATE, { sessionId: 's-1' });
    await expect(promise).resolves.toEqual({ sessionId: 's-1' });
  });

  it('waitFor rejects when no event arrives before timeout', async () => {
    vi.useFakeTimers();
    const bus = new EventBus();
    const promise = bus.waitFor(EVENTS.WEB_SDK_AUTO_CLOSE, 50);
    vi.advanceTimersByTime(60);
    await expect(promise).rejects.toThrow(/timed out/);
    vi.useRealTimers();
  });

  it('exports a module-level singleton', () => {
    expect(eventBus).toBeInstanceOf(EventBus);
  });

  it('emit and on are no-ops when window is undefined (SSR)', () => {
    // Simulate SSR by stubbing window to undefined for the duration of this test.
    const originalWindow = globalThis.window;
    // @ts-expect-error — intentionally delete window to simulate SSR.
    delete (globalThis as { window?: Window }).window;

    try {
      const bus = new EventBus();
      const handler = vi.fn();
      const unsub = bus.on(EVENTS.WEB_SDK_ERROR, handler);
      expect(() => bus.emit(EVENTS.WEB_SDK_ERROR, { parentOctoPanelId: 'x' })).not.toThrow();
      expect(handler).not.toHaveBeenCalled();
      expect(() => unsub()).not.toThrow();
    } finally {
      (globalThis as { window?: Window }).window = originalWindow;
    }
  });

  it('rejects wrong-shape payloads at the type level', () => {
    const bus = new EventBus();
    // Tripwire: if the EventPayloads map ever loses its discrimination this
    // line will silently compile. The @ts-expect-error must remain an error.
    // @ts-expect-error — SHARE_LINK requires { sessionId } not { wrongField }.
    bus.emit(EVENTS.SHARE_LINK, { wrongField: 1 });
    expect(true).toBe(true);
  });
});
