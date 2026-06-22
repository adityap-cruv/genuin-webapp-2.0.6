import { type ReactNode } from 'react';

import { RudderAnalyticsProvider } from '@/adapters/analytics/RudderAnalyticsProvider';
import { InputProvider } from '@/stores/input/provider';
import type { PendingMessage } from '@/types';

import { AnalyticsProvider } from '../adapters/analytics/provider';
import type { AutoPromptConfig, LegacyAutoPromptConfig } from '../modules/lifecycle/auto-prompt-config';
import { AgentProvider } from '../stores/agent/provider';
import { ChatProvider } from '../stores/chat/provider';
import { LifecycleProvider } from '../stores/lifecycle/provider';
import { SessionProvider } from '../stores/session/provider';
import { VideoStylesProvider } from '../stores/ui/VideoStylesProvider';
import { UIProvider } from '../stores/ui/provider';

interface AppProvidersProps {
    children: ReactNode;
    userId: string;
    brandId: number;
    currentSessionId?: string;
    view: 'page' | 'floater' | 'dialog' | 'web-sdk';
    webSdkRenderMode?: 'compact' | 'full';
    /**
     * UI density level supplied by the SDK host at init time.
     * Controls the scale of all sizing-sensitive elements.
     * - `'xs'`   — compact strips (320×100, 320×50)
     * - `'sm'`   — larger ad tiles (300×250 split view)
     * - `'base'` — standard full UI (default)
     */
    uiDensity?: 'xs' | 'sm' | 'base';
    pendingMessages?: Array<PendingMessage>;
    userEmail?: string;
    userUUID?: string;
    isMaya?: boolean;
    parentWebSdkInstanceId?: string;
    parentWebSdkContainerId?: string;
    parentWebSdkEmbedId?: string;
    parentWebSdkPlacementId?: string;
    parentOctoPanelId?: string;
    videoId?: string;
    integrationType?: 'embed' | 'placement';
    integrationId?: string;
    contentOrder?: string[];
    autoPromptConfig?: AutoPromptConfig | LegacyAutoPromptConfig;
}

/**
 * Full provider tree (outermost → innermost):
 *
 * RudderAnalyticsProvider → AnalyticsProvider → LifecycleProvider → SessionProvider
 *   → AgentProvider → ChatProvider → UIProvider → InputProvider → {children}
 */
export function AppProviders({
    children,
    userId,
    brandId,
    currentSessionId,
    view,
    webSdkRenderMode,
    uiDensity,
    pendingMessages,
    userEmail,
    userUUID,
    isMaya,
    parentWebSdkInstanceId,
    parentWebSdkContainerId,
    parentWebSdkEmbedId,
    parentWebSdkPlacementId,
    parentOctoPanelId,
    videoId,
    integrationType,
    integrationId,
    contentOrder,
    autoPromptConfig,
}: AppProvidersProps) {
    return (
        <RudderAnalyticsProvider>
            <AnalyticsProvider
                userId={userId}
                brandId={brandId}
                parentWebSdkInstanceId={parentWebSdkInstanceId}
                parentWebSdkContainerId={parentWebSdkContainerId}
                parentWebSdkEmbedId={parentWebSdkEmbedId}
                parentWebSdkPlacementId={parentWebSdkPlacementId}
                parentOctoPanelId={parentOctoPanelId}
                videoId={videoId}
            >
                <LifecycleProvider autoPromptConfig={autoPromptConfig}>
                    <SessionProvider brandId={brandId} currentSessionId={currentSessionId} isMaya={isMaya}>
                        <AgentProvider isMaya={isMaya}>
                            <ChatProvider
                                brandId={brandId}
                                userId={userId}
                                pendingMessages={pendingMessages}
                                view={view}
                                videoId={videoId}
                                integrationType={integrationType}
                                integrationId={integrationId}
                                contentOrder={contentOrder}
                            >
                                <VideoStylesProvider brandId={view !== 'web-sdk' ? brandId : undefined}>
                                    <UIProvider
                                        view={view}
                                        webSdkRenderMode={webSdkRenderMode}
                                        uiDensity={uiDensity}
                                        userEmail={userEmail}
                                        userUUID={userUUID}
                                        userId={userId}
                                        brandId={brandId}
                                        currentSessionIdProp={currentSessionId}
                                        isMaya={isMaya}
                                        parentWebSdkInstanceId={parentWebSdkInstanceId}
                                        parentWebSdkContainerId={parentWebSdkContainerId}
                                        parentWebSdkEmbedId={parentWebSdkEmbedId}
                                        parentWebSdkPlacementId={parentWebSdkPlacementId}
                                        parentOctoPanelId={parentOctoPanelId}
                                        videoId={videoId}
                                        integrationType={integrationType}
                                    >
                                        <InputProvider>{children}</InputProvider>
                                    </UIProvider>
                                </VideoStylesProvider>
                            </ChatProvider>
                        </AgentProvider>
                    </SessionProvider>
                </LifecycleProvider>
            </AnalyticsProvider>
        </RudderAnalyticsProvider>
    );
}
