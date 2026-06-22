# WebSDK Context Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace `useAgentsContext` facade calls in all three WebSDK components with targeted sub-context hooks, and extract the three inline side-effect blocks in `WebSDKContent` into focused hooks.

**Architecture:** Each WebSDK component calls only the sub-context hooks it needs (`useLifecycleContext`, `useSessionContext`, `useAgentContext`, `useChatContext`, `useUIContext`). Three new hooks in `components/WebSDK/hooks/` own the agent-init, expand-trigger, and event-broadcaster side effects that are currently inline in `WebSDKContent`. The `useAgentsContext` facade in `context/app/context.tsx` is left intact — other consumers outside WebSDK still use it.

**Tech Stack:** React 19, TypeScript strict, existing sub-context hooks from `packages/genai/src/context/app/`

---

## File Map

| File | Action | Change |
|------|--------|--------|
| `components/WebSDK/hooks/useWebSdkAgentInit.ts` | **Create** | Extracts hasSetInitialAgent logic |
| `components/WebSDK/hooks/useWebSdkExpandTrigger.ts` | **Create** | Extracts expand-to-full-on-agent-reply logic |
| `components/WebSDK/hooks/useWebSdkEventBroadcaster.ts` | **Create** | Extracts thinking/error custom event dispatch |
| `components/WebSDK/WebSDKContent.tsx` | **Modify** | Remove `useAgentsContext`, use sub-contexts + 3 new hooks |
| `components/WebSDK/CustomInput.tsx` | **Modify** | Remove `useAgentsContext`, use sub-contexts |
| `components/WebSDK/WebSDKPresetPrompts.tsx` | **Modify** | Remove `useAgentsContext`, use sub-contexts |

---

## Task 1: Create `useWebSdkAgentInit`

Extracts the "set first agent on mount" side effect from `WebSDKContent` lines 91–97.

**Files:**
- Create: `packages/genai/src/components/WebSDK/hooks/useWebSdkAgentInit.ts`

- [ ] **Step 1: Create the hook**

```ts
import { useEffect, useState } from 'react';

import type { Agent } from '@/types';

interface UseWebSdkAgentInitParams {
    agents: Agent[];
    setCurrentAgent: (agentId: string) => void;
    setEnteredInChatMode: (v: boolean) => void;
}

/**
 * Selects the first available agent once on mount, then marks chat mode entered.
 * Mirrors the one-time initialisation that used to live inline in WebSDKContent.
 */
export function useWebSdkAgentInit({
    agents,
    setCurrentAgent,
    setEnteredInChatMode,
}: UseWebSdkAgentInitParams): void {
    const [hasSetInitialAgent, setHasSetInitialAgent] = useState(false);

    useEffect(() => {
        if (agents.length > 0 && !hasSetInitialAgent && agents[0]) {
            setCurrentAgent(agents[0].id);
            setHasSetInitialAgent(true);
            setEnteredInChatMode(true);
        }
    }, [agents, hasSetInitialAgent, setCurrentAgent, setEnteredInChatMode]);
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd packages/genai && pnpm tsc --noEmit 2>&1 | head -30
```

Expected: no errors for the new file.

---

## Task 2: Create `useWebSdkExpandTrigger`

Extracts the "expand to full view when agent reply completes in compact mode" effect from `WebSDKContent` lines 100–155.

**Files:**
- Create: `packages/genai/src/components/WebSDK/hooks/useWebSdkExpandTrigger.ts`

- [ ] **Step 1: Create the hook**

```ts
import { useEffect, useRef } from 'react';

import type { Session } from '@/types';

interface UseWebSdkExpandTriggerParams {
    allowAutoPrompt: boolean;
    isAutoPromptDisabled: boolean;
    currentSessionId: string | null;
    sessions: Session[];
    webSdkRenderMode: 'compact' | 'full';
    parentOctoPanelId: string | null | undefined;
    setWebSdkRenderMode: (mode: 'compact' | 'full') => void;
}

/**
 * Expands the WebSDK panel to full view exactly once per completed agent message
 * while in compact mode. Fires `genai:webSdkRequestExpand` to notify the host page.
 */
export function useWebSdkExpandTrigger({
    allowAutoPrompt,
    isAutoPromptDisabled,
    currentSessionId,
    sessions,
    webSdkRenderMode,
    parentOctoPanelId,
    setWebSdkRenderMode,
}: UseWebSdkExpandTriggerParams): void {
    const expandRequestedMessageRef = useRef<string | null>(null);

    useEffect(() => {
        if (!allowAutoPrompt || isAutoPromptDisabled) {
            return;
        }
        if (!currentSessionId) {
            expandRequestedMessageRef.current = null;
            return;
        }

        const currentSession = sessions.find(session => session.id === currentSessionId);
        if (!currentSession) {
            expandRequestedMessageRef.current = null;
            return;
        }

        const latestAgentMessage = [...(currentSession.chat || [])]
            .reverse()
            .find(
                event =>
                    event.role === 'agent' &&
                    (event.message?.content?.trim() ||
                        event.carousel_metadata ||
                        event.metadata?.toolMetadata ||
                        (event.contentSequence && event.contentSequence.length > 0))
            );

        if (!latestAgentMessage) {
            expandRequestedMessageRef.current = null;
            return;
        }

        const latestAgentMessageId = latestAgentMessage.id ?? null;

        if (webSdkRenderMode !== 'compact') {
            expandRequestedMessageRef.current = latestAgentMessageId;
            return;
        }

        if (!latestAgentMessageId || expandRequestedMessageRef.current === latestAgentMessageId) {
            return;
        }

        expandRequestedMessageRef.current = latestAgentMessageId;
        setWebSdkRenderMode('full');

        if (parentOctoPanelId) {
            window.dispatchEvent(
                new CustomEvent('genai:webSdkRequestExpand', {
                    detail: {
                        parentOctoPanelId,
                        sessionId: currentSessionId,
                    },
                })
            );
        }
    }, [currentSessionId, sessions, parentOctoPanelId, webSdkRenderMode, setWebSdkRenderMode]);
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd packages/genai && pnpm tsc --noEmit 2>&1 | head -30
```

Expected: no errors for the new file.

---

## Task 3: Create `useWebSdkEventBroadcaster`

Extracts the thinking-started and error custom event dispatches from `WebSDKContent` lines 157–197.

**Files:**
- Create: `packages/genai/src/components/WebSDK/hooks/useWebSdkEventBroadcaster.ts`

- [ ] **Step 1: Create the hook**

```ts
import { useEffect, useRef } from 'react';

import type { Session } from '@/types';

interface UseWebSdkEventBroadcasterParams {
    currentSessionId: string | null;
    sessions: Session[];
    parentOctoPanelId: string | null | undefined;
}

/**
 * Fires `genai:webSdkThinkingStarted` and `genai:webSdkError` custom events
 * at most once per session, then resets tracking refs when session changes.
 */
export function useWebSdkEventBroadcaster({
    currentSessionId,
    sessions,
    parentOctoPanelId,
}: UseWebSdkEventBroadcasterParams): void {
    const thinkingFiredForSessionRef = useRef<string | null>(null);
    const errorFiredForSessionRef = useRef<string | null>(null);

    const isCurrentSessionThinking =
        (currentSessionId ? sessions.find(s => s.id === currentSessionId) : undefined)?.thinking ?? false;

    useEffect(() => {
        if (!parentOctoPanelId || !currentSessionId) return;
        if (thinkingFiredForSessionRef.current === currentSessionId) return;

        if (isCurrentSessionThinking) {
            thinkingFiredForSessionRef.current = currentSessionId;
            window.dispatchEvent(
                new CustomEvent('genai:webSdkThinkingStarted', {
                    detail: { parentOctoPanelId },
                })
            );
        }
    }, [currentSessionId, isCurrentSessionThinking, parentOctoPanelId]);

    const currentSessionStatus = (currentSessionId ? sessions.find(s => s.id === currentSessionId) : undefined)
        ?.status;

    useEffect(() => {
        if (!parentOctoPanelId || !currentSessionId) return;
        if (errorFiredForSessionRef.current === currentSessionId) return;

        if (currentSessionStatus === 'error') {
            errorFiredForSessionRef.current = currentSessionId;
            window.dispatchEvent(
                new CustomEvent('genai:webSdkError', {
                    detail: { parentOctoPanelId },
                })
            );
        }
    }, [currentSessionId, currentSessionStatus, parentOctoPanelId]);

    useEffect(() => {
        if (!currentSessionId) {
            thinkingFiredForSessionRef.current = null;
            errorFiredForSessionRef.current = null;
        }
    }, [currentSessionId]);
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd packages/genai && pnpm tsc --noEmit 2>&1 | head -30
```

Expected: no errors for the new file.

---

## Task 4: Refactor `WebSDKContent.tsx`

Replace `useAgentsContext` with targeted sub-context hooks. Wire the three new extracted hooks.

**Files:**
- Modify: `packages/genai/src/components/WebSDK/WebSDKContent.tsx`

- [ ] **Step 1: Replace imports and context calls**

Remove:
```ts
import { useAgentsContext } from '@/context/app/context';
```

Add:
```ts
import { useAgentContext } from '@/context/app/agent/context';
import { useChatContext } from '@/context/app/chat/context';
import { useLifecycleContext } from '@/context/app/lifecycle/context';
import { useSessionContext } from '@/context/app/session/context';
import { useUIContext } from '@/context/app/ui/context';
import { useWebSdkAgentInit } from './hooks/useWebSdkAgentInit';
import { useWebSdkEventBroadcaster } from './hooks/useWebSdkEventBroadcaster';
import { useWebSdkExpandTrigger } from './hooks/useWebSdkExpandTrigger';
```

- [ ] **Step 2: Replace the useAgentsContext destructure with targeted calls**

Remove the entire `const { ... } = useAgentsContext();` block (lines 13–30) and replace with:

```ts
const { octoState, autoPromptConfig } = useLifecycleContext();
const { sessions, currentSessionId } = useSessionContext();
const { filteredAgents: agents, setCurrentAgent } = useAgentContext();
const { handleSendMessage } = useChatContext();
const {
    suggestedPrompts,
    isLoadingSuggestedPrompts,
    webSdkRenderMode,
    setWebSdkRenderMode,
    parentOctoPanelId,
    localAllowAutoPrompt: allowAutoPrompt,
    setIsSuggestionsOpen,
    handleNewChat,
} = useUIContext();
const { setEnteredInChatMode } = useSessionContext();
```

Note: `setEnteredInChatMode` comes from `SessionContext`. `filteredAgents` is the field exposed as `agents` in the facade — use `filteredAgents` directly.

- [ ] **Step 3: Remove the three inline useEffect blocks and add the three hooks**

Delete the following `useEffect` blocks entirely:
- Lines 91–97 (agent init: `hasSetInitialAgent` pattern)
- Lines 100–155 (expand trigger)
- Lines 157–197 (thinking/error broadcaster + session reset)

Also delete:
- `const [hasSetInitialAgent, setHasSetInitialAgent] = useState(false);` (line 35)
- `const thinkingFiredForSessionRef = useRef<string | null>(null);` (line 37)
- `const errorFiredForSessionRef = useRef<string | null>(null);` (line 38)
- `const expandRequestedMessageRef = useRef<string | null>(null);` (line 39)

Add these three hook calls after the `useAutoPromptCycle` call:

```ts
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

- [ ] **Step 4: Verify TypeScript compiles**

```bash
cd packages/genai && pnpm tsc --noEmit 2>&1 | head -40
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add packages/genai/src/components/WebSDK/hooks/useWebSdkAgentInit.ts \
        packages/genai/src/components/WebSDK/hooks/useWebSdkExpandTrigger.ts \
        packages/genai/src/components/WebSDK/hooks/useWebSdkEventBroadcaster.ts \
        packages/genai/src/components/WebSDK/WebSDKContent.tsx
git commit -m "refactor(genai): extract WebSDKContent side effects into focused hooks, replace useAgentsContext with sub-contexts"
```

---

## Task 5: Refactor `CustomInput.tsx`

Replace `useAgentsContext` with targeted sub-context hooks.

**Files:**
- Modify: `packages/genai/src/components/WebSDK/CustomInput.tsx`

The fields used from `useAgentsContext` in this file:
- `creatingSession` → `useChatContext`
- `currentSessionId` → `useSessionContext`
- `sessions` → `useSessionContext`
- `handleSendMessage` → `useChatContext`
- `setTextAreaRef` → `useUIContext`
- `enteredInChatMode` → `useSessionContext`
- `stopSessionResponse` → `useChatContext`
- `allowAutoPrompt` → `useUIContext` (as `localAllowAutoPrompt`)

- [ ] **Step 1: Replace import**

Remove:
```ts
import { useAgentsContext } from '@/context/app/context';
```

Add:
```ts
import { useChatContext } from '@/context/app/chat/context';
import { useSessionContext } from '@/context/app/session/context';
import { useUIContext } from '@/context/app/ui/context';
```

- [ ] **Step 2: Replace the useAgentsContext destructure**

Remove:
```ts
const {
    creatingSession,
    currentSessionId,
    sessions,
    handleSendMessage,
    setTextAreaRef,
    enteredInChatMode,
    stopSessionResponse,
    allowAutoPrompt,
} = useAgentsContext();
```

Add:
```ts
const { creatingSession, handleSendMessage, stopSessionResponse } = useChatContext();
const { currentSessionId, sessions, enteredInChatMode } = useSessionContext();
const { setTextAreaRef, localAllowAutoPrompt: allowAutoPrompt } = useUIContext();
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
cd packages/genai && pnpm tsc --noEmit 2>&1 | head -40
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add packages/genai/src/components/WebSDK/CustomInput.tsx
git commit -m "refactor(genai): replace useAgentsContext with sub-contexts in CustomInput"
```

---

## Task 6: Refactor `WebSDKPresetPrompts.tsx`

Replace `useAgentsContext` with targeted sub-context hooks.

**Files:**
- Modify: `packages/genai/src/components/WebSDK/WebSDKPresetPrompts.tsx`

Fields used from `useAgentsContext` in this file:
- `enteredInChatMode` → `useSessionContext`
- `showAllObjectives` → `useUIContext`
- `textAreaRef` → `useUIContext`
- `ipInfo` → `useSessionContext`
- `currentAgent` → `useAgentContext`
- `suggestedPrompts` → `useUIContext`
- `isLoadingSuggestedPrompts` → `useUIContext`

- [ ] **Step 1: Replace import**

Remove:
```ts
import { useAgentsContext } from '@/context/app/context';
```

Add:
```ts
import { useAgentContext } from '@/context/app/agent/context';
import { useSessionContext } from '@/context/app/session/context';
import { useUIContext } from '@/context/app/ui/context';
```

- [ ] **Step 2: Replace the useAgentsContext destructure**

Remove:
```ts
const {
    enteredInChatMode,
    showAllObjectives,
    textAreaRef,
    ipInfo,
    currentAgent,
    suggestedPrompts,
    isLoadingSuggestedPrompts,
} = useAgentsContext();
```

Add:
```ts
const { enteredInChatMode, ipInfo } = useSessionContext();
const { currentAgent } = useAgentContext();
const { showAllObjectives, textAreaRef, suggestedPrompts, isLoadingSuggestedPrompts } = useUIContext();
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
cd packages/genai && pnpm tsc --noEmit 2>&1 | head -40
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add packages/genai/src/components/WebSDK/WebSDKPresetPrompts.tsx
git commit -m "refactor(genai): replace useAgentsContext with sub-contexts in WebSDKPresetPrompts"
```

---

## Final Verification

- [ ] **Full typecheck**

```bash
cd packages/genai && pnpm tsc --noEmit 2>&1
```

Expected: zero errors.

- [ ] **Dev build smoke test**

```bash
cd packages/genai && pnpm dev
```

Open the WebSDK in `web-sdk` view mode. Confirm:
1. Compact mode shows suggested prompt + countdown
2. Sending a message expands to full view
3. Agent reply triggers `genai:webSdkRequestExpand` (visible in browser DevTools → Event Listeners or Console)
4. No console errors
