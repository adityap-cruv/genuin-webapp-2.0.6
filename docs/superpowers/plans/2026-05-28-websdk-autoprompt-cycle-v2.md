# WebSDK Auto-Prompt Cycle v2 + Bidirectional Event Bridge Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rewrite the WebSDK auto-prompt cycle so prompts fire one-by-one with cached-response support, full `AutoPromptConfig` mode enforcement, and a clean bidirectional event bridge between the embedded SDK and the host page.

**Architecture:** The cycle lives entirely in `useAutoPromptCycle`. A new `useCachedResponsePlayer` helper injects cached SSE events into the session without a real HTTP round-trip. `useWebSdkBridge` centralises all inbound/outbound `CustomEvent` I/O so the rest of the system has typed, testable touch-points instead of scattered `window.addEventListener` calls.

**Tech Stack:** React 19, TypeScript strict, `useTimerManager` (existing), `CustomEvent` on `window`, Vitest + React Testing Library.

---

## Current State — What Exists

| File | What it does |
|---|---|
| `useAutoPromptCycle.ts` | Prompt countdown → send. Handles compact-idle, full-view post-response cycle. |
| `useTimerManager.ts` | Key-based timer registry. No changes needed. |
| `useSuggestedPrompts.ts` | Fetches prompts + pre-fetches cached responses via `getVideoSuggestedPrompts`. Returns `cachedPromptResponses: Map<string, CachedResponseItem[]>`. |
| `ChatProvider` | Owns `cachedPromptResponses`. Not exposed to `useAutoPromptCycle` today. |
| `useWebSdkEventBroadcaster.ts` | Fires `genai:webSdkThinkingStarted` and `genai:webSdkError`. |
| `useWebSdkExpandTrigger.ts` | Fires `genai:webSdkRequestExpand` when first agent message arrives. |
| `UIProvider` | Listens for `genai:webSdkRenderMode` to accept inbound view changes. |

## What Changes

| File | Change |
|---|---|
| `context/app/chat/types.ts` | Expose `cachedPromptResponses` already on `ChatContextType` (no-op, it's there). |
| `useAutoPromptCycle.ts` | Full rewrite: per-prompt sequential cycle, cached-response path, mode enforcement. |
| `hooks/useWebSdkBridge.ts` | **New.** Centralises all `CustomEvent` I/O. |
| `WebSDKContent.tsx` | Wire `cachedPromptResponses` + `useWebSdkBridge`. Minor. |
| `auto-prompt-config.ts` | No change needed. |

---

## Event Dictionary (source of truth for the bridge)

### Outbound (SDK → host page)

| Event | Payload | When |
|---|---|---|
| `genai:webSdkCountdownActive` | `{ parentOctoPanelId, isActive: boolean, source: string }` | Countdown starts/stops |
| `genai:webSdkAutoClose` | `{ parentOctoPanelId }` | Chat auto-closes after `chatCloseDelayMs` |
| `genai:webSdkRequestExpand` | `{ parentOctoPanelId, sessionId }` | SDK requests host to expand panel |
| `genai:webSdkThinkingStarted` | `{ parentOctoPanelId }` | Agent starts thinking |
| `genai:webSdkError` | `{ parentOctoPanelId }` | Session enters error state |
| `genai:webSdkStateChange` | `{ parentOctoPanelId, octoState }` | Any `OctoState` transition |
| `genai:webSdkSessionChange` | `{ parentOctoPanelId, sessionId: string \| null }` | Session created or cleared |

### Inbound (host page → SDK)

| Event | Payload | Handler |
|---|---|---|
| `genai:webSdkRenderMode` | `{ mode: 'compact'\|'full', parentOctoPanelId? }` | Already in `UIProvider` — bridge re-uses |
| `genai:webSdkAutoClose` | `{ parentOctoPanelId? }` | Already in `useAutoPromptCycle` — bridge re-uses |
| `sdk:userInteracted` | `{}` | Already in `useAutoPromptCycle` — bridge re-uses |
| `genai:webSdkCancelCycle` | `{ parentOctoPanelId? }` | **New.** External cancel of any pending cycle. |

---

## Prompt Cycle Logic (the spec the code must implement)

```
Initialise:
  promptIndex = 0   (first prompt shown immediately on load)

For each prompt at promptIndex:
  1. SET PROMPT — display prompt text as dummy message
  2. WAIT COUNTDOWN — tick countdownMs, respect mode:
       disabled       → skip entirely (no display, no send)
       countdown-only → tick countdown, fill input, STOP (no send)
       full           → tick countdown, then SEND
  3. SEND (full mode only):
       if cachedPromptResponses has entry for this prompt:
         inject cached events into session (no HTTP)
       else:
         call handleSendMessage (normal SSE path)

After response completes (full mode only):
  4. WAIT chatCloseDelayMs
       if user interacts → ABORT, clear all pending actions
  5. CLOSE CHAT — handleNewChat(), setWebSdkRenderMode('compact')
       dispatch genai:webSdkAutoClose
  6. WAIT nextPromptDelayMs
       if user interacts → ABORT, clear all pending actions
  7. ADVANCE promptIndex = (promptIndex + 1) % prompts.length
  8. GOTO step 1 for next prompt

User interaction kills steps 4–8 only (not the current send/stream).
isBusy pauses any active countdown until false.
```

---

## Task 1: Add `cachedPromptResponses` to `useAutoPromptCycle` params

**Files:**
- Modify: `packages/genai/src/components/WebSDK/hooks/useAutoPromptCycle.ts`
- Modify: `packages/genai/src/components/WebSDK/WebSDKContent.tsx`

- [ ] **Step 1: Update param interface**

In `useAutoPromptCycle.ts`, add `cachedPromptResponses` to `UseAutoPromptCycleParams`:

```typescript
import type { CachedResponseItem } from '@/lib/apiTypes';

interface UseAutoPromptCycleParams {
    allowAutoPrompt: boolean;
    autoPromptConfig: AutoPromptConfig;
    octoState: OctoState;
    currentSessionId: string | null;
    sessions: Session[];
    suggestedPrompts: string[];
    cachedPromptResponses: Map<string, CachedResponseItem[]>;   // ← add
    webSdkRenderMode: 'compact' | 'full';
    parentOctoPanelId: string | null | undefined;
    setWebSdkRenderMode: (mode: 'compact' | 'full') => void;
    setIsSuggestionsOpen: (open: boolean) => void;
    handleSendMessage: (params: HandleSendMessageParams) => void;
    handleNewChat: () => void;
}
```

- [ ] **Step 2: Wire it in `WebSDKContent.tsx`**

`cachedPromptResponses` is on `ChatContext`. Read it:

```typescript
// In WebSDKContent.tsx — add to existing useChatContext destructure:
const { handleSendMessage, cachedPromptResponses } = useChatContext();
```

Then pass to `useAutoPromptCycle`:

```typescript
const { /* existing */ } = useAutoPromptCycle({
    // ... existing params ...
    cachedPromptResponses,
});
```

- [ ] **Step 3: Verify TypeScript**

```bash
cd packages/genai && pnpm typecheck
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add packages/genai/src/components/WebSDK/hooks/useAutoPromptCycle.ts \
        packages/genai/src/components/WebSDK/WebSDKContent.tsx
git commit -m "feat(websdk): thread cachedPromptResponses into useAutoPromptCycle"
```

---

## Task 2: Build `useCachedResponsePlayer` — inject cached responses as synthetic SSE

**Files:**
- Create: `packages/genai/src/components/WebSDK/hooks/useCachedResponsePlayer.ts`

This hook converts `CachedResponseItem[]` into `ChatHistoryEvent` entries and appends them to the matching session, exactly as if a real SSE stream had fired. Uses the existing `convertCachedResponseToEvents` utility in `packages/genai/src/core/CachedResponseConverter.ts`.

- [ ] **Step 1: Read `CachedResponseConverter` to understand the output type**

```bash
cat packages/genai/src/core/CachedResponseConverter.ts
```

Note the return type — it returns `ChatHistoryEvent[]`.

- [ ] **Step 2: Read `Session` and `ChatHistoryEvent` types**

```bash
grep -n "ChatHistoryEvent\|interface Session" packages/genai/src/types/index.ts | head -40
```

- [ ] **Step 3: Create the hook**

```typescript
// packages/genai/src/components/WebSDK/hooks/useCachedResponsePlayer.ts
import { useCallback } from 'react';

import { convertCachedResponseToEvents } from '@/core/CachedResponseConverter';
import type { CachedResponseItem } from '@/lib/apiTypes';
import type { Session } from '@/types';

interface UseCachedResponsePlayerParams {
    setSessions: (updater: (prev: Session[]) => Session[]) => void;
}

export interface UseCachedResponsePlayerResult {
    playCachedResponse: (sessionId: string, cachedItems: CachedResponseItem[], prompt: string) => void;
}

/**
 * Injects a pre-fetched prompt response into the session as synthetic chat events,
 * bypassing the SSE stream entirely.
 */
export function useCachedResponsePlayer({
    setSessions,
}: UseCachedResponsePlayerParams): UseCachedResponsePlayerResult {
    const playCachedResponse = useCallback(
        (sessionId: string, cachedItems: CachedResponseItem[], prompt: string) => {
            const agentEvents = convertCachedResponseToEvents(cachedItems);

            setSessions(prev =>
                prev.map(s => {
                    if (s.id !== sessionId) return s;

                    const userEvent = {
                        id: `${Date.now()}-user`,
                        message: { content: prompt },
                        role: 'user' as const,
                        parent_id: null,
                        feedback: null,
                        created_at: new Date().toISOString(),
                        artifacts: [],
                        isCompleted: true,
                    };

                    return {
                        ...s,
                        chat: [...s.chat, userEvent, ...agentEvents],
                        thinking: false,
                        status: 'done' as const,
                    };
                })
            );
        },
        [setSessions]
    );

    return { playCachedResponse };
}
```

- [ ] **Step 4: Check `convertCachedResponseToEvents` signature and adjust if needed**

The import path must match exactly. Verify:

```bash
grep -rn "export function convertCachedResponseToEvents" packages/genai/src/
```

If path differs, update the import in the new hook.

- [ ] **Step 5: Typecheck**

```bash
cd packages/genai && pnpm typecheck
```

- [ ] **Step 6: Commit**

```bash
git add packages/genai/src/components/WebSDK/hooks/useCachedResponsePlayer.ts
git commit -m "feat(websdk): add useCachedResponsePlayer for cache-first prompt sending"
```

---

## Task 3: Rewrite `runCountdownThenSend` with proper mode enforcement + cached-response path

**Files:**
- Modify: `packages/genai/src/components/WebSDK/hooks/useAutoPromptCycle.ts`

This is the heart of the change. The existing `runCountdownThenSend` callback will be replaced with one that:
1. Skips entirely if `mode === 'disabled'`
2. Ticks countdown, then fills input and stops if `mode === 'countdown-only'`
3. Ticks countdown, then sends (cached first, SSE fallback) if `mode === 'full'`

The `setSessions` function needed for the cached path must be added to params (see Step 1 below).

- [ ] **Step 1: Add `setSessions` to `UseAutoPromptCycleParams`**

```typescript
import type { Session } from '@/types';

interface UseAutoPromptCycleParams {
    // ... existing ...
    setSessions: (updater: (prev: Session[]) => Session[]) => void;  // ← add
}
```

Wire it in `WebSDKContent.tsx`:

```typescript
const { sessions, currentSessionId, setEnteredInChatMode, setSessions } = useSessionContext();
// then pass to useAutoPromptCycle: setSessions,
```

Verify `setSessions` exists on `SessionContext`:

```bash
grep -n "setSessions" packages/genai/src/context/app/session/context.tsx packages/genai/src/context/app/session/provider.tsx
```

- [ ] **Step 2: Import `useCachedResponsePlayer` inside `useAutoPromptCycle`**

At the top of `useAutoPromptCycle.ts`:

```typescript
import { useCachedResponsePlayer } from './useCachedResponsePlayer';
```

And instantiate it inside the hook body (after existing state):

```typescript
const { playCachedResponse } = useCachedResponsePlayer({ setSessions });
```

- [ ] **Step 3: Replace `runCountdownThenSend` with new implementation**

Remove the old `runCountdownThenSend` and replace with:

```typescript
const runCountdownThenSend = useCallback(
    (
        prompt: string,
        opts: {
            targetSessionId: string | null;
            timerKey: 'countdown' | 'panelCountdown';
            onStart?: () => void;
            onCancel?: () => void;
        }
    ) => {
        // disabled mode: do nothing
        if (isDisabled) return;

        const { targetSessionId, timerKey } = opts;
        const setCountdownFn = timerKey === 'countdown' ? setCountdown : setPanelViewCountdown;

        setShowDummyMessage(true);
        opts.onStart?.();

        if (parentOctoPanelId) {
            window.dispatchEvent(
                new CustomEvent('genai:webSdkCountdownActive', {
                    detail: { parentOctoPanelId, isActive: true, source: 'countdown_started' },
                })
            );
        }

        analytics.trackAutoPromptCountdownStarted({
            prompt,
            countdown_duration: COUNTDOWN_SECONDS,
        });

        setCountdownFn(COUNTDOWN_SECONDS);
        let timeLeft = COUNTDOWN_SECONDS;

        timerSetInterval(
            timerKey,
            () => {
                timeLeft -= 1;
                setCountdownFn(timeLeft);

                if (timeLeft > 0) return;

                timerClear(timerKey);
                setShowDummyMessage(false);
                setCountdownFn(null);

                // Guard: user interacted, busy, or session exists → cancel send
                if (userInteractedRef.current || isBusyRef.current || currentSessionIdRef.current) {
                    opts.onCancel?.();
                    return;
                }

                // countdown-only: fill input, do not send
                if (isCountdownOnly) {
                    setInput(prompt);
                    return;
                }

                // full mode: use cached response if available, else real SSE
                analytics.trackAutoPromptExecuted({ prompt });

                const cached = cachedPromptResponses.get(prompt);
                if (cached && cached.length > 0 && targetSessionId) {
                    playCachedResponse(targetSessionId, cached, prompt);
                } else {
                    handleSendMessage({
                        targetSessionId,
                        messageInput: prompt,
                        onMessageQueued: () => setCountdownFn(null),
                    });
                }
            },
            1000
        );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
        COUNTDOWN_SECONDS,
        isDisabled,
        isCountdownOnly,
        parentOctoPanelId,
        timerSetInterval,
        timerClear,
        cachedPromptResponses,
        playCachedResponse,
    ]
);
```

- [ ] **Step 4: Typecheck**

```bash
cd packages/genai && pnpm typecheck
```

- [ ] **Step 5: Commit**

```bash
git add packages/genai/src/components/WebSDK/hooks/useAutoPromptCycle.ts \
        packages/genai/src/components/WebSDK/WebSDKContent.tsx
git commit -m "feat(websdk): enforce AutoPromptConfig mode + cached-response path in countdown"
```

---

## Task 4: Fix the sequential multi-prompt cycle (steps 4–8 of the spec)

**Files:**
- Modify: `packages/genai/src/components/WebSDK/hooks/useAutoPromptCycle.ts`

The full-view cycle (after response completes) must: wait `chatCloseDelayMs`, close, wait `nextPromptDelayMs`, then fire the **next** prompt index. User interaction at any point during steps 4–8 aborts everything.

- [ ] **Step 1: Update `cancelFullViewCycle` to also clear interaction guard per-cycle**

The current implementation sets `userInteractedRef.current = true` globally which is correct. Keep it. But add a cycle-scoped interaction flag that resets at the start of each cycle iteration so a new prompt cycle can always begin fresh.

Replace the existing `cancelFullViewCycle`:

```typescript
const cancelFullViewCycle = useCallback(() => {
    userInteractedRef.current = true;
    timerClear('idle');
    timerClear('videoPlay');
    timerClear('countdown');
    timerClear('panelCountdown');
    setCountdown(null);
    setPanelViewCountdown(null);
    setShowDummyMessage(false);
}, [timerClear]);
```

- [ ] **Step 2: Rewrite the full-view cycle `useEffect`**

Replace the existing effect that handles `CHAT_CLOSE_DELAY_MS`:

```typescript
// Full-view cycle: response complete → chatCloseDelayMs → close → nextPromptDelayMs → next prompt
useEffect(() => {
    if (!allowAutoPrompt || !isFullCycle) return;
    if (webSdkRenderMode !== 'full') return;
    if (!currentSessionId) return;

    const currentSession = sessions.find(s => s.id === currentSessionId);
    if (!currentSession) return;

    const lastAgentEvent = [...(currentSession.chat || [])].reverse().find(e => e.role === 'agent');
    if (!lastAgentEvent?.isCompleted) return;

    const messageId = lastAgentEvent.id ?? null;
    if (!messageId || cycleStartedForMessageRef.current === messageId) return;

    cycleStartedForMessageRef.current = messageId;
    // Reset interaction guard so this new cycle can proceed
    userInteractedRef.current = false;

    if (CHAT_CLOSE_DELAY_MS === undefined) return;

    timerSetTimeout(
        'idle',
        () => {
            if (userInteractedRef.current) return;

            const promptsSnapshot = suggestedPrompts.slice();

            isPostCloseModeRef.current = true;
            setIsPostCloseMode(true);
            handleNewChat();
            setInput('');
            setWebSdkRenderMode('compact');

            if (parentOctoPanelId) {
                window.dispatchEvent(
                    new CustomEvent('genai:webSdkAutoClose', {
                        detail: { parentOctoPanelId },
                    })
                );
            }

            if (NEXT_PROMPT_DELAY_MS === undefined) return;

            timerSetTimeout(
                'videoPlay',
                () => {
                    if (userInteractedRef.current) return;
                    if (promptsSnapshot.length === 0) return;

                    // Sequential: advance index, wrap around
                    const index = nextPromptIndexRef.current % promptsSnapshot.length;
                    nextPromptIndexRef.current = index + 1;
                    const nextPrompt = promptsSnapshot[index];
                    if (!nextPrompt) return;

                    runCountdownThenSend(nextPrompt, {
                        targetSessionId: null,
                        timerKey: 'countdown',
                    });
                },
                NEXT_PROMPT_DELAY_MS
            );
        },
        CHAT_CLOSE_DELAY_MS
    );

    return () => {
        timerClear('idle');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
}, [currentSessionId, sessions, webSdkRenderMode]);
```

- [ ] **Step 3: Typecheck**

```bash
cd packages/genai && pnpm typecheck
```

- [ ] **Step 4: Commit**

```bash
git add packages/genai/src/components/WebSDK/hooks/useAutoPromptCycle.ts
git commit -m "feat(websdk): sequential multi-prompt cycle with interaction abort"
```

---

## Task 5: Build `useWebSdkBridge` — centralised bidirectional event bridge

**Files:**
- Create: `packages/genai/src/components/WebSDK/hooks/useWebSdkBridge.ts`

This hook owns **all** `CustomEvent` I/O for the WebSDK. Everything that was scattered across `useAutoPromptCycle`, `useWebSdkEventBroadcaster`, `useWebSdkExpandTrigger`, and `UIProvider` gets a typed wrapper here. Existing code still dispatches/listens directly — this does NOT refactor them in this task. The bridge adds the new events only: `genai:webSdkStateChange`, `genai:webSdkSessionChange`, and the new inbound `genai:webSdkCancelCycle`.

- [ ] **Step 1: Create the hook**

```typescript
// packages/genai/src/components/WebSDK/hooks/useWebSdkBridge.ts
import { useEffect } from 'react';

import type { OctoState } from '@/context/app/octo-state';

interface UseWebSdkBridgeParams {
    parentOctoPanelId: string | null | undefined;
    octoState: OctoState;
    currentSessionId: string | null;
    webSdkRenderMode: 'compact' | 'full';
    /** Called when host page fires genai:webSdkCancelCycle */
    onExternalCancelCycle: () => void;
    /** Called when host page fires genai:webSdkRenderMode (already handled by UIProvider — bridge just notifies) */
    onExternalRenderModeChange?: (mode: 'compact' | 'full') => void;
}

/** Dispatches outbound state/session change events and handles inbound cancel-cycle events. */
export function useWebSdkBridge({
    parentOctoPanelId,
    octoState,
    currentSessionId,
    onExternalCancelCycle,
}: UseWebSdkBridgeParams): void {
    // Broadcast OctoState changes outbound
    useEffect(() => {
        if (!parentOctoPanelId) return;
        window.dispatchEvent(
            new CustomEvent('genai:webSdkStateChange', {
                detail: { parentOctoPanelId, octoState },
            })
        );
    }, [parentOctoPanelId, octoState]);

    // Broadcast session changes outbound
    useEffect(() => {
        if (!parentOctoPanelId) return;
        window.dispatchEvent(
            new CustomEvent('genai:webSdkSessionChange', {
                detail: { parentOctoPanelId, sessionId: currentSessionId },
            })
        );
    }, [parentOctoPanelId, currentSessionId]);

    // Listen for external cycle cancellation
    useEffect(() => {
        const handler = (event: Event) => {
            const { detail } = event as CustomEvent<{ parentOctoPanelId?: string }>;
            if (detail?.parentOctoPanelId && parentOctoPanelId && detail.parentOctoPanelId !== parentOctoPanelId) {
                return;
            }
            onExternalCancelCycle();
        };

        window.addEventListener('genai:webSdkCancelCycle', handler);
        return () => window.removeEventListener('genai:webSdkCancelCycle', handler);
    }, [parentOctoPanelId, onExternalCancelCycle]);
}
```

- [ ] **Step 2: Wire into `WebSDKContent.tsx`**

```typescript
import { useWebSdkBridge } from './hooks/useWebSdkBridge';

// Inside WebSDKContent, after useAutoPromptCycle destructure:
useWebSdkBridge({
    parentOctoPanelId,
    octoState,
    currentSessionId,
    webSdkRenderMode,
    onExternalCancelCycle: cancelFullViewCycle,
});
```

Remove the existing `useWebSdkEventBroadcaster` import only if its events are fully covered — they are not yet (it still owns `thinkingStarted` and `error`). Keep both hooks for now.

- [ ] **Step 3: Typecheck**

```bash
cd packages/genai && pnpm typecheck
```

- [ ] **Step 4: Commit**

```bash
git add packages/genai/src/components/WebSDK/hooks/useWebSdkBridge.ts \
        packages/genai/src/components/WebSDK/WebSDKContent.tsx
git commit -m "feat(websdk): add useWebSdkBridge for bidirectional state/session event bridge"
```

---

## Task 6: Migrate remaining scattered events into `useWebSdkBridge`

**Files:**
- Modify: `packages/genai/src/components/WebSDK/hooks/useWebSdkBridge.ts`
- Modify: `packages/genai/src/components/WebSDK/hooks/useWebSdkEventBroadcaster.ts`
- Modify: `packages/genai/src/components/WebSDK/hooks/useWebSdkExpandTrigger.ts`
- Modify: `packages/genai/src/components/WebSDK/WebSDKContent.tsx`

Absorb `genai:webSdkThinkingStarted`, `genai:webSdkError`, and `genai:webSdkRequestExpand` into the bridge. Delete `useWebSdkEventBroadcaster` and `useWebSdkExpandTrigger` after migrating.

- [ ] **Step 1: Extend `UseWebSdkBridgeParams`**

```typescript
interface UseWebSdkBridgeParams {
    parentOctoPanelId: string | null | undefined;
    octoState: OctoState;
    currentSessionId: string | null;
    webSdkRenderMode: 'compact' | 'full';
    sessions: Session[];
    onExternalCancelCycle: () => void;
    /** Triggered by expand logic — bridge fires the expand event. */
    onRequestExpand?: (sessionId: string) => void;
}
```

- [ ] **Step 2: Move thinking + error broadcast from `useWebSdkEventBroadcaster` into bridge**

Add inside `useWebSdkBridge`:

```typescript
import { useRef } from 'react';
import type { Session } from '@/types';

// Inside useWebSdkBridge, add these two effects:

const thinkingFiredRef = useRef<string | null>(null);
const errorFiredRef = useRef<string | null>(null);

const currentSession = currentSessionId ? sessions.find(s => s.id === currentSessionId) : undefined;
const isThinking = currentSession?.thinking ?? false;
const sessionStatus = currentSession?.status;

useEffect(() => {
    if (!parentOctoPanelId || !currentSessionId) return;
    if (thinkingFiredRef.current === currentSessionId) return;
    if (!isThinking) return;
    thinkingFiredRef.current = currentSessionId;
    window.dispatchEvent(new CustomEvent('genai:webSdkThinkingStarted', { detail: { parentOctoPanelId } }));
}, [parentOctoPanelId, currentSessionId, isThinking]);

useEffect(() => {
    if (!parentOctoPanelId || !currentSessionId) return;
    if (errorFiredRef.current === currentSessionId) return;
    if (sessionStatus !== 'error') return;
    errorFiredRef.current = currentSessionId;
    window.dispatchEvent(new CustomEvent('genai:webSdkError', { detail: { parentOctoPanelId } }));
}, [parentOctoPanelId, currentSessionId, sessionStatus]);

useEffect(() => {
    if (!currentSessionId) {
        thinkingFiredRef.current = null;
        errorFiredRef.current = null;
    }
}, [currentSessionId]);
```

- [ ] **Step 3: Move expand logic from `useWebSdkExpandTrigger` into bridge**

Add inside `useWebSdkBridge`:

```typescript
const expandRequestedMessageRef = useRef<string | null>(null);

useEffect(() => {
    if (!currentSessionId) {
        expandRequestedMessageRef.current = null;
        return;
    }

    const session = sessions.find(s => s.id === currentSessionId);
    if (!session) {
        expandRequestedMessageRef.current = null;
        return;
    }

    const latestAgentMessage = [...(session.chat || [])].reverse().find(
        e =>
            e.role === 'agent' &&
            (e.message?.content?.trim() ||
                e.carousel_metadata ||
                e.metadata?.toolMetadata ||
                (e.contentSequence && e.contentSequence.length > 0))
    );

    if (!latestAgentMessage) {
        expandRequestedMessageRef.current = null;
        return;
    }

    const msgId = latestAgentMessage.id ?? null;

    if (webSdkRenderMode !== 'compact') {
        expandRequestedMessageRef.current = msgId;
        return;
    }

    if (!msgId || expandRequestedMessageRef.current === msgId) return;

    expandRequestedMessageRef.current = msgId;

    if (parentOctoPanelId) {
        window.dispatchEvent(
            new CustomEvent('genai:webSdkRequestExpand', {
                detail: { parentOctoPanelId, sessionId: currentSessionId },
            })
        );
    }
}, [currentSessionId, sessions, parentOctoPanelId, webSdkRenderMode]);
```

- [ ] **Step 4: Update `WebSDKContent.tsx`**

Remove imports:
```typescript
// DELETE these lines:
import { useWebSdkEventBroadcaster } from './hooks/useWebSdkEventBroadcaster';
import { useWebSdkExpandTrigger } from './hooks/useWebSdkExpandTrigger';
```

Remove the hook calls:
```typescript
// DELETE these blocks:
useWebSdkAgentInit({ agents, setCurrentAgent, setEnteredInChatMode });

useWebSdkExpandTrigger({
    allowAutoPrompt: allowAutoPrompt ?? false,
    isAutoPromptDisabled,
    currentSessionId,
    sessions,
    webSdkRenderMode,
    parentOctoPanelId,
    setWebSdkRenderMode,
});

useWebSdkEventBroadcaster({ currentSessionId, sessions, parentOctoPanelId });
```

Update `useWebSdkBridge` call to include `sessions`:
```typescript
useWebSdkBridge({
    parentOctoPanelId,
    octoState,
    currentSessionId,
    webSdkRenderMode,
    sessions,
    onExternalCancelCycle: cancelFullViewCycle,
});
```

Keep `useWebSdkAgentInit` — that one is unrelated to events.

- [ ] **Step 5: Typecheck**

```bash
cd packages/genai && pnpm typecheck
```

- [ ] **Step 6: Delete deprecated hooks**

```bash
rm packages/genai/src/components/WebSDK/hooks/useWebSdkEventBroadcaster.ts
rm packages/genai/src/components/WebSDK/hooks/useWebSdkExpandTrigger.ts
```

- [ ] **Step 7: Typecheck again to confirm no dangling imports**

```bash
cd packages/genai && pnpm typecheck
```

- [ ] **Step 8: Commit**

```bash
git add packages/genai/src/components/WebSDK/hooks/useWebSdkBridge.ts \
        packages/genai/src/components/WebSDK/WebSDKContent.tsx
git commit -m "feat(websdk): consolidate all event I/O into useWebSdkBridge, remove broadcaster+expandTrigger"
```

---

## Task 7: Handle inbound `genai:webSdkRenderMode` with proper interaction reset

**Files:**
- Modify: `packages/genai/src/context/app/ui/provider.tsx`
- Modify: `packages/genai/src/components/WebSDK/hooks/useWebSdkBridge.ts`

When the host page sets render mode externally (e.g. Octo collapses the panel), the cycle state inside `useAutoPromptCycle` should react. Currently `UIProvider` handles `genai:webSdkRenderMode` but `useAutoPromptCycle` doesn't know the origin was external.

- [ ] **Step 1: Add `onExternalRenderModeChange` callback to bridge params and wire it**

In `useWebSdkBridge.ts`, add the inbound render-mode listener (currently in `UIProvider`). The bridge calls the callback; `WebSDKContent` passes `cancelFullViewCycle` as the callback so any external collapse cancels active cycles.

```typescript
// Add to UseWebSdkBridgeParams:
onExternalRenderModeChange?: (mode: 'compact' | 'full') => void;

// Add effect inside useWebSdkBridge:
useEffect(() => {
    if (!onExternalRenderModeChange) return;

    const handler = (event: Event) => {
        const { detail } = event as CustomEvent<{ mode?: 'compact' | 'full'; parentOctoPanelId?: string }>;
        if (!detail?.mode) return;
        if (detail.parentOctoPanelId && parentOctoPanelId && detail.parentOctoPanelId !== parentOctoPanelId) return;
        onExternalRenderModeChange(detail.mode);
    };

    window.addEventListener('genai:webSdkRenderMode', handler);
    return () => window.removeEventListener('genai:webSdkRenderMode', handler);
}, [parentOctoPanelId, onExternalRenderModeChange]);
```

- [ ] **Step 2: Wire in `WebSDKContent.tsx`**

```typescript
useWebSdkBridge({
    parentOctoPanelId,
    octoState,
    currentSessionId,
    webSdkRenderMode,
    sessions,
    onExternalCancelCycle: cancelFullViewCycle,
    onExternalRenderModeChange: (mode) => {
        setWebSdkRenderMode(mode);
        if (mode === 'compact') cancelFullViewCycle();
    },
});
```

- [ ] **Step 3: Remove the duplicate listener from `UIProvider`**

In `packages/genai/src/context/app/ui/provider.tsx`, delete the `genai:webSdkRenderMode` listener effect (lines ~134–150). The bridge now handles it. The `setWebSdkRenderMode` call from the bridge callback in `WebSDKContent` will call the same `setWebSdkRenderModeValue` function.

```typescript
// DELETE this block from UIProvider:
useEffect(() => {
    if (view !== 'web-sdk') return;

    const listener = (event: Event) => {
        const { detail } = event as CustomEvent<{
            mode?: 'compact' | 'full';
            parentOctoPanelId?: string;
        }>;
        const { mode, parentOctoPanelId: targetPanelId } = detail || {};
        if (!mode) return;
        if (targetPanelId && parentOctoPanelId && targetPanelId !== parentOctoPanelId) return;
        setWebSdkRenderModeState(mode);
    };

    window.addEventListener('genai:webSdkRenderMode', listener);
    return () => window.removeEventListener('genai:webSdkRenderMode', listener);
}, [view, parentOctoPanelId]);
```

- [ ] **Step 4: Typecheck**

```bash
cd packages/genai && pnpm typecheck
```

- [ ] **Step 5: Commit**

```bash
git add packages/genai/src/components/WebSDK/hooks/useWebSdkBridge.ts \
        packages/genai/src/components/WebSDK/WebSDKContent.tsx \
        packages/genai/src/context/app/ui/provider.tsx
git commit -m "feat(websdk): bridge handles inbound render-mode, cancels cycle on external collapse"
```

---

## Task 8: Guard compact-idle effect with `isDisabled` + `allowAutoPrompt`

**Files:**
- Modify: `packages/genai/src/components/WebSDK/hooks/useAutoPromptCycle.ts`

The compact-idle effect (which fires `runCountdownThenSend` for the first prompt) currently checks `isDisabled` via `isPostCloseModeRef`. But if `autoPromptConfig.mode === 'disabled'` it should never show any dummy message. Make the guard explicit at the top of the effect.

- [ ] **Step 1: Update compact-idle effect guard**

Replace:
```typescript
if (isPostCloseModeRef.current || !allowAutoPrompt || isDisabled) return;
```

With (same, but also guard `isCountdownOnly` path so it still runs):
```typescript
// disabled mode: never auto-fire anything
if (isDisabled || !allowAutoPrompt || isPostCloseModeRef.current) return;
```

This is identical logic but documents intent explicitly. The `runCountdownThenSend` already guards internally for `isDisabled`, but the early return prevents even the countdown-only flow from firing in disabled mode.

- [ ] **Step 2: Typecheck + lint**

```bash
cd packages/genai && pnpm typecheck && pnpm lint
```

- [ ] **Step 3: Commit**

```bash
git add packages/genai/src/components/WebSDK/hooks/useAutoPromptCycle.ts
git commit -m "fix(websdk): guard compact-idle effect against disabled mode explicitly"
```

---

## Task 9: Export event name constants to prevent typos

**Files:**
- Create: `packages/genai/src/components/WebSDK/webSdkEvents.ts`

All event name strings in one place. Import from here in the bridge and any other dispatch sites.

- [ ] **Step 1: Create constants file**

```typescript
// packages/genai/src/components/WebSDK/webSdkEvents.ts

/** Outbound events dispatched by the SDK to the host page. */
export const WEB_SDK_EVENTS = {
    COUNTDOWN_ACTIVE: 'genai:webSdkCountdownActive',
    AUTO_CLOSE: 'genai:webSdkAutoClose',
    REQUEST_EXPAND: 'genai:webSdkRequestExpand',
    THINKING_STARTED: 'genai:webSdkThinkingStarted',
    ERROR: 'genai:webSdkError',
    STATE_CHANGE: 'genai:webSdkStateChange',
    SESSION_CHANGE: 'genai:webSdkSessionChange',
} as const;

/** Inbound events the SDK listens for from the host page. */
export const WEB_SDK_INBOUND_EVENTS = {
    RENDER_MODE: 'genai:webSdkRenderMode',
    AUTO_CLOSE: 'genai:webSdkAutoClose',
    CANCEL_CYCLE: 'genai:webSdkCancelCycle',
    USER_INTERACTED: 'sdk:userInteracted',
} as const;
```

- [ ] **Step 2: Replace string literals in `useWebSdkBridge.ts`**

Update every `'genai:webSdk...'` and `'sdk:userInteracted'` string in the bridge file to use the constants:

```typescript
import { WEB_SDK_EVENTS, WEB_SDK_INBOUND_EVENTS } from '../webSdkEvents';

// Example usage:
window.dispatchEvent(new CustomEvent(WEB_SDK_EVENTS.STATE_CHANGE, { detail: { ... } }));
window.addEventListener(WEB_SDK_INBOUND_EVENTS.CANCEL_CYCLE, handler);
```

- [ ] **Step 3: Replace string literals in `useAutoPromptCycle.ts`**

```typescript
import { WEB_SDK_EVENTS, WEB_SDK_INBOUND_EVENTS } from '../webSdkEvents';
```

Replace all inline string event names with the constants.

- [ ] **Step 4: Typecheck**

```bash
cd packages/genai && pnpm typecheck
```

- [ ] **Step 5: Commit**

```bash
git add packages/genai/src/components/WebSDK/webSdkEvents.ts \
        packages/genai/src/components/WebSDK/hooks/useWebSdkBridge.ts \
        packages/genai/src/components/WebSDK/hooks/useAutoPromptCycle.ts
git commit -m "refactor(websdk): centralise event name constants in webSdkEvents.ts"
```

---

## Self-Review

### Spec coverage check

| Requirement | Covered by task |
|---|---|
| Show prompts one by one | Task 4 — `nextPromptIndexRef` advances per cycle |
| Cached response path | Tasks 2 + 3 |
| `disabled` → skip | Task 3 `runCountdownThenSend` early return + Task 8 effect guard |
| `countdown-only` → fill input, no send | Task 3 |
| `full` → countdown + send | Task 3 |
| `chatCloseDelayMs` → close after response | Task 4 (unchanged from existing, but now uses sequential index) |
| `nextPromptDelayMs` → next prompt | Task 4 |
| User interaction cancels steps 4–8 | Task 4 `cancelFullViewCycle` + `userInteractedRef` |
| Outbound: state change events | Task 5 |
| Outbound: session change events | Task 5 |
| Inbound: external cancel cycle | Task 5 |
| Inbound: render mode from host | Task 7 |
| Bidirectional bridge centralised | Tasks 5 + 6 |
| Event name constants (no typos) | Task 9 |

### Placeholder scan

None found — all steps contain concrete code.

### Type consistency

- `CachedResponseItem` — imported from `@/lib/apiTypes` in Tasks 1, 2, 3. Consistent.
- `Session` — from `@/types` in Tasks 2, 5, 6. Consistent.
- `setSessions` — from `SessionContext` in Tasks 3, 4. Verify it exists (step 1 of Task 3 includes grep).
- `playCachedResponse(sessionId, items, prompt)` — defined Task 2, used Task 3. Consistent.
- Event constants — defined Task 9, used Tasks 3 + 5. Tasks 1–8 use strings; Task 9 swaps them in.
