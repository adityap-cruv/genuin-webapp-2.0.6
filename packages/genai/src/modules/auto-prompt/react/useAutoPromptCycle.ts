import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import type React from 'react';

import { useOctoAnalytics } from '@/adapters/analytics/hooks';
import { eventBus } from '@/core/events/EventBus';
import { EVENTS } from '@/core/events/eventRegistry';
import { OctoState } from '@/core/state-machine/octo-state';
import type { HandleSendMessageParams } from '@/modules/chat/types';
import type { AutoPromptConfig } from '@/modules/lifecycle/auto-prompt-config';
import type { CachedResponseItem } from '@/services/apiTypes';
import { useInputContext } from '@/stores/input/context';
import type { Session } from '@/types';
import { useCachedResponsePlayer } from '@/views/web-sdk/hooks/useCachedResponsePlayer';

import { AutoPromptMachine } from '../AutoPromptMachine';
import type { MachineDeps, Snapshot } from '../context';
import { INITIAL_SNAPSHOT } from '../context';
import { phaseForState, type OctoPhase } from '../phase';
import { EventKind, type Event } from '../states';

export type { AutoPromptConfig };

export interface UseAutoPromptCycleParams {
    autoPromptConfig: AutoPromptConfig;
    octoState: OctoState;
    currentSessionId: string | null;
    sessions: Session[];
    suggestedPrompts: string[];
    cachedPromptResponses: Map<string, CachedResponseItem[]>;
    setSessions: React.Dispatch<React.SetStateAction<Session[]>>;
    webSdkRenderMode: 'compact' | 'full';
    parentOctoPanelId: string | null | undefined;
    setWebSdkRenderMode: (mode: 'compact' | 'full') => void;
    setIsSuggestionsOpen: (open: boolean) => void;
    handleSendMessage: (params: HandleSendMessageParams) => void;
    handleNewChat: () => void;
}

export interface UseAutoPromptCycleResult {
    showDummyMessage: boolean;
    countdown: number | null;
    panelViewCountdown: number | null;
    showPresetPrompts: boolean;
    isPostCloseMode: boolean;
    isBusy: boolean;
    /** Prompt currently in the cycle (countdown → send). Null when no active cycle. */
    activePrompt: string | null;
    /** Semantic lifecycle phase projected from the FSM state. */
    phase: OctoPhase;
    /** Stable RefObject — reads from machine snapshot synchronously. */
    isPostCloseModeRef: React.RefObject<boolean>;
    setShowPresetPrompts: (v: boolean) => void;
    handleAutoPromptClick: () => void;
    handleInputStart: () => void;
    handleCompactPromptSend: () => void;
    /**
     * Take over the counting-down prompt: skip the remaining countdown, expand
     * to full-view, and send now. The cycle continues (response → close → loop)
     * instead of terminating, unlike the cancel handlers.
     */
    handleTakeoverAndSend: () => void;
    cancelFullViewCycle: () => void;
}

const DISABLED_RESULT_BASE: Omit<UseAutoPromptCycleResult, 'isPostCloseModeRef'> = {
    showDummyMessage: false,
    countdown: null,
    panelViewCountdown: null,
    showPresetPrompts: false,
    isPostCloseMode: false,
    isBusy: false,
    activePrompt: null,
    phase: 'idle',
    setShowPresetPrompts: () => undefined,
    handleAutoPromptClick: () => undefined,
    handleInputStart: () => undefined,
    handleCompactPromptSend: () => undefined,
    handleTakeoverAndSend: () => undefined,
    cancelFullViewCycle: () => undefined,
};

/** Derive the busy flag from OctoState. */
function isOctoBusy(state: OctoState): boolean {
    return (
        state === OctoState.LOADING ||
        state === OctoState.CREATING_SESSION ||
        state === OctoState.STREAMING ||
        state === OctoState.RESPONDING ||
        state === OctoState.CANCELLING
    );
}

/** All live values the machine can read. Kept in a single ref so the machine always sees fresh state. */
type LiveDeps = {
    autoPromptConfig: AutoPromptConfig;
    currentSessionId: string | null;
    sessions: Session[];
    suggestedPrompts: string[];
    cachedPromptResponses: Map<string, CachedResponseItem[]>;
    webSdkRenderMode: 'compact' | 'full';
    parentOctoPanelId: string | null | undefined;
    isBusy: boolean;
    handleSendMessage: (p: HandleSendMessageParams) => void;
    handleNewChat: () => void;
    playCachedResponse: (sid: string, items: CachedResponseItem[], prompt: string) => void;
    setInput: (v: string) => void;
    setWebSdkRenderMode: (mode: 'compact' | 'full') => void;
    setIsSuggestionsOpen: (open: boolean) => void;
    setSessions: React.Dispatch<React.SetStateAction<Session[]>>;
    setShowPresetPromptsLocal: (v: boolean) => void;
    analytics: ReturnType<typeof useOctoAnalytics>['analytics'];
};

export function useAutoPromptCycle(params: UseAutoPromptCycleParams): UseAutoPromptCycleResult {
    const {
        autoPromptConfig,
        octoState,
        currentSessionId,
        sessions,
        suggestedPrompts,
        cachedPromptResponses,
        setSessions,
        webSdkRenderMode,
        parentOctoPanelId,
        setWebSdkRenderMode,
        setIsSuggestionsOpen,
        handleSendMessage,
        handleNewChat,
    } = params;

    const { setInput } = useInputContext();
    const { analytics } = useOctoAnalytics();
    const { playCachedResponse } = useCachedResponsePlayer({ setSessions });
    const isBusy = isOctoBusy(octoState);

    // UI-only state — preset-prompts panel visibility is not machine-owned.
    const [showPresetPromptsLocal, setShowPresetPromptsLocal] = useState(false);

    // Single stable ref for all live deps. All MachineDeps methods are lambdas that read from this
    // ref, so the machine always sees fresh values without needing a deps-replacement call.
    const depsRef = useRef<LiveDeps>({
        autoPromptConfig,
        currentSessionId,
        sessions,
        suggestedPrompts,
        cachedPromptResponses,
        webSdkRenderMode,
        parentOctoPanelId,
        isBusy,
        handleSendMessage,
        handleNewChat,
        playCachedResponse,
        setInput,
        setWebSdkRenderMode,
        setIsSuggestionsOpen,
        setSessions,
        setShowPresetPromptsLocal,
        analytics,
    });
    depsRef.current = {
        autoPromptConfig,
        currentSessionId,
        sessions,
        suggestedPrompts,
        cachedPromptResponses,
        webSdkRenderMode,
        parentOctoPanelId,
        isBusy,
        handleSendMessage,
        handleNewChat,
        playCachedResponse,
        setInput,
        setWebSdkRenderMode,
        setIsSuggestionsOpen,
        setSessions,
        setShowPresetPromptsLocal,
        analytics,
    };

    const isDisabled = !autoPromptConfig.enabled;

    // Lazy init — machine is created once on the first enabled render.
    const machineRef = useRef<AutoPromptMachine | null>(null);
    if (!machineRef.current && !isDisabled) {
        machineRef.current = new AutoPromptMachine(buildDeps(depsRef));
    }

    // Stable proxy ref — synchronous read of machine snapshot without subscribing to React state.
    const isPostCloseModeRef = useMemo<React.RefObject<boolean>>(() => ({
        get current() {
            return machineRef.current?.getSnapshot().isPostCloseMode ?? false;
        },
        // Allow assignment as a no-op so RefObject<boolean> is satisfied at type level.
        // The machine owns the source of truth; external writes are ignored on purpose.
        set current(_v: boolean) {
            /* intentional no-op */
        },
    } as React.RefObject<boolean>), []);

    // ── Subscribe to snapshot ────────────────────────────────────────────────
    const subscribe = useCallback(
        (listener: () => void) => {
            if (!machineRef.current) return () => undefined;
            return machineRef.current.subscribe(() => listener());
        },
        [],
    );
    const getSnapshot = useCallback((): Snapshot => {
        return machineRef.current?.getSnapshot() ?? INITIAL_SNAPSHOT;
    }, []);
    const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

    // ── Phase projection ─────────────────────────────────────────────────────
    const currentSessionForPhase = currentSessionId
      ? sessions.find(s => s.id === currentSessionId)
      : undefined;
    const hasVisibleResponse =
      currentSessionForPhase?.chat?.some(e => e.role === 'agent' && e.isCompleted) ?? false;
    const phase = phaseForState({
      state: snapshot.state,
      thinking: currentSessionForPhase?.thinking ?? false,
      status: currentSessionForPhase?.status,
      hasVisibleResponse,
    });

    // ── Bridge React → machine events ────────────────────────────────────────
    // CONFIG_READY: armed whenever (no session, prompts ready, not busy, !disabled).
    useEffect(() => {
        if (!machineRef.current || isDisabled) return;
        if (currentSessionId) return;
        if (suggestedPrompts.length === 0) return;
        if (isBusy) return;
        machineRef.current.send({ kind: EventKind.CONFIG_READY });
    }, [currentSessionId, suggestedPrompts, isBusy, isDisabled]);

    // SESSION_STARTED / SESSION_CLEARED
    const prevSessionIdRef = useRef<string | null>(currentSessionId);
    useEffect(() => {
        if (!machineRef.current) return;
        const prev = prevSessionIdRef.current;
        prevSessionIdRef.current = currentSessionId;
        if (prev === currentSessionId) return;
        if (currentSessionId) {
            machineRef.current.send({ kind: EventKind.SESSION_STARTED, sessionId: currentSessionId });
        } else if (prev) {
            machineRef.current.send({ kind: EventKind.SESSION_CLEARED });
        }
    }, [currentSessionId]);

    // AGENT_RESPONSE_DONE
    useEffect(() => {
        if (!machineRef.current || !currentSessionId) return;
        const session = sessions.find(s => s.id === currentSessionId);
        if (!session) return;
        const lastAgent = [...(session.chat ?? [])].reverse().find(e => e.role === 'agent');
        if (!lastAgent?.isCompleted) return;
        const messageId = lastAgent.id ?? null;
        if (!messageId) return;
        machineRef.current.send({ kind: EventKind.AGENT_RESPONSE_DONE, messageId });
    }, [sessions, currentSessionId]);

    // PROMPTS_REFRESHED
    useEffect(() => {
        machineRef.current?.send({ kind: EventKind.PROMPTS_REFRESHED });
    }, [suggestedPrompts]);

    // BUSY_CHANGED
    useEffect(() => {
        machineRef.current?.send({ kind: EventKind.BUSY_CHANGED, isBusy });
    }, [isBusy]);

    // RENDER_MODE_CHANGED
    useEffect(() => {
        machineRef.current?.send({ kind: EventKind.RENDER_MODE_CHANGED, mode: webSdkRenderMode });
    }, [webSdkRenderMode]);

    // USER_INTERACTED (global) + EXTERNAL_AUTO_CLOSE event-bus listeners
    useEffect(() => {
        if (!machineRef.current) return;
        const offUser = eventBus.on(EVENTS.USER_INTERACTED, () => {
            machineRef.current?.send({ kind: EventKind.USER_INTERACTED, source: 'global' });
        });
        const offAutoClose = eventBus.on(EVENTS.WEB_SDK_AUTO_CLOSE, () => {
            machineRef.current?.send({ kind: EventKind.EXTERNAL_AUTO_CLOSE });
        });
        return () => {
            offUser();
            offAutoClose();
        };
    }, []);

    // Dispose on unmount
    useEffect(() => () => machineRef.current?.dispose(), []);

    // ── Handlers ─────────────────────────────────────────────────────────────
    const send = useCallback((event: Event) => machineRef.current?.send(event), []);

    // Reveal preset prompts only for a fresh session the user hasn't typed into yet.
    const openPresetPromptsIfFresh = useCallback(() => {
        const session = sessions.find(s => s.id === currentSessionId);
        const hasUserMessages = session?.chat?.some(e => e.role === 'user') ?? false;
        if (hasUserMessages) return;
        setShowPresetPromptsLocal(true);
        setIsSuggestionsOpen(true);
    }, [sessions, currentSessionId, setIsSuggestionsOpen]);

    const handleAutoPromptClick = useCallback(() => {
        const prompt = machineRef.current?.getSnapshot().activePrompt ?? suggestedPrompts[0];
        if (!prompt) return;
        send({ kind: EventKind.USER_INTERACTED, source: 'auto_prompt_click' });
        openPresetPromptsIfFresh();
        setInput(prompt);
    }, [suggestedPrompts, openPresetPromptsIfFresh, setInput, send]);

    const handleInputStart = useCallback(() => {
        send({ kind: EventKind.USER_INTERACTED, source: 'input_start' });
        openPresetPromptsIfFresh();
    }, [openPresetPromptsIfFresh, send]);

    const handleCompactPromptSend = useCallback(() => {
        const prompt = machineRef.current?.getSnapshot().activePrompt ?? suggestedPrompts[0];
        if (!prompt) return;
        send({ kind: EventKind.USER_INTERACTED, source: 'compact_prompt_send' });
        handleSendMessage({
            targetSessionId: currentSessionId,
            messageInput: prompt,
            onMessageQueued: () => setInput(''),
        });
    }, [suggestedPrompts, currentSessionId, handleSendMessage, send, setInput]);

    const handleTakeoverAndSend = useCallback(() => {
        // Single intent: the machine expands to full-view and sends the active prompt
        // via effects (setRenderMode + invokeSend), so the response is shown and the
        // cycle continues. Distinct from cancel — does not terminate.
        send({ kind: EventKind.COUNTDOWN_TAKEOVER });
    }, [send]);

    const cancelFullViewCycle = useCallback(() => {
        send({ kind: EventKind.USER_INTERACTED, source: 'external' });
    }, [send]);

    const setShowPresetPrompts = useCallback((v: boolean) => setShowPresetPromptsLocal(v), []);

    if (isDisabled) {
        // Auto-prompt is off, but a manual send still drives the lifecycle. Derive the phase
        // from session signals (no machine) so the shell still expands to full/panel-view on
        // a manual `thinking` → `response`. Disabled only suppresses the auto-prompt cycle,
        // not the user's own request.
        const disabledPhase: OctoPhase = currentSessionForPhase?.status === 'error'
            ? 'error'
            : currentSessionForPhase?.thinking
              ? 'thinking'
              : hasVisibleResponse
                ? 'response'
                : 'idle';
        return { ...DISABLED_RESULT_BASE, phase: disabledPhase, isPostCloseModeRef };
    }

    return {
        showDummyMessage: snapshot.showDummyMessage,
        countdown: snapshot.countdown,
        panelViewCountdown: snapshot.panelViewCountdown,
        showPresetPrompts: showPresetPromptsLocal,
        isPostCloseMode: snapshot.isPostCloseMode,
        isBusy,
        activePrompt: snapshot.activePrompt,
        phase,
        isPostCloseModeRef,
        setShowPresetPrompts,
        handleAutoPromptClick,
        handleInputStart,
        handleCompactPromptSend,
        handleTakeoverAndSend,
        cancelFullViewCycle,
    };
}

/**
 * Build the MachineDeps accessor object. Every method is a lambda that reads
 * from `depsRef.current` — the machine always sees fresh values without needing
 * a deps-replacement call on every render.
 */
function buildDeps(depsRef: React.RefObject<LiveDeps>): MachineDeps {
    return {
        getCurrentSessionId: () => depsRef.current.currentSessionId,
        getSessions: () => depsRef.current.sessions,
        getSuggestedPrompts: () => depsRef.current.suggestedPrompts,
        getCachedResponses: () => depsRef.current.cachedPromptResponses,
        getRenderMode: () => depsRef.current.webSdkRenderMode,
        getIsBusy: () => depsRef.current.isBusy,
        getParentOctoPanelId: () => depsRef.current.parentOctoPanelId,
        getConfig: () => depsRef.current.autoPromptConfig,
        handleSendMessage: p => depsRef.current.handleSendMessage(p),
        handleNewChat: () => depsRef.current.handleNewChat(),
        playCachedResponse: (sid, items, prompt) => depsRef.current.playCachedResponse(sid, items, prompt),
        setInput: v => depsRef.current.setInput(v),
        setWebSdkRenderMode: m => depsRef.current.setWebSdkRenderMode(m),
        setIsSuggestionsOpen: o => depsRef.current.setIsSuggestionsOpen(o),
        setShowPresetPromptsExternal: v => depsRef.current.setShowPresetPromptsLocal(v),
        setSessions: s => depsRef.current.setSessions(s),
        analytics: {
            trackAutoPromptCountdownStarted: p => depsRef.current.analytics.trackAutoPromptCountdownStarted(p),
            trackAutoPromptExecuted: p => depsRef.current.analytics.trackAutoPromptExecuted(p),
            trackAutoPromptCancelled: p => depsRef.current.analytics.trackAutoPromptCancelled(p),
        },
    };
}
