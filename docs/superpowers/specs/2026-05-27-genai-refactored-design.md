# genai SDK Architectural Refactor

**Date:** 2026-05-27  
**Scope:** `packages/genai/src/`  
**Approach:** Incremental — implement, build, test, repeat. No big-bang rewrites.

---

## Problem

`AgentsProvider` is 1960 lines doing: bootstrap, SSE streaming, session management, agent switching, suggested prompts, auto-prompt cycle, video styles, analytics, S3 keys, WebSDK render mode. Single responsibility violated. Timer logic scattered across `WebSDKContent` in 5 refs with 6+ duplicate clear blocks. No explicit lifecycle state — `thinking` + `session.status` are implicit, per-session, not globally reasoned.

---

## Goals

1. Explicit global OctoState machine with valid transition enforcement
2. Centralized timer management — no duplicate clear logic, auto-cleanup
3. Configurable auto-prompt — replace hardcoded constants with props
4. Lifecycle control API — `pause/resume/cancel/destroy`
5. Provider decomposition into focused hooks — `AgentsProvider` becomes thin orchestrator

**Non-goals:** New React context providers, prop drilling, breaking `AgentsContextType` interface, changing external APIs.

---

## Implementation Order

Each step: implement → `pnpm build` in `packages/genai` → verify → proceed.

| Step | What | Risk |
|------|------|------|
| 1 | OctoState machine | Low — pure addition |
| 2 | TimerManager hook | Low — self-contained |
| 3 | AutoPromptConfig | Medium — replaces constants + prop |
| 4 | LifecycleController | Medium — wires steps 1–2 |
| 5 | Provider hook split | Medium — large mechanical refactor |

---

## Step 1 — OctoState Machine

### New file: `context/app/octo-state.ts`

```ts
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
```

### Valid transitions

```
IDLE             → INITIALIZING
INITIALIZING     → READY | ERROR
READY            → CREATING_SESSION | SWITCHING | DESTROYED
CREATING_SESSION → LOADING | ERROR
LOADING          → STREAMING | ERROR | CANCELLING
STREAMING        → RESPONDING | PAUSED | CANCELLING | ERROR
PAUSED           → STREAMING | CANCELLING
RESPONDING       → READY | SWITCHING | ERROR
CANCELLING       → READY | ERROR
SWITCHING        → READY | ERROR
ERROR            → READY | DESTROYED
DESTROYED        → (terminal)
```

Any transition not in this table throws `InvalidStateTransitionError`.

### New file: `context/app/hooks/useOctoStateMachine.ts`

Returns `{ state, transition, onStateChange }`.
- `transition(next: OctoState)` validates, updates state, fires `onStateChange(prev, next)`
- `onStateChange` is a stable ref callback — no re-render on change

### Integration into `AgentsProvider`

Existing `thinking` / `session.status` fields stay unchanged (backward compat). State machine is additive.

| Existing operation | OctoState transition |
|---|---|
| `useAppBootstrap` starts | `IDLE → INITIALIZING` |
| Bootstrap `fetchInitialData` resolves | `INITIALIZING → READY` |
| Bootstrap fails | `INITIALIZING → ERROR` |
| `handleSendMessage` (no session) | `READY → CREATING_SESSION` |
| `handleSendMessage` (existing session) | `READY → LOADING` |
| SSE `startChatSession` resolves | `CREATING_SESSION → LOADING` |
| First SSE chunk received | `LOADING → STREAMING` |
| `response_completed = true` | `STREAMING → RESPONDING` |
| `fetchSuggestedPrompts` completes | `RESPONDING → READY` |
| `stopSessionResponse` called | `STREAMING/LOADING → CANCELLING` |
| Cancel completes | `CANCELLING → READY` |
| `setCurrentAgent` called | `READY → SWITCHING` |
| Agent switch settles | `SWITCHING → READY` |
| `handleOnSocketError` called | `* → ERROR` |
| Provider unmounts | `* → DESTROYED` |

### Context additions

```ts
// Added to AgentsContextType
octoState: OctoState;
onStateChange: (cb: (prev: OctoState, next: OctoState) => void) => () => void;
```

---

## Step 2 — TimerManager

### New file: `context/app/hooks/useTimerManager.ts`

```ts
interface OctoTimerManager {
  /** Schedule a one-shot timer. Replaces existing timer with same key. */
  setTimeout(key: string, fn: () => void, ms: number): void;
  /** Schedule a repeating timer. Replaces existing timer with same key. */
  setInterval(key: string, fn: () => void, ms: number): void;
  /** Cancel timer by key. No-op if key not found. */
  clear(key: string): void;
  /** Cancel all active timers. */
  clearAll(): void;
}
```

Behavior:
- Setting same key cancels existing before scheduling new — no duplicate timers
- `clearAll()` called automatically on unmount via `useEffect` cleanup
- Returns `{ timer: OctoTimerManager }` — stable object ref, no re-renders caused

### Migration in `WebSDKContent`

Replace 5 timer refs:

| Old ref | New key |
|---|---|
| `countdownIntervalRef` | `timer.setInterval('countdown', ...)` |
| `panelViewCountdownIntervalRef` | `timer.setInterval('panel-countdown', ...)` |
| `idleTimerRef` | `timer.setTimeout('idle', ...)` |
| `videoPlayTimerRef` | `timer.setTimeout('video-play', ...)` |
| `countdownSignalTimerRef` | `timer.setTimeout('countdown-signal', ...)` |

All 6+ duplicate `clearInterval`/`clearTimeout` blocks become single calls:
- `timer.clear('countdown')`
- `timer.clear('panel-countdown')`
- `timer.clear('idle')`  
- etc.

`cancelFullViewCycle` simplifies to:
```ts
const cancelFullViewCycle = useCallback(() => {
  userInteractedRef.current = true;
  timer.clear('idle');
  timer.clear('video-play');
  timer.clear('countdown-signal');
}, [timer]);
```

OctoState `DESTROYED` → `timer.clearAll()`.

---

## Step 3 — AutoPromptConfig

### New file: `types/auto-prompt.ts`

```ts
export interface AutoPromptConfig {
  /** Controls auto-prompt behavior.
   * - disabled: no auto-prompt
   * - countdown-only: show countdown + dummy message, no auto-close/video cycle
   * - full: countdown → idle → close → video-play → next prompt
   */
  mode: 'disabled' | 'countdown-only' | 'full';
  /** Seconds for initial countdown. Default: 3 */
  countdownSeconds?: number;
  /** Ms of inactivity after response before closing chat. Default: 5000 */
  idleTimeoutMs?: number;
  /** Ms for video to play before next prompt fires (full mode only). Default: 30000 */
  videoPlayDurationMs?: number;
}
```

### Prop changes

`AgentsProviderProps` and `AppProvidersProps`:
- Keep `allowAutoPrompt?: boolean` — backward compat, maps to `{ mode: 'disabled' | 'full' }`
- Add `autoPrompt?: AutoPromptConfig` — takes precedence when provided

Resolution logic (inside provider):
```ts
const resolvedAutoPrompt: AutoPromptConfig = props.autoPrompt ?? {
  mode: props.allowAutoPrompt === false ? 'disabled' : 'full',
};
```

### Context addition

```ts
autoPrompt: AutoPromptConfig; // replaces allowAutoPrompt + globalAllowAutoPrompt
```

### WebSDKContent changes

Replace hardcoded constants:
- `FULL_VIEW_IDLE_TIMEOUT_MS` → `autoPrompt.idleTimeoutMs ?? 5000`
- `VIDEO_PLAY_DURATION_MS` → `autoPrompt.videoPlayDurationMs ?? 30000`
- Hardcoded `3` (countdown) → `autoPrompt.countdownSeconds ?? 3`

OctoState-aware pause: when state enters `STREAMING | PAUSED | SWITCHING`, clear countdown timers. Resume when state returns to `READY`.

Mode guards:
- `mode === 'disabled'` → skip all auto-prompt effects
- `mode === 'countdown-only'` → skip idle/video-play cycle (`idleTimerRef`, `videoPlayTimerRef`)
- `mode === 'full'` → existing full behavior

---

## Step 4 — LifecycleController

### New file: `context/app/hooks/useLifecycleController.ts`

```ts
export interface OctoLifecycleController {
  /** Pause stream consumption. Only valid in STREAMING state. Buffer preserved. */
  pause(): void;
  /** Resume from PAUSED state. Re-attaches stream reader. */
  resume(): void;
  /** Abort active work, reset temp state. Valid in LOADING | STREAMING | PAUSED | CREATING_SESSION. */
  cancel(): void;
  /** Full teardown: abort streams, clear timers, remove listeners. Terminal. */
  destroy(): void;
}
```

### Implementations

**`pause()`**
- Guard: `octoState !== STREAMING` → no-op
- Transition `STREAMING → PAUSED`
- Calls `timer.clear('countdown')`, `timer.clear('panel-countdown')`
- Does not abort SSE AbortController — stream continues server-side, React stops consuming chunks

**`resume()`**
- Guard: `octoState !== PAUSED` → no-op
- Transition `PAUSED → STREAMING`
- Calls `connectToStream(currentSessionId)` to re-attach reader

**`cancel()`**
- Guard: `octoState` not in `[LOADING, STREAMING, PAUSED, CREATING_SESSION]` → no-op
- Transition → `CANCELLING`
- Calls `stopSessionResponse(currentSessionId)` (existing — aborts SSE + calls backend)
- Calls `timer.clear('idle')`, `timer.clear('video-play')`, `timer.clear('countdown-signal')`
- On complete: transition `CANCELLING → READY`

**`destroy()`**
- Valid from any non-`DESTROYED` state
- Transition `* → DESTROYED`
- Calls `cancelStream` for all active session IDs in `abortControllersRef`
- Calls `timer.clearAll()`
- Removes window event listeners: `genai:webSdkRenderMode`, `genai:webSdkAutoClose`, `sdk:userInteracted`
- Clears sessions and agents arrays

### Context addition

```ts
lifecycle: OctoLifecycleController;
```

---

## Step 5 — Provider Hook Split

### Strategy

Extract logic from `AgentsProvider` into focused hooks. Single `AgentsContext` remains — no new React contexts. `AgentsProvider` becomes orchestrator (~300 lines target).

### Hook extraction map

| Hook | New file | Extracted from |
|---|---|---|
| `useSessionManager` | `hooks/useSessionManager.ts` | `setCurrentSessionId`, `deleteSession`, `removeSession`, `updateSessionName`, `checkAndReconnectStream`, `handleSessionCreated`, `fetchAndSetSessions`, `handleOnSocketError`, `setFeedback`, `markSessionNameAnimationComplete` |
| `useAgentManager` | `hooks/useAgentManager.ts` | `setAgents`, `setCurrentAgent`, `getInitialAgentId`, `filteredAgents`, agent-loading effect |
| `useStreamManager` | `hooks/useStreamManager.ts` | Wraps `useSSEHandler`, exposes `send/cancel/connect`, owns `sessionIdMapRef`, `connectToStreamRef` |
| `useSuggestedPrompts` | `hooks/useSuggestedPrompts.ts` | `fetchSuggestedPrompts`, `suggestedPrompts`, `isLoadingSuggestedPrompts`, `cachedPromptResponses`, fetch effect |
| `useAutoPrompt` | `hooks/useAutoPrompt.ts` | All timer/countdown/cycle logic from `WebSDKContent` |
| `useTimerManager` | `hooks/useTimerManager.ts` | Step 2 — already designed |

### Existing hooks (unchanged)

- `useAppBootstrap` — minor: accept `transitionOctoState` callback
- `useSSEHandler` — unchanged
- `useVideoStyles` — unchanged

### What stays in `AgentsProvider`

- All `useState` declarations (React owns state, hooks receive setters)
- Context value object assembly
- OctoState machine instantiation
- LifecycleController instantiation
- `handleSendMessage` (coordinates too many hooks to extract cleanly — leave for later)
- `pendingMessages` processing effect

### `WebSDKContent` after Step 5

Drops `useAutoPrompt` extraction — component goes from ~870 lines to ~300 lines. Receives `countdown`, `panelViewCountdown`, `cancelCycle`, `handleCompactPromptSend`, `handleAutoPromptClick` from `useAutoPrompt({ timer, octoState, autoPrompt, ... })`.

### External API

`AgentsContextType` interface unchanged. All existing consumers (`useAgentsContext()`) work without modification.

---

## File Map (new files created)

```
packages/genai/src/
  context/app/
    octo-state.ts                         # OctoState enum + transition table
    hooks/
      useOctoStateMachine.ts              # state machine hook
      useTimerManager.ts                  # centralized timer management
      useLifecycleController.ts           # pause/resume/cancel/destroy
      useSessionManager.ts                # session CRUD + history
      useAgentManager.ts                  # agent list + switching
      useStreamManager.ts                 # SSE send/connect/cancel wrapper
      useSuggestedPrompts.ts              # prompts fetch + cache
      useAutoPrompt.ts                    # countdown + cycle logic (from WebSDKContent)
  types/
    auto-prompt.ts                        # AutoPromptConfig interface
```

## Files modified

```
packages/genai/src/
  context/app/provider.tsx                # orchestrator, adds octoState/lifecycle/autoPrompt to context
  context/app/types.ts                    # adds octoState, lifecycle, autoPrompt, onStateChange
  context/AppProviders.tsx                # adds autoPrompt prop, keeps allowAutoPrompt compat
  context/app/hooks/useAppBootstrap.ts    # accepts transitionOctoState callback
  components/WebSDK/WebSDKContent.tsx     # uses useAutoPrompt + useTimerManager, drops 5 refs
```

---

## Backward Compatibility

- `allowAutoPrompt` prop kept — maps to `autoPrompt.mode`
- `allowAutoPrompt` + `globalAllowAutoPrompt` on context kept as deprecated aliases until consumers migrate
- `thinking` + `session.status` fields unchanged — OctoState is additive
- `AgentsContextType` interface: only additions, no removals
- All existing `useAgentsContext()` call sites work without changes
