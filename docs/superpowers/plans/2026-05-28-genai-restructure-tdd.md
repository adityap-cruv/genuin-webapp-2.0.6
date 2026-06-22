# genai Package Restructure + TDD Baseline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restructure `packages/genai/src` from layer-based folders to feature/domain colocation, then add a meaningful test baseline (Vitest) covering the four highest-risk units: OctoState FSM, ChatMessageAssembler, useSSEHandler, and SessionProvider CRUD.

**Architecture:** Move files to `src/features/<domain>/` so each domain owns its context, hooks, utils, types, and tests together. Split `UIProvider` by extracting `VideoStylesProvider`. Add Vitest with `@testing-library/react` for hook tests; keep pure-function tests dependency-free.

**Tech Stack:** Vitest 2.x, `@testing-library/react`, `@testing-library/user-event`, `jsdom`, TypeScript strict mode. No new runtime deps.

---

## File Map

### New structure after all tasks

```
src/
├── features/
│   ├── lifecycle/
│   │   ├── context.tsx                ← moved from context/app/lifecycle/context.tsx
│   │   ├── provider.tsx               ← moved from context/app/lifecycle/provider.tsx
│   │   ├── types.ts                   ← moved from context/app/lifecycle/types.ts
│   │   └── octo-state.ts              ← moved from context/app/octo-state.ts
│   │   └── octo-state.test.ts         ← NEW
│   ├── session/
│   │   ├── context.tsx                ← moved from context/app/session/context.tsx
│   │   ├── provider.tsx               ← moved from context/app/session/provider.tsx
│   │   ├── types.ts                   ← moved from context/app/session/types.ts
│   │   ├── conversationUtils.ts       ← moved from context/app/conversationUtils.ts
│   │   ├── CachedResponseConverter.ts ← moved from core/CachedResponseConverter.ts
│   │   └── session.test.ts            ← NEW
│   ├── chat/
│   │   ├── context.tsx                ← moved from context/app/chat/context.tsx
│   │   ├── provider.tsx               ← moved from context/app/chat/provider.tsx
│   │   ├── types.ts                   ← moved from context/app/chat/types.ts
│   │   ├── ChatMessageAssembler.ts    ← moved from core/ChatMessageAssembler.ts
│   │   ├── StreamReader.ts            ← moved from core/StreamReader.ts
│   │   ├── useSSEHandler.ts           ← moved from context/app/hooks/useSSEHandler.ts
│   │   ├── ChatMessageAssembler.test.ts ← NEW
│   │   └── useSSEHandler.test.ts      ← NEW
│   ├── agent/
│   │   ├── context.tsx                ← moved from context/app/agent/context.tsx
│   │   ├── provider.tsx               ← moved from context/app/agent/provider.tsx
│   │   └── types.ts                   ← moved from context/app/agent/types.ts
│   ├── analytics/
│   │   ├── context.tsx                ← moved from context/analytics/context.tsx
│   │   ├── hooks.ts                   ← moved from context/analytics/hooks.ts
│   │   ├── provider.tsx               ← moved from context/analytics/provider.tsx
│   │   ├── octo-analytics.ts          ← moved from analytics/octo-analytics.ts
│   │   ├── octo-events.ts             ← moved from analytics/octo-events.ts
│   │   └── RudderAnalyticsProvider.tsx ← moved from services/analytics/RudderAnalyticsProvider.tsx
│   │   └── useRudderAnalytics.ts      ← moved from services/analytics/useRudderAnalytics.ts
│   ├── ui/
│   │   ├── context.tsx                ← moved from context/app/ui/context.tsx
│   │   ├── provider.tsx               ← moved from context/app/ui/provider.tsx (trimmed)
│   │   ├── types.ts                   ← moved from context/app/ui/types.ts
│   │   ├── VideoStylesProvider.tsx    ← NEW (extracted from UIProvider)
│   │   └── useVideoStyles.ts          ← moved from context/app/hooks/useVideoStyles.ts
│   └── web-sdk/
│       ├── (contents of components/WebSDK/ move here as-is)
├── context/
│   ├── AppProviders.tsx               ← imports updated, VideoStylesProvider added to tree
│   └── input/                         ← unchanged
├── components/
│   ├── Chat/                          ← unchanged (UI only)
│   ├── MessageInput/                  ← unchanged
│   ├── Sidebar/                       ← unchanged
│   ├── AgentIntro/                    ← unchanged
│   ├── AgentsDropdown/                ← unchanged
│   ├── AgentsSection/                 ← unchanged
│   ├── BCC/                           ← unchanged
│   ├── Objectives/                    ← unchanged
│   ├── Attachments/                   ← unchanged
│   └── ui/                            ← unchanged (Shadcn/Radix primitives)
├── assets/                            ← unchanged
├── lib/                               ← unchanged
├── utils/                             ← unchanged
├── styles/                            ← unchanged
├── sdk/                               ← unchanged
├── types.ts                           ← unchanged (global types)
├── App.tsx                            ← import paths updated
└── index.tsx                          ← unchanged
```

### Hooks staying in features/ui/ or features/chat/:
- `useAppBootstrap.ts` → `features/ui/useAppBootstrap.ts`
- `useLifecycleController.ts` → `features/lifecycle/useLifecycleController.ts`
- `useSuggestedPrompts.ts` → `features/chat/useSuggestedPrompts.ts`
- `useTimerManager.ts` → `features/lifecycle/useTimerManager.ts`
- `useWebSocketManager.ts` → `features/chat/useWebSocketManager.ts`
- `context/app/types.ts` → `features/ui/types.ts` (merged with ui/types.ts)
- `context/app/auto-prompt-config.ts` → `features/lifecycle/auto-prompt-config.ts`

### Files NOT moved (stable, no benefit):
- `src/types.ts` — global shared types
- `src/lib/` — API client, no domain owner
- `src/utils/` — drag only
- `src/assets/` — static assets
- `src/styles/` — floater injection
- `src/components/` — UI components (only import paths update)
- `src/sdk/` — SDK lifecycle

---

## Task 1: Add Vitest and configure test environment

**Files:**
- Modify: `packages/genai/package.json`
- Create: `packages/genai/vitest.config.ts`
- Create: `packages/genai/src/test/setup.ts`

- [ ] **Step 1: Install test dependencies**

From repo root:
```bash
pnpm --filter @genuin/genai-sdk add -D vitest@^2.0.0 @vitest/coverage-v8@^2.0.0 @testing-library/react@^16.0.0 @testing-library/user-event@^14.0.0 @testing-library/jest-dom@^6.0.0 jsdom@^25.0.0
```

- [ ] **Step 2: Add test script to package.json**

In `packages/genai/package.json`, add to `"scripts"`:
```json
"test": "vitest run",
"test:watch": "vitest",
"test:coverage": "vitest run --coverage"
```

- [ ] **Step 3: Create vitest.config.ts**

Create `packages/genai/vitest.config.ts`:
```typescript
import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src/features/**'],
    },
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

- [ ] **Step 4: Create test setup file**

Create `packages/genai/src/test/setup.ts`:
```typescript
import '@testing-library/jest-dom';
```

- [ ] **Step 5: Verify vitest resolves**

```bash
cd packages/genai && pnpm test -- --reporter=verbose 2>&1 | head -20
```
Expected: "No test files found" or similar — no crash.

- [ ] **Step 6: Commit**

```bash
git add packages/genai/package.json packages/genai/vitest.config.ts packages/genai/src/test/setup.ts
git commit -m "chore(genai): add vitest + testing-library test infrastructure"
```

---

## Task 2: Restructure — create features/ skeleton and move lifecycle domain

**Files:**
- Create: `src/features/lifecycle/` (directory)
- Move: `src/context/app/octo-state.ts` → `src/features/lifecycle/octo-state.ts`
- Move: `src/context/app/lifecycle/context.tsx` → `src/features/lifecycle/context.tsx`
- Move: `src/context/app/lifecycle/provider.tsx` → `src/features/lifecycle/provider.tsx`
- Move: `src/context/app/lifecycle/types.ts` → `src/features/lifecycle/types.ts`
- Move: `src/context/app/hooks/useLifecycleController.ts` → `src/features/lifecycle/useLifecycleController.ts`
- Move: `src/context/app/hooks/useTimerManager.ts` → `src/features/lifecycle/useTimerManager.ts`
- Move: `src/context/app/auto-prompt-config.ts` → `src/features/lifecycle/auto-prompt-config.ts`

> **Rule:** Move = copy file to new path + delete old path + update ALL `@/context/app/octo-state`, `@/context/app/lifecycle/*`, etc. imports across the entire src/ tree.

- [ ] **Step 1: Create destination directory**

```bash
mkdir -p packages/genai/src/features/lifecycle
```

- [ ] **Step 2: Copy files to new locations**

```bash
cp packages/genai/src/context/app/octo-state.ts packages/genai/src/features/lifecycle/octo-state.ts
cp packages/genai/src/context/app/lifecycle/context.tsx packages/genai/src/features/lifecycle/context.tsx
cp packages/genai/src/context/app/lifecycle/provider.tsx packages/genai/src/features/lifecycle/provider.tsx
cp packages/genai/src/context/app/lifecycle/types.ts packages/genai/src/features/lifecycle/types.ts
cp packages/genai/src/context/app/hooks/useLifecycleController.ts packages/genai/src/features/lifecycle/useLifecycleController.ts
cp packages/genai/src/context/app/hooks/useTimerManager.ts packages/genai/src/features/lifecycle/useTimerManager.ts
cp packages/genai/src/context/app/auto-prompt-config.ts packages/genai/src/features/lifecycle/auto-prompt-config.ts
```

- [ ] **Step 3: Update all internal imports in the newly moved files**

In each moved file, change any `@/context/app/lifecycle/` → `@/features/lifecycle/`, `@/context/app/octo-state` → `@/features/lifecycle/octo-state`, `@/context/app/auto-prompt-config` → `@/features/lifecycle/auto-prompt-config`.

Run to find all references that need updating:
```bash
grep -r "context/app/lifecycle\|context/app/octo-state\|context/app/auto-prompt-config" packages/genai/src --include="*.ts" --include="*.tsx" -l
```

For each file listed, update the import path to use the new `@/features/lifecycle/` prefix.

- [ ] **Step 4: Delete old files**

```bash
rm packages/genai/src/context/app/octo-state.ts
rm packages/genai/src/context/app/lifecycle/context.tsx
rm packages/genai/src/context/app/lifecycle/provider.tsx
rm packages/genai/src/context/app/lifecycle/types.ts
rm packages/genai/src/context/app/hooks/useLifecycleController.ts
rm packages/genai/src/context/app/hooks/useTimerManager.ts
rm packages/genai/src/context/app/auto-prompt-config.ts
rmdir packages/genai/src/context/app/lifecycle
```

- [ ] **Step 5: Verify typecheck passes**

```bash
cd packages/genai && pnpm typecheck 2>&1 | tail -20
```
Expected: `Found 0 errors.`

- [ ] **Step 6: Commit**

```bash
git add -A packages/genai/src/features/lifecycle packages/genai/src/context
git commit -m "refactor(genai): move lifecycle domain to features/lifecycle"
```

---

## Task 3: Restructure — move chat domain

**Files:**
- Create: `src/features/chat/`
- Move: `src/core/ChatMessageAssembler.ts` → `src/features/chat/ChatMessageAssembler.ts`
- Move: `src/core/StreamReader.ts` → `src/features/chat/StreamReader.ts`
- Move: `src/context/app/hooks/useSSEHandler.ts` → `src/features/chat/useSSEHandler.ts`
- Move: `src/context/app/hooks/useSuggestedPrompts.ts` → `src/features/chat/useSuggestedPrompts.ts`
- Move: `src/context/app/hooks/useWebSocketManager.ts` → `src/features/chat/useWebSocketManager.ts`
- Move: `src/context/app/chat/context.tsx` → `src/features/chat/context.tsx`
- Move: `src/context/app/chat/provider.tsx` → `src/features/chat/provider.tsx`
- Move: `src/context/app/chat/types.ts` → `src/features/chat/types.ts`

- [ ] **Step 1: Create directory and copy files**

```bash
mkdir -p packages/genai/src/features/chat
cp packages/genai/src/core/ChatMessageAssembler.ts packages/genai/src/features/chat/ChatMessageAssembler.ts
cp packages/genai/src/core/StreamReader.ts packages/genai/src/features/chat/StreamReader.ts
cp packages/genai/src/context/app/hooks/useSSEHandler.ts packages/genai/src/features/chat/useSSEHandler.ts
cp packages/genai/src/context/app/hooks/useSuggestedPrompts.ts packages/genai/src/features/chat/useSuggestedPrompts.ts
cp packages/genai/src/context/app/hooks/useWebSocketManager.ts packages/genai/src/features/chat/useWebSocketManager.ts
cp packages/genai/src/context/app/chat/context.tsx packages/genai/src/features/chat/context.tsx
cp packages/genai/src/context/app/chat/provider.tsx packages/genai/src/features/chat/provider.tsx
cp packages/genai/src/context/app/chat/types.ts packages/genai/src/features/chat/types.ts
```

- [ ] **Step 2: Update all internal imports in moved files**

Find all consumers:
```bash
grep -r "context/app/chat\|core/ChatMessageAssembler\|core/StreamReader\|context/app/hooks/useSSEHandler\|context/app/hooks/useSuggestedPrompts\|context/app/hooks/useWebSocketManager" packages/genai/src --include="*.ts" --include="*.tsx" -l
```
Update each to `@/features/chat/`.

Also update imports inside the moved files themselves:
- `useSSEHandler.ts`: `@/core/StreamReader` → `@/features/chat/StreamReader`
- `ChatMessageAssembler.ts`: `@/context/app/utils/providerUtils` stays (not moved yet)
- `provider.tsx` (chat): update any `@/context/app/chat/` → `@/features/chat/`

- [ ] **Step 3: Delete old files**

```bash
rm packages/genai/src/core/ChatMessageAssembler.ts
rm packages/genai/src/core/StreamReader.ts
rm packages/genai/src/context/app/hooks/useSSEHandler.ts
rm packages/genai/src/context/app/hooks/useSuggestedPrompts.ts
rm packages/genai/src/context/app/hooks/useWebSocketManager.ts
rm packages/genai/src/context/app/chat/context.tsx
rm packages/genai/src/context/app/chat/provider.tsx
rm packages/genai/src/context/app/chat/types.ts
rmdir packages/genai/src/context/app/chat
```

- [ ] **Step 4: Typecheck**

```bash
cd packages/genai && pnpm typecheck 2>&1 | tail -20
```
Expected: `Found 0 errors.`

- [ ] **Step 5: Commit**

```bash
git add -A packages/genai/src/features/chat packages/genai/src/core packages/genai/src/context
git commit -m "refactor(genai): move chat domain to features/chat"
```

---

## Task 4: Restructure — move session domain

**Files:**
- Create: `src/features/session/`
- Move: `src/context/app/session/context.tsx` → `src/features/session/context.tsx`
- Move: `src/context/app/session/provider.tsx` → `src/features/session/provider.tsx`
- Move: `src/context/app/session/types.ts` → `src/features/session/types.ts`
- Move: `src/context/app/conversationUtils.ts` → `src/features/session/conversationUtils.ts`
- Move: `src/core/CachedResponseConverter.ts` → `src/features/session/CachedResponseConverter.ts`

- [ ] **Step 1: Create directory and copy files**

```bash
mkdir -p packages/genai/src/features/session
cp packages/genai/src/context/app/session/context.tsx packages/genai/src/features/session/context.tsx
cp packages/genai/src/context/app/session/provider.tsx packages/genai/src/features/session/provider.tsx
cp packages/genai/src/context/app/session/types.ts packages/genai/src/features/session/types.ts
cp packages/genai/src/context/app/conversationUtils.ts packages/genai/src/features/session/conversationUtils.ts
cp packages/genai/src/core/CachedResponseConverter.ts packages/genai/src/features/session/CachedResponseConverter.ts
```

- [ ] **Step 2: Update all imports**

Find consumers:
```bash
grep -r "context/app/session\|context/app/conversationUtils\|core/CachedResponseConverter" packages/genai/src --include="*.ts" --include="*.tsx" -l
```
Update each to `@/features/session/`.

- [ ] **Step 3: Delete old files**

```bash
rm packages/genai/src/context/app/session/context.tsx
rm packages/genai/src/context/app/session/provider.tsx
rm packages/genai/src/context/app/session/types.ts
rm packages/genai/src/context/app/conversationUtils.ts
rm packages/genai/src/core/CachedResponseConverter.ts
rmdir packages/genai/src/context/app/session
```

- [ ] **Step 4: Typecheck**

```bash
cd packages/genai && pnpm typecheck 2>&1 | tail -20
```
Expected: `Found 0 errors.`

- [ ] **Step 5: Commit**

```bash
git add -A packages/genai/src/features/session packages/genai/src/context packages/genai/src/core
git commit -m "refactor(genai): move session domain to features/session"
```

---

## Task 5: Restructure — move agent + analytics + remaining hooks

**Files:**
- Create: `src/features/agent/`, `src/features/analytics/`
- Move: `src/context/app/agent/*` → `src/features/agent/`
- Move: `src/context/analytics/*` → `src/features/analytics/`
- Move: `src/analytics/octo-analytics.ts` → `src/features/analytics/octo-analytics.ts`
- Move: `src/analytics/octo-events.ts` → `src/features/analytics/octo-events.ts`
- Move: `src/services/analytics/RudderAnalyticsProvider.tsx` → `src/features/analytics/RudderAnalyticsProvider.tsx`
- Move: `src/services/analytics/useRudderAnalytics.ts` → `src/features/analytics/useRudderAnalytics.ts`
- Move: `src/context/app/hooks/useAppBootstrap.ts` → `src/features/ui/useAppBootstrap.ts`
- Move: `src/context/app/utils/providerUtils.ts` → `src/features/chat/providerUtils.ts`
- Move: `src/context/app/types.ts` → `src/features/ui/types.ts` (merge with existing ui/types.ts if content differs)

- [ ] **Step 1: Create directories**

```bash
mkdir -p packages/genai/src/features/agent
mkdir -p packages/genai/src/features/analytics
mkdir -p packages/genai/src/features/ui
```

- [ ] **Step 2: Copy agent domain**

```bash
cp packages/genai/src/context/app/agent/context.tsx packages/genai/src/features/agent/context.tsx
cp packages/genai/src/context/app/agent/provider.tsx packages/genai/src/features/agent/provider.tsx
cp packages/genai/src/context/app/agent/types.ts packages/genai/src/features/agent/types.ts
```

- [ ] **Step 3: Copy analytics domain**

```bash
cp packages/genai/src/context/analytics/context.tsx packages/genai/src/features/analytics/context.tsx
cp packages/genai/src/context/analytics/hooks.ts packages/genai/src/features/analytics/hooks.ts
cp packages/genai/src/context/analytics/provider.tsx packages/genai/src/features/analytics/provider.tsx
cp packages/genai/src/analytics/octo-analytics.ts packages/genai/src/features/analytics/octo-analytics.ts
cp packages/genai/src/analytics/octo-events.ts packages/genai/src/features/analytics/octo-events.ts
cp packages/genai/src/services/analytics/RudderAnalyticsProvider.tsx packages/genai/src/features/analytics/RudderAnalyticsProvider.tsx
cp packages/genai/src/services/analytics/useRudderAnalytics.ts packages/genai/src/features/analytics/useRudderAnalytics.ts
```

- [ ] **Step 4: Copy remaining files**

```bash
cp packages/genai/src/context/app/hooks/useAppBootstrap.ts packages/genai/src/features/ui/useAppBootstrap.ts
cp packages/genai/src/context/app/utils/providerUtils.ts packages/genai/src/features/chat/providerUtils.ts
cp packages/genai/src/context/app/types.ts packages/genai/src/features/ui/types.ts
```

- [ ] **Step 5: Update all imports (find all affected files)**

```bash
grep -r "context/app/agent\|context/analytics\|analytics/octo-\|services/analytics\|context/app/hooks/useAppBootstrap\|context/app/utils/providerUtils\|context/app/types" packages/genai/src --include="*.ts" --include="*.tsx" -l
```
Update each to the appropriate `@/features/<domain>/` path.

Key remapping:
- `@/context/app/agent/` → `@/features/agent/`
- `@/context/analytics/` → `@/features/analytics/`
- `@/analytics/octo-analytics` → `@/features/analytics/octo-analytics`
- `@/analytics/octo-events` → `@/features/analytics/octo-events`
- `@/services/analytics/` → `@/features/analytics/`
- `@/context/app/hooks/useAppBootstrap` → `@/features/ui/useAppBootstrap`
- `@/context/app/utils/providerUtils` → `@/features/chat/providerUtils`
- `@/context/app/types` → `@/features/ui/types`

Also update `ChatMessageAssembler.ts` which imports from `@/context/app/utils/providerUtils` — change to `@/features/chat/providerUtils`.

- [ ] **Step 6: Delete old files and dirs**

```bash
rm packages/genai/src/context/app/agent/context.tsx packages/genai/src/context/app/agent/provider.tsx packages/genai/src/context/app/agent/types.ts
rm packages/genai/src/context/analytics/context.tsx packages/genai/src/context/analytics/hooks.ts packages/genai/src/context/analytics/provider.tsx packages/genai/src/context/analytics/index.ts
rm packages/genai/src/analytics/octo-analytics.ts packages/genai/src/analytics/octo-events.ts packages/genai/src/analytics/index.ts
rm packages/genai/src/services/analytics/RudderAnalyticsProvider.tsx packages/genai/src/services/analytics/useRudderAnalytics.ts
rm packages/genai/src/context/app/hooks/useAppBootstrap.ts
rm packages/genai/src/context/app/utils/providerUtils.ts
rm packages/genai/src/context/app/types.ts
rmdir packages/genai/src/context/app/agent
rmdir packages/genai/src/context/analytics
rmdir packages/genai/src/analytics
rmdir packages/genai/src/services/analytics
rmdir packages/genai/src/services
rmdir packages/genai/src/context/app/hooks
rmdir packages/genai/src/context/app/utils
```

- [ ] **Step 7: Typecheck**

```bash
cd packages/genai && pnpm typecheck 2>&1 | tail -20
```
Expected: `Found 0 errors.`

- [ ] **Step 8: Commit**

```bash
git add -A packages/genai/src/features packages/genai/src/context packages/genai/src/analytics packages/genai/src/services
git commit -m "refactor(genai): move agent, analytics, and shared hooks to features/"
```

---

## Task 6: Restructure — move UI domain + VideoStylesProvider split + web-sdk domain

**Files:**
- Move: `src/context/app/ui/context.tsx` → `src/features/ui/context.tsx`
- Move: `src/context/app/ui/provider.tsx` → `src/features/ui/provider.tsx`
- Move: `src/context/app/ui/types.ts` → merge into `src/features/ui/types.ts`
- Move: `src/context/app/hooks/useVideoStyles.ts` → `src/features/ui/useVideoStyles.ts`
- Create: `src/features/ui/VideoStylesProvider.tsx`
- Create: `src/features/web-sdk/` (move contents of `components/WebSDK/`)
- Modify: `src/context/AppProviders.tsx`

- [ ] **Step 1: Copy UI domain files**

```bash
cp packages/genai/src/context/app/ui/context.tsx packages/genai/src/features/ui/context.tsx
cp packages/genai/src/context/app/ui/provider.tsx packages/genai/src/features/ui/provider.tsx
# Append unique content from ui/types.ts into features/ui/types.ts if not already there
cat packages/genai/src/context/app/ui/types.ts >> packages/genai/src/features/ui/types.ts
cp packages/genai/src/context/app/hooks/useVideoStyles.ts packages/genai/src/features/ui/useVideoStyles.ts
```

- [ ] **Step 2: Create VideoStylesProvider**

Create `packages/genai/src/features/ui/VideoStylesProvider.tsx`:
```typescript
import { createContext, type ReactNode, useContext } from 'react';

import { useVideoStyles } from './useVideoStyles';
import type { VideoStyle } from './types';

interface VideoStylesContextValue {
  videoStyles: VideoStyle[];
  toggleStyleSelection: (styleIndex: number) => void;
  toggleOptionSelection: (styleIndex: number, optionIndex: number) => void;
  resetVideoStyles: () => void;
  buildVideoGenerationMetadata: (userEmail?: string, userUUID?: string) => Record<string, unknown>;
}

const VideoStylesContext = createContext<VideoStylesContextValue | null>(null);

export function VideoStylesProvider({
  brandId,
  children,
}: {
  brandId?: number;
  children: ReactNode;
}) {
  const value = useVideoStyles(brandId);
  return (
    <VideoStylesContext.Provider value={value}>
      {children}
    </VideoStylesContext.Provider>
  );
}

/** @throws if used outside VideoStylesProvider */
export function useVideoStylesContext(): VideoStylesContextValue {
  const ctx = useContext(VideoStylesContext);
  if (!ctx) throw new Error('useVideoStylesContext must be used inside VideoStylesProvider');
  return ctx;
}
```

- [ ] **Step 3: Remove videoStyles from UIProvider**

In `packages/genai/src/features/ui/provider.tsx`, remove:
- The `useVideoStyles` import
- The `useVideoStyles(...)` call
- All four video-styles values from the context value object (`videoStyles`, `toggleStyleSelection`, `toggleOptionSelection`, `resetVideoStyles`)

Replace those four values in the context value with calls to `useVideoStylesContext()`:
```typescript
// At top of UIProvider function body, add:
const { videoStyles, toggleStyleSelection, toggleOptionSelection, resetVideoStyles } = useVideoStylesContext();
```

- [ ] **Step 4: Update AppProviders.tsx to add VideoStylesProvider**

In `packages/genai/src/context/AppProviders.tsx`, wrap `UIProvider` with `VideoStylesProvider`:
```typescript
// Import at top:
import { VideoStylesProvider } from '@/features/ui/VideoStylesProvider';

// In the tree (view !== 'web-sdk' gets brandId, web-sdk gets undefined):
<VideoStylesProvider brandId={view !== 'web-sdk' ? brandId : undefined}>
  <UIProvider ...>
    <InputProvider>{children}</InputProvider>
  </UIProvider>
</VideoStylesProvider>
```
Remove `videoId` from the `AnalyticsProvider` section only if it was there purely for video styles (it's for analytics — leave it).

- [ ] **Step 5: Move web-sdk feature**

```bash
mkdir -p packages/genai/src/features/web-sdk
cp -r packages/genai/src/components/WebSDK/. packages/genai/src/features/web-sdk/
```

Find all imports of `@/components/WebSDK/`:
```bash
grep -r "components/WebSDK" packages/genai/src --include="*.ts" --include="*.tsx" -l
```
Update each to `@/features/web-sdk/`.

Delete old:
```bash
rm -r packages/genai/src/components/WebSDK
```

- [ ] **Step 6: Delete old UI files**

```bash
rm packages/genai/src/context/app/ui/context.tsx packages/genai/src/context/app/ui/provider.tsx packages/genai/src/context/app/ui/types.ts
rm packages/genai/src/context/app/hooks/useVideoStyles.ts
rmdir packages/genai/src/context/app/ui
# If context/app/hooks is now empty:
rmdir packages/genai/src/context/app/hooks 2>/dev/null || true
# If context/app is now empty:
rmdir packages/genai/src/context/app 2>/dev/null || true
```

- [ ] **Step 7: Update all remaining imports across the codebase**

Find any remaining old paths:
```bash
grep -r "context/app\|context/analytics\|services/analytics\|analytics/octo" packages/genai/src --include="*.ts" --include="*.tsx"
```
Fix any remaining stragglers.

- [ ] **Step 8: Final typecheck**

```bash
cd packages/genai && pnpm typecheck 2>&1 | tail -30
```
Expected: `Found 0 errors.`

- [ ] **Step 9: Commit**

```bash
git add -A packages/genai/src/
git commit -m "refactor(genai): move UI domain, split VideoStylesProvider, move web-sdk feature"
```

---

## Task 7: OctoState FSM tests

**Files:**
- Create: `src/features/lifecycle/octo-state.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `packages/genai/src/features/lifecycle/octo-state.test.ts`:
```typescript
import { describe, expect, it } from 'vitest';

import {
  InvalidStateTransitionError,
  isValidTransition,
  OCTO_TRANSITIONS,
  OctoState,
} from './octo-state';

describe('OctoState transitions', () => {
  describe('isValidTransition', () => {
    it('allows IDLE → INITIALIZING', () => {
      expect(isValidTransition(OctoState.IDLE, OctoState.INITIALIZING)).toBe(true);
    });

    it('allows INITIALIZING → READY', () => {
      expect(isValidTransition(OctoState.INITIALIZING, OctoState.READY)).toBe(true);
    });

    it('allows INITIALIZING → ERROR', () => {
      expect(isValidTransition(OctoState.INITIALIZING, OctoState.ERROR)).toBe(true);
    });

    it('allows full happy path: READY → CREATING_SESSION → LOADING → STREAMING → RESPONDING → READY', () => {
      const path = [
        [OctoState.READY, OctoState.CREATING_SESSION],
        [OctoState.CREATING_SESSION, OctoState.LOADING],
        [OctoState.LOADING, OctoState.STREAMING],
        [OctoState.STREAMING, OctoState.RESPONDING],
        [OctoState.RESPONDING, OctoState.READY],
      ] as const;
      for (const [from, to] of path) {
        expect(isValidTransition(from, to)).toBe(true);
      }
    });

    it('allows STREAMING → CANCELLING', () => {
      expect(isValidTransition(OctoState.STREAMING, OctoState.CANCELLING)).toBe(true);
    });

    it('allows CANCELLING → READY', () => {
      expect(isValidTransition(OctoState.CANCELLING, OctoState.READY)).toBe(true);
    });

    it('rejects IDLE → READY (skip INITIALIZING)', () => {
      expect(isValidTransition(OctoState.IDLE, OctoState.READY)).toBe(false);
    });

    it('rejects STREAMING → IDLE', () => {
      expect(isValidTransition(OctoState.STREAMING, OctoState.IDLE)).toBe(false);
    });

    it('rejects READY → STREAMING (skip CREATING_SESSION)', () => {
      expect(isValidTransition(OctoState.READY, OctoState.STREAMING)).toBe(false);
    });

    it('rejects DESTROYED → anything', () => {
      const allStates = Object.values(OctoState);
      for (const to of allStates) {
        expect(isValidTransition(OctoState.DESTROYED, to)).toBe(false);
      }
    });

    it('DESTROYED has empty transition list in OCTO_TRANSITIONS', () => {
      expect(OCTO_TRANSITIONS[OctoState.DESTROYED]).toHaveLength(0);
    });

    it('allows ERROR → READY (recovery)', () => {
      expect(isValidTransition(OctoState.ERROR, OctoState.READY)).toBe(true);
    });

    it('allows ERROR → DESTROYED', () => {
      expect(isValidTransition(OctoState.ERROR, OctoState.DESTROYED)).toBe(true);
    });
  });

  describe('InvalidStateTransitionError', () => {
    it('has correct message format', () => {
      const err = new InvalidStateTransitionError(OctoState.IDLE, OctoState.STREAMING);
      expect(err.message).toBe('Invalid OctoState transition: IDLE → STREAMING');
    });

    it('has correct name', () => {
      const err = new InvalidStateTransitionError(OctoState.IDLE, OctoState.STREAMING);
      expect(err.name).toBe('InvalidStateTransitionError');
    });

    it('is instanceof Error', () => {
      const err = new InvalidStateTransitionError(OctoState.IDLE, OctoState.STREAMING);
      expect(err).toBeInstanceOf(Error);
    });
  });
});
```

- [ ] **Step 2: Run tests — expect all to pass (pure function, no mocks needed)**

```bash
cd packages/genai && pnpm test -- src/features/lifecycle/octo-state.test.ts --reporter=verbose
```
Expected: 15 tests pass.

- [ ] **Step 3: Commit**

```bash
git add packages/genai/src/features/lifecycle/octo-state.test.ts
git commit -m "test(genai): OctoState FSM transition coverage"
```

---

## Task 8: ChatMessageAssembler tests

**Files:**
- Create: `src/features/chat/ChatMessageAssembler.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `packages/genai/src/features/chat/ChatMessageAssembler.test.ts`:
```typescript
import { describe, expect, it } from 'vitest';

import type { Session } from '@/types';
import { assembleSSEMessage } from './ChatMessageAssembler';

/** Minimal valid Session fixture */
function makeSession(overrides: Partial<Session> = {}): Session {
  return {
    id: 'session-1',
    name: 'Test session',
    chat: [],
    agentId: 'agent-1',
    thinking: false,
    status: 'idle',
    updatedAt: '2024-01-01T00:00:00.000Z',
    hasNewName: false,
    hasNewMessage: false,
    thinkingSteps: [],
    ...overrides,
  };
}

describe('assembleSSEMessage', () => {
  describe('message chunks', () => {
    it('appends a new agent event when chat is empty', () => {
      const session = makeSession();
      const { session: updated } = assembleSSEMessage({
        session,
        realSessionId: 'session-1',
        data: { session_id: 'session-1', message: 'Hello', agent_message_id: 'msg-1' },
        isSidebarCollapsed: false,
        currentSessionId: null,
      });

      expect(updated.chat).toHaveLength(1);
      expect(updated.chat[0]?.role).toBe('agent');
      expect(updated.chat[0]?.message.content).toBe('Hello');
    });

    it('accumulates message chunks on the same agent_message_id', () => {
      const session = makeSession({
        chat: [
          {
            id: 'msg-1',
            message: { content: 'Hello' },
            role: 'agent',
            parent_id: null,
            feedback: null,
            created_at: '2024-01-01T00:00:00.000Z',
            isCompleted: false,
          },
        ],
      });
      const { session: updated } = assembleSSEMessage({
        session,
        realSessionId: 'session-1',
        data: { session_id: 'session-1', message: ' world', agent_message_id: 'msg-1' },
        isSidebarCollapsed: false,
        currentSessionId: null,
      });

      expect(updated.chat[0]?.message.content).toBe('Hello world');
    });

    it('sets thinking=true while streaming', () => {
      const session = makeSession();
      const { session: updated } = assembleSSEMessage({
        session,
        realSessionId: 'session-1',
        data: { session_id: 'session-1', message: 'Thinking...', agent_message_id: 'msg-1' },
        isSidebarCollapsed: false,
        currentSessionId: null,
      });

      expect(updated.thinking).toBe(true);
    });
  });

  describe('response_completed', () => {
    it('sets thinking=false on response_completed=true', () => {
      const session = makeSession({ thinking: true });
      const { session: updated, responseCompleted } = assembleSSEMessage({
        session,
        realSessionId: 'session-1',
        data: { session_id: 'session-1', response_completed: true },
        isSidebarCollapsed: false,
        currentSessionId: null,
      });

      expect(responseCompleted).toBe(true);
      expect(updated.thinking).toBe(false);
    });

    it('marks last agent event isCompleted=true', () => {
      const session = makeSession({
        thinking: true,
        chat: [
          {
            id: 'msg-1',
            message: { content: 'Done' },
            role: 'agent',
            parent_id: null,
            feedback: null,
            created_at: '2024-01-01T00:00:00.000Z',
            isCompleted: false,
          },
        ],
      });
      const { session: updated } = assembleSSEMessage({
        session,
        realSessionId: 'session-1',
        data: { session_id: 'session-1', response_completed: true },
        isSidebarCollapsed: false,
        currentSessionId: null,
      });

      expect(updated.chat[0]?.isCompleted).toBe(true);
    });

    it('clears thinkingSteps on response_completed', () => {
      const session = makeSession({
        thinking: true,
        thinkingSteps: [{ id: 'step-1', type: 'message', title: 'Drafting', detail: 'hi' }],
      });
      const { session: updated } = assembleSSEMessage({
        session,
        realSessionId: 'session-1',
        data: { session_id: 'session-1', response_completed: true },
        isSidebarCollapsed: false,
        currentSessionId: null,
      });

      expect(updated.thinkingSteps).toHaveLength(0);
    });
  });

  describe('session name update', () => {
    it('updates session name when session_name differs', () => {
      const session = makeSession({ name: 'Old name' });
      const { session: updated } = assembleSSEMessage({
        session,
        realSessionId: 'session-1',
        data: { session_id: 'session-1', session_name: 'New name', type: 'metadata' },
        isSidebarCollapsed: false,
        currentSessionId: null,
      });

      expect(updated.name).toBe('New name');
    });

    it('does not update name when session_name is unchanged', () => {
      const session = makeSession({ name: 'Same name' });
      const { session: updated } = assembleSSEMessage({
        session,
        realSessionId: 'session-1',
        data: { session_id: 'session-1', session_name: 'Same name', type: 'metadata' },
        isSidebarCollapsed: false,
        currentSessionId: null,
      });

      expect(updated.hasNewName).toBe(false);
    });
  });

  describe('temp session ID reconciliation', () => {
    it('replaces temp id with real id when isMatchedByTempId', () => {
      const session = makeSession({ id: 'temp-abc' });
      const { session: updated } = assembleSSEMessage({
        session,
        realSessionId: 'real-xyz',
        data: { session_id: 'real-xyz', message: 'hi', agent_message_id: 'msg-1' },
        isSidebarCollapsed: false,
        currentSessionId: null,
      });

      expect(updated.id).toBe('real-xyz');
    });
  });

  describe('thinking steps', () => {
    it('adds a function_call thinking step', () => {
      const session = makeSession();
      const { session: updated } = assembleSSEMessage({
        session,
        realSessionId: 'session-1',
        data: {
          session_id: 'session-1',
          function_name: 'search_web',
          type: 'function_call',
        },
        isSidebarCollapsed: false,
        currentSessionId: null,
      });

      expect(updated.thinkingSteps.some(s => s.type === 'function_call')).toBe(true);
    });

    it('caps thinkingSteps at MAX_THINKING_STEPS (4)', () => {
      const session = makeSession({ thinking: true, thinkingSteps: [] });
      let current = session;
      for (let i = 0; i < 6; i++) {
        const result = assembleSSEMessage({
          session: current,
          realSessionId: 'session-1',
          data: {
            session_id: 'session-1',
            function_name: `fn_${i}`,
            type: 'function_call',
          },
          isSidebarCollapsed: false,
          currentSessionId: null,
        });
        current = result.session;
      }

      expect(current.thinkingSteps.length).toBeLessThanOrEqual(4);
    });
  });
});
```

- [ ] **Step 2: Run tests — expect all to pass**

```bash
cd packages/genai && pnpm test -- src/features/chat/ChatMessageAssembler.test.ts --reporter=verbose
```
Expected: 10 tests pass. If any fail, read the error and fix the test's fixture shape (not the assembler).

- [ ] **Step 3: Commit**

```bash
git add packages/genai/src/features/chat/ChatMessageAssembler.test.ts
git commit -m "test(genai): ChatMessageAssembler SSE assembly coverage"
```

---

## Task 9: useSSEHandler tests

**Files:**
- Create: `src/features/chat/useSSEHandler.test.ts`

- [ ] **Step 1: Write the tests**

Create `packages/genai/src/features/chat/useSSEHandler.test.ts`:
```typescript
import { renderHook, act } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi, type Mock } from 'vitest';

import { useSSEHandler } from './useSSEHandler';

// We mock the api module so no real HTTP calls go out.
vi.mock('@/lib/api', () => ({
  getChatStreamUrl: (id: string) => `/stream/${id}`,
  startChatSession: vi.fn(),
}));

// We mock StreamReader so we can control when it resolves.
vi.mock('./StreamReader', () => ({
  readStream: vi.fn(),
}));

import { startChatSession } from '@/lib/api';
import { readStream } from './StreamReader';

const mockStartChatSession = startChatSession as Mock;
const mockReadStream = readStream as Mock;

describe('useSSEHandler', () => {
  const onMessage = vi.fn();
  const onError = vi.fn();
  const onSessionCreated = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Default: fetch returns ok response
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      body: new ReadableStream(),
    });

    // Default: readStream resolves as completed
    mockReadStream.mockResolvedValue({ isCompleted: true });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('sendSSEMessage', () => {
    it('calls startChatSession with the correct payload', async () => {
      mockStartChatSession.mockResolvedValue({
        data: { session_id: 'real-1', user_message_id: 'um-1' },
        message: '',
      });

      const { result } = renderHook(() =>
        useSSEHandler({ onMessage, onError, onSessionCreated })
      );

      await act(async () => {
        await result.current.sendSSEMessage({
          brand_id: 42,
          message: 'Hello',
          agent_id: 'agent-1',
          agent_type: 'default',
          session_id: null,
          user_id: 'user-1',
          s3_keys: [],
          temp_session_id: 'temp-1',
        });
      });

      expect(mockStartChatSession).toHaveBeenCalledWith(
        expect.objectContaining({ brand_id: 42, message: 'Hello', agent_id: 'agent-1' })
      );
    });

    it('calls onSessionCreated when temp_session_id is provided and resolves', async () => {
      mockStartChatSession.mockResolvedValue({
        data: { session_id: 'real-1', user_message_id: 'um-1' },
        message: '',
      });

      const { result } = renderHook(() =>
        useSSEHandler({ onMessage, onError, onSessionCreated })
      );

      await act(async () => {
        await result.current.sendSSEMessage({
          brand_id: 1,
          message: 'hi',
          agent_id: 'a',
          agent_type: 'default',
          session_id: null,
          user_id: 'u',
          s3_keys: [],
          temp_session_id: 'temp-1',
        });
      });

      expect(onSessionCreated).toHaveBeenCalledWith('temp-1', 'real-1');
    });

    it('calls onError when startChatSession throws a non-abort error', async () => {
      mockStartChatSession.mockRejectedValue(new Error('Network failure'));

      const { result } = renderHook(() =>
        useSSEHandler({ onMessage, onError, onSessionCreated })
      );

      await act(async () => {
        await result.current.sendSSEMessage({
          brand_id: 1,
          message: 'hi',
          agent_id: 'a',
          agent_type: 'default',
          session_id: 'session-1',
          user_id: 'u',
          s3_keys: [],
        });
      });

      expect(onError).toHaveBeenCalledWith('session-1', 'Network failure');
    });
  });

  describe('cancelStream', () => {
    it('aborts in-flight request for the given sessionId', async () => {
      let capturedSignal: AbortSignal | undefined;
      global.fetch = vi.fn().mockImplementation((_url: string, opts: RequestInit) => {
        capturedSignal = opts.signal as AbortSignal;
        // Never resolve — simulates long-running stream
        return new Promise(() => {});
      });

      mockStartChatSession.mockResolvedValue({
        data: { session_id: 'session-1', user_message_id: 'um-1' },
        message: '',
      });

      const { result } = renderHook(() =>
        useSSEHandler({ onMessage, onError, onSessionCreated })
      );

      // Start a message (don't await — it hangs intentionally)
      act(() => {
        void result.current.sendSSEMessage({
          brand_id: 1,
          message: 'hi',
          agent_id: 'a',
          agent_type: 'default',
          session_id: 'session-1',
          user_id: 'u',
          s3_keys: [],
        });
      });

      // Wait for startChatSession to be called before cancelling
      await vi.waitFor(() => expect(mockStartChatSession).toHaveBeenCalled());

      act(() => {
        result.current.cancelStream('session-1');
      });

      expect(capturedSignal?.aborted).toBe(true);
    });
  });

  describe('connectToStream', () => {
    it('returns isCompleted=true when readStream resolves completed', async () => {
      mockReadStream.mockResolvedValue({ isCompleted: true });

      const { result } = renderHook(() =>
        useSSEHandler({ onMessage, onError, onSessionCreated })
      );

      let outcome: { isCompleted: boolean } | undefined;
      await act(async () => {
        outcome = await result.current.connectToStream('session-1');
      });

      expect(outcome?.isCompleted).toBe(true);
    });

    it('returns isCompleted=true when fetch returns non-ok status', async () => {
      global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 404 });

      const { result } = renderHook(() =>
        useSSEHandler({ onMessage, onError, onSessionCreated })
      );

      let outcome: { isCompleted: boolean } | undefined;
      await act(async () => {
        outcome = await result.current.connectToStream('session-1');
      });

      expect(outcome?.isCompleted).toBe(true);
    });
  });
});
```

- [ ] **Step 2: Run tests**

```bash
cd packages/genai && pnpm test -- src/features/chat/useSSEHandler.test.ts --reporter=verbose
```
Expected: 6 tests pass. If a test fails due to mock path mismatch (`@/lib/api` vs relative), check the `vi.mock` path matches how `useSSEHandler.ts` imports it.

- [ ] **Step 3: Commit**

```bash
git add packages/genai/src/features/chat/useSSEHandler.test.ts
git commit -m "test(genai): useSSEHandler stream lifecycle coverage"
```

---

## Task 10: SessionProvider CRUD tests

**Files:**
- Create: `src/features/session/session.test.tsx`

- [ ] **Step 1: Write the tests**

Create `packages/genai/src/features/session/session.test.tsx`:
```typescript
import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi, beforeEach, type Mock } from 'vitest';

import { useSessionContext } from './context';
import { SessionProvider } from './provider';

// Mock API calls so no network requests go out
vi.mock('@/lib/api', () => ({
  getChatHistoryV2: vi.fn(),
  getBrandSessions: vi.fn(),
  updateSessionTitle: vi.fn(),
}));

// Mock analytics — SessionProvider calls useOctoAnalytics
vi.mock('@/features/analytics/hooks', () => ({
  useOctoAnalytics: () => ({
    analytics: {
      trackSessionSwitched: vi.fn(),
      trackSessionCreated: vi.fn(),
    },
  }),
}));

import { updateSessionTitle } from '@/lib/api';
const mockUpdateSessionTitle = updateSessionTitle as Mock;

/** Wraps renderHook in a SessionProvider */
function makeWrapper(brandId = 1, currentSessionId?: string) {
  return ({ children }: { children: ReactNode }) => (
    <SessionProvider brandId={brandId} currentSessionId={currentSessionId}>
      {children}
    </SessionProvider>
  );
}

/** Seed a session directly via initSessions */
async function seedSession(result: { current: ReturnType<typeof useSessionContext> }) {
  await act(async () => {
    result.current.initSessions([
      {
        id: 'session-1',
        session_name: 'My Session',
        last_update_time: '2024-01-01T00:00:00.000Z',
        agent_id: 'agent-1',
      },
    ]);
  });
}

describe('SessionProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('initSessions', () => {
    it('populates sessions from raw API data', async () => {
      const { result } = renderHook(() => useSessionContext(), {
        wrapper: makeWrapper(),
      });

      await seedSession(result);

      expect(result.current.sessions).toHaveLength(1);
      expect(result.current.sessions[0]?.id).toBe('session-1');
      expect(result.current.sessions[0]?.name).toBe('My Session');
    });
  });

  describe('removeSession', () => {
    it('removes the session from the list', async () => {
      const { result } = renderHook(() => useSessionContext(), {
        wrapper: makeWrapper(),
      });

      await seedSession(result);

      act(() => {
        result.current.removeSession('session-1');
      });

      expect(result.current.sessions).toHaveLength(0);
    });

    it('clears currentSessionId when removing the active session', async () => {
      const { result } = renderHook(() => useSessionContext(), {
        wrapper: makeWrapper(),
      });

      await seedSession(result);

      act(() => {
        result.current.setCurrentSessionIdState('session-1');
      });

      act(() => {
        result.current.removeSession('session-1');
      });

      expect(result.current.currentSessionId).toBeNull();
    });

    it('does not clear currentSessionId when removing a different session', async () => {
      const { result } = renderHook(() => useSessionContext(), {
        wrapper: makeWrapper(),
      });

      await act(async () => {
        result.current.initSessions([
          {
            id: 'session-1',
            session_name: 'One',
            last_update_time: '2024-01-01T00:00:00.000Z',
            agent_id: 'agent-1',
          },
          {
            id: 'session-2',
            session_name: 'Two',
            last_update_time: '2024-01-01T00:00:00.000Z',
            agent_id: 'agent-1',
          },
        ]);
      });

      act(() => {
        result.current.setCurrentSessionIdState('session-1');
      });

      act(() => {
        result.current.removeSession('session-2');
      });

      expect(result.current.currentSessionId).toBe('session-1');
    });
  });

  describe('updateSessionName', () => {
    it('optimistically updates the name', async () => {
      mockUpdateSessionTitle.mockResolvedValue({ data: {} });
      const { result } = renderHook(() => useSessionContext(), {
        wrapper: makeWrapper(),
      });

      await seedSession(result);

      await act(async () => {
        await result.current.updateSessionName('session-1', 'Renamed');
      });

      expect(result.current.sessions[0]?.name).toBe('Renamed');
    });

    it('rolls back the name on API failure', async () => {
      mockUpdateSessionTitle.mockRejectedValue(new Error('Server error'));
      const { result } = renderHook(() => useSessionContext(), {
        wrapper: makeWrapper(),
      });

      await seedSession(result);

      await act(async () => {
        await result.current.updateSessionName('session-1', 'Bad Name');
      });

      await waitFor(() => {
        expect(result.current.sessions[0]?.name).toBe('My Session');
      });
    });
  });

  describe('startNewChat', () => {
    it('clears currentSessionId', async () => {
      const { result } = renderHook(() => useSessionContext(), {
        wrapper: makeWrapper(),
      });

      await seedSession(result);

      act(() => {
        result.current.setCurrentSessionIdState('session-1');
        result.current.setEnteredInChatMode(true);
      });

      act(() => {
        result.current.startNewChat();
      });

      expect(result.current.currentSessionId).toBeNull();
    });
  });
});
```

- [ ] **Step 2: Run tests**

```bash
cd packages/genai && pnpm test -- src/features/session/session.test.tsx --reporter=verbose
```
Expected: 7 tests pass.

If `useOctoAnalytics` mock path is wrong, check where `provider.tsx` imports it from and match the `vi.mock` path. If `SessionProvider` imports `toast` from sonner (for rollback), add a mock:
```typescript
vi.mock('sonner', () => ({ toast: { error: vi.fn() } }));
```

- [ ] **Step 3: Commit**

```bash
git add packages/genai/src/features/session/session.test.tsx
git commit -m "test(genai): SessionProvider CRUD — init, remove, rename, rollback"
```

---

## Task 11: Final verification

- [ ] **Step 1: Run full test suite**

```bash
cd packages/genai && pnpm test --reporter=verbose
```
Expected: All 38+ tests pass, 0 failures.

- [ ] **Step 2: Run typecheck one final time**

```bash
cd packages/genai && pnpm typecheck
```
Expected: `Found 0 errors.`

- [ ] **Step 3: Verify build still produces output**

```bash
cd packages/genai && pnpm build 2>&1 | tail -10
```
Expected: `dist/` produced without errors.

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "chore(genai): verify full restructure + test baseline passes"
```
