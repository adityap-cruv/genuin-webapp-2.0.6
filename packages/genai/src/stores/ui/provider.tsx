import { type ReactNode, useCallback, useEffect, useState } from 'react';

import { OctoState } from '@/core/state-machine/octo-state';
import { useAppBootstrap } from '@/hooks/useAppBootstrap';
import { useAgentContext } from '@/stores/agent/context';
import { useChatContext } from '@/stores/chat/context';
import { useLifecycleContext } from '@/stores/lifecycle/context';
import { useSessionContext } from '@/stores/session/context';

import { useVideoStylesContext } from './VideoStylesProvider';
import { UIContext } from './context';

interface UIProviderProps {
    /** Current render view. */
    view: 'page' | 'floater' | 'dialog' | 'web-sdk';
    /** Initial web-sdk render mode (optional). */
    webSdkRenderMode?: 'compact' | 'full';
    /**
     * UI density level supplied by the SDK host at init time.
     * Controls the scale of all sizing-sensitive elements.
     * - `'xs'`   — compact strips (320×100, 320×50)
     * - `'sm'`   — larger ad tiles (300×250 split view)
     * - `'base'` — standard full UI (default)
     */
    uiDensity?: 'xs' | 'sm' | 'base';
    /** User email for analytics (optional). */
    userEmail?: string;
    /** User UUID for analytics (optional). */
    userUUID?: string;
    /** Authenticated user ID. */
    userId: string;
    /** Brand ID. */
    brandId: number;
    /** External session ID prop (for bootstrap sync). */
    currentSessionIdProp?: string;
    /** Whether this is the Maya single-agent mode. */
    isMaya?: boolean;
    /** Web-SDK parent instance ID (optional). */
    parentWebSdkInstanceId?: string;
    /** Web-SDK parent container ID (optional). */
    parentWebSdkContainerId?: string;
    /** Web-SDK parent embed ID (optional). */
    parentWebSdkEmbedId?: string;
    /** Web-SDK parent placement ID (optional). */
    parentWebSdkPlacementId?: string;
    /** Octo panel ID for targeted render-mode events (optional). */
    parentOctoPanelId?: string;
    /** Video ID for web-sdk (optional). */
    videoId?: string;
    /** Integration type — controls whether suggested prompts popup is shown. */
    integrationType?: 'embed' | 'placement';
    children: ReactNode;
}

/**
 * Owns all UI state: sidebar collapse, web-sdk render mode, video styles,
 * suggested prompts, textarea ref, and misc display flags. Also runs
 * `useAppBootstrap` and exposes `handleNewChat`.
 *
 * Note: `s3_keys` are owned by `ChatProvider` (to avoid a circular dep) and
 * are re-exposed here for consumers that only read `useUIContext`.
 */
export function UIProvider({
    view,
    webSdkRenderMode: webSdkRenderModeProp,
    uiDensity: uiDensityProp,
    userEmail,
    userUUID,
    userId,
    brandId,
    currentSessionIdProp,
    isMaya,
    parentWebSdkInstanceId,
    parentWebSdkContainerId,
    parentWebSdkEmbedId,
    parentWebSdkPlacementId,
    parentOctoPanelId,
    videoId,
    integrationType,
    children,
}: UIProviderProps) {
    const sessionContext = useSessionContext();
    const agentContext = useAgentContext();
    const chatContext = useChatContext();
    const { transitionOctoState } = useLifecycleContext();

    const [isSidebarCollapsed, setIsSidebarCollapsedState] = useState<boolean>(false);
    const [showAllObjectives, setShowAllObjectives] = useState<boolean>(false);
    const [isSuggestionsOpen, setIsSuggestionsOpen] = useState<boolean>(false);
    // Stored as state so context consumers re-render when the textarea mounts/unmounts.
    const [textAreaRef, setTextAreaRef] = useState<HTMLTextAreaElement | null>(null);
    const [webSdkRenderModeState, setWebSdkRenderModeState] = useState<'compact' | 'full'>(
        webSdkRenderModeProp ?? 'full'
    );

    const { videoStyles, toggleStyleSelection, toggleOptionSelection, resetVideoStyles } = useVideoStylesContext();

    // Keep ChatProvider's isSidebarCollapsedForSSE in sync so handleSSEMessage sees
    // the correct value when building hasNewName.
    const setIsSidebarCollapsed = useCallback(
        (v: boolean) => {
            setIsSidebarCollapsedState(v);
            chatContext.setIsSidebarCollapsedForSSE(v);
        },
        [chatContext.setIsSidebarCollapsedForSSE]
    );

    const { suggestedPrompts, isLoadingSuggestedPrompts } = chatContext;

    const handleNewChat = useCallback(() => {
        sessionContext.startNewChat();
        chatContext.clearS3Keys();
    }, [sessionContext.startNewChat, chatContext.clearS3Keys]);

    const setWebSdkRenderModeValue = useCallback((mode: 'compact' | 'full') => {
        setWebSdkRenderModeState(prev => (prev === mode ? prev : mode));

        if (typeof window !== 'undefined') {
            const globalSdk = (
                window as unknown as {
                    GenAISDK?: { setWebSdkRenderMode?: (mode: 'compact' | 'full') => void };
                }
            ).GenAISDK;
            try {
                globalSdk?.setWebSdkRenderMode?.(mode);
            } catch (error) {
                console.error('[UIProvider] Failed to propagate render mode to SDK', error);
            }
        }
    }, []);

    // Sync render mode from prop
    useEffect(() => {
        if (webSdkRenderModeProp && webSdkRenderModeProp !== webSdkRenderModeState) {
            setWebSdkRenderModeState(webSdkRenderModeProp);
        }
    }, [webSdkRenderModeProp]);

    useAppBootstrap({
        brandId,
        userEmail,
        userUUID,
        userId,
        currentSessionIdProp,
        currentSessionId: sessionContext.currentSessionId,
        setCurrentSessionId: sessionContext.setCurrentSessionId,
        initSessions: sessionContext.initSessions,
        setAgentsState: agentContext.setAgentsFromBootstrap,
        setEnteredInChatMode: sessionContext.setEnteredInChatMode,
        setCurrentAgent: agentContext.setCurrentAgent,
        view,
        isMaya: isMaya ?? false,
        onBootstrapComplete: () => {
            try {
                transitionOctoState(OctoState.READY);
            } catch {
                /* already READY */
            }
        },
    });

    return (
        <UIContext.Provider
            value={{
                view,
                isSidebarCollapsed,
                setIsSidebarCollapsed,
                webSdkRenderMode: webSdkRenderModeState,
                setWebSdkRenderMode: setWebSdkRenderModeValue,
                uiDensity: uiDensityProp ?? 'base',
                s3_keys: chatContext.s3_keys,
                setS3Keys: chatContext.setS3Keys,
                clearS3Keys: chatContext.clearS3Keys,
                showAllObjectives,
                setShowAllObjectives,
                isSuggestionsOpen,
                setIsSuggestionsOpen,
                textAreaRef,
                setTextAreaRef,
                videoStyles,
                toggleStyleSelection,
                toggleOptionSelection,
                resetVideoStyles,
                suggestedPrompts,
                isLoadingSuggestedPrompts,
                handleNewChat,
                refreshData: sessionContext.refreshData,
                userEmail,
                parentWebSdkInstanceId,
                parentWebSdkContainerId,
                parentWebSdkEmbedId,
                parentWebSdkPlacementId,
                parentOctoPanelId,
                videoId,
                integrationType,
                user_id: userId,
                brand_id: brandId,
            }}
        >
            {children}
        </UIContext.Provider>
    );
}
