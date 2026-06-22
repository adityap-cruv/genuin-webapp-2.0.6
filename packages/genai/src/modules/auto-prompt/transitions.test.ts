import { describe, expect, it } from 'vitest';

import { DEFAULT_AUTO_PROMPT_CONFIG } from '@/modules/lifecycle/auto-prompt-config';

import { INITIAL_CYCLE, INITIAL_SNAPSHOT, type MachineContext, type MachineDeps } from './context';
import { State, EventKind } from './states';
import { transition } from './transitions';

/** Minimal deps stub — transitions only read getConfig / getCurrentSessionId / getRenderMode / getSuggestedPrompts. */
function makeDeps(overrides: Partial<MachineDeps> = {}): MachineDeps {
  return {
    getCurrentSessionId: () => 'sess-1',
    getSessions: () => [],
    getSuggestedPrompts: () => ['p1', 'p2'],
    getCachedResponses: () => new Map(),
    getRenderMode: () => 'full',
    getIsBusy: () => false,
    getParentOctoPanelId: () => 'panel-1',
    getConfig: () => ({ ...DEFAULT_AUTO_PROMPT_CONFIG }),
    handleSendMessage: () => undefined,
    handleNewChat: () => undefined,
    playCachedResponse: () => undefined,
    setInput: () => undefined,
    setWebSdkRenderMode: () => undefined,
    setIsSuggestionsOpen: () => undefined,
    setShowPresetPromptsExternal: () => undefined,
    setSessions: () => undefined,
    analytics: {
      trackAutoPromptCountdownStarted: () => undefined,
      trackAutoPromptExecuted: () => undefined,
      trackAutoPromptCancelled: () => undefined,
    },
    ...overrides,
  };
}

function ctxIn(state: State, deps: MachineDeps): MachineContext {
  return { state, snapshot: { ...INITIAL_SNAPSHOT }, cycle: { ...INITIAL_CYCLE }, deps };
}

describe('CHAT_CLOSE_DUE auto-close effects', () => {
  it('collapse-loop: resets input + collapses to compact but does NOT clear the session', () => {
    const deps = makeDeps({ getConfig: () => ({ ...DEFAULT_AUTO_PROMPT_CONFIG, afterResponse: 'collapse-loop' }) });
    const t = transition(ctxIn(State.CHAT_CLOSE_DELAY, deps), { kind: EventKind.CHAT_CLOSE_DUE });

    const kinds = t.effects.map(e => e.kind);
    expect(kinds).toEqual(['setInput', 'setRenderMode']);
    expect(kinds).not.toContain('clearSession');
    expect(t.next).toBe(State.POST_CLOSE_IDLE);
    expect(t.snapshotPatch.isPostCloseMode).toBe(true);
  });

  it('hold-loop: no effects, stays full', () => {
    const deps = makeDeps({ getConfig: () => ({ ...DEFAULT_AUTO_PROMPT_CONFIG, afterResponse: 'hold-loop' }) });
    const t = transition(ctxIn(State.CHAT_CLOSE_DELAY, deps), { kind: EventKind.CHAT_CLOSE_DUE });
    expect(t.effects).toEqual([]);
    expect(t.next).toBe(State.POST_CLOSE_IDLE);
  });

  it('stop: terminates the cycle', () => {
    const deps = makeDeps({ getConfig: () => ({ ...DEFAULT_AUTO_PROMPT_CONFIG, afterResponse: 'stop' }) });
    const t = transition(ctxIn(State.CHAT_CLOSE_DELAY, deps), { kind: EventKind.CHAT_CLOSE_DUE });
    expect(t.next).toBe(State.TERMINATED);
  });
});

describe('COUNTDOWN_TAKEOVER — take over a counting prompt and send now', () => {
  function countingCtx(state: State, deps: MachineDeps, sessionId: string | null): MachineContext {
    return {
      state,
      snapshot: { ...INITIAL_SNAPSHOT, countdown: 4, showDummyMessage: true, activePrompt: 'p1' },
      cycle: { ...INITIAL_CYCLE, activePrompt: 'p1', targetSessionId: sessionId },
      deps,
    };
  }

  it('from COUNTDOWN (full mode): sends new session, expands to full, never terminates', () => {
    const deps = makeDeps();
    const t = transition(countingCtx(State.COUNTDOWN, deps, null), { kind: EventKind.COUNTDOWN_TAKEOVER });

    expect(t.next).toBe(State.SENDING);
    expect(t.next).not.toBe(State.TERMINATED);
    expect(t.cyclePatch.targetSessionId).toBe(null);
    expect(t.exit).toContain('countdown');
    const kinds = t.effects.map(e => e.kind);
    expect(kinds).toContain('setRenderMode');
    expect(kinds).toContain('invokeSend');
    expect(t.snapshotPatch.countdown).toBe(null);
    expect(t.snapshotPatch.showDummyMessage).toBe(false);
  });

  it('from COUNTDOWN in countdown-only mode: ignored (no auto-send)', () => {
    const deps = makeDeps({
      getConfig: () => ({ ...DEFAULT_AUTO_PROMPT_CONFIG, autoSend: false }),
    });
    const t = transition(countingCtx(State.COUNTDOWN, deps, null), { kind: EventKind.COUNTDOWN_TAKEOVER });
    expect(t.drop).toBe(true);
    expect(t.next).toBe(State.COUNTDOWN);
  });

  it('from NEXT_PROMPT_COUNTDOWN: sends into the current session (append)', () => {
    const deps = makeDeps({ getCurrentSessionId: () => 'sess-9' });
    const t = transition(countingCtx(State.NEXT_PROMPT_COUNTDOWN, deps, null), {
      kind: EventKind.COUNTDOWN_TAKEOVER,
    });
    expect(t.next).toBe(State.SENDING);
    expect(t.cyclePatch.targetSessionId).toBe('sess-9');
    expect(t.effects.map(e => e.kind)).toContain('invokeSend');
  });

  it('from PANEL_CARRY_OVER: sends into the carried-over session, clears panel countdown', () => {
    const deps = makeDeps();
    const t = transition(countingCtx(State.PANEL_CARRY_OVER, deps, 'sess-carry'), {
      kind: EventKind.COUNTDOWN_TAKEOVER,
    });
    expect(t.next).toBe(State.SENDING);
    expect(t.cyclePatch.targetSessionId).toBe('sess-carry');
    expect(t.exit).toContain('panelCarryOver');
    expect(t.snapshotPatch.panelViewCountdown).toBe(null);
  });
});
