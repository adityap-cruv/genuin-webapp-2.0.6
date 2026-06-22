/**
 * Analytics Provider
 * Wraps GenAI SDK app to provide analytics instance
 */

import { useState, useEffect, useMemo } from 'react';
import type { ReactNode } from 'react';

import { OctoAnalytics } from '@/adapters/analytics/OctoAnalytics';

import { AnalyticsContext } from './context';
import type { AnalyticsContextValue } from './context';

/**
 * Analytics provider props
 */
export interface AnalyticsProviderProps {
    /** User ID */
    userId: string;
    /** Brand ID */
    brandId: number;
    /** Parent Web SDK instance ID */
    parentWebSdkInstanceId?: string;
    /** Parent Web SDK container ID */
    parentWebSdkContainerId?: string;
    /** Parent Web SDK embed ID */
    parentWebSdkEmbedId?: string;
    /** Parent Web SDK placement ID */
    parentWebSdkPlacementId?: string;
    /** Parent Octo Panel ID */
    parentOctoPanelId?: string;
    /** Current video ID */
    videoId?: string;
    /** Children components */
    children: ReactNode;
}

/**
 * AnalyticsProvider creates and provides an OctoAnalytics instance to child components.
 * The instance is memoized and recreated only when identity-relevant config props change.
 */
export function AnalyticsProvider({
    userId,
    brandId,
    parentWebSdkInstanceId,
    parentWebSdkContainerId,
    parentWebSdkEmbedId,
    parentWebSdkPlacementId,
    parentOctoPanelId,
    videoId,
    children,
}: AnalyticsProviderProps) {
    const analytics = useMemo(() => {
        const rudderstackWriteKey = import.meta.env.VITE_GENAI_RUDDERSTACK_KEY ?? '';
        const rudderstackDataplaneUrl = import.meta.env.VITE_GENAI_RUDDERSTACK_URL ?? '';
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
            debug: import.meta.env.MODE !== 'production',
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

    const [isReady, setIsReady] = useState(analytics.isReady());

    useEffect(() => {
        // Initialize analytics if not already initialized
        if (!analytics.isReady()) {
            analytics
                .initialize()
                .then(() => {
                    setIsReady(true);
                })
                .catch(error => {
                    // Surface initialization failures without swallowing them
                    console.error('[AnalyticsProvider] Initialization failed:', error);
                });
        }

        // Cleanup on unmount
        return () => {
            // Don't destroy analytics on unmount - it should persist across component rerenders
            // Only destroy when the SDK itself is destroyed
        };
    }, [analytics]);

    // Memoize context value
    const value: AnalyticsContextValue = useMemo(
        () => ({
            analytics,
            isReady,
        }),
        [analytics, isReady]
    );

    return <AnalyticsContext.Provider value={value}>{children}</AnalyticsContext.Provider>;
}
