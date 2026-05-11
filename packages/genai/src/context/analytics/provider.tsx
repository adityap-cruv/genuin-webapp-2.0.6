/**
 * Analytics Provider
 * Wraps GenAI SDK app to provide analytics instance
 */

import { useState, useEffect, useMemo } from 'react';
import type { ReactNode } from 'react';

import type { OctoAnalytics } from '@/analytics';

import { AnalyticsContext } from './context';
import type { AnalyticsContextValue } from './context';

/**
 * Analytics provider props
 */
export interface AnalyticsProviderProps {
    /**
     * Pre-configured OctoAnalytics instance
     */
    analytics: OctoAnalytics;

    /**
     * Children components
     */
    children: ReactNode;
}

/**
 * AnalyticsProvider provides analytics instance to child components
 */
export function AnalyticsProvider({ analytics, children }: AnalyticsProviderProps) {
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
