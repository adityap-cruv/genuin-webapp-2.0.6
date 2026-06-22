import type React from 'react';

import type { CountdownActiveSource } from '@/core/events/eventRegistry';
import type { HandleSendMessageParams } from '@/modules/chat/types';
import type { AutoPromptConfig } from '@/modules/lifecycle/auto-prompt-config';
import type { CachedResponseItem } from '@/services/apiTypes';
import type { Session } from '@/types';

import { State } from './states';

/** Timer keys owned by step modules. Use a union so misspellings can't compile. */
export type TimerKey = 'countdown' | 'nextPromptCountdown' | 'panelCountdown' | 'idle' | 'videoPlay';

/** Snapshot read by React via `useSyncExternalStore`. Immutable per emit. */
export interface Snapshot {
    /** Current FSM state — mirrored into the snapshot so React/phase can observe transitions. */
    state: State;
    /** Compact-idle / initial countdown badge value. Null when not ticking. */
    countdown: number | null;
    /** Panel-view carry-over countdown value. Null when not ticking. */
    panelViewCountdown: number | null;
    /** Whether the dummy message bubble is visible (full mode, idle). */
    showDummyMessage: boolean;
    /** Preset prompts surface visibility (user-toggled). */
    showPresetPrompts: boolean;
    /** Post-close idle mode flag — read synchronously by useWebSdkBridge. */
    isPostCloseMode: boolean;
    /** Busy passthrough for the React layer. */
    isBusy: boolean;
    /** Prompt being counted down / about to send. Null when no active cycle. */
    activePrompt: string | null;
}

/** Live dependencies pushed from React. The machine reads these via accessor calls. */
export interface MachineDeps {
    getCurrentSessionId(): string | null;
    getSessions(): Session[];
    getSuggestedPrompts(): string[];
    getCachedResponses(): Map<string, CachedResponseItem[]>;
    getRenderMode(): 'compact' | 'full';
    getIsBusy(): boolean;
    getParentOctoPanelId(): string | null | undefined;
    getConfig(): AutoPromptConfig;

    handleSendMessage(p: HandleSendMessageParams): void;
    /** Clears the active chat session — used on auto-close so the next cycle starts fresh. */
    handleNewChat(): void;
    playCachedResponse(sessionId: string, items: CachedResponseItem[], prompt: string): void;
    setInput(v: string): void;
    setWebSdkRenderMode(mode: 'compact' | 'full'): void;
    setIsSuggestionsOpen(open: boolean): void;
    setShowPresetPromptsExternal(v: boolean): void;
    setSessions: React.Dispatch<React.SetStateAction<Session[]>>;

    analytics: {
        trackAutoPromptCountdownStarted(p: { prompt: string; countdown_duration: number }): void;
        trackAutoPromptExecuted(p: { prompt: string }): void;
        trackAutoPromptCancelled(p: { prompt: string; seconds_remaining: number }): void;
    };
}

/** Per-cycle local state. Cleared on CANCELLED/reset; survives across step transitions. */
export interface CycleState {
    /** Rotation cursor through suggestedPrompts. */
    promptIndex: number;
    /** Prompt selected for the current send. */
    activePrompt: string | null;
    /** Which timer key the current countdown step is using. */
    countdownTimerKey: 'countdown' | 'nextPromptCountdown' | 'panelCountdown';
    /** Target session for handleSendMessage — null for the cache-resolution path. */
    targetSessionId: string | null;
    /** Last agent message id that triggered CHAT_CLOSE_DELAY — guards against re-arming on the same message. */
    cycleStartedForMessageId: string | null;
    /** Source label for the upcoming countdown-active emit. */
    nextCountdownSource: CountdownActiveSource;
    /** Whether the most recent send was initiated post-close (used to request expand on SEND_QUEUED). */
    needsExpandOnQueue: boolean;
}

/** Aggregate machine context. The machine owns this; transitions mutate fields explicitly via effects. */
export interface MachineContext {
    state: State;
    snapshot: Snapshot;
    cycle: CycleState;
    deps: MachineDeps;
}

/** Initial snapshot — frozen-equivalent default values. */
export const INITIAL_SNAPSHOT: Snapshot = {
    state: State.IDLE,
    countdown: null,
    panelViewCountdown: null,
    showDummyMessage: false,
    showPresetPrompts: false,
    isPostCloseMode: false,
    isBusy: false,
    activePrompt: null,
};

/** Initial cycle state — same default values used after every reset. */
export const INITIAL_CYCLE: CycleState = {
    promptIndex: 1,
    activePrompt: null,
    countdownTimerKey: 'countdown',
    targetSessionId: null,
    cycleStartedForMessageId: null,
    nextCountdownSource: 'countdown_started',
    needsExpandOnQueue: false,
};
