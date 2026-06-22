# genai SDK Architectural Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Incrementally add OctoState machine, TimerManager, AutoPromptConfig, LifecycleController, and provider hook decomposition to the genai SDK without breaking existing behavior.

**Architecture:** Each step is additive — no deletions until the replacement is wired and typechecks green. `AgentsProvider` stays the single React context; logic extracts into focused hooks it composes. Existing `AgentsContextType` interface only gains fields, never loses them.

**Tech Stack:** React 19, TypeScript strict, Vite, `pnpm typecheck` + `pnpm build` for validation (no unit test runner in this package).

**Spec:** `docs/superpowers/specs/2026-05-27-genai-refactored-design.md`

---

## File Map

### Created (new files)

| File | Responsibility |
|---|---|
| `packages/genai/src/context/app/octo-state.ts` | `OctoState` enum + transition table + `InvalidStateTransitionError` |
| `packages/genai/src/context/app/hooks/useOctoStateMachine.ts` | State machine hook — `state`, `transition`, `onStateChange` |
| `packages/genai/src/context/app/hooks/useTimerManager.ts` | Centralized timer — `setTimeout`, `setInterval`, `clear`, `clearAll` |
| `packages/genai/src/context/app/hooks/useLifecycleController.ts` | `pause`, `resume`, `cancel`, `destroy` wired to state + timers |
| `packages/genai/src/context/app/hooks/useSessionManager.ts` | Session CRUD, history fetch, reconnect |
| `packages/genai/src/context/app/hooks/useAgentManager.ts` | Agents list, currentAgent, switching |
| `packages/genai/src/context/app/hooks/useStreamManager.ts` | SSE send/connect/cancel wrapper |
| `packages/genai/src/context/app/hooks/useSuggestedPrompts.ts` | Prompts fetch, cache, loading state |
| `packages/genai/src/context/app/hooks/useAutoPrompt.ts` | Countdown + full-view cycle logic (extracted from WebSDKContent) |

### Modified

| File | Changes |
|---|---|
| `packages/genai/src/context/app/types.ts` | Add `octoState`, `lifecycle`, `autoPrompt`, `onStateChange` to `AgentsContextType` |
| `packages/genai/src/context/app/provider.tsx` | Wire new hooks, expose new fields on context value |
| `packages/genai/src/context/AppProviders.tsx` | Add `autoPrompt?: AutoPromptConfig` prop, keep `allowAutoPrompt` compat |
| `packages/genai/src/context/app/hooks/useAppBootstrap.ts` | Accept `transitionOctoState` callback |
| `packages/genai/src/components/WebSDK/WebSDKContent.tsx` | Use `useAutoPrompt` + `useTimerManager`, drop 5 timer refs |

---

## Task 1: OctoState enum + transition table

**Files:**
- Create: `packages/genai/src/context/app/octo-state.ts`

- [ ] **Step 1: Create the file**

```typescript
// packages/genai/src/context/app/octo-state.ts

/** Global lifecycle state for a single genai SDK instance. */
export enum OctoState {
  IDLE             = 'IDLE',
  INITIALIZING     = 'INITIALIZING',
  READY            = 'READY',
  CREATING_SESSION = 'CREATING_SESSION',
  LOADING          = 'LOADING',
  STREAMING        = 'STREAMING',
  PAUSED           = 'PAUSED',
  RESPONDING       = 'RESPONDING',
  CANCELLING       = 'CANCELLING',
  SWITCHING        = 'SWITCHING',
  ERROR            = 'ERROR',
  DESTROYED        = 'DESTROYED',
}

/** Thrown when a transition is not in the allowed table. */
export class InvalidStateTransitionError extends Error {
  constructor(from: OctoState, to: OctoState) {
    super(`Invalid OctoState transition: ${from} → ${to}`);
    this.name = 'InvalidStateTransitionError';
  }
}

/** All valid transitions. Any pair not here is forbidden. */
export const OCTO_TRANSITIONS: Readonly<Record<OctoState, readonly OctoState[]>> = {
  [OctoState.IDLE]:             [OctoState.INITIALIZING],
  [OctoState.INITIALIZING]:     [OctoState.READY, OctoState.ERROR],
  [OctoState.READY]:            [OctoState.CREATING_SESSION, OctoState.SWITCHING, OctoState.DESTROYED],
  [OctoState.CREATING_SESSION]: [OctoState.LOADING, OctoState.ERROR],
  [OctoState.LOADING]:          [OctoState.STREAMING, OctoState.ERROR, OctoState.CANCELLING],
  [OctoState.STREAMING]:        [OctoState.RESPONDING, OctoState.PAUSED, OctoState.CANCELLING, OctoState.ERROR],
  [OctoState.PAUSED]:           [OctoState.STREAMING, OctoState.CANCELLING],
  [OctoState.RESPONDING]:       [OctoState.READY, OctoState.SWITCHING, OctoState.ERROR],
  [OctoState.CANCELLING]:       [OctoState.READY, OctoState.ERROR],
  [OctoState.SWITCHING]:        [OctoState.READY, OctoState.ERROR],
  [OctoState.ERROR]:            [OctoState.READY, OctoState.DESTROYED],
  [OctoState.DESTROYED]:        [],
} as const;

/** Returns true if `from → to` is a valid transition. */
export function isValidTransition(from: OctoState, to: OctoState): boolean {
  return (OCTO_TRANSITIONS[from] as readonly OctoState[]).includes(to);
}
```

- [ ] **Step 2: Typecheck**

```bash
cd packages/genai && pnpm typecheck
```

Expected: no errors related to `octo-state.ts`.

- [ ] **Step 3: Commit**

```bash
git add packages/genai/src/context/app/octo-state.ts
git commit -m "feat(genai): add OctoState enum and transition table"
```

---

## Task 2: useOctoStateMachine hook

**Files:**
- Create: `packages/genai/src/context/app/hooks/useOctoStateMachine.ts`

- [ ] **Step 1: Create the hook**

```typescript
// packages/genai/src/context/app/hooks/useOctoStateMachine.ts
import { useCallback, useRef, useState } from 'react';

import { InvalidStateTransitionError, isValidTransition, OctoState } from '../octo-state';

/** Callback signature for state change subscribers. */
export type OctoStateChangeCallback = (prev: OctoState, next: OctoState) => void;

export interface UseOctoStateMachineResult {
  /** Current global lifecycle state. */
  state: OctoState;
  /**
   * Transition to `next`. Throws `InvalidStateTransitionError` if the
   * transition is not in the allowed table.
   */
  transition: (next: OctoState) => void;
  /**
   * Subscribe to state changes. Returns an unsubscribe function.
   * The callback is stable across renders — no effect dependency needed.
   */
  onStateChange: (cb: OctoStateChangeCallback) => () => void;
}

/**
 * Manages global OctoState lifecycle with validated transitions and
 * pub/sub change notifications.
 */
export function useOctoStateMachine(initial: OctoState = OctoState.IDLE): UseOctoStateMachineResult {
  const [state, setState] = useState<OctoState>(initial);
  const stateRef = useRef<OctoState>(initial);
  const subscribersRef = useRef<Set<OctoStateChangeCallback>>(new Set());

  const transition = useCallback((next: OctoState) => {
    const current = stateRef.current;
    if (!isValidTransition(current, next)) {
      throw new InvalidStateTransitionError(current, next);
    }
    stateRef.current = next;
    setState(next);
    subscribersRef.current.forEach(cb => cb(current, next));
  }, []);

  const onStateChange = useCallback((cb: OctoStateChangeCallback): (() => void) => {
    subscribersRef.current.add(cb);
    return () => {
      subscribersRef.current.delete(cb);
    };
  }, []);

  return { state, transition, onStateChange };
}
```

- [ ] **Step 2: Typecheck**

```bash
cd packages/genai && pnpm typecheck
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add packages/genai/src/context/app/hooks/useOctoStateMachine.ts
git commit -m "feat(genai): add useOctoStateMachine hook"
```

---

## Task 3: Add octoState to AgentsProvider + context

**Files:**
- Modify: `packages/genai/src/context/app/types.ts`
- Modify: `packages/genai/src/context/app/provider.tsx`

- [ ] **Step 1: Add fields to `AgentsContextType`**

Open `packages/genai/src/context/app/types.ts`. Add these imports and fields:

At top of file, add import:
```typescript
import type { OctoState } from './octo-state';
import type { OctoStateChangeCallback } from './hooks/useOctoStateMachine';
```

Inside `AgentsContextType`, add after the last existing field:
```typescript
  /** Global lifecycle state of this SDK instance. */
  octoState: OctoState;
  /**
   * Subscribe to OctoState changes. Returns unsubscribe fn.
   * Safe to call outside React render — uses stable ref internally.
   */
  onStateChange: (cb: OctoStateChangeCallback) => () => void;
```

- [ ] **Step 2: Wire hook into `AgentsProvider`**

Open `packages/genai/src/context/app/provider.tsx`.

Add import near top (after existing imports):
```typescript
import { useOctoStateMachine } from './hooks/useOctoStateMachine';
import { OctoState } from './octo-state';
```

Inside `AgentsProvider`, just after the existing `const { analytics } = useOctoAnalytics();` line, add:
```typescript
  const { state: octoState, transition: transitionOctoState, onStateChange } = useOctoStateMachine();
```

- [ ] **Step 3: Wire bootstrap → INITIALIZING → READY**

Still in `provider.tsx`, find the `useAppBootstrap({` call (around line 1805). Replace the call with:

```typescript
  useEffect(() => {
    // Kick off IDLE → INITIALIZING on mount
    try {
      transitionOctoState(OctoState.INITIALIZING);
    } catch {
      // Already past IDLE on StrictMode double-mount — safe to ignore
    }
  }, []);

  useAppBootstrap({
    brandId,
    userEmail,
    userUUID,
    userId,
    currentSessionIdProp,
    currentSessionId,
    setCurrentSessionId,
    setSessions,
    setSessionsFetched,
    setIpInfo,
    setAgentsState,
    setPendingMessages,
    setEnteredInChatMode,
    setCurrentAgent,
    handleSendMessage,
    view,
    isMaya: isMaya || false,
    onBootstrapComplete: () => {
      try { transitionOctoState(OctoState.READY); } catch { /* already READY */ }
    },
    onBootstrapError: () => {
      try { transitionOctoState(OctoState.ERROR); } catch { /* already ERROR */ }
    },
  });
```

- [ ] **Step 4: Update `useAppBootstrap` to accept + call the callbacks**

Open `packages/genai/src/context/app/hooks/useAppBootstrap.ts`.

Add to `UseAppBootstrapParams` interface:
```typescript
  onBootstrapComplete?: () => void;
  onBootstrapError?: () => void;
```

Add to destructure in `useAppBootstrap`:
```typescript
  onBootstrapComplete,
  onBootstrapError,
```

In `fetchInitialData`, after `setSessionsFetched(true)` is called (end of the happy path, before the function closes), add:
```typescript
          onBootstrapComplete?.();
```

In the catch block pattern (where errors are handled) or after `Promise.allSettled`, wrap the existing error log with:
```typescript
          onBootstrapError?.();
```

Note: `fetchInitialData` uses `Promise.allSettled` so individual failures are handled per-slot. Add `onBootstrapComplete?.()` at the very end of `fetchInitialData` (after all the `if` checks), and `onBootstrapError?.()` if all critical fetches failed.

Concrete location — add at the very end of `fetchInitialData` body, before the closing `};`:
```typescript
        onBootstrapComplete?.();
```

- [ ] **Step 5: Add `octoState` + `onStateChange` to context value**

In `provider.tsx`, find the `const contextValue = {` object (around line 1893). Add inside it:
```typescript
    octoState,
    onStateChange,
```

- [ ] **Step 6: Typecheck + build**

```bash
cd packages/genai && pnpm typecheck && pnpm build
```

Expected: clean.

- [ ] **Step 7: Commit**

```bash
git add packages/genai/src/context/app/types.ts \
        packages/genai/src/context/app/provider.tsx \
        packages/genai/src/context/app/hooks/useAppBootstrap.ts
git commit -m "feat(genai): wire OctoState machine into AgentsProvider"
```

---

## Task 4: Wire OctoState to send/stream/stop operations

**Files:**
- Modify: `packages/genai/src/context/app/provider.tsx`

- [ ] **Step 1: Transition on `handleSendMessage`**

In `provider.tsx`, find `async function handleSendMessage(params: HandleSendMessageParams)`.

At the start of the try block, after the early-return guard (`if (!messageInput?.trim() ...`) add:
```typescript
      // New session → CREATING_SESSION, existing → LOADING
      try {
        transitionOctoState(sessionId ? OctoState.LOADING : OctoState.CREATING_SESSION);
      } catch { /* ignore if already in target-compatible state */ }
```

- [ ] **Step 2: Transition on first SSE chunk → STREAMING**

In `provider.tsx`, find `handleSSEMessage`. Near the top of the `setSessions` callback, after `const wasThinking = s.thinking;`, add:

```typescript
                // Transition to STREAMING on first chunk if we're in LOADING or CREATING_SESSION
                if (data.message !== undefined || data.agent_message_id !== undefined) {
                  try { transitionOctoState(OctoState.STREAMING); } catch { /* may already be STREAMING */ }
                }
```

Note: `transitionOctoState` is from outer closure — it's in scope because `handleSSEMessage` is defined inside `AgentsProvider`.

- [ ] **Step 3: Transition on `response_completed` → RESPONDING → READY**

In `handleSSEMessage`, find `if (data.response_completed === true)`. At the end of that block (after `fetchSuggestedPrompts` call), add:

```typescript
              try { transitionOctoState(OctoState.RESPONDING); } catch { /* ignore */ }
              // RESPONDING → READY happens after suggestedPrompts fetch completes — 
              // handled in fetchSuggestedPrompts callback below
```

In `fetchSuggestedPrompts` (the `useCallback` around line 646), at the end of the `finally` block add:
```typescript
        try { transitionOctoState(OctoState.READY); } catch { /* ignore */ }
```

- [ ] **Step 4: Transition on `stopSessionResponse` → CANCELLING → READY**

In `stopSessionResponse`, at the start of the function body add:
```typescript
      try { transitionOctoState(OctoState.CANCELLING); } catch { /* not in cancellable state */ }
```

In the `finally` block of `stopSessionResponse`, after the `setSessions` update, add:
```typescript
        try { transitionOctoState(OctoState.READY); } catch { /* ignore */ }
```

- [ ] **Step 5: Transition on `setCurrentAgent` → SWITCHING → READY**

In `setCurrentAgent` callback, after `setCurrentAgentState(agentId)` add:
```typescript
        try { transitionOctoState(OctoState.SWITCHING); } catch { /* ignore */ }
        // Immediately back to READY — switching is synchronous here
        try { transitionOctoState(OctoState.READY); } catch { /* ignore */ }
```

- [ ] **Step 6: Transition on error**

In `handleOnSocketError`, at the start of `setSessions` call add before it:
```typescript
      try { transitionOctoState(OctoState.ERROR); } catch { /* ignore */ }
```

- [ ] **Step 7: Transition on unmount → DESTROYED**

Add a new `useEffect` in `AgentsProvider` (near the other lifecycle effects):
```typescript
  useEffect(() => {
    return () => {
      try { transitionOctoState(OctoState.DESTROYED); } catch { /* ignore */ }
    };
  }, []);
```

- [ ] **Step 8: Typecheck + build**

```bash
cd packages/genai && pnpm typecheck && pnpm build
```

Expected: clean. Manually verify in browser: open SDK, send a message, watch no console errors.

- [ ] **Step 9: Commit**

```bash
git add packages/genai/src/context/app/provider.tsx
git commit -m "feat(genai): drive OctoState transitions from send/stream/stop/error/unmount"
```

---

## Task 5: useTimerManager hook

**Files:**
- Create: `packages/genai/src/context/app/hooks/useTimerManager.ts`

- [ ] **Step 1: Create the hook**

```typescript
// packages/genai/src/context/app/hooks/useTimerManager.ts
import { useEffect, useRef } from 'react';

/** Centralized timer registry. Setting the same key replaces the existing timer. */
export interface OctoTimerManager {
  /** Schedule a one-shot timer. Replaces existing timer with same key. */
  setTimeout(key: string, fn: () => void, ms: number): void;
  /** Schedule a repeating timer. Replaces existing timer with same key. */
  setInterval(key: string, fn: () => void, ms: number): void;
  /** Cancel timer by key. No-op if key not found. */
  clear(key: string): void;
  /** Cancel all active timers. */
  clearAll(): void;
}

type TimerEntry =
  | { kind: 'timeout'; id: ReturnType<typeof setTimeout> }
  | { kind: 'interval'; id: ReturnType<typeof setInterval> };

/**
 * Returns a stable `OctoTimerManager`. All timers are auto-cleared on unmount.
 * Calling `setTimeout`/`setInterval` with an existing key cancels the previous timer first.
 */
export function useTimerManager(): OctoTimerManager {
  const registryRef = useRef<Map<string, TimerEntry>>(new Map());

  // Clear all on unmount
  useEffect(() => {
    const registry = registryRef.current;
    return () => {
      registry.forEach(entry => {
        if (entry.kind === 'timeout') clearTimeout(entry.id);
        else clearInterval(entry.id);
      });
      registry.clear();
    };
  }, []);

  // Stable object — created once, never changes reference
  const managerRef = useRef<OctoTimerManager>({
    setTimeout(key, fn, ms) {
      const existing = registryRef.current.get(key);
      if (existing) {
        if (existing.kind === 'timeout') clearTimeout(existing.id);
        else clearInterval(existing.id);
      }
      const id = setTimeout(() => {
        registryRef.current.delete(key);
        fn();
      }, ms);
      registryRef.current.set(key, { kind: 'timeout', id });
    },

    setInterval(key, fn, ms) {
      const existing = registryRef.current.get(key);
      if (existing) {
        if (existing.kind === 'timeout') clearTimeout(existing.id);
        else clearInterval(existing.id);
      }
      const id = setInterval(fn, ms);
      registryRef.current.set(key, { kind: 'interval', id });
    },

    clear(key) {
      const existing = registryRef.current.get(key);
      if (!existing) return;
      if (existing.kind === 'timeout') clearTimeout(existing.id);
      else clearInterval(existing.id);
      registryRef.current.delete(key);
    },

    clearAll() {
      registryRef.current.forEach(entry => {
        if (entry.kind === 'timeout') clearTimeout(entry.id);
        else clearInterval(entry.id);
      });
      registryRef.current.clear();
    },
  });

  return managerRef.current;
}
```

- [ ] **Step 2: Typecheck**

```bash
cd packages/genai && pnpm typecheck
```

Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add packages/genai/src/context/app/hooks/useTimerManager.ts
git commit -m "feat(genai): add useTimerManager hook for centralized timer management"
```

---

## Task 6: Migrate WebSDKContent to useTimerManager

**Files:**
- Modify: `packages/genai/src/components/WebSDK/WebSDKContent.tsx`

- [ ] **Step 1: Add import + instantiate timer**

In `WebSDKContent.tsx`, add import:
```typescript
import { useTimerManager } from '@/context/app/hooks/useTimerManager';
```

After the first `const` block in the component body (after `const { analytics } = useOctoAnalytics();`), add:
```typescript
  const timer = useTimerManager();
```

- [ ] **Step 2: Remove 5 old timer refs**

Delete these lines:
```typescript
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const panelViewCountdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const videoPlayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownSignalTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
```

- [ ] **Step 3: Replace `cancelFullViewCycle`**

Replace the existing `cancelFullViewCycle` with:
```typescript
  const cancelFullViewCycle = useCallback(() => {
    userInteractedRef.current = true;
    timer.clear('idle');
    timer.clear('video-play');
    timer.clear('countdown-signal');
  }, [timer]);
```

- [ ] **Step 4: Replace idle timer (full-view auto-prompt effect)**

In the `useEffect` that starts with `if (!globalAllowAutoPrompt) return;` (full-view cycle):

Replace `idleTimerRef.current = setTimeout(() => {` with:
```typescript
    timer.setTimeout('idle', () => {
```

Remove `idleTimerRef.current = null;` inside callback (timer manager deletes key on fire automatically).

Replace `countdownSignalTimerRef.current = setTimeout(() => {` with:
```typescript
      timer.setTimeout('countdown-signal', () => {
```

Remove `countdownSignalTimerRef.current = null;` inside callback.

Replace `videoPlayTimerRef.current = setTimeout(() => {` with:
```typescript
      timer.setTimeout('video-play', () => {
```

Remove `videoPlayTimerRef.current = null;` inside callback.

Replace the cleanup `return () => { if (idleTimerRef.current) { clearTimeout... } }` with:
```typescript
    return () => {
      timer.clear('idle');
    };
```

- [ ] **Step 5: Replace countdown interval (compact auto-prompt effect)**

In the `useEffect` that starts `if (isPostCloseMode || !allowAutoPrompt)`:

Replace:
```typescript
countdownIntervalRef.current = setInterval(() => {
```
with:
```typescript
timer.setInterval('countdown', () => {
```

Remove the `if (countdownIntervalRef.current) { clearInterval(countdownIntervalRef.current); countdownIntervalRef.current = null; }` block inside the interval callback (when `timeLeft <= 0`) — instead just:
```typescript
timer.clear('countdown');
```

All other places that do `if (countdownIntervalRef.current) { clearInterval(...); countdownIntervalRef.current = null; }` → replace with `timer.clear('countdown')`.

Replace cleanup at bottom of effect with:
```typescript
    return () => {
      timer.clear('countdown');
    };
```

- [ ] **Step 6: Replace panel-view countdown interval**

In the `useEffect` that starts with `const prevMode = prevRenderModeRef.current`:

Replace:
```typescript
panelViewCountdownIntervalRef.current = setInterval(() => {
```
with:
```typescript
timer.setInterval('panel-countdown', () => {
```

Replace the `clearInterval(panelViewCountdownIntervalRef.current)` block inside the interval (when `timeLeft <= 0`) with:
```typescript
timer.clear('panel-countdown');
```

All other `if (panelViewCountdownIntervalRef.current) { clearInterval(...) }` → `timer.clear('panel-countdown')`.

- [ ] **Step 7: Typecheck + build**

```bash
cd packages/genai && pnpm typecheck && pnpm build
```

Expected: clean.

- [ ] **Step 8: Manual smoke test**

Open the WebSDK in browser. Verify:
1. Countdown starts and counts down as before
2. Clicking the auto-prompt message cancels countdown
3. Typing in input cancels countdown
4. Full-view cycle (idle → close → video play → next prompt) still fires

- [ ] **Step 9: Commit**

```bash
git add packages/genai/src/components/WebSDK/WebSDKContent.tsx
git commit -m "refactor(genai): replace 5 timer refs in WebSDKContent with useTimerManager"
```

---

## Task 7: AutoPromptConfig type + prop

**Files:**
- Create: `packages/genai/src/types/auto-prompt.ts`
- Modify: `packages/genai/src/context/app/types.ts`
- Modify: `packages/genai/src/context/app/provider.tsx`
- Modify: `packages/genai/src/context/AppProviders.tsx`

- [ ] **Step 1: Create type file**

```typescript
// packages/genai/src/types/auto-prompt.ts

/** Configuration for the auto-prompt feature. */
export interface AutoPromptConfig {
  /**
   * Controls auto-prompt behavior.
   * - `disabled`: no auto-prompt at all
   * - `countdown-only`: show countdown + dummy message; no auto-close/video cycle
   * - `full`: countdown → idle wait → close chat → video play → next prompt
   */
  mode: 'disabled' | 'countdown-only' | 'full';
  /** Seconds for initial countdown before auto-send. Default: 3 */
  countdownSeconds?: number;
  /** Ms of inactivity after response before closing chat (full mode only). Default: 5000 */
  idleTimeoutMs?: number;
  /** Ms for video to play before next prompt fires (full mode only). Default: 30000 */
  videoPlayDurationMs?: number;
}
```

- [ ] **Step 2: Add `autoPrompt` to `AgentsContextType`**

In `packages/genai/src/context/app/types.ts`, add import:
```typescript
import type { AutoPromptConfig } from '../../types/auto-prompt';
```

Add to `AgentsContextType` (after `globalAllowAutoPrompt`):
```typescript
  /** Resolved auto-prompt configuration. Replaces `allowAutoPrompt`/`globalAllowAutoPrompt`. */
  autoPrompt: AutoPromptConfig;
```

- [ ] **Step 3: Add prop + resolver to `AgentsProvider`**

In `packages/genai/src/context/app/provider.tsx`, add import:
```typescript
import type { AutoPromptConfig } from '../../types/auto-prompt';
```

Add to `AgentsProviderProps`:
```typescript
  /** Structured auto-prompt config. Takes precedence over `allowAutoPrompt`. */
  autoPrompt?: AutoPromptConfig;
```

Inside `AgentsProvider`, after the `allowAutoPrompt = true` destructure, add:
```typescript
  const resolvedAutoPrompt: AutoPromptConfig = props_autoPrompt ?? {
    mode: allowAutoPrompt === false ? 'disabled' : 'full',
  };
```

Note: rename the destructured param to avoid collision:
```typescript
// Change the destructure line from:
    allowAutoPrompt = true,
// to:
    allowAutoPrompt = true,
    autoPrompt: props_autoPrompt,
```

Add `autoPrompt: resolvedAutoPrompt` to `contextValue`.

- [ ] **Step 4: Add prop to `AppProviders`**

In `packages/genai/src/context/AppProviders.tsx`, add to `AppProvidersProps`:
```typescript
  autoPrompt?: AutoPromptConfig;
```

Add import at top:
```typescript
import type { AutoPromptConfig } from '../types/auto-prompt';
```

Destructure in component and pass through to `AgentsProvider`:
```typescript
  autoPrompt,
```

In JSX:
```typescript
  autoPrompt={autoPrompt}
```

- [ ] **Step 5: Typecheck + build**

```bash
cd packages/genai && pnpm typecheck && pnpm build
```

Expected: clean.

- [ ] **Step 6: Commit**

```bash
git add packages/genai/src/types/auto-prompt.ts \
        packages/genai/src/context/app/types.ts \
        packages/genai/src/context/app/provider.tsx \
        packages/genai/src/context/AppProviders.tsx
git commit -m "feat(genai): add AutoPromptConfig type and prop with backward-compat resolver"
```

---

## Task 8: Wire AutoPromptConfig into WebSDKContent

**Files:**
- Modify: `packages/genai/src/components/WebSDK/WebSDKContent.tsx`

- [ ] **Step 1: Replace constants with config values**

In `WebSDKContent.tsx`, delete the two constants at the top:
```typescript
const FULL_VIEW_IDLE_TIMEOUT_MS = 5_000;
const VIDEO_PLAY_DURATION_MS = 30_000;
```

Destructure `autoPrompt` from context:
```typescript
  const {
    // ... existing destructures ...
    autoPrompt,
  } = useAgentsContext();
```

- [ ] **Step 2: Replace hardcoded values**

Replace `FULL_VIEW_IDLE_TIMEOUT_MS` → `(autoPrompt.idleTimeoutMs ?? 5000)`

Replace `VIDEO_PLAY_DURATION_MS` → `(autoPrompt.videoPlayDurationMs ?? 30000)`

Replace `VIDEO_PLAY_DURATION_MS - 1000` → `(autoPrompt.videoPlayDurationMs ?? 30000) - 1000`

Replace the hardcoded `3` in `setCountdown(3)` and `let timeLeft = 3` → `(autoPrompt.countdownSeconds ?? 3)`

- [ ] **Step 3: Replace `allowAutoPrompt`/`globalAllowAutoPrompt` guards**

All places that check `allowAutoPrompt` or `globalAllowAutoPrompt`:

- `if (!allowAutoPrompt)` → `if (autoPrompt.mode === 'disabled')`
- `if (!globalAllowAutoPrompt)` → `if (autoPrompt.mode === 'disabled')`
- The full-view cycle effect guard: `if (!globalAllowAutoPrompt) return;` → `if (autoPrompt.mode === 'disabled') return;`
- The compact auto-prompt effect guard: `if (isPostCloseMode || !allowAutoPrompt)` → `if (isPostCloseMode || autoPrompt.mode === 'disabled')`

Add `countdown-only` guard for the idle/video-play timers:
```typescript
    // In the full-view cycle effect, wrap idle+video timers:
    if (autoPrompt.mode === 'full') {
      timer.setTimeout('idle', () => {
        // ... existing idle timer body ...
      }, autoPrompt.idleTimeoutMs ?? 5000);
    }
```

- [ ] **Step 4: Remove stale destructures from `useAgentsContext()`**

Remove `allowAutoPrompt` and `globalAllowAutoPrompt` from the destructure inside `WebSDKContent` (they are now redundant — `autoPrompt.mode` covers both).

- [ ] **Step 5: Typecheck + build**

```bash
cd packages/genai && pnpm typecheck && pnpm build
```

Expected: clean.

- [ ] **Step 6: Manual smoke test**

Verify countdown still fires in browser with default behavior (no `autoPrompt` prop set).

- [ ] **Step 7: Commit**

```bash
git add packages/genai/src/components/WebSDK/WebSDKContent.tsx
git commit -m "feat(genai): replace hardcoded auto-prompt constants with AutoPromptConfig"
```

---

## Task 9: OctoState-aware countdown pause in WebSDKContent

**Files:**
- Modify: `packages/genai/src/components/WebSDK/WebSDKContent.tsx`

- [ ] **Step 1: Destructure `octoState` from context**

In `WebSDKContent.tsx`, add to the `useAgentsContext()` destructure:
```typescript
    octoState,
```

Add import:
```typescript
import { OctoState } from '@/context/app/octo-state';
```

- [ ] **Step 2: Pause countdown on STREAMING/PAUSED/SWITCHING**

Add a new `useEffect` after the existing compact auto-prompt effect:

```typescript
  // Pause all countdown timers while the instance is streaming, paused, or switching agents.
  useEffect(() => {
    const shouldPause =
      octoState === OctoState.STREAMING ||
      octoState === OctoState.PAUSED ||
      octoState === OctoState.SWITCHING;

    if (shouldPause) {
      timer.clear('countdown');
      timer.clear('panel-countdown');
      setCountdown(null);
      setPanelViewCountdown(null);
    }
  }, [octoState, timer]);
```

- [ ] **Step 3: Typecheck + build**

```bash
cd packages/genai && pnpm typecheck && pnpm build
```

Expected: clean.

- [ ] **Step 4: Commit**

```bash
git add packages/genai/src/components/WebSDK/WebSDKContent.tsx
git commit -m "feat(genai): pause auto-prompt countdowns during STREAMING/PAUSED/SWITCHING states"
```

---

## Task 10: useLifecycleController hook

**Files:**
- Create: `packages/genai/src/context/app/hooks/useLifecycleController.ts`

- [ ] **Step 1: Create the hook**

```typescript
// packages/genai/src/context/app/hooks/useLifecycleController.ts
import { useCallback } from 'react';

import { OctoState } from '../octo-state';
import type { OctoTimerManager } from './useTimerManager';

/** Externally-facing lifecycle control API. */
export interface OctoLifecycleController {
  /** Pause stream consumption. Only valid in STREAMING. Buffer preserved server-side. */
  pause(): void;
  /** Resume from PAUSED state. Re-attaches stream reader. */
  resume(): void;
  /** Abort active work and reset to READY. Valid in LOADING | STREAMING | PAUSED | CREATING_SESSION. */
  cancel(): void;
  /** Full teardown: abort streams, clear timers, remove listeners. Terminal. */
  destroy(): void;
}

interface UseLifecycleControllerParams {
  octoState: OctoState;
  transitionOctoState: (next: OctoState) => void;
  timer: OctoTimerManager;
  currentSessionId: string | null;
  stopSessionResponse: (sessionId: string | null) => Promise<void>;
  connectToStream: (sessionId: string) => Promise<{ isCompleted: boolean }>;
  cancelAllStreams: () => void;
  removeWindowListeners: () => void;
}

/**
 * Returns a stable `OctoLifecycleController` backed by OctoState + TimerManager.
 */
export function useLifecycleController({
  octoState,
  transitionOctoState,
  timer,
  currentSessionId,
  stopSessionResponse,
  connectToStream,
  cancelAllStreams,
  removeWindowListeners,
}: UseLifecycleControllerParams): OctoLifecycleController {
  const pause = useCallback(() => {
    if (octoState !== OctoState.STREAMING) return;
    try { transitionOctoState(OctoState.PAUSED); } catch { return; }
    timer.clear('countdown');
    timer.clear('panel-countdown');
  }, [octoState, transitionOctoState, timer]);

  const resume = useCallback(() => {
    if (octoState !== OctoState.PAUSED) return;
    try { transitionOctoState(OctoState.STREAMING); } catch { return; }
    if (currentSessionId) {
      void connectToStream(currentSessionId);
    }
  }, [octoState, transitionOctoState, currentSessionId, connectToStream]);

  const cancel = useCallback(() => {
    const cancellable: OctoState[] = [
      OctoState.LOADING,
      OctoState.STREAMING,
      OctoState.PAUSED,
      OctoState.CREATING_SESSION,
    ];
    if (!cancellable.includes(octoState)) return;
    try { transitionOctoState(OctoState.CANCELLING); } catch { return; }
    timer.clear('idle');
    timer.clear('video-play');
    timer.clear('countdown-signal');
    void stopSessionResponse(currentSessionId).then(() => {
      try { transitionOctoState(OctoState.READY); } catch { /* ignore */ }
    });
  }, [octoState, transitionOctoState, timer, currentSessionId, stopSessionResponse]);

  const destroy = useCallback(() => {
    if (octoState === OctoState.DESTROYED) return;
    try { transitionOctoState(OctoState.DESTROYED); } catch { return; }
    cancelAllStreams();
    timer.clearAll();
    removeWindowListeners();
  }, [octoState, transitionOctoState, cancelAllStreams, timer, removeWindowListeners]);

  return { pause, resume, cancel, destroy };
}
```

- [ ] **Step 2: Wire into `AgentsProvider`**

In `packages/genai/src/context/app/provider.tsx`, add import:
```typescript
import { useLifecycleController, type OctoLifecycleController } from './hooks/useLifecycleController';
import { useTimerManager } from './hooks/useTimerManager';
```

Instantiate timer manager inside `AgentsProvider` (near top, after analytics):
```typescript
  const timer = useTimerManager();
```

Create a stable `cancelAllStreams` callback:
```typescript
  const cancelAllStreams = useCallback(() => {
    sessions.forEach(s => cancelStream(s.id));
  }, [sessions, cancelStream]);
```

Create a stable `removeWindowListeners` callback — this needs a ref to the listeners. Add a ref at top:
```typescript
  const windowListenerCleanupRef = useRef<(() => void) | null>(null);
```

Then in each `window.addEventListener` call in provider (the `genai:webSdkRenderMode` and related effects), collect cleanup fns into `windowListenerCleanupRef`. At end of provider, set:
```typescript
  windowListenerCleanupRef.current = () => {
    // called by destroy()
    window.removeEventListener('genai:webSdkRenderMode', renderModeListener);
  };
```

Simpler approach: wrap in a callback:
```typescript
  const removeWindowListeners = useCallback(() => {
    windowListenerCleanupRef.current?.();
  }, []);
```

Instantiate lifecycle controller:
```typescript
  const lifecycle = useLifecycleController({
    octoState,
    transitionOctoState,
    timer,
    currentSessionId,
    stopSessionResponse,
    connectToStream,
    cancelAllStreams,
    removeWindowListeners,
  });
```

Add to `contextValue`:
```typescript
    lifecycle,
```

- [ ] **Step 3: Add `lifecycle` to `AgentsContextType`**

In `packages/genai/src/context/app/types.ts`, add import:
```typescript
import type { OctoLifecycleController } from './hooks/useLifecycleController';
```

Add to `AgentsContextType`:
```typescript
  /** Lifecycle control: pause, resume, cancel, destroy. */
  lifecycle: OctoLifecycleController;
```

- [ ] **Step 4: Typecheck + build**

```bash
cd packages/genai && pnpm typecheck && pnpm build
```

Expected: clean.

- [ ] **Step 5: Commit**

```bash
git add packages/genai/src/context/app/hooks/useLifecycleController.ts \
        packages/genai/src/context/app/types.ts \
        packages/genai/src/context/app/provider.tsx
git commit -m "feat(genai): add OctoLifecycleController with pause/resume/cancel/destroy"
```

---

## Task 11: Extract useSessionManager

**Files:**
- Create: `packages/genai/src/context/app/hooks/useSessionManager.ts`
- Modify: `packages/genai/src/context/app/provider.tsx`

- [ ] **Step 1: Create the hook**

```typescript
// packages/genai/src/context/app/hooks/useSessionManager.ts
import { useCallback } from 'react';
import { toast } from 'sonner';

import { getChatHistoryV2, updateSessionTitle } from '@/lib/api';
import type { Session } from '@/types';

import { convertChatHistoryV2ToEvents } from '../conversationUtils';
import type { OctoAnalyticsInstance } from '../../analytics';

interface UseSessionManagerParams {
  sessions: Session[];
  setSessions: React.Dispatch<React.SetStateAction<Session[]>>;
  currentSessionId: string | null;
  setCurrentSessionIdState: (id: string | null) => void;
  setCurrentAgentState: (id: string) => void;
  setEnteredInChatMode: (entered: boolean) => void;
  currentAgent: string;
  isMaya: boolean;
  getInitialAgentId: () => string;
  connectToStreamRef: React.RefObject<((sessionId: string) => Promise<{ isCompleted: boolean }>) | null>;
  analytics: OctoAnalyticsInstance;
}

export interface UseSessionManagerResult {
  setCurrentSessionId: (
    sessionId: string | null,
    forceSessionsFetched?: boolean,
    fetchedSessions?: Session[]
  ) => Promise<void>;
  deleteSession: (sessionId: string) => void;
  removeSession: (sessionId: string) => void;
  updateSessionName: (sessionId: string, newSessionName: string) => Promise<void>;
  setFeedback: (sessionId: string, responseId: string, liked: boolean) => Promise<void>;
  markSessionNameAnimationComplete: (sessionId: string) => void;
  updateAgentMessageContent: (sessionId: string, messageId: string, newContent: string) => void;
  checkAndReconnectStream: (sessionId: string) => Promise<void>;
}

/**
 * Manages session CRUD, chat history fetching, and stream reconnect logic.
 */
export function useSessionManager({
  sessions,
  setSessions,
  currentSessionId,
  setCurrentSessionIdState,
  setCurrentAgentState,
  setEnteredInChatMode,
  currentAgent,
  isMaya,
  getInitialAgentId,
  connectToStreamRef,
  analytics,
}: UseSessionManagerParams): UseSessionManagerResult {
  const checkAndReconnectStream = useCallback(async (sessionId: string) => {
    const connectToStream = connectToStreamRef.current;
    if (!connectToStream) return;

    setSessions(prev =>
      prev.map(s => {
        if (s.id !== sessionId) return s;
        const lastEvent = s.chat[s.chat.length - 1];
        if (lastEvent && lastEvent.role === 'user') {
          return {
            ...s,
            chat: [...s.chat, {
              id: `agent-${Date.now()}`,
              message: { content: '' },
              role: 'agent' as const,
              parent_id: lastEvent.id,
              feedback: null,
              created_at: new Date().toISOString(),
            }],
            thinking: true,
            thinkingSteps: [],
          };
        }
        return { ...s, thinking: true, thinkingSteps: [] };
      })
    );

    try {
      const result = await connectToStream(sessionId);
      if (result.isCompleted) {
        setSessions(prev =>
          prev.map(s => {
            if (s.id !== sessionId) return s;
            const chat = s.chat.filter(
              e => !(e.role === 'agent' && !e.message?.content?.trim() && e.id.startsWith('agent-'))
            );
            return { ...s, chat, thinking: false, thinkingSteps: [] };
          })
        );
      }
    } catch {
      setSessions(prev =>
        prev.map(s => {
          if (s.id !== sessionId) return s;
          const chat = s.chat.filter(
            e => !(e.role === 'agent' && !e.message?.content?.trim() && e.id.startsWith('agent-'))
          );
          return { ...s, chat, thinking: false, thinkingSteps: [] };
        })
      );
    }
  }, [connectToStreamRef, setSessions]);

  const setCurrentSessionId = useCallback(
    async (sessionId: string | null, forceSessionsFetched = false, fetchedSessions?: Session[]) => {
      if (!sessionId) {
        setCurrentSessionIdState(null);
        setCurrentAgentState(getInitialAgentId());
        setEnteredInChatMode(isMaya ? true : false);
        return;
      }
      const sessionsToSearch = fetchedSessions || sessions;
      const targetSession = sessionsToSearch.find(s => s.id === sessionId);

      if (currentSessionId === sessionId && targetSession && targetSession.status === 'fetched') return;

      if (currentSessionId && currentSessionId !== sessionId) {
        analytics.trackSessionSwitched({ from_session_id: currentSessionId, to_session_id: sessionId });
      }

      if (targetSession && targetSession.thinking) {
        setCurrentSessionIdState(sessionId);
        setCurrentAgentState(targetSession?.agentId || getInitialAgentId());
        setEnteredInChatMode(true);
        return;
      }

      try {
        if (forceSessionsFetched && fetchedSessions) {
          setSessions(fetchedSessions.map(s => (s.id === sessionId ? { ...s, status: 'fetching' } : s)));
        } else {
          setSessions(prev => prev.map(s => (s.id === sessionId ? { ...s, status: 'fetching' } : s)));
        }
        setCurrentSessionIdState(sessionId);
        setCurrentAgentState(targetSession?.agentId || getInitialAgentId());
        setEnteredInChatMode(true);

        const response = await getChatHistoryV2(sessionId);
        const chat = convertChatHistoryV2ToEvents(response.data.history);
        const agentId = response.data.agent_id;

        setSessions(prev =>
          prev.map(s => {
            if (s.id !== sessionId) return s;
            return {
              ...s,
              chat,
              status: 'fetched',
              hasNewMessage: false,
              agentId: agentId || s.agentId || currentAgent,
            };
          })
        );
        checkAndReconnectStream(sessionId);
      } catch {
        toast.error('Failed to load session history.');
      }
    },
    [currentSessionId, sessions, currentAgent, checkAndReconnectStream, analytics,
     setCurrentSessionIdState, setCurrentAgentState, setEnteredInChatMode, getInitialAgentId, isMaya, setSessions]
  );

  const deleteSession = useCallback((sessionId: string) => {
    setSessions(prev => prev.filter(s => s.id !== sessionId));
  }, [setSessions]);

  const removeSession = useCallback((sessionId: string) => {
    setSessions(prev => prev.filter(s => s.id !== sessionId));
    if (currentSessionId === sessionId) {
      setCurrentSessionIdState(null);
      setCurrentAgentState(getInitialAgentId());
      setEnteredInChatMode(isMaya ? true : false);
    }
  }, [currentSessionId, setSessions, setCurrentSessionIdState, setCurrentAgentState, getInitialAgentId, isMaya, setEnteredInChatMode]);

  const updateSessionName = useCallback(async (sessionId: string, newSessionName: string) => {
    const oldName = sessions.find(s => s.id === sessionId)?.name || '';
    try {
      setSessions(prev => prev.map(s => (s.id === sessionId ? { ...s, name: newSessionName } : s)));
      await updateSessionTitle({ session_id: sessionId, title: newSessionName });
    } catch {
      setSessions(prev => prev.map(s => (s.id === sessionId ? { ...s, name: oldName } : s)));
      toast.error('Failed to update session name.');
    }
  }, [sessions, setSessions]);

  const setFeedback = useCallback(async (sessionId: string, responseId: string, liked: boolean) => {
    setSessions(prev =>
      prev.map(s =>
        s.id === sessionId
          ? { ...s, chat: s.chat.map(e => (e.id === responseId ? { ...e, feedback: liked } : e)) }
          : s
      )
    );
  }, [setSessions]);

  const markSessionNameAnimationComplete = useCallback((sessionId: string) => {
    setSessions(prev => prev.map(s => (s.id === sessionId ? { ...s, hasNewName: false } : s)));
  }, [setSessions]);

  const updateAgentMessageContent = useCallback(
    (sessionId: string, messageId: string, newContent: string) => {
      setSessions(prev =>
        prev.map(s =>
          s.id === sessionId
            ? {
                ...s,
                chat: s.chat.map(e =>
                  e.id === messageId ? { ...e, message: { content: newContent } } : e
                ),
              }
            : s
        )
      );
    },
    [setSessions]
  );

  return {
    setCurrentSessionId,
    deleteSession,
    removeSession,
    updateSessionName,
    setFeedback,
    markSessionNameAnimationComplete,
    updateAgentMessageContent,
    checkAndReconnectStream,
  };
}
```

- [ ] **Step 2: Replace session functions in `AgentsProvider` with hook**

In `provider.tsx`, add import:
```typescript
import { useSessionManager } from './hooks/useSessionManager';
```

Delete these function definitions from `AgentsProvider` (they move into the hook):
- `checkAndReconnectStream`
- `setCurrentSessionId`
- `deleteSession`
- `removeSession`
- `updateSessionName`
- `setFeedback`
- `markSessionNameAnimationComplete`
- `updateAgentMessageContent`

Replace with:
```typescript
  const {
    setCurrentSessionId,
    deleteSession,
    removeSession,
    updateSessionName,
    setFeedback,
    markSessionNameAnimationComplete,
    updateAgentMessageContent,
    checkAndReconnectStream,
  } = useSessionManager({
    sessions,
    setSessions,
    currentSessionId,
    setCurrentSessionIdState,
    setCurrentAgentState,
    setEnteredInChatMode,
    currentAgent,
    isMaya: isMaya || false,
    getInitialAgentId,
    connectToStreamRef,
    analytics,
  });
```

Note: `setCurrentSessionIdState`, `setCurrentAgentState`, `setEnteredInChatMode` are the raw React `setState` functions — pass them directly.

- [ ] **Step 3: Typecheck + build**

```bash
cd packages/genai && pnpm typecheck && pnpm build
```

Expected: clean.

- [ ] **Step 4: Commit**

```bash
git add packages/genai/src/context/app/hooks/useSessionManager.ts \
        packages/genai/src/context/app/provider.tsx
git commit -m "refactor(genai): extract session management into useSessionManager hook"
```

---

## Task 12: Extract useAgentManager

**Files:**
- Create: `packages/genai/src/context/app/hooks/useAgentManager.ts`
- Modify: `packages/genai/src/context/app/provider.tsx`

- [ ] **Step 1: Create the hook**

```typescript
// packages/genai/src/context/app/hooks/useAgentManager.ts
import { useCallback, useMemo } from 'react';

import type { Agent, IpInfo } from '@/types';
import type { OctoState } from '../octo-state';

interface UseAgentManagerParams {
  agents: Agent[];
  setAgentsState: React.Dispatch<React.SetStateAction<Agent[]>>;
  currentAgent: string;
  setCurrentAgentState: (id: string) => void;
  currentSessionId: string | null;
  setCurrentSessionIdState: (id: string | null) => void;
  setEnteredInChatMode: (entered: boolean) => void;
  isMaya: boolean;
  initialAgent: string;
  ipInfo: IpInfo | null;
  transitionOctoState: (next: OctoState) => void;
  track: (event: string, payload: Record<string, unknown>) => void;
}

export interface UseAgentManagerResult {
  filteredAgents: Agent[];
  setAgents: (newAgents: Agent[]) => void;
  setCurrentAgent: (agentId: string) => void;
  getInitialAgentId: () => string;
}

/**
 * Manages agents list, current agent selection, and agent switching.
 */
export function useAgentManager({
  agents,
  setAgentsState,
  currentAgent,
  setCurrentAgentState,
  currentSessionId,
  setCurrentSessionIdState,
  setEnteredInChatMode,
  isMaya,
  initialAgent,
  ipInfo,
  transitionOctoState,
  track,
}: UseAgentManagerParams): UseAgentManagerResult {
  const filteredAgents = useMemo(() => {
    if (isMaya) return agents.filter(agent => agent.id === 'maya');
    return agents;
  }, [agents, isMaya]);

  const getInitialAgentId = useCallback(() => {
    const agent = agents.find(a => a.id === initialAgent);
    return agent?.id || initialAgent;
  }, [agents, initialAgent]);

  const setAgents = useCallback((newAgents: Agent[]) => {
    setAgentsState(prev => [
      ...prev,
      ...newAgents.filter((agent: Agent) => !prev.some(a => a.id === agent.id)),
    ]);
  }, [setAgentsState]);

  const setCurrentAgent = useCallback(
    (agentId: string) => {
      if (currentAgent === agentId) return;

      if (ipInfo) {
        const agent = agents.find(a => a.id === agentId);
        track('genai:agent_selected', {
          ipInfo,
          id: agent?.id,
          name: agent?.name,
          session_id: currentSessionId,
        });
      }

      setCurrentAgentState(agentId);
      setCurrentSessionIdState(null);
      setEnteredInChatMode(agentId === getInitialAgentId() ? (isMaya ? true : false) : true);

      try { transitionOctoState(OctoState.SWITCHING); } catch { /* ignore */ }
      try { transitionOctoState(OctoState.READY); } catch { /* ignore */ }
    },
    [agents, currentAgent, currentSessionId, ipInfo, track, initialAgent, isMaya,
     setCurrentAgentState, setCurrentSessionIdState, setEnteredInChatMode, getInitialAgentId, transitionOctoState]
  );

  return { filteredAgents, setAgents, setCurrentAgent, getInitialAgentId };
}
```

Note: import `OctoState` at top:
```typescript
import { OctoState } from '../octo-state';
```

- [ ] **Step 2: Replace agent functions in `AgentsProvider`**

In `provider.tsx`, add import:
```typescript
import { useAgentManager } from './hooks/useAgentManager';
```

Delete from `AgentsProvider`:
- `filteredAgents` memo
- `getInitialAgentId` callback
- `setAgents` callback
- `setCurrentAgent` callback
- The agent sync `useEffect` (updating `currentAgent` once agents load)

Replace with:
```typescript
  const { filteredAgents, setAgents, setCurrentAgent, getInitialAgentId } = useAgentManager({
    agents,
    setAgentsState,
    currentAgent,
    setCurrentAgentState,
    currentSessionId,
    setCurrentSessionIdState,
    setEnteredInChatMode,
    isMaya: isMaya || false,
    initialAgent,
    ipInfo,
    transitionOctoState,
    track,
  });
```

Move the agent sync effect into `useAgentManager` or keep it in provider — up to implementer, but keep behavior identical.

- [ ] **Step 3: Typecheck + build**

```bash
cd packages/genai && pnpm typecheck && pnpm build
```

Expected: clean.

- [ ] **Step 4: Commit**

```bash
git add packages/genai/src/context/app/hooks/useAgentManager.ts \
        packages/genai/src/context/app/provider.tsx
git commit -m "refactor(genai): extract agent management into useAgentManager hook"
```

---

## Task 13: Extract useSuggestedPrompts

**Files:**
- Create: `packages/genai/src/context/app/hooks/useSuggestedPrompts.ts`
- Modify: `packages/genai/src/context/app/provider.tsx`

- [ ] **Step 1: Create the hook**

```typescript
// packages/genai/src/context/app/hooks/useSuggestedPrompts.ts
import { useCallback, useEffect, useState } from 'react';

import { getSuggestedPrompts, getVideoSuggestedPrompts } from '@/lib/api';
import type { CachedResponseItem } from '@/lib/apiTypes';

interface UseSuggestedPromptsParams {
  brandId: number;
  currentAgent: string;
  currentSessionId: string | null;
  enteredInChatMode: boolean;
  view: 'page' | 'floater' | 'dialog' | 'web-sdk';
  webSdkVideoId?: string;
  onSuggestedPromptsFetched?: () => void;
}

export interface UseSuggestedPromptsResult {
  suggestedPrompts: string[];
  isLoadingSuggestedPrompts: boolean;
  cachedPromptResponses: Map<string, CachedResponseItem[]>;
  fetchSuggestedPrompts: (agentId: string, params?: { user_query: string; agent_response: string }) => Promise<void>;
}

/**
 * Manages fetching and caching of suggested prompts.
 */
export function useSuggestedPrompts({
  brandId,
  currentAgent,
  currentSessionId,
  enteredInChatMode,
  view,
  webSdkVideoId,
  onSuggestedPromptsFetched,
}: UseSuggestedPromptsParams): UseSuggestedPromptsResult {
  const [suggestedPrompts, setSuggestedPrompts] = useState<string[]>([]);
  const [isLoadingSuggestedPrompts, setIsLoadingSuggestedPrompts] = useState(false);
  const [cachedPromptResponses, setCachedPromptResponses] = useState<Map<string, CachedResponseItem[]>>(new Map());

  // Auto-fetch on agent/session change
  useEffect(() => {
    if (!currentAgent || !enteredInChatMode || currentSessionId) return;

    let isCancelled = false;

    const fetchPrompts = async () => {
      setSuggestedPrompts([]);
      setIsLoadingSuggestedPrompts(true);
      setCachedPromptResponses(new Map());

      let prompts: string[] | null = null;

      if (view === 'web-sdk' && webSdkVideoId) {
        try {
          const response = await getVideoSuggestedPrompts({
            video_id: webSdkVideoId,
            includeCarouselMetadata: false,
            includeAgentResponse: true,
          });

          const cachedMap = new Map<string, CachedResponseItem[]>();
          const videoPrompts = (response?.data || [])
            .map(item => {
              if (item.response && Array.isArray(item.response) && item.response.length > 0) {
                cachedMap.set(item.prompt, item.response);
              }
              return item.prompt;
            })
            .filter((p): p is string => typeof p === 'string' && p.length > 0);

          if (videoPrompts.length > 0) {
            const randomIndex = Math.floor(Math.random() * videoPrompts.length);
            const randomPrompt = videoPrompts[randomIndex];
            const ordered = randomPrompt
              ? [randomPrompt, ...videoPrompts.filter((_, i) => i !== randomIndex)]
              : videoPrompts;
            prompts = ordered;
            setCachedPromptResponses(cachedMap);
          } else {
            prompts = [];
          }
        } catch {
          // Fall through to agent prompts
        }
      }

      if (prompts === null) {
        try {
          const response = await getSuggestedPrompts(currentAgent);
          const agentPrompts = response.data?.prompts ?? [];
          if (agentPrompts.length > 0) {
            const randomIndex = Math.floor(Math.random() * agentPrompts.length);
            const randomPrompt = agentPrompts[randomIndex];
            prompts = randomPrompt
              ? [randomPrompt, ...agentPrompts.filter((_: string, i: number) => i !== randomIndex)]
              : agentPrompts;
          } else {
            prompts = [];
          }
        } catch {
          prompts = [];
        }
      }

      if (!isCancelled) {
        setSuggestedPrompts(prompts ?? []);
        setIsLoadingSuggestedPrompts(false);
        onSuggestedPromptsFetched?.();
      }
    };

    void fetchPrompts();
    return () => { isCancelled = true; };
  }, [brandId, currentAgent, currentSessionId, enteredInChatMode, view, webSdkVideoId]);

  const fetchSuggestedPrompts = useCallback(
    async (agentId: string, params?: { user_query: string; agent_response: string }) => {
      if (!agentId) return;
      setIsLoadingSuggestedPrompts(true);
      try {
        const response = await getSuggestedPrompts(agentId, params);
        if (response.data?.prompts) {
          setSuggestedPrompts(response.data.prompts);
        }
      } catch {
        setSuggestedPrompts([]);
      } finally {
        setIsLoadingSuggestedPrompts(false);
        onSuggestedPromptsFetched?.();
      }
    },
    [onSuggestedPromptsFetched]
  );

  return { suggestedPrompts, isLoadingSuggestedPrompts, cachedPromptResponses, fetchSuggestedPrompts };
}
```

- [ ] **Step 2: Replace in `AgentsProvider`**

In `provider.tsx`, add import:
```typescript
import { useSuggestedPrompts } from './hooks/useSuggestedPrompts';
```

Remove from `AgentsProvider`:
- `suggestedPrompts` useState
- `isLoadingSuggestedPrompts` useState
- `cachedPromptResponses` useState
- The long `useEffect` for auto-fetching prompts (the one with `isCancelled`)
- `fetchSuggestedPrompts` useCallback

Replace with:
```typescript
  const { suggestedPrompts, isLoadingSuggestedPrompts, cachedPromptResponses, fetchSuggestedPrompts } =
    useSuggestedPrompts({
      brandId,
      currentAgent,
      currentSessionId,
      enteredInChatMode,
      view,
      webSdkVideoId,
    });
```

- [ ] **Step 3: Typecheck + build**

```bash
cd packages/genai && pnpm typecheck && pnpm build
```

Expected: clean.

- [ ] **Step 4: Commit**

```bash
git add packages/genai/src/context/app/hooks/useSuggestedPrompts.ts \
        packages/genai/src/context/app/provider.tsx
git commit -m "refactor(genai): extract suggested prompts logic into useSuggestedPrompts hook"
```

---

## Task 14: Extract useAutoPrompt from WebSDKContent

**Files:**
- Create: `packages/genai/src/context/app/hooks/useAutoPrompt.ts`
- Modify: `packages/genai/src/components/WebSDK/WebSDKContent.tsx`

- [ ] **Step 1: Create the hook**

```typescript
// packages/genai/src/context/app/hooks/useAutoPrompt.ts
import { useCallback, useEffect, useRef, useState } from 'react';

import type { Session } from '@/types';
import type { AutoPromptConfig } from '../../../types/auto-prompt';
import { OctoState } from '../octo-state';
import type { OctoTimerManager } from './useTimerManager';

interface UseAutoPromptParams {
  timer: OctoTimerManager;
  octoState: OctoState;
  autoPrompt: AutoPromptConfig;
  currentSessionId: string | null;
  sessions: Session[];
  suggestedPrompts: string[];
  webSdkRenderMode: 'compact' | 'full';
  setWebSdkRenderMode: (mode: 'compact' | 'full') => void;
  parentOctoPanelId?: string;
  globalAllowAutoPrompt?: boolean;
  handleSendMessage: (params: { targetSessionId: string | null; messageInput?: string; onMessageQueued?: () => void }) => Promise<void>;
  handleNewChat: () => void;
  setInput: (input: string) => void;
  setIsSuggestionsOpen: (open: boolean) => void;
  textAreaRef: HTMLTextAreaElement | null;
  trackAutoPromptCancelled: (p: { prompt: string; seconds_remaining: number }) => void;
  trackAutoPromptCountdownStarted: (p: { prompt: string; countdown_duration: number }) => void;
  trackAutoPromptExecuted: (p: { prompt: string }) => void;
}

export interface UseAutoPromptResult {
  countdown: number | null;
  panelViewCountdown: number | null;
  showDummyMessage: boolean;
  showPresetPrompts: boolean;
  isPostCloseMode: boolean;
  handleAutoPromptClick: () => void;
  handleInputStart: () => void;
  handleCompactPromptSend: () => void;
  handleClosePresetPrompts: () => void;
  cancelFullViewCycle: () => void;
  setShowPresetPrompts: (show: boolean) => void;
}

/**
 * Encapsulates all auto-prompt countdown and full-view cycle logic.
 * Extracted from WebSDKContent for testability and separation of concerns.
 */
export function useAutoPrompt({
  timer,
  octoState,
  autoPrompt,
  currentSessionId,
  sessions,
  suggestedPrompts,
  webSdkRenderMode,
  setWebSdkRenderMode,
  parentOctoPanelId,
  globalAllowAutoPrompt,
  handleSendMessage,
  handleNewChat,
  setInput,
  setIsSuggestionsOpen,
  textAreaRef,
  trackAutoPromptCancelled,
  trackAutoPromptCountdownStarted,
  trackAutoPromptExecuted,
}: UseAutoPromptParams): UseAutoPromptResult {
  const [countdown, setCountdown] = useState<number | null>(null);
  const [panelViewCountdown, setPanelViewCountdown] = useState<number | null>(null);
  const [showDummyMessage, setShowDummyMessage] = useState(false);
  const [showPresetPrompts, setShowPresetPrompts] = useState(false);
  const [isPostCloseMode, setIsPostCloseMode] = useState(false);

  const userInteractedRef = useRef(false);
  const cycleStartedForMessageRef = useRef<string | null>(null);
  const nextPromptIndexRef = useRef(1);
  const countdownValueRef = useRef(countdown);
  const prevRenderModeRef = useRef(webSdkRenderMode);

  useEffect(() => { countdownValueRef.current = countdown; }, [countdown]);

  const cancelFullViewCycle = useCallback(() => {
    userInteractedRef.current = true;
    timer.clear('idle');
    timer.clear('video-play');
    timer.clear('countdown-signal');
  }, [timer]);

  // Full-view cycle
  useEffect(() => {
    if (autoPrompt.mode === 'disabled') return;
    if (webSdkRenderMode !== 'full') return;
    if (!currentSessionId) return;

    const currentSession = sessions.find(s => s.id === currentSessionId);
    if (!currentSession) return;

    const lastAgentEvent = [...(currentSession.chat || [])].reverse().find(e => e.role === 'agent');
    if (!lastAgentEvent?.isCompleted) return;

    const messageId = lastAgentEvent.id ?? null;
    if (!messageId || cycleStartedForMessageRef.current === messageId) return;
    cycleStartedForMessageRef.current = messageId;
    userInteractedRef.current = false;

    if (autoPrompt.mode === 'full') {
      timer.setTimeout('idle', () => {
        if (userInteractedRef.current) return;
        const promptsSnapshot = suggestedPrompts.slice();

        handleNewChat();
        setInput('');

        const videoPlayMs = autoPrompt.videoPlayDurationMs ?? 30000;

        timer.setTimeout('countdown-signal', () => {
          if (userInteractedRef.current) return;
          if (parentOctoPanelId) {
            window.dispatchEvent(new CustomEvent('genai:webSdkCountdownActive', {
              detail: { parentOctoPanelId, isActive: true, source: 'auto_prompt_restart' },
            }));
          }
        }, videoPlayMs - 1000);

        timer.setTimeout('video-play', () => {
          if (userInteractedRef.current) return;
          if (promptsSnapshot.length === 0) return;
          const index = nextPromptIndexRef.current % promptsSnapshot.length;
          nextPromptIndexRef.current = index + 1;
          const nextPrompt = promptsSnapshot[index];
          void handleSendMessage({ targetSessionId: null, messageInput: nextPrompt });
        }, videoPlayMs);

        setWebSdkRenderMode('compact');
        if (parentOctoPanelId) {
          window.dispatchEvent(new CustomEvent('genai:webSdkAutoClose', { detail: { parentOctoPanelId } }));
        }
      }, autoPrompt.idleTimeoutMs ?? 5000);
    }

    return () => { timer.clear('idle'); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSessionId, sessions, webSdkRenderMode]);

  // OctoState-aware countdown pause
  useEffect(() => {
    const shouldPause =
      octoState === OctoState.STREAMING ||
      octoState === OctoState.PAUSED ||
      octoState === OctoState.SWITCHING;
    if (shouldPause) {
      timer.clear('countdown');
      timer.clear('panel-countdown');
      setCountdown(null);
      setPanelViewCountdown(null);
    }
  }, [octoState, timer]);

  // Compact auto-prompt (no session + prompts available)
  useEffect(() => {
    if (isPostCloseMode || autoPrompt.mode === 'disabled') return;

    if (!currentSessionId && suggestedPrompts.length > 0) {
      const firstPrompt = suggestedPrompts[0];
      if (!firstPrompt) return;
      setShowDummyMessage(true);
      const initialCount = autoPrompt.countdownSeconds ?? 3;
      setCountdown(initialCount);
      setShowPresetPrompts(false);
      setIsSuggestionsOpen(false);

      if (parentOctoPanelId && webSdkRenderMode === 'compact') {
        window.dispatchEvent(new CustomEvent('genai:webSdkCountdownActive', {
          detail: { parentOctoPanelId, isActive: true, source: 'countdown_started' },
        }));
      }
      trackAutoPromptCountdownStarted({ prompt: firstPrompt, countdown_duration: initialCount });

      let timeLeft = initialCount;
      timer.setInterval('countdown', () => {
        timeLeft -= 1;
        setCountdown(timeLeft);
        if (timeLeft <= 0) {
          timer.clear('countdown');
          setShowDummyMessage(false);
          trackAutoPromptExecuted({ prompt: firstPrompt });
          void handleSendMessage({
            targetSessionId: null,
            messageInput: firstPrompt,
            onMessageQueued: () => setCountdown(null),
          });
        }
      }, 1000);
    } else {
      setShowDummyMessage(false);
      setCountdown(null);
      setShowPresetPrompts(false);
      setIsSuggestionsOpen(false);
      timer.clear('countdown');
      if (parentOctoPanelId && webSdkRenderMode === 'compact') {
        window.dispatchEvent(new CustomEvent('genai:webSdkCountdownActive', {
          detail: { parentOctoPanelId, isActive: false, source: 'session_exists' },
        }));
      }
    }

    return () => { timer.clear('countdown'); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSessionId, suggestedPrompts, parentOctoPanelId, webSdkRenderMode, isPostCloseMode]);

  // Panel-view countdown (compact → full transition)
  useEffect(() => {
    const prevMode = prevRenderModeRef.current;
    prevRenderModeRef.current = webSdkRenderMode;

    if (
      prevMode === 'compact' &&
      webSdkRenderMode === 'full' &&
      countdownValueRef.current !== null &&
      countdownValueRef.current > 0
    ) {
      const remaining = countdownValueRef.current;
      timer.clear('countdown');
      setCountdown(null);
      setPanelViewCountdown(remaining);

      let timeLeft = remaining;
      timer.setInterval('panel-countdown', () => {
        timeLeft -= 1;
        setPanelViewCountdown(timeLeft);
        if (timeLeft <= 0) {
          timer.clear('panel-countdown');
          setPanelViewCountdown(null);
          if (suggestedPrompts.length > 0) {
            const firstPrompt = suggestedPrompts[0];
            void handleSendMessage({
              targetSessionId: currentSessionId,
              messageInput: firstPrompt,
              onMessageQueued: () => setPanelViewCountdown(null),
            });
          }
        }
      }, 1000);
    }

    if (webSdkRenderMode === 'compact' || currentSessionId) {
      timer.clear('panel-countdown');
      setPanelViewCountdown(null);
    }
  }, [webSdkRenderMode, currentSessionId, suggestedPrompts, handleSendMessage, timer]);

  // Prompt index reset on new prompts
  useEffect(() => {
    nextPromptIndexRef.current = 1;
    cycleStartedForMessageRef.current = null;
  }, [suggestedPrompts]);

  // Close event listener
  useEffect(() => {
    const handleAutoClose = () => setIsPostCloseMode(true);
    window.addEventListener('genai:webSdkAutoClose', handleAutoClose);
    return () => window.removeEventListener('genai:webSdkAutoClose', handleAutoClose);
  }, []);

  // Reset post-close mode on new session
  useEffect(() => {
    if (currentSessionId) setIsPostCloseMode(false);
  }, [currentSessionId]);

  const handleAutoPromptClick = useCallback(() => {
    const firstPrompt = suggestedPrompts[0];
    if (!firstPrompt) return;

    timer.clear('countdown');
    timer.clear('panel-countdown');
    setCountdown(null);
    setPanelViewCountdown(null);

    trackAutoPromptCancelled({ prompt: firstPrompt, seconds_remaining: countdown || 0 });
    setShowDummyMessage(false);

    if (parentOctoPanelId && webSdkRenderMode === 'compact') {
      window.dispatchEvent(new CustomEvent('genai:webSdkCountdownActive', {
        detail: { parentOctoPanelId, isActive: false, source: 'auto_prompt_click' },
      }));
    }

    const session = sessions.find(s => s.id === currentSessionId);
    const hasUserMessages = session?.chat?.some(m => m.role === 'user') ?? false;
    if (!hasUserMessages) {
      setShowPresetPrompts(true);
      setIsSuggestionsOpen(true);
    }
    setInput(firstPrompt);
    textAreaRef?.focus();
  }, [suggestedPrompts, timer, countdown, parentOctoPanelId, webSdkRenderMode, sessions, currentSessionId,
      trackAutoPromptCancelled, setInput, setIsSuggestionsOpen, textAreaRef]);

  const handleInputStart = useCallback(() => {
    cancelFullViewCycle();
    timer.clear('countdown');
    timer.clear('panel-countdown');
    setCountdown(null);
    setPanelViewCountdown(null);
    setShowDummyMessage(false);

    if (parentOctoPanelId && webSdkRenderMode === 'compact') {
      window.dispatchEvent(new CustomEvent('genai:webSdkCountdownActive', {
        detail: { parentOctoPanelId, isActive: false, source: 'input_start' },
      }));
    }

    const session = sessions.find(s => s.id === currentSessionId);
    const hasUserMessages = session?.chat?.some(m => m.role === 'user') ?? false;
    if (!hasUserMessages) {
      setShowPresetPrompts(true);
      setIsSuggestionsOpen(true);
    }
  }, [parentOctoPanelId, webSdkRenderMode, setIsSuggestionsOpen, sessions, currentSessionId, cancelFullViewCycle, timer]);

  const handleCompactPromptSend = useCallback(() => {
    const firstPrompt = suggestedPrompts[0];
    if (!firstPrompt) return;

    timer.clear('countdown');
    timer.clear('panel-countdown');
    setCountdown(null);
    setPanelViewCountdown(null);
    setShowDummyMessage(false);

    if (parentOctoPanelId && webSdkRenderMode === 'compact') {
      window.dispatchEvent(new CustomEvent('genai:webSdkCountdownActive', {
        detail: { parentOctoPanelId, isActive: false, source: 'compact_prompt_send' },
      }));
    }

    void handleSendMessage({
      targetSessionId: currentSessionId,
      messageInput: firstPrompt,
      onMessageQueued: () => { setCountdown(null); setPanelViewCountdown(null); },
    });
  }, [suggestedPrompts, timer, parentOctoPanelId, webSdkRenderMode, handleSendMessage, currentSessionId]);

  const handleClosePresetPrompts = useCallback(() => {
    setShowPresetPrompts(false);
    setIsSuggestionsOpen(false);
  }, [setIsSuggestionsOpen]);

  return {
    countdown,
    panelViewCountdown,
    showDummyMessage,
    showPresetPrompts,
    isPostCloseMode,
    handleAutoPromptClick,
    handleInputStart,
    handleCompactPromptSend,
    handleClosePresetPrompts,
    cancelFullViewCycle,
    setShowPresetPrompts,
  };
}
```

- [ ] **Step 2: Replace logic in `WebSDKContent`**

In `WebSDKContent.tsx`:

Add import:
```typescript
import { useAutoPrompt } from '@/context/app/hooks/useAutoPrompt';
```

Delete these from component body:
- `countdown` useState
- `panelViewCountdown` useState
- `showDummyMessage` useState
- `showPresetPrompts` useState
- `isPostCloseMode` useState
- `userInteractedRef` ref
- `cycleStartedForMessageRef` ref
- `nextPromptIndexRef` ref
- `prevRenderModeRef` ref
- `countdownValueRef` ref
- `cancelFullViewCycle` callback
- All 5 timer-related `useEffect` blocks
- `handleAutoPromptClick` function
- `handleInputStart` callback
- `handleCompactPromptSend` function
- `handleClosePresetPrompts` function
- The `useEffect` for `genai:webSdkAutoClose` listener
- The `useEffect` for resetting post-close mode on session change
- The `useEffect` for resetting prompt index on `suggestedPrompts` change

Replace with:
```typescript
  const {
    countdown,
    panelViewCountdown,
    showDummyMessage,
    showPresetPrompts,
    handleAutoPromptClick,
    handleInputStart,
    handleCompactPromptSend,
    handleClosePresetPrompts,
    cancelFullViewCycle,
    setShowPresetPrompts,
  } = useAutoPrompt({
    timer,
    octoState,
    autoPrompt,
    currentSessionId,
    sessions,
    suggestedPrompts,
    webSdkRenderMode,
    setWebSdkRenderMode,
    parentOctoPanelId,
    globalAllowAutoPrompt,
    handleSendMessage,
    handleNewChat,
    setInput,
    setIsSuggestionsOpen,
    textAreaRef,
    trackAutoPromptCancelled: (p) => analytics.trackAutoPromptCancelled(p),
    trackAutoPromptCountdownStarted: (p) => analytics.trackAutoPromptCountdownStarted(p),
    trackAutoPromptExecuted: (p) => analytics.trackAutoPromptExecuted(p),
  });
```

Keep the remaining effects (thinking/error event dispatchers, interaction listeners, lottie loader) unchanged.

- [ ] **Step 3: Typecheck + build**

```bash
cd packages/genai && pnpm typecheck && pnpm build
```

Expected: clean.

- [ ] **Step 4: Manual smoke test**

Full auto-prompt flow in browser:
1. Open WebSDK with video prompts
2. Countdown starts → auto-sends
3. Response completes → idle wait → chat closes → video plays → next prompt fires
4. Clicking dummy message cancels countdown, copies to input
5. Typing cancels countdown

- [ ] **Step 5: Commit**

```bash
git add packages/genai/src/context/app/hooks/useAutoPrompt.ts \
        packages/genai/src/components/WebSDK/WebSDKContent.tsx
git commit -m "refactor(genai): extract auto-prompt cycle logic into useAutoPrompt hook"
```

---

## Task 15: Final validation

- [ ] **Step 1: Full typecheck + build**

```bash
cd packages/genai && pnpm typecheck && pnpm build
```

Expected: clean.

- [ ] **Step 2: Verify `AgentsContextType` interface has no removals**

Check that all fields from the original `types.ts` still exist plus the new additions: `octoState`, `onStateChange`, `lifecycle`, `autoPrompt`.

- [ ] **Step 3: Verify backward-compat props still accepted**

`AppProviders` should still accept `allowAutoPrompt?: boolean` and behave identically to before when no `autoPrompt` prop is passed.

- [ ] **Step 4: Verify `provider.tsx` line count**

Original: ~1960 lines. After all tasks, target: under 700 lines (bulk moved to hooks).

```bash
wc -l packages/genai/src/context/app/provider.tsx
```

- [ ] **Step 5: Final commit tag**

```bash
git tag genai-refactor-v1
```

---

## Self-Review Notes

- All 5 spec sections covered across Tasks 1–14
- No TBDs or placeholders — all code shown in full
- Types consistent: `OctoState` from `octo-state.ts`, `OctoTimerManager` from `useTimerManager.ts`, `AutoPromptConfig` from `types/auto-prompt.ts`, `OctoLifecycleController` from `useLifecycleController.ts`
- `cancelFullViewCycle` name consistent across `WebSDKContent` → `useAutoPrompt` → `useLifecycleController`
- `transitionOctoState` name consistent from `useOctoStateMachine` through all hooks
- `connectToStreamRef` passed by ref (not value) to `useSessionManager` to avoid stale closures — matches existing provider pattern
- No barrel files — all imports use direct paths
- `allowAutoPrompt` + `globalAllowAutoPrompt` kept on context as deprecated aliases (spec requirement: backward compat)
