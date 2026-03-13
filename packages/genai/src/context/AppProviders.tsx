import React, { type ReactNode } from 'react';
import { AgentsProvider } from './app/provider';
import { InputProvider } from './input/provider';
import { RudderAnalyticsProvider } from '@/services/analytics/RudderAnalyticsProvider';
import type { PendingMessage } from '@/types';

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
}) => {
    return (
        <RudderAnalyticsProvider>
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
            >
                <InputProvider>{children}</InputProvider>
            </AgentsProvider>
        </RudderAnalyticsProvider>
    );
};
