import React, { useMemo, type ReactNode } from 'react';

import { OctoAnalytics } from '@/analytics';
import { RudderAnalyticsProvider } from '@/services/analytics/RudderAnalyticsProvider';
import type { PendingMessage } from '@/types';

import { AnalyticsProvider } from './analytics/provider';
import { AgentsProvider } from './app/provider';
import { InputProvider } from './input/provider';

interface AppProvidersProps {
    children: ReactNode;
    userId: string;
    brandId: number;
    currentSessionId?: string;
    view: 'page' | 'floater' | 'dialog' | 'web-sdk';
    webSdkRenderMode?: 'compact' | 'full';
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
    // Integration fields for embed/placement context
    integrationType?: 'embed' | 'placement';
    integrationId?: string;
    contentOrder?: string[];
    allowAutoPrompt?: boolean;
}

export const AppProviders: React.FC<AppProvidersProps> = ({
    children,
    userId,
    brandId,
    currentSessionId,
    view,
    webSdkRenderMode,
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
    allowAutoPrompt,
}) => {
    // Create OctoAnalytics instance
    const octoAnalytics = useMemo(() => {
        const rudderstackWriteKey = import.meta.env.VITE_RUDDERSTACK_KEY ?? '';
        const rudderstackDataplaneUrl = import.meta.env.VITE_RUDDERSTACK_URL ?? '';
        const environment = import.meta.env.MODE === 'production' ? 'production' : 'development';

        return new OctoAnalytics({
            userId,
            brandId,
            rudderstackWriteKey,
            rudderstackDataplaneUrl,
            environment,
            parentWebSdkInstanceId,
            parentWebSdkContainerId,
            parentWebSdkEmbedId,
            parentWebSdkPlacementId,
            parentOctoPanelId,
            videoId,
            debug: import.meta.env.MODE !== 'production', // Enable debug in dev/qa
        });
    }, [
        userId,
        brandId,
        parentWebSdkInstanceId,
        parentWebSdkContainerId,
        parentWebSdkEmbedId,
        parentWebSdkPlacementId,
        parentOctoPanelId,
        videoId,
    ]);

    return (
        <RudderAnalyticsProvider>
            <AnalyticsProvider analytics={octoAnalytics}>
                <AgentsProvider
                    userId={userId}
                    brandId={brandId}
                    currentSessionId={currentSessionId}
                    view={view}
                    webSdkRenderMode={webSdkRenderMode}
                    pendingMessages={pendingMessages}
                    userEmail={userEmail}
                    userUUID={userUUID}
                    isMaya={isMaya}
                    parentWebSdkInstanceId={parentWebSdkInstanceId}
                    parentWebSdkContainerId={parentWebSdkContainerId}
                    parentWebSdkEmbedId={parentWebSdkEmbedId}
                    parentWebSdkPlacementId={parentWebSdkPlacementId}
                    parentOctoPanelId={parentOctoPanelId}
                    webSdkVideoId={videoId}
                    integrationType={integrationType}
                    integrationId={integrationId}
                    contentOrder={contentOrder}
                    allowAutoPrompt={allowAutoPrompt}
                >
                    <InputProvider>{children}</InputProvider>
                </AgentsProvider>
            </AnalyticsProvider>
        </RudderAnalyticsProvider>
    );
};
