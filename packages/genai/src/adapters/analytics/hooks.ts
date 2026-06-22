/**
 * Analytics Hooks
 * Custom hooks for accessing analytics in components
 */

import { useContext } from 'react';

import { AnalyticsContext } from './context';
import type { AnalyticsContextValue } from './context';

/**
 * Hook to access analytics context
 * @throws Error if used outside AnalyticsProvider
 */
export function useOctoAnalytics(): AnalyticsContextValue {
    const context = useContext(AnalyticsContext);

    if (!context) {
        throw new Error('useOctoAnalytics must be used within AnalyticsProvider');
    }

    return context;
}
