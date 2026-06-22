import { type ComponentType, useEffect, useMemo, useState } from 'react';

import type { AutoPromptConfig, LegacyAutoPromptConfig } from '@/modules/lifecycle/auto-prompt-config';
import { AppProviders } from '@/providers/AppProviders';
import type { PendingMessage } from '@/types';
import { loadView } from '@/views/registry';
import type { ViewName, ViewShellProps } from '@/views/types';

/** Props common to every view. Views ignore what they don't need. */
export interface AppProps {
    userId: string;
    brandId: number;
    sessionId?: string;
    isMaya?: boolean;
    pendingMessages?: Array<PendingMessage>;
    userEmail?: string;
    userUUID?: string;
    view?: ViewName;
    onClose?: () => void;
    parentWebSdkInstanceId?: string;
    parentWebSdkContainerId?: string;
    parentWebSdkEmbedId?: string;
    parentWebSdkPlacementId?: string;
    parentOctoPanelId?: string;
    renderMode?: 'compact' | 'full';
    /**
     * UI density level supplied by the SDK host at init time.
     * Controls the scale of all sizing-sensitive elements.
     * - `'xs'`   — compact strips (320×100, 320×50)
     * - `'sm'`   — larger ad tiles (300×250 split view)
     * - `'base'` — standard full UI (default)
     */
    uiDensity?: 'xs' | 'sm' | 'base';
    autoPromptConfig?: AutoPromptConfig | LegacyAutoPromptConfig;
    videoId?: string;
    integrationType?: 'embed' | 'placement';
    integrationId?: string;
    contentOrder?: string[];
}

/**
 * Slim dispatcher. Resolves the view module from the registry, then renders
 * its `Shell` inside `<AppProviders>`. View-specific UI lives in `views/<x>/`.
 */
function App(props: AppProps) {
    const view: ViewName = props.view ?? 'page';
    const [Shell, setShell] = useState<ComponentType<ViewShellProps> | null>(null);

    console.log('[GAI] view::', view);

    useEffect(() => {
        let cancelled = false;
        loadView(view)
            .then(mod => {
                if (!cancelled) setShell(() => mod.Shell);
            })
            .catch(err => {
                console.error(`[GenAI] Failed to load view '${view}':`, err);
            });
        return () => {
            cancelled = true;
        };
    }, [view]);

    const providerProps = useMemo(
        () => ({
            userId: props.userId,
            brandId: props.brandId,
            currentSessionId: props.sessionId || undefined,
            view,
            webSdkRenderMode: props.renderMode,
            uiDensity: props.uiDensity,
            pendingMessages: props.pendingMessages,
            userEmail: props.userEmail,
            userUUID: props.userUUID,
            isMaya: props.isMaya,
            parentWebSdkInstanceId: props.parentWebSdkInstanceId,
            parentWebSdkContainerId: props.parentWebSdkContainerId,
            parentWebSdkEmbedId: props.parentWebSdkEmbedId,
            parentWebSdkPlacementId: props.parentWebSdkPlacementId,
            parentOctoPanelId: props.parentOctoPanelId,
            videoId: props.videoId,
            integrationType: props.integrationType,
            integrationId: props.integrationId,
            contentOrder: props.contentOrder,
            autoPromptConfig: props.autoPromptConfig,
        }),
        [
            props.userId,
            props.brandId,
            props.sessionId,
            view,
            props.renderMode,
            props.uiDensity,
            props.pendingMessages,
            props.userEmail,
            props.userUUID,
            props.isMaya,
            props.parentWebSdkInstanceId,
            props.parentWebSdkContainerId,
            props.parentWebSdkEmbedId,
            props.parentWebSdkPlacementId,
            props.parentOctoPanelId,
            props.videoId,
            props.integrationType,
            props.integrationId,
            props.contentOrder,
            props.autoPromptConfig,
        ]
    );

    if (!Shell) return null;

    return (
        <AppProviders {...providerProps}>
            <Shell onClose={props.onClose} />
        </AppProviders>
    );
}

export default App;
