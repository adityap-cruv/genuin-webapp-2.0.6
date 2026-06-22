import { useEffect, useRef } from 'react';

import { eventBus } from '@/core/events/EventBus';
import { EVENTS } from '@/core/events/eventRegistry';
import type { OctoState } from '@/core/state-machine/octo-state';

interface UseWebSdkBridgeParams {
    parentOctoPanelId: string | null | undefined;
    octoState: OctoState;
    currentSessionId: string | null;
    webSdkRenderMode: 'compact' | 'full';
    /** Called when host page fires genai:webSdkCancelCycle */
    onExternalCancelCycle: () => void;
    /** Called when host page fires genai:webSdkRenderMode */
    onExternalRenderModeChange?: (mode: 'compact' | 'full') => void;
}

/** Centralises all bidirectional CustomEvent I/O for the web-sdk instance. */
export function useWebSdkBridge({
    parentOctoPanelId,
    octoState,
    currentSessionId,
    webSdkRenderMode,
    onExternalCancelCycle,
    onExternalRenderModeChange,
}: UseWebSdkBridgeParams): void {
    // ── Outbound: OctoState transitions ──────────────────────────────────────
    useEffect(() => {
        if (!parentOctoPanelId) return;
        eventBus.emit(EVENTS.WEB_SDK_STATE_CHANGE, { parentOctoPanelId, octoState });
    }, [parentOctoPanelId, octoState]);

    // ── Outbound: session changes ─────────────────────────────────────────────
    useEffect(() => {
        if (!parentOctoPanelId) return;
        eventBus.emit(EVENTS.WEB_SDK_SESSION_CHANGE, {
            parentOctoPanelId,
            sessionId: currentSessionId,
        });
    }, [parentOctoPanelId, currentSessionId]);

    // ── Inbound: external cycle cancellation ──────────────────────────────────
    useEffect(() => {
        return eventBus.on(EVENTS.WEB_SDK_CANCEL_CYCLE, detail => {
            if (
                detail?.parentOctoPanelId &&
                parentOctoPanelId &&
                detail.parentOctoPanelId !== parentOctoPanelId
            ) {
                return;
            }
            onExternalCancelCycle();
        });
    }, [parentOctoPanelId, onExternalCancelCycle]);

    // ── Inbound: render-mode change from host ─────────────────────────────────
    // The SDK echoes our own setWebSdkRenderMode calls back through this event,
    // so we drop any event whose mode matches our current state — those are echoes,
    // not real host-driven changes. Real host changes always carry a different mode.
    const renderModeRef = useRef(webSdkRenderMode);
    useEffect(() => {
        renderModeRef.current = webSdkRenderMode;
    }, [webSdkRenderMode]);

    useEffect(() => {
        if (!onExternalRenderModeChange) return;

        return eventBus.on(EVENTS.WEB_SDK_RENDER_MODE, detail => {
            if (!detail?.mode) return;
            if (
                detail.parentOctoPanelId &&
                parentOctoPanelId &&
                detail.parentOctoPanelId !== parentOctoPanelId
            ) {
                return;
            }
            // Drop self-originated echo: if our local mode already matches, this event
            // was triggered by our own setWebSdkRenderMode → SDKLifecycle → dispatch loop.
            if (detail.mode === renderModeRef.current) return;
            onExternalRenderModeChange(detail.mode);
        });
    }, [parentOctoPanelId, onExternalRenderModeChange]);
}
