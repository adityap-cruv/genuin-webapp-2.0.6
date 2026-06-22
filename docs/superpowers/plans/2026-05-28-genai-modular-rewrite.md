# genai Package — Modular Rewrite Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rewrite the genai package internals into clean, modular, single-responsibility files while preserving 100% of the existing external API surface and runtime behaviour.

**Architecture:** Service Layer + Thin Providers. All business logic lives in pure-TS service modules (`core/`). React providers become thin adapters that instantiate services, subscribe to their state, and expose context. The `useAgentsContext()` facade stays unchanged so all ~30 consumers need zero edits. The `window.GenAISDK` public API stays unchanged.

**Tech Stack:** React 19, TypeScript strict, Vite, `pnpm typecheck` to validate each task.

---

## Non-Goals

- No changes to `packages/components`, `packages/ui`, `packages/web-sdk`, or any app.
- No new external runtime dependencies.
- No changes to the `window.GenAISDK.*` public API, `AppProviders` props, or `useAgentsContext()` return shape.
- No changes to the `index.css`, `loader.js`, `vite-env.d.ts`, or any asset files.
- No changes to analytics (`OctoAnalytics`, `RudderAnalyticsProvider`).

---

## What Changes and Why

| Current pain point | Fix |
|---|---|
| `ChatProvider` is 1130 lines — message assembly, SSE dispatch, session mutation, analytics all mixed | Split into 3 focused modules + thin provider adapter |
| `handleSSEMessage` is ~500 lines of nested `setSessions` logic | Extract to `ChatMessageAssembler` pure-TS class |
| `useSSEHandler` has duplicate stream-reading logic in `sendSSEMessage` / `connectToStream` | Extract shared `StreamReader` utility |
| `WebSDKContent` is 854 lines with 10+ `useEffect` blocks | Extract `useAutoPromptCycle` hook and `useAnimationLoader` hook |
| `index.tsx` is 567 lines of imperative DOM + module singletons | Extract `SDKLifecycle` class |
| Provider chain passes 15+ props through 5 levels | Reduce to 3 focused contexts (Lifecycle, Session+Agent+Chat merged, UI) |
| `console.log('next', next)` debug log in production `useOctoStateMachine` | Delete it |

---

## File Map

### Files created (new)

| Path | Responsibility |
|---|---|
| `src/core/ChatMessageAssembler.ts` | Pure function: given current session + SSE event → returns updated session. Zero React. |
| `src/core/StreamReader.ts` | Pure function: `readStream(response, onChunk)` — shared between send and reconnect flows |
| `src/core/CachedResponseConverter.ts` | Pure function: `CachedResponseItem[] → ChatHistoryEvent` |
| `src/core/PendingMessageQueue.ts` | Pure class: queue pending messages, drain once sessions fetched |
| `src/components/WebSDK/hooks/useAutoPromptCycle.ts` | Hook: full countdown + idle + video-play auto-prompt cycle logic |
| `src/components/WebSDK/hooks/useAnimationLoader.ts` | Hook: async Lottie load with cache |
| `src/sdk/SDKLifecycle.ts` | Class: init/destroy/reinit lifecycle extracted from `index.tsx` |

### Files rewritten (same path, new content)

| Path | What changes |
|---|---|
| `src/context/app/chat/provider.tsx` | Becomes thin adapter: instantiates hooks, exposes context. Target: <200 lines |
| `src/context/app/hooks/useSSEHandler.ts` | Uses `StreamReader` for both send and reconnect — removes ~120 duplicate lines |
| `src/context/app/hooks/useOctoStateMachine.ts` | Remove `console.log` debug line |
| `src/components/WebSDK/WebSDKContent.tsx` | Uses `useAutoPromptCycle` + `useAnimationLoader`. Target: <350 lines |
| `src/index.tsx` | Uses `SDKLifecycle` class. Target: <200 lines |

### Files untouched

Everything else: all sub-context files, `AgentsProvider`, `AppProviders`, `useAgentsContext`, all component files not listed above, all analytics, all types, `lib/api.ts`, `lib/apiTypes.ts`.

---

## Task 1 — Fix debug log in `useOctoStateMachine`

**Files:**
- Modify: `src/context/app/hooks/useOctoStateMachine.ts:39`

- [ ] **Step 1: Remove the debug log**

In `useOctoStateMachine.ts`, delete line 39:
```ts
// DELETE this line:
console.log('next', next);
```

The `transition` callback after the fix:
```ts
const transition = useCallback((next: OctoState) => {
  const current = stateRef.current;
  if (!isValidTransition(current, next)) {
    throw new InvalidStateTransitionError(current, next);
  }
  stateRef.current = next;
  setState(next);
  subscribersRef.current.forEach(cb => cb(current, next));
}, []);
```

- [ ] **Step 2: Typecheck**

```bash
cd packages/genai && pnpm typecheck
```
Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add packages/genai/src/context/app/hooks/useOctoStateMachine.ts
git commit -m "fix(genai): remove debug console.log from useOctoStateMachine"
```

---

## Task 2 — Extract `ChatMessageAssembler`

This extracts the ~500-line `handleSSEMessage` callback from `ChatProvider` into a pure TypeScript function with no React dependency. It is the hardest extraction and unblocks all subsequent ChatProvider cleanup.

**Files:**
- Create: `src/core/ChatMessageAssembler.ts`
- Modify: `src/context/app/chat/provider.tsx` (replace `handleSSEMessage` body with a call to the assembler)

- [ ] **Step 1: Create `src/core/ChatMessageAssembler.ts`**

```ts
import { v4 as uuidv4 } from 'uuid';

import type { CarousalMetadata, ChatHistoryEvent, HandleSSEMessageData, Session, ThinkingStep, ToolMetadataPayload } from '@/types';
import {
  extractToolMetadataSummary,
  humanizeIdentifier,
  normalizeCarouselMetadata,
  normalizeToolMetadata,
  normalizeWhitespace,
  parseFunctionResponse,
  truncateText,
} from '@/context/app/utils/providerUtils';

const MAX_THINKING_STEPS = 4;

export interface AssembleMessageParams {
  /** The session being updated. Must match `data.session_id` or the tempSessionId. */
  session: Session;
  /** The resolved real session ID (may differ from session.id if still a temp). */
  realSessionId: string;
  /** The SSE event data. */
  data: HandleSSEMessageData;
  /** Whether the sidebar is collapsed (drives `hasNewName` logic). */
  isSidebarCollapsed: boolean;
  /** The ID of the currently selected session (drives `hasNewMessage`). */
  currentSessionId: string | null;
}

export interface AssembleMessageResult {
  /** Updated session. May have new chat events, thinking steps, or completed state. */
  session: Session;
  /** True when `data.response_completed === true`. */
  responseCompleted: boolean;
}

/**
 * Pure function. Given a session and an SSE event, returns the updated session.
 * No React, no side effects — safe to unit test directly.
 */
export function assembleSSEMessage({
  session: s,
  realSessionId,
  data,
  isSidebarCollapsed,
  currentSessionId,
}: AssembleMessageParams): AssembleMessageResult {
  const isMatchedByTempId = s.id !== realSessionId;
  const chat = [...s.chat];
  const wasThinking = s.thinking;
  let hasStreamingUpdate = wasThinking;
  const lastEvent = chat[chat.length - 1];

  const existingSteps = s.thinkingSteps ?? [];
  let thinkingSteps: ThinkingStep[] = existingSteps;
  let stepsMutated = false;

  const ensureStepsClone = () => {
    if (!stepsMutated) {
      thinkingSteps = [...thinkingSteps];
      stepsMutated = true;
    }
  };

  const resetThinkingSteps = () => {
    thinkingSteps = [];
    stepsMutated = true;
  };

  const addThinkingStep = (step: ThinkingStep) => {
    ensureStepsClone();
    thinkingSteps = [...thinkingSteps, step];
    if (thinkingSteps.length > MAX_THINKING_STEPS) {
      thinkingSteps = thinkingSteps.slice(-MAX_THINKING_STEPS);
    }
  };

  const updateThinkingStepAtIndex = (
    index: number,
    updater: (current: ThinkingStep) => ThinkingStep,
  ) => {
    if (index < 0 || index >= thinkingSteps.length) return;
    ensureStepsClone();
    const currentStep = thinkingSteps[index];
    if (currentStep) {
      thinkingSteps[index] = updater(currentStep);
    }
  };

  const addToContentSequence = (
    contentType: 'koah_ads' | 'inventory' | 'agent_text' | 'videos',
  ) => {
    let agentEvent = chat.slice().reverse().find(e => e.role === 'agent');
    if (!agentEvent) {
      const previousEventId = lastEvent?.id || '';
      agentEvent = {
        id: `pending-agent-${realSessionId}`,
        message: { content: '' },
        role: 'agent',
        parent_id: previousEventId || null,
        feedback: null,
        created_at: new Date().toISOString(),
        contentSequence: [],
        isCompleted: false,
      };
      chat.push(agentEvent);
    }
    const existingSequence = agentEvent.contentSequence || [];
    if (!existingSequence.includes(contentType)) {
      const index = chat.findIndex(e => e.id === agentEvent!.id);
      const chatAtIndex = chat[index];
      if (index >= 0 && chatAtIndex) {
        chat[index] = { ...chatAtIndex, contentSequence: [...existingSequence, contentType] };
      }
    }
  };

  const newCycleTriggered =
    !wasThinking &&
    (data.type === 'function_call' ||
      data.type === 'function_response' ||
      data.type === 'message' ||
      data.function_name !== undefined ||
      data.function_response !== undefined ||
      data.agent_message_id !== undefined);

  if (newCycleTriggered) {
    resetThinkingSteps();
  }

  // --- metadata (session name) ---
  if (data.type === 'metadata' && typeof data.session_name === 'string' && data.session_name.trim()) {
    const stepId = `session-name-${realSessionId}`;
    const summary = truncateText(normalizeWhitespace(data.session_name), 80);
    const existingIndex = thinkingSteps.findIndex(step => step.id === stepId);
    const payload: ThinkingStep = { id: stepId, type: 'metadata', title: 'Naming conversation', detail: summary };
    if (existingIndex >= 0) {
      updateThinkingStepAtIndex(existingIndex, current => ({ ...current, ...payload }));
    } else {
      addThinkingStep(payload);
    }
  }

  // --- koah_ads ---
  if (data.type === 'koah_ads') {
    addToContentSequence('koah_ads');
  }

  // --- tool_metadata ---
  if (data.type === 'tool_metadata' && data.tool_metadata) {
    const toolMetadataPayload = normalizeToolMetadata(data.tool_metadata);
    if (toolMetadataPayload) {
      const requestId = toolMetadataPayload._meta?.request_id;
      const toolEventId = requestId ? `tool-${requestId}` : `tool-${Date.now()}`;
      const existingIndex = chat.findIndex(event => event.id === toolEventId);
      const baseEvent: ChatHistoryEvent = (existingIndex >= 0 ? chat[existingIndex] : undefined) ?? {
        id: toolEventId,
        message: { content: '' },
        role: 'agent',
        parent_id: lastEvent?.id || null,
        feedback: null,
        created_at: new Date().toISOString(),
      };
      const updatedEvent: ChatHistoryEvent = {
        ...baseEvent,
        message: { ...baseEvent.message, content: '' },
        metadata: { ...baseEvent.metadata, toolMetadata: toolMetadataPayload },
        isCompleted: true,
        is_cached: data.is_cached,
      };
      if (existingIndex >= 0) {
        chat[existingIndex] = updatedEvent;
      } else {
        chat.push(updatedEvent);
      }
      addToContentSequence('inventory');
      const summary = extractToolMetadataSummary(toolMetadataPayload);
      if (summary) {
        addThinkingStep({
          id: uuidv4(),
          type: 'tool',
          title: 'Tool results ready',
          detail: truncateText(normalizeWhitespace(summary), 160),
        });
      }
    }
  }

  // --- function_name ---
  if (data.function_name !== undefined) {
    hasStreamingUpdate = true;
    if (typeof data.function_name === 'string' && data.function_name.trim()) {
      const functionName = data.function_name.trim();
      const existingFunctionStep = thinkingSteps.find(step => step.functionName === functionName);
      if (!existingFunctionStep && data.type === 'function_call') {
        addThinkingStep({ id: uuidv4(), type: 'function_call', title: `Calling ${humanizeIdentifier(functionName)}`, functionName });
      }
    }
    if (lastEvent) {
      chat[chat.length - 1] = { ...lastEvent, message: { ...lastEvent.message, function_name: data.function_name } };
    }
  }

  // --- function_response ---
  if (data.function_response !== undefined) {
    hasStreamingUpdate = true;
    if (lastEvent) {
      let parsedResponse: unknown = data.function_response;
      if (typeof data.function_response === 'string') {
        try { parsedResponse = JSON.parse(data.function_response); } catch { parsedResponse = data.function_response; }
      }
      chat[chat.length - 1] = { ...lastEvent, message: { ...lastEvent.message, function_response: parsedResponse } };
    }
    const responseSummary = truncateText(normalizeWhitespace(parseFunctionResponse(data.function_response)), 160);
    if (responseSummary) {
      let targetIndex = -1;
      for (let i = thinkingSteps.length - 1; i >= 0; i--) {
        const step = thinkingSteps[i];
        if (step && (step.type === 'function_call' || step.type === 'function_response') && step.functionName) {
          targetIndex = i;
          break;
        }
      }
      if (targetIndex >= 0) {
        const step = thinkingSteps[targetIndex];
        const friendlyName = humanizeIdentifier(step?.functionName ?? 'Function');
        updateThinkingStepAtIndex(targetIndex, current => ({ ...current, type: 'function_response', title: `${friendlyName} responded`, detail: responseSummary }));
      } else {
        addThinkingStep({ id: uuidv4(), type: 'function_response', title: 'Function responded', detail: responseSummary });
      }
    }
  }

  // --- carousel_metadata ---
  if (data.carousel_metadata !== undefined) {
    const normalizedCarousel = normalizeCarouselMetadata(data.carousel_metadata);
    if (normalizedCarousel && lastEvent) {
      chat[chat.length - 1] = { ...lastEvent, carousel_metadata: normalizedCarousel };
      addToContentSequence('videos');
    }
  }

  // --- message chunks ---
  if (data.message !== undefined) {
    hasStreamingUpdate = true;
    if (lastEvent && !lastEvent.contentSequence?.includes('agent_text')) {
      addToContentSequence('agent_text');
    }
    if (typeof data.message === 'string' && data.message.trim()) {
      const chunk = normalizeWhitespace(data.message);
      const responseStepId = 'agent-response';
      const existingIndex = thinkingSteps.findIndex(step => step.id === responseStepId);
      if (existingIndex >= 0) {
        updateThinkingStepAtIndex(existingIndex, current => {
          const base = current.detail ? `${current.detail} ${chunk}` : chunk;
          return { ...current, title: 'Drafting response', detail: truncateText(normalizeWhitespace(base), 160) };
        });
      } else {
        addThinkingStep({ id: responseStepId, type: 'message', title: 'Drafting response', detail: truncateText(chunk, 160) });
      }
    }
    if (data.agent_message_id) {
      const existingAgentEvent = chat.find(e => e.role === 'agent' && e.id === data.agent_message_id);
      if (existingAgentEvent) {
        const index = chat.findIndex(e => e.id === data.agent_message_id);
        chat[index] = { ...existingAgentEvent, message: { ...existingAgentEvent.message, content: (existingAgentEvent.message?.content || '') + (data.message || '') }, is_cached: data.is_cached || existingAgentEvent.is_cached };
      } else {
        const lastAgentEvent = chat.slice().reverse().find(e => e.role === 'agent' && !e.message?.content?.trim());
        if (lastAgentEvent) {
          const index = chat.findIndex(e => e.id === lastAgentEvent.id);
          chat[index] = { ...lastAgentEvent, id: data.agent_message_id, message: { ...lastAgentEvent.message, content: data.message || '' }, is_cached: data.is_cached, isCompleted: false };
        } else {
          const previousEventId = lastEvent?.id || '';
          chat.push({ id: data.agent_message_id, message: { content: data.message || '' }, role: 'agent', parent_id: previousEventId || null, feedback: null, created_at: new Date().toISOString(), is_cached: data.is_cached, isCompleted: false });
        }
      }
    } else {
      const lastAgentEvent = chat.slice().reverse().find(e => e.role === 'agent');
      if (lastAgentEvent) {
        const index = chat.findIndex(e => e.id === lastAgentEvent.id);
        chat[index] = { ...lastAgentEvent, message: { ...lastAgentEvent.message, content: (lastAgentEvent.message?.content || '') + (data.message || '') }, is_cached: data.is_cached || lastAgentEvent.is_cached };
      } else {
        const previousEventId = lastEvent?.id || '';
        chat.push({ id: `agent-${Date.now()}`, message: { content: data.message || '' }, role: 'agent', parent_id: previousEventId || null, feedback: null, created_at: new Date().toISOString(), is_cached: data.is_cached, isCompleted: false });
      }
    }
  }

  // --- agent_message_id without message (placeholder event) ---
  if (data.agent_message_id !== undefined && data.message === undefined) {
    if (wasThinking) { hasStreamingUpdate = true; }
    const existingAgentEvent = chat.find(e => e.role === 'agent' && e.id === data.agent_message_id);
    if (!existingAgentEvent) {
      const lastTempAgentEvent = chat.slice().reverse().find(e => e.role === 'agent' && e.id.startsWith('agent-'));
      if (lastTempAgentEvent) {
        const index = chat.findIndex(e => e.id === lastTempAgentEvent.id);
        chat[index] = { ...lastTempAgentEvent, id: data.agent_message_id };
      } else {
        const lastAgentEvent = chat.slice().reverse().find(e => e.role === 'agent');
        if (!lastAgentEvent) {
          const lastChatEvent = chat[chat.length - 1];
          chat.push({ id: data.agent_message_id, message: { content: '' }, role: 'agent', parent_id: lastChatEvent?.id || null, feedback: null, created_at: new Date().toISOString(), isCompleted: false });
        }
      }
    }
  }

  const sessionNameUpdated =
    data.session_name !== undefined &&
    data.session_name !== null &&
    data.session_name !== s.name;

  const responseCompleted = data.response_completed === true;

  if (responseCompleted) {
    const lastChatEvent = chat[chat.length - 1];
    if (lastChatEvent && lastChatEvent.role === 'agent') {
      chat[chat.length - 1] = { ...lastChatEvent, isCompleted: true };
    }
  }

  let thinking = s.thinking;
  if (responseCompleted) {
    thinking = false;
  } else if (hasStreamingUpdate) {
    thinking = true;
  }

  return {
    session: {
      ...s,
      id: isMatchedByTempId ? realSessionId : s.id,
      chat,
      updatedAt: responseCompleted ? new Date().toISOString() : s.updatedAt,
      name: sessionNameUpdated && data.session_name ? data.session_name : s.name,
      hasNewName: sessionNameUpdated ? isSidebarCollapsed : s.hasNewName,
      thinking,
      hasNewMessage: currentSessionId !== realSessionId,
      thinkingSteps: thinking ? thinkingSteps : [],
    },
    responseCompleted,
  };
}
```

- [ ] **Step 2: Typecheck**

```bash
cd packages/genai && pnpm typecheck
```
Expected: 0 errors (file is not yet used — that's fine).

- [ ] **Step 3: Commit**

```bash
git add packages/genai/src/core/ChatMessageAssembler.ts
git commit -m "feat(genai): add ChatMessageAssembler pure-TS service"
```

---

## Task 3 — Extract `CachedResponseConverter`

Pulls `convertCachedResponseToEvents` out of `ChatProvider` into its own pure module.

**Files:**
- Create: `src/core/CachedResponseConverter.ts`

- [ ] **Step 1: Create `src/core/CachedResponseConverter.ts`**

```ts
import type { CachedResponseItem } from '@/lib/apiTypes';
import type { CarousalMetadata, ChatHistoryEvent } from '@/types';
import {
  normalizeCarouselMetadata,
  normalizeToolMetadata,
} from '@/context/app/utils/providerUtils';
import type { ToolMetadataPayload } from '@/types';

export interface ConvertCachedResponseResult {
  agentEvent: ChatHistoryEvent;
  sessionName: string | null;
}

/**
 * Converts a cached-response array (pre-computed suggested prompt reply)
 * into a single `ChatHistoryEvent` ready to insert into session chat.
 * Pure function — no React, no side effects.
 */
export function convertCachedResponseToEvents(
  cachedResponse: CachedResponseItem[],
): ConvertCachedResponseResult {
  let agentMessageContent = '';
  let carouselMetadata: CarousalMetadata | null = null;
  let toolMetadata: ToolMetadataPayload | null = null;
  let sessionName: string | null = null;

  for (const item of cachedResponse) {
    if (item.type === 'metadata' && item.session_name) {
      sessionName = item.session_name;
    } else if (item.type === 'message' && item.message) {
      agentMessageContent = item.message;
    } else if (item.type === 'carousel_metadata' && item.carousel_metadata !== undefined) {
      carouselMetadata = normalizeCarouselMetadata(item.carousel_metadata);
    } else if (item.type === 'tool_metadata' && item.tool_metadata !== undefined) {
      toolMetadata = normalizeToolMetadata(item.tool_metadata) ?? null;
    }
  }

  const contentSequence: ChatHistoryEvent['contentSequence'] = ['koah_ads'];
  if (agentMessageContent) contentSequence.push('agent_text');
  if (toolMetadata) contentSequence.push('inventory');
  if (carouselMetadata) contentSequence.push('videos');

  const agentEvent: ChatHistoryEvent = {
    id: `agent-${Date.now()}`,
    message: { content: agentMessageContent },
    role: 'agent',
    is_cached: true,
    isCompleted: true,
    carousel_metadata: carouselMetadata ?? undefined,
    metadata: toolMetadata ? { toolMetadata } : undefined,
    parent_id: '',
    feedback: null,
    created_at: new Date().toISOString(),
    contentSequence,
  };

  return { agentEvent, sessionName };
}
```

- [ ] **Step 2: Typecheck**

```bash
cd packages/genai && pnpm typecheck
```
Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add packages/genai/src/core/CachedResponseConverter.ts
git commit -m "feat(genai): add CachedResponseConverter pure-TS service"
```

---

## Task 4 — Extract `StreamReader`

`useSSEHandler` has two nearly-identical stream-reading flows: `sendSSEMessage` and `connectToStream`. Extract the shared piece.

**Files:**
- Create: `src/core/StreamReader.ts`

- [ ] **Step 1: Create `src/core/StreamReader.ts`**

```ts
/**
 * Reads a streaming HTTP response, splitting concatenated JSON objects per
 * chunk and calling `onChunk` for each parsed JSON string.
 *
 * Returns `{ isCompleted: boolean }` — true when the stream ends normally
 * or when a `response_completed: true` event is seen.
 */
export async function readStream(
  response: Response,
  onChunk: (jsonStr: string) => { isCompleted: boolean; isError: boolean },
  signal?: AbortSignal,
): Promise<{ isCompleted: boolean }> {
  const reader = response.body?.getReader();
  if (!reader) return { isCompleted: false };

  const decoder = new TextDecoder();
  let isCompleted = false;

  try {
    while (true) {
      if (signal?.aborted) break;
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const jsonStrings = splitConcatenatedJson(chunk);

      for (const jsonStr of jsonStrings) {
        if (!jsonStr.trim()) continue;
        const result = onChunk(jsonStr);
        if (result.isCompleted) {
          isCompleted = true;
          break;
        }
        if (result.isError) break;
      }
      if (isCompleted) break;
    }
  } finally {
    reader.releaseLock();
  }

  return { isCompleted };
}

/**
 * Splits a raw chunk string that may contain multiple adjacent JSON objects
 * (e.g. `{"a":1}{"b":2}`) into individual JSON strings.
 * Counts brace depth — fragile against string literals containing braces,
 * but sufficient for the genai SSE stream format.
 */
export function splitConcatenatedJson(chunk: string): string[] {
  const results: string[] = [];
  let depth = 0;
  let start = 0;

  for (let i = 0; i < chunk.length; i++) {
    if (chunk[i] === '{') {
      if (depth === 0) start = i;
      depth++;
    } else if (chunk[i] === '}') {
      depth--;
      if (depth === 0) {
        results.push(chunk.slice(start, i + 1));
      }
    }
  }

  return results;
}
```

- [ ] **Step 2: Typecheck**

```bash
cd packages/genai && pnpm typecheck
```
Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add packages/genai/src/core/StreamReader.ts
git commit -m "feat(genai): add StreamReader pure-TS utility"
```

---

## Task 5 — Wire `StreamReader` into `useSSEHandler`

Replace the two duplicate stream-reading loops in `useSSEHandler` with calls to `readStream`.

**Files:**
- Modify: `src/context/app/hooks/useSSEHandler.ts`

- [ ] **Step 1: Rewrite `useSSEHandler.ts`**

Replace the full file content with:

```ts
import { useCallback, useRef } from 'react';

import { getChatStreamUrl, startChatSession, type StartChatPayload } from '@/lib/api';
import { readStream } from '@/core/StreamReader';
import type { AgentType, HandleSSEMessageData } from '@/types';

export interface SSEMessagePayload {
  brand_id: number;
  message: string;
  agent_id: string | null;
  agent_type: AgentType;
  session_id: string | null;
  user_id: string;
  s3_keys: string[];
  video_id?: string;
  temp_session_id?: string;
  previous_context?: {
    message: string;
    agent_response: string;
    session_name: string;
  };
  integration_type?: 'embed' | 'placement';
  integration_id?: string;
  content_order?: string[];
}

interface UseSSEHandlerParams {
  onMessage: (data: HandleSSEMessageData) => void;
  onError: (sessionId: string | null | undefined, error: string | any) => void;
  onSessionCreated: (tempSessionId: string, realSessionId: string) => void;
}

interface UseSSEHandlerResult {
  sendSSEMessage: (payload: SSEMessagePayload) => Promise<void>;
  connectToStream: (sessionId: string) => Promise<{ isCompleted: boolean }>;
  cancelStream: (sessionId: string | null | undefined) => void;
}

export function useSSEHandler({
  onMessage,
  onError,
  onSessionCreated,
}: UseSSEHandlerParams): UseSSEHandlerResult {
  const abortControllersRef = useRef<Map<string, AbortController>>(new Map());
  const pendingCachedResponsesRef = useRef<Set<string>>(new Set());

  const makeChunkProcessor = (sessionId: string) => {
    let pendingSessionName: string | null = null;
    const isCachedSession = pendingCachedResponsesRef.current.has(sessionId);

    return (jsonStr: string): { isCompleted: boolean; isError: boolean } => {
      if (!jsonStr.trim()) return { isCompleted: false, isError: false };

      try {
        const parsed = JSON.parse(jsonStr) as Partial<HandleSSEMessageData> & { error?: string };

        if (parsed.error) {
          return { isCompleted: false, isError: true };
        }

        if (parsed.session_name && !parsed.response_completed) {
          pendingSessionName = parsed.session_name;
        }

        if (parsed.response_completed && pendingSessionName) {
          parsed.session_name = pendingSessionName;
          pendingSessionName = null;
        }

        if (parsed.is_cached === undefined && isCachedSession) {
          parsed.is_cached = true;
        }

        onMessage({ ...parsed, session_id: parsed.session_id ?? sessionId } as HandleSSEMessageData);

        if (parsed.response_completed) {
          pendingCachedResponsesRef.current.delete(sessionId);
          return { isCompleted: true, isError: false };
        }

        return { isCompleted: false, isError: false };
      } catch {
        return { isCompleted: false, isError: false };
      }
    };
  };

  const sendSSEMessage = useCallback(async (payload: SSEMessagePayload): Promise<void> => {
    const startPayload: StartChatPayload = {
      brand_id: payload.brand_id,
      message: payload.message,
      agent_id: payload.agent_id,
      agent_type: payload.agent_type,
      session_id: payload.session_id,
      user_id: payload.user_id,
      s3_keys: payload.s3_keys,
      video_id: payload.video_id,
      temp_session_id: payload.temp_session_id,
      previous_context: payload.previous_context,
      integration_type: payload.integration_type,
      integration_id: payload.integration_id,
      content_order: payload.content_order,
    };

    let realSessionId: string;
    let userMessageId: string;

    try {
      const startResponse = await startChatSession(startPayload);
      realSessionId = startResponse.data.session_id;
      userMessageId = startResponse.data.user_message_id;

      if (startResponse.is_cached) {
        pendingCachedResponsesRef.current.add(realSessionId);
      }

      if (payload.temp_session_id) {
        onSessionCreated(payload.temp_session_id, realSessionId);
      }
    } catch (err) {
      onError(payload.session_id ?? payload.temp_session_id, err);
      return;
    }

    const controller = new AbortController();
    abortControllersRef.current.set(realSessionId, controller);

    try {
      const streamUrl = getChatStreamUrl(realSessionId);
      const response = await fetch(streamUrl, { signal: controller.signal });

      if (!response.ok) {
        if (response.status === 404) return;
        onError(realSessionId, `Stream error: ${response.status}`);
        return;
      }

      await readStream(response, makeChunkProcessor(realSessionId), controller.signal);
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') return;
      onError(realSessionId, err);
    } finally {
      abortControllersRef.current.delete(realSessionId);
    }
  }, [onMessage, onError, onSessionCreated]);

  const connectToStream = useCallback(async (sessionId: string): Promise<{ isCompleted: boolean }> => {
    const controller = new AbortController();
    abortControllersRef.current.set(sessionId, controller);

    try {
      const streamUrl = getChatStreamUrl(sessionId);
      const response = await fetch(streamUrl, { signal: controller.signal });

      if (!response.ok) {
        if (response.status === 404) return { isCompleted: true };
        return { isCompleted: false };
      }

      return await readStream(response, makeChunkProcessor(sessionId), controller.signal);
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') return { isCompleted: false };
      return { isCompleted: false };
    } finally {
      abortControllersRef.current.delete(sessionId);
    }
  }, [onMessage]);

  const cancelStream = useCallback((sessionId: string | null | undefined) => {
    if (!sessionId) return;
    const controller = abortControllersRef.current.get(sessionId);
    if (controller) {
      controller.abort();
      abortControllersRef.current.delete(sessionId);
    }
  }, []);

  return { sendSSEMessage, connectToStream, cancelStream };
}
```

- [ ] **Step 2: Typecheck**

```bash
cd packages/genai && pnpm typecheck
```
Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add packages/genai/src/context/app/hooks/useSSEHandler.ts
git commit -m "refactor(genai): use StreamReader in useSSEHandler — remove duplicate stream loops"
```

---

## Task 6 — Slim down `ChatProvider` using the extracted services

Replace the inline `handleSSEMessage` (~500 lines) and `convertCachedResponseToEvents` (~50 lines) bodies in `ChatProvider` with calls to `assembleSSEMessage` and `convertCachedResponseToEvents` from the new core modules.

**Files:**
- Modify: `src/context/app/chat/provider.tsx`

- [ ] **Step 1: Add imports to `ChatProvider`**

At the top of `provider.tsx`, add these two imports alongside the existing ones:

```ts
import { assembleSSEMessage } from '@/core/ChatMessageAssembler';
import { convertCachedResponseToEvents } from '@/core/CachedResponseConverter';
```

- [ ] **Step 2: Replace `handleSSEMessage` callback**

Find the `handleSSEMessage` `useCallback` (line 184–683 currently). Replace its entire body with:

```ts
const handleSSEMessage = useCallback(
  (data: HandleSSEMessageData) => {
    const sessionId = data.session_id;
    if (!sessionId) return;

    const tempSessionId = sessionIdMapRef.current.get(sessionId);

    sessionContext.setSessions(prev =>
      prev.map(s => {
        if (s.id !== sessionId && s.id !== tempSessionId) return s;

        if (data.message !== undefined || data.agent_message_id !== undefined) {
          try { transitionOctoState(OctoState.STREAMING); } catch { /* may already be STREAMING */ }
        }

        const { session: updatedSession, responseCompleted } = assembleSSEMessage({
          session: s,
          realSessionId: sessionId,
          data,
          isSidebarCollapsed: isSidebarCollapsedForSSE,
          currentSessionId: sessionContext.currentSessionId,
        });

        if (responseCompleted) {
          try { transitionOctoState(OctoState.RESPONDING); } catch { /* ignore */ }

          const lastChatEvent = updatedSession.chat[updatedSession.chat.length - 1];
          if (lastChatEvent && lastChatEvent.role === 'agent') {
            const responseLength = lastChatEvent.message?.content?.length || 0;
            const createdAtTimestamp = lastChatEvent.created_at
              ? new Date(lastChatEvent.created_at).getTime()
              : undefined;
            const responseTime = createdAtTimestamp ? Date.now() - createdAtTimestamp : 0;
            const videoIds = lastChatEvent.carousel_metadata?.video_ids ?? [];
            const includesVideoCarousel = videoIds.length > 0;
            analytics.trackResponseReceived({
              response_time: responseTime,
              includes_video_carousel: includesVideoCarousel,
              video_count: includesVideoCarousel ? videoIds.length : undefined,
              response_length: responseLength,
              session_id: sessionId,
              agent_id: s.agentId,
            });

            if (lastChatEvent.message?.function_name && lastChatEvent.message?.function_response) {
              ingestDataToBCC(lastChatEvent.message.function_response, lastChatEvent.message.function_name)
                .catch(error => { console.error(error); });
            }
          }

          const sessionAgentId = s.agentId;
          if (sessionAgentId) {
            const lastUserMessage = updatedSession.chat.slice().reverse().find(e => e.role === 'user');
            const agentResponse = updatedSession.chat[updatedSession.chat.length - 1]?.message?.content || '';
            fetchSuggestedPrompts(sessionAgentId, {
              user_query: lastUserMessage?.message?.content || '',
              agent_response: agentResponse,
            });
          }

          if (tempSessionId) {
            sessionIdMapRef.current.delete(sessionId);
          }
        }

        return updatedSession;
      })
    );
  },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [sessionContext.currentSessionId, fetchSuggestedPrompts, analytics, transitionOctoState, isSidebarCollapsedForSSE],
);
```

- [ ] **Step 3: Replace `convertCachedResponseToEvents` inline function**

Delete the `function convertCachedResponseToEvents(...)` block (lines 732–774 currently). It's now imported from `@/core/CachedResponseConverter`.

Update the call site in `handleSendMessage` (the cached-response branch):

```ts
// Replace:
const { agentEvent, sessionName } = convertCachedResponseToEvents(cachedResponse, newNodeId);
// With (new signature doesn't need userMessageId):
const { agentEvent, sessionName } = convertCachedResponseToEvents(cachedResponse);
```

- [ ] **Step 4: Typecheck**

```bash
cd packages/genai && pnpm typecheck
```
Expected: 0 errors.

- [ ] **Step 5: Commit**

```bash
git add packages/genai/src/context/app/chat/provider.tsx
git commit -m "refactor(genai): slim ChatProvider — use assembleSSEMessage + convertCachedResponseToEvents"
```

---

## Task 7 — Extract `useAutoPromptCycle` from `WebSDKContent`

`WebSDKContent` has ~400 lines of timer + countdown logic. Extract to a focused hook.

**Files:**
- Create: `src/components/WebSDK/hooks/useAutoPromptCycle.ts`
- Modify: `src/components/WebSDK/WebSDKContent.tsx`

- [ ] **Step 1: Create `src/components/WebSDK/hooks/useAutoPromptCycle.ts`**

```ts
import { useCallback, useEffect, useRef, useState } from 'react';

import { useTimerManager } from '@/context/app/hooks/useTimerManager';
import type { AutoPromptConfig } from '@/context/app/auto-prompt-config';
import { OctoState } from '@/context/app/octo-state';

export interface UseAutoPromptCycleParams {
  /** Whether the render mode is currently 'full'. */
  isFull: boolean;
  /** Whether the SDK is currently busy (LOADING / STREAMING / RESPONDING). */
  isBusy: boolean;
  /** The current session ID — used to detect session changes. */
  currentSessionId: string | null;
  /** OctoState — used to detect response_completed. */
  octoState: OctoState;
  /** Whether auto-prompt is allowed at all. */
  allowAutoPrompt: boolean;
  /** Resolved auto-prompt config. */
  autoPromptConfig: AutoPromptConfig;
  /** List of suggested prompts to cycle through. */
  suggestedPrompts: string[];
  /** Called when the cycle fires — sends the next prompt. */
  onSendPrompt: (prompt: string) => void;
  /** Called when the cycle wants to expand to full view. */
  onExpandToFull: () => void;
}

export interface UseAutoPromptCycleResult {
  /** Countdown value in seconds (null = not counting). */
  countdown: number | null;
  /** Countdown for the full-view panel. */
  panelViewCountdown: number | null;
  /** Whether to show the dummy placeholder message. */
  showDummyMessage: boolean;
  /** Notify the cycle that the user interacted (cancels in-flight countdown). */
  notifyUserInteraction: () => void;
  /** Reset the cycle (e.g., on new chat). */
  reset: () => void;
}

/**
 * Encapsulates the full auto-prompt cycle logic for the web-sdk view.
 * Manages idle timeout → countdown → video-play → send-prompt sequence.
 * Extracted from WebSDKContent to keep that component under 350 lines.
 */
export function useAutoPromptCycle({
  isFull,
  isBusy,
  currentSessionId,
  octoState,
  allowAutoPrompt,
  autoPromptConfig,
  suggestedPrompts,
  onSendPrompt,
  onExpandToFull,
}: UseAutoPromptCycleParams): UseAutoPromptCycleResult {
  const timers = useTimerManager();

  const [countdown, setCountdown] = useState<number | null>(null);
  const [panelViewCountdown, setPanelViewCountdown] = useState<number | null>(null);
  const [showDummyMessage, setShowDummyMessage] = useState<boolean>(false);

  const userInteractedRef = useRef<boolean>(false);
  const nextPromptIndexRef = useRef<number>(0);
  const cycleStartedForMessageRef = useRef<string | null>(null);
  const isBusyRef = useRef<boolean>(isBusy);
  const isFullRef = useRef<boolean>(isFull);
  const currentSessionIdRef = useRef<string | null>(currentSessionId);

  // Keep refs in sync
  useEffect(() => { isBusyRef.current = isBusy; }, [isBusy]);
  useEffect(() => { isFullRef.current = isFull; }, [isFull]);
  useEffect(() => { currentSessionIdRef.current = currentSessionId; }, [currentSessionId]);

  // Reset on session change
  useEffect(() => {
    userInteractedRef.current = false;
    cycleStartedForMessageRef.current = null;
    setCountdown(null);
    setPanelViewCountdown(null);
    setShowDummyMessage(false);
    timers.clearAll();
  }, [currentSessionId]);

  const getNextPrompt = useCallback((): string | null => {
    if (!suggestedPrompts.length) return null;
    const prompt = suggestedPrompts[nextPromptIndexRef.current % suggestedPrompts.length];
    nextPromptIndexRef.current++;
    return prompt ?? null;
  }, [suggestedPrompts]);

  const startCountdown = useCallback((seconds: number, setter: (v: number | null) => void, onComplete: () => void) => {
    setter(seconds);
    let remaining = seconds;
    timers.set('countdown', setInterval(() => {
      if (userInteractedRef.current) {
        timers.clear('countdown');
        setter(null);
        return;
      }
      remaining--;
      setter(remaining);
      if (remaining <= 0) {
        timers.clear('countdown');
        setter(null);
        onComplete();
      }
    }, 1000));
  }, [timers]);

  const fireAutoPrompt = useCallback(() => {
    if (userInteractedRef.current || isBusyRef.current) return;
    const prompt = getNextPrompt();
    if (!prompt) return;

    if (!isFullRef.current) {
      onExpandToFull();
    }

    setShowDummyMessage(true);
    timers.set('dummyMessage', setTimeout(() => {
      setShowDummyMessage(false);
      onSendPrompt(prompt);
    }, 500));
  }, [getNextPrompt, onExpandToFull, onSendPrompt, timers]);

  // Trigger idle cycle when response completes in full mode
  useEffect(() => {
    if (
      !allowAutoPrompt ||
      autoPromptConfig.mode === 'disabled' ||
      isBusy ||
      octoState !== OctoState.RESPONDING
    ) return;

    const sessionKey = currentSessionId ?? 'none';
    if (cycleStartedForMessageRef.current === sessionKey) return;
    cycleStartedForMessageRef.current = sessionKey;
    userInteractedRef.current = false;

    const { idleTimeoutMs = 5000, videoPlayDurationMs = 30000, countdownSeconds = 3, mode } = autoPromptConfig;

    timers.set('idle', setTimeout(() => {
      if (userInteractedRef.current || isBusyRef.current) return;

      if (mode === 'countdown-only') {
        const setter = isFullRef.current ? setPanelViewCountdown : setCountdown;
        startCountdown(countdownSeconds, setter, fireAutoPrompt);
        return;
      }

      // full mode: expand to full, play video, then countdown
      if (!isFullRef.current) onExpandToFull();

      timers.set('videoPlay', setTimeout(() => {
        if (userInteractedRef.current || isBusyRef.current) return;
        startCountdown(countdownSeconds, setPanelViewCountdown, fireAutoPrompt);
      }, videoPlayDurationMs));
    }, idleTimeoutMs));

    return () => {
      timers.clear('idle');
      timers.clear('videoPlay');
      timers.clear('countdown');
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [octoState, isBusy, currentSessionId]);

  const notifyUserInteraction = useCallback(() => {
    userInteractedRef.current = true;
    setCountdown(null);
    setPanelViewCountdown(null);
    timers.clear('idle');
    timers.clear('videoPlay');
    timers.clear('countdown');
  }, [timers]);

  const reset = useCallback(() => {
    userInteractedRef.current = false;
    cycleStartedForMessageRef.current = null;
    nextPromptIndexRef.current = 0;
    setCountdown(null);
    setPanelViewCountdown(null);
    setShowDummyMessage(false);
    timers.clearAll();
  }, [timers]);

  return { countdown, panelViewCountdown, showDummyMessage, notifyUserInteraction, reset };
}
```

- [ ] **Step 2: Typecheck the new hook**

```bash
cd packages/genai && pnpm typecheck
```
Expected: 0 errors.

- [ ] **Step 3: Commit the hook**

```bash
git add packages/genai/src/components/WebSDK/hooks/useAutoPromptCycle.ts
git commit -m "feat(genai): add useAutoPromptCycle hook — extract auto-prompt cycle from WebSDKContent"
```

---

## Task 8 — Extract `useAnimationLoader` from `WebSDKContent`

**Files:**
- Create: `src/components/WebSDK/hooks/useAnimationLoader.ts`

- [ ] **Step 1: Create `src/components/WebSDK/hooks/useAnimationLoader.ts`**

```ts
import { useEffect, useRef, useState } from 'react';

import { getCachedRemoteLottie, loadRemoteLottie } from '@/lib/lottie/load-remote-lottie';

export interface UseAnimationLoaderResult {
  /** The loaded Lottie JSON object. Null while loading or on error. */
  lottieData: object | null;
  isLoading: boolean;
  hasError: boolean;
}

/**
 * Loads a remote Lottie animation JSON via `loadRemoteLottie`.
 * Uses `getCachedRemoteLottie` for synchronous initial state on mount
 * (avoids a flash if the animation was already loaded before).
 * Returns null while loading.
 */
export function useAnimationLoader(
  animationPath: string | null | undefined,
  imagesPath: string | null | undefined,
): UseAnimationLoaderResult {
  const [lottieData, setLottieData] = useState<object | null>(() => {
    if (!animationPath || !imagesPath) return null;
    return getCachedRemoteLottie(animationPath, imagesPath);
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);
  const mountedRef = useRef<boolean>(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    if (!animationPath || !imagesPath || lottieData) return;

    setIsLoading(true);
    setHasError(false);

    loadRemoteLottie(animationPath, imagesPath)
      .then(data => {
        if (!mountedRef.current) return;
        setLottieData(data);
      })
      .catch(() => {
        if (!mountedRef.current) return;
        setHasError(true);
      })
      .finally(() => {
        if (mountedRef.current) setIsLoading(false);
      });
  }, [animationPath, imagesPath, lottieData]);

  return { lottieData, isLoading, hasError };
}
```

- [ ] **Step 2: Typecheck**

```bash
cd packages/genai && pnpm typecheck
```
Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add packages/genai/src/components/WebSDK/hooks/useAnimationLoader.ts
git commit -m "feat(genai): add useAnimationLoader hook — extract Lottie loading from WebSDKContent"
```

---

## Task 9 — Slim `WebSDKContent` to use new hooks

Now wire the two new hooks into `WebSDKContent`, removing the inline logic they replaced.

**Files:**
- Modify: `src/components/WebSDK/WebSDKContent.tsx`

- [ ] **Step 1: Add imports**

At the top of `WebSDKContent.tsx`, add:

```ts
import { useAutoPromptCycle } from './hooks/useAutoPromptCycle';
import { useAnimationLoader } from './hooks/useAnimationLoader';
```

- [ ] **Step 2: Replace animation loading state + effect**

Find the `compactOctoLottie`, `compactLottieError` state and the `useEffect` that calls `loadRemoteLottie`. Replace with:

```ts
const { lottieData: compactOctoLottie, hasError: compactLottieError } = useAnimationLoader(
  OCTO_IDLE_ANIMATION_PATH,
  OCTO_IDLE_IMAGES_PATH,
);
```

Delete the `useState` calls for `compactOctoLottie` and `compactLottieError`, and delete the `useEffect` that called `loadRemoteLottie` directly (the one starting at the `if (!compactOctoLottie && !compactLottieError)` guard).

- [ ] **Step 3: Replace countdown state + effects**

Find the `countdown`, `panelViewCountdown`, `showDummyMessage`, `userInteractedRef`, `nextPromptIndexRef`, `cycleStartedForMessageRef` declarations and all their associated `useEffect` blocks.

Replace with:

```ts
const {
  countdown,
  panelViewCountdown,
  showDummyMessage,
  notifyUserInteraction,
  reset: resetAutoPromptCycle,
} = useAutoPromptCycle({
  isFull: webSdkRenderMode === 'full',
  isBusy,
  currentSessionId,
  octoState,
  allowAutoPrompt: localAllowAutoPrompt ?? true,
  autoPromptConfig,
  suggestedPrompts,
  onSendPrompt: (prompt) => {
    handleSendMessage({
      targetSessionId: currentSessionId,
      messageInput: prompt,
    });
  },
  onExpandToFull: () => setWebSdkRenderMode('full'),
});
```

Update the `handleNewChat` call site to also call `resetAutoPromptCycle()`.

Update user interaction handlers (input focus, message send, etc.) to call `notifyUserInteraction()` instead of setting `userInteractedRef.current = true`.

- [ ] **Step 4: Typecheck**

```bash
cd packages/genai && pnpm typecheck
```
Expected: 0 errors.

- [ ] **Step 5: Commit**

```bash
git add packages/genai/src/components/WebSDK/WebSDKContent.tsx
git commit -m "refactor(genai): slim WebSDKContent — use useAutoPromptCycle + useAnimationLoader"
```

---

## Task 10 — Extract `SDKLifecycle` from `index.tsx`

`index.tsx` has 567 lines mixing DOM manipulation, module singletons, event listeners, and view branching. Extract all non-React orchestration into a class.

**Files:**
- Create: `src/sdk/SDKLifecycle.ts`
- Modify: `src/index.tsx`

- [ ] **Step 1: Create `src/sdk/SDKLifecycle.ts`**

```ts
import type { OctoAnalytics } from '@/analytics';
import type { PendingMessage } from '@/types';

export type ViewMode = 'page' | 'floater' | 'dialog' | 'web-sdk';

export interface SDKInitConfig {
  userId: string;
  brandId: number;
  view: ViewMode;
  containerId?: string;
  isMaya?: boolean;
  [key: string]: unknown;
}

export interface SDKLifecycleCallbacks {
  mount: (container: HTMLElement, config: SDKInitConfig) => (() => void);
}

/**
 * Manages the non-React lifecycle of a genai SDK instance:
 * - DOM element creation/removal for floater and dialog views
 * - Module-level singleton state (appInstance, analytics, eventListeners)
 * - Reinit guard (prevent double-init without explicit destroy)
 * - Draggabilly dynamic load for floater dragging
 * - Event listener registration/cleanup
 */
export class SDKLifecycle {
  private appUnmount: (() => void) | null = null;
  private floaterEl: HTMLElement | null = null;
  private analytics: OctoAnalytics | null = null;
  private pendingMessages: PendingMessage[] = [];
  private persistentListener: ((e: Event) => void) | null = null;

  get isInitialized(): boolean {
    return this.appUnmount !== null;
  }

  setAnalytics(analytics: OctoAnalytics): void {
    this.analytics = analytics;
  }

  queuePendingMessage(msg: PendingMessage): void {
    this.pendingMessages.push(msg);
  }

  drainPendingMessages(): PendingMessage[] {
    const msgs = [...this.pendingMessages];
    this.pendingMessages = [];
    return msgs;
  }

  createFloater(): HTMLElement {
    const el = document.createElement('div');
    el.id = 'genai-floater';
    el.style.cssText = 'position:fixed;bottom:24px;right:24px;z-index:9999;';
    document.body.appendChild(el);
    this.floaterEl = el;
    return el;
  }

  removeFloater(): void {
    this.floaterEl?.remove();
    this.floaterEl = null;
  }

  async loadDraggabilly(el: HTMLElement): Promise<void> {
    try {
      // @ts-expect-error — dynamic CDN load, no types available
      const { default: Draggabilly } = await import('https://cdn.jsdelivr.net/npm/draggabilly@3/draggabilly.pkgd.min.js');
      new Draggabilly(el);
    } catch {
      // Graceful degradation — floater still works without drag
    }
  }

  registerPersistentListener(cb: (e: Event) => void): void {
    if (this.persistentListener) {
      window.removeEventListener('genai:openDialog', this.persistentListener);
    }
    this.persistentListener = cb;
    window.addEventListener('genai:openDialog', cb);
  }

  mount(container: HTMLElement, config: SDKInitConfig, callbacks: SDKLifecycleCallbacks): void {
    this.appUnmount = callbacks.mount(container, config);
  }

  destroy(): void {
    this.appUnmount?.();
    this.appUnmount = null;
    this.removeFloater();
    if (this.persistentListener) {
      window.removeEventListener('genai:openDialog', this.persistentListener);
      this.persistentListener = null;
    }
    this.pendingMessages = [];
    this.analytics = null;
  }
}
```

- [ ] **Step 2: Typecheck new file**

```bash
cd packages/genai && pnpm typecheck
```
Expected: 0 errors (file not yet used — ok).

- [ ] **Step 3: Commit**

```bash
git add packages/genai/src/sdk/SDKLifecycle.ts
git commit -m "feat(genai): add SDKLifecycle class — extract DOM/singleton orchestration from index.tsx"
```

---

## Task 11 — Slim `index.tsx` using `SDKLifecycle`

**Files:**
- Modify: `src/index.tsx`

- [ ] **Step 1: Import and instantiate `SDKLifecycle`**

At the top of `index.tsx`, add:

```ts
import { SDKLifecycle } from './sdk/SDKLifecycle';
```

Replace the module-level `let appInstance`, `let floater`, `let currentConfig`, `let persistentEventListener`, `let sdkAnalytics`, `let pendingMessages` variables with a single instance:

```ts
const lifecycle = new SDKLifecycle();
```

- [ ] **Step 2: Update `init` function**

Replace inline DOM creation for floater with `lifecycle.createFloater()`.
Replace `appInstance?.()` unmount calls with `lifecycle.destroy()`.
Replace `persistentEventListener` management with `lifecycle.registerPersistentListener(...)`.
Replace `pendingMessages` push/drain with `lifecycle.queuePendingMessage` / `lifecycle.drainPendingMessages`.
Replace analytics singleton with `lifecycle.setAnalytics`.

- [ ] **Step 3: Update `destroy` export**

```ts
export function destroy(): void {
  lifecycle.destroy();
}
```

- [ ] **Step 4: Typecheck**

```bash
cd packages/genai && pnpm typecheck
```
Expected: 0 errors.

- [ ] **Step 5: Commit**

```bash
git add packages/genai/src/index.tsx
git commit -m "refactor(genai): slim index.tsx — delegate lifecycle to SDKLifecycle class"
```

---

## Task 12 — Final verification

- [ ] **Step 1: Full typecheck**

```bash
cd packages/genai && pnpm typecheck
```
Expected: 0 errors.

- [ ] **Step 2: Build**

```bash
cd packages/genai && pnpm build
```
Expected: build succeeds, no TypeScript errors.

- [ ] **Step 3: Verify public API unchanged**

Check that these are still exported/accessible exactly as before:
- `window.GenAISDK.init`, `window.GenAISDK.destroy`, `window.GenAISDK.setWebSdkRenderMode`
- `useAgentsContext()` — run a quick grep to verify it's still the facade merging 5 sub-contexts
- `AppProviders` props — unchanged (no new required props)

```bash
grep -r 'useAgentsContext' packages/genai/src/context/app/context.tsx
grep -r 'GenAISDK' packages/genai/src/index.tsx
```

- [ ] **Step 4: Verify file sizes improved**

```bash
wc -l packages/genai/src/context/app/chat/provider.tsx
wc -l packages/genai/src/components/WebSDK/WebSDKContent.tsx
wc -l packages/genai/src/index.tsx
wc -l packages/genai/src/context/app/hooks/useSSEHandler.ts
```

Target line counts:
- `ChatProvider`: < 250 lines (was 1130)
- `WebSDKContent`: < 400 lines (was 854)
- `index.tsx`: < 250 lines (was 567)
- `useSSEHandler`: < 130 lines (was 414)

- [ ] **Step 5: Commit any remaining cleanup**

```bash
git add -p
git commit -m "chore(genai): final cleanup after modular rewrite"
```

---

## Summary of New File Structure

```
packages/genai/src/
├── core/                              ← NEW: pure-TS, zero React
│   ├── ChatMessageAssembler.ts        ← SSE event → session update (extracted from ChatProvider)
│   ├── CachedResponseConverter.ts     ← cached response → ChatHistoryEvent
│   └── StreamReader.ts               ← shared SSE stream reading + JSON splitting
├── sdk/                               ← NEW: DOM lifecycle
│   └── SDKLifecycle.ts               ← init/destroy/floater/events (extracted from index.tsx)
├── components/
│   └── WebSDK/
│       └── hooks/                     ← NEW
│           ├── useAutoPromptCycle.ts  ← countdown + cycle logic
│           └── useAnimationLoader.ts  ← Lottie remote load + cache
├── context/app/
│   ├── chat/provider.tsx              ← SLIMMED: ~200 lines (was 1130)
│   └── hooks/
│       └── useSSEHandler.ts          ← SLIMMED: ~130 lines (was 414)
└── index.tsx                          ← SLIMMED: ~200 lines (was 567)
```

Everything else is untouched. All external APIs unchanged.
